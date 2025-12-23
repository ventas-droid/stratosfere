"use client";

import React, { useState, useEffect, useRef } from "react";

// 1. TIPADO CORRECTO (Para evitar errores rojos)
interface DualSliderProps {
  min: number;
  max: number;
  step?: number;
  value: { min: number; max: number };
  onChange: (values: { min: number; max: number }) => void;
  formatLabel: (value: number) => string;
}

export default function DualSlider({ 
  min, 
  max, 
  step = 1, 
  value, 
  onChange, 
  formatLabel 
}: DualSliderProps) {
  
  const [minVal, setMinVal] = useState(value.min);
  const [maxVal, setMaxVal] = useState(value.max);
  const range = useRef<HTMLDivElement>(null);

  // 2. FUNCIÓN CON FRENO (Para que la barra azul no se salga a la derecha)
  const getPercent = (v: number) => {
    const percent = ((v - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, Math.round(percent))); 
  };

  // Sincronizar cambios externos (Botón Limpiar)
  useEffect(() => {
    setMinVal(value.min);
    setMaxVal(value.max);
  }, [value]);

  // Actualizar barra visual
  useEffect(() => {
    if (range.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(maxVal);
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, maxVal, min, max]);

  return (
    // 3. AQUÍ ESTÁ EL ARREGLO VISUAL: "mt-6"
    // Añadimos margin-top (mt-6) para bajar la barra y dar espacio a los números de arriba
    <div className="relative w-full h-6 flex items-center mt-6 select-none">
      
      {/* Etiquetas Flotantes */}
      <div className="absolute -top-6 left-0 text-[9px] font-bold text-slate-400 tracking-wider">
        {formatLabel(minVal)}
      </div>
      <div className="absolute -top-6 right-0 text-[9px] font-bold text-slate-400 tracking-wider">
        {formatLabel(maxVal)}
      </div>

      {/* Barra Fondo (Gris suave) */}
      <div className="absolute w-full h-1 bg-white/20 rounded-lg z-0"></div>

      {/* Barra Relleno (Azul Stratos) */}
      <div 
        ref={range} 
        className="absolute h-1 bg-[#0071e3] rounded-lg z-10 shadow-[0_0_10px_rgba(0,113,227,0.4)]"
      ></div>

      {/* Input Izquierdo (Invisible pero funcional) */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={(e) => {
          const v = Math.min(Number(e.target.value), maxVal - step);
          setMinVal(v);
          onChange({ min: v, max: maxVal });
        }}
        className="absolute w-full h-1 appearance-none bg-transparent z-20 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
      />

      {/* Input Derecho (Invisible pero funcional) */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={(e) => {
          const v = Math.max(Number(e.target.value), minVal + step);
          setMaxVal(v);
          onChange({ min: minVal, max: v });
        }}
        className="absolute w-full h-1 appearance-none bg-transparent z-30 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
      />
    </div>
  );
}

