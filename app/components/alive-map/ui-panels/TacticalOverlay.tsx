"use client";

import React, { useState } from "react";
import { X, Home, Briefcase, Map as MapIcon } from "lucide-react";
// Asegúrese de que DualSlider.tsx está en la misma carpeta (ui-panels)
import DualSlider from "./DualSlider"; 

interface TacticalOverlayProps {
  onClose: () => void;
  onApply: (filters: any) => void;
}

export default function TacticalOverlay({ onClose, onApply }: TacticalOverlayProps) {
  
  // ESTADO TÁCTICO
  const [activeTab, setActiveTab] = useState<'VIVIENDA' | 'NEGOCIO' | 'SUELO'>('VIVIENDA');
  
  // Rangos (0-100 para los sliders)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [surfaceRange, setSurfaceRange] = useState({ min: 0, max: 100 });

  // --- 1. MATEMÁTICA DE PRECIO (0€ a Infinito) ---
  const getPriceValue = (pos: number) => {
      if (pos >= 100) return 10000000; // Valor de cálculo (10M)
      if (pos <= 0) return 0;

      // FASE 1: 0% a 50% -> De 0€ a 1M€
      if (pos <= 50) return Math.round(pos * 20000);
      
      // FASE 2: 50% a 100% -> De 1M€ a 6M€
      return 1000000 + Math.round((pos - 50) * 100000);
  };

  const formatPrice = (val: number) => {
      // Detección visual de infinito
      if (val >= 6000000) return "+ 6M €";
      if (val === 0) return "0 €";

      if (val >= 1000000) {
          return `${(val / 1000000).toFixed(1).replace('.0','')}M €`;
      }
      return `${Math.round(val / 1000)}k €`;
  };

  // --- 2. MATEMÁTICA DE SUPERFICIE (Geometría Variable) ---
  const getSurfaceValue = (pos: number) => {
      if (pos <= 0) return 0;
      
      // A. SUELO (Masivo: 0 a 100.000 m²)
      if (activeTab === 'SUELO') {
          if (pos >= 100) return 100000;
          return Math.round(pos * 1000);
      }
      // B. PRO (Industrial: 0 a 5.000 m²)
      if (activeTab === 'NEGOCIO') {
          if (pos >= 100) return 5000;
          return Math.round(pos * 50);
      }
      // C. VIVIENDA (Residencial: 0 a 1.000 m²)
      if (pos >= 100) return 1000;
      return Math.round(pos * 10);
  };

  const formatSurface = (val: number) => {
      if (val === 0) return "0 m²";
      
      // Topes Visuales
      if (activeTab === 'SUELO' && val >= 100000) return "+ 10 Ha";
      if (activeTab === 'NEGOCIO' && val >= 5000) return "+ 5.000 m²";
      if (activeTab === 'VIVIENDA' && val >= 1000) return "+ 1.000 m²";

      // Formato Hectáreas
      if (activeTab === 'SUELO' && val >= 10000) {
          return `${(val / 10000).toFixed(1)} Ha`;
      }
      
      return `${val.toLocaleString('es-ES')} m²`;
  };

  // --- 3. DETONADOR (Conexión Directa con el Mapa) ---
  const handleLaunch = () => {
      // Convertimos los sliders (0-100) a valores reales
      const realPriceMin = getPriceValue(priceRange.min);
      // Si está al 100%, tope infinito (100M)
      const realPriceMax = priceRange.max >= 100 ? 100000000 : getPriceValue(priceRange.max);
      
      const realSurfaceMin = getSurfaceValue(surfaceRange.min);
      // Si está al 100%, tope infinito (100 Ha)
      const realSurfaceMax = surfaceRange.max >= 100 ? 1000000 : getSurfaceValue(surfaceRange.max);

      // ¡FUEGO! Enviamos la orden global
      if (typeof window !== 'undefined') {
          console.log("🚀 LANZANDO ORDEN DE FILTRADO AL MAPA...");
          window.dispatchEvent(new CustomEvent('apply-filter-signal', {
              detail: { 
                  context: activeTab, // 'VIVIENDA', 'NEGOCIO', 'SUELO'
                  priceRange: { min: realPriceMin, max: realPriceMax },
                  surfaceRange: { min: realSurfaceMin, max: realSurfaceMax }
              }
          }));
      }

      // Cerrar panel
      onClose();
  };

  const handleClean = () => {
      setPriceRange({ min: 0, max: 100 });
      setSurfaceRange({ min: 0, max: 100 });
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] bg-[#1c1c1e]/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/10 p-6 z-[9000] animate-fade-in-up font-sans select-none">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Filtros Tácticos</span>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
            <X size={14} className="text-white" />
        </button>
      </div>

      {/* PESTAÑAS (VIVIENDA / PRO / SUELO) */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-black/30 rounded-2xl mb-8">
          {['VIVIENDA', 'NEGOCIO', 'SUELO'].map((tab) => (
            <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2.5 rounded-xl flex flex-col items-center transition-all duration-300 ${activeTab === tab ? 'bg-[#0A84FF] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
                {tab === 'VIVIENDA' && <Home size={16} className="mb-0.5" />}
                {tab === 'NEGOCIO' && <Briefcase size={16} className="mb-0.5" />}
                {tab === 'SUELO' && <MapIcon size={16} className="mb-0.5" />}
                <span className="text-[9px] font-bold uppercase tracking-wider">
                    {tab === 'VIVIENDA' ? 'Vivir' : tab === 'NEGOCIO' ? 'Pro' : 'Suelo'}
                </span>
            </button>
          ))}
      </div>

      {/* SLIDERS (PRECIO Y SUPERFICIE) */}
      <div className="space-y-10 mb-8 px-1">
          <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Presupuesto</span>
              <DualSlider 
                  min={0} max={100} 
                  value={priceRange} 
                  onChange={setPriceRange}
                  formatLabel={(v: number) => formatPrice(getPriceValue(v))}
              />
          </div>
          <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Superficie</span>
              <DualSlider 
                  min={0} max={100} 
                  value={surfaceRange} 
                  onChange={setSurfaceRange}
                  formatLabel={(v: number) => formatSurface(getSurfaceValue(v))}
              />
          </div>
      </div>

      {/* BOTONES ACCIÓN */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
          <button 
            onClick={handleClean}
            className="py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-colors"
          >
              Limpiar
          </button>
          {/* 🔥 ESTE ES EL BOTÓN QUE DISPARA EL DETONADOR */}
          <button 
            onClick={handleLaunch}
            className="py-3.5 rounded-2xl bg-[#0A84FF] hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-colors"
          >
              Aplicar Radar
          </button>
      </div>

    </div>
  );
}

