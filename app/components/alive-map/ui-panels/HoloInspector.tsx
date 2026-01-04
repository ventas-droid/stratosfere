"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Scan, Sparkles } from "lucide-react";

// --- SIN CATÁLOGO DE RELLENO (Limpieza total) ---

export default function HoloInspector({
  isOpen,
  prop,
  images = [],
  onClose,
  soundEnabled,
  playSynthSound,
}: any) {
  const [idx, setIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
      setMounted(true);
      if (isOpen) setTimeout(() => setIsZooming(true), 50);
      else setIsZooming(false);
  }, [isOpen]);

  useEffect(() => { if (isOpen) setIdx(0); }, [isOpen]);

  if (!mounted || !isOpen || !prop) return null;

  // 1. LÓGICA DE LA VERDAD (Solo fotos reales)
  // CORRECCIÓN: Si el array 'images' viene vacío, buscamos dentro de la propiedad (prop.images)
  const gallerySource = (images && images.length > 0) ? images : (prop.images || []);
  
  // Unimos la portada (prop.img) con la galería encontrada
  const rawAlbum = [prop.img, ...gallerySource].filter(Boolean);
  
  // Eliminamos duplicados
  const unique = Array.from(new Set(rawAlbum));

  // Si no hay fotos, no mostramos nada para evitar errores
  if (unique.length === 0) return null;

  const current = unique[idx] || unique[0];

  const nav = (dir: number) => {
    if (soundEnabled && playSynthSound) playSynthSound("click");
    setIdx((p) => (p + dir + unique.length) % unique.length);
  };

  const ui = (
    <div 
        className="fixed inset-0 z-[999999] bg-[#050505]/98 backdrop-blur-3xl animate-fade-in flex flex-col items-center justify-center overflow-hidden"
        onClick={onClose}
    >
      {/* BOTÓN CERRAR */}
      <button 
          onClick={onClose} 
          className="absolute top-6 right-6 md:top-8 md:right-8 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/10 group active:scale-90"
      >
          <X size={24} className="group-hover:rotate-90 transition-transform"/>
      </button>

      {/* ÁREA CENTRAL (CINE XXXL) */}
      <div 
          className="relative w-full h-full flex items-center justify-center p-4 md:p-16"
          onClick={(e) => e.stopPropagation()}
      >
            <div className="relative w-full max-w-screen-2xl aspect-video rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-black">
                <img 
                    src={current} 
                    alt="Visor Holo" 
                    className={`
                        absolute inset-0 w-full h-full object-cover
                        transition-transform duration-[3000ms] ease-out
                        ${isZooming ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}
                        hover:scale-105 cursor-grab active:cursor-grabbing
                    `}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none"></div>
            </div>

            {/* DATOS IA (IZQUIERDA) */}
            <div className="absolute bottom-12 md:bottom-24 left-8 md:left-24 text-left pointer-events-none animate-slide-in-up">
                <div className="flex items-center gap-3 mb-2 animate-pulse-slow">
                    <span className="px-3 py-1 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                        {prop.type || "PREMIUM"}
                    </span>
                    <span className="text-[#00F0FF] font-mono text-xs tracking-widest flex items-center gap-2 shadow-blue-500/50 drop-shadow-md">
                         <Scan size={14}/> LIVE ANALYSIS
                    </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter drop-shadow-2xl">
                    {prop.title || "Activo Exclusivo"}
                </h1>
            </div>

            {/* DETALLE IA (DERECHA) */}
            <div className="absolute bottom-12 md:bottom-24 right-8 md:right-24 text-right pointer-events-none animate-slide-in-up delay-100 hidden md:block">
                 <div className="flex flex-col items-end gap-1">
                     <span className="text-white font-black text-xl tracking-widest uppercase flex items-center gap-2 drop-shadow-lg">
                        IA ENHANCED <Sparkles size={18} className="text-[#00F0FF]"/>
                     </span>
                     <span className="text-white/60 text-[10px] font-mono tracking-[0.3em] uppercase">
                        ULTRA RESOLUTION • NEURAL UPSCALE
                     </span>
                 </div>
            </div>

            {/* FLECHAS DE NAVEGACIÓN (RESTAURADAS: SIEMPRE VISIBLES) */}
            <button 
                onClick={(e) => { e.stopPropagation(); nav(-1); }} 
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-4 md:p-6 text-white/30 hover:text-white hover:scale-110 transition-all cursor-pointer z-20"
            >
                <ChevronLeft className="w-10 h-10 md:w-14 md:h-14" strokeWidth={1.5} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); nav(1); }} 
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-4 md:p-6 text-white/30 hover:text-white hover:scale-110 transition-all cursor-pointer z-20"
            >
                <ChevronRight className="w-10 h-10 md:w-14 md:h-14" strokeWidth={1.5} />
            </button>
      </div>

      {/* BARRA DE PROGRESO INFERIOR */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 flex bg-white/5">
          {unique.map((_, i) => (
             <div 
                key={i} 
                className={`h-full flex-1 transition-all duration-500 relative ${i === idx ? "bg-white" : "bg-transparent"}`}
             >
                 {i === idx && <div className="absolute inset-0 bg-white blur-[4px]"></div>}
             </div>
          ))}
      </div>

    </div>
  );

  return createPortal(ui, document.body);
}

