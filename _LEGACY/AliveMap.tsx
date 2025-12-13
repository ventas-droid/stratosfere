// @ts-nocheck
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createRoot } from 'react-dom/client';
import { 
  MapPin, X, Heart, Search, Mic, Layers, Settings, 
  Maximize2, ArrowRight, Menu, Bell, Globe, ShieldCheck,
  MessageSquare, User, Crosshair, Send, Navigation, ChevronRight, Play,
  SlidersHorizontal, MicOff, Activity, Zap, Image as ImageIcon,
  TrendingUp, DollarSign, BarChart3, Target, Phone, Trash2,
  Box, Square, Moon, Sun, Mountain
} from 'lucide-react';

// ==================================================================================
// 1. ZONA DE CONSTANTES Y DICCIONARIOS (PRIMEROS PARA EVITAR ERRORES DE REFERENCIA)
// ==================================================================================
const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';

// COLORES Y ESTILOS
const CORPORATE_BLUE = "#1d4ed8"; 
const NEON_GLOW = "0 0 20px rgba(37, 99, 235, 0.5)"; 
const TEXT_COLOR = "#d4d4d8"; 
const NUM_ACTIVOS = 5000;

// DICCIONARIO DE TRADUCCIÓN (MOVIDO AQUÍ ARRIBA PARA QUE NO FALLE)
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

// IMÁGENES ESTABLES
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

// ==========================================
// 2. HOOKS Y GENERADORES DE DATOS
// ==========================================

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
  const playBoot = useCallback(() => { playTone(100, 'sine', 0.4, 0.05); setTimeout(() => playTone(1500, 'sine', 0.8, 0.01), 300); }, [playTone]);
  
  return { playHover, playClick, playPing, playDeploy, playBoot };
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
    
    // CORRECCIÓN NULL READING: Aseguramos que gallery sea un string JSON válido
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

// ==========================================
// 3. SUB-COMPONENTES UI
// ==========================================

const Gatekeeper = ({ onUnlock, t, sound }) => {
    const [status, setStatus] = useState('LOCKED'); 
    const handleAccess = () => { sound.playBoot(); setStatus('GRANTED'); setTimeout(() => { onUnlock(); }, 2000); };
    return (
        <div className={`fixed inset-0 bg-[#050505] z-[99999] flex flex-col items-center justify-center transition-opacity duration-1000 ${status === 'GRANTED' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="text-center mb-16 pointer-events-none select-none"><h1 className="text-6xl font-light tracking-[0.2em] mb-4" style={{color: TEXT_COLOR}}>STRATOS<span className="font-bold" style={{color: CORPORATE_BLUE}}>FERE</span></h1><div className="h-[1px] w-24 bg-white/20 mx-auto"></div></div>
            <div className="h-24 flex items-center justify-center"> 
                {status === 'LOCKED' && <button className="px-10 py-3 bg-white text-black rounded-full font-medium text-sm tracking-widest hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]" onClick={handleAccess} onMouseEnter={sound.playHover}>{t.gatekeeper.btn}</button>}
                {status === 'GRANTED' && <div className="text-emerald-400 font-mono text-sm tracking-widest animate-pulse">{t.gatekeeper.access}</div>}
            </div>
        </div>
    );
};

const ViewControlDock = ({ onViewChange, currentView, t, sound }) => {
    return (
        <div className="absolute top-80 left-8 z-[9000] flex flex-col gap-2 pointer-events-auto">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-xl shadow-xl flex flex-col gap-1.5">
                <button onClick={() => { sound.playClick(); onViewChange('3D'); }} className={`p-1.5 rounded-lg transition-all ${currentView.is3D ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`} title="3D"><Box size={16} /></button>
                <button onClick={() => { sound.playClick(); onViewChange('2D'); }} className={`p-1.5 rounded-lg transition-all ${!currentView.is3D ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`} title="2D"><Square size={16} /></button>
            </div>
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-xl shadow-xl flex flex-col gap-1.5">
                <button onClick={() => { sound.playClick(); onViewChange('MODE_DUSK'); }} className={`p-1.5 rounded-lg transition-all ${currentView.mode === 'dusk' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`} title="Noche"><Moon size={16} /></button>
                <button onClick={() => { sound.playClick(); onViewChange('MODE_DAWN'); }} className={`p-1.5 rounded-lg transition-all ${currentView.mode === 'dawn' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`} title="Día"><Sun size={16} /></button>
            </div>
        </div>
    );
};

const TopBar = ({ t, onGPS }) => (
    <div className="absolute top-0 left-0 right-0 z-[10000] px-8 py-6 flex justify-between items-start pointer-events-none">
      <div className="pointer-events-auto flex flex-col">
          <h1 className="text-2xl font-light tracking-[0.3em] drop-shadow-md" style={{color: TEXT_COLOR}}>
            STRATOS<span className="font-bold" style={{color: CORPORATE_BLUE}}>FERE</span>
          </h1>
      </div>
      <div className="pointer-events-auto flex items-center gap-3">
        <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]" onClick={onGPS}>
          <Crosshair className="w-5 h-5" />
        </button>
      </div>
    </div>
);

const StatusDeck = ({ notifications, clearNotifications, lang, setLang, sound, soundEnabled, toggleSound, t, onOpenChat }) => {
  const cycleLang = (e) => { e.stopPropagation(); sound.playClick(); const langs = ['ES', 'EN']; setLang(langs[(langs.indexOf(lang) + 1) % langs.length]); };
  return (
    <div className="absolute top-24 right-8 z-[9000] pointer-events-auto flex flex-col gap-3 items-end w-[300px]">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl w-full shadow-2xl transition-all" style={{borderColor: CORPORATE_BLUE + '60'}}>
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{color: TEXT_COLOR}}>SYSTEM STATUS</span>
          <div className="flex gap-2 items-center">
             <span className="text-[9px] font-mono" style={{color: CORPORATE_BLUE}}>{lang}</span>
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] text-white/60 font-mono cursor-pointer hover:text-white" onClick={cycleLang}><span>{t.status.lang}</span><span className="flex items-center gap-1" style={{color: CORPORATE_BLUE}}><Globe size={10} /></span></div>
          <div className="flex justify-between text-[10px] text-white/60 font-mono cursor-pointer hover:text-white" onClick={toggleSound}><span>{t.status.audio}</span><span className={soundEnabled ? "text-emerald-400" : "text-gray-500"}>{soundEnabled ? 'ON' : 'OFF'}</span></div>
        </div>
        {notifications.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10 overflow-hidden animate-fade-in-up">
                {notifications.map((notif, i) => (
                    <div key={i} className="mb-3 last:mb-0 pb-2 last:pb-0 border-b last:border-b-0 border-white/5">
                        <div className="text-[9px] mb-1 font-mono uppercase animate-pulse truncate w-full" style={{color: CORPORATE_BLUE}}>{notif.title}</div>
                        <div className="text-[10px] text-white/80 leading-tight w-full whitespace-normal">{notif.desc}</div>
                        {notif.action === 'CHAT' && (
                            <button onClick={() => onOpenChat()} className="mt-2 w-full py-1.5 bg-white/10 hover:bg-white/20 text-[9px] font-bold text-white rounded transition-colors flex items-center justify-center gap-1">{t.commandPanel.contact} <ArrowRight size={10}/></button>
                        )}
                    </div>
                ))}
                <button onClick={clearNotifications} className="mt-3 py-1 text-[9px] text-white/50 hover:text-red-400 uppercase tracking-wider w-full text-center flex items-center justify-center gap-1 transition-colors"><Trash2 size={10}/> {t.status.clear}</button>
            </div>
        )}
      </div>
    </div>
  );
};

const FilterPanel = ({ filters, setFilters, onClose, t, sound }) => {
    const formatMoney = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
    return (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xl z-[10001] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold tracking-widest" style={{color: TEXT_COLOR}}>{t.filters.title}</h3>
                <button onClick={onClose}><X size={16} className="text-white/50 hover:text-white"/></button>
            </div>
            <div className="mb-4">
                {/* CORREGIDO EL ERROR DE SINTAXIS font-mono QUE MANDASTE EN LA CAPTURA */}
                <div className="flex justify-between text-[10px] text-white/60 mb-2"><span>{t.filters.price}</span><span style={{color: CORPORATE_BLUE}} className="font-mono">{formatMoney(filters.maxPrice)}</span></div>
                <input type="range" min="100000" max="2000000" step="50000" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" style={{accentColor: CORPORATE_BLUE}} />
            </div>
            <div className="mb-6">
                <div className="flex justify-between text-[10px] text-white/60 mb-2"><span>{t.filters.area}</span><span style={{color: CORPORATE_BLUE}} className="font-mono">{filters.minArea} m²</span></div>
                <input type="range" min="0" max="500" step="10" value={filters.minArea} onChange={(e) => setFilters({...filters, minArea: Number(e.target.value)})} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" style={{accentColor: CORPORATE_BLUE}} />
            </div>
            <div className="flex gap-2 mb-4">
                {['ALL', 'CASA', 'PISO'].map(type => (
                    <button key={type} onClick={() => { sound.playClick(); setFilters({...filters, type}); }} className={`flex-1 py-2 text-[10px] font-bold rounded border transition-colors ${filters.type === type ? 'text-white border-transparent' : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'}`} style={filters.type === type ? {backgroundColor: CORPORATE_BLUE, boxShadow: NEON_GLOW} : {}}>{type === 'ALL' ? 'TODO' : type}</button>
                ))}
            </div>
        </div>
    );
};

const OmniSearchDock = ({ onSearch, setActiveTab, activeTab, toggleFilters, t, sound, addNotification }) => {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const handleSearchSubmit = () => { sound.playProcess(); onSearch(query); };
  const handleMic = () => {
      if (typeof window !== 'undefined' && !('webkitSpeechRecognition' in window)) { addNotification("INFO", "Voice module not supported"); return; }
      if (isListening) { setIsListening(false); return; }
      if (typeof window !== 'undefined') {
          const recognition = new window.webkitSpeechRecognition();
          recognition.lang = 'es-ES'; recognition.interimResults = false; recognition.maxAlternatives = 1;
          recognition.onstart = () => { setIsListening(true); sound.playDeploy(); };
          recognition.onend = () => { setIsListening(false); };
          recognition.onresult = (event) => { const transcript = event.results[0][0].transcript; setQuery(transcript); sound.playPing(); onSearch(transcript); };
          recognition.start();
      }
  };
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[10000] pointer-events-none w-full max-w-2xl px-4">
      <div className="pointer-events-auto bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full p-2 pl-4 pr-2 flex items-center justify-between shadow-2xl gap-3">
        <div className="flex-grow flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-full transition-all duration-300 group border border-white/5 hover:border-white/10">
            <Search size={18} className="text-white/60 group-hover:text-white" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()} placeholder={t.searchPlaceholder} className="bg-transparent border-none outline-none text-xs text-white placeholder-white/40 w-full font-light tracking-wide"/>
            <button onClick={handleMic} className={`p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/10 text-white/70 hover:text-white'}`}>{isListening ? <MicOff size={14}/> : <Mic size={14}/>}</button>
        </div>
        <button onClick={() => { sound.playClick(); toggleFilters(); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-[#38bdf8] transition-colors border border-white/5"><SlidersHorizontal size={20} /></button>
        <div className="h-8 w-px bg-white/10 mx-1"></div>
        <div className="flex items-center gap-1">
            {[{ id: 'map', icon: MapPin, label: t.dock.map }, { id: 'vault', icon: Heart, label: t.dock.vault }, { id: 'chat', icon: MessageSquare, label: t.dock.chat }, { id: 'profile', icon: User, label: t.dock.profile }].map((item) => (
                <button key={item.id} onClick={() => { sound.playClick(); setActiveTab(item.id); }} className={`p-3 rounded-full transition-all duration-300 relative group ${activeTab === item.id ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`} style={activeTab === item.id ? {backgroundColor: CORPORATE_BLUE, boxShadow: NEON_GLOW} : {}}>
                    <item.icon size={20} strokeWidth={activeTab === item.id ? 2 : 1.5} />
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

const MapNanoCard = ({ props, onToggleFavorite, isFavorite, onClose, onOpenDetail, t, sound }) => {
  const [liked, setLiked] = useState(isFavorite);
  const handleLike = (e) => { e.stopPropagation(); setLiked(!liked); onToggleFavorite(props); sound.playPing(); };
  const tierColor = TIER_COLORS[props.tier]?.hex || CORPORATE_BLUE;
  const tierGlow = TIER_COLORS[props.tier]?.glow || `0 0 15px ${CORPORATE_BLUE}60`;

  return (
    <div className="relative w-[320px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{borderColor: `${tierColor}40`}}>
      <div className="relative h-44 w-full cursor-pointer overflow-hidden" onClick={() => onOpenDetail(props)}>
        <img src={props.photoUrl} alt={props.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" onError={(e) => {e.target.onerror = null; e.target.src = LUXURY_IMAGES[0]}} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded text-[9px] font-bold tracking-widest text-white uppercase flex items-center gap-1.5">
           <div className="w-2 h-2 rounded-full" style={{backgroundColor: tierColor, boxShadow: tierGlow}}></div>
           {props.title}
        </div>
        <div className="absolute bottom-3 left-4"><span className="text-2xl font-light tracking-tight text-white">{props.precio}</span></div>
        <button onClick={handleLike} className="absolute bottom-3 right-3 p-2 rounded-full bg-black/30 hover:bg-white/10 transition-colors"><Heart size={18} className={liked ? 'fill-current' : ''} style={liked ? {color: tierColor} : {color: 'white'}} /></button>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-white/10 text-white/60 hover:text-white transition-colors backdrop-blur-md z-50">
            <X size={14} />
        </button>
      </div>
      <div className="p-4 border-t border-white/5">
        <div className="flex justify-between items-start mb-3">
            <div><h3 className="text-xs font-bold text-white mb-1">{props.category}</h3><p className="text-[10px] text-white/50 font-mono">ID: {props.id}</p></div>
            <div className="text-right"><span className="text-xs text-white/70">{props.rooms} {t.specs.bed} • {props.area} {t.specs.sqm}</span></div>
        </div>
        <div className="w-full">
           <button className="w-full py-3 rounded-lg text-white text-[10px] font-bold tracking-wider transition-colors flex items-center justify-center gap-1 hover:opacity-90 shadow-lg" style={{backgroundColor: tierColor, boxShadow: tierGlow}} onClick={() => { sound.playDeploy(); onOpenDetail(props); }}>{t.panel.contact} <ArrowRight size={12} /></button>
        </div>
      </div>
    </div>
  );
};

const CommandCenterPanel = ({ property, onClose, t, sound, onContactAgent }) => {
    if (!property) return null;
    const tierColor = TIER_COLORS[property.tier]?.hex || CORPORATE_BLUE;
    const tierGlow = TIER_COLORS[property.tier]?.glow || `0 0 15px ${CORPORATE_BLUE}60`;

    const [downPayment, setDownPayment] = useState(20);
    const price = property.priceValue;
    const loanAmount = price * (1 - downPayment/100);
    const monthlyRate = 3.5 / 100 / 12;
    const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -360));
    const roi = (Math.random() * 4 + 4).toFixed(1); 
    const formatMoney = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

    // GRÁFICO LIMPIO SIN BOLA
    const TrendChart = () => (
        <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
            <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tierColor} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={tierColor} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d="M0,35 Q10,30 20,32 T40,25 T60,15 T80,18 T100,5" fill="none" stroke={tierColor} strokeWidth="2" strokeLinecap="round" />
            <path d="M0,35 Q10,30 20,32 T40,25 T60,15 T80,18 T100,5 V40 H0 Z" fill="url(#chartGradient)" stroke="none" />
        </svg>
    );

    const DonutChart = () => (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#333" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={tierColor} strokeWidth="3" strokeDasharray={`${downPayment}, 100`} className="transition-all duration-500 ease-out" />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-[10px] text-white/50">CAPITAL</span>
                <span className="text-lg font-bold text-white">{downPayment}%</span>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-y-0 right-0 w-full max-w-3xl bg-[#050505]/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[11000] animate-slide-left overflow-y-auto custom-scrollbar flex flex-col">
            <div className="relative h-80 w-full shrink-0">
                <img src={property.photoUrl} className="w-full h-full object-cover" onError={(e) => {e.target.src = LUXURY_IMAGES[0]}} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/50 backdrop-blur rounded-full text-white/60 hover:text-white transition-colors"><X size={20} /></button>
                <div className="absolute top-6 left-6 flex gap-2">
                    <button className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-xs font-bold text-white border border-white/10 hover:bg-white/20 transition-all flex items-center gap-2" onClick={() => sound.playClick()}>
                        <Maximize2 size={14}/> {t.commandPanel.expand}
                    </button>
                </div>
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[10px] font-bold tracking-[0.2em] text-white uppercase flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: tierColor, boxShadow: tierGlow}}></div>
                                {property.title} RANGO
                            </div>
                        </div>
                        <h2 className="text-5xl font-light text-white tracking-tight">{property.precio}</h2>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-white/40 font-mono mb-1">ASSET ID</div>
                        <div className="text-lg text-white font-mono" style={{color: tierColor}}>{property.id}</div>
                    </div>
                </div>
            </div>

            <div className="p-8 flex-grow flex flex-col gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={16}/> TENDENCIA MERCADO (5 AÑOS)</h3>
                        <span className="text-xs font-mono text-emerald-400">+12.5% vs 2023</span>
                    </div>
                    <div className="h-24 w-full px-2">
                        <TrendChart />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: t.specs.sqm, value: property.area, icon: Maximize2 },
                        { label: t.specs.bed, value: property.rooms, icon: User },
                        { label: t.specs.bath, value: property.baths, icon: Zap }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-white/10 transition-all">
                            <div><div className="text-2xl font-light text-white">{stat.value}</div><div className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</div></div>
                            <stat.icon size={20} className="text-white/20 group-hover:text-white/40 transition-colors"/>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="flex justify-between items-center w-full mb-4">
                            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">DESGLOSE COSTES</h3>
                        </div>
                        <DonutChart />
                        <div className="mt-4 w-full space-y-2">
                            <div className="flex justify-between text-[10px] text-white/70"><span>Precio Base</span><span>{100 - (downPayment * 0.3).toFixed(0)}%</span></div>
                            <div className="flex justify-between text-[10px] text-white/70"><span>Capital Propio</span><span style={{color: tierColor}}>{downPayment}%</span></div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col relative overflow-hidden" style={{borderColor: `${tierColor}30`}}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2"><DollarSign size={16}/> {t.commandPanel.finance}</h3>
                            <div className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">LIVE DATA <Activity size={10} className="animate-pulse"/></div>
                        </div>
                        <div className="flex-grow flex flex-col justify-center gap-6">
                            <div className="flex justify-between items-end p-4 bg-black/40 rounded-xl border border-white/5">
                                <div><span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">{t.commandPanel.roi}</span><span className="text-3xl font-mono text-emerald-400">{roi}%</span></div>
                                <BarChart3 size={24} className="text-emerald-500/50"/>
                            </div>
                             <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs text-white/70 mb-2 font-mono"><span>{t.commandPanel.down}</span><span style={{color: tierColor}}>{downPayment}%</span></div>
                                    <input type="range" min="10" max="80" step="5" value={downPayment} onChange={e=>setDownPayment(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer" style={{accentColor: tierColor}}/>
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                            <span className="text-xs text-white/50 uppercase tracking-wider">{t.commandPanel.monthly}</span>
                            <span className="text-2xl font-mono text-white">{formatMoney(monthlyPayment)}</span>
                        </div>
                    </div>
                </div>
                <button onClick={onContactAgent} className="w-full py-4 bg-white text-black font-bold text-sm uppercase tracking-[0.2em] rounded-xl hover:scale-[1.02] transition-all shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <span className="relative z-10">{t.commandPanel.contact}</span> <Phone size={18} className="relative z-10"/>
                </button>
            </div>
        </div>
    );
};

const TheVault = ({ favorites, onClose, t, sound, removeFromFavs, onFlyTo }) => {
    const totalValue = favorites.reduce((acc, curr) => acc + curr.priceValue, 0);
    const formatMoney = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
    return (
        <div className="fixed inset-0 z-[55000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-5xl h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                <button className="absolute top-6 right-6 z-[60000] p-2 bg-white/5 rounded-full hover:bg-red-500/20 hover:text-red-500 text-white/50 transition-all cursor-pointer" onClick={(e) => { e.stopPropagation(); sound.playClick(); onClose(); }}><X size={20} /></button>
                <div className="flex justify-between items-end p-8 border-b border-white/5 bg-[#0a0a0a]"><div><h2 className="text-3xl font-light text-white tracking-widest uppercase mb-1">{t.vault.title}</h2><p className="text-[10px] font-mono text-white/40">{favorites.length} {t.vault.items} // PORTFOLIO</p></div><div className="text-right mr-12"><span className="block text-[10px] text-white/40 font-mono tracking-wider uppercase">{t.vault.totalValue}</span><span className="block text-4xl font-light tracking-tighter" style={{color: CORPORATE_BLUE}}>{formatMoney(totalValue)}</span></div></div>
                <div className="flex-grow overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar">{favorites.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-white/20 gap-4"><Layers size={64} strokeWidth={0.5} /><span className="font-mono text-xs tracking-[0.3em] uppercase">{t.vault.empty}</span></div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{favorites.map((fav) => (<div key={fav.id} className="group relative bg-[#111] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-lg flex flex-col" onClick={() => { sound.playDeploy(); onFlyTo(fav); onClose(); }}><div className="relative h-48 overflow-hidden cursor-pointer"><img src={fav.photoUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => {e.target.src = LUXURY_IMAGES[0]}} /><div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded border border-white/10"><span className="text-[10px] text-white font-mono">{fav.precio}</span></div></div><div className="p-4 flex flex-col gap-2 flex-grow justify-between"><div><h3 className="text-white text-sm font-medium truncate">{fav.title}</h3><p className="text-[10px] text-white/40 font-mono mt-1">{fav.id}</p></div><div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5"><span className="text-[10px] font-bold tracking-widest hover:underline cursor-pointer" style={{color: CORPORATE_BLUE}}>{t.vault.view}</span><button className="text-white/20 hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); sound.playClick(); removeFromFavs(fav); }}><X size={14} /></button></div></div></div>))}</div>)}</div>
            </div>
        </div>
    );
};

const ChatPanel = ({ t, sound, onClose, context }) => {
    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState("");
    useEffect(() => {
        if (context) { setMsgs([{id: 0, role: 'agent', text: `Hola, veo que le interesa ${context.title}. He preparado el dossier de la propiedad ${context.id}. ¿Desea agendar una visita privada?`}]); } 
        else { setMsgs([{id: 0, role: 'agent', text: t.chat.placeholder}]); }
    }, [context]);
    const handleSend = () => { if(!input.trim()) return; sound.playClick(); setMsgs([...msgs, {id: Date.now(), role: 'user', text: input}]); setInput(""); setTimeout(() => { sound.playPing(); setMsgs(prev => [...prev, {id: Date.now()+1, role: 'agent', text: "Mensaje recibido. Un agente le contactará."}]); }, 1000); };
    return (
        <div className="fixed bottom-28 right-8 w-80 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[10001] animate-fade-in-up">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#111]"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-xs font-bold text-white">{t.chat.agent}</span></div><button onClick={onClose}><X size={14} className="text-white/50 hover:text-white"/></button></div>
            <div className="h-64 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">{msgs.map(m => (<div key={m.id} className={`max-w-[85%] p-3 rounded-xl text-xs ${m.role === 'user' ? 'text-white border border-white/20 self-end' : 'bg-white/5 text-white/80 border border-white/5 self-start'}`} style={m.role === 'user' ? {backgroundColor: CORPORATE_BLUE + '20', borderColor: CORPORATE_BLUE} : {}}>{m.text}</div>))}</div>
            <div className="p-3 border-t border-white/10 flex gap-2"><input className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-white/30" placeholder={t.chat.placeholder} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} /><button onClick={handleSend} className="hover:text-white" style={{color: CORPORATE_BLUE}}><Send size={14}/></button></div>
        </div>
    );
};

const ProfileDashboard = ({ t, onClose }) => (
    <div className="fixed inset-0 z-[12000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-[#050505] border border-white/10 w-full max-w-md rounded-3xl p-8 relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white"><X size={20}/></button>
            <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white/5 p-1 mb-4 border border-white/10"><div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xl font-bold text-white">US</div></div>
                <h2 className="text-2xl font-light text-white tracking-widest uppercase">{t.profile.title}</h2>
                <span className="text-xs font-mono mb-8" style={{color: CORPORATE_BLUE}}>{t.profile.rank} ACCESS</span>
                <div className="w-full grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5"><div className="text-2xl text-white font-bold">12</div><div className="text-[10px] text-white/50 uppercase">{t.profile.missions}</div></div>
                    <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5"><div className="text-2xl text-white font-bold">03</div><div className="text-[10px] text-white/50 uppercase">{t.profile.conquests}</div></div>
                </div>
            </div>
        </div>
    </div>
);

// ==========================================
// 4. MAIN COMPONENT (ALIVEMAP) - DEFINIDO AL FINAL
// ==========================================
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
  // TRADUCCIÓN SEGURA
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
      // VUELO CINEMÁTICO AL DESBLOQUEAR
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
      // VUELTA AL MODO GLOBO (STANDARD)
      map.current = new mapboxgl.Map({ 
          container: mapContainer.current, 
          style: 'mapbox://styles/mapbox/standard', 
          center: [0, 40], // Centro neutral para vista global
          zoom: 2, 
          pitch: 0, 
          attributionControl: false, 
          antialias: true, 
          projection: 'globe' // GLOBO ACTIVADO PARA ENTRADA CINEMATICA
      }); 
      
      map.current.on('style.load', () => {
          map.current.setConfig('basemap', { 
              lightPreset: 'dusk',
              showPointOfInterestLabels: false, // SIN ETIQUETAS MOLESTAS
              showTransitLabels: false
          });
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
            {/* ChatPanel AHORA RECIBE EL CONTEXTO */}
            {activeTab === 'chat' && <ChatPanel t={t} sound={sound} onClose={() => setActiveTab('map')} context={chatContext} />}
            {activeTab === 'profile' && <ProfileDashboard t={t} onClose={() => setActiveTab('map')} />}
      </> )}
      
      {viewState !== 'ACTIVE' && <Gatekeeper onUnlock={handleUnlock} t={t} sound={sound} />}
    </>
  );
};

export default AliveMap;

