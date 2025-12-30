"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// --- INTERFAZ CORRECTA PARA EL SLIDER ---
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

  const getPercent = useCallback(
    (v: number) => Math.round(((v - min) / (max - min)) * 100),
    [min, max]
  );

  useEffect(() => {
    setMinVal(value.min);
    setMaxVal(value.max);
  }, [value, min, max]);

  useEffect(() => {
    if (range.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(maxVal);
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, maxVal, getPercent]);

  return (
    <div className="relative w-full pt-8 pb-2 select-none group">
      
      {/* ETIQUETAS */}
      <div className="absolute top-0 left-0 text-[10px] font-bold text-gray-400 font-mono tracking-tight transition-all">
        {formatLabel(minVal)}
      </div>
      <div className="absolute top-0 right-0 text-[10px] font-bold text-gray-400 font-mono tracking-tight transition-all">
        {formatLabel(maxVal)}
      </div>

      {/* BARRA */}
      <div className="relative h-2 w-full mt-1">
        <div className="absolute w-full h-1.5 bg-gray-700/50 rounded-full z-0 backdrop-blur-sm"></div>
        <div ref={range} className="absolute h-1.5 bg-[#0A84FF] rounded-full z-10 shadow-[0_0_10px_rgba(10,132,255,0.5)]"></div>

        {/* INPUTS INVISIBLES */}
        <input
          type="range" min={min} max={max} step={step} value={minVal}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), maxVal - step);
            setMinVal(v); onChange({ min: v, max: maxVal });
          }}
          className="thumb thumb--left z-[30]"
        />
        <input
          type="range" min={min} max={max} step={step} value={maxVal}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), minVal + step);
            setMaxVal(v); onChange({ min: minVal, max: v });
          }}
          className="thumb thumb--right z-[40]"
        />
      </div>

      <style jsx>{`
        .thumb {
          -webkit-appearance: none; pointer-events: none;
          position: absolute; height: 0; width: 100%; outline: none;
        }
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none; pointer-events: all;
          background-color: white; border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.5);
          cursor: grab; height: 20px; width: 20px; margin-top: 1px;
          transition: transform 0.1s;
        }
        .thumb::-webkit-slider-thumb:active { transform: scale(1.1); cursor: grabbing; }
      `}</style>
    </div>
  );
}

