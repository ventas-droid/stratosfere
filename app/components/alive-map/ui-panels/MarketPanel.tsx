"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
    X, ArrowRight, Check, Star, Award, Crown, TrendingUp, Zap,
    Camera, Video, Globe, Box, Ruler, Megaphone, FileText, ArrowUp,
    FileCheck, Activity, LayoutGrid, MapPin, Droplets, Paintbrush, Truck, ShieldCheck
} from 'lucide-react';

// ==================================================================================
// 1. CATÁLOGO EXACTO (PRECIOS REALES DEL SISTEMA)
// ==================================================================================
const SERVICES_CATALOG = [
  // --- PACKS ---
  { id: "pack_basic", name: "KIT INICIADO", price: 29.9, category: "PACKS", icon: Star, desc: "Foto Pro + Plano + Certificado." },
  { id: "pack_pro", name: "KIT VISIBILIDAD", price: 99.9, category: "PACKS", icon: Award, desc: "Tour 3D + Portales Top + Redes." },
  { id: "pack_elite", name: "STRATOS GOD MODE", price: 199.9, category: "PACKS", icon: Crown, desc: "Todo incluido + Abogado + Open House." },
  { id: "pack_investor", name: "PACK INVERSOR", price: 149.9, category: "PACKS", icon: TrendingUp, desc: "Dossier rentabilidad + Emailing." },
  { id: "pack_express", name: "VENTA EXPRESS", price: 79.9, category: "PACKS", icon: Zap, desc: "Destacado agresivo 15 días." },

  // --- ONLINE ---
  { id: "foto", name: "FOTOGRAFÍA HDR", price: 99, category: "ONLINE", icon: Camera, desc: "Calidad revista. 20 fotos." },
  { id: "video", name: "VÍDEO CINE", price: 199.9, category: "ONLINE", icon: Video, desc: "Narrativa emocional 4K." },
  { id: "drone", name: "FOTOGRAFÍA DRONE", price: 120, category: "ONLINE", icon: Globe, desc: "Vistas aéreas del entorno." },
  { id: "tour3d", name: "TOUR VIRTUAL 3D", price: 150, category: "ONLINE", icon: Box, desc: "Matterport inmersivo." },
  { id: "destacado", name: "POSICIONAMIENTO", price: 49, category: "ONLINE", icon: ArrowUp, desc: "Siempre primero en listas." },
  { id: "ads", name: "PAID SOCIAL ADS", price: 79.9, category: "ONLINE", icon: Megaphone, desc: "Campaña Instagram & FB." },
  { id: "plano_2d", name: "PLANO TÉCNICO", price: 59, category: "ONLINE", icon: Ruler, desc: "Cotas y distribución 2D." },
  { id: "plano_3d", name: "PLANO 3D", price: 89, category: "ONLINE", icon: Box, desc: "Volumetría amueblada." },
  { id: "email", name: "EMAIL INVERSORES", price: 149, category: "ONLINE", icon: FileText, desc: "Acceso a base de datos VIP." },
  { id: "copy", name: "COPYWRITING PRO", price: 39, category: "ONLINE", icon: FileText, desc: "Textos persuasivos de venta." },

  // --- OFFLINE ---
  { id: "certificado", name: "CERTIFICADO ENERG.", price: 120, category: "OFFLINE", icon: FileCheck, desc: "Etiqueta oficial obligatoria." },
  { id: "cedula", name: "CÉDULA HABITAB.", price: 90, category: "OFFLINE", icon: FileText, desc: "Trámite ayuntamiento." },
  { id: "nota_simple", name: "NOTA SIMPLE", price: 20, category: "OFFLINE", icon: FileText, desc: "Verificación registral." },
  { id: "tasacion", name: "TASACIÓN OFICIAL", price: 250, category: "OFFLINE", icon: Activity, desc: "Valoración bancaria." },
  { id: "lona", name: "LONA FACHADA XL", price: 49.9, category: "OFFLINE", icon: LayoutGrid, desc: "Visibilidad física 24/7." },
  { id: "buzoneo", name: "BUZONEO PREMIUM", price: 29.9, category: "OFFLINE", icon: MapPin, desc: "Dominio del barrio (2000 u)." },
  { id: "revista", name: "REVISTA LUXURY", price: 59.9, category: "OFFLINE", icon: FileText, desc: "Prensa papel local." },
  { id: "openhouse", name: "OPEN HOUSE VIP", price: 149.9, category: "OFFLINE", icon: Zap, desc: "Evento puertas abiertas." },
  { id: "homestaging", name: "HOME STAGING", price: 299, category: "OFFLINE", icon: Box, desc: "Muebles de cartón/reales." },
  { id: "limpieza", name: "LIMPIEZA PRO", price: 89.9, category: "OFFLINE", icon: Droplets, desc: "Puesta a punto total." },
  { id: "pintura", name: "LAVADO DE CARA", price: 450, category: "OFFLINE", icon: Paintbrush, desc: "Pintura blanco neutro." },
  { id: "mudanza", name: "MUDANZA", price: 300, category: "OFFLINE", icon: Truck, desc: "Servicio logística." },
  { id: "seguro", name: "SEGURO IMPAGO", price: 199, category: "OFFLINE", icon: ShieldCheck, desc: "Protección alquiler/venta." },
];

// 🔥 FIX: AÑADIDO 'activeProperty' PARA QUE EL BOTÓN GESTIONAR FUNCIONE
export default function MarketPanel({ onClose, initialData, activeProperty }: any) {
  
  // ⚡️ EL CEREBRO: Aquí decidimos qué datos usar. Prioridad al Perfil (activeProperty)
  const incomingData = activeProperty || initialData;

  const [activeTab, setActiveTab] = useState<'ONLINE' | 'OFFLINE' | 'PACKS'>('ONLINE');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentProp, setCurrentProp] = useState<any>(null);
  
  // 🔒 Bolsillo para guardar Piscina, Garaje, etc.
  const preservedExtras = useRef<string[]>([]); 

  // ==============================================================================
  // 🟢 2. CARGA DE MEMORIA (AHORA ESCUCHA A 'incomingData')
  // ==============================================================================
  useEffect(() => {
    // Si no hay datos, abortamos
    if (!incomingData?.id) return;

    const targetId = String(incomingData.id);
    console.log(`🦅 Market: Intentando cargar ID: ${targetId}`);

    try {
        const savedData = localStorage.getItem('stratos_my_properties');
        if (savedData) {
            const allProps = JSON.parse(savedData);
            const freshProp = allProps.find((p: any) => String(p.id) === targetId);

            if (freshProp) {
                // ✅ ENCONTRADO EN MEMORIA
                setCurrentProp(freshProp);
                
                const fullList = Array.isArray(freshProp.selectedServices) 
                    ? freshProp.selectedServices 
                    : [];

                // 1. Lo que es Marketing (Fotos, Packs...) -> Al estado visual
                const visualServices = fullList.filter((id:string) => 
                    SERVICES_CATALOG.some(s => s.id === id)
                );

                // 2. Lo que es Físico (Piscina, Garaje...) -> Al bolsillo secreto
                const hiddenExtras = fullList.filter((id:string) => 
                    !SERVICES_CATALOG.some(s => s.id === id)
                );

                console.log("✅ Datos Restaurados. Servicios:", visualServices);
                setSelectedServices(visualServices);
                preservedExtras.current = hiddenExtras; 
            } else {
                // ⚠️ NO ESTÁ EN MEMORIA (Usamos lo que llega por props)
                console.log("⚠️ ID no hallado en Storage, usando datos directos.");
                setCurrentProp(incomingData);
                setSelectedServices(incomingData.selectedServices || []);
                preservedExtras.current = [];
            }
        } else {
             setCurrentProp(incomingData);
             setSelectedServices(incomingData.selectedServices || []);
        }
    } catch (err) { console.error("Error cargando Market:", err); }
  }, [incomingData?.id]); // 🔥 ESTO ES CLAVE: Escuchamos el ID correcto

  // --- INTERACCIÓN ---
  const toggleService = (id: string) => {
    let newList;
    if (id.startsWith('pack_')) {
        if (selectedServices.includes(id)) {
             newList = selectedServices.filter(s => s !== id);
        } else {
             const others = selectedServices.filter(s => !s.startsWith('pack_'));
             newList = [...others, id];
        }
    } else {
        if (selectedServices.includes(id)) {
            newList = selectedServices.filter(s => s !== id);
        } else {
            newList = [...selectedServices, id];
        }
    }
    setSelectedServices(newList);
  };

  // --- CÁLCULO DE ROL ---
  const calculateAuthority = () => { 
      let score = 0; 
      const count = selectedServices.filter((id) => !id.startsWith("pack_")).length; 
      score += count * 5; 
      if (selectedServices.includes("pack_basic")) score = Math.max(score, 20); 
      if (selectedServices.includes("pack_express")) score = Math.max(score, 35); 
      if (selectedServices.includes("pack_pro")) score = Math.max(score, 60); 
      if (selectedServices.includes("pack_investor")) score = Math.max(score, 80); 
      if (selectedServices.includes("pack_elite")) score = 100; 
      return Math.min(100, score); 
  };
  
  const authorityLevel = calculateAuthority();
  
  const getRoleLabel = (level: number) => { 
      if (level >= 100) return "LEYENDA"; 
      if (level >= 80) return "BROKER"; 
      if (level >= 60) return "PRO SELLER"; 
      if (level >= 35) return "AVANZADO"; 
      return "NOVATO"; 
  };

  const getRoleStyle = (level: number) => { 
      if (level >= 100) return { label: "LEYENDA", gradient: "from-indigo-500 via-purple-500 to-pink-500" }; 
      if (level >= 80) return { label: "BROKER", gradient: "from-emerald-400 to-cyan-500" }; 
      if (level >= 60) return { label: "PRO SELLER", gradient: "from-blue-400 to-indigo-500" }; 
      if (level >= 35) return { label: "AVANZADO", gradient: "from-amber-400 to-orange-500" }; 
      return { label: "NOVATO", gradient: "from-gray-300 to-gray-400" }; 
  };
  const roleStyle = getRoleStyle(authorityLevel);

  // --- CÁLCULO TOTAL ---
  const total = selectedServices.reduce((acc, id) => {
      const item = SERVICES_CATALOG.find(s => s.id === id);
      return acc + (item ? item.price : 0);
  }, 0);

  // --- ESTILOS DE ICONO ---
  const getIconColor = (item: any, isPack: boolean, isActive: boolean) => {
      if (isPack && !isActive) return "bg-white/10 text-white"; 
      if (isPack && isActive) return "bg-blue-50 text-blue-600";
      if (item.id.includes("video")) return "bg-purple-100 text-purple-600"; 
      if (item.id.includes("drone")) return "bg-sky-100 text-sky-600"; 
      return "bg-gray-100 text-gray-600"; 
  };

  // ==============================================================================
  // 💾 3. GUARDADO TURBO (ACTUALIZACIÓN INSTANTÁNEA)
  // ==============================================================================
  const handleConfirm = () => {
      if (!currentProp) return;

      try {
          const saved = localStorage.getItem('stratos_my_properties');
          if (saved) {
              const allProps = JSON.parse(saved);
              
              // 1. Preparamos los datos nuevos
              const finalServicesList = [...preservedExtras.current, ...selectedServices];
              const newRole = getRoleLabel(authorityLevel);
              
              // 2. Construimos el objeto actualizado EN MEMORIA
              const updatedProp = { 
                  ...currentProp, 
                  selectedServices: finalServicesList, 
                  role: newRole, 
                  impactLevel: authorityLevel,
                  strategyValue: total 
              };

              // 3. Guardamos en disco (Lento pero seguro)
              const updatedPropsList = allProps.map((p: any) => 
                  String(p.id) === String(currentProp.id) ? updatedProp : p
              );
              localStorage.setItem('stratos_my_properties', JSON.stringify(updatedPropsList));
              
              // ⚡️ 4. DISPARO INMEDIATO (TURBO)
              // Enviamos el objeto YA actualizado directamente a la interfaz.
              console.log("⚡️ Enviando actualización en caliente:", updatedProp);
              
              // Actualiza la ficha de detalles (Si está abierta)
              window.dispatchEvent(new CustomEvent('update-details-live', { detail: updatedProp }));
              
              // Actualiza la NanoCard en el mapa (Precio/Iconos)
              window.dispatchEvent(new CustomEvent('update-marker-signal', { detail: updatedProp }));
              
              // Fuerza recarga general por seguridad
              window.dispatchEvent(new CustomEvent('reload-profile-assets'));

              if(onClose) onClose();
          }
      } catch(e) { console.error("Error guardando:", e); }
  };
  
  const visibleServices = SERVICES_CATALOG.filter(s => s.category === activeTab);

  return (
    <div className="fixed inset-y-0 left-0 w-full md:w-[480px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left">
      <div className="absolute inset-0 bg-[#E5E5EA]/95 backdrop-blur-3xl shadow-2xl border-r border-white/20"></div>

      <div className="relative z-10 flex flex-col h-full font-sans text-slate-900">
        
        {/* CABECERA */}
        <div className="px-8 pt-10 pb-4 flex flex-col shrink-0">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-1">Market.</h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {currentProp ? currentProp.title : 'Estrategia'}
                    </p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer">
                        <X size={20} className="text-slate-900"/>
                    </button>
                )}
            </div>

            {/* NIVEL DE IMPACTO */}
            <div className="flex justify-between items-end mb-2 px-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nivel de Impacto</span>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-sm bg-gradient-to-r ${roleStyle.gradient}`}>
                    {roleStyle.label}
                </span>
            </div>
            
            <div className="flex gap-1 h-1.5 w-full mb-6">
                {[...Array(20)].map((_, i) => { 
                    const threshold = (i + 1) * 5; 
                    const isActive = authorityLevel >= threshold; 
                    return <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${isActive ? `bg-gradient-to-r ${roleStyle.gradient}` : "bg-slate-300 opacity-50"}`} />; 
                })}
            </div>

            {/* TABS */}
            <div className="bg-white/50 p-1 rounded-xl flex shadow-inner border border-white/50">
                {['ONLINE', 'OFFLINE', 'PACKS'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? "bg-white text-slate-900 shadow-sm scale-[1.02]" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        {tab === 'PACKS' && <Star size={10} className={`inline mr-1 mb-0.5 ${activeTab === tab ? 'text-yellow-500 fill-yellow-500' : ''}`}/>}
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {/* GRID */}
        <div className="flex-1 overflow-y-auto px-6 pb-32 custom-scrollbar scrollbar-hide">
            <div className="grid grid-cols-2 gap-3">
                {visibleServices.map((item) => {
                    const isActive = selectedServices.includes(item.id);
                    const isPack = item.category === "PACKS";
                    
                    let cardClasses = "group relative p-4 rounded-[24px] text-left transition-all duration-200 border-2 cursor-pointer flex flex-col justify-between min-h-[160px] overflow-hidden ";
                    let titleColor = "text-slate-900";
                    let descColor = "text-slate-400";
                    let priceLabelColor = "text-slate-300";
                    let priceValueColor = "text-slate-900";
                    let borderColor = "border-slate-50";

                    if (isPack) {
                        if (isActive) {
                            cardClasses += "bg-white border-blue-500 shadow-lg transform scale-[1.02] z-10";
                        } else {
                            cardClasses += "bg-[#1c1c1e] border-transparent hover:bg-black";
                            titleColor = "text-white";
                            descColor = "text-gray-400";
                            priceLabelColor = "text-gray-500";
                            priceValueColor = "text-white";
                            borderColor = "border-white/10";
                        }
                    } else {
                        if (isActive) {
                            cardClasses += "bg-white border-blue-500 shadow-lg transform scale-[1.02] z-10";
                        } else {
                            cardClasses += "bg-white border-transparent shadow-sm hover:shadow-md hover:border-slate-200";
                        }
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => toggleService(item.id)}
                            className={cardClasses}
                        >
                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : getIconColor(item, isPack, isActive)}`}>
                                    <item.icon size={18} strokeWidth={2} />
                                </div>
                                
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? "bg-blue-600 border-blue-600 scale-110 shadow-md" : (isPack && !isActive ? "border-white/20" : "border-slate-100 bg-slate-50")}`}>
                                    {isActive && <Check size={12} className="text-white" strokeWidth={4} />}
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className={`text-[11px] font-black leading-tight mb-1 uppercase ${titleColor}`}>
                                    {item.name}
                                </h3>
                                <p className={`text-[9px] font-medium line-clamp-2 leading-relaxed ${descColor}`}>
                                    {item.desc}
                                </p>
                            </div>

                            <div className={`mt-3 pt-3 border-t flex items-center justify-between ${borderColor}`}>
                                <span className={`text-[8px] font-black uppercase tracking-widest ${priceLabelColor}`}>
                                    Inversión
                                </span>
                                <span className={`text-sm font-black tracking-tight ${priceValueColor}`}>
                                    {/* 🔥 CORRECCIÓN DEL FORMATO DE PRECIO (GRID) 🔥 */}
                                    {item.price.toLocaleString('es-ES')}€
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-6 left-6 right-6 z-50">
             <div className="bg-[#1d1d1f] p-4 pl-6 pr-4 rounded-[24px] shadow-2xl flex items-center justify-between text-white border border-white/10">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Estimado</span>
                    <span className="text-2xl font-black text-white tracking-tighter">
                        {/* 🔥 CORRECCIÓN DEL FORMATO DE PRECIO (FOOTER) 🔥 */}
                        {total.toLocaleString('es-ES')}€
                    </span>
                </div>
                <button 
                    onClick={handleConfirm}
                    className="bg-white text-black px-6 py-3.5 rounded-[20px] font-black text-[10px] hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 uppercase tracking-wide cursor-pointer"
                >
                    CONFIRMAR <ArrowRight size={14} strokeWidth={3}/>
                </button>
             </div>
        </div>

      </div>
    </div>
  );
}



