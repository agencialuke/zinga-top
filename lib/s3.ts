const BUCKET_NAME = "vitrines-zinga-top";
const REGION = "us-east-2";

/**
 * Envia um arquivo para o Amazon S3 via URL pré-assinada.
 */
export async function uploadFileToS3(file: File, fileName: string) {
  try {
    const safeFileType = file.type || "application/octet-stream";

    // Solicita a URL de upload
    const response = await fetch("/api/upload-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        fileType: safeFileType,
      }),
    });

    if (!response.ok) {
      throw new Error("Falha ao obter URL assinada do servidor.");
    }

    const { url: uploadUrl } = await response.json();

    // Upload direto para o S3
    const uploadResult = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": safeFileType,
      },
      body: file,
    });

    if (!uploadResult.ok) {
      throw new Error(`Erro no upload para o S3. Status: ${uploadResult.status}`);
    }

    return true;
  } catch (error) {
    console.error("Erro ao fazer upload para o S3:", error);
    throw error;
  }
}

/**
 * Gera a URL pública do arquivo salvo no S3.
 */
export function getDownloadUrlFromS3(fileName: string): string {
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fileName}`;
}
