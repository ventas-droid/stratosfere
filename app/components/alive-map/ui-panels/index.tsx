// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';

// 1. IMPORTACIÓN DE ICONOS (Incluye los tácticos de Agencia)
import { 
  LayoutGrid, Search, Mic, Bell, MessageCircle, Heart, User, Sparkles, Activity, X, Send, 
  Square, Box, Crosshair, Sun, Phone, Maximize2, Bed, Bath, TrendingUp, CheckCircle2,
  Camera, Zap, Globe, Newspaper, Share2, Shield, Store, SlidersHorizontal, Settings,
  Briefcase, Home, Map as MapIcon 
} from 'lucide-react';

// --- 2. EL CEREBRO DE BÚSQUEDA ---
import { CONTEXT_CONFIG } from '../smart-search'; 

// --- 3. PANELES GENERALES ---
import ProfilePanel from "./ProfilePanel";
import DualGateway from "./DualGateway";
import VaultPanel from "./VaultPanel";         
import HoloInspector from "./HoloInspector";   
import MarketPanel from './MarketPanel'; 
import DualSlider from './DualSlider';
import DetailsPanel from "./DetailsPanel"; 
import StratosConsole from "./StratosConsole";
import LandingWaitlist from "./LandingWaitlist";

// --- 4. PANELES DE AGENCIA ---
import ArchitectHud from "./ArchitectHud";     
import AgencyPortfolioPanel from "./AgencyPortfolioPanel";
import AgencyProfilePanel from "./AgencyProfilePanel";
import AgencyMarketPanel from "./AgencyMarketPanel";
import TacticalRadarController from "./TacticalRadarController"; // EL RADAR
import AgencyOSPropertyBridge from "../agency-os/AgencyOSPropertyBridge"; 

// --- 5. UTILIDADES ---
import { playSynthSound } from './audio';

export const LUXURY_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100"
];

export default function UIPanels({ 
  map, 
  searchCity, 
  lang, setLang, soundEnabled, toggleSound, systemMode, setSystemMode 
}: any) {
  
  // --- A. ESTADOS DEL SISTEMA ---
  const [gateUnlocked, setGateUnlocked] = useState(false); 
  const [activePanel, setActivePanel] = useState('NONE'); 
  const [rightPanel, setRightPanel] = useState('NONE');   
  const [selectedProp, setSelectedProp] = useState<any>(null); 
  const [editingProp, setEditingProp] = useState<any>(null);
  const [marketProp, setMarketProp] = useState<any>(null);
  
  const [showRocket, setShowRocket] = useState(false);
  const [landingComplete, setLandingComplete] = useState(false); 
  const [showAdvancedConsole, setShowAdvancedConsole] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Filtros y Favoritos
  const [localFavs, setLocalFavs] = useState<any[]>([]);
  const [selectedReqs, setSelectedReqs] = useState<string[]>([]);
  
  // IA y Buscador
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // --- B. LÓGICA DE FAVORITOS ---
  useEffect(() => {
      const loadFavs = () => {
          const saved = localStorage.getItem('stratos_favorites_v1');
          if (saved) { try { setLocalFavs(JSON.parse(saved)); } catch(e) {} }
      };
      loadFavs();
      window.addEventListener('reload-favorites', loadFavs);
      return () => window.removeEventListener('reload-favorites', loadFavs);
  }, []);

  useEffect(() => {
      localStorage.setItem('stratos_favorites_v1', JSON.stringify(localFavs));
  }, [localFavs]);

  const handleToggleFavorite = (prop: any) => {
      if (!prop) return;
      if (soundEnabled) playSynthSound('click');

      const safeProp = { ...prop, id: prop.id || Date.now() };
      const exists = localFavs.some(f => f.id === safeProp.id);
      let newFavs;
      let newStatus;

      if (exists) {
          newFavs = localFavs.filter(f => f.id !== safeProp.id);
          addNotification("Eliminado de colección");
          localStorage.removeItem(`fav-${safeProp.id}`); 
          newStatus = false;
      } else {
          newFavs = [...localFavs, { ...safeProp, savedAt: Date.now() }];
          addNotification("Guardado en Favoritos");
          localStorage.setItem(`fav-${safeProp.id}`, 'true');
          setRightPanel('VAULT'); 
          newStatus = true;
      }
      setLocalFavs(newFavs);
      if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sync-property-state', { detail: { id: safeProp.id, isFav: newStatus } }));
      }
  };

  // --- C. HELPERS Y NAVEGACIÓN ---
  const toggleRightPanel = (p: string) => { 
      if(soundEnabled) playSynthSound('click'); 
      setRightPanel(rightPanel === p ? 'NONE' : p); 
  };

  const handleEditAsset = (asset: any) => {
      if(soundEnabled) playSynthSound('click');
      setEditingProp(asset);
      setRightPanel('NONE');
      setSystemMode('ARCHITECT');
  };

  const addNotification = (title: string) => {
      setNotifications(prev => [{title}, ...prev].slice(0, 3));
      setTimeout(() => setNotifications(prev => prev.slice(0, -1)), 4000);
  };

  const handleDayNight = () => {
      if(soundEnabled) playSynthSound('click');
      addNotification("Visión Nocturna Alternada");
  };

  const handleAICommand = (e: any) => {
    if (e) e.preventDefault(); 
    if (!aiInput.trim()) return;
    if (soundEnabled) playSynthSound('click');
    setIsAiTyping(true); 

    if (searchCity) {
        searchCity(aiInput); 
        addNotification(`Rastreando: ${aiInput.toUpperCase()}`);
    }
    setTimeout(() => { 
        setAiResponse(`Objetivo confirmado: "${aiInput}". Iniciando aproximación...`); 
        setIsAiTyping(false); 
        setAiInput(""); 
    }, 1500);
  };

  // --- D. EVENT LISTENERS ---
  useEffect(() => {
    const handleOpenDetails = (e: any) => {
        const propData = e.detail;
        const finalProp = { ...propData, id: propData.id || Date.now(), img: propData.img || LUXURY_IMAGES[0] };
        setSelectedProp(finalProp);
        setActivePanel('DETAILS');
        if(soundEnabled) playSynthSound('click');
    };

    const handleEditMarket = (e: any) => {
          console.log("🛒 Abriendo Mercado para:", e.detail.id);
          setMarketProp(e.detail);       
          setActivePanel('MARKETPLACE'); 
    };

    window.addEventListener('open-details-signal', handleOpenDetails);
    window.addEventListener('toggle-fav-signal', (e:any) => handleToggleFavorite(e.detail));
    window.addEventListener('edit-market-signal', handleEditMarket);
    
    return () => {
        window.removeEventListener('open-details-signal', handleOpenDetails);
        window.removeEventListener('toggle-fav-signal', (e:any) => handleToggleFavorite(e.detail));
        window.removeEventListener('edit-market-signal', handleEditMarket);
    };
  }, [soundEnabled, localFavs]); 

  // --- E. LANZAMIENTO Y ATERRIZAJE ---
  const handleStratosLaunch = (data: any) => {
      if(soundEnabled) playSynthSound('warp');
      
      const TYPE_TRANSLATOR: Record<string, string> = { 'flat': 'Piso', 'penthouse': 'Ático', 'villa': 'Villa', 'house': 'Villa', 'office': 'Oficina', 'industrial': 'Nave', 'land': 'Suelo', 'solar': 'Suelo' };
      const rawType = data.type; 
      const dbType = TYPE_TRANSLATOR[rawType] || rawType; 

      let derivedContext = 'VIVIENDA'; 
      if (['office', 'industrial', 'local', 'nave', 'oficina'].includes(rawType)) derivedContext = 'NEGOCIO';
      else if (['land', 'solar', 'suelo', 'terreno'].includes(rawType)) derivedContext = 'TERRENO';

      if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('apply-filter-signal', { 
              detail: { priceRange: { min: 0, max: data.priceMax }, surfaceRange: { min: 0, max: 10000 }, context: derivedContext, specs: data.specs, specificType: dbType } 
          }));
      }

      if(data.location && searchCity) {
          searchCity(data.location);
          if (typeof addNotification === 'function') addNotification(`Viajando a: ${data.location}`);
      } else {
          map?.current?.flyTo({ center: [-3.6883, 40.4280], pitch: 60, zoom: 14, duration: 2000 });
      }
      setLandingComplete(true);
      setShowAdvancedConsole(false);
  };

  // ===========================================================================
  // 🔒 RENDER: PROTOCOLO DE SEGURIDAD (WAITLIST + COHETE)
  // ===========================================================================
  if (!gateUnlocked) {
    if (!showRocket) {
        return <LandingWaitlist onUnlock={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setShowRocket(true); }} />;
    }
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center pointer-events-auto animate-fade-in select-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-80" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
            <path d="M-100,1200 C 400,900 600,1100 1100,700 C 1400,500 1500,450 1650,250" fill="none" stroke="black" strokeWidth="1.5" strokeDasharray="10 10" className="opacity-40"/>
            <g transform="translate(1680, 250) rotate(40) scale(0.9)">
                <path d="M0,-80 C 25,-50 25,50 20,80 L -20,80 C -25,50 -25,-50 0,-80 Z" fill="white" stroke="black" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M-20,60 L -40,90 L -20,80" fill="white" stroke="black" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M20,60 L 40,90 L 20,80" fill="white" stroke="black" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M0,60 L 0,90" stroke="black" strokeWidth="2" />
                <circle cx="0" cy="-20" r="10" fill="white" stroke="black" strokeWidth="2" />
            </g>
        </svg>
        <div className="relative z-10 text-center mb-24 cursor-default">
            <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter leading-none text-black">Stratosfere OS.</h1>
        </div>
        <button onClick={() => { playSynthSound('boot'); setGateUnlocked(true); }} className="group relative z-10 px-16 py-6 bg-[#0071e3] border-4 border-black text-white font-extrabold text-sm tracking-wider transition-all duration-200 shadow-[10px_10px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] hover:bg-black hover:text-white cursor-pointer">
            INITIALIZE SYSTEM
        </button>
      </div>
    );
  }

  // ===========================================================================
  // 🖥️ RENDER: INTERFAZ PRINCIPAL (OS)
  // ===========================================================================
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-end pb-8 animate-fade-in text-sans select-none">
       
       {systemMode === 'GATEWAY' && (
           <div className="fixed inset-0 z-[50000] flex items-center justify-center pointer-events-auto bg-[#050505]/80 backdrop-blur-xl animate-fade-in duration-1000">
               <DualGateway onSelectMode={(m:any) => { playSynthSound('boot'); setSystemMode(m); }} />
           </div>
       )}

       {/* --- MODO ARQUITECTO (VENDER) --- */}
       {systemMode === 'ARCHITECT' && (
           <ArchitectHud 
               soundFunc={typeof playSynthSound !== 'undefined' ? playSynthSound : undefined} 
               initialData={editingProp} 
               onCloseMode={(success: boolean, payload: any) => { 
                   setEditingProp(null); 
                   if (success) {
                       setSystemMode('EXPLORER');
                       setLandingComplete(true); 
                       if (payload && typeof window !== 'undefined') {
                           setTimeout(() => window.dispatchEvent(new CustomEvent('add-property-signal', { detail: payload })), 100);
                       }
                   } else {
                       setSystemMode('GATEWAY');
                   }
               }} 
           />
       )}

       {/* --- INTERFAZ UNIFICADA (EXPLORER + AGENCIA) --- */}
       {(systemMode === 'EXPLORER' || systemMode === 'AGENCY') && (
           <>
               {/* 1. CONSOLA DE ENTRADA */}
               {(showAdvancedConsole || !landingComplete) && (
                   <StratosConsole 
                       isInitial={!landingComplete} 
                       onClose={() => setShowAdvancedConsole(false)}
                       onLaunch={handleStratosLaunch}
                   />
               )}
      
               {/* 2. HUD FLOTANTE SUPERIOR */}
               <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  {/* LOGO */}
                  <div className="absolute top-8 left-8 pointer-events-auto animate-fade-in-up">
                    <h1 className="text-6xl font-extrabold tracking-tighter text-black leading-none cursor-default">Stratosfere OS.</h1>
                    {systemMode === 'AGENCY' && <div className="mt-2 inline-block bg-black text-white text-[10px] font-bold px-2 py-1 tracking-widest uppercase rounded">Agency Mode Active</div>}
                  </div>
                  {/* PANEL DERECHO */}
                  <div className="absolute top-8 right-8 pointer-events-auto flex flex-col gap-3 items-end w-[280px] animate-fade-in-up delay-100">
                    <div className="glass-panel p-5 rounded-[1.5rem] w-full shadow-2xl bg-[#050505]/90 border border-white/10 hover:border-blue-500/30 transition-all">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5 text-white">
                            <span className="text-[10px] font-extrabold tracking-tighter flex items-center gap-2">SYSTEM</span>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_blue]"></div><span className="text-[9px] font-mono text-blue-400">CONECTADO</span></div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={()=>{setLang(lang==='ES'?'EN':'ES')}}><span className="tracking-widest">IDIOMA</span> <span className="text-white font-mono">{lang}</span></div>
                            <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={toggleSound}><span className="tracking-widest">SONIDO</span> <span className={soundEnabled ? "text-emerald-400" : "text-zinc-500"}>{soundEnabled ? 'ON' : 'MUTED'}</span></div>
                            <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={handleDayNight}><span className="tracking-widest">VISIÓN</span> <div className="flex items-center gap-1"><Sun size={10}/> DÍA/NOCHE</div></div>
                        </div>
                        <div className="mt-4 pt-2 border-t border-white/5 space-y-1">
                            {notifications.map((n,i)=>(<div key={i} className="bg-blue-900/20 border-l-2 border-blue-500 p-2 rounded flex items-center gap-2 animate-slide-in-right"><Bell size={10} className="text-blue-400"/><span className="text-[9px] text-blue-100">{n.title}</span></div>))}
                        </div>
                    </div>
                  </div>
                  {/* CONTROLES 3D */}
                  <div className="absolute top-1/2 -translate-y-1/2 right-8 pointer-events-auto flex flex-col gap-2 animate-fade-in-right">
                      <button onClick={() => map?.current?.flyTo({pitch: 0})} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black transition-all"><Square size={16}/></button>
                      <button onClick={() => map?.current?.flyTo({pitch: 60})} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black transition-all"><Box size={16}/></button>
                  </div>
                  {/* GPS */}
                  <button className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-auto p-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all shadow-2xl group animate-fade-in-down" onClick={() => { 
                          if ("geolocation" in navigator) {
                              navigator.geolocation.getCurrentPosition((position) => {
                                  const { latitude, longitude } = position.coords;
                                  addNotification("GPS: UBICACIÓN ACTUAL");
                                  map?.current?.flyTo({ center: [longitude, latitude], zoom: 16.5, pitch: 60, bearing: 0, duration: 3000 });
                              });
                          }
                      }}>
                      <Crosshair className="w-5 h-5 text-white/80 group-hover:rotate-90 transition-transform duration-700" />
                  </button>
               </div>
               
               {/* 3. DOCK BARRA INFERIOR UNIFICADA (LA BARRA OMNI DE CRISTAL) */}
               <div className="absolute bottom-10 z-[10000] w-full px-6 pointer-events-none flex justify-center items-center">
                  <div className="pointer-events-auto w-full max-w-3xl animate-fade-in-up delay-300">
                      <div className="relative glass-panel rounded-full p-2 px-6 flex items-center justify-between shadow-2xl gap-4 bg-[#050505]/90 backdrop-blur-xl border border-white/10">
                        
                       {/* ZONA 1: IZQUIERDA */}
                        <div className="flex items-center gap-1">
                            <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setSystemMode('GATEWAY'); }} className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all" title="Menú Principal"><LayoutGrid size={18}/></button>
                            <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setShowAdvancedConsole(true); }} className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all" title="Filtros"><SlidersHorizontal size={18}/></button>
                        </div>

                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

                        {/* ZONA 2: SEARCH */}
                        <div className="flex-grow flex items-center gap-4 bg-white/[0.05] px-5 py-3 rounded-full border border-white/5 focus-within:border-blue-500/50 focus-within:bg-blue-500/5 transition-all group">
                          <Search size={16} className="text-white/40 group-focus-within:text-white transition-colors"/>
                          <input className="bg-transparent text-white w-full outline-none text-xs font-bold tracking-widest uppercase placeholder-white/20 cursor-text" placeholder={systemMode === 'AGENCY' ? "COMANDO AGENCIA..." : "LOCALIZACIÓN..."} value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAICommand(e); }} />
                          <Mic size={16} className="text-white/30"/>
                        </div>

                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                        
                        {/* ZONA 3: HERRAMIENTAS (DINÁMICAS) */}
                        <div className="flex items-center gap-1">
                            {/* --- COMUNES --- */}
                            <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setActivePanel(activePanel === 'CHAT' ? 'NONE' : 'CHAT'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${activePanel==='CHAT'?'text-blue-400':'text-white/50'}`}><MessageCircle size={18}/></button>
                            <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setActivePanel(activePanel === 'AI' ? 'NONE' : 'AI'); }} className={`p-3 rounded-full transition-all relative group ${activePanel==='AI'?'text-blue-300':'text-white/50'}`}><Sparkles size={18}/></button>
                            
                            {/* --- MODO AGENCIA (4 BOTONES) --- */}
                            {systemMode === 'AGENCY' ? (
                                <>
                                    <button title="Radar" onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setActivePanel(activePanel === 'AGENCY_RADAR' ? 'NONE' : 'AGENCY_RADAR'); }} className={`p-3 rounded-full transition-all ${activePanel==='AGENCY_RADAR'?'bg-white text-black':'text-white/50 hover:text-white'}`}><Activity size={18}/></button>
                                    <button title="Stock" onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setActivePanel(activePanel === 'AGENCY_STOCK' ? 'NONE' : 'AGENCY_STOCK'); }} className={`p-3 rounded-full transition-all ${activePanel==='AGENCY_STOCK'?'bg-white text-black':'text-white/50 hover:text-white'}`}><Home size={18}/></button>
                                    <button title="Market" onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setActivePanel(activePanel === 'AGENCY_MARKET' ? 'NONE' : 'AGENCY_MARKET'); }} className={`p-3 rounded-full transition-all ${activePanel==='AGENCY_MARKET'?'bg-emerald-500 text-white':'text-emerald-400 hover:text-white'}`}><Shield size={18}/></button>
                                    <button title="Perfil" onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); toggleRightPanel('AGENCY_PROFILE'); }} className={`p-3 rounded-full transition-all ${rightPanel==='AGENCY_PROFILE'?'bg-white text-black':'text-white/50 hover:text-white'}`}><Briefcase size={18}/></button>
                                </>
                            ) : (
                            /* --- MODO EXPLORADOR --- */
                                <>
                                    <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setActivePanel(activePanel === 'MARKETPLACE' ? 'NONE' : 'MARKETPLACE'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${activePanel==='MARKETPLACE'?'text-emerald-400':'text-white/50'}`}><Store size={18}/></button>
                                    <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); toggleRightPanel('VAULT'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${rightPanel==='VAULT'?'text-red-500':'text-white/50'}`}><Heart size={18}/></button>
                                    <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); toggleRightPanel('PROFILE'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${rightPanel==='PROFILE'?'text-white':'text-white/50'}`}><User size={18}/></button>
                                </>
                            )}
                        </div>
                      </div>
                  </div>
               </div>

               {/* ==========================================
                   ZONA DE PANELES FLOTANTES (TODOS)
                   ========================================== */}

               {/* 1. RADAR (AGENCIA) */}
               {activePanel === 'AGENCY_RADAR' && (
                   <div className="absolute inset-y-0 left-0 w-[450px] z-[50000] animate-slide-in-left pointer-events-auto">
                       <TacticalRadarController onClose={() => setActivePanel('NONE')} targets={[]} />
                   </div>
               )}

               {/* 2. STOCK (AGENCIA) */}
               <AgencyPortfolioPanel 
                   isOpen={activePanel === 'AGENCY_STOCK'} 
                   onClose={() => setActivePanel('NONE')} 
                   onCreateNew={() => handleEditAsset(null)} 
                   onEditProperty={(p:any) => handleEditAsset(p)}
               />

               {/* 3. PERFIL AGENCIA */}
               <AgencyProfilePanel 
                   isOpen={rightPanel === 'AGENCY_PROFILE'} 
                   onClose={() => toggleRightPanel('NONE')} 
               />

               {/* 4. MARKET AGENCIA */}
               <AgencyMarketPanel 
                   isOpen={activePanel === 'AGENCY_MARKET'} 
                   onClose={() => setActivePanel('NONE')} 
               />

               {/* 5. PERFIL USUARIO NORMAL */}
               {(systemMode !== 'AGENCY') && (
                   <ProfilePanel 
                       rightPanel={rightPanel} 
                       toggleRightPanel={toggleRightPanel} 
                       toggleMainPanel={toggleMainPanel} 
                       onEdit={handleEditAsset}       
                       selectedReqs={selectedReqs}    
                       soundEnabled={soundEnabled} 
                       playSynthSound={playSynthSound} 
                   />
               )}

               {/* 6. MARKET NORMAL */}
               {systemMode === 'EXPLORER' && activePanel === 'MARKETPLACE' && (
                  <div className="absolute inset-y-0 left-0 w-[420px] z-[50] shadow-2xl animate-slide-in-left bg-white pointer-events-auto">
                      <MarketPanel 
                          activeProperty={marketProp || selectedProp}
                          isOpen={true}
                          onClose={() => { setActivePanel('NONE'); setMarketProp(null); }} 
                      />
                  </div>
               )}

               {/* 7. CHAT & IA & FAVORITOS & INSPECTOR */}
               {activePanel === 'CHAT' && (
                   <div className="fixed bottom-40 left-1/2 transform -translate-x-1/2 w-80 z-[20000] pointer-events-auto">
                       <div className="animate-fade-in glass-panel rounded-3xl border border-white/10 bg-[#050505]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col h-96">
                           <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                               <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-xs font-bold tracking-widest text-white">ASISTENTE</span></div>
                               <button onClick={() => setActivePanel('NONE')} className="text-white/30 hover:text-white transition-colors p-2"><X size={16}/></button>
                           </div>
                           <div className="flex-grow p-4 space-y-4 overflow-y-auto"><div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-xs text-white/80 max-w-[90%] border border-white/5">Hola. ¿En qué puedo ayudarte?</div></div>
                       </div>
                   </div>
               )}

               {activePanel === 'AI' && (
                   <div className="fixed bottom-40 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-[20000] pointer-events-auto">
                      <div className="animate-fade-in rounded-[2.5rem] p-8 bg-[#050505]/95 backdrop-blur-2xl border border-blue-500/30 shadow-[0_0_100px_rgba(59,130,246,0.2)]">
                          <div className="flex justify-between items-center mb-8 text-white">
                              <span className="text-xs font-bold tracking-[0.3em] flex items-center gap-2"><Sparkles size={14} className="text-blue-500 animate-pulse"/> OMNI INTELLIGENCE</span>
                              <button onClick={() => setActivePanel('NONE')} className="hover:text-red-500 transition-colors p-2"><X size={18}/></button>
                          </div>
                          <div className="h-48 flex flex-col items-center justify-center text-center gap-4 relative">
                              <p className="text-white/30 text-xs tracking-widest font-mono">{aiResponse ? aiResponse : "SISTEMAS A LA ESPERA DE COMANDO..."}</p>
                          </div>
                      </div>
                  </div>
               )}

               <VaultPanel rightPanel={rightPanel} toggleRightPanel={toggleRightPanel} favorites={localFavs} onToggleFavorite={handleToggleFavorite} map={map} soundEnabled={soundEnabled} playSynthSound={playSynthSound} />
               <AgencyOSPropertyBridge />
               <HoloInspector prop={selectedProp} isOpen={activePanel === 'INSPECTOR'} onClose={() => setActivePanel('DETAILS')} soundEnabled={soundEnabled} playSynthSound={playSynthSound} />
               
               {activePanel === 'DETAILS' && (
                   <DetailsPanel selectedProp={selectedProp} onClose={() => setActivePanel('NONE')} onToggleFavorite={handleToggleFavorite} favorites={localFavs} soundEnabled={soundEnabled} playSynthSound={playSynthSound} onOpenInspector={() => setActivePanel('INSPECTOR')} />
               )}
           </>
       )}
    </div>
  );
}