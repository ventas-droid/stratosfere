// @ts-nocheck
"use client";

import { useEffect } from 'react';

export const useMapFlight = (map: any) => {
  // --------------------------------------------------------------------
  // C. SISTEMA DE TELETRANSPORTE (GIROSCOPIO BLINDADO)
  // --------------------------------------------------------------------
  useEffect(() => {
    const handleFlyTo = (e: any) => {
      if (!map.current) return;
      const { center, zoom, pitch, duration } = e.detail;

      // 🔥 1. LEEMOS LA CÁMARA ACTUAL DEL USUARIO
      const currentPitch = map.current.getPitch();
      const currentBearing = map.current.getBearing();

      // 🔥 2. VOLAMOS RESPETANDO SU INCLINACIÓN Y ROTACIÓN
      map.current.flyTo({
        center: center,
        zoom: zoom || 18,
        pitch: pitch !== undefined ? pitch : currentPitch,
        bearing: currentBearing, 
        duration: duration || 3000,
        essential: true
      });
    };
    
    window.addEventListener('fly-to-location', handleFlyTo);
    return () => window.removeEventListener('fly-to-location', handleFlyTo);
  }, [map]);
};