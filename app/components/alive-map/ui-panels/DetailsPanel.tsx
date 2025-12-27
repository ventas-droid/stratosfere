"use client";
import React, { useState, useEffect } from 'react';
import { 
    X, Heart, Share2, MapPin, Ruler, Bed, Bath, Sparkles, 
    TrendingUp, Phone, CheckCircle2, Camera, Zap, Globe, Newspaper, 
    Shield, ShieldCheck, MessageCircle, Star, Maximize2,
    LayoutGrid, FileText, Box, Droplets, Award, Crown, Hammer, Mail, 
    Smartphone, Truck, Paintbrush, FileCheck, Activity
} from 'lucide-react';


// --- DICCIONARIO DE ICONOS (Traductor ID -> Icono Visual) ---
const ICON_MAP: Record<string, any> = {
    'pack_basic': Star, 'pack_pro': Award, 'pack_elite': Crown, 'pack_investor': TrendingUp, 'pack_express': Zap,
    'foto': Camera, 'video': Globe, 'drone': Globe, 'tour3d': Box, 'destacado': TrendingUp, 
    'ads': Share2, 'web': Smartphone, 'render': Hammer, 'plano_2d': Ruler, 'plano_3d': Box,
    'email': Mail, 'copy': FileText, 'certificado': FileText, 'cedula': FileText, 'nota_simple': Shield,
    'tasacion': TrendingUp, 'lona': LayoutGrid, 'buzoneo': MapPin, 'revista': Newspaper, 
    'openhouse': Zap, 'homestaging': Box, 'limpieza': Droplets, 'pintura': Paintbrush, 
    'mudanza': Truck, 'seguro': ShieldCheck
};

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

    // 1. FOTO Y FAVORITOS
    const currentImageSrc = selectedProp.img || selectedProp.images?.[0] || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3";
    const isFavorite = favorites.some((f: any) => f.id === selectedProp.id);
    
    // 2. LÓGICA DE SERVICIOS REALES (El cerebro visual)
    const activeServices = selectedProp.selectedServices && selectedProp.selectedServices.length > 0 
        ? selectedProp.selectedServices.map((id: string) => ({
            id,
            icon: ICON_MAP[id] || Sparkles, // Si falla, pone estrellita
            label: id.replace('pack_', '').replace('_', ' ').toUpperCase(),
            color: id.startsWith('pack') ? "text-purple-600" : "text-blue-600",
            bg: "bg-white"
          }))
        : [ // DUMMY DATA (Solo si no es propiedad tuya)
            {icon:Camera, label:"PRO PHOTO", color:"text-purple-600", bg:"bg-white"},
            {icon:Zap, label:"BOOST", color:"text-blue-600", bg:"bg-white"},
            {icon:Globe, label:"GLOBAL", color:"text-indigo-600", bg:"bg-white"},
            {icon:Shield, label:"VERIFIED", color:"text-emerald-600", bg:"bg-white"} 
        ];
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

           {/* 2. SPECS REALES (CORREGIDO) */}
<div className="flex justify-between gap-3">
    <div className="flex-1 bg-white p-3 rounded-[24px] flex flex-col items-center justify-center shadow-sm border border-white/50">
        <span className="text-[9px] text-slate-400 font-bold uppercase">Dormitorios</span>
        <span className="text-lg font-black flex gap-1">
            <Bed size={16} className="text-slate-300"/> {selectedProp.rooms || 0}
        </span>
    </div>
    <div className="flex-1 bg-white p-3 rounded-[24px] flex flex-col items-center justify-center shadow-sm border border-white/50">
        <span className="text-[9px] text-slate-400 font-bold uppercase">Baños</span>
        <span className="text-lg font-black flex gap-1">
            <Bath size={16} className="text-slate-300"/> {selectedProp.baths || 0}
        </span>
    </div>
    <div className="flex-1 bg-white p-3 rounded-[24px] flex flex-col items-center justify-center shadow-sm border border-white/50">
        <span className="text-[9px] text-slate-400 font-bold uppercase">Sup.</span>
        <span className="text-lg font-black flex gap-1">
            <Maximize2 size={16} className="text-slate-300"/> {selectedProp.m2 || selectedProp.mBuilt || 0}
        </span>
    </div>
</div>

{/* 🔥 NARRATIVA (DESCRIPCIÓN) - INSERTAR AQUÍ */}
            {(selectedProp.description || selectedProp.title) && (
                <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white/50 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Sobre este activo</span>
                        {/* Etiqueta decorativa */}
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold border border-blue-100">
                            IA INDEXED
                        </span>
                    </div>

                    {/* Título */}
                    {selectedProp.title && (
                        <h3 className="font-bold text-slate-900 mb-2 text-base leading-tight">
                            {selectedProp.title}
                        </h3>
                    )}

                    {/* Descripción */}
                    {selectedProp.description && (
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                            {selectedProp.description}
                        </p>
                    )}
                </div>
            )}

{/* 🔥 BLOQUE CERTIFICADO ENERGÉTICO (ESTILO COMPETENCIA) */}
            <div className="mt-4 mb-6">
                 {/* CASO 1: EN TRÁMITE */}
                 {selectedProp.energyPending && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-gray-600 uppercase">Certificado Energético: <span className="text-gray-900">En trámite</span></span>
                    </div>
                 )}

                 {/* CASO 2: TIENE LETRAS (DOBLE SELLO) */}
                 {!selectedProp.energyPending && (selectedProp.energyConsumption || selectedProp.energyEmissions) && (
                    <div className="flex gap-3">
                        {/* CONSUMO */}
                        {selectedProp.energyConsumption && (
                             <div className="flex-1 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Consumo</span>
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm ${getEnergyColorClass(selectedProp.energyConsumption)}`}>
                                    {selectedProp.energyConsumption}
                                </span>
                             </div>
                        )}
                        {/* EMISIONES */}
                        {selectedProp.energyEmissions && (
                             <div className="flex-1 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Emisiones</span>
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm ${getEnergyColorClass(selectedProp.energyEmissions)}`}>
                                    {selectedProp.energyEmissions}
                                </span>
                             </div>
                        )}
                    </div>
                 )}
            </div>

          {/* 4. BLOQUE DE INTELIGENCIA Y SERVICIOS */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white/50 mb-6">
                
                {/* Cabecera Inteligencia */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                        <TrendingUp size={16} className="text-blue-600"/> Inteligencia
                    </span>
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold border border-green-200">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div> LIVE
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="flex justify-between text-center mb-6 px-2">
                    <div>
                        <div className="text-2xl font-black text-slate-900">120</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Visitas</div>
                    </div>
                    <div className="w-[1px] bg-slate-100"></div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">5</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Guardados</div>
                    </div>
                    <div className="w-[1px] bg-slate-100"></div>
                    <div>
                        <div className="text-2xl font-black text-blue-600">Alta</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Demanda</div>
                    </div>
                </div>

                {/* Grid de Servicios */}
                {/* Grid de Servicios REAL */}
<div className="bg-[#F2F2F7] rounded-[24px] p-4">
    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center mb-4">Servicios Activos</p>
    <div className="grid grid-cols-3 gap-y-6 gap-x-2">
        {activeServices.map((item: any, i: number) => (
            <div key={i} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${item.bg} ${item.color}`}>
                    <item.icon size={16} />
                </div>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide text-center w-full truncate px-1">
                    {item.label}
                </span>
            </div>
        ))}
    </div>
</div>
            </div>

            {/* 5. TARJETA DE AGENTE (GAMIFICADA) */}
            <div className="bg-white rounded-[24px] p-4 pr-6 shadow-sm border border-gray-100 flex items-center gap-4 mb-8">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 to-yellow-600">
                     <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover rounded-full border-2 border-white" alt="Agente"/>
                </div>
                
                {/* Info */}
                <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1">
                        Agente Senior <span className="text-yellow-500">★</span>
                    </div>
                    <div className="text-xs text-slate-500 font-bold flex items-center gap-1">
                        Stratosfere Partners <CheckCircle2 size={10} className="text-blue-500"/>
                    </div>
                </div>

                {/* Insignia ELITE (Ahora usa ShieldCheck correctamente) */}
                <div className="ml-auto">
                    <div className="bg-black text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                        <ShieldCheck size={10} className="text-yellow-400"/> ELITE
                    </div>
                </div>
            </div>

            {/* SEPARADOR FINAL */}
            <hr className="border-slate-200 mb-6" />

            {/* 🔥 6. BOTONES DE ACCIÓN (VARIABLES CORREGIDAS: isFavorite) */}
            <div className="flex gap-3 pb-8">
                <button className="flex-1 py-4 bg-[#1c1c1e] text-white rounded-[24px] font-bold text-sm shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all cursor-pointer group active:scale-95">
                    <Phone size={18} className="group-hover:animate-pulse"/> Contactar
                </button>
                <button 
                    onClick={() => onToggleFavorite && onToggleFavorite(selectedProp)}
                    className={`w-20 rounded-[24px] flex items-center justify-center transition-all cursor-pointer shadow-sm border border-gray-100 ${isFavorite ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-slate-400'}`}
                >
                    <Heart size={22} fill={isFavorite ? "currentColor" : "none"}/>
                </button>
            </div>
            
            {/* Espacio extra */}
            <div className="h-12"></div>

        </div>
      </div>
    </div>
    );
}

// Helper de colores (MANTENER SIEMPRE AL FINAL)
const getEnergyColorClass = (rating: string) => {
    const colors: any = {
        'A': 'bg-green-600', 'B': 'bg-green-500', 'C': 'bg-green-400',
        'D': 'bg-yellow-400', 'E': 'bg-yellow-500', 'F': 'bg-orange-500', 'G': 'bg-red-600'
    };
    return colors[rating] || 'bg-gray-400';
};

