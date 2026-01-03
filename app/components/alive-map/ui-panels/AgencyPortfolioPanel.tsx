// @ts-nocheck
"use client";

import React from "react";
import { X, Plus, Home, Edit3, Trash2, Eye } from "lucide-react";

// MOCK DATA: Propiedades que gestiona la agencia
const MY_PROPS = [
    { id: 1, title: "Penthouse Salamanca Royal", price: "5.200.000€", img: "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=400&q=80", status: "ACTIVO" },
    { id: 2, title: "Villa Explanada", price: "1.850.000€", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80", status: "RESERVADO" },
    { id: 3, title: "Loft Industrial Centro", price: "450.000€", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80", status: "ACTIVO" },
];

export default function AgencyPortfolioPanel({ isOpen, onClose, onEditProperty, onCreateNew }: any) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-[420px] z-[50000] bg-[#F5F5F7]/95 backdrop-blur-2xl border-l border-black/5 flex flex-col shadow-2xl animate-slide-in-right font-sans pointer-events-auto">
      
      {/* HEADER */}
      <div className="p-6 border-b border-black/5 bg-white/50 flex justify-between items-center">
          <div>
              <h2 className="text-xl font-extrabold text-black tracking-tighter">MI STOCK</h2>
              <div className="text-[10px] font-bold text-black/40 mt-1 uppercase tracking-widest">Cartera de Activos</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-black/5 hover:bg-black/10 text-black/60"><X size={18}/></button>
      </div>

      {/* LISTA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* BOTÓN CREAR (Lanza ArchitectHud) */}
          <button 
              onClick={onCreateNew}
              className="w-full py-4 rounded-[20px] border-2 border-dashed border-black/10 bg-white/50 text-black/40 font-bold text-xs tracking-widest hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 mb-6"
          >
              <Plus size={16}/> REGISTRAR NUEVA PROPIEDAD
          </button>

          {/* TARJETAS DE PROPIEDAD */}
          {MY_PROPS.map(p => (
              <div key={p.id} className="bg-white p-3 rounded-[24px] border border-black/5 shadow-sm hover:shadow-md transition-all flex gap-4 group">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
                      <img src={p.img} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center">
                          <Eye className="text-white" size={16}/>
                      </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                      <div className="text-[9px] font-bold text-black/40 uppercase tracking-widest mb-1">{p.status}</div>
                      <h3 className="text-sm font-extrabold text-black leading-tight mb-1">{p.title}</h3>
                      <div className="text-emerald-600 font-bold text-xs">{p.price}</div>
                  </div>
                  <div className="flex flex-col justify-between items-end py-1">
                      <button 
                        onClick={() => onEditProperty(p)} 
                        className="p-2 rounded-full hover:bg-black/5 text-black/40 hover:text-blue-500 transition-colors" title="Editar en Architect"
                      >
                          <Edit3 size={16}/>
                      </button>
                      <button className="p-2 rounded-full hover:bg-red-50 text-black/40 hover:text-red-500 transition-colors">
                          <Trash2 size={16}/>
                      </button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}