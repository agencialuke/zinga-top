'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function PainelLitePage() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Bem-vindo ao Painel Gratuito</h1>
        <p className="mb-4 text-gray-600">
          Você está usando o plano gratuito. Nesse modo, você pode publicar uma vitrine simples para o seu negócio.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Deseja mais recursos? Faça upgrade para o plano PRO.
        </p>
        <a
          href="/upgrade"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
        >
          Fazer upgrade para o PRO
        </a>
      </div>
    </div>
  )
}
