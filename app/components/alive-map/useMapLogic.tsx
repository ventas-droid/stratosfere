
"use client";

import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { parseOmniSearch, CONTEXT_CONFIG } from './smart-search';
import MapNanoCard from './ui-panels/MapNanoCard';
import VipAgencyMarker from './ui-panels/VipAgencyMarker';
import { getGlobalPropertiesAction } from '@/app/actions';

const STRATOS_PROPERTIES : any[] = [];
const IMAGES : any[] = [];


// 🔥 IMPORTACIÓN CORRECTA DEL RADAR VIP
import { getVipAgenciesAction } from '@/app/actions-zones';

// 📡 LA NUEVA ANTENA: IMPORTAMOS EL RECEPTOR ESPACIAL (Pusher)
import { getPusherClient } from '@/app/utils/pusher';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';
const MAPBOX_PIN_FONT = ['Arial Unicode MS Bold'];
const MAPBOX_CLUSTER_FONT = ['Arial Unicode MS Bold'];
// ✅ Helper universal: true / "true" / 1 / "1" / "sí" / "si" / "yes" / "on"
const isYes = (val: any) => {
  if (val === true || val === 1) return true;
  if (val === false || val === 0) return false;
  if (val === null || val === undefined) return false;
  const s = String(val).toLowerCase().trim();
  return ['true', '1', 'yes', 'si', 'sí', 'on'].includes(s);
};
const FIRE_WAVE_FILTER: any = [
  'all',
  ['!', ['has', 'point_count']],
  [
    'any',
    ['==', ['get', 'isFire'], true],
    ['==', ['get', 'isFire'], 'true'],
    ['==', ['get', 'promotedTier'], 'PREMIUM'],
    ['==', ['get', 'isPromoted'], true],
    ['==', ['get', 'isPromoted'], 'true']
  ]
];
// ----------------------------------------------------------------------
// 2. LÓGICA DEL MAPA (CEREBRO CENTRAL)
// ----------------------------------------------------------------------
export const useMapLogic = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const agencyMarkersRef = useRef<any>({});
  
  // 🔥 BÚNKER TÁCTICO: Almacena las tropas originales para no borrarlas al filtrar
  const masterRadarDataRef = useRef<any[]>([]);

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
      zoom: 16, 
      pitch: 75, 
      bearing: -20,
      antialias: true,
      projection: 'globe'
    });

   // 🚀 CONFIGURACIÓN DE ALTO NIVEL (FUERZA BRUTA 3D)
    map.current.on('style.import.load', () => {
        map.current.setConfigProperty('basemap', 'show3dObjects', true);
        map.current.setConfigProperty('basemap', 'showLandmarks', true);
        
        const hour = new Date().getHours();
        let currentLighting = 'day'; 
        
        if (hour >= 20 || hour < 7) {
            currentLighting = 'night';
        } else if (hour >= 18) {
            currentLighting = 'dusk'; 
        } else if (hour >= 7 && hour < 9) {
            currentLighting = 'dawn'; 
        }
        
        map.current.setConfigProperty('basemap', 'lightPreset', currentLighting); 
        map.current.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
        map.current.setConfigProperty('basemap', 'showTransitLabels', false);
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }),
      'bottom-left'
    );

    map.current.on('load', () => {
      console.log("🟢 SISTEMA CARGADO");
      setIsLoaded(true);

     // 1. FUENTE DE DATOS (INICIALIZACIÓN ESTRUCTURAL)
      if (map.current.getSource('properties')) {
        (map.current.getSource('properties') as any).setData({ type: 'FeatureCollection', features: [] });
      } else {
        map.current.addSource('properties', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          cluster: true,
          clusterMaxZoom: 17,
          clusterRadius: 60
        });
      }

      // Capa: Círculos Azules (Agrupaciones)
      if (!map.current.getLayer('clusters')) {
        map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'properties',
          filter: ['has', 'point_count'],
      paint: {
  'circle-color': '#00B8DB',
  'circle-radius': ['step', ['get', 'point_count'], 25, 100, 35, 750, 45],
  'circle-stroke-width': 1.15,
  'circle-stroke-color': '#000000',
  'circle-stroke-opacity': 0.72,
  'circle-opacity': 0.24,
  'circle-emissive-strength': 0.9
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
  'text-font': MAPBOX_CLUSTER_FONT,
  'text-size': 16,
  'text-offset': [0, 0]
},
paint: {
  'text-color': '#ffffff',
  'text-emissive-strength': 1,
  'text-halo-color': 'rgba(0,0,0,0.18)',
  'text-halo-width': 0.9,
  'text-halo-blur': 0.4
}
        });
      }
      // =================================================================
      // 🔥 ONDAS NATIVAS MAPBOX SOLO PARA PINS FUEGO
      // =================================================================
      if (!map.current.getLayer('fire-wave-outer')) {
        map.current.addLayer({
          id: 'fire-wave-outer',
          type: 'circle',
          source: 'properties',
          filter: FIRE_WAVE_FILTER,
       paint: {
  'circle-radius': 15,
  'circle-color': '#ff7a00',
  'circle-opacity': 0.18,
  'circle-stroke-width': 3,
  'circle-stroke-color': '#ffd45c',
  'circle-stroke-opacity': 0.62,
  'circle-blur': 0.08,
  'circle-emissive-strength': 1.65
}
        });
      }
if (!map.current.getLayer('fire-wave-inner')) {
  map.current.addLayer({
    id: 'fire-wave-inner',
    type: 'circle',
    source: 'properties',
    filter: FIRE_WAVE_FILTER,
    paint: {
      'circle-radius': 11,
      'circle-color': '#ff5a1f',
      'circle-opacity': 0.14,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff0a0',
      'circle-stroke-opacity': 0.48,
      'circle-blur': 0.05,
      'circle-emissive-strength': 1.85
    }
  });
}
     if (!map.current.getLayer('fire-wave-core')) {
  map.current.addLayer({
    id: 'fire-wave-core',
    type: 'circle',
    source: 'properties',
    filter: [
      'all',
      ['!', ['has', 'point_count']],
      [
        'any',
        ['==', ['get', 'isFire'], true],
        ['==', ['get', 'promotedTier'], 'PREMIUM'],
        ['==', ['get', 'isPromoted'], true]
      ]
    ],
  paint: {
  'circle-radius': 5,
  'circle-color': '#ffb300',
  'circle-opacity': 0.16,
  'circle-blur': 0.62,
  'circle-emissive-strength': 2.05
}
  });
}
// =================================================================
      // 🎨 1. CLONACIÓN EXACTA (DISEÑO NATIVO REACT)
      // =================================================================
    const loadSafePill = (id, bgColor) => {
  const isFire = id === 'pin-fire';

  // 🔧 Solo rebajamos las normales
  const w = isFire ? 120 : 96;
  const h = isFire ? 46 : 34; 
        
  let svg = '';

  if (isFire) {
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <linearGradient id="fireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24" />
            <stop offset="100%" stop-color="#ef4444" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#ef4444" flood-opacity="0.6"/>
          </filter>
        </defs>
        <path d="M 16 1.5 L 104 1.5 A 14.5 14.5 0 0 1 104 30.5 L 68 30.5 L 60 39.5 L 52 30.5 L 16 30.5 A 14.5 14.5 0 0 1 16 1.5 Z" 
              fill="url(#fireGrad)" stroke="#fed7aa" stroke-width="3" filter="url(#glow)"/>
      </svg>
    `;
  } else {
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.4" stdDeviation="1.15" flood-color="#000000" flood-opacity="0.18"/>
          </filter>
        </defs>
        <path d="M 14 2 L 82 2 A 11 11 0 0 1 82 24 L 54 24 L 48 32 L 42 24 L 14 24 A 11 11 0 0 1 14 2 Z" 
              fill="${bgColor}" stroke="#ffffff" stroke-width="2.4" filter="url(#shadow)"/>
      </svg>
    `;
  }
        
  const encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
  const img = new Image(w, h);
  img.onload = () => {
    if (map.current && !map.current.hasImage(id)) map.current.addImage(id, img);
  };
  img.src = encoded;
};

      loadSafePill('pin-green', '#34C759');
      loadSafePill('pin-blue', '#30B0C7');
      loadSafePill('pin-yellow', '#FFD60A');
      loadSafePill('pin-orange', '#FF9500');
      loadSafePill('pin-pink', '#FF2D55');
      loadSafePill('pin-purple', '#AF52DE');
      loadSafePill('pin-fire', null); 


      
      // =================================================================
      // 🚀 CAPA 1: SOLO EL FONDO DE LA PASTILLA (El Escudo)
      // =================================================================
      if (!map.current.getLayer('unclustered-point-bg')) {
        map.current.addLayer({
          id: 'unclustered-point-bg',
          type: 'symbol', 
          source: 'properties',
          filter: ['!', ['has', 'point_count']],
          layout: {
            'icon-image': [
              'case',
              ['==', ['get', 'isFire'], true], 'pin-fire',
              ['==', ['get', 'promotedTier'], 'PREMIUM'], 'pin-fire',
              ['==', ['get', 'isPromoted'], true], 'pin-fire',
              ['<', ['to-number', ['coalesce', ['get', 'priceValue'], ['get', 'rawPrice'], 0]], 3500], 'pin-green',
              ['<', ['to-number', ['coalesce', ['get', 'priceValue'], ['get', 'rawPrice'], 0]], 200000], 'pin-blue',
              ['<', ['to-number', ['coalesce', ['get', 'priceValue'], ['get', 'rawPrice'], 0]], 550000], 'pin-yellow',
              ['<', ['to-number', ['coalesce', ['get', 'priceValue'], ['get', 'rawPrice'], 0]], 1200000], 'pin-orange',
              ['<', ['to-number', ['coalesce', ['get', 'priceValue'], ['get', 'rawPrice'], 0]], 3000000], 'pin-pink',
              'pin-purple'
            ],
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-anchor': 'bottom' // El pico toca la calle
          }
        });
      }

    // =================================================================
      // 🚀 CAPA 2: SOLO EL TEXTO (El Francotirador)
      // =================================================================
      if (!map.current.getLayer('unclustered-point-text')) {
        map.current.addLayer({
          id: 'unclustered-point-text',
          type: 'symbol', 
          source: 'properties',
          filter: ['!', ['has', 'point_count']],
       layout: {
  'text-field': ['coalesce', ['get', 'formattedPrice'], ['get', 'price']],
  'text-font': MAPBOX_PIN_FONT,
  'text-size': [
    'case',
    [
      'any',
      ['==', ['get', 'isFire'], true],
      ['==', ['get', 'isFire'], 'true'],
      ['==', ['get', 'promotedTier'], 'PREMIUM'],
      ['==', ['get', 'isPromoted'], true],
      ['==', ['get', 'isPromoted'], 'true']
    ],
    14,
    12.2
  ],
  'text-offset': [
    'case',
    [
      'any',
      ['==', ['get', 'isFire'], true],
      ['==', ['get', 'isFire'], 'true'],
      ['==', ['get', 'promotedTier'], 'PREMIUM'],
      ['==', ['get', 'isPromoted'], true],
      ['==', ['get', 'isPromoted'], 'true']
    ],
    ['literal', [0, -2.16]],
    ['literal', [0, -1.73]]
  ],
  'text-anchor': 'center',
  'text-max-width': 20,
  'text-allow-overlap': true,
  'text-ignore-placement': true
},
paint: {
  'text-color': '#ffffff',
  'text-opacity': 1,
  'text-halo-color': [
    'case',
    ['==', ['get', 'isFire'], true], 'rgba(255,184,0,0.26)',
    'rgba(255,255,255,0.10)'
  ],
  'text-halo-width': [
    'case',
    ['==', ['get', 'isFire'], true], 1.15,
    0.8
  ],
  'text-halo-blur': 0.45
}
        });
      }
  
  
  
      // =================================================================
      // 🖱️ 3. RADAR DE PROXIMIDAD (HOVER PARA TARJETA, CLIC PARA DETALLES)
      // =================================================================
      
      // Variables tácticas para controlar que no se abran 200 tarjetas a la vez
      let activePopup: any = null;
      let activeRoot: any = null;
      let hoverTimeout: any = null;

      // 🎯 1. AL PASAR EL RATÓN (ABRE LA NANOCARD)
      map.current.on('mouseenter', 'unclustered-point-bg', (e: any) => { 
        map.current.getCanvas().style.cursor = 'pointer'; 
        if (hoverTimeout) clearTimeout(hoverTimeout);

        const features = map.current.queryRenderedFeatures(e.point, { layers: ['unclustered-point-bg'] });
        if (!features.length) return;
        
        const feature = features[0];
        const p = { ...feature.properties };
        
        // Si ya está abierta esta misma tarjeta, no hacemos nada
        if (activePopup && activePopup._stratosId === p.id) return;

        // Si hay otra abierta, la destruimos
        if (activePopup) {
            activePopup.remove();
            if (activeRoot) setTimeout(() => activeRoot.unmount(), 300);
        }

        const coordinates = feature.geometry.coordinates.slice();
        const parseMaybeJSON = (v: any) => { if (typeof v === 'string') { try { return JSON.parse(v); } catch(err){} } return v; };
        
        p.user = parseMaybeJSON(p.user); p.ownerSnapshot = parseMaybeJSON(p.ownerSnapshot);
        p.openHouse = parseMaybeJSON(p.openHouse); p.open_house_data = parseMaybeJSON(p.open_house_data) || p.openHouse;
        p.activeCampaign = parseMaybeJSON(p.activeCampaign); p.b2b = parseMaybeJSON(p.b2b);
        p.selectedServices = parseMaybeJSON(p.selectedServices) || []; p.specs = parseMaybeJSON(p.specs) || {};
        let safeImages: any[] = []; if (typeof p.images === 'string') { try { safeImages = JSON.parse(p.images); } catch(err){} }

        const el = document.createElement("div");
        el.className = "z-[99999]"; 
        activeRoot = createRoot(el);
        
        activeRoot.render(
          <MapNanoCard
            id={p.id || Date.now().toString()} data={p} forceOpen={true} promotedTier={p.promotedTier}
            isPromoted={p.isPromoted} isFire={p.isFire} price={p.price} priceValue={p.priceValue}
            rawPrice={p.priceValue} rooms={p.rooms} baths={p.baths} mBuilt={p.mBuilt} m2={p.m2} 
            selectedServices={p.selectedServices} elevator={p.elevator} specs={p.specs}
            type={p.type || 'Propiedad'} img={p.img} images={safeImages} lat={coordinates[1]} lng={coordinates[0]} 
            role={p.role} title={p.title} description={p.description} address={p.address} city={p.city} 
            postcode={p.postcode} region={p.region} communityFees={p.communityFees} energyConsumption={p.energyConsumption}
            energyEmissions={p.energyEmissions} energyPending={p.energyPending} openHouse={p.openHouse}
            activeCampaign={p.activeCampaign} b2b={p.b2b}
          />
        );

        // 🚀 EL TRUCO ANTICOLISIÓN: Elevamos el popup 42px (o 50px si es Fuego) para que no tape el pin
        const elevacion = p.isFire ? 50 : 42;

        activePopup = new mapboxgl.Popup({ 
            closeButton: false, 
            closeOnClick: false, 
            offset: { 'bottom': [0, -elevacion], 'bottom-left': [0, -elevacion], 'bottom-right': [0, -elevacion] }, 
            maxWidth: 'none', 
            className: 'st-nano-popup' 
        })
        .setLngLat(coordinates as [number, number])
        .setDOMContent(el)
        .addTo(map.current);
        
        activePopup._stratosId = p.id;

        // 💥 DESTRUCCIÓN DEL FONDO BLANCO NATIVO Y CONTROL DE RETENCIÓN
        const popupElem = activePopup.getElement();
        if (popupElem) {
            const content = popupElem.querySelector('.mapboxgl-popup-content');
            if (content) { content.style.background = 'transparent'; content.style.boxShadow = 'none'; content.style.padding = '0'; }
            const tip = popupElem.querySelector('.mapboxgl-popup-tip');
            if (tip) tip.style.display = 'none';

            // Si el ratón entra en la tarjeta flotante, cancelamos el cierre automático
            popupElem.addEventListener('mouseenter', () => { if (hoverTimeout) clearTimeout(hoverTimeout); });
            // Si sale de la tarjeta flotante, la cerramos
            popupElem.addEventListener('mouseleave', () => {
                hoverTimeout = setTimeout(() => {
                    if (activePopup) { activePopup.remove(); activeRoot.unmount(); activePopup = null; }
                }, 200);
            });
        }
      });

      // 🎯 2. AL QUITAR EL RATÓN DEL PIN (CIERRA LA NANOCARD)
      map.current.on('mouseleave', 'unclustered-point-bg', () => { 
        map.current.getCanvas().style.cursor = ''; 
        // Le damos 200ms de margen por si el usuario está moviendo el ratón hacia la tarjeta para pulsar favoritos
        hoverTimeout = setTimeout(() => {
            if (activePopup) {
                activePopup.remove();
                if (activeRoot) activeRoot.unmount();
                activePopup = null;
            }
        }, 200);
      });

    // 🎯 3. AL HACER CLIC EN EL PIN (ABRE DETAILS Y VUELA)
map.current.on('click', 'unclustered-point-bg', (e: any) => {
  const features = map.current.queryRenderedFeatures(e.point, {
    layers: ['unclustered-point-text', 'unclustered-point-bg']
  });
  if (!features.length) return;

  const feature = features[0];
  const p = { ...feature.properties };
  const coordinates = feature.geometry.coordinates.slice();

  // 🧳 1. DESEMPAQUETADO SEGURO DE LA BASE DE DATOS
  const parseJsonSafe = (v: any) => {
    if (typeof v === 'string') {
      try { return JSON.parse(v); } catch (err) {}
    }
    return v;
  };
        
        p.user = parseJsonSafe(p.user);
        p.ownerSnapshot = parseJsonSafe(p.ownerSnapshot);
        p.openHouse = parseJsonSafe(p.openHouse);
        p.open_house_data = parseJsonSafe(p.open_house_data) || p.openHouse;
        p.activeCampaign = parseJsonSafe(p.activeCampaign);
        p.campaigns = parseJsonSafe(p.campaigns);
        p.b2b = parseJsonSafe(p.b2b);
        p.selectedServices = parseJsonSafe(p.selectedServices) || [];
        p.specs = parseJsonSafe(p.specs) || {};
        const sourceImages = parseJsonSafe(p.images);

        // 📸 2. RECONSTRUCCIÓN DE IMÁGENES EXACTA A SU NANO CARD (El fallo estaba aquí)
        let finalAlbum: string[] = [];
        if (Array.isArray(sourceImages) && sourceImages.length > 0) {
            finalAlbum = sourceImages.map((i: any) => (typeof i === "string" ? i : i?.url || i)).filter(Boolean);
        } else {
            const backupImg = p.mainImage || p.img || p.image;
            if (backupImg) finalAlbum = [backupImg];
        }

        // 🤝 3. RECONSTRUCCIÓN DEL B2B
        let b2bData = p.b2b;
        if (!b2bData) {
            const ac = p.activeCampaign;
            if (ac) b2bData = { sharePct: Number(ac.commissionSharePct || 0), visibility: ac.commissionShareVisibility || 'PRIVATE' };
            else b2bData = { sharePct: Number(p.sharePct ?? 0), visibility: p.shareVisibility ?? 'PRIVATE' };
        }

        // 🏢 4. RECONSTRUCCIÓN DEL USUARIO/AGENCIA (Con Avatar y Cover)
        const safeActiveCampaign = p.activeCampaign || (Array.isArray(p.campaigns) ? p.campaigns[0] : null);
        let finalUser = p.user || p.ownerSnapshot || {};

        if (safeActiveCampaign && safeActiveCampaign.status === 'ACCEPTED' && safeActiveCampaign.agency) {
            const agency = safeActiveCampaign.agency;
            finalUser = {
                ...agency, id: agency.id, name: agency.companyName || agency.name || "Agencia Asociada", role: "AGENCIA",
                avatar: agency.companyLogo || agency.avatar || null, email: agency.email, phone: agency.mobile || agency.phone,
                mobile: agency.mobile, coverImage: agency.coverImage || null, companyName: agency.companyName,
                licenseNumber: agency.licenseNumber, website: agency.website
            };
        }

        // 💰 5. PRECIO SEGURO
        const currentPrice = Number(p.priceValue || p.rawPrice || 0);

       // 🧳 6. LA MALETA CLONADA Y PERFECTA LISTA PARA ENVIAR
        const payload = {
            ...p,
            id: String(p.id),
            
            // 🚀 EL RASTREADOR TÁCTICO: Número ligero para evitar el lag visual
            photoCount: Number(p.photoCount) || finalAlbum.length || 1,
            
            address: p.address || null,
            city: p.city || null,
            postcode: p.postcode || null,
            region: p.region || null,
            images: finalAlbum, // Array de Strings limpios
            img: finalAlbum[0] || null, // Primera imagen limpia para portada
            price: currentPrice,
            priceValue: currentPrice,
            b2b: b2bData,
            user: finalUser,
            realOwner: p.user,
            openHouse: p.openHouse,
            open_house_data: p.open_house_data,
            activeCampaign: safeActiveCampaign,
            promotedTier: (p.promotedTier === 'PREMIUM' || p.isPromoted) ? 'PREMIUM' : undefined
        };

        const strId = String(p.id || Date.now().toString());
        window.dispatchEvent(new CustomEvent("select-property-signal", { detail: { id: strId } }));
        (window as any).__currentOpenPropertyId = strId; 

        // 🚀 DISPARO LIMPIO AL PANEL LATERAL (Ya no fallará la carga)
        window.dispatchEvent(new CustomEvent("open-details-signal", { detail: payload })); 

        map.current.flyTo({ center: coordinates as [number, number], zoom: 18.5, pitch: 60, speed: 0.8 });
      });
      // =================================================================
      // 🖱️ INTERACTIVIDAD DE CLÚSTERES AZULES
      // =================================================================
      map.current.on('click', 'clusters', (e: any) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource('properties').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
          if (err) return;
map.current.flyTo({
  center: features[0].geometry.coordinates as [number, number],
  zoom,
  speed: 0.5
});      
  });
      });
      map.current.on('mouseenter', 'clusters', () => { map.current.getCanvas().style.cursor = 'pointer'; });
      map.current.on('mouseleave', 'clusters', () => { map.current.getCanvas().style.cursor = ''; });

   
      // =================================================================
      // 🔥 EL BOTE DE CACAHUETES DORADO (Capas VIP) 🔥 (INTACTO)
      // =================================================================
    if (!map.current.getSource('vip-agencies')) {
  map.current.addSource('vip-agencies', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
    cluster: true,
    clusterMaxZoom: 17,
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
      'circle-color': '#00B8DB',
      'circle-radius': ['step', ['get', 'point_count'], 25, 100, 35, 750, 45],
      'circle-stroke-width': 1.15,
      'circle-stroke-color': '#000000',
      'circle-stroke-opacity': 0.72,
      'circle-opacity': 0.24,
      'circle-emissive-strength': 0.9
    }
  });
}

     if (!map.current.getLayer('vip-cluster-count')) {
  map.current.addLayer({
    id: 'vip-cluster-count',
    type: 'symbol',
    source: 'vip-agencies',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': MAPBOX_CLUSTER_FONT,
      'text-size': 16,
      'text-offset': [0, 0]
    },
    paint: {
      'text-color': '#ffffff',
      'text-emissive-strength': 1
    }
  });
}

      map.current.on('click', 'vip-clusters', (e: any) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['vip-clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource('vip-agencies').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
          if (err) return;
          map.current.flyTo({ center: features[0].geometry.coordinates as [number, number], zoom, speed: 0.8 });
        });
      });
      map.current.on('mouseenter', 'vip-clusters', () => { map.current.getCanvas().style.cursor = 'pointer'; });
      map.current.on('mouseleave', 'vip-clusters', () => { map.current.getCanvas().style.cursor = ''; });

      // =================================================================
      // ⚙️ MOVIMIENTO Y SINCRONIZACIÓN FINAL
      // =================================================================
      map.current.on('moveend', () => {
          if (typeof updateVipMarkers === 'function') {
              updateVipMarkers();
          }
          const center = map.current.getCenter();
          window.dispatchEvent(new CustomEvent('map-center-updated', { detail: { lng: center.lng, lat: center.lat } }));
      });

      map.current.on('move', () => {
          const center = map.current.getCenter();
          window.dispatchEvent(new CustomEvent('map-center-updated', { detail: { lng: center.lng, lat: center.lat } }));
      });

      setTimeout(() => {
          if (map.current) {
              const initialCenter = map.current.getCenter();
              window.dispatchEvent(new CustomEvent('map-center-updated', { detail: { lng: initialCenter.lng, lat: initialCenter.lat } }));
          }
      }, 500);
      
    }); 
  }, []);
  // --------------------------------------------------------------------
  // 🔥 ANIMACIÓN NATIVA DE ONDAS PARA PINS FUEGO
  // --------------------------------------------------------------------
  useEffect(() => {
    if (!isLoaded || !map.current) return;

    let rafId = 0;
    let destroyed = false;

   const animateFireWaves = () => {
  if (!map.current || destroyed) return;

  const t = performance.now() * 0.0021;

  const outerPulse = (Math.sin(t) + 1) / 2;
  const innerPulse = (Math.sin(t + 1.05) + 1) / 2;
  const heat = (Math.sin(t * 1.45 + 0.35) + 1) / 2;

  const mix = (a: number, b: number, k: number) => a + (b - a) * k;
  const rgba = (r: number, g: number, b: number, a = 1) =>
    `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;

  // Vibración visible pero más elegante
  const outerColor = rgba(255, mix(122, 96, heat), mix(0, 18, heat), 1);
  const outerStroke = rgba(255, mix(212, 235, heat), mix(92, 120, heat), 1);

  const innerColor = rgba(255, mix(90, 62, heat), mix(10, 24, heat), 1);
  const innerStroke = rgba(255, mix(208, 248, heat), mix(120, 170, heat), 1);

  if (map.current.getLayer('fire-wave-outer')) {
    map.current.setPaintProperty('fire-wave-outer', 'circle-radius', 22 + outerPulse * 14);
    map.current.setPaintProperty('fire-wave-outer', 'circle-opacity', 0.18 - outerPulse * 0.11);
    map.current.setPaintProperty('fire-wave-outer', 'circle-stroke-opacity', 0.62 - outerPulse * 0.34);
    map.current.setPaintProperty('fire-wave-outer', 'circle-color', outerColor);
    map.current.setPaintProperty('fire-wave-outer', 'circle-stroke-color', outerStroke);
  }

  if (map.current.getLayer('fire-wave-inner')) {
    map.current.setPaintProperty('fire-wave-inner', 'circle-radius', 11 + innerPulse * 10);
    map.current.setPaintProperty('fire-wave-inner', 'circle-opacity', 0.14 - innerPulse * 0.08);
    map.current.setPaintProperty('fire-wave-inner', 'circle-stroke-opacity', 0.48 - innerPulse * 0.26);
    map.current.setPaintProperty('fire-wave-inner', 'circle-color', innerColor);
    map.current.setPaintProperty('fire-wave-inner', 'circle-stroke-color', innerStroke);
  }

  if (map.current.getLayer('fire-wave-core')) {
    map.current.setPaintProperty('fire-wave-core', 'circle-radius', 6 + heat * 1.8);
    map.current.setPaintProperty('fire-wave-core', 'circle-opacity', 0.16 + heat * 0.06);
    map.current.setPaintProperty('fire-wave-core', 'circle-color', rgba(255, mix(179, 205, heat), mix(0, 24, heat), 1));
  }

  rafId = requestAnimationFrame(animateFireWaves);
};
    rafId = requestAnimationFrame(animateFireWaves);

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
    };
  }, [isLoaded]);
  // ----------------------------------------------------------------------
  // 3. LÓGICA DE FILTRADO INTELIGENTE V2 (INTACTA)
  // ----------------------------------------------------------------------
  useEffect(() => {
    const handleFilterSignal = (e: any) => {
      if (!map.current || !map.current.getSource('properties')) return;

      const { priceMax, surfaceRange, type, specs, premiumOnly } = e.detail;
      const priceRange = { min: 0, max: priceMax || 999999999 };
   
      let masterFeatures: any[] = masterRadarDataRef.current || [];

      if (masterFeatures.length === 0) return;

      masterFeatures = masterFeatures.map((f: any) => {
        const p = f.properties || {};
        const idStr = String(p.id ?? p._id ?? f.id ?? Date.now());
        const priceValue = Number(p.priceValue ?? p.rawPrice ?? (typeof p.price === 'string' ? String(p.price).replace(/\D/g, '') : p.price) ?? 0);
        const m2 = Number(p.m2 ?? p.mBuilt ?? 0);
        const mBuilt = Number(p.mBuilt ?? p.m2 ?? 0);

        let safeServices = [];
        if (Array.isArray(p.selectedServices)) safeServices = p.selectedServices;
        else if (typeof p.selectedServices === 'string') { try { safeServices = JSON.parse(p.selectedServices); } catch(e) { safeServices = []; } }

        // 🔥 BLINDAJE TYPESCRIPT: Le decimos explícitamente que es de tipo "any"
        let safeSpecs: any = {};
        if (typeof p.specs === 'object' && p.specs !== null) safeSpecs = p.specs;
        else if (typeof p.specs === 'string') { try { safeSpecs = JSON.parse(p.specs); } catch(e) { safeSpecs = {}; } }

        return {
          ...f,
          properties: {
            ...p, id: idStr, priceValue, m2, mBuilt, selectedServices: safeServices, specs: safeSpecs,
            // 🔥 Añadimos (safeSpecs as any) por si TypeScript se pone pesado
            elevator: isYes(p.elevator) || isYes(p.ascensor) || isYes(p.hasElevator) || isYes((p?.specs as any)?.elevator) || isYes((safeSpecs as any)?.elevator)
          }
        };
      });

      const allData = masterFeatures.filter((f: any) => {
        const pid = f?.properties?.id ?? f?.properties?._id ?? f?.id;
        return pid !== undefined && pid !== null && String(pid).trim() !== "";
      });

      if (allData.length === 0) return;

      const baseFilteredFeatures = allData.filter(f => {
        const p = f.properties;
        if (premiumOnly === true || String(premiumOnly) === "true") {
           const tier = String(p.promotedTier || "").toUpperCase();
           const isPremium = tier === 'PREMIUM' || p.isPromoted === true || p.premium === true;
           if (!isPremium) return false;
        }

        if (p.priceValue < priceRange.min || p.priceValue > priceRange.max) return false;
        const m2 = p.m2 || Math.floor(p.priceValue / 4000);
        if (m2 < (surfaceRange?.min || 0) || m2 > (surfaceRange?.max || 99999999)) return false;

        if (specs) {
          if (specs.beds > 0 && (p.rooms || 0) < specs.beds) return false;
          if (specs.baths > 0 && (p.baths || 0) < specs.baths) return false;
          if (specs.features && specs.features.length > 0) {
            const safeServices = Array.isArray(p.selectedServices) ? p.selectedServices : [];
            const safeText = ` ${(p.title || '')} ${(p.description || '')} `.toUpperCase();

            const hasAllFeatures = specs.features.every((feat) => {
              if (feat === 'pool') return p.pool === true || safeServices.includes('pool') || safeText.includes('PISCINA');
              if (feat === 'garage') return p.garage === true || safeServices.includes('garage') || safeText.includes('GARAJE') || safeText.includes('PARKING');
              if (feat === 'garden') return p.garden === true || safeServices.includes('garden') || safeText.includes('JARDÍN') || safeText.includes('GARDEN');
              if (feat === 'security') return p.security === true || safeServices.includes('security') || safeText.includes('SEGURIDAD') || safeText.includes('VIGILANCIA');
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
        return true; 
      });

      let finalFeatures = baseFilteredFeatures.filter(f => {
          const pType = String(f.properties.type || "").toLowerCase().trim();
          const targetType = String(type || "all").toLowerCase().trim();
          
          if (targetType !== "all" && targetType !== "") {
              const typeDict: Record<string, string[]> = {
                  'flat': ['piso', 'apartamento', 'vivienda', 'planta baja', 'bajo'],
                  'penthouse': ['atico', 'penthouse', 'ático'],
                  'duplex': ['duplex', 'dúplex'],
                  'loft': ['loft', 'estudio'],
                  'villa': ['villa', 'chalet', 'casa', 'adosado', 'pareado', 'finca', 'mansion', 'mansión'],
                  'office': ['oficina', 'despacho', 'local'],
                  'land': ['suelo', 'terreno', 'parcela'],
                  'industrial': ['nave', 'industrial']
              };
              const validWords = typeDict[targetType] || [targetType];
              return validWords.some(w => pType.includes(w));
          }
          return true;
      });

      if (finalFeatures.length === 0 && String(type || "all").toLowerCase() !== "all") {
          finalFeatures = baseFilteredFeatures; 
      }

      const src: any = map.current.getSource('properties');
      if (src) src.setData({ type: 'FeatureCollection', features: finalFeatures });
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

      const currentPitch = map.current.getPitch();
      const currentBearing = map.current.getBearing();

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
  }, []);

  // --------------------------------------------------------------------
  // 🔥 EL DESPARRAMADOR VIP (Dibuja los HTML sueltos) 🔥 (INTACTO)
  // --------------------------------------------------------------------
  const updateVipMarkers = () => {
    const mapInstance = map.current;
    if (!mapInstance || !(mapInstance as any).getSource("vip-agencies")) return;

    const features = (mapInstance as any).querySourceFeatures("vip-agencies", { filter: ["!", ["has", "point_count"]] });
    const visibleIds = new Set(features.map((f: any) => String(f.properties.uniqueMarkerId)));

    Object.keys(agencyMarkersRef.current).forEach((id) => {
      if (!visibleIds.has(id)) {
        agencyMarkersRef.current[id].remove();
        delete agencyMarkersRef.current[id];
      }
    });

    features.forEach((feature: any) => {
      const id = String(feature.properties.uniqueMarkerId);
      if (agencyMarkersRef.current[id]) return;

      const el = document.createElement("div");
      el.className = "vip-agency-marker";
      const root = createRoot(el);
      
      const agencyData = JSON.parse(feature.properties.agencyRawData);
      const popDelay = (Math.random() * 0.25).toFixed(2);

      root.render(
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
  // E. BÚSQUEDA OMNI V10 (INTERCEPTOR TÁCTICO) 🇪🇸🛡️ (INTACTO)
  // --------------------------------------------------------------------
  const searchCity = async (rawQuery: any) => {
    if (!rawQuery || !map.current) return;

   let query = String(rawQuery || "").toLowerCase().trim();
   query = query
     .replace(/[0-9.,]+\s*(€|euros|euro|k|m|millon|millones)?/gi, " ")
     .replace(/\b\d+\s*(hab|habitacion|habitaciones|dorm|dormitorio|dormitorios|ban|baño|baños|aseo|aseos|m2|metros|mts)\b/gi, " ")
     .replace(/\b(quiero|buscar|busco|necesito|comprar|alquilar|ver|encontrar|zona|cerca de)\b/gi, " ")
     .replace(/\b(piso|casa|chalet|villa|atico|ático|penthouse|duplex|dúplex|loft|oficina|local|suelo|terreno|parcela|nave|industrial)\b/gi, " ")
     .replace(/\b(con|sin|para|de|del|la|el|los|las|un|una|y|o)\b/gi, " ")
     .replace(/\s+/g, " ")
     .trim();

    if (query.length < 2) return;

    const overrides: Record<string, string> = {
        "palma de mallorca": "Palma, Illes Balears", "palma": "Palma, Illes Balears", "mallorca": "Mallorca, Illes Balears",
        "ibiza": "Eivissa, Illes Balears", "eivissa": "Eivissa, Illes Balears", "menorca": "Menorca, Illes Balears",
        "formentera": "Formentera, Illes Balears", "tenerife": "Isla de Tenerife, Canarias", "gran canaria": "Las Palmas de Gran Canaria",
        "lanzarote": "Isla de Lanzarote, Canarias", "cordoba": "Córdoba, Andalucía, España", "toledo": "Toledo, Castilla-La Mancha, España",
        "merida": "Mérida, Extremadura, España", "cartagena": "Cartagena, Región de Murcia, España", "santiago": "Santiago de Compostela, Galicia, España",
        "santiago de compostela": "Santiago de Compostela, Galicia, España", "san sebastian": "Donostia-San Sebastián, País Vasco",
        "donostia": "Donostia-San Sebastián, País Vasco", "vitoria": "Vitoria-Gasteiz, País Vasco", "alicante": "Alicante, Comunitat Valenciana, España",
        "valencia": "Valencia, Comunitat Valenciana, España", "la zagaleta": "La Zagaleta, Benahavís, Málaga", "sotogrande": "Sotogrande, San Roque, Cádiz",
        "puerto banus": "Puerto Banús, Marbella, Málaga", "la moraleja": "La Moraleja, Alcobendas, Madrid", "la finca": "La Finca, Pozuelo de Alarcón, Madrid",
        "barrio de salamanca": "Barrio de Salamanca, Madrid", "baqueira": "Baqueira Beret, Lleida", "valderrama": "Club de Golf Valderrama, San Roque, Cádiz",
        "altea hills": "Altea Hills, Altea, Alicante", "santiago bernabeu": "Estadio Santiago Bernabéu, Madrid", "bernabeu": "Estadio Santiago Bernabéu, Madrid",
        "estadio santiago bernabeu": "Estadio Santiago Bernabéu, Madrid", "camp nou": "Spotify Camp Nou, Barcelona", "spotify camp nou": "Spotify Camp Nou, Barcelona",
        "metropolitano": "Estadio Cívitas Metropolitano, Madrid", "wanda metropolitano": "Estadio Cívitas Metropolitano, Madrid", "mestalla": "Estadio de Mestalla, Valencia",
        "san mames": "Estadio San Mamés, Bilbao", "rico perez": "Estadio José Rico Pérez, Alicante", "estadio rico perez": "Estadio José Rico Pérez, Alicante",
        "sagrada familia": "La Sagrada Familia, Barcelona", "alhambra": "La Alhambra, Granada", "barajas": "Aeropuerto Adolfo Suárez Madrid-Barajas",
        "el prat": "Aeropuerto Josep Tarradellas Barcelona-El Prat", "bcn": "Barcelona, España", "mad": "Madrid, España", "vlc": "Valencia, España"
    };

    const finalQuery = overrides[query] || query;

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

        window.dispatchEvent(new CustomEvent('set-epicenter', { detail: { lng: bestMatch.center[0], lat: bestMatch.center[1] } }));

        if (bestMatch.bbox && ['country', 'region', 'place', 'district', 'locality'].includes(type)) {
           const currentPitch = map.current.getPitch();
           const currentBearing = map.current.getBearing();
           map.current.fitBounds(bestMatch.bbox, { padding: 50, duration: 3000, pitch: currentPitch, bearing: currentBearing, essential: true });
        } else {
           let targetZoom = 16.5, targetPitch = 60, targetBearing = -10, flightSpeed = 1.5;
           if (type === 'poi') { targetZoom = 17.8; targetPitch = 75; targetBearing = 120; flightSpeed = 0.6; } 
           else if (type === 'address') { targetZoom = 18.5; targetPitch = 65; }
           
           map.current.flyTo({ center: bestMatch.center, zoom: targetZoom, pitch: targetPitch, bearing: targetBearing, speed: flightSpeed, curve: 1.2, essential: true });
        }
      }
    } catch (error) { console.error("🚨 Error:", error); }
  };

  // --------------------------------------------------------------------
  // C. RECEPTOR DE NUEVAS PROPIEDADES (ADD PROPERTY)
  // --------------------------------------------------------------------
  useEffect(() => {
    const handleNewProperty = async (event: any) => {
      const formData = event.detail;
      if (!map.current || !formData) return;

      let baseCoords = null; 
      if (formData.coordinates && Array.isArray(formData.coordinates) && formData.coordinates.length === 2) baseCoords = formData.coordinates;
      else if (formData.lng && formData.lat) baseCoords = [Number(formData.lng), Number(formData.lat)];
      else if (formData.longitude && formData.latitude) baseCoords = [Number(formData.longitude), Number(formData.latitude)];
      else if (formData.address) {
          try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(formData.address)}.json?access_token=${mapboxgl.accessToken}&country=es`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.features?.[0]) baseCoords = data.features[0].center;
          } catch (e) {}
      }

      if (!baseCoords || isNaN(baseCoords[0]) || isNaN(baseCoords[1])) return;
      
      const jitter = () => (Math.random() - 0.5) * 0.0004;
      const finalCoords = [baseCoords[0] + jitter(), baseCoords[1] + jitter()];

      let finalImage = null;
      if (formData.mainImage) finalImage = formData.mainImage;
      else if (Array.isArray(formData.images) && formData.images.length > 0) {
          const first = formData.images[0];
          finalImage = typeof first === 'string' ? first : first.url;
      } else if (formData.img) finalImage = formData.img;

      // 🔥 FORMATEAMOS EL PRECIO PARA QUE SUBA BIEN DESDE EL WEBSOCKET
      const priceValue = Number(formData.price || 0);
      const formattedPrice = new Intl.NumberFormat("es-ES").format(priceValue) + " €";

      const openHouseJson = formData.openHouse ? JSON.stringify(formData.openHouse) : (formData.open_house_data ? JSON.stringify(formData.open_house_data) : null);
      const activeCampaignJson = formData.activeCampaign ? JSON.stringify(formData.activeCampaign) : null;
      const b2bJson = formData.b2b ? JSON.stringify(formData.b2b) : null;
      const userObj = formData.user && typeof formData.user === 'object' ? formData.user : null;
      const ownerSnapObj = formData.ownerSnapshot && typeof formData.ownerSnapshot === 'object' ? formData.ownerSnapshot : null;
      const userJson = userObj ? JSON.stringify(userObj) : null;
      const ownerSnapJson = ownerSnapObj ? JSON.stringify(ownerSnapObj) : userJson;

     const newFeature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: finalCoords },       
        properties: {
          ...formData, id: String(formData.id), type: formData.type || 'Propiedad',
          price: `${formData.price}€`, 
          priceValue: priceValue,
          formattedPrice: formattedPrice, 
          m2: Number(formData.mBuilt || 0), mBuilt: Number(formData.mBuilt || 0),
          elevator: isYes(formData.elevator), selectedServices: Array.isArray(formData.selectedServices) ? formData.selectedServices : [],
          img: formData.img || (formData.images && formData.images.length > 0 ? formData.images[0] : null), 
          // 🔥 LO MISMO AQUÍ, EMPAQUETAMOS LAS FOTOS
          images: formData.images ? JSON.stringify(formData.images) : '[]', 
          user: userJson, ownerSnapshot: ownerSnapJson, openHouse: openHouseJson, open_house_data: openHouseJson, activeCampaign: activeCampaignJson, b2b: b2bJson
        }
      };

      const src: any = map.current.getSource('properties');
      if (src && (src as any)._data) {
        const currentFeatures = (src as any)._data.features || [];
        const others = currentFeatures.filter((f: any) => String(f.properties.id) !== String(formData.id));
        src.setData({ type: 'FeatureCollection', features: [...others, newFeature] });
        map.current.flyTo({ center: finalCoords, zoom: 18, pitch: 60 });
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

      const updateSource: any = map.current.getSource('properties');
      if (updateSource && (updateSource as any)._data) {
        const currentFeatures = (updateSource as any)._data.features || [];
        const updatedFeatures = currentFeatures.map((f: any) => {
          if (String(f.properties.id) === String(id)) {
            const newPriceValue = updates.price ? Number(updates.price) : f.properties.priceValue;
            
            // 🔥 FORMATEAMOS EL PRECIO AL ACTUALIZAR EN VIVO
            const formattedPrice = new Intl.NumberFormat("es-ES").format(newPriceValue) + " €";

            const safeUpdates = { ...updates };
            ['images', 'b2b', 'openHouse', 'open_house_data', 'activeCampaign', 'user', 'ownerSnapshot', 'specs', 'selectedServices'].forEach(key => {
                if (safeUpdates[key] && typeof safeUpdates[key] === 'object') {
                    safeUpdates[key] = JSON.stringify(safeUpdates[key]); 
                }
            });
            return {
              ...f, properties: { 
                  ...f.properties, 
                  ...safeUpdates, 
                  price: updates.price ? `${updates.price}€` : f.properties.price, 
                  priceValue: newPriceValue,
                  formattedPrice: formattedPrice // 🔥 PRECIO BONITO
              }
            };
          }
          return f;
        });
        updateSource.setData({ type: 'FeatureCollection', features: updatedFeatures });
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
    const bounds = map.current.getBounds();
    const radarSource: any = map.current.getSource('properties');
    if (!radarSource || !(radarSource as any)._data || !(radarSource as any)._data.features) return [];

    const visibleProps = (radarSource as any)._data.features
      .filter((f: any) => {
        const [lng, lat] = f.geometry.coordinates;
        return bounds.contains([lng, lat]);
      })
      .map((f: any) => {
        const p = f.properties;
        let safeServices = [];
        if (typeof p.selectedServices === 'string') { try { safeServices = JSON.parse(p.selectedServices); } catch(e) {} } 
        else if (Array.isArray(p.selectedServices)) { safeServices = p.selectedServices; }
        return {
          id: p.id, address: p.address || p.location || "Ubicación Privada", price: p.price || "Consultar", type: p.type || "Propiedad", lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0],
          gap: safeServices.length > 0 ? [] : ["Foto Pro", "Plano 3D"],
        };
      });
    return visibleProps;
  };

  // --------------------------------------------------------------------
  // D. RADAR GLOBAL DINÁMICO (BOUNDING BOX + ANTI-SPAM) 🛡️ (INTACTO)
  // --------------------------------------------------------------------
  useEffect(() => {
    if (!map.current) return;
    let debounceTimer: any = null; 

    const executeRadar = async () => {
      try {
        if (!map.current) return;
        const b = map.current.getBounds();
        const zoom = map.current.getZoom();
        const pad = zoom >= 15 ? 0.035 : zoom >= 13 ? 0.06 : zoom >= 11 ? 0.1 : 0.16;

        const bounds = { minLng: b.getWest() - pad, maxLng: b.getEast() + pad, minLat: b.getSouth() - pad, maxLat: b.getNorth() + pad };
        
        const response = await getGlobalPropertiesAction(bounds);
        const rawData = response.success ? response.data : [];

        const serverData = rawData.filter((p: any) => {
            const status = String(p.status || "").toUpperCase();
            const isPremium = p.promotedTier === 'PREMIUM' || p.isPromoted === true;
            const isManaged = p.assignment && p.assignment.status === 'ACTIVE';
            return status === "PUBLICADO" || status === "MANAGED" || status === "ACCEPTED" || isPremium || isManaged;
        });

        const uniqueMap = new Map();
        serverData.forEach((p: any) => uniqueMap.set(String(p.id), { ...p, source: 'CLOUD_DB' }));
        const unifiedList = Array.from(uniqueMap.values());

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('stratos-inventory-ready', { detail: unifiedList }));
            window.addEventListener('request-stratos-inventory', () => {
                window.dispatchEvent(new CustomEvent('stratos-inventory-ready', { detail: unifiedList }));
            }, { once: true }); 
        }
       
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

            // 🔥 FORMATEAMOS EL PRECIO ANTES DE DÁRSELO A MAPBOX
            const priceValue = Number(p.rawPrice || p.priceValue || p.price || 0);
            const formattedPrice = new Intl.NumberFormat("es-ES").format(priceValue) + " €";

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
                    priceValue: priceValue, 
                    formattedPrice: formattedPrice, 
                    img: safeImage, 
                    
                    // 🚀 LA INYECCIÓN TÁCTICA 1: El contador peso pluma (Cero lag)
                    photoCount: Array.isArray(p.images) ? p.images.length : (p.images ? 1 : 0),
                    
                    // 🔥 Mantenemos el empaquetado de seguridad por si el usuario hace clic a la velocidad de la luz
                    images: p.images ? JSON.stringify(p.images) : '[]', 
                    
                    m2: finalM2, mBuilt: finalM2, elevator: isYes(p.elevator),
                    address: p.address || null, city: p.city || null, postcode: p.postcode || null, region: p.region || null, communityFees: p.communityFees, energyConsumption: p.energyConsumption,
                    energyEmissions: p.energyEmissions, energyPending: p.energyPending, user: identityJson, ownerSnapshot: ownerSnapJson, role: p?.role ?? identityObj?.role ?? null,
                    openHouse: openHouseJson, open_house_data: openHouseJson, activeCampaign: activeCampaignJson, b2b: b2bJson
                }
            };
        }).filter(Boolean);
       
        masterRadarDataRef.current = features;

        const injectSafely = (attempts = 0) => {
            if (!map.current) return;
            const source: any = map.current.getSource('properties');
            if (source) {
                source.setData({ type: 'FeatureCollection', features: features });
            } else if (attempts < 10) {
                setTimeout(() => injectSafely(attempts + 1), 100);
            }
        };
        injectSafely();

      } catch (e) { console.error("❌ Fallo crítico en radar:", e); }
    };

    if (isLoaded) executeRadar();
    else map.current.once('load', executeRadar);

    const onMapMoveEnd = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => executeRadar(), 300); 
    };

    map.current.on('moveend', onMapMoveEnd);
    window.addEventListener('force-map-refresh', executeRadar);
    
    return () => {
        if (map.current) map.current.off('moveend', onMapMoveEnd);
        window.removeEventListener('force-map-refresh', executeRadar);
        if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [isLoaded]);

  // --------------------------------------------------------------------
  // 🏢 3. RADAR DE AGENCIAS VIP (AHORA EN EL MOTOR DE GRAVEDAD)
  // --------------------------------------------------------------------
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const loadVipAgencies = async () => {
      try {
        const response = await getVipAgenciesAction(); 
        const agencies = response?.success ? response.data : [];

        const features = agencies.map((agency: any) => {
            if (!agency.coordinates || !agency.coordinates[0] || !agency.coordinates[1]) return null;
            return {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: agency.coordinates },
                properties: { uniqueMarkerId: `${agency.id}-${agency.targetZone}`, agencyRawData: JSON.stringify(agency) }
            };
        }).filter(Boolean);

        const source: any = map.current.getSource('vip-agencies');
        if (source) {
            source.setData({ type: 'FeatureCollection', features: features });
            map.current.once('idle', () => { if (typeof updateVipMarkers === 'function') updateVipMarkers(); }); 
        }
      } catch (e) { console.error("Error cargando Agencias VIP:", e); }
    };

    loadVipAgencies();
    window.addEventListener('reload-vip-agencies', loadVipAgencies);
    return () => window.removeEventListener('reload-vip-agencies', loadVipAgencies);
  }, [isLoaded]);

  // --------------------------------------------------------------------
  // 🎯 ANTENA DEL BUSCADOR LATERAL (Conexión Directa)
  // --------------------------------------------------------------------
  useEffect(() => {
    const handleSearchSignal = (e: any) => {
      if (e.detail) searchCity(e.detail);
    };
    window.addEventListener('stratos-search-city', handleSearchSignal);
    return () => window.removeEventListener('stratos-search-city', handleSearchSignal);
  }, []);

  // 🔥🔥🔥 WEBSOCKETS: RADAR DE MAPA EN VIVO 🔥🔥🔥
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe('stratos-global');
    channel.bind('new-property', (newProp: any) => {
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('add-property-signal', { detail: newProp }));
    });
    return () => { channel.unbind('new-property'); pusher.unsubscribe('stratos-global'); };
  }, []);

  // --------------------------------------------------------------------
  // RETORNO FINAL
  // --------------------------------------------------------------------
  return { 
    mapContainer, 
    map, 
    isMapLoaded: isLoaded, 
    searchCity, 
    scanVisibleProperties 
  };
};