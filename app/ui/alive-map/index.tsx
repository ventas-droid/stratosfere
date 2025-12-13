// @ts-nocheck
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createRoot } from 'react-dom/client';

// IMPORTACIONES MODULARES
// Asegúrate de que ui-controls.tsx y ui-panels.tsx estén en la misma carpeta
import { Gatekeeper, TopBar, ViewControlDock, StatusDeck, OmniSearchDock, FilterPanel } from './ui-controls';
import { MapNanoCard, CommandCenterPanel, TheVault, ChatPanel, ProfileDashboard } from './ui-panels';

// CONSTANTES Y CONFIG
const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';
const CORPORATE_BLUE = "#1d4ed8";
const NUM_ACTIVOS = 5000;

// DICCIONARIOS
const TRANSLATIONS = {
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

const LUXURY_IMAGES = [
    "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

const TIER_COLORS = {
    SMART: { hex: "#10b981", glow: "0 0 15px rgba(16, 185, 129, 0.8)" },   
    PREMIUM: { hex: "#1d4ed8", glow: "0 0 20px rgba(37, 99, 235, 0.8)" }, 
    HIGH_CLASS: { hex: "#d946ef", glow: "0 0 20px rgba(217, 70, 239, 0.8)" } 
};

// --- HOOKS Y GENERADORES DE DATOS ---

const useTacticalSound = (enabled) => {
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
  const playProcess = useCallback(() => { playTone(800, 'square', 0.1, 0.01); }, [playTone]);
  const playBoot = useCallback(() => { playTone(100, 'sine', 0.4, 0.05); setTimeout(() => playTone(1500, 'sine', 0.8, 0.01), 300); }, [playTone]);
  
  return { playHover, playClick, playPing, playDeploy, playBoot, playProcess };
};

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

// --- COMPONENTE PRINCIPAL ---

const AliveMap = () => {
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
  
  useEffect(() => {
    if (!map.current) return;
    if (selectedMarkerRef.current) { selectedMarkerRef.current.remove(); selectedMarkerRef.current = null; }
    
    if (selectedProperty && !isNaN(selectedProperty.lng) && !isNaN(selectedProperty.lat)) { 
        const tierHex = TIER_COLORS[selectedProperty.tier]?.hex || CORPORATE_BLUE;
        const el = document.createElement('div'); 
        el.className = 'pulsing-dot';
        el.style.cssText = `width: 24px; height: 24px; border-radius: 50%; position: relative; display: flex; justify-content: center; align-items: center; background-color: transparent; z-index: -1;`;
        
        const pulse = document.createElement('div');
        pulse.style.cssText = `position: absolute; inset: 0; border-radius: 50%; border: 2px solid ${tierHex}; box-shadow: 0 0 10px ${tierHex}; animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);`;
        
        const center = document.createElement('div');
        center.style.cssText = `width: 8px; height: 8px; border-radius: 50%; background-color: ${tierHex}; box-shadow: 0 0 10px ${tierHex};`;
        
        el.appendChild(pulse); el.appendChild(center);
        selectedMarkerRef.current = new mapboxgl.Marker(el).setLngLat([selectedProperty.lng, selectedProperty.lat]).addTo(map.current);
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

  return (
    <>
      <style jsx global>{`
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out; }
        .animate-slide-left { animation: slideLeft 0.4s cubic-bezier(0.23, 1, 0.32, 1); }
        html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #050505; color: #eee; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        .mapboxgl-popup-content { background: transparent !important; padding: 0 !important; border: none !important; box-shadow: none !important; }
        .mapboxgl-popup-tip { display: none; }
        .pulsing-dot { width: 16px; height: 16px; border-radius: 50%; position: relative; display: flex; justify-content: center; align-items: center; }
        .pulsing-dot::before { content: ''; position: absolute; width: 100%; height: 100%; border-radius: 50%; animation: pulse 2s infinite; background-color: inherit; opacity: 0.6; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: #050505; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .backdrop-blur-xl { backdrop-filter: blur(24px); } .backdrop-blur-2xl { backdrop-filter: blur(40px); }
      `}</style>
      <div ref={mapContainer} className="w-full h-full" style={{ height: '100vh', width: '100vw' }} />
      {viewState === 'ACTIVE' && ( <>
            <TopBar onGPS={handleGPS} t={t} />
            <ViewControlDock onViewChange={handleViewChange} currentView={currentView} t={t} sound={sound} />
            <StatusDeck notifications={systemNotifs} clearNotifications={() => setSystemNotifs([])} lang={lang} setLang={setLang} sound={sound} soundEnabled={soundEnabled} toggleSound={toggleSound} t={t} onOpenChat={() => setActiveTab('chat')} />
            <OmniSearchDock onSearch={handleOmniSearch} setActiveTab={setActiveTab} activeTab={activeTab} toggleFilters={() => setShowFilters(!showFilters)} t={t} sound={sound} addNotification={(t, d) => setSystemNotifs(p => [{title:t, desc:d}, ...p])} />
            
            {showFilters && <FilterPanel filters={filters} setFilters={setFilters} onClose={() => setShowFilters(false)} t={t} sound={sound} />}
            {showCommandCenter && <CommandCenterPanel property={selectedProperty} onClose={() => setShowCommandCenter(false)} t={t} sound={sound} onContactAgent={handleContactAgent} />}
            
            {activeTab === 'vault' && <TheVault favorites={favorites} onClose={() => setActiveTab('map')} t={t} sound={sound} removeFromFavs={removeFromFavs} onFlyTo={(fav) => { setSelectedProperty(fav); setActiveTab('map'); setShowCommandCenter(true); }} />}
            {activeTab === 'chat' && <ChatPanel t={t} sound={sound} onClose={() => setActiveTab('map')} context={chatContext} />}
            {activeTab === 'profile' && <ProfileDashboard t={t} onClose={() => setActiveTab('map')} />}
      </> )}
      
      {viewState !== 'ACTIVE' && <Gatekeeper onUnlock={handleUnlock} t={t} sound={sound} />}
    </>
  );
};

export default AliveMap;

