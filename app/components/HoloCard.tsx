"use client";

import React, { useState } from 'react';
import { X, Shield, Star, Zap, Fingerprint, MapPin, Maximize2, Minimize2, Camera } from 'lucide-react';

interface HoloCardProps {
  data: any;
  onClose: () => void;
}

const HoloCard = ({ data, onClose }: HoloCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false); // Estado para saber si está expandido

  if (!data) return null;

  const accentColor = data.type === 'live' ? '#fbbf24' : data.color;

  // IMÁGENES SIMULADAS (En el futuro vendrán de tu base de datos)
  const GALLERY_IMAGES = [
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600607687644-c7f32e857594?auto=format&fit=crop&w=800&q=80"
  ];

  return (
    <div 
      className={`fixed right-0 top-0 h-full bg-black/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-50 transition-all duration-500 ease-out font-mono flex flex-col ${
        isExpanded ? 'w-[75vw]' : 'w-[400px]' // AQUÍ ESTÁ LA MAGIA: Cambia el ancho suavemente
      }`}
    >
      
      {/* --- HEADER (Imagen Principal) --- */}
      <div className={`relative w-full bg-gray-900 overflow-hidden shrink-0 transition-all duration-500 ${isExpanded ? 'h-[40vh]' : 'h-64'}`}>
        {/* Imagen de fondo */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-e3289cab4084?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        
        {/* Botonera Superior */}
        <div className="absolute top-4 right-4 flex gap-2 z-20">
            {/* BOTÓN EXPANDIR / CONTRAER */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="p-2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all border border-white/10 hover:scale-110"
                title={isExpanded ? "Contraer vista" : "Ver Fotos / Expandir"}
            >
                {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            
            {/* BOTÓN CERRAR */}
            <button onClick={onClose} className="p-2 bg-black/50 hover:bg-red-500/80 rounded-full text-white transition-all border border-white/10">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Título y Estado */}
        <div className="absolute bottom-6 left-6 z-10">
            <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-[10px] font-bold text-black rounded uppercase tracking-wider shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: accentColor }}>
                    {data.type === 'live' ? 'ACCESO BIOMÉTRICO' : 'VERIFICADO'}
                </span>
                {data.type === 'live' && <span className="animate-pulse w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red]"></span>}
            </div>
            <h2 className={`font-bold text-white leading-none transition-all duration-500 ${isExpanded ? 'text-5xl' : 'text-2xl'}`}>
                {data.title}
            </h2>
             {isExpanded && <p className="text-white/60 mt-2 text-lg">Madrid, Barrio de Salamanca</p>}
        </div>
      </div>

      {/* --- CONTENIDO SCROLLEABLE --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className={`p-8 transition-all duration-500 ${isExpanded ? 'grid grid-cols-12 gap-8' : 'flex flex-col gap-6'}`}>
            
            {/* COLUMNA IZQUIERDA (Datos) */}
            <div className={`${isExpanded ? 'col-span-4 space-y-8' : 'w-full space-y-6'}`}>
                
                {/* Precio */}
                <div className="border-b border-white/10 pb-6">
                    <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Precio de Salida</div>
                    <div className="text-4xl text-white font-bold tracking-tight">{data.value}</div>
                    <div className="flex items-center gap-2 mt-2 text-green-400 text-sm bg-green-900/20 w-fit px-2 py-1 rounded">
                        <Zap className="w-3 h-3" /> Oportunidad detectada
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-colors group">
                        <Shield className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                        <div className="text-white/50 text-[10px] uppercase">Agente</div>
                        <div className="text-white font-bold">Top Tier 1</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-colors group">
                        <Star className="w-5 h-5 text-yellow-400 mb-2 group-hover:scale-110 transition-transform" />
                        <div className="text-white/50 text-[10px] uppercase">Calidad</div>
                        <div className="text-white font-bold">AAA+ Cert.</div>
                    </div>
                </div>

                {/* Texto */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                        <MapPin className="w-3 h-3" /> 
                        <span>Coord: {data.coords[1].toFixed(4)}, {data.coords[0].toFixed(4)}</span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                        Este activo representa una oportunidad única en la zona. 
                        Reformado por el estudio <strong>Arkibio</strong>, cuenta con domótica Lutron, 
                        suelo radiante y vistas despejadas.
                        <br/><br/>
                        <span className="text-blue-400 italic">"La mejor luz de la calle Velázquez." — Marcos V. (Fotógrafo)</span>
                    </p>
                </div>

                {/* BOTÓN GRANDE */}
                <button className="w-full group relative overflow-hidden bg-white text-black font-bold py-5 rounded-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    {data.type === 'live' ? (
                        <>
                            <Fingerprint className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            <span className="tracking-wider">DESBLOQUEAR PUERTA</span>
                        </>
                    ) : (
                        <>
                            <span>SOLICITAR VISITA</span>
                        </>
                    )}
                </button>
            </div>

            {/* COLUMNA DERECHA (Galería - Solo visible si está expandido) */}
            {isExpanded && (
                <div className="col-span-8 space-y-6 animate-fade-in-up">
                    <div className="flex items-center gap-2 text-white/50 mb-4 border-b border-white/10 pb-2">
                        <Camera className="w-4 h-4" />
                        <span className="text-xs font-bold tracking-widest uppercase">Galería Táctica</span>
                    </div>
                    
                    {/* Grid de Fotos */}
                    <div className="grid grid-cols-2 gap-4">
                        {GALLERY_IMAGES.map((img, i) => (
                            <div key={i} className={`group relative overflow-hidden rounded-xl border border-white/10 cursor-pointer ${i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}>
                                <img src={img} alt="Interior" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default HoloCard;

