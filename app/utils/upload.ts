import imageCompression from 'browser-image-compression';
import { getUploadUrl } from './r2-server'; 

// 🚁 NUEVO DRON DE CARGA (Camuflado como Cloudinary, pero ataca a Cloudflare R2)
export const uploadToCloudinary = async (file: File) => {
  if (!file) return null;

  let fileToUpload = file;

  // 🛡️ CORTAFUEGOS DE PESO: Solo comprimimos si es una imagen
  if (file.type.startsWith('image/')) {
      try {
          const options = {
              maxSizeMB: 2,           
              maxWidthOrHeight: 1920, 
              useWebWorker: true,     
          };
          
          console.log(`⚖️ Peso original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
          fileToUpload = await imageCompression(file, options);
          console.log(`✨ Peso comprimido: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`);
          
      } catch (error) {
          console.error("⚠️ Fallo en el compactador, enviando original...", error);
      }
  }

  try {
    // 1️⃣ Pedimos la pista de aterrizaje temporal a nuestro búnker (R2)
    const { success, uploadUrl, publicUrl } = await getUploadUrl(fileToUpload.name, fileToUpload.type);
    
    if (!success || !uploadUrl) {
        throw new Error("Cloudflare denegó el pase de aterrizaje");
    }

    // 2️⃣ Disparamos el archivo directamente a la URL segura de R2
    const response = await fetch(uploadUrl, {
        method: "PUT",
        body: fileToUpload,
        headers: { "Content-Type": fileToUpload.type },
    });

    if (!response.ok) throw new Error(`R2 rechazó la carga: ${response.statusText}`);

    console.log("✅ ACTIVO EN NUBE R2:", publicUrl);
    
    return publicUrl; 

  } catch (error) {
    console.error("❌ EL DRON HA SIDO DERRIBADO:", error);
    return null;
  }
};