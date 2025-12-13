// @ts-nocheck
"use client";
import React, { useState } from 'react';
import { 
  MapPin, Heart, Search, Mic, MicOff, Globe, 
  ArrowRight, SlidersHorizontal, Trash2, Box, Square, Moon, Sun, Crosshair, X, MessageSquare, User
} from 'lucide-react';

// CONSTANTES VISUALES
const CORPORATE_BLUE = "#1d4ed8"; 
const NEON_GLOW = "0 0 20px rgba(37, 99, 235, 0.5)"; 
const TEXT_COLOR = "#d4d4d8"; 

// --- COMPONENTES ---

export const Gatekeeper = ({ onUnlock, t, sound }) => {
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

export const ViewControlDock = ({ onViewChange, currentView, t, sound }) => {
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

export const TopBar = ({ t, onGPS }) => (
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

export const StatusDeck = ({ notifications, clearNotifications, lang, setLang, sound, soundEnabled, toggleSound, t, onOpenChat }) => {
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
                    <button key={type} onClick={() => { sound.playClick(); setFilters({...filters, type}); }} className={`flex-1 py-2 text-[10px] font-bold rounded border transition-colors ${filters.type === type ? 'text-white border-transparent' : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'}`} style={filters.type === type ? {backgroundColor: CORPORATE_BLUE, boxShadow: NEON_GLOW} : {}}>{type === 'ALL' ? 'TODO' : type}</button>
                ))}
            </div>
        </div>
    );
};

export const OmniSearchDock = ({ onSearch, setActiveTab, activeTab, toggleFilters, t, sound, addNotification }) => {
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

