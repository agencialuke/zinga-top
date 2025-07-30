import type { Metadata } from 'next'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Vitrine {
  nome: string
  descricao: string
  slug: string
}

async function getVitrineBySlug(slug: string): Promise<Vitrine | null> {
  const q = query(collection(db, 'vitrines'), where('slug', '==', slug))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  return snapshot.docs[0].data() as Vitrine
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const vitrine = await getVitrineBySlug(params.slug)

  return {
    title: vitrine?.nome
      ? `Vitrine - ${vitrine.nome} | Zinga.top`
      : `Vitrine não encontrada | Zinga.top`,
    description: vitrine?.descricao || 'Confira esta vitrine em Zinga.top.',
  }
}
