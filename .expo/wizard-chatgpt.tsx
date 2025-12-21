// @ts-nocheck
"use client";

import React, { useMemo, useState } from "react";
import {
  X,
  Search,
  SlidersHorizontal,
  Sparkles,
  ChevronUp,
  ChevronLeft,
  Navigation,
  User,
  Heart,
  ArrowRight,
  Crosshair,
  Box,
  Square,
  Moon,
  Sun,
  Building,
  Radar,
  Smartphone,
  Mountain,
  Activity,
  Layers,
  Globe,
  Target,
  Zap,
  DollarSign,
  Music,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ==============================
// CONFIG
// ==============================
const CORPORATE_BLUE = "#2563eb";
const TEXT_COLOR = "#ffffff";

const LUXURY_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
];

const TIER_COLORS = {
  SMART: { hex: "#10b981", glow: "0 0 15px rgba(16, 185, 129, 0.8)" },
  PREMIUM: { hex: "#2563eb", glow: "0 0 20px rgba(37, 99, 235, 0.8)" },
  HIGH_CLASS: { hex: "#d946ef", glow: "0 0 20px rgba(217, 70, 239, 0.8)" },
};

// ==============================
// 1) GATEKEEPER
// ==============================
export const Gatekeeper = ({ onUnlock, sound }) => {
  const [status, setStatus] = useState("LOCKED"); // LOCKED | GRANTED
  const handleAccess = () => {
    sound?.playBoot?.();
    setStatus("GRANTED");
    setTimeout(() => onUnlock?.(), 1200);
  };

  return (
    <div
      className={`fixed inset-0 bg-[#050505] z-[99999] flex flex-col items-center justify-center transition-opacity duration-700 ${
        status === "GRANTED" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="text-center mb-14 select-none pointer-events-none">
        <h1
          className="text-5xl md:text-6xl font-light tracking-[0.2em] mb-4"
          style={{ color: TEXT_COLOR }}
        >
          STRATOS<span className="font-bold" style={{ color: CORPORATE_BLUE }}>FERE</span>
        </h1>
        <div className="h-[1px] w-24 bg-white/20 mx-auto" />
      </div>

      <div className="h-20 flex items-center justify-center">
        {status === "LOCKED" && (
          <button
            className="px-10 py-3 bg-white text-black rounded-full font-medium text-sm tracking-widest hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.25)]"
            onClick={handleAccess}
            onMouseEnter={() => sound?.playHover?.()}
          >
            INITIALIZE SYSTEM
          </button>
        )}
        {status === "GRANTED" && (
          <div className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">
            ACCESS GRANTED
          </div>
        )}
      </div>
    </div>
  );
};

// ==============================
// 2) DUAL GATEWAY (WIZARD 2 MODOS)
// ==============================
export const DualGateway = ({ onSelectMode, sound }) => (
  <div className="fixed inset-0 z-[95000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full px-8">
      <button
        onClick={() => {
          sound?.playClick?.();
          onSelectMode?.("EXPLORER");
        }}
        className="group relative h-96 bg-black/80 border border-white/10 rounded-3xl hover:border-cyan-500 transition-all duration-500 hover:scale-[1.02] flex flex-col items-center justify-center gap-6 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="p-6 bg-white/5 rounded-full group-hover:bg-cyan-500/20 transition-colors">
          <Radar className="w-16 h-16 text-white group-hover:text-cyan-400" />
        </div>
        <div className="text-center relative z-10">
          <h2 className="text-3xl font-light text-white tracking-[0.2em] mb-2">EXPLORADOR</h2>
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
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="p-6 bg-white/5 rounded-full group-hover:bg-amber-500/20 transition-colors">
          <Building className="w-16 h-16 text-white group-hover:text-amber-400" />
        </div>
        <div className="text-center relative z-10">
          <h2 className="text-3xl font-light text-white tracking-[0.2em] mb-2">ARQUITECTO</h2>
          <p className="text-xs text-white/50 font-mono">GESTIÓN DE ACTIVOS</p>
        </div>
      </button>
    </div>
  </div>
);

// ==============================
// 3) ARCHITECT HUD (VENDEDOR)
// ==============================
export const ArchitectHud = ({ sound, onCloseMode, onOpenForm }) => {
  const [step] = useState("SCAN");
  return (
    <div className="absolute inset-0 z-[94000] pointer-events-none flex items-end justify-center pb-10">
      <div className="pointer-events-auto w-full max-w-lg bg-[#0a0a0a]/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <Building className="text-amber-500 animate-pulse" size={20} />
            <span className="text-xs font-bold text-amber-500 tracking-[0.2em]">MODO VENDEDOR</span>
          </div>
          <button
            onClick={() => {
              sound?.playClick?.();
              onCloseMode?.();
            }}
            className="text-[10px] text-white/40 hover:text-white px-3 py-1 rounded hover:bg-white/10"
          >
            SALIR
          </button>
        </div>

        {step === "SCAN" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl text-white font-light">Digitalizar Activo</h3>
              <p className="text-xs text-white/50">Suba el ADN de su propiedad.</p>
            </div>

            <div className="aspect-video w-full bg-white/5 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 group hover:border-amber-500/50 cursor-pointer transition-all">
              <Smartphone className="text-white/40 group-hover:text-amber-500 transition-colors" size={32} />
              <span className="text-xs text-white/60 font-mono">Subir Vibe Check (15s)</span>
            </div>

            <button
              onClick={() => {
                sound?.playDeploy?.();
                onOpenForm?.();
              }}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-bold text-sm tracking-widest rounded-xl shadow-lg transition-all"
            >
              SINTETIZAR GEMELO DIGITAL
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==============================
// 4) AI ARCHITECT (WIZARD 4 PASOS)
// ==============================
const AIArchitectPanel = ({ onClose, sound }) => {
  const [step, setStep] = useState(1);
  const nextStep = () => {
    sound?.playClick?.();
    setStep((s) => Math.min(s + 1, 4));
  };
  const prevStep = () => {
    sound?.playClick?.();
    setStep((s) => Math.max(s - 1, 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="w-full max-w-2xl bg-[#050505] border border-white/10 rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)] overflow-hidden relative p-8"
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,0.18),transparent_45%)]" />

      <div className="relative z-10 flex justify-between items-start mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl border border-white/10 bg-blue-600/10 border-blue-500/30">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-white font-bold text-xs tracking-[0.2em] text-blue-400">AI ARCHITECT // WIZARD</h2>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-1 w-6 rounded-full ${i <= step ? "bg-blue-500" : "bg-zinc-800"}`} />
              ))}
            </div>
          </div>
        </div>

        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="relative z-10 min-h-[260px] flex flex-col justify-center">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-light text-center text-white">¿Cuál es su visión de vida?</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { l: "URBAN PRIME", Icon: Building },
                { l: "NATURALEZA", Icon: Mountain },
                { l: "INVERSIÓN", Icon: Activity },
              ].map((m) => (
                <button
                  key={m.l}
                  onClick={nextStep}
                  className="group h-32 bg-zinc-900/40 border border-white/5 rounded-2xl hover:bg-blue-600 hover:border-blue-400 transition-all flex flex-col items-center justify-center gap-3"
                >
                  <m.Icon className="w-8 h-8 text-zinc-600 group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-bold text-zinc-500 group-hover:text-white tracking-[0.2em]">{m.l}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <h3 className="text-2xl font-light text-white">Defina su Capital Objetivo</h3>
            <div className="px-10 py-6">
              <input type="range" min="200" max="5000" className="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer accent-blue-500" />
              <div className="flex justify-between mt-4 font-mono text-blue-400 text-sm">
                <span>200k €</span>
                <span>5M+ €</span>
              </div>
            </div>
            <button onClick={nextStep} className="px-8 py-3 bg-white text-black font-bold text-xs tracking-widest rounded hover:scale-105 transition-transform">
              CONFIRMAR RANGO
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <h3 className="text-2xl font-light text-white">Detalles Esenciales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase text-zinc-500 block mb-3">Dormitorios</span>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, "4+"].map((n) => (
                    <button key={n} className="w-8 h-8 rounded bg-black border border-white/10 text-xs hover:border-blue-500 hover:text-blue-400">
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase text-zinc-500 block mb-3">Extras</span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Terraza", "Gym", "Piscina"].map((t) => (
                    <button key={t} className="px-2 py-1 rounded bg-black border border-white/10 text-[10px] hover:border-blue-500 hover:text-blue-400">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={nextStep} className="px-8 py-3 bg-blue-600 text-white font-bold text-xs tracking-widest rounded hover:bg-blue-500 transition-colors shadow-lg">
              INICIAR ANÁLISIS
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
              <div className="absolute inset-3 rounded-full border-r-2 border-purple-500 animate-spin duration-700" />
              <Sparkles className="absolute inset-0 m-auto text-white w-6 h-6 animate-pulse" />
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-mono text-sm tracking-widest mb-1 animate-pulse">ANALIZANDO MERCADO...</div>
              <div className="text-zinc-600 text-[10px] font-mono">PROCESANDO 14.032 PUNTOS DE DATA</div>
            </div>
            <button
              onClick={() => {
                sound?.playPing?.();
                onClose?.();
              }}
              className="mt-4 text-xs text-white/50 underline hover:text-white"
            >
              Ver Resultados (Simulación)
            </button>
          </div>
        )}

        {step > 1 && step < 4 && (
          <button onClick={prevStep} className="absolute bottom-0 left-0 p-2 text-zinc-500 hover:text-white">
            <ChevronLeft size={20} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ==============================
// 5) SMART FILTERS
// ==============================
const SmartFiltersPanel = ({ onClose, sound }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 30 }}
    className="w-full max-w-lg bg-[#080808] border border-white/10 rounded-3xl shadow-2xl p-8 relative"
  >
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-zinc-900 rounded-lg border border-white/5 text-white">
          <SlidersHorizontal size={18} />
        </div>
        <span className="text-xs font-bold tracking-[0.2em] text-white uppercase">Filtros Tácticos</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[9px] text-blue-400 font-mono bg-blue-900/20 px-2 py-1 rounded border border-blue-900/30">12 ACTIVOS</span>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-zinc-500 hover:text-white transition-colors" />
        </button>
      </div>
    </div>

    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between text-xs font-medium text-zinc-400">
          <span className="flex items-center gap-2">
            <DollarSign size={14} className="text-blue-500" /> PRESUPUESTO
          </span>
          <span className="text-white font-mono text-sm">2.5M €</span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden relative group cursor-pointer">
          <div className="absolute top-0 left-0 h-full w-[70%] bg-gradient-to-r from-zinc-600 to-white group-hover:from-blue-600 group-hover:to-cyan-400 transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.35)]" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-4">
        <button className="py-3 bg-white text-black text-[10px] font-bold tracking-widest rounded-lg shadow-lg hover:scale-105 transition-transform" onClick={() => sound?.playClick?.()}>
          TODO
        </button>
        <button className="py-3 bg-zinc-900 text-zinc-500 border border-white/5 hover:border-white/20 hover:text-white text-[10px] font-bold tracking-widest rounded-lg transition-all" onClick={() => sound?.playClick?.()}>
          CASA
        </button>
        <button className="py-3 bg-zinc-900 text-zinc-500 border border-white/5 hover:border-white/20 hover:text-white text-[10px] font-bold tracking-widest rounded-lg transition-all" onClick={() => sound?.playClick?.()}>
          PISO
        </button>
      </div>
    </div>
  </motion.div>
);

// ==============================
// 6) AUX: STATUS, PROFILE, VAULT, CHAT, DETAIL, FORM
// ==============================
export const StatusDeck = ({ notifications = [], clear, lang, setLang, soundEnabled, toggleSound }) => (
  <div className="absolute top-24 right-8 z-[92000] pointer-events-auto flex flex-col gap-3 items-end w-[300px]">
    <div className="bg-black/90 backdrop-blur-xl border border-blue-900/30 p-4 rounded-xl w-full shadow-2xl">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
        <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">SYSTEM STATUS</span>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={() => setLang?.(lang === "ES" ? "EN" : "ES")}>
          <span>LANGUAGE</span> <span className="font-mono text-blue-500">{lang}</span>
        </div>
        <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={toggleSound}>
          <span>AUDIO</span> <span className={soundEnabled ? "text-emerald-400" : "text-zinc-500"}>{soundEnabled ? "ON" : "OFF"}</span>
        </div>
      </div>

      {notifications?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          {notifications.map((n, i) => (
            <div key={i} className="mb-2 text-[10px] text-white/80 border-l-2 border-blue-500 pl-2">
              {n?.title || String(n)}
            </div>
          ))}
          <button onClick={clear} className="w-full mt-2 py-1 bg-red-900/20 text-red-400 text-[9px] uppercase rounded hover:bg-red-900/40">
            Clear Logs
          </button>
        </div>
      )}
    </div>
  </div>
);

export const ProfileDashboard = ({ onClose, sound }) => {
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [selectedServices, setSelectedServices] = useState([]);

  const SERVICES_DB = useMemo(
    () => [
      { id: "s1", name: "Global Network Syndication", price: 450, icon: Globe },
      { id: "s2", name: "Hyper-Targeted Ads", price: 200, icon: Target },
      { id: "s3", name: "Virtual Twin (Matterport)", price: 150, icon: Box },
      { id: "s4", name: "High-Conv Landing Page", price: 300, icon: Layers },
      { id: "s5", name: "Drone Cinematography", price: 400, icon: Zap },
      { id: "s6", name: "VIP Open House Experience", price: 800, icon: Music },
      { id: "s7", name: "Stratosfere Editorial", price: 150, icon: BookOpen },
    ],
    []
  );

  const toggleService = (id) => {
    sound?.playClick?.();
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const cartTotal = SERVICES_DB.filter((s) => selectedServices.includes(s.id)).reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="fixed inset-0 z-[96000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#050505] w-full max-w-5xl h-[85vh] rounded-[24px] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-50 text-white/30 hover:text-white p-2 transition-all">
          <X size={24} />
        </button>

        <div className="w-full md:w-64 bg-[#080808] border-r border-white/5 flex flex-col p-6">
          <div className="mb-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              SF
            </div>
            <div>
              <h2 className="text-white font-bold text-xs tracking-[0.2em]">STRATOSFERE</h2>
              <span className="text-[9px] text-white/40 font-mono">ENTERPRISE OS</span>
            </div>
          </div>

          <nav className="flex flex-col gap-2 flex-grow">
            {[
              { id: "OVERVIEW", icon: Activity, label: "DASHBOARD" },
              { id: "SERVICES", icon: Layers, label: "MARKETPLACE" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sound?.playClick?.();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[10px] font-bold tracking-widest transition-all ${
                  activeTab === tab.id ? "bg-white text-black" : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-grow p-10 overflow-y-auto bg-[#050505]">
          <div className="flex justify-between items-end mb-10 pb-6 border-b border-white/5">
            <div>
              <h1 className="text-4xl font-light text-white tracking-tighter mb-2">{activeTab === "OVERVIEW" ? "Dashboard" : "Marketplace"}</h1>
              <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.2em]">Nivel: PARTNER GOLD</p>
            </div>

            {activeTab === "SERVICES" && (
              <div className="text-right">
                <div className="text-[9px] text-white/40 font-mono uppercase">Total Inversión</div>
                <div className="text-3xl font-light text-cyan-400">€{cartTotal}</div>
              </div>
            )}
          </div>

          {activeTab === "OVERVIEW" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Market Share", value: "68%" },
                { label: "YoY Growth", value: "75%" },
                { label: "Balance", value: "€12.500" },
              ].map((s) => (
                <div key={s.label} className="bg-[#0f0f0f]/80 border border-white/5 rounded-2xl p-6">
                  <div className="text-[10px] text-white/40 uppercase tracking-[0.2em]">{s.label}</div>
                  <div className="text-3xl text-white font-light mt-2">{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "SERVICES" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICES_DB.map((service) => {
                const picked = selectedServices.includes(service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`p-5 rounded-xl border text-left transition-all duration-300 flex items-center justify-between ${
                      picked ? "bg-white/5 border-cyan-500/50" : "bg-[#0a0a0a] border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${picked ? "bg-cyan-500 text-black" : "bg-white/5 text-white/40"}`}>
                        <service.icon size={18} />
                      </div>
                      <div>
                        <div className={`text-sm ${picked ? "text-white" : "text-white/80"}`}>{service.name}</div>
                        <div className="text-[10px] text-white/40 font-mono mt-1">SERVICE ID: {service.id}</div>
                      </div>
                    </div>
                    <div className="font-mono text-white text-sm">€{service.price}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TheVault = ({ favorites = [], onClose, onFlyTo, sound }) => {
  const totalValue = favorites?.reduce((acc, curr) => acc + (Number(curr?.price) || 0), 0) || 0;
  return (
    <div className="fixed inset-0 z-[96000] bg-[#050505] flex flex-col">
      <div className="flex justify-between items-end p-12 border-b border-white/10 bg-black relative">
        <div>
          <h2 className="text-4xl font-light text-white tracking-[0.2em] uppercase mb-2">FAVORITOS</h2>
          <p className="text-xs font-mono text-white/40">{favorites?.length || 0} ACTIVOS</p>
        </div>
        <div className="text-right mr-12 hidden md:block">
          <span className="block text-[10px] text-white/40 font-mono tracking-wider uppercase">VALOR CARTERA</span>
          <span className="block text-5xl font-light tracking-tighter text-blue-600">
            €{new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(totalValue)}
          </span>
        </div>
        <button className="absolute top-8 right-8 p-3 bg-white/5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all" onClick={() => { sound?.playClick?.(); onClose?.(); }}>
          <X size={24} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-12 bg-[#080808] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {favorites?.map((fav) => (
          <div
            key={fav.id || fav.title}
            className="bg-[#111] border border-white/5 rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => {
              sound?.playDeploy?.();
              onFlyTo?.(fav.location);
              onClose?.();
            }}
          >
            <div className="h-48 bg-gray-800 relative">
              <img src={fav.image || LUXURY_IMAGES[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" alt="" />
            </div>
            <div className="p-4">
              <h3 className="text-white font-bold">{fav.title || "Activo"}</h3>
              <p className="text-white/50 text-xs">€{fav.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CommandCenterPanel = ({ property, onClose, onContactAgent, onToggleFavorite, isFavorite, sound }) => {
  if (!property) return null;
  return (
    <div className="fixed inset-y-0 right-0 w-[500px] max-w-[90vw] bg-[#050505] border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] z-[96000] flex flex-col">
      <div className="relative h-80 w-full shrink-0">
        <img src={property.image || LUXURY_IMAGES[0]} className="w-full h-full object-cover opacity-80" alt={property.title} />
        <button
          onClick={() => {
            sound?.playClick?.();
            onClose?.();
          }}
          className="absolute top-6 right-6 p-2 bg-black/50 rounded-full text-white/50 hover:text-white transition-all z-50"
        >
          <X size={20} />
        </button>

        <button
          onClick={() => {
            sound?.playPing?.();
            onToggleFavorite?.(property);
          }}
          className="absolute top-6 left-6 p-2 bg-black/50 rounded-full text-white/70 hover:text-white transition-all z-50"
          title="Favorito"
        >
          <Heart size={18} className={isFavorite ? "fill-current" : ""} />
        </button>
      </div>

      <div className="p-8">
        <h2 className="text-3xl text-white font-light mb-4">{property.title || "Propiedad"}</h2>
        <p className="text-white/60 mb-4">{property.description || "Propiedad exclusiva en zona prime."}</p>
        <p className="text-white/70 font-mono mb-6">€{property.price || property.precio || "—"}</p>

        <button
          onClick={() => {
            sound?.playDeploy?.();
            onContactAgent?.(property);
          }}
          className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded hover:bg-gray-200"
        >
          Contactar
        </button>
      </div>
    </div>
  );
};

export const ChatPanel = ({ onClose }) => (
  <div className="fixed bottom-28 right-8 w-80 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[96000]">
    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#111]">
      <span className="text-xs font-bold text-white">IA CONCIERGE</span>
      <button onClick={onClose}>
        <X size={14} className="text-white/50 hover:text-white" />
      </button>
    </div>
    <div className="h-64 p-4 text-white/50 text-xs flex items-center justify-center">Inicie una conversación...</div>
  </div>
);

export const PropertyCaptureForm = ({ onClose, sound }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    sound?.playClick?.();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[97000] bg-black/90 flex items-center justify-center backdrop-blur-md" onClick={onClose}>
      <div className="w-[600px] max-w-[92vw] bg-[#0a0a0a] border border-white/20 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,1)] p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white tracking-widest mb-8 border-b border-white/10 pb-4">SUBMIT ASSET</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-white/60">VALUATION (€)</label>
            <input type="number" className="w-full bg-white/5 border border-white/10 p-3 rounded text-white" placeholder="Ej: 1500000" />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/60">DESCRIPTION</label>
            <textarea className="w-full h-32 bg-white/5 border border-white/10 p-3 rounded text-white" placeholder="Detalles de la propiedad..." />
          </div>

          <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest rounded transition-all">UPLOAD TO NETWORK</button>
        </form>
      </div>
    </div>
  );
};

// ==============================
// 7) EXTRA EXPORTS (por si los usas desde AliveMap)
// ==============================
export const MapNanoCard = ({ props, onToggleFavorite, isFavorite, onClose, onOpenDetail, sound }) => {
  const tierColor = TIER_COLORS?.[props?.tier]?.hex || CORPORATE_BLUE;
  const tierGlow = TIER_COLORS?.[props?.tier]?.glow || `0 0 15px ${CORPORATE_BLUE}60`;
  const price = props?.price ?? props?.precio ?? "—";

  return (
    <div className="relative w-[320px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()} style={{ borderColor: `${tierColor}40` }}>
      <div className="relative h-44 w-full cursor-pointer overflow-hidden" onClick={() => onOpenDetail?.(props)}>
        <img src={props?.photoUrl || props?.image || LUXURY_IMAGES[0]} alt={props?.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />

        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded text-[9px] font-bold tracking-widest text-white uppercase flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tierColor, boxShadow: tierGlow }} />
          {props?.title || "Activo"}
        </div>

        <div className="absolute bottom-3 left-4">
          <span className="text-2xl font-light tracking-tight text-white">{price}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            sound?.playPing?.();
            onToggleFavorite?.(props);
          }}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-black/30 hover:bg-white/10 transition-colors"
          title="Favorito"
        >
          <Heart size={18} className={isFavorite ? "fill-current" : ""} style={isFavorite ? { color: tierColor } : { color: "white" }} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-white/10 text-white/60 hover:text-white transition-colors backdrop-blur-md z-50"
          title="Cerrar"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xs font-bold text-white mb-1">{props?.category || "Categoría"}</h3>
            <p className="text-[10px] text-white/50 font-mono">ID: {props?.id || "—"}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-white/70">{props?.rooms || "—"} hab • {props?.area || "—"} m²</span>
          </div>
        </div>

        <button
          className="w-full py-3 rounded-lg text-white text-[10px] font-bold tracking-wider transition-colors flex items-center justify-center gap-1 hover:opacity-90 shadow-lg"
          style={{ backgroundColor: tierColor, boxShadow: tierGlow }}
          onClick={() => {
            sound?.playDeploy?.();
            onOpenDetail?.(props);
          }}
        >
          VER DETALLES <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export const ViewControlDock = ({ onViewChange, currentView, sound }) => {
  const dockBase = "bg-[#080808]/95 backdrop-blur-xl border border-white/10 p-1.5 rounded-xl shadow-2xl flex flex-col gap-1.5 ring-1 ring-white/5";
  const btn = (active) =>
    active
      ? "w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 bg-[#2563eb] text-white shadow-[0_0_15px_rgba(37,99,235,0.6)] border border-blue-400/30"
      : "w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-transparent";

  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-6 z-[92000] flex flex-col gap-3 pointer-events-auto">
      <div className={dockBase}>
        <button onClick={() => { sound?.playClick?.(); onViewChange?.("3D"); }} className={btn(!!currentView?.is3D)} title="Modo 3D">
          <Box size={16} />
        </button>
        <button onClick={() => { sound?.playClick?.(); onViewChange?.("2D"); }} className={btn(!currentView?.is3D)} title="Modo 2D">
          <Square size={16} />
        </button>
      </div>
      <div className={dockBase}>
        <button onClick={() => { sound?.playClick?.(); onViewChange?.("MODE_DUSK"); }} className={btn(currentView?.mode === "dusk")} title="Modo Noche">
          <Moon size={16} />
        </button>
        <button onClick={() => { sound?.playClick?.(); onViewChange?.("MODE_DAWN"); }} className={btn(currentView?.mode === "dawn")} title="Modo Día">
          <Sun size={16} />
        </button>
      </div>
    </div>
  );
};

export const TopBar = ({ onGPS }) => (
  <div className="absolute top-0 left-0 right-0 z-[92000] px-8 py-6 flex justify-between items-start pointer-events-none">
    <div className="pointer-events-auto flex flex-col">
      <h1 className="text-2xl font-light tracking-[0.3em]" style={{ color: TEXT_COLOR }}>
        STRATOS<span className="font-bold" style={{ color: CORPORATE_BLUE }}>FERE</span>
      </h1>
    </div>
    <div className="pointer-events-auto">
      <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all" onClick={onGPS}>
        <Crosshair className="w-5 h-5" />
      </button>
    </div>
  </div>
);
// ✅ ALIASES para compatibilidad con AliveMap.tsx
// AliveMap importa: FilterPanel y OmniSearchDock desde './ui-panels'

export const FilterPanel = (props) => {
  const onClose =
    props?.onClose ||
    props?.close ||
    props?.onDismiss ||
    (() => {});

  return <SmartFiltersPanel {...props} onClose={onClose} />;
};

export const OmniSearchDock = ({
  onSearch,
  onToggleFilters,
  onToggleAI,
  onOpenProfile,
  onOpenVault,
  activePanel = "NONE", // "FILTERS" | "AI_PANEL" | "NONE"
}) => {
  return (
    <div className="pointer-events-auto w-full max-w-4xl mx-auto px-6">
      <div className="bg-black/80 backdrop-blur-2xl rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 flex items-center p-2 gap-3 ring-1 ring-white/5">
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
          onClick={() => onToggleFilters?.()}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${
            activePanel === "FILTERS" ? "bg-white text-black" : "bg-zinc-900/50 text-zinc-400"
          }`}
          title="Filtros"
        >
          <SlidersHorizontal className="w-6 h-6" />
        </button>

        <button
          onClick={() => onToggleAI?.()}
          className={`h-14 px-6 rounded-full flex items-center gap-3 transition-all ${
            activePanel === "AI_PANEL" ? "bg-blue-600 text-white" : "bg-zinc-900/50 text-zinc-400"
          }`}
          title="AI"
        >
          {activePanel === "AI_PANEL" ? <ChevronUp className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        </button>

        <button
          onClick={() => onOpenProfile?.()}
          className="h-14 w-14 rounded-full flex items-center justify-center bg-zinc-900/50 text-zinc-400"
          title="Perfil"
        >
          <User className="w-6 h-6" />
        </button>

        <button
          onClick={() => onOpenVault?.()}
          className="h-14 w-14 rounded-full flex items-center justify-center bg-zinc-900/50 text-zinc-400 hidden md:flex"
          title="Favoritos"
        >
          <Heart className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// ==============================
// 8) CONTROLADOR PRINCIPAL (UNIFICADO)
// ==============================
export default function UIPanels({
  onSearch,
  onToggleFavorite,
  favorites = [],
  onFlyTo,

  // opcionales (si tu app ya los tiene)
  lang = "ES",
  setLang = () => {},
  soundEnabled = true,
  toggleSound = () => {},
  sound,
}) {
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [systemMode, setSystemMode] = useState("GATEWAY"); // GATEWAY | EXPLORER | ARCHITECT
  const [activePanel, setActivePanel] = useState("NONE"); // NONE | AI_PANEL | FILTERS
  const [notifications, setNotifications] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeTab, setActiveTab] = useState(null); // profile | vault | chat | null
  const [showPropertyForm, setShowPropertyForm] = useState(false);

  const toggleAI = () => {
    sound?.playClick?.();
    setActivePanel((prev) => (prev === "AI_PANEL" ? "NONE" : "AI_PANEL"));
  };

  const toggleFilters = () => {
    sound?.playClick?.();
    setActivePanel((prev) => (prev === "FILTERS" ? "NONE" : "FILTERS"));
  };

  // 0) Gatekeeper (si no desbloqueado)
  if (!gateUnlocked) {
    return <Gatekeeper onUnlock={() => setGateUnlocked(true)} sound={sound} />;
  }

  return (
    // 👇 IMPORTANTÍSIMO: z-index alto para que el Wizard de 2 modos SIEMPRE se vea encima del mapa
    <div className="pointer-events-none fixed inset-0 z-[90000] flex flex-col justify-end pb-8 text-sans">
      <style
        dangerouslySetInnerHTML={{
          __html: `.mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right, .mapboxgl-ctrl-compass, .mapboxgl-ctrl-attrib { display: none !important; }`,
        }}
      />

      {/* 1) Gateway (los 2 botones) */}
      {systemMode === "GATEWAY" && <DualGateway onSelectMode={setSystemMode} sound={sound} />}

      {/* 2) Modo vendedor */}
      {systemMode === "ARCHITECT" && (
        <ArchitectHud
          sound={sound}
          onCloseMode={() => setSystemMode("GATEWAY")}
          onOpenForm={() => setShowPropertyForm(true)}
        />
      )}

      {/* 3) Modo explorador */}
      {systemMode === "EXPLORER" && (
        <>
          <StatusDeck
            notifications={notifications}
            clear={() => setNotifications([])}
            lang={lang}
            setLang={setLang}
            soundEnabled={soundEnabled}
            toggleSound={toggleSound}
          />

          {activeTab === "profile" && (
            <div className="pointer-events-auto">
              <ProfileDashboard onClose={() => setActiveTab(null)} sound={sound} />
            </div>
          )}

          {activeTab === "vault" && (
            <div className="pointer-events-auto">
              <TheVault favorites={favorites} onClose={() => setActiveTab(null)} onFlyTo={onFlyTo} sound={sound} />
            </div>
          )}

          {activeTab === "chat" && (
            <div className="pointer-events-auto">
              <ChatPanel onClose={() => setActiveTab(null)} />
            </div>
          )}

          {selectedProperty && (
            <div className="pointer-events-auto">
              <CommandCenterPanel
                property={selectedProperty}
                onClose={() => setSelectedProperty(null)}
                onToggleFavorite={(p) => onToggleFavorite?.(p)}
                isFavorite={favorites?.some((f) => f?.id === selectedProperty?.id)}
                sound={sound}
              />
            </div>
          )}

          {/* Zona panels (AI / Filters) */}
          <div className="pointer-events-auto w-full px-4 flex justify-center items-end mb-12 min-h-[420px]">
            <AnimatePresence mode="wait">
              {activePanel === "AI_PANEL" && <AIArchitectPanel onClose={() => setActivePanel("NONE")} sound={sound} />}
              {activePanel === "FILTERS" && <SmartFiltersPanel onClose={() => setActivePanel("NONE")} sound={sound} />}
            </AnimatePresence>
          </div>

          {/* OmniBar */}
          <div className="pointer-events-auto w-full max-w-4xl mx-auto px-6">
            <div className="bg-black/80 backdrop-blur-2xl rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 flex items-center p-2 gap-3 ring-1 ring-white/5 transition-all duration-300 hover:border-white/20">
              <div className="flex-1 flex items-center bg-zinc-900/50 rounded-full px-5 h-14 border border-white/5 hover:border-white/20 transition-all group focus-within:border-blue-500/50 focus-within:bg-black">
                <Search className="w-5 h-5 text-zinc-500 mr-3 group-hover:text-white transition-colors" />
                <input
                  type="text"
                  placeholder="Comando o ubicación..."
                  className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-zinc-600 font-light tracking-wide"
                  onKeyDown={(e) => e.key === "Enter" && onSearch?.(e.target.value)}
                />
              </div>

              <div className="w-px h-8 bg-white/10 mx-1" />

              <button
                onClick={toggleFilters}
                className={`h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                  activePanel === "FILTERS"
                    ? "bg-white text-black scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                    : "bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <SlidersHorizontal className="w-6 h-6" />
              </button>

              <button
                onClick={toggleAI}
                className={`h-14 px-6 rounded-full flex items-center gap-3 transition-all duration-300 ${
                  activePanel === "AI_PANEL"
                    ? "bg-blue-600 text-white scale-105 shadow-[0_0_30px_rgba(37,99,235,0.6)]"
                    : "bg-zinc-900/50 text-zinc-400 hover:text-blue-400 hover:bg-blue-900/20 hover:border-blue-500/30 border border-transparent"
                }`}
              >
                {activePanel === "AI_PANEL" ? <ChevronUp className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                {activePanel !== "AI_PANEL" && <span className="text-xs font-bold tracking-widest hidden md:block">AI</span>}
              </button>

              <button onClick={() => setActiveTab("profile")} className="h-14 w-14 rounded-full flex items-center justify-center bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                <User className="w-6 h-6" />
              </button>

              <button onClick={() => setActiveTab("vault")} className="h-14 w-14 rounded-full flex items-center justify-center bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all hidden md:flex">
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Change mode */}
          <div className="fixed bottom-[30px] left-[70px] z-[92000] pointer-events-auto">
            <button
              onClick={() => {
                sound?.playClick?.();
                setSystemMode("GATEWAY");
              }}
              className="group flex items-center gap-3 px-5 py-2.5 bg-black/90 backdrop-blur-xl border border-white/10 hover:border-white/30 rounded-full shadow-2xl transition-all hover:scale-105"
            >
              <Navigation size={14} className="group-hover:-rotate-45 transition-transform text-white/70 group-hover:text-white" />
              <span className="text-[11px] font-mono font-medium tracking-[0.15em] text-white/90 group-hover:text-white">CHANGE MODE</span>
            </button>
          </div>
        </>
      )}

      {/* Form vendedor */}
      {showPropertyForm && (
        <div className="pointer-events-auto">
          <PropertyCaptureForm onClose={() => setShowPropertyForm(false)} sound={sound} />
        </div>
      )}
    </div>
  );
}




