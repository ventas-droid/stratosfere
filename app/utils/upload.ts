// 🚁 DRON DE CARGA: MUNICIÓN UNIVERSAL (FOTO, VIDEO, PDF, 360)
export const uploadToCloudinary = async (file: File) => {
  if (!file) return null;

  // 👇 DATOS CONFIRMADOS
  const CLOUD_NAME = "dn11trogr"; 
  const UPLOAD_PRESET = "stratos_upload"; 

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  
  // 💡 OJO TÁCTICO: Cloudinary a veces necesita saber qué carpeta usar. 
  // Si quiere orden, puede descomentar esto:
  // formData.append("folder", "stratos_assets"); 

  try {
    // 🚨 CAMBIO CRÍTICO: Usamos 'auto' en lugar de 'image'
    // Esto permite que el sistema detecte si entra un .jpg, .mp4 o .pdf
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, 
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Fallo en la subida");

    const data = await response.json();
    console.log("✅ ACTIVO EN NUBE:", data.secure_url);
    
    // Cloudinary devuelve 'resource_type'. Puede ser útil guardarlo si quiere distinguir video de foto luego.
    // Por ahora devolvemos la URL que es lo que le importa.
    return data.secure_url; 

  } catch (error) {
    console.error("❌ EL DRON HA SIDO DERRIBADO:", error);
    return null;
  }
};