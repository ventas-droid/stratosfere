// @ts-nocheck
"use client";

import React, { useMemo, useState, Suspense } from "react";
// Asegúrese de que estas rutas coincidan con sus carpetas actuales
import AliveMap from "./ui/alive-map/AliveMap";
import UIPanels from "./ui/alive-map/index"; 

// --- CONTENIDO DE LA PÁGINA (CEREBRO LIMPIO) ---
function PageContent() {
  // 1. ESTADOS PRINCIPALES DEL SISTEMA
  const [systemMode, setSystemMode] = useState("GATEWAY");
  const [mapInstance, setMapInstance] = useState(null);
  
  // ✅ ESTADO PARA EL GATILLO DE BÚSQUEDA
  const [searchTrigger, setSearchTrigger] = useState(null); 

  // 2. PUENTE DE MANDO (Bridge)
  // Unifica las órdenes entre el Mapa y los Paneles UI
  const mapBridge = useMemo(() => {
    return {
      current: mapInstance,
      flyTo: (opts: any) => mapInstance?.flyTo?.(opts),
      jumpTo: (opts: any) => mapInstance?.jumpTo?.(opts),
      getConfig: (...args: any) => mapInstance?.getConfig?.(...args),
      setConfig: (...args: any) => mapInstance?.setConfig?.(...args),
    };
  }, [mapInstance]);

  // 3. CONFIGURACIÓN DE USUARIO
  const [lang, setLang] = useState("ES");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 4. DESPLIEGUE VISUAL
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      
      {/* CAPA 1: EL MAPA (Renderizado puro) */}
      <AliveMap 
        systemMode={systemMode} 
        onMapLoad={setMapInstance}
        onRegisterSearch={setSearchTrigger} 
      />
      
      {/* CAPA 2: LA INTERFAZ (El verdadero cerebro) */}
      <UIPanels
        map={mapBridge}
        searchCity={searchTrigger}
        
        // Configuración visual
        lang={lang}
        setLang={setLang}
        soundEnabled={soundEnabled}
        toggleSound={() => setSoundEnabled((s: boolean) => !s)}
        
        // Modos del sistema
        systemMode={systemMode}
        setSystemMode={setSystemMode}
        
        // ⚠️ NOTA TÁCTICA: Aquí hemos quitado los favoritos antiguos.
        // Ahora UIPanels usará sus propias mochilas internas (Agencia vs Personal)
        // Esto soluciona el conflicto del "doble clic".
      />
    </div>
  );
}

// --- EXPORTACIÓN BLINDADA (CON SUSPENSE) ---
export default function Page() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-black flex items-center justify-center text-white font-mono animate-pulse">CARGANDO STRATOSFERE...</div>}>
      <PageContent />
    </Suspense>
  )
}