"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// 📡 Conectamos la radio con las llaves de su búnker
const S3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

export async function getUploadUrl(fileName: string, fileType: string) {
  try {
    const uniqueName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME as string,
      Key: uniqueName,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 60 });
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueName}`;

    return { success: true, uploadUrl, publicUrl };
  } catch (error) {
    console.error("❌ Error en el Operador de Radio R2:", error);
    return { success: false, uploadUrl: "", publicUrl: "" };
  }
}