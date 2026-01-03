// @ts-nocheck
"use client";

import React, { useState } from "react";
import { X, Shield, Zap, Award, Crown, Briefcase, ChevronRight } from "lucide-react";

const PACKS = [
  {
    id: "starter_kit",
    title: "KIT DE INICIACIÓN",
    price: "299€",
    role: "AGENTE NOVATO",
    icon: Shield,
    color: "blue",
    features: ["5 Captaciones/mes", "Insignia Básica", "Acceso al Radar 2D"]
  },
  {
    id: "tactical_kit",
    title: "PACK TÁCTICO",
    price: "899€",
    role: "OPERADOR DE ÉLITE",
    icon: Zap,
    color: "emerald",
    features: ["Captación Ilimitada", "Radar 3D en tiempo real", "Insignia Verificada", "Boost en Listados"]
  },
  {
    id: "dominator_kit",
    title: "STRATOS DOMINATOR",
    price: "2.500€",
    role: "COMANDANTE DE ZONA",
    icon: Crown,
    color: "amber",
    features: ["Exclusividad de Zona", "IA Predictiva", "Insignia Gold", "Acceso a Inversores VIP"]
  }
];

export default function AgencyMarketPanel({ isOpen, onClose }: any) {
  if (!isOpen) return null;
  const [myRole, setMyRole] = useState("AGENTE NOVATO");

  const buyPack = (pack: any) => {
    setMyRole(pack.role);
    alert(`¡PAQUETE ADQUIRIDO! Nuevo Rango: ${pack.role}`);
  };

  return (
    // 🔥 CORRECCIÓN APLICADA: 'pointer-events-auto' para bloquear el mapa y habilitar los botones
    <div className="absolute inset-y-0 left-0 w-[420px] z-[50000] bg-[#F5F5F7]/95 backdrop-blur-2xl border-r border-black/5 flex flex-col shadow-2xl animate-slide-in-left font-sans pointer-events-auto">
      
      {/* HEADER */}
      <div className="p-6 border-b border-black/5 bg-white/50">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-extrabold text-black tracking-tighter">AGENCY ARMORY</h2>
                <div className="text-[10px] text-black/40 font-bold mt-1 tracking-widest uppercase flex items-center gap-2">
                    <Briefcase size={12} /> LOGÍSTICA & RANGOS
                </div>
            </div>
            {/* El botón X ahora funcionará porque el panel captura los eventos */}
            <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }} 
                className="p-2 rounded-full bg-black/5 hover:bg-black/10 text-black/60 transition-colors cursor-pointer"
            >
                <X size={20} />
            </button>
        </div>
        
        {/* MI RANGO ACTUAL */}
        <div className="mt-6 p-4 rounded-2xl bg-white border border-black/5 flex items-center justify-between shadow-sm">
            <div>
                <div className="text-[9px] text-black/40 uppercase tracking-widest font-bold">Rango Actual</div>
                <div className="text-sm font-extrabold text-black mt-1">{myRole}</div>
            </div>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                <Award size={20} />
            </div>
        </div>
      </div>

      {/* LISTA DE PACKS */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-black/10">
         {PACKS.map((pack) => (
             <div key={pack.id} className="group relative p-6 rounded-[24px] bg-white border border-black/5 hover:border-black/10 hover:shadow-lg transition-all cursor-pointer">
                 
                 <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-2xl bg-${pack.color}-100 text-${pack.color}-600`}>
                         <pack.icon size={22} />
                     </div>
                     <div className="text-right">
                         <div className="text-xl font-extrabold text-black tracking-tight">{pack.price}</div>
                         <div className="text-[9px] text-black/40 uppercase tracking-widest font-bold">Mensual</div>
                     </div>
                 </div>

                 <h3 className="text-lg font-extrabold text-black mb-1">{pack.title}</h3>
                 <p className="text-[10px] text-black/50 font-bold tracking-wide uppercase mb-5">Desbloquea: <span className="text-black">{pack.role}</span></p>

                 <ul className="space-y-3 mb-6">
                     {pack.features.map((feat, i) => (
                         <li key={i} className="flex items-center gap-3 text-xs text-black/70 font-medium">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             {feat}
                         </li>
                     ))}
                 </ul>

                 <button 
                    onClick={(e) => { e.stopPropagation(); buyPack(pack); }}
                    className="w-full py-3.5 rounded-xl bg-black text-white font-bold text-xs tracking-widest hover:bg-black/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                 >
                    ADQUIRIR LICENCIA <ChevronRight size={14}/>
                 </button>
             </div>
         ))}
      </div>
    </div>
  );
}


