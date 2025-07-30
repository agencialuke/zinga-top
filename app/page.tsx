'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Vitrine {
  id: string
  nome: string
  descricao: string
  urlImagem: string
  whatsapp: string
  slug: string
}

export default function HomePage() {
  const [vitrines, setVitrines] = useState<Vitrine[]>([])

  useEffect(() => {
    const q = query(collection(db, 'vitrines'))

    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs
        .map(doc => {
          const d = doc.data()
          if (!d.slug) return null
          return {
            id: doc.id,
            nome: d.nome || '',
            descricao: d.descricao || '',
            urlImagem: d.urlImagem || '',
            whatsapp: d.whatsapp || '',
            slug: d.slug,
          }
        })
        .filter(Boolean) as Vitrine[]

      setVitrines(data)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-center text-purple-700">Vitrines da Ilha</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {vitrines.map(loja => (
          <Link
            key={loja.id}
            href={`/vitrine/${loja.slug}`}
            className="block bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border"
          >
            <div className="w-full h-48 relative">
              <Image
                src={
                  loja.urlImagem?.trim().startsWith('http')
                    ? loja.urlImagem.trim()
                    : '/placeholder.png'
                }
                alt={loja.nome}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>

            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800">{loja.nome}</h2>
              <p className="text-sm text-gray-600">
                {loja.descricao.length > 100
                  ? loja.descricao.slice(0, 100) + '...'
                  : loja.descricao}
              </p>

              <div className="mt-3 flex justify-between items-center text-sm">
                <span className="text-green-600 font-bold">WhatsApp</span>
                <span className="text-purple-700 font-semibold">Ver mais</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
