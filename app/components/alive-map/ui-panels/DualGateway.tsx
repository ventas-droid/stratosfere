// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { Search, PenTool, ArrowRight } from 'lucide-react';

// IMÁGENES STRATOS (Alta luminosidad)
const IMG_EXPLORER = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80";
const IMG_ARCHITECT = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80";

export default function DualGateway({ onSelectMode }: any) {

  return (
    // 1. FONDO "APPLE GRAY" (Limpio y luminoso)
    <div className="fixed inset-0 z-[50000] bg-[#F5F5F7] flex flex-col items-center justify-center font-sans select-none overflow-hidden">
      
      {/* ORBES DE COLOR DIFUMINADO (Para dar profundidad sutil estilo iOS) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 blur-[120px] rounded-full mix-blend-multiply"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-200/40 blur-[120px] rounded-full mix-blend-multiply"></div>

      {/* CABECERA (Logo All Black) */}
      <div className="relative z-10 text-center mb-16 animate-fade-in-down">
          {/* Aquí está el cambio: text-black y sin span azul */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-black mb-4">
            Stratosfere OS.
          </h1>
          <p className="text-xl text-gray-500 font-medium tracking-wide">
            Selecciona tu perfil para comenzar.
          </p>
      </div>

      {/* CONTENEDOR DE TARJETAS (GRID) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl px-6">
        
        {/* === TARJETA 1: COMPRADOR (EXPLORER) === */}
        <div 
            onClick={() => onSelectMode('EXPLORER')}
            className="group relative bg-white rounded-[40px] shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2 h-[500px]"
        >
            {/* Imagen (Mitad superior) */}
            <div className="h-[60%] overflow-hidden relative">
                <img 
                    src={IMG_EXPLORER} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Comprador"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
            </div>

            {/* Contenido (Mitad inferior blanca) */}
            <div className="h-[40%] p-10 flex flex-col justify-between relative">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                            <Search size={20} />
                        </div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Búsqueda</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Comprar.</h2>
                    <p className="text-gray-500 mt-2 font-medium">Encuentra activos exclusivos en el mapa 3D.</p>
                </div>
                
                {/* Botón fake */}
                <div className="flex items-center gap-2 text-gray-900 font-bold group-hover:text-blue-600 transition-colors">
                    Iniciar Explorador <ArrowRight size={18} />
                </div>
            </div>
        </div>

        {/* === TARJETA 2: VENDEDOR (ARCHITECT) === */}
        <div 
            onClick={() => onSelectMode('ARCHITECT')}
            className="group relative bg-white rounded-[40px] shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2 h-[500px]"
        >
            {/* Imagen */}
            <div className="h-[60%] overflow-hidden relative">
                <img 
                    src={IMG_ARCHITECT} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Vendedor"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
            </div>

            {/* Contenido */}
            <div className="h-[40%] p-10 flex flex-col justify-between relative">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                            <PenTool size={20} />
                        </div>
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Gestión</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Vender.</h2>
                    <p className="text-gray-500 mt-2 font-medium">Herramientas de valoración y venta de suelo.</p>
                </div>

                {/* Botón fake */}
                <div className="flex items-center gap-2 text-gray-900 font-bold group-hover:text-purple-600 transition-colors">
                    Acceder como Propietario <ArrowRight size={18} />
                </div>
            </div>
        </div>

      </div>

      {/* FOOTER DISCRETO */}
      <div className="absolute bottom-8 text-gray-400 text-xs font-medium tracking-wide">
        Stratosfere Operating System v2.0
      </div>

    </div>
  );
}

