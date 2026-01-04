// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { parseOmniSearch, CONTEXT_CONFIG } from './smart-search';
import MapNanoCard from './ui-panels/MapNanoCard';

// 🔥 1. IMPORTAMOS LA NUEVA BASE DE DATOS MAESTRA
// import { STRATOS_PROPERTIES, IMAGES } from './stratos-db';
const STRATOS_PROPERTIES : any[] = [];
const IMAGES : any[] = [];

import { getPropertiesAction } from '@/app/actions';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';

// ✅ Helper universal: true / "true" / 1 / "1" / "sí" / "si" / "yes" / "on"
const isYes = (val: any) => {
  if (val === true || val === 1) return true;
  if (val === false || val === 0) return false;
  if (val === null || val === undefined) return false;
  const s = String(val).toLowerCase().trim();
  return ['true', '1', 'yes', 'si', 'sí', 'on'].includes(s);
};

// ----------------------------------------------------------------------
// 2. LÓGICA DEL MAPA (CEREBRO CENTRAL)
// ----------------------------------------------------------------------
export const useMapLogic = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef({});

  // --------------------------------------------------------------------
  // A. INICIALIZACIÓN DEL MAPA
  // --------------------------------------------------------------------
  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [-3.6883, 40.4280], // Madrid Base
      zoom: 13,
      pitch: 65,
      bearing: -20,
      maxPitch: 85,
      attributionControl: false,
      antialias: true,
      projection: 'globe'
    });

    // Controles de Navegación (Abajo Izquierda)
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }),
      'bottom-left'
    );

    map.current.on('load', () => {
      console.log("🟢 MAPA 3D: SISTEMAS LISTOS");
      setIsLoaded(true);

      // =================================================================
      // 🔥 FUSIÓN NUCLEAR DE DATOS (Master DB + LocalStorage)
      // =================================================================

      // 1. PREPARAR EJÉRCITO REGULAR (Stratos DB)
      const masterFeatures = STRATOS_PROPERTIES.map(p => {
       
        // Convertir 'specs' {pool:true} -> array ['pool']
        const servicesFromArray = p.specs
          ? Object.keys(p.specs).filter((k: any) => (p.specs as any)[k])
          : [];

        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: p.coordinates },
          properties: {
            ...p,
            id: p.id,
            priceValue: Number(p.price),

            // 🔥 NORMALIZACIONES CLAVE
            m2: Number(p.mBuilt),
            mBuilt: Number(p.mBuilt),

            // ✅ ASCENSOR BLINDADO (Master DB)
            elevator: isYes(p?.specs?.elevator) || isYes((p as any).elevator) || isYes((p as any).ascensor),

            img: p.images?.[0],
            selectedServices: servicesFromArray
          }
        };
      });

      // 2. PREPARAR EJÉRCITO DE RESERVA (Sus propiedades manuales)
      let userFeatures: any[] = [];
      try {
        const saved = localStorage.getItem('stratos_my_properties');
        if (saved) {
          const parsed = JSON.parse(saved);

          userFeatures = parsed.map((p: any) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: p.coordinates || [-3.6883, 40.4280]
            },
            properties: {
              // 1. PASAMOS TODO EL EQUIPO BASE
              ...p,

              // 2. NORMALIZACIÓN DE IDENTIDAD
              id: p.id || Date.now(),
              role: p.role || 'PROPIETARIO',
              type: p.type || 'Propiedad',

              // 3. BLINDAJE DE PRECIO (Asegura número)
              priceValue: Number(p.rawPrice || p.priceValue || p.price || 0),

              // 4. BLINDAJE DE METROS (Doble llave: m2 y mBuilt)
              m2: Number(p.mBuilt || p.m2 || 0),
              mBuilt: Number(p.mBuilt || p.m2 || 0),

              // ✅ 5. BLINDAJE ASCENSOR (acepta "Sí/Si/true/1")
              elevator: (
                isYes(p.elevator) ||
                isYes(p.ascensor) ||
                isYes(p.hasElevator) ||
                isYes(p?.specs?.elevator)
              ),

              // 6. BLINDAJE DE SERVICIOS
              selectedServices: Array.isArray(p.selectedServices) ? p.selectedServices : [],

             // 7. IMAGEN SEGURA (VERSIÓN REALISTA)
              // Si hay foto, la usamos. Si no, NULL.
              img: (p.images && p.images.length > 0)
                ? p.images[0]
                : null
            }
          }));

          console.log(`📡 RADAR: Detectados ${userFeatures.length} activos propios.`);
        }
      } catch (e) {
        console.error("Error leyendo radar:", e);
      }

      // 4. CARGA AL MAPA
      if (map.current.getSource('properties')) {
        (map.current.getSource('properties') as any).setData({
          type: 'FeatureCollection',
          features: [] // <--- 🔥 PONGA ESTO VACÍO (features: [])
        });
      } else {
        map.current.addSource('properties', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }, // <--- 🔥 AQUÍ TAMBIÉN VACÍO
          cluster: true,
          clusterMaxZoom: 15,
          clusterRadius: 80
        });
      }

      // --- CAPAS VISUALES (CLUSTERS Y CONTEO) ---
      if (!map.current.getLayer('clusters')) {
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
      }

      if (!map.current.getLayer('cluster-count')) {
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
          paint: { 'text-color': '#ffffff', 'text-emissive-strength': 1 }
        });
      }

      // Eventos de Cluster
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

     map.current.on('moveend', () => updateMarkers());


      updateMarkers();
    });
  }, []);

  // ----------------------------------------------------------------------
  // 3. LÓGICA DE FILTRADO INTELIGENTE V2
  // ----------------------------------------------------------------------
  useEffect(() => {
    const handleFilterSignal = (e: any) => {
      if (!map.current || !map.current.getSource('properties')) return;

      const { priceRange, surfaceRange, context, specs, specificType } = e.detail;

      const LIMITS: any = { 'VIVIENDA': 1000, 'NEGOCIO': 2000, 'TERRENO': 10000 };

      console.log(`🔍 FILTRANDO AVANZADO:`, { priceRange, context, specs, specificType });

      // 1. RECONSTRUIR EJÉRCITO (Master + Local) PARA FILTRAR
      // ✅ AQUÍ estaba el enemigo: se reconstruía y se perdían elevator/specs/selectedServices
      const masterFeatures = STRATOS_PROPERTIES.map(p => {
        const servicesFromArray = p.specs
          ? Object.keys(p.specs).filter((k: any) => (p.specs as any)[k])
          : [];

        return ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: p.coordinates },
          properties: {
            ...p,
            id: p.id,
            priceValue: Number(p.price),
            m2: Number(p.mBuilt),
            mBuilt: Number(p.mBuilt),
            img: p.images?.[0],
            selectedServices: servicesFromArray,
            elevator: isYes(p?.specs?.elevator) || isYes((p as any).elevator) || isYes((p as any).ascensor)
          }
        });
      });

      let userFeatures: any[] = [];
      try {
        const saved = localStorage.getItem('stratos_my_properties');
        if (saved) {
          const parsed = JSON.parse(saved);
          userFeatures = parsed.map((p: any) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: p.coordinates || [-3.6883, 40.4280] },
            properties: {
              ...p,
            id: p.id || Date.now(),
              role: p.role || 'PROPIETARIO',
              type: p.type || 'Propiedad',
              priceValue: Number(p.rawPrice || p.priceValue || p.price || 0),
              m2: Number(p.mBuilt || p.m2 || 0),
              mBuilt: Number(p.mBuilt || p.m2 || 0),
              // CORRECCIÓN: Si no hay foto, ponemos NULL. Prohibido inventar.
              img: (p.images && p.images.length > 0)
                ? p.images[0]
                : (p.img || null),
              selectedServices: Array.isArray(p.selectedServices) ? p.selectedServices : [],
              specs: p.specs || {},

              // ✅ Ascensor blindado (acepta "Sí")
              elevator: (
                isYes(p.elevator) ||
                isYes(p.ascensor) ||
                isYes(p.hasElevator) ||
                isYes(p?.specs?.elevator)
              )
            }
          }));
        }
      } catch (err) { console.error(err); }

      const allData = [...masterFeatures, ...userFeatures];

      // 2. APLICAR LÓGICA DE FILTRADO
      const filteredFeatures = allData.filter(f => {
        const p = f.properties;

        // A. Precio
        if (p.priceValue < priceRange.min || p.priceValue > priceRange.max) return false;

        // B. Superficie
        const m2 = p.m2 || Math.floor(p.priceValue / 4000);
        if (m2 < (surfaceRange?.min || 0) || m2 > (surfaceRange?.max || 10000)) return false;

        // C. Especificaciones (Habitaciones / Baños)
        if (specs) {
          if (specs.beds > 0 && (p.rooms || 0) < specs.beds) return false;
          if (specs.baths > 0 && (p.baths || 0) < specs.baths) return false;

          // D. Extras (Piscina, Garaje...)
          if (specs.features && specs.features.length > 0) {
            const searchText = JSON.stringify(p).toUpperCase();
            const hasAllFeatures = specs.features.every((feat: string) => {
              if (feat === 'pool') return searchText.includes('PISCINA') || searchText.includes('POOL');
              if (feat === 'garage') return searchText.includes('GARAJE') || searchText.includes('PARKING');
              if (feat === 'garden') return searchText.includes('JARDÍN') || searchText.includes('GARDEN');
              if (feat === 'security') return searchText.includes('SEGURIDAD') || searchText.includes('VIGILANCIA');
              return true;
            });
            if (!hasAllFeatures) return false;
          }
        }

        // -------------------------------------------------------------
        // E. FILTRO DE TIPO (QUIRÚRGICO) 🔪
        // -------------------------------------------------------------
        const pType = (p.type || "").toUpperCase();
        const targetType = (specificType || "").toUpperCase();

        if (targetType && targetType !== 'ALL' && targetType !== 'TODOS') {
          if (!pType.includes(targetType)) return false;
        } else {
          let typeOK = true;
          if (context === 'NEGOCIO') {
            typeOK = ['LOCAL', 'OFICINA', 'NAVE', 'EDIFICIO', 'GARAGE', 'TRASTERO'].some(t => pType.includes(t));
          } else if (context === 'TERRENO') {
            typeOK = ['SOLAR', 'TERRENO', 'FINCA', 'PARCELA'].some(t => pType.includes(t));
          } else {
            const esNoVivienda = ['LOCAL', 'GARAGE', 'TRASTERO', 'NAVE', 'OFICINA', 'SOLAR', 'TERRENO'].some(t => pType.includes(t));
            typeOK = !esNoVivienda;
          }
          if (!typeOK) return false;
        }

        return true;
      });

      // 3. ACTUALIZAR MAPA
      Object.values(markersRef.current).forEach((marker: any) => marker.remove());
      markersRef.current = {};

      const source: any = map.current.getSource('properties');
      if (source) {
        source.setData({ type: 'FeatureCollection', features: filteredFeatures });
      }

      map.current.once('idle', () => {
        console.log(`✅ Filtro aplicado: ${filteredFeatures.length} activos encontrados.`);
        updateMarkers();
      });
    };

    window.addEventListener('apply-filter-signal', handleFilterSignal);
    return () => window.removeEventListener('apply-filter-signal', handleFilterSignal);
  }, []);

  // --------------------------------------------------------------------
  // C. SISTEMA DE TELETRANSPORTE
  // --------------------------------------------------------------------
  useEffect(() => {
    const handleFlyTo = (e: any) => {
      if (!map.current) return;
      const { center, zoom, pitch } = e.detail;
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

  // --------------------------------------------------------------------
  // D. PINTOR DE MARCADORES (UPDATE MARKERS)
  // --------------------------------------------------------------------
 const updateMarkers = () => {
  const mapInstance = map.current;
  if (!mapInstance || !mapInstance.getSource("properties")) return;

  const features = mapInstance.querySourceFeatures("properties", {
    filter: ["!", ["has", "point_count"]],
  });

  // Ordenar visualmente (Sur primero)
  features.sort((a: any, b: any) => b.geometry.coordinates[1] - a.geometry.coordinates[1]);

  // ✅ IDs SIEMPRE como string (clave anti-parpadeo)
  const visibleIds = new Set(features.map((f: any) => String(f.properties.id)));

  // Limpiar viejos (comparación string-string)
  Object.keys(markersRef.current).forEach((id) => {
    if (!visibleIds.has(id)) {
      markersRef.current[id].remove();
      delete markersRef.current[id];
    }
  });

  // Pintar nuevos
  features.forEach((feature: any) => {
    const id = String(feature.properties.id);
    if (markersRef.current[id]) return;

    const el = document.createElement("div");
    el.className = "nanocard-marker";

    const root = createRoot(el);
    const p = feature.properties;

    const safeImg =
      p.img ||
      (Array.isArray(p.images) && p.images.length ? p.images[0] : undefined) ||
      undefined;

    root.render(
      <MapNanoCard
        id={id}
        price={p.price}
        priceValue={p.priceValue}
        rawPrice={p.priceValue}
        rooms={p.rooms}
        baths={p.baths}
        mBuilt={p.m2}
        selectedServices={p.selectedServices}
        elevator={p.elevator}
        specs={p.specs}
        type={p.type}
        img={safeImg}
        lat={feature.geometry.coordinates[1]}
        lng={feature.geometry.coordinates[0]}
        role={p.role}
        title={p.title}
        description={p.description}
        address={p.address || p.location}
        city={p.city || p.location}
        location={p.location || p.city || p.address}
        energyConsumption={p.energyConsumption}
        energyEmissions={p.energyEmissions}
        energyPending={p.energyPending}
      />
    );

    const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
      .setLngLat(feature.geometry.coordinates)
      .addTo(mapInstance);

    markersRef.current[id] = marker;
  });
};


  // --------------------------------------------------------------------
  // E. BÚSQUEDA OMNI V3 (AUTO-ZOOM) - 🇪🇸 SOLO ESPAÑA 🇪🇸
  // --------------------------------------------------------------------
  const searchCity = async (rawQuery: any) => {
    if (!rawQuery || !map.current) return;

    const { location, filters } = parseOmniSearch(rawQuery);
    console.log(`📡 OMNI: Loc="${location}" | Filtros=`, filters);

    // Decisión de Vuelo / Auto-Zoom
    if (location.length > 2) {
      try {
        const types = 'place,locality,district,neighborhood,address,poi';
        
        // 🔥 CORRECCIÓN TÁCTICA: AÑADIDO '&country=es' PARA EVITAR IR A OHIO
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxgl.accessToken}&country=es&types=${types}&language=es`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.features?.length > 0) {
          // Vuelo directo al objetivo español
          map.current.flyTo({
            center: data.features[0].center,
            zoom: 13.5,
            pitch: 50,
            bearing: 0,
            speed: 1.2,
            essential: true
          });
        }
      } catch (error) {
        console.error("🚨 Mapbox Error:", error);
      }
    } else {
      // Modo Auto-Enfoque a los resultados locales
      console.log("🔭 MODO AUTO-ENFOQUE...");
      setTimeout(() => {
        const features = map.current.querySourceFeatures('properties', {
          filter: ['!', ['has', 'point_count']]
        });

        if (features.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          features.forEach((f: any) => bounds.extend(f.geometry.coordinates));
          map.current.fitBounds(bounds, { padding: 100, pitch: 40, duration: 2000 });
        }
      }, 500);
    }
  };
  // --------------------------------------------------------------------
  // F. RECEPTOR DE NUEVAS PROPIEDADES (ADD PROPERTY) - VERSIÓN BLINDADA
  // --------------------------------------------------------------------
  useEffect(() => {
    const handleNewProperty = async (event: any) => {
      const formData = event.detail;
      if (!map.current || !formData) return;

      console.log("📦 MAP LOGIC: Recibiendo nueva propiedad:", formData);

      // 1. CÁLCULO DE COORDENADAS
      let baseCoords = [-3.6883, 40.4280];
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(formData.address)}.json?access_token=${mapboxgl.accessToken}&country=es`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.features?.[0]) baseCoords = data.features[0].center;
      } catch (e) {
        console.error("Error Geo:", e);
      }

      const jitter = () => (Math.random() - 0.5) * 0.0004;
      const finalCoords = [baseCoords[0] + jitter(), baseCoords[1] + jitter()];

      // 2. CREACIÓN DEL FEATURE (CON ASCENSOR Y SERVICIOS)
      const newFeature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: finalCoords },
        properties: {
          ...formData,

          id: formData.id || Date.now(),
          type: formData.type || 'Piso',

          // Datos Numéricos
          price: `${formData.price}€`,
          priceValue: parseInt((formData.price || '0').toString().replace(/\D/g, '')),
          m2: parseInt(formData.mBuilt || '0'),
          rooms: Number(formData.rooms || 0),
          baths: Number(formData.baths || 0),

          // ✅ CRÍTICOS (BLINDADOS)
          elevator: isYes(formData.elevator),
          selectedServices: Array.isArray(formData.selectedServices) ? formData.selectedServices : [],
          specs: formData.specs || {},

          // Texto / ubicación
          address: formData.address,
          city: formData.city,
          location: formData.location,
          title: formData.title || `Oportunidad en ${formData.address}`,
          description: formData.description || "Propiedad exclusiva.",
          role: "PROPIETARIO",

         // Imagen (LIMPIEZA TOTAL)
          img: (formData.images && formData.images.length > 0)
            ? formData.images[0]
            : null,

          // Energía
          energyConsumption: formData.energyConsumption,
          energyEmissions: formData.energyEmissions,
          energyPending: formData.energyPending,
        }
      };

      // 3. INYECCIÓN EN EL MAPA
      const source: any = map.current.getSource('properties');
      if (source && source._data) {
        const currentFeatures = source._data.features;
        source.setData({ type: 'FeatureCollection', features: [...currentFeatures, newFeature] });

        map.current.flyTo({ center: finalCoords, zoom: 17, pitch: 60 });
      }
    };

    window.addEventListener('add-property-signal', handleNewProperty);
    return () => window.removeEventListener('add-property-signal', handleNewProperty);
  }, [map]);

  // --------------------------------------------------------------------
  // G. SISTEMA DE ACTUALIZACIÓN EN TIEMPO REAL (UPDATE PROPERTY)
  // --------------------------------------------------------------------
  useEffect(() => {
    const handleUpdateProperty = (event: any) => {
      const { id, updates } = event.detail; 
      if (!map.current) return;

      console.log(`🔄 COMANDO ACTUALIZAR RECIBIDO para ID: ${id}`, updates);

      // 1. ACTUALIZAR EN LOCALSTORAGE
      try {
        const saved = localStorage.getItem('stratos_my_properties');
        if (saved) {
          let properties = JSON.parse(saved);
          const index = properties.findIndex((p: any) => String(p.id) === String(id));
          
          if (index !== -1) {
            properties[index] = { ...properties[index], ...updates };
            // Aseguramos que el precio sea numérico para el cálculo de TIER/COLOR
            if (updates.price) {
               properties[index].priceValue = Number(updates.price);
               properties[index].rawPrice = Number(updates.price);
            }
            localStorage.setItem('stratos_my_properties', JSON.stringify(properties));
          }
        }
      } catch (e) { console.error(e); }

      // 2. ACTUALIZAR EN EL MAPA
      const source: any = map.current.getSource('properties');
      if (source && source._data) {
        const currentFeatures = source._data.features;
        const updatedFeatures = currentFeatures.map((f: any) => {
          if (String(f.properties.id) === String(id)) {
            const newPriceValue = updates.price ? Number(updates.price) : f.properties.priceValue;
            
            return {
              ...f,
              properties: {
                ...f.properties,
                ...updates,
                price: updates.price ? `${updates.price}€` : f.properties.price,
                priceValue: newPriceValue, // 👈 Esto cambia el color de la NanoCard
              }
            };
          }
          return f;
        });

        source.setData({ type: 'FeatureCollection', features: updatedFeatures });
        
        // Forzamos repintado visual inmediato
        setTimeout(() => updateMarkers(), 50); 
      }
    };

   window.addEventListener('update-property-signal', handleUpdateProperty);
    return () => window.removeEventListener('update-property-signal', handleUpdateProperty);
  }, [map]);

  // 👇👇👇 AQUI COMIENZA LA NUEVA INTEGRACIÓN DEL RADAR 👇👇👇

  // --------------------------------------------------------------------
  // H. ESCANER TÁCTICO (RADAR) - INTEGRADO
  // --------------------------------------------------------------------
  const scanVisibleProperties = () => {
    if (!map.current) return [];

    // 1. Obtener límites visuales actuales
    const bounds = map.current.getBounds();

    // 2. Acceder a los datos crudos del mapa
    const source: any = map.current.getSource('properties');
    
    // Si el mapa aún no ha cargado datos, abortamos misión
    if (!source || !source._data || !source._data.features) return [];

    // 3. Filtrar y Formatear para la Consola
    const visibleProps = source._data.features
      .filter((f: any) => {
         const [lng, lat] = f.geometry.coordinates;
         return bounds.contains([lng, lat]);
      })
      .map((f: any) => ({
         id: f.properties.id,
         address: f.properties.address || f.properties.location || "Ubicación Privada",
         price: f.properties.price || "Consultar",
         type: f.properties.type || "Propiedad",
         lat: f.geometry.coordinates[1],
         lng: f.geometry.coordinates[0],
         
         gap: (f.properties.selectedServices && f.properties.selectedServices.length > 0) 
              ? [] 
              : ["Foto Pro", "Plano 3D"] 
      }));

    return visibleProps;
  };

// ====================================================================
  // ⚡️ VISIÓN GLOBAL: HIGHLANDER + DISPERSIÓN DE EDIFICIOS (ANTI-STACKING)
  // ====================================================================
  useEffect(() => {
    if (!isLoaded || !map.current) return;

    const fetchServerProperties = async () => {
      try {
        console.log("📡 RADAR: Iniciando protocolo de limpieza y dispersión...");
        
        // 1. CARGA DE DATOS
        const response = await getPropertiesAction();
        const serverData = response.success ? response.data : [];

        let localData = [];
        try {
            const saved = localStorage.getItem('stratos_my_properties');
            if (saved) localData = JSON.parse(saved);
        } catch (e) {}

        // 2. FUSIÓN ÚNICA (HIGHLANDER - FIX DE IDs)
        // Usamos un Map donde la CLAVE es el ID como String.
        // Esto evita que '123' (num) y '123' (txt) se dupliquen.
        const uniqueMap = new Map();

        // A. Base Servidor
        serverData.forEach((p: any) => {
            uniqueMap.set(String(p.id), { ...p, source: 'SERVER' });
        });

        // B. Sobreescritura Local (MATA a la del servidor si el ID coincide)
        localData.forEach((p: any) => {
            if (p.id) {
                const existing = uniqueMap.get(String(p.id)) || {};
                uniqueMap.set(String(p.id), { ...existing, ...p, source: 'LOCAL_OVERRIDE' });
            }
        });

        const unifiedList = Array.from(uniqueMap.values());

        // 3. DISPERSIÓN DE EDIFICIOS (SOLUCIÓN AL SOLAPAMIENTO) 
        // Detectamos si varias casas comparten coordenadas exactas y las separamos.
        const coordTracker = new Map<string, number>(); 

        const features = unifiedList.map((p: any) => {
            // Coordenadas base
            let lng = Number(p.coordinates ? p.coordinates[0] : p.longitude);
            let lat = Number(p.coordinates ? p.coordinates[1] : p.latitude);

            // Si falla, fallback a Madrid
            if (!lng || !lat) { lng = -3.6883; lat = 40.4280; }

            // Generamos una "huella" de la ubicación (con 5 decimales de precisión)
            const coordKey = `${lng.toFixed(5)},${lat.toFixed(5)}`;
            
            // ¿Cuántas hay ya aquí?
            const count = coordTracker.get(coordKey) || 0;
            
            // Si hay más de una, aplicamos la ESPIRAL
            if (count > 0) {
                const angle = count * (Math.PI * 2 / 7); // Rotamos en círculo
                const radius = 0.0002 * Math.ceil(count / 7); // Radio de separación
                
                lng += Math.cos(angle) * radius;
                lat += Math.sin(angle) * radius;
            }

            // Registramos +1 en este sitio
            coordTracker.set(coordKey, count + 1);

            return {
                type: 'Feature',
                geometry: { 
                    type: 'Point', 
                    coordinates: [lng, lat] 
                },
                properties: {
                    ...p,
                    id: String(p.id), // ID BLINDADO COMO STRING
                    images: p.images || [], 
                    img: p.img || (p.images && p.images[0]) || null,
                    priceValue: Number(p.rawPrice || p.priceValue || p.price),
                    selectedServices: p.selectedServices || [],
                    elevator: isYes(p.elevator) || isYes(p.ascensor)
                }
            };
        });

        // 4. INYECCIÓN EN EL MAPA (LIMPIEZA FINAL)
        const source: any = map.current.getSource('properties');
        if (source) {
            source.setData({
                type: 'FeatureCollection',
                features: features
            });
            
            console.log(`✅ RADAR ACTUALIZADO: ${features.length} activos desplegados.`);
            
            setTimeout(() => {
                if(typeof updateMarkers === 'function') updateMarkers(); 
            }, 100);
        }

      } catch (e) { console.error("❌ Fallo en radar:", e); }
    };

    fetchServerProperties();
    window.addEventListener('force-map-refresh', fetchServerProperties);
    return () => window.removeEventListener('force-map-refresh', fetchServerProperties);

  }, [isLoaded]);
  
  // --------------------------------------------------------------------
  // RETORNO FINAL (Cierre del Hook)
  // --------------------------------------------------------------------
  return { 
    mapContainer, 
    map, 
    isMapLoaded: isLoaded, 
    searchCity, 
    scanVisibleProperties 
  };
};