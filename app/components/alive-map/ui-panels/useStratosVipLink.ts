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
            
              // 2. PROTOCOLO DE APERTURA
              setIsVipGuest(true);
              if (setGateUnlocked) setGateUnlocked(true);
              if (setSystemMode) setSystemMode('EXPLORER');
              if (setLandingComplete) setLandingComplete(true); 
              if (setShowAdvancedConsole) setShowAdvancedConsole(false);
              
              // 3. DESPLIEGUE TÁCTICO (Vuelo del dron al activo)
              setTimeout(() => {
                setSelectedProp(cleanProp);
                
                // Forzamos apertura del panel
                setTimeout(() => {
                  setActivePanel('DETAILS');
                }, 150);
                
                // Vuelo del dron
                const coords = cleanProp.coordinates || [cleanProp.lng, cleanProp.lat];
                if (coords && map?.current) {
                  map.current.flyTo({ 
                    center: coords, 
                    zoom: 18, 
                    pitch: 65, 
                    bearing: -20,
                    duration: 3500 
                  });
                }

                // 🔥 LA CLAVE: Limpiamos la URL aquí, 4 segundos después, no antes.
                // Si la limpias arriba, el sistema cree que ya no eres VIP y te echa.
                setTimeout(() => {
                  if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('p');
                    url.searchParams.delete('ref');
                    url.searchParams.delete('selectedProp');
                    window.history.replaceState(null, '', url.pathname);
                    console.log("🧹 URL Limpiada: Acceso VIP consolidado.");
                  }
                }, 4000);

              }, 800); 
            }
          }
        } catch (e) {
          console.error("❌ Error crítico en el enlace VIP:", e);
          hasProcessed.current = false;
          if (setShowAdvancedConsole) setShowAdvancedConsole(true);
        }
      }
    };
    
    checkUrl();
    // Añadimos las dependencias para que el linter no de guerra
  }, [searchParams, map, setSelectedProp, setActivePanel, setSystemMode, setLandingComplete, setGateUnlocked, setShowAdvancedConsole]);

  return { isVipGuest };
};