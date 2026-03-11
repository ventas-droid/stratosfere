"use client";

import React from "react";

export default function AmbassadorLogo() {
  return (
    <div className="flex items-center select-none group">
      
      {/* ⚡ ALETAS DE VELOCIDAD (Planas, limpias, sin texturas raras) */}
      <div className="flex flex-col gap-[5px] mr-3">
        <div className="w-5 h-[7px] bg-slate-900 rounded-[2px]"></div>
        <div className="w-8 h-[7px] bg-slate-900 rounded-[2px]"></div>
        <div className="w-6 h-[7px] bg-slate-900 rounded-[2px]"></div>
        <div className="w-9 h-[7px] bg-slate-900 rounded-[2px]"></div>
      </div>

      {/* 🏢 NÚCLEO TÁCTICO: REALTY + B2B (Negro puro, tipografía maciza) */}
      <div className="flex items-baseline">
        
        {/* Texto Principal REALTY */}
        <h1 className="text-[36px] md:text-[42px] font-black uppercase tracking-tight leading-none text-slate-900">
          REALTY
        </h1>
        
        {/* Texto B2B */}
        <span className="ml-2 text-[20px] md:text-[24px] font-black uppercase tracking-wider leading-none text-slate-900">
          B2B
        </span>
        
      </div>

    </div>
  );
}