'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const cred = await signInWithEmailAndPassword(auth, email, senha)

      // Busca o plano do usuário no Firestore
      const usuarioRef = doc(db, 'usuarios', cred.user.uid)
      const usuarioSnap = await getDoc(usuarioRef)

      if (usuarioSnap.exists()) {
        const dados = usuarioSnap.data()
        const plano = dados.plano || 'gratuito'

        if (plano === 'pro') {
          router.push('/painel')
        } else {
          router.push('/painel-lite')
        }
      } else {
        setErro('Dados do usuário não encontrados.')
      }

    } catch (err: any) {
      setErro('Falha ao entrar: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        {erro && <p className="text-red-500 mb-2">{erro}</p>}

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded"
        />

        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
          Entrar
        </button>

        <p className="mt-4 text-center text-sm">
          Ainda não tem conta? <a href="/cadastro" className="text-blue-600 underline">Cadastrar</a>
        </p>
      </form>
    </div>
  )
}
