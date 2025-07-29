'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'
import Image from 'next/image'

interface Vitrine {
  nome: string
  descricao: string
  urlImagem: string
  whatsapp: string
}

export default function VitrinePage() {
  const { id } = useParams()
  const [loja, setLoja] = useState<Vitrine | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      const docRef = doc(db, 'vitrines', String(id))
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setLoja(docSnap.data() as Vitrine)
      } else {
        setLoja(null)
      }
      setLoading(false)
    }

    fetchData()
  }, [id])

  if (loading) return <div className="p-4 text-center">Carregando...</div>
  if (!loja) return <div className="p-4 text-center text-red-500">Loja não encontrada.</div>

  const numeroWhatsApp = loja.whatsapp?.replace(/\D/g, '')

  return (
    <div className="p-4 max-w-md mx-auto">
      <Image
        src={loja.urlImagem?.trim() || '/placeholder.jpg'}
        alt={loja.nome}
        width={400}
        height={240}
        className="w-full h-60 object-cover rounded-lg shadow"
      />
      <h1 className="text-2xl font-bold mt-4 text-gray-800">{loja.nome}</h1>
      <p className="text-gray-600 mb-6">{loja.descricao}</p>
      <a
        href={`https://wa.me/${numeroWhatsApp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-md transition"
      >
        Falar no WhatsApp
      </a>
      <Link href="/" className="block text-center mt-4 text-indigo-600 hover:underline">
        ← Voltar ao Feed
      </Link>
    </div>
  )
}
