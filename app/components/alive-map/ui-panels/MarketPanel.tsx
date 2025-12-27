"use client";

import React, { useState } from "react";
import { 
  X, CheckCircle2, Zap, LayoutGrid, Globe, MapPin, Camera, Video, ArrowUp, 
  FileText, MousePointerClick, Info, Star, Award, Crown, Box, Droplets, 
  Megaphone, Hammer, Mail, Smartphone
} from "lucide-react";

// --- 1. BASE DE DATOS MAESTRA ---
const MARKET_CATALOG = [
  // --- PACKS ---
  { 
    id: 'pack_basic', name: 'KIT INICIADO', price: 29.9, category: 'PACK', icon: Star, 
    desc: 'Foto Pro + Plano + Certificado.',
    intel: 'Lo mínimo indispensable para no parecer un aficionado. Te otorga el rango de "Vendedor Validado".',
    role: 'VALIDADO', color: 'bg-blue-500'
  },
  { 
    id: 'pack_pro', name: 'KIT VISIBILIDAD', price: 99.9, category: 'PACK', icon: Award, 
    desc: 'Tour 3D + Portales Top + Redes.',
    intel: 'La opción inteligente. Multiplica x10 las visitas virtuales y filtra curiosos. Rango "Pro Seller".',
    role: 'PRO SELLER', color: 'bg-indigo-600'
  },
  { 
    id: 'pack_elite', name: 'STRATOS GOD MODE', price: 199.9, category: 'PACK', icon: Crown, 
    desc: 'Todo incluido + Abogado + Open House.',
    intel: 'Dominación total. Activamos toda la maquinaria de guerra. Tu casa se venderá en tiempo récord. Rango "Leyenda".',
    role: 'LEYENDA', color: 'bg-black'
  },

  // --- OFFLINE ---
  { 
    id: 'lona', name: 'LONA FACHADA XL', price: 49.9, category: 'OFFLINE', icon: LayoutGrid, 
    desc: 'Visibilidad física 24/7.',
    intel: 'El 40% de compradores son vecinos. Una lona captura ese tráfico.'
  },
  { 
    id: 'buzoneo', name: 'BUZONEO PREMIUM', price: 29.9, category: 'OFFLINE', icon: MapPin, 
    desc: 'Dominio del barrio.',
    intel: 'Llegamos a cada buzón en 500m. Encuentra compradores locales.'
  },
  { 
    id: 'revista', name: 'REVISTA LUXURY', price: 59.9, category: 'OFFLINE', icon: FileText, 
    desc: 'Prensa papel.',
    intel: 'Asocia tu propiedad con el lujo y la exclusividad local.'
  },
  { 
    id: 'openhouse', name: 'OPEN HOUSE VIP', price: 149.9, category: 'OFFLINE', icon: Zap, 
    desc: 'Evento puertas abiertas.',
    intel: 'Genera urgencia y competencia directa entre compradores un solo día.'
  },
  { 
    id: 'homestaging', name: 'HOME STAGING', price: 299.0, category: 'OFFLINE', icon: Box, 
    desc: 'Muebles reales.',
    intel: 'Amueblar ayuda a entender los espacios y sube el valor percibido.'
  },
  { 
    id: 'limpieza', name: 'LIMPIEZA PRO', price: 89.9, category: 'OFFLINE', icon: Droplets, 
    desc: 'Puesta a punto.',
    intel: 'La limpieza es la primera barrera. Un piso impoluto reduce el regateo.'
  },

  // --- ONLINE ---
  { 
    id: 'foto', name: 'FOTOGRAFÍA HDR', price: 99.0, category: 'ONLINE', icon: Camera, 
    desc: 'Calidad revista.',
    intel: 'La primera impresión es digital. Aumenta los clics un 300%.'
  },
  { 
    id: 'video', name: 'VÍDEO CINE', price: 199.9, category: 'ONLINE', icon: Video, 
    desc: 'Narrativa emocional.',
    intel: 'El vídeo vende la emoción. Es lo que más se comparte en WhatsApp.'
  },
  { 
    id: 'destacado', name: 'POSICIONAMIENTO', price: 49.0, category: 'ONLINE', icon: ArrowUp, 
    desc: 'Siempre primero.',
    intel: 'Evita el cementerio de la página 2. Más ojos = Más ofertas.'
  },
  { 
    id: 'ads', name: 'PAID SOCIAL ADS', price: 79.9, category: 'ONLINE', icon: Megaphone, 
    desc: 'Insta & Facebook.',
    intel: 'Perseguimos al comprador ideal en sus redes sociales.'
  },
  { 
    id: 'render', name: 'RENDER REFORMA', price: 99.0, category: 'ONLINE', icon: Hammer, 
    desc: 'Visualización futuro.',
    intel: 'Vende el sueño de lo que podría ser, no la realidad actual.'
  },
  { 
    id: 'email', name: 'EMAIL INVERSORES', price: 149.0, category: 'ONLINE', icon: Mail, 
    desc: 'Base de datos.',
    intel: 'Acceso directo a 5.000 inversores antes de publicar.'
  },
  { 
    id: 'web', name: 'WEB EXCLUSIVA', price: 89.0, category: 'ONLINE', icon: Smartphone, 
    desc: 'Landing page propia.',
    intel: 'Una web solo para tu casa (tucasa.com). Perfecta para compartir.'
  }
];

export default function MarketPanel({
  isOpen,
  onClose,
  marketTab,
  setMarketTab,
  // 🔥 ESTOS SON LOS NUEVOS CANALES DE COMUNICACIÓN
  selectedReqs = [],      // La lista de servicios comprados (viene del Hud)
  toggleRequirement,      // La función para comprar/vender (viene del Hud)
  isProfileOpen,          // Para saber si nos tenemos que mover
  
  // Mantenga sus props de sonido si las tenía
  soundEnabled,
  playSynthSound,
}: any) {
  
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!isOpen) return null;

  // --- LÓGICA DE CÁLCULO (CON PROTECCIÓN ANTI-ERROR) ---
  const calculateAuthority = () => {
    let score = 0;

    // 🛡️ FILTRO DE SEGURIDAD: Solo procesamos IDs que sean texto real (evita el crash)
    const validReqs = Array.isArray(selectedReqs) 
        ? selectedReqs.filter((id: any) => typeof id === 'string') 
        : [];

    score += validReqs.filter((id: string) => !id.startsWith('pack_')).length * 10;
    
    if (validReqs.includes('pack_basic')) score = 35;
    if (validReqs.includes('pack_pro')) score = 75;
    if (validReqs.includes('pack_elite')) score = 100;
    
    return Math.min(100, score);
  };

  const authorityLevel = calculateAuthority();

  const totalImpact = selectedReqs.reduce((acc: number, id: any) => {
    // Protección también aquí
    if (!id || typeof id !== 'string') return acc;
    const item = MARKET_CATALOG.find((x: any) => x.id === id);
    return acc + (item ? item.price : 0);
  }, 0);

  // Detectar Rol Activo (Con seguridad)
  const safeReqs = Array.isArray(selectedReqs) ? selectedReqs : [];
  const activeRole = 
    safeReqs.includes('pack_elite') ? { name: 'LEYENDA', color: 'text-purple-600 bg-purple-50 border-purple-200' } :
    safeReqs.includes('pack_pro') ? { name: 'PRO SELLER', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' } :
    safeReqs.includes('pack_basic') ? { name: 'VALIDADO', color: 'text-blue-600 bg-blue-50 border-blue-200' } :
    authorityLevel > 50 ? { name: 'ESTRATEGA', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' } :
    { name: 'NOVATO', color: 'text-slate-400 bg-slate-50 border-slate-200' };

  const handleSound = (type: string) => {
    if (soundEnabled && playSynthSound) playSynthSound(type);
  };

  const handleItemClick = (item: any) => {
    handleSound('click');
    toggleRequirement(item.id);
  };

  return (
    // PANEL A LA IZQUIERDA (LEFT-0)
    <div className="fixed inset-y-0 left-0 w-full md:w-[500px] z-[60000] flex flex-col pointer-events-auto animate-slide-in-left">
      
      {/* FONDO GRIS SÓLIDO CORPORATIVO (Sin Blur) */}
      <div className="absolute inset-0 bg-slate-100 shadow-[20px_0_50px_rgba(0,0,0,0.1)]"></div>

      <div className="relative z-10 flex flex-col h-full text-slate-900">
        
        {/* 2. HEADER */}
        <div className="p-8 pb-4 flex-shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight text-black mb-1">
                Servicios.
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Estrategia de venta oficial.
              </p>
            </div>
            <button
              onClick={() => { handleSound('click'); onClose(); }}
              className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* BARRA DE AUTORIDAD Y ROL */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tu Rango</span>
                   <Info size={12} className="text-slate-400"/>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${activeRole.color}`}>
                   {activeRole.name}
                </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                <div 
                    className={`h-full transition-all duration-700 ease-out rounded-full ${
                        authorityLevel >= 100 ? 'bg-gradient-to-r from-purple-500 to-black' : 
                        authorityLevel >= 60 ? 'bg-indigo-600' : 'bg-[#0071e3]'
                    }`}
                    style={{ width: `${authorityLevel}%` }}
                ></div>
            </div>
          </div>
        </div>

        {/* 3. PESTAÑAS (TABS) */}
        <div className="px-8 py-2 flex-shrink-0">
            <div className="flex p-1 bg-slate-200 rounded-xl">
                {['ONLINE', 'OFFLINE', 'PACK'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => { handleSound('click'); setMarketTab(tab); }}
                        className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-200 ${
                            marketTab === tab 
                            ? 'bg-white text-black shadow-sm scale-[1.02]' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {tab === 'PACK' ? '⭐ PACKS' : tab}
                    </button>
                ))}
            </div>
        </div>

        {/* 4. GRID DE PRODUCTOS */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4 pb-32">
                {MARKET_CATALOG.filter((i: any) => i.category === marketTab).map((item: any) => {
                    const isActive = Array.isArray(selectedReqs) && selectedReqs.includes(item.id);
                    const isHovered = hoveredId === item.id;
                    
                    return (
                        <div 
                            key={item.id} 
                            onClick={() => handleItemClick(item)} 
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={`
                                relative p-5 rounded-3xl border transition-all duration-200 cursor-pointer group flex flex-col justify-between gap-3 min-h-[160px] overflow-hidden
                                ${isActive 
                                    ? 'bg-blue-50 border-[#0071e3] ring-1 ring-[#0071e3]' 
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'}
                            `}
                        >
                            {/* TOOLTIP REFLEJO */}
                            {isHovered && (
                                <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-sm p-4 flex flex-col justify-center items-center text-center animate-fade-in text-white pointer-events-none">
                                    <Zap size={18} className="text-emerald-400 mb-2"/>
                                    <p className="text-[10px] font-medium leading-tight">
                                    "{item.intel}"
                                    </p>
                                    <div className="mt-3 text-[8px] uppercase tracking-widest text-slate-400 font-bold border-t border-slate-700 pt-2 w-full">
                                    Click para añadir
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-2xl transition-colors ${isActive ? 'bg-[#0071e3] text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                                    <item.icon size={18} />
                                </div>
                                <div className={`text-xs font-bold ${isActive ? 'text-[#0071e3]' : 'text-slate-400'}`}>
                                    {item.price}€
                                </div>
                            </div>

                            <div>
                                <div className={`text-[11px] font-black uppercase leading-tight mb-1 ${isActive ? 'text-[#0071e3]' : 'text-slate-900'}`}>
                                    {item.name}
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                                    {item.desc}
                                </div>
                            </div>

                            {/* CHECK */}
                            {isActive && (
                                <div className="absolute top-3 right-3 bg-white rounded-full p-0.5 shadow-sm animate-scale-in z-10">
                                    <CheckCircle2 size={20} className="text-[#0071e3] fill-white" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* 5. FOOTER */}
        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-slate-100 via-slate-100/95 to-transparent z-30 pointer-events-none">
            <div className="bg-white shadow-2xl border border-slate-200 rounded-[2rem] p-1 pointer-events-auto">
                <div className="flex justify-between items-center px-6 py-4">
                    <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Valor Impacto</div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight">{totalImpact.toFixed(0)} €</div>
                    </div>
                    
                    <button 
                        disabled={selectedReqs.length === 0}
                        onClick={() => {
                            handleSound('complete');
                            onClose();
                        }}
                        className={`
                            px-8 py-4 font-bold text-xs uppercase tracking-widest rounded-3xl transition-all shadow-lg active:scale-95
                            ${selectedReqs.length > 0 
                                ? 'bg-[#0071e3] hover:bg-[#0077ED] text-white shadow-[#0071e3]/30 cursor-pointer' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}
                        `}
                    >
                        {selectedReqs.length > 0 ? "Aplicar" : "Cerrar"}
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

