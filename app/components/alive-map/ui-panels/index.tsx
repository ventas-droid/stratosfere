// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, Search, Mic, Bell, MessageCircle, Heart, User, Sparkles, Activity, X, Send, 
  Square, Box, Crosshair, Sun, Phone, Maximize2, Bed, Bath, TrendingUp, CheckCircle2,
  Camera, Zap, Globe, Newspaper, Share2, Shield, Store
} from 'lucide-react';

// --- 1. IMPORTACIONES DE SUS PANELES ---
import ProfilePanel from "./ProfilePanel";
import MarketPanel from "./MarketPanel";
import VaultPanel from "./VaultPanel";         
import HoloInspector from "./HoloInspector";   
import ExplorerHud from "./ExplorerHud";       
import ArchitectHud from "./ArchitectHud";     
import DualGateway from "./DualGateway";       

// EL COMPONENTE REAL (Con Agentes y Gráficos)
import DetailsPanel from "./DetailsPanel"; 

// --- 2. UTILIDADES ---
export const LUXURY_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100"
];

const playSynthSound = (type: string) => {
    if (typeof window === 'undefined') return;
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'click') {
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'boot') {
             osc.frequency.setValueAtTime(100, now);
             osc.frequency.linearRampToValueAtTime(300, now + 0.5);
             gain.gain.setValueAtTime(0.2, now);
             gain.gain.linearRampToValueAtTime(0, now + 0.5);
             osc.start(now); osc.stop(now + 0.5);
        }
    } catch (e) { console.error(e); }
};

export default function UIPanels({ 
  map, 
  lang, setLang, soundEnabled, toggleSound, systemMode, setSystemMode 
}: any) {
  
  // --- A. ESTADOS DEL SISTEMA ---
  const [gateUnlocked, setGateUnlocked] = useState(false); 
  const [activePanel, setActivePanel] = useState('NONE'); 
  const [rightPanel, setRightPanel] = useState('NONE');   
  const [selectedProp, setSelectedProp] = useState<any>(null); 
  const [explorerIntroDone, setExplorerIntroDone] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // --- B. MEMORIA BLINDADA (FAVORITOS) ---
  const [localFavs, setLocalFavs] = useState<any[]>([]);

  // 1. Cargar memoria
  useEffect(() => {
      const saved = localStorage.getItem('stratos_favorites_v1');
      if (saved) {
          try { setLocalFavs(JSON.parse(saved)); } 
          catch(e) { console.error(e); }
      }
  }, []);

  // 2. Guardar memoria
  useEffect(() => {
      localStorage.setItem('stratos_favorites_v1', JSON.stringify(localFavs));
  }, [localFavs]);

  // 3. FUNCIÓN DE GUARDADO + APERTURA AUTOMÁTICA
  const handleToggleFavorite = (prop: any) => {
      if (!prop) return;
      if (soundEnabled) playSynthSound('click');

      // Saneamiento de datos (evita errores)
      const safeProp = {
          ...prop,
          id: prop.id || Date.now(),
          title: prop.title || "Propiedad",
          formattedPrice: prop.formattedPrice || prop.price || "Consultar"
      };

      const exists = localFavs.some(f => f.id === safeProp.id);
      let newFavs;

      if (exists) {
          newFavs = localFavs.filter(f => f.id !== safeProp.id);
          addNotification("Eliminado de colección");
      } else {
          newFavs = [...localFavs, { ...safeProp, savedAt: Date.now() }];
          addNotification("Guardado en Favoritos");
          // 🚀 ORDEN TÁCTICA: Abrir columna al guardar
          setRightPanel('VAULT'); 
      }
      setLocalFavs(newFavs);
  };

  

  // Estados Mercado e IA
  const [marketTab, setMarketTab] = useState('ONLINE');
  const [selectedReqs, setSelectedReqs] = useState<string[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isListening, setIsListening] = useState(false); 

  // Helpers
  const toggleRightPanel = (p: string) => { if(soundEnabled) playSynthSound('click'); setRightPanel(rightPanel === p ? 'NONE' : p); };
  const toggleMainPanel = (p: string) => { if(soundEnabled) playSynthSound('click'); setActivePanel(activePanel === p ? 'NONE' : p); };
  
  const toggleRequirement = (item: any) => {
      if(soundEnabled) playSynthSound('click');
      setSelectedReqs(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
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
    setIsAiTyping(true); 
    if (soundEnabled) playSynthSound('click');
    setTimeout(() => { 
        setAiResponse(`Comando recibido: "${aiInput}". Iniciando escaneo...`); 
        setIsAiTyping(false); 
        setAiInput(""); 
    }, 1500);
  };

  // --- C. ESCUCHA DE EVENTOS (SISTEMA NERVIOSO) ---
  useEffect(() => {
    const handleOpenDetails = (e: any) => {
        const propData = e.detail;
        const finalProp = { 
            ...propData, 
            id: propData.id || Date.now(), 
            img: propData.img || LUXURY_IMAGES[0], 
            formattedPrice: propData.formattedPrice || propData.displayPrice || "Consultar" 
        };
        setSelectedProp(finalProp);
        setActivePanel('DETAILS');
        if(soundEnabled) playSynthSound('click');
    };

    const handleToggleFavSignal = (e: any) => { 
        handleToggleFavorite(e.detail);
    };

    window.addEventListener('open-details-signal', handleOpenDetails);
    window.addEventListener('toggle-fav-signal', handleToggleFavSignal);
    
    return () => {
        window.removeEventListener('open-details-signal', handleOpenDetails);
        window.removeEventListener('toggle-fav-signal', handleToggleFavSignal);
    };
  }, [soundEnabled, localFavs]); // Dependencia crítica

  useEffect(() => { if (systemMode !== 'EXPLORER') setExplorerIntroDone(false); }, [systemMode]);

  // =========================================================================
  // RENDERIZADO
  // =========================================================================
  
  if (!gateUnlocked) {
    return (
        <div className="fixed inset-0 z-[99999] bg-[#e4e4e7] flex flex-col items-center justify-center pointer-events-auto animate-fade-in select-none">
            <div className="relative z-10 text-center mb-24 cursor-default">
                <h1 className="relative text-7xl md:text-9xl font-bold tracking-tighter leading-none drop-shadow-sm">
                    <span className="text-black">Strato</span><span className="text-[#0071e3]">sfere</span><span className="text-slate-400 text-2xl md:text-4xl ml-3 font-light tracking-[0.2em] align-top mt-4 inline-block">OS.</span>
                </h1>
            </div>
            <button onClick={() => { playSynthSound('boot'); setGateUnlocked(true); }} className="group relative px-24 py-6 bg-[#0071e3] text-white rounded-full font-bold text-xs tracking-[0.5em] transition-all duration-500 shadow-[0_20px_40px_rgba(0,113,227,0.25)] hover:shadow-[0_0_80px_rgba(0,113,227,0.6)] hover:scale-105 overflow-hidden">
                <span className="relative z-10 drop-shadow-md">INITIALIZE SYSTEM</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1.5s] ease-in-out"></div>
            </button>
            <div className="absolute bottom-10 text-xs text-slate-400 font-mono tracking-widest flex flex-col items-center gap-3 animate-fade-in delay-500"><Activity size={16} className="animate-pulse text-[#0071e3]"/> ESPERANDO AUTORIZACIÓN NEURAL...</div>
        </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-end pb-8 animate-fade-in text-sans select-none">
       
       {systemMode === 'GATEWAY' && (
           <div className="fixed inset-0 z-[50000] flex items-center justify-center pointer-events-auto bg-[#050505]/80 backdrop-blur-xl animate-fade-in duration-1000">
               <DualGateway onSelectMode={(m:any) => { playSynthSound('boot'); setSystemMode(m); }} />
           </div>
       )}

       {systemMode === 'ARCHITECT' && (
           <ArchitectHud soundFunc={playSynthSound} onCloseMode={(success:any) => { if(success) addNotification("Campaña iniciada"); setSystemMode(success ? 'EXPLORER' : 'GATEWAY'); }} />
       )}

       {systemMode === 'EXPLORER' && (
           <>
               {!explorerIntroDone && (<ExplorerHud soundFunc={playSynthSound} onCloseMode={() => setSystemMode('GATEWAY')} onGoToMap={() => setExplorerIntroDone(true)}/>)}

               <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="absolute top-8 left-8 pointer-events-auto flex items-center gap-4 group cursor-default animate-fade-in-up">
                     <div onClick={() => setSystemMode('GATEWAY')} className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/50 cursor-pointer hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"><LayoutGrid size={18} className="text-blue-400 group-hover:text-white"/></div>
                     <h1 className="text-xl font-light tracking-[0.3em] text-white drop-shadow-md">STRATOS<span className="font-bold text-blue-600">FERE</span></h1>
                  </div>
                  
                  <div className="absolute top-8 right-8 pointer-events-auto flex flex-col gap-3 items-end w-[280px] animate-fade-in-up delay-100">
                      <div className="glass-panel p-5 rounded-[1.5rem] w-full shadow-2xl bg-[#050505]/90 border border-white/10 hover:border-blue-500/30 transition-all">
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

                  <div className="absolute top-1/2 -translate-y-1/2 right-8 pointer-events-auto flex flex-col gap-2 animate-fade-in-right">
                      <button onClick={() => {playSynthSound('click'); map?.current?.flyTo({pitch: 0});}} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black transition-all"><Square size={16}/></button>
                      <button onClick={() => {playSynthSound('click'); map?.current?.flyTo({pitch: 60});}} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black transition-all"><Box size={16}/></button>
                  </div>
                  
                  <button className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-auto p-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all shadow-2xl group animate-fade-in-down" onClick={() => { addNotification("GPS RECALIBRADO"); map?.current?.flyTo({center: [-3.6905, 40.4250], zoom: 16.5, pitch: 65, bearing: -15, duration: 3000}); }}>
                      <Crosshair className="w-5 h-5 text-white/80 group-hover:rotate-90 transition-transform duration-700" />
                  </button>
               </div>

               {/* DOCK BARRA INFERIOR */}
               <div className="absolute bottom-10 z-[10000] w-full px-6 pointer-events-none flex justify-center items-center">
                  <div className="pointer-events-auto w-full max-w-3xl animate-fade-in-up delay-300">
                      <div className="relative glass-panel rounded-full p-2 px-6 flex items-center justify-between shadow-2xl gap-4 bg-[#050505]/90 backdrop-blur-xl border border-white/10">
                        <button onClick={() => setSystemMode('GATEWAY')} className="p-3 rounded-full text-white/50 hover:text-white"><LayoutGrid size={18}/></button>
                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                        <div className="flex-grow flex items-center gap-4 bg-white/[0.05] px-5 py-3 rounded-full border border-white/5 focus-within:border-blue-500/50">
                            <Search size={16} className="text-white/40"/>
                            <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleAICommand(e)} className="bg-transparent text-white w-full outline-none text-xs font-light tracking-widest uppercase" placeholder="LOCALIZACIÓN, COMANDO O AGENTE..." />
                            <Mic size={16} onClick={() => { setIsListening(true); setTimeout(() => setIsListening(false), 2000); }} className={`cursor-pointer ${isListening ? 'text-red-500 animate-pulse' : 'text-white/30'}`}/>
                        </div>
                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                        
                        <button onClick={()=>toggleMainPanel('MARKETPLACE')} className={`p-3 rounded-full hover:text-emerald-400 ${activePanel==='MARKETPLACE'?'text-emerald-500':'text-white/50'}`}><Store size={18}/></button>

                        <button onClick={()=>toggleMainPanel('AI')} className={`p-3 rounded-full hover:text-blue-400 ${activePanel==='AI'?'text-blue-500':'text-white/50'}`}><MessageCircle size={18}/></button>
                        <button onClick={()=>toggleRightPanel('VAULT')} className={`p-3 rounded-full hover:text-red-500 ${rightPanel==='VAULT'?'text-red-500':'text-white/50'}`}><Heart size={18}/></button>
                        <button onClick={()=>toggleRightPanel('PROFILE')} className={`p-3 rounded-full hover:text-white ${rightPanel==='PROFILE'?'text-white':'text-white/50'}`}><User size={18}/></button>
                      </div>
                  </div>
               </div>
           </>
       )}

       {/* PANELES FLOTANTES - CONECTADOS A LA MEMORIA INTERNA (localFavs) */}
       
       <ProfilePanel 
           rightPanel={rightPanel} 
           toggleRightPanel={toggleRightPanel} 
           toggleMainPanel={toggleMainPanel} 
           selectedReqs={selectedReqs} 
           soundEnabled={soundEnabled} 
           playSynthSound={playSynthSound} 
       />

       <MarketPanel 
           isOpen={activePanel === 'MARKETPLACE'} 
           onClose={() => toggleMainPanel('NONE')} 
           marketTab={marketTab} 
           setMarketTab={setMarketTab} 
           selectedReqs={selectedReqs} 
           toggleRequirement={toggleRequirement} 
           soundEnabled={soundEnabled} 
           playSynthSound={playSynthSound} 
       />
       
       {/* 🚀 FAVORITOS: AHORA USAN LA MEMORIA INTERNA (localFavs) */}
       <VaultPanel 
           rightPanel={rightPanel} 
           toggleRightPanel={toggleRightPanel} 
           favorites={localFavs} // <--- CAMBIO CRÍTICO: Usamos el estado local persistente
           onToggleFavorite={handleToggleFavorite} 
           map={map} 
           soundEnabled={soundEnabled} 
           playSynthSound={playSynthSound} 
       />
       
       <HoloInspector 
           prop={selectedProp} 
           isOpen={activePanel === 'INSPECTOR'} 
           onClose={() => setActivePanel('DETAILS')} 
           soundEnabled={soundEnabled} 
           playSynthSound={playSynthSound} 
       />
       
       {/* FICHA DE PROPIEDAD REAL */}
       {activePanel === 'DETAILS' && selectedProp && (
           <DetailsPanel 
               selectedProp={selectedProp} 
               onClose={() => toggleMainPanel('NONE')} 
               onToggleFavorite={handleToggleFavorite} 
               favorites={localFavs} // <--- CAMBIO CRÍTICO
               soundEnabled={soundEnabled} 
               playSynthSound={playSynthSound} 
               onOpenInspector={() => setActivePanel('INSPECTOR')} 
           />
       )}

       {/* IA */}
       {activePanel === 'AI' && (
           <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-lg z-20 pointer-events-auto animate-fade-in-up">
              <div className="rounded-[2.5rem] p-8 bg-[#050505] border border-blue-500/30">
                  <div className="flex justify-between items-center mb-6 text-white"><span className="text-xs font-bold tracking-[0.3em] flex items-center gap-2"><Sparkles size={14} className="text-blue-500 animate-pulse"/> OMNI INTELLIGENCE</span><button onClick={()=>toggleMainPanel('NONE')}><X size={18}/></button></div>
                  <div className="h-40 flex flex-col items-center justify-center text-center gap-4">
                      {isAiTyping ? <div className="flex gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"/><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"/><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"/></div> : <p className="text-white/50 text-xs max-w-xs">{aiResponse || "Sistemas listos. Esperando órdenes verbales o escritas."}</p>}
                  </div>
              </div>
          </div>
       )}
    </div>
  );
}


