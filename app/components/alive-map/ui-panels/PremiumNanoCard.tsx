"use client";
import React, { useState } from 'react';
import { Heart, MapPin, Bed, Bath, Maximize2, Flame, Crown, Zap, ArrowUpRight } from 'lucide-react';

export default function PremiumNanoCard({ property, onClick, onToggleFavorite }: any) {
  
  // Nivel de Pago: 'FIRE' (9.99€) | 'GOLD' (19€) | 'DIAMOND' (49€)
  const tier = property.promotedTier || 'FIRE'; 
  const [isHovered, setIsHovered] = useState(false);

  // ESTILOS DE GUERRA
  const getStyles = () => {
      switch(tier) {
          case 'FIRE': return "border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.8)] from-orange-50 to-white";
          case 'GOLD': return "border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.7)] from-yellow-50 to-white ring-2 ring-yellow-200";
          case 'DIAMOND': return "border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.9)] bg-slate-900 text-white ring-2 ring-cyan-400";
          default: return "border-slate-200";
      }
  };

  const getAnimation = () => {
      if (tier === 'FIRE') return "animate-pulse";
      if (tier === 'GOLD') return ""; // El brillo dorado lo hace el CSS
      if (tier === 'DIAMOND') return "";
  };

  return (
    <div 
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative w-[280px] rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 flex flex-col border-2 bg-gradient-to-b scale-110 z-[99999] ${getStyles()} ${isHovered ? 'scale-115' : ''}`}
    >
        {/* EFECTO DE BRILLO (Solo Gold/Diamond) */}
        {(tier === 'GOLD' || tier === 'DIAMOND') && (
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-[shimmer_2s_infinite] pointer-events-none z-50"/>
        )}

        {/* BADGE DE NIVEL */}
        <div className={`absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg ${tier === 'DIAMOND' ? 'bg-cyan-400 text-black' : (tier === 'GOLD' ? 'bg-yellow-400 text-black' : 'bg-orange-600 text-white')}`}>
            {tier === 'FIRE' && <Flame size={12} fill="currentColor" className="animate-bounce"/>}
            {tier === 'GOLD' && <Crown size={12} fill="currentColor"/>}
            {tier === 'DIAMOND' && <Zap size={12} fill="currentColor"/>}
            {tier === 'FIRE' ? 'HOT LISTING' : tier}
        </div>

        {/* IMAGEN */}
        <div className="h-44 w-full relative overflow-hidden bg-gray-900 shrink-0">
            <img 
                src={property.mainImage || "/placeholder.jpg"} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                alt="Propiedad"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>

            {/* PRECIO GIGANTE */}
            <div className="absolute bottom-4 left-4 text-white">
                <p className="text-2xl font-black leading-none drop-shadow-xl tracking-tight">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price)}
                </p>
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-1">Precio Destacado</p>
            </div>
        </div>

        {/* DATOS */}
        <div className={`p-4 flex flex-col gap-2 ${tier === 'DIAMOND' ? 'text-white' : 'text-slate-900'}`}>
            <h3 className="text-sm font-black truncate uppercase tracking-tight">
                {property.title || "Oportunidad Premium"}
            </h3>
            
            <p className={`text-[10px] flex items-center gap-1 truncate ${tier === 'DIAMOND' ? 'text-cyan-200' : 'text-slate-500'}`}>
                <MapPin size={10} /> {property.address || "Ubicación Premium"}
            </p>

            <div className={`flex items-center gap-4 mt-2 pt-2 border-t ${tier === 'DIAMOND' ? 'border-white/10' : 'border-slate-100'}`}>
                <div className="flex items-center gap-1 text-xs font-bold"><Bed size={14}/> {property.rooms}</div>
                <div className="flex items-center gap-1 text-xs font-bold"><Bath size={14}/> {property.baths}</div>
                <div className="flex items-center gap-1 text-xs font-bold"><Maximize2 size={14}/> {property.mBuilt}m²</div>
                
                <div className="ml-auto">
                    <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${tier === 'DIAMOND' ? 'bg-cyan-500 text-black hover:bg-white' : 'bg-slate-900 text-white hover:bg-slate-700'}`}>
                        <ArrowUpRight size={16}/>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}