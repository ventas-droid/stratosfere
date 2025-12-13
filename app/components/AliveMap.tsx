// @ts-nocheck
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createRoot } from 'react-dom/client';
import { 
  MapPin, X, Heart, Search, Mic, Layers, Maximize2, ArrowRight, Globe,
  MessageSquare, User, Crosshair, Send, SlidersHorizontal, MicOff, Activity, Zap,
  TrendingUp, DollarSign, BarChart3, Phone, Trash2, Box, Square, Moon, Sun
} from 'lucide-react';

// IMPORTACIONES LOCALES (Rutas corregidas según tu captura)
import { useTacticalSound } from '../lib/hooks/use-tactical-sound';
import { 
    TRANSLATIONS, LUXURY_IMAGES, TIER_COLORS, DATA_PUNTOS, 
    CORPORATE_BLUE, NEON_GLOW, TEXT_COLOR, MAPBOX_TOKEN 
} from '../lib/placeholder-data';

// ==========================================
// SUB-COMPONENTES (Mantenidos aquí para que funcione YA)
// ==========================================

const Gatekeeper = ({ onUnlock, t, sound }: any) => {
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

const ViewControlDock = ({ onViewChange, currentView, t, sound }: any) => (
    <div className="absolute top-80 left-8 z-[9000] flex flex-col gap-2 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-xl shadow-xl flex flex-col gap-1.5">
            <button onClick={() => { sound.playClick(); onViewChange('3D'); }} className={`p-1.5 rounded-lg transition-all ${currentView.is3D ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}><Box size={16} /></button>
            <button onClick={() => { sound.playClick(); onViewChange('2D'); }} className={`p-1.5 rounded-lg transition-all ${!currentView.is3D ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}><Square size={16} /></button>
        </div>
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-xl shadow-xl flex flex-col gap-1.5">
            <button onClick={() => { sound.playClick(); onViewChange('MODE_DUSK'); }} className={`p-1.5 rounded-lg transition-all ${currentView.mode === 'dusk' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}><Moon size={16} /></button>
            <button onClick={() => { sound.playClick(); onViewChange('MODE_DAWN'); }} className={`p-1.5 rounded-lg transition-all ${currentView.mode === 'dawn' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}><Sun size={16} /></button>
        </div>
    </div>
);

const StatusDeck = ({ notifications, clearNotifications, lang, setLang, sound, soundEnabled, toggleSound, t, onOpenChat }: any) => {
  const cycleLang = (e: any) => { e.stopPropagation(); sound.playClick(); const langs = ['ES', 'EN']; setLang(langs[(langs.indexOf(lang) + 1) % langs.length]); };
  return (
    <div className="absolute top-24 right-8 z-[9000] pointer-events-auto flex flex-col gap-3 items-end w-[300px]">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl w-full shadow-2xl transition-all" style={{borderColor: CORPORATE_BLUE + '60'}}>
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{color: TEXT_COLOR}}>SYSTEM STATUS</span>
          <div className="flex gap-2 items-center"><span className="text-[9px] font-mono" style={{color: CORPORATE_BLUE}}>{lang}</span><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] text-white/60 font-mono cursor-pointer hover:text-white" onClick={cycleLang}><span>{t.status.lang}</span><span className="flex items-center gap-1" style={{color: CORPORATE_BLUE}}><Globe size={10} /></span></div>
          <div className="flex justify-between text-[10px] text-white/60 font-mono cursor-pointer hover:text-white" onClick={toggleSound}><span>{t.status.audio}</span><span className={soundEnabled ? "text-emerald-400" : "text-gray-500"}>{soundEnabled ? 'ON' : 'OFF'}</span></div>
        </div>
        {notifications.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10 overflow-hidden animate-fade-in-up">
                {notifications.map((notif:any, i:number) => (
                    <div key={i} className="mb-3 border-b border-white/5 pb-2">
                        <div className="text-[9px] mb-1 font-mono uppercase animate-pulse truncate w-full" style={{color: CORPORATE_BLUE}}>{notif.title}</div>
                        <div className="text-[10px] text-white/80 leading-tight w-full whitespace-normal">{notif.desc}</div>
                        {notif.action === 'CHAT' && <button onClick={() => onOpenChat()} className="mt-2 w-full py-1.5 bg-white/10 hover:bg-white/20 text-[9px] font-bold text-white rounded transition-colors flex items-center justify-center gap-1">{t.commandPanel.contact} <ArrowRight size={10}/></button>}
                    </div>
                ))}
                <button onClick={clearNotifications} className="mt-3 py-1 text-[9px] text-white/50 hover:text-red-400 uppercase tracking-wider w-full text-center flex items-center justify-center gap-1 transition-colors"><Trash2 size={10}/> {t.status.clear}</button>
            </div>
        )}
      </div>
    </div>
  );
};

const FilterPanel = ({ filters, setFilters, onClose, t, sound }: any) => {
    const formatMoney = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
    return (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xl z-[10001] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xs font-bold tracking-widest" style={{color: TEXT_COLOR}}>{t.filters.title}</h3><button onClick={onClose}><X size={16} className="text-white/50 hover:text-white"/></button></div>
            <div className="mb-4"><div className="flex justify-between text-[10px] text-white/60 mb-2"><span>{t.filters.price}</span><span style={{color: CORPORATE_BLUE}} className="font-mono">{formatMoney(filters.maxPrice)}</span></div><input type="range" min="100000" max="2000000" step="50000" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" style={{accentColor: CORPORATE_BLUE}} /></div>
            <div className="mb-6"><div className="flex justify-between text-[10px] text-white/60 mb-2"><span>{t.filters.area}</span><span style={{color: CORPORATE_BLUE}} className="font-mono">{filters.minArea} m²</span></div><input type="range" min="0" max="500" step="10" value={filters.minArea} onChange={(e) => setFilters({...filters, minArea: Number(e.target.value)})} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" style={{accentColor: CORPORATE_BLUE}} /></div>
            <div className="flex gap-2 mb-4">{['ALL', 'CASA', 'PISO'].map(type => (<button key={type} onClick={() => { sound.playClick(); setFilters({...filters, type}); }} className={`flex-1 py-2 text-[10px] font-bold rounded border transition-colors ${filters.type === type ? 'text-white border-transparent' : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'}`} style={filters.type === type ? {backgroundColor: CORPORATE_BLUE, boxShadow: NEON_GLOW} : {}}>{type === 'ALL' ? 'TODO' : type}</button>))}</div>
        </div>
    );
};

const OmniSearchDock = ({ onSearch, setActiveTab, activeTab, toggleFilters, t, sound, addNotification }: any) => {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const handleSearchSubmit = () => { sound.playClick(); onSearch(query); };
  const handleMic = () => {
      if (typeof window !== 'undefined' && !('webkitSpeechRecognition' in window)) { addNotification("INFO", "Voice module not supported"); return; }
      if (isListening) { setIsListening(false); return; }
      if (typeof window !== 'undefined') {
          const recognition = new (window as any).webkitSpeechRecognition();
          recognition.lang = 'es-ES'; recognition.interimResults = false; recognition.maxAlternatives = 1;
          recognition.onstart = () => { setIsListening(true); sound.playDeploy(); };
          recognition.onend = () => { setIsListening(false); };
          recognition.onresult = (event:any) => { const transcript = event.results[0][0].transcript; setQuery(transcript); sound.playPing(); onSearch(transcript); };
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

const MapNanoCard = ({ props, onToggleFavorite, isFavorite, onClose, onOpenDetail, t, sound }: any) => {
  const [liked, setLiked] = useState(isFavorite);
  const handleLike = (e: any) => { e.stopPropagation(); setLiked(!liked); onToggleFavorite(props); sound.playPing(); };
  const tierColor = TIER_COLORS[props.tier]?.hex || CORPORATE_BLUE;
  const tierGlow = TIER_COLORS[props.tier]?.glow || `0 0 15px ${CORPORATE_BLUE}60`;

  return (
    <div className="relative w-[320px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{borderColor: `${tierColor}40`}}>
      <div className="relative h-44 w-full cursor-pointer overflow-hidden" onClick={() => onOpenDetail(props)}>
        <img src={props.photoUrl} alt={props.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" onError={(e:any) => {e.target.onerror = null; e.target.src = LUXURY_IMAGES[0]}} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded text-[9px] font-bold tracking-widest text-white uppercase flex items-center gap-1.5">
           <div className="w-2 h-2 rounded-full" style={{backgroundColor: tierColor, boxShadow: tierGlow}}></div>{props.title}
        </div>
        <div className="absolute bottom-3 left-4"><span className="text-2xl font-light tracking-tight text-white">{props.precio}</span></div>
        <button onClick={handleLike} className="absolute bottom-3 right-3 p-2 rounded-full bg-black/30 hover:bg-white/10 transition-colors"><Heart size={18} className={liked ? 'fill-current' : ''} style={liked ? {color: tierColor} : {color: 'white'}} /></button>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-white/10 text-white/60 hover:text-white transition-colors backdrop-blur-md z-50"><X size={14} /></button>
      </div>
      <div className="p-4 border-t border-white/5">
        <div className="flex justify-between items-start mb-3"><div><h3 className="text-xs font-bold text-white mb-1">{props.category}</h3><p className="text-[10px] text-white/50 font-mono">ID: {props.id}</p></div><div className="text-right"><span className="text-xs text-white/70">{props.rooms} {t.specs.bed} • {props.area} {t.specs.sqm}</span></div></div>
        <div className="w-full"><button className="w-full py-3 rounded-lg text-white text-[10px] font-bold tracking-wider transition-colors flex items-center justify-center gap-1 hover:opacity-90 shadow-lg" style={{backgroundColor: tierColor, boxShadow: tierGlow}} onClick={() => { sound.playDeploy(); onOpenDetail(props); }}>{t.panel.contact} <ArrowRight size={12} /></button></div>
      </div>
    </div>
  );
};

const CommandCenterPanel = ({ property, onClose, t, sound, onContactAgent }: any) => {
    if (!property) return null;
    const tierColor = TIER_COLORS[property.tier]?.hex || CORPORATE_BLUE;
    const tierGlow = TIER_COLORS[property.tier]?.glow || `0 0 15px ${CORPORATE_BLUE}60`;
    const [downPayment, setDownPayment] = useState(20);
    const loanAmount = property.priceValue * (1 - downPayment/100);
    const monthlyRate = 3.5 / 100 / 12;
    const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -360));
    const formatMoney = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

    return (
        <div className="fixed inset-y-0 right-0 w-full max-w-3xl bg-[#050505]/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[11000] animate-slide-left overflow-y-auto custom-scrollbar flex flex-col">
            <div className="relative h-80 w-full shrink-0">
                <img src={property.photoUrl} className="w-full h-full object-cover" onError={(e:any) => {e.target.src = LUXURY_IMAGES[0]}} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/50 backdrop-blur rounded-full text-white/60 hover:text-white transition-colors"><X size={20} /></button>
                <div className="absolute top-6 left-6 flex gap-2"><button className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-xs font-bold text-white border border-white/10 hover:bg-white/20 transition-all flex items-center gap-2" onClick={() => sound.playClick()}><Maximize2 size={14}/> {t.commandPanel.expand}</button></div>
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end"><div><div className="flex items-center gap-2 mb-2"><div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[10px] font-bold tracking-[0.2em] text-white uppercase flex items-center gap-2"><div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: tierColor, boxShadow: tierGlow}}></div>{property.title} RANGO</div></div><h2 className="text-5xl font-light text-white tracking-tight">{property.precio}</h2></div><div className="text-right hidden md:block"><div className="text-xs text-white/40 font-mono mb-1">ASSET ID</div><div className="text-lg text-white font-mono" style={{color: tierColor}}>{property.id}</div></div></div>
            </div>
            <div className="p-8 flex-grow flex flex-col gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl"><div className="flex justify-between items-center mb-4"><h3 className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={16}/> TENDENCIA MERCADO (5 AÑOS)</h3><span className="text-xs font-mono text-emerald-400">+12.5% vs 2023</span></div><div className="h-24 w-full px-2"></div></div>
                <div className="grid grid-cols-3 gap-4">{[{ label: t.specs.sqm, value: property.area, icon: Maximize2 }, { label: t.specs.bed, value: property.rooms, icon: User }, { label: t.specs.bath, value: property.baths, icon: Zap }].map((stat, i) => (<div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-white/10 transition-all"><div><div className="text-2xl font-light text-white">{stat.value}</div><div className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</div></div><stat.icon size={20} className="text-white/20 group-hover:text-white/40 transition-colors"/></div>))}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full"><div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col relative overflow-hidden" style={{borderColor: `${tierColor}30`}}><div className="flex justify-between items-center mb-6"><h3 className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2"><DollarSign size={16}/> {t.commandPanel.finance}</h3><div className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">LIVE DATA <Activity size={10} className="animate-pulse"/></div></div><div className="flex-grow flex flex-col justify-center gap-6"><div className="flex justify-between items-end p-4 bg-black/40 rounded-xl border border-white/5"><div><span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">{t.commandPanel.roi}</span><span className="text-3xl font-mono text-emerald-400">{(Math.random() * 4 + 4).toFixed(1)}%</span></div><BarChart3 size={24} className="text-emerald-500/50"/></div><div className="space-y-4"><div><div className="flex justify-between text-xs text-white/70 mb-2 font-mono"><span>{t.commandPanel.down}</span><span style={{color: tierColor}}>{downPayment}%</span></div><input type="range" min="10" max="80" step="5" value={downPayment} onChange={e=>setDownPayment(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer" style={{accentColor: tierColor}}/></div></div></div><div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center"><span className="text-xs text-white/50 uppercase tracking-wider">{t.commandPanel.monthly}</span><span className="text-2xl font-mono text-white">{formatMoney(monthlyPayment)}</span></div></div></div>
                <button onClick={onContactAgent} className="w-full py-4 bg-white text-black font-bold text-sm uppercase tracking-[0.2em] rounded-xl hover:scale-[1.02] transition-all shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div><span className="relative z-10">{t.commandPanel.contact}</span> <Phone size={18} className="relative z-10"/></button>
            </div>
        </div>
    );
};

const TheVault = ({ favorites, onClose, t, sound, removeFromFavs, onFlyTo }: any) => {
    const totalValue = favorites.reduce((acc:any, curr:any) => acc + curr.priceValue, 0);
    const formatMoney = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
    return (
        <div className="fixed inset-0 z-[55000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-5xl h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                <button className="absolute top-6 right-6 z-[60000] p-2 bg-white/5 rounded-full hover:bg-red-500/20 hover:text-red-500 text-white/50 transition-all cursor-pointer" onClick={(e) => { e.stopPropagation(); sound.playClick(); onClose(); }}><X size={20} /></button>
                <div className="flex justify-between items-end p-8 border-b border-white/5 bg-[#0a0a0a]"><div><h2 className="text-3xl font-light text-white tracking-widest uppercase mb-1">{t.vault.title}</h2><p className="text-[10px] font-mono text-white/40">{favorites.length} {t.vault.items} // PORTFOLIO</p></div><div className="text-right mr-12"><span className="block text-[10px] text-white/40 font-mono tracking-wider uppercase">{t.vault.totalValue}</span><span className="block text-4xl font-light tracking-tighter" style={{color: CORPORATE_BLUE}}>{formatMoney(totalValue)}</span></div></div>
                <div className="flex-grow overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar">{favorites.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-white/20 gap-4"><Layers size={64} strokeWidth={0.5} /><span className="font-mono text-xs tracking-[0.3em] uppercase">{t.vault.empty}</span></div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{favorites.map((fav:any) => (<div key={fav.id} className="group relative bg-[#111] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-lg flex flex-col" onClick={() => { sound.playDeploy(); onFlyTo(fav); onClose(); }}><div className="relative h-48 overflow-hidden cursor-pointer"><img src={fav.photoUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e:any) => {e.target.src = LUXURY_IMAGES[0]}} /><div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded border border-white/10"><span className="text-[10px] text-white font-mono">{fav.precio}</span></div></div><div className="p-4 flex flex-col gap-2 flex-grow justify-between"><div><h3 className="text-white text-sm font-medium truncate">{fav.title}</h3><p className="text-[10px] text-white/40 font-mono mt-1">{fav.id}</p></div><div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5"><span className="text-[10px] font-bold tracking-widest hover:underline cursor-pointer" style={{color: CORPORATE_BLUE}}>{t.vault.view}</span><button className="text-white/20 hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); sound.playClick(); removeFromFavs(fav); }}><X size={14} /></button></div></div></div>))}</div>)}</div>
            </div>
        </div>
    );
};

const ChatPanel = ({ t, sound, onClose, context }: any) => {
    const [msgs, setMsgs] = useState<any[]>([]);
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

const ProfileDashboard = ({ t, onClose }: any) => (
    <div className="fixed inset-0 z-[12000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-[#050505] border border-white/10 w-full max-w-md rounded-3xl p-8 relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white"><X size={20}/></button>
            <div className="flex flex-col items-center"><div className="w-20 h-20 rounded-full bg-white/5 p-1 mb-4 border border-white/10"><div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xl font-bold text-white">US</div></div><h2 className="text-2xl font-light text-white tracking-widest uppercase">{t.profile.title}</h2><span className="text-xs font-mono mb-8" style={{color: CORPORATE_BLUE}}>{t.profile.rank} ACCESS</span><div className="w-full grid grid-cols-2 gap-4"><div className="bg-white/5 p-4 rounded-xl text-center border border-white/5"><div className="text-2xl text-white font-bold">12</div><div className="text-[10px] text-white/50 uppercase">{t.profile.missions}</div></div><div className="bg-white/5 p-4 rounded-xl text-center border border-white/5"><div className="text-2xl text-white font-bold">03</div><div className="text-[10px] text-white/50 uppercase">{t.profile.conquests}</div></div></div></div>
        </div>
    </div>
);

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
const AliveMap = () => {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const selectedMarkerRef = useRef<mapboxgl.Marker | null>(null); 
  const activePopupIdRef = useRef<string | null>(null);

  const [selectedProperty, setSelectedProperty] = useState(null); 
  const [chatContext, setChatContext] = useState<any>(null); 
  const [viewState, setViewState] = useState('LOCKED'); 
  const [activeTab, setActiveTab] = useState('map'); 
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [systemNotifs, setSystemNotifs] = useState<any[]>([]);
  const [filters, setFilters] = useState({ maxPrice: 2000000, minArea: 0, type: 'ALL' });
  const [currentView, setCurrentView] = useState({ is3D: true, mode: 'dusk' });
  const [lang, setLang] = useState('ES');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const sound = useTacticalSound(true);
  const t = TRANSLATIONS[lang] || TRANSLATIONS['ES']; 
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => { try { const savedFavs = localStorage.getItem('alive_favorites'); if (savedFavs) setFavorites(JSON.parse(savedFavs)); } catch(e) {} }, []);
  useEffect(() => { try { localStorage.setItem('alive_favorites', JSON.stringify(favorites)); } catch(e) {} }, [favorites]);

  const toggleFavorite = (prop:any) => { 
      setFavorites(prev => {
          const exists = prev.some(f => f.id === prop.id);
          const newFavs = exists ? prev.filter(f => f.id !== prop.id) : [...prev, prop];
          setSystemNotifs(prevNotifs => [{title: "INFO", desc: exists ? t.notifications?.removed : t.notifications?.added, action: null}, ...prevNotifs]);
          return newFavs;
      }); 
      sound.playPing();
  };
  const handleContactAgent = () => { setChatContext(selectedProperty); setShowCommandCenter(false); setActiveTab('chat'); sound.playDeploy(); };
  const handleUnlock = () => { map.current?.flyTo({ center: [-3.7038, 40.4168], zoom: 15.5, pitch: 60, bearing: -20, duration: 4000, essential: true }); setViewState('ACTIVE'); };
  const handleViewChange = (type: string) => {
      if (!map.current) return;
      if (type === '3D') { map.current.easeTo({ pitch: 60, bearing: -20, duration: 1000 }); setCurrentView(p => ({...p, is3D: true})); }
      if (type === '2D') { map.current.easeTo({ pitch: 0, bearing: 0, duration: 1000 }); setCurrentView(p => ({...p, is3D: false})); }
      if (type.startsWith('MODE_')) {
          const mode = type.replace('MODE_', '').toLowerCase();
          if (map.current.getStyle().name !== 'Mapbox Standard') map.current.setStyle('mapbox://styles/mapbox/standard');
          setTimeout(() => { try { map.current?.setConfig('basemap', { lightPreset: mode, showPointOfInterestLabels: false, showTransitLabels: false }); } catch(e) {} }, 500);
          setCurrentView(p => ({...p, mode}));
      }
  };

  const handleOmniSearch = (query: string) => {
      const q = query.toLowerCase();
      const newFilters = {...filters};
      let changed = false;
      if (q.match(/(\d+)m/)) { newFilters.maxPrice = parseInt(q.match(/(\d+)m/)![1]) * 1000000; changed = true; }
      if (q.match(/(\d+)k/)) { newFilters.maxPrice = parseInt(q.match(/(\d+)k/)![1]) * 1000; changed = true; }
      if (q.includes('casa')) { newFilters.type = 'CASA'; changed = true; }
      if (q.includes('piso')) { newFilters.type = 'PISO'; changed = true; }
      if(changed) { setFilters(newFilters); setSystemNotifs(prev => [{title: "OMNI AI", desc: t.notifications?.filter, action: null}, ...prev]); }
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=es`).then(res => res.json()).then(data => { if(data.features && data.features.length > 0) map.current?.flyTo({center: data.features[0].center, zoom: 14}); });
  };
  
  // Efecto marcador seleccionado
  useEffect(() => {
    if (!map.current) return;
    if (selectedMarkerRef.current) { selectedMarkerRef.current.remove(); selectedMarkerRef.current = null; }
    if (selectedProperty && !isNaN((selectedProperty as any).lng)) { 
        const tierHex = TIER_COLORS[(selectedProperty as any).tier]?.hex || CORPORATE_BLUE;
        const el = document.createElement('div'); el.className = 'pulsing-dot';
        el.style.cssText = `width: 24px; height: 24px; border-radius: 50%; position: relative; display: flex; justify-content: center; align-items: center; background-color: transparent; z-index: -1;`;
        const pulse = document.createElement('div'); pulse.style.cssText = `position: absolute; inset: 0; border-radius: 50%; border: 2px solid ${tierHex}; box-shadow: 0 0 10px ${tierHex}; animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);`;
        const center = document.createElement('div'); center.style.cssText = `width: 8px; height: 8px; border-radius: 50%; background-color: ${tierHex}; box-shadow: 0 0 10px ${tierHex};`;
        el.appendChild(pulse); el.appendChild(center);
        selectedMarkerRef.current = new mapboxgl.Marker(el).setLngLat([(selectedProperty as any).lng, (selectedProperty as any).lat]).addTo(map.current);
    }
  }, [selectedProperty]);

  // Filtros de mapa
  useEffect(() => {
      if (!map.current) return;
      if (!map.current.getLayer('unclustered-point')) return;
      const activeFilters: any[] = ['all'];
      activeFilters.push(['<=', ['get', 'priceValue'], filters.maxPrice]);
      activeFilters.push(['>=', ['get', 'area'], filters.minArea]);
      if (filters.type !== 'ALL') activeFilters.push(['==', ['get', 'category'], filters.type]);
      map.current.setFilter('unclustered-point', activeFilters);
      map.current.setFilter('clusters', activeFilters); 
  }, [filters]);

  const loadLayers = (m: mapboxgl.Map) => {
    if (m.getSource('puntos')) return; 
    m.addSource('puntos', { type: 'geojson', data: DATA_PUNTOS as any, cluster: true, clusterMaxZoom: 14, clusterRadius: 50 });
    if (!m.getLayer('clusters')) {
        m.addLayer({ id: 'clusters', type: 'circle', source: 'puntos', filter: ['has', 'point_count'], paint: { 'circle-color': ['step', ['get', 'point_count'], CORPORATE_BLUE, 100, '#2563eb', 750, '#1d4ed8'], 'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40], 'circle-stroke-width': 2, 'circle-stroke-color': '#000', 'circle-opacity': 0.9 } });
        m.addLayer({ id: 'cluster-count', type: 'symbol', source: 'puntos', filter: ['has', 'point_count'], layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12 }, paint: { 'text-color': '#fff' } });
        m.addLayer({ id: 'unclustered-point', type: 'circle', source: 'puntos', filter: ['!', ['has', 'point_count']], paint: { 'circle-radius': 6, 'circle-color': ['get', 'colorCore'], 'circle-stroke-width': 2, 'circle-stroke-color': '#000' } });
    }
    m.on('click', 'clusters', (e) => { sound.playClick(); const features = m.queryRenderedFeatures(e.point, { layers: ['clusters'] }); const clusterId = features[0].properties?.cluster_id; (m.getSource('puntos') as any).getClusterExpansionZoom(clusterId, (err:any, zoom:any) => { if(!err) m.easeTo({ center: (features[0].geometry as any).coordinates, zoom: zoom }); }); });
    m.on('mouseenter', 'clusters', () => { m.getCanvas().style.cursor = 'pointer'; sound.playHover(); }); m.on('mouseleave', 'clusters', () => { m.getCanvas().style.cursor = ''; });
    m.on('click', 'unclustered-point', (e) => { 
        sound.playClick(); 
        const coords = (e.features![0].geometry as any).coordinates.slice();
        m.flyTo({ center: coords, zoom: 17, pitch: 60 }); 
        const props = e.features![0].properties;
        const clickedProps = { ...props, gallery: props?.gallery ? JSON.parse(props.gallery) : [props?.photoUrl], lng: coords[0], lat: coords[1], priceValue: Number(props?.priceValue), area: Number(props?.area) }; 
        activePopupIdRef.current = clickedProps.id;
        const isFav = favorites.some(f => f.id === clickedProps.id);
        const popupNode = document.createElement('div'); popupNode.onclick = (e) => e.stopPropagation();
        const root = createRoot(popupNode);
        root.render(<MapNanoCard props={clickedProps} onToggleFavorite={toggleFavorite} isFavorite={isFav} onClose={() => { popupRef.current?.remove(); activePopupIdRef.current = null; }} onOpenDetail={(p:any) => { setSelectedProperty(p); setShowCommandCenter(true); popupRef.current?.remove(); sound.playDeploy(); }} t={t} sound={sound} />); 
        popupRef.current?.setLngLat(coords).setDOMContent(popupNode).addTo(m); 
    });
    m.on('mouseenter', 'unclustered-point', () => { m.getCanvas().style.cursor = 'pointer'; sound.playHover(); }); m.on('mouseleave', 'unclustered-point', () => { m.getCanvas().style.cursor = ''; });
  };

  useEffect(() => { 
      if (map.current || !mapContainer.current) return; 
      mapboxgl.accessToken = MAPBOX_TOKEN; 
      map.current = new mapboxgl.Map({ container: mapContainer.current, style: 'mapbox://styles/mapbox/standard', center: [0, 40], zoom: 2, pitch: 0, attributionControl: false, antialias: true, projection: 'globe' as any }); 
      map.current.on('style.load', () => { map.current?.setConfig('basemap', { lightPreset: 'dusk', showPointOfInterestLabels: false, showTransitLabels: false }); loadLayers(map.current!); });
      popupRef.current = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 14, maxWidth: 'none', className: 'tactical-popup' }); 
  }, []);

  return (
      <>
      <div ref={mapContainer} className="w-full h-full" style={{ height: '100vh', width: '100vw' }} />
      {viewState === 'ACTIVE' && ( <>
            <div className="absolute top-0 left-0 right-0 z-[10000] px-8 py-6 flex justify-between items-start pointer-events-none"><div className="pointer-events-auto flex flex-col"><h1 className="text-2xl font-light tracking-[0.3em] drop-shadow-md" style={{color: TEXT_COLOR}}>STRATOS<span className="font-bold" style={{color: CORPORATE_BLUE}}>FERE</span></h1></div><div className="pointer-events-auto flex items-center gap-3"><button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]" onClick={() => { if (typeof navigator !== 'undefined') navigator.geolocation.getCurrentPosition(p => map.current?.flyTo({ center: [p.coords.longitude, p.coords.latitude], zoom: 16, pitch: 45 })) }}><Crosshair className="w-5 h-5" /></button></div></div>
            <ViewControlDock onViewChange={handleViewChange} currentView={currentView} t={t} sound={sound} />
            <StatusDeck notifications={systemNotifs} clearNotifications={() => setSystemNotifs([])} lang={lang} setLang={setLang} sound={sound} soundEnabled={soundEnabled} toggleSound={() => setSoundEnabled(!soundEnabled)} t={t} onOpenChat={() => setActiveTab('chat')} />
            <OmniSearchDock onSearch={handleOmniSearch} setActiveTab={setActiveTab} activeTab={activeTab} toggleFilters={() => setShowFilters(!showFilters)} t={t} sound={sound} addNotification={(t:string, d:string) => setSystemNotifs(p => [{title:t, desc:d}, ...p])} />
            {showFilters && <FilterPanel filters={filters} setFilters={setFilters} onClose={() => setShowFilters(false)} t={t} sound={sound} />}
            {showCommandCenter && <CommandCenterPanel property={selectedProperty} onClose={() => setShowCommandCenter(false)} t={t} sound={sound} onContactAgent={handleContactAgent} />}
            {activeTab === 'vault' && <TheVault favorites={favorites} onClose={() => setActiveTab('map')} t={t} sound={sound} removeFromFavs={toggleFavorite} onFlyTo={(fav:any) => { setSelectedProperty(fav); setActiveTab('map'); setShowCommandCenter(true); }} />}
            {activeTab === 'chat' && <ChatPanel t={t} sound={sound} onClose={() => setActiveTab('map')} context={chatContext} />}
            {activeTab === 'profile' && <ProfileDashboard t={t} onClose={() => setActiveTab('map')} />}
      </> )}
      {viewState !== 'ACTIVE' && <Gatekeeper onUnlock={handleUnlock} t={t} sound={sound} />}
    </>
  );
};

export default AliveMap;

