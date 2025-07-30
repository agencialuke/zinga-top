'use client'

import { useEffect, useState } from 'react'
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'

interface Vitrine {
  id: string
  nome: string
  descricao: string
  imagem: string
  whatsapp: string
  usuarioId: string
}

interface Props {
  usuarioId: string
  onCriado?: () => Promise<void>
  vitrineEditando?: Vitrine | null
  limparEdicao?: () => void
}

export default function VitrineForm({
  usuarioId,
  onCriado,
  vitrineEditando,
  limparEdicao,
}: Props) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [imagem, setImagem] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (vitrineEditando) {
      setNome(vitrineEditando.nome)
      setDescricao(vitrineEditando.descricao)
      setWhatsapp(vitrineEditando.whatsapp)
      setPreview(vitrineEditando.imagem)
      setImagem(null)
    } else {
      setNome('')
      setDescricao('')
      setWhatsapp('')
      setPreview(null)
      setImagem(null)
    }
  }, [vitrineEditando])

  const handleUploadImagem = async () => {
    if (!imagem) return preview || ''
    const nomeArquivo = `${Date.now()}-${imagem.name}`
    const storageRef = ref(storage, `vitrines/${usuarioId}/${nomeArquivo}`)
    await uploadBytes(storageRef, imagem)
    return await getDownloadURL(storageRef)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)
    try {
      const urlImagem = await handleUploadImagem()
      const novaVitrine = {
        nome,
        descricao,
        whatsapp,
        imagem: urlImagem,
        usuarioId,
      }

      if (vitrineEditando) {
        await updateDoc(doc(db, 'vitrines', vitrineEditando.id), novaVitrine)
      } else {
        await addDoc(collection(db, 'vitrines'), novaVitrine)
      }

      if (onCriado) await onCriado()
      if (limparEdicao) limparEdicao()
    } catch (err) {
      console.error('Erro ao salvar vitrine:', err)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md mb-8"
    >
      <h2 className="text-xl font-semibold mb-4">
        {vitrineEditando ? 'Editar Vitrine' : 'Nova Vitrine'}
      </h2>

      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={e => setNome(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
        required
      />
      <textarea
        placeholder="Descrição"
        value={descricao}
        onChange={e => setDescricao(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
        required
      />
      <input
        type="text"
        placeholder="WhatsApp com DDD (somente números)"
        value={whatsapp}
        onChange={e => setWhatsapp(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={e => {
          const file = e.target.files?.[0] || null
          setImagem(file)
          setPreview(file ? URL.createObjectURL(file) : null)
        }}
        className="w-full mb-3 p-2 border rounded"
      />
      {preview && (
        <img
          src={preview}
          alt="Prévia"
          className="mb-3 w-full h-64 object-cover rounded"
        />
      )}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={carregando}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {carregando
            ? 'Salvando...'
            : vitrineEditando
            ? 'Atualizar Vitrine'
            : 'Criar Vitrine'}
        </button>
        {vitrineEditando && limparEdicao && (
          <button
            type="button"
            onClick={limparEdicao}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
