// @ts-nocheck
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  // NAVEGACIÓN Y GENERAL
  MapPin, X, Heart, Search, Mic, Layers, Settings, 
  Maximize2, ArrowRight, Menu, Bell, Globe, ShieldCheck,
  MessageSquare, User, Crosshair, Send, Navigation, ChevronRight, Play,
  SlidersHorizontal, MicOff, Activity, Zap, Image as ImageIcon,
  TrendingUp, DollarSign, BarChart3, Target, Phone, Trash2,
  Box, Square, Moon, Sun, Mountain,
  
  // MODULOS AVANZADOS
  Music, BookOpen, Briefcase, Award, Camera, FileText,
  ChevronUp, Sparkles, ChevronLeft,

  // MODO ARQUITECTO
  Building, Radar, CheckCircle, Smartphone, Upload, CreditCard
} from 'lucide-react';

// ==========================================
// 0. BÚNKER DE DATOS (CONSTANTES INTEGRADAS)
// ==========================================
// Eliminadas las dependencias externas para evitar errores de ruta.

const CORPORATE_BLUE = "#2563eb";
const TEXT_COLOR = "#ffffff";
const NEON_GLOW = "0 0 15px rgba(37, 99, 235, 0.8)";

const LUXURY_IMAGES = [
    "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

const TIER_COLORS = {
    SMART: { hex: "#10b981", glow: "0 0 15px rgba(16, 185, 129, 0.8)" },    
    PREMIUM: { hex: "#2563eb", glow: "0 0 20px rgba(37, 99, 235, 0.8)" }, 
    HIGH_CLASS: { hex: "#d946ef", glow: "0 0 20px rgba(217, 70, 239, 0.8)" } 
};

const TIER_CONFIG = {
    SMART: { name: 'SMART', color: '#10b981' },
    PREMIUM: { name: 'PREMIUM', color: '#2563eb' },
    HIGH_CLASS: { name: 'HIGH CLASS', color: '#d946ef' }
};

const getPropertyTier = (price) => {
    if (price > 2000000) return 'HIGH_CLASS';
    if (price > 800000) return 'PREMIUM';
    return 'SMART';
};

// ==========================================
// 1. GATEKEEPER (Pantalla de Carga)
// ==========================================
export const Gatekeeper = ({ onUnlock, t, sound }) => {
    const [status, setStatus] = useState('LOCKED'); 
    const handleAccess = () => { 
        sound?.playBoot?.(); 
        setStatus('GRANTED'); 
        setTimeout(() => { onUnlock(); }, 2000); 
    };

    return (
        <div className={`fixed inset-0 bg-[#050505] z-[99999] flex flex-col items-center justify-center transition-opacity duration-1000 ${status === 'GRANTED' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="text-center mb-16 pointer-events-none select-none">
                <h1 className="text-6xl font-light tracking-[0.2em] mb-4" style={{color: TEXT_COLOR}}>
                    STRATOS<span className="font-bold" style={{color: CORPORATE_BLUE}}>FERE</span>
                </h1>
                <div className="h-[1px] w-24 bg-white/20 mx-auto"></div>
            </div>
            <div className="h-24 flex items-center justify-center"> 
                {status === 'LOCKED' && (
                    <button 
                        className="px-10 py-3 bg-white text-black rounded-full font-medium text-sm tracking-widest hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                        onClick={handleAccess} 
                        onMouseEnter={() => sound?.playHover?.()}
                    >
                        {t?.gatekeeper?.btn || "INITIALIZE SYSTEM"}
                    </button>
                )}
                {status === 'GRANTED' && (
                    <div className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">
                        ACCESS GRANTED
                    </div>
                )}
            </div>
        </div>
    );
};

// ==========================================
// 4. COMPONENTES DEL EXPLORADOR (HUD & NAV)
// ==========================================

export const ViewControlDock = ({ onViewChange, currentView, t, sound }) => {
    const dockBaseClass = "bg-[#080808]/95 backdrop-blur-xl border border-white/10 p-1.5 rounded-xl shadow-2xl flex flex-col gap-1.5 ring-1 ring-white/5";
    const getBtnClass = (isActive) => {
        const base = "w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300"; 
        if (isActive) {
            return `${base} bg-[#2563eb] text-white shadow-[0_0_15px_rgba(37,99,235,0.6)] border border-blue-400/30`;
        }
        return `${base} bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-transparent`;
    };

    return (
        <div className="absolute top-1/2 -translate-y-1/2 left-6 z-[9000] flex flex-col gap-3 pointer-events-auto">
            <div className={dockBaseClass}>
                <button onClick={() => { sound?.playClick?.(); onViewChange?.('3D'); }} className={getBtnClass(currentView?.is3D)} title="Modo 3D">
                    <Box size={16} strokeWidth={2.5} />
                </button>
                <button onClick={() => { sound?.playClick?.(); onViewChange?.('2D'); }} className={getBtnClass(!currentView?.is3D)} title="Modo 2D">
                    <Square size={16} strokeWidth={2.5} />
                </button>
            </div>
            <div className={dockBaseClass}>
                <button onClick={() => { sound?.playClick?.(); onViewChange?.('MODE_DUSK'); }} className={getBtnClass(currentView?.mode === 'dusk')} title="Modo Noche">
                    <Moon size={16} strokeWidth={2.5} />
                </button>
                <button onClick={() => { sound?.playClick?.(); onViewChange?.('MODE_DAWN'); }} className={getBtnClass(currentView?.mode === 'dawn')} title="Modo Día">
                    <Sun size={16} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

export const TopBar = ({ t, onGPS }) => (
    <div className="absolute top-0 left-0 right-0 z-[10000] px-8 py-6 flex justify-between items-start pointer-events-none">
      <div className="pointer-events-auto flex flex-col">
          <h1 className="text-2xl font-light tracking-[0.3em] drop-shadow-md" style={{color: TEXT_COLOR, textShadow: '0 0 10px rgba(0,0,0,0.5)'}}>
            STRATOS<span className="font-bold" style={{color: CORPORATE_BLUE, textShadow: `0 0 15px ${CORPORATE_BLUE}, 0 0 30px ${CORPORATE_BLUE}`}}>FERE</span>
          </h1>
      </div>
      <div className="pointer-events-auto flex items-center gap-3">
        <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]" onClick={onGPS}>
          <Crosshair className="w-5 h-5" />
        </button>
      </div>
    </div>
);

// ==============================================================
// 🎛️ SMART FILTERS (PRECISIÓN TÁCTICA)
// ==============================================================
const SmartFiltersPanel = ({ onClose, sound }) => (
  <div className="w-full max-w-lg bg-[#080808] border border-white/10 rounded-3xl shadow-2xl p-8 relative animate-fade-in-up">
    {/* Cabecera */}
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
         <div className="p-2 bg-zinc-900 rounded-lg border border-white/5 text-white">
            <SlidersHorizontal size={18} />
         </div>
         <span className="text-xs font-bold tracking-[0.2em] text-white uppercase">Filtros Tácticos</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[9px] text-blue-400 font-mono bg-blue-900/20 px-2 py-1 rounded border border-blue-900/30">12 ACTIVOS</span>
        <button onClick={onClose}><X className="w-5 h-5 text-zinc-500 hover:text-white transition-colors" /></button>
      </div>
    </div>
    
    <div className="space-y-8">
       {/* Slider Precio */}
       <div className="space-y-4">
          <div className="flex justify-between text-xs font-medium text-zinc-400">
              <span className="flex items-center gap-2"><DollarSign size={14} className="text-blue-500"/> PRESUPUESTO</span>
              <span className="text-white font-mono text-sm">2.5M €</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden relative group cursor-pointer">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-zinc-600 to-white w-[70%] group-hover:from-blue-600 group-hover:to-cyan-400 transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
          </div>
       </div>

       {/* Slider Área */}
       <div className="space-y-4">
          <div className="flex justify-between text-xs font-medium text-zinc-400">
              <span className="flex items-center gap-2"><Maximize2 size={14} className="text-blue-500"/> SUPERFICIE</span>
              <span className="text-white font-mono text-sm">120 m²</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden relative group cursor-pointer">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-zinc-600 to-white w-[40%] group-hover:from-blue-600 group-hover:to-cyan-400 transition-all duration-500" />
          </div>
       </div>
       
       {/* Botonera Tipo */}
       <div className="grid grid-cols-3 gap-2 pt-4">
          <button className="py-3 bg-white text-black text-[10px] font-bold tracking-widest rounded-lg shadow-lg hover:scale-105 transition-transform" onClick={() => sound?.playClick?.()}>TODO</button>
          <button className="py-3 bg-zinc-900 text-zinc-500 border border-white/5 hover:border-white/20 hover:text-white text-[10px] font-bold tracking-widest rounded-lg transition-all" onClick={() => sound?.playClick?.()}>CASA</button>
          <button className="py-3 bg-zinc-900 text-zinc-500 border border-white/5 hover:border-white/20 hover:text-white text-[10px] font-bold tracking-widest rounded-lg transition-all" onClick={() => sound?.playClick?.()}>PISO</button>
       </div>
    </div>
  </div>
);

// ==========================================
// 5. OMNI SEARCH DOCK (IA & CONTROLES)
// ==========================================

export const OmniSearchDock = ({ onSearch, setActiveTab, activeTab, toggleFilters, toggleAI, activePanel, sound, onOpenProfile }) => {
  const [query, setQuery] = useState("");
  
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-4xl px-4 flex flex-col items-center pointer-events-auto">
      <div className="relative z-20 pointer-events-auto bg-[#080808]/90 backdrop-blur-3xl border border-white/10 rounded-full p-3 px-6 flex items-center justify-between shadow-2xl gap-4 w-full ring-1 ring-white/5">
        
        {/* BUSCADOR */}
        <div className="flex-grow flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] text-white px-5 py-4 rounded-full transition-all duration-500 group border border-white/5 hover:border-white/10 focus-within:border-blue-500/30 focus-within:bg-white/[0.05]">
            <Search size={18} className="text-white/40 group-hover:text-white transition-colors" />
            <input 
                type="text" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && onSearch && onSearch(e.target.value)} 
                placeholder="Design your search..." 
                className="bg-transparent border-none outline-none text-sm text-white/90 placeholder-white/30 w-full font-light tracking-wide" 
            />
        </div>
        
        <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
        
        {/* BOTONES TÁCTICOS */}
        <div className="flex items-center gap-2">
            <button 
                onClick={() => { sound?.playClick?.(); toggleFilters && toggleFilters(); }} 
                className={`p-3.5 rounded-full transition-all duration-300 relative ${activePanel === 'FILTERS' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-transparent text-white/50 hover:text-white hover:bg-white/5'}`}
            >
                <SlidersHorizontal size={20} />
            </button>
            <button 
                onClick={() => { sound?.playClick?.(); toggleAI && toggleAI(); }} 
                className={`p-3.5 rounded-full transition-all duration-300 relative ${activePanel === 'AI_PANEL' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'bg-transparent text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'}`}
            >
                {activePanel === 'AI_PANEL' ? <ChevronUp size={20} /> : <Sparkles size={20} />}
            </button>
        </div>
        
        <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
        
        {/* PESTAÑAS */}
        <div className="flex items-center gap-2">
            {[
                { id: 'map', icon: MapPin }, 
                { id: 'vault', icon: Heart }, 
                { id: 'chat', icon: MessageSquare }
            ].map((item) => (
                <button 
                    key={item.id} 
                    onClick={() => { sound?.playClick?.(); setActiveTab && setActiveTab(item.id); }} 
                    className={`p-3.5 rounded-full transition-all duration-300 relative group ${activeTab === item.id ? 'text-white bg-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    <item.icon size={20} strokeWidth={activeTab === item.id ? 2 : 1.5} />
                </button>
            ))}
            {/* BOTÓN PERFIL SEPARADO */}
            <button 
                onClick={() => { sound?.playClick?.(); onOpenProfile && onOpenProfile(); }}
                className="p-3.5 rounded-full transition-all duration-300 text-white/40 hover:text-white hover:bg-white/5"
            >
                <User size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. TARJETAS Y DETALLES DE PROPIEDAD
// ==========================================

export const MapNanoCard = ({ props, onToggleFavorite, isFavorite, onClose, onOpenDetail, t, sound }) => {
    const [liked, setLiked] = useState(isFavorite);
    
    const handleLike = (e) => { 
        e.stopPropagation(); 
        setLiked(!liked); 
        onToggleFavorite && onToggleFavorite(props); 
        sound?.playPing?.(); 
    };

    const tierColor = TIER_COLORS[props.tier]?.hex || CORPORATE_BLUE;
    const tierGlow = TIER_COLORS[props.tier]?.glow || `0 0 15px ${CORPORATE_BLUE}60`;
  
    return (
      <div className="relative w-[320px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{borderColor: `${tierColor}40`}}>
        <div className="relative h-44 w-full cursor-pointer overflow-hidden" onClick={() => onOpenDetail && onOpenDetail(props)}>
          <img src={props.photoUrl || LUXURY_IMAGES[0]} alt={props.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" onError={(e) => {e.target.onerror = null; e.target.src = LUXURY_IMAGES[0]}} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
          
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded text-[9px] font-bold tracking-widest text-white uppercase flex items-center gap-1.5">
             <div className="w-2 h-2 rounded-full" style={{backgroundColor: tierColor, boxShadow: tierGlow}}></div>
             {props.title}
          </div>
          
          <div className="absolute bottom-3 left-4">
              <span className="text-2xl font-light tracking-tight text-white">{props.precio}</span>
          </div>
          
          <button onClick={handleLike} className="absolute bottom-3 right-3 p-2 rounded-full bg-black/30 hover:bg-white/10 transition-colors">
              <Heart size={18} className={liked ? 'fill-current' : ''} style={liked ? {color: tierColor} : {color: 'white'}} />
          </button>
          
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-white/10 text-white/60 hover:text-white transition-colors backdrop-blur-md z-50">
              <X size={14} />
          </button>
        </div>
        
        <div className="p-4 border-t border-white/5">
          <div className="flex justify-between items-start mb-3">
              <div>
                  <h3 className="text-xs font-bold text-white mb-1">{props.category}</h3>
                  <p className="text-[10px] text-white/50 font-mono">ID: {props.id}</p>
              </div>
              <div className="text-right">
                  <span className="text-xs text-white/70">{props.rooms} {t?.specs?.bed || "Dorm"} • {props.area} {t?.specs?.sqm || "m²"}</span>
              </div>
          </div>
          <div className="w-full">
             <button className="w-full py-3 rounded-lg text-white text-[10px] font-bold tracking-wider transition-colors flex items-center justify-center gap-1 hover:opacity-90 shadow-lg" style={{backgroundColor: tierColor, boxShadow: tierGlow}} onClick={() => { sound?.playDeploy?.(); onOpenDetail && onOpenDetail(props); }}>
                 {t?.panel?.contact || "CONTACTAR"} <ArrowRight size={12} />
             </button>
          </div>
        </div>
      </div>
    );
};
  

// ==========================================
// 7. DASHBOARD DE PERFIL (GAMIFICACIÓN)
// ==========================================

export const ProfileDashboard = ({ t, onClose, sound }) => {
    const [activeTab, setActiveTab] = useState('OVERVIEW'); 
    const [selectedServices, setSelectedServices] = useState([]);

    // Datos simulados del Partner
    const stats = { tier: "PARTNER GOLD", growth: 75, balance: 12500, marketShare: 68 };
    
    const SERVICES_DB = [ 
        { id: 's1', name: 'Global Network Syndication', cat: 'DIGITAL', price: 450, icon: Globe, tier: 'GOLD' }, 
        { id: 's2', name: 'Hyper-Targeted Ads', cat: 'DIGITAL', price: 200, icon: Target, tier: 'SILVER' }, 
        { id: 's3', name: 'Virtual Twin (Matterport)', cat: 'DIGITAL', price: 150, icon: Box, tier: 'SILVER' }, 
        { id: 's4', name: 'High-Conv Landing Page', cat: 'DIGITAL', price: 300, icon: Layers, tier: 'GOLD' }, 
        { id: 's5', name: 'Drone Cinematography', cat: 'MEDIA', price: 400, icon: Zap, tier: 'GOLD' }, 
        { id: 's6', name: 'VIP Open House Experience', cat: 'EVENT', price: 800, icon: Music, tier: 'PLATINUM' }, 
        { id: 's7', name: 'Premium Home Staging', cat: 'PHYSICAL', price: 1200, icon: Square, tier: 'PLATINUM' }, 
        { id: 's8', name: 'Stratosfere Editorial', cat: 'MEDIA', price: 150, icon: BookOpen, tier: 'SILVER' } 
    ];

    const toggleService = (id) => { 
        sound?.playClick?.(); 
        if (selectedServices.includes(id)) { 
            setSelectedServices(selectedServices.filter(s => s !== id)); 
        } else { 
            setSelectedServices([...selectedServices, id]); 
        } 
    };

    const cartTotal = SERVICES_DB.filter(s => selectedServices.includes(s.id)).reduce((acc, curr) => acc + curr.price, 0);

    // Sub-componente interno para gráficos circulares
    const StatGauge = ({ value, label, color }) => (
        <div className="bg-[#0f0f0f]/80 backdrop-blur-md p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-white/10 transition-all">
            <div className="relative w-24 h-24 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#222" strokeWidth="2" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={color} strokeWidth="2" strokeDasharray={`${value}, 100`} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-bold text-white tracking-tighter">{value}%</span>
                </div>
            </div>
            <span className="mt-2 text-[9px] text-white/40 uppercase tracking-[0.2em]">{label}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[12000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-[#050505] w-full max-w-5xl h-[85vh] rounded-[24px] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row relative" onClick={e => e.stopPropagation()}>
                
                <button onClick={onClose} className="absolute top-6 right-6 z-50 text-white/30 hover:text-white p-2 transition-all"><X size={24}/></button>
                
                {/* SIDEBAR NAVEGACIÓN */}
                <div className="w-full md:w-64 bg-[#080808] border-r border-white/5 flex flex-col p-6">
                    <div className="mb-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.3)]">SF</div>
                        <div><h2 className="text-white font-bold text-xs tracking-[0.2em]">STRATOSFERE</h2><span className="text-[9px] text-white/40 font-mono">ENTERPRISE OS</span></div>
                    </div>
                    
                    <nav className="flex flex-col gap-2 flex-grow">
                        {[ 
                            { id: 'OVERVIEW', icon: Activity, label: 'DASHBOARD' }, 
                            { id: 'SERVICES', icon: Layers, label: 'MARKETPLACE' }, 
                            { id: 'CERTIFICATIONS', icon: Award, label: 'PARTNER TIER' } 
                        ].map(tab => (
                            <button key={tab.id} onClick={() => { sound?.playClick?.(); setActiveTab(tab.id); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[10px] font-bold tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                <tab.icon size={16} className={activeTab === tab.id ? 'text-black' : ''} />{tab.label}
                            </button>
                        ))}
                    </nav>
                    
                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center mb-2"><span className="text-[9px] text-white/40 uppercase">Disponible</span><DollarSign size={12} className="text-emerald-500"/></div>
                            <div className="text-xl font-mono text-white tracking-tight">€{stats.balance.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* CONTENIDO PRINCIPAL */}
                <div className="flex-grow p-10 overflow-y-auto custom-scrollbar bg-[#050505] relative">
                    <div className="flex justify-between items-end mb-10 pb-6 border-b border-white/5">
                        <div>
                            <h1 className="text-4xl font-light text-white tracking-tighter mb-2">
                                {activeTab === 'OVERVIEW' && `Bienvenido, Partner.`}
                                {activeTab === 'SERVICES' && 'Marketplace de Servicios'}
                                {activeTab === 'CERTIFICATIONS' && 'Estatus & Certificaciones'}
                            </h1>
                            <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.2em]">
                                {activeTab === 'OVERVIEW' && `Nivel Actual: ${stats.tier}`}
                                {activeTab === 'SERVICES' && 'Seleccione activos para potenciar su portfolio.'}
                            </p>
                        </div>
                        {activeTab === 'SERVICES' && (
                            <div className="text-right">
                                <div className="text-[9px] text-white/40 font-mono uppercase">Total Inversión</div>
                                <div className="text-3xl font-light text-cyan-400">€{cartTotal}</div>
                            </div>
                        )}
                    </div>

                    {/* VISTA OVERVIEW */}
                    {activeTab === 'OVERVIEW' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
                            <StatGauge value={stats.marketShare} label="Market Share" color="#2563eb" />
                            <StatGauge value={stats.growth} label="YoY Growth" color="#06b6d4" />
                            <div className="bg-[#0f0f0f]/50 p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:bg-[#151515] transition-all">
                                <div>
                                    <h3 className="text-white font-medium text-sm mb-4">Actividad Reciente</h3>
                                    <ul className="space-y-4">
                                        <li className="flex justify-between text-xs text-white/60"><span>Visita Agendada</span><span className="text-white">10:00 AM</span></li>
                                        <li className="flex justify-between text-xs text-white/60"><span>Lead Cualificado</span><span className="text-white">Ayer</span></li>
                                        <li className="flex justify-between text-xs text-white/60"><span>Activo Publicado</span><span className="text-white/30">22 Nov</span></li>
                                    </ul>
                                </div>
                                <button className="w-full py-2 bg-white/5 hover:bg-white text-white/50 hover:text-black text-[10px] rounded uppercase mt-4 transition-all font-bold">Ver Analytics</button>
                            </div>
                        </div>
                    )}

                    {/* VISTA SERVICES */}
                    {activeTab === 'SERVICES' && (
                        <div className="space-y-6 animate-slide-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {SERVICES_DB.map((service) => (
                                    <div key={service.id} onClick={() => toggleService(service.id)} className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-between group ${selectedServices.includes(service.id) ? 'bg-white/5 border-cyan-500/50' : 'bg-[#0a0a0a] border-white/5 hover:border-white/20'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-lg ${selectedServices.includes(service.id) ? 'bg-cyan-500 text-black' : 'bg-white/5 text-white/40 group-hover:text-white'}`}>
                                                    <service.icon size={18} />
                                                </div>
                                                <div>
                                                    <h4 className={`font-medium text-sm ${selectedServices.includes(service.id) ? 'text-white' : 'text-white/80'}`}>{service.name}</h4>
                                                    <span className="text-[9px] text-white/30 font-mono uppercase tracking-wider">{service.cat}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-white text-sm">€{service.price}</div>
                                                <div className={`w-2 h-2 rounded-full ml-auto mt-2 transition-all ${selectedServices.includes(service.id) ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'bg-white/10'}`}></div>
                                            </div>
                                    </div>
                                ))}
                            </div>
                            {selectedServices.length > 0 && (
                                <div className="sticky bottom-0 p-4 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl flex justify-between items-center shadow-2xl animate-fade-in-up">
                                    <div className="text-[10px] text-white/60 font-mono uppercase tracking-widest flex items-center gap-2"><Activity size={12} className="text-cyan-400 animate-pulse"/> {selectedServices.length} ITEMS SELECCIONADOS</div>
                                    <button onClick={() => { sound?.playDeploy?.(); alert('Procesando orden de compra...'); }} className="px-8 py-3 bg-white hover:bg-gray-200 text-black font-bold text-xs rounded-lg shadow-lg transition-all transform hover:scale-105 tracking-widest uppercase">Confirmar Orden</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 8. FORMULARIO DE CAPTURA DE PROPIEDAD
// ==========================================

export const PropertyCaptureForm = ({ onClose, t, sound }) => {
    const [price, setPrice] = useState(0);
    const [photos, setPhotos] = useState([]);
    const [description, setDescription] = useState('');
    const [energyCert, setEnergyCert] = useState('NOT_APPLY');

    // Memoizar el cálculo del Tier para evitar re-renders innecesarios
    const currentTierKey = useMemo(() => getPropertyTier(price), [price]);
    const tier = TIER_CONFIG[currentTierKey] || TIER_CONFIG['SMART'];
    const tierColor = tier?.color || CORPORATE_BLUE; 
    const tierName = tier?.name || 'SMART';

    const handlePriceChange = (e) => { const value = parseInt(e.target.value) || 0; setPrice(value); };
    const handleSubmit = (e) => { 
        e.preventDefault(); 
        sound?.playClick?.(); 
        console.log('Propiedad lista:', { price, description, energyCert, tierName }); 
        onClose(); 
    };

    const inputClass = "w-full bg-white/5 border border-white/10 p-2 text-sm text-white/90 rounded-md focus:ring-1 transition-all";
    const sectionClass = "mb-6 p-4 border border-white/10 rounded-xl bg-black/50";

    return (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center backdrop-blur-sm animate-fade-in-up" onClick={onClose}>
            <div className="w-[600px] h-[80vh] bg-black/90 border border-white/20 rounded-2xl shadow-3xl overflow-y-auto custom-scrollbar p-6" onClick={(e) => e.stopPropagation()}>
                
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10 sticky top-0 bg-black/90 z-10">
                    <h2 className="text-xl font-bold tracking-widest uppercase" style={{color: tierColor}}>{t?.form?.title || "ALTA PROPIEDAD"} | {tierName}</h2>
                    <button onClick={onClose} className="p-2 text-white/50 hover:text-red-500 transition-colors"><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className={sectionClass}>
                        <div className="flex items-center gap-2 mb-3 text-white font-mono uppercase" style={{color: tierColor}}><DollarSign size={16} /> VALORACIÓN</div>
                        <label className="block mb-4">
                            <span className="text-xs text-white/60 mb-1 block">Precio Estimado (€)</span>
                            <input type="number" value={price} onChange={handlePriceChange} className={inputClass} placeholder="Ej: 450000" />
                        </label>
                        <div className="p-3 rounded-lg flex items-center justify-center text-sm font-bold mt-4" style={{ backgroundColor: `${tierColor}20`, border: `1px solid ${tierColor}` }}>
                            TIER ASIGNADO: <span className="ml-2 font-mono" style={{color: tierColor}}>{tierName}</span>
                        </div>
                    </div>
                    
                    <div className={sectionClass}>
                        <div className="flex items-center gap-2 mb-3 text-white font-mono uppercase"><Zap size={16} style={{color: tierColor}}/> CERTIFICACIÓN</div>
                        <label className="block mb-4">
                            <span className="text-xs text-white/60 mb-1 block">Certificado Energético</span>
                            <select value={energyCert} onChange={(e) => setEnergyCert(e.target.value)} className={inputClass}>
                                <option value="NOT_APPLY">En Trámite / No Aplica</option>
                                {['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'].map(cert => (<option key={cert} value={cert}>{cert}</option>))}
                            </select>
                        </label>
                    </div>
                    
                    <div className={sectionClass}>
                        <div className="flex items-center gap-2 mb-3 text-white font-mono uppercase"><FileText size={16} style={{color: tierColor}}/> DETALLES</div>
                        <label className="block mb-4">
                            <span className="text-xs text-white/60 mb-1 block">Descripción</span>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass + " h-24"} placeholder="Breve descripción..." />
                        </label>
                        <div className="mt-4 p-4 border border-dashed border-white/20 rounded-lg text-center cursor-pointer hover:bg-white/5 transition-colors" onClick={() => alert("Subir fotos")}>
                            <Camera size={20} className="mx-auto text-white/50 mb-1" />
                            <span className="text-xs text-white/60">SUBIR FOTOS</span>
                        </div>
                    </div>
                    
                    <button type="submit" className="w-full py-3 mt-4 text-sm font-bold uppercase tracking-widest rounded-lg transition-all" style={{ backgroundColor: tierColor, color: 'black', boxShadow: `0 4px 15px -5px ${tierColor}`}}>
                        PUBLICAR ACTIVO
                    </button>
                </form>
            </div>
        </div>
    );
};

// ==============================================================
// 🧠 FRAGMENTO 1: AI ARCHITECT CORE (NIVEL OMEGA)
// ==============================================================
const AIArchitectPanel = ({ onClose, sound }) => {
  const [status, setStatus] = useState('IDLE'); // IDLE | SCANNING | COMPUTING | READY

  const activateAI = (mode) => {
    sound?.playDeploy?.();
    setStatus('SCANNING');
    
    // Simulación de "Pensamiento" de la IA
    setTimeout(() => setStatus('COMPUTING'), 1200);
    setTimeout(() => {
      setStatus('READY');
      sound?.playPing?.(); // Ping cuando encuentra resultados
    }, 2800);
  };

  return (
    <div className="w-full max-w-2xl bg-[#050505] border border-white/10 rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] overflow-hidden relative p-8 animate-fade-in-up">
      {/* Fondo Táctico */}
      <div className="absolute inset-0 bg-white/5 opacity-5 pointer-events-none"></div>
      
      {/* Cabecera */}
      <div className="relative z-10 flex justify-between items-start mb-8 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl border border-white/10 transition-all duration-500 ${status !== 'IDLE' ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/5'}`}>
            <Sparkles className={`w-6 h-6 ${status !== 'IDLE' ? 'text-blue-400 animate-pulse' : 'text-zinc-500'}`} />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg tracking-widest">AI ARCHITECT <span className="text-blue-500">OMEGA</span></h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${status === 'IDLE' ? 'bg-zinc-600' : 'bg-emerald-500 animate-ping'}`}/>
              <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.2em]">
                {status === 'IDLE' ? 'SYSTEM STANDBY' : status === 'SCANNING' ? 'NEURAL LINK ACTIVE' : 'OPTIMIZING ASSETS'}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-600 hover:text-white transition-colors"><X size={20}/></button>
      </div>

      {/* Cuerpo Cambiante */}
      <div className="relative z-10 min-h-[200px] flex flex-col justify-center">
        
        {/* FASE 1: SELECCIÓN */}
        {status === 'IDLE' && (
          <div className="grid grid-cols-3 gap-4 animate-fade-in">
            {[
              { id: 'urban', label: 'URBAN PRIME', icon: Building },
              { id: 'nature', label: 'SANCTUARY', icon: Mountain },
              { id: 'capital', label: 'CAPITAL', icon: Activity }
            ].map((mode) => (
              <button 
                key={mode.id}
                onClick={() => activateAI(mode.id)}
                className="group relative h-32 bg-zinc-900/40 border border-white/5 rounded-2xl hover:bg-blue-600 hover:border-blue-400 transition-all duration-300 flex flex-col items-center justify-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
                <mode.icon className="w-8 h-8 text-zinc-600 group-hover:text-white transition-colors duration-300 transform group-hover:scale-110" />
                <span className="text-[10px] font-bold text-zinc-500 group-hover:text-white tracking-[0.2em] z-10">{mode.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* FASE 2: PROCESANDO (VISUAL) */}
        {(status === 'SCANNING' || status === 'COMPUTING') && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
              <div className="absolute inset-3 rounded-full border-r-2 border-purple-500 animate-spin duration-700"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-mono text-blue-400">{status === 'SCANNING' ? '01' : '02'}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-mono text-sm tracking-widest mb-1 animate-pulse">
                {status === 'SCANNING' ? 'ESCANEO SATELITAL...' : 'CALCULANDO ROI...'}
              </div>
              <div className="text-zinc-600 text-[10px] font-mono">
                PROCESANDO 14.032 PUNTOS DE DATA
              </div>
            </div>
          </div>
        )}

        {/* FASE 3: RESULTADOS */}
        {status === 'READY' && (
          <div className="bg-blue-900/10 border border-blue-500/30 rounded-2xl p-8 text-center animate-zoom-in">
            <div className="text-5xl font-light text-white mb-2 tracking-tighter">3 MATCHES</div>
            <p className="text-blue-200/60 text-xs mb-6 font-mono uppercase">Oportunidades de alto rendimiento detectadas</p>
            <button onClick={onClose} className="bg-white text-black px-10 py-4 rounded-lg font-bold text-xs tracking-[0.2em] hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              DESPLEGAR EN MAPA
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==============================================================
// 🎛️ SMART FILTERS (PRECISIÓN TÁCTICA)
// ==============================================================
const SmartFiltersPanel = ({ onClose, sound }) => (
  <div className="w-full max-w-lg bg-[#080808] border border-white/10 rounded-3xl shadow-2xl p-8 relative animate-fade-in-up">
    {/* Cabecera */}
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
         <div className="p-2 bg-zinc-900 rounded-lg border border-white/5 text-white">
            <SlidersHorizontal size={18} />
         </div>
         <span className="text-xs font-bold tracking-[0.2em] text-white uppercase">Filtros Tácticos</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[9px] text-blue-400 font-mono bg-blue-900/20 px-2 py-1 rounded border border-blue-900/30">LIVE DATA</span>
        <button onClick={onClose}><X className="w-5 h-5 text-zinc-500 hover:text-white transition-colors" /></button>
      </div>
    </div>
    
    <div className="space-y-8">
       {/* Slider Precio */}
       <div className="space-y-4">
          <div className="flex justify-between text-xs font-medium text-zinc-400">
              <span className="flex items-center gap-2"><DollarSign size={14} className="text-blue-500"/> PRESUPUESTO</span>
              <span className="text-white font-mono text-sm">2.5M €</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden relative group cursor-pointer">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-zinc-600 to-white w-[70%] group-hover:from-blue-600 group-hover:to-cyan-400 transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
          </div>
       </div>

       {/* Slider Área */}
       <div className="space-y-4">
          <div className="flex justify-between text-xs font-medium text-zinc-400">
              <span className="flex items-center gap-2"><Maximize2 size={14} className="text-blue-500"/> SUPERFICIE</span>
              <span className="text-white font-mono text-sm">120 m²</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden relative group cursor-pointer">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-zinc-600 to-white w-[40%] group-hover:from-blue-600 group-hover:to-cyan-400 transition-all duration-500" />
          </div>
       </div>
       
       {/* Botonera Tipo */}
       <div className="grid grid-cols-3 gap-2 pt-4">
          <button className="py-3 bg-white text-black text-[10px] font-bold tracking-widest rounded-lg shadow-lg hover:scale-105 transition-transform" onClick={() => sound?.playClick?.()}>TODO</button>
          <button className="py-3 bg-zinc-900 text-zinc-500 border border-white/5 hover:border-white/20 hover:text-white text-[10px] font-bold tracking-widest rounded-lg transition-all" onClick={() => sound?.playClick?.()}>CASA</button>
          <button className="py-3 bg-zinc-900 text-zinc-500 border border-white/5 hover:border-white/20 hover:text-white text-[10px] font-bold tracking-widest rounded-lg transition-all" onClick={() => sound?.playClick?.()}>PISO</button>
       </div>
    </div>
  </div>
);

// ==========================================
// A. DUAL GATEWAY (LOS PLANOS QUE FALTAN)
// ==========================================
export const DualGateway = ({ onSelectMode, sound }) => {
  return (
    <div className="fixed inset-0 z-[50000] flex items-center justify-center pointer-events-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full px-6 pointer-events-auto animate-fade-in-up">
        {/* OPCIÓN A: COMPRADOR */}
        <div 
            onClick={() => { sound?.playClick?.(); onSelectMode('EXPLORER'); }} 
            className="group cursor-pointer bg-black/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl hover:border-cyan-500 hover:bg-black/90 transition-all duration-500 hover:scale-[1.02] flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
          <div className="p-6 rounded-full bg-white/5 mb-6 group-hover:bg-cyan-500/20 transition-colors duration-300 relative z-10">
            <Radar className="w-12 h-12 text-white group-hover:text-cyan-400 transition-colors" />
          </div>
          <h2 className="text-3xl font-light text-white tracking-widest mb-2 relative z-10">EXPLORADOR</h2>
          <p className="text-sm text-white/50 font-mono tracking-wide relative z-10">BUSCO OPORTUNIDADES PRIME</p>
          <div className="mt-8 px-6 py-2 border border-white/20 rounded-full text-[10px] tracking-widest text-white/60 group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-500 transition-all relative z-10 uppercase font-bold">
            Acceder al Radar
          </div>
        </div>

        {/* OPCIÓN B: VENDEDOR */}
        <div 
            onClick={() => { sound?.playClick?.(); onSelectMode('ARCHITECT'); }} 
            className="group cursor-pointer bg-black/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl hover:border-amber-500 hover:bg-black/90 transition-all duration-500 hover:scale-[1.02] flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
          <div className="p-6 rounded-full bg-white/5 mb-6 group-hover:bg-amber-500/20 transition-colors duration-300 relative z-10">
            <Building className="w-12 h-12 text-white group-hover:text-amber-400 transition-colors" />
          </div>
          <h2 className="text-3xl font-light text-white tracking-widest mb-2 relative z-10">ARQUITECTO</h2>
          <p className="text-sm text-white/50 font-mono tracking-wide relative z-10">CAPITALIZAR MI ACTIVO</p>
          <div className="mt-8 px-6 py-2 border border-white/20 rounded-full text-[10px] tracking-widest text-white/60 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500 transition-all relative z-10 uppercase font-bold">
            Iniciar Gestión
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. MÓDULO DE CAPTURA (FORMULARIO QUE FALTABA)
// ==========================================
export const PropertyCaptureForm = ({ onComplete, onCancel, sound }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({ price: '', cert: 'En trámite', rooms: 3, type: 'Piso' });

    const next = () => { sound?.playClick?.(); setStep(s => s + 1); };
    const finish = () => { sound?.playDeploy?.(); onComplete(data); };

    return (
        <div className="absolute inset-0 z-[10000] bg-black/90 flex items-center justify-center backdrop-blur-md animate-fade-in-up">
            <div className="w-[500px] bg-[#0a0a0a] border border-white/20 rounded-2xl p-8 shadow-2xl relative">
                <button onClick={onCancel} className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={20}/></button>
                
                {/* PROGRESO */}
                <div className="flex gap-2 mb-8">
                    {[1,2,3].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-amber-500 shadow-[0_0_10px_orange]' : 'bg-white/10'}`}/>)}
                </div>

                {/* PASO 1: DATOS BÁSICOS */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-xl text-white font-bold uppercase tracking-widest flex items-center gap-2"><DollarSign className="text-amber-500"/> Valoración</h3>
                        <div>
                            <label className="text-[10px] uppercase text-white/50 block mb-2 tracking-widest">Precio Estimado (€)</label>
                            <input type="number" value={data.price} onChange={e=>setData({...data, price: e.target.value})} className="w-full bg-white/5 border border-white/10 focus:border-amber-500 p-4 rounded-xl text-white font-mono text-lg outline-none transition-all" placeholder="Ej: 450000" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase text-white/50 block mb-2 tracking-widest">Tipo de Activo</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Piso', 'Casa', 'Ático', 'Loft'].map(t => (
                                    <button key={t} onClick={()=>setData({...data, type: t})} className={`p-3 rounded-xl border text-sm font-bold transition-all ${data.type===t ? 'border-amber-500 text-black bg-amber-500' : 'border-white/10 text-white/60 hover:bg-white/5'}`}>{t}</button>
                                ))}
                            </div>
                        </div>
                        <button onClick={next} className="w-full py-4 bg-white hover:bg-gray-200 text-black font-bold text-xs uppercase tracking-widest rounded-xl mt-4 transition-all">Siguiente</button>
                    </div>
                )}

                {/* PASO 2: DETALLES */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-xl text-white font-bold uppercase tracking-widest flex items-center gap-2"><Zap className="text-amber-500"/> Especificaciones</h3>
                        <div>
                            <label className="text-[10px] uppercase text-white/50 block mb-2 tracking-widest">Certificado Energético</label>
                            <div className="flex gap-2 flex-wrap">
                                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(c => (
                                    <button key={c} onClick={()=>setData({...data, cert: c})} className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold transition-all ${data.cert===c ? 'border-amber-500 bg-amber-500/20 text-amber-500' : 'border-white/10 text-white/40 hover:border-white/30'}`}>{c}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase text-white/50 block mb-2 tracking-widest">Habitaciones</label>
                            <div className="flex gap-2">
                                {[1,2,3,4,5].map(n => (
                                    <button key={n} onClick={()=>setData({...data, rooms: n})} className={`flex-1 h-12 rounded-xl border flex items-center justify-center font-bold transition-all ${data.rooms===n ? 'bg-white text-black border-white' : 'border-white/10 text-white/60 hover:bg-white/5'}`}>{n}</button>
                                ))}
                            </div>
                        </div>
                        <button onClick={next} className="w-full py-4 bg-white hover:bg-gray-200 text-black font-bold text-xs uppercase tracking-widest rounded-xl mt-4 transition-all">Siguiente</button>
                    </div>
                )}

                {/* PASO 3: FOTOS */}
                {step === 3 && (
                    <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-xl text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2"><Camera className="text-amber-500"/> Material Visual</h3>
                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 hover:border-amber-500/50 hover:bg-amber-500/5 cursor-pointer transition-all group">
                            <Upload className="mx-auto text-white/30 mb-4 group-hover:text-amber-500 group-hover:scale-110 transition-all" size={32} />
                            <p className="text-xs text-white/50 uppercase tracking-widest">Click para subir fotos</p>
                        </div>
                        <button onClick={finish} className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl mt-4 shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all transform hover:scale-[1.02]">
                            FINALIZAR ALTA
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==========================================
// 7. ARCHITECT HUD (CONTROLADOR FUSIONADO)
// ==========================================
export const ArchitectHud = ({ sound, onCloseMode }) => {
  // AQUÍ ESTÁ LA MAGIA DE LA FUSIÓN:
  // INTRO -> FORM (Datos) -> SCAN (Vibe Check) -> SKILL_TREE (Servicios) -> INBOX (Agentes)
  const [viewState, setViewState] = useState('INTRO'); 
  
  // Variables para la lógica avanzada (Tu código original)
  const [signalPower, setSignalPower] = useState(15);
  const [cart, setCart] = useState([]);

  const SERVICES = [
    { id: 'global', name: 'Global Network', price: 450, color: 'text-cyan-400', icon: Globe },
    { id: 'drone', name: 'Drone Cinema', price: 400, color: 'text-purple-400', icon: Zap },
    { id: 'ads', name: 'Hyper Ads', price: 200, color: 'text-blue-400', icon: Target },
    { id: 'event', name: 'VIP Event', price: 800, color: 'text-amber-400', icon: Music },
  ];

  const toggleService = (srv) => {
    sound?.playClick?.();
    if (cart.find(x => x.id === srv.id)) { 
        setCart(cart.filter(x => x.id !== srv.id)); 
        setSignalPower(prev => prev - 20); 
    } else { 
        setCart([...cart, srv]); 
        setSignalPower(prev => prev + 20); 
    }
  };
  
  const totalInv = cart.reduce((acc, curr) => acc + curr.price, 0);

  // --- NAVEGACIÓN ENTRE ESTADOS ---
  const startProcess = () => { sound?.playClick?.(); setViewState('FORM'); }; // Salta al formulario
  
  const handleFormDone = () => { setViewState('SCAN'); }; // Del formulario va al Scan (Vibe Check)

  // 1. ESTADO: FORMULARIO DE DATOS (LO QUE FALTABA)
  if (viewState === 'FORM') {
      return <PropertyCaptureForm onComplete={handleFormDone} onCancel={() => setViewState('INTRO')} sound={sound} />;
  }

  // 2. ESTADO: INTRO / SCAN / SKILL_TREE / INBOX (TU CÓDIGO ORIGINAL INTEGRADO)
  return (
    <div className="absolute inset-0 z-[9999] pointer-events-none flex items-end justify-center">
      <div className="pointer-events-auto absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg z-[10000] animate-fade-in-up">
        
        {/* PANTALLA INTRO (NUEVA) PARA NO ENTRAR DE GOLPE */}
        {viewState === 'INTRO' && (
            <div className="bg-[#0a0a0a]/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.15)]">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                    <Building className="text-amber-500" size={32} />
                </div>
                <h3 className="text-white font-light text-2xl mb-2 tracking-wide">Modo Arquitecto</h3>
                <p className="text-white/50 text-sm mb-8 leading-relaxed">Digitalice su activo inmobiliario para acceder al mercado de capital global.</p>
                <button onClick={startProcess} className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-sm tracking-[0.2em] rounded-xl hover:scale-105 transition-transform shadow-lg">
                    COMENZAR DIGITALIZACIÓN
                </button>
                <button onClick={onCloseMode} className="mt-6 text-white/30 text-[10px] hover:text-white uppercase tracking-widest">CANCELAR Y VOLVER</button>
            </div>
        )}

        {/* CONTENEDOR PRINCIPAL PARA LOS PASOS AVANZADOS */}
        {viewState !== 'INTRO' && (
            <div className="bg-[#0a0a0a]/95 backdrop-blur-2xl border border-amber-500/30 rounded-t-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                <Building className="text-amber-500 animate-pulse" size={20} />
                <span className="text-xs font-bold text-amber-500 tracking-[0.2em]">MODO ARQUITECTO</span>
                </div>
                <button onClick={onCloseMode} className="text-[10px] text-white/40 hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-white/10">SALIR ✕</button>
            </div>

            <div className="min-h-[300px] flex flex-col justify-center">
                
                {/* TU DISEÑO: PASO SCAN */}
                {viewState === 'SCAN' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl text-white font-light">Sintetizando Activo</h3>
                        <p className="text-xs text-white/50">Generando Gemelo Digital...</p>
                    </div>
                    <div className="aspect-video w-full bg-white/5 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 group hover:border-amber-500/50 cursor-pointer transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"/>
                    <Smartphone className="text-white/40 group-hover:text-amber-500 z-20 transition-colors" size={32} />
                    <span className="text-xs text-white/60 z-20 font-mono">Vibe Check (15s)</span>
                    </div>
                    <button onClick={() => { sound?.playDeploy?.(); setViewState('SKILL_TREE'); }} className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-bold text-sm tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02]">
                        <Zap size={16} fill="black" /> POTENCIAR SEÑAL
                    </button>
                </div>
                )}

                {/* TU DISEÑO: PASO SKILL TREE */}
                {viewState === 'SKILL_TREE' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <div>
                            <h3 className="text-xl text-white font-light">Marketplace</h3>
                            <p className="text-[10px] text-white/40 mt-1">Seleccione servicios tácticos.</p>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-white/40 uppercase">Señal</div>
                            <div className={`text-xl font-mono font-bold ${signalPower > 80 ? 'text-emerald-400' : 'text-amber-500'}`}>{signalPower}%</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {SERVICES.map(srv => { 
                            const active = cart.find(x => x.id === srv.id); 
                            return (
                                <div key={srv.id} onClick={() => toggleService(srv)} className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col gap-2 group ${active ? 'bg-white/10 border-amber-500/50' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                                    <div className="flex justify-between items-start">
                                        <srv.icon size={16} className={`${active ? srv.color : 'text-white/30'} group-hover:text-white transition-colors`} />
                                        {active && <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_orange]"></div>}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white">{srv.name}</div>
                                        <div className="text-[10px] text-white/50">€{srv.price}</div>
                                    </div>
                                </div>
                            ) 
                        })}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setViewState('SCAN')} className="px-4 py-4 border border-white/10 rounded-xl text-white/50 hover:bg-white/5 transition-all">←</button>
                        <button onClick={() => { sound?.playDeploy?.(); setViewState('INBOX'); }} className="flex-1 py-4 bg-white hover:bg-gray-200 text-black font-bold text-sm tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                            ACTIVAR (€{totalInv})
                        </button>
                    </div>
                </div>
                )}

                {/* TU DISEÑO: PASO INBOX AGENTES */}
                {viewState === 'INBOX' && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                    <div className="text-center py-4">
                        <h3 className="text-lg text-white font-light animate-pulse">3 AGENTES DETECTADOS</h3>
                        <p className="text-[10px] text-emerald-400 font-mono">MATCH SCORE: 98%</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-amber-500/50 p-5 rounded-xl relative overflow-hidden group hover:border-amber-400 transition-colors cursor-pointer">
                        <div className="absolute top-0 right-0 p-2 bg-amber-500 text-black text-[9px] font-bold">PARTNER GOLD</div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold border border-amber-500">AS</div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Alexander Stark</h4>
                                <p className="text-[10px] text-white/50">International Realty</p>
                            </div>
                        </div>
                        <p className="text-xs text-white/80 italic mb-4">"Su inversión en video y dron es perfecta. Tengo compradores en Zúrich listos."</p>
                        <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-amber-500 text-black text-xs font-bold rounded hover:scale-105 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.4)]">ACEPTAR ALIANZA</button>
                            <button className="px-4 py-2 border border-white/20 text-white/40 rounded hover:text-white transition-colors"><X size={14}/></button>
                        </div>
                    </div>
                    <button onClick={() => setViewState('SKILL_TREE')} className="w-full text-[10px] text-white/30 hover:text-white mt-4">VOLVER A CONFIGURACIÓN</button>
                </div>
                )}

            </div>
            </div>
        )}
      </div>
    </div>
  );
};
// ==========================================
// C. STATUS DECK (VERSIÓN ESTÁTICA Y LIMPIA)
// ==========================================
export const StatusDeck = ({ notifications, onClear, clearNotifications, lang, setLang, sound, soundEnabled, toggleSound, t, onOpenChat }) => {
  const handleClear = onClear || clearNotifications;
  const cycleLang = (e) => { e.stopPropagation(); sound?.playClick?.(); const langs = ['ES', 'EN']; setLang(langs[(langs.indexOf(lang) + 1) % langs.length]); };
  
  return (
    <div className="absolute top-24 right-8 z-[9000] pointer-events-auto flex flex-col gap-3 items-end w-[350px]">
      <div className="bg-black/90 backdrop-blur-xl border border-blue-900/30 p-5 rounded-xl w-full shadow-2xl transition-all">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
          <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">SYSTEM STATUS</span>
          <div className="flex gap-2 items-center">
              <span className="text-[9px] font-mono text-blue-500">{lang}</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-[10px] text-white/60 font-mono cursor-pointer hover:text-white" onClick={cycleLang}>
              <span>{t?.status?.lang || "IDIOMA"}</span> <Globe size={10} />
          </div>
          <div className="flex justify-between text-[10px] text-white/60 font-mono cursor-pointer hover:text-white" onClick={toggleSound}>
              <span>{t?.status?.audio || "AUDIO"}</span> <span className={soundEnabled ? "text-emerald-400" : "text-gray-500"}>{soundEnabled ? 'ON' : 'OFF'}</span>
          </div>
        </div>
        
        {notifications && notifications.length > 0 && (
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                {notifications.map((notif, i) => (
                    <div key={i} className="bg-white/5 p-3 rounded border-l-2 border-blue-500">
                        <div className="text-[10px] font-bold text-blue-400 mb-1 uppercase tracking-wider">{notif.title}</div>
                        <div className="text-[10px] text-white/80 leading-snug">{notif.desc}</div>
                    </div>
                ))}
                <button onClick={handleClear} className="mt-2 w-full py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 text-[9px] font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2">
                    <Trash2 size={12}/> BORRAR LOGS
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// D. THE VAULT (VERSIÓN ORIGINAL - GRID COMPLETO)
// ==========================================
export const TheVault = ({ favorites, onClose, removeFromFavs, onRemove, onToggle, toggleFavorite, onFlyTo, t, sound }) => {
  const handleRemove = removeFromFavs || onRemove || onToggle || toggleFavorite;
  const totalValue = favorites?.reduce((acc, curr) => acc + (curr.price || 0), 0) || 0;
  
  // Si no hay imágenes reales, usamos fallback
  const getImage = (fav) => fav.image || fav.photoUrl || LUXURY_IMAGES[0];

  return (
    <div className="fixed inset-0 z-[55000] bg-[#050505] animate-fade-in flex flex-col">
        {/* CABECERA NEGRA */}
        <div className="flex justify-between items-end p-12 border-b border-white/10 bg-black">
            <div>
                <h2 className="text-4xl font-light text-white tracking-[0.2em] uppercase mb-2">FAVORITOS</h2>
                <p className="text-xs font-mono text-white/40">{favorites?.length || 0} PROPIEDADES // PORTFOLIO</p>
            </div>
            <div className="text-right mr-12">
                <span className="block text-[10px] text-white/40 font-mono tracking-wider uppercase">VALOR CARTERA</span>
                <span className="block text-5xl font-light tracking-tighter text-blue-600">
                    €{new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(totalValue)}
                </span>
            </div>
            <button className="absolute top-8 right-8 p-3 bg-white/5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all" onClick={(e) => { e.stopPropagation(); sound?.playClick?.(); onClose(); }}>
                <X size={24} />
            </button>
        </div>

        {/* GRID OSCURO */}
        <div className="flex-grow overflow-y-auto p-12 bg-[#080808] custom-scrollbar">
            {(!favorites || favorites.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20 gap-6">
                    <Layers size={80} strokeWidth={0.5} />
                    <span className="font-mono text-sm tracking-[0.3em] uppercase opacity-50">SIN ACTIVOS EN SEGURIDAD</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {favorites.map((fav) => (
                        <div key={fav.id} className="group bg-[#111] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300">
                            {/* FOTO */}
                            <div className="relative h-64 overflow-hidden cursor-pointer bg-black" onClick={() => { sound?.playDeploy?.(); onFlyTo && onFlyTo(fav.location); onClose(); }}>
                                <img src={getImage(fav)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" alt="" />
                                <div className="absolute top-3 right-3 bg-black/80 px-2 py-1 rounded border border-white/10">
                                    <span className="text-xs text-white font-mono">€{fav.price?.toLocaleString()}</span>
                                </div>
                            </div>
                            {/* INFO */}
                            <div className="p-5">
                                <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-1">{fav.tier || "PREMIUM"}</h3>
                                <p className="text-[10px] text-white/40 font-mono mb-4">ID: {fav.id}</p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <button className="text-[10px] font-bold tracking-widest text-blue-500 hover:text-white transition-colors uppercase" onClick={() => { sound?.playDeploy?.(); onFlyTo && onFlyTo(fav.location); onClose(); }}>
                                        VER
                                    </button>
                                    <button className="text-white/20 hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); sound?.playClick?.(); handleRemove && handleRemove(fav); }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

// ==========================================
// E. COMMAND CENTER (BARRA LATERAL EMERGENTE ORIGINAL)
// ==========================================
export const CommandCenterPanel = ({ property, onClose, onContactAgent, onToggleFavorite, toggleFavorite, onFav, setFavorite, isFavorite, t, sound }) => {
    if (!property) return null;
    
    // Fallbacks para datos
    const getImage = () => property.image || property.photoUrl || LUXURY_IMAGES[0];
    const getPrice = () => property.price || property.precio || 0;
    const tierColor = TIER_COLORS[property.tier]?.hex || CORPORATE_BLUE;

    return (
        <div className="fixed inset-y-0 right-0 w-[500px] bg-[#050505] border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] z-[11000] animate-slide-left flex flex-col">
            
            {/* CABECERA IMAGEN */}
            <div className="relative h-80 w-full shrink-0">
                <img src={getImage()} className="w-full h-full object-cover opacity-80" alt={property.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
                
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/50 rounded-full text-white/50 hover:text-white transition-all z-50">
                    <X size={20} />
                </button>
                
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: tierColor}}></div>
                        <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">{property.tier || "HIGH_CLASS"} RANGO</span>
                    </div>
                    <div className="text-5xl font-light text-white tracking-tighter">
                        {typeof getPrice() === 'number' ? (getPrice()/1000).toFixed(0) + 'k €' : getPrice()}
                    </div>
                    <div className="text-right text-[10px] font-mono text-purple-500 mt-1 uppercase">ASSET ID: {property.id}</div>
                </div>
            </div>

            {/* CUERPO DE DATOS (GRAFICAS Y METRICAS) */}
            <div className="p-8 flex-grow overflow-y-auto custom-scrollbar flex flex-col gap-6 bg-[#050505]">
                
                {/* GRÁFICO TENDENCIA */}
                <div className="bg-[#0a0a0a] border border-white/5 p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={12}/> TENDENCIA MERCADO (5 AÑOS)
                        </h3>
                        <span className="text-[10px] font-mono text-emerald-500">+12.5% vs 2023</span>
                    </div>
                    {/* SVG SIMPLIFICADO DE CURVA */}
                    <div className="h-20 w-full relative">
                         <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                            <path d="M0,35 Q20,30 40,32 T60,20 T80,25 T100,5" fill="none" stroke={tierColor} strokeWidth="1.5" />
                            <path d="M0,35 Q20,30 40,32 T60,20 T80,25 T100,5 V40 H0 Z" fill={tierColor} stroke="none" opacity="0.2" />
                         </svg>
                    </div>
                </div>

                {/* GRID DE ICONOS */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { val: property.area || property.specs?.area || 225, label: "M²", icon: Maximize2 },
                        { val: property.rooms || property.specs?.beds || 4, label: "HAB", icon: User },
                        { val: property.baths || property.specs?.baths || 3, label: "BAÑOS", icon: Zap }
                    ].map((item, i) => (
                        <div key={i} className="bg-[#0a0a0a] border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center h-20">
                            <div className="text-xl font-light text-white">{item.val}</div>
                            <div className="text-[9px] text-white/30 uppercase mt-1">{item.label}</div>
                        </div>
                    ))}
                </div>

                {/* CALCULADORA / FINANCIERA (DESGLOSE COSTES) */}
                <div className="flex gap-4 h-48">
                    {/* DONUT CHART */}
                    <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center relative">
                         <div className="text-[9px] text-white/30 uppercase absolute top-3 left-3">DESGLOSE COSTES</div>
                         <div className="relative w-20 h-20 flex items-center justify-center my-2">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#222" strokeWidth="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={tierColor} strokeWidth="3" strokeDasharray="20, 100" />
                            </svg>
                            <div className="absolute text-center">
                                <div className="text-[8px] text-white/50">CAPITAL</div>
                                <div className="text-xs font-bold text-white">20%</div>
                            </div>
                         </div>
                    </div>
                    {/* VALORACIÓN */}
                    <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                             <div className="text-[9px] text-white/30 uppercase">VALORACIÓN</div>
                             <div className="px-1.5 py-0.5 bg-emerald-900/30 text-emerald-500 text-[8px] rounded border border-emerald-900">LIVE DATA</div>
                        </div>
                        <div>
                            <div className="text-[9px] text-white/40 uppercase">RENTABILIDAD</div>
                            <div className="text-2xl text-emerald-500 font-light">6.8%</div>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                            <div className="text-[9px] text-white/30 uppercase">CUOTA HIPOTECA</div>
                            <div className="text-sm text-white font-mono">4.430 €</div>
                        </div>
                    </div>
                </div>

                {/* BOTÓN CONTACTAR GRANDE */}
                <button 
                    onClick={onContactAgent}
                    className="w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] rounded hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mt-auto"
                >
                    CONTACTAR AGENTE <Phone size={14}/>
                </button>
            </div>
        </div>
    );
};

// ==========================================
// F. CHAT PANEL (STANDARD)
// ==========================================
export const ChatPanel = ({ t, sound, onClose, context }) => {
    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState("");
    
    useEffect(() => {
        if (context) { 
            setMsgs([{id: 0, role: 'agent', text: `Hola, veo que le interesa ${context.title}. ¿Desea agendar una visita privada?`}]); 
        } else { 
            setMsgs([{id: 0, role: 'agent', text: "En qué puedo ayudarle?"}]); 
        }
    }, [context]);

    const handleSend = () => { 
        if(!input.trim()) return; 
        sound?.playClick?.(); 
        setMsgs([...msgs, {id: Date.now(), role: 'user', text: input}]); 
        setInput(""); 
        setTimeout(() => { sound?.playPing?.(); setMsgs(prev => [...prev, {id: Date.now()+1, role: 'agent', text: "Mensaje recibido. Un agente le contactará."}]); }, 1000); 
    };

    return (
        <div className="fixed bottom-28 right-8 w-80 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[10001] animate-fade-in-up">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#111]">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-xs font-bold text-white">IA CONCIERGE</span></div>
                <button onClick={onClose}><X size={14} className="text-white/50 hover:text-white"/></button>
            </div>
            <div className="h-64 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                {msgs.map(m => (<div key={m.id} className={`max-w-[85%] p-3 rounded-xl text-xs ${m.role === 'user' ? 'text-white border border-white/20 self-end' : 'bg-white/5 text-white/80 border border-white/5 self-start'}`}>{m.text}</div>))}
            </div>
            <div className="p-3 border-t border-white/10 flex gap-2">
                <input className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-white/30" placeholder="Escriba un mensaje..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
                <button onClick={handleSend} className="hover:text-white text-blue-500"><Send size={14}/></button>
            </div>
        </div>
    );
};

// ==============================================================
// 🎮 FRAGMENTO 3: CONTROLADOR CENTRAL (REEMPLAZAR UIPANELS)
// ==============================================================
export default function UIPanels({ 
  onSearch, onToggleFavorite, favorites, onFlyTo,
  lang, setLang, soundEnabled, toggleSound,
  sound 
}) {
  const [systemMode, setSystemMode] = useState('GATEWAY'); // 'GATEWAY' | 'EXPLORER' | 'ARCHITECT'
  const [gateUnlocked, setGateUnlocked] = useState(false); 
  
  // ESTADOS CINEMÁTICOS DE LA BARRA INFERIOR
  // 'NONE' = Mapa Limpio | 'AI_PANEL' = Cerebro | 'FILTERS' = Filtros
  const [activePanel, setActivePanel] = useState('NONE'); 
  const [activeProperty, setActiveProperty] = useState(null); // Propiedad seleccionada
  const [notifications, setNotifications] = useState([]);

  // Lógica de intercambio (Kill Switch: uno mata al otro)
  const toggleAI = () => {
    sound?.playClick?.();
    setActivePanel(prev => prev === 'AI_PANEL' ? 'NONE' : 'AI_PANEL');
  };
  const toggleFilters = () => {
    sound?.playClick?.();
    setActivePanel(prev => prev === 'FILTERS' ? 'NONE' : 'FILTERS');
  };
  const openChat = () => { sound?.playClick?.(); setActivePanel('CHAT'); };
  const openProfile = () => { sound?.playClick?.(); setActivePanel('PROFILE'); };

  // 0. GATEKEEPER (Mantenemos su seguridad)
  if (!gateUnlocked) { 
      return <Gatekeeper onUnlock={() => setGateUnlocked(true)} t={{gatekeeper: {btn: "INITIALIZE", access: "ACCESS GRANTED"}}} sound={sound} />;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-end pb-8">
       
       {/* 1. SISTEMAS HEREDADOS (No tocar) */}
       <style dangerouslySetInnerHTML={{__html: `.mapboxgl-ctrl-bottom-left .mapboxgl-ctrl-group, .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-group, .mapboxgl-ctrl-compass, .mapboxgl-ctrl-attrib { display: none !important; }`}} />
       
       {/* 2. MODO GATEWAY (Selección Inicial) */}
       {systemMode === 'GATEWAY' && <DualGateway onSelectMode={setSystemMode} sound={sound} />}

       {/* 3. MODO ARQUITECTO (Vendedor Clásico) */}
       {systemMode === 'ARCHITECT' && <ArchitectHud sound={sound} onCloseMode={() => setSystemMode('GATEWAY')} />}

       {/* 4. MODO EXPLORADOR (NUEVA INTERFAZ POTENCIADA) */}
       {systemMode === 'EXPLORER' && (
         <>
            {/* HUD ESTADO (Derecha Arriba) */}
            <div className="pointer-events-auto relative z-50">
               <StatusDeck 
                  notifications={notifications} 
                  clearNotifications={() => setNotifications([])}
                  lang={lang} setLang={setLang} sound={sound} 
                  soundEnabled={soundEnabled} toggleSound={toggleSound}
                  t={{status: {lang: "IDIOMA", audio: "SONIDO"}}}
               />
               <TopBar onGPS={() => console.log('GPS')} />
               <ViewControlDock onViewChange={(v) => console.log(v)} sound={sound} currentView={{is3D: true, mode: 'dawn'}} t={{}}/>
            </div>

            {/* OVERLAYS FULLSCREEN (Vault, Detalles, Profile) */}
            <div className="pointer-events-auto">
                {activePanel === 'VAULT' && <TheVault favorites={favorites} onClose={() => setActivePanel('NONE')} onFlyTo={onFlyTo} sound={sound} />}
                {activeProperty && <CommandCenterPanel property={activeProperty} onClose={() => setActiveProperty(null)} onContactAgent={openChat} sound={sound} />}
                {activePanel === 'CHAT' && <ChatPanel onClose={() => setActivePanel('NONE')} context={activeProperty} sound={sound} />}
                {activePanel === 'PROFILE' && <ProfileDashboard onClose={() => setActivePanel('NONE')} sound={sound} />}
            </div>

            {/* ZONA DE LEVITACIÓN (PANELES NUEVOS) */}
            {/* Se muestran aquí, flotando sobre la barra */}
            <div className="pointer-events-auto w-full px-4 flex justify-center items-end mb-12 min-h-[420px]">
               {activePanel === 'AI_PANEL' && <AIArchitectPanel onClose={() => setActivePanel('NONE')} sound={sound} />}
               {activePanel === 'FILTERS' && <SmartFiltersPanel onClose={() => setActivePanel('NONE')} sound={sound} />}
            </div>

            {/* OMNI-BAR CINEAMÁTICA (Control Inferior) */}
            <OmniSearchDock 
               onSearch={onSearch} 
               toggleFilters={toggleFilters} 
               toggleAI={toggleAI} 
               activePanel={activePanel} 
               setActiveTab={(tab) => {
                   if (tab === 'vault') setActivePanel('VAULT');
                   else if (tab === 'chat') setActivePanel('CHAT');
                   else setActivePanel('NONE');
               }}
               onOpenProfile={openProfile}
               sound={sound} 
           />

            {/* BOTÓN CAMBIAR MODO (Inferior Izquierda) */}
            <div className="fixed bottom-[30px] left-[70px] z-[9999] pointer-events-auto">
              <button
                onClick={() => setSystemMode('GATEWAY')}
                className="group flex items-center gap-3 px-5 py-2.5 bg-black/90 backdrop-blur-xl border border-white/10 hover:border-white/30 rounded-full shadow-2xl transition-all hover:scale-105"
              >
                <Navigation size={14} className="group-hover:-rotate-45 transition-transform text-white/70 group-hover:text-white" />
                <span className="text-[11px] font-mono font-medium tracking-[0.15em] text-white/90 group-hover:text-white">CHANGE MODE</span>
              </button>
            </div>
         </>
       )}
    </div>
  );
}

