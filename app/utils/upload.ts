// 🚁 DRON DE CARGA: Sube imágenes a Cloudinary
export const uploadToCloudinary = async (file: File) => {
  if (!file) return null;

  // 👇 DATOS CONFIRMADOS DE SU CAPTURA
  const CLOUD_NAME = "dn11trogr"; 
  const UPLOAD_PRESET = "stratos_upload"; 

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Fallo en la subida");

    const data = await response.json();
    console.log("✅ FOTO EN NUBE:", data.secure_url);
    return data.secure_url; // Devuelve la URL real de internet

  } catch (error) {
    console.error("❌ EL DRON HA SIDO DERRIBADO:", error);
    return null;
  }
};