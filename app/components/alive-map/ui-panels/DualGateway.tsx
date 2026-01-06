// @ts-nocheck
"use client";

import React from 'react';
import { Search, Zap, LayoutDashboard, ArrowRight } from 'lucide-react';

// IMÁGENES TÁCTICAS (3 IMÁGENES DEFINITIVAS)
// 1. MERCADO (Salón Lujoso - Atrae a comprador y vendedor)
const IMG_MARKET = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80";
// 2. PARTNERS (Oficina creativa / Gente colaborando)
const IMG_PARTNER = "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80";
// 3. COMANDO (Agencia / Tecnología / Control)
const IMG_COMMAND = "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80";

export default function DualGateway({ onSelectMode }: any) {

  return (
    <div className="fixed inset-0 z-[50000] bg-[#F5F5F7] flex flex-col items-center justify-center font-sans select-none overflow-hidden animate-fade-in">
      
      {/* ATMÓSFERA */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 blur-[120px] rounded-full mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-200/40 blur-[120px] rounded-full mix-blend-multiply pointer-events-none"></div>

      {/* CABECERA */}
      <div className="relative z-10 text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-black mb-4 select-none">
            Stratosfere OS.
          </h1>
          <p className="text-xl text-gray-500 font-medium tracking-wide">
            Selecciona tu perfil de acceso.
          </p>
      </div>

      {/* GRID DE 3 COLUMNAS (TRIAD-GATEWAY) */}
      {/* 🔥 CAMBIO CLAVE: grid-cols-3 en pantallas grandes */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1200px] px-6">
        
        {/* 1. COMPRAR Y VENDER (FUSIÓN) */}
        <CardOption 
            img={IMG_MARKET}
            icon={Search}
            color="blue"
            badge="Mercado"
            title="Comprar y Vender."
            desc="Acceso total al Mapa 3D, activos exclusivos y valoración de suelo."
            action="Entrar al Mercado"
            onClick={() => onSelectMode('EXPLORER')}
        />

        {/* 2. DIFUNDIR (PARTNERS) */}
        <CardOption 
            img={IMG_PARTNER}
            icon={Zap}
            color="orange"
            badge="Partners"
            title="Difundir."
            desc="Monetiza tu audiencia y colabora con la red Stratosfere."
            action="Acceso Bloggers"
            onClick={() => onSelectMode('DIFFUSER')} // (Nota: Asegúrese de tener este modo o redirigir)
        />

        {/* 3. OPERAR (COMANDO AGENCIA) */}
        <CardOption 
            img={IMG_COMMAND}
            icon={LayoutDashboard}
            color="emerald"
            badge="Command"
            title="Operar."
            desc="Agency OS. Control total y herramientas de administración."
            action="Sistema OS"
            onClick={() => onSelectMode('AGENCY')}
        />

      </div>

      <div className="absolute bottom-6 text-gray-400 text-[10px] font-bold tracking-widest uppercase">
        Stratosfere Operating System v3.0
      </div>
    </div>
  );
}

// Subcomponente de Tarjeta (Limpio)
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
            className="group relative bg-white rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2 h-[450px]"
        >
            {/* IMAGEN (55% de altura) */}
            <div className="h-[55%] overflow-hidden relative">
                <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={title}/>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            </div>
            
            {/* CONTENIDO (45% de altura) */}
            <div className="h-[45%] p-8 flex flex-col justify-between relative">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`p-1.5 rounded-full ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
                            <Icon size={14} />
                        </div>
                        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${colors[color].split(' ')[1]}`}>{badge}</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-black tracking-tight mb-2">{title}</h2>
                    <p className="text-gray-400 font-medium text-xs leading-relaxed">{desc}</p>
                </div>
                <div className="flex items-center gap-2 text-black font-extrabold text-xs tracking-wide group-hover:opacity-70 transition-opacity">
                    {action} <ArrowRight size={14} />
                </div>
            </div>
        </div>
    );
}