"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

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

  // 1. LÓGICA DE ÁLBUM BLINDADA
  const gallerySource = (images && images.length > 0) ? images : (prop.images || []);
  const rawAlbum = gallerySource.length > 0 ? gallerySource : [prop.img];
  
  // Limpiamos duplicados y aseguramos que es lista de texto
  const unique = Array.from(new Set(rawAlbum)).filter(Boolean) as string[];

  if (unique.length === 0) return null;

  const current = unique[idx] || unique[0];
  const hasMultiplePhotos = unique.length > 1;

  const nav = (dir: number) => {
    if (soundEnabled && playSynthSound) playSynthSound("click");
    setIdx((p) => (p + dir + unique.length) % unique.length);
  };

  const ui = (
    <div 
        className="fixed inset-0 z-[999999] bg-[#F5F5F7]/98 backdrop-blur-2xl animate-fade-in flex flex-col items-center justify-center overflow-hidden"
        onClick={onClose}
    >
      {/* BOTÓN CERRAR (GIRATORIO) */}
      <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center transition-all cursor-pointer shadow-sm border border-black/5 group active:scale-90"
      >
          <X size={22} className="group-hover:rotate-90 transition-transform duration-500 ease-out"/>
      </button>

      {/* ÁREA CENTRAL (WIDE SCREEN & FIT) */}
      <div 
          className="relative w-full h-full flex items-center justify-center p-4 md:p-10"
          onClick={(e) => e.stopPropagation()}
      >
            {/* CONTENEDOR APAISADO (+4cm visuales) y AJUSTE PERFECTO */}
            <div className="relative w-full max-w-[95vw] h-[85vh] rounded-[32px] overflow-hidden shadow-2xl bg-white border border-gray-100 flex items-center justify-center">
                
                {/* FOTO PRINCIPAL */}
                <img 
                    src={current as string} 
                    alt="Detalle Activo" 
                    className={`
                        w-full h-full object-contain bg-gray-50 relative z-10
                        transition-transform duration-[700ms] ease-out
                        ${isZooming ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}
                    `}
                />

                {/* 🔥 CAPA DE SEGURIDAD: MARCA DE AGUA 🔥 */}
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden select-none mix-blend-overlay opacity-50">
                    <p className="text-white text-[10vw] font-black uppercase -rotate-12 whitespace-nowrap tracking-tighter leading-none drop-shadow-lg filter blur-[1px]">
                        STRATOSFERE OS
                    </p>
                </div>

                {/* CONTADOR FUCSIA (MODERNO) */}
                {hasMultiplePhotos && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#d946ef] shadow-lg shadow-fuchsia-500/30 text-white text-[11px] font-bold tracking-widest uppercase z-30">
                        {idx + 1} / {unique.length}
                    </div>
                )}

                {/* FLECHAS DE NAVEGACIÓN */}
                {hasMultiplePhotos && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); nav(-1); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 hover:bg-white text-black shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-black/5 z-30">
                            <ChevronLeft size={28} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); nav(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 hover:bg-white text-black shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-black/5 z-30">
                            <ChevronRight size={28} />
                        </button>
                    </>
                )}
            </div>

            {/* DATOS (SEPARADOS Y GRUESOS) */}
            <div className="absolute bottom-10 left-10 md:bottom-14 md:left-14 text-left pointer-events-none animate-slide-in-up z-40 max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter drop-shadow-sm mb-4 leading-[0.9]">
                    {prop.title || "Activo Stratosfere"}
                </h1>
                
                <div className="flex items-center gap-3 pl-1">
                    <div className="p-2 bg-black text-white rounded-full">
                        <MapPin size={14} fill="currentColor" />
                    </div>
                    <span className="text-sm md:text-base font-bold uppercase tracking-widest text-gray-500 bg-white/80 px-3 py-1 rounded-lg backdrop-blur-md">
                        {prop.location || prop.address || "UBICACIÓN CONFIDENCIAL"}
                    </span>
                </div>
            </div>
      </div>
    </div>
  );

  return createPortal(ui, document.body);
}