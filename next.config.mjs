/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['vitrines-zinga-top.s3.us-east-2.amazonaws.com'],
  },
  output: 'standalone' // Opcional, adicione se estiver usando deploy com Docker/Vercel standalone
}

export default nextConfig
