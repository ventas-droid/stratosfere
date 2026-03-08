// @ts-nocheck
"use client";

import React, { useMemo, useState, Suspense } from "react";

import dynamic from 'next/dynamic';

// ⚡ CÁPSULAS DE DESPLIEGUE RETARDADO (next/dynamic)
// El mapa 3D no se renderiza en el servidor (ssr: false), ahorrando memoria y tiempo.
const AliveMap = dynamic(() => import('@/app/components/alive-map/AliveMap'), { 
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 bg-[#09090B] flex flex-col items-center justify-center z-[100000]">
            <div className="flex flex-col items-center gap-6">
                {/* Marca Minimalista */}
                <span className="text-white/90 text-[11px] font-semibold tracking-[0.4em] uppercase">
                    Stratosfere OS
                </span>
                
                {/* Anillo de Carga de Precisión */}
                <div className="w-6 h-6 border-[2px] border-white/5 border-t-indigo-500 rounded-full animate-spin"></div>
                
                {/* Texto Tech Puro */}
                <span className="text-indigo-400/80 text-[9px] font-mono tracking-[0.2em] uppercase">
                    Iniciando Sistema Operativo 3D...
                </span>
            </div>
        </div>
    )
});

// Los paneles de interfaz también se envuelven para que no bloqueen la carga inicial.
const UIPanels = dynamic(() => import('@/app/components/alive-map/ui-panels'), { 
    ssr: false 
});
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
    <div className="relative w-screen h-screen overflow-hidden bg-[#F5F5F7]">
      
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
    <Suspense fallback={
      <div className="w-screen h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="w-48 h-1 bg-[#D1D1D6] rounded-full overflow-hidden">
            <div className="h-full bg-[#8E8E93] animate-pulse w-full"></div>
        </div>
      </div>
    }>
      <PageContent />
    </Suspense>
  )
}