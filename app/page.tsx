// @ts-nocheck
"use client";

// ⚠️ CAMBIO TÁCTICO 1: Añadimos 'Suspense' a la importación
import React, { useMemo, useState, Suspense } from "react";
import AliveMap from "./components/alive-map/AliveMap";
import UIPanels from "./components/alive-map/ui-panels"; 

// ⚠️ CAMBIO TÁCTICO 2: Le cambiamos el nombre a esta función (de 'Page' a 'PageContent')
// TODO EL CONTENIDO SIGUE EXACTAMENTE IGUAL, NO HE TOCADO NI UNA COMA DENTRO.
function PageContent() {
  // 1. ESTADOS PRINCIPALES DEL SISTEMA
  const [systemMode, setSystemMode] = useState("GATEWAY");
  const [mapInstance, setMapInstance] = useState(null);
  
  // ✅ NUEVO: ESTADO PARA GUARDAR EL DISPARADOR DE BÚSQUEDA
  const [searchTrigger, setSearchTrigger] = useState(null); 

  // ... (resto de su código: mapBridge, favorites, etc.)
  // 2. PUENTE DE MANDO (Bridge)
  // Unifica las órdenes entre el Mapa y los Paneles UI para evitar errores
  const mapBridge = useMemo(() => {
    return {
      current: mapInstance,
      flyTo: (opts) => mapInstance?.flyTo?.(opts),
      jumpTo: (opts) => mapInstance?.jumpTo?.(opts),
      getConfig: (...args) => mapInstance?.getConfig?.(...args),
      setConfig: (...args) => mapInstance?.setConfig?.(...args),
    };
  }, [mapInstance]);

  // 3. GESTIÓN DE FAVORITOS (The Vault)
  const [favorites, setFavorites] = useState([]);
  
  const onToggleFavorite = (prop) => {
    const key = prop?.id ?? prop?.price ?? JSON.stringify(prop);
    setFavorites((prev) => {
      const exists = prev.some((p) => (p?.id ?? p?.price ?? JSON.stringify(p)) === key);
      return exists
        ? prev.filter((p) => (p?.id ?? p?.price ?? JSON.stringify(p)) !== key)
        : [prop, ...prev];
    });
  };

  // 4. CONFIGURACIÓN DE USUARIO
  const [lang, setLang] = useState("ES");
  const [soundEnabled, setSoundEnabled] = useState(true);

 // 5. DESPLIEGUE VISUAL
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      
      {/* CAPA 1: EL MAPA (El Motor nos da la función) */}
      <AliveMap 
        systemMode={systemMode} 
        onMapLoad={setMapInstance}
        onRegisterSearch={setSearchTrigger} // 🔌 CONEXIÓN A: Recibimos el arma del mapa
      />
      
      {/* CAPA 2: LA INTERFAZ (El Panel recibe la función para disparar) */}
      <UIPanels
        map={mapBridge}
        searchCity={searchTrigger} // 🔌 CONEXIÓN B: Le damos el arma al panel
        
        // ... (resto de sus props que ya tenía: onToggleFavorite, favorites, etc.)
        onToggleFavorite={onToggleFavorite}
        favorites={favorites}
        lang={lang}
        setLang={setLang}
        soundEnabled={soundEnabled}
        toggleSound={() => setSoundEnabled((s) => !s)}
        systemMode={systemMode}
        setSystemMode={setSystemMode}
      />
    </div>
  );
}

// ⚠️ CAMBIO TÁCTICO 3: EXPORTAMOS EL BÚNKER
// Esta es la parte que arregla el error. Envolvemos todo en Suspense.
export default function Page() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-black flex items-center justify-center text-white">Cargando Stratosfere...</div>}>
      <PageContent />
    </Suspense>
  )
}