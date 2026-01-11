// @ts-nocheck
"use client";

import React, { useMemo, useState, Suspense } from "react";

// ⚠️ CORRECCIÓN DE RUTA TÁCTICA:
// Hemos visto en su captura que la carpeta se llama 'ui-panels'.
// Usamos '..' para salir de 'app' y buscarla.
// Si esto falla, pruebe con "./ui-panels/AliveMap" (si está dentro de app)
import AliveMap from "../ui-panels/AliveMap";

// El panel también vive allí (index.tsx está dentro de ui-panels)
import UIPanels from "../ui-panels/index"; 

// --- CONTENIDO DE LA PÁGINA ---
function PageContent() {
  // 1. ESTADOS PRINCIPALES
  const [systemMode, setSystemMode] = useState("GATEWAY");
  const [mapInstance, setMapInstance] = useState(null);
  
  // ✅ GATILLO DE BÚSQUEDA
  const [searchTrigger, setSearchTrigger] = useState(null); 

  // 2. PUENTE DE MANDO
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

// --- EXPORTACIÓN BLINDADA ---
export default function Page() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-black flex items-center justify-center text-white animate-pulse">CARGANDO STRATOSFERE...</div>}>
      <PageContent />
    </Suspense>
  )
}