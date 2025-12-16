"use client";

import React, { useState, useEffect } from 'react';
import { Search, Activity, TrendingUp, Archive, ChevronDown, Bell } from 'lucide-react';

// ESTO ES LO IMPORTANTE: Exportamos la interfaz para que page.tsx la lea bien
export interface SmartHubProps {
  onSelectLocation: (coords: [number, number]) => void;
}

const SmartHub = ({ onSelectLocation }: SmartHubProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);

  const COORDS_CHAMBERI: [number, number] = [-3.6990, 40.4320];
  const COORDS_GOYA: [number, number] = [-3.6765, 40.4245];
  const COORDS_OPENHOUSE: [number, number] = [-3.6840, 40.4290]; 

  useEffect(() => {
    const interval = setInterval(() => {
      if (isMinimized) {
        setHasNotification(true);
        setTimeout(() => setHasNotification(false), 4000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isMinimized]);

  const toggleMenu = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) setHasNotification(false);
  };

  if (isMinimized) {
    return (
      <button 
        onClick={toggleMenu}
        className={`group flex items-center gap-3 px-4 py-3 backdrop-blur-xl border rounded-full shadow-2xl transition-all duration-300 hover:scale-105 ${
          hasNotification 
            ? 'bg-red-900/80 border-red-500 animate-pulse-fast'
            : 'bg-black/80 border-white/10 hover:border-blue-500/50'
        }`}
      >
        <div className="relative">
            <div className={`w-3 h-3 rounded-full ${hasNotification ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`}></div>
            {hasNotification && <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping"></div>}
        </div>
        
        <span className={`font-mono text-xs font-bold tracking-widest ${hasNotification ? 'text-red-100' : 'text-white/80'}`}>
            {hasNotification ? 'INCOMING INTEL...' : 'STRATOSFERE OS'}
        </span>
        
        {hasNotification && <Bell className="w-3 h-3 text-red-200 animate-bounce" />}
      </button>
    );
  }

  return (
    <div className="w-[340px] flex flex-col gap-2 animate-slide-up-fade">
      
      <button 
        onClick={toggleMenu}
        className="flex items-center justify-between bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-lg group hover:border-blue-500/30 transition-colors"
      >
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono font-bold tracking-widest text-white">ONLINE</span>
        </div>
        <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-white transition-colors rotate-180" />
      </button>

      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl font-mono text-sm">
        <div className="p-3 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2 bg-black/50 rounded-lg px-3 py-2 border border-white/10 focus-within:border-blue-500/50 transition-colors">
            <Search className="w-4 h-4 text-white/50" />
            <input type="text" placeholder="Filtrar señales..." className="bg-transparent border-none outline-none text-white placeholder-white/30 w-full text-xs"/>
          </div>
        </div>

        <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
          
          <button onClick={() => onSelectLocation(COORDS_OPENHOUSE)} className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-900/20 to-transparent border-l-2 border-yellow-500 hover:bg-white/5 transition-all group text-left">
            <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                <Activity className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="flex-1">
              <div className="text-yellow-100 font-bold text-xs flex justify-between">
                OPEN HOUSE
                <span className="text-[9px] bg-yellow-500 text-black px-1 rounded animate-pulse">LIVE</span>
              </div>
              <div className="text-white/40 text-[10px] mt-0.5">Velázquez 24 • Acceso NFC</div>
            </div>
          </button>

          <button onClick={() => onSelectLocation(COORDS_CHAMBERI)} className="w-full flex items-center gap-3 p-3 rounded-lg border-l-2 border-green-500 hover:bg-white/5 transition-all group text-left">
            <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex-1">
               <div className="text-white font-bold text-xs flex justify-between">
                TENDENCIA: CHAMBERÍ
                <span className="text-[9px] text-green-400">+15%</span>
              </div>
              <div className="text-white/40 text-[10px] mt-0.5">Alta demanda detectada</div>
            </div>
          </button>

          <button onClick={() => onSelectLocation(COORDS_GOYA)} className="w-full flex items-center gap-3 p-3 rounded-lg border-l-2 border-blue-500 hover:bg-white/5 transition-all group text-left">
            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <Archive className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1">
               <div className="text-white font-bold text-xs flex justify-between">
                ALERTA DE PRECIO
                <span className="text-[9px] text-blue-400">BAJADA</span>
              </div>
              <div className="text-white/40 text-[10px] mt-0.5">Goya: 990k → 950k</div>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};

export default SmartHub;

