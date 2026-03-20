import { NextResponse } from 'next/server';
import { findOwnerByRefAction, createStratosDocumentAction } from '@/app/actions-documents';

// ✅ IMPORTAMOS NUESTRA RADIO MILITAR (S3 Client para Cloudflare R2)
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// 📡 CONFIGURAMOS LA CONEXIÓN AL BÚNKER R2
const S3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(request: Request) {
  try {
    // 1. El radar detecta la carga útil y la referencia
    const formData = await request.formData();
    const file = formData.get('document') as File | null;
    const reference = formData.get("reference") as string;
    const senderName = formData.get("senderName") as string || "Usuario Desconocido";
    const senderEmail = formData.get("senderEmail") as string || "";

    if (!file || !reference) {
      return NextResponse.json({ error: "Faltan coordenadas: Archivo o Referencia ausente." }, { status: 400 });
    }

    // 2. VERIFICACIÓN TÁCTICA: ¿Existe esta referencia en la base de datos?
    const ownerCheck = await findOwnerByRefAction(reference);
    
    if (!ownerCheck.success || !ownerCheck.ownerId) {
      console.log(`❌ TRANSMISIÓN ABORTADA: La referencia ${reference} no existe o no tiene dueño.`);
      return NextResponse.json({ error: "Referencia inválida o sin propietario." }, { status: 404 });
    }

    console.log(`✅ OBJETIVO FIJADO: Referencia ${reference} pertenece al Usuario ${ownerCheck.ownerId}`);

    // 3. 🚀 SUBIDA AL BÚNKER CLOUDFLARE R2 (Gratis y Blindado)
    // Convertimos el archivo a un formato que el búnker entienda
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Limpiamos el nombre para evitar errores en la URL
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const uniqueName = `stratos-docs/${Date.now()}-${cleanFileName}`;

    // Preparamos el misil
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME as string,
      Key: uniqueName,
      Body: buffer,
      ContentType: file.type,
    });

    // ¡FUEGO!
    await S3.send(command);

    // Calculamos la URL pública
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueName}`;
    const fileSizeInKB = (file.size / 1024).toFixed(2);
    
    console.log(`☁️ ARCHIVO EN ÓRBITA R2: (${fileSizeInKB} KB) -> ${publicUrl}`);

    // 4. REGISTRO EN EL EXPEDIENTE (Base de Datos)
    const dbRecord = await createStratosDocumentAction({
       fileName: file.name,
       fileUrl: publicUrl, // Usamos nuestra URL de R2
       sizeKB: fileSizeInKB, 
       propertyRef: reference,
       ownerId: ownerCheck.ownerId,       
       senderName: senderName,
       senderEmail: senderEmail
    });

    if (!dbRecord.success) {
      return NextResponse.json({ error: "Fallo al archivar en el expediente." }, { status: 500 });
    }

    console.log(`🎯 IMPACTO CONFIRMADO: Documento asignado y listo para el cliente.`);

    // 5. Confirmación final a la interfaz
    return NextResponse.json({ 
        success: true, 
        message: "Documento encriptado y entregado con éxito en R2.",
        url: publicUrl
    });

  } catch (error) {
    console.error("🚨 ERROR CRÍTICO EN EL BÚNKER:", error);
    return NextResponse.json({ error: "Fallo en los escudos del servidor." }, { status: 500 });
  }
}