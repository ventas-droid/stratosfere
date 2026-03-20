import imageCompression from 'browser-image-compression';
import { getUploadUrl } from './r2-server';


// 🚁 DRON DE CARGA: MUNICIÓN UNIVERSAL COMPRIMIDA
export const uploadToCloudinary = async (file: File) => {
  if (!file) return null;

  // 👇 DATOS CONFIRMADOS
  const CLOUD_NAME = "dn11trogr"; 
  const UPLOAD_PRESET = "stratos_upload"; 
  
  let fileToUpload = file;

  // 🛡️ CORTAFUEGOS DE PESO: Solo comprimimos si es una imagen (dejamos los PDFs y Videos en paz)
  if (file.type.startsWith('image/')) {
      try {
          const options = {
              maxSizeMB: 2,           // Peso máximo objetivo: 2MB (Ideal para inmobiliarias)
              maxWidthOrHeight: 1920, // Resolución máxima HD (Suficiente para pantallas grandes)
              useWebWorker: true,     // Usa el procesador del usuario para que no se congele la pantalla
          };
          
          console.log(`⚖️ Peso original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
          fileToUpload = await imageCompression(file, options);
          console.log(`✨ Peso comprimido: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`);
          
      } catch (error) {
          console.error("⚠️ Fallo en el compactador, enviando original...", error);
      }
  }

  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    // 🚨 MODO AUTO: Preparado para fotos y vídeos
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, 
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
        const errorText = await response.text(); 
        console.error("🚨 TEXTO DE RECHAZO CLOUDINARY:", errorText);
        throw new Error(`Cloudinary bloqueó el dron. Código: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("✅ ACTIVO EN NUBE:", data.secure_url);
    
    return data.secure_url; 

  } catch (error) {
    console.error("❌ EL DRON HA SIDO DERRIBADO:", error);
    return null;
  }
};