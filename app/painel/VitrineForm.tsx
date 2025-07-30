'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { uploadFileToS3 } from '@/lib/s3'
import slugify from 'slugify'

interface Props {
  onNovaVitrine?: () => void
}

export default function VitrineForm({ onNovaVitrine }: Props) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [imagem, setImagem] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [user] = useAuthState(auth)
  const router = useRouter()

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImagem(file || null)
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (!nome || !descricao || !whatsapp || !imagem || !user) {
      setErro('Preencha todos os campos e selecione uma imagem.')
      return
    }

    setCarregando(true)

    try {
      const urlImagem = await uploadFileToS3(imagem)
      const slug = slugify(nome, { lower: true, strict: true })

      await addDoc(collection(db, 'vitrines'), {
        nome,
        descricao,
        whatsapp,
        urlImagem,
        slug,
        usuarioId: user.uid,
      })

      // Limpar campos
      setNome('')
      setDescricao('')
      setWhatsapp('')
      setImagem(null)
      setPreview(null)

      // Chamar callback ou redirecionar
      if (onNovaVitrine) {
        onNovaVitrine()
      } else {
        router.push('/')
      }
    } catch (err) {
      console.error('Erro ao criar vitrine:', err)
      setErro('Erro ao enviar imagem. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 mb-10">
      <h2 className="text-xl font-bold text-center">Nova Vitrine</h2>

      {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}

      <input
        type="text"
        placeholder="Nome da loja"
        className="w-full border p-2 rounded"
        value={nome}
        onChange={e => setNome(e.target.value)}
      />
      <textarea
        placeholder="Descrição"
        className="w-full border p-2 rounded"
        value={descricao}
        onChange={e => setDescricao(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        className="w-full border p-2 rounded"
        onChange={handleImagemChange}
      />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-48 object-cover rounded"
        />
      )}
      <input
        type="text"
        placeholder="WhatsApp (com DDD)"
        className="w-full border p-2 rounded"
        value={whatsapp}
        onChange={e => setWhatsapp(e.target.value)}
      />

      <button
        type="submit"
        disabled={carregando}
        className="bg-purple-600 text-white w-full p-3 rounded hover:bg-purple-700"
      >
        {carregando ? 'Enviando...' : 'Criar Vitrine'}
      </button>
    </form>
  )
}
