// @ts-nocheck
"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  SlidersHorizontal,
  Sparkles,
  User,
  Navigation,
  Radar,
  Building,
  Smartphone,
  ChevronUp,
  ChevronLeft,
  Crosshair,
  Box,
  Square,
  Moon,
  Sun,
  Heart,
  ArrowRight,
  DollarSign,
  MessageSquare,
} from "lucide-react";

/* =========================
   EXPORTS QUE TE PIDEN OTROS ARCHIVOS
========================= */
export const CORPORATE_BLUE = "#2563eb";
export const NEON_GLOW = "0 0 15px rgba(37, 99, 235, 0.8)";
export const TEXT_COLOR = "#ffffff";

export const LUXURY_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
];

export const TIER_COLORS = {
  SMART: { hex: "#10b981", glow: "0 0 15px rgba(16, 185, 129, 0.8)" },
  PREMIUM: { hex: "#2563eb", glow: "0 0 20px rgba(37, 99, 235, 0.8)" },
  HIGH_CLASS: { hex: "#d946ef", glow: "0 0 20px rgba(217, 70, 239, 0.8)" },
};

/* =========================
   1) GATEKEEPER
========================= */
export const Gatekeeper = ({ onUnlock, sound }) => {
  const [access, setAccess] = useState(false);

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-black flex items-center justify-center transition-opacity duration-700 ${
        access ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <button
        onClick={() => {
          sound?.playBoot?.();
          setAccess(true);
          setTimeout(() => onUnlock?.(), 700);
        }}
        className="group relative px-10 py-4 bg-white text-black font-bold tracking-[0.3em] rounded-full hover:scale-110 transition-transform shadow-[0_0_60px_rgba(255,255,255,0.6)] overflow-hidden"
      >
        <span className="relative z-10">INITIALIZE SYSTEM</span>
        <div className="absolute inset-0 bg-blue-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </button>
    </div>
  );
};

/* =========================
   2) DUAL GATEWAY (wizard 2 modos)
========================= */
const DualGateway = ({ onSelectMode, sound }) => (
  <div className="fixed inset-0 z-[60000] pointer-events-auto flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in-up">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full px-8">
      <button
        onClick={() => {
          sound?.playClick?.();
          onSelectMode?.("EXPLORER");
        }}
        className="group relative h-96 bg-black/80 border border-white/10 rounded-3xl hover:border-cyan-500 transition-all duration-500 hover:scale-[1.02] flex flex-col items-center justify-center gap-6 overflow-hidden"
      >
        <div className="p-6 bg-white/5 rounded-full group-hover:bg-cyan-500/20 transition-colors">
          <Radar className="w-16 h-16 text-white group-hover:text-cyan-400" />
        </div>
        <div className="text-center relative z-10">
          <h2 className="text-3xl font-light text-white tracking-[0.2em] mb-2">
            EXPLORADOR
          </h2>
          <p className="text-xs text-white/50 font-mono">RADAR DE OPORTUNIDADES</p>
        </div>
      </button>

      <button
        onClick={() => {
          sound?.playClick?.();
          onSelectMode?.("ARCHITECT");
        }}
        className="group relative h-96 bg-black/80 border border-white/10 rounded-3xl hover:border-amber-500 transition-all duration-500 hover:scale-[1.02] flex flex-col items-center justify-center gap-6 overflow-hidden"
      >
        <div className="p-6 bg-white/5 rounded-full group-hover:bg-amber-500/20 transition-colors">
          <Building className="w-16 h-16 text-white group-hover:text-amber-400" />
        </div>
        <div className="text-center relative z-10">
          <h2 className="text-3xl font-light text-white tracking-[0.2em] mb-2">
            ARQUITECTO
          </h2>
          <p className="text-xs text-white/50 font-mono">GESTIÓN DE ACTIVOS</p>
        </div>
      </button>
    </div>
  </div>
);

/* =========================
   3) TOPBAR / VIEW DOCK / STATUS
========================= */
export const TopBar = ({ onGPS }) => (
  <div className="absolute top-0 left-0 right-0 z-[20000] px-8 py-6 flex justify-between items-start pointer-events-none">
    <div className="pointer-events-auto flex flex-col">
      <h1 className="text-2xl font-light tracking-[0.3em]" style={{ color: TEXT_COLOR }}>
        STRATOS<span className="font-bold" style={{ color: CORPORATE_BLUE }}>FERE</span>
      </h1>
    </div>
    <div className="pointer-events-auto">
      <button
        className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
        onClick={onGPS}
      >
        <Crosshair className="w-5 h-5" />
      </button>
    </div>
  </div>
);

export const ViewControlDock = ({ onViewChange, currentView, sound }) => (
  <div className="absolute top-1/2 -translate-y-1/2 left-6 z-[20000] flex flex-col gap-3 pointer-events-auto">
    <div className="bg-[#080808]/95 border border-white/10 p-1.5 rounded-xl shadow-2xl flex flex-col gap-1.5">
      <button
        onClick={() => { sound?.playClick?.(); onViewChange?.("3D"); }}
        className={`w-9 h-9 flex items-center justify-center rounded-lg ${
          currentView?.is3D ? "bg-blue-600 text-white" : "bg-white/5 text-white/40"
        }`}
      >
        <Box size={16} />
      </button>
      <button
        onClick={() => { sound?.playClick?.(); onViewChange?.("2D"); }}
        className={`w-9 h-9 flex items-center justify-center rounded-lg ${
          !currentView?.is3D ? "bg-blue-600 text-white" : "bg-white/5 text-white/40"
        }`}
      >
        <Square size={16} />
      </button>
    </div>

    <div className="bg-[#080808]/95 border border-white/10 p-1.5 rounded-xl shadow-2xl flex flex-col gap-1.5">
      <button
        onClick={() => { sound?.playClick?.(); onViewChange?.("MODE_DUSK"); }}
        className={`w-9 h-9 flex items-center justify-center rounded-lg ${
          currentView?.mode === "dusk" ? "bg-blue-600 text-white" : "bg-white/5 text-white/40"
        }`}
      >
        <Moon size={16} />
      </button>
      <button
        onClick={() => { sound?.playClick?.(); onViewChange?.("MODE_DAWN"); }}
        className={`w-9 h-9 flex items-center justify-center rounded-lg ${
          currentView?.mode === "dawn" ? "bg-blue-600 text-white" : "bg-white/5 text-white/40"
        }`}
      >
        <Sun size={16} />
      </button>
    </div>
  </div>
);

export const StatusDeck = ({ notifications = [], clear }) => (
  <div className="absolute top-24 right-8 z-[20000] pointer-events-auto w-[300px] bg-black/90 border border-blue-900/30 p-4 rounded-xl">
    <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
      <span className="text-[10px] font-bold tracking-widest text-white/50">SYSTEM STATUS</span>
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
    </div>
    <div className="text-[10px] text-white/60">System Online. Waiting for input.</div>
    {notifications.length > 0 && (
      <button onClick={clear} className="w-full mt-2 py-1 bg-red-900/20 text-red-400 text-[9px] rounded">
        CLEAR
      </button>
    )}
  </div>
);

/* =========================
   4) MAP NANO CARD (lo pide useMapLogic.tsx)
========================= */
export const MapNanoCard = ({
  props,
  onToggleFavorite,
  isFavorite,
  onClose,
  onOpenDetail,
  sound,
}) => {
  const [liked, setLiked] = useState(!!isFavorite);

  const tierKey = props?.tier || "PREMIUM";
  const tierColor = TIER_COLORS[tierKey]?.hex || CORPORATE_BLUE;
  const tierGlow = TIER_COLORS[tierKey]?.glow || NEON_GLOW;

  const priceText = props?.price ?? props?.precio ?? props?.precio_text ?? "—";

  return (
    <div
      className="relative w-[320px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
      style={{ borderColor: `${tierColor}40` }}
    >
      <div className="relative h-44 w-full cursor-pointer overflow-hidden" onClick={() => onOpenDetail?.(props)}>
        <img src={props?.photoUrl || props?.image || LUXURY_IMAGES[0]} alt={props?.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded text-[9px] font-bold text-white uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tierColor, boxShadow: tierGlow }} />
          {props?.title || "Activo"}
        </div>

        <div className="absolute bottom-3 left-4">
          <span className="text-xl font-light tracking-tight text-white">{priceText}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked((v) => !v);
            onToggleFavorite?.(props);
            sound?.playPing?.();
          }}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-black/30 hover:bg-white/10 transition-colors"
        >
          <Heart
            size={18}
            className={liked ? "fill-current" : ""}
            style={liked ? { color: tierColor } : { color: "white" }}
          />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onClose?.(); }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-white/10 text-white/60 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xs font-bold text-white mb-1">{props?.category || "Propiedad"}</h3>
            <p className="text-[10px] text-white/50 font-mono">ID: {props?.id || "—"}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-white/70">
              {props?.rooms ?? "—"} hab • {props?.area ?? "—"} m²
            </span>
          </div>
        </div>

        <button
          className="w-full py-3 rounded-lg text-white text-[10px] font-bold tracking-wider transition-colors flex items-center justify-center gap-1 hover:opacity-90"
          style={{ backgroundColor: tierColor, boxShadow: tierGlow }}
          onClick={() => { sound?.playDeploy?.(); onOpenDetail?.(props); }}
        >
          VER DETALLES <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

/* =========================
   5) SMART FILTERS -> FilterPanel (lo pide AliveMap.tsx)
========================= */
const SmartFiltersPanel = ({ onClose, sound }) => (
  <div className="w-full max-w-lg bg-[#080808] border border-white/10 rounded-3xl shadow-2xl p-8 relative animate-fade-in-up pointer-events-auto">
    <div className="flex justify-between items-center mb-8">
      <span className="text-xs font-bold tracking-[0.2em] text-white uppercase">Filtros Tácticos</span>
      <button onClick={() => { sound?.playClick?.(); onClose?.(); }}>
        <X className="w-5 h-5 text-zinc-500 hover:text-white" />
      </button>
    </div>

    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between text-xs font-medium text-zinc-400">
          <span className="flex items-center gap-2">
            <DollarSign size={14} className="text-blue-500" />
            PRESUPUESTO
          </span>
          <span className="text-white">2.5M €</span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full relative overflow-hidden">
          <div className="absolute h-full bg-white w-[70%]" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button className="py-3 bg-white text-black text-[10px] font-bold tracking-widest rounded" onClick={() => sound?.playClick?.()}>
          TODO
        </button>
        <button className="py-3 bg-zinc-900 text-zinc-500 border border-white/10 text-[10px] font-bold tracking-widest rounded" onClick={() => sound?.playClick?.()}>
          CASA
        </button>
        <button className="py-3 bg-zinc-900 text-zinc-500 border border-white/10 text-[10px] font-bold tracking-widest rounded" onClick={() => sound?.playClick?.()}>
          PISO
        </button>
      </div>
    </div>
  </div>
);

// ✅ esto arregla: “Export FilterPanel doesn't exist…”
export const FilterPanel = SmartFiltersPanel;

/* =========================
   6) OMNI SEARCH DOCK (lo pide AliveMap.tsx)
========================= */
export const OmniSearchDock = ({
  onSearch,
  onToggleFilters,
  onToggleAI,
  onOpenProfile,
  filtersActive,
  aiActive,
}) => (
  <div className="pointer-events-auto w-full max-w-4xl mx-auto px-6">
    <div className="bg-black/80 backdrop-blur-2xl rounded-full shadow-2xl border border-white/10 flex items-center p-2 gap-3 ring-1 ring-white/5">
      <div className="flex-1 flex items-center bg-zinc-900/50 rounded-full px-5 h-14 border border-white/5 group focus-within:border-blue-500/50">
        <Search className="w-5 h-5 text-zinc-500 mr-3" />
        <input
          type="text"
          placeholder="Comando o ubicación..."
          className="bg-transparent border-none outline-none text-sm text-white w-full font-light"
          onKeyDown={(e) => e.key === "Enter" && onSearch?.(e.target.value)}
        />
      </div>

      <button
        onClick={onToggleFilters}
        className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${
          filtersActive ? "bg-white text-black" : "bg-zinc-900/50 text-zinc-400"
        }`}
      >
        <SlidersHorizontal className="w-6 h-6" />
      </button>

      <button
        onClick={onToggleAI}
        className={`h-14 px-6 rounded-full flex items-center gap-3 transition-all ${
          aiActive ? "bg-blue-600 text-white" : "bg-zinc-900/50 text-zinc-400"
        }`}
      >
        {aiActive ? <ChevronUp className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>

      <button
        onClick={onOpenProfile}
        className="h-14 w-14 rounded-full flex items-center justify-center bg-zinc-900/50 text-zinc-400"
      >
        <User className="w-6 h-6" />
      </button>
    </div>
  </div>
);

/* =========================
   7) PANELES AUXILIARES
========================= */
export const ProfileDashboard = ({ onClose }) => (
  <div className="fixed inset-0 z-[65000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in-up pointer-events-auto" onClick={onClose}>
    <div className="bg-[#050505] w-full max-w-5xl h-[80vh] rounded-[24px] border border-white/10 shadow-2xl overflow-hidden flex relative" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-6 right-6 z-50 text-white/30 hover:text-white">
        <X size={24} />
      </button>
      <div className="w-64 bg-[#080808] border-r border-white/5 flex flex-col p-6">
        <div className="mb-10 text-white font-bold">STRATOSFERE OS</div>
        <div className="text-white/50 text-xs">PARTNER GOLD</div>
      </div>
      <div className="flex-grow p-10">
        <h1 className="text-4xl text-white font-light">Dashboard</h1>
        <p className="text-white/40 mt-4">Bienvenido al centro de mando.</p>
      </div>
    </div>
  </div>
);

export const TheVault = ({ favorites = [], onClose, onFlyTo }) => (
  <div className="fixed inset-0 z-[65000] bg-[#050505] animate-fade-in flex flex-col pointer-events-auto">
    <div className="p-12 border-b border-white/10 bg-black flex justify-between items-end">
      <div>
        <h2 className="text-4xl font-light text-white tracking-[0.2em]">FAVORITOS</h2>
        <p className="text-xs text-white/40">{favorites?.length || 0} ACTIVOS</p>
      </div>
      <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:text-white">
        <X size={24} />
      </button>
    </div>
    <div className="flex-grow p-12 bg-[#080808] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 overflow-y-auto">
      {favorites?.map((f) => (
        <div
          key={f.id}
          className="bg-[#111] border border-white/5 rounded-xl overflow-hidden cursor-pointer"
          onClick={() => {
            onFlyTo?.(f.location);
            onClose?.();
          }}
        >
          <div className="h-48 bg-gray-800">
            <img src={f.image || LUXURY_IMAGES[0]} className="w-full h-full object-cover opacity-80" />
          </div>
          <div className="p-4">
            <h3 className="text-white font-bold">{f.title}</h3>
            <p className="text-white/50 text-xs">€{f.price}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ChatPanel = ({ onClose }) => (
  <div className="fixed bottom-28 right-8 w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-[65000] pointer-events-auto">
    <div className="p-4 border-b border-white/10 flex justify-between items-center">
      <span className="text-xs font-bold text-white flex items-center gap-2">
        <MessageSquare size={14} /> IA CONCIERGE
      </span>
      <button onClick={onClose}>
        <X size={14} className="text-white/50" />
      </button>
    </div>
    <div className="h-64 p-4 text-white/50 text-xs flex items-center justify-center">Sistema listo.</div>
  </div>
);

export const CommandCenterPanel = ({ property, onClose }) => {
  if (!property) return null;
  return (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-[#050505] border-l border-white/10 shadow-2xl z-[65000] animate-slide-left flex flex-col pointer-events-auto">
      <div className="relative h-80">
        <img src={property.image || LUXURY_IMAGES[0]} className="w-full h-full object-cover opacity-80" />
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/50 rounded-full text-white">
          <X size={20} />
        </button>
      </div>
      <div className="p-8 text-white">
        <h2 className="text-3xl font-light">{property.title}</h2>
        <p className="text-white/60 mt-4">{property.price} €</p>
      </div>
    </div>
  );
};

export const PropertyCaptureForm = ({ onClose, sound }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    sound?.playClick?.();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[70000] bg-black/90 flex items-center justify-center backdrop-blur-md animate-fade-in-up pointer-events-auto">
      <div className="w-[600px] bg-[#0a0a0a] border border-white/20 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,1)] p-8 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white tracking-widest mb-8 border-b border-white/10 pb-4">
          SUBMIT ASSET
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-white/60">VALUATION (€)</label>
            <input type="number" className="w-full bg-white/5 border border-white/10 p-3 rounded text-white" placeholder="Ej: 1500000" />
          </div>
          <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest rounded transition-all">
            UPLOAD TO NETWORK
          </button>
        </form>
      </div>
    </div>
  );
};

/* =========================
   8) ARCHITECT HUD (Vendedor)
========================= */
const ArchitectHud = ({ sound, onCloseMode, onOpenForm }) => (
  <div className="absolute inset-0 z-[40000] pointer-events-none flex items-end justify-center pb-10">
    <div className="pointer-events-auto w-full max-w-lg bg-[#0a0a0a]/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-8 shadow-2xl animate-slide-up">
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Building className="text-amber-500 animate-pulse" size={20} />
          <span className="text-xs font-bold text-amber-500 tracking-[0.2em]">MODO VENDEDOR</span>
        </div>
        <button onClick={onCloseMode} className="text-[10px] text-white/40 hover:text-white px-3 py-1 rounded hover:bg-white/10">
          SALIR
        </button>
      </div>

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl text-white font-light">Digitalizar Activo</h3>
          <p className="text-xs text-white/50">Suba el ADN de su propiedad.</p>
        </div>

        <div className="aspect-video w-full bg-white/5 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 text-white/40">
          <Smartphone size={32} />
          <span className="text-xs font-mono">Upload Scan</span>
        </div>

        <button
          onClick={() => { sound?.playDeploy?.(); onOpenForm?.(); }}
          className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-bold text-sm tracking-widest rounded-xl shadow-lg transition-all"
        >
          SINTETIZAR GEMELO DIGITAL
        </button>
      </div>
    </div>
  </div>
);

/* =========================
   9) AI PANEL (simple)
========================= */
const AIArchitectPanel = ({ onClose, sound }) => {
  const [step, setStep] = useState(1);
  const nextStep = () => { sound?.playClick?.(); setStep((s) => Math.min(s + 1, 4)); };
  const prevStep = () => { sound?.playClick?.(); setStep((s) => Math.max(s - 1, 1)); };

  return (
    <div className="w-full max-w-2xl bg-[#050505] border border-white/10 rounded-3xl shadow-2xl relative p-8 animate-fade-in-up pointer-events-auto">
      <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          <h2 className="text-white font-bold text-xs tracking-[0.2em] text-blue-400">AI ARCHITECT // WIZARD</h2>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="min-h-[250px] flex flex-col justify-center relative">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-light text-center text-white">¿Cuál es su visión de vida?</h3>
            <div className="grid grid-cols-3 gap-4">
              {["URBAN", "NATURE", "CAPITAL"].map((l) => (
                <button
                  key={l}
                  onClick={nextStep}
                  className="h-32 bg-zinc-900/40 border border-white/5 rounded-2xl hover:border-blue-400 text-white text-xs font-bold tracking-widest"
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <h3 className="text-2xl font-light text-white">Capital Objetivo</h3>
            <input type="range" className="w-full h-1 bg-zinc-800 accent-blue-500" />
            <button onClick={nextStep} className="px-8 py-3 bg-white text-black font-bold text-xs tracking-widest rounded mt-4">
              CONFIRMAR
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <h3 className="text-2xl font-light text-white">Specs</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 p-4 rounded text-white/50 text-xs">Habitaciones</div>
              <div className="bg-zinc-900 p-4 rounded text-white/50 text-xs">Extras</div>
            </div>
            <button onClick={nextStep} className="px-8 py-3 bg-blue-600 text-white font-bold text-xs tracking-widest rounded mt-4">
              ANALIZAR
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <Sparkles className="mx-auto text-blue-400 mb-4 animate-pulse" size={32} />
            <div className="text-white tracking-widest mb-2">PROCESANDO...</div>
            <button
              onClick={() => { sound?.playPing?.(); onClose?.(); }}
              className="text-white/50 text-xs underline"
            >
              Ver Resultados
            </button>
          </div>
        )}

        {step > 1 && step < 4 && (
          <button onClick={prevStep} className="absolute bottom-0 left-0 p-2 text-zinc-500 hover:text-white">
            <ChevronLeft size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

/* =========================
   10) MAIN CONTROLLER (default export)
========================= */
export default function UIPanels({ onSearch, onToggleFavorite, favorites, onFlyTo, sound }) {
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [systemMode, setSystemMode] = useState("GATEWAY");
  const [activePanel, setActivePanel] = useState("NONE"); // AI_PANEL | FILTERS | NONE
  const [activeTab, setActiveTab] = useState(null); // profile | vault | chat
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const toggleAI = () => { sound?.playClick?.(); setActivePanel((p) => (p === "AI_PANEL" ? "NONE" : "AI_PANEL")); };
  const toggleFilters = () => { sound?.playClick?.(); setActivePanel((p) => (p === "FILTERS" ? "NONE" : "FILTERS")); };

  if (!gateUnlocked) return <Gatekeeper onUnlock={() => setGateUnlocked(true)} sound={sound} />;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-end pb-8 text-sans">
      <style
        dangerouslySetInnerHTML={{
          __html:
            ".mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right, .mapboxgl-ctrl-compass, .mapboxgl-ctrl-attrib { display: none !important; }",
        }}
      />

      {/* WIZARD INICIAL 2 MODOS */}
      {systemMode === "GATEWAY" && <DualGateway onSelectMode={setSystemMode} sound={sound} />}

      {/* MODO VENDEDOR */}
      {systemMode === "ARCHITECT" && (
        <ArchitectHud
          sound={sound}
          onCloseMode={() => setSystemMode("GATEWAY")}
          onOpenForm={() => setShowPropertyForm(true)}
        />
      )}

      {/* MODO COMPRADOR */}
      {systemMode === "EXPLORER" && (
        <>
          <StatusDeck notifications={notifications} clear={() => setNotifications([])} />

          {activeTab === "profile" && <ProfileDashboard onClose={() => setActiveTab(null)} />}
          {activeTab === "vault" && <TheVault favorites={favorites} onClose={() => setActiveTab(null)} onFlyTo={onFlyTo} />}
          {activeTab === "chat" && <ChatPanel onClose={() => setActiveTab(null)} />}
          {selectedProperty && <CommandCenterPanel property={selectedProperty} onClose={() => setSelectedProperty(null)} />}

          {/* PANELES FLOTANTES */}
          <div className="pointer-events-auto w-full px-4 flex justify-center items-end mb-12 min-h-[420px]">
            {activePanel === "AI_PANEL" && <AIArchitectPanel onClose={() => setActivePanel("NONE")} sound={sound} />}
            {activePanel === "FILTERS" && <SmartFiltersPanel onClose={() => setActivePanel("NONE")} sound={sound} />}
          </div>

          {/* OMNI BAR */}
          <OmniSearchDock
            onSearch={onSearch}
            onToggleFilters={toggleFilters}
            onToggleAI={toggleAI}
            onOpenProfile={() => setActiveTab("profile")}
            filtersActive={activePanel === "FILTERS"}
            aiActive={activePanel === "AI_PANEL"}
          />

          {/* CAMBIAR MODO */}
          <div className="fixed bottom-[30px] left-[70px] z-[65000] pointer-events-auto">
            <button
              onClick={() => setSystemMode("GATEWAY")}
              className="group flex items-center gap-3 px-5 py-2.5 bg-black/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl hover:scale-105"
            >
              <Navigation size={14} className="text-white/70" />
              <span className="text-[11px] font-mono text-white/90">CHANGE MODE</span>
            </button>
          </div>
        </>
      )}

      {/* FORM VENDEDOR */}
      {showPropertyForm && <PropertyCaptureForm onClose={() => setShowPropertyForm(false)} sound={sound} />}
    </div>
  );
}


