// @ts-nocheck
"use client";

import React, { useEffect } from 'react';
import { useMapLogic } from './useMapLogic';

export default function AliveMap({ onMapLoad, systemMode }) {
  
  // 1. ARRANCAMOS EL MOTOR
  const { mapContainer, map, isMapLoaded } = useMapLogic();

  // 2. CONEXIÓN SEGURA
  useEffect(() => {
    if (isMapLoaded && map && map.current) {
      // Forzar repintado del mapa para asegurar que ocupe todo
      map.current.resize();
      
      if (onMapLoad) {
        onMapLoad(map.current);
      }
    }
  }, [isMapLoaded, onMapLoad, map]);

  // 3. CINEMÁTICAS
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
      {/* ⚠️ FUERZA BRUTA: CSS DE MAPBOX DESDE CDN PARA EVITAR ERRORES DE CARGA */}
      <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />

      <div className="absolute inset-0 w-full h-full bg-gray-900">
        
        {/* EL LIENZO DEL MAPA */}
        <div 
          ref={mapContainer} 
          className="w-full h-full absolute inset-0 focus:outline-none"
          style={{ 
              // ⚠️ BYPASS: Forzamos visibilidad a 1 siempre. 
              // Si el mapa carga, lo veremos. Si da error, veremos el error, pero no negro.
              opacity: 1, 
              zIndex: 1 
          }} 
        />
        
        {/* PANTALLA DE CARGA (SOLO VISIBLE SI NO HA CARGADO AÚN) */}
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 pointer-events-none">
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

