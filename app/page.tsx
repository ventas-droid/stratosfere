// @ts-nocheck
"use client";

import React, { useMemo, useState, Suspense } from "react";

import AliveMap from "@/app/components/alive-map/AliveMap";
import UIPanels from "@/app/components/alive-map/ui-panels";

// --- CONTENIDO DE LA PÁGINA (CEREBRO LIMPIO) ---
function PageContent() {
  // 1. ESTADOS PRINCIPALES DEL SISTEMA
  const [systemMode, setSystemMode] = useState("GATEWAY");
  const [mapInstance, setMapInstance] = useState(null);
  
  // ✅ ESTADO PARA EL GATILLO DE BÚSQUEDA
  const [searchTrigger, setSearchTrigger] = useState(null); 

  // 2. PUENTE DE MANDO (Bridge)
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
      
      {/* CAPA 1: EL MAPA */}
      <AliveMap 
        systemMode={systemMode} 
        onMapLoad={setMapInstance}
        onRegisterSearch={setSearchTrigger} 
      />
      
      {/* CAPA 2: LA INTERFAZ */}
      <UIPanels
        map={mapBridge}
        searchCity={searchTrigger}
        lang={lang}
        setLang={setLang}
        soundEnabled={soundEnabled}
        toggleSound={() => setSoundEnabled((s: boolean) => !s)}
        systemMode={systemMode}
        setSystemMode={setSystemMode}
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