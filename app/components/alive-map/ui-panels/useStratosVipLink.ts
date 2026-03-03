"use client";
// Ubicación: ./app/components/alive-map/ui-panels/useStratosVipLink.ts
import { useState, useEffect, useRef } from "react"; 
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
  const hasProcessed = useRef(false);

  // 🛡️ PROTOCOLO DE EXTRACCIÓN: Destruye el pase VIP
  const revokeVipPass = () => {
    setIsVipGuest(false);
    hasProcessed.current = false;
    console.log("🔒 Pase VIP revocado. Usuario expulsado al Gateway.");
  };

  useEffect(() => {
    if (!searchParams || hasProcessed.current) return;

    const checkUrl = async () => {
      const propId = searchParams.get('p') || searchParams.get('selectedProp');
      const refCode = searchParams.get('vip');      
      
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
              
              // 3. DESPLIEGUE TÁCTICO
              setTimeout(() => {
                setSelectedProp(cleanProp);
                
                setTimeout(() => {
                  setActivePanel('DETAILS');
                }, 150);
                
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

                setTimeout(() => {
                  if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('p');
                    url.searchParams.delete('vip');                    
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
  }, [searchParams, map]); 

  // 🔥 EXPORTAMOS LA NUEVA FUNCIÓN AQUÍ
  return { isVipGuest, revokeVipPass };
};
