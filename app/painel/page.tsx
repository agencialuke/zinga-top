'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
  addDoc,
} from 'firebase/firestore'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import VitrineForm from './VitrineForm'

interface Vitrine {
  id: string
  nome: string
  descricao: string
  urlImagem: string
  whatsapp: string
  usuarioId: string
  slug?: string
}

export default function PainelPage() {
  const router = useRouter()
  const [vitrines, setVitrines] = useState<Vitrine[]>([])
  const [usuario, setUsuario] = useState<User | null>(null)
  const [editando, setEditando] = useState<Vitrine | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) {
        router.push('/login')
        return
      }

      setUsuario(user)

      const q = query(collection(db, 'vitrines'), where('usuarioId', '==', user.uid))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Vitrine[]

      setVitrines(data)
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  const handleAtualizarLista = async () => {
    if (!usuario) return
    const q = query(collection(db, 'vitrines'), where('usuarioId', '==', usuario.uid))
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Vitrine[]

    setVitrines(data)
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-700">Painel do Lojista</h1>
        {usuario && (
          <div className="text-sm text-gray-700">
            Usuário logado: <strong>Gratuito</strong>
            <button onClick={handleLogout} className="ml-4 text-red-600 underline">
              Sair
            </button>
          </div>
        )}
      </div>

      <VitrineForm
        usuarioId={usuario?.uid || ''}
        onCriado={handleAtualizarLista}
        vitrineEditando={editando}
        limparEdicao={() => setEditando(null)}
      />

      <div className="mt-10 grid sm:grid-cols-2 gap-6">
        {vitrines.map(vitrine => (
          <div key={vitrine.id} className="border rounded-xl shadow p-3">
            <img
              src={vitrine.urlImagem}
              alt={vitrine.nome}
              className="w-full h-48 object-cover rounded"
            />
            <h2 className="text-lg font-bold mt-2">{vitrine.nome}</h2>
            <p className="text-sm text-gray-600">{vitrine.descricao}</p>

            <div className="flex justify-between mt-3">
              <button
                onClick={() => setEditando(vitrine)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Editar
              </button>
              <button
                onClick={async () => {
                  await deleteDoc(doc(db, 'vitrines', vitrine.id))
                  handleAtualizarLista()
                }}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
