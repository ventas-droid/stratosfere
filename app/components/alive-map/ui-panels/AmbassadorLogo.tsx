"use client";

import React from "react";

export default function AmbassadorLogo() {
  return (
    <div className="flex items-center select-none group cursor-pointer">
      
      {/* ⚡ NÚCLEO TECH (Matrix Geométrico estilo Silicon Valley) */}
      <div className="grid grid-cols-2 gap-[3px] mr-3 md:mr-4 w-8 h-8 md:w-9 md:h-9 group-hover:rotate-90 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <div className="bg-slate-900 rounded-tl-lg rounded-sm shadow-sm group-hover:bg-slate-800 transition-colors duration-500"></div>
        <div className="bg-blue-600 rounded-tr-lg rounded-sm scale-90 group-hover:scale-100 group-hover:bg-indigo-500 transition-all duration-500 shadow-sm"></div>
        <div className="bg-indigo-500 rounded-bl-lg rounded-sm scale-90 group-hover:scale-100 group-hover:bg-blue-600 transition-all duration-500 shadow-sm"></div>
        <div className="bg-slate-900 rounded-br-lg rounded-sm shadow-sm group-hover:bg-slate-800 transition-colors duration-500"></div>
      </div>

      {/* 🏢 TIPOGRAFÍA DE ALTA PRECISIÓN: Contraste extremo y minimalismo */}
      <div className="flex items-baseline">
        <h1 className="text-[30px] md:text-[38px] tracking-tighter leading-none flex items-baseline">
          <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-700">B2B</span>
          <span className="font-medium text-slate-400 tracking-tight ml-[2px]">Realty</span>
          <span className="text-blue-600 font-black animate-pulse">.</span>
        </h1>
      </div>

    </div>
  );
}