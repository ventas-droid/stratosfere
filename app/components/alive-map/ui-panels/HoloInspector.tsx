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

  // 1. LÓGICA DE ÁLBUM (Igual que antes, robusta)
  const gallerySource = (images && images.length > 0) ? images : (prop.images || []);
  const rawAlbum = [prop.img, ...gallerySource].filter(Boolean);
  
  // Limpiamos duplicados de URLs
  const unique = Array.from(new Set(rawAlbum));

  if (unique.length === 0) return null;

  const current = unique[idx] || unique[0];
  const hasMultiplePhotos = unique.length > 1;

  const nav = (dir: number) => {
    if (soundEnabled && playSynthSound) playSynthSound("click");
    setIdx((p) => (p + dir + unique.length) % unique.length);
  };

  // UI: ESTILO APPLE LIGHTBOX (Limpio, Blanco, Elegante)
  const ui = (
    <div 
        className="fixed inset-0 z-[999999] bg-[#F5F5F7]/95 backdrop-blur-xl animate-fade-in flex flex-col items-center justify-center overflow-hidden"
        onClick={onClose}
    >
      {/* BOTÓN CERRAR (Mantenemos el GIRO que le gusta) */}
      <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-gray-200/50 hover:bg-gray-300 text-gray-900 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-black/5 group active:scale-90 shadow-sm"
      >
          <X size={20} className="group-hover:rotate-90 transition-transform duration-300"/>
      </button>

      {/* ÁREA CENTRAL (FOTO AMBIENTE) */}
      <div 
          className="relative w-full h-full flex items-center justify-center p-2 md:p-6" // Menos padding = Foto más grande
          onClick={(e) => e.stopPropagation()}
      >
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] rounded-[24px] overflow-hidden shadow-2xl bg-white border border-black/5 flex items-center justify-center">
                <img 
                    src={current} 
                    alt="Detalle" 
                    className={`
                        w-full h-full object-contain bg-white
                        transition-transform duration-[800ms] ease-out
                        ${isZooming ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}
                    `}
                />
            </div>

            {/* DATOS LIMPIOS (Abajo Izquierda - Estilo Galería) */}
            <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-left pointer-events-none animate-slide-in-up">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight drop-shadow-sm mb-1">
                    {prop.title || "Propiedad Exclusiva"}
                </h1>
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <MapPin size={16} />
                    <span className="text-sm uppercase tracking-wide">
                        {prop.location || prop.address || "Ubicación Privada"}
                    </span>
                </div>
            </div>

            {/* FLECHAS DE NAVEGACIÓN (Solo si hay más de 1 foto) */}
            {hasMultiplePhotos && (
                <>
                    <button 
                        onClick={(e) => { e.stopPropagation(); nav(-1); }} 
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/80 hover:bg-white text-gray-900 shadow-lg backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-black/5 z-20"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); nav(1); }} 
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/80 hover:bg-white text-gray-900 shadow-lg backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-black/5 z-20"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* CONTADOR DE FOTOS (Discreto, estilo iOS) */}
            {hasMultiplePhotos && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-medium tracking-wide">
                    {idx + 1} / {unique.length}
                </div>
            )}
      </div>
    </div>
  );

  return createPortal(ui, document.body);
}