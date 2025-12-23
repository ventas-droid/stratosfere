// @ts-nocheck
"use client";
import React, { useState, useEffect, useRef } from 'react'; // <--- 1. AÑADIDO useRef
import { Heart, ChevronRight, Bed, Bath, Maximize2, Navigation } from 'lucide-react';
// --- 1. MOTOR DE COLORES ---
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

export default function MapNanoCard({ 
    id, price, priceValue, type, 
    img, image, 
    lat, lng, isFav = false, role, description 
}: any) {
  const [liked, setLiked] = useState(isFav);
  const [isHovered, setIsHovered] = useState(false); 
  
  const style = getPriceStyle(priceValue || price);
  const finalImage = img || image || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80";

  const fullDataPayload = { 
      id, price: priceValue, displayPrice: price, type, 
      img: finalImage, lat, lng,
      role: role || style.label, 
      description: description || "Activo inmobiliario estratégico."
  };
// --- 2. AQUÍ ESTÁ LA MAGIA (Z-INDEX FIX) ---
  const cardRef = useRef(null);

  useEffect(() => {
      if (cardRef.current) {
          // Buscamos el contenedor superior de Mapbox
          const mapboxMarker = cardRef.current.closest('.mapboxgl-marker');
          
          if (mapboxMarker) {
              // Si hay Hover = 999999 (Encima de todo). Si no = 10.
              mapboxMarker.style.zIndex = isHovered ? "999999" : "10";
          }
      }
  }, [isHovered]);

  // 📡 ANTENA DE SINCRONIZACIÓN (VERSIÓN STRATOS V3 - OPTIMIZADA)
  useEffect(() => {
    // A. Lectura Segura
    const checkStatus = () => {
        if (typeof window === 'undefined') return;
        const isFavOnDisk = localStorage.getItem(`fav-${id}`) === 'true';
        setLiked(isFavOnDisk);
    };

    // B. Filtro Inteligente: Solo actualiza si me afecta a MÍ
    const handleSignal = (e: any) => {
        // Si el evento especifica un ID y NO es el mío, no hago nada (Ahorro recursos)
        if (e.detail && e.detail.id && e.detail.id !== id) return;
        checkStatus();
    };

    // C. Listeners
    window.addEventListener('force-sync-favs', checkStatus); // Señal nuclear (actualiza todos)
    window.addEventListener('toggle-fav-signal', handleSignal); // Señal quirúrgica (actualiza uno)
    
    // D. Chequeo Inicial
    checkStatus();

    return () => {
        window.removeEventListener('force-sync-favs', checkStatus);
        window.removeEventListener('toggle-fav-signal', handleSignal);
    };
  }, [id]);

  // MANEJADOR DE ACCIONES (CORREGIDO PARA ABRIR DETAILS)
  const handleAction = (e: any, action: string) => {
      e.stopPropagation(); 
      
      if (action === 'fav') {
          const newState = !liked;
          setLiked(newState); 
          
          // 1. Guardado Físico
          if (newState) {
              localStorage.setItem(`fav-${id}`, 'true');
          } else {
              localStorage.removeItem(`fav-${id}`);
          }

          if (typeof window !== 'undefined') {
              // 2. Avisar al sistema (Index) para que actualice contadores y Vault
              window.dispatchEvent(new CustomEvent('toggle-fav-signal', { detail: fullDataPayload }));
              // 3. Forzar sincronización de corazones
              window.dispatchEvent(new CustomEvent('force-sync-favs'));
              
              // 🔥 4. NUEVO: ABRIR TAMBIÉN LA COLUMNA IZQUIERDA (DETAILS)
              // Esto cumple tu orden: al dar like, se abre la ficha automáticamente.
              window.dispatchEvent(new CustomEvent('open-details-signal', { detail: fullDataPayload }));
          }
      }
      
      if (action === 'open') {
          if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('open-details-signal', { detail: fullDataPayload }));
          }
      }
  };

  return (
    <div 
      ref={cardRef} // 1. El ancla para el Z-Index
      className="pointer-events-auto flex flex-col items-center group relative z-[50]" // 2. La clase que permite clicks
      onMouseEnter={() => setIsHovered(true)}  // 3. El sensor de entrada (Vital)
      onMouseLeave={() => setIsHovered(false)} // 4. El sensor de salida (Vital)
    >
      {/* TARJETA FLOTANTE */}
      {isHovered && (
          <div 
            className="absolute bottom-[85%] pb-4 w-[280px] z-[100] animate-fade-in-up origin-bottom"
            onClick={(e) => handleAction(e, 'open')}
          >
            <div className="flex flex-col rounded-[32px] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-white/40 cursor-pointer bg-black">
                <div className="bg-[#E5E5EA]/95 backdrop-blur-3xl pb-2 relative">
                    <div className="h-36 relative overflow-hidden">
                        <img src={finalImage} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" alt="Propiedad"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full shadow-lg border border-white/20 backdrop-blur-md" style={{ backgroundColor: style.hex }}>
                            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: style.text }}>{style.label}</span>
                        </div>
                        <button 
                            onClick={(e) => handleAction(e, 'fav')} 
                            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-90 ${liked ? 'bg-red-500 text-white' : 'bg-black/40 text-white'}`}
                        >
                            <Heart size={16} className={liked ? "fill-current" : ""} />
                        </button>
                    </div>
                    <div className="px-4 pt-3">
                        <h3 className="text-lg font-black text-[#1c1c1e] leading-tight mb-1 truncate">{type}</h3>
                        <div className="flex items-center gap-1 text-slate-500"><Navigation size={10} style={{ color: style.hex }}/><span className="text-[9px] font-bold uppercase tracking-wider">MADRID</span></div>
                    </div>
                </div>
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

      {/* PIN DE MAPA */}
      <div 
          className={`relative px-3 py-1.5 rounded-full shadow-xl transition-all duration-300 flex flex-col items-center justify-center z-20 cursor-pointer ${isHovered ? 'scale-125 -translate-y-2' : 'scale-100'}`} 
          style={{ backgroundColor: style.hex }}
          onClick={(e) => handleAction(e, 'open')}
      >
         <span className="text-xs font-bold font-mono tracking-wide" style={{ color: style.text }}>{price}</span>
         <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]" style={{ borderTopColor: style.hex }}></div>
      </div>
      
      <div className="mt-1 relative flex items-center justify-center">
          <div className="absolute w-8 h-8 rounded-full animate-ping opacity-40" style={{ backgroundColor: style.hex }}></div>
          <div className="w-2.5 h-2.5 rounded-full shadow-sm z-10 border border-white/40" style={{ backgroundColor: style.hex }}></div>
      </div>
    </div>
  );
}

