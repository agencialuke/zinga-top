import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

const BASE_URL = 'https://zinga-top-bv98.vercel.app'

export async function GET() {
  const snapshot = await adminDb.collection('vitrines').get()

  const urls = snapshot.docs.map(doc => {
    const data = doc.data()
    return `<url>
      <loc>${BASE_URL}/vitrine/${data.slug}</loc>
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
}
