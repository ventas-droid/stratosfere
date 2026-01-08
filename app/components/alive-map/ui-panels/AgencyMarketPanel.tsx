"use client";

import React, { useState } from 'react';
import { X, ArrowRight, Check, ShieldCheck, CreditCard, Building2, Zap } from 'lucide-react';

// Definimos los planes aquí mismo para evitar errores de importación y asegurar los nombres correctos
const SUBSCRIPTION_PLANS = [
  {
    id: "sub_starter",
    name: "ESSENTIAL",
    price: "29",
    period: "€/mes",
    credits: 10,
    badge: "🔹",
    desc: "Para agentes independientes que inician su actividad.",
    features: ["Acceso Radar 2D", "5 Leads mensuales", "Soporte Básico"]
  },
  {
    id: "sub_pro",
    name: "PROFESSIONAL",
    price: "89",
    period: "€/mes",
    credits: 50,
    badge: "💠",
    desc: "La herramienta estándar para agencias de alto rendimiento.",
    features: ["Radar 3D + Vuelos", "Leads Ilimitados", "Prioridad de Red", "API Access"]
  },
  {
    id: "sub_corp",
    name: "CORPORATE",
    price: "199",
    period: "€/mes",
    credits: 200,
    badge: "💎",
    desc: "Infraestructura dedicada para grandes franquicias.",
    features: ["Marca Blanca", "Multi-usuario", "Gestor Dedicado", "Auditoría Legal"]
  }
];

export default function AgencyMarketPanel({ isOpen, onClose }: any) {
  
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Si está cerrado, no renderizamos nada
  if (!isOpen) return null;

  const handleSelect = (id: string) => {
      setSelectedPlanId(id === selectedPlanId ? null : id);
  };

  const handlePurchase = () => {
      if (!selectedPlanId) return;
      
      const plan = SUBSCRIPTION_PLANS.find(s => s.id === selectedPlanId);
      
      // 📡 ENVIAMOS LA SEÑAL AL RADAR (Actualiza saldo y nombre de licencia)
      if(typeof window !== 'undefined') {
          console.log("💳 Procesando licencia:", plan?.name);
          window.dispatchEvent(new CustomEvent('agency-upgrade-signal', { 
              detail: { 
                  name: `LICENCIA ${plan?.name}`, 
                  credits: plan?.credits,
                  badge: plan?.badge 
              } 
          }));
      }
      onClose();
  };

  const activePlan = SUBSCRIPTION_PLANS.find(s => s.id === selectedPlanId);

  return (
    <div className="fixed inset-y-0 left-0 w-full md:w-[460px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left">
      
      {/* FONDO CRYSTAL / CUPERTINO */}
      <div className="absolute inset-0 bg-[#F5F5F7]/95 backdrop-blur-2xl shadow-2xl border-r border-white/50"></div>

      <div className="relative z-10 flex flex-col h-full font-sans text-slate-900">
        
        {/* CABECERA */}
        <div className="px-8 pt-10 pb-6 shrink-0 bg-white/40 backdrop-blur-md border-b border-white/50">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Suscripciones.
                </h1>
                <button 
                    onClick={onClose} 
                    className="w-8 h-8 bg-black/5 hover:bg-black/10 rounded-full flex items-center justify-center transition-all"
                >
                    <X size={16} className="text-slate-500"/>
                </button>
            </div>
            <div className="flex items-center gap-2">
                <span className="bg-[#0071e3]/10 text-[#0071e3] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    Stratos Business
                </span>
                <p className="text-xs font-medium text-slate-400">
                    Seleccione su nivel operativo.
                </p>
            </div>
        </div>

        {/* LISTA DE PLANES (SCROLL) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-4 pb-32">
            
            {/* ESTADO ACTUAL */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <ShieldCheck size={20}/>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado Actual</p>
                    <p className="text-sm font-bold text-slate-900">Cuenta Gratuita</p>
                </div>
            </div>

            {/* TARJETAS DE SUSCRIPCIÓN */}
            {SUBSCRIPTION_PLANS.map((plan: any) => {
                const isSelected = selectedPlanId === plan.id;
                
                return (
                    <div 
                        key={plan.id}
                        onClick={() => handleSelect(plan.id)}
                        className={`relative p-6 rounded-[28px] cursor-pointer transition-all duration-300 border group
                            ${isSelected 
                                ? 'bg-[#1c1c1e] text-white border-black/10 shadow-2xl scale-[1.02] z-10' 
                                : 'bg-white text-slate-900 border-slate-200/60 shadow-sm hover:border-slate-300 hover:shadow-md'
                            }`}
                    >
                        {/* Header Tarjeta */}
                        <div className="flex justify-between items-start mb-4">
                            <div className={`text-2xl transition-transform duration-300 ${isSelected ? 'scale-110' : 'grayscale opacity-70'}`}>
                                {plan.badge}
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black tracking-tight block">
                                    {plan.price}
                                </span>
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-gray-400' : 'text-slate-400'}`}>
                                    {plan.period}
                                </span>
                            </div>
                        </div>

                        {/* Título */}
                        <h3 className="font-bold text-sm tracking-wide mb-1 uppercase">
                            {plan.name}
                        </h3>
                        <p className={`text-xs font-medium mb-6 leading-relaxed ${isSelected ? 'text-gray-300' : 'text-slate-500'}`}>
                            {plan.desc}
                        </p>
                        
                        {/* Línea divisoria */}
                        <div className={`h-px w-full mb-5 ${isSelected ? 'bg-white/10' : 'bg-slate-100'}`}></div>

                        {/* Perks (Lista) */}
                        <div className="space-y-3">
                            {plan.features.map((perk:string, i:number) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 
                                        ${isSelected ? 'bg-[#2997ff] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Check size={10} strokeWidth={3}/>
                                    </div>
                                    <span className={`text-[11px] font-bold uppercase tracking-wide ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                                        {perk}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>

        {/* FOOTER FLOTANTE (CONFIRMACIÓN) */}
        {selectedPlanId && activePlan && (
            <div className="absolute bottom-8 left-6 right-6 z-50 animate-fade-in-up">
                 <div className="bg-white/90 backdrop-blur-xl p-2 pr-2 pl-6 rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex items-center justify-between border border-white/50">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total a pagar</span>
                        <span className="text-lg font-black text-slate-900 tracking-tight">
                            {activePlan.price}€
                        </span>
                    </div>
                    <button 
                        onClick={handlePurchase}
                        className="bg-[#000000] text-white px-8 py-4 rounded-full font-bold text-[10px] hover:bg-[#333] active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest shadow-lg"
                    >
                        Confirmar <ArrowRight size={14} strokeWidth={2.5}/>
                    </button>
                 </div>
            </div>
        )}

      </div>
    </div>
  );
}