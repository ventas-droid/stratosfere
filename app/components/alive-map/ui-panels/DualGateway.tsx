// @ts-nocheck
"use client";

import React from 'react';
import { Search, Zap, LayoutDashboard, ArrowRight, Lock } from 'lucide-react';

// IMÁGENES TÁCTICAS (3 IMÁGENES DEFINITIVAS)
// 1. MERCADO (Salón Lujoso - Atrae a comprador y vendedor)
const IMG_MARKET = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80";
// 2. PARTNERS (Oficina creativa / Gente colaborando)
const IMG_PARTNER = "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80";
// 3. COMANDO (Agencia / Tecnología / Control)
const IMG_COMMAND = "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80";

// 🔥 RECIBIMOS EL ROL DEL USUARIO (userRole)
export default function DualGateway({ onSelectMode, userRole }: any) {

  // 🛡️ SISTEMA DE PERMISOS (3 NIVELES)
  // Verificamos si es Agente
  const isAgent = userRole === 'AGENCIA' || userRole === 'AGENT';
  // Verificamos si es Difusor
  const isDiffuser = userRole === 'DIFUSOR' || userRole === 'DIFFUSER';

  return (
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
             {isAgent ? "Panel de Mando Profesional" : (isDiffuser ? "Panel de Partners" : "Bienvenido al Mercado")}
          </p>
      </div>

      {/* GRID DE 3 COLUMNAS (TRIAD-GATEWAY) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1200px] px-6">
        
        {/* 1. MERCADO (PUERTA ABIERTA PARA TODOS) */}
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

        {/* 2. DIFUNDIR (PARTNERS - BLINDADO) */}
        <CardOption 
            img={IMG_PARTNER}
            icon={isDiffuser ? Zap : Lock} 
            color={isDiffuser ? "orange" : "gray"}
            badge={isDiffuser ? "Partners" : "Restricted"}
            title="Difundir."
            desc={isDiffuser ? "Monetiza tu audiencia y colabora con la red Stratosfere." : "Acceso exclusivo para Partners certificados."}
            action={isDiffuser ? "Acceso Bloggers" : "Aplicar como Partner"}
            
            // 🛑 FILTRO DE SEGURIDAD DIFUSOR
            onClick={() => {
                if (isDiffuser) {
                    onSelectMode('DIFFUSER');
                } else {
                    alert("🚫 ACCESO DENEGADO: Área exclusiva para Difusores.");
                }
            }}
            locked={!isDiffuser} // Bloqueado si no es difusor
        />

        {/* 3. OPERAR (COMANDO AGENCIA - BLINDADO) */}
        <CardOption 
            img={IMG_COMMAND}
            icon={isAgent ? LayoutDashboard : Lock} 
            color={isAgent ? "emerald" : "gray"}
            badge={isAgent ? "Command" : "Pro Only"}
            title="Operar."
            desc={isAgent ? "Agency OS. Control total y herramientas de administración." : "Acceso restringido a Cuentas Profesionales."}
            action={isAgent ? "Sistema OS" : "Mejorar Cuenta"}
            
            // 🛑 FILTRO DE SEGURIDAD AGENCIA
            onClick={() => {
                if (isAgent) {
                    onSelectMode('AGENCY');
                } else {
                    alert("🚫 ACCESO DENEGADO: Esta zona es exclusiva para Agencias. Por favor, contacta con soporte para mejorar tu cuenta.");
                }
            }}
            locked={!isAgent} // Bloqueado si no es agencia
        />

      </div>

      <div className="absolute bottom-6 text-gray-400 text-[10px] font-bold tracking-widest uppercase">
        ID: {userRole || "GUEST"} • Stratosfere OS v3.1
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
        gray: "bg-gray-200 text-gray-500", // Color neutro para bloqueo
    };

    return (
        <div 
            onClick={onClick}
            className={`group relative bg-white rounded-[32px] shadow-xl transition-all duration-500 cursor-pointer overflow-hidden h-[450px]
            ${locked ? "opacity-70 grayscale hover:opacity-80" : "hover:shadow-2xl transform hover:-translate-y-2"}`}
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
                <div className="flex items-center gap-2 text-black font-extrabold text-xs tracking-wide transition-opacity">
                    {action} <ArrowRight size={14} />
                </div>
            </div>
        </div>
    );
}