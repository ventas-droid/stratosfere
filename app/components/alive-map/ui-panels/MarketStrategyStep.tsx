import React, { useState } from 'react';
import { 
  LayoutGrid, Globe, Zap, MapPin, Camera, Video, ArrowUp, 
  CheckCircle2, Info, FileText, MousePointerClick, 
  PenTool, Share2, Hammer, Droplets, ShieldCheck, 
  Smartphone, Mail, Megaphone, Box, Crown, Star, Award
} from 'lucide-react';

// --- ARSENAL COMPLETO (PACKS + SERVICIOS) ---
const SERVICES = [
  // --- 1. PACKS (LA VÍA RÁPIDA) ---
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

  // --- 2. OFFLINE ---
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

  // --- 3. ONLINE ---
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
  }
];

export default function MarketStrategyStep({ onSelect }: any) {
  const [activeTab, setActiveTab] = useState('PACK'); // Empezamos en PACK por defecto (Simplificación)
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null); // Tooltip Localizado

  // Lógica de Selección Inteligente
  const toggleService = (item: any) => {
    // Si es un PACK, limpiamos lo anterior y seleccionamos solo el pack (Simplificación visual)
    if (item.category === 'PACK') {
        // Si ya estaba, lo quitamos. Si no, lo ponemos y quitamos otros packs.
        if (selectedServices.includes(item.id)) {
            setSelectedServices([]); 
        } else {
            // Quitamos otros packs para que sea exclusivo
            const noPacks = selectedServices.filter(id => !id.startsWith('pack_'));
            setSelectedServices([...noPacks, item.id]);
        }
    } else {
        // Si es servicio normal
        if (selectedServices.includes(item.id)) {
            setSelectedServices(selectedServices.filter(s => s !== item.id));
        } else {
            setSelectedServices([...selectedServices, item.id]);
        }
    }
  };

  // Cálculo de Autoridad Gamificada
  const calculateAuthority = () => {
    let score = 0;
    // Puntos por servicios sueltos
    score += selectedServices.filter(id => !id.startsWith('pack_')).length * 10;
    
    // Puntos extra por Packs (Roles)
    if (selectedServices.includes('pack_basic')) score = 35;
    if (selectedServices.includes('pack_pro')) score = 75;
    if (selectedServices.includes('pack_elite')) score = 100;
    
    return Math.min(100, score);
  };

  const authorityLevel = calculateAuthority();
  
  const totalImpact = selectedServices.reduce((acc, id) => {
     const s = SERVICES.find(serv => serv.id === id);
     return acc + (s ? s.price : 0);
  }, 0);

  // Detectar Rol Activo
  const activeRole = 
    selectedServices.includes('pack_elite') ? { name: 'LEYENDA', color: 'text-purple-500' } :
    selectedServices.includes('pack_pro') ? { name: 'PRO SELLER', color: 'text-indigo-600' } :
    selectedServices.includes('pack_basic') ? { name: 'VALIDADO', color: 'text-blue-500' } :
    authorityLevel > 50 ? { name: 'ESTRATEGA', color: 'text-emerald-500' } :
    { name: 'NOVATO', color: 'text-slate-400' };

  return (
    <div className="animate-fade-in space-y-6 pb-32 h-full flex flex-col relative">
      
      {/* 1. CABECERA DE AUTORIDAD (GAMIFICADA) */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-2">
         <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tu Rango</span>
               <Info size={12} className="text-slate-400"/>
            </div>
            <span className={`text-[10px] font-black ${activeRole.color} border border-current px-2 py-0.5 rounded-full`}>
               {activeRole.name}
            </span>
         </div>
         {/* Barra con animación suave */}
         <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                  authorityLevel >= 100 ? 'bg-gradient-to-r from-purple-500 to-black' : 
                  authorityLevel >= 60 ? 'bg-indigo-600' : 'bg-blue-500'
              }`}
              style={{ width: `${authorityLevel}%` }}
            ></div>
         </div>
      </div>

      {/* 2. PESTAÑAS (INCLUYENDO PACK) */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
         {['ONLINE', 'OFFLINE', 'PACK'].map((tab) => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
               activeTab === tab 
                 ? 'bg-white text-black shadow-sm scale-[1.02]' 
                 : 'text-slate-400 hover:text-slate-600'
             }`}
           >
             {tab === 'PACK' ? '⭐ PACKS' : tab}
           </button>
         ))}
      </div>

      {/* 3. GRID DE SERVICIOS */}
      <div className="grid grid-cols-2 gap-3 relative pb-4">
         {SERVICES.filter(s => s.category === activeTab).map((service) => {
            const isSelected = selectedServices.includes(service.id);
            const isHovered = hoveredId === service.id;

            return (
              <div 
                key={service.id}
                onClick={() => toggleService(service)}
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                   relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-40 group
                   ${isSelected 
                      ? 'bg-blue-50/80 border-[#0071e3] ring-1 ring-[#0071e3]' 
                      : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'}
                `}
              >
                 {/* TOOLTIP "REFLEJO" (Aparece DENTRO de la tarjeta, superpuesto) */}
                 {isHovered && (
                    <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-sm rounded-2xl p-4 flex flex-col justify-center items-center text-center animate-fade-in text-white pointer-events-none">
                        <Zap size={16} className="text-emerald-400 mb-2"/>
                        <p className="text-[10px] font-medium leading-tight">
                           "{service.intel}"
                        </p>
                        <div className="mt-2 text-[8px] uppercase tracking-widest text-slate-400 font-bold">
                           Click para activar
                        </div>
                    </div>
                 )}

                 <div className="flex justify-between items-start mb-2">
                    <div className={`p-2.5 rounded-xl transition-colors ${isSelected ? 'bg-[#0071e3] text-white' : 'bg-slate-100 text-slate-400'}`}>
                       <service.icon size={18} />
                    </div>
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-[#0071e3]' : 'text-slate-300'}`}>
                       {service.price}€
                    </span>
                 </div>
                 
                 <div>
                    <h4 className={`text-[10px] font-black uppercase leading-tight mb-1 ${isSelected ? 'text-[#0071e3]' : 'text-slate-900'}`}>
                       {service.name}
                    </h4>
                    <p className="text-[9px] font-medium text-slate-400 leading-tight line-clamp-2">
                       {service.desc}
                    </p>
                 </div>

                 {/* CHECK (AZUL SÓLIDO EXTERIOR) */}
                 {isSelected && (
                    <div className="absolute top-[-6px] right-[-6px] bg-white rounded-full p-0.5 shadow-sm animate-scale-in z-10">
                       <CheckCircle2 size={20} className="text-[#0071e3] fill-white" />
                    </div>
                 )}
              </div>
            );
         })}
      </div>

      {/* 4. FOOTER FLOTANTE */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky bottom-0 pb-4">
         <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inversión Total</div>
            <div className="text-2xl font-black text-slate-900">{totalImpact.toFixed(0)} €</div>
         </div>
         <button 
           onClick={() => onSelect('custom')}
           disabled={selectedServices.length === 0}
           className={`
             px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg
             ${selectedServices.length > 0 ? 'bg-[#0071e3] text-white hover:bg-[#0077ED] active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
           `}
         >
           Confirmar
         </button>
      </div>

    </div>
  );
}

