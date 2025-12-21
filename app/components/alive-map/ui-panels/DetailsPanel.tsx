"use client";
import React, { useState, useEffect } from 'react';
import { 
  X, Heart, Phone, Maximize2, Bed, Bath, TrendingUp, 
  Camera, Zap, Globe, Newspaper, Share2, Shield, Star, CheckCircle2 
} from 'lucide-react';

export default function DetailsPanel({ 
  selectedProp, 
  onClose, 
  onToggleFavorite, 
  favorites = [], 
  soundEnabled, 
  playSynthSound, 
  onOpenInspector 
}: any) {
    
    if (!selectedProp) return null;

    // FOTOS DE RESPALDO
    const currentImageSrc = selectedProp.img || selectedProp.images?.[0] || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3";
    const isFavorite = favorites.some((f: any) => f.id === selectedProp.id);
    
    // Generar datos aleatorios fijos basados en el precio para que siempre haya estadísticas
    const seed = selectedProp.price || 99999; 

    return (
    <div className="fixed inset-y-0 left-0 w-full md:w-[480px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left">
      
      {/* FONDO CRISTAL "APPLE GLASS" */}
      <div className="absolute inset-0 bg-[#E5E5EA]/90 backdrop-blur-3xl shadow-[20px_0_40px_rgba(0,0,0,0.2)] border-r border-white/20"></div>
      
      <div className="relative z-10 flex flex-col h-full text-slate-900">
        
        {/* HEADER */}
        <div className="px-8 pt-10 pb-2 flex justify-between items-start shrink-0">
            <div>
                <div className="flex gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {selectedProp.type || "PREMIUM"}
                    </span>
                    <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> TOP
                    </span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 leading-none mb-1">
                    {selectedProp.title || "Activo Exclusivo"}
                </h2>
                <p className="text-xl font-bold text-slate-500">
                    {selectedProp.formattedPrice || "2.1M €"}
                </p>
            </div>
            <button 
                onClick={onClose} 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-500 hover:scale-110 transition-transform cursor-pointer"
            >
                <X size={20} />
            </button>
        </div>

        {/* SCROLLABLE - AQUI ESTÁN LOS DATOS QUE FALTABAN */}
        <div className="flex-1 overflow-y-auto px-6 pb-48 pt-4 space-y-6 scrollbar-hide">
            
            {/* 1. FOTO PRINCIPAL CON EFECTO "ALIVE" (Zoom Lento) */}
            <div 
                onClick={onOpenInspector}
                className="relative aspect-[4/3] w-full bg-black rounded-[32px] overflow-hidden shadow-2xl cursor-pointer group"
            >
                <img 
                    src={currentImageSrc} 
                    className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110" 
                    alt="Casa" 
                />
                
                {/* Capa de brillo sutil al pasar el ratón */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-700"></div>

                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Maximize2 size={20} />
                </div>
            </div>

            {/* 2. SPECS (Camas, Baños...) */}
            <div className="flex justify-between gap-3">
                <div className="flex-1 bg-white p-3 rounded-[24px] flex flex-col items-center justify-center shadow-sm border border-white/50">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Dormitorios</span>
                    <span className="text-lg font-black flex gap-1"><Bed size={16} className="text-slate-300"/> 4</span>
                </div>
                <div className="flex-1 bg-white p-3 rounded-[24px] flex flex-col items-center justify-center shadow-sm border border-white/50">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Baños</span>
                    <span className="text-lg font-black flex gap-1"><Bath size={16} className="text-slate-300"/> 3</span>
                </div>
                <div className="flex-1 bg-white p-3 rounded-[24px] flex flex-col items-center justify-center shadow-sm border border-white/50">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Sup.</span>
                    <span className="text-lg font-black flex gap-1"><Maximize2 size={16} className="text-slate-300"/> 280</span>
                </div>
            </div>

            {/* 3. BOTONES DE ACCIÓN */}
            <div className="flex gap-3">
                <button className="flex-1 py-4 bg-[#1c1c1e] text-white rounded-[24px] font-bold text-sm shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all cursor-pointer">
                    <Phone size={18}/> Contactar
                </button>
                <button 
                    onClick={() => onToggleFavorite(selectedProp)}
                    className={`w-16 rounded-[24px] flex items-center justify-center transition-all cursor-pointer shadow-sm ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-white text-slate-400'}`}
                >
                    <Heart size={22} fill={isFavorite ? "currentColor" : "none"}/>
                </button>
            </div>

            {/* SEPARADOR */}
            <hr className="border-slate-300/50" />

            {/* 4. TARJETA DE IMPACTO Y SERVICIOS (LOS ICONOS QUE FALTABAN) */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50">
                
                {/* Cabecera Inteligencia */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                        <TrendingUp size={16} className="text-blue-600"/> Inteligencia
                    </span>
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold border border-green-200">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div> LIVE
                    </div>
                </div>

                {/* Estadísticas de Visitas */}
                <div className="flex justify-between text-center mb-6 px-2">
                    <div>
                        <div className="text-2xl font-black text-slate-900">{(seed % 500) + 120}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Visitas</div>
                    </div>
                    <div className="w-[1px] bg-slate-100"></div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">{(seed % 50) + 5}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Guardados</div>
                    </div>
                    <div className="w-[1px] bg-slate-100"></div>
                    <div>
                        <div className="text-2xl font-black text-blue-600">Alta</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Demanda</div>
                    </div>
                </div>

                {/* --- AQUÍ ESTÁN LOS ICONOS DE SERVICIOS QUE RECUERDA --- */}
                <div className="bg-[#F2F2F7] rounded-[24px] p-4">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center mb-4">Servicios Activos</p>
                    <div className="grid grid-cols-3 gap-y-6 gap-x-2">
                        {[ 
                            {icon:Camera, label:"Pro Photo", color:"text-purple-600", bg:"bg-white"},
                            {icon:Zap, label:"Boost", color:"text-blue-600", bg:"bg-white"},
                            {icon:Globe, label:"Global", color:"text-indigo-600", bg:"bg-white"},
                            {icon:Newspaper, label:"Offline", color:"text-slate-500", bg:"bg-slate-200"},
                            {icon:Share2, label:"Social", color:"text-pink-600", bg:"bg-white"},
                            {icon:Shield, label:"Verified", color:"text-emerald-600", bg:"bg-white"} 
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${item.bg} ${item.color}`}>
                                    <item.icon size={16} />
                                </div>
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5. TARJETA DE AGENTE */}
            <div className="bg-white rounded-[24px] p-3 pr-6 shadow-sm border border-white/50 flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-slate-200 rounded-[18px] overflow-hidden">
                     <img src={`https://randomuser.me/api/portraits/men/${(seed % 10) + 1}.jpg`} className="w-full h-full object-cover" alt="Agente"/>
                </div>
                <div>
                    <div className="font-bold text-slate-900 text-sm">Agente Senior</div>
                    <div className="text-xs text-slate-500 font-bold flex items-center gap-1">
                        Stratosfere Partners <CheckCircle2 size={10} className="text-blue-500"/>
                    </div>
                </div>
                <div className="ml-auto w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200 cursor-pointer hover:scale-110 transition-transform">
                    <Phone size={14} fill="currentColor"/>
                </div>
            </div>

        </div>
      </div>
    </div>
    );
}


