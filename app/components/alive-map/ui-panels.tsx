// @ts-nocheck
"use client";

// 1. NÚCLEO DE REACT
import React, { useState, useEffect } from 'react';
// 2. ARSENAL DE ICONOS (Lucide React) - LISTA ÚNICA Y LIMPIA

import ProfilePanel from "./ui-panels/ProfilePanel";


import MarketPanel from "./ui-panels/MarketPanel";
import DetailsPanel from "./ui-panels/DetailsPanel";


import { Radar as RadarIcon, Building as BuildingIcon,
               
 X, Heart, Star, Search, Mic, Bell, User, Users, Crosshair, Activity, Zap, // <--- AÑADIDO 'Star' AQUÍ
  Box, Square, Sun, Moon, ArrowRight, ChevronRight, ChevronLeft,

  Smartphone, SlidersHorizontal, MessageCircle, Sparkles, Camera, Bed, Bath,
  LayoutGrid, Send, CreditCard, Shield, Phone, Info, Command, Store, TrendingUp, Eye, BarChart3,
  Move, Home, Maximize2,

  Globe, Newspaper, Share2, Clock, Award,
  Lock, MapPin, CheckCircle2, Crown, Briefcase 
} from 'lucide-react';

import { MARKET_CATALOG } from './market-data';

// =============================================================================
// 4. SUMINISTROS GLOBALES (CONSTANTES)
// =============================================================================

export const LUXURY_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

// [ARREGLO CRÍTICO] Definimos MOCK_IMGS como alias de LUXURY_IMAGES para evitar errores
const MOCK_IMGS = LUXURY_IMAGES;

export const TIER_COLORS = {
    PREMIUM: { hex: '#F59E0B' },    // Amber
    HIGH_CLASS: { hex: '#EF4444' }, // Red
    SMART: { hex: '#3B82F6' },      // Blue
    STANDARD: { hex: '#3B82F6' }    // Fallback
};

export const CORPORATE_BLUE = "#00f0ff";

// ----------------------------------------------------------------------
// 4. MODO EXPLORADOR (V8: EDICIÓN FINAL "PURE AIR" - PERFECCIONADO)
// ----------------------------------------------------------------------
const ExplorerHud = ({ onCloseMode, soundFunc, onGoToMap }) => {
  const [phase, setPhase] = useState('SCAN'); 
  const [selectedType, setSelectedType] = useState('RESIDENCIAL');
  const [steps, setSteps] = useState(20); 

  const STEP_VALUE = 50000;
  const ELITE_THRESHOLD = 5000000;
  const currentPrice = steps * STEP_VALUE;
  const isElite = currentPrice >= ELITE_THRESHOLD;

  useEffect(() => {
    if (phase === 'SCAN') {
       const timer = setTimeout(() => {
          if(soundFunc) soundFunc('ping');
          setPhase('CONFIG'); 
       }, 2000);
       return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleTypeSelect = (type) => {
      if(soundFunc) soundFunc('click');
      setSelectedType(type);
  };

  const handleBudgetClick = (e) => {
      if(soundFunc) soundFunc('click');
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      let percentage = Math.min(100, Math.max(0, (x / width) * 100));
      setSteps(Math.round(percentage));
  };

  const handleLaunch = () => {
      if(soundFunc) soundFunc('complete');
      const filterData = { type: selectedType, maxPrice: isElite ? 999999999 : currentPrice };
      console.log("⚡ EJECUTANDO FILTRO TÁCTICO:", filterData);
      window.dispatchEvent(new CustomEvent('apply-filter-signal', { detail: filterData }));
      setTimeout(() => onGoToMap(), 100); 
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-300/30 backdrop-blur-md animate-fade-in text-slate-900 select-none pointer-events-auto">
      
      {/* HEADER FLOTANTE: "AIRE" APLICADO */}
      <div className="absolute top-10 left-10 flex items-center gap-6 pointer-events-auto z-[210]">
          {/* Icono con Sombra Blanca (Efecto Aire) */}
          <div onClick={onCloseMode} className="cursor-pointer p-4 rounded-3xl transition-all group hover:bg-white/20 shadow-[0_5px_30px_rgba(255,255,255,0.5)] bg-white/5 border border-white/20">
             <LayoutGrid size={28} className="text-black group-hover:scale-110 transition-transform"/>
          </div>
          
          <div>
             {/* LOGO CON "OS." RESTAURADO */}
             <h1 className="text-4xl font-black tracking-tighter leading-none drop-shadow-sm mb-1 flex items-baseline">
                <span className="text-black">Stratosfere</span>
                <span className="text-slate-500 text-lg font-light tracking-widest ml-1">OS.</span>
             </h1>
             <p className="text-sm text-black font-bold tracking-[0.2em] uppercase">Módulo de Búsqueda</p>
          </div>
      </div>

      {/* FASE 1: ESCANEO */}
      {phase === 'SCAN' && (
        <div className="text-center animate-pulse pointer-events-none">
            <div className="bg-white/60 p-8 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.4)] mb-6 backdrop-blur-xl border border-white/40">
                 <RadarIcon size={64} className="text-[#0071e3] animate-spin-slow"/>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Sincronizando</h2>
            <p className="text-slate-500 font-medium text-sm">Estableciendo enlace satelital...</p>
        </div>
      )}

      {/* FASE 2: CONFIGURACIÓN (EFECTO "AIRE" APLICADO A LA CAJA) */}
      {phase === 'CONFIG' && (
        <div className="bg-[#f2f2f7]/90 backdrop-blur-3xl border border-white/60 p-10 rounded-[2.5rem] 
        shadow-[0_0_60px_rgba(255,255,255,0.5)] 
        max-w-2xl w-full animate-fade-in-up relative z-50 pointer-events-auto">
            
            {/* Cabecera del Panel */}
            <div className="flex justify-between items-center mb-8 border-b border-slate-200/60 pb-4">
                <h2 className="text-lg font-bold tracking-wide flex items-center gap-3 text-slate-900">
                    <SlidersHorizontal className="text-[#0071e3]" size={20}/> PARÁMETROS DE MISIÓN
                </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
                {/* 1. TIPO DE ACTIVO */}
                <div className="space-y-4">
                    <label className="text-xs text-slate-400 font-bold tracking-widest uppercase">Tipo de Activo</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['RESIDENCIAL', 'CORPORATIVO'].map((type) => (
                            <button 
                                key={type}
                                onClick={() => handleTypeSelect(type)} 
                                className={`p-4 border rounded-2xl transition-all text-xs font-bold tracking-wider cursor-pointer shadow-sm
                                ${selectedType === type 
                                    ? 'bg-[#0071e3] border-[#0071e3] text-white shadow-blue-500/20' 
                                    : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. PRESUPUESTO */}
                <div className="space-y-4">
                    <label className="text-xs text-slate-400 font-bold tracking-widest uppercase flex justify-between">
                        <span>Límite de Inversión</span>
                        <span className={`font-black ${isElite ? 'text-amber-500' : 'text-[#0071e3]'}`}>
                            {isElite ? "CLASE ELITE (> 5M €)" : `${currentPrice.toLocaleString('es-ES')} €`}
                        </span>
                    </label>
                    
                    <div 
                        onClick={handleBudgetClick}
                        className="h-12 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative cursor-pointer hover:border-blue-300 transition-colors group overflow-hidden shadow-inner"
                    >
                        {/* Barra de progreso */}
                        <div 
                            className={`absolute left-0 top-0 bottom-0 w-full transition-all duration-300 ${isElite ? 'bg-amber-500/10' : 'bg-[#0071e3]/10'}`} 
                            style={{ transform: `scaleX(${steps / 100})`, transformOrigin: 'left' }}
                        ></div>
                        
                        <div 
                            className={`h-2 rounded-full w-full relative z-10 ${isElite ? 'bg-amber-500' : 'bg-[#0071e3]'}`} 
                            style={{ width: `${steps}%` }}
                        ></div>
                        
                        {/* Indicador Numérico */}
                        <span className="absolute right-4 text-xs font-bold text-slate-900 z-20">
                           {isElite ? "∞" : `${(currentPrice / 1000000).toFixed(2)}M`}
                        </span>
                    </div>
                    
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-widest px-1">
                        <span>0 €</span>
                        <span>2.5M €</span>
                        <span className={isElite ? "text-amber-500" : ""}>5M € +</span>
                    </div>
                </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex gap-4 pt-6 border-t border-slate-200/60">
                <button 
                    onClick={onCloseMode} 
                    className="px-8 py-4 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-xs font-bold tracking-widest transition-all cursor-pointer shadow-sm"
                >
                    CANCELAR
                </button>
                <button 
                    onClick={handleLaunch} 
                    className={`flex-1 py-4 text-white rounded-2xl text-xs font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-95 shadow-lg shadow-blue-500/20 hover:shadow-xl
                    ${isElite ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#0071e3] hover:bg-[#0077ED]'}`}
                >
                    {isElite ? 'ACCESO ELITE' : 'INICIAR BÚSQUEDA'} <ArrowRight size={16}/>
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
// =============================================================================
// 🧠 CÓDIGO INTERNO DE UI PANELS
// =============================================================================

// --- COMPONENTE DE IMAGEN SEGURA (ANTI-ROTURA) ---
const SafeImage = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const placeholder = "https://images.unsplash.com/photo-1628102491629-778571d893a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&blend=000000&sat=-100&blend-mode=multiply";
    const onError = () => setImgSrc(placeholder);
    return <img src={imgSrc || placeholder} alt={alt} className={className} onError={onError} />;
};

// --- MOTOR DE SONIDO (LUXURY TECH SYNTH) ---
const playSynthSound = (type) => {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    if (type === 'hover') {
        const osc = ctx.createOscillator(); osc.type = 'sine';
        const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 0.03);
        gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now); osc.stop(now + 0.03);
    } else if (type === 'click') {
        const osc = ctx.createOscillator(); osc.type = 'triangle';
        const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'ping') {
        const osc = ctx.createOscillator(); osc.type = 'sine';
        const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(1000, now); osc.frequency.exponentialRampToValueAtTime(2000, now + 0.5);
        gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
        osc.start(now); osc.stop(now + 1);
    } else if (type === 'boot') {
        const bassOsc = ctx.createOscillator(); bassOsc.type = 'sine';
        const bassGain = ctx.createGain(); bassOsc.connect(bassGain); bassGain.connect(ctx.destination);
        bassOsc.frequency.setValueAtTime(50, now); bassOsc.frequency.exponentialRampToValueAtTime(150, now + 3);
        bassGain.gain.setValueAtTime(0, now); bassGain.gain.linearRampToValueAtTime(0.3, now + 0.5); bassGain.gain.linearRampToValueAtTime(0, now + 3.5);
        bassOsc.start(now); bassOsc.stop(now + 3.5);
        setTimeout(() => {
            const chimeOsc = ctx.createOscillator(); chimeOsc.type = 'sine';
            const chimeGain = ctx.createGain(); chimeOsc.connect(chimeGain); chimeGain.connect(ctx.destination);
            chimeOsc.frequency.setValueAtTime(1500, now + 3.5);
            chimeGain.gain.setValueAtTime(0.2, now + 3.5); chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 5);
            chimeOsc.start(now + 3.5); chimeOsc.stop(now + 5);
        }, 3000);
    }
};

// =============================================================================
// 📸 HOLO INSPECTOR V12 (SOLUCIÓN FINAL: CSS PURO + FORZADO HD + NAVEGACIÓN DIRECTA)
// =============================================================================
const HoloInspector = ({ prop, onClose, soundFunc }) => {
  const [idx, setIdx] = React.useState(0);

  // 1. CONSTRUCCIÓN DE GALERÍA + FORZADO DE ALTA CALIDAD (HD)
  // Esta función convierte cualquier foto borrosa en 4K automáticamente
  const getHighQualityUrl = (url) => {
      if (!url) return "";
      if (url.includes("images.unsplash.com")) {
          // Truco: Cambiamos los parámetros para pedir máxima calidad al servidor
          return url.replace("&w=800", "&w=1920").replace("&q=80", "&q=100");
      }
      return url;
  };

  const gallery = React.useMemo(() => {
      let arr = [];
      if (prop?.img) arr.push(prop.img);
      if (prop?.images && Array.isArray(prop.images)) arr.push(...prop.images);
      
      // Si no hay fotos, rellenamos
      if (arr.length < 2 && typeof LUXURY_IMAGES !== "undefined") {
          arr = [...arr, ...LUXURY_IMAGES];
      }
      // Limpiamos y MEJORAMOS LA CALIDAD
      return Array.from(new Set(arr.filter(Boolean))).map(getHighQualityUrl).slice(0, 15);
  }, [prop]);

  const total = gallery.length;
  const currentImg = gallery[idx];

  // 2. NAVEGACIÓN (SIMPLE Y DIRECTA)
  const nav = (dir) => {
      if (soundFunc) try { soundFunc('click'); } catch(e) {}
      if (dir === 'next') setIdx((prev) => (prev + 1) % total);
      if (dir === 'prev') setIdx((prev) => (prev - 1 + total) % total);
  };

  // 3. TECLADO
  React.useEffect(() => {
    const onKey = (e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowLeft") nav('prev');
        if (e.key === "ArrowRight") nav('next');
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total, onClose]);

  if (!currentImg) return null;

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-auto flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-fade-in" onClick={onClose}>
        
        {/* ESTILOS CSS INCRUSTADOS PARA ASEGURAR QUE LA ANIMACIÓN FUNCIONE SIEMPRE */}
        <style>{`
            @keyframes slowZoom {
                0% { transform: scale(1); }
                100% { transform: scale(1.1); }
            }
            .animate-ken-burns {
                animation: slowZoom 15s linear forwards;
            }
        `}</style>

        {/* CONTENEDOR */}
        <div className="relative w-[98vw] h-[95vh] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-black group" onClick={(e)=>e.stopPropagation()}>
            
            {/* A. IMAGEN (Usamos key={idx} para reiniciar la animación CSS cada vez que cambiamos foto) */}
            <div className="absolute inset-0 overflow-hidden bg-black">
                <div key={idx} className="w-full h-full animate-ken-burns">
                    <img 
                        src={currentImg} 
                        alt={`Visor ${idx}`} 
                        className="w-full h-full object-cover opacity-90" 
                    />
                </div>
                {/* Degradado */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
            </div>

            {/* B. HEADER */}
            <div className="absolute top-8 left-8 z-30 pointer-events-none">
                <div className="text-[10px] font-mono text-fuchsia-500 tracking-widest uppercase mb-1">
                    LIVE FEED • CAM {idx + 1} / {total}
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-lg">
                    {prop.type || "ACTIVO"} <span className="text-fuchsia-500">#{prop.id || "001"}</span>
                </h2>
            </div>

            {/* C. CERRAR */}
            <button onClick={onClose} className="absolute top-8 right-8 z-[100] w-12 h-12 rounded-full bg-black/50 hover:bg-white text-white hover:text-black border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer">
                <X size={24} />
            </button>

            {/* D. HUD DERECHO (Datos flotantes) */}
            <div className="absolute top-24 right-8 z-30 w-64 p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-xl hidden md:block">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                    <Activity size={12} className="text-fuchsia-500"/>
                    <span className="text-[9px] font-bold tracking-[0.2em] text-white uppercase">SISTEMA ACTIVO</span>
                </div>
                <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-[8px] uppercase tracking-widest text-white/70 mb-1"><span>Resolución</span><span className="text-white">UHD 4K</span></div>
                        <div className="flex gap-0.5 h-1 w-full">{[...Array(12)].map((_, i)=>(<div key={i} className={`flex-1 rounded-full ${i<12?'bg-fuchsia-500 shadow-[0_0_6px_#d946ef]':'bg-white/10'}`}></div>))}</div>
                     </div>
                </div>
            </div>

            {/* E. FLECHAS (Z-INDEX 100 + AREA CLICABLE GRANDE) */}
            {total > 1 && (
                <>
                    <button 
                        onClick={()=>nav('prev')} 
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-[100] w-24 h-24 rounded-full bg-black/10 hover:bg-white/10 text-white/60 hover:text-white border border-transparent hover:border-white/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer group/arrow"
                    >
                        <ChevronLeft size={48} strokeWidth={1} className="group-hover/arrow:scale-110 transition-transform"/>
                    </button>
                    
                    <button 
                        onClick={()=>nav('next')} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-[100] w-24 h-24 rounded-full bg-black/10 hover:bg-white/10 text-white/60 hover:text-white border border-transparent hover:border-white/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer group/arrow"
                    >
                        <ChevronRight size={48} strokeWidth={1} className="group-hover/arrow:scale-110 transition-transform"/>
                    </button>
                </>
            )}

            {/* F. PIE DE PÁGINA */}
            <div className="absolute bottom-0 left-0 w-full p-10 bg-gradient-to-t from-black via-black/60 to-transparent z-30 flex items-end justify-between">
                <div>
                    <h3 className="text-white text-2xl font-bold tracking-tight drop-shadow-md">{prop.title || "Propiedad"}</h3>
                    <p className="text-blue-400 font-mono text-sm">{prop.formattedPrice || "CONSULTAR"}</p>
                </div>
                
                {/* Puntos Indicadores */}
                {total > 1 && (
                    <div className="flex gap-2 mb-2">
                        {gallery.map((_, i) => (
                            <button 
                                key={i} 
                                onClick={() => setIdx(i)}
                                className={`h-1.5 rounded-full transition-all duration-300 shadow-lg cursor-pointer ${i === idx ? "w-12 bg-fuchsia-500 shadow-[0_0_10px_#d946ef]" : "w-2 bg-white/30 hover:bg-white"}`} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

// =============================================================================
// 💎 THE VAULT V5 (ESTILO CUPERTINO: BLANCO, LIMPIO, MINIMALISTA)
// =============================================================================
const VaultPanel = ({ rightPanel, toggleRightPanel, favorites, onToggleFavorite, map, soundEnabled, addNotification }) => {
  
  if (rightPanel !== 'VAULT') return null;

  const handleFlyTo = (fav) => {
      // 1. Sonido sutil (tipo 'pop')
      if (soundEnabled) {
        try { const audio = new AudioContext(); const osc = audio.createOscillator(); osc.connect(audio.destination); osc.start(); osc.stop(audio.currentTime + 0.05); } catch(e){}
      }

      // 2. Coordenadas
      let target = [-3.6883, 40.4280]; // Fallback Madrid
      if (fav.coordinates?.length === 2) target = fav.coordinates;
      else if (fav.lat && fav.lng) target = [fav.lng, fav.lat];

      // 3. Notificación limpia
      if (addNotification) addNotification(`Viajando a ${fav.title}`);
      
      // 4. Vuelo Suave
      const mapInstance = map?.current || map;
      if (mapInstance?.flyTo) {
             mapInstance.flyTo({
                 center: target,
                 zoom: 19,
                 pitch: 60,
                 bearing: -30,
                 duration: 2000,
                 essential: true
             });
      }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[420px] z-[50000] flex flex-col pointer-events-auto animate-slide-in-right">
        
        {/* FONDO: BLANCO TRANSLÚCIDO (Estilo iOS) */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-3xl shadow-[-20px_0_40px_rgba(0,0,0,0.1)]"></div>

        {/* CONTENIDO */}
        <div className="relative z-10 flex flex-col h-full p-8 text-slate-900">
            
            {/* CABECERA TIPO APPLE */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-black mb-1">
                        Favoritos.
                    </h2>
                    <p className="text-lg font-medium text-slate-500">
                        Tu colección personal.
                    </p>
                </div>
                <button 
                    onClick={() => toggleRightPanel('NONE')}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                >
                    <X size={20} />
                </button>
            </div>

            {/* LISTA DE TARJETAS LIMPIAS */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-2">
                {favorites.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                        <Heart size={64} strokeWidth={1} className="text-slate-300"/>
                        <p className="text-xl font-medium">Aún no hay nada aquí.</p>
                    </div>
                ) : (
                    favorites.map((fav, index) => (
                        <div 
                            key={fav.id || index}
                            onClick={() => handleFlyTo(fav)}
                            className="group relative bg-white rounded-3xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 transform hover:scale-[1.02]"
                        >
                            <div className="flex gap-4 items-center">
                                {/* FOTO REDONDEADA */}
                                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 relative">
                                    <img src={fav.img || fav.images?.[0]} alt="" className="w-full h-full object-cover" />
                                </div>
                                
                                {/* INFO LIMPIA */}
                                <div className="flex-1 min-w-0 py-1">
                                    <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wide mb-1">
                                        {fav.type || "Premium"}
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-900 truncate leading-tight">{fav.title}</h3>
                                    <p className="text-slate-500 font-medium text-sm mt-1">{fav.formattedPrice || "Consultar"}</p>
                                </div>

                                {/* BOTÓN BORRAR (SUTIL) */}
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        onToggleFavorite(fav);
                                    }}
                                    className="p-2 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all mr-1"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* FOOTER: BOTÓN "COMPRAR" */}
            <div className="mt-6 pt-6 border-t border-slate-200">
                <button className="w-full py-4 bg-[#0071e3] hover:bg-[#0077ED] text-white font-semibold text-sm rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                    Contactar Agente
                </button>
            </div>
        </div>
    </div>
  );
};
export default function UIPanels({ 
  map, onToggleFavorite, favorites = [], 
  lang, setLang, soundEnabled, toggleSound, systemMode, setSystemMode 
}) {
  // --- ESTADOS EXISTENTES ---
  const [gateUnlocked, setGateUnlocked] = useState(false); 
  const [activePanel, setActivePanel] = useState('NONE'); 
  const [rightPanel, setRightPanel] = useState('NONE');   
  const [notifications, setNotifications] = useState([]);
  const [selectedProp, setSelectedProp] = useState(null); 
  const [explorerIntroDone, setExplorerIntroDone] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // --- ESTADOS AI ---
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isListening, setIsListening] = useState(false); 

// ===========================================================================
  // 🧠 CEREBRO TÁCTICO v3 (DEMAND CONTROL - BAIT & HOOK)
  // ===========================================================================
  
  // 1. ESTADOS DE MERCADO
  const [marketTab, setMarketTab] = useState('ONLINE'); // Pestañas: ONLINE | OFFLINE | PACK
  const [selectedReqs, setSelectedReqs] = useState([]); // Array de IDs seleccionados (ESTO ARREGLA EL ERROR)

  // 2. MATEMÁTICAS: CÁLCULO DEL CEBO (BAIT VALUE)
  // Calculamos cuánto valor estamos "obligando" a invertir a la agencia
  const baitValue = selectedReqs.reduce((total, id) => {
       const item = MARKET_CATALOG.find(i => i.id === id);
       return total + (item ? item.marketValue : 0);
  }, 0);

  // 3. FUNCIÓN DE ACTIVACIÓN (TOGGLE)
  const toggleRequirement = (item) => {
      if(typeof soundEnabled !== 'undefined' && soundEnabled) playSynthSound('click');
      
      setSelectedReqs(prev => {
          const isSelected = prev.includes(item.id);
          if (isSelected) {
              return prev.filter(id => id !== item.id); // Si ya estaba, lo quitamos
          } else {
              return [...prev, item.id]; // Si no estaba, lo añadimos
          }
      });
  };
  // --- FUNCIONES HELPER PARA PANELES (RESTAURACIÓN) ---
  const toggleRightPanel = (panelName) => {
      if(typeof soundEnabled !== 'undefined' && soundEnabled) playSynthSound('hover');
      setRightPanel(rightPanel === panelName ? 'NONE' : panelName);
  };

  const toggleMainPanel = (panelName) => {
      if(typeof soundEnabled !== 'undefined' && soundEnabled) playSynthSound('hover');
      setActivePanel(activePanel === panelName ? 'NONE' : panelName);
      if(['FILTERS', 'AI'].includes(panelName)) setSelectedProp(null);
  };


  useEffect(() => {
    
    // 1. RECEPCIÓN DE EXPEDIENTE (VERSIÓN BLINDADA MK-II)
    const handleOpenDetails = (e) => {
        const propData = e.detail;
        console.log("📂 RECIBIDO DE NANO CARD:", propData);
        
        // A. PROTOCOLO DE IDENTIDAD (Evita error de fotos)
        // Si no trae ID, usamos la hora actual para que las matemáticas de la foto no fallen
        const safeId = propData.id || Date.now(); 

        // B. PROTOCOLO FINANCIERO (Evita error NaN)
        let finalPrice = 0;
        
        // Detector de formato: ¿Viene como número o texto?
        if (typeof propData.price === 'number') {
            finalPrice = propData.price; 
        } else if (propData.displayPrice) {
            // Convierte "2.5M" a 2500000
            finalPrice = parseFloat(propData.displayPrice) * 1000000;
        } else if (typeof propData.price === 'string') {
             // Limpia caracteres extraños y convierte
             finalPrice = parseFloat(propData.price.replace(/[^0-9.]/g, '')) * 1000000;
        }

        const sanitizedData = {
            ...propData,
            id: safeId,
            // 1. FOTO: Si no hay foto, usamos el ID seguro para elegir una de la lista
            img: propData.img || LUXURY_IMAGES[safeId % LUXURY_IMAGES.length] || LUXURY_IMAGES[0],
            // 2. PRECIO NUMÉRICO: Para cálculos matemáticos
            price: finalPrice || 0,
            // 3. PRECIO TEXTO: Para mostrar directamente si el cálculo falla
            formattedPrice: propData.displayPrice || propData.price || "CONSULTAR"
        };

        console.log("✅ DATOS BLINDADOS PARA EL PANEL:", sanitizedData);
        
        setSelectedProp(sanitizedData);
        setActivePanel('DETAILS'); 
        
        if(soundEnabled) playSynthSound('click');
    };

    // 2. RECEPCIÓN DE SEÑAL DE FAVORITO (Click en el corazón de la NanoCard)
    const handleToggleFavSignal = (e) => {
          const propData = e.detail;
          if(soundEnabled) playSynthSound('ping');
          console.log("❤️ SEÑAL DE VAULT RECIBIDA:", propData);
          onToggleFavorite(propData);
    };

    // SUSCRIPCIÓN A LOS CANALES DE COMBATE
    window.addEventListener('open-details-signal', handleOpenDetails);
    window.addEventListener('toggle-fav-signal', handleToggleFavSignal);
    
    // RETIRADA: Limpieza de canales al salir
    return () => {
        window.removeEventListener('open-details-signal', handleOpenDetails);
        window.removeEventListener('toggle-fav-signal', handleToggleFavSignal);
    };
  }, [soundEnabled, onToggleFavorite]);
  
  // 🟢 2. EL RESETEO AUTOMÁTICO (LÓGICA AÑADIDA)
  // Si salimos del modo explorador, reseteamos para que el menú vuelva a salir la próxima vez
  useEffect(() => {
    if (systemMode !== 'EXPLORER') setExplorerIntroDone(false);
  }, [systemMode]);

  const addNotification = (t) => { 
      if(soundEnabled) playSynthSound('ping');
      setNotifications(p=>[{title:t},...p]); 
      setTimeout(()=>setNotifications(p=>p.slice(0,-1)), 5000); 
  };

 // --- LÓGICA AI & VOZ ---
// Soporta map como instancia (map.flyTo) o como ref (map.current.flyTo)
const getMapApi = () => {
  const m: any = map as any;
  return (m && (m.current || m)) || null;
};

const activateVoiceCommand = () => {
  if (activePanel !== 'AI') setActivePanel('AI');
  setIsListening(true);
  if (soundEnabled) playSynthSound('boot');

  setTimeout(() => {
    const frasesComando = [
      "Llévame al Barrio de Salamanca...",
      "Busca áticos de lujo...",
      "Localiza oportunidades de inversión...",
      "Activa el modo nocturno..."
    ];
    const comando = frasesComando[Math.floor(Math.random() * frasesComando.length)];
    setAiInput(comando);
    setIsListening(false);
    setTimeout(() => handleAICommand(null, comando), 500);
  }, 2000);
};

const handleAICommand = (e: any, overrideCmd: any = null) => {
  if (e) e.preventDefault();
  const cmd = overrideCmd || aiInput;
  if (!cmd || !cmd.trim()) return;

  setIsAiTyping(true);
  if (soundEnabled) playSynthSound('click');

  setTimeout(() => {
    const lowerInput = cmd.toLowerCase();
    let responseText = "";
    let actionTriggered = false;

    const mapApi = getMapApi();

    if (lowerInput.includes("salamanca") || lowerInput.includes("retiro")) {
      mapApi?.flyTo?.({ center: [-3.6883, 40.4280], zoom: 16, pitch: 60, bearing: -20 });
      responseText = "📍 Coordenadas fijadas: DISTRITO SALAMANCA. Escaneando activos prime...";
      actionTriggered = true;
    }
    else if (lowerInput.includes("atico") || lowerInput.includes("ático")) {
      responseText = "🔍 Filtro Activo: PENTHOUSE. He aislado las unidades con terraza superior.";
      actionTriggered = true;
    }
    else if (lowerInput.includes("inversión") || lowerInput.includes("oportunidad")) {
      responseText = "📉 Análisis ROI completado. Mostrando activos con proyección >12% anual.";
      actionTriggered = true;
    }
    else if (lowerInput.includes("nocturno") || lowerInput.includes("noche")) {
      handleDayNight();
      responseText = "🌑 Modo Sigilo (Noche) activado.";
      actionTriggered = true;
    }
    else {
      responseText = `Afirmativo. He recibido su orden: "${cmd}". Procedo al análisis de la base de datos...`;
    }

    setAiResponse(responseText);
    setAiInput("");
    setIsAiTyping(false);
    if (actionTriggered && soundEnabled) playSynthSound('ping');
  }, 1500);
};

// --- CONTROL DE LUCES (ROBUSTO) ---
const handleDayNight = () => {
  const mapAny = map as any;
  const mapApi = mapAny?.current || mapAny;

  if (soundEnabled) playSynthSound("click");

  if (!mapApi) {
    console.warn("⚠️ El mapa no está listo todavía. Abortando cambio de luces.");
    addNotification("MAPA NO LISTO");
    return;
  }

  try {
    const currentPreset =
      typeof mapApi.getConfigProperty === "function"
        ? mapApi.getConfigProperty("basemap", "lightPreset")
        : typeof mapApi.getConfig === "function"
          ? mapApi.getConfig("basemap", "lightPreset")
          : null;

    const nextPreset = currentPreset === "dusk" ? "day" : "dusk";

    if (typeof mapApi.setConfigProperty === "function") {
      mapApi.setConfigProperty("basemap", "lightPreset", nextPreset);
    } else if (typeof mapApi.setConfig === "function") {
      mapApi.setConfig("basemap", { lightPreset: nextPreset });
    } else {
      console.warn("⚠️ Este mapa no soporta lightPreset (setConfigProperty/setConfig).");
    }

    addNotification(`VISIÓN ${String(nextPreset).toUpperCase()} ACTIVA`);
  } catch (e) {
    console.log("Map config not ready", e);
    addNotification("MAP CONFIG NOT READY");
  }
};


// --- SECUENCIA DE LANZAMIENTO (VERSIÓN BLINDADA) ---
const handleInitializeSystem = () => {
  if (soundEnabled) playSynthSound('boot');
  else playSynthSound('boot');

  setGateUnlocked(true);

  const mapApi: any = getMapApi();

  if (!mapApi || typeof mapApi.jumpTo !== 'function' || typeof mapApi.flyTo !== 'function') {
    console.warn("⚠️ SISTEMA: El mapa aún no está listo para la secuencia de inicio.");
    return;
  }

  try {
    mapApi.jumpTo({ center: [0, 20], zoom: 1.5, pitch: 0 });

    mapApi.flyTo({
      center: [-3.6905, 40.4250],
      zoom: 16.5,
      pitch: 65,
      bearing: -15,
      duration: 5000,
      essential: true,
      easing: (t: any) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
    });
  } catch (e) {
    console.warn("⚠️ SISTEMA: Error en la secuencia de inicio.", e);
  }
};
// --- RENDERIZADO: GATEKEEPER (EDICIÓN FINAL "CLEAN TITANIUM") ---
  if (!gateUnlocked) {
    return (
        // 1. FONDO: Gris Titanium (#e4e4e7)
        <div className="fixed inset-0 z-[99999] bg-[#e4e4e7] flex flex-col items-center justify-center pointer-events-auto animate-fade-in select-none">
            
            {/* 2. LOGO CENTRAL (Sin cajas, TAMAÑO GIGANTE RESTAURADO) */}
            <div className="relative z-10 text-center mb-24 cursor-default">
                
                <h1 className="relative text-7xl md:text-9xl font-bold tracking-tighter leading-none drop-shadow-sm">
                    {/* Strato: Negro Sólido */}
                    <span className="text-black">Strato</span>
                    
                    {/* sfere: Azul Oficial (#0071e3) */}
                    <span className="text-[#0071e3]">sfere</span>
                    
                    {/* OS: Gris técnico */}
                    <span className="text-slate-400 text-2xl md:text-4xl ml-3 font-light tracking-[0.2em] align-top mt-4 inline-block">OS.</span>
                </h1>

            </div>

            {/* 3. BOTÓN AZUL (Coche Fantástico) */}
            <button 
                onClick={handleInitializeSystem} 
                className="group relative px-24 py-6 bg-[#0071e3] text-white rounded-full font-bold text-xs tracking-[0.5em] transition-all duration-500 shadow-[0_20px_40px_rgba(0,113,227,0.25)] hover:shadow-[0_0_80px_rgba(0,113,227,0.6)] hover:scale-105 overflow-hidden"
            >
                <span className="relative z-10 drop-shadow-md">INITIALIZE SYSTEM</span>
                
                {/* Efecto Escáner Luz Blanca */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1.5s] ease-in-out"></div>
            </button>

            {/* 4. FOOTER */}
            <div className="absolute bottom-10 text-xs text-slate-400 font-mono tracking-widest flex flex-col items-center gap-3 animate-fade-in delay-500">
                <Activity size={16} className="animate-pulse text-[#0071e3]"/> 
                ESPERANDO AUTORIZACIÓN NEURAL...
            </div>
        </div>
    );
  }
  // --- RENDERIZADO: SISTEMA PRINCIPAL ---
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-end pb-8 animate-fade-in text-sans select-none">
       
       {systemMode === 'GATEWAY' && (
           <div className="fixed inset-0 z-[50000] flex items-center justify-center pointer-events-auto bg-[#050505]/80 backdrop-blur-xl animate-fade-in duration-1000">
               <DualGateway onSelectMode={(m) => { playSynthSound('boot'); setSystemMode(m); }} />
           </div>
       )}

       {systemMode === 'ARCHITECT' && (
           <ArchitectHud soundFunc={playSynthSound} onCloseMode={(success) => { 
               if(success) addNotification("CAMPAÑA ACTIVADA"); 
               setSystemMode(success ? 'EXPLORER' : 'GATEWAY'); 
           }} />
       )}
       
      {systemMode === 'EXPLORER' && (
         <>
           {/* 🟢 CORRECCIÓN: SOLO MOSTRAMOS EL MENÚ SI NO HEMOS TERMINADO LA INTRO */}
           {!explorerIntroDone && (
               <ExplorerHud 
                  soundFunc={playSynthSound} 
                  onCloseMode={() => setSystemMode('GATEWAY')} 
                  onGoToMap={() => { 
                      if(soundEnabled) playSynthSound('complete');
                      // 👇 ESTA ES LA LLAVE QUE ABRE EL MAPA:
                      setExplorerIntroDone(true); 
                  }}
               />
           )}

           {/* UI SUPERIOR (HEADER) */}
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-8 left-8 pointer-events-auto flex items-center gap-4 group cursor-default animate-fade-in-up">
                  <div onClick={() => setSystemMode('GATEWAY')} className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/50 cursor-pointer hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                      <LayoutGrid size={18} className="text-blue-400 group-hover:text-white"/>
                  </div>
                  <div className="flex flex-col">
                      <h1 className="text-xl font-light tracking-[0.3em] text-white drop-shadow-md">STRATOS<span className="font-bold text-blue-600">FERE</span></h1>
                      <span className="text-[8px] text-blue-400 font-mono tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> SYSTEM ONLINE
                      </span>
                  </div>
              </div>

              {/* Status Deck */}
              <div className="absolute top-8 right-8 pointer-events-auto flex flex-col gap-3 items-end w-[280px] animate-fade-in-up delay-100">
                <div className="glass-panel p-5 rounded-[1.5rem] w-full shadow-2xl transition-all hover:border-blue-500/30">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5 text-white">
                        <span className="text-[10px] font-bold tracking-[0.2em] flex items-center gap-2"><Activity size={12} className="text-blue-500 animate-pulse"/> SYSTEM</span>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_blue]"></div><span className="text-[9px] font-mono text-blue-400">CONECTADO</span></div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={()=>{playSynthSound('click'); setLang(lang==='ES'?'EN':'ES')}}><span className="tracking-widest">IDIOMA</span> <span className="text-white font-mono">{lang}</span></div>
                        <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={()=>{playSynthSound('click'); toggleSound();}}><span className="tracking-widest">SONIDO</span> <span className={soundEnabled ? "text-emerald-400" : "text-zinc-500"}>{soundEnabled ? 'ON' : 'MUTED'}</span></div>
                        <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={handleDayNight}><span className="tracking-widest">VISIÓN</span> <div className="flex items-center gap-1"><Sun size={10}/> DÍA/NOCHE</div></div>
                    </div>
                    <div className="mt-4 pt-2 border-t border-white/5 space-y-1">
                        {notifications.map((n,i)=>(<div key={i} className="bg-blue-900/20 border-l-2 border-blue-500 p-2 rounded flex items-center gap-2 animate-slide-in-right"><Bell size={10} className="text-blue-400"/><span className="text-[9px] text-blue-100">{n.title}</span></div>))}
                    </div>
                </div>
              </div>

              {/* Controles 3D */}
              <div className="absolute top-1/2 -translate-y-1/2 right-8 pointer-events-auto flex flex-col gap-2 animate-fade-in-right">
                  <button onClick={() => {playSynthSound('click'); map?.flyTo({pitch: 0});}} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black transition-all"><Square size={16}/></button>
                  <button onClick={() => {playSynthSound('click'); map?.flyTo({pitch: 60});}} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black transition-all"><Box size={16}/></button>
              </div>

              {/* Botón GPS */}
              <button className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-auto p-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all shadow-2xl group animate-fade-in-down" onClick={() => { addNotification("GPS RECALIBRADO"); map?.flyTo({center: [-3.6905, 40.4250], zoom: 16.5, pitch: 65, bearing: -15, duration: 3000}); }}>
                  <Crosshair className="w-5 h-5 text-white/80 group-hover:rotate-90 transition-transform duration-700" />
              </button>
           </div>
           
           {/* ... AQUI SIGUEN SUS PANELES (NANO CARD, DETAILS, FILTERS...) NO LOS TOQUE ... */}

   
          {/* ZONA INFERIOR */}
<div className="pointer-events-auto w-full px-4 flex justify-center items-end mb-12 relative z-[100]">

  {/* PANEL IZQUIERDO: DETALLES (EDICIÓN CUPERTINO VIP) */}
  {activePanel === 'DETAILS' && selectedProp && (
    <div className="fixed inset-y-0 left-0 w-full md:w-[500px] z-[60000] flex flex-col pointer-events-auto animate-slide-in-left">
      
      {/* 1. FONDO DE CRISTAL APPLE (Blur Extremo) */}
      <div className="absolute inset-0 bg-white/85 backdrop-blur-3xl shadow-[20px_0_50px_rgba(0,0,0,0.15)]"></div>

      {/* 2. CONTENIDO (Capas Superiores) */}
      <div className="relative z-10 flex flex-col h-full text-slate-900">

        {/* --- HEADER --- */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start flex-shrink-0">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0071e3] text-[10px] font-bold uppercase tracking-wide border border-blue-100/50">
                        {selectedProp.type || "Inmueble"}
                    </span>
                    {selectedProp.role === 'PREMIUM' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wide border border-amber-100/50">
                            <Star size={10} className="fill-current" /> Premium
                        </span>
                    )}
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                   {selectedProp.title || "Activo Exclusivo"}
                </h2>
                <p className="text-lg font-medium text-slate-500 mt-1">
                    {selectedProp.formattedPrice || (selectedProp.price ? (selectedProp.price/1000000).toFixed(2) + "M €" : "Consultar")}
                </p>
            </div>
            <button 
                onClick={() => toggleMainPanel('NONE')}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all hover:rotate-90 active:scale-90"
            >
                <X size={20} />
            </button>
        </div>

        {/* --- CONTENIDO SCROLLABLE --- */}
        <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-8 
             scrollbar-thin scrollbar-track-transparent 
            [&::-webkit-scrollbar-thumb]:bg-slate-200 
            [&::-webkit-scrollbar-thumb]:rounded-full 
            hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">

            {/* A. VISOR DE FOTOS (Estilo iPad Pro) */}
            {(() => {
                const mockAlbum = [selectedProp.img, ...MOCK_IMGS];
                const uniqueImages = [...new Set(mockAlbum)].slice(0, 5);
                const currentImageSrc = uniqueImages[currentImgIndex] || uniqueImages[0];
                
                const nextPhoto = (e) => { e.stopPropagation(); setCurrentImgIndex((prev) => (prev + 1) % uniqueImages.length); };
                const prevPhoto = (e) => { e.stopPropagation(); setCurrentImgIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length); };

                return (
                    <div 
                        onClick={() => { if(soundEnabled) playSynthSound('click'); setActivePanel('INSPECTOR'); }}
                        className="relative h-64 rounded-[2rem] overflow-hidden group shadow-xl shadow-slate-200/50 cursor-pointer border border-white/50 select-none transform transition-transform hover:scale-[1.02] duration-500"
                    >
                        <img 
                            src={currentImageSrc} 
                            className="w-full h-full object-cover"
                            alt="Propiedad"
                        />
                        
                        {/* Degradado sutil para controles */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Controles Flotantes (Solo aparecen en hover) */}
                        {uniqueImages.length > 1 && (
                            <>
                                <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 duration-300 border border-white/20 shadow-lg"><ChevronLeft size={20}/></button>
                                <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 translate-x-[10px] group-hover:translate-x-0 duration-300 border border-white/20 shadow-lg"><ChevronRight size={20}/></button>
                                
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                                    {uniqueImages.map((_, idx) => (
                                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentImgIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}/>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Botón Expandir */}
                        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:bg-white hover:text-black">
                             <Maximize2 size={16} />
                        </div>
                    </div>
                );
            })()}

            {/* B. FICHA TÉCNICA (Grid Limpio) */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-1 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dormitorios</span>
                    <span className="text-xl font-bold text-slate-900 flex items-center gap-1"><Bed size={16} className="text-slate-400"/> 4</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-1 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baños</span>
                    <span className="text-xl font-bold text-slate-900 flex items-center gap-1"><Bath size={16} className="text-slate-400"/> 3</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-1 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Superficie</span>
                    <span className="text-xl font-bold text-slate-900 flex items-center gap-1"><Maximize2 size={16} className="text-slate-400"/> 280<span className="text-xs align-top">m²</span></span>
                </div>
            </div>

            {/* C. DESCRIPCIÓN */}
            <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Sobre este activo</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    "{selectedProp.description || "Ubicado en la zona más prestigiosa de la ciudad, este activo representa una oportunidad única de inversión. Acabados de lujo, domótica integrada y vistas panorámicas definen esta propiedad exclusiva."}"
                </p>
            </div>

            {/* D. BOTONES DE ACCIÓN (Estilo iOS) */}
            <div className="flex gap-3">
                <button className="flex-1 py-4 bg-slate-900 text-white font-bold text-sm rounded-2xl hover:bg-black transition-all shadow-lg shadow-slate-200/50 flex items-center justify-center gap-2 active:scale-95">
                    <Phone size={16}/> Contactar
                </button>
                <button 
                    onClick={()=>{ onToggleFavorite(selectedProp); addNotification(favorites.some(f=>f.id===selectedProp.id) ? "ELIMINADO DE FAVORITOS" : "GUARDADO EN FAVORITOS"); }} 
                    className={`
                        w-14 rounded-2xl flex items-center justify-center transition-all border active:scale-90
                        ${favorites.some(f=>f.id===selectedProp.id) 
                            ? 'bg-red-50 border-red-100 text-red-500 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'}
                    `}
                >
                    <Heart size={20} fill={favorites.some(f=>f.id===selectedProp.id)?"currentColor":"none"}/>
                </button>
            </div>

            {/* E. SECCIÓN IMPACTO (Transformación: De Cyberpunk a Clean Dashboard) */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                
                {/* Header Sección */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp size={14} className="text-[#0071e3]"/> IMPACTO DE MERCADO
                    </span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> LIVE
                    </span>
                </div>

                {/* Grid de Estadísticas */}
                <div className="flex justify-between items-center mb-8 px-2">
                    <div className="text-center">
                        <div className="text-2xl font-black text-slate-900">{(selectedProp.id * 34) % 800 + 120}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Visitas</div>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-100"></div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-slate-900">{(selectedProp.id * 7) % 100 + 15}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Guardados</div>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-100"></div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-[#0071e3]">+{((selectedProp.id * 1.5) % 20 + 5).toFixed(1)}%</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Interés</div>
                    </div>
                </div>

                {/* Grid de Servicios Activos (Estilo Iconos iOS) */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/50">
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-4 text-center">
                       Servicios Activos
                    </p>
                    <div className="grid grid-cols-3 gap-y-6 gap-x-2">
                        {/* Mapeo manual para control total de diseño */}
                        {[
                            { icon: Camera, label: "Pro Photo", color: "text-amber-600", bg: "bg-amber-100" },
                            { icon: Zap, label: "Boost", color: "text-blue-600", bg: "bg-blue-100" },
                            { icon: Globe, label: "Global", color: "text-indigo-600", bg: "bg-indigo-100" },
                            { icon: Newspaper, label: "Offline", color: "text-slate-600", bg: "bg-slate-200" },
                            { icon: Share2, label: "Social", color: "text-pink-600", bg: "bg-pink-100" },
                            { icon: Shield, label: "Verified", color: "text-emerald-600", bg: "bg-emerald-100" },
                        ].map((s, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 group cursor-help">
                                <div className={`w-10 h-10 rounded-full ${s.bg} ${s.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                    <s.icon size={16} strokeWidth={2.5}/>
                                </div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* F. TARJETA AGENCIA (Clean Contact Card) */}
            <div className="bg-white rounded-[2rem] p-1 border border-slate-100 shadow-lg shadow-slate-200/50">
                <div className="bg-slate-50/50 rounded-[1.8rem] p-5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                            <img 
                                src={`https://randomuser.me/api/portraits/men/${selectedProp.id % 50}.jpg`} 
                                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                                alt="Agente"
                            />
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-bold text-slate-900">Century Global</span>
                                <span className="px-1.5 py-0.5 bg-[#0071e3] text-white text-[8px] font-black uppercase tracking-wider rounded">Partner</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Agente Senior · Respuesta inmed.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                            <span className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Tiempo Venta</span>
                            <span className="block text-sm font-bold text-slate-900">14 Días</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                            <span className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Ventas Mes</span>
                            <span className="block text-sm font-bold text-slate-900">8 Uds.</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  )}






{/* RENDERIZADO DEL INSPECTOR GRANDE */}
{activePanel === 'INSPECTOR' && selectedProp && (
  <HoloInspector
    prop={selectedProp}
    soundFunc={soundEnabled ? playSynthSound : undefined}
    onClose={() => setActivePanel('DETAILS')}
  />
)}





              {/* PANEL CENTRAL: FILTROS */}
              {activePanel === 'FILTERS' && (
                  <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-lg z-20">
<div className="rounded-[2.5rem] p-8 animate-fade-in-up origin-bottom bg-[#050505] border border-white/10">
                        <div className="flex justify-between items-center mb-8 text-white"><span className="text-xs font-bold tracking-[0.3em] flex items-center gap-2"><SlidersHorizontal size={14} className="text-blue-500"/> FILTROS TÁCTICOS</span><button onClick={()=>toggleMainPanel('NONE')}><X size={18}/></button></div>
                        <div className="space-y-6">
                            <div className="space-y-3"><div className="flex justify-between text-[10px] text-white/60 uppercase tracking-widest"><span>PRESUPUESTO</span><span className="text-white font-mono">2.5M €</span></div><div className="h-1.5 bg-zinc-800 rounded-full"><div className="h-full bg-blue-600 w-[70%] shadow-[0_0_15px_blue]" /></div></div>
                            <div className="grid grid-cols-3 gap-3">{['TODO', 'CASA', 'PISO'].map((t, i) => <button key={t} className={`py-4 border border-white/10 text-[10px] font-bold text-white rounded-2xl hover:bg-white hover:text-black transition-all tracking-widest ${i===0?'bg-white/10':''}`}>{t}</button>)}</div>
                        </div>
                      </div>
                  </div>
              )}

              {/* PANEL CENTRAL: AI CHAT (CORREGIDO) */}
              {activePanel === 'AI' && (
                  <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-lg z-20">
<div className="rounded-[2.5rem] p-8 animate-fade-in-up origin-bottom bg-[#050505] border border-blue-500/30">
                        <div className="flex justify-between items-center mb-6 text-white"><span className="text-xs font-bold tracking-[0.3em] flex items-center gap-2"><Sparkles size={14} className="text-blue-500 animate-pulse"/> OMNI INTELLIGENCE</span><button onClick={()=>toggleMainPanel('NONE')}><X size={18}/></button></div>
                        <div className="h-40 flex flex-col items-center justify-center text-center gap-4">
                            {isAiTyping ? 
                                (<div className="flex gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"/><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"/><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"/></div>)
                                : (<><div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30"><MessageCircle size={20} className="text-blue-400"/></div>
                                   <p className="text-white/50 text-xs max-w-xs">{aiResponse || "He detectado 3 áticos en Barrio Salamanca que coinciden con su perfil de inversión."}</p></>)
                            }
                        </div>
                        <div className="flex gap-2 relative">
                            <input 
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-blue-500 transition-colors" 
                                placeholder={isListening ? "Escuchando..." : "Escriba su consulta..."} 
                                autoFocus 
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAICommand(e)}
                            />
                            <button onClick={(e) => handleAICommand(e)} className="bg-blue-600 p-3 rounded-xl text-white hover:scale-105 transition-transform"><Send size={16}/></button>
                        </div>
                      </div>
                  </div>
              )}

             <VaultPanel
  rightPanel={rightPanel}
  toggleRightPanel={toggleRightPanel}
  favorites={favorites}
  onToggleFavorite={onToggleFavorite}
  map={map}
  soundEnabled={soundEnabled}
  playSynthSound={playSynthSound}
/>


            <ProfilePanel
  rightPanel={rightPanel}
  toggleRightPanel={toggleRightPanel}
  toggleMainPanel={toggleMainPanel}
  selectedReqs={selectedReqs}
  soundEnabled={soundEnabled}
  playSynthSound={playSynthSound}
/>

          
      {/* PANEL IZQUIERDO: MARKETPLACE (ESTILO CUPERTINO - CLEAN WHITE) */}
{activePanel === "MARKETPLACE" && (
  <div className="fixed inset-y-0 left-0 w-full md:w-[500px] z-[60000] flex flex-col pointer-events-auto animate-slide-in-left">
    
    {/* 1. FONDO: EFECTO "PERTICNO VIRPINO" (BLUR) */}
    <div className="absolute inset-0 bg-white/80 backdrop-blur-3xl shadow-[20px_0_40px_rgba(0,0,0,0.1)]"></div>
    
    {/* 2. CONTENIDO RELATIVO (Z-10) */}
    <div className="relative z-10 flex flex-col h-full text-slate-900">
        
        {/* HEADER */}
        <div className="p-8 pb-4 flex-shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight text-black mb-1">
                Servicios.
              </h2>
              <p className="text-lg font-medium text-slate-500">
                Estrategia de venta.
              </p>
            </div>

            <button 
              onClick={() => toggleMainPanel("NONE")}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* BARRA DE PROGRESO (Estilo iOS) */}
          <div className="bg-white/50 rounded-2xl p-4 border border-slate-100 shadow-sm backdrop-blur-md">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nivel de Autoridad</span>
                <span className="text-[10px] font-bold text-[#0071e3]">{selectedReqs.length} / 26 Activos</span>
            </div>
            
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-[#0071e3] transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) rounded-full shadow-[0_0_10px_rgba(0,113,227,0.4)]" 
                    style={{ width: `${Math.min(100, (selectedReqs.length / 26) * 100)}%` }}
                ></div>
            </div>
          </div>
        </div>

        {/* PESTAÑAS (SEGMENTED CONTROL IOS) */}
        <div className="px-8 py-2 flex-shrink-0">
            <div className="flex p-1 bg-slate-100/80 backdrop-blur-md rounded-xl">
                {['ONLINE', 'OFFLINE', 'PACK'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => { if(soundEnabled) playSynthSound('click'); setMarketTab(tab); }}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${marketTab === tab ? 'bg-white text-black shadow-sm scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {/* GRID DE SERVICIOS (SCROLL AZUL) */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4
            scrollbar-thin scrollbar-track-transparent 
            [&::-webkit-scrollbar-thumb]:bg-[#0071e3]/20 
            [&::-webkit-scrollbar-thumb]:rounded-full 
            hover:[&::-webkit-scrollbar-thumb]:bg-[#0071e3]"
        >
            <div className="grid grid-cols-2 gap-4 pb-20">
                {MARKET_CATALOG.filter(i => i.category === marketTab).map((item) => {
                    const isActive = selectedReqs.includes(item.id);
                    return (
                        <div 
                            key={item.id} 
                            onClick={() => toggleRequirement(item)}
                            className={`
                                relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer group flex flex-col justify-between gap-3 min-h-[160px]
                                ${isActive 
                                    ? 'bg-blue-50/80 border-[#0071e3]/30 ring-1 ring-[#0071e3]' 
                                    : 'bg-white/60 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-lg hover:-translate-y-1'}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-2xl transition-colors ${isActive ? 'bg-[#0071e3] text-white shadow-md shadow-blue-500/30' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}`}>
                                    <item.icon size={18} />
                                </div>
                                <div className={`text-xs font-bold ${isActive ? 'text-[#0071e3]' : 'text-slate-400'}`}>
                                    {item.price}€
                                </div>
                            </div>

                            <div>
                                <div className={`text-sm font-bold mb-1 leading-tight ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {item.name}
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                                    {item.desc}
                                </div>
                            </div>

                            {isActive && (
                                <div className="absolute top-3 right-3 animate-scale-in">
                                    <div className="bg-[#0071e3] text-white rounded-full p-1 shadow-sm">
                                        <CheckCircle2 size={10} strokeWidth={3} />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* FOOTER FLOTANTE */}
        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-white via-white/95 to-transparent z-20">
            <div className="bg-white/50 backdrop-blur-xl border border-white/50 rounded-[2rem] p-1 shadow-2xl shadow-slate-200/50">
                <div className="flex justify-between items-center px-6 py-4">
                    <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Valor Impacto</div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{baitValue.toLocaleString()} €</div>
                    </div>
                    
                    {/* BOTÓN AZUL APPLE OFICIAL */}
                    <button 
                        disabled={baitValue === 0}
                        onClick={() => {
                            if(soundEnabled) playSynthSound('complete');
                            addNotification("Estrategia aplicada.");
                            toggleMainPanel('NONE');
                        }}
                        className={`
                            px-8 py-4 font-bold text-sm rounded-3xl transition-all shadow-lg active:scale-95 flex items-center gap-2
                            ${baitValue > 0 
                                ? 'bg-[#0071e3] hover:bg-[#0077ED] text-white shadow-[#0071e3]/30 cursor-pointer' 
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}
                        `}
                    >
                        {baitValue > 0 ? "Activar" : "Seleccionar"} <ArrowRight size={16}/>
                    </button>
                </div>
            </div>
        </div>

    </div>
  </div>
)}
           </div> 

           
    
           {/* OMNISEARCH DOCK (Lo restauramos porque al borrar hasta el final se pierde) */}
           <div className="absolute bottom-10 z-[10000] w-full px-6 pointer-events-none flex justify-center items-center">
              <div className="pointer-events-auto w-full max-w-3xl animate-fade-in-up delay-300">
                  <div className="relative glass-panel rounded-full p-2 px-6 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.8)] gap-4 hover:border-white/30 transition-all group bg-[#050505]/90">
                    
                    <div className="flex gap-2 items-center">
                        <button onClick={() => setSystemMode('GATEWAY')} className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"><LayoutGrid size={18} /></button>
                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                        <button onClick={()=>toggleMainPanel('FILTERS')} className={`p-3 rounded-full transition-all hover:bg-white hover:text-black ${activePanel==='FILTERS'?'bg-white text-black':'text-white/50 hover:bg-white/5'}`}><SlidersHorizontal size={18}/></button>
                    </div>

                    <div className="flex-grow flex items-center gap-4 bg-white/[0.03] px-5 py-3 rounded-full border border-white/5 focus-within:border-blue-500/50 transition-all mx-2 group-hover:bg-white/[0.05]">
                        <Search size={16} className="text-white/40"/>
                        <input className="bg-transparent text-white w-full outline-none placeholder-white/20 text-xs font-light tracking-widest uppercase" placeholder="LOCALIZACIÓN, COMANDO O AGENTE..." />
                        <Mic size={16} onClick={activateVoiceCommand} className={`cursor-pointer transition-all ${isListening ? 'text-red-500 animate-pulse' : 'text-white/30 hover:text-white'}`}/>
                    </div>

                    <div className="flex gap-2 items-center">
                        <button onClick={()=>toggleMainPanel('AI')} className={`p-3 rounded-full transition-all hover:text-blue-400 relative ${activePanel==='AI'?'bg-blue-600 text-white shadow-lg':'text-white/50 hover:bg-blue-500/10'}`}>
                            <MessageCircle size={18}/>
                            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        </button>
                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                        <button onClick={()=>toggleRightPanel('VAULT')} className={`p-3 rounded-full transition-all hover:text-red-500 hover:bg-red-500/10 ${rightPanel==='VAULT'?'text-red-500':'text-white/50'}`}><Heart size={18}/></button>
                        <button onClick={()=>toggleRightPanel('PROFILE')} className={`p-3 rounded-full transition-all hover:text-white hover:bg-white/10 ${rightPanel==='PROFILE'?'text-white bg-white/10':'text-white/50'}`}><User size={18}/></button>
                    </div>

                  </div>
              </div>
           </div>
           
         </>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. MODO ARQUITECTO (FORMULARIO BLINDADO)
// ----------------------------------------------------------------------
const ArchitectHud = ({ onCloseMode, soundFunc }) => {
  const [viewState, setViewState] = useState('INTRO'); // INTRO, DATA, SPECS, PHOTO, SCAN, SUCCESS

  // CLASES DE ESTILO (Z-Index extremo y Pointer Events activados)
  const modalContainerClass = "fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in pointer-events-auto";
  const modalBoxClass = "glass-panel w-full max-w-xl rounded-[2.5rem] p-10 shadow-[0_0_80px_rgba(245,158,11,0.2)] relative overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar pointer-events-auto";

  // Función segura para reproducir sonidos sin romper la app
  const playSound = (type) => {
    if (soundFunc && typeof soundFunc === 'function') {
        try { soundFunc(type); } catch (e) { console.log("Audio error ignorado"); }
    }
  };

// --- TEST DE CONEXIÓN IA ---
  useEffect(() => {
    console.log("⚡ SYSTEM: Iniciando handshake con la IA...");
    
    const testTimer = setTimeout(() => {
      console.log("🤖 IA: [CONEXIÓN CONFIRMADA] Sistemas listos.");
      // Hacemos que suene para confirmar que está viva
      playSound('complete'); 
    }, 2000);

    return () => clearTimeout(testTimer);
  }, []);
  // ---------------------------

  // EFECTO: Simular proceso de carga cuando llegamos a 'SCAN'
  useEffect(() => {
    if (viewState === 'SCAN') {
      const timer = setTimeout(() => {
        playSound('complete'); 
        setViewState('SUCCESS'); 
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [viewState]);

  // 1. PANTALLA INTRODUCCIÓN
  if (viewState === 'INTRO') return (
    <div className={modalContainerClass}>
        <div className={`${modalBoxClass} text-center`}>
            {/* Círculo del icono */}
            <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-amber-500/20 animate-pulse">
                <BuildingIcon className="text-amber-500" size={48} />
            </div>
            
            {/* Textos */}
            <h3 className="text-white font-light text-4xl mb-4 tracking-tight">MODO ARQUITECTO</h3>
            <p className="text-white/50 text-sm mb-10 max-w-xs mx-auto">Digitalice su activo inmobiliario en 3 pasos simples.</p>
            
            {/* BOTÓN COMENZAR (CON PROTECCIÓN DE CLIC) */}
            <button 
                onClick={() => {
                    playSound('click'); 
                    setViewState('DATA');
                }} 
                className="w-full py-5 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-sm tracking-[0.25em] rounded-2xl hover:scale-105 transition-transform shadow-xl cursor-pointer active:scale-95"
            >
                COMENZAR
            </button>
            
            {/* Botón Cancelar */}
            <button 
                onClick={() => onCloseMode(false)} 
                className="mt-6 text-white/30 text-[10px] hover:text-white uppercase tracking-[0.2em] cursor-pointer"
            >
                CANCELAR
            </button>
        </div>
    </div>
  );

  // PANTALLAS DEL PROCESO
  return (
    <div className={modalContainerClass}>
      <div className={modalBoxClass}>
        
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4 sticky top-0 z-10 bg-[#050505]/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
                <BuildingIcon className="text-amber-500 animate-pulse" size={20} />
                <span className="text-xs font-bold text-amber-500 tracking-[0.3em]">SISTEMA ARQUITECTO</span>
            </div>
            <button onClick={() => onCloseMode(false)} className="text-white/30 hover:text-white transition-colors cursor-pointer">
                <X size={18}/>
            </button>
        </div>

        {/* 1. VISTA DE DATOS */}
        {viewState === 'DATA' && (
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-2xl text-white font-light mb-6">1. Datos del Activo</h3>
                <div>
                    <label className="text-[10px] uppercase text-white/50 tracking-wider mb-2 block">Dirección</label>
                    <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-amber-500 transition-colors" placeholder="Calle, Número..." />
                </div>
                <div>
                    <label className="text-[10px] uppercase text-white/50 tracking-wider mb-2 block">Precio (€)</label>
                    <input type="number" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-amber-500 transition-colors" placeholder="0.00" />
                </div>
                <button onClick={()=>{playSound('click'); setViewState('SPECS');}} className="w-full mt-4 py-4 bg-white text-black font-bold tracking-[0.2em] rounded-xl hover:bg-gray-200 cursor-pointer">SIGUIENTE</button>
            </div>
        )}

        {/* 2. VISTA DE CARACTERÍSTICAS */}
        {viewState === 'SPECS' && (
            <div className="space-y-8 animate-fade-in">
                <h3 className="text-2xl text-white font-light mb-6">2. Características</h3>
                <div className="flex gap-4 items-center">
                    <Bed className="text-white/50"/>
                    <div className="flex gap-2 flex-1">
                        {[1,2,3,4,5].map(n=><button key={n} className="flex-1 h-12 border border-white/10 rounded-lg text-white hover:bg-white hover:text-black transition-all cursor-pointer">{n}</button>)}
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <Bath className="text-white/50"/>
                    <div className="flex gap-2 flex-1">
                        {[1,2,3,4].map(n=><button key={n} className="flex-1 h-12 border border-white/10 rounded-lg text-white hover:bg-white hover:text-black transition-all cursor-pointer">{n}</button>)}
                    </div>
                </div>
                <button onClick={()=>{playSound('click'); setViewState('PHOTO');}} className="w-full mt-4 py-4 bg-white text-black font-bold tracking-[0.2em] rounded-xl hover:bg-gray-200 cursor-pointer">SIGUIENTE</button>
            </div>
        )}

        {/* 3. VISTA DE FOTO */}
        {viewState === 'PHOTO' && (
            <div className="space-y-6 animate-fade-in text-center">
                <h3 className="text-2xl text-white font-light">3. Material Visual</h3>
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 hover:border-amber-500/50 cursor-pointer transition-all bg-white/[0.02]">
                    <Camera className="mx-auto text-white/30 mb-4" size={32}/>
                    <p className="text-xs text-white/50 uppercase tracking-widest">Subir Imágenes</p>
                </div>
                <button onClick={()=>{playSound('boot'); setViewState('SCAN');}} className="w-full mt-4 py-4 bg-amber-500 text-black font-bold tracking-[0.2em] rounded-xl hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer">FINALIZAR Y ESCANEAR</button>
            </div>
        )}
        
        {/* 4. VISTA DE ESCANEO (SIMULACIÓN) */}
        {viewState === 'SCAN' && (
             <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-amber-500/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-t-amber-500 rounded-full animate-spin"></div>
                    <BuildingIcon className="absolute inset-0 m-auto text-amber-500 animate-pulse" />
                </div>
                <h3 className="text-xl text-white font-light tracking-widest mb-2">DIGITALIZANDO ACTIVO</h3>
                <p className="text-xs text-white/30 font-mono">ENCRIPTANDO DATOS EN BLOCKCHAIN...</p>
             </div>
        )}

        {/* 5. VISTA DE ÉXITO */}
        {viewState === 'SUCCESS' && (
             <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                    <div className="text-green-400 text-3xl">✓</div>
                </div>
                <h3 className="text-3xl text-white font-light mb-2">¡ACTIVO DIGITALIZADO!</h3>
                <p className="text-white/50 text-sm mb-8 max-w-xs mx-auto">Su propiedad ha sido registrada en Stratosfere OS correctamente.</p>
                <button onClick={() => onCloseMode(true)} className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-bold tracking-widest text-white transition-all cursor-pointer">
    ENTRAR AL SISTEMA
</button>
             </div>
        )}

      </div>
    </div>
  );
};



const DualGateway = ({ onSelectMode }) => {
    // 1. Configuración de referencias y estado
    const canvasRef = React.useRef(null);

    // 2. Lógica del Efecto Constelación (Canvas)
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let w, h, particles;
        const particleCount = 100;
        const connectionDistance = 100;
        const mouse = { x: null, y: null, radius: 150 };

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        
        class Particle {
            constructor() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = Math.random() * 0.5 - 0.25;
                this.vy = Math.random() * 0.5 - 0.25;
                this.size = Math.random() * 1.5 + 0.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > w) this.vx *= -1;
                if (this.y < 0 || this.y > h) this.vy *= -1;

                if (mouse.x !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        this.x -= Math.cos(angle) * force * 2;
                        this.y -= Math.sin(angle) * force * 2;
                    }
                }
            }
            draw() {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            connectParticles();
            requestAnimationFrame(animate);
        };

        const connectParticles = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < connectionDistance) {
                        const opacity = 1 - distance / connectionDistance;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };
        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };

        window.addEventListener('resize', resize);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        
        resize();
        init();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#020412]">
            {/* Canvas para el efecto de constelación */}
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 z-0"
            />

            <div className="relative z-10 flex flex-col items-center justify-center p-4 w-full max-w-6xl">
                {/* Título Principal */}
                <h1 className="text-4xl md:text-6xl font-thin text-white tracking-[0.3em] text-center mb-16 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    SELECCIONA TU CAMINO
                </h1>
                
                {/* Contenedor de Tarjetas */}
                <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch w-full z-10">
                    
                    {/* TARJETA EXPLORADOR (AZUL - ALTA VISIBILIDAD) */}
                    <div 
                        onClick={() => onSelectMode('EXPLORER')} 
                        className="group cursor-pointer glass-panel p-12 md:p-16 rounded-[2.5rem] 
                        border border-blue-500/70 hover:border-cyan-400 
                        bg-blue-950/50 backdrop-blur-xl text-center 
                        transition-all duration-500 hover:scale-[1.02] 
                        shadow-[0_0_40px_rgba(37,99,235,0.35)] hover:shadow-[0_0_80px_rgba(37,99,235,0.8)] 
                        relative overflow-hidden h-[450px] md:h-[500px] flex flex-col justify-center items-center w-full md:w-1/2"
                    >
                        {/* Fondo Gradiente Base (Visible siempre) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-blue-900/40 opacity-100 mix-blend-screen"></div>
                        
                        <div className="relative z-10 transform group-hover:-translate-y-3 transition-transform duration-500 ease-out">
                            {/* Círculo del icono (Brillo permanente) */}
                            <div className="w-24 h-24 md:w-28 md:h-28 bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10 
                                border-2 border-blue-400/80 shadow-[0_0_30px_rgba(59,130,246,0.5)] 
                                group-hover:border-cyan-300 group-hover:shadow-[0_0_70px_rgba(59,130,246,1)] 
                                group-hover:bg-blue-500/20 transition-all duration-500">
                                <RadarIcon className="w-10 h-10 md:w-12 md:h-12 text-blue-300 drop-shadow-[0_0_15px_rgba(103,232,249,0.8)] group-hover:text-cyan-50 group-hover:drop-shadow-[0_0_30px_rgba(103,232,249,1)] transition-all duration-500" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-light text-blue-100 tracking-[0.2em] mb-4 drop-shadow-[0_2px_15px_rgba(37,99,235,0.6)] group-hover:text-white group-hover:drop-shadow-[0_2px_20px_rgba(37,99,235,1)] transition-all">
                                EXPLORADOR
                            </h2>
                            <p className="text-xs md:text-sm text-blue-300 font-mono tracking-[0.3em] uppercase group-hover:text-cyan-100 transition-colors drop-shadow-md">
                                BUSCO OPORTUNIDADES
                            </p>
                        </div>
                    </div>

                    {/* TARJETA ARQUITECTO (ÁMBAR - ALTA VISIBILIDAD) */}
                    <div 
                        onClick={() => onSelectMode('ARCHITECT')} 
                        className="group cursor-pointer glass-panel p-12 md:p-16 rounded-[2.5rem] 
                        border border-amber-500/70 hover:border-orange-400 
                        bg-amber-950/50 backdrop-blur-xl text-center 
                        transition-all duration-500 hover:scale-[1.02] 
                        shadow-[0_0_40px_rgba(217,119,6,0.35)] hover:shadow-[0_0_80px_rgba(217,119,6,0.8)] 
                        relative overflow-hidden h-[450px] md:h-[500px] flex flex-col justify-center items-center w-full md:w-1/2"
                    >
                        {/* Fondo Gradiente Base (Visible siempre) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-transparent to-amber-900/40 opacity-100 mix-blend-screen"></div>
                        
                        <div className="relative z-10 transform group-hover:-translate-y-3 transition-transform duration-500 ease-out">
                            {/* Círculo del icono (Brillo permanente) */}
                            <div className="w-24 h-24 md:w-28 md:h-28 bg-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10 
                                border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.5)] 
                                group-hover:border-orange-300 group-hover:shadow-[0_0_70px_rgba(245,158,11,1)] 
                                group-hover:bg-amber-500/20 transition-all duration-500">
                                <BuildingIcon className="w-10 h-10 md:w-12 md:h-12 text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] group-hover:text-orange-50 group-hover:drop-shadow-[0_0_30px_rgba(251,191,36,1)] transition-all duration-500" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-light text-amber-100 tracking-[0.2em] mb-4 drop-shadow-[0_2px_15px_rgba(217,119,6,0.6)] group-hover:text-white group-hover:drop-shadow-[0_2px_20px_rgba(217,119,6,1)] transition-all">
                                ARQUITECTO
                            </h2>
                            <p className="text-xs md:text-sm text-amber-300 font-mono tracking-[0.3em] uppercase group-hover:text-orange-100 transition-colors drop-shadow-md">
                                GESTIONAR MI ACTIVO
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

