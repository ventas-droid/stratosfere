"use client";

import React from "react";
import { X } from "lucide-react";
import { MARKET_CATALOG } from "../market-data";

export default function MarketPanel({
  isOpen,
  onClose,
  marketTab,
  setMarketTab,
  selectedReqs,
  toggleRequirement,
  soundEnabled,
  playSynthSound,
}: any) {
  if (!isOpen) return null;

  const mySpend = selectedReqs.reduce((acc: number, id: any) => {
    const it = MARKET_CATALOG.find((x) => x.id === id);
    return acc + (it ? it.price : 0);
  }, 0);

  const agencyValue = selectedReqs.reduce((acc: number, id: any) => {
    const it = MARKET_CATALOG.find((x) => x.id === id);
    return acc + (it ? it.marketValue : 0);
  }, 0);

  return (
    <div className="fixed inset-y-0 left-0 w-full md:w-[520px] bg-white text-black border-r border-black/10 z-[60000] pointer-events-auto animate-slide-in-left flex flex-col">
      {/* HEADER */}
      <div className="p-6 border-b border-black/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold tracking-wide">Servicios</div>
            <div className="text-xs text-black/50 mt-1">
              Selecciona mejoras para tu publicación (sin “modo juego”).
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (soundEnabled) playSynthSound("click");
              onClose();
            }}
            className="p-2 rounded-lg hover:bg-black/5 transition"
            aria-label="Cerrar"
          >
            <X size={18} className="text-black/70" />
          </button>
        </div>

        {/* MINI PROGRESS */}
        <div className="mt-4 rounded-2xl border border-black/10 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-black/50">Servicios activos</div>
            <div className="text-sm font-semibold">{selectedReqs.length}</div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-black/5 overflow-hidden">
            <div
              className="h-full bg-black/60"
              style={{ width: `${Math.min(100, (selectedReqs.length / 26) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-black/10">
        {["ONLINE", "OFFLINE", "PACK"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              if (soundEnabled) playSynthSound("click");
              setMarketTab(tab);
            }}
            className={[
              "flex-1 py-3 text-xs font-semibold transition",
              marketTab === tab ? "bg-black text-white" : "hover:bg-black/5 text-black/70",
            ].join(" ")}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-3">
          {MARKET_CATALOG.filter((i) => i.category === marketTab).map((item: any) => {
            const isActive = selectedReqs.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleRequirement(item)}
                className={[
                  "text-left rounded-2xl border p-4 transition",
                  isActive ? "border-black bg-black text-white" : "border-black/10 hover:bg-black/5",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 rounded-xl bg-white/10">
                    <item.icon size={18} className={isActive ? "text-white" : "text-black/70"} />
                  </div>
                  <div className={["text-xs font-semibold", isActive ? "text-white" : "text-black"].join(" ")}>
                    {item.price.toFixed(2)}€
                  </div>
                </div>

                <div className="mt-3 text-[12px] font-semibold">
                  {item.name}
                </div>
                <div className={["mt-1 text-[11px] leading-snug", isActive ? "text-white/80" : "text-black/50"].join(" ")}>
                  {item.desc}
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-end justify-between">
                  <div className={["text-[10px]", isActive ? "text-white/70" : "text-black/40"].join(" ")}>
                    Valor para agencia
                  </div>
                  <div className={["text-sm font-semibold", isActive ? "text-white" : "text-black"].join(" ")}>
                    {item.marketValue}€
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-6 border-t border-black/10">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-black/10 p-4">
            <div className="text-xs text-black/50">Tu coste</div>
            <div className="text-lg font-semibold">{mySpend.toFixed(2)} €</div>
          </div>
          <div className="rounded-2xl border border-black/10 p-4">
            <div className="text-xs text-black/50">Valor activado</div>
            <div className="text-lg font-semibold">{agencyValue.toLocaleString()} €</div>
          </div>
        </div>

        <button
          type="button"
          disabled={selectedReqs.length === 0}
          onClick={() => {
            if (soundEnabled) playSynthSound("complete");
            onClose();
          }}
          className={[
            "mt-4 w-full py-4 rounded-2xl text-xs font-semibold tracking-wide transition",
            selectedReqs.length === 0
              ? "bg-black/5 text-black/30 cursor-not-allowed"
              : "bg-black text-white hover:opacity-90",
          ].join(" ")}
        >
          Aplicar servicios
        </button>
      </div>
    </div>
  );
}


