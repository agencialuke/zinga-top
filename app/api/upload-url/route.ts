// app/api/upload-url/route.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const { fileName, fileType } = await req.json();

  const command = new PutObjectCommand({
    Bucket: "vitrines-zinga-top",
    Key: fileName,
    ContentType: fileType || "application/octet-stream",
    // ❌ NÃO usar ACL aqui — gerenciar permissão via bucket policy
  });

  const signedUrl = await getSignedUrl(s3, command, {
    expiresIn: 60, // segundos
  });

  return NextResponse.json({ url: signedUrl });
}
