// @ts-nocheck
"use client";

import React, { useEffect, useState } from 'react';
import { Radar } from 'lucide-react'; 
import { useMapLogic } from './useMapLogic';
import TacticalRadarController from './ui-panels/TacticalRadarController';

export default function AliveMap({ onMapLoad, systemMode, onRegisterSearch }) {
  
  const { 
    mapContainer, 
    map, 
    isMapLoaded, 
    searchCity, 
    scanVisibleProperties 
  } = useMapLogic(); 

  const [showRadar, setShowRadar] = useState(false);
  const [radarTargets, setRadarTargets] = useState([]);

  const handleScanClick = () => {
    const targets = scanVisibleProperties();
    setRadarTargets(targets);
    setShowRadar(true);
  };

  useEffect(() => {
    if (isMapLoaded && searchCity && onRegisterSearch) {
       onRegisterSearch(() => searchCity);
    }
  }, [isMapLoaded, onRegisterSearch]);

 // --- FIX VISUAL: EL DEFIBRILADOR ---
  useEffect(() => {
    if (isMapLoaded && map && map.current) {
      // 1. Ajuste inicial inmediato
      map.current.resize();
      if (onMapLoad) onMapLoad(map.current);

      // 2. 🔥 GOLPE DE SEGURIDAD (500ms):
      // Obliga al mapa a repintar el lienzo por si las Nanocards quedaron ocultas
      // durante la animación de entrada de la página.
      setTimeout(() => {
          if(map.current) {
             map.current.resize();
             map.current.triggerRepaint();
             console.log("⚡️ MAPA: Repintado de seguridad ejecutado.");
          }
      }, 500);

      // 3. 🔥 GOLPE FINAL (1500ms):
      // Asegura que si la red iba lenta, aparezcan ahora.
      setTimeout(() => {
          if(map.current) {
             map.current.triggerRepaint();
          }
      }, 1500);
    }
  }, [isMapLoaded, onMapLoad, map]);

 

 // 🔥🔥🔥 SISTEMA DE SEÑALES MAESTRO (CORREGIDO) 🔥🔥🔥
  useEffect(() => {
    
    // 1. INTERRUPTOR INTELIGENTE (TOGGLE)
    const scanSignal = () => {
        setShowRadar(prev => {
            const newState = !prev; // Si estaba abierto se cierra, si cerrado se abre
            if (newState) {
                console.log("📡 RADAR: Iniciando barrido...");
                handleScanClick();
            } else {
                console.log("📡 RADAR: Replegando...");
            }
            return newState;
        });
    };

    // 2. CERRAR (Omni, Chat, etc.)
    const closeSignal = () => {
        console.log("📡 RADAR: Silencio (KILL SWITCH)");
        setShowRadar(false);
    };
    
    // Escuchamos Engranaje Y el Botón Nuevo
    window.addEventListener('open-radar-signal', scanSignal);
    window.addEventListener('trigger-scan-signal', scanSignal);
    window.addEventListener('close-radar-signal', closeSignal);
    
    return () => {
        window.removeEventListener('open-radar-signal', scanSignal);
        window.removeEventListener('trigger-scan-signal', scanSignal);
        window.removeEventListener('close-radar-signal', closeSignal);
    };
  }, []); // <--- CORCHETES VACÍOS: ESTO ARREGLA EL ERROR ROJO

  return (
    <>
      <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />

      <div className="absolute inset-0 w-full h-full bg-gray-900 overflow-hidden">
        
        {/* CAPA 1: EL MAPA */}
        <div 
          ref={mapContainer} 
          className="w-full h-full absolute inset-0 focus:outline-none"
          style={{ opacity: 1, zIndex: 1 }} 
        />

        

    {showRadar && (
            // 🔥 FIX: Z-Index bajado a 40 para que NO tape la Bóveda ni la Omni
            <div className="absolute top-0 right-0 h-full w-[600px] max-w-full z-[40] pointer-events-auto animate-slide-in-right shadow-[-20px_0_40px_rgba(0,0,0,0.1)]">
                <TacticalRadarController 
                    targets={radarTargets} 
                    onClose={() => setShowRadar(false)} 
                />
            </div>
       )}
        
        {/* PANTALLA DE CARGA */}
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-black/40 pointer-events-none">
             <div className="relative w-48 h-[2px] bg-white/20 rounded-full overflow-hidden">
                <div 
                   className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent rounded-full"
                   style={{ animation: 'slideProgress 1.5s ease-in-out infinite' }}
                ></div>
             </div>
             <style jsx>{` @keyframes slideProgress { 0% { transform: translateX(-150%); } 100% { transform: translateX(350%); } } `}</style>
          </div>
        )}
      </div>
    </>
  );
}

