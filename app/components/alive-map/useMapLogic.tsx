// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { parseOmniSearch, CONTEXT_CONFIG } from './smart-search';
// ✅ RUTA CORRECTA A TUS NANO CARDS
import MapNanoCard from './ui-panels/MapNanoCard'; 

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';

// 📸 GALERÍA STRATOS (Imágenes 4K reales para pruebas visuales)
const IMG = {
  PENTHOUSE: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  VILLA:     "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80",
  MODERN:    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  INTERIOR:  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  LOFT:      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  OFFICE:    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
  COZY:      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
  STUDIO:    "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80",
  LAND:      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
  GARAGE:    "https://images.unsplash.com/photo-1590674899505-1c5c4195c369?auto=format&fit=crop&w=800&q=80"
};

const FULL_DATABASE = [
    // --- GAMA ALTA (AZUL / VIOLETA) ---
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6883, 40.4280] }, 
        properties: { price: "5.2M€", priceValue: 5200000, m2: 450, type: "PENTHOUSE", id: 1, role: "PREMIUM", description: "Ático triplex con piscina.", img: IMG.PENTHOUSE } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6850, 40.4200] }, 
        properties: { price: "12.5M€", priceValue: 12500000, m2: 1200, type: "ROYAL VILLA", id: 2, role: "VIP CLASS", description: "Palacete histórico.", img: IMG.VILLA } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6910, 40.4350] }, 
        properties: { price: "8.9M€", priceValue: 8900000, m2: 600, type: "SKY VIEW", id: 3, role: "HIGH CLASS", description: "Vistas 360º.", img: IMG.MODERN } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6780, 40.4450] }, 
        properties: { price: "3.5M€", priceValue: 3500000, m2: 400, type: "MANSION", id: 10, role: "PRIVADO", description: "Seguridad privada.", img: IMG.INTERIOR } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6900, 40.4260] }, 
        properties: { price: "1.2M€", priceValue: 1200000, m2: 180, type: "PISO LUJO", id: 8, role: "EXCLUSIVO", description: "Salamanca Prime.", img: IMG.COZY } 
    },

    // --- GAMA MEDIA (ROSA / NARANJA) ---
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7050, 40.4180] }, 
        properties: { price: "680k€", priceValue: 680000, m2: 110, type: "DUPLEX", id: 102, role: "FAMILIAR", description: "Luminoso.", img: IMG.LOFT } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7100, 40.4200] }, 
        properties: { price: "550k€", priceValue: 550000, m2: 90, type: "LOFT", id: 104, role: "OPORTUNIDAD", description: "Céntrico.", img: IMG.STUDIO } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6980, 40.4080] }, 
        properties: { price: "720k€", priceValue: 720000, m2: 130, type: "ÁTICO", id: 13, role: "VISTAS", description: "Terraza 40m2.", img: IMG.PENTHOUSE } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6800, 40.4250] }, 
        properties: { price: "340k€", priceValue: 340000, m2: 70, type: "SMART HOME", id: 4, role: "MODERNO", description: "Tecnología.", img: IMG.COZY } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7000, 40.4150] }, 
        properties: { price: "450k€", priceValue: 450000, m2: 45, type: "STUDIO", id: 101, role: "ALQUILER", description: "Ideal inversores.", img: IMG.STUDIO } 
    },

    // --- GAMA ACCESIBLE (AMARILLO / VERDE) ---
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6950, 40.4220] }, 
        properties: { price: "210k€", priceValue: 210000, m2: 50, type: "MINI LOFT", id: 5, role: "DISEÑO", description: "Pequeño pero matón.", img: IMG.LOFT } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7060, 40.4100] }, 
        properties: { price: "180k€", priceValue: 180000, m2: 40, type: "BUHARDILLA", id: 14, role: "BOHEMIO", description: "Con encanto.", img: IMG.COZY } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6920, 40.4100] }, 
        properties: { price: "20k€", priceValue: 20000, m2: 12, type: "GARAGE", id: 201, role: "INVERSIÓN", description: "Plaza amplia.", img: IMG.GARAGE } 
    },
    
    // --- NUEVOS (OFICINAS Y SUELO) ---
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6900, 40.4400] }, 
        properties: { price: "1.5M€", priceValue: 1500000, m2: 300, type: "OFICINA", id: 301, role: "CORPORATE", description: "Sede representativa.", img: IMG.OFFICE } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7500, 40.4500] }, 
        properties: { price: "850k€", priceValue: 850000, m2: 2000, type: "SOLAR", id: 401, role: "DESARROLLO", description: "Licencia directa.", img: IMG.LAND } 
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

   map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [-3.6883, 40.4280],
      zoom: 13, 
      pitch: 65,     // Inclinación inicial
      bearing: -20,  // Rotación inicial
      
      maxPitch: 85,  // <--- AGREGA ESTO: Permite bajar la cámara casi hasta el suelo
      
      attributionControl: false,
      antialias: true,
      projection: 'globe' 
    });

    map.current.on('load', () => {
      console.log("🟢 MAPA 3D: SISTEMAS LISTOS");
      setIsLoaded(true); 

     map.current.addSource('properties', {
  type: 'geojson',
  data: { type: 'FeatureCollection', features: FULL_DATABASE },
  cluster: true,
  clusterMaxZoom: 15, // Aumenta un poco esto para mantener grupos más tiempo
  clusterRadius: 80   // ⚠️ CAMBIO CRÍTICO: De 50 a 80/90 para evitar solapamiento de pills
});

      // 🔵 CAPA CLUSTERS (Glow Effect)
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'properties',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': '#0071e3', 
            'circle-radius': ['step', ['get', 'point_count'], 25, 100, 35, 750, 45],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 1,
            'circle-emissive-strength': 1 
        }
      });

      // ⚪️ CAPA CONTEO
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'properties',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Arial Unicode MS Bold'], 
            'text-size': 16,
            'text-offset': [0, 0]
        },
        paint: { 
            'text-color': '#ffffff',
            'text-emissive-strength': 1 
        }
      });

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

  // ----------------------------------------------------------------------
  // 3. LÓGICA DE FILTRADO (BLINDADA & CONECTADA)
  // ----------------------------------------------------------------------
  useEffect(() => {
      const handleFilterSignal = (e: any) => {
          if (!map.current || !map.current.getSource('properties')) return;
          
          const { priceRange, surfaceRange, context } = e.detail;
          
          // Límites de seguridad locales
          const LIMITS: any = { 'VIVIENDA': 1000, 'NEGOCIO': 2000, 'TERRENO': 10000 };
          
          console.log(`🔍 FILTRANDO: ${context} | €${priceRange.min}-${priceRange.max}`);

          const filteredFeatures = FULL_DATABASE.filter(f => {
              // 1. PRECIO
              const p = f.properties.priceValue;
              if (!p) return false;
              const priceOK = p >= priceRange.min && p <= priceRange.max;
              
              // 2. SUPERFICIE
              const m2 = f.properties.m2 || Math.floor(f.properties.priceValue / 4000);
              const maxLimit = LIMITS[context] || 1000;
              const isMaxSelection = surfaceRange.max >= (maxLimit * 0.95);
              const surfaceOK = m2 >= surfaceRange.min && (isMaxSelection || m2 <= surfaceRange.max);

              // 3. TIPO
              const type = (f.properties.type || "").toUpperCase();
              let typeOK = true;

              if (context === 'NEGOCIO') {
                  typeOK = ['LOCAL', 'OFICINA', 'NAVE', 'EDIFICIO', 'GARAGE', 'TRASTERO'].some(t => type.includes(t));
              } else if (context === 'TERRENO') {
                  typeOK = ['SOLAR', 'TERRENO', 'FINCA', 'PARCELA'].some(t => type.includes(t));
              } else {
                  // VIVIENDA
                  const esNoVivienda = ['LOCAL', 'GARAGE', 'TRASTERO', 'NAVE', 'OFICINA', 'SOLAR', 'TERRENO'].some(t => type.includes(t));
                  typeOK = !esNoVivienda;
              }

              return priceOK && surfaceOK && typeOK;
          });

          // APLICAR
          map.current.getSource('properties').setData({
              type: 'FeatureCollection',
              features: filteredFeatures
          });
          
          setTimeout(updateMarkers, 100);
      };

      window.addEventListener('apply-filter-signal', handleFilterSignal);
      return () => window.removeEventListener('apply-filter-signal', handleFilterSignal);
  }, []);

  // 4. MARCADORES (NANO CARDS)
 // --- PEGAR ESTO EN useMapLogic.tsx (Reemplaza tu función updateMarkers) ---
  const updateMarkers = () => {
      const mapInstance = map.current;
      if (!mapInstance || !mapInstance.getSource('properties')) return;

      const features = mapInstance.querySourceFeatures('properties', {
          filter: ['!', ['has', 'point_count']] 
      });

      // 🔥 LÍNEA NUEVA: ORDENAR DE NORTE A SUR
      // Esto hace que los de abajo (Sur) se pinten al final y queden "encima"
      features.sort((a, b) => b.geometry.coordinates[1] - a.geometry.coordinates[1]);

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
          
          const safeImg = feature.properties.img || IMG.PENTHOUSE;

          root.render(
            <MapNanoCard 
               id={id} 
               price={feature.properties.price} 
               priceValue={feature.properties.priceValue}
               type={feature.properties.type} 
               img={safeImg}
               lat={feature.geometry.coordinates[1]}
               lng={feature.geometry.coordinates[0]}
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
// ... (aquí arriba termina tu updateMarkers) ...

 // ----------------------------------------------------------------------
  // 5. FUNCIÓN DE BÚSQUEDA OMNI V3 (AUTO-ZOOM TÁCTICO)
  // ----------------------------------------------------------------------
  const searchCity = async (rawQuery) => {
    if (!rawQuery || !map.current) return;

    // 1. ANALIZAR COMANDO
    const { location, filters } = parseOmniSearch(rawQuery);
    console.log(`📡 OMNI: Loc="${location}" | Filtros=`, filters);

    // 2. APLICAR FILTROS
    if (filters.priceMax || filters.m2Min || filters.context) {
        const newPriceRange = { min: 0, max: filters.priceMax || 20000000 };
        const newSurfaceRange = { min: filters.m2Min || 0, max: CONTEXT_CONFIG[filters.context || 'VIVIENDA'].maxM2 };
        const newContext = filters.context || 'VIVIENDA';

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('apply-filter-signal', {
                detail: { priceRange: newPriceRange, surfaceRange: newSurfaceRange, context: newContext } 
            }));
        }
    }

    // 3. DECISIÓN DE VUELO
    if (location.length > 2) {
        // CASO A: SI ESCRIBIÓ CIUDAD ("Madrid", "Alicante") -> VOLAMOS ALLÍ
        try {
            const types = 'place,locality,district,neighborhood,address,poi';
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxgl.accessToken}&types=${types}&language=es`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.features?.length > 0) {
                map.current.flyTo({
                    center: data.features[0].center,
                    zoom: 13.5, pitch: 50, bearing: 0, speed: 1.2, essential: true
                });
            }
        } catch (error) { console.error("🚨 Mapbox Error:", error); }
    
    } else {
        // CASO B: SI SOLO DIJO "VILLA 2.5M" (Sin ciudad) -> ZOOM A LOS RESULTADOS
        // Esto evita quedarse en el "sitio anterior" sin ver nada.
        console.log("🔭 MODO AUTO-ENFOQUE: Ajustando cámara a los resultados...");
        
        // Esperamos 500ms a que el filtro se aplique y recalculamos los límites
        setTimeout(() => {
            const features = map.current.querySourceFeatures('properties', {
                 filter: ['!', ['has', 'point_count']] // Solo marcadores visibles (no clusters)
            });

            if (features.length > 0) {
                // Calculamos los límites (Norte, Sur, Este, Oeste) de las casas visibles
                const bounds = new mapboxgl.LngLatBounds();
                features.forEach(f => bounds.extend(f.geometry.coordinates));
                
                map.current.fitBounds(bounds, { padding: 100, pitch: 40, duration: 2000 });
            } else {
                console.warn("⚠️ No hay propiedades con ese precio.");
            }
        }, 500);
    }
  };

// ----------------------------------------------------------------------
  // 📻 7. RECEPTOR DE NUEVAS PROPIEDADES (USER GENERATED CONTENT)
  // ----------------------------------------------------------------------
  useEffect(() => {
    const handleNewProperty = async (event: any) => {
        const formData = event.detail; // Los datos que vienen del formulario
        if (!map.current || !formData) return;

        console.log("📦 Recibiendo nueva propiedad:", formData);

        // A. BUSCAR COORDENADAS (Geocoding de la dirección del usuario)
        let coords = [-3.6883, 40.4280]; // Defecto: Madrid
        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(formData.address)}.json?access_token=${mapboxgl.accessToken}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.features?.[0]) {
                coords = data.features[0].center;
            }
        } catch (e) { console.error("Error geolocalizando usuario:", e); }

        // B. CREAR EL OBJETO GEOJSON (LA NANOCARD)
        const newFeature = {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: coords },
            properties: {
                id: Date.now(), // ID único basado en la hora
                type: formData.type || 'Piso', // El tipo que eligió (Ático, Local...)
                
                // DATOS CLAVE
                price: `${formData.price}€`,
                priceValue: parseInt(formData.price || '0'),
                m2: parseInt(formData.mBuilt || '0'),
                
                // 🔥 LA NARRATIVA (LO NUEVO)
                title: formData.title || `Oportunidad en ${formData.address}`,
                description: formData.description || "Propiedad exclusiva recién listada en el mercado.",
                
                // Metadatos visuales
                role: "NUEVO",
                img: 'https://images.unsplash.com/photo-1600596542815-60c37c6525fa?q=80&w=800&auto=format&fit=crop' // Foto por defecto (luego usaremos las suyas)
            }
        };

        // C. INYECTAR EN EL MAPA SIN RECARGAR
        const source: any = map.current.getSource('properties');
        if (source && source._data) {
            const currentFeatures = source._data.features;
            // Añadimos la nueva al array
            const newFeatures = [...currentFeatures, newFeature];
            // Actualizamos el mapa
            source.setData({ type: 'FeatureCollection', features: newFeatures });
            
            // D. VOLAR AL OBJETIVO ✈️
            map.current.flyTo({ center: coords, zoom: 16, pitch: 60, essential: true });
            
            console.log("✅ Propiedad inyectada en el mapa con éxito.");
        }
    };

    // Activamos la escucha
    window.addEventListener('add-property-signal', handleNewProperty);
    // Limpiamos al salir
    return () => window.removeEventListener('add-property-signal', handleNewProperty);
  }, [map]);

  // ----------------------------------------------------------------------
  // 6. SALIDA FINAL DEL SISTEMA (RETURN)
  // ----------------------------------------------------------------------
  // Esto devuelve las herramientas para que AliveMap las pueda usar.
  return { 
    mapContainer, 
    map, 
    isMapLoaded: isLoaded, 
    searchCity 
  };

}; // <--- ESTA LLAVE FINAL ES LA QUE FALTABA (Cierra useMapLogic)

