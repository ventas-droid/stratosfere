import { useState } from "react";

export const useStratosAI = (
  searchCity: any,
  addNotification: (msg: string) => void,
  playSynthSound: (sound: string) => void,
  soundEnabled: boolean,
  agencyFavs: any[],
  agencyLikes: any[],
  localFavs: any[]
) => {
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  const handleAICommand = (e: any) => {
    if (e) e.preventDefault();
    const rawInput = String(aiInput || "").trim();
    if (!rawInput) return;

    if (soundEnabled) playSynthSound("click");

    // --- 1) Detectar REF (o pegado con "Ref:" o incluso dentro de una URL) ---
    const extractRefCode = (input: string) => {
      let s = String(input || "").toUpperCase().trim();
      s = s.replace(/^REF[^A-Z0-9]*?/i, "").trim();
      const m = s.match(/SF[^A-Z0-9]*([A-Z0-9]{4,80})/);
      if (!m?.[1]) return null;

      let code = m[1].trim();
      const cmkIndex = code.indexOf("CMK");
      if (cmkIndex > 0) code = code.slice(cmkIndex);
      return `SF-${code}`;
    };

    const refCode = extractRefCode(rawInput);

    // --- 2) Si es una REF, buscamos en LISTAS YA CARGADAS ---
    if (refCode) {
      const pool = [
        ...(Array.isArray(agencyFavs) ? agencyFavs : []),
        ...(Array.isArray(agencyLikes) ? agencyLikes : []),
        ...(Array.isArray(localFavs) ? localFavs : []),
      ].filter(Boolean);

      const found = pool.find(
        (p: any) => String(p?.refCode || "").toUpperCase() === refCode
      );

      if (found) {
        // A) Abrir DETAILS
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("open-details-signal", { detail: found }));
        }

        // B) Vuelo cinematográfico al punto
        const coords =
          found?.coordinates ||
          (Number.isFinite(Number(found?.longitude)) && Number.isFinite(Number(found?.latitude))
            ? [Number(found.longitude), Number(found.latitude)]
            : null);

        if (coords) {
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("map-fly-to", {
                  detail: { center: coords, zoom: 19, pitch: 60, bearing: -20, duration: 2500 },
                })
              );
            }
        } else {
          addNotification("Propiedad localizada, pero sin coordenadas GPS registradas.");
        }

        // 🔥 NUEVA RESPUESTA PREMIUM: Éxito
        setAiResponse(`Propiedad ${refCode} localizada. Desplegando ficha técnica...`);
        setAiInput("");
        return; 
      }

      // 🔥 NUEVA RESPUESTA PREMIUM: Fallo
      setAiResponse(`La referencia ${refCode} no consta en su stock actual.`);
      setAiInput("");
      return;
    }

    // --- 3) Si NO es REF, búsqueda de ciudad / comando general ---
    setIsAiTyping(true);
    
    // 🔥 NUEVA RESPUESTA PREMIUM: Análisis en progreso
    setAiResponse(`Analizando ubicación: "${rawInput}"...`);

    if (searchCity) {
      searchCity(rawInput);
    } else {
      console.warn("⚠️ searchCity no conectado.");
    }

    setTimeout(() => {
      // 🔥 NUEVA RESPUESTA PREMIUM: Resultado final
      setAiResponse(`Mostrando resultados para: "${rawInput}".`);
      setIsAiTyping(false);
      setAiInput("");
    }, 1500);
  };

  return {
    aiInput,
    setAiInput,
    aiResponse,
    isAiTyping,
    handleAICommand
  };
};