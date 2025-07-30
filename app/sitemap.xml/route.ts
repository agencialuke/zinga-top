import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

const BASE_URL = 'https://zinga-top-10.vercel.app'

export async function GET() {
  try {
    const snapshot = await adminDb.collection('vitrines').get()

    const urls = snapshot.docs
      .filter(doc => doc.data().slug) // evita vitrines sem slug
      .map(doc => {
        const { slug } = doc.data()
        return `<url>
  <loc>${BASE_URL}/vitrine/${slug}</loc>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>`
      })

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: { 'Content-Type': 'application/xml' },
    })
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error)
    return new NextResponse('Erro ao gerar sitemap.', { status: 500 })
  }
}
