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
} from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import VitrineForm from './VitrineForm'

interface Vitrine {
  id: string
  nome: string
  descricao: string
  imagem: string
  whatsapp: string
  usuarioId: string
}

export default function PainelPage() {
  const router = useRouter()
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [vitrines, setVitrines] = useState<Vitrine[]>([])
  const [editando, setEditando] = useState<Vitrine | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, usuario => {
      if (usuario) {
        setUsuarioId(usuario.uid)
      } else {
        router.push('/login')
      }
    })
    return () => unsubscribe()
  }, [router])

  const carregarVitrines = async () => {
    if (!usuarioId) return
    const q = query(collection(db, 'vitrines'), where('usuarioId', '==', usuarioId))
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Vitrine[]
    setVitrines(data)
  }

  useEffect(() => {
    if (usuarioId) {
      carregarVitrines()
    }
  }, [usuarioId])

  const handleExcluir = async (id: string) => {
    if (!confirm('Deseja excluir esta vitrine?')) return
    await deleteDoc(doc(db, 'vitrines', id))
    await carregarVitrines()
  }

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Painel do Lojista</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sair
        </button>
      </div>

      {usuarioId && (
        <VitrineForm
          usuarioId={usuarioId}
          onCriado={carregarVitrines}
          vitrineEditando={editando}
          limparEdicao={() => setEditando(null)}
        />
      )}

      <h2 className="text-lg font-semibold mb-2">Minhas Vitrines</h2>

      {vitrines.length === 0 ? (
        <p>Nenhuma vitrine cadastrada ainda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vitrines.map(vitrine => (
            <div key={vitrine.id} className="border rounded p-4 shadow-sm">
              <img
                src={vitrine.imagem}
                alt={vitrine.nome}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <h3 className="text-xl font-semibold">{vitrine.nome}</h3>
              <p className="text-gray-700 mb-2">{vitrine.descricao}</p>
              <p className="text-sm text-gray-500 mb-2">WhatsApp: {vitrine.whatsapp}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditando(vitrine)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleExcluir(vitrine.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
