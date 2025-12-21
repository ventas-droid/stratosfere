"use client";

import React from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function HoloInspector({
  isOpen,
  prop,
  images = [],
  onClose,
  soundEnabled,
  playSynthSound,
}: any) {
  const [idx, setIdx] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (isOpen) setIdx(0);
  }, [isOpen]);

  if (!isOpen || !prop || !mounted) return null;

  const album = [prop.img, ...images].filter(Boolean);
  const unique = Array.from(new Set(album)).slice(0, 8);
  const current = unique[idx] || unique[0];

  const next = () => {
    if (soundEnabled) playSynthSound("click");
    setIdx((p: number) => (p + 1) % unique.length);
  };

  const prev = () => {
    if (soundEnabled) playSynthSound("click");
    setIdx((p: number) => (p - 1 + unique.length) % unique.length);
  };

  const ui = (
    <div
      className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1100px] h-[80vh] bg-black rounded-3xl overflow-hidden border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={current} alt="Foto" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
          aria-label="Cerrar"
        >
          <X size={18} className="text-white" />
        </button>

        {/* ARROWS (SIEMPRE VISIBLES) */}
        {unique.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
              aria-label="Anterior"
            >
              <ChevronLeft size={22} className="text-white" />
            </button>

            <button
              type="button"
              onClick={next}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
              aria-label="Siguiente"
            >
              <ChevronRight size={22} className="text-white" />
            </button>
          </>
        )}

        {/* INFO */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-5 md:p-6">
          <div className="text-white text-xl md:text-2xl font-semibold">
            {prop.title || "Propiedad"}
          </div>
          <div className="text-white/80 text-sm mt-1">
            {prop.formattedPrice || prop.price || "Consultar"}
          </div>

          {/* DOTS */}
          {unique.length > 1 && (
            <div className="mt-4 flex gap-2">
              {unique.map((_: any, i: number) => (
                <div
                  key={i}
                  className={[
                    "h-1.5 rounded-full transition-all",
                    i === idx ? "w-8 bg-white" : "w-2 bg-white/40",
                  ].join(" ")}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(ui, document.body);
}


