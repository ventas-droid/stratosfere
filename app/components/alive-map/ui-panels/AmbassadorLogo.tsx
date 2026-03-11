"use client";

import React from "react";

export default function AmbassadorLogo() {
  return (
    <div className="flex items-center select-none group">
      
      {/* ⚡ ALETAS DE VELOCIDAD (Sus aletas originales intactas) */}
      <div className="flex flex-col gap-[5px] mr-3 md:mr-4">
        <div className="w-5 h-[7px] bg-slate-900 rounded-[2px] transition-all duration-300 group-hover:w-6"></div>
        <div className="w-8 h-[7px] bg-slate-900 rounded-[2px] transition-all duration-300 group-hover:w-9"></div>
        <div className="w-6 h-[7px] bg-slate-900 rounded-[2px] transition-all duration-300 group-hover:w-7"></div>
        <div className="w-9 h-[7px] bg-slate-900 rounded-[2px] transition-all duration-300 group-hover:w-10"></div>
      </div>

      {/* 🏢 NÚCLEO TÁCTICO: B2b . Realty OS */}
      <div className="flex items-baseline">
        
        {/* Bloque: B2b */}
        <div className="flex items-baseline text-slate-900">
          <span className="text-[36px] md:text-[44px] font-black leading-none tracking-tight">B</span>
          <span className="text-[22px] md:text-[28px] font-black leading-none">2</span>
          <span className="text-[36px] md:text-[44px] font-black leading-none tracking-tight">b</span>
        </div>

        {/* Punto separador (Color Ámbar corporativo, ajustado a la línea base) */}
        <span className="inline-block w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-amber-400 rounded-full mx-2 md:mx-3 relative -translate-y-1 md:-translate-y-1.5 shadow-sm"></span>
        
        {/* Bloque: Realty OS */}
        <h1 className="text-[30px] md:text-[30px] font-black tracking-tight leading-none text-slate-900">
          Realty OS
        </h1>
        
      </div>

    </div>
  );
}