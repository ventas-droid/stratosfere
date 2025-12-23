// @ts-nocheck
"use client";

import React, { useEffect } from 'react';
import { useMapLogic } from './useMapLogic';

// 👇 CAMBIO 1: Añadimos 'onRegisterSearch' para poder pasar el arma al cuartel general
export default function AliveMap({ onMapLoad, systemMode, onRegisterSearch }) {
  
  // 1. INVOCAMOS AL GENERAL (Extraemos searchCity del hook lógico)
  const { mapContainer, map, isMapLoaded, searchCity } = useMapLogic(); 

  // 2. 🔥 CONEXIÓN BLINDADA (ANTI-BUCLE)
  // Este es el parche que evita el error "Maximum update depth".
  // Solo entregamos la función cuando el mapa está 100% cargado.
  useEffect(() => {
    if (isMapLoaded && searchCity && onRegisterSearch) {
       console.log("📡 AliveMap: Enlace de búsqueda establecido.");
       // Usamos una función flecha para asegurar que React no la ejecute infinitamente
       onRegisterSearch(() => searchCity);
    }
    // ⚠️ ALERTA TÁCTICA: Dejamos fuera 'searchCity' de las dependencias a propósito
    // para que esto solo se ejecute al cargar el mapa (isMapLoaded) y no en cada tecla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLoaded, onRegisterSearch]);

  // 3. CONEXIÓN DEL MAPA (Avisar al padre que el mapa existe)
  useEffect(() => {
    if (isMapLoaded && map && map.current) {
      map.current.resize();
      
      if (onMapLoad) {
        onMapLoad(map.current);
      }
    }
  }, [isMapLoaded, onMapLoad, map]);

  // 4. CINEMÁTICAS (CONTROL DE CÁMARA AUTOMÁTICO)
  // Esto maneja los modos generales (Gateway/Explorer).
  // La búsqueda manual ("Alicante") la maneja la función searchCity que ya conectamos arriba.
  useEffect(() => {
    if (!map || !map.current) return;

    if (systemMode === 'GATEWAY') {
       // Vista orbital lejana
       map.current.flyTo({ center: [0, 20], zoom: 1.5, pitch: 0, duration: 3000 });
    } 
    else if (systemMode === 'EXPLORER') {
       // Aterrizaje táctico en Madrid (Inicio por defecto)
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
        
        {/* CAPA 3: PANTALLA DE CARGA (Minimalista) */}
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-black/40 pointer-events-none">
             {/* Barra de Progreso Flotante */}
             <div className="relative w-48 h-[2px] bg-white/20 rounded-full overflow-hidden">
                <div 
                   className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent rounded-full"
                   style={{ 
                     animation: 'slideProgress 1.5s ease-in-out infinite',
                   }}
                ></div>
             </div>

             <style jsx>{`
               @keyframes slideProgress {
                 0% { transform: translateX(-150%); }
                 100% { transform: translateX(350%); }
               }
             `}</style>
          </div>
        )}
      </div>
    </>
  );
}

