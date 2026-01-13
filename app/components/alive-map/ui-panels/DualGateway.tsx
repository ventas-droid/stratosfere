// @ts-nocheck
"use client";

import React from 'react';
import { Search, Zap, LayoutDashboard, ArrowRight, Lock } from 'lucide-react';

// IMÁGENES TÁCTICAS (3 IMÁGENES DEFINITIVAS)
const IMG_MARKET = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80";
const IMG_PARTNER = "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80";
const IMG_COMMAND = "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80";

// 🔥 RECIBIMOS EL ROL DEL USUARIO (userRole)
export default function DualGateway({ onSelectMode, userRole }: any) {

  // 🛡️ SISTEMA DE PERMISOS (3 NIVELES)
  const isAgent = userRole === 'AGENCIA' || userRole === 'AGENT';
  const isDiffuser = userRole === 'DIFUSOR' || userRole === 'DIFFUSER';
  // Si no es Agente ni Difusor, es Particular
  const isParticular = !isAgent && !isDiffuser;

  return (
    // MANTENEMOS SU CONTENEDOR ORIGINAL (SIN TOCAR NADA PARA EVITAR EL VELO)
    <div className="fixed inset-0 z-[50000] bg-[#F5F5F7] flex flex-col items-center justify-center font-sans select-none overflow-hidden animate-fade-in">
      
      {/* ATMÓSFERA */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 blur-[120px] rounded-full mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-200/40 blur-[120px] rounded-full mix-blend-multiply pointer-events-none"></div>

      {/* CABECERA DINÁMICA SEGÚN ROL */}
      <div className="relative z-10 text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-black mb-4 select-none">
            Stratosfere OS.
          </h1>
          <p className="text-xl text-gray-500 font-medium tracking-wide">
             {isAgent ? "Panel de Agencia" : (isDiffuser ? "Panel de Partners" : "Acceso Mercado")}
          </p>
      </div>

      {/* GRID DE 3 COLUMNAS (TRIAD-GATEWAY) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1200px] px-6">
        
        {/* 1. MERCADO (SOLO PARTICULARES) */}
        <CardOption 
            img={IMG_MARKET}
            icon={isParticular ? Search : Lock} // Candado si no es particular
            color={isParticular ? "blue" : "gray"}
            badge={isParticular ? "Mercado" : "No disponible"}
            title="Comprar y Vender."
            desc="Acceso total al Mapa 3D, activos exclusivos y valoración de suelo."
            action="Entrar al Mercado"
            
            // LÓGICA DE BLOQUEO
            onClick={() => {
                if (isParticular) onSelectMode('EXPLORER');
                // Si es Agente o Difusor, no hace nada (o muestra alerta si quiere)
            }}
            locked={!isParticular} // Gris si no es particular
        />

        {/* 2. DIFUNDIR (SOLO DIFUSORES) */}
        <CardOption 
            img={IMG_PARTNER}
            icon={isDiffuser ? Zap : Lock} 
            color={isDiffuser ? "orange" : "gray"}
            badge={isDiffuser ? "Partners" : "Restricted"}
            title="Difundir."
            desc="Monetiza tu audiencia y colabora con la red Stratosfere."
            action="Acceso Bloggers"
            
            onClick={() => {
                if (isDiffuser) onSelectMode('DIFFUSER');
            }}
            locked={!isDiffuser} 
        />

        {/* 3. OPERAR (SOLO AGENTES) */}
        <CardOption 
            img={IMG_COMMAND}
            icon={isAgent ? LayoutDashboard : Lock}
            color={isAgent ? "emerald" : "gray"}
            badge={isAgent ? "Command" : "Pro Only"}
            title="Operar."
            desc="Agency OS. Control total y herramientas de administración."
            action="Sistema OS"
            
            onClick={() => {
                if (isAgent) onSelectMode('AGENCY');
            }}
            locked={!isAgent}
        />

      </div>

      <div className="absolute bottom-6 text-gray-400 text-[10px] font-bold tracking-widest uppercase">
        ID: {userRole || "GUEST"} • Stratosfere OS v3.9
      </div>
    </div>
  );
}

// Subcomponente de Tarjeta (SUYO ORIGINAL LIGERAMENTE ADAPTADO PARA 'LOCKED')
function CardOption({ img, icon: Icon, color, badge, title, desc, action, onClick, locked }: any) {
    const colors: any = {
        blue: "bg-blue-100 text-blue-600 group-hover:text-blue-700",
        purple: "bg-purple-100 text-purple-600 group-hover:text-purple-700",
        orange: "bg-orange-100 text-orange-600 group-hover:text-orange-700",
        emerald: "bg-emerald-100 text-emerald-600 group-hover:text-emerald-700",
        gray: "bg-gray-200 text-gray-500", // Color gris para bloqueados
    };

    return (
        <div 
            onClick={!locked ? onClick : undefined} // Solo clicable si no está bloqueado
            className={`group relative bg-white rounded-[32px] shadow-xl transition-all duration-500 overflow-hidden h-[450px]
            ${locked ? "opacity-60 grayscale cursor-not-allowed" : "cursor-pointer hover:shadow-2xl transform hover:-translate-y-2"}`}
        >
            {/* IMAGEN (55% de altura) */}
            <div className="h-[55%] overflow-hidden relative">
                <img src={img} className={`w-full h-full object-cover transition-transform duration-700 ${!locked && "group-hover:scale-110"}`} alt={title}/>
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
                
                {/* BOTÓN O MENSAJE DE BLOQUEO */}
                {!locked ? (
                    <div className="flex items-center gap-2 text-black font-extrabold text-xs tracking-wide group-hover:opacity-70 transition-opacity">
                        {action} <ArrowRight size={14} />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] tracking-widest uppercase">
                        <Lock size={12} /> Acceso Restringido
                    </div>
                )}
            </div>
        </div>
    );
}

