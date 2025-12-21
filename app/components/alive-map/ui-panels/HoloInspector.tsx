"use client";

import React from "react";
import { X, Heart } from "lucide-react";

function SafeImage({ src, alt, className }: any) {
  const placeholder =
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
  return (
    <img
      src={src || placeholder}
      alt={alt}
      className={className}
      onError={(e: any) => {
        e.currentTarget.src = placeholder;
      }}
    />
  );
}

export default function VaultPanel({
  rightPanel,
  toggleRightPanel,
  favorites = [],
  onToggleFavorite,
  map,
  soundEnabled,
  playSynthSound,
}: any) {
  const isOpen = rightPanel === "VAULT";

  const close = () => {
    if (soundEnabled) playSynthSound("click");
    toggleRightPanel("VAULT");
  };

  const goTo = (fav: any) => {
    if (soundEnabled) playSynthSound("click");
    try {
      map?.flyTo?.({
        center: [fav.lng || -3.6905, fav.lat || 40.425],
        zoom: 17,
        pitch: 55,
      });
    } catch {}
    close();
  };

  return (
    <div
      className={[
        "fixed top-0 right-0 h-full w-full md:w-[420px]",
        "bg-white text-black border-l border-black/10",
        "transform transition-transform duration-300 ease-out",
        "z-[60000] pointer-events-auto overflow-y-auto",
        isOpen ? "translate-x-0" : "translate-x-full",
      ].join(" ")}
    >
      {/* HEADER */}
      <div className="p-6 border-b border-black/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-black/70" />
            <h2 className="text-sm font-semibold tracking-wide">Favoritos</h2>
          </div>

          <button
            type="button"
            onClick={close}
            className="p-2 rounded-lg hover:bg-black/5 transition"
            aria-label="Cerrar"
          >
            <X size={18} className="text-black/70" />
          </button>
        </div>

        <div className="mt-2 text-xs text-black/50">
          Tu lista de propiedades guardadas.
        </div>
      </div>

      {/* LIST */}
      <div className="p-6">
        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-black/10 p-6 text-center text-sm text-black/50">
            Aún no hay favoritos.
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((fav: any, index: number) => (
              <div
                key={fav.id || fav.price || index}
                className="rounded-2xl border border-black/10 hover:bg-black/5 transition p-3 flex gap-3 cursor-pointer"
                onClick={() => goTo(fav)}
              >
                <div className="w-20 h-16 rounded-xl overflow-hidden bg-black/5 shrink-0">
                  <SafeImage
                    src={fav.img || fav.image}
                    alt={fav.title || "Favorito"}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">
                    {fav.title || "Propiedad"}
                  </div>
                  <div className="text-xs text-black/50 truncate">
                    {fav.type || "Premium"}
                  </div>
                  <div className="text-sm mt-1">
                    {fav.formattedPrice || fav.price || "Consultar"}
                  </div>
                </div>

                <button
                  type="button"
                  className="p-2 rounded-lg hover:bg-white transition self-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (soundEnabled) playSynthSound("click");
                    onToggleFavorite?.(fav);
                  }}
                  aria-label="Quitar"
                  title="Quitar"
                >
                  <X size={16} className="text-black/50" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


