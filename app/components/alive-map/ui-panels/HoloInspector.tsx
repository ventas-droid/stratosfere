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
      // Arrancamos el efecto de zoom lento
      if (isOpen) setTimeout(() => setIsZooming(true), 50);
      else setIsZooming(false);
  }, [isOpen]);

  useEffect(() => { if (isOpen) setIdx(0); }, [isOpen]);

  if (!mounted || !isOpen || !prop) return null;

  // LÓGICA DE ÁLBUM BLINDADA
  const gallerySource = (images && images.length > 0) ? images : (prop.images || []);
  const rawAlbum = gallerySource.length > 0 ? gallerySource : [prop.img];
  const unique = Array.from(new Set(rawAlbum)).filter(Boolean) as string[];

  if (unique.length === 0) return null;

  const current = unique[idx] || unique[0];
  const hasMultiplePhotos = unique.length > 1;

  const nav = (dir: number) => {
    if (soundEnabled && playSynthSound) playSynthSound("click");
    setIdx((p) => (p + dir + unique.length) % unique.length);
    setIsZooming(false); // Reinicia el zoom al cambiar de foto
    setTimeout(() => setIsZooming(true), 50);
  };

  const ui = (
    <div 
        className="fixed inset-0 z-[999999] bg-[#F5F5F7]/98 backdrop-blur-2xl animate-fade-in flex flex-col items-center justify-center overflow-hidden"
        onClick={onClose}
    >
      {/* BOTÓN CERRAR */}
      <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center transition-all cursor-pointer shadow-sm border border-black/5 group active:scale-90"
      >
          <X size={22} className="group-hover:rotate-90 transition-transform duration-500 ease-out"/>
      </button>

      {/* ÁREA CENTRAL (INMERSIVA SIN BORDES) */}
      <div 
          className="relative w-full h-full flex items-center justify-center p-0 md:p-4" // Mínimo padding
          onClick={(e) => e.stopPropagation()}
      >
            {/* CONTENEDOR A PANTALLA COMPLETA */}
            <div className="relative w-full h-full rounded-none md:rounded-[32px] overflow-hidden shadow-2xl bg-black flex items-center justify-center">
                
                {/* FOTO: EFECTO ZOOM-IN LENTO (La casa viene hacia ti) */}
                <img 
                    src={current as string} 
                    alt="Detalle Activo" 
                    className={`
                        w-full h-full object-contain bg-black relative z-10
                        transition-transform duration-[4000ms] ease-out
                        ${isZooming ? 'scale-100' : 'scale-95 opacity-90'}
                    `}
                />

                {/* MARCA DE AGUA SUTIL */}
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center select-none">
                    <p className="text-white/30 text-3xl md:text-5xl font-bold tracking-tight drop-shadow-sm">
                        Stratosfere OS
                    </p>
                </div>

                {/* CONTADOR FUCSIA */}
                {hasMultiplePhotos && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#d946ef] shadow-lg shadow-fuchsia-500/30 text-white text-[11px] font-bold tracking-widest uppercase z-30">
                        {idx + 1} / {unique.length}
                    </div>
                )}

                {/* FLECHAS */}
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

            {/* DATOS (Texto blanco para resaltar sobre foto oscura) */}
            <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-left pointer-events-none animate-slide-in-up z-40 max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg mb-4 leading-[0.9]">
                    {prop.title || "Activo Stratosfere"}
                </h1>
                <div className="flex items-center gap-3 pl-1">
                    <div className="p-2 bg-white text-black rounded-full">
                        <MapPin size={14} fill="currentColor" />
                    </div>
                    <span className="text-sm md:text-base font-bold uppercase tracking-widest text-white bg-black/50 px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
                        {prop.location || prop.address || "UBICACIÓN CONFIDENCIAL"}
                    </span>
                </div>
            </div>
      </div>
    </div>
  );

  return createPortal(ui, document.body);
}

