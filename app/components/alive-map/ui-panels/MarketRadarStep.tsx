import React, { useState, useEffect } from 'react';
import { Radar, Zap, Clock, Eye, MapPin, Flame, Shield, TrendingUp, Info } from 'lucide-react';

export default function MarketRadarStep({ formData, onNext }: any) {
  const [scanning, setScanning] = useState(true);
  const [selectedRival, setSelectedRival] = useState<number | null>(null);

  // Simulación basada en el precio del usuario
  const basePrice = parseInt((formData.price || '0').replace(/\./g, '')) || 300000;
  
  const RIVALS = [
    { 
        id: 1, type: 'COLD', name: 'Propiedad Estancada', price: basePrice * 1.05, 
        days: 245, visits: 12, services: 0, 
        img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=200&q=80' 
    },
    { 
        id: 2, type: 'WARM', name: 'Competencia Directa', price: basePrice * 0.98, 
        days: 45, visits: 180, services: 1, 
        img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80' 
    },
    { 
        id: 3, type: 'HOT', name: 'Caso de Éxito', price: basePrice * 1.15, 
        days: 12, visits: 3450, services: 5, 
        img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=200&q=80' 
    },
    { 
        id: 4, type: 'COLD', name: 'Fuera de Mercado', price: basePrice * 1.10, 
        days: 310, visits: 5, services: 0, 
        img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=80' 
    },
    { 
        id: 5, type: 'HOT', name: 'Recién Listado', price: basePrice * 0.95, 
        days: 3, visits: 890, services: 3, 
        img: 'https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=200&q=80' 
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setScanning(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  };

  if (scanning) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center relative overflow-hidden rounded-3xl bg-slate-900 text-white">
        <div className="z-10 flex flex-col items-center gap-4 px-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center backdrop-blur-md border border-emerald-500">
             <Radar className="text-emerald-400 animate-spin" size={28} />
          </div>
          <div>
             <h3 className="text-xl font-bold tracking-tight">Analizando Entorno...</h3>
             <p className="text-emerald-400 font-mono text-[10px] uppercase tracking-widest mt-2">
                Comparando con 5 propiedades similares
             </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      
      {/* CABECERA */}
      <div className="flex justify-between items-end mb-4 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Datos de Mercado</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            Análisis de Zona
          </h3>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        
        {/* MAPA RADAR */}
        <div className="w-full md:w-1/3 bg-slate-50 rounded-3xl border border-slate-200 relative flex items-center justify-center min-h-[200px]">
           <div className="absolute w-[80%] h-[80%] border border-slate-200 rounded-full"></div>
           <div className="absolute w-[45%] h-[45%] border border-slate-200 rounded-full"></div>
           <div className="absolute w-3 h-3 bg-blue-600 rounded-full shadow-lg z-20"></div>
           
           {RIVALS.map((rival, index) => {
              const top = 50 + (Math.sin(index * 20) * 35);
              const left = 50 + (Math.cos(index * 20) * 35);
              return (
                  <div 
                    key={rival.id}
                    className={`absolute w-2.5 h-2.5 rounded-full transition-all duration-300 z-10 
                       ${rival.type === 'HOT' ? 'bg-orange-500 shadow-orange-500/50' : 'bg-slate-400'} 
                       ${selectedRival === rival.id ? 'scale-150 ring-2 ring-white' : ''}
                    `}
                    style={{ top: `${top}%`, left: `${left}%` }}
                    onClick={() => setSelectedRival(rival.id)}
                  />
              );
           })}
             <div className="absolute bottom-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full border border-slate-100 shadow-sm text-[8px] font-bold text-slate-500">
              TÚ (AZUL) vs MERCADO
           </div>
        </div>

        {/* LISTA DE PROPIEDADES */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
           {RIVALS.map((rival) => (
             <div 
               key={rival.id}
               onMouseEnter={() => setSelectedRival(rival.id)}
               onMouseLeave={() => setSelectedRival(null)}
               className={`
                  flex gap-3 p-2.5 rounded-xl border transition-all duration-300 cursor-pointer
                  ${selectedRival === rival.id ? 'bg-slate-900 border-slate-900 shadow-lg' : 'bg-white border-slate-100 hover:border-slate-300'}
               `}
             >
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative bg-gray-200">
                   <img src={rival.img} className="w-full h-full object-cover" alt="Propiedad"/>
                   {rival.type === 'HOT' && (
                      <div className="absolute bottom-0 inset-x-0 bg-orange-500 text-white text-[7px] font-black text-center py-0.5 flex items-center justify-center gap-1">
                         <Flame size={6} fill="currentColor" /> HOT
                      </div>
                   )}
                </div>

                <div className="flex-1 flex flex-col justify-center min-w-0">
                   <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-[11px] font-black uppercase truncate pr-2 ${selectedRival === rival.id ? 'text-white' : 'text-slate-900'}`}>
                         {rival.name}
                      </h4>
                      <span className={`text-[11px] font-black whitespace-nowrap ${selectedRival === rival.id ? 'text-emerald-400' : 'text-slate-900'}`}>
                         {formatMoney(rival.price)}
                      </span>
                   </div>

                   <div className="flex flex-wrap gap-1.5">
                      <div className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${rival.days > 90 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                         <Clock size={8} />
                         <span className="text-[9px] font-bold">{rival.days} días</span>
                      </div>
                      <div className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 flex items-center gap-1">
                         <Eye size={8} />
                         <span className="text-[9px] font-bold">{rival.visits}</span>
                      </div>
                      {rival.services > 0 && (
                          <div className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 flex items-center gap-1">
                             <Zap size={8} fill="currentColor"/>
                             <span className="text-[9px] font-bold">{rival.services} Activos</span>
                          </div>
                      )}
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* CONCLUSIÓN EDUCATIVA (FIXED: Diseño más limpio) */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-center gap-4 shadow-xl">
         <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
               <Shield size={14} className="text-emerald-400"/>
               <span className="text-xs font-bold text-emerald-400 uppercase">Diagnóstico Stratos</span>
            </div>
            <p className="text-sm font-medium leading-snug text-slate-200">
               Hay <span className="text-white font-bold">2 propiedades destacadas</span> con servicios premium activos que captan el 80% de las visitas.
            </p>
         </div>
         <button 
           onClick={onNext}
           className="w-full md:w-auto px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 whitespace-nowrap"
         >
           Ver Cómo Destacar <TrendingUp size={14}/>
         </button>
      </div>

    </div>
  );
}


