"use client";
import React, { useState, useEffect } from 'react';import { Heart, ChevronRight, Bed, Bath, Maximize2, Navigation } from 'lucide-react';

// --- 1. MOTOR DE COLORES (Apple Spectrum) ---
const getPriceStyle = (priceInput: any) => {
    let price = 0;
    if (typeof priceInput === 'number') price = priceInput;
    else {
        const str = priceInput?.toString().toUpperCase() || "";
        if (str.includes('M')) price = parseFloat(str) * 1000000;
        else if (str.includes('K')) price = parseFloat(str) * 1000;
        else price = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
    }

    if (price < 150000) return { hex: '#34C759', text: 'white', label: 'ENTRY' };       
    if (price < 300000) return { hex: '#FFD60A', text: 'black', label: 'OPPORTUNITY' }; 
    if (price < 500000) return { hex: '#FF9500', text: 'white', label: 'PREMIUM' };     
    if (price < 900000) return { hex: '#FF2D55', text: 'white', label: 'LUXURY' };      
    if (price < 2000000) return { hex: '#AF52DE', text: 'white', label: 'EXCLUSIVE' };  
    return { hex: '#0071e3', text: 'white', label: 'STRATOS TIER' };                    
};

// Usamos 'any' en las props para evitar peleas con TypeScript por ahora
export default function MapNanoCard({ 
    id, price, priceValue, type, 
    img, image, 
    lat, lng, isFav = false, role, description 
}: any) {
  // Estado local
  const [liked, setLiked] = useState(isFav);
  const [isHovered, setIsHovered] = useState(false); 
  
  // Estilos y Foto
  const style = getPriceStyle(priceValue || price);
  const finalImage = img || image || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80";

  // 🧠 MEMORIA: Recuperamos si ya le dimos like antes
  useEffect(() => {
    const storedLike = localStorage.getItem(`fav-${id}`);
    if (storedLike === 'true') setLiked(true);
  }, [id]);

  // Payload de datos
  const fullDataPayload = { 
      id, price: priceValue, displayPrice: price, type, 
      img: finalImage, lat, lng,
      role: role || style.label, 
      description: description || "Activo inmobiliario estratégico."
  };

  const handleAction = (e: any, action: string) => {
      e.stopPropagation(); // 🛑 FRENAMOS EL CLICK PARA QUE NO ATRAVIESE
      
      if (action === 'fav') {
          const newState = !liked;
          setLiked(newState);
          localStorage.setItem(`fav-${id}`, String(newState)); // Guardamos en memoria
          if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('toggle-fav-signal', { detail: fullDataPayload }));
      }
      
      if (action === 'open') {
          if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('open-details-signal', { detail: fullDataPayload }));
      }
  };
// 📡 BLOQUE NUEVO: ANTENA DE SINCRONIZACIÓN
  // Esto hace que la tarjeta se entere si diste like en el panel lateral
  useEffect(() => {
    const handleSignal = (e: any) => {
        // Si la señal es para mí (mi mismo ID)
        if (e.detail && e.detail.id === id) {
            // Reviso la memoria y actualizo mi corazón
            const isNowFav = localStorage.getItem(`fav-${id}`) === 'true';
            setLiked(isNowFav);
        }
    };
    window.addEventListener('toggle-fav-signal', handleSignal);
    return () => window.removeEventListener('toggle-fav-signal', handleSignal);
  }, [id]);

  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-[9999] flex flex-col items-center group"
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* --- TARJETA FLOTANTE --- */}
      {isHovered && (
          // 🛡️ CORRECCIÓN DE SENSIBILIDAD: Usamos 'pb-4' en vez de margin para crear un puente invisible
          <div 
            className="absolute bottom-[85%] pb-4 w-[280px] z-[100] animate-fade-in-up origin-bottom"
            onClick={(e) => handleAction(e, 'open')}
          >
            <div className="flex flex-col rounded-[32px] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-white/40 cursor-pointer bg-black">
                
                {/* CABECERA */}
                <div className="bg-[#E5E5EA]/95 backdrop-blur-3xl pb-2 relative">
                    <div className="h-36 relative overflow-hidden">
                        <img src={finalImage} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        
                        {/* Badge */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full shadow-lg border border-white/20 backdrop-blur-md" style={{ backgroundColor: style.hex }}>
                            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: style.text }}>{style.label}</span>
                        </div>
                        
                        {/* ❤️ BOTÓN CORAZÓN INDEPENDIENTE */}
                        <button 
                            onClick={(e) => handleAction(e, 'fav')} 
                            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-90 ${liked ? 'bg-red-500 text-white' : 'bg-black/40 text-white'}`}
                        >
                            <Heart size={16} className={liked ? "fill-current" : ""} />
                        </button>
                    </div>
                    
                    {/* INFO */}
                    <div className="px-4 pt-3">
                        <h3 className="text-lg font-black text-[#1c1c1e] leading-tight mb-1 truncate">{type}</h3>
                        <div className="flex items-center gap-1 text-slate-500"><Navigation size={10} style={{ color: style.hex }}/><span className="text-[9px] font-bold uppercase tracking-wider">MADRID</span></div>
                    </div>
                </div>

                {/* PIE */}
                <div className="p-3 transition-colors duration-300" style={{ backgroundColor: style.hex, color: style.text }}>
                    <div className="flex justify-between items-center mb-2 px-2 border-b border-current/20 pb-2">
                        <div className="flex items-center gap-1"><Bed size={14}/><span className="text-[10px] font-bold">3</span></div>
                        <div className="w-[1px] h-4 bg-current opacity-30"></div>
                        <div className="flex items-center gap-1"><Bath size={14}/><span className="text-[10px] font-bold">2</span></div>
                        <div className="w-[1px] h-4 bg-current opacity-30"></div>
                        <div className="flex items-center gap-1"><Maximize2 size={14}/><span className="text-[10px] font-bold">150m</span></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-black tracking-tight">{price}</span>
                        <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest opacity-80">VER <ChevronRight size={10}/></div>
                    </div>
                </div>
            </div>
          </div>
      )}

      {/* --- EL PIN --- */}
      <div 
          className={`relative px-3 py-1.5 rounded-full shadow-xl transition-all duration-300 flex flex-col items-center justify-center z-20 cursor-pointer ${isHovered ? 'scale-125 -translate-y-2' : 'scale-100'}`} 
          style={{ backgroundColor: style.hex }}
          onClick={(e) => handleAction(e, 'open')}
      >
         <span className="text-xs font-bold font-mono tracking-wide" style={{ color: style.text }}>{price}</span>
         <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]" style={{ borderTopColor: style.hex }}></div>
      </div>
      
      {/* PUNTO SUELO */}
      <div className="mt-1 relative flex items-center justify-center">
          <div className="absolute w-8 h-8 rounded-full animate-ping opacity-40" style={{ backgroundColor: style.hex }}></div>
          <div className="w-2.5 h-2.5 rounded-full shadow-sm z-10 border border-white/40" style={{ backgroundColor: style.hex }}></div>
      </div>

    </div>
  );
}