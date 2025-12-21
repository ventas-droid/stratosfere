"use client";
import React, { useState, useEffect } from 'react';
import { Radar as RadarIcon, LayoutGrid, SlidersHorizontal, ArrowRight } from 'lucide-react';
// IMPORTANTE: Al ser .tsx ahora, este import funcionará sin problemas
import MapNanoCard from './MapNanoCard'; 

export default function ExplorerHud({ onCloseMode, soundFunc, onGoToMap, favorites = [] }: any) {
  const [phase, setPhase] = useState('SCAN'); 
  const [steps, setSteps] = useState(20); 
  const [selectedType, setSelectedType] = useState('RESIDENCIAL');
  const isElite = steps * 50000 >= 5000000;

  // DATOS MOCK
  const nearbyProps = [
    { id: 101, title: "Loft Industrial", price: "140.000€", priceValue: 140000, type: "Loft", coords: { x: 25, y: 40 }, img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2" },
    { id: 102, title: "Ático Luminoso", price: "280.000€", priceValue: 280000, type: "Ático", coords: { x: 55, y: 25 }, img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750" },
    { id: 103, title: "Piso Salamanca", price: "450.000€", priceValue: 450000, type: "Piso", coords: { x: 40, y: 60 }, img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c" },
    { id: 104, title: "Design Villa", price: "850.000€", priceValue: 850000, type: "Villa", coords: { x: 75, y: 65 }, img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c" },
    { id: 105, title: "Palacio Real", price: "1.2M€", priceValue: 1200000, type: "Mansión", coords: { x: 60, y: 45 }, img: "https://images.unsplash.com/photo-1600596542815-27b5aec872c3" },
    { id: 106, title: "Sky Mansion", price: "3.5M€", priceValue: 3500000, type: "Penthouse", coords: { x: 30, y: 75 }, img: "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b" },
  ];

  useEffect(() => {
    if (phase === 'SCAN') {
       const timer = setTimeout(() => { if(soundFunc) soundFunc('ping'); setPhase('CONFIG'); }, 2000);
       return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none text-slate-900 select-none">
      
      {/* HEADER */}
      {(phase === 'SCAN' || phase === 'CONFIG') && (
      <div className="absolute top-10 left-10 flex items-center gap-6 pointer-events-auto z-[210]">
         <div onClick={onCloseMode} className="cursor-pointer p-4 rounded-3xl group hover:bg-white/20 shadow-[0_5px_30px_rgba(255,255,255,0.5)] bg-white/5 border border-white/20">
             <LayoutGrid size={28} className="text-black group-hover:scale-110 transition-transform"/>
         </div>
         <div>
             <h1 className="text-4xl font-black tracking-tighter leading-none mb-1"><span className="text-black">Stratosfere</span><span className="text-slate-500 text-lg font-light tracking-widest ml-1">OS.</span></h1>
             <p className="text-sm text-black font-bold tracking-[0.2em] uppercase">Módulo de Búsqueda</p>
         </div>
      </div>
      )}

      {/* SCAN */}
      {phase === 'SCAN' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-300/30 backdrop-blur-md animate-fade-in pointer-events-auto">
            <div className="text-center animate-pulse">
                <div className="bg-white/60 p-8 rounded-full shadow-xl mb-6 backdrop-blur-xl border border-white/40"><RadarIcon size={64} className="text-[#0071e3] animate-spin-slow"/></div>
                <h2 className="text-3xl font-bold text-slate-900">Sincronizando</h2>
            </div>
        </div>
      )}

      {/* CONFIG */}
      {phase === 'CONFIG' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-300/30 backdrop-blur-md animate-fade-in pointer-events-auto">
            <div className="bg-[#f2f2f7]/90 backdrop-blur-3xl border border-white/60 p-10 rounded-[2.5rem] shadow-2xl max-w-2xl w-full animate-fade-in-up relative z-50">
                <div className="flex justify-between items-center mb-8 border-b border-slate-200/60 pb-4">
                   <h2 className="text-lg font-bold tracking-wide flex items-center gap-3 text-slate-900"><SlidersHorizontal className="text-[#0071e3]" size={20}/> PARÁMETROS</h2>
                </div>
                <div className="grid grid-cols-2 gap-8 mb-8">
                   <div className="space-y-4"><label className="text-xs text-slate-400 font-bold uppercase">Tipo</label><div className="grid grid-cols-2 gap-3">{['RESIDENCIAL', 'CORPORATIVO'].map(t => (<button key={t} onClick={() => setSelectedType(t)} className={`p-4 border rounded-2xl text-xs font-bold ${selectedType===t ? 'bg-[#0071e3] text-white' : 'bg-white text-slate-500'}`}>{t}</button>))}</div></div>
                   <div className="space-y-4"><label className="text-xs text-slate-400 font-bold uppercase flex justify-between"><span>Presupuesto</span><span className={isElite ? 'text-amber-500 font-black' : 'text-[#0071e3] font-black'}>{isElite ? 'ELITE CLASS' : `${(steps * 50000).toLocaleString()} €`}</span></label><div onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setSteps(Math.round(((e.clientX - rect.left) / rect.width) * 100)); }} className="h-12 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative cursor-pointer overflow-hidden"><div className={`h-2 rounded-full w-full relative z-10 ${isElite ? 'bg-amber-500' : 'bg-[#0071e3]'}`} style={{ width: `${steps}%` }}></div></div></div>
                </div>
                <div className="flex gap-4 pt-6 border-t border-slate-200/60">
                    <button onClick={onCloseMode} className="px-8 py-4 rounded-2xl border border-slate-200 bg-white text-slate-500 font-bold">CANCELAR</button>
                    <button onClick={() => { if(soundFunc) soundFunc('complete'); setPhase('ACTIVE'); if(onGoToMap) onGoToMap(); }} className={`flex-1 py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-3 ${isElite ? 'bg-amber-500' : 'bg-[#0071e3]'}`}>INICIAR BÚSQUEDA <ArrowRight size={16}/></button>
                </div>
            </div>
        </div>
      )}

      {/* ACTIVE (MAPA) */}
      {phase === 'ACTIVE' && nearbyProps.map((prop) => {
            const isFav = favorites.some((f: any) => f.id === prop.id);
            return (
                // El contenedor posiciona el componente
                <div key={prop.id} className="absolute" style={{ left: `${prop.coords.x}%`, top: `${prop.coords.y}%` }}>
                    <MapNanoCard 
                        id={prop.id}
                        price={prop.price}
                        priceValue={prop.priceValue}
                        type={prop.type}
                        img={prop.img}   // CORRECCIÓN: Ahora pasamos 'img' correctamente
                        lat={prop.coords.y} // Pasamos coords simuladas como lat/lng
                        lng={prop.coords.x}
                        isFav={isFav}
                    />
                </div>
            );
      })}
    </div>
  );
}

