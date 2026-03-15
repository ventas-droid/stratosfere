"use client";

import React from "react";

export default function AmbassadorLogo() {
  return (
    <div className="flex items-center select-none group">
      
      {/* ⚡ ALETAS DE VELOCIDAD (Originales intactas) */}
      <div className="flex flex-col gap-[5px] mr-3 md:mr-4">
        <div className="w-5 h-[7px] bg-slate-900 rounded-[2px] transition-all duration-300 group-hover:w-6"></div>
        <div className="w-8 h-[7px] bg-slate-900 rounded-[2px] transition-all duration-300 group-hover:w-9"></div>
        <div className="w-6 h-[7px] bg-slate-900 rounded-[2px] transition-all duration-300 group-hover:w-7"></div>
        <div className="w-9 h-[7px] bg-slate-900 rounded-[2px] transition-all duration-300 group-hover:w-10"></div>
      </div>

      {/* 🏢 NÚCLEO TÁCTICO: B2B (Grueso) + Realty. (Más fino) */}
      <div className="flex items-baseline text-slate-900">
        <h1 className="text-[36px] md:text-[44px] tracking-tighter leading-none flex gap-2 md:gap-3">
          <span className="font-black">B2B</span>
          <span className="font-semibold">Realty.</span>
        </h1>
      </div>

    </div>
  );
}