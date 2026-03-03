"use client";
// Ubicación: ./app/components/alive-map/ui-panels/useStratosVipLink.ts
import { useState, useEffect, useRef } from "react"; // 💡 Añadimos useRef
import { sanitizePropertyData } from "../../../utils/propertyCore";
import { getPropertyByIdAction, getPropertyByRefCodeAction } from "@/app/actions";

export const useStratosVipLink = (
  searchParams: any,
  map: any,
  setSystemMode: any,
  setSelectedProp: any,
  setActivePanel: any,
  setLandingComplete: any,
  setShowAdvancedConsole: any,
  setGateUnlocked: any
) => {
  const [isVipGuest, setIsVipGuest] = useState(false);
  // 🛡️ Evitamos que el sensor se dispare dos veces (strict mode)
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (!searchParams || hasProcessed.current) return;

    const checkUrl = async () => {
      // 🛰️ SENSOR DUAL
      const propId = searchParams.get('p') || searchParams.get('selectedProp');
      const refCode = searchParams.get('ref'); 
      
      if (propId || refCode) {
        hasProcessed.current = true; // Marcamos como procesado
        console.log("🎯 VIP PASS Detectado:", refCode ? `Ref: ${refCode}` : `ID: ${propId}`);
        
        try {
          let res = null;
          if (refCode) {
            res = await getPropertyByRefCodeAction(refCode);
          } else if (propId) {
            res = await getPropertyByIdAction(propId as string);
          }
          
          if (res?.success && res.data) {
            const cleanProp = sanitizePropertyData(res.data);

            if (cleanProp) {
              // 🧨 1. LIMPIEZA DE URL (Silenciosa)
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.delete('p');
                url.searchParams.delete('ref');
                url.searchParams.delete('selectedProp');
                window.history.replaceState(null, '', url.pathname);
              }

              // 2. PROTOCOLO DE APERTURA
              setIsVipGuest(true);
              if (setGateUnlocked) setGateUnlocked(true);
              if (setSystemMode) setSystemMode('EXPLORER');
              if (setLandingComplete) setLandingComplete(true); 
              if (setShowAdvancedConsole) setShowAdvancedConsole(false);
              
              // 3. DESPLIEGUE TÁCTICO (Vuelo del dron al activo)
              setTimeout(() => {
                setSelectedProp(cleanProp);
                setActivePanel('DETAILS');
                
                // Si la propiedad tiene coordenadas, mandamos el mapa allí
                const coords = cleanProp.coordinates || [cleanProp.lng, cleanProp.lat];
                if (coords && map?.current) {
                  map.current.flyTo({ 
                    center: coords, 
                    zoom: 18, 
                    pitch: 65, // Un poco más de inclinación para efecto cinematográfico
                    bearing: -20,
                    duration: 3500 // Un vuelo un poco más suave
                  });
                }
              }, 800); // Un poco más de margen para que la UI respire
            }
          }
        } catch (e) {
          console.error("❌ Error crítico en el enlace VIP:", e);
        }
      }
    };
    
    checkUrl();
  }, [searchParams, map]); // Simplificamos dependencias para evitar bucles

  return { isVipGuest };
};