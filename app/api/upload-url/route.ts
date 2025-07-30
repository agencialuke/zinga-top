import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function POST(req: Request) {
  try {
    const { filename, filetype } = await req.json()

    const client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: filename,
      ContentType: filetype,
    })

    const url = await getSignedUrl(client, command, { expiresIn: 60 })
    return Response.json({ url })
  } catch (error) {
    console.error('Erro ao gerar URL assinada:', error)
    return new Response('Erro interno', { status: 500 })
  }
}
