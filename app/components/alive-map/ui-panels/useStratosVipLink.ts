// Ubicación: ./app/components/alive-map/ui-panels/useStratosVipLink.ts
import { useState, useEffect } from "react";
import { getPropertyByIdAction } from "@/app/actions";
import { sanitizePropertyData } from "../../../utils/propertyCore";

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

  useEffect(() => {
    if (!searchParams) return;

    const checkUrl = async () => {
      const propId = searchParams.get('p') || searchParams.get('selectedProp'); 
      
      if (propId) {
        console.log("🎯 VIP PASS Detectado para:", propId);
        try {
          const res = await getPropertyByIdAction(propId);
          
          if (res?.success && res.data) {
            const cleanProp = sanitizePropertyData(res.data);

            if (cleanProp) {
              // 🧨 1. LA CURA AL BUCLE INFINITO: Borramos el rastro de la URL sin recargar la página.
              if (typeof window !== 'undefined') {
                window.history.replaceState(null, '', window.location.pathname);
              }

              // 2. Activamos modo invitado y abrimos la puerta (SIN mentir con la identidad)
              setIsVipGuest(true);
              setGateUnlocked(true);

              if (typeof setSystemMode === 'function') setSystemMode('EXPLORER');
              setLandingComplete(true); 
              setShowAdvancedConsole(false);
              
              // 3. Volamos hacia la casa
              setTimeout(() => {
                setSelectedProp(cleanProp);
                setActivePanel('DETAILS');
                
                if (cleanProp.coordinates && map?.current) {
                  map.current.flyTo({ 
                    center: cleanProp.coordinates, 
                    zoom: 18, 
                    pitch: 60,
                    duration: 3000 
                  });
                }
              }, 500);
            }
          }
        } catch (e) {
          console.error("Error abriendo link VIP:", e);
        }
      }
    };
    
    checkUrl();
  }, [searchParams, map, setSystemMode, setSelectedProp, setActivePanel, setLandingComplete, setShowAdvancedConsole, setGateUnlocked]);

  return { isVipGuest };
};