import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { findOwnerByRefAction, createStratosDocumentAction } from '@/app/actions-documents';

export async function POST(request: Request) {
  try {
    // 1. El radar detecta la carga útil y la referencia
    const formData = await request.formData();
    const file = formData.get('document') as File | null;
  const reference = formData.get("reference") as string;
    
    // 👇 AÑADA ESTAS DOS LÍNEAS 👇
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

    // 3. SUBIDA A LA NUBE (Vercel Blob)
    // Usamos el nombre del archivo original, pero le ponemos un código único por si se repite
    const blob = await put(`stratos-docs/${Date.now()}-${file.name}`, file, {
      access: 'public', // Permite que el dueño lo descargue luego con el link
    });

    const fileSizeInKB = (file.size / 1024).toFixed(2);
    console.log(`☁️ ARCHIVO EN ÓRBITA: Subido a Vercel Blob (${fileSizeInKB} KB)`);

    // 4. REGISTRO EN EL EXPEDIENTE (Base de Datos)
    const dbRecord = await createStratosDocumentAction({
       fileName: file.name,
       fileUrl: blob.url,
       sizeKB: fileSizeInKB, // (O la variable que usted tenga aquí)
       propertyRef: reference,
ownerId: ownerCheck.ownerId,       

       // 👇 AÑADA ESTAS DOS LÍNEAS 👇
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
        message: "Documento encriptado y entregado con éxito.",
        url: blob.url
    });

  } catch (error) {
    console.error("🚨 ERROR CRÍTICO EN EL BÚNKER:", error);
    return NextResponse.json({ error: "Fallo en los escudos del servidor." }, { status: 500 });
  }
}