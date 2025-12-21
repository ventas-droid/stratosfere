"use client";

import React from "react";
import { X, User, Heart, Store } from "lucide-react";

export default function ProfilePanel({
  rightPanel,
  toggleRightPanel,
  toggleMainPanel,
  selectedReqs = [],
  soundEnabled,
  playSynthSound,
}: any) {
  const isOpen = rightPanel === "PROFILE";

  const close = () => {
    if (soundEnabled) playSynthSound("click");
    toggleRightPanel("PROFILE");
  };

  const openVault = () => {
    if (soundEnabled) playSynthSound("click");
    toggleRightPanel("PROFILE"); // cierra perfil
    toggleRightPanel("VAULT");   // abre favoritos
  };

  const openServices = () => {
    if (soundEnabled) playSynthSound("click");
    toggleRightPanel("PROFILE");     // cierra perfil
    toggleMainPanel("MARKETPLACE");  // abre servicios
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
            <User size={18} className="text-black/70" />
            <h2 className="text-sm font-semibold tracking-wide">Perfil</h2>
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

        {/* USER CARD */}
        <div className="mt-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-black/5 overflow-hidden flex items-center justify-center">
            <img
              src="https://i.pravatar.cc/150?u=isidro"
              alt="Usuario"
              className="w-full h-full object-cover"
              onError={(e: any) => (e.currentTarget.style.display = "none")}
            />
          </div>

          <div className="min-w-0">
            <div className="text-base font-semibold truncate">Isidro</div>
            <div className="text-xs text-black/50 truncate">
              Propietario · Stratosfere
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 space-y-6">
        {/* QUICK STATUS */}
        <div className="rounded-2xl border border-black/10 p-4 bg-white">
          <div className="text-[11px] text-black/50 tracking-wider uppercase">
            Resumen
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-black/10 p-3">
              <div className="text-[11px] text-black/50">Servicios activos</div>
              <div className="text-xl font-semibold">{selectedReqs.length}</div>
            </div>

            <div className="rounded-xl border border-black/10 p-3">
              <div className="text-[11px] text-black/50">Estado</div>
              <div className="text-sm font-semibold">Listo</div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="rounded-2xl border border-black/10 p-4 bg-white">
          <div className="text-[11px] text-black/50 tracking-wider uppercase">
            Accesos rápidos
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={openVault}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-black/10 hover:bg-black/5 transition"
            >
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-black/70" />
                <span className="text-sm font-medium">Favoritos</span>
              </div>
              <span className="text-xs text-black/40">Abrir</span>
            </button>

            <button
              type="button"
              onClick={openServices}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-black/10 hover:bg-black/5 transition"
            >
              <div className="flex items-center gap-2">
                <Store size={16} className="text-black/70" />
                <span className="text-sm font-medium">Servicios</span>
              </div>
              <span className="text-xs text-black/40">Abrir</span>
            </button>
          </div>
        </div>

        <div className="text-[12px] text-black/40">
          Diseño limpio (Apple-like), sin “War Room”, sin gamificación.
        </div>
      </div>
    </div>
  );
}


