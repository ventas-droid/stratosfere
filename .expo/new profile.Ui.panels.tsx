// @ts-nocheck
"use client";

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// ⚠️ TOKEN DE ACCESO CLASIFICADO
mapboxgl.accessToken = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';

// --- BASE DE DATOS TÁCTICA AMPLIADA (15 ACTIVOS) ---
const GEO_DATA = {
    "type": "FeatureCollection",
    "features": [
        // ZONA SALAMANCA / RETIRO
        { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-3.6905, 40.4250] }, "properties": { "id": 1, "price": 2500000, "tier": "PREMIUM", "title": "Torre Colón SkyVilla", "type": "Ático", "status": "DISPONIBLE", "role": "INVERSIÓN", "img": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750" } },
        { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-3.6850, 40.4200] }, "properties": { "id": 3, "price": 1200000, "tier": "SMART", "title": "Loft Retiro Park", "type": "Loft", "status": "RESERVADO", "role": "LIFESTYLE", "img": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c" } },
        { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-3.6880, 40.4280] }, "properties": { "id": 7, "price": 3100000, "tier": "PREMIUM", "title": "Velázquez Golden Mile", "type": "Piso", "status": "DISPONIBLE", "role": "TROPHY ASSET", "img": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c" } },
        { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-3.6830, 40.4230] }, "properties": { "id": 8, "price": 950000, "tier": "SMART", "title": "Claudio Coello Design", "type": "Apartamento", "status": "DISPONIBLE", "role": "RENTABILIDAD", "img": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2" } },
        
        // ZONA CENTRO / PALACIO
        { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-3.7100, 40.4180] }, "properties": { "id": 2, "price": 15000000, "tier": "HIGH_CLASS", "title": "Palacio Real View", "type": "Palacio", "status": "OFF-MARKET", "role": "COLECCIÓN", "img": "https://images.unsplash.com/photo-1600596542815-27b5aec872c3" } },
        { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-3.7038, 40.4168] }, "properties": { "id": 4, "price": 450000, "tier": "SMART", "title": "Sol Rooftop Studio", "type": "Estudio", "status": "DISPONIBLE", "role": "ALQUILER", "img": "https://images.unsplash.com/photo-1484154218962-a197022b5858" } },
        { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-3.7060, 40.4200] }, "properties": { "id": 9, "price": 1800000, "tier": "PREMIUM", "title": "Gran Vía Penthouse", "type": "Ático", "status": "DISPONIBLE", "role": "LIFESTYLE", "img": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750" } },

        // ZONA CHAMARTÍN / BERNABÉU
        { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-3.6950, 40.4500] }, "properties": { "id": 5, "price": 3200000, "tier": "PREMIUM", "title": "Bernabéu Luxury Box", "type": "Piso", "status": "DISPONIBLE", "role": "CORPORATIVO", "img": "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea" } },
        { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-3.6883, 40.4531] }, "properties": { "id": 6, "price": 850000, "tier": "SMART", "title": "Castellana Executive Hub", "type": "Oficina", "status": "DISPONIBLE", "role": "OFICINA", "img": "https://images.unsplash.com/photo-1497366216548-37526070297c" } },
        { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-3.6800, 40.4600] }, "properties": { "id": 10, "price": 4100000, "tier": "HIGH_CLASS", "title": "El Viso Villa", "type": "Chalet", "status": "CONFIDENCIAL", "role": "FAMILIAR", "img": "https://images.unsplash.com/photo-1600596542815-27b5aec872c3" } },

        // OTROS DISTRITOS
        { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-3.7200, 40.4300] }, "properties": { "id": 11, "price": 900000, "tier": "SMART", "title": "Moncloa Student Hub", "type": "Piso", "status": "DISPONIBLE", "role": "RENTABILIDAD", "img": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2" } },
        { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-3.6600, 40.4350] }, "properties": { "id": 12, "price": 1100000, "tier": "SMART", "title": "Ventas Modern Loft", "type": "Loft", "status": "RESERVADO", "role": "LIFESTYLE", "img": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c" } },
    ]
};

export default function AliveMap({ onMapLoad, systemMode }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef([]); 

  useEffect(() => {
    if (map.current) return; 

    try {
        // CONFIGURACIÓN INICIAL: VISTA ESPACIAL (ZOOM 1.5)
        const m = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/standard', 
          projection: 'globe', 
          zoom: 1.5, 
          center: [0, 20], 
          pitch: 0, 
          bearing: 0,
          antialias: true,
          attributionControl: false,
          logoPosition: 'bottom-left'
        });

        map.current = m;

        m.on('load', () => {
          console.log("✅ MOTOR GRÁFICO ONLINE");
          setMapLoaded(true);
          onMapLoad(m);

          // 1. ATMÓSFERA CINEMÁTICA (STRATOSFERE FEEL)
          m.setFog({
              'range': [0.5, 10],
              'color': 'white',
              'horizon-blend': 0.1,
              'high-color': '#245cdf',
              'space-color': '#000000',
              'star-intensity': 0.8
          });
          
          if (m.setStyleConfigProperty) {
            // INICIO EN MODO 'DUSK' (ATARDECER PREMIUM)
            m.setConfig('basemap', { 'lightPreset': 'dusk', 'showPointOfInterestLabels': false });
          }

          // 2. FUENTE DE DATOS (CON CLUSTERING ACTIVADO)
          m.addSource('properties', {
              type: 'geojson',
              data: GEO_DATA,
              cluster: true,
              clusterMaxZoom: 14, // A partir de este zoom, se separan
              clusterRadius: 50 // Radio de agrupación
          });

          // 3. CAPAS CLUSTERS (BURBUJAS LEJANAS)
          m.addLayer({
              id: 'clusters',
              type: 'circle',
              source: 'properties',
              filter: ['has', 'point_count'],
              paint: {
                  // Colores según cantidad de propiedades: Azul (<10), Amarillo (<750), Rosa (>=750)
                  'circle-color': ['step', ['get', 'point_count'], '#2563eb', 10, '#f59e0b', 750, '#ec4899'],
                  'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
                  'circle-opacity': 0.9,
                  'circle-stroke-width': 2,
                  'circle-stroke-color': 'rgba(255,255,255,0.5)'
              }
          });

          m.addLayer({
              id: 'cluster-count',
              type: 'symbol',
              source: 'properties',
              filter: ['has', 'point_count'],
              layout: {
                  'text-field': '{point_count_abbreviated}',
                  'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                  'text-size': 12,
              },
              paint: { 'text-color': '#ffffff' }
          });

          // 4. PINES HTML INDIVIDUALES (CERCANOS) - Se generan dinámicamente
          GEO_DATA.features.forEach((feature) => {
              const el = document.createElement('div');
              el.className = 'marker-container group cursor-pointer pointer-events-auto'; // IMPORTANTE: pointer-events-auto
              
              const price = feature.properties.price;
              const tier = feature.properties.tier;
              
              // Lógica de colores según Tier/Precio
              let colorClass = 'text-blue-500'; 
              let ringColor = 'border-blue-500';
              if(tier === 'HIGH_CLASS') { colorClass = 'text-red-600'; ringColor = 'border-red-600'; }
              else if(tier === 'PREMIUM') { colorClass = 'text-amber-500'; ringColor = 'border-amber-500'; }

              el.innerHTML = `
                <div class="relative w-12 h-12 flex items-center justify-center -translate-y-1/2">
                    <div class="absolute inset-0 neon-pulse ${colorClass}"></div>
                    
                    <div class="relative w-4 h-4 bg-[#050505] rounded-full shadow-[0_0_15px_currentColor] transition-transform duration-300 group-hover:scale-150 border-2 ${ringColor} z-10 ${colorClass}"></div>
                    
                    <div class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 glass-panel text-white text-[10px] font-mono px-3 py-1.5 rounded-full whitespace-nowrap z-50 shadow-xl transform group-hover:-translate-y-1 pointer-events-none">
                        ${(price/1000000).toFixed(2)}M €
                    </div>
                </div>
              `;

              el.addEventListener('click', (e) => {
                  e.stopPropagation(); 
                  // Vuelo táctico al pin seleccionado
                  m.flyTo({ center: feature.geometry.coordinates, zoom: 17, pitch: 65, bearing: -20, essential: true, speed: 0.8, easing: (t) => t * (2 - t) });
                  // Disparar evento global para que la UI lo detecte
                  const event = new CustomEvent('prop-selected', { detail: feature.properties });
                  window.dispatchEvent(event);
              });

              const marker = new mapboxgl.Marker({ element: el })
                  .setLngLat(feature.geometry.coordinates)
                  .addTo(m);
              
              markersRef.current.push(marker);
          });
          
          // LÓGICA DE CLUSTER CLICK (Zoom suave al grupo)
          m.on('click', 'clusters', (e) => {
            const features = m.queryRenderedFeatures(e.point, { layers: ['clusters'] });
            const clusterId = features[0].properties.cluster_id;
            m.getSource('properties').getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return;
                m.easeTo({ center: features[0].geometry.coordinates, zoom: zoom + 1.5, duration: 1200, easing: (t) => t * (2 - t) });
            });
          });
          
          // Cursores interactivos
          m.on('mouseenter', 'clusters', () => { m.getCanvas().style.cursor = 'pointer'; });
          m.on('mouseleave', 'clusters', () => { m.getCanvas().style.cursor = ''; });

        });
    } catch (e) { console.error("🚨 ERROR CRÍTICO EN MAPA:", e); }

    return () => {
        map.current?.remove();
        markersRef.current = [];
    };
  }, []);

  return (
    <div className="relative w-full h-full">
       <div ref={mapContainer} className="absolute inset-0 z-0 w-full h-full" />
       {/* PANTALLA DE CARGA DEL MOTOR (SOLO SI FALLA LA CONEXIÓN INICIAL) */}
       {!mapLoaded && (
         <div className="absolute inset-0 bg-[#050505] z-10 flex flex-col items-center justify-center text-white font-mono">
            <span className="text-[10px] tracking-[0.5em] animate-pulse flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"/> INITIATING SAT-LINK...
            </span>
         </div>
       )}
    </div>
  );
}

