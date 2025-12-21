// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// 👇 AQUÍ ESTABA EL ERROR: AHORA APUNTA BIEN A LA CARPETA
import { LUXURY_IMAGES } from './ui-panels'; 
import MapNanoCard from './ui-panels/MapNanoCard'; 

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';

// ----------------------------------------------------------------------
// BASE DE DATOS TÁCTICA: IMÁGENES CONFIRMADAS
// ----------------------------------------------------------------------
const FULL_DATABASE = [
    // --- GAMA ALTA (AZUL / VIOLETA) ---
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6883, 40.4280] }, 
        properties: { price: "5.2M€", priceValue: 5200000, type: "PENTHOUSE", id: 1, role: "PREMIUM", description: "Ático triplex con piscina.", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6850, 40.4200] }, 
        properties: { price: "12.5M€", priceValue: 12500000, type: "ROYAL VILLA", id: 2, role: "VIP CLASS", description: "Palacete histórico.", img: "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6910, 40.4350] }, 
        properties: { price: "8.9M€", priceValue: 8900000, type: "SKY VIEW", id: 3, role: "HIGH CLASS", description: "Vistas 360º.", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6780, 40.4450] }, 
        properties: { price: "3.5M€", priceValue: 3500000, type: "MANSION", id: 10, role: "PRIVADO", description: "Seguridad privada.", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6900, 40.4260] }, 
        properties: { price: "1.2M€", priceValue: 1200000, type: "PISO LUJO", id: 8, role: "EXCLUSIVO", description: "Salamanca Prime.", img: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6750, 40.4180] }, 
        properties: { price: "950k€", priceValue: 950000, type: "RETIRO VIEWS", id: 11, role: "JOYAS", description: "Frente al parque.", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7020, 40.4300] }, 
        properties: { price: "1.8M€", priceValue: 1800000, type: "PALACIO", id: 12, role: "HISTÓRICO", description: "Siglo XIX.", img: "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6885, 40.4282] }, 
        properties: { price: "4.1M€", priceValue: 4100000, type: "APT LUJO", id: 6, role: "PREMIUM", description: "Diseño italiano.", img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6881, 40.4278] }, 
        properties: { price: "6.5M€", priceValue: 6500000, type: "DUPLEX", id: 7, role: "ELITE", description: "Terraza 360.", img: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=800&q=80" } 
    },

    // --- GAMA MEDIA (ROSA / NARANJA) ---
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7050, 40.4180] }, 
        properties: { price: "680k€", priceValue: 680000, type: "DUPLEX", id: 102, role: "FAMILIAR", description: "Luminoso.", img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7100, 40.4200] }, 
        properties: { price: "550k€", priceValue: 550000, type: "LOFT", id: 104, role: "OPORTUNIDAD", description: "Céntrico.", img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6980, 40.4080] }, 
        properties: { price: "720k€", priceValue: 720000, type: "ÁTICO", id: 13, role: "VISTAS", description: "Terraza 40m2.", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6800, 40.4250] }, 
        properties: { price: "340k€", priceValue: 340000, type: "SMART HOME", id: 4, role: "MODERNO", description: "Tecnología.", img: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7000, 40.4150] }, 
        properties: { price: "450k€", priceValue: 450000, type: "STUDIO", id: 101, role: "ALQUILER", description: "Ideal inversores.", img: "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6980, 40.4120] }, 
        properties: { price: "320k€", priceValue: 320000, type: "FLAT", id: 103, role: "A REFORMAR", description: "Potencial.", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" } 
    },

    // --- GAMA ACCESIBLE (AMARILLO / VERDE) ---
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6950, 40.4220] }, 
        properties: { price: "210k€", priceValue: 210000, type: "MINI LOFT", id: 5, role: "DISEÑO", description: "Pequeño pero matón.", img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7060, 40.4100] }, 
        properties: { price: "180k€", priceValue: 180000, type: "BUHARDILLA", id: 14, role: "BOHEMIO", description: "Con encanto.", img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7150, 40.4250] }, 
        properties: { price: "290k€", priceValue: 290000, type: "APARTAMENTO", id: 15, role: "UNIVERSIDAD", description: "Cerca ICADE.", img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6920, 40.4100] }, 
        properties: { price: "20k€", priceValue: 20000, type: "GARAGE", id: 201, role: "INVERSIÓN", description: "Plaza amplia.", img: "https://images.unsplash.com/photo-1590674899505-1c5c4195c369?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7120, 40.4250] }, 
        properties: { price: "45k€", priceValue: 45000, type: "LOCAL", id: 202, role: "COMERCIAL", description: "A pie de calle.", img: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6850, 40.4400] }, 
        properties: { price: "90k€", priceValue: 90000, type: "TRASTERO", id: 203, role: "ALMACÉN", description: "15m2.", img: "https://images.unsplash.com/photo-1595429035839-c99c298ffdde?auto=format&fit=crop&w=800&q=80" } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7200, 40.4150] }, 
        properties: { price: "135k€", priceValue: 135000, type: "SÓTANO", id: 204, role: "REFORMA", description: "Diáfano.", img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80" } 
    },
];
// ----------------------------------------------------------------------
// 2. LÓGICA DEL MAPA
// ----------------------------------------------------------------------
export const useMapLogic = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false); 
  const markersRef = useRef({});

  useEffect(() => {
    if (map.current) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [-3.6883, 40.4280],
      zoom: 13, 
      pitch: 65,
      bearing: -20,
      attributionControl: false,
      antialias: true,
      projection: 'globe' 
    });

    map.current.on('style.load', () => {
       const m = map.current;
       try {
        m.setConfigProperty('basemap', 'lightPreset', 'dusk');
        m.setConfigProperty('basemap', 'showPointOfInterestLabels', false); 
        m.setFog({
            'range': [0.5, 10],
            'color': '#242B4B',      
            'high-color': '#ADD8E6', 
            'horizon-blend': 0.2,    
            'space-color': '#0B0E17',
            'star-intensity': 0.6    
        });
       } catch(e) { console.log("Configurando luces..."); }
    });

    map.current.on('load', () => {
      console.log("🟢 MAPA 3D: SISTEMAS LISTOS");
      setIsLoaded(true); 

      map.current.addSource('properties', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: FULL_DATABASE },
        cluster: true,
        clusterMaxZoom: 14, 
        clusterRadius: 50
      });

      // 🔵 CAPA DE BOLAS (CLUSTER) - AZUL NEÓN (Luz Propia)
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'properties',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': '#0071e3', // Azul Corporativo
            'circle-radius': ['step', ['get', 'point_count'], 25, 100, 35, 750, 45],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 1,
            // ✨ ESTA ES LA CLAVE: Hace que el color brille en la oscuridad
            'circle-emissive-strength': 1 
        }
      });

      // ⚪️ CAPA DE NÚMEROS - BLANCO LUMINOSO
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'properties',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Arial Unicode MS Bold'], // Fuente gruesa estándar
            'text-size': 16,
            'text-offset': [0, 0]
        },
        paint: { 
            'text-color': '#ffffff',
            // ✨ TAMBIÉN ILUMINAMOS EL TEXTO
            'text-emissive-strength': 1 
        }
      });

      // EVENTOS DE CLICK EN CLUSTER
      map.current.on('click', 'clusters', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource('properties').getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.current.flyTo({ center: features[0].geometry.coordinates, zoom: zoom + 1, speed: 0.5 });
        });
      });
      
      map.current.on('mouseenter', 'clusters', () => { map.current.getCanvas().style.cursor = 'pointer'; });
      map.current.on('mouseleave', 'clusters', () => { map.current.getCanvas().style.cursor = ''; });
      map.current.on('move', () => updateMarkers());
      map.current.on('moveend', () => updateMarkers());
      
      updateMarkers();
    });
  }, []);

  // FILTRADO
  useEffect(() => {
      const handleFilterSignal = (e) => {
          if (!map.current || !map.current.getSource('properties')) return;
          
          const { maxPrice } = e.detail;
          console.log(`🛰️ MAPA: FILTRANDO POR DEBAJO DE ${maxPrice} €`);

          const filteredFeatures = FULL_DATABASE.filter(f => f.properties.priceValue <= maxPrice);

          map.current.getSource('properties').setData({
              type: 'FeatureCollection',
              features: filteredFeatures
          });
          
          setTimeout(updateMarkers, 100);
      };

      window.addEventListener('apply-filter-signal', handleFilterSignal);
      return () => window.removeEventListener('apply-filter-signal', handleFilterSignal);
  }, []);

  // 4. ACTUALIZACIÓN DE MARCADORES (CON INYECCIÓN DE DATOS DE INTELIGENCIA)
  const updateMarkers = () => {
      const mapInstance = map.current;
      if (!mapInstance || !mapInstance.getSource('properties')) return;

      const features = mapInstance.querySourceFeatures('properties', {
          filter: ['!', ['has', 'point_count']] 
      });

      const visibleIds = new Set(features.map(f => f.properties.id));

      Object.keys(markersRef.current).forEach((id) => {
          if (!visibleIds.has(Number(id))) {
              markersRef.current[id].remove(); 
              delete markersRef.current[id];   
          }
      });

      features.forEach((feature) => {
          const id = feature.properties.id;
          if (markersRef.current[id]) return; 

          const el = document.createElement('div');
          el.className = 'nanocard-marker';
          
          const root = createRoot(el);
          
         // 🟢 RENDERIZADO DEL SOLDADO (MapNanoCard)
          root.render(
            <MapNanoCard 
               id={id} 
               price={feature.properties.price} 
               priceValue={feature.properties.priceValue}
               type={feature.properties.type} 
               
               // 📸 LÓGICA BLINDADA DE IMAGEN (Busca img, image o usa la de reserva)
               img={feature.properties.img || feature.properties.image || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80"}
               
               lat={feature.geometry.coordinates[1]}
               lng={feature.geometry.coordinates[0]}
               
               // 🔥 DATOS DE INTELIGENCIA
               role={feature.properties.role} 
               description={feature.properties.description}
            />
          );

          const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat(feature.geometry.coordinates)
            .addTo(mapInstance);

          markersRef.current[id] = marker;
      });
  };

  return { mapContainer, map, isMapLoaded: isLoaded };
};

