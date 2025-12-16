"use client";

import React, { useState } from 'react';

// 1. IMPORTACIONES
import AliveMap from "./components/alive-map/AliveMap";
// Nota: Ya no importamos UIPanels aquí para evitar duplicados y errores de props
import { useTacticalSound } from "./lib/hooks/use-tactical-sound";

export default function Page() {
  // --- ESTADOS GLOBALES (LOS MANTENEMOS INTACTOS) ---
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lang, setLang] = useState('ES');
  const [favorites, setFavorites] = useState<any[]>([]);

  // --- INICIALIZAR AUDIO ---
  const sound = useTacticalSound(soundEnabled);

  // --- LOGICA DE CONEXIÓN ---
  const handleFlyTo = (coords: any) => {
    console.log("🛰️ VOLANDO A:", coords);
  };
  
  const handleSearch = (query: string) => {
    console.log("🔍 BUSCANDO:", query);
  };

  const handleToggleFavorite = (prop: any) => {
    sound.playPing(); 
    if (favorites.find((f: any) => f.id === prop.id)) {
        setFavorites(favorites.filter((f: any) => f.id !== prop.id));
    } else {
        setFavorites([...favorites, prop]);
    }
  };

  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* EL MAPA RECIBE SUS ÓRDENES:
         Pasamos su lógica (sound, favorites, lang) dentro de AliveMap.
         AliveMap usará esto + sus coordenadas internas para pintar la UI perfecta.
      */}
      <div className="absolute inset-0 z-0">
         <AliveMap 
            // Pasamos los suministros al frente
            externalSound={sound}
            externalSoundEnabled={soundEnabled}
            externalToggleSound={() => setSoundEnabled(!soundEnabled)}
            externalLang={lang}
            externalSetLang={setLang}
            externalFavorites={favorites}
            externalOnToggleFavorite={handleToggleFavorite}
            externalOnSearch={handleSearch}
            externalOnFlyTo={handleFlyTo}
         />
      </div>
      
    </main>
  );
}