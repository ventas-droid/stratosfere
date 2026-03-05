export const handleRealDeployment = async (file: File, reference: string, currentUser?: any) => {
  try {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("reference", reference); // 🎯 AQUÍ ENVIAMOS LA REFERENCIA

    // 🎯 AÑADIMOS LA IDENTIDAD DEL REMITENTE AL PAQUETE
    if (currentUser) {
        formData.append("senderName", currentUser.name || currentUser.companyName || "Agente Stratosfere");
        formData.append("senderEmail", currentUser.email || "");
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      console.log("✅ TRANSMISIÓN CONFIRMADA: Documento enviado con éxito.");
      return true;
    } else {
      console.error("❌ INTERCEPTADO: El servidor rechazó la conexión (Error 400).");
      return false;
    }
  } catch (error) {
    console.error("🚨 FALLO DE RED EN LA TRANSMISIÓN:", error);
    return false;
  }
};