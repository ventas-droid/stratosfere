// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { Heart, ChevronRight, Bed, Bath, Maximize2 } from 'lucide-react';

// TARJETA TÁCTICA MK-VII (INTELIGENCIA AUMENTADA)
// Actualización: Ahora recibe y transmite 'role' y 'description'
const MapNanoCard = ({ 
    id, 
    price, 
    priceValue, 
    type, 
    image, 
    lat, 
    lng, 
    isFav = false,
    // 🟢 NUEVAS VARIABLES DE INTELIGENCIA
    role, 
    description 
}) => {
  const [liked, setLiked] = useState(isFav);
  const [isHovered, setIsHovered] = useState(false); 

  // PAYLOAD BLINDADO: Empaquetamos todo para el Panel Lateral (UIPanels)
  const fullDataPayload = { 
      id, 
      price: priceValue, 
      displayPrice: price, 
      type, 
      img: image, 
      lat, 
      lng,
      // 🟢 INYECCIÓN DE DATOS (Con texto de seguridad por si viene vacío)
      role: role || "OPORTUNIDAD", 
      description: description || "Activo inmobiliario estratégico localizado en zona prime. Oportunidad para diversificación de cartera. Contacte para dossier confidencial."
  };

  // AL HACER CLICK EN EL CORAZÓN (VAULT)
  const handleHeartClick = (e) => {
      e.stopPropagation(); 
      setLiked(!liked);
      console.log("❤️ ENVIANDO A VAULT:", fullDataPayload);
      window.dispatchEvent(new CustomEvent('toggle-fav-signal', { detail: fullDataPayload }));
  };

  // AL HACER CLICK EN EL PIN O LA TARJETA (FICHA TÁCTICA)
  const handleOpenDetails = () => {
      console.log("📂 ABRIENDO FICHA:", fullDataPayload);
      window.dispatchEvent(new CustomEvent('open-details-signal', { detail: fullDataPayload }));
  };

  return (
    // CONTENEDOR PRINCIPAL
    <div 
      className="group cursor-pointer relative flex flex-col items-center z-50 hover:z-[9999]" 
      style={{ transform: 'translate(0, -100%)' }} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)} 
      onClick={handleOpenDetails} 
    >
      
      {/* --- TARJETA EXPANDIDA (VISIBLE SOLO AL HOVER) --- */}
      <div className={`absolute bottom-[50px] transition-all duration-300 ease-out origin-bottom ${isHovered ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}`}>
          <div className="relative w-72 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.9)]">
            
            {/* Foto */}
            <div className="h-40 relative">
                <img src={image} alt={type} className="w-full h-full object-cover opacity-90"/>
                {/* Etiqueta Tipo */}
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600/90 text-white text-[10px] font-black rounded uppercase tracking-widest shadow-lg backdrop-blur-sm">
                    {type}
                </div>
                {/* Botón Favorito */}
                <button onClick={handleHeartClick} className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-red-600/80 text-white transition-all backdrop-blur-md border border-white/10">
                    <Heart size={16} className={liked ? "fill-white text-white" : "text-white"} />
                </button>
            </div>

            {/* Datos Rápidos (Iconos) */}
            <div className="py-3 px-5 bg-[#111] border-t border-white/10 flex justify-between items-center text-gray-300">
                <div className="flex flex-col items-center gap-0.5"><Bed size={16} className="text-blue-400"/><span className="text-[11px] font-mono font-bold">3 hab</span></div>
                <div className="w-[1px] h-5 bg-white/10"></div>
                <div className="flex flex-col items-center gap-0.5"><Bath size={16} className="text-blue-400"/><span className="text-[11px] font-mono font-bold">2 bañ</span></div>
                <div className="w-[1px] h-5 bg-white/10"></div>
                <div className="flex flex-col items-center gap-0.5"><Maximize2 size={16} className="text-blue-400"/><span className="text-[11px] font-mono font-bold">150m²</span></div>
            </div>

            {/* Botón Inferior */}
            <div className="bg-blue-600/10 py-2 text-center border-t border-blue-500/20">
                <span className="text-[9px] text-blue-400 font-bold tracking-[0.3em] uppercase flex items-center justify-center gap-2">
                    CLICK PARA EXPEDIENTE <ChevronRight size={10}/>
                </span>
            </div>
          </div>

          {/* Triángulo Conector */}
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-[#0a0a0a]/95 mx-auto -mt-[1px] filter drop-shadow-lg relative z-10"></div>
      </div>

      {/* --- PIN NEGRO DEL PRECIO --- */}
      <div className="flex items-center gap-2 px-4 py-2 bg-black/90 backdrop-blur-md border border-white/20 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-200 group-hover:scale-110 group-hover:border-blue-500">
         <div className="w-2.5 h-2.5 bg-blue-500 rounded-full group-hover:animate-none animate-pulse shadow-[0_0_10px_blue]"></div>
         <span className="text-sm font-bold font-mono text-white tracking-wide">{price}</span>
      </div>

      {/* Triángulo Conector del Pin */}
      <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-black/90 group-hover:border-t-blue-500 transition-colors -mt-[1px]"></div>
      
      {/* PUNTO DE ANCLAJE FINAL */}
      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 shadow-[0_0_10px_blue] animate-pulse group-hover:scale-125 transition-transform"></div>

    </div>
  );
};

export default MapNanoCard;

