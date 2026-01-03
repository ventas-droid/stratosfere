// @ts-nocheck
"use client";

import React from 'react';
import { Search, PenTool, Zap, LayoutDashboard, ArrowRight } from 'lucide-react';

// IMÁGENES TÁCTICAS
const IMG_EXPLORER = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80";
const IMG_ARCHITECT = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80";
const IMG_PARTNER = "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80";
// Nueva imagen para Agencia (Estilo Oficina Técnica)
const IMG_AGENCY = "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80";

export default function DualGateway({ onSelectMode }: any) {

  return (
    <div className="fixed inset-0 z-[50000] bg-[#F5F5F7] flex flex-col items-center justify-center font-sans select-none overflow-hidden animate-fade-in">
      
      {/* ATMÓSFERA */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 blur-[120px] rounded-full mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-200/40 blur-[120px] rounded-full mix-blend-multiply pointer-events-none"></div>

      {/* CABECERA */}
      <div className="relative z-10 text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-black mb-4 select-none">
            Stratosfere OS.
          </h1>
          <p className="text-xl text-gray-500 font-medium tracking-wide">
            Selecciona tu perfil de acceso.
          </p>
      </div>

      {/* GRID DE 4 COLUMNAS (QUAD-GATEWAY) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[1400px] px-6">
        
        {/* 1. COMPRADOR */}
        <CardOption 
            img={IMG_EXPLORER}
            icon={Search}
            color="blue"
            badge="Búsqueda"
            title="Comprar."
            desc="Mapa 3D y activos exclusivos."
            action="Explorar"
            onClick={() => onSelectMode('EXPLORER')}
        />

        {/* 2. VENDEDOR */}
        <CardOption 
            img={IMG_ARCHITECT}
            icon={PenTool}
            color="purple"
            badge="Gestión"
            title="Vender."
            desc="Valoración y venta de suelo."
            action="Propietario"
            onClick={() => onSelectMode('ARCHITECT')}
        />

        {/* 3. DIFUSOR */}
        <CardOption 
            img={IMG_PARTNER}
            icon={Zap}
            color="orange"
            badge="Partners"
            title="Difundir."
            desc="Monetiza tu audiencia."
            action="Bloggers"
            onClick={() => onSelectMode('DIFFUSER')}
        />

        {/* 4. AGENCIA (NUEVO) */}
        <CardOption 
            img={IMG_AGENCY}
            icon={LayoutDashboard}
            color="emerald"
            badge="Command"
            title="Operar."
            desc="Agency OS. Control total."
            action="Sistema OS"
            onClick={() => onSelectMode('AGENCY')} // <--- ESTA ES LA SEÑAL CLAVE
        />

      </div>

      <div className="absolute bottom-6 text-gray-400 text-[10px] font-bold tracking-widest uppercase">
        Stratosfere Operating System v2.2
      </div>
    </div>
  );
}

// Subcomponente para limpiar el código
function CardOption({ img, icon: Icon, color, badge, title, desc, action, onClick }: any) {
    const colors: any = {
        blue: "bg-blue-100 text-blue-600 group-hover:text-blue-700",
        purple: "bg-purple-100 text-purple-600 group-hover:text-purple-700",
        orange: "bg-orange-100 text-orange-600 group-hover:text-orange-700",
        emerald: "bg-emerald-100 text-emerald-600 group-hover:text-emerald-700",
    };

    return (
        <div 
            onClick={onClick}
            className="group relative bg-white rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2 h-[420px]"
        >
            <div className="h-[55%] overflow-hidden relative">
                <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={title}/>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            </div>
            <div className="h-[45%] p-6 flex flex-col justify-between relative">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-full ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
                            <Icon size={14} />
                        </div>
                        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${colors[color].split(' ')[1]}`}>{badge}</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-black tracking-tight">{title}</h2>
                    <p className="text-gray-400 mt-1 font-medium text-xs leading-relaxed">{desc}</p>
                </div>
                <div className="flex items-center gap-2 text-black font-extrabold text-xs tracking-wide group-hover:opacity-70 transition-opacity">
                    {action} <ArrowRight size={14} />
                </div>
            </div>
        </div>
    );
}