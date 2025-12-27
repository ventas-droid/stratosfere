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
        properties: { 
            price: "5.2M€", priceValue: 5200000, m2: 450, type: "PENTHOUSE", id: 1, role: "PREMIUM", 
            description: "Ático triplex con piscina privada y vistas al skyline.", img: IMG.PENTHOUSE,
            energyConsumption: 'A', energyEmissions: 'A' // 🔥 AÑADIDO
        } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6850, 40.4200] }, 
        properties: { 
            price: "12.5M€", priceValue: 12500000, m2: 1200, type: "ROYAL VILLA", id: 2, role: "VIP CLASS", 
            description: "Palacete histórico reformado integralmente.", img: IMG.VILLA,
            energyConsumption: 'C', energyEmissions: 'C' // 🔥 AÑADIDO
        } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6910, 40.4350] }, 
        properties: { 
            price: "8.9M€", priceValue: 8900000, m2: 600, type: "SKY VIEW", id: 3, role: "HIGH CLASS", 
            description: "Vistas 360º en plena milla de oro.", img: IMG.MODERN,
            energyConsumption: 'B', energyEmissions: 'A' 
        } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6780, 40.4450] }, 
        properties: { 
            price: "3.5M€", priceValue: 3500000, m2: 400, type: "MANSION", id: 10, role: "PRIVADO", 
            description: "Seguridad privada 24h.", img: IMG.INTERIOR,
            energyConsumption: 'D', energyEmissions: 'D'
        } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6900, 40.4260] }, 
        properties: { 
            price: "1.2M€", priceValue: 1200000, m2: 180, type: "PISO LUJO", id: 8, role: "EXCLUSIVO", 
            description: "Salamanca Prime, techos altos.", img: IMG.COZY,
            energyConsumption: 'E', energyEmissions: 'E'
        } 
    },

    // --- GAMA MEDIA (ROSA / NARANJA) ---
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7050, 40.4180] }, 
        properties: { 
            price: "680k€", priceValue: 680000, m2: 110, type: "DUPLEX", id: 102, role: "FAMILIAR", 
            description: "Luminoso y bien comunicado.", img: IMG.LOFT,
            energyConsumption: 'C', energyEmissions: 'D'
        } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7100, 40.4200] }, 
        properties: { 
            price: "550k€", priceValue: 550000, m2: 90, type: "LOFT", id: 104, role: "OPORTUNIDAD", 
            description: "Céntrico, ideal parejas.", img: IMG.STUDIO,
            energyPending: true // 🔥 EJEMPLO: EN TRÁMITE
        } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6980, 40.4080] }, 
        properties: { 
            price: "720k€", priceValue: 720000, m2: 130, type: "ÁTICO", id: 13, role: "VISTAS", 
            description: "Terraza 40m2 espectacular.", img: IMG.PENTHOUSE,
            energyConsumption: 'G', energyEmissions: 'F'
        } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6800, 40.4250] }, 
        properties: { 
            price: "340k€", priceValue: 340000, m2: 70, type: "SMART HOME", id: 4, role: "MODERNO", 
            description: "Domótica completa incluida.", img: IMG.COZY,
            energyConsumption: 'A', energyEmissions: 'A'
        } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7000, 40.4150] }, 
        properties: { 
            price: "450k€", priceValue: 450000, m2: 45, type: "STUDIO", id: 101, role: "ALQUILER", 
            description: "Ideal inversores, alta rentabilidad.", img: IMG.STUDIO,
            energyConsumption: 'E', energyEmissions: 'E'
        } 
    },

    // --- GAMA ACCESIBLE (AMARILLO / VERDE) ---
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6950, 40.4220] }, 
        properties: { 
            price: "210k€", priceValue: 210000, m2: 50, type: "MINI LOFT", id: 5, role: "DISEÑO", 
            description: "Pequeño pero matón.", img: IMG.LOFT,
            energyConsumption: 'F', energyEmissions: 'G'
        } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7060, 40.4100] }, 
        properties: { 
            price: "180k€", priceValue: 180000, m2: 40, type: "BUHARDILLA", id: 14, role: "BOHEMIO", 
            description: "Con encanto y vigas vistas.", img: IMG.COZY,
            energyPending: true
        } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6920, 40.4100] }, 
        properties: { 
            price: "20k€", priceValue: 20000, m2: 12, type: "GARAGE", id: 201, role: "INVERSIÓN", 
            description: "Plaza amplia para coche grande.", img: IMG.GARAGE 
        } 
    },
    
    // --- NUEVOS (OFICINAS Y SUELO) ---
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.6900, 40.4400] }, 
        properties: { 
            price: "1.5M€", priceValue: 1500000, m2: 300, type: "OFICINA", id: 301, role: "CORPORATE", 
            description: "Sede representativa.", img: IMG.OFFICE,
            energyConsumption: 'C', energyEmissions: 'C'
        } 
    },
    { 
        type: 'Feature', geometry: { type: 'Point', coordinates: [-3.7500, 40.4500] }, 
        properties: { 
            price: "850k€", priceValue: 850000, m2: 2000, type: "SOLAR", id: 401, role: "DESARROLLO", 
            description: "Licencia directa para construir.", img: IMG.LAND 
        } 
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

    // 1. CREAR EL MAPA (CORREGIDO: SOLO UNA VEZ)
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

    // 🔥 INSTALAR BRÚJULA EN ESQUINA INFERIOR IZQUIERDA (LIBRE DE OBSTÁCULOS)
    map.current.addControl(
        new mapboxgl.NavigationControl({ 
            showCompass: true, 
            showZoom: true, 
            visualizePitch: true 
        }), 
        'bottom-left' // <--- CAMBIO TÁCTICO: ABAJO A LA IZQUIERDA
    );

    map.current.on('load', () => {
      console.log("🟢 MAPA 3D: SISTEMAS LISTOS");
      setIsLoaded(true);

      // 🔥 1. RADAR DE MEMORIA: Leemos el disco duro
      let userAssets = [];
      try {
          const saved = localStorage.getItem('stratos_my_properties');
          if (saved) {
              const parsed = JSON.parse(saved);
              // Convertimos sus datos guardados al formato del mapa (GeoJSON)
              userAssets = parsed.map(p => ({
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: p.coordinates || [-3.6883, 40.4280] },
                  properties: {
                      ...p,
                      priceValue: p.rawPrice || 0, // Aseguramos compatibilidad numérica
                      role: 'PROPIETARIO',         // Rol especial
                      type: p.type || 'Propiedad'
                  }
              }));
              console.log(`📡 RADAR: Detectados ${userAssets.length} activos propios.`);
          }
      } catch (e) { console.error("Error leyendo radar:", e); }

      // 🔥 2. FUSIÓN DE DATOS: Base de datos + Sus activos
      const combinedData = [...FULL_DATABASE, ...userAssets];

      map.current.addSource('properties', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: combinedData }, // Usamos la combinada
        cluster: true,
        clusterMaxZoom: 15,
        clusterRadius: 80 
      });

      // ... (El resto de addLayer, clusters, etc. sigue igual debajo) ...

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
  // 3. LÓGICA DE FILTRADO (BLINDADA: BASE DE DATOS + SUS ACTIVOS)
  // ----------------------------------------------------------------------
  useEffect(() => {
      const handleFilterSignal = (e: any) => {
          if (!map.current || !map.current.getSource('properties')) return;
          
          const { priceRange, surfaceRange, context } = e.detail;
          const LIMITS: any = { 'VIVIENDA': 1000, 'NEGOCIO': 2000, 'TERRENO': 10000 };
          
          console.log(`🔍 FILTRANDO: ${context} | €${priceRange.min}-${priceRange.max}`);

          // 🔥 PASO 1: RECUPERAR SUS ACTIVOS DEL DISCO DURO (Para no perderlos al filtrar)
          let userAssets: any[] = [];
          try {
              const saved = localStorage.getItem('stratos_my_properties');
              if (saved) {
                  const parsed = JSON.parse(saved);
                  // Convertimos al formato GeoJSON del mapa
                  userAssets = parsed.map((p: any) => ({
                      type: 'Feature',
                      geometry: { type: 'Point', coordinates: p.coordinates || [-3.6883, 40.4280] },
                      properties: {
                          ...p,
                          priceValue: p.rawPrice || 0, 
                          type: p.type || 'Propiedad'
                      }
                  }));
              }
          } catch (err) { console.error(err); }

          // 🔥 PASO 2: FUSIONAR TODO (Base de Datos + Sus Activos)
          const allData = [...FULL_DATABASE, ...userAssets];

          // PASO 3: FILTRAR SOBRE LA LISTA COMPLETA
          const filteredFeatures = allData.filter(f => {
              // 1. PRECIO
              const p = f.properties.priceValue;
              if (!p) return false;
              const priceOK = p >= priceRange.min && p <= priceRange.max;
              
              // 2. SUPERFICIE
              const m2 = f.properties.m2 || Math.floor(f.properties.priceValue / 4000); // Fallback si no hay m2
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
                  // VIVIENDA (Por descarte)
                  const esNoVivienda = ['LOCAL', 'GARAGE', 'TRASTERO', 'NAVE', 'OFICINA', 'SOLAR', 'TERRENO'].some(t => type.includes(t));
                  typeOK = !esNoVivienda;
              }

              return priceOK && surfaceOK && typeOK;
          });

          // APLICAR RESULTADOS
          map.current.getSource('properties').setData({
              type: 'FeatureCollection',
              features: filteredFeatures
          });
          
          setTimeout(updateMarkers, 100);
      };

      window.addEventListener('apply-filter-signal', handleFilterSignal);
      return () => window.removeEventListener('apply-filter-signal', handleFilterSignal);
  }, []);

  // ----------------------------------------------------------------------
  // 🎧 4. SISTEMA DE TELETRANSPORTE (ESCUCHAR ORDEN DE VUELO DEL PERFIL)
  // ----------------------------------------------------------------------
  useEffect(() => {
      const handleFlyTo = (e: any) => {
          if (!map.current) return;
          const { center, zoom, pitch } = e.detail;
          
          console.log("✈️ RECIBIDA ORDEN DE VUELO:", center);
          
          map.current.flyTo({
              center: center,
              zoom: zoom || 18,
              pitch: pitch || 60,
              bearing: -20,
              duration: 3000,
              essential: true
          });
      };

      window.addEventListener('fly-to-location', handleFlyTo);
      return () => window.removeEventListener('fly-to-location', handleFlyTo);
  }, []);


  // ----------------------------------------------------------------------
  // E. PINTOR DE MARCADORES (UPDATE MARKERS) - VERSIÓN CORREGIDA
  // ----------------------------------------------------------------------
  const updateMarkers = () => {
      const mapInstance = map.current;
      if (!mapInstance || !mapInstance.getSource('properties')) return;

      // 1. Obtener características visibles que NO son clusters
      const features = mapInstance.querySourceFeatures('properties', {
          filter: ['!', ['has', 'point_count']] 
      });

      // 2. Ordenar para que los de abajo (Sur) queden por encima visualmente
      features.sort((a, b) => b.geometry.coordinates[1] - a.geometry.coordinates[1]);

      const visibleIds = new Set(features.map(f => f.properties.id));

      // 3. Limpiar marcadores que ya no se ven
      Object.keys(markersRef.current).forEach((id) => {
          if (!visibleIds.has(Number(id))) {
              markersRef.current[id].remove(); 
              delete markersRef.current[id];   
          }
      });

      // 4. Crear o Actualizar Marcadores Nuevos
      features.forEach((feature) => {
          const id = feature.properties.id;
          if (markersRef.current[id]) return; // Si ya existe, no hacer nada

          const el = document.createElement('div');
          el.className = 'nanocard-marker';
          
          const root = createRoot(el);
          const p = feature.properties;
          const safeImg = p.img || p.image || IMG.PENTHOUSE;

          // 🔥 AQUÍ ESTÁ LA CORRECCIÓN CLAVE
          // Nos aseguramos de pasar TODAS las variantes posibles de ubicación
          // para que la tarjeta encuentre alguna válida.
          root.render(
            <MapNanoCard 
               id={id} 
               // PRECIOS
               price={p.price} 
               priceValue={p.priceValue}
               rawPrice={p.priceValue} 
               
               // DATOS VISUALES
               type={p.type} 
               img={safeImg}
               lat={feature.geometry.coordinates[1]}
               lng={feature.geometry.coordinates[0]}
               
               // DATOS DE TEXTO
               role={p.role} 
               description={p.description}
               title={p.title}
               
               // 📍 UBICACIÓN (EL BLINDAJE)
               address={p.address || p.location} // Probamos ambos
               city={p.city || p.location}       // Probamos ambos
               location={p.location || p.city || p.address} // Red de seguridad
               
               // ENERGÍA
               energyConsumption={p.energyConsumption}
               energyEmissions={p.energyEmissions}
               energyPending={p.energyPending}
            />
          );

          const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat(feature.geometry.coordinates)
            .addTo(mapInstance);

          markersRef.current[id] = marker;
      });
  };

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
  // 📻 7. RECEPTOR DE NUEVAS PROPIEDADES (CON DISPERSIÓN ANTI-SOLAPAMIENTO)
  // ----------------------------------------------------------------------
  useEffect(() => {
    const handleNewProperty = async (event: any) => {
        const formData = event.detail; 
        if (!map.current || !formData) return;

        console.log("📦 Recibiendo nueva propiedad:", formData);

        // A. BUSCAR COORDENADAS BASE (Geocoding)
        let baseCoords = [-3.6883, 40.4280]; 
        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(formData.address)}.json?access_token=${mapboxgl.accessToken}&country=es`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.features?.[0]) {
                baseCoords = data.features[0].center;
                console.log("📍 Coordenadas detectadas (Base):", baseCoords);
            }
        } catch (e) { console.error("Error geolocalizando:", e); }

        // 🔥 B. APLICAR DISPERSIÓN (JITTER)
        // Generamos un desplazamiento aleatorio minúsculo (±0.0002 grados ~ 20 metros)
        // Esto evita que dos pisos en el mismo edificio se tapen.
        const jitter = () => (Math.random() - 0.5) * 0.0004; 
        
        const finalCoords = [
            baseCoords[0] + jitter(), // Longitud con ruido
            baseCoords[1] + jitter()  // Latitud con ruido
        ];

        // C. CREAR EL OBJETO GEOJSON
        const newFeature = {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: finalCoords }, // <--- USAMOS LAS COORDENADAS DISPERSAS
            properties: {
                id: formData.id || Date.now(), 
                type: formData.type || 'Piso', 
                
                // DATOS ECONÓMICOS
                price: `${formData.price}€`, 
                priceValue: parseInt((formData.price || '0').replace(/\./g, '')), 
                m2: parseInt(formData.mBuilt || '0'),
                communityFees: formData.communityFees,

                // DATOS DE ENERGÍA
                energyConsumption: formData.energyConsumption,
                energyEmissions: formData.energyEmissions,
                energyPending: formData.energyPending,
                
                // UBICACIÓN REAL (GUARDAMOS LA DEL FORMULARIO)
                address: formData.address,     // <--- IMPORTANTE
                city: formData.city,           // <--- IMPORTANTE
                location: formData.location,   // <--- IMPORTANTE (PARA QUE NO DIGA MADRID)

                // NARRATIVA & VISUAL
                title: formData.title || `Oportunidad en ${formData.address}`,
                description: formData.description || "Propiedad exclusiva.",
                role: "PROPIETARIO",
                img: formData.photos && formData.photos.length > 0 ? formData.photos[0] : IMG.PENTHOUSE
            }
        };

        // D. INYECTAR EN EL MAPA
        const source: any = map.current.getSource('properties');
        if (source && source._data) {
            const currentFeatures = source._data.features;
            const newFeatures = [...currentFeatures, newFeature];
            source.setData({ type: 'FeatureCollection', features: newFeatures });
            
            // E. VOLAR AL OBJETIVO
            map.current.flyTo({ center: finalCoords, zoom: 17, pitch: 60, essential: true });
        }
    };

    window.addEventListener('add-property-signal', handleNewProperty);
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

