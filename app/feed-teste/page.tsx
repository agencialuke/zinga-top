'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Image from 'next/image'

export default function FeedTeste() {
  const [vitrine, setVitrine] = useState<any | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const fetchVitrine = async () => {
      try {
        const docRef = doc(db, 'vitrines', '0ADHWKrftx6avew4HXOe')
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setVitrine(docSnap.data())
        } else {
          setErro('Documento não encontrado')
        }
      } catch (err: any) {
        console.error('Erro ao buscar vitrine:', err)
        setErro('Erro ao buscar vitrine')
      }
    }

    fetchVitrine()
  }, [])

  if (erro) return <div>Erro: {erro}</div>
  if (!vitrine) return <div>Carregando vitrine de teste...</div>

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg">
      <h2 className="text-2xl font-bold mb-2">{vitrine.nome}</h2>
      <p className="mb-4">{vitrine.descricao}</p>
      <Image
        src={vitrine.urlImagem?.trim() || '/placeholder.png'}
        alt={vitrine.nome}
        width={500}
        height={300}
        className="w-full h-48 object-cover"
      />
      <a
        href={`https://wa.me/${vitrine.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-4 text-green-600 font-semibold"
      >
        Falar no WhatsApp
      </a>
    </div>
  )
}
