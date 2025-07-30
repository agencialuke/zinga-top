export async function uploadFileToS3(file: File): Promise<string> {
  const filename = `${Date.now()}-${file.name}`
  const filetype = file.type

  const res = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, filetype }),
  })

  if (!res.ok) {
    throw new Error('Falha ao obter URL assinada do servidor.')
  }

  const { url } = await res.json()

  await fetch(url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': filetype },
  })

  return url.split('?')[0] // retorna a URL limpa sem token
}
