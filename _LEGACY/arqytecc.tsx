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










// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Activity, ArrowLeft, ArrowRight, ArrowUp, Camera, Check, CheckCircle2, Clock,
  Eye, FileCheck, FileText, Flame, Globe, LayoutGrid, Loader2, Map as MapIcon,
  MapPin, Megaphone, Paintbrush, Radar, Ruler, Search, Shield, ShieldCheck,
  Smartphone, TrendingUp, Truck, UploadCloud, Video, X, Zap, Award, Crown, Play, Film,
  Box, Droplets, Star, Bed, Bath, Maximize2, Building2, Home, Briefcase, LandPlot, Warehouse, Sun, Handshake, Coins, Calculator, Lock,
  // 🔥 NUEVOS ICONOS AÑADIDOS (Para Dúplex, Terraza, Aire, etc.)
  Wind, Thermometer, Armchair, Tent, Layers, Compass, SunDim, Trees, Hammer
} from "lucide-react";
import MapNanoCard from "./MapNanoCard";
import ExplorerHud from "./ExplorerHud";
import ProfilePanel from "./ProfilePanel";

// 👇 AÑADA SOLO ESTAS DOS LÍNEAS AQUÍ:
import StepAgencyExtras from "./StepAgencyExtras";
import StepOpenHouse from "./StepOpenHouse";

// ✅ AÑADIR "/app" DESPUÉS DE LA ARROBA
// 👇 Hemos añadido getUserMeAction para poder verificar el rol
import { savePropertyAction, getUserMeAction } from '@/app/actions';// 👇 AÑADIR ESTA LÍNEA DEBAJO DE LAS OTRAS IMPORTS
import { uploadToCloudinary } from '@/app/utils/upload';

const MAPBOX_TOKEN = "pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw";

// ==================================================================================
// 1. CONSTANTES GLOBALES (DEFINICIÓN ÚNICA - TIPOLOGÍAS AMPLIADAS)
// ==================================================================================
const OFFICIAL_TYPES = [
  { id: "flat", label: "Piso", icon: Building2 },
  { id: "penthouse", label: "Ático", icon: Sun },
  { id: "duplex", label: "Dúplex", icon: Layers }, // 🔥 NUEVO
  { id: "loft", label: "Loft", icon: Maximize2 },   // 🔥 NUEVO
  { id: "villa", label: "Villa", icon: Home },
  { id: "bungalow", label: "Bungalow", icon: Tent }, // 🔥 NUEVO
  { id: "office", label: "Oficina", icon: Briefcase },
  { id: "land", label: "Suelo", icon: LandPlot },
  { id: "industrial", label: "Nave", icon: Warehouse }
];

const PROPERTY_ICONS = {
  "Piso": Building2,
  "Ático": Sun,
  "Dúplex": Layers,    // 🔥 NUEVO
  "Loft": Maximize2,   // 🔥 NUEVO
  "Villa": Home,
  "Bungalow": Tent,    // 🔥 NUEVO
  "Oficina": Briefcase,
  "Suelo": LandPlot,
  "Nave": Warehouse
};

// --- PARSEADOR LOCAL ---
const parsePriceInput = (input: any): number => {
  if (typeof input === 'number') return input;
  if (!input) return 0;
  let str = String(input).toUpperCase().trim();
  let multiplier = 1;
  if (str.includes("M")) multiplier = 1_000_000;
  else if (str.includes("K")) multiplier = 1_000;
  str = str.replace(/\./g, "").replace(/,/g, ".").replace(/[^\d.]/g, "");
  const val = parseFloat(str);
  return (isNaN(val) ? 0 : val) * multiplier;
};

// ==================================================================================
// 🧠 DB MERCADO
// ==================================================================================
const REAL_MARKET_DB: Record<string, number> = {
  "IBIZA": 9200, "FORMENTERA": 8500, "SAN SEBASTIÁN": 6600, "MARBELLA": 6100,
  "MADRID": 5950, "BARCELONA": 5500, "SOTOGRANDE": 4800, "SITGES": 4600,
  "POZUELO": 5300, "MAJADAHONDA": 4900, "LAS ROZAS": 4300, "SANT CUGAT": 4700,
  "CALVIÀ": 5100, "ANDRATX": 6800, "BENAHAVÍS": 5200,
  "PALMA": 4200, "MÁLAGA": 3500, "VALENCIA": 2950, "ALICANTE": 2700,
  "BENIDORM": 3100, "JÁVEA": 3300, "DENIA": 2800, "ALTEA": 3000, "CALPE": 2900,
  "SANT JOAN": 2300, "CAMPELLO": 2500, "TORREVIEJA": 2100, "ORIHUELA": 2400,
  "ESTEPONA": 3900, "FUENGIROLA": 3600, "NERJA": 3400, "CADIZ": 2800,
  "CANARIAS": 2600, "LAS PALMAS": 2500, "SANTA CRUZ": 2400, "ADEJE": 3800,
  "BILBAO": 3700, "VITORIA": 3100, "SANTANDER": 3000, "PAMPLONA": 2800,
  "A CORUÑA": 2700, "VIGO": 2600, "SANTIAGO": 2300, "GIJÓN": 2200, "OVIEDO": 2000,
  "ZARAGOZA": 2100, "SEVILLA": 2600, "GRANADA": 2300, "CÓRDOBA": 1900,
  "VALLADOLID": 2000, "SALAMANCA": 2400, "BURGOS": 2100, "LEÓN": 1700,
  "TOLEDO": 1800, "GUADALAJARA": 2100, "SEGOVIA": 2000,
  "MURCIA": 1800, "CARTAGENA": 1600, "ALMERÍA": 1700, "HUELVA": 1600,
  "CASTELLÓN": 1500, "TARRAGONA": 2300, "GIRONA": 2700, "LLEIDA": 1400,
  "BADAJOZ": 1500, "CÁCERES": 1600, "CIUDAD REAL": 1200, "ALBACETE": 1700,
  "LOGROÑO": 1900, "HUESCA": 1700, "TERUEL": 1300, "SORIA": 1400,
  "ZAMORA": 1300, "PALENCIA": 1500, "ÁVILA": 1400, "CUENCA": 1300,
  "JAÉN": 1300, "CEUTA": 1900, "MELILLA": 1800,
};
const NATIONAL_AVG = 2150;

// ==================================================================================
// ✅ ARCHITECT HUD (MAIN)
// ==================================================================================
export default function ArchitectHud({ onCloseMode, soundFunc, initialData }: any) {
const STEPS = [
  "LOCATION",
  "BASICS",
  "SPECS",
  "DESCRIPTION",
  "ENERGY",
  "MEDIA",
  "PRICE",
  "ANALYSIS",
  "RADAR",
  "SUCCESS",
];
const LABEL_STEPS = ["LOCATION","BASICS","SPECS","DESCRIPTION","ENERGY","MEDIA","PRICE","ANALYSIS","RADAR"];

  const [step, setStep] = useState<string>("LOCATION");
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(false);
 const [showProfile, setShowProfile] = useState(false);
const [showWizard, setShowWizard] = useState(true);

  
/// ---------------------------------------------------------------------------
  // 🧠 CEREBRO DE GESTIÓN HÍBRIDO + ANTENA DE MAPA
  // ---------------------------------------------------------------------------
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
// 🔥 PARCHE DE EMERGENCIA: DETECTAR ROL DE AGENCIA AUTOMÁTICAMENTE
  useEffect(() => {
    const verifyRole = async () => {
      try {
        // @ts-ignore
        const res = await getUserMeAction();
        if (res?.success && res.data?.role === 'AGENCIA') {
           console.log("🦅 HUD: RANGO DE AGENCIA CONFIRMADO. ACTIVANDO HERRAMIENTAS.");
           setFormData((prev: any) => ({ ...prev, isAgencyContext: true }));
        }
      } catch (e) { console.error("Error verificando rol", e); }
    };
    verifyRole();
  }, []);
  // 1. Detectar cuál es la propiedad activa real
  const activeProperty = myProperties.find(p => String(p.id) === String(activePropertyId)) || null;

  // 2. Cargar flota Y ESCUCHAR AL MAPA 📡
  useEffect(() => {
    // A. Cargar propiedades del disco duro
    const loadFleet = () => {
      try {
        const saved = localStorage.getItem('stratos_my_properties');
        if (saved) {
          const parsed = JSON.parse(saved);
          setMyProperties(parsed);
          // Si no hay activa, seleccionamos la primera por defecto
          if (parsed.length > 0 && !activePropertyId) {
            setActivePropertyId(parsed[0].id);
          }
        }
      } catch (e) { console.error("Fallo de radar:", e); }
    };

    // B. Escuchar clicks en el Mapa (NanoCards)
    const handleMapSelection = (e: any) => {
        const id = e.detail?.id; 
        if (id) {
            console.log("📍 HUD: Objetivo fijado en mapa ->", id);
            setActivePropertyId(id); // Fijamos la propiedad
            setShowWizard(false);    // Salimos del modo creación
         
            setShowProfile(true);    // Opcional: abrir perfil o lo que prefiera
        }
    };

    loadFleet();

    // SUSCRIPCIONES A EVENTOS
    window.addEventListener('reload-profile-assets', loadFleet);
    window.addEventListener('select-property-signal', handleMapSelection);

    return () => {
        window.removeEventListener('reload-profile-assets', loadFleet);
        window.removeEventListener('select-property-signal', handleMapSelection);
    };
  }, [activePropertyId]);

  // 3. EL GATILLO INTELIGENTE (El Interruptor)
  const handleSmartToggle = (serviceId: string) => {
    // A. MODO WIZARD (Protegemos lo sagrado: Usa tu lógica original)
    if (showWizard) {
      toggleService(serviceId); 
      return;
    }

    // B. MODO MAPA (Edición en vivo)
    if (activeProperty) {
      const current = activeProperty.selectedServices || [];
      const updated = current.includes(serviceId)
        ? current.filter((x: any) => x !== serviceId) // Quitar
        : [...current, serviceId]; // Añadir

      // Guardamos en la Base de Datos Real
      const newFleet = myProperties.map(p => 
        p.id === activeProperty.id ? { ...p, selectedServices: updated } : p
      );
      setMyProperties(newFleet);
      localStorage.setItem('stratos_my_properties', JSON.stringify(newFleet));

      // Avisamos al Mapa para que pinte la NanoCard nueva
      const event = new CustomEvent('update-property-signal', { 
        detail: { id: activeProperty.id, updates: { selectedServices: updated } } 
      });
      window.dispatchEvent(event);
    }
  };

 const [formData, setFormData] = useState<any>({
    address: "",
    coordinates: null,
    type: "Piso",
    floor: "",
    door: "",
    elevator: false,
    mBuilt: "",
    mUseful: "",
    rooms: 2,
    baths: 1,
    state: "Buen estado",
    exterior: true,
    title: "",
    description: "",
    energyConsumption: "",
    energyEmissions: "",
    energyPending: false,
    images: [],
    price: "", 
    communityFees: "",
    selectedServices: [],
    
    // ✅ CORRECTO: Se inician como texto vacío. 
    // Cuando suba el PDF, aquí se guardará "https://cloudinary.com/..." automáticamente.
    videoUrl: "",
    tourUrl: "",
    simpleNoteUrl: "",
    energyCertUrl: "",
    openHouse: { enabled: false, amenities: [] },
    
    // 🔥 IMPORTANTE: FALSE por defecto para proteger el pago de particulares
    isAgencyContext: false 
  });

 // EDICIÓN BLINDADA V4 (CORREGIDA: INICIO INTELIGENTE)
  useEffect(() => {
    if (initialData) {
      console.log("🔍 MODO ARQUITECTO ACTIVO:", initialData);


// ✅ SOLUCIÓN: Si no hay set, usamos el array directo o vacío
const normalizedServices = initialData.selectedServices || [];
      // --- 2. OPERACIÓN RESCATE DE ASCENSOR ---
      let rawElevator = initialData.elevator;
      if (rawElevator === undefined && initialData.specs) {
          rawElevator = initialData.specs.elevator;
      }
      const normalizedElevator = rawElevator === true || String(rawElevator) === "true" || rawElevator === 1;

      // --- 3. NORMALIZACIÓN DE PRECIO ---
      const normalizedPrice = initialData.rawPrice 
          ? String(initialData.rawPrice) 
          : (initialData.price ? String(initialData.price).replace(/\D/g, "") : "");

     

      setFormData((prev: any) => ({
        ...prev,
        ...initialData,
        mBuilt: initialData.mBuilt || initialData.m2 || "",
        elevator: normalizedElevator,     
        selectedServices: normalizedServices,
        price: normalizedPrice,
        
        // 🔥 RECUPERACIÓN DE MEMORIA (AQUÍ ESTABA EL FALLO)
        // Forzamos a leer estos campos de la base de datos:
        communityFees: (initialData.communityFees ?? ""),
   
        energyConsumption: initialData.energyConsumption || "", 
        energyEmissions: initialData.energyEmissions || "",     
        energyPending: initialData.energyPending === true,      
        
        // ⚡️ CORRECCIÓN: Solo es modo edición si tiene ID real
        isEditMode: !!initialData.id, 
        // ⚡️ CORRECCIÓN: Capturamos la credencial de agencia
        isAgencyContext: initialData.isAgencyContext || false,
        coordinates: initialData.coordinates || prev.coordinates || null,
      }));

      // 🔥 LÓGICA DE SALTO: ¿NUEVO O EXISTENTE?
      if (initialData.address || initialData.id) {
          setStep("BASICS");
      } else {
          setStep("LOCATION");
      }
    }
  }, [initialData]);

  const updateData = (field: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, [field]: value }));
// HANDLERS SERVICIOS (EXTRAS) - VERSIÓN BLINDADA
  const toggleService = (id: string) => {
    // 1. Leemos la verdad actual del formulario
    const currentList = formData.selectedServices || [];
    let newList = [];

    // 2. Aplicamos la lógica (Packs exclusivos vs Extras acumulables)
    if (id.startsWith("pack_")) {
      if (currentList.includes(id)) {
          newList = currentList.filter((x: string) => x !== id);
      } else {
          // Quitamos otros packs, pero MANTENEMOS los extras (pool, garage, etc)
          const nonPackServices = currentList.filter((x: string) => !x.startsWith("pack_"));
          newList = [...nonPackServices, id];
      }
    } else {
      // Toggle Normal (Añadir/Quitar)
      newList = currentList.includes(id) 
        ? currentList.filter((x: string) => x !== id) 
        : [...currentList, id];
    }
    
    // 3. Sincronizamos SOLO EL FORMULARIO (La línea vieja se ha eliminado)
    setFormData((f: any) => ({ ...f, selectedServices: newList }));
  };

  const progress = useMemo(() => {
    const idx = STEPS.indexOf(step);
    const safeIdx = idx < 0 ? 0 : idx;
    return ((safeIdx + 1) / STEPS.length) * 100;
  }, [step]);

  const labelStep = useMemo(() => {
    const idx = LABEL_STEPS.indexOf(step);
    if (idx >= 0) return idx + 1;
    return LABEL_STEPS.length;
  }, [step]);

  const closeWizard = (payload?: any) => {
    setIsClosing(true);
    setTimeout(() => {
      if (onCloseMode) onCloseMode(!!payload, payload);
    }, 700);
  };

  const currentRawPrice = useMemo(() => {
      return parsePriceInput(formData.price);
  }, [formData.price]);

  return (
    <div className="absolute inset-0 pointer-events-none z-[5000]">
    {/* NANO CARD PREVIEW BLINDADA */}
      {step !== "SUCCESS" && (
        <MapNanoCard 
            {...formData} 
            rooms={formData.rooms}
            baths={formData.baths}
            mBuilt={formData.mBuilt}
            rawPrice={currentRawPrice} 
            priceValue={currentRawPrice} 
            price={formData.price}
            // 👇 ESTO ARREGLA LA FOTO ROTA: Si no hay imagen, pone una genérica
            img={formData.images?.[0] || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80"}
        />
      )}

      {!showWizard && (
        <ExplorerHud
          onCloseMode={() => closeWizard()}
          soundFunc={soundFunc}
          onGoToMap={() => setShowWizard(true)}
        />
      )}

     {/* --- 1. PANEL DE PERFIL --- */}
      <ProfilePanel
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        
        onSelectProperty={(id: string) => {
             console.log("🎯 Objetivo fijado:", id);
             setActivePropertyId(id);
             setShowWizard(false); 
              
        }}

        // ❌ BORRE ESTA LÍNEA QUE CAUSA EL ERROR:
        // activeServicesCount={currentServiceCount} 

        // ✅ DEJE ESTAS:
        rightPanel={showProfile ? "PROFILE" : "NONE"}
        toggleRightPanel={(val: string) => setShowProfile(val === "PROFILE")}
      />
   

    {showWizard && (
        <div
          className={`fixed inset-0 z-[7000] flex items-center justify-center p-4 transition-all duration-500 ${
            isClosing ? "opacity-0" : "opacity-100"
          } pointer-events-auto`}
        >
          {/* FONDO GLASS */}
          <div className="absolute inset-0 bg-[#F5F5F7]/95 backdrop-blur-xl transition-all" />

          {/* CONTENEDOR PRINCIPAL */}
          <div
            className={`relative z-10 w-[90vw] max-w-5xl h-[85vh] flex flex-col overflow-hidden 
            transform transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1)
            rounded-[32px] bg-gradient-to-b from-white to-[#FAFAFA] 
            shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.03)]
            ${isClosing ? "scale-95 translate-y-10 opacity-0" : "scale-100 translate-y-0 opacity-100"}`}
          >
            {/* Header */}
            {step !== "SUCCESS" && (
              <div className="px-8 pt-8 pb-6 border-b border-gray-100/50 bg-white/80 backdrop-blur-md z-20 shrink-0">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase mb-1">
                      ASISTENTE STRATOS
                    </span>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">
                      Paso {labelStep} <span className="text-gray-300">/</span> {LABEL_STEPS.length}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => closeWizard()} 
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 active:scale-90"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                
                {/* Barra Progreso */}
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#0071e3] shadow-[0_0_10px_rgba(0,113,227,0.3)] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            )}

            {/* Contenido Dinámico */}
            <div className="flex-1 overflow-hidden relative z-10 p-0 bg-white">
              <div className="h-full w-full overflow-y-auto custom-scrollbar p-8 lg:px-12">
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                    {step === "LOCATION" && <StepLocation formData={formData} updateData={updateData} setStep={setStep} />}
{step === "BASICS" && <StepBasics formData={formData} updateData={updateData} setStep={setStep} />}
{step === "SPECS" && <StepSpecs formData={formData} updateData={updateData} setStep={setStep} />}
{step === "DESCRIPTION" && <StepDescription formData={formData} updateData={updateData} setStep={setStep} />}
{step === "ENERGY" && <StepEnergy formData={formData} updateData={updateData} setStep={setStep} />}
{step === "MEDIA" && <StepMedia formData={formData} updateData={updateData} setStep={setStep} />}
{step === "PRICE" && <StepPrice formData={formData} updateData={updateData} setStep={setStep} />}
{/* 🔥 INICIO BLOQUE AGENCIA (PEGAR ESTO) 🔥 */}
                    
                    {step === "AGENCY_EXTRAS" && (
                        <div className="h-full flex flex-col animate-fade-in-right px-2">
                            {/* CABECERA */}
                            <div className="mb-6 shrink-0">
                                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Agencia Pro</h2>
                                <p className="text-gray-500 font-medium">Contenido multimedia y documentación legal.</p>
                            </div>
                            
                            {/* CUERPO CON SCROLL */}
                            <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-8 pt-2">
                                <StepAgencyExtras formData={formData} setFormData={setFormData} />
                            </div>

                            {/* BOTONERA */}
                            <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
                                <button onClick={() => setStep("PRICE")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95">
                                    <ArrowLeft size={24} />
                                </button>
                                <button onClick={() => setStep("OPEN_HOUSE")} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">
                                    Gestionar Eventos <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "OPEN_HOUSE" && (
                        <div className="h-full flex flex-col animate-fade-in-right px-2">
                            {/* CABECERA */}
                            <div className="mb-6 shrink-0">
                                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Open House</h2>
                                <p className="text-gray-500 font-medium">Organiza jornadas de puertas abiertas.</p>
                            </div>

                            {/* CUERPO CON SCROLL */}
                            <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-8 pt-2">
                                <StepOpenHouse formData={formData} setFormData={setFormData} />
                            </div>

                            {/* BOTONERA */}
                            <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
                                <button onClick={() => setStep("AGENCY_EXTRAS")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95">
                                    <ArrowLeft size={24} />
                                </button>
                                <button onClick={() => setStep("ANALYSIS")} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">
                                    Analizar Mercado <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 🔥 FIN BLOQUE AGENCIA 🔥 */}
{step === "ANALYSIS" && <MarketAnalysisStep formData={formData} onNext={() => setStep("RADAR")} />}

{step === "RADAR" && (
  <MarketRadarStep
    formData={formData}
    onNext={() => setStep("SUCCESS")}
  />
)}

{step === "SUCCESS" && (
  <StepSuccess
    formData={formData}
    handleClose={(payload: any) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("reload-profile-assets"));
        window.dispatchEvent(new CustomEvent("force-map-refresh"));
      }
      closeWizard(payload);
    }}
  />
)}

                </div>
              </div>

              {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-fade-in">
                  <div className="relative">
                      <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
                      <div className="absolute top-0 w-12 h-12 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Sincronizando...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}</div>
  );
}

// ============================================================================
// 🧱 STEPS COMPONENTS
// ============================================================================

const StepLocation = ({ formData, updateData, setStep }: any) => {
  const [query, setQuery] = useState(formData.address || "");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

 const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      setIsSearching(true);
      setShowResults(true);
      try {
        // COORDENADAS DE LA PUERTA DEL SOL (MADRID)
        // Esto obliga a Mapbox a poner lo que esté cerca de Madrid PRIMERO.
        const MADRID_CENTER = "-3.7038,40.4168"; 
        
        // SOLO ESPAÑA
        const SPAIN_BBOX = "-18.1612,27.6377,4.3279,43.7924"; 

        // TIPOS DE DATOS
        const TYPES = "district,locality,neighborhood,address,poi";

        // 🚨 CHIVATO EN CONSOLA (Si no ve esto, no se ha actualizado)
        console.log("🚨 BUSCANDO CON PRIORIDAD MADRID 🚨:", text);

        // 🔥 LA URL MAESTRA:
        // proximity=MADRID: Gana Madrid.
        // bbox=SPAIN: Solo España.
        // limit=10: Vemos hasta 10 resultados.
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_TOKEN}&country=es&types=${TYPES}&proximity=${MADRID_CENTER}&bbox=${SPAIN_BBOX}&language=es&autocomplete=true&fuzzyMatch=true&limit=10`;

        const res = await fetch(url);
        const data = await res.json();
        setResults(data.features || []);

      } catch (error) {
        console.error(error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const selectAddress = (feature: any) => {
    setQuery(feature.place_name);
    updateData("address", feature.place_name);
    updateData("coordinates", feature.center);

    const ctx = feature?.context || [];
    const getCtx = (prefix: string) => {
      const hit = ctx.find((c: any) => (c.id || "").startsWith(prefix + "."));
      return hit?.text || "";
    };

    const postcode = getCtx("postcode"); 
    const place = getCtx("place") || getCtx("locality"); 
    const region = getCtx("region"); 

    if (postcode) updateData("postcode", postcode);
    if (place) updateData("city", place);
    if (region) updateData("region", region);

    setShowResults(false);
  };

  const canContinue = query.length > 5 && formData.address;

  return (
    <div className="h-full flex flex-col animate-fade-in-right p-1">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Ubicación</h2>
      <p className="text-gray-500 mb-6 text-sm">Busca la dirección exacta del activo.</p>

      <div className="flex-1 flex flex-col gap-4 relative">
        <div className="relative z-50">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {isSearching ? <Loader2 size={20} className="animate-spin text-blue-500" /> : <Search size={20} />}
          </div>

          <input
            autoFocus
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 p-4 bg-white rounded-xl border border-gray-200 focus:border-black outline-none font-medium text-gray-900 shadow-sm transition-all"
            placeholder="Ej: Ciudad, Calle y Número..."
          />

          {showResults && results.length > 0 && (
            <div className="absolute top-[110%] left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto custom-scrollbar z-[60]">
              {results.map((item: any, index: number) => (
                <div
                  key={`${item.id}-${index}`}
                  onClick={() => selectAddress(item)}
                  className="p-4 border-b border-gray-50 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <div className="p-2 bg-gray-100 rounded-full text-gray-500 shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className="font-bold text-gray-900 text-sm truncate">{item.text}</div>
                    <div className="text-xs text-gray-500 truncate">{item.place_name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center bg-gray-50/50 min-h-[200px]">
          {canContinue ? (
           /* ✅ NUEVO BLOQUE: VISIÓN SATÉLITE (Sustituye al Check verde) */
            <div className="relative w-full h-full min-h-[220px] rounded-xl overflow-hidden shadow-md group animate-in zoom-in duration-300">
              
              {/* 1. LA IMAGEN DEL MAPA (Usamos formData.coordinates que ya guardó antes) */}
              {formData.coordinates && (
                <img 
                 src={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/pin-s+ff0000(${formData.coordinates[0]},${formData.coordinates[1]})/${formData.coordinates[0]},${formData.coordinates[1]},17,0/600x300?access_token=${MAPBOX_TOKEN}`}
                  alt="Vista Satélite"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}

              {/* 2. CAPA DE TEXTO ELEGANTE (SOBRE EL MAPA) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
                <div className="flex items-center gap-2 mb-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Objetivo Localizado</span>
                </div>
                
                <h3 className="text-white font-bold text-lg leading-tight truncate shadow-sm">
                  {formData.address}
                </h3>
                
                <p className="text-gray-300 text-xs mt-1 truncate font-medium">
                  {formData.city ? `${String(formData.city).toUpperCase()}${formData.postcode ? ` (${formData.postcode})` : ""}` : ""}
                </p>
              </div>

              {/* 3. BOTÓN "X" PARA CANCELAR (Arriba a la derecha) */}
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Evita clics fantasma
                  setQuery(""); 
                  updateData("coordinates", null);
                  updateData("address", "");
                  // Al borrar el query y address, 'canContinue' pasará a false automáticamente
                }}
                className="absolute top-3 right-3 bg-black/40 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-all border border-white/20 z-20"
                title="Cambiar ubicación"
              >
                <X size={16} /> 
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-40">
              <MapIcon size={48} className="mb-4 text-gray-400" />
              <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Esperando dirección...</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setStep("BASICS")}
        disabled={!canContinue}
        className="w-full py-4 text-white font-bold rounded-2xl shadow-lg mt-6 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: canContinue ? "#000000" : "#cccccc" }}
      >
        Continuar <ArrowRight size={18} />
      </button>
    </div>
  );
};

// --- PASO 2: BÁSICOS (VERSIÓN 2.0 - ESTADO + ORIENTACIÓN + NUEVAS TIPOLOGÍAS) ---
const StepBasics = ({ formData, updateData, setStep }: any) => {
  const [localDoor, setLocalDoor] = useState(formData.door || "");
  const saveDoor = () => updateData("door", localDoor);

  // 🔥 LÓGICA AMPLIADA: Bungalow, Villa, Suelo y Nave NO piden planta/ascensor
  const isLandOrVilla = ["Suelo", "Nave", "Villa", "Bungalow"].includes(formData.type);
  const isFloorRequired = !isLandOrVilla;
  
  // Validación para continuar
  const floorValid = isFloorRequired ? (formData.floor !== "" && formData.floor !== undefined) : true;
  const canContinue = formData.type && floorValid;

  return (
    <div className="h-full flex flex-col animate-fade-in-right">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Características</h2>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-6">
        
        {/* 1. TIPO DE INMUEBLE (Usa la lista global actualizada) */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">
            Tipo de inmueble <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3 pb-2">
            {OFFICIAL_TYPES.map((item) => {
                const isSelected = formData.type === item.label;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                        updateData("type", item.label);
                        // Si es tipo suelo/casa, limpiamos planta y ascensor
                        if (["Suelo", "Nave", "Villa", "Bungalow"].includes(item.label)) {
                            updateData("floor", ""); 
                            updateData("elevator", false);
                        }
                    }}
                    className={`
                        flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200
                        ${isSelected 
                            ? "border-blue-600 bg-blue-600 text-white shadow-md scale-105" 
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300"}
                    `}
                  >
                    <item.icon size={22} strokeWidth={isSelected ? 2 : 1.5} />
                    <span className="text-[10px] font-bold uppercase">{item.label}</span>
                  </button>
                )
            })}
          </div>
        </div>

        {/* 2. 🔥 NUEVO: ESTADO DE CONSERVACIÓN */}
        <div>
           <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Estado</label>
           <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {['Obra Nueva', 'Buen Estado', 'Reformado', 'A Reformar'].map((st) => (
                  <button
                    key={st}
                    onClick={() => updateData("state", st)}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                        formData.state === st 
                        ? "bg-black text-white border-black" 
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {st}
                  </button>
              ))}
           </div>
        </div>

        {/* 3. PLANTA Y PUERTA (Solo si aplica) */}
        {!isLandOrVilla && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">
                    Planta <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <select
                      className="w-full p-4 bg-gray-50 rounded-xl border border-gray-300 text-gray-900 font-bold focus:border-black outline-none transition-all appearance-none cursor-pointer"
                      value={formData.floor}
                      onChange={(e) => updateData("floor", e.target.value)}
                    >
                      <option value="" disabled className="text-gray-400">Selecciona</option>
                      <option value="Bajo">Bajo</option>
                      <option value="Entreplanta">Entreplanta</option>
                      {[1,2,3,4,5,6,7,8,9,10,11,12,15,20].map((n) => (
                        <option key={n} value={n}>{n}ª Planta</option>
                      ))}
                      <option value="Atico">Ático</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowUp size={16} className="text-gray-400"/>
                    </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Puerta</label>
                <input
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-300 text-gray-900 font-bold focus:border-black outline-none transition-all placeholder:text-gray-400"
                  placeholder="Ej: 2B"
                  value={localDoor}
                  onChange={(e) => setLocalDoor(e.target.value)}
                  onBlur={saveDoor}
                />
              </div>
            </div>
        )}

        {/* 4. 🔥 NUEVO: EXTERIOR Y ASCENSOR */}
        {!isLandOrVilla && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                {/* Selector Exterior/Interior */}
                <div>
                   <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Posición</label>
                   <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button 
                        onClick={() => updateData("exterior", true)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.exterior ? "bg-white shadow text-gray-900" : "text-gray-400"}`}
                      >Exterior</button>
                      <button 
                        onClick={() => updateData("exterior", false)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!formData.exterior ? "bg-white shadow text-gray-900" : "text-gray-400"}`}
                      >Interior</button>
                   </div>
                </div>
                
                {/* Selector Ascensor */}
                <div>
                   <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Ascensor</label>
                   <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button 
                        onClick={() => updateData("elevator", true)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.elevator ? "bg-white shadow text-blue-600" : "text-gray-400"}`}
                      >Sí</button>
                      <button 
                        onClick={() => updateData("elevator", false)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!formData.elevator ? "bg-white shadow text-gray-900" : "text-gray-400"}`}
                      >No</button>
                   </div>
                </div>
            </div>
        )}

        {/* 5. 🔥 NUEVO: ORIENTACIÓN */}
        <div>
           <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Orientación</label>
           <div className="grid grid-cols-4 gap-2">
              {['Norte', 'Sur', 'Este', 'Oeste'].map((ori) => (
                  <button
                    key={ori}
                    onClick={() => updateData("orientation", ori)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        formData.orientation === ori 
                        ? "bg-blue-50 text-blue-600 border-blue-200" 
                        : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    {ori}
                  </button>
              ))}
           </div>
        </div>

      </div>

      <div className="mt-4 flex gap-4 pt-4 border-t border-gray-100">
        <button onClick={() => setStep("LOCATION")} className="p-4 bg-gray-100 text-gray-800 rounded-2xl hover:bg-gray-200 transition-all active:scale-95">
          <ArrowLeft size={24} />
        </button>
        <button 
            onClick={() => { saveDoor(); setStep("SPECS"); }} 
            disabled={!canContinue}
            className={`
                w-full py-4 font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all 
                ${canContinue 
                    ? "bg-black text-white hover:scale-[1.02] active:scale-95 cursor-pointer" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"}
            `}
        >
          {canContinue ? "Siguiente" : "Completa los datos"} 
          {canContinue && <ArrowRight size={18} />}
        </button>
      </div>
    </div>
  );
};

// --- PASO 3: DETALLES Y EXTRAS (ARSENAL COMPLETO) ---
const StepSpecs = ({ formData, updateData, setStep }: any) => {
  const formatNumber = (val: any) => {
    if (!val) return "";
    const raw = val.toString().replace(/\D/g, "");
    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const [localM2, setLocalM2] = useState(formData.mBuilt ? formatNumber(formData.mBuilt) : "");

  const toggleExtra = (id: string) => {
      const current = formData.selectedServices || [];
      const updated = current.includes(id) 
        ? current.filter((x: string) => x !== id)
        : [...current, id];
      updateData("selectedServices", updated);
  };

  // 🔥 LISTA DE EXTRAS ACTUALIZADA (10 ELEMENTOS)
  const EXTRAS = [
      { id: 'pool', label: 'Piscina', icon: Droplets },
      { id: 'garage', label: 'Garaje', icon: Box },
      { id: 'garden', label: 'Jardín', icon: Trees },      // Actualizado a Trees (más lógico)
      { id: 'terrace', label: 'Terraza', icon: SunDim },    // Nuevo
      { id: 'balcony', label: 'Balcón', icon: Compass },    // Nuevo
      { id: 'storage', label: 'Trastero', icon: Warehouse },// Nuevo (Usa icono Warehouse)
      { id: 'ac', label: 'Aire Acond.', icon: Wind },       // Nuevo
      { id: 'heating', label: 'Calefacción', icon: Thermometer }, // Nuevo
      { id: 'furnished', label: 'Amueblado', icon: Armchair },    // Nuevo
      { id: 'security', label: 'Seguridad', icon: ShieldCheck }
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2">
      <div className="mb-6 shrink-0">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Detalles</h2>
        <p className="text-gray-500 font-medium">Define espacios y extras.</p>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-8 pt-2">
        {/* SUPERFICIE */}
        <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 shadow-inner group focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-blue-600">Superficie Construida</label>
          <div className="relative flex items-baseline">
            <input 
                className="w-full bg-transparent text-5xl font-black text-gray-900 outline-none placeholder:text-gray-300 tracking-tight" 
                placeholder="0" 
                value={localM2} 
                onChange={(e) => setLocalM2(formatNumber(e.target.value))} 
                onBlur={() => updateData("mBuilt", localM2.replace(/\./g, ""))} 
                autoFocus 
            />
            <span className="text-xl font-bold text-gray-400 ml-2">m²</span>
          </div>
        </div>

        {/* HABITACIONES Y BAÑOS */}
        <div className="grid grid-cols-2 gap-6">
          <div className="p-5 rounded-[24px] border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Habitaciones</label>
            <div className="flex items-center justify-between">
              <button onClick={() => updateData("rooms", Math.max(0, Number(formData.rooms || 0) - 1))} className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 font-bold text-xl">-</button>
              <span className="text-3xl font-black text-gray-900 min-w-[40px] text-center">{formData.rooms}</span>
              <button onClick={() => updateData("rooms", Number(formData.rooms || 0) + 1)} className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xl">+</button>
            </div>
          </div>

          <div className="p-5 rounded-[24px] border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Baños</label>
            <div className="flex items-center justify-between">
              <button onClick={() => updateData("baths", Math.max(0, Number(formData.baths || 0) - 1))} className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 font-bold text-xl">-</button>
              <span className="text-3xl font-black text-gray-900 min-w-[40px] text-center">{formData.baths}</span>
              <button onClick={() => updateData("baths", Number(formData.baths || 0) + 1)} className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xl">+</button>
            </div>
          </div>
        </div>

        {/* EXTRAS - REJILLA AMPLIADA */}
        <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Extras y Comodidades</label>
            <div className="grid grid-cols-2 gap-3">
                {EXTRAS.map((extra) => {
                    const isSelected = (formData.selectedServices || []).includes(extra.id);
                    return (
                        <button 
                            key={extra.id} 
                            onClick={() => toggleExtra(extra.id)} 
                            className={`
                                flex items-center gap-3 p-4 rounded-xl border transition-all 
                                ${isSelected 
                                    ? 'bg-black text-white border-black shadow-lg scale-[1.02]' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                            `}
                        >
                            <extra.icon size={18} />
                            <span className="text-sm font-bold">{extra.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
      </div>

      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
        <button onClick={() => setStep("BASICS")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95">
          <ArrowLeft size={24} />
        </button>
        <button onClick={() => setStep("DESCRIPTION")} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">
          Siguiente Paso <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

const StepDescription = ({ formData, updateData, setStep }: any) => {
  const [localTitle, setLocalTitle] = useState(formData.title || "");
  const [localDesc, setLocalDesc] = useState(formData.description || "");

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2">
      <div className="mb-6 shrink-0">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Narrativa</h2>
        <p className="text-gray-500 font-medium">Cuenta la historia de tu propiedad.</p>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto px-4 -mx-4 custom-scrollbar pt-2 pb-4">
        <div className="group">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-blue-600">Titular del Anuncio</label>
          <input className="w-full p-5 bg-gray-50 rounded-[24px] border border-gray-100 text-2xl font-bold text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:bg-white focus:shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-blue-500/10" placeholder="Ej: Ático de lujo en Serrano..." value={localTitle} onChange={(e) => setLocalTitle(e.target.value)} onBlur={() => updateData("title", localTitle)} autoFocus />
        </div>

        <div className="group h-full max-h-[40vh] flex flex-col">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-blue-600">Descripción Detallada</label>
          <textarea className="w-full flex-1 p-6 bg-gray-50 rounded-[24px] border border-gray-100 text-lg font-medium text-gray-700 leading-relaxed placeholder:text-gray-300 resize-none outline-none transition-all focus:bg-white focus:text-gray-900 focus:shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-blue-500/10" placeholder="Describe los espacios, la luz, los acabados y lo que hace única a esta propiedad..." value={localDesc} onChange={(e) => setLocalDesc(e.target.value)} onBlur={() => updateData("description", localDesc)} />
        </div>
      </div>

      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
        <button onClick={() => setStep("SPECS")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"><ArrowLeft size={24} /></button>
        <button onClick={() => setStep("ENERGY")} disabled={!localTitle} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">Siguiente Paso <ArrowRight size={20} /></button>
      </div>
    </div>
  );
};

const StepEnergy = ({ formData, updateData, setStep }: any) => {
  const RATINGS = ["A", "B", "C", "D", "E", "F", "G"];
  const togglePending = () => { const newState = !formData.energyPending; updateData("energyPending", newState); if (newState) { updateData("energyConsumption", ""); updateData("energyEmissions", ""); } };
  const getStyle = (r: string, current: string) => {
    const isSelected = current === r; const isDisabled = formData.energyPending;
    if (isDisabled) return "bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed scale-95 opacity-50";
    const colors: any = { A: { bg: "bg-[#009345]", text: "text-[#009345]", border: "border-[#009345]", shadow: "shadow-[#009345]/40" }, B: { bg: "bg-[#4FB848]", text: "text-[#4FB848]", border: "border-[#4FB848]", shadow: "shadow-[#4FB848]/40" }, C: { bg: "bg-[#B5D638]", text: "text-[#B5D638]", border: "border-[#B5D638]", shadow: "shadow-[#B5D638]/40" }, D: { bg: "bg-[#FFF100]", text: "text-[#D4C800]", border: "border-[#FFF100]", shadow: "shadow-[#FFF100]/40" }, E: { bg: "bg-[#FDB913]", text: "text-[#FDB913]", border: "border-[#FDB913]", shadow: "shadow-[#FDB913]/40" }, F: { bg: "bg-[#F37021]", text: "text-[#F37021]", border: "border-[#F37021]", shadow: "shadow-[#F37021]/40" }, G: { bg: "bg-[#E30613]", text: "text-[#E30613]", border: "border-[#E30613]", shadow: "shadow-[#E30613]/40" } };
    const c = colors[r];
    if (isSelected) { return `${c.bg} border-transparent text-white shadow-lg ${c.shadow} scale-110 z-10 font-black ring-2 ring-white ring-offset-2 ${r === 'D' ? '!text-gray-900' : ''}`; }
    return `bg-white border-2 ${c.border} ${c.text} font-bold hover:bg-gray-50 hover:scale-105 transition-transform`;
  };

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2">
      <div className="mb-6 shrink-0"><h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Certificación</h2><p className="text-gray-500 font-medium">Eficiencia energética y emisiones.</p></div>
      <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-4 pt-2 space-y-8">
        <div onClick={togglePending} className={`group cursor-pointer p-4 rounded-[20px] border-2 transition-all duration-300 flex items-center justify-between ${formData.energyPending ? "bg-blue-50 border-blue-500 shadow-md" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"}`}>
            <div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${formData.energyPending ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"}`}><FileCheck size={24} /></div><div><span className={`block font-bold text-lg ${formData.energyPending ? "text-blue-900" : "text-gray-900"}`}>En trámite / Exento</span><span className="text-xs text-gray-500 font-medium">Aún no dispongo del certificado oficial</span></div></div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.energyPending ? "bg-blue-600 border-blue-600 scale-110" : "border-gray-300"}`}>{formData.energyPending && <Check size={14} className="text-white" />}</div>
        </div>
        <div className={`transition-all duration-500 ${formData.energyPending ? "opacity-30 pointer-events-none grayscale blur-[1px]" : "opacity-100"}`}>
            <div className="mb-8"><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Zap size={14} className="text-yellow-500" fill="currentColor"/> Consumo de Energía</label><div className="grid grid-cols-7 gap-2 sm:gap-3">{RATINGS.map((r) => (<button key={`cons-${r}`} onClick={() => updateData("energyConsumption", r)} className={`aspect-square rounded-xl sm:rounded-2xl text-lg sm:text-xl transition-all duration-300 flex items-center justify-center ${getStyle(r, formData.energyConsumption)}`}>{r}</button>))}</div></div>
            <div><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Flame size={14} className="text-orange-500" fill="currentColor"/> Emisiones CO₂</label><div className="grid grid-cols-7 gap-2 sm:gap-3">{RATINGS.map((r) => (<button key={`em-${r}`} onClick={() => updateData("energyEmissions", r)} className={`aspect-square rounded-xl sm:rounded-2xl text-lg sm:text-xl transition-all duration-300 flex items-center justify-center ${getStyle(r, formData.energyEmissions)}`}>{r}</button>))}</div></div>
        </div>
      </div>
      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0"><button onClick={() => setStep("DESCRIPTION")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"><ArrowLeft size={24} /></button><button onClick={() => setStep("MEDIA")} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">Siguiente Paso <ArrowRight size={20} /></button></div>
    </div>
  );
};

const StepMedia = ({ formData, updateData, setStep }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 👇 LÓGICA MODIFICADA PARA CLOUDINARY
  const handleFileUpload = async (e: any) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 1. Enviamos cada archivo al Dron de Carga
    const uploadPromises = files.map(async (file: any) => {
        return await uploadToCloudinary(file);
    });

    // 2. Esperamos a que el Dron vuelva con las URLs seguras
    const uploadedUrls = await Promise.all(uploadPromises);

    // 3. Filtramos si alguna falló
    const validUrls = uploadedUrls.filter(url => url !== null);

    // 4. Actualizamos el formulario con las URLs de internet
    const currentImages = formData.images || [];
    const combined = [...currentImages, ...validUrls].slice(0, 10);
    updateData("images", combined);
  };

  const removeImage = (index: number) => { 
      const currentImages = formData.images || []; 
      const filtered = currentImages.filter((_: any, i: number) => i !== index); 
      updateData("images", filtered); 
  };
  
  const images = formData.images || [];

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        multiple 
        accept="image/*,video/*,application/pdf" 
      />
      
      <div className="mb-6 shrink-0">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Multimedia</h2>
        <p className="text-gray-500 font-medium">Sube fotos, vídeos o planos (PDF).</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-4 pt-2">
        {/* ZONA DE CARGA (DRAG & DROP VISUAL) */}
        <div onClick={() => fileInputRef.current?.click()} className="group relative h-64 rounded-[24px] border-4 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/50 overflow-hidden shadow-sm hover:shadow-md active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/0 to-blue-100/0 group-hover:via-white/20 group-hover:to-blue-100/30 transition-all duration-500" />
          <div className="relative z-10 flex flex-col items-center p-6">
            <div className="flex items-center gap-5 mb-6">
                <div className="w-18 h-18 p-4 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-300"><Camera size={32} className="text-blue-600" strokeWidth={2} /></div>
                <div className="w-18 h-18 p-4 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 group-hover:rotate-[6deg] transition-transform duration-300 delay-75"><UploadCloud size={32} className="text-purple-600" strokeWidth={2} /></div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Toca para Subir</h3>
            <p className="text-sm font-bold text-gray-400 mb-3">JPG, PNG, PDF, MP4 a la Nube.</p>
            <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-widest rounded-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">Abrir Galería</button>
          </div>
        </div>

        {/* GALERÍA INTELIGENTE */}
        <div className="mt-8">
          <div className="flex justify-between items-baseline mb-4 px-1">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Tus Archivos</p>
            <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg">
                <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{images.length} / 10</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((url: string, i: number) => {
               // 🕵️ DETECTIVE DE FORMATOS
               const isVideo = url.match(/\.(mp4|mov|webm|mkv)$/i) || url.includes("/video/upload");
               const isPdf = url.match(/\.pdf$/i) || url.includes(".pdf");

               return (
                <div key={i} className="aspect-square rounded-[20px] overflow-hidden relative group border border-gray-100 shadow-sm animate-fade-in bg-gray-50">
                  
                  {/* --- CASO 1: ES VIDEO 🎥 --- */}
                  {isVideo ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-gray-900">
                      <video src={url} className="w-full h-full object-cover opacity-60" muted playsInline />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50">
                           <Play size={12} className="text-white fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[8px] font-bold text-white uppercase flex items-center gap-1">
                        <Film size={8} /> Video
                      </span>
                    </div>
                  ) : isPdf ? (
                  /* --- CASO 2: ES PDF 📄 --- */
                    <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 p-2 text-center group-hover:bg-red-100 transition-colors cursor-pointer relative">
                      <FileText size={32} className="text-red-500 mb-2" />
                      <span className="text-[8px] font-bold text-red-900 uppercase tracking-wider line-clamp-1 break-all px-2">
                        Documento PDF
                      </span>
                      {/* Enlace invisible para abrir el PDF al hacer clic */}
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="absolute inset-0 z-10" 
                        title="Ver Documento"
                      />
                    </div>
                  ) : (
                  /* --- CASO 3: ES FOTO (LO DE SIEMPRE) 📸 --- */
                    <img src={url} alt={`Foto ${i}`} className="w-full h-full object-cover" />
                  )}

                  {/* BOTÓN ELIMINAR (COMÚN A TODOS) */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); removeImage(i); }} 
                    className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-md cursor-pointer z-20 border border-gray-100"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>

                  {/* ETIQUETA PORTADA (SOLO EL PRIMERO) */}
                  {i === 0 && (
                    <span className="absolute bottom-2 left-2 right-2 text-center text-[8px] font-black text-white uppercase tracking-widest bg-black/50 backdrop-blur-md py-1 rounded-md z-10 pointer-events-none">
                      Portada
                    </span>
                  )}
                </div>
              );
            })}
            
            {/* BOTÓN AÑADIR MÁS */}
            {images.length < 10 && (
                <div onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-[20px] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-300 hover:text-blue-500 active:scale-95">
                    <span className="font-black text-3xl">+</span>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
        <button onClick={() => setStep("ENERGY")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95">
            <ArrowLeft size={24} />
        </button>
        <button onClick={() => setStep("PRICE")} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">
            Siguiente Paso <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
// --- PASO PRECIO (MODIFICADO PARA SALTO DE AGENCIA) ---
const StepPrice = ({ formData, updateData, setStep }: any) => {
  const formatCurrency = (v: string) => v ? v.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
  const [localPrice, setLocalPrice] = useState(() => { const numericVal = parsePriceInput(formData.price); return numericVal > 0 ? formatCurrency(String(numericVal)) : ""; });
  const [localCommunity, setLocalCommunity] = useState(formData.communityFees || "");
  const getPriceStyle = (priceStr: string) => { const p = parsePriceInput(priceStr); if (!p || p <= 0) return { hex: "#1d1d1f", color: "text-gray-400", bg: "bg-gray-50", border: "border-gray-200", label: "DEFINIR PRECIO" }; if (p < 200000) return { hex: "#34C759", color: "text-[#34C759]", bg: "bg-[#34C759]/10", border: "border-[#34C759]", label: "INVEST" }; if (p < 550000) return { hex: "#Eab308", color: "text-[#Eab308]", bg: "bg-[#Eab308]/10", border: "border-[#Eab308]", label: "OPPORTUNITY" }; if (p < 1200000) return { hex: "#F97316", color: "text-[#F97316]", bg: "bg-[#F97316]/10", border: "border-[#F97316]", label: "PREMIUM" }; if (p < 3000000) return { hex: "#EF4444", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", border: "border-[#EF4444]", label: "LUXURY" }; return { hex: "#A855F7", color: "text-[#A855F7]", bg: "bg-[#A855F7]/10", border: "border-[#A855F7]", label: "EXCLUSIVE" }; };
  const style = getPriceStyle(localPrice);
  
  const syncData = () => { 
      updateData("price", localPrice.replace(/\./g, "")); 
      updateData("communityFees", localCommunity); 
  };

  // 🔥 LÓGICA DE DESVÍO: SI ES AGENCIA -> EXTRAS, SI NO -> ANÁLISIS
  const handleNext = () => {
      syncData(); // 1. Guardamos el precio
      
      if (formData.isAgencyContext) {
          setStep("AGENCY_EXTRAS"); // 2A. Agencia va a sus herramientas
      } else {
          setStep("ANALYSIS");      // 2B. Particular sigue el camino normal
      }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2 relative">
      <div className="mb-2 shrink-0 text-center"><h2 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Valoración</h2><p className="text-gray-500 font-medium text-xs">Define el precio de salida al mercado.</p></div>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 pb-24">
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-6 transition-all duration-500 border shadow-sm ${style.bg} ${style.color} ${style.border}`}>{style.label}</div>
        <div className="relative w-full max-w-lg mx-auto group text-center mb-6"><input className={`w-full text-center bg-transparent text-6xl sm:text-7xl font-black outline-none placeholder:text-gray-200 transition-all duration-300 p-0 ${style.color} drop-shadow-sm`} placeholder="0" value={localPrice} onChange={(e) => { let val = e.target.value.replace(/\D/g, ""); if (val.length > 1 && val.startsWith("0")) val = val.substring(1); setLocalPrice(formatCurrency(val)); }} onBlur={syncData} autoFocus /><span className={`absolute top-0 -right-2 sm:-right-6 text-3xl sm:text-4xl font-bold opacity-30 pointer-events-none transition-colors duration-300 ${style.color}`}>€</span><div className={`h-1.5 w-1/3 mx-auto mt-2 rounded-full transition-all duration-500 ${style.bg.replace('/10', '')}`} /></div>
        <div className="w-full max-w-xs animate-fade-in-up delay-100 px-4 mt-4"><label className="block text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Gastos Comunidad (Mes)</label><div className="relative group"><input className="w-full py-4 px-6 bg-gray-50 text-center rounded-2xl border-2 border-transparent text-gray-900 text-2xl font-black focus:bg-white focus:border-gray-200 focus:shadow-lg outline-none transition-all placeholder:text-gray-300" placeholder="0" value={localCommunity} onChange={(e) => setLocalCommunity(e.target.value.replace(/\D/g, ""))} onBlur={syncData} /><span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold group-focus-within:text-gray-900 transition-colors">€</span></div></div>
      </div>
      <div className="sticky bottom-0 left-0 right-0 pt-4 pb-6 bg-white/95 backdrop-blur-xl border-t border-gray-100 flex gap-4 shrink-0 z-50 -mx-4 px-4 shadow-[0_-10px_20px_rgba(255,255,255,1)]">
          <button onClick={() => setStep("MEDIA")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95 border border-transparent hover:border-gray-200"><ArrowLeft size={24} /></button>
          
          {/* 🔥 BOTÓN MODIFICADO PARA USAR EL DESVÍO */}
          <button 
            onClick={handleNext} 
            disabled={!localPrice} 
            className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:grayscale" 
            style={{ backgroundColor: style.hex }}
          >
            <span className="brightness-200 contrast-200">
                {/* Texto dinámico según quién sea */}
                {formData.isAgencyContext ? "Siguiente: Extras Pro" : "Analizar Mercado"}
            </span> 
            <ArrowRight size={20} />
          </button>
      </div>
    </div>
  );
};

const MarketAnalysisStep = ({ formData, onNext }: any) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);
  const { pricePerM2, detectedZone, percentDiff, isExpensive, estimatedMonths, marketPosition } = useMemo(() => { const safePrice = formData?.price ? parseFloat(formData.price.toString().replace(/\D/g, "")) : 0; const safeM2 = formData?.mBuilt ? parseFloat(formData.mBuilt.toString().replace(/\D/g, "")) : 0; const m2 = safeM2 > 0 ? safeM2 : 100; const currentPriceM2 = m2 > 0 ? Math.round(safePrice / m2) : 0; let zoneName = "MEDIA NACIONAL"; let refPrice = NATIONAL_AVG; const searchAddress = (formData?.address || formData?.location || "").toUpperCase(); const matches = Object.keys(REAL_MARKET_DB).filter((city) => searchAddress.includes(city)); if (matches.length > 0) { const bestMatch = matches.reduce((a, b) => (a.length > b.length ? a : b)); zoneName = bestMatch; refPrice = REAL_MARKET_DB[bestMatch]; } const diff = currentPriceM2 - refPrice; const pDiff = refPrice > 0 ? ((diff / refPrice) * 100).toFixed(1) : "0"; const nPercent = parseFloat(pDiff || "0"); const expensive = diff > 0; const months = expensive ? (Math.abs(nPercent) > 20 ? 12 : 6) : 2; let visualPos = 50 + nPercent / 2; visualPos = Math.min(Math.max(visualPos, 5), 95); return { pricePerM2: currentPriceM2, detectedZone: zoneName, percentDiff: Math.abs(nPercent).toFixed(1), isExpensive: expensive, estimatedMonths: months, marketPosition: visualPos }; }, [formData]);
  useEffect(() => { const t1 = setTimeout(() => setProgress(30), 400); const t2 = setTimeout(() => setProgress(60), 1200); const t3 = setTimeout(() => setProgress(90), 2200); const t4 = setTimeout(() => { setProgress(100); setAnalyzing(false); }, 3200); return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); }; }, []);

  if (analyzing) { return (<div className="h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent pointer-events-none" /><div className="w-full max-w-sm relative z-10"><div className="mb-10 relative flex justify-center"><div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-20"></div><div className="absolute inset-2 border-4 border-blue-50 rounded-full animate-ping delay-100 opacity-30"></div><div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-[0_10px_40px_rgba(0,113,227,0.15)] relative z-10"><div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div><span className="text-3xl font-black text-gray-900">{progress}%</span></div></div><h2 className="text-xl font-bold text-gray-900 mb-2">Analizando Mercado</h2><p className="text-sm font-bold text-blue-600 uppercase tracking-widest animate-pulse">Escaneando {detectedZone}...</p><div className="h-1.5 w-full bg-gray-100 rounded-full mt-8 overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${progress}%` }}></div></div></div></div>); }

  return (
    <div className="h-full flex flex-col animate-fade-in-up px-2 relative">
      <div className="mb-2 shrink-0"><div className="flex items-center gap-2 mb-2"><div className={`w-2 h-2 rounded-full animate-pulse ${isExpensive ? "bg-orange-500" : "bg-emerald-500"}`}></div><span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Diagnóstico Completado</span></div><h2 className="text-3xl font-black text-gray-900 leading-none tracking-tight">Análisis de Precio</h2></div>
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 px-1">
        <div className="bg-white rounded-[24px] p-6 mb-6 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-end mb-8"><div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tu Valoración</p><div className="flex items-baseline gap-1"><span className="text-5xl font-black text-gray-900 tracking-tight">{pricePerM2.toLocaleString()}</span><span className="text-sm font-bold text-gray-400">€/m²</span></div></div><div className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 ${isExpensive ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>{isExpensive ? <ArrowUp size={14} strokeWidth={3} /> : <TrendingUp size={14} strokeWidth={3} />}{percentDiff}% vs Media</div></div>
          <div className="relative h-12 mb-2 w-full select-none"><div className="absolute top-1/2 left-0 right-0 h-3 bg-gray-100 rounded-full -translate-y-1/2 overflow-hidden shadow-inner"><div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50 z-10"></div></div><div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all duration-1000" style={{ left: `${marketPosition}%` }}><div className={`w-5 h-5 rounded-full border-[3px] border-white shadow-lg -translate-x-1/2 ${isExpensive ? "bg-gray-900" : "bg-emerald-500"}`}></div><div className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 bg-gray-900 text-white text-[9px] font-black rounded-md tracking-wider shadow-sm">TÚ</div></div><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-60 flex flex-col items-center"><div className="w-3 h-3 bg-gray-400 rounded-full"></div><div className="absolute top-4 whitespace-nowrap text-[9px] font-bold text-gray-400 uppercase tracking-wider">Media {detectedZone}</div></div></div>
          <p className="text-sm text-gray-600 leading-relaxed font-medium mt-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">{isExpensive ? (<span>Tu propiedad se sitúa <strong className="text-gray-900">por encima</strong> del mercado. Esto puede implicar un tiempo de venta de <strong className="text-gray-900">{estimatedMonths} meses</strong>.</span>) : (<span>¡Precio competitivo! Estás <strong className="text-emerald-600">alineado</strong> con la zona {detectedZone}. Estimamos venta en <strong className="text-emerald-600">{estimatedMonths} meses</strong>.</span>)}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-[24px] bg-gray-50 border border-gray-100 flex flex-col justify-between h-32 hover:bg-white hover:shadow-md transition-all"><div className="flex items-center gap-2 text-gray-400"><Clock size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Tiempo Estimado</span></div><div className="text-3xl font-black text-gray-900">{estimatedMonths} <span className="text-sm font-bold text-gray-400">Meses</span></div>{isExpensive && <div className="text-[10px] font-bold text-orange-500">Rotación Lenta</div>}{!isExpensive && <div className="text-[10px] font-bold text-emerald-500">Rotación Rápida</div>}</div>
          <div className="p-5 rounded-[24px] bg-gray-50 border border-gray-100 flex flex-col justify-between h-32 hover:bg-white hover:shadow-md transition-all"><div className="flex items-center gap-2 text-gray-400"><Search size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Demanda</span></div><div className="text-2xl font-black text-gray-900 flex items-center gap-2">ALTA <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span></div><div className="text-[10px] font-bold text-gray-400">Zona Caliente</div></div>
        </div>
      </div>
      <div className="sticky bottom-0 left-0 right-0 pt-4 pb-6 bg-white/95 backdrop-blur-xl border-t border-gray-100 flex gap-4 shrink-0 z-50 -mx-4 px-4 shadow-[0_-10px_20px_rgba(255,255,255,1)]"><button onClick={onNext} className="w-full bg-[#1d1d1f] hover:bg-black text-white rounded-2xl py-4 shadow-xl active:scale-[0.99] transition-all flex justify-between items-center px-8 h-16"><div className="flex flex-col items-start"><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Siguiente paso</span><span className="text-lg font-bold">Ver Competencia (Radar)</span></div><div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><Radar size={20} className="text-white" /></div></button></div>
    </div>
  );
};

const MarketRadarStep = ({ formData, onNext }: any) => {
  const [scanning, setScanning] = useState(true);
  const [selectedRival, setSelectedRival] = useState<number | null>(null);
  const basePrice = useMemo(() => { if (!formData?.price) return 0; const val = formData.price.toString().replace(/\D/g, ""); return val ? parseInt(val) : 0; }, [formData.price]);
  const RIVALS = [
    { id: 1, type: "COLD", name: "Propiedad Estancada", price: basePrice * 1.05, days: 245, visits: 12, img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80" },
    { id: 2, type: "WARM", name: "Competencia Directa", price: basePrice * 0.98, days: 45, visits: 180, img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
    { id: 3, type: "HOT", name: "Caso de Éxito", price: basePrice * 1.15, days: 12, visits: 3450, img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80" },
    { id: 4, type: "COLD", name: "Fuera de Mercado", price: basePrice * 1.1, days: 310, visits: 5, img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80" },
    { id: 5, type: "HOT", name: "Recién Listado", price: basePrice * 0.95, days: 3, visits: 890, img: "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=600&q=80" },
  ];

  useEffect(() => { const timer = setTimeout(() => setScanning(false), 2200); return () => clearTimeout(timer); }, []);
  const formatMoney = (amount: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);

  if (scanning) { return (<div className="h-full flex flex-col items-center justify-center animate-fade-in text-center relative overflow-hidden"><div className="z-10 flex flex-col items-center gap-6 px-6 py-12"><div className="relative"><div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20 duration-[2000ms]"></div><div className="absolute inset-4 bg-blue-400 rounded-full animate-ping opacity-40 delay-300 duration-[2000ms]"></div><div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-[0_20px_60px_-10px_rgba(0,122,255,0.3)] relative z-10 border border-blue-50"><Radar className="text-[#007AFF] animate-spin-slow" size={40} strokeWidth={1.5} /></div></div><div><h3 className="text-xl font-bold tracking-tight text-gray-900">Escaneando Zona</h3><p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-2 animate-pulse">Localizando testigos comparables...</p></div></div></div>); }

  return (
    <div className="h-full flex flex-col animate-fade-in relative overflow-hidden">
      <div className="flex justify-between items-end mb-4 shrink-0 px-6 pt-2"><div><div className="flex items-center gap-2 mb-1"><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#007AFF]"></span></span><span className="text-[10px] font-black uppercase tracking-widest text-[#007AFF]">Radar Activo</span></div><h3 className="text-3xl font-black text-gray-900 tracking-tight">Competencia</h3></div><div className="text-right bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100"><p className="text-[9px] font-black text-gray-400 uppercase tracking-wide">Radio</p><p className="text-xs font-black text-gray-900">500m</p></div></div>
      <div className="flex-1 flex flex-col gap-5 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 pb-28">
        <div className="w-full h-40 bg-white rounded-[32px] border border-gray-100 relative flex items-center justify-center shrink-0 overflow-hidden shadow-sm mx-auto shadow-[inset_0_0_40px_rgba(0,0,0,0.02)]"><div className="absolute w-[80%] h-[80%] border border-gray-100 rounded-full"></div><div className="absolute w-[50%] h-[50%] border border-gray-100 rounded-full"></div><div className="absolute w-[20%] h-[20%] border border-blue-100 rounded-full bg-blue-50/50"></div><div className="absolute w-full h-[1px] bg-gray-50"></div><div className="absolute h-full w-[1px] bg-gray-50"></div><div className="absolute w-4 h-4 bg-[#007AFF] rounded-full shadow-[0_0_0_4px_rgba(255,255,255,1),0_4px_12px_rgba(0,122,255,0.4)] z-20"></div>{RIVALS.map((rival, index) => { const angle = index * 72 * (Math.PI / 180); const distance = 25 + index * 10; const top = 50 + Math.sin(angle) * distance; const left = 50 + Math.cos(angle) * distance; return <div key={rival.id} className={`absolute rounded-full transition-all duration-300 z-10 cursor-pointer border-2 border-white shadow-sm ${rival.type === "HOT" ? "bg-[#FF9500]" : "bg-gray-400"} ${selectedRival === rival.id ? "w-6 h-6 z-30 ring-4 ring-blue-100 scale-110" : "w-3 h-3 hover:scale-150"}`} style={{ top: `${top}%`, left: `${left}%` }} onMouseEnter={() => setSelectedRival(rival.id)} onMouseLeave={() => setSelectedRival(null)} />; })}</div>
        <div className="space-y-3 px-1">{RIVALS.map((rival) => { const isSelected = selectedRival === rival.id; return (<div key={rival.id} onMouseEnter={() => setSelectedRival(rival.id)} onMouseLeave={() => setSelectedRival(null)} className={`flex gap-4 p-3 rounded-[24px] border transition-all duration-300 cursor-pointer group w-full ${isSelected ? "bg-white border-blue-500 shadow-[0_8px_30px_rgba(0,113,227,0.15)] scale-[1.00]" : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-md"}`}><div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 relative bg-gray-100 shadow-sm"><img src={rival.img} className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-110" alt="Propiedad" />{rival.type === "HOT" && (<div className="absolute top-1.5 right-1.5 bg-[#FF9500] text-white p-1 rounded-full shadow-lg border border-white z-10"><Zap size={10} fill="currentColor" /></div>)}</div><div className="flex-1 flex flex-col justify-center min-w-0 py-1"><h4 className={`text-xs font-bold truncate mb-0.5 ${isSelected ? "text-blue-600" : "text-gray-500"}`}>{rival.name}</h4><span className="text-xl font-black tracking-tight text-gray-900 mb-2 block truncate">{formatMoney(rival.price)}</span><div className="flex flex-wrap gap-2"><div className={`px-2 py-0.5 rounded-md flex items-center gap-1 border ${rival.days > 90 ? "bg-red-50 border-red-100 text-red-600" : "bg-green-50 border-green-100 text-green-700"}`}><Clock size={10} strokeWidth={2.5} /><span className="text-[10px] font-bold tracking-wide">{rival.days}d</span></div><div className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-gray-500 flex items-center gap-1"><Eye size={10} strokeWidth={2.5} /><span className="text-[10px] font-bold tracking-wide">{rival.visits}</span></div></div></div><div className="flex flex-col justify-center pr-1"><div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSelected ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-300"}`}><ArrowRight size={14} /></div></div></div>); })}</div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex gap-4 z-50 shadow-[0_-10px_40px_rgba(255,255,255,0.8)]"><button onClick={onNext} className="w-full bg-[#1d1d1f] hover:bg-black text-white rounded-2xl py-4 shadow-xl active:scale-[0.99] transition-all flex justify-between items-center px-8 h-16"><div className="flex flex-col items-start"><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Siguiente paso</span><span className="text-lg font-bold">Definir Estrategia</span></div><div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><TrendingUp size={20} className="text-white" /></div></button></div>
    </div>
  );
};

const StepVerify = ({ formData, setStep }: any) => {
  const rawPrice = useMemo(() => { if (!formData.price) return 0; return parseInt(formData.price.toString().replace(/\D/g, "")); }, [formData.price]);
  const visualPrice = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(rawPrice);
  const getPriceStyle = (p: number) => { if (p < 200000) return { hex: "#34C759", bg: "bg-[#34C759]/10", text: "text-[#34C759]", label: "INVEST" }; if (p < 550000) return { hex: "#Eab308", bg: "bg-[#Eab308]/10", text: "text-[#Eab308]", label: "OPPORTUNITY" }; if (p < 1200000) return { hex: "#F97316", bg: "bg-[#F97316]/10", text: "text-[#F97316]", label: "PREMIUM" }; if (p < 3000000) return { hex: "#EF4444", bg: "bg-[#EF4444]/10", text: "text-[#EF4444]", label: "LUXURY" }; return { hex: "#A855F7", bg: "bg-[#A855F7]/10", text: "text-[#A855F7]", label: "EXCLUSIVE" }; };
  const style = getPriceStyle(rawPrice);

 return (
    <div className="h-full flex flex-col animate-fade-in relative px-4">
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 pb-10">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-4 shadow-sm animate-bounce-small"><ShieldCheck size={32} /></div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Resumen Final</h2>
            <p className="text-gray-500 font-medium">Confirma los datos antes de continuar.</p>
        </div>
        
        {/* TARJETA RESUMEN (NO TOCAR) */}
        <div className="w-full max-w-sm bg-white rounded-[32px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden relative group">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500">{formData.type || "Inmueble"}</span>
                    {formData.state && (<span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formData.state}</span>)}
                </div>
                <div className="flex items-start gap-2 text-gray-900">
                    <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="font-bold leading-tight line-clamp-2">{formData.address || "Ubicación Premium"}</p>
                </div>
            </div>
            <div className="p-8 text-center bg-white relative">
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase ${style.bg} ${style.text}`}>{style.label}</div>
                <div className={`text-5xl font-black tracking-tighter mt-4 mb-1 ${style.text}`}>{visualPrice}<span className="text-3xl align-top opacity-50 ml-1">€</span></div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor de Salida</p>
            </div>
            <div className="grid grid-cols-3 border-t border-gray-100 divide-x divide-gray-100 bg-gray-50/30">
                <div className="p-4 text-center"><span className="block text-xl font-black text-gray-900">{formData.rooms}</span><span className="text-[9px] font-bold text-gray-400 uppercase">Habit.</span></div>
                <div className="p-4 text-center"><span className="block text-xl font-black text-gray-900">{formData.baths}</span><span className="text-[9px] font-bold text-gray-400 uppercase">Baños</span></div>
                <div className="p-4 text-center"><span className="block text-xl font-black text-gray-900">{formData.mBuilt}</span><span className="text-[9px] font-bold text-gray-400 uppercase">m²</span></div>
            </div>
        </div>
      </div>

      {/* BOTONERA INFERIOR BLINDADA */}
      <div className="shrink-0 pb-6 pt-2">
          {/* BOTÓN PRINCIPAL */}
          <button 
            onClick={() => { 
                // ⚡️ SI ES EDICIÓN O AGENCIA -> SALTAR SMS E IR A SUCCESS
                if (formData.isEditMode || formData.isAgencyContext) { 
                    setStep("SUCCESS"); 
                } else { 
                    setStep("SECURITY"); 
                } 
            }} 
            className="w-full h-16 bg-[#1d1d1f] hover:bg-black text-white rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-between px-8 group"
          >
            <div className="flex flex-col items-start">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-400 transition-colors">
                    {(formData.isEditMode || formData.isAgencyContext) ? "Proceso Completado" : "Último Paso"}
                </span>
                <span className="text-lg font-bold">
                    {(formData.isEditMode || formData.isAgencyContext) ? "Guardar y Publicar" : "Verificar Identidad"}
                </span>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                {(formData.isEditMode || formData.isAgencyContext) ? <CheckCircle2 size={20} className="text-white"/> : <Smartphone size={20} className="text-white"/>}
            </div>
          </button>
          
          {/* BOTÓN VOLVER INTELIGENTE */}
          <button 
            onClick={() => {
                // Si es agencia, volvemos a RADAR (porque nos saltamos Estrategia)
                if (formData.isAgencyContext) {
                    setStep("RADAR");
                } else {
                    setStep("STRATEGY");
                }
            }} 
            className="w-full py-3 mt-2 text-gray-400 font-bold hover:text-gray-600 text-xs transition-colors"
          >
            Volver a {(formData.isAgencyContext) ? "Radar" : "Estrategia"}
          </button>
      </div>
    </div>
  );
};

// ==================================================================================
// 🏆 STEP SUCCESS: VERSIÓN BLINDADA (FILTRO ANTI-IMPAGO)
// ==================================================================================
const StepSuccess = ({ handleClose, formData }: any) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const lastSavedIdRef = useRef<string | null>(formData?.id ? String(formData.id) : null);
  
  // 1. ANÁLISIS DE LA SITUACIÓN BLINDADO 🛡️
  const currentStatus = formData?.status;
  const isPendingPayment = currentStatus === "PENDIENTE_PAGO"; // ¿Es un borrador sin pagar?
  const isAgency = formData.isAgencyContext;

  // Calculamos si es edición visualmente (para textos)
  const isEditMode = formData.isEditMode || currentStatus === "PUBLICADO";
  
  // 🔥 LÓGICA CRÍTICA DE PAGO:
  // Solo permitimos "Guardar directo" (Gratis) si:
  // A) Es Agencia (Siempre gratis).
  // B) Es Particular EDITANDO algo que NO está pendiente de pago.
  // SI ESTÁ PENDIENTE DE PAGO -> isDirectSave será FALSE -> Obliga a Pagar.
  const isDirectSave = isAgency || (isEditMode && !isPendingPayment);

  // Visuales (Precio y Foto)
  const rawPrice = formData.price ? parseInt(formData.price.toString().replace(/\D/g, "")) : 0;
  const visualPrice = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(rawPrice);
  const hasUserPhoto = formData.images && formData.images.length > 0;
  const previewImage = hasUserPhoto ? formData.images[0] : "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80";
  // --- 🔥 EL CEREBRO DE LA OPERACIÓN ---
  const handleProcess = async () => {
    if (isPublishing) return;
    setIsPublishing(true);

    try {
      // ---------------------------------------------------------
      // 🛡️ LÓGICA DE INVISIBILIDAD REFORZADA
      // ---------------------------------------------------------
      let targetStatus = formData.status;

      if (isDirectSave) {
          // Si es Agencia o Edición: Mantenemos estado o Publicamos
          if (!targetStatus) targetStatus = "PUBLICADO";
      } else {
          // 🛑 SI ES PARTICULAR NUEVO: ¡FORZAMOS INVISIBILIDAD!
          // No importa lo que diga el formulario, aquí mandamos nosotros.
          targetStatus = "PENDIENTE_PAGO";
      }

      // 2. PREPARAR EL PAQUETE DE DATOS
      const cleanPayload = {
        ...formData,
        id: lastSavedIdRef.current || formData?.id || undefined,
        status: targetStatus, // ✅ APLICAMOS EL ESTADO SEGURO
        rooms: Number(formData.rooms || 0),
        baths: Number(formData.baths || 0),
        mBuilt: Number(formData.mBuilt || 0),
        price: formData.price,
        coordinates: formData.coordinates || [-3.6883, 40.4280],
      };

      console.log("📡 GUARDANDO EN BASE DE DATOS (Estado:", targetStatus, ")...");

      // 3. 💾 GUARDADO REAL (Aquí se crea la propiedad en la DB)
      const response = await savePropertyAction(cleanPayload);

      if (response.success && response.property) {
        const serverProp = response.property;
        const serverId = String(serverProp.id);
        
        // Guardamos el ID por si acaso
        lastSavedIdRef.current = serverId;

        // 4. RECUPERAR IDENTIDAD DEL DUEÑO (Para el pago)
        let ownerId = serverProp.userId || serverProp.user?.id;
        let ownerEmail = serverProp.user?.email;

        // Intentamos recuperar si falta
        if (!ownerId) {
            try {
                // @ts-ignore 
                const me = await getUserMeAction();
                if (me?.success && me.data) {
                    ownerId = me.data.id;
                    ownerEmail = me.data.email;
                }
            } catch (e) { console.error("Info: No se pudo verificar sesión extra", e); }
        }

        // 5. DECISIÓN FINAL
        if (isDirectSave) {
            // === CAMINO A: AGENCIA/EDICIÓN (Misión Cumplida) ===
            
            // Preparamos datos para el mapa
            let secureImage = null;
            if (serverProp.mainImage) secureImage = serverProp.mainImage;
            else if (serverProp.images && serverProp.images.length > 0) secureImage = serverProp.images[0].url;
            else if (formData.images && formData.images.length > 0) secureImage = formData.images[0];

            const mapFormat = {
                ...serverProp,
                coordinates: [serverProp.longitude, serverProp.latitude],
                user: serverProp.user,
                img: secureImage,
                images: serverProp.images?.map((i: any) => i.url) || (secureImage ? [secureImage] : []),
                price: new Intl.NumberFormat("es-ES").format(serverProp.price || 0),
                selectedServices: serverProp.selectedServices,
            };

            // Actualizamos la pantalla del usuario
            if (typeof window !== "undefined") {
                const eventName = isEditMode ? "update-property-signal" : "add-property-signal";
                window.dispatchEvent(new CustomEvent(eventName, { 
                    detail: isEditMode ? { id: mapFormat.id, updates: mapFormat } : mapFormat 
                }));
                window.dispatchEvent(new CustomEvent("reload-profile-assets"));
                window.dispatchEvent(new CustomEvent("force-map-refresh"));
            }
            
            // Cerramos la ventana
            handleClose(mapFormat);
            setIsPublishing(false);

        } else {
            // === CAMINO B: PARTICULAR NUEVO (Cobrar Misión) ===
            // La propiedad YA EXISTE en la DB, pero como "PENDIENTE_PAGO" (Invisible).
            
            if (!ownerId) {
                alert("Seguridad: No se ha detectado la sesión del usuario. Recargue la página.");
                setIsPublishing(false);
                return;
            }

            console.log("💳 REDIRIGIENDO A MOLLIE... (ID:", serverId, ")");
            
            // Llamamos a la función de pago (que está al final del archivo)
            await startPropertyPayments(serverId, {
                userId: String(ownerId),
                email: ownerEmail ? String(ownerEmail) : undefined
            });
            // No ponemos setIsPublishing(false) porque nos vamos de la página
        }

      } else {
        alert("Error del servidor al guardar: " + response.error);
        setIsPublishing(false);
      }
    } catch (err) {
      console.error("❌ Error grave:", err);
      alert("Error de conexión. Verifique su internet.");
      setIsPublishing(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center animate-fade-in px-4 relative overflow-hidden">
      
      {/* Fondo Animado */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-400/20 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -z-10 animate-pulse delay-700" />

      {/* Icono Central */}
      <div className="mb-8 relative">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(34,197,94,0.4)] animate-bounce-small z-10 relative">
            <CheckCircle2 size={48} className="text-white" strokeWidth={3} />
        </div>
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 duration-[2000ms]" />
      </div>

      {/* Textos */}
      <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight text-center">
        {isEditMode ? "¡Cambios Guardados!" : "¡Casi Listo!"}
      </h2>
      <p className="text-gray-500 mb-10 text-center font-medium max-w-sm text-lg">
         {isEditMode ? "Tus cambios se han actualizado." : "Conectando con la pasarela de pago..."}
      </p>

      {/* Tarjeta Resumen */}
      <div className="w-full max-w-xs bg-white rounded-[24px] border border-gray-100 shadow-xl p-4 mb-10 transform rotate-1 hover:rotate-0 transition-transform duration-500">
          <div className="aspect-video bg-gray-100 rounded-xl mb-4 relative overflow-hidden group">
             <img src={previewImage} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
             <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm">
                {isEditMode ? "ACTUALIZADO" : "NUEVO"}
             </div>
          </div>
          <div className="px-2 pb-2">
             <h3 className="text-sm font-black text-gray-900 line-clamp-1">{formData.title || "Propiedad"}</h3>
             <p className="text-xs text-gray-500 font-medium mb-3 line-clamp-1">{formData.address}</p>
             <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <span className="text-lg font-black text-gray-900">{visualPrice}€</span>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase">{formData.type}</span>
             </div>
          </div>
      </div>

     {/* Botón de Acción BLINDADO */}
      <button
        onClick={handleProcess}
        disabled={isPublishing}
        className="w-full max-w-md bg-[#1d1d1f] hover:bg-black text-white rounded-2xl py-4 px-8 shadow-xl active:scale-[0.98] transition-all flex justify-between items-center group cursor-pointer"
      >
        <div className="flex flex-col items-start">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-300 transition-colors">
             {/* Texto Superior */}
             {isDirectSave ? "PROCESO COMPLETADO" : "LANZAMIENTO"}
          </span>
          <span className="text-lg font-bold">
             {/* Texto Principal: Aquí se ve la magia */}
             {isPublishing 
                ? "Procesando..." 
                : (isDirectSave ? "Guardar y Salir" : "Pagar y Publicar")}
          </span>
        </div>
        
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
           {/* Icono: Check si es gratis, Flecha si es pago */}
           {isDirectSave ? <CheckCircle2 size={20} className="text-white"/> : <ArrowRight size={20} className="text-white"/>}
        </div>
      </button>

    </div>
  );
};
// ==================================================================================
// 💰 LÓGICA DE PAGO BLINDADA (CON IDENTIFICACIÓN DE USUARIO)
// ==================================================================================

function toAmountStringLocal(v?: string) {
  const n = Number(v ?? "9.90");
  if (!Number.isFinite(n) || n <= 0) return "9.90";
  return n.toFixed(2);
}

// ✅ AHORA ACEPTA 'userId' Y 'email' EN LAS OPCIONES
async function startPropertyPayments(
  propertyId: string,
  opts: { 
    amount?: string; 
    redirectPath?: string; 
    description?: string; 
    refCode?: string;
    userId?: string;  // <--- NUEVO
    email?: string;   // <--- NUEVO
  } = {}
) {
  if (typeof window === "undefined") return;
  
  const pid = String(propertyId || "").trim();
  if (!pid) {
    alert("Error crítico: Falta ID de propiedad.");
    return;
  }

  // 1. INTENTAMOS OBTENER EL USUARIO DE LOS PARÁMETROS (PRIORIDAD)
  let finalUserId = opts.userId;
  let finalUserEmail = opts.email;

  // 2. SI NO VIENE, INTENTAMOS RESCATARLO DEL SISTEMA (FALLBACK)
  if (!finalUserId) {
    try {
      // Intentamos llamar a la acción si está importada
      // @ts-ignore
      if (typeof getUserMeAction !== 'undefined') {
         // @ts-ignore
         const me = await getUserMeAction();
         if (me?.success && me.data) {
           finalUserId = String(me.data.id);
           finalUserEmail = me.data.email;
         }
      }
    } catch (e) { console.log("No se pudo autodetectar usuario", e); }
  }

  // 🚨 SI SIGUE FALTANDO, ALERTA ROJA
  if (!finalUserId) {
      alert("Error de Seguridad: No se ha podido identificar al usuario (Missing userId). Por favor, recargue e inicie sesión.");
      return;
  }

  const origin = window.location.origin;
  const redirectPath = (opts.redirectPath ?? (window.location.pathname + window.location.search)).trim();
  const redirectUrl = new URL(redirectPath, origin).toString();
  const description = (opts.description ?? "Publicación propiedad — 9,90€") + (opts.refCode ? ` (${opts.refCode})` : "");

  try {
    const res = await fetch("/api/mollie/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: toAmountStringLocal(opts.amount),
        currency: "EUR",
        description,
        redirectUrl,
        metadata: {
          kind: "PROPERTY_PUBLISH",
          propertyId: pid,
          userId: finalUserId,     // ✅ AQUÍ VA EL ID SEGURO
          email: finalUserEmail,
        },
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json?.ok) {
      alert(json?.error || `Error iniciando pago (HTTP ${res.status}).`);
      return;
    }

    if (!json?.checkoutUrl) {
      alert("Error: Pasarela de pago no respondió con URL.");
      return;
    }

    // AL ATAQUE
    window.location.assign(String(json.checkoutUrl));
    
  } catch (err) {
    console.error("Error red pago:", err);
    alert("Error de conexión al iniciar pago.");
  }
}