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

// AHORA:
import { getGlobalPropertiesAction } from '@/app/actions';

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
      // 🛑 ESTRATEGIA CERO PARPADEOS (ESTRUCTURA VISUAL)
      // =================================================================
      // Iniciamos el mapa VACÍO.
      // La lógica de "Blindaje de Datos" (Ascensor, Precios, Servicios)
      // se ejecuta EXCLUSIVAMENTE en el 'executeRadar' (más abajo)
      // para asegurar una única fuente de verdad y evitar conflictos.

      // 1. FUENTE DE DATOS (INICIALIZACIÓN ESTRUCTURAL)
      if (map.current.getSource('properties')) {
        (map.current.getSource('properties') as any).setData({
          type: 'FeatureCollection',
          features: [] // 🔥 VACÍO: Esperando inyección segura del Radar
        });
      } else {
        map.current.addSource('properties', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }, // 🔥 VACÍO: Esperando inyección segura del Radar
          cluster: true,
          clusterMaxZoom: 15,
          clusterRadius: 80
        });
      }

      // =================================================================
      // 🎨 DISEÑO VISUAL Y CAPAS (MANTENIDO AL 100%)
      // =================================================================

      // Capa: Círculos Azules (Agrupaciones)
      if (!map.current.getLayer('clusters')) {
        map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'properties',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#0071e3', // Azul Corporativo Stratos
            'circle-radius': ['step', ['get', 'point_count'], 25, 100, 35, 750, 45],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 1,
            'circle-emissive-strength': 1
          }
        });
      }

      // Capa: Contador de Propiedades (Números Blancos)
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
          paint: { 
            'text-color': '#ffffff', 
            'text-emissive-strength': 1 
          }
        });
      }

      // =================================================================
      // 🖱️ INTERACTIVIDAD (CLICS Y MOVIMIENTO)
      // =================================================================
      
      // Evento: Click en Cluster -> Zoom Suave (Cinemática)
      map.current.on('click', 'clusters', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource('properties').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.current.flyTo({ 
              center: features[0].geometry.coordinates, 
              zoom: zoom + 1, 
              speed: 0.5 
          });
        });
      });

      // Cursor Pointer (Mano) al pasar por encima
      map.current.on('mouseenter', 'clusters', () => { 
          map.current.getCanvas().style.cursor = 'pointer'; 
      });
      
      map.current.on('mouseleave', 'clusters', () => { 
          map.current.getCanvas().style.cursor = ''; 
      });

      // Sincronización de Nanocards al mover el mapa
      map.current.on('moveend', () => updateMarkers());

      // Primera llamada (Prepara el terreno para el Radar)
      updateMarkers();
      
    }); // <--- CIERRE DEL .on('load')
  }, []); // <--- CIERRE DEL useEffect (ESTO ES LO QUE FALTABA)
  // ----------------------------------------------------------------------
  // 3. LÓGICA DE FILTRADO INTELIGENTE V2
  // ----------------------------------------------------------------------
  useEffect(() => {
    const handleFilterSignal = (e: any) => {
      if (!map.current || !map.current.getSource('properties')) return;

      const { priceRange, surfaceRange, context, specs, specificType } = e.detail;

      const LIMITS: any = { 'VIVIENDA': 1000, 'NEGOCIO': 2000, 'TERRENO': 10000 };

      console.log(`🔍 FILTRANDO AVANZADO:`, { priceRange, context, specs, specificType });

      // 1. RECONSTRUIR EJÉRCITO (MAPA + LOCAL) PARA FILTRAR
// ✅ FIX: ya NO usamos STRATOS_PROPERTIES (está vacío). Usamos la fuente real del mapa.
const source: any = map.current.getSource('properties');

// Features actuales reales (server + local ya inyectado por RADAR)
const sourceFeaturesRaw = (source as any)?._data?.features;
let masterFeatures: any[] = Array.isArray(sourceFeaturesRaw) ? sourceFeaturesRaw : [];


// Normalizamos (sin perder elevator/specs/selectedServices)
masterFeatures = masterFeatures.map((f: any) => {
  const p = f.properties || {};
  const idStr = String(p.id ?? p._id ?? f.id ?? Date.now());

  const priceValue = Number(
    p.priceValue ??
    p.rawPrice ??
    (typeof p.price === 'string' ? String(p.price).replace(/\D/g, '') : p.price) ??
    0
  );

  const m2 = Number(p.m2 ?? p.mBuilt ?? 0);
  const mBuilt = Number(p.mBuilt ?? p.m2 ?? 0);

  return {
    ...f,
    properties: {
      ...p,
      id: idStr,
      priceValue,
      m2,
      mBuilt,
      selectedServices: Array.isArray(p.selectedServices) ? p.selectedServices : [],
      specs: p.specs || {},
      elevator: (
        isYes(p.elevator) ||
        isYes(p.ascensor) ||
        isYes(p.hasElevator) ||
        isYes(p?.specs?.elevator)
      )
    }
  };
});

// LocalStorage (mis activos) como refuerzo
let userFeatures: any[] = [];
try {
  const saved = localStorage.getItem('stratos_my_properties');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      userFeatures = parsed.map((p: any) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: p.coordinates || [-3.6883, 40.4280] },
        properties: {
          ...p,
          id: String(p.id || Date.now()),
          role: p.role || 'PROPIETARIO',
          type: p.type || 'Propiedad',
          priceValue: Number(p.rawPrice || p.priceValue || p.price || 0),
          m2: Number(p.mBuilt || p.m2 || 0),
          mBuilt: Number(p.mBuilt || p.m2 || 0),
          img: (p.images && p.images.length > 0) ? p.images[0] : (p.img || null),
          selectedServices: Array.isArray(p.selectedServices) ? p.selectedServices : [],
          specs: p.specs || {},
          elevator: (
            isYes(p.elevator) ||
            isYes(p.ascensor) ||
            isYes(p.hasElevator) ||
            isYes(p?.specs?.elevator)
          )
        }
      }));
    }
  }
} catch (err) { console.error(err); }

// ✅ Merge SIN dedupe por id (evita colapso a 1 card si algún id viene vacío)
const allData = [...masterFeatures, ...userFeatures].filter((f: any) => {
  const pid = f?.properties?.id ?? f?.properties?._id ?? f?.id;
  return pid !== undefined && pid !== null && String(pid).trim() !== "";
});

// ✅ Si por lo que sea aún no hay datos, NO tocar el source (evita borrado)
if (allData.length === 0) {
  console.warn("⏳ Filtro recibido pero no hay features válidas aún. No aplico para no borrar NanoCards.");
  return;
}



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

     const src: any = map.current.getSource('properties');
if (src) {
  src.setData({ type: 'FeatureCollection', features: filteredFeatures });
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
  // D. PINTOR DE MARCADORES (UNIFICADO: SOLO USAMOS MapNanoCard)
  // --------------------------------------------------------------------
  const updateMarkers = () => {
    const mapInstance = map.current;
    if (!mapInstance || !mapInstance.getSource("properties")) return;

    // Solo pintamos propiedades individuales (no clusters)
    const features = mapInstance.querySourceFeatures("properties", {
      filter: ["!", ["has", "point_count"]],
    });

    // Ordenar visualmente para que las del sur queden por delante (Efecto 3D)
    features.sort((a: any, b: any) => b.geometry.coordinates[1] - a.geometry.coordinates[1]);
    
    // IDs como string
    const visibleIds = new Set(features.map((f: any) => String(f.properties.id)));

    // Limpiar marcadores viejos
    Object.keys(markersRef.current).forEach((id) => {
      if (!visibleIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Pintar nuevos marcadores
    features.forEach((feature: any) => {
      const id = String(feature.properties.id);
      if (markersRef.current[id]) return; // Si ya existe, no lo tocamos

      const el = document.createElement("div");
      el.className = "nanocard-marker";
      
      const root = createRoot(el);
      const p = feature.properties;

      // 1. RECUPERACIÓN DE IMAGEN
      let safeImages: any[] = [];
      if (Array.isArray(p.images)) {
        safeImages = p.images.map((i: any) => (typeof i === "string" ? i : i?.url)).filter(Boolean);
      } else if (typeof p.images === 'string') {
        try {
            const parsed = JSON.parse(p.images);
            safeImages = Array.isArray(parsed) ? parsed : [p.images];
        } catch (e) { safeImages = [p.images]; }
      }
      if (safeImages.length === 0 && p.img) safeImages = [p.img];
      const safeImg = safeImages[0] || null;

      // 2. METROS
      const finalM2 = Number(p.mBuilt || p.m2 || p.surface || 0);

      // 3. PARSEO DE USUARIO/SNAPSHOT
      const parseMaybeJSON = (v: any) => {
        if (!v) return null;
        if (typeof v === "object") return v;
        if (typeof v === "string") {
          try {
            const j = JSON.parse(v);
            return j && typeof j === "object" ? j : null;
          } catch {}
        }
        return null;
      };

      const snapObj = parseMaybeJSON(p.ownerSnapshot);
      const userObj = parseMaybeJSON(p.user) || snapObj;

      if (snapObj) p.ownerSnapshot = snapObj;
      if (userObj) p.user = userObj;

      p.role = p.role || p.user?.role || p.ownerSnapshot?.role || null;
      p.description = p.description || p.desc || "";

      // 🔥 AQUÍ ESTÁ EL CAMBIO: USAMOS SIEMPRE MapNanoCard 🔥
      // Él ya sabe leer "promotedTier" y ponerse Premium solo.
      
      root.render(
          <MapNanoCard
            id={id}
            data={p}
            // Pasamos los flags Premium explícitamente por si acaso
            promotedTier={p.promotedTier}
            isPromoted={p.isPromoted}
            
            price={p.price}
            priceValue={p.priceValue}
            rawPrice={p.priceValue}
            rooms={p.rooms}
            baths={p.baths}
            mBuilt={finalM2}
            m2={finalM2} 
            selectedServices={p.selectedServices}
            elevator={p.elevator}
            specs={p.specs}
            type={p.type}
            img={safeImg}
            images={safeImages}
            lat={feature.geometry.coordinates[1]}
            lng={feature.geometry.coordinates[0]}
            role={p.role}
            title={p.title}
            description={p.description}
            address={p.address || p.location}
            city={p.city || p.location}
            location={p.location || p.city || p.address}
            communityFees={p.communityFees}
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
  // E. BÚSQUEDA OMNI V3 (AUTO-ZOOM) - 🇪🇸 SOLO ESPAÑA (CALIBRADO) 🇪🇸
  // --------------------------------------------------------------------
  const searchCity = async (rawQuery: any) => {
    if (!rawQuery || !map.current) return;

    const { location, filters } = parseOmniSearch(rawQuery);
    console.log(`📡 OMNI: Loc="${location}" | Filtros=`, filters);

    // Decisión de Vuelo / Auto-Zoom
    if (location.length > 2) {
      try {
        // 🔥 CORRECCIÓN: Lista completa de tipos para encontrar Urbanizaciones y Calles exactas
        const types = 'country,region,postcode,district,place,locality,neighborhood,address,poi';
        
        // 🔥 AÑADIDO: fuzzyMatch=true para tolerar imprecisiones y encontrar "Altea Hills"
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxgl.accessToken}&country=es&types=${types}&language=es&fuzzyMatch=true&autocomplete=true`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.features?.length > 0) {
          const target = data.features[0];

          // Lógica de Aterrizaje Inteligente:
          // Si el resultado tiene un área definida (ej: Urbanización), la encuadramos.
          if (target.bbox) {
             map.current.fitBounds(target.bbox, { padding: 50, duration: 2500, essential: true });
          } 
          // Si es un punto exacto (Calle/Portal), bajamos al detalle (Zoom 17)
          else {
             map.current.flyTo({
               center: target.center,
               zoom: 17, // Zoom de calle (antes era 13.5, muy lejos)
               pitch: 60,
               bearing: 0,
               speed: 1.5,
               essential: true
             });
          }
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
  // C. RECEPTOR DE NUEVAS PROPIEDADES (ADD PROPERTY) - ANTI-DUPLICADOS
  // --------------------------------------------------------------------
  useEffect(() => {
    const handleNewProperty = async (event: any) => {
      const formData = event.detail;
      if (!map.current || !formData) return;

      console.log("📦 MAPA: Inyectando nueva propiedad...", formData);

      // 1. GEO (Si no viene, lo buscamos)
      let baseCoords = [-3.6883, 40.4280];
      if (formData.coordinates) {
          baseCoords = formData.coordinates;
      } else {
          try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(formData.address)}.json?access_token=${mapboxgl.accessToken}&country=es`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.features?.[0]) baseCoords = data.features[0].center;
          } catch (e) { console.error("Geo Error:", e); }
      }
      
      // Pequeña variación para evitar superposición exacta
      const jitter = () => (Math.random() - 0.5) * 0.0004;
      const finalCoords = [baseCoords[0] + jitter(), baseCoords[1] + jitter()];

      // 2. PREPARAR IMAGEN REAL (Sin falsedades)
      let finalImage = null;
      if (formData.mainImage) finalImage = formData.mainImage;
      else if (Array.isArray(formData.images) && formData.images.length > 0) {
          const first = formData.images[0];
          finalImage = typeof first === 'string' ? first : first.url;
      }
      else if (formData.img) finalImage = formData.img;

      // 3. CONSTRUIR FEATURE GEOJSON
      const newFeature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: finalCoords },
        properties: {
          ...formData,
          id: String(formData.id), // ID siempre string para comparar
          type: formData.type || 'Propiedad',
          
          price: `${formData.price}€`,
          priceValue: Number(formData.price || 0),
          
          // 🔥 Aseguramos que los metros se guarden en m2 y mBuilt
          m2: Number(formData.mBuilt || 0),
          mBuilt: Number(formData.mBuilt || 0),
          
          elevator: isYes(formData.elevator),
          selectedServices: Array.isArray(formData.selectedServices) ? formData.selectedServices : [],
          
          img: finalImage,
          // Si no hay imágenes, array vacío (nada falso)
          images: finalImage ? [finalImage] : [], 
        }
      };

      // 4. INYECCIÓN ANTI-DUPLICADOS (LA CLAVE)
      const src: any = map.current.getSource('properties');
      if (src && (src as any)._data) {
        const currentFeatures = (src as any)._data.features || [];
        
        // 🔥 FILTRO CLAVE: Borramos la versión anterior si existe
        // "Si el ID ya está en el mapa, quítalo antes de meter el nuevo"
        const others = currentFeatures.filter((f: any) => String(f.properties.id) !== String(formData.id));
        
        // Añadimos la nueva versión limpia
        src.setData({ type: 'FeatureCollection', features: [...others, newFeature] });

        // Forzamos vuelo y repintado
        map.current.flyTo({ center: finalCoords, zoom: 18, pitch: 60 });
        
        map.current.once('idle', () => updateMarkers());
        setTimeout(() => updateMarkers(), 250);
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

      // 🗑️ LOCALSTORAGE ELIMINADO TOTALMENTE - SOLO USAMOS MEMORIA DEL MAPA 🗑️

      // 1. ACTUALIZAR EN EL MAPA (BLINDADO CONTRA '[object Object]')
      const updateSource: any = map.current.getSource('properties');

      if (updateSource && (updateSource as any)._data) {
        const currentFeatures = (updateSource as any)._data.features || [];

        const updatedFeatures = currentFeatures.map((f: any) => {
          if (String(f.properties.id) === String(id)) {
            const newPriceValue = updates.price ? Number(updates.price) : f.properties.priceValue;

            // 🔥 SALVAVIDAS MAPBOX: Serializamos todo lo complejo antes de dárselo a Mapbox
            // Mapbox rompe los arrays y objetos anidados si se los das directamente
            const safeUpdates = { ...updates };
            ['images', 'b2b', 'openHouse', 'open_house_data', 'activeCampaign', 'user', 'ownerSnapshot', 'specs'].forEach(key => {
                if (safeUpdates[key] && typeof safeUpdates[key] === 'object') {
                    safeUpdates[key] = JSON.stringify(safeUpdates[key]); // Convertimos a string seguro
                }
            });

            return {
              ...f,
              properties: {
                ...f.properties,
                ...safeUpdates, // Inyectamos la data segura
                price: updates.price ? `${updates.price}€` : f.properties.price,
                priceValue: newPriceValue,
              },
            };
          }
          return f;
        });

        updateSource.setData({ type: 'FeatureCollection', features: updatedFeatures });

        // Forzamos repintado visual inmediato para que la NanoCard lea los cambios
        map.current.once('idle', () => updateMarkers());
      }
    };

   window.addEventListener('update-property-signal', handleUpdateProperty);
    return () => window.removeEventListener('update-property-signal', handleUpdateProperty);
  }, [map]);

  // --------------------------------------------------------------------
  // H. ESCANER TÁCTICO (RADAR) - INTEGRADO
  // --------------------------------------------------------------------
  const scanVisibleProperties = () => {
    if (!map.current) return [];

    // 1. Obtener límites visuales actuales
    const bounds = map.current.getBounds();

   const radarSource: any = map.current.getSource('properties');

// Si el mapa aún no ha cargado datos, abortamos misión
if (!radarSource || !(radarSource as any)._data || !(radarSource as any)._data.features) return [];

// 3. Filtrar y Formatear para la Consola
const visibleProps = (radarSource as any)._data.features
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
    gap: (f.properties.selectedServices && f.properties.selectedServices.length > 0) ? [] : ["Foto Pro", "Plano 3D"],
  }));

return visibleProps;

  };

// --------------------------------------------------------------------
  // D. RADAR GLOBAL (CARGA PURE CLOUD - CERO LOCAL STORAGE)
  // --------------------------------------------------------------------
  useEffect(() => {
    // 1. Si el mapa no existe físicamente, abortamos.
    if (!map.current) return;

    const executeRadar = async () => {
      try {
        console.log("📡 RADAR: Conectando con Base de Datos Global...");
        
        // --- FASE 1: OBTENCIÓN DE DATOS (SOLO SERVIDOR) ---
        const response = await getGlobalPropertiesAction();
        const rawData = response.success ? response.data : [];

        // 🔥🔥🔥 CORTAFUEGOS TÁCTICO: SOLO PASAN LOS PAGADOS 🔥🔥🔥
        const serverData = rawData.filter((p: any) => {
            // Normalizamos el estado a mayúsculas para evitar errores
            const status = String(p.status || "").toUpperCase();
            
            // REGLA DE ORO: Solo entra si es "PUBLICADO"
            // (Las agencias nacen como PUBLICADO, los particulares pagan para ser PUBLICADO)
            return status === "PUBLICADO";
        });

        // 🗑️ REMOVIDO: Ya no leemos localStorage. Solo existe la verdad del servidor.

        // --- FASE 2: NORMALIZACIÓN Y ANTI-DUPLICADOS ---
        // Usamos un Map para garantizar que cada ID sea único.
        const uniqueMap = new Map();

        // AHORA 'serverData' YA ESTÁ LIMPIO
        serverData.forEach((p: any) => {
            // Aseguramos ID como String para evitar conflictos "123" vs 123
            const sId = String(p.id);
            
            // Si ya existe, lo sobrescribimos (la última versión del servidor manda)
            uniqueMap.set(sId, { 
                ...p, 
                source: 'CLOUD_DB' 
            });
        });

        const unifiedList = Array.from(uniqueMap.values());

        // --- FASE 3: GEOMETRÍA (Espirales para evitar superposición) ---
        const coordTracker = new Map<string, number>(); 

        const features = unifiedList.map((p: any) => {
            // Coordenadas: Prioridad al array [lng, lat], luego a las props sueltas
            let lng = Number(p.coordinates ? p.coordinates[0] : p.longitude);
            let lat = Number(p.coordinates ? p.coordinates[1] : p.latitude);
            
            // Fallback de seguridad (Madrid) si las coordenadas están rotas
            if (!lng || !lat || isNaN(lng) || isNaN(lat)) { lng = -3.6883; lat = 40.4280; }

            // Clave de posición para detectar colisiones
            const coordKey = `${lng.toFixed(4)},${lat.toFixed(4)}`;
            const count = coordTracker.get(coordKey) || 0;
            
            // Si hay colisión, aplicamos espiral matemática
            if (count > 0) {
                const angle = count * (Math.PI * 2 / 5); 
                const separation = 0.0003; 
                const radius = separation * (1 + Math.floor(count / 5)); 
                lng += Math.cos(angle) * radius;
                lat += Math.sin(angle) * radius;
            }
            coordTracker.set(coordKey, count + 1);

            // Preparación de Imagen Real
            const safeImage = p.mainImage || 
                              (p.images && p.images.length > 0 ? (p.images[0].url || p.images[0]) : null);

            // Unificación de Metros
            const finalM2 = Number(p.mBuilt || p.m2 || p.surface || 0);

            // ✅ Mapbox no preserva objetos anidados -> serializamos identidad
const identityObj =
  (p?.user && typeof p.user === "object" ? p.user : null) ||
  (p?.ownerSnapshot && typeof p.ownerSnapshot === "object" ? p.ownerSnapshot : null);

const identityJson = identityObj ? JSON.stringify(identityObj) : null;

// ownerSnapshot histórico (si existe) también serializado
const ownerSnapJson =
  (p?.ownerSnapshot && typeof p.ownerSnapshot === "object")
    ? JSON.stringify(p.ownerSnapshot)
    : identityJson;

          
            return {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [lng, lat] },
                properties: {
                    ...p,
                    id: String(p.id),
                    priceValue: Number(p.rawPrice || p.priceValue || p.price || 0),
                    
                    // Imagen: Solo la real o null (nada de placeholders falsos)
                    img: safeImage,
                    
                    // 🔥 DATOS COMPLETOS Y NORMALIZADOS
                    m2: finalM2,       
                    mBuilt: finalM2,   
                    
                    elevator: isYes(p.elevator),
                    communityFees: p.communityFees,
                    energyConsumption: p.energyConsumption,
                    energyEmissions: p.energyEmissions,
                    energyPending: p.energyPending,
               user: identityJson,
ownerSnapshot: ownerSnapJson,
role: p?.role ?? identityObj?.role ?? null,

               
                  }
            };
        });

        // --- FASE 4: INYECCIÓN SEGURA (Bucle de reintento) ---
        const injectSafely = (attempts = 0) => {
            if (!map.current) return;

            const source: any = map.current.getSource('properties');

            if (source) {
                // Reemplazo TOTAL de datos (Adiós duplicados)
                source.setData({
                    type: 'FeatureCollection',
                    features: features
                });

                console.log(`✅ RADAR: ${features.length} activos cargados desde la Nube.`);

                // Forzar actualización visual de marcadores (React Portal)
                if (map.current) {
                    map.current.once('idle', () => {
                        try { updateMarkers(); } catch (e) { console.error(e); }
                    });
                }
                
                // Doble check por si el mapa estaba en movimiento
                setTimeout(() => {
                    try { updateMarkers(); } catch (e) {}
                }, 350);

            } else {
                if (attempts < 10) {
                    // Si el estilo del mapa no cargó, reintentamos un poco
                    setTimeout(() => injectSafely(attempts + 1), 500);
                }
            }
        };

        // Ejecutar inyección
        injectSafely();

      } catch (e) { console.error("❌ Fallo crítico en radar:", e); }
    };

    // DISPARADORES
    if (isLoaded) {
        executeRadar();
    } else {
        map.current.once('load', executeRadar);
    }

    // Escuchar peticiones de recarga forzosa (desde ArchitectHud o Botón de Refresco)
    window.addEventListener('force-map-refresh', executeRadar);
    return () => window.removeEventListener('force-map-refresh', executeRadar);

  }, [isLoaded]); // Fin del useEffect
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