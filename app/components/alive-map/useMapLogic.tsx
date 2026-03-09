// @ts-nocheck
"use client";

// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { parseOmniSearch, CONTEXT_CONFIG } from './smart-search';
import MapNanoCard from './ui-panels/MapNanoCard';

// 🔥 IMPORTAMOS EL MONOLITO DORADO PARA LAS AGENCIAS VIP
import VipAgencyMarker from './ui-panels/VipAgencyMarker';

// 🔥 1. IMPORTAMOS LA NUEVA BASE DE DATOS MAESTRA
// import { STRATOS_PROPERTIES, IMAGES } from './stratos-db';
const STRATOS_PROPERTIES : any[] = [];
const IMAGES : any[] = [];

// AHORA:
import { getGlobalPropertiesAction } from '@/app/actions';

// 🔥 IMPORTACIÓN CORRECTA DEL RADAR VIP
import { getVipAgenciesAction } from '@/app/actions-zones';

// 📡 LA NUEVA ANTENA: IMPORTAMOS EL RECEPTOR ESPACIAL (Pusher)
import { getPusherClient } from '@/app/utils/pusher';

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
const agencyMarkersRef = useRef<any>({});
  // --------------------------------------------------------------------
  // A. INICIALIZACIÓN DEL MAPA (MOTOR ELITE V2 - 3D REAL)
  // --------------------------------------------------------------------
  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard', // EL MOTOR MAESTRO
      center: [-3.6883, 40.4280], 
      zoom: 16, // Zoom Pro para ver fachadas
      pitch: 75, // Inclinación agresiva
      bearing: -20,
      antialias: true,
      projection: 'globe'
    });

   // 🚀 CONFIGURACIÓN DE ALTO NIVEL (FUERZA BRUTA 3D)
    map.current.on('style.import.load', () => {
        // 1. FORZAMOS EL RELIEVE
        map.current.setConfigProperty('basemap', 'show3dObjects', true);
        map.current.setConfigProperty('basemap', 'showLandmarks', true);
        
        // 🔥 2. RELOJ BIOLÓGICO (SINCRONIZACIÓN CON EL MUNDO REAL)
        const hour = new Date().getHours();
        let currentLighting = 'day'; // Por defecto, día
        
        if (hour >= 20 || hour < 7) {
            currentLighting = 'night'; // Noche cerrada (20:00 a 06:59)
        } else if (hour >= 18) {
            currentLighting = 'dusk';  // Atardecer (18:00 a 19:59)
        } else if (hour >= 7 && hour < 9) {
            currentLighting = 'dawn';  // Amanecer (07:00 a 08:59)
        }
        
        // Aplicamos la luz real
        map.current.setConfigProperty('basemap', 'lightPreset', currentLighting); 
        
        // 🔥 3. LIMPIEZA COMERCIAL (Fuera la basura que no paga)
        map.current.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
        map.current.setConfigProperty('basemap', 'showTransitLabels', false);
        
        console.log(`⚡️ STRATOSFERE: RELOJ ACTIVO (${currentLighting.toUpperCase()}) Y MAPA LIMPIO`);
    });
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }),
      'bottom-left'
    );

    map.current.on('load', () => {
      console.log("🟢 SISTEMA CARGADO");
      setIsLoaded(true);

      // 🔥 BALIZA RADAR (Su código original)
      setInterval(() => {
          if (map.current) {
              const center = map.current.getCenter();
              window.dispatchEvent(new CustomEvent('map-center-updated', { 
                  detail: { lng: center.lng, lat: center.lat } 
              }));
          }
      }, 1000);
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
      // 🖱️ INTERACTIVIDAD (CLICS Y MOVIMIENTO AZULES)
      // =================================================================
      map.current.on('click', 'clusters', (e: any) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource('properties').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
          if (err) return;
          map.current.flyTo({ 
              center: features[0].geometry.coordinates as [number, number], 
              zoom: zoom + 1, 
              speed: 0.5 
          });
        });
      });

      map.current.on('mouseenter', 'clusters', () => { map.current.getCanvas().style.cursor = 'pointer'; });
      map.current.on('mouseleave', 'clusters', () => { map.current.getCanvas().style.cursor = ''; });

     // =================================================================
      // 🔥 1. EL BOTE DE CACAHUETES DORADO (Capas VIP) 🔥
      // =================================================================
      if (!map.current.getSource('vip-agencies')) {
        map.current.addSource('vip-agencies', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          cluster: true,
          clusterMaxZoom: 14, // A partir de zoom 14 se rompe el bote
          clusterRadius: 60
        });
      }

      if (!map.current.getLayer('vip-clusters')) {
        map.current.addLayer({
          id: 'vip-clusters',
          type: 'circle',
          source: 'vip-agencies',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#eab308', // Dorado VIP
            'circle-radius': ['step', ['get', 'point_count'], 30, 10, 40, 50, 50],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.95
          }
        });
      }

      if (!map.current.getLayer('vip-cluster-count')) {
        map.current.addLayer({
          id: 'vip-cluster-count',
          type: 'symbol',
          source: 'vip-agencies',
          filter: ['has', 'point_count'],
          layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['Arial Unicode MS Bold'], 'text-size': 16 },
          paint: { 'text-color': '#ffffff' }
        });
      }

      // Cinemática al hacer clic en el orbe dorado (GremlinsPop)
      map.current.on('click', 'vip-clusters', (e: any) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['vip-clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource('vip-agencies').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
          if (err) return;
          map.current.flyTo({ center: features[0].geometry.coordinates as [number, number], zoom: zoom + 1.5, speed: 0.8 });
        });
      });
      map.current.on('mouseenter', 'vip-clusters', () => { map.current.getCanvas().style.cursor = 'pointer'; });
      map.current.on('mouseleave', 'vip-clusters', () => { map.current.getCanvas().style.cursor = ''; });

      // =================================================================
      // ⚙️ MOVIMIENTO Y SINCRONIZACIÓN FINAL
      // =================================================================
      map.current.on('moveend', () => {
          updateMarkers();
          
          // 🔥 LLAMAMOS AL DESPARRAMADOR VIP AL MOVER EL MAPA
          if (typeof updateVipMarkers === 'function') {
              updateVipMarkers();
          }
          
          const center = map.current.getCenter();
          window.dispatchEvent(new CustomEvent('map-center-updated', { 
              detail: { lng: center.lng, lat: center.lat } 
          }));
      });

      map.current.on('move', () => {
          const center = map.current.getCenter();
          window.dispatchEvent(new CustomEvent('map-center-updated', { 
              detail: { lng: center.lng, lat: center.lat } 
          }));
      });

      updateMarkers();

      setTimeout(() => {
          if (map.current) {
              const initialCenter = map.current.getCenter();
              window.dispatchEvent(new CustomEvent('map-center-updated', { 
                  detail: { lng: initialCenter.lng, lat: initialCenter.lat } 
              }));
          }
      }, 500);
      
    }); // <--- CIERRE DEL .on('load')
  }, []); // <--- CIERRE DEL useEffect
 // ----------------------------------------------------------------------
  // 3. LÓGICA DE FILTRADO INTELIGENTE V2
  // ----------------------------------------------------------------------
  useEffect(() => {
    const handleFilterSignal = (e: any) => {
      if (!map.current || !map.current.getSource('properties')) return;

      // 🔥 AHORA LEEMOS LOS NUEVOS PARÁMETROS DE LA CONSOLA VIP
      const { priceMax, surfaceRange, type, specs, premiumOnly } = e.detail;
      const priceRange = { min: 0, max: priceMax || 999999999 }; // Adaptamos el precio
      console.log(`🔍 FILTRANDO AVANZADO:`, { priceRange, type, specs, premiumOnly });
   
      // 1. RECONSTRUIR EJÉRCITO (MAPA + LOCAL) PARA FILTRAR
      // ✅ FIX: ya NO usamos STRATOS_PROPERTIES (está vacío). Usamos la fuente real del mapa.
      const source: any = map.current.getSource('properties');

      // Features actuales reales (server + local ya inyectado por RADAR)
      const sourceFeaturesRaw = (source as any)?._data?.features;
      let masterFeatures: any[] = Array.isArray(sourceFeaturesRaw) ? sourceFeaturesRaw : [];

      // Normalizamos (sin perder elevator/specs/selectedServices ni la memoria de Agencia)
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

        // 🔥 SALVAVIDAS DE ARRAYS (Por si Mapbox los convirtió en texto)
        let safeServices = [];
        if (Array.isArray(p.selectedServices)) {
            safeServices = p.selectedServices;
        } else if (typeof p.selectedServices === 'string') {
            try { safeServices = JSON.parse(p.selectedServices); } catch(e) { safeServices = []; }
        }

        // 🔥 SALVAVIDAS DE OBJETOS (Por si Mapbox los convirtió en texto)
        let safeSpecs = {};
        if (typeof p.specs === 'object' && p.specs !== null) {
            safeSpecs = p.specs;
        } else if (typeof p.specs === 'string') {
            try { safeSpecs = JSON.parse(p.specs); } catch(e) { safeSpecs = {}; }
        }

        return {
          ...f,
          properties: {
            ...p, // <--- Esto garantiza que el Open House y el Fuego Premium NO se borren
            id: idStr,
            priceValue,
            m2,
            mBuilt,
            selectedServices: safeServices,
            specs: safeSpecs,
            elevator: (
              isYes(p.elevator) ||
              isYes(p.ascensor) ||
              isYes(p.hasElevator) ||
              isYes(p?.specs?.elevator) ||
              isYes(safeSpecs?.elevator)
            )
          }
        };
      });

      // =====================================================================
      // ☁️ 100% SAAS CLOUD: PURGA DE TROPAS FANTASMA (LOCALSTORAGE ELIMINADO)
      // =====================================================================
      // Usamos exclusivamente los datos reales validados por el servidor (masterFeatures).

      const allData = masterFeatures.filter((f: any) => {
        const pid = f?.properties?.id ?? f?.properties?._id ?? f?.id;
        return pid !== undefined && pid !== null && String(pid).trim() !== "";
      });

      // ✅ CORTAFUEGOS ANTI-BORRADO: Si por lo que sea aún no hay datos, NO tocar el source
      if (allData.length === 0) {
        console.warn("⏳ Filtro recibido pero no hay features válidas aún. No aplico para no borrar NanoCards.");
        return;
      }

      // 2. APLICAR LÓGICA DE FILTRADO
      const filteredFeatures = allData.filter(f => {
        const p = f.properties;

        // 🔥 FILTRO VIP (MODO FUEGO BLINDADO): Tolerancia a mayúsculas
        if (premiumOnly === true || String(premiumOnly) === "true") {
           const tier = String(p.promotedTier || "").toUpperCase();
           const isPremium = tier === 'PREMIUM' || p.isPromoted === true || p.premium === true;
           if (!isPremium) return false;
        }

        // A. Precio
        if (p.priceValue < priceRange.min || p.priceValue > priceRange.max) return false;

        // B. Superficie (🚨 LÍMITE INFINITO PARA NO BORRAR LA VILLA DE 15.000m2)
        const m2 = p.m2 || Math.floor(p.priceValue / 4000);
        if (m2 < (surfaceRange?.min || 0) || m2 > (surfaceRange?.max || 99999999)) return false;

        // C. Especificaciones (Habitaciones / Baños)
        if (specs) {
          if (specs.beds > 0 && (p.rooms || 0) < specs.beds) return false;
          if (specs.baths > 0 && (p.baths || 0) < specs.baths) return false;

          // D. Extras (Piscina, Garaje...) - 🔥 FILTRO DE PRECISIÓN LÁSER 🔥
          if (specs.features && specs.features.length > 0) {
            // 1. Array de servicios seguro
            const safeServices = Array.isArray(p.selectedServices) ? p.selectedServices : [];
            // 2. Texto de búsqueda seguro (SOLO miramos en título y descripción)
            const safeText = ` ${(p.title || '')} ${(p.description || '')} `.toUpperCase();

            const hasAllFeatures = specs.features.every((feat) => {
              // Comprobamos la variable booleana, el array de servicios y el texto seguro
              if (feat === 'pool') return p.pool === true || safeServices.includes('pool') || safeText.includes('PISCINA');
              if (feat === 'garage') return p.garage === true || safeServices.includes('garage') || safeText.includes('GARAJE') || safeText.includes('PARKING');
              if (feat === 'garden') return p.garden === true || safeServices.includes('garden') || safeText.includes('JARDÍN') || safeText.includes('GARDEN');
              if (feat === 'security') return p.security === true || safeServices.includes('security') || safeText.includes('SEGURIDAD') || safeText.includes('VIGILANCIA');
              
              // 🔥 Nuevos extras del ArchitectHud (Listos para el futuro)
              if (feat === 'terrace') return p.terrace === true || safeServices.includes('terrace') || safeText.includes('TERRAZA');
              if (feat === 'balcony') return p.balcony === true || safeServices.includes('balcony') || safeText.includes('BALCÓN');
              if (feat === 'storage') return p.storage === true || safeServices.includes('storage') || safeText.includes('TRASTERO');
              if (feat === 'ac') return p.ac === true || safeServices.includes('ac') || safeText.includes('AIRE');
              if (feat === 'heating') return p.heating === true || safeServices.includes('heating') || safeText.includes('CALEFACCIÓN');
              if (feat === 'furnished') return p.furnished === true || safeServices.includes('furnished') || safeText.includes('AMUEBLADO');
              
              return true; 
            });
            if (!hasAllFeatures) return false;
          }
        }
       // -------------------------------------------------------------
        // E. FILTRO DE TIPO (QUIRÚRGICO) 🔪 
        // -------------------------------------------------------------
        const pType = String(p.type || "").toLowerCase().trim();
        const targetType = String(type || "all").toLowerCase().trim();

        // Si en la consola no está seleccionado "all" (Todos), exigimos coincidencia
        if (targetType !== "all" && targetType !== "") {
            // El usuario ha pulsado "Villa" -> Buscamos que diga "villa"
            if (!pType.includes(targetType)) return false; 
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
        // Si el botón manda un pitch exacto, lo usamos. Si no, mantenemos el del usuario.
        pitch: pitch !== undefined ? pitch : currentPitch,
        // Ya no forzamos -20. Mantenemos hacia dónde miraba el usuario.
        bearing: currentBearing, 
        duration: duration || 3000,
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

     // 3. PARSEO DE USUARIO/SNAPSHOT Y DESCOMPRESIÓN BLINDADA 🔥
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

      // 🔥 RESCATE DE LA AMNESIA: Desenvasamos Agencia, Open House y Extras
      const openHouseObj = parseMaybeJSON(p.openHouse) || parseMaybeJSON(p.open_house_data);
      const activeCampaignObj = parseMaybeJSON(p.activeCampaign);
      const b2bObj = parseMaybeJSON(p.b2b);
      const servicesArray = typeof p.selectedServices === 'string' ? parseMaybeJSON(p.selectedServices) : p.selectedServices;

      if (openHouseObj) { p.openHouse = openHouseObj; p.open_house_data = openHouseObj; }
      if (activeCampaignObj) p.activeCampaign = activeCampaignObj;
      if (b2bObj) p.b2b = b2bObj;
      p.selectedServices = Array.isArray(servicesArray) ? servicesArray : [];

     p.role = p.role || p.user?.role || p.ownerSnapshot?.role || null;
      p.description = p.description || p.desc || "";

    
      // 🔥 AQUÍ ESTÁ EL CAMBIO: USAMOS SIEMPRE MapNanoCard 🔥
      // Él ya sabe leer "promotedTier" y ponerse Premium solo.
      
      root.render(
          <MapNanoCard
            id={id}
            data={p}
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
            
           // 🔥 DATOS PUROS (Sin lavar, pasados directamente)
            address={p.address || null}
            city={p.city || null}
            postcode={p.postcode || null}
            region={p.region || null}
            
            communityFees={p.communityFees}
            energyConsumption={p.energyConsumption}
            energyEmissions={p.energyEmissions}
            energyPending={p.energyPending}
            
            // 🔥 INYECCIÓN DE LOS OBJETOS DESEMPAQUETADOS
            openHouse={p.openHouse}
            activeCampaign={p.activeCampaign}
            b2b={p.b2b}
          />
      );

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(feature.geometry.coordinates)
        .addTo(mapInstance);

      markersRef.current[id] = marker;
    });
  };

  // --------------------------------------------------------------------
  // 🔥 2. EL DESPARRAMADOR VIP (Dibuja los HTML sueltos) 🔥
  // --------------------------------------------------------------------
  const updateVipMarkers = () => {
    const mapInstance = map.current;
    if (!mapInstance || !(mapInstance as any).getSource("vip-agencies")) return;

    // Solo busca cacahuetes SUELTOS (los que ya no están agrupados)
    const features = (mapInstance as any).querySourceFeatures("vip-agencies", { filter: ["!", ["has", "point_count"]] });
    const visibleIds = new Set(features.map((f: any) => String(f.properties.uniqueMarkerId)));

    // Limpia los que ya no se ven
    Object.keys(agencyMarkersRef.current).forEach((id) => {
      if (!visibleIds.has(id)) {
        agencyMarkersRef.current[id].remove();
        delete agencyMarkersRef.current[id];
      }
    });

    // Dibuja los nuevos
    features.forEach((feature: any) => {
      const id = String(feature.properties.uniqueMarkerId);
      if (agencyMarkersRef.current[id]) return;

      const el = document.createElement("div");
      el.className = "vip-agency-marker";
      const root = createRoot(el);
      
      const agencyData = JSON.parse(feature.properties.agencyRawData);

      // 🍿 CÁLCULO DEL RETRASO ALEATORIO (Efecto metralleta de 0 a 0.25 seg)
      const popDelay = (Math.random() * 0.25).toFixed(2);

      root.render(
          // 🔥 ENVOLTORIO GREMLIN POP CON TAILWIND PURE
          <div className="animate-gremlin-pop" style={{ animationDelay: `${popDelay}s` }}>
              <VipAgencyMarker 
                  agency={agencyData} 
                  onClick={() => {
                      (mapInstance as any).flyTo({ center: agencyData.coordinates, zoom: 19, pitch: 70, duration: 2500 });
                      if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('open-market-panel', { detail: agencyData }));
                      }
                  }} 
              />
          </div>
      );

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat(feature.geometry.coordinates)
        .addTo(mapInstance as any);
      
      agencyMarkersRef.current[id] = marker;
    });
  };
 // --------------------------------------------------------------------
  // E. BÚSQUEDA OMNI V10 (INTERCEPTOR TÁCTICO) 🇪🇸🛡️
  // --------------------------------------------------------------------
  const searchCity = async (rawQuery: any) => {
    if (!rawQuery || !map.current) return;

    let query = String(rawQuery).toLowerCase().trim();
    query = query.replace(/quiero|buscar|piso en|casa en|chalet en|villa en|comprar en/gi, "").trim();

    if (query.length < 2) return;

    // 🛑 EL DICCIONARIO SALVAVIDAS (ARSENAL AMPLIADO) 🛑
    const overrides: Record<string, string> = {
        // --- BALEARES Y CANARIAS (Correcciones clásicas) ---
        "palma de mallorca": "Palma, Illes Balears",
        "palma": "Palma, Illes Balears",
        "mallorca": "Mallorca, Illes Balears",
        "ibiza": "Eivissa, Illes Balears",
        "eivissa": "Eivissa, Illes Balears",
        "menorca": "Menorca, Illes Balears",
        "formentera": "Formentera, Illes Balears",
        "tenerife": "Isla de Tenerife, Canarias",
        "gran canaria": "Las Palmas de Gran Canaria",
        "lanzarote": "Isla de Lanzarote, Canarias",

        // --- CIUDADES GEMELAS (Bloqueo antimisiles para no acabar en América) ---
        "cordoba": "Córdoba, Andalucía, España",
        "toledo": "Toledo, Castilla-La Mancha, España",
        "merida": "Mérida, Extremadura, España",
        "cartagena": "Cartagena, Región de Murcia, España",
        "santiago": "Santiago de Compostela, Galicia, España",
        "santiago de compostela": "Santiago de Compostela, Galicia, España",
        "san sebastian": "Donostia-San Sebastián, País Vasco",
        "donostia": "Donostia-San Sebastián, País Vasco",
        "vitoria": "Vitoria-Gasteiz, País Vasco",
        "alicante": "Alicante, Comunitat Valenciana, España",
        "valencia": "Valencia, Comunitat Valenciana, España", // Hay una en Venezuela

        // --- HOTSPOTS DE LUJO Y REAL ESTATE (Precisión Quirúrgica) ---
        "la zagaleta": "La Zagaleta, Benahavís, Málaga",
        "sotogrande": "Sotogrande, San Roque, Cádiz",
        "puerto banus": "Puerto Banús, Marbella, Málaga",
        "la moraleja": "La Moraleja, Alcobendas, Madrid",
        "la finca": "La Finca, Pozuelo de Alarcón, Madrid",
        "barrio de salamanca": "Barrio de Salamanca, Madrid",
        "baqueira": "Baqueira Beret, Lleida",
        "valderrama": "Club de Golf Valderrama, San Roque, Cádiz",
        "altea hills": "Altea Hills, Altea, Alicante",

        // --- ESTADIOS Y CATEDRALES ---
        "santiago bernabeu": "Estadio Santiago Bernabéu, Madrid",
        "bernabeu": "Estadio Santiago Bernabéu, Madrid",
        "estadio santiago bernabeu": "Estadio Santiago Bernabéu, Madrid",
        "camp nou": "Spotify Camp Nou, Barcelona",
        "spotify camp nou": "Spotify Camp Nou, Barcelona",
        "metropolitano": "Estadio Cívitas Metropolitano, Madrid",
        "wanda metropolitano": "Estadio Cívitas Metropolitano, Madrid",
        "mestalla": "Estadio de Mestalla, Valencia",
        "san mames": "Estadio San Mamés, Bilbao",
        "rico perez": "Estadio José Rico Pérez, Alicante",
        "estadio rico perez": "Estadio José Rico Pérez, Alicante",
        "sagrada familia": "La Sagrada Familia, Barcelona",
        "alhambra": "La Alhambra, Granada",

        // --- AEROPUERTOS TÁCTICOS ---
        "barajas": "Aeropuerto Adolfo Suárez Madrid-Barajas",
        "el prat": "Aeropuerto Josep Tarradellas Barcelona-El Prat",

        // --- ABREVIATURAS Y CÓDIGOS DE USUARIO ---
        "bcn": "Barcelona, España",
        "mad": "Madrid, España",
        "vlc": "Valencia, España"
    };

    const finalQuery = overrides[query] || query;

    console.log(`🚀 RADAR ACTIVADO. Objetivo: "${finalQuery}"`);

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(finalQuery)}.json?access_token=${mapboxgl.accessToken}&language=es&limit=10`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        
        const sortedFeatures = data.features.sort((a: any, b: any) => {
            const rank: any = { 'place': 100, 'poi': 90, 'region': 80, 'locality': 70, 'neighborhood': 60, 'district': 50, 'postcode': 40, 'address': 10 };
            const scoreA = (rank[a.place_type[0]] || 0) + (a.relevance * 50);
            const scoreB = (rank[b.place_type[0]] || 0) + (b.relevance * 50);
            return scoreB - scoreA;
        });

        const bestMatch = sortedFeatures[0];
        const type = bestMatch.place_type[0];

        console.log(`✅ ATERRIZANDO EN: ${bestMatch.place_name} (Tipo: ${type})`);

      // 🚁 MANIOBRAS DE VUELO
        if (bestMatch.bbox && ['country', 'region', 'place', 'district', 'locality'].includes(type)) {
           // Vuelo general para ciudades
           
           // 🔥 EL SECRETO: Leer la cámara antes de encuadrar
           const currentPitch = map.current.getPitch();
           const currentBearing = map.current.getBearing();

           map.current.fitBounds(bestMatch.bbox, { 
               padding: 50, 
               duration: 3000, 
               pitch: currentPitch,     // <-- EVITA QUE SE PONGA RECTO
               bearing: currentBearing, // <-- EVITA QUE GIRE AL NORTE DE GOLPE
               essential: true 
           });
        } else {
           // --- CONFIGURACIÓN DE CÁMARA POR DEFECTO ---
           // ... (El resto de su código hacia abajo se queda igual)
           // --- CONFIGURACIÓN DE CÁMARA POR DEFECTO ---
           let targetZoom = 16.5; 
           let targetPitch = 60;
           let targetBearing = -10;
           let flightSpeed = 1.5;

           // 🎬 EL MODO DRON (SOLO PARA ESTADIOS Y MONUMENTOS) 🎬
           if (type === 'poi') {
               targetZoom = 17.8;        // Zoom ultra cercano
               targetPitch = 75;         // Inclinación máxima (cámara casi a ras de suelo)
               targetBearing = 120;      // Giro de cámara dramático (la cámara rotará mientras vuela)
               flightSpeed = 0.6;        // Vuelo muy lento y majestuoso
               console.log("🚁 MODO DRON CINEMÁTICO DESPLEGADO");
           } 
           // MODO CALLE EXACTA
           else if (type === 'address') {
               targetZoom = 18.5; 
               targetPitch = 65;
           }
           
           // Ejecutar el vuelo con los parámetros elegidos
           map.current.flyTo({ 
               center: bestMatch.center, 
               zoom: targetZoom, 
               pitch: targetPitch, 
               bearing: targetBearing, 
               speed: flightSpeed, 
               curve: 1.2, // Curva de vuelo más suave
               essential: true 
           });
        }
      } else {
          console.warn("❌ Radar: Destino no encontrado.");
      }
    } catch (error) {
      console.error("🚨 Error:", error);
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

     // 1. GEO BLINDADO (Sin falsos Madriles)
      let baseCoords = null; 

      // A. Buscamos en todas las formas posibles que tiene la base de datos de mandarlo
      if (formData.coordinates && Array.isArray(formData.coordinates) && formData.coordinates.length === 2) {
          baseCoords = formData.coordinates;
      } else if (formData.lng && formData.lat) {
          baseCoords = [Number(formData.lng), Number(formData.lat)];
      } else if (formData.longitude && formData.latitude) {
          baseCoords = [Number(formData.longitude), Number(formData.latitude)];
      } else if (formData.address) {
          // B. Último recurso táctico: Radar de emergencia (Geocoding)
          try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(formData.address)}.json?access_token=${mapboxgl.accessToken}&country=es`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.features?.[0]) {
                baseCoords = data.features[0].center;
            }
          } catch (e) { console.error("Geo Error:", e); }
      }

      // 🚫 PROTOCOLO DE EXTERMINIO: Si después de todo NO hay coordenadas, ABORTAMOS.
      // (Es mejor no dibujar nada, que dibujarlo en una ciudad equivocada).
      if (!baseCoords || isNaN(baseCoords[0]) || isNaN(baseCoords[1])) {
          console.warn("🚫 Fallo crítico de Coordenadas en la nueva propiedad. Abortando inserción visual.");
          return;
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

   // 3. CONSTRUIR FEATURE GEOJSON (ENVASE AL VACÍO ANTI-AMNESIA) 🔥
      
      // Serializamos los objetos complejos para que Mapbox no los destruya
      const openHouseJson = formData.openHouse ? JSON.stringify(formData.openHouse) : (formData.open_house_data ? JSON.stringify(formData.open_house_data) : null);
      const activeCampaignJson = formData.activeCampaign ? JSON.stringify(formData.activeCampaign) : null;
      const b2bJson = formData.b2b ? JSON.stringify(formData.b2b) : null;
      
      const userObj = formData.user && typeof formData.user === 'object' ? formData.user : null;
      const ownerSnapObj = formData.ownerSnapshot && typeof formData.ownerSnapshot === 'object' ? formData.ownerSnapshot : null;
      const userJson = userObj ? JSON.stringify(userObj) : null;
      const ownerSnapJson = ownerSnapObj ? JSON.stringify(ownerSnapObj) : userJson;

      const newFeature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: baseCoords }, // Asegúrese de que aquí dice baseCoords o finalCoords (como lo tenga arriba)
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
          
          img: formData.img || (formData.images && formData.images.length > 0 ? formData.images[0] : null),
          images: formData.images || [], 

          // 🔥 INYECCIÓN BLINDADA (Mapbox guardará los textos sin romperlos)
          user: userJson,
          ownerSnapshot: ownerSnapJson,
          openHouse: openHouseJson,
          open_house_data: openHouseJson,
          activeCampaign: activeCampaignJson,
          b2b: b2bJson
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
            ['images', 'b2b', 'openHouse', 'open_house_data', 'activeCampaign', 'user', 'ownerSnapshot', 'specs', 'selectedServices'].forEach(key => {
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
  // H. ESCANER TÁCTICO (RADAR) - INTEGRADO Y BLINDADO 🔥
  // --------------------------------------------------------------------
  const scanVisibleProperties = () => {
    if (!map.current) return [];

    // 1. Obtener límites visuales actuales (El perímetro)
    const bounds = map.current.getBounds();
    const radarSource: any = map.current.getSource('properties');

    // 2. Si el mapa aún no ha cargado datos, abortamos misión
    if (!radarSource || !(radarSource as any)._data || !(radarSource as any)._data.features) return [];

    // 3. Filtrar y Formatear para el HUD
    const visibleProps = (radarSource as any)._data.features
      .filter((f: any) => {
        // Solo objetivos dentro del perímetro visual
        const [lng, lat] = f.geometry.coordinates;
        return bounds.contains([lng, lat]);
      })
      .map((f: any) => {
        const p = f.properties;

        // 🔥 DESEMPAQUETADO SEGURO: Leemos el array real de servicios
        let safeServices = [];
        if (typeof p.selectedServices === 'string') {
            try { safeServices = JSON.parse(p.selectedServices); } catch(e) {}
        } else if (Array.isArray(p.selectedServices)) {
            safeServices = p.selectedServices;
        }

        return {
          id: p.id,
          address: p.address || p.location || "Ubicación Privada",
          price: p.price || "Consultar",
          type: p.type || "Propiedad",
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          
          // Ahora sí cuenta los elementos reales del array, no las letras del texto
          gap: safeServices.length > 0 ? [] : ["Foto Pro", "Plano 3D"],
        };
      });

    return visibleProps;
  };

// --------------------------------------------------------------------
  // D. RADAR GLOBAL DINÁMICO (BOUNDING BOX + ANTI-SPAM) 🛡️
  // --------------------------------------------------------------------
  useEffect(() => {
    // 1. Si el mapa no existe físicamente, abortamos.
    if (!map.current) return;
    
    let debounceTimer: any = null; // ⏱️ El seguro del arma (Anti-Spam)

    const executeRadar = async () => {
      try {
        if (!map.current) return;

        // 1. LEER EL PERÍMETRO DE LA PANTALLA (El Bounding Box)
        const b = map.current.getBounds();
        
        // Ampliamos un 10% el margen de búsqueda para que al mover no haya huecos blancos en los bordes
        const bounds = {
            minLng: b.getWest() - 0.02,
            maxLng: b.getEast() + 0.02,
            minLat: b.getSouth() - 0.02,
            maxLat: b.getNorth() + 0.02
        };

        console.log("📡 RADAR: Escaneando sector actual...", bounds);
        
        // --- FASE 1: OBTENCIÓN DE DATOS (SOLO LO QUE SE VE EN PANTALLA) ---
        const response = await getGlobalPropertiesAction(bounds);
        const rawData = response.success ? response.data : [];

        // 🔥🔥🔥 CORTAFUEGOS TÁCTICO BLINDADO (FRONTEND) 🔥🔥🔥
        const serverData = rawData.filter((p: any) => {
            const status = String(p.status || "").toUpperCase();
            const isPremium = p.promotedTier === 'PREMIUM' || p.isPromoted === true;
            const isManaged = p.assignment && p.assignment.status === 'ACTIVE';
            
            // REGLA DE ORO: Pasan Publicadas, Gestionadas, y Premium
            return status === "PUBLICADO" || status === "MANAGED" || status === "ACCEPTED" || isPremium || isManaged;
        });

        // --- FASE 2: NORMALIZACIÓN Y ANTI-DUPLICADOS ---
        const uniqueMap = new Map();
        serverData.forEach((p: any) => {
            uniqueMap.set(String(p.id), { ...p, source: 'CLOUD_DB' });
        });
        const unifiedList = Array.from(uniqueMap.values());

        // 🔥 CABLE DE COMUNICACIÓN AL RADAR LATERAL 🔥
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('stratos-inventory-ready', { detail: unifiedList }));
            
            // 2. Contestador automático
            window.addEventListener('request-stratos-inventory', () => {
                window.dispatchEvent(new CustomEvent('stratos-inventory-ready', { detail: unifiedList }));
            }, { once: true }); // Usamos once:true para no acumular listeners al mover el mapa
        }
       
        // --- FASE 3: GEOMETRÍA (Espirales para evitar superposición) ---
        const coordTracker = new Map<string, number>(); 

        const features = unifiedList.map((p: any) => {
            let lng = Number(p.coordinates ? p.coordinates[0] : (p.lng ?? p.longitude));
            let lat = Number(p.coordinates ? p.coordinates[1] : (p.lat ?? p.latitude));
            
            if (!lng || !lat || isNaN(lng) || isNaN(lat)) return null;

            const coordKey = `${lng.toFixed(4)},${lat.toFixed(4)}`;
            const count = coordTracker.get(coordKey) || 0;
            
            if (count > 0) {
                const angle = count * (Math.PI * 2 / 5); 
                const separation = 0.0003; 
                const radius = separation * (1 + Math.floor(count / 5)); 
                lng += Math.cos(angle) * radius;
                lat += Math.sin(angle) * radius;
            }
            coordTracker.set(coordKey, count + 1);

            const safeImage = p.mainImage || (p.images && p.images.length > 0 ? (p.images[0].url || p.images[0]) : null);
            const finalM2 = Number(p.mBuilt || p.m2 || p.surface || 0);

            const identityObj = (p?.user && typeof p.user === "object" ? p.user : null) || (p?.ownerSnapshot && typeof p.ownerSnapshot === "object" ? p.ownerSnapshot : null);
            const identityJson = identityObj ? JSON.stringify(identityObj) : null;
            const ownerSnapJson = (p?.ownerSnapshot && typeof p.ownerSnapshot === "object") ? JSON.stringify(p.ownerSnapshot) : identityJson;

            const openHouseJson = p.openHouse ? JSON.stringify(p.openHouse) : (p.openHouses && p.openHouses[0] ? JSON.stringify(p.openHouses[0]) : null);
            const activeCampaignJson = p.activeCampaign ? JSON.stringify(p.activeCampaign) : (p.campaigns && p.campaigns[0] ? JSON.stringify(p.campaigns[0]) : null);
            const b2bJson = p.b2b ? JSON.stringify(p.b2b) : null;

            return {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [lng, lat] },
                properties: {
                    ...p,
                    id: String(p.id),
                    priceValue: Number(p.rawPrice || p.priceValue || p.price || 0),
                    img: safeImage,
                    m2: finalM2,       
                    mBuilt: finalM2,   
                    elevator: isYes(p.elevator),
                    address: p.address || null,
                    city: p.city || null,
                    postcode: p.postcode || null,
                    region: p.region || null,
                    communityFees: p.communityFees,
                    energyConsumption: p.energyConsumption,
                    energyEmissions: p.energyEmissions,
                    energyPending: p.energyPending,
                    user: identityJson,
                    ownerSnapshot: ownerSnapJson,
                    role: p?.role ?? identityObj?.role ?? null,
                    openHouse: openHouseJson,
                    open_house_data: openHouseJson,
                    activeCampaign: activeCampaignJson,
                    b2b: b2bJson
                }
            };
        }).filter(Boolean); 
       
        // --- FASE 4: INYECCIÓN SEGURA (Bucle de reintento) ---
        const injectSafely = (attempts = 0) => {
            if (!map.current) return;
            const source: any = map.current.getSource('properties');

            if (source) {
                source.setData({ type: 'FeatureCollection', features: features });
                console.log(`✅ RADAR: ${features.length} activos cargados en la zona actual.`);

                if (map.current) {
                    map.current.once('idle', () => { try { updateMarkers(); } catch (e) {} });
                }
                setTimeout(() => { try { updateMarkers(); } catch (e) {} }, 350);
            } else if (attempts < 10) {
                setTimeout(() => injectSafely(attempts + 1), 500);
            }
        };

        injectSafely();

      } catch (e) { console.error("❌ Fallo crítico en radar:", e); }
    };

    // 🎯 DISPARADORES
    if (isLoaded) {
        executeRadar();
    } else {
        map.current.once('load', executeRadar);
    }

    // 🎯 GATILLO INTELIGENTE AL MOVER EL MAPA (El verdadero Bounding Box)
    const onMapMoveEnd = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            executeRadar();
        }, 600); // Espera 0.6 seg tras dejar de mover el mapa
    };

    map.current.on('moveend', onMapMoveEnd);
    window.addEventListener('force-map-refresh', executeRadar);
    
    // Limpieza al desmontar
    return () => {
        if (map.current) map.current.off('moveend', onMapMoveEnd);
        window.removeEventListener('force-map-refresh', executeRadar);
        if (debounceTimer) clearTimeout(debounceTimer);
    };

  }, [isLoaded]); // Fin del useEffect
 // --------------------------------------------------------------------
  // 🏢 3. RADAR DE AGENCIAS VIP (AHORA EN EL MOTOR DE GRAVEDAD)
  // --------------------------------------------------------------------
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const loadVipAgencies = async () => {
      try {
        console.log("👑 RADAR VIP: Metiendo cacahuetes en el bote dorado...");
        const response = await getVipAgenciesAction(); 
        const agencies = response?.success ? response.data : [];

        // Empaquetado GeoJSON para el motor físico
        const features = agencies.map((agency: any) => {
            if (!agency.coordinates || !agency.coordinates[0] || !agency.coordinates[1]) return null;
            return {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: agency.coordinates },
                properties: {
                    uniqueMarkerId: `${agency.id}-${agency.targetZone}`,
                    agencyRawData: JSON.stringify(agency) 
                }
            };
        }).filter(Boolean);

        const source: any = map.current.getSource('vip-agencies');
        if (source) {
            source.setData({ type: 'FeatureCollection', features: features });
            
            // ⏳ Forzamos repintado de los marcadores sueltos asegurando que el mapa esté listo
            map.current.once('idle', () => {
                if (typeof updateVipMarkers === 'function') {
                    updateVipMarkers();
                }
            }); 
        }
      } catch (e) { console.error("Error cargando Agencias VIP:", e); }
    };

    loadVipAgencies();
    window.addEventListener('reload-vip-agencies', loadVipAgencies);
    return () => window.removeEventListener('reload-vip-agencies', loadVipAgencies);

  }, [isLoaded]);

  // 🔥🔥🔥 WEBSOCKETS: RADAR DE MAPA EN VIVO 🔥🔥🔥
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    // Nos suscribimos al canal global donde aterrizan las propiedades
    const channel = pusher.subscribe('stratos-global');

    // Escuchamos si cae un misil con una nueva propiedad
    channel.bind('new-property', (newProp: any) => {
      console.log("🛸 [PUSHER] ¡Nueva propiedad detectada en el espacio aéreo!", newProp.id);
      
      // Disparamos la misma señal interna que ya usaba su sistema para añadir propiedades sin recargar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('add-property-signal', { detail: newProp }));
      }
    });

    return () => {
      channel.unbind('new-property');
      pusher.unsubscribe('stratos-global');
    };
  }, []);

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