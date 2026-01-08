"use client";

import React, { useState } from 'react';
import { X, ArrowRight, Check, ShieldCheck, Briefcase } from 'lucide-react';
// Importamos el catálogo "Clean Corporate" que acabamos de crear
import { AGENCY_SUBSCRIPTIONS } from '../agency-os/agencyos.catalog';

export default function AgencyMarketPanel({ isOpen, onClose }: any) {
  
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = (id: string) => {
      setSelectedPlanId(id === selectedPlanId ? null : id);
  };

  const handlePurchase = () => {
      if (!selectedPlanId) return;
      const plan = AGENCY_SUBSCRIPTIONS.find(s => s.id === selectedPlanId);
      
      // Lanzamos la señal de actualización de licencia
      if(typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('agency-upgrade-signal', { detail: plan }));
          
          // Feedback sonoro (si el sistema de audio está escuchando)
          // window.dispatchEvent(new CustomEvent('play-sound', { detail: 'success' }));
      }
      onClose();
  };

  const activePlan = AGENCY_SUBSCRIPTIONS.find(s => s.id === selectedPlanId);

  return (
    <div className="fixed inset-y-0 left-0 w-full md:w-[460px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left">
      
      {/* FONDO CUPERTINO (Blanco/Gris Esmerilado) */}
      <div className="absolute inset-0 bg-[#F5F5F7]/90 backdrop-blur-2xl shadow-2xl border-r border-white/40"></div>

      <div className="relative z-10 flex flex-col h-full font-sans text-slate-900">
        
        {/* CABECERA */}
        <div className="px-8 pt-10 pb-6 shrink-0">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Licencias.
                </h1>
                <button 
                    onClick={onClose} 
                    className="w-8 h-8 bg-black/5 hover:bg-black/10 rounded-full flex items-center justify-center transition-all"
                >
                    <X size={16} className="text-slate-500"/>
                </button>
            </div>
            <div className="flex items-center gap-2">
                <span className="bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    Corporativo
                </span>
                <p className="text-xs font-medium text-slate-400">
                    Seleccione su nivel de operatividad.
                </p>
            </div>
        </div>

        {/* LISTA DE PLANES */}
        <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar space-y-4 pb-32">
            
            {/* PLAN ACTUAL (Info Visual) */}
            <div className="mx-2 mb-6 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <ShieldCheck size={20}/>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado Actual</p>
                    <p className="text-sm font-bold text-slate-900">Versión de Prueba</p>
                </div>
            </div>

            {AGENCY_SUBSCRIPTIONS.map((plan: any) => {
                const isSelected = selectedPlanId === plan.id;
                
                return (
                    <div 
                        key={plan.id}
                        onClick={() => handleSelect(plan.id)}
                        className={`relative p-6 rounded-[28px] cursor-pointer transition-all duration-300 border
                            ${isSelected 
                                ? 'bg-[#000000] text-white border-black shadow-xl scale-[1.02] z-10' 
                                : 'bg-white text-slate-900 border-slate-100 shadow-sm hover:border-slate-300 hover:shadow-md'
                            }`}
                    >
                        {/* Cabecera Tarjeta */}
                        <div className="flex justify-between items-start mb-3">
                            <div className={`text-2xl ${isSelected ? 'opacity-100' : 'opacity-80 grayscale'}`}>
                                {plan.badge}
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-bold tracking-tight block">
                                    {plan.price}€
                                </span>
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-gray-400' : 'text-slate-400'}`}>
                                    / Mes
                                </span>
                            </div>
                        </div>

                        {/* Título y Descripción */}
                        <h3 className="font-bold text-sm tracking-wide mb-1 uppercase">
                            {plan.name}
                        </h3>
                        <p className={`text-xs font-medium mb-5 leading-relaxed ${isSelected ? 'text-gray-400' : 'text-slate-500'}`}>
                            {plan.desc}
                        </p>
                        
                        {/* Separador */}
                        <div className={`h-px w-full mb-4 ${isSelected ? 'bg-white/10' : 'bg-slate-100'}`}></div>

                        {/* Características (Perks) */}
                        <div className="space-y-2.5">
                            {plan.perks.map((perk:string, i:number) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Check size={10} strokeWidth={3}/>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                                        {perk}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>

        {/* FOOTER FLOTANTE */}
        {selectedPlanId && activePlan && (
            <div className="absolute bottom-8 left-6 right-6 z-50 animate-fade-in-up">
                 <div className="bg-white/80 backdrop-blur-xl p-2 pr-2 pl-6 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.15)] flex items-center justify-between border border-white/50">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Estimado</span>
                        <span className="text-lg font-black text-slate-900 tracking-tight">
                            {activePlan.price}€
                        </span>
                    </div>
                    <button 
                        onClick={handlePurchase}
                        className="bg-[#0071e3] text-white px-6 py-3 rounded-full font-bold text-[10px] hover:bg-[#0077ED] active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest shadow-lg shadow-blue-500/30"
                    >
                        Activar Licencia <ArrowRight size={14} strokeWidth={2.5}/>
                    </button>
                 </div>
            </div>
        )}

      </div>
    </div>
  );
}