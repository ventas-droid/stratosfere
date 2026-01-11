// @ts-nocheck
"use client";

import React, { useMemo, useState, Suspense } from "react";

// ⚠️ CORRECCIÓN DE RUTAS TÁCTICA:
// 1. Buscamos el Mapa en la carpeta antigua 'components' (que es donde solía estar)
// Si esto falla, probaremos otra ruta.
import AliveMap from "./components/alive-map/AliveMap";

// 2. Buscamos el Panel en la carpeta nueva 'ui' (donde está el index.tsx que hemos arreglado)
import UIPanels from "./ui/alive-map/index"; 

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
        
        // Configuración visual
        lang={lang}
        setLang={setLang}
        soundEnabled={soundEnabled}
        toggleSound={() => setSoundEnabled((s: boolean) => !s)}
        
        // Modos del sistema
        systemMode={systemMode}
        setSystemMode={setSystemMode}
        
        // ⚠️ IMPORTANTE: Sin pasar 'favorites' antiguos para evitar conflictos
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

