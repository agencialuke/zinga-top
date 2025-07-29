import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Zinga.top',
  description: 'A vitrine digital da Praia dos Ingleses',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="bg-gray-100 text-gray-800">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">Zinga.top</h1>
          <nav className="space-x-4">
            <Link href="/" className="text-sm text-gray-700 hover:text-indigo-600">Feed</Link>
            <Link href="/painel" className="text-sm text-gray-700 hover:text-indigo-600">Painel</Link>
          </nav>
        </header>
        <main className="p-4">{children}</main>
      </body>
    </html>
  )
}
