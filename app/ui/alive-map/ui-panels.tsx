// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { 
  Heart, X, ArrowRight, Layers, Maximize2, User, Zap, TrendingUp, DollarSign, Activity, BarChart3, Phone, Send 
} from 'lucide-react';

// CONSTANTES REPETIDAS (Para asegurar funcionamiento modular inmediato)
const CORPORATE_BLUE = "#1d4ed8"; 
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

// --- COMPONENTES ---

export const MapNanoCard = ({ props, onToggleFavorite, isFavorite, onClose, onOpenDetail, t, sound }) => {
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

export const CommandCenterPanel = ({ property, onClose, t, sound, onContactAgent }) => {
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

export const TheVault = ({ favorites, onClose, t, sound, removeFromFavs, onFlyTo }) => {
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

export const ChatPanel = ({ t, sound, onClose, context }) => {
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

export const ProfileDashboard = ({ t, onClose }) => (
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

// EN app/components/alive-map/ui-panels.tsx

import React, { useState, useMemo } from 'react';
import { X, DollarSign, Camera, FileText, Zap, TrendingUp, Sun } from 'lucide-react';
// IMPORTAR LA LÓGICA DE CLASIFICACIÓN
import { getPropertyTier, TIER_CONFIG } from './property-tiers'; // <--- NUEVA IMPORTACIÓN

// --- COMPONENTE: FORMULARIO DE CAPTURA DE PROPIEDAD ---
export const PropertyCaptureForm = ({ onClose, t, sound }) => {
    const [price, setPrice] = useState(0);
    const [photos, setPhotos] = useState([]);
    const [description, setDescription] = useState('');
    const [energyCert, setEnergyCert] = useState('NOT_APPLY'); // Valores: A+, B, C, D... o NOT_APPLY

    // CLASIFICACIÓN AUTOMÁTICA DE LA PROPIEDAD BASADA EN EL PRECIO
    const currentTierKey = useMemo(() => getPropertyTier(price), [price]);
    const tier = TIER_CONFIG[currentTierKey];
    
    // El color de la "Ficha de la Feria" se actualiza aquí
    const tierColor = tier.color; 
    const tierName = tier.name;

    const handlePriceChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        setPrice(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sound.playClick();
        console.log('Propiedad lista para el envío:', { price, description, energyCert, tierName });
        // Aquí iría la lógica de API para subir la propiedad...
        onClose();
    };

    const inputClass = "w-full bg-white/5 border border-white/10 p-2 text-sm text-white/90 rounded-md focus:ring-1 transition-all";
    const sectionClass = "mb-6 p-4 border border-white/10 rounded-xl bg-black/50";

    return (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center backdrop-blur-sm animate-fade-in-up" onClick={onClose}>
            <div 
                className="w-[600px] h-[80vh] bg-black/90 border border-white/20 rounded-2xl shadow-3xl overflow-y-auto custom-scrollbar p-6" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10 sticky top-0 bg-black/90 z-10">
                    <h2 className="text-xl font-bold tracking-widest uppercase" style={{color: tierColor}}>
                        {t.form.title} | {tierName}
                    </h2>
                    <button onClick={onClose} className="p-2 text-white/50 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    
                    {/* SECCIÓN 1: PRECIO y CLASIFICACIÓN (Ficha de la Feria) */}
                    <div className={sectionClass}>
                        <div className="flex items-center gap-2 mb-3 text-white font-mono uppercase" style={{color: tierColor}}>
                            <DollarSign size={16} /> {t.form.section_price}
                        </div>
                        <label className="block mb-4">
                            <span className="text-xs text-white/60 mb-1 block">{t.form.label_price} (€)</span>
                            <input
                                type="number"
                                value={price}
                                onChange={handlePriceChange}
                                className={inputClass}
                                placeholder="Ej: 450000"
                            />
                        </label>
                        <div className="p-3 rounded-lg flex items-center justify-center text-sm font-bold mt-4" style={{ backgroundColor: tierColor + '20', border: `1px solid ${tierColor}` }}>
                            {t.form.assigned_tier}: <span className="ml-2 font-mono" style={{color: tierColor}}>{tierName}</span>
                        </div>
                    </div>
                    
                    {/* SECCIÓN 2: CERTIFICADO ENERGÉTICO */}
                    <div className={sectionClass}>
                        <div className="flex items-center gap-2 mb-3 text-white font-mono uppercase">
                            <Zap size={16} style={{color: tierColor}}/> {t.form.section_energy}
                        </div>
                        <label className="block mb-4">
                            <span className="text-xs text-white/60 mb-1 block">{t.form.label_certificate}</span>
                            <select
                                value={energyCert}
                                onChange={(e) => setEnergyCert(e.target.value)}
                                className={inputClass}
                            >
                                <option value="NOT_APPLY">En Trámite / No Aplica</option>
                                {['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'].map(cert => (
                                    <option key={cert} value={cert}>{cert}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* SECCIÓN 3: DESCRIPCIÓN Y FOTOS (Para simplificar la estructura) */}
                    <div className={sectionClass}>
                        <div className="flex items-center gap-2 mb-3 text-white font-mono uppercase">
                            <FileText size={16} style={{color: tierColor}}/> {t.form.section_details}
                        </div>
                        <label className="block mb-4">
                            <span className="text-xs text-white/60 mb-1 block">{t.form.label_description}</span>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={inputClass + " h-24"}
                                placeholder={t.form.placeholder_description}
                            />
                        </label>
                        <div className="mt-4 p-4 border border-dashed border-white/20 rounded-lg text-center cursor-pointer hover:bg-white/5 transition-colors" onClick={() => alert(t.form.alert_upload_photos)}>
                            <Camera size={20} className="mx-auto text-white/50 mb-1" />
                            <span className="text-xs text-white/60">{t.form.label_upload_photos}</span>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full py-3 mt-4 text-sm font-bold uppercase tracking-widest rounded-lg transition-all"
                        style={{ backgroundColor: tierColor, color: 'black', boxShadow: `0 4px 15px -5px ${tierColor}`}}
                    >
                        {t.form.submit_button}
                    </button>
                    
                </form>
            </div>
        </div>
    );
};

// EN app/components/alive-map/ui-panels.tsx (en la sección final de exportación)
// ...
export { ChatPanel } from './ui-panels'; // (Solo ejemplo si lo tiene)
// ...
export { PropertyCaptureForm } // Asegúrese de que PropertyCaptureForm está visible

