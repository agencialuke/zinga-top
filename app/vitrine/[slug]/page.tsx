// app/vitrine/[slug]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Vitrine {
  nome: string
  descricao: string
  urlImagem: string
  whatsapp: string
  slug: string
}

export default function VitrinePage() {
  const { slug } = useParams()
  const [loja, setLoja] = useState<Vitrine | null>(null)

  useEffect(() => {
    const fetch = async () => {
      const q = query(collection(db, 'vitrines'), where('slug', '==', slug))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        setLoja(snapshot.docs[0].data() as Vitrine)
      }
    }
    fetch()
  }, [slug])

  if (!loja) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Loja não encontrada ou link inválido.
      </div>
    )
  }

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
