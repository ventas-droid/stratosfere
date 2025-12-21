// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// 1. IMÁGENES
import { LUXURY_IMAGES } from './ui-panels'; 

// 2. COMPONENTE NANO CARD
import MapNanoCard from './MapNanoCard'; 

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';

// ----------------------------------------------------------------------
// 1. BASE DE DATOS TÁCTICA (AHORA CON ROLES Y DESCIPCIONES REALES)
// ----------------------------------------------------------------------
const FULL_DATABASE = [
    // --- GAMA ALTA (ELITE > 5M) ---
    { 
        type: 'Feature', 
        geometry: { type: 'Point', coordinates: [-3.6883, 40.4280] }, 
        properties: { 
            price: "5.2M€", priceValue: 5200000, type: "PENTHOUSE", id: 1,
            role: "PREMIUM", // <--- ROL AÑADIDO
            description: "Ático triplex con piscina privada en azotea. Seguridad 24h y acceso directo desde ascensor.",
            img: "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80"
        } 
    },
    { 
        type: 'Feature', 
        geometry: { type: 'Point', coordinates: [-3.6850, 40.4200] }, 
        properties: { 
            price: "12.5M€", priceValue: 12500000, type: "ROYAL VILLA", id: 2,
            role: "VIP CLASS",
            description: "Palacete histórico reformado. 8 habitaciones, jardín interior de 500m² y búnker de seguridad.",
            img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
        } 
    },
    { 
        type: 'Feature', 
        geometry: { type: 'Point', coordinates: [-3.6910, 40.4350] }, 
        properties: { 
            price: "8.9M€", priceValue: 8900000, type: "SKY PENTHOUSE", id: 3,
            role: "HIGH CLASS",
            description: "Vistas panorámicas 360º a todo Madrid. Domótica integral y acabados en mármol italiano.",
            img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
        } 
    },
    { 
        type: 'Feature', 
        geometry: { type: 'Point', coordinates: [-3.6900, 40.4260] }, 
        properties: { 
            price: "9.2M€", priceValue: 9200000, type: "MANSION", id: 8,
            role: "EXCLUSIVO",
            description: "Residencia diplomática en el corazón de Salamanca. Privacidad absoluta y garaje para 6 vehículos.",
            img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
        } 
    },
    
    // --- GAMA MEDIA / ALTA (1M - 5M) ---
    { 
        type: 'Feature', 
        geometry: { type: 'Point', coordinates: [-3.6800, 40.4250] }, 
        properties: { 
            price: "3.4M€", priceValue: 3400000, type: "SMART HOME", id: 4,
            role: "MODERNO",
            description: "Vivienda inteligente controlada por voz. Eficiencia energética A+ y diseño minimalista.",
            img: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80"
        } 
    },
    { 
        type: 'Feature', 
        geometry: { type: 'Point', coordinates: [-3.6950, 40.4220] }, 
        properties: { 
            price: "2.1M€", priceValue: 2100000, type: "LOFT", id: 5,
            role: "DISEÑO",
            description: "Antigua fábrica convertida en loft de diseño neoyorquino. Techos de 5 metros.",
            img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80"
        } 
    },
    
    // --- GAMA ACCESIBLE (VIVIENDAS < 1M) ---
    { 
        type: 'Feature', 
        geometry: { type: 'Point', coordinates: [-3.7000, 40.4150] }, 
        properties: { 
            price: "450k€", priceValue: 450000, type: "STUDIO", id: 101,
            role: "ALQUILER",
            description: "Estudio coqueto ideal para singles o inversores. Alta rentabilidad por alquiler.",
            img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
        } 
    },
    { 
        type: 'Feature', 
        geometry: { type: 'Point', coordinates: [-3.7050, 40.4180] }, 
        properties: { 
            price: "680k€", priceValue: 680000, type: "DUPLEX", id: 102,
            role: "FAMILIAR",
            description: "Dúplex luminoso con terraza. Zona tranquila y bien comunicada.",
            img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"
        } 
    },
    { 
        type: 'Feature', 
        geometry: { type: 'Point', coordinates: [-3.6980, 40.4120] }, 
        properties: { 
            price: "320k€", priceValue: 320000, type: "FLAT", id: 103,
            role: "A REFORMAR",
            description: "Piso para reformar a tu gusto. Gran potencial de revalorización tras obra.",
            img: "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80"
        } 
    },
    { 
        type: 'Feature', 
        geometry: { type: 'Point', coordinates: [-3.7100, 40.4200] }, 
        properties: { 
            price: "550k€", priceValue: 550000, type: "LOFT", id: 104,
            role: "OPORTUNIDAD",
            description: "Loft céntrico a precio reducido por urgencia de venta. Oportunidad única.",
            img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
        } 
    },

    // --- OPORTUNIDADES (GARAJES / TRASTEROS / LOCALES < 100k) ---
    { 
        type: 'Feature', 
        geometry: { type: 'Point', coordinates: [-3.6920, 40.4100] }, 
        properties: { 
            price: "20k€", priceValue: 20000, type: "GARAGE", id: 201,
            role: "INVERSIÓN",
            description: "Plaza de garaje amplia en zona de difícil aparcamiento. Rentabilidad 6%.",
            img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80"
        } 
    },
    { 
        type: 'Feature', 
        geometry: { type: 'Point', coordinates: [-3.7120, 40.4250] }, 
        properties: { 
            price: "45k€", priceValue: 45000, type: "LOCAL", id: 202,
            role: "COMERCIAL",
            description: "Pequeño local a pie de calle. Ideal para oficina o pequeño comercio.",
            img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
        } 
    },
    
    // Puntos extra (Clusters)
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6885, 40.4282] }, properties: { price: "4.1M€", priceValue: 4100000, type: "APT", id: 6, role: "LUJO", description: "Apartamento de lujo.", img: "" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6881, 40.4278] }, properties: { price: "6.5M€", priceValue: 6500000, type: "DUPLEX", id: 7, role: "PREMIUM", description: "Duplex premium.", img: "" } },
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

      // CAPAS DE CLUSTERS (CIRCULOS DE AGRUPACIÓN)
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'properties',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': ['step', ['get', 'point_count'], '#3B82F6', 10, '#F59E0B', 50, '#EF4444'],
            'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
            'circle-opacity': 0.9
        }
      });

      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'properties',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        },
        paint: { 'text-color': '#ffffff' }
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
          
          // 🟢 AQUI ES DONDE PASAMOS LOS NUEVOS DATOS A LA NANO CARD
          root.render(
            <MapNanoCard 
               price={feature.properties.price} 
               priceValue={feature.properties.priceValue} // Aseguramos el valor numérico
               type={feature.properties.type} 
               image={feature.properties.img || LUXURY_IMAGES[id % LUXURY_IMAGES.length]}
               id={id} 
               lat={feature.geometry.coordinates[1]}
               lng={feature.geometry.coordinates[0]}
               // 🔥 NUEVOS DATOS INYECTADOS
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

