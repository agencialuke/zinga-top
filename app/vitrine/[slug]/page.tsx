// app/vitrine/[slug]/page.tsx

import type { Metadata } from 'next'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Image from 'next/image'
import Link from 'next/link'

// 🔁 Permite SSR dinâmico, útil para vitrines novas
export const dynamic = 'force-dynamic'

interface Vitrine {
  nome: string
  descricao: string
  urlImagem: string
  whatsapp: string
  slug: string
}

// 🔁 (Opcional) Geração de rotas estáticas durante o build — útil se quiser SSG
export async function generateStaticParams() {
  try {
    const snapshot = await getDocs(collection(db, 'vitrines'))
    return snapshot.docs
      .map(doc => {
        const data = doc.data()
        if (data.slug) {
          return { slug: String(data.slug) }
        }
        return null
      })
      .filter(Boolean)
  } catch (err) {
    console.error('Erro em generateStaticParams:', err)
    return []
  }
}

// 🧠 SEO dinâmico baseado no slug
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  return {
    title: `Vitrine - ${params.slug} | Zinga.top`,
    description: `Confira a vitrine '${params.slug}' na plataforma Zinga.top.`,
  }
}

// 🔍 Busca vitrine pelo slug
async function getVitrineBySlug(slug: string): Promise<Vitrine | null> {
  const q = query(collection(db, 'vitrines'), where('slug', '==', slug))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  return snapshot.docs[0].data() as Vitrine
}

// 🖼️ Página principal
export default async function VitrinePage({ params }: { params: { slug: string } }) {
  const loja = await getVitrineBySlug(params.slug)

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
