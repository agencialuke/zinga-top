'use client'
import { atualizarSlugsVitrines } from '@/scripts/atualizarSlugs'

export default function AtualizarSlugsPage() {
  const handleClick = async () => {
    await atualizarSlugsVitrines()
    alert('Slugs atualizados com sucesso!')
  }

  return (
    <div className="p-8 text-center">
      <button
        onClick={handleClick}
        className="bg-blue-600 text-white font-bold px-6 py-3 rounded hover:bg-blue-700"
      >
        Atualizar Slugs das Vitrines
      </button>
    </div>
  )
}
