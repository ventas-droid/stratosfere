// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// ---------------------------------------------------------
// ⚠️ CORRECCIÓN APLICADA AQUÍ:
// He borrado "MapNanoCard" de esta línea.
// Solo importamos las imágenes para los popups o marcadores.
// ---------------------------------------------------------
import { LUXURY_IMAGES } from './ui-panels/ui-panels'; 

// TOKEN (Si tiene uno propio, póngalo aquí. Si no, usaremos este público de pruebas)
const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';

export const useMapLogic = ({ properties = [], onMarkerClick }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return; // Si ya existe, no reiniciamos

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Modo oscuro táctico
      center: [-3.7038, 40.4168], // Madrid
      zoom: 12,
      pitch: 0,
      attributionControl: false
    });

    map.current.on('load', () => {
      setIsMapLoaded(true);
      console.log("✅ SISTEMA DE NAVEGACIÓN: EN LÍNEA");

      // Añadimos niebla atmosférica (Efecto Stratosfere)
      map.current.setFog({
        'range': [0.5, 10],
        'color': '#0a0a0a',
        'horizon-blend': 0.3,
        'high-color': '#202020',
        'space-color': '#000000',
        'star-intensity': 0.5 
      });
    });

  }, []);

  // --- GESTIÓN DE MARCADORES (PINS) ---
  useEffect(() => {
    if (!map.current || !isMapLoaded || !properties || properties.length === 0) return;

    // Aquí simplemente añadimos los nuevos marcadores.
    // (En un sistema real, primero limpiaríamos los antiguos).

    properties.forEach((prop, index) => {
        // 1. Crear el elemento DOM para el marcador
        const el = document.createElement('div');
        el.className = 'marker-pin';
        
        // Estilo del Pin (Círculo brillante)
        // Usamos colores tácticos: Ámbar para Premium, Azul para Estándar
        const isPremium = prop.price && prop.price.includes("M");
        const pinColor = isPremium ? '#F59E0B' : '#3B82F6';

        el.style.width = '20px';
        el.style.height = '20px';
        el.style.backgroundColor = pinColor;
        el.style.borderRadius = '50%';
        el.style.boxShadow = `0 0 20px ${pinColor}`;
        el.style.cursor = 'pointer';
        el.style.border = '2px solid white';

        // Evento de Clic en el Pin
        el.addEventListener('click', (e) => {
             e.stopPropagation(); // Evita que el click pase al mapa (haciendo zoom indeseado)
             console.log("📍 PIN CLICKED:", prop.title);
             
             // Disparamos la función que viene de arriba (Page.tsx)
             if (onMarkerClick) {
                 onMarkerClick(prop);
             }
        });

        // 2. Añadir al mapa en las coordenadas correctas
        new mapboxgl.Marker(el)
            .setLngLat([prop.lng, prop.lat])
            .addTo(map.current);
    });

  }, [isMapLoaded, properties, onMarkerClick]);

  return { mapContainer, map, isMapLoaded };
};

