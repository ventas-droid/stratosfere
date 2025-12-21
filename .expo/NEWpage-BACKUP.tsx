// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import AliveMap from "./components/alive-map/AliveMap";
import UIPanels from "./components/alive-map/ui-panels";

export default function Page() {
  // --- ESTADO GLOBAL (COMANDO CENTRAL) ---
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lang, setLang] = useState('ES');
  const [favorites, setFavorites] = useState([]); 
  const [mapInstance, setMapInstance] = useState(null); 
  const [systemMode, setSystemMode] = useState('GATEWAY'); // 'GATEWAY', 'ARCHITECT', 'EXPLORER'

  // SISTEMA DE SONIDO TÁCTICO (Mockup para despliegue rápido)
  const sound = {
    playClick: () => console.log("[SFX] Click"), 
    playHover: () => console.log("[SFX] Hover"), 
    playBoot: () => console.log("[SFX] System Boot"),
    playPing: () => console.log("[SFX] Radar Ping"), 
    playDeploy: () => console.log("[SFX] UI Deploy"), 
    playSuccess: () => console.log("[SFX] Success Chime"), 
    playAlert: () => console.log("[SFX] Alert")
  };

  // Bloqueo de Scroll (Experiencia App Nativa)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleToggleFavorite = (prop) => {
    if (favorites.find((f) => f.id === prop.id)) {
        setFavorites(favorites.filter((f) => f.id !== prop.id));
    } else {
        setFavorites([...favorites, prop]);
    }
  };

  return (
    <main className="relative w-full h-screen bg-black overflow-hidden select-none font-sans">
      {/* CAPA 0: MOTOR GRÁFICO (MAPBOX + 3D) */}
      <div className="absolute inset-0 z-0">
        <AliveMap 
           onMapLoad={(map) => setMapInstance(map)}
           systemMode={systemMode}
        />
      </div>

      {/* CAPA 1: INTERFAZ DE MANDO (HUD) */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        <UIPanels 
          map={mapInstance}
          sound={sound}
          soundEnabled={soundEnabled}
          toggleSound={() => setSoundEnabled(!soundEnabled)}
          lang={lang}
          setLang={setLang}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          systemMode={systemMode}
          setSystemMode={setSystemMode}
        />
      </div>
    </main>
  );
}



