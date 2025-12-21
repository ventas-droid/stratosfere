// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Heart, Search, Mic, Bell, User, Crosshair, Activity, Zap, 
  Box, Square, Sun, ArrowRight, Building, Radar, 
  Smartphone, SlidersHorizontal, MessageCircle, Sparkles, Camera, Bed, Bath,
  LayoutGrid, Send, CreditCard, Shield, Phone, Info, Command, Store, TrendingUp, Eye, BarChart3
} from 'lucide-react';

// --- COMPONENTE DE IMAGEN SEGURA (ANTI-ROTURA) ---
const SafeImage = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);
    // Placeholder técnico oscuro
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

const MOCK_IMGS = [
  "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

export default function UIPanels({ 
  map, onToggleFavorite, favorites = [], 
  lang, setLang, soundEnabled, toggleSound, systemMode, setSystemMode 
}) {
  const [gateUnlocked, setGateUnlocked] = useState(false); 
  // Estados de panel actualizados para la nueva lógica
  const [activePanel, setActivePanel] = useState('NONE'); // 'DETAILS', 'FILTERS', 'AI' (Paneles Centrales/Izquierdos)
  const [rightPanel, setRightPanel] = useState('NONE'); // 'VAULT', 'PROFILE' (Paneles Derechos)
  
  const [notifications, setNotifications] = useState([]);
  const [selectedProp, setSelectedProp] = useState(null);

  useEffect(() => {
    const handlePropSelect = (e) => {
        setSelectedProp(e.detail);
        if(soundEnabled) playSynthSound('ping');
        // Si abrimos una propiedad, cerramos paneles centrales para limpiar la vista
        setActivePanel('NONE');
    };
    window.addEventListener('prop-selected', handlePropSelect);
    return () => window.removeEventListener('prop-selected', handlePropSelect);
  }, [soundEnabled]);

  const addNotification = (t) => { 
      if(soundEnabled) playSynthSound('ping');
      setNotifications(p=>[{title:t},...p]); 
      setTimeout(()=>setNotifications(p=>p.slice(0,-1)), 5000); 
  };

  const handleDayNight = () => {
      if(!map) return;
      playSynthSound('click');
      try {
          const currentPreset = map.getConfig('basemap', 'lightPreset');
          const nextPreset = currentPreset === 'dusk' ? 'day' : 'dusk';
          map.setConfig('basemap', { 'lightPreset': nextPreset });
          addNotification(`MODO ${nextPreset.toUpperCase()} ACTIVADO`);
      } catch(e) { console.log("Map config not ready"); }
  };

  // --- SECUENCIA DE LANZAMIENTO CINEMÁTICA ---
  const handleInitializeSystem = () => {
      if(soundEnabled) playSynthSound('boot');
      setGateUnlocked(true); 
      if (map) {
          map.jumpTo({ center: [0, 20], zoom: 1.5, pitch: 0 });
          map.flyTo({
              center: [-3.6905, 40.4250], zoom: 16.5, pitch: 65, bearing: -15, duration: 5000, essential: true,
              easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
          });
      }
  };

  // FUNCIONES HELPER PARA PANELES
  const toggleRightPanel = (panelName) => {
      playSynthSound('hover');
      // Si el panel ya está abierto, lo cerramos. Si no, lo abrimos.
      setRightPanel(rightPanel === panelName ? 'NONE' : panelName);
  };

  const toggleMainPanel = (panelName) => {
      playSynthSound('hover');
      setActivePanel(activePanel === panelName ? 'NONE' : panelName);
      // Opcional: Cerrar la NanoCard si abrimos un filtro central
      if(['FILTERS', 'AI'].includes(panelName)) setSelectedProp(null);
  };


  // --- FASE 1: GATEKEEPER (PANTALLA DE INICIO) ---
  if (!gateUnlocked) {
    return (
        <div className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col items-center justify-center pointer-events-auto animate-fade-in">
            <div className="relative z-10 text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-6 animate-fade-in-up">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.3)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/40 to-transparent animate-pulse-slow"></div>
                        <Command size={24} className="text-blue-400 relative z-10"/>
                    </div>
                    <h1 className="text-6xl font-extralight tracking-[0.3em] text-white">STRATOS<span className="font-bold text-blue-600">FERE</span></h1>
                </div>
                <div className="h-[1px] w-64 bg-gradient-to-r from-transparent via-blue-600 to-transparent mx-auto shadow-[0_0_30px_blue] animate-pulse"></div>
            </div>
            <button onClick={handleInitializeSystem} className="group relative px-20 py-6 bg-black border border-white/10 text-white rounded-full font-medium text-xs tracking-[0.5em] hover:border-blue-500/50 hover:text-blue-400 transition-all duration-500 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-in-up delay-200">
                <span className="relative z-10">INITIALIZE SYSTEM</span>
                <div className="absolute inset-0 bg-blue-600/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </button>
            <div className="absolute bottom-10 text-[9px] text-white/20 font-mono tracking-widest flex flex-col items-center gap-2 animate-fade-in delay-500"><Activity size={12} className="animate-pulse"/> ESPERANDO AUTORIZACIÓN NEURAL...</div>
        </div>
    );
  }

  // --- FASE 2: INTERFAZ DE MANDO ---
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-end pb-8 animate-fade-in">
       
       {systemMode === 'GATEWAY' && (<div className="fixed inset-0 z-[50000] flex items-center justify-center pointer-events-auto bg-[#050505]/60 backdrop-blur-md animate-fade-in duration-1000"><DualGateway onSelectMode={(m) => { playSynthSound('click'); setSystemMode(m); }} /></div>)}
       {systemMode === 'ARCHITECT' && (<ArchitectHud soundFunc={playSynthSound} onCloseMode={(success) => { if(success) addNotification("CAMPAÑA ACTIVADA"); setSystemMode(success ? 'EXPLORER' : 'GATEWAY'); }} />)}
       
       {systemMode === 'EXPLORER' && (
         <>
           {/* UI SUPERIOR (HEADER) */}
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-8 left-8 pointer-events-auto flex items-center gap-4 group cursor-default animate-fade-in-up">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.2)]"><Command size={18} className="text-blue-400"/></div>
                  <div className="flex flex-col"><h1 className="text-xl font-light tracking-[0.3em] text-white drop-shadow-md">STRATOS<span className="font-bold text-blue-600">FERE</span></h1><span className="text-[8px] text-blue-400 font-mono tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> SYSTEM ONLINE</span></div>
              </div>

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
              
              <div className="absolute top-1/2 -translate-y-1/2 right-8 pointer-events-auto flex flex-col gap-2 animate-fade-in-right">
                  <button onClick={() => {playSynthSound('click'); map?.flyTo({pitch: 0});}} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black transition-all"><Square size={16}/></button>
                  <button onClick={() => {playSynthSound('click'); map?.flyTo({pitch: 60});}} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black transition-all"><Box size={16}/></button>
              </div>

              <button className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-auto p-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all shadow-2xl group animate-fade-in-down" onClick={() => { addNotification("GPS RECALIBRADO"); map?.flyTo({center: [-3.6905, 40.4250], zoom: 16.5, pitch: 65, bearing: -15, duration: 3000}); }}>
                  <Crosshair className="w-5 h-5 text-white/80 group-hover:rotate-90 transition-transform duration-700" />
              </button>
           </div>

           {/* NANO CARD (USANDO SAFE IMAGE) */}
           {selectedProp && activePanel !== 'DETAILS' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] pointer-events-auto">
                    <div className="glass-panel p-4 rounded-[2rem] w-80 animate-zoom-in">
                        <div className="h-44 bg-gray-800 rounded-[1.5rem] mb-4 overflow-hidden relative group">
                            <SafeImage src={selectedProp.img || MOCK_IMGS[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"/>
                            <button onClick={() => setSelectedProp(null)} className="absolute top-3 right-3 bg-black/40 p-2 rounded-full text-white hover:bg-white hover:text-black transition-colors"><X size={12}/></button>
                            <button onClick={()=>{ onToggleFavorite(selectedProp); addNotification(favorites.some(f=>f.id===selectedProp.id)?"ELIMINADO":"AÑADIDO A VAULT"); }} className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-md transition-colors ${favorites.some(f=>f.id===selectedProp.id) ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:text-red-500'}`}><Heart size={12} fill={favorites.some(f=>f.id===selectedProp.id)?"currentColor":"none"}/></button>
                        </div>
                        <div className="flex justify-between items-end mb-4 px-1">
                            <div><h3 className="text-white font-bold text-lg leading-tight">{selectedProp.title}</h3><p className={`text-[10px] uppercase font-mono mt-1 ${selectedProp.tier === 'PREMIUM' ? 'text-amber-500' : selectedProp.tier === 'HIGH_CLASS' ? 'text-red-500' : 'text-blue-400'}`}>{selectedProp.tier} • {selectedProp.status}</p></div>
                            <span className="text-white font-bold font-mono text-lg">{(selectedProp.price/1000000).toFixed(1)}M €</span>
                        </div>
                        <button onClick={()=>{playSynthSound('click'); toggleMainPanel('DETAILS');}} className="w-full bg-white text-black text-[10px] font-extrabold py-4 rounded-xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-[0.2em] shadow-lg hover:shadow-blue-500/50">VER DETALLES</button>
                    </div>
                </div>
           )}

           {/* ZONA INFERIOR (PANELES FLOTANTES Y DOCK) */}
           <div className="pointer-events-auto w-full px-4 flex justify-center items-end mb-12 relative z-[100]">
              
              {/* PANEL IZQUIERDO: DETALLES DE PROPIEDAD (SIN BOTÓN MARKET) */}
              {activePanel === 'DETAILS' && selectedProp && (
                  <div className="fixed inset-y-0 left-0 w-[480px] bg-[#050505]/95 border-r border-white/10 p-8 flex flex-col animate-slide-in-left backdrop-blur-2xl z-[60000] shadow-2xl">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                        <h2 className="text-xl tracking-[0.3em] font-light flex items-center gap-3 text-white"><Info size={18} className="text-blue-500"/> FICHA TÁCTICA</h2>
                        <button onClick={()=>toggleMainPanel('NONE')}><X size={20} className="text-white hover:rotate-90 transition-transform"/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                        {/* FOTO PRINCIPAL */}
                        <div className="h-64 rounded-2xl overflow-hidden relative group cursor-pointer">
                            <SafeImage src={selectedProp.img || MOCK_IMGS[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-6">
                                <h3 className="text-2xl font-bold text-white mb-1">{selectedProp.title}</h3>
                                <div className="flex gap-2">
                                    <span className={`px-2 py-1 text-[9px] font-bold rounded uppercase tracking-wider border ${selectedProp.tier === 'PREMIUM' ? 'bg-amber-500/20 text-amber-500 border-amber-500/50' : 'bg-blue-500/20 text-blue-500 border-blue-500/50'}`}>{selectedProp.tier}</span>
                                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-500 text-[9px] font-bold rounded uppercase tracking-wider border border-emerald-500/50">{selectedProp.status}</span>
                                </div>
                            </div>
                        </div>

                        {/* ESTADÍSTICAS */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center hover:bg-white/10 transition-colors"><div className="text-white/40 text-[9px] uppercase tracking-widest mb-1">Rol</div><div className="text-white font-bold text-xs">{selectedProp.role}</div></div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center hover:bg-white/10 transition-colors"><div className="text-white/40 text-[9px] uppercase tracking-widest mb-1">Tipo</div><div className="text-white font-bold text-xs">{selectedProp.type}</div></div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center hover:bg-white/10 transition-colors"><div className="text-white/40 text-[9px] uppercase tracking-widest mb-1">Precio</div><div className="text-blue-400 font-bold text-xs">{(selectedProp.price/1000000).toFixed(1)}M €</div></div>
                        </div>

                        {/* DESCRIPCIÓN */}
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 relative overflow-hidden">
                            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><Activity size={12} className="text-blue-500"/> Informe del Activo</h4>
                            <p className="text-white/70 text-xs leading-relaxed">Activo inmobiliario de alto rendimiento localizado en zona prime. Oportunidad estratégica para diversificación de cartera con alta proyección de revalorización. Contacte para dossier confidencial completo.</p>
                        </div>

                        {/* GALERÍA MINIATURAS */}
                        <div>
                             <h4 className="text-white/40 text-[9px] uppercase tracking-widest mb-3">Material Visual Adicional</h4>
                             <div className="grid grid-cols-4 gap-2">
                                 {MOCK_IMGS.map((img, i) => (
                                     <div key={i} className="h-16 rounded-lg overflow-hidden border border-white/10 hover:border-blue-500 cursor-pointer transition-all opacity-60 hover:opacity-100">
                                         <SafeImage src={img} className="w-full h-full object-cover"/>
                                     </div>
                                 ))}
                             </div>
                        </div>

                        {/* BOTONES DE ACCIÓN (SIN MARKET) */}
                        <div className="flex gap-3 mt-auto pt-4">
                            <button className="flex-1 py-4 bg-white text-black font-bold text-xs rounded-xl tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"><Phone size={14}/> CONTACTAR AGENTE</button>
                            <button onClick={()=>{ onToggleFavorite(selectedProp); addNotification("AÑADIDO A VAULT"); }} className={`p-4 rounded-xl border transition-all ${favorites.some(f=>f.id===selectedProp.id) ? 'bg-red-500 text-white border-red-500' : 'bg-white/10 text-white border-white/10 hover:bg-white/20 hover:text-red-500'}`}><Heart size={18} fill={favorites.some(f=>f.id===selectedProp.id)?"currentColor":"none"}/></button>
                        </div>
                    </div>
                  </div>
              )}

              {/* PANEL CENTRAL: FILTROS */}
              {activePanel === 'FILTERS' && (
                  <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-lg z-20">
                      <div className="glass-panel rounded-[2.5rem] p-8 animate-fade-in-up origin-bottom">
                        <div className="flex justify-between items-center mb-8 text-white"><span className="text-xs font-bold tracking-[0.3em] flex items-center gap-2"><SlidersHorizontal size={14} className="text-blue-500"/> FILTROS TÁCTICOS</span><button onClick={()=>toggleMainPanel('NONE')}><X size={18}/></button></div>
                        <div className="space-y-6">
                            <div className="space-y-3"><div className="flex justify-between text-[10px] text-white/60 uppercase tracking-widest"><span>PRESUPUESTO</span><span className="text-white font-mono">2.5M €</span></div><div className="h-1.5 bg-zinc-800 rounded-full"><div className="h-full bg-blue-600 w-[70%] shadow-[0_0_15px_blue]" /></div></div>
                            <div className="grid grid-cols-3 gap-3">{['TODO', 'CASA', 'PISO'].map((t, i) => <button key={t} className={`py-4 border border-white/10 text-[10px] font-bold text-white rounded-2xl hover:bg-white hover:text-black transition-all tracking-widest ${i===0?'bg-white/10':''}`}>{t}</button>)}</div>
                        </div>
                      </div>
                  </div>
              )}

              {/* PANEL CENTRAL: AI CHAT */}
              {activePanel === 'AI' && (
                  <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-lg z-20">
                      <div className="glass-panel rounded-[2.5rem] p-8 animate-fade-in-up origin-bottom border-blue-500/30">
                        <div className="flex justify-between items-center mb-6 text-white"><span className="text-xs font-bold tracking-[0.3em] flex items-center gap-2"><Sparkles size={14} className="text-blue-500 animate-pulse"/> OMNI INTELLIGENCE</span><button onClick={()=>toggleMainPanel('NONE')}><X size={18}/></button></div>
                        <div className="h-40 flex flex-col items-center justify-center text-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30"><MessageCircle size={20} className="text-blue-400"/></div>
                            <p className="text-white/50 text-xs max-w-xs">"He detectado 3 áticos en Barrio Salamanca que coinciden con su perfil de inversión."</p>
                        </div>
                        <div className="flex gap-2 relative">
                            <input className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-blue-500 transition-colors" placeholder="Escriba su consulta..." autoFocus />
                            <button className="bg-blue-600 p-3 rounded-xl text-white hover:scale-105 transition-transform"><Send size={16}/></button>
                        </div>
                      </div>
                  </div>
              )}

              {/* ==================================================================================
                  ZONA DERECHA: PANELES LATERALES (VAULT Y NUEVO PERFIL "COMMAND CENTER")
                  ================================================================================== */}
              
              {/* PANEL DERECHO 1: VAULT (Favoritos) */}
              {rightPanel === 'VAULT' && (
                  <div className="fixed inset-y-0 right-0 w-[400px] bg-[#050505]/95 border-l border-white/10 p-10 flex flex-col animate-slide-in-right backdrop-blur-2xl z-[60000] shadow-2xl">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                        <h2 className="text-xl tracking-[0.3em] font-light flex items-center gap-3 text-white"><Heart className="text-red-600" fill="currentColor"/> THE VAULT</h2>
                        <button onClick={()=>toggleRightPanel('NONE')}><X size={20} className="text-white hover:rotate-90 transition-transform"/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                        {favorites.length === 0 && <div className="text-white/30 text-xs text-center mt-20 border border-dashed border-white/10 p-10 rounded-3xl">Bóveda vacía.</div>}
                        {favorites.map(fav => (
                            <div key={fav.id} className="bg-[#111] border border-white/5 rounded-2xl p-4 flex gap-4 hover:border-blue-500/50 cursor-pointer transition-all group hover:bg-white/5" onClick={()=>{map?.flyTo({center:fav.coords||[-3.6905, 40.4250], zoom:17}); toggleRightPanel('NONE');}}>
                                <div className="w-20 h-20 bg-gray-800 rounded-xl overflow-hidden">
                                    <SafeImage src={fav.img || MOCK_IMGS[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform"/>
                                </div>
                                <div><h3 className="text-white text-sm font-bold mt-1">{fav.title}</h3><p className="text-blue-400 text-[10px] font-mono mt-1 tracking-wider">{fav.tier}</p></div>
                            </div>
                        ))}
                    </div>
                  </div>
              )}

              {/* PANEL DERECHO 2: NUEVO PERFIL "COMMAND CENTER" (Con Market Upsell) */}
              {rightPanel === 'PROFILE' && (
                  <div className="fixed inset-y-0 right-0 w-[450px] bg-[#050505]/95 border-l border-amber-500/20 p-8 flex flex-col animate-slide-in-right backdrop-blur-2xl z-[60000] shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                        <h2 className="text-xl tracking-[0.3em] font-light flex items-center gap-3 text-white"><User size={18} className="text-amber-500"/> MI CENTRO DE MANDO</h2>
                        <button onClick={()=>toggleRightPanel('NONE')}><X size={20} className="text-white hover:rotate-90 transition-transform"/></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8">
                        {/* CABECERA DEL USUARIO */}
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500 p-1 relative group">
                                <SafeImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all"/>
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-black rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">Isidro B.</h3>
                                <p className="text-amber-500 text-xs font-mono tracking-widest uppercase mb-2">Inversor Platinum</p>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-white/10 text-white text-[9px] rounded font-bold">PROPIETARIO</span>
                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[9px] rounded font-bold">EARLY ADOPTER</span>
                                </div>
                            </div>
                        </div>

                        {/* MI ACTIVO PRINCIPAL (Comparativa) */}
                        <div>
                            <h4 className="text-white/50 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2"><Building size={12}/> Mi Activo Principal</h4>
                             <div className="h-48 rounded-2xl overflow-hidden relative group cursor-pointer border border-white/10 hover:border-amber-500 transition-all">
                                <SafeImage src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4">
                                    <h3 className="text-lg font-bold text-white">Velázquez Golden Mile</h3>
                                    <p className="text-amber-500 text-[10px] font-mono tracking-wider">Valorado en: 3.1M €</p>
                                </div>
                            </div>
                        </div>

                        {/* ESTADÍSTICAS DE RENDIMIENTO (El gancho para el upsell) */}
                        <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/20">
                            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2"><TrendingUp size={14} className="text-amber-500"/> Rendimiento del Activo</h4>
                            <div className="grid grid-cols-3 gap-4 text-center mb-6">
                                <div><div className="text-white/40 text-[9px] uppercase mb-1"><Eye size={12} className="mx-auto mb-1"/> Visitas Mes</div><div className="text-2xl font-light text-white">245</div></div>
                                <div><div className="text-white/40 text-[9px] uppercase mb-1"><Heart size={12} className="mx-auto mb-1"/> Guardados</div><div className="text-2xl font-light text-white">42</div></div>
                                <div><div className="text-white/40 text-[9px] uppercase mb-1"><BarChart3 size={12} className="mx-auto mb-1"/> Interés</div><div className="text-2xl font-light text-emerald-500">+15%</div></div>
                            </div>
                            <p className="text-center text-white/60 text-xs mb-6">Su propiedad tiene un rendimiento superior al 85% del mercado. Aumente su visibilidad con servicios premium.</p>
                            
                            {/* EL BOTÓN DE MARKET UPSALE (Estratégicamente colocado) */}
                            <button onClick={()=>addNotification("ACCEDIENDO A MARKETPLACE PREMIUM...")} className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-sm rounded-xl tracking-[0.2em] shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                                <Store size={16} fill="black"/> BOOST CON MARKET SERVICES
                            </button>
                        </div>
                    </div>
                  </div>
              )}

           </div>       

           {/* OMNISEARCH DOCK (BARRA FLOTANTE COMPLETA) - CORREGIDO CENTRADO ABSOLUTO */}
           <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-[10000] w-full max-w-4xl px-6 pointer-events-auto animate-fade-in-up delay-300">
              <div className="relative glass-panel rounded-full p-2 px-6 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.8)] gap-4 hover:border-white/30 transition-all group bg-[#050505]/90">
                
                {/* GRUPO IZQUIERDA: SISTEMA & FILTROS */}
                <div className="flex gap-2 items-center">
                    <button onClick={() => setSystemMode('GATEWAY')} className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all" title="Cambiar Modo"><LayoutGrid size={18} /></button>
                    <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                    <button onClick={()=>toggleMainPanel('FILTERS')} className={`p-3 rounded-full transition-all hover:bg-white hover:text-black ${activePanel==='FILTERS'?'bg-white text-black':'text-white/50 hover:bg-white/5'}`}><SlidersHorizontal size={18}/></button>
                </div>

                {/* INPUT BUSCADOR CENTRAL */}
                <div className="flex-grow flex items-center gap-4 bg-white/[0.03] px-5 py-3 rounded-full border border-white/5 focus-within:border-blue-500/50 transition-all mx-4">
                    <Search size={16} className="text-white/40"/>
                    <input className="bg-transparent text-white w-full outline-none placeholder-white/20 text-xs font-light tracking-widest uppercase" placeholder="Localización, comando o agente..." />
                    <Mic size={16} className="text-white/30 hover:text-white cursor-pointer transition-colors"/>
                </div>

                {/* GRUPO DERECHA: CHAT, VAULT, PERFIL (USA toggleRightPanel para los laterales) */}
                <div className="flex gap-2 items-center">
                    {/* BOTÓN CENTRAL: CHAT AI */}
                    <button onClick={()=>toggleMainPanel('AI')} className={`p-3 rounded-full transition-all hover:text-blue-400 relative ${activePanel==='AI'?'bg-blue-600 text-white shadow-lg':'text-white/50 hover:bg-blue-500/10'}`}><MessageCircle size={18}/><div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div></button>
                    <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                    {/* BOTONES LATERALES DERECHOS */}
                    <button onClick={()=>toggleRightPanel('VAULT')} className={`p-3 rounded-full transition-all hover:text-red-500 hover:bg-red-500/10 ${rightPanel==='VAULT'?'text-red-500':'text-white/50'}`}><Heart size={18}/></button>
                    <button onClick={()=>toggleRightPanel('PROFILE')} className={`p-3 rounded-full transition-all hover:text-white hover:bg-white/10 ${rightPanel==='PROFILE'?'text-white bg-white/10':'text-white/50'}`}><User size={18}/></button>
                </div>
              </div>
           </div>
         </>
       )}
    </div>
  );
}

// --- SUBCOMPONENTES (ArchitectHud y DualGateway) ---
const ArchitectHud = ({ soundFunc, onCloseMode }) => {
  const [viewState, setViewState] = useState('INTRO'); 
  const [cart, setCart] = useState([]);
  const toggleService = (id) => { soundFunc('click'); setCart(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]); };
  const modalContainerClass = "fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto p-4 animate-fade-in";
  const modalBoxClass = "glass-panel w-full max-w-xl rounded-[2.5rem] p-10 shadow-[0_0_80px_rgba(245,158,11,0.15)] relative overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar";

  if (viewState === 'INTRO') return (<div className={modalContainerClass}><div className={`${modalBoxClass} text-center`}><div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-amber-500/20 animate-pulse"><Building className="text-amber-500" size={48} /></div><h3 className="text-white font-light text-4xl mb-4 tracking-tight">MODO ARQUITECTO</h3><p className="text-white/50 text-sm mb-10 max-w-xs mx-auto">Digitalice su activo inmobiliario en 3 pasos simples.</p><button onClick={() => {soundFunc('click'); setViewState('DATA');}} className="w-full py-5 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-sm tracking-[0.25em] rounded-2xl hover:scale-105 transition-transform shadow-xl">COMENZAR</button><button onClick={() => onCloseMode(false)} className="mt-6 text-white/30 text-[10px] hover:text-white uppercase tracking-[0.2em]">CANCELAR</button></div></div>);

  return (
    <div className={modalContainerClass}><div className={modalBoxClass}>
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4 sticky top-0 z-10 bg-[#050505]/50 backdrop-blur-md"><div className="flex items-center gap-3"><Building className="text-amber-500 animate-pulse" size={20} /><span className="text-xs font-bold text-amber-500 tracking-[0.3em]">SISTEMA ARQUITECTO</span></div><button onClick={() => onCloseMode(false)} className="text-white/30 hover:text-white transition-colors"><X size={18}/></button></div>
        {viewState === 'DATA' && (<div className="space-y-6 animate-fade-in"><h3 className="text-2xl text-white font-light mb-6">1. Datos del Activo</h3><div><label className="text-[10px] uppercase text-white/50 tracking-wider mb-2 block">Dirección</label><input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-amber-500 transition-colors" placeholder="Calle, Número..." /></div><div><label className="text-[10px] uppercase text-white/50 tracking-wider mb-2 block">Precio (€)</label><input type="number" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-amber-500 transition-colors" placeholder="0.00" /></div><button onClick={()=>{soundFunc('click'); setViewState('SPECS');}} className="w-full mt-4 py-4 bg-white text-black font-bold tracking-[0.2em] rounded-xl hover:bg-gray-200">SIGUIENTE</button></div>)}
        {viewState === 'SPECS' && (<div className="space-y-8 animate-fade-in"><h3 className="text-2xl text-white font-light mb-6">2. Características</h3><div className="flex gap-4 items-center"><Bed className="text-white/50"/><div className="flex gap-2 flex-1">{[1,2,3,4,5].map(n=><button key={n} className="flex-1 h-12 border border-white/10 rounded-lg text-white hover:bg-white hover:text-black transition-all">{n}</button>)}</div></div><div className="flex gap-4 items-center"><Bath className="text-white/50"/><div className="flex gap-2 flex-1">{[1,2,3,4].map(n=><button key={n} className="flex-1 h-12 border border-white/10 rounded-lg text-white hover:bg-white hover:text-black transition-all">{n}</button>)}</div></div><button onClick={()=>{soundFunc('click'); setViewState('PHOTO');}} className="w-full mt-4 py-4 bg-white text-black font-bold tracking-[0.2em] rounded-xl hover:bg-gray-200">SIGUIENTE</button></div>)}
        {viewState === 'PHOTO' && (<div className="space-y-6 animate-fade-in text-center"><h3 className="text-2xl text-white font-light">3. Material Visual</h3><div className="border-2 border-dashed border-white/10 rounded-2xl p-10 hover:border-amber-500/50 cursor-pointer transition-all bg-white/[0.02]"><Camera className="mx-auto text-white/30 mb-4" size={32}/><p className="text-xs text-white/50 uppercase tracking-widest">Subir Imágenes</p></div><button onClick={()=>{soundFunc('boot'); setViewState('SCAN');}} className="w-full mt-4 py-4 bg-amber-500 text-black font-bold tracking-[0.2em] rounded-xl hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]">FINALIZAR Y ESCANEAR</button></div>)}
        {viewState === 'SCAN' && (<div className="text-center space-y-8 animate-fade-in"><h3 className="text-2xl text-white font-light">Sintetizando Activo</h3><div className="aspect-video bg-white/5 border border-dashed border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden group"><div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent animate-pulse"></div><Smartphone className="text-amber-500 relative z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" size={56}/><div className="absolute bottom-4 text-[10px] text-amber-500/50 font-mono animate-pulse tracking-widest">RECOPILANDO VIBE DATA...</div></div><button onClick={() => {soundFunc('click'); setViewState('MARKET');}} className="w-full py-4 bg-amber-600 text-black font-bold text-sm tracking-[0.2em] rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-amber-500"><Zap size={16} fill="black"/> POTENCIAR SEÑAL</button></div>)}
        {viewState === 'MARKET' && (<div className="space-y-6 animate-fade-in"><div className="flex justify-between items-end"><div><h3 className="text-2xl text-white font-light">Marketplace</h3><p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Servicios Tácticos</p></div></div><div className="grid grid-cols-2 gap-3">{[{id:'g',n:'Global Net',p:450},{id:'d',n:'Drone Cinema',p:400}, {id:'h',n:'Hyper Ads',p:200}, {id:'e',n:'VIP Event',p:800}].map(s => (<div key={s.id} onClick={() => toggleService(s.id)} className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${cart.includes(s.id)?'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]':'bg-white/5 border-white/10 hover:border-white/30'}`}><div className="flex justify-between"><span className="text-white/60 text-[10px]">REF-{s.id.toUpperCase()}</span><span className="text-[9px] text-white/40 font-mono">{s.p}€</span></div><div className="text-white font-bold text-xs">{s.n}</div></div>))}</div><button onClick={() => {soundFunc('click'); setViewState('INBOX');}} className="w-full py-4 bg-white hover:bg-gray-200 text-black font-bold text-sm rounded-xl tracking-[0.2em] shadow-lg flex items-center justify-center gap-2">ACTIVAR CAMPAÑA <ArrowRight size={16}/></button></div>)}
        {viewState === 'INBOX' && (<div className="space-y-6 text-center animate-fade-in"><h3 className="text-xl text-white font-light flex items-center justify-center gap-3"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"/> AGENTES DETECTADOS</h3><div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-amber-500/50 p-6 rounded-2xl text-left relative overflow-hidden shadow-2xl hover:border-amber-400 transition-colors"><div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-black text-[9px] font-bold tracking-[0.2em]">PARTNER GOLD</div><div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500 text-amber-500 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]">AS</div><div><h4 className="text-white font-bold text-lg">Alexander Stark</h4><p className="text-white/50 text-xs">Zurich • International Realty</p></div></div><p className="text-white/70 text-xs italic bg-white/5 p-3 rounded border border-white/5 leading-relaxed">"Su inversión en video y dron es perfecta. Tengo compradores listos para visitar la propiedad esta semana."</p><button onClick={() => onCloseMode(true)} className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg tracking-[0.2em] transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.4)]">ACEPTAR ALIANZA</button></div></div>)}
      </div></div>
  );
};

const DualGateway = ({ onSelectMode }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full px-8"><div onClick={() => onSelectMode('EXPLORER')} className="group cursor-pointer glass-panel p-16 rounded-[2.5rem] hover:border-blue-500 text-center transition-all duration-500 hover:scale-[1.02] shadow-2xl relative overflow-hidden h-[500px] flex flex-col justify-center items-center"><div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div><div className="relative z-10 transform group-hover:-translate-y-2 transition-transform duration-500"><div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/20 group-hover:border-blue-500 group-hover:shadow-[0_0_30px_blue] transition-all duration-500"><Radar className="w-10 h-10 text-white group-hover:text-blue-400 transition-colors" strokeWidth={1.5} /></div><h2 className="text-5xl font-light text-white tracking-[0.2em] mb-4">EXPLORADOR</h2><p className="text-xs text-white/40 font-mono tracking-[0.4em] uppercase group-hover:text-blue-200 transition-colors">BUSCO OPORTUNIDADES</p></div></div><div onClick={() => onSelectMode('ARCHITECT')} className="group cursor-pointer glass-panel p-16 rounded-[2.5rem] hover:border-amber-500 text-center transition-all duration-500 hover:scale-[1.02] shadow-2xl relative overflow-hidden h-[500px] flex flex-col justify-center items-center"><div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div><div className="relative z-10 transform group-hover:-translate-y-2 transition-transform duration-500"><div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-amber-500/20 group-hover:border-amber-500 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all duration-500"><Building className="w-10 h-10 text-white group-hover:text-amber-400 transition-colors" strokeWidth={1.5} /></div><h2 className="text-5xl font-light text-white tracking-[0.2em] mb-4">ARQUITECTO</h2><p className="text-xs text-white/40 font-mono tracking-[0.4em] uppercase group-hover:text-amber-200 transition-colors">GESTIONAR MI ACTIVO</p></div></div></div>
);



