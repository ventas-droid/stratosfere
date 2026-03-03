// Ubicación: ./app/components/alive-map/ui-panels/useStratosAI.ts
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
      // 1) Normalizamos a MAYÚSCULA y quitamos "Ref:" si viene
      let s = String(input || "").toUpperCase().trim();
      s = s.replace(/^REF[^A-Z0-9]*?/i, "").trim();

      // 2) Buscamos SF + separadores raros + código (acepta espacios/saltos/guiones/":", etc.)
      const m = s.match(/SF[^A-Z0-9]*([A-Z0-9]{4,80})/);
      if (!m?.[1]) return null;

      let code = m[1].trim();

      // 3) Si el pegado mezcló cosas y dentro aparece "CMK...", nos quedamos desde ahí (Prisma ids)
      const cmkIndex = code.indexOf("CMK");
      if (cmkIndex > 0) code = code.slice(cmkIndex);

      // 4) Devolvemos formato final normalizado
      return `SF-${code}`;
    };

    const refCode = extractRefCode(rawInput);

    // --- 2) Si es una REF, buscamos en LISTAS YA CARGADAS (Stock + Favoritos) ---
    if (refCode) {
      const pool = [
        // ✅ STOCK REAL de agencia (tu cartera)
        ...(Array.isArray(agencyFavs) ? agencyFavs : []),

        // ✅ favoritos/likes
        ...(Array.isArray(agencyLikes) ? agencyLikes : []),
        ...(Array.isArray(localFavs) ? localFavs : []),
      ].filter(Boolean);

      const found = pool.find(
        (p: any) => String(p?.refCode || "").toUpperCase() === refCode
      );

      if (found) {
        // A) Abrir DETAILS (tu listener ya lo maneja)
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
          addNotification("⚠️ Encontrada, pero sin coordenadas GPS");
        }

        addNotification(`✅ Ref localizada: ${refCode}`);
        setAiInput("");
        return; // <- MUY IMPORTANTE: no seguimos con searchCity
      }

      addNotification(`⚠️ No encuentro ${refCode} en tu Stock/Favoritos`);
      setAiInput("");
      return;
    }

    // --- 3) Si NO es REF, comportamiento actual (búsqueda de ciudad / comando) ---
    setIsAiTyping(true);

    if (searchCity) {
      searchCity(rawInput);
      addNotification(`Rastreando: ${rawInput.toUpperCase()}`);
    } else {
      console.warn("⚠️ searchCity no conectado.");
    }

    setTimeout(() => {
      setAiResponse(`Objetivo confirmado: "${rawInput}". Iniciando aproximación...`);
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