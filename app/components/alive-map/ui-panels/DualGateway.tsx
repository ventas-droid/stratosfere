// @ts-nocheck
"use client";

import React from 'react';
import { Search, Zap, LayoutDashboard, ArrowRight, Lock, Award, Globe } from 'lucide-react';

// 📸 IMÁGENES TÁCTICAS ACTUALIZADAS
const IMG_MARKET = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80";

// 🔥 NUEVA FOTO PARA AMBASSADOR (Más ejecutiva/networking/premium)
const IMG_AMBASSADOR = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"; 

const IMG_COMMAND = "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80";

// 🔥 RECIBIMOS EL ROL DEL USUARIO
export default function DualGateway({ onSelectMode, userRole }: any) {

  // 🛡️ SISTEMA DE PERMISOS
  const isAgent = userRole === 'AGENCIA' || userRole === 'AGENT';
  
  // En la nueva estrategia, "Particular" es el Rey del Ambassador.
  // Si no es Agente, es Particular (y por tanto, Embajador potencial).
  const isParticular = !isAgent; 

  return (
    // CONTENEDOR PRINCIPAL
<div className="fixed top-0 left-0 w-screen h-screen z-[50000] bg-[#F5F5F7] flex flex-col items-center justify-start md:justify-center overflow-y-auto overflow-x-hidden py-12 md:py-0">      
      {/* ATMÓSFERA */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 blur-[120px] rounded-full mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-200/40 blur-[120px] rounded-full mix-blend-multiply pointer-events-none"></div>

      {/* CABECERA */}
      <div className="relative z-10 text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-black mb-4 select-none">
            Stratosfere OS.
          </h1>
          <p className="text-xl text-gray-500 font-medium tracking-wide">
             Seleccione su protocolo de acceso.
          </p>
      </div>

      {/* GRID DE 3 COLUMNAS (TRIAD-GATEWAY) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1200px] px-6">
        
        {/* 1. MERCADO (Comprar y Vender) */}
        <CardOption 
            img={IMG_MARKET}
            icon={isParticular ? Search : Lock} 
            color={isParticular ? "blue" : "gray"}
            badge={isParticular ? "Explorador" : "No disponible"}
            title="Comprar y Vender."
            desc="Acceso total al Mapa 3D, activos exclusivos y valoración de suelo."
            action="Entrar al Mercado"
            
            // Si eres particular, entras. Si eres agencia, estás bloqueado aquí (tienes tu propio OS).
            onClick={() => {
                if (isParticular) onSelectMode('EXPLORER');
            }}
            locked={!isParticular} 
        />

        {/* 2. 🔥 SF AMBASSADOR (LA NUEVA PUERTA) */}
        <CardOption 
            img={IMG_AMBASSADOR}
            icon={Award} // Icono de Premio/Medalla
            color="amber" // Color Dorado/Ámbar
            badge="Programa Abierto" // Badge de éxito
            title="SF Ambassador."
            desc="Tu red es tu activo. Monetiza tus contactos y gestiona comisiones."
            action="Acceso Dashboard" // Texto de acción claro
            
            // 🔓 ESTA ES LA CLAVE: SIEMPRE DESBLOQUEADO
            // Redirige a la nueva página /ambassador
            onClick={() => {
                window.location.href = '/ambassador';
            }}
            locked={false} 
        />

        {/* 3. OPERAR (AGENCY OS) */}
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
        ID: {userRole || "GUEST"} • Stratosfere OS v4.0
      </div>
    </div>
  );
}

// Subcomponente de Tarjeta
function CardOption({ img, icon: Icon, color, badge, title, desc, action, onClick, locked }: any) {
    const colors: any = {
        blue: "bg-blue-100 text-blue-600 group-hover:text-blue-700",
        purple: "bg-purple-100 text-purple-600 group-hover:text-purple-700",
        orange: "bg-orange-100 text-orange-600 group-hover:text-orange-700",
        emerald: "bg-emerald-100 text-emerald-600 group-hover:text-emerald-700",
        // 🔥 NUEVO COLOR AMBER (DORADO)
        amber: "bg-amber-100 text-amber-600 group-hover:text-amber-700", 
        gray: "bg-gray-200 text-gray-500", 
    };

    // Color seguro por si acaso
    const activeColorClass = colors[color] || colors.gray;
    const [bgClass, textClass] = activeColorClass.split(' '); // Separamos bg y text para usarlos

    return (
        <div 
            onClick={!locked ? onClick : undefined} 
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
                        <div className={`p-1.5 rounded-full ${bgClass} ${textClass}`}>
                            <Icon size={14} />
                        </div>
                        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textClass}`}>
                            {badge}
                        </span>
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