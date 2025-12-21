"use client";

import React from "react";
import { X, CheckCircle2 } from "lucide-react";
// Asegúrese de que la ruta a market-data es correcta. 
// Si da error, pruebe con '../../market-data' o la ruta donde tenga ese archivo.
import { MARKET_CATALOG } from "../market-data";

export default function MarketPanel({
  isOpen,
  onClose,
  marketTab,
  setMarketTab,
  selectedReqs = [],
  toggleRequirement,
  soundEnabled,
  playSynthSound,
}: any) {
  
  // Si no está abierto, no renderizamos nada
  if (!isOpen) return null;

  // Cálculos de presupuesto
  const mySpend = selectedReqs.reduce((acc: number, id: any) => {
    const item = MARKET_CATALOG.find((x: any) => x.id === id);
    return acc + (item ? item.price : 0);
  }, 0);

  const agencyValue = selectedReqs.reduce((acc: number, id: any) => {
    const item = MARKET_CATALOG.find((x: any) => x.id === id);
    return acc + (item ? item.marketValue : 0);
  }, 0);

  // Manejo de sonido
  const handleSound = (type: string) => {
    if (soundEnabled && playSynthSound) playSynthSound(type);
  };

  return (
    <div className="fixed inset-y-0 left-0 w-full md:w-[500px] z-[60000] flex flex-col pointer-events-auto animate-slide-in-left">
      
      {/* 1. FONDO BLUR (Estilo Cristal) */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-3xl shadow-[20px_0_50px_rgba(0,0,0,0.1)]"></div>

      <div className="relative z-10 flex flex-col h-full text-slate-900">
        
        {/* 2. HEADER */}
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
              onClick={() => { handleSound('click'); onClose(); }}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* BARRA DE PROGRESO */}
          <div className="bg-white/50 rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nivel de Autoridad</span>
                <span className="text-[10px] font-bold text-[#0071e3]">{selectedReqs.length} / 26 Activos</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-[#0071e3] transition-all duration-700 rounded-full" 
                    style={{ width: `${Math.min(100, (selectedReqs.length / 26) * 100)}%` }}
                ></div>
            </div>
          </div>
        </div>

        {/* 3. PESTAÑAS (TABS) */}
        <div className="px-8 py-2 flex-shrink-0">
            <div className="flex p-1 bg-slate-100/80 rounded-xl">
                {['ONLINE', 'OFFLINE', 'PACK'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => { handleSound('click'); setMarketTab(tab); }}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${marketTab === tab ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {/* 4. GRID DE PRODUCTOS (SCROLL) */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 scrollbar-hide">
            <div className="grid grid-cols-2 gap-4 pb-20">
                {MARKET_CATALOG.filter((i: any) => i.category === marketTab).map((item: any) => {
                    const isActive = selectedReqs.includes(item.id);
                    return (
                        <div 
                            key={item.id} 
                            onClick={() => { handleSound('click'); toggleRequirement(item); }}
                            className={`
                                relative p-5 rounded-3xl border transition-all duration-200 cursor-pointer group flex flex-col justify-between gap-3 min-h-[160px]
                                ${isActive 
                                    ? 'bg-blue-50/80 border-[#0071e3]/30 ring-1 ring-[#0071e3]' 
                                    : 'bg-white/60 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-lg hover:-translate-y-1'}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-2xl transition-colors ${isActive ? 'bg-[#0071e3] text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
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

        {/* 5. FOOTER (RESUMEN) */}
        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-white via-white/95 to-transparent z-20">
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2rem] p-1 shadow-2xl shadow-slate-200/50">
                <div className="flex justify-between items-center px-6 py-4">
                    <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Valor Impacto</div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{agencyValue.toLocaleString()} €</div>
                    </div>
                    
                    <button 
                        disabled={selectedReqs.length === 0}
                        onClick={() => {
                            handleSound('complete');
                            onClose();
                        }}
                        className={`
                            px-8 py-4 font-bold text-sm rounded-3xl transition-all shadow-lg active:scale-95
                            ${selectedReqs.length > 0 
                                ? 'bg-[#0071e3] hover:bg-[#0077ED] text-white shadow-[#0071e3]/30 cursor-pointer' 
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}
                        `}
                    >
                        {selectedReqs.length > 0 ? "Aplicar" : "Seleccionar"}
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );


  
}