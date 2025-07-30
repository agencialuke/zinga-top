'use server'

import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

function gerarSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-') // Espaços viram hífen
    .replace(/[^a-z0-9-]/g, '') // Remove símbolos
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-+|-+$/g, '') // Remove hífen do início/fim
}

export async function atualizarSlugsVitrines() {
  const snapshot = await getDocs(collection(db, 'vitrines'))

  const updates = snapshot.docs.map(async (docSnap) => {
    const data = docSnap.data()
    const nome = data.nome
    const id = docSnap.id

    // Se não tem slug ou está vazio, cria e atualiza
    if (!data.slug || typeof data.slug !== 'string' || data.slug.trim() === '') {
      const slug = gerarSlug(nome)
      await updateDoc(doc(db, 'vitrines', id), { slug })
      console.log(`✔️ Slug criado: ${slug} (${nome})`)
    }
  })

  await Promise.all(updates)
  console.log('✅ Todos os slugs foram atualizados!')
}
