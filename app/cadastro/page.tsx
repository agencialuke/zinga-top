'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export default function CadastroPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [plano, setPlano] = useState('gratuito')
  const [erro, setErro] = useState('')
  const router = useRouter()

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha)

      await setDoc(doc(db, 'usuarios', cred.user.uid), {
        email,
        plano,
        criadoEm: new Date()
      })

      if (plano === 'pro') {
        router.push('/painel')
      } else {
        router.push('/painel-lite')
      }
    } catch (err: any) {
      setErro(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleCadastro} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Cadastro</h1>
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

        <label className="block mb-2 text-sm font-medium text-gray-700">Escolha seu plano:</label>
        <select
          value={plano}
          onChange={(e) => setPlano(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded"
        >
          <option value="gratuito">Gratuito</option>
          <option value="pro">Pró (ilimitado)</option>
        </select>

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Cadastrar
        </button>

        <p className="mt-4 text-center text-sm">
          Já tem uma conta? <a href="/login" className="text-blue-600 underline">Entrar</a>
        </p>
      </form>
    </div>
  )
}
