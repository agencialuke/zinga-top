'use client'

import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import slugify from 'slugify'
import Image from 'next/image'
import { onAuthStateChanged } from 'firebase/auth'

interface Props {
  vitrineAtual?: VitrineData & { id: string }
  aoSalvar?: () => void
}

interface VitrineData {
  nome: string
  descricao: string
  whatsapp: string
  urlImagem: string
  slug: string
}

export default function VitrineForm({ vitrineAtual, aoSalvar }: Props) {
  const router = useRouter()

  const [form, setForm] = useState<Omit<VitrineData, 'slug'>>({
    nome: '',
    descricao: '',
    whatsapp: '',
    urlImagem: '',
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [imagemFile, setImagemFile] = useState<File | null>(null)
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioId(user.uid)
      } else {
        router.push('/login')
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (vitrineAtual) {
      setForm({
        nome: vitrineAtual.nome,
        descricao: vitrineAtual.descricao,
        whatsapp: vitrineAtual.whatsapp,
        urlImagem: vitrineAtual.urlImagem,
      })
      setPreview(vitrineAtual.urlImagem)
    } else {
      // Reset quando sai do modo edição
      setForm({
        nome: '',
        descricao: '',
        whatsapp: '',
        urlImagem: '',
      })
      setPreview(null)
      setImagemFile(null)
    }
  }, [vitrineAtual])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImagemChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImagemFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const uploadImagemParaS3 = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`
    const fileType = file.type

    const res = await fetch('/api/upload-url', {
      method: 'POST',
      body: JSON.stringify({ fileName, fileType }),
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await res.json()
    const { url } = data

    await fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': fileType },
    })

    return url.split('?')[0] // Remove query params
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!usuarioId) return

    let urlImagemFinal = form.urlImagem
    if (imagemFile) {
      urlImagemFinal = await uploadImagemParaS3(imagemFile)
    }

    const slug = slugify(form.nome, { lower: true, strict: true })

    const dados: VitrineData & { usuarioId: string } = {
      nome: form.nome,
      descricao: form.descricao,
      whatsapp: form.whatsapp,
      urlImagem: urlImagemFinal,
      slug,
      usuarioId,
    }

    if (vitrineAtual) {
      const ref = doc(db, 'vitrines', vitrineAtual.id)
      await updateDoc(ref, dados)
      setMensagem('Vitrine atualizada com sucesso!')
    } else {
      await addDoc(collection(db, 'vitrines'), dados)
      setMensagem('Vitrine criada com sucesso!')
    }

    if (aoSalvar) aoSalvar()
    router.refresh()

    // Reset formulário somente ao criar nova vitrine
    if (!vitrineAtual) {
      setForm({
        nome: '',
        descricao: '',
        whatsapp: '',
        urlImagem: '',
      })
      setImagemFile(null)
      setPreview(null)
    }

    // Limpar mensagem após 4s
    setTimeout(() => setMensagem(null), 4000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto p-4 bg-white rounded shadow">
      {mensagem && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded shadow text-sm">
          {mensagem}
        </div>
      )}

      <input
        type="text"
        name="nome"
        placeholder="Nome da Loja"
        value={form.nome}
        onChange={handleChange}
        className="w-full border rounded p-2"
        required
      />

      <textarea
        name="descricao"
        placeholder="Descrição"
        value={form.descricao}
        onChange={handleChange}
        className="w-full border rounded p-2"
        rows={3}
        required
      />

      <input
        type="text"
        name="whatsapp"
        placeholder="Número WhatsApp"
        value={form.whatsapp}
        onChange={handleChange}
        className="w-full border rounded p-2"
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleImagemChange}
        className="block w-full"
      />

      {preview && (
        <div className="mt-4">
          <Image src={preview} alt="Pré-visualização" width={300} height={200} className="rounded" />
        </div>
      )}

      <button
        type="submit"
        className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 transition"
      >
        {vitrineAtual ? 'Atualizar Vitrine' : 'Criar Vitrine'}
      </button>
    </form>
  )
}
