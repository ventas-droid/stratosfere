// @ts-nocheck
import { useEffect, useRef, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// IMPORTACIÓN CORRECTA DESDE LOCAL
import { CORPORATE_BLUE } from './data';
import { MapNanoCard, TIER_COLORS, LUXURY_IMAGES } from './ui-panels';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';
const NUM_ACTIVOS = 5000;

// --- DICCIONARIOS ---
export const TRANSLATIONS = {
  ES: {
    gatekeeper: { btn: "ACCESO CLIENTE", status: "ENLACE SEGURO", access: "BIENVENIDO" },
    searchPlaceholder: "Ej: 'Ático en Madrid menos de 2M'...",
    vault: { title: "FAVORITOS", totalValue: "VALOR CARTERA", items: "PROPIEDADES", empty: "SIN FAVORITOS", view: "VER", delete: "ELIMINAR" },
    panel: { details: "DETALLES", contact: "+ INFO", expand: "EXPANDIR" }, 
    specs: { bed: "hab", bath: "baños", sqm: "m²" },
    status: { online: "SISTEMA ONLINE", lang: "IDIOMA", audio: "SONIDO", clear: "BORRAR TODO" },
    dock: { map: "Mapa", chat: "Concierge", profile: "Perfil", vault: "Favs" },
    profile: { title: "PERFIL CLIENTE", rank: "PREMIUM", missions: "VISITAS", conquests: "ADQUISICIONES", tacticalProfile: "Actividad", logout: "CERRAR SESIÓN" },
    chat: { placeholder: "Escriba mensaje a su agente...", agent: "Agente Sarah", status: "En línea", system: "Concierge Activo", received: "Recibido" },
    commandPanel: { gallery: "MULTIMEDIA", description: "DATOS CLAVE", finance: "VALORACIÓN", roi: "RENTABILIDAD", monthly: "CUOTA HIPOTECA", down: "ENTRADA", score: "PUNTUACIÓN ACTIVO", contact: "CONTACTAR AGENTE", expand: "AMPLIAR VISTA" },
    filters: { title: "FILTROS TÁCTICOS", price: "PRECIO MAX", area: "AREA MIN", type: "TIPO", clear: "LIMPIAR" },
    notifications: { added: "Propiedad añadida a Favoritos", removed: "Propiedad eliminada", filter: "Filtros aplicados" }
  },
  EN: {
    gatekeeper: { btn: "CLIENT ACCESS", status: "SECURE LINK", access: "WELCOME" },
    searchPlaceholder: "Ex: 'Penthouse in Madrid under 2M'...",
    vault: { title: "FAVORITES", totalValue: "PORTFOLIO VALUE", items: "PROPERTIES", empty: "NO FAVORITES", view: "VIEW", delete: "REMOVE" },
    panel: { details: "DETAILS", contact: "+ INFO", expand: "EXPAND" },
    specs: { bed: "bed", bath: "bath", sqm: "sqm" },
    status: { online: "SYSTEM ONLINE", lang: "LANGUAGE", audio: "AUDIO", clear: "CLEAR NOTIFICATIONS" },
    dock: { map: "Map", chat: "Concierge", profile: "Profile", vault: "Favs" },
    profile: { title: "CLIENT PROFILE", rank: "PREMIUM", missions: "VISITS", conquests: "ACQUISITIONS", tacticalProfile: "Activity", logout: "LOGOUT" },
    chat: { placeholder: "Message your agent...", agent: "Agent Sarah", status: "Online", system: "Concierge Active", received: "Received" },
    commandPanel: { gallery: "MEDIA", description: "INTEL", finance: "VALUATION", roi: "YIELD EST.", monthly: "MONTHLY", down: "DOWN PMT", score: "ASSET SCORE", contact: "CONTACT AGENT", expand: "EXPAND VIEW" },
    filters: { title: "FILTERS", price: "MAX PRICE", area: "MIN AREA", type: "TYPE", clear: "RESET" },
    notifications: { added: "Property added to Favorites", removed: "Property removed from Favorites", filter: "Search filters updated" }
  }
};

// --- HOOK DE SONIDO ---
export const useTacticalSound = (enabled) => {
  const audioCtxRef = useRef(null);
  const enabledRef = useRef(enabled);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  }, []);
  
  const playTone = useCallback((freq, type, duration, vol = 0.05) => {
    if (!enabledRef.current) return;
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [initAudio]);

  const playHover = useCallback(() => playTone(600, 'sine', 0.05, 0.005), [playTone]);
  const playClick = useCallback(() => playTone(1200, 'sine', 0.05, 0.02), [playTone]); 
  const playPing = useCallback(() => playTone(800, 'sine', 0.3, 0.05), [playTone]);
  const playDeploy = useCallback(() => { playTone(150, 'sine', 0.2, 0.02); setTimeout(() => playTone(300, 'sine', 0.3, 0.02), 80); }, [playTone]);
  const playBoot = useCallback(() => { playTone(100, 'sine', 0.4, 0.05); setTimeout(() => playTone(1500, 'sine', 0.8, 0.01), 300); }, [playTone]);
  
  return { playHover, playClick, playPing, playDeploy, playBoot };
};

// --- GENERADOR DE DATOS ---
const generarGeoJSON = (cantidad) => {
  const features = [];
  const CIUDADES = [{lat: 40.4168, lng: -3.7038}, {lat: 41.40, lng: 2.15}, {lat: 39.47, lng: -0.37}];
  for (let i = 0; i < cantidad; i++) {
    const ciudad = CIUDADES[Math.floor(Math.random() * CIUDADES.length)];
    const r = 0.04 * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const lat = ciudad.lat + r * Math.sin(theta);
    const lng = ciudad.lng + r * Math.cos(theta);
    const priceValue = Math.floor(Math.random() * 1500000 + 150000); 
    let tier = "PREMIUM";
    if (priceValue < 300000) tier = "SMART";
    else if (priceValue > 600000) tier = "HIGH_CLASS";
    const colorCore = TIER_COLORS[tier].hex;
    const mainImgIdx = i % LUXURY_IMAGES.length;
    const mainImg = LUXURY_IMAGES[mainImgIdx];
    
    const gallery = JSON.stringify([mainImg, LUXURY_IMAGES[(mainImgIdx + 1) % LUXURY_IMAGES.length]]);

    features.push({
      type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: { 
          id: `SEC-${i}`, title: tier, tier, priceValue, precio: (priceValue/1000).toFixed(0)+"k €", 
          area: Math.floor(Math.random()*350+50), category: Math.random()>0.4?'PISO':'CASA', 
          rooms: Math.floor(Math.random()*5)+1, baths: Math.floor(Math.random()*3)+1,
          photoUrl: mainImg, gallery: gallery, colorCore, lat, lng, 
          assetScore: Math.floor(Math.random()*30+70) 
      }
    });
  }
  return { type: 'FeatureCollection', features };
};
const DATA_PUNTOS = generarGeoJSON(NUM_ACTIVOS);

// --- MAIN LOGIC HOOK ---
export const useMapLogic = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popupRef = useRef(null);
  const selectedMarkerRef = useRef(null); 
  const popupRootRef = useRef(null); 
  const activePopupIdRef = useRef(null);

  const [selectedProperty, setSelectedProperty] = useState(null); 
  const [chatContext, setChatContext] = useState(null); 
  const [viewState, setViewState] = useState('LOCKED'); 
  const [activeTab, setActiveTab] = useState('map'); 
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [systemNotifs, setSystemNotifs] = useState([]);
  
  const [filters, setFilters] = useState({ maxPrice: 2000000, minArea: 0, type: 'ALL' });
  const [currentView, setCurrentView] = useState({ is3D: true, mode: 'dusk' });
  const [lang, setLang] = useState('ES');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const sound = useTacticalSound(true);
  const t = TRANSLATIONS[lang] || TRANSLATIONS['ES']; 

  const [favorites, setFavorites] = useState([]);
  useEffect(() => { try { const savedFavs = localStorage.getItem('alive_favorites'); if (savedFavs) setFavorites(JSON.parse(savedFavs)); } catch(e) {} }, []);
  useEffect(() => { try { localStorage.setItem('alive_favorites', JSON.stringify(favorites)); } catch(e) {} }, [favorites]);

  const toggleFavorite = (prop) => { 
      setFavorites(prev => {
          const exists = prev.some(f => f.id === prop.id);
          const newFavs = exists ? prev.filter(f => f.id !== prop.id) : [...prev, prop];
          const newDesc = exists ? t.notifications?.removed : t.notifications?.added;
          setSystemNotifs(prevNotifs => {
              if (prevNotifs.length > 0 && prevNotifs[0].desc === newDesc) return prevNotifs;
              return [{title: "INFO", desc: newDesc, action: null}, ...prevNotifs];
          });
          return newFavs;
      }); 
      sound.playPing();
  };
  const removeFromFavs = (prop) => toggleFavorite(prop);
  const toggleSound = () => setSoundEnabled(!soundEnabled); 

  const handleContactAgent = () => {
      setChatContext(selectedProperty); 
      setShowCommandCenter(false); 
      setActiveTab('chat'); 
      sound.playDeploy();
  };

  const handleViewChange = (type) => {
      if (!map.current) return;
      if (type === '3D') { map.current.easeTo({ pitch: 60, bearing: -20, duration: 1000 }); setCurrentView(p => ({...p, is3D: true})); }
      if (type === '2D') { map.current.easeTo({ pitch: 0, bearing: 0, duration: 1000 }); setCurrentView(p => ({...p, is3D: false})); }
      if (type.startsWith('MODE_')) {
          const mode = type.replace('MODE_', '').toLowerCase();
          if (map.current.getStyle().name !== 'Mapbox Standard') {
              map.current.setStyle('mapbox://styles/mapbox/standard');
          }
          setTimeout(() => {
              try {
                  map.current.setConfig('basemap', { lightPreset: mode, showPointOfInterestLabels: false, showTransitLabels: false });
              } catch(e) { console.log("Standard config not ready"); }
          }, 500);
          setCurrentView(p => ({...p, mode}));
      }
  };

  const handleUnlock = () => { 
      map.current?.flyTo({ center: [-3.7038, 40.4168], zoom: 15.5, pitch: 60, bearing: -20, duration: 4000, essential: true }); 
      setViewState('ACTIVE'); 
  };
  
  const handleGPS = () => { 
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((p) => { 
              if (p && p.coords && !isNaN(p.coords.longitude) && !isNaN(p.coords.latitude)) {
                  map.current?.flyTo({ center: [p.coords.longitude, p.coords.latitude], zoom: 16, pitch: 45 }); 
                  sound.playDeploy(); 
              }
          }, null, { enableHighAccuracy: true });
      }
  };

  const handleOmniSearch = (query) => {
      const q = query.toLowerCase();
      const newFilters = {...filters};
      let changed = false;
      if (q.includes('millon') || q.includes('m') || q.includes('k')) {
          if (q.match(/(\d+)m/)) { newFilters.maxPrice = parseInt(q.match(/(\d+)m/)[1]) * 1000000; changed = true; }
          if (q.match(/(\d+)k/)) { newFilters.maxPrice = parseInt(q.match(/(\d+)k/)[1]) * 1000; changed = true; }
      }
      if (q.includes('casa') || q.includes('chalet')) { newFilters.type = 'CASA'; changed = true; }
      if (q.includes('piso') || q.includes('apartamento')) { newFilters.type = 'PISO'; changed = true; }
      
      if(changed) { 
          setFilters(newFilters); 
          setSystemNotifs(prev => [{title: "OMNI AI", desc: t.notifications?.filter, action: null}, ...prev]); 
      }
      
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=es`)
      .then(res => res.json())
      .then(data => {
          if(data.features && data.features.length > 0) {
              const [lng, lat] = data.features[0].center;
              if (!isNaN(lng) && !isNaN(lat)) {
                  map.current?.flyTo({center: [lng, lat], zoom: 14});
              }
          }
      });
  };
  
  // --- AQUÍ ESTÁ LA MAGIA DE LA ONDA (ACTIVACIÓN VISUAL) ---
  useEffect(() => {
    if (!map.current) return;
    if (selectedMarkerRef.current) { selectedMarkerRef.current.remove(); selectedMarkerRef.current = null; }
    
    if (selectedProperty && !isNaN(selectedProperty.lng) && !isNaN(selectedProperty.lat)) { 
        const tierHex = TIER_COLORS[selectedProperty.tier]?.hex || CORPORATE_BLUE;
        
        // Creamos el contenedor del marcador
        const el = document.createElement('div');
        el.className = 'marker-container';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.position = 'relative';
        el.style.display = 'flex';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';

        // 1. LA ONDA (Usando la clase CSS que definimos en AliveMap.tsx)
        const wave = document.createElement('div');
        wave.className = 'pin-wave-active'; // <--- ESTA ES LA CLAVE
        // Forzamos el color dinámico del Tier
        wave.style.backgroundColor = tierHex;
        wave.style.boxShadow = `0 0 15px ${tierHex}`;
        
        // 2. EL PUNTO CENTRAL
        const center = document.createElement('div');
        center.style.width = '10px';
        center.style.height = '10px';
        center.style.borderRadius = '50%';
        center.style.backgroundColor = tierHex;
        center.style.boxShadow = `0 0 10px ${tierHex}, 0 0 5px white`;
        center.style.zIndex = '10';

        el.appendChild(wave);
        el.appendChild(center);
        
        selectedMarkerRef.current = new mapboxgl.Marker(el)
            .setLngLat([selectedProperty.lng, selectedProperty.lat])
            .addTo(map.current);
    }
  }, [selectedProperty]);

  useEffect(() => {
      if (!map.current) return;
      const layerID = 'unclustered-point';
      if (!map.current.getLayer(layerID)) return;
      
      const activeFilters = ['all'];
      activeFilters.push(['<=', ['get', 'priceValue'], filters.maxPrice]);
      activeFilters.push(['>=', ['get', 'area'], filters.minArea]);
      if (filters.type !== 'ALL') activeFilters.push(['==', ['get', 'category'], filters.type]);
      
      map.current.setFilter(layerID, activeFilters);
      map.current.setFilter('clusters', activeFilters); 
  }, [filters]);

  const loadLayers = (m) => {
    if (m.getSource('puntos')) return; 
    m.addSource('puntos', { type: 'geojson', data: DATA_PUNTOS, cluster: true, clusterMaxZoom: 14, clusterRadius: 50 });

    if (!m.getLayer('clusters')) {
        m.addLayer({ id: 'clusters', type: 'circle', source: 'puntos', filter: ['has', 'point_count'], paint: { 'circle-color': ['step', ['get', 'point_count'], CORPORATE_BLUE, 100, '#2563eb', 750, '#1d4ed8'], 'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40], 'circle-stroke-width': 2, 'circle-stroke-color': '#000', 'circle-opacity': 0.9 } });
        m.addLayer({ id: 'cluster-count', type: 'symbol', source: 'puntos', filter: ['has', 'point_count'], layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12 }, paint: { 'text-color': '#fff' } });
        m.addLayer({ id: 'unclustered-point', type: 'circle', source: 'puntos', filter: ['!', ['has', 'point_count']], paint: { 'circle-radius': 6, 'circle-color': ['get', 'colorCore'], 'circle-stroke-width': 2, 'circle-stroke-color': '#000' } });
    }

    m.on('click', 'clusters', (e) => { sound.playClick(); const features = m.queryRenderedFeatures(e.point, { layers: ['clusters'] }); const clusterId = features[0].properties.cluster_id; m.getSource('puntos').getClusterExpansionZoom(clusterId, (err, zoom) => { if(!err) m.easeTo({ center: features[0].geometry.coordinates, zoom: zoom }); }); });
    m.on('mouseenter', 'clusters', () => { m.getCanvas().style.cursor = 'pointer'; sound.playHover(); }); m.on('mouseleave', 'clusters', () => { m.getCanvas().style.cursor = ''; });
    
    m.on('click', 'unclustered-point', (e) => { 
        sound.playClick(); 
        const coords = e.features[0].geometry.coordinates.slice();
        if (isNaN(coords[0]) || isNaN(coords[1])) return;

        m.flyTo({ center: coords, zoom: 17, pitch: 60 }); 
        
        const props = e.features[0].properties;
        const galleryRaw = props.gallery;
        const gallery = galleryRaw ? JSON.parse(galleryRaw) : [props.photoUrl];
        
        const clickedProps = { ...props, gallery, lng: coords[0], lat: coords[1], priceValue: Number(props.priceValue), area: Number(props.area) }; 
        
        activePopupIdRef.current = clickedProps.id;
        const isFav = favorites.some(f => f.id === clickedProps.id);
        
        const popupNode = document.createElement('div'); 
        popupNode.onclick = (e) => e.stopPropagation();
        
        const root = createRoot(popupNode);
        popupRootRef.current = root;
        
        root.render(<MapNanoCard props={clickedProps} onToggleFavorite={toggleFavorite} isFavorite={isFav} onClose={() => { popupRef.current?.remove(); activePopupIdRef.current = null; }} onOpenDetail={(p) => { setSelectedProperty(p); setShowCommandCenter(true); popupRef.current?.remove(); sound.playDeploy(); }} t={t} sound={sound} />); 
        
        popupRef.current.setLngLat(coords).setDOMContent(popupNode).addTo(m); 
        popupRef.current.once('close', () => { activePopupIdRef.current = null; });
    });
    
    m.on('mouseenter', 'unclustered-point', () => { m.getCanvas().style.cursor = 'pointer'; sound.playHover(); }); m.on('mouseleave', 'unclustered-point', () => { m.getCanvas().style.cursor = ''; });
  };

 useEffect(() => { 
      if (map.current) return; 
      mapboxgl.accessToken = MAPBOX_TOKEN; 
      map.current = new mapboxgl.Map({ 
          container: mapContainer.current, 
          style: 'mapbox://styles/mapbox/standard', 
          center: [0, 40], 
          zoom: 2, 
          pitch: 0, 
          attributionControl: false, 
          antialias: true, 
          projection: 'globe' 
      }); 
      
      map.current.on('style.load', () => {
          map.current.setConfig('basemap', { lightPreset: 'dusk', showPointOfInterestLabels: false, showTransitLabels: false });
          loadLayers(map.current);
      });

      popupRef.current = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 14, maxWidth: 'none', className: 'tactical-popup' }); 
  }, []);

  return {
    mapContainer,
    viewState,
    t,
    sound,
    handleUnlock,
    handleGPS,
    handleViewChange,
    currentView,
    systemNotifs,
    setSystemNotifs,
    lang,
    setLang,
    soundEnabled,
    toggleSound,
    setActiveTab,
    handleOmniSearch,
    activeTab,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    showCommandCenter,
    setShowCommandCenter,
    selectedProperty,
    handleContactAgent,
    favorites,
    removeFromFavs,
    setSelectedProperty,
    chatContext
  };
};

