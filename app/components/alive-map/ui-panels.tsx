// @ts-nocheck
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  // --- NAVEGACIÓN Y GENERAL ---
  MapPin, X, Heart, Search, Mic, Layers, Settings, 
  Maximize2, ArrowRight, Menu, Bell, Globe, ShieldCheck,
  MessageSquare, User, Crosshair, Send, Navigation, ChevronRight, Play,
  SlidersHorizontal, MicOff, Activity, Zap, Image as ImageIcon,
  TrendingUp, DollarSign, BarChart3, Target, Phone, Trash2,
  Box, Square, Moon, Sun, Mountain,
  
  // --- MODULOS AVANZADOS (V2) ---
  Music, BookOpen, Briefcase, Award, Camera, FileText,
  ChevronUp, Sparkles, ChevronLeft,

  // --- MODO ARQUITECTO / VENDEDOR ---
  Building, Radar, CheckCircle, Smartphone, Upload, CreditCard
} from 'lucide-react';

// --- IMPORTACIÓN DE DATOS Y UTILIDADES ---
import { CORPORATE_BLUE, NEON_GLOW, TEXT_COLOR } from '../../components/alive-map/data';
import { getPropertyTier, TIER_CONFIG } from '../../components/alive-map/property-tiers'; 

// --- CONSTANTES VISUALES ---
export const LUXURY_IMAGES = [
    "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

export const TIER_COLORS = {
    SMART: { hex: "#10b981", glow: "0 0 15px rgba(16, 185, 129, 0.8)" },   
    PREMIUM: { hex: "#2563eb", glow: "0 0 20px rgba(37, 99, 235, 0.8)" }, 
    HIGH_CLASS: { hex: "#d946ef", glow: "0 0 20px rgba(217, 70, 239, 0.8)" } 
};

// ==========================================
// 1. GATEKEEPER (Pantalla de Carga)
// ==========================================
export const Gatekeeper = ({ onUnlock, t, sound }) => {
    const [status, setStatus] = useState('LOCKED'); 
    const handleAccess = () => { 
        sound?.playBoot(); 
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
                        onMouseEnter={() => sound?.playHover()}
                    >
                        {t.gatekeeper.btn}
                    </button>
                )}
                {status === 'GRANTED' && (
                    <div className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">
                        {t.gatekeeper.access}
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
    // Estilos base para el contenedor (Caja Negra)
    // Reducimos padding y aseguramos fondo oscuro
    const dockBaseClass = "bg-[#080808]/95 backdrop-blur-xl border border-white/10 p-1.5 rounded-xl shadow-2xl flex flex-col gap-1.5 ring-1 ring-white/5";

    // Función para generar clases del botón (Lógica de estado)
    const getBtnClass = (isActive) => {
        // TAMAÑO FIJO: w-9 h-9 (36px) para evitar que se expandan
        const base = "w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300"; 
        
        if (isActive) {
            // ACTIVO: Azul Corporativo + Brillo Neón + Borde sutil
            return `${base} bg-[#2563eb] text-white shadow-[0_0_15px_rgba(37,99,235,0.6)] border border-blue-400/30`;
        }
        
        // INACTIVO: Fondo gris muy tenue (bg-white/5) para diferenciarse de la caja negra
        return `${base} bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-transparent`;
    };

    return (
        <div className="absolute top-1/2 -translate-y-1/2 left-6 z-[9000] flex flex-col gap-3 pointer-events-auto">
            
            {/* GRUPO 1: VISTA (3D / 2D) */}
            <div className={dockBaseClass}>
                <button 
                    onClick={() => { sound?.playClick(); onViewChange('3D'); }} 
                    className={getBtnClass(currentView.is3D)}
                    title="Modo 3D"
                >
                    <Box size={16} strokeWidth={2.5} />
                </button>
                <button 
                    onClick={() => { sound?.playClick(); onViewChange('2D'); }} 
                    className={getBtnClass(!currentView.is3D)}
                    title="Modo 2D"
                >
                    <Square size={16} strokeWidth={2.5} />
                </button>
            </div>

            {/* GRUPO 2: LUZ (DÍA / NOCHE) */}
            <div className={dockBaseClass}>
                <button 
                    onClick={() => { sound?.playClick(); onViewChange('MODE_DUSK'); }} 
                    className={getBtnClass(currentView.mode === 'dusk')}
                    title="Modo Noche"
                >
                    <Moon size={16} strokeWidth={2.5} />
                </button>
                <button 
                    onClick={() => { sound?.playClick(); onViewChange('MODE_DAWN'); }} 
                    className={getBtnClass(currentView.mode === 'dawn')}
                    title="Modo Día"
                >
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

// --- [AQUÍ ELIMINAMOS STATUS DECK] ---

export const FilterPanel = ({ filters, setFilters, onClose, t, sound }) => {
    const formatMoney = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
    return (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xl z-[10001] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold tracking-widest" style={{color: TEXT_COLOR}}>{t.filters.title}</h3>
                <button onClick={onClose}><X size={16} className="text-white/50 hover:text-white"/></button>
            </div>
            <div className="mb-4">
                <div className="flex justify-between text-[10px] text-white/60 mb-2"><span>{t.filters.price}</span><span style={{color: CORPORATE_BLUE}} className="font-mono">{formatMoney(filters.maxPrice)}</span></div>
                <input type="range" min="100000" max="2000000" step="50000" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" style={{accentColor: CORPORATE_BLUE}} />
            </div>
            <div className="mb-6">
                <div className="flex justify-between text-[10px] text-white/60 mb-2"><span>{t.filters.area}</span><span style={{color: CORPORATE_BLUE}} className="font-mono">{filters.minArea} m²</span></div>
                <input type="range" min="0" max="500" step="10" value={filters.minArea} onChange={(e) => setFilters({...filters, minArea: Number(e.target.value)})} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" style={{accentColor: CORPORATE_BLUE}} />
            </div>
            <div className="flex gap-2 mb-4">
                {['ALL', 'CASA', 'PISO'].map(type => (
                    <button key={type} onClick={() => { sound?.playClick(); setFilters({...filters, type}); }} className={`flex-1 py-2 text-[10px] font-bold rounded border transition-colors ${filters.type === type ? 'text-white border-transparent' : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'}`} style={filters.type === type ? {backgroundColor: CORPORATE_BLUE, boxShadow: NEON_GLOW} : {}}>{type === 'ALL' ? 'TODO' : type}</button>
                ))}
            </div>
        </div>
    );
};
// ==========================================
// 5. OMNI SEARCH DOCK (IA & CONTROLES)
// ==========================================

export const OmniSearchDock = ({ onSearch, setActiveTab, activeTab, toggleFilters, t, sound, addNotification }) => {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiStep, setAiStep] = useState(1); 

  const handleSearchSubmit = () => { sound?.playClick(); onSearch(query); };
  
  const handleMic = () => {
      if (typeof window !== 'undefined' && !('webkitSpeechRecognition' in window)) { 
          addNotification("INFO", "Voice module not supported"); 
          return; 
      }
      if (isListening) { setIsListening(false); return; }
      
      if (typeof window !== 'undefined') {
          const recognition = new window.webkitSpeechRecognition();
          recognition.lang = 'es-ES'; 
          recognition.interimResults = false; 
          recognition.maxAlternatives = 1;
          
          recognition.onstart = () => { setIsListening(true); sound?.playDeploy(); };
          recognition.onend = () => { setIsListening(false); };
          recognition.onresult = (event) => { 
              const transcript = event.results[0][0].transcript; 
              setQuery(transcript); 
              sound?.playPing(); 
              onSearch(transcript); 
          };
          recognition.start();
      }
  };

  const handleExpandToggle = () => { sound?.playClick(); setIsExpanded(!isExpanded); if(!isExpanded) setAiStep(1); };
  const nextStep = () => { sound?.playClick(); setAiStep(prev => Math.min(prev + 1, 4)); };
  const prevStep = () => { sound?.playClick(); setAiStep(prev => Math.max(prev - 1, 1)); };

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-4xl px-4 flex flex-col items-center group/dock">
        
        {/* PANEL EXPANDIBLE DE IA (AI ARCHITECT) */}
        <div className={`absolute w-[98%] bg-[#050505]/80 backdrop-blur-3xl border border-white/10 rounded-2xl transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1) origin-bottom -z-10 flex flex-col overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)] ${isExpanded ? 'bottom-[95%] h-80 opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'bottom-0 h-20 opacity-0 scale-90 translate-y-10 pointer-events-none'}`}>
            <div className="w-full h-[2px] bg-white/5">
                <div className="h-full bg-blue-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ width: `${(aiStep / 4) * 100}%` }}></div>
            </div>
            
            <div className="flex justify-between items-center p-6 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-blue-400 animate-pulse" />
                    <span className="text-white/60 font-mono text-xs tracking-[0.2em] uppercase">
                        {aiStep === 1 && "AI ARCHITECT // LIFESTYLE"}
                        {aiStep === 2 && "AI ARCHITECT // CAPITAL"}
                        {aiStep === 3 && "AI ARCHITECT // SPECS"}
                        {aiStep === 4 && "AI ARCHITECT // SYNCHRONIZING"}
                    </span>
                </div>
                <button onClick={handleExpandToggle} className="text-white/30 hover:text-white transition-colors"><X size={16} /></button>
            </div>

            <div className="p-6 h-full text-white/80 relative">
                {aiStep === 1 && (
                    <div className="h-full flex flex-col justify-center gap-6 animate-fade-in">
                        <h3 className="text-2xl font-light tracking-wide text-center">¿Cuál es su visión de vida?</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {['URBAN PRIME', 'NATURALEZA', 'INVERSIÓN'].map(label => (
                                <button key={label} onClick={nextStep} className="h-24 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all flex flex-col items-center justify-center gap-2 group">
                                    <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-blue-400"></div>
                                    <span className="text-xs font-mono tracking-widest">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {aiStep === 2 && (
                    <div className="h-full flex flex-col justify-center gap-6 animate-fade-in">
                        <h3 className="text-2xl font-light tracking-wide text-center">Defina su Capital Objetivo</h3>
                        <div className="px-10">
                            <input type="range" min="200" max="5000" step="100" className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                            <div className="flex justify-between mt-4 font-mono text-blue-300"><span>€200k</span><span>€5M+</span></div>
                        </div>
                        <div className="flex justify-center mt-4">
                            <button onClick={nextStep} className="px-8 py-3 bg-blue-600 rounded-lg text-xs font-bold tracking-widest hover:bg-blue-500 shadow-lg transition-all">CONFIRMAR RANGO</button>
                        </div>
                    </div>
                )}

                {aiStep === 3 && (
                    <div className="h-full flex flex-col justify-center gap-6 animate-fade-in">
                        <h3 className="text-2xl font-light tracking-wide text-center">Detalles Esenciales</h3>
                        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto w-full">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-[10px] uppercase text-white/40 block mb-2">Dormitorios</span>
                                <div className="flex gap-2">{[1, 2, 3, '4+'].map(n => <button key={n} className="w-8 h-8 rounded bg-black border border-white/10 text-xs hover:border-blue-500 hover:text-blue-400 transition-colors">{n}</button>)}</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-[10px] uppercase text-white/40 block mb-2">Extras</span>
                                <div className="flex flex-wrap gap-2">{['Terraza', 'Piscina', 'Gym'].map(t => <button key={t} className="px-3 py-1 rounded bg-black border border-white/10 text-[10px] hover:border-blue-500 hover:text-blue-400 transition-colors">{t}</button>)}</div>
                            </div>
                        </div>
                        <div className="flex justify-center mt-2">
                            <button onClick={nextStep} className="px-8 py-3 bg-white text-black rounded-lg text-xs font-bold tracking-widest hover:bg-gray-200 shadow-lg transition-all">INICIAR ANÁLISIS</button>
                        </div>
                    </div>
                )}

                {aiStep === 4 && (
                    <div className="h-full flex flex-col items-center justify-center animate-fade-in relative">
                        <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full"></div>
                        <Activity size={48} className="text-blue-400 animate-pulse mb-6 relative z-10" />
                        <h3 className="text-xl font-light tracking-widest mb-2 relative z-10">ANALIZANDO MERCADO</h3>
                        <p className="text-[10px] font-mono text-white/40 relative z-10">PROCESANDO 14,032 PUNTOS DE DATA...</p>
                    </div>
                )}
            </div>
            
            {aiStep > 1 && aiStep < 4 && (
                <button onClick={prevStep} className="absolute bottom-6 left-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <ChevronLeft size={16} />
                </button>
            )}
        </div>

        {/* BARRA PRINCIPAL (INPUT + ICONOS) */}
        <div className="relative z-20 pointer-events-auto bg-[#080808]/90 backdrop-blur-3xl border border-white/10 rounded-full p-3 px-6 flex items-center justify-between shadow-2xl gap-4 w-full ring-1 ring-white/5">
          <div className="flex-grow flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] text-white px-5 py-4 rounded-full transition-all duration-500 group border border-white/5 hover:border-white/10 focus-within:border-blue-500/30 focus-within:bg-white/[0.05]">
              <Search size={18} className="text-white/40 group-hover:text-white transition-colors" />
              <input 
                  type="text" 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()} 
                  placeholder={t.searchPlaceholder || "Design your search..."} 
                  className="bg-transparent border-none outline-none text-sm text-white/90 placeholder-white/30 w-full font-light tracking-wide" 
              />
              <button onClick={handleMic} className={`p-1.5 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500/10 text-red-400 animate-pulse' : 'text-white/30 hover:text-white'}`}>
                  {isListening ? <MicOff size={16}/> : <Mic size={16}/>}
              </button>
          </div>
          
          <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
          
          <div className="flex items-center gap-2">
              <button onClick={() => { sound?.playClick(); toggleFilters(); }} className="p-3.5 bg-transparent hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-all border border-transparent hover:border-white/10" title="Filters">
                  <SlidersHorizontal size={20} />
              </button>
              <button 
                  onClick={handleExpandToggle} 
                  className={`p-3.5 rounded-full transition-all duration-500 relative ${isExpanded ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] rotate-180' : 'bg-white/5 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 rotate-0 border border-blue-500/20'}`} 
                  title="AI Architect Mode"
              >
                  <ChevronUp size={20} strokeWidth={2.5} />
              </button>
          </div>
          
          <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
          
          <div className="flex items-center gap-2">
              {[
                  { id: 'map', icon: MapPin }, 
                  { id: 'vault', icon: Heart }, 
                  { id: 'chat', icon: MessageSquare }, 
                  { id: 'profile', icon: User }
              ].map((item) => (
                  <button 
                      key={item.id} 
                      onClick={() => { sound?.playClick(); setActiveTab(item.id); }} 
                      className={`p-3.5 rounded-full transition-all duration-300 relative group ${activeTab === item.id ? 'text-white bg-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  >
                      <item.icon size={20} strokeWidth={activeTab === item.id ? 2 : 1.5} />
                  </button>
              ))}
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
        onToggleFavorite(props); 
        sound?.playPing(); 
    };

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
                  <span className="text-xs text-white/70">{props.rooms} {t.specs.bed} • {props.area} {t.specs.sqm}</span>
              </div>
          </div>
          <div className="w-full">
             <button className="w-full py-3 rounded-lg text-white text-[10px] font-bold tracking-wider transition-colors flex items-center justify-center gap-1 hover:opacity-90 shadow-lg" style={{backgroundColor: tierColor, boxShadow: tierGlow}} onClick={() => { sound?.playDeploy(); onOpenDetail(props); }}>
                 {t.panel.contact} <ArrowRight size={12} />
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

    const INCOMING_CAMPAIGNS = [ 
        { id: 'm1', agency: 'Engel & Völkers', type: 'FULL MARKET LAUNCH', budget: 2400, reqs: ['Drone', 'Global', 'Ads'], status: 'PENDING' }, 
        { id: 'm2', agency: 'Keller Williams', type: 'FLASH SALE', budget: 850, reqs: ['Photo', 'Portal'], status: 'URGENT' } 
    ];

    const toggleService = (id) => { 
        sound?.playClick(); 
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
                            { id: 'CAMPAIGNS', icon: Briefcase, label: 'OPORTUNIDADES' }, 
                            { id: 'CERTIFICATIONS', icon: Award, label: 'PARTNER TIER' } 
                        ].map(tab => (
                            <button key={tab.id} onClick={() => { sound?.playClick(); setActiveTab(tab.id); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[10px] font-bold tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
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
                                {activeTab === 'CAMPAIGNS' && 'Colaboraciones Activas'}
                                {activeTab === 'CERTIFICATIONS' && 'Estatus & Certificaciones'}
                            </h1>
                            <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.2em]">
                                {activeTab === 'OVERVIEW' && `Nivel Actual: ${stats.tier}`}
                                {activeTab === 'SERVICES' && 'Seleccione activos para potenciar su portfolio.'}
                                {activeTab === 'CAMPAIGNS' && 'Solicitudes de agencias premium en tiempo real.'}
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
                                    <button onClick={() => { sound?.playDeploy(); alert('Procesando orden de compra...'); }} className="px-8 py-3 bg-white hover:bg-gray-200 text-black font-bold text-xs rounded-lg shadow-lg transition-all transform hover:scale-105 tracking-widest uppercase">Confirmar Orden</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* VISTA CAMPAIGNS */}
                    {activeTab === 'CAMPAIGNS' && (
                        <div className="space-y-4 animate-slide-left">
                            {INCOMING_CAMPAIGNS.map(camp => (
                                <div key={camp.id} className="bg-[#0f0f0f] border border-white/5 p-6 rounded-2xl hover:border-l-4 hover:border-l-blue-500 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:text-white transition-colors font-serif italic">{camp.agency.charAt(0)}</div>
                                            <div><h3 className="text-white font-medium text-lg">{camp.agency}</h3><span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest">{camp.type}</span></div>
                                        </div>
                                        <div className="text-right"><div className="text-xl text-white font-light">€{camp.budget}</div><span className="text-[9px] text-white/30 uppercase">Presupuesto</span></div>
                                    </div>
                                    <div className="bg-black/20 p-4 rounded-xl mb-4 border border-white/5">
                                        <p className="text-[10px] text-white/40 mb-3 uppercase tracking-wider">Requisitos del Proyecto:</p>
                                        <div className="flex gap-2">{camp.reqs.map(r => (<span key={r} className="px-3 py-1 bg-white/5 text-white/80 rounded-full text-[10px] border border-white/5">{r}</span>))}</div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="flex-1 py-3 bg-white text-black font-bold text-xs rounded-lg hover:bg-gray-200 transition-colors uppercase tracking-widest">Aceptar Propuesta</button>
                                        <button className="px-6 py-3 border border-white/10 text-white/40 rounded-lg hover:text-white hover:border-white/30 transition-colors text-xs uppercase">Declinar</button>
                                    </div>
                                </div>
                            ))}
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
        sound?.playClick(); 
        console.log('Propiedad lista:', { price, description, energyCert, tierName }); 
        onClose(); 
    };

    const inputClass = "w-full bg-white/5 border border-white/10 p-2 text-sm text-white/90 rounded-md focus:ring-1 transition-all";
    const sectionClass = "mb-6 p-4 border border-white/10 rounded-xl bg-black/50";

    return (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center backdrop-blur-sm animate-fade-in-up" onClick={onClose}>
            <div className="w-[600px] h-[80vh] bg-black/90 border border-white/20 rounded-2xl shadow-3xl overflow-y-auto custom-scrollbar p-6" onClick={(e) => e.stopPropagation()}>
                
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10 sticky top-0 bg-black/90 z-10">
                    <h2 className="text-xl font-bold tracking-widest uppercase" style={{color: tierColor}}>{t.form.title} | {tierName}</h2>
                    <button onClick={onClose} className="p-2 text-white/50 hover:text-red-500 transition-colors"><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className={sectionClass}>
                        <div className="flex items-center gap-2 mb-3 text-white font-mono uppercase" style={{color: tierColor}}><DollarSign size={16} /> {t.form.section_price}</div>
                        <label className="block mb-4">
                            <span className="text-xs text-white/60 mb-1 block">{t.form.label_price} (€)</span>
                            <input type="number" value={price} onChange={handlePriceChange} className={inputClass} placeholder="Ej: 450000" />
                        </label>
                        <div className="p-3 rounded-lg flex items-center justify-center text-sm font-bold mt-4" style={{ backgroundColor: `${tierColor}20`, border: `1px solid ${tierColor}` }}>
                            {t.form.assigned_tier}: <span className="ml-2 font-mono" style={{color: tierColor}}>{tierName}</span>
                        </div>
                    </div>
                    
                    <div className={sectionClass}>
                        <div className="flex items-center gap-2 mb-3 text-white font-mono uppercase"><Zap size={16} style={{color: tierColor}}/> {t.form.section_energy}</div>
                        <label className="block mb-4">
                            <span className="text-xs text-white/60 mb-1 block">{t.form.label_certificate}</span>
                            <select value={energyCert} onChange={(e) => setEnergyCert(e.target.value)} className={inputClass}>
                                <option value="NOT_APPLY">En Trámite / No Aplica</option>
                                {['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'].map(cert => (<option key={cert} value={cert}>{cert}</option>))}
                            </select>
                        </label>
                    </div>
                    
                    <div className={sectionClass}>
                        <div className="flex items-center gap-2 mb-3 text-white font-mono uppercase"><FileText size={16} style={{color: tierColor}}/> {t.form.section_details}</div>
                        <label className="block mb-4">
                            <span className="text-xs text-white/60 mb-1 block">{t.form.label_description}</span>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass + " h-24"} placeholder={t.form.placeholder_description} />
                        </label>
                        <div className="mt-4 p-4 border border-dashed border-white/20 rounded-lg text-center cursor-pointer hover:bg-white/5 transition-colors" onClick={() => alert(t.form.alert_upload_photos)}>
                            <Camera size={20} className="mx-auto text-white/50 mb-1" />
                            <span className="text-xs text-white/60">{t.form.label_upload_photos}</span>
                        </div>
                    </div>
                    
                    <button type="submit" className="w-full py-3 mt-4 text-sm font-bold uppercase tracking-widest rounded-lg transition-all" style={{ backgroundColor: tierColor, color: 'black', boxShadow: `0 4px 15px -5px ${tierColor}`}}>
                        {t.form.submit_button}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ==========================================
// 9. COMPONENTE MAESTRO: UI PANELS (CEREBRO)
// ==========================================

export default function UIPanels({ 
  onSearch, onToggleFavorite, favorites, onFlyTo,
  lang, setLang, soundEnabled, toggleSound,
  sound 
}) {
  const [systemMode, setSystemMode] = useState('GATEWAY'); // 'GATEWAY' | 'EXPLORER' | 'ARCHITECT'
  const [gateUnlocked, setGateUnlocked] = useState(false); 
  const [activeTab, setActiveTab] = useState('map');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({ maxPrice: 2000000, minArea: 100, type: 'ALL' });
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // Diccionario de Textos (Centralizado)
  const t = {
      gatekeeper: { btn: "INITIALIZE SYSTEM", access: "ACCESS GRANTED" },
      status: { lang: "LANGUAGE", audio: "AUDIO", clear: "CLEAR LOGS" },
      filters: { title: "SEARCH PARAMETERS", price: "MAX PRICE", area: "MIN AREA" },
      searchPlaceholder: "Search location, style, price...",
      specs: { bed: "HAB", bath: "BAÑOS", sqm: "M²" },
      panel: { contact: "INITIATE CONTACT" },
      commandPanel: { expand: "EXPAND", finance: "FINANCE", roi: "EST. ROI", down: "DOWN PAYMENT", monthly: "MONTHLY", contact: "REQUEST TOUR" },
      vault: { title: "THE VAULT", items: "ITEMS", totalValue: "TOTAL ASSET VALUE", empty: "NO ASSETS SECURED", view: "FLY TO TARGET" },
      chat: { agent: "AI CONCIERGE", placeholder: "Type your query..." },
      profile: { title: "PARTNER DASHBOARD", rank: "GOLD", missions: "MISSIONS", conquests: "CLOSED DEALS" },
      form: { title: "SUBMIT ASSET", section_price: "VALUATION", label_price: "Price", assigned_tier: "TIER", section_energy: "EFFICIENCY", label_certificate: "Certificate", section_details: "DETAILS", label_description: "Description", placeholder_description: "Tell the story...", alert_upload_photos: "Opening Secure Upload...", label_upload_photos: "DROP RAW FOOTAGE", submit_button: "UPLOAD TO NETWORK" }
  };

  const addNotification = (title, desc, action = null) => { 
      setNotifications(prev => [{ title, desc, action }, ...prev]); 
      sound?.playPing(); 
  };

  // Efecto: Ping de prueba al entrar en modo Explorador
  useEffect(() => {
      if (systemMode === 'EXPLORER') {
          // Simulamos conexión con la red de agentes
          setTimeout(() => {
              // addNotification("SYSTEM", "Conexión satelital establecida.", "CHAT");
          }, 1500);
      }
  }, [systemMode]);

  // 0. GATEKEEPER (PANTALLA DE INICIO)
  if (!gateUnlocked) { 
      return (
        <div className="absolute inset-0 z-[60000] bg-black flex items-center justify-center">
             <button 
                onClick={() => {
                    sound?.playBoot();
                    setGateUnlocked(true); 
                }}
                className="group relative px-8 py-3 bg-white text-black font-bold rounded-full tracking-widest hover:scale-110 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.5)] overflow-hidden"
             >
                <span className="relative z-10">INITIALIZE SYSTEM</span>
                <div className="absolute inset-0 bg-cyan-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"/>
             </button>
        </div>
      );
  }

  // INTERFAZ PRINCIPAL
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-between text-sans">
       
       {/* 1. ESCUDO DE SILENCIO VISUAL (ESTILOS FORZADOS) */}
       {/* Esto ocultará los botones duplicados de Mapbox abajo a la derecha/izquierda */}
       <style dangerouslySetInnerHTML={{__html: `
           .mapboxgl-ctrl-bottom-left .mapboxgl-ctrl-group,
           .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-group,
           .mapboxgl-ctrl-compass,
           .mapboxgl-ctrl-attrib { display: none !important; }
       `}} />
       
       {/* MODO A: SELECCIÓN DE ROL (GATEWAY) */}
       {systemMode === 'GATEWAY' && (
         <DualGateway onSelectMode={setSystemMode} sound={sound} />
       )}

       {/* MODO B: VENDEDOR (ARCHITECT) */}
       {systemMode === 'ARCHITECT' && (
         <ArchitectHud sound={sound} onCloseMode={() => setSystemMode('GATEWAY')} />
       )}

      {/* MODO C: COMPRADOR (EXPLORER) */}
       {systemMode === 'EXPLORER' && (
         <>
            {/* 1. HUD DERECHO: STATUS & NOTIFICACIONES */}
            <div className="pointer-events-auto relative z-50">
                <StatusDeck 
                    notifications={notifications} 
                    clearNotifications={() => { sound?.playClick(); setNotifications([]); }}
                    lang={lang} 
                    setLang={setLang} 
                    sound={sound} 
                    soundEnabled={soundEnabled} 
                    toggleSound={toggleSound} 
                    t={t} 
                    onOpenChat={() => setActiveTab('chat')} 
                    onOpenProfile={() => setActiveTab('profile')} 
                />
            </div>
            
            {/* 2. HUD IZQUIERDO: VISTAS (OPERATIVO) */}
            <div className="pointer-events-auto relative z-50">
                <ViewControlDock 
                    onViewChange={onViewChange}  // <--- ¡Gatillo conectado!
                    currentView={currentView}    // <--- ¡Datos en tiempo real!
                    t={t} 
                    sound={sound} 
                />
            </div>
            
            {/* 3. DOCK CENTRAL: BÚSQUEDA */}
            <div className="pointer-events-auto relative z-50">
                <OmniSearchDock 
                    onSearch={onSearch} 
                    activeTab={activeTab} 
                    setActiveTab={(tab) => {
                        if (activeTab === tab && tab !== 'map') {
                            setActiveTab('map');
                        } else {
                            setActiveTab(tab);
                        }
                    }} 
                    toggleFilters={() => setFiltersVisible(!filtersVisible)} 
                    t={t} 
                    sound={sound} 
                    addNotification={addNotification} 
                />
            </div>
            
            {/* --- PANELES FLOTANTES --- */}
            
            {filtersVisible && (
                <div className="absolute inset-0 z-[50000] flex items-center justify-center pointer-events-none">
                    <div className="pointer-events-auto">
                        <FilterPanel 
                            filters={filters} 
                            setFilters={setFilters} 
                            onClose={() => setFiltersVisible(false)} 
                            t={t} 
                            sound={sound} 
                        />
                    </div>
                </div>
            )}
            
            {activeTab === 'chat' && (
                <div className="absolute inset-0 z-[50000] pointer-events-auto">
                    <ChatPanel 
                        t={t} 
                        sound={sound} 
                        onClose={() => setActiveTab('map')} 
                        context={selectedProperty} 
                    />
                </div>
            )}
            
            {activeTab === 'vault' && (
                <div className="absolute inset-0 z-[60000] pointer-events-auto flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <TheVault 
                        favorites={favorites} 
                        onClose={() => setActiveTab('map')} 
                        t={t} 
                        sound={sound} 
                        removeFromFavs={onToggleFavorite} 
                        onFlyTo={onFlyTo} 
                    />
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="absolute inset-0 z-[50000] pointer-events-auto">
                    <ProfileDashboard 
                        t={t} 
                        onClose={() => setActiveTab('map')} 
                        sound={sound}
                    />
                </div>
            )}
            
            {/* PANEL DE DETALLES (COMMAND CENTER) */}
            {selectedProperty && (
                <div className="pointer-events-auto relative z-[50000]">
                    <CommandCenterPanel 
                        property={selectedProperty} 
                        onClose={() => setSelectedProperty(null)} 
                        t={t} 
                        sound={sound}
                        onToggleFavorite={() => onToggleFavorite(selectedProperty)}
                        isFavorite={favorites && favorites.some(f => f.id === selectedProperty.id)}
                        onContactAgent={() => {
                            sound?.playDeploy();
                            setActiveTab('chat');
                        }} 
                    />
                </div>
            )}
         </>
       )}

  {/* ==================================================================================
          [SISTEMA DE NAVEGACIÓN] BOTÓN "CHANGE MODE" - SOLUCIONADO
          Ubicación: Inferior Izquierda -> ALINEADO CON LA BRÚJULA (N)
          Z-Index: 9999 (Por encima de todo)
      ================================================================================== */}
      <div className="fixed bottom-[30px] left-[70px] z-[9999] pointer-events-auto">
        <button
          onClick={() => setSystemMode('GATEWAY')}
          className="
            group flex items-center gap-3 
            px-5 py-2.5
            bg-black/90 backdrop-blur-xl
            border border-white/10 hover:border-white/30
            rounded-full
            shadow-[0_8px_30px_rgba(0,0,0,0.5)]
            transition-all duration-300 ease-out
            hover:scale-105 hover:bg-black
            cursor-pointer
          "
        >
          {/* ICONO */}
          <div className="text-white/70 group-hover:text-white transition-colors">
            <Navigation size={14} className="group-hover:-rotate-45 transition-transform duration-300" />
          </div>

          {/* TEXTO */}
          <span className="text-[11px] font-mono font-medium tracking-[0.15em] text-white/90 group-hover:text-white whitespace-nowrap">
            CHANGE MODE
          </span>
        </button>
      </div>

    {/* CIERRE CORRECTO DEL COMPONENTE - SIN PUNTOS NI ERRORES */}
    </div>
  );
};

// ==========================================
// A. DUAL GATEWAY (LOS PLANOS QUE FALTAN)
// ==========================================
export const DualGateway = ({ onSelectMode, sound }) => {
  return (
    <div className="fixed inset-0 z-[50000] flex items-center justify-center pointer-events-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full px-6 pointer-events-auto animate-fade-in-up">
        {/* OPCIÓN A: COMPRADOR */}
        <div 
            onClick={() => { sound?.playClick(); onSelectMode('EXPLORER'); }} 
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
            onClick={() => { sound?.playClick(); onSelectMode('ARCHITECT'); }} 
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
// B. ARCHITECT HUD (PANEL VENDEDOR)
// ==========================================
export const ArchitectHud = ({ sound, onCloseMode }) => {
  const [step, setStep] = useState('SCAN'); 
  const [signalPower, setSignalPower] = useState(15);
  const [cart, setCart] = useState([]);

  const SERVICES = [
    { id: 'global', name: 'Global Network', price: 450, color: 'text-cyan-400', icon: Globe },
    { id: 'drone', name: 'Drone Cinema', price: 400, color: 'text-purple-400', icon: Zap },
    { id: 'ads', name: 'Hyper Ads', price: 200, color: 'text-blue-400', icon: Target },
    { id: 'event', name: 'VIP Event', price: 800, color: 'text-amber-400', icon: Music },
  ];

  const toggleService = (srv) => {
    sound?.playClick();
    if (cart.find(x => x.id === srv.id)) { 
        setCart(cart.filter(x => x.id !== srv.id)); 
        setSignalPower(prev => prev - 20); 
    } else { 
        setCart([...cart, srv]); 
        setSignalPower(prev => prev + 20); 
    }
  };

  const totalInv = cart.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="absolute inset-0 z-[9999] pointer-events-none flex items-end justify-center">
      {/* PANEL PRINCIPAL */}
      <div className="pointer-events-auto absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg z-[10000] animate-fade-in-up">
        <div className="bg-[#0a0a0a]/95 backdrop-blur-2xl border border-amber-500/30 rounded-t-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
          
          {/* Header HUD */}
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Building className="text-amber-500 animate-pulse" size={20} />
              <span className="text-xs font-bold text-amber-500 tracking-[0.2em]">MODO ARQUITECTO</span>
            </div>
            <button onClick={onCloseMode} className="text-[10px] text-white/40 hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-white/10">SALIR ✕</button>
          </div>

          <div className="min-h-[300px] flex flex-col justify-center">
            
            {/* PASO 1: ESCANEO */}
            {step === 'SCAN' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <h3 className="text-2xl text-white font-light">Digitalizar Activo</h3>
                    <p className="text-xs text-white/50">Suba el ADN de su propiedad.</p>
                </div>
                <div className="aspect-video w-full bg-white/5 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 group hover:border-amber-500/50 cursor-pointer transition-all relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"/>
                   <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3" alt="Propiedad" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                   <Smartphone className="text-white/40 group-hover:text-amber-500 z-20 transition-colors" size={32} />
                   <span className="text-xs text-white/60 z-20 font-mono">Subir Vibe Check (15s)</span>
                </div>
                <div className="flex gap-2 overflow-x-auto py-2 custom-scrollbar">
                    {['Ático', '3 Hab', '2 Baños', 'Terraza', 'Piscina'].map(chip => (
                        <button key={chip} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white hover:bg-amber-500 hover:text-black transition-all whitespace-nowrap">{chip}</button>
                    ))}
                </div>
                <button onClick={() => { sound?.playDeploy(); setStep('SKILL_TREE'); }} className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-bold text-sm tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02]">
                    <Zap size={16} fill="black" /> SINTETIZAR GEMELO DIGITAL
                </button>
              </div>
            )}

            {/* PASO 2: SKILL TREE */}
            {step === 'SKILL_TREE' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <div>
                        <h3 className="text-xl text-white font-light">Potenciar Señal</h3>
                        <p className="text-[10px] text-white/40 mt-1">Active servicios para atraer agentes.</p>
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
                    <button onClick={() => setStep('SCAN')} className="px-4 py-4 border border-white/10 rounded-xl text-white/50 hover:bg-white/5 transition-all">←</button>
                    <button onClick={() => { sound?.playDeploy(); setStep('INBOX'); }} className="flex-1 py-4 bg-white hover:bg-gray-200 text-black font-bold text-sm tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                        ACTIVAR CAMPAÑA (€{totalInv})
                    </button>
                </div>
              </div>
            )}

            {/* PASO 3: INBOX AGENTES */}
            {step === 'INBOX' && (
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
                 <button onClick={() => setStep('SKILL_TREE')} className="w-full text-[10px] text-white/30 hover:text-white mt-4">VOLVER A CONFIGURACIÓN</button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// 👇 PEGUE ESTO AL FINAL DEL ARCHIVO (REEMPLAZANDO LO ANTERIOR) 👇

// ==========================================
// C. STATUS DECK (VERSIÓN ESTÁTICA Y LIMPIA)
// ==========================================
export const StatusDeck = ({ notifications, onClear, clearNotifications, lang, setLang, sound, soundEnabled, toggleSound, t, onOpenChat }) => {
  const handleClear = onClear || clearNotifications;
  const cycleLang = (e) => { e.stopPropagation(); sound?.playClick(); const langs = ['ES', 'EN']; setLang(langs[(langs.indexOf(lang) + 1) % langs.length]); };
  
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
            <button className="absolute top-8 right-8 p-3 bg-white/5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all" onClick={(e) => { e.stopPropagation(); sound?.playClick(); onClose(); }}>
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
                            <div className="relative h-64 overflow-hidden cursor-pointer bg-black" onClick={() => { sound?.playDeploy(); onFlyTo && onFlyTo(fav.location); onClose(); }}>
                                <img src={getImage(fav)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" alt="" />
                                <div className="absolute top-3 right-3 bg-black/80 px-2 py-1 rounded border border-white/10">
                                    <span className="text-xs text-white font-mono">€{fav.price?.toLocaleString()}k</span>
                                </div>
                            </div>
                            {/* INFO */}
                            <div className="p-5">
                                <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-1">{fav.tier || "PREMIUM"}</h3>
                                <p className="text-[10px] text-white/40 font-mono mb-4">ID: {fav.id}</p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <button className="text-[10px] font-bold tracking-widest text-blue-500 hover:text-white transition-colors uppercase" onClick={() => { sound?.playDeploy(); onFlyTo && onFlyTo(fav.location); onClose(); }}>
                                        VER
                                    </button>
                                    <button className="text-white/20 hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); sound?.playClick(); handleRemove && handleRemove(fav); }}>
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
    const handleFav = onToggleFavorite || toggleFavorite || onFav || setFavorite;
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
                            <path d="M0,35 Q20,30 40,32 T60,20 T80,25 T100,5 V40 H0 Z" fill={`url(#grad-${property.id})`} stroke="none" opacity="0.2" />
                            <defs>
                                <linearGradient id={`grad-${property.id}`} x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor={tierColor} />
                                    <stop offset="100%" stopColor="black" />
                                </linearGradient>
                            </defs>
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
        sound?.playClick(); 
        setMsgs([...msgs, {id: Date.now(), role: 'user', text: input}]); 
        setInput(""); 
        setTimeout(() => { sound?.playPing(); setMsgs(prev => [...prev, {id: Date.now()+1, role: 'agent', text: "Mensaje recibido. Un agente le contactará."}]); }, 1000); 
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

