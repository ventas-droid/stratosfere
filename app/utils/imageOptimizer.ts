export function optimizeStratosImage(url: string | null | undefined): string {
  // Si no hay foto, o no es un texto, devolvemos un placeholder o vacío
  if (!url || typeof url !== 'string') return url || "";

  // Si la foto NO es de Cloudinary (ej. una foto externa vieja), no la tocamos
  if (!url.includes('res.cloudinary.com')) return url;

  // Si por casualidad ya le habíamos inyectado la IA antes, la dejamos pasar
  if (url.includes('e_improve') || url.includes('q_auto')) return url;

  // 🎯 El Francotirador: Partimos la URL justo después de 'upload/'
  const parts = url.split('upload/');
  if (parts.length !== 2) return url;

  // 💎 LA MUNICIÓN DE ALTA GAMA (IA de Cloudinary)
  const iaTransformations = 'c_fill,g_auto,f_auto,q_auto:best,e_improve:outdoor,e_sharpen:100/';

  // Ensamblamos el misil y lo disparamos
  return `${parts[0]}upload/${iaTransformations}${parts[1]}`;
}