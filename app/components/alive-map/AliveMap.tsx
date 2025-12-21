// @ts-nocheck
"use client";

import React, { useEffect } from 'react';
import { useMapLogic } from './useMapLogic';

// ⚠️ NOTA: Ya NO importamos UIPanels aquí. Lo gestiona el "Jefe" (page.tsx)
// import UiPanels from './ui-panels'; <--- ELIMINADO

export default function AliveMap({ onMapLoad, systemMode }) {
  
  // 1. ARRANCAMOS EL MOTOR
  const { mapContainer, map, isMapLoaded } = useMapLogic();

  // 2. CONEXIÓN SEGURA
  useEffect(() => {
    if (isMapLoaded && map && map.current) {
      map.current.resize();
      
      // Avisamos al padre (page.tsx) de que el mapa está listo
      if (onMapLoad) {
        onMapLoad(map.current);
      }
    }
  }, [isMapLoaded, onMapLoad, map]);

  // 3. CINEMÁTICAS (CONTROL DE CÁMARA)
  useEffect(() => {
    if (!map || !map.current) return;

    if (systemMode === 'GATEWAY') {
       map.current.flyTo({ center: [0, 20], zoom: 1.5, pitch: 0, duration: 3000 });
    } 
    else if (systemMode === 'EXPLORER') {
       map.current.flyTo({ center: [-3.6905, 40.4250], zoom: 16.5, pitch: 65, bearing: -15, duration: 4000 });
    }
  }, [systemMode, map]);

  return (
    <>
      <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />

      <div className="absolute inset-0 w-full h-full bg-gray-900 overflow-hidden">
        
        {/* CAPA 1: EL LIENZO DEL MAPA */}
        <div 
          ref={mapContainer} 
          className="w-full h-full absolute inset-0 focus:outline-none"
          style={{ opacity: 1, zIndex: 1 }} 
        />
        
        {/* ❌ AQUÍ ANTES ESTABAN LOS PANELES. 
           LOS HEMOS QUITADO PARA QUE NO SE DUPLIQUEN.
           AHORA VIVEN EN page.tsx 
        */}

        {/* CAPA 3: PANTALLA DE CARGA */}
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 pointer-events-none">
             <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-blue-500 font-mono text-xs tracking-widest animate-pulse">
                  ESTABLECIENDO ENLACE SATELITAL...
                </div>
             </div>
          </div>
        )}
      </div>
    </>
  );

}

