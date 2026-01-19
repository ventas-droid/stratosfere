// @ts-nocheck
"use client";

import React, { useState } from "react";
import { 
  X, Plus, Home, Edit3, Trash2, MapPin, Zap, 
  // 🔥 IMPORTACIÓN MASIVA DE ICONOS DE SERVICIOS (IGUAL QUE EN PROFILE)
  Waves, Car, Trees, ShieldCheck, ArrowUp, Sun, Box, Star, Award, Crown, 
  TrendingUp, Camera, Globe, Plane, Hammer, Ruler, LayoutGrid, Share2, 
  Mail, FileText, FileCheck, Activity, Newspaper, KeyRound, Sofa, 
  Droplets, Paintbrush, Truck, Briefcase, Sparkles 
} from "lucide-react";

// --- 1. DICCIONARIO MAESTRO DE ICONOS (EL CEREBRO VISUAL) ---
const ICON_MAP: Record<string, any> = {
    'pool': Waves, 'piscina': Waves,
    'garage': Car, 'garaje': Car,
    'garden': Trees, 'jardin': Trees, 'jardín': Trees,
    'security': ShieldCheck, 'seguridad': ShieldCheck,
    'elevator': ArrowUp, 'ascensor': ArrowUp,
    'terrace': Sun, 'terraza': Sun,
    'storage': Box, 'trastero': Box, 'ac': Zap,
    'pack_basic': Star, 'pack_pro': Award, 'pack_elite': Crown, 
    'pack_investor': TrendingUp, 'pack_express': Zap,
    'foto': Camera, 'video': Globe, 'drone': Plane, 
    'tour3d': Box, 'render': Hammer, 'plano_2d': Ruler, 'plano_3d': LayoutGrid, 
    'destacado': TrendingUp, 'ads': Share2, 'email': Mail, 'copy': FileText, 
    'certificado': FileCheck, 'cedula': FileText, 'nota_simple': FileText, 
    'tasacion': Activity, 'lona': LayoutGrid, 'buzoneo': MapPin, 
    'revista': Newspaper, 'openhouse': KeyRound, 'homestaging': Sofa, 
    'limpieza': Droplets, 'pintura': Paintbrush, 'mudanza': Truck, 
    'seguro': ShieldCheck, 'abogado': Briefcase
};

// --- 2. LÓGICA DE EXTRACCIÓN DE SERVICIOS REALES ---
const normalizeKey = (v: any) => String(v || '').toLowerCase().trim();

const NON_SERVICE_KEYS = new Set([
    'pool','piscina','garden','jardin','jardín','garage','garaje',
    'security','seguridad','elevator','ascensor','parking','aparcamiento',
    'trastero','storage','terraza','terraz','balcon','balcón',
    'aire','air','aircon','ac','calefaccion','calefacción','heating',
    'm2','mbuilt','m_built','bed','beds','bath','baths','room','rooms'
]);

// Esta función extrae los servicios REALES de la propiedad
const getServiceIds = (prop: any): string[] => {
    // 1. Servicios explícitos
    let ids = Array.isArray(prop?.selectedServices) ? prop.selectedServices : [];
    
    // 2. Servicios implícitos (checkbounds de características)
    if (prop.pool) ids.push('pool');
    if (prop.garage) ids.push('garage');
    if (prop.elevator) ids.push('elevator');
    if (prop.terrace) ids.push('terrace');
    if (prop.garden) ids.push('garden');
    if (prop.storage) ids.push('storage');
    if (prop.ac) ids.push('ac');
    if (prop.security) ids.push('security');

    // 3. Limpieza de duplicados y claves básicas
    const filtered = ids.filter((id: any) => {
        const k = normalizeKey(id);
        if (!k) return false;
        // Opcional: Si quiere mostrar camas/baños como servicio quite esto, 
        // pero normalmente se ocultan aquí para dejarlos en la ficha técnica.
        return !NON_SERVICE_KEYS.has(k);
    });
    return Array.from(new Set(filtered));
};

export default function AgencyPortfolioPanel({ 
  isOpen, 
  onClose, 
  onEditProperty, 
  onCreateNew,
  properties, 
  onDelete,
  onSelect 
}: any) {
  
  // Estado para el modal de "Ver Todo"
  const [servicesModalProp, setServicesModalProp] = useState<any | null>(null);

  if (!isOpen) return null;

  const safeList = Array.isArray(properties) ? properties : [];
const openFromStock = (p: any) => {
  try {
    // 1) Abrir Details DIRECTO (esto es lo esencial)
    window.dispatchEvent(new CustomEvent("open-details-signal", { detail: p }));

    // 2) (Opcional) fijar selección para el mapa (por coherencia)
    window.dispatchEvent(
      new CustomEvent("select-property-signal", { detail: { id: String(p?.id) } })
    );

    // 3) (Opcional) vuelo de cámara si hay coords
    const center =
      Array.isArray(p?.coordinates) ? p.coordinates :
      (p?.longitude && p?.latitude) ? [p.longitude, p.latitude] :
      null;

    if (center) {
      window.dispatchEvent(
        new CustomEvent("map-fly-to", {
          detail: { center, zoom: 17, pitch: 55, duration: 1200 },
        })
      );
    }
  } catch (e) {
    console.error("open-details from portfolio failed:", e);
  }
};

  return (
    <div className="absolute inset-y-0 right-0 w-[460px] max-w-full z-[50000] bg-[#F2F2F7] border-l border-black/5 flex flex-col shadow-2xl animate-slide-in-right font-sans pointer-events-auto">
      
      {/* HEADER */}
      <div className="p-6 pb-4 bg-[#F2F2F7]/95 backdrop-blur-xl sticky top-0 z-10 flex justify-between items-center border-b border-black/5">
          <div>
              <div className="flex items-center gap-2 mb-1">
                 <button onClick={onClose} className="flex items-center gap-1 text-xs font-bold text-black/40 hover:text-black transition-colors uppercase tracking-widest">
                    <X size={14} /> CERRAR PANEL
                 </button>
              </div>
              <h2 className="text-3xl font-extrabold text-black tracking-tighter">Mi Stock</h2>
          </div>
          <button 
            onClick={onCreateNew}
            className="bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
          >
             <Plus size={14}/> CREAR NUEVO
          </button>
      </div>

      {/* LISTA DE ACTIVOS */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          
          {/* ESTADO VACÍO */}
          {safeList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-4">
                      <Home size={32} className="text-black/30"/>
                  </div>
                  <p className="text-sm font-bold text-black/50">STOCK VACÍO</p>
                  <p className="text-xs text-black/30 mt-1">Crea tu primera propiedad arriba</p>
              </div>
          )}

          {/* TARJETAS INTELIGENTES (IDÉNTICAS A PARTICULARES) */}
          {safeList.map((p: any) => {
              // Datos Visuales
              const mainImg = p.img || (p.images && p.images[0]) || (p.images && p.images[0]?.url) || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=500&q=60";
              const priceDisplay = p.formattedPrice || (typeof p.price === 'number' ? `${p.price.toLocaleString()}€` : p.price) || "Consultar";
              const titleDisplay = p.title || "Propiedad Sin Nombre";
              const addressDisplay = p.address || p.location || "Ubicación Privada";
              
              // 🔥 EXTRACCIÓN REAL DE SERVICIOS
              const serviceIds = getServiceIds(p);
              const hasServices = serviceIds.length > 0;

              return (
                  <div key={p.id} className="bg-white p-5 rounded-[32px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-white hover:border-black/5 transition-all group relative overflow-hidden">
                      
                      {/* HEADER TARJETA */}
                      <div className="flex gap-5">
                          {/* FOTO + BADGE ONLINE */}
                          <div 
                             className="w-24 h-24 rounded-[24px] overflow-hidden bg-gray-100 shrink-0 cursor-pointer hover:opacity-90 transition-opacity relative shadow-inner"
                             onClick={() => openFromStock(p)}

                          >
                             <img src={mainImg} className="w-full h-full object-cover" alt={titleDisplay}/>
                             <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded shadow-sm tracking-widest uppercase">
                                ONLINE
                             </div>
                          </div>

                         {/* INFO TEXTO */}
<div className="flex-1 min-w-0 flex flex-col justify-center">
  <h3
    className="font-extrabold text-xl text-black leading-none mb-2 truncate"
    title={titleDisplay}
  >
    {titleDisplay}
  </h3>

  {/* ✅ REF CODE */}
  {p?.refCode ? (
    <div className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">
      Ref: <span className="font-mono text-black/60">{p.refCode}</span>
    </div>
  ) : null}

  <div className="flex items-center gap-1.5 text-black/40 text-[11px] font-bold mb-3 truncate">
    <MapPin size={12} />
    <span className="truncate">{addressDisplay}</span>
  </div>

  <div className="text-2xl font-black text-black tracking-tight leading-none">
    {priceDisplay}
  </div>
</div>

                      </div>

                      {/* 🔥 SECCIÓN ESTRATEGIA REAL (SERVICIOS) */}
                      {hasServices ? (
                          <div className="mt-5 pt-4 border-t border-black/5">
                              <div className="flex items-center gap-2 mb-3">
                                  <Zap size={12} className="text-amber-400 fill-amber-400" />
                                  <span className="text-[10px] font-black text-black/30 tracking-widest uppercase">ESTRATEGIA ACTIVA</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                  {/* RENDERIZADO DINÁMICO DE LOS PRIMEROS 4 SERVICIOS */}
                                  {serviceIds.slice(0, 4).map((srvId: string) => {
                                      const key = normalizeKey(srvId);
                                      const Icon = ICON_MAP[key] || ICON_MAP[normalizeKey(srvId)] || Sparkles;
                                      const isPack = key.startsWith('pack');
                                      const label = srvId.replace('pack_', '').replace(/_/g, ' ');

                                      return (
                                          <div key={srvId} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wide ${isPack ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white border-black/5 text-black/60 shadow-sm'}`}>
                                              <Icon size={12} />
                                              <span>{label}</span>
                                          </div>
                                      );
                                  })}
                                  
                                  {/* BOTÓN "VER TODO" (ABRE MODAL) */}
                                  {serviceIds.length > 4 && (
                                      <button 
                                          onClick={(e) => { e.stopPropagation(); setServicesModalProp(p); }}
                                          className="px-3 py-1.5 bg-black text-white rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-zinc-800 transition-colors"
                                      >
                                          VER TODO · +{serviceIds.length - 4}
                                      </button>
                                  )}
                              </div>
                          </div>
                      ) : (
                          // Placeholder si no tiene servicios (Opcional, puede quitarlo si prefiere vacío)
                          <div className="mt-5 pt-4 border-t border-black/5 opacity-50">
                              <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest flex items-center gap-2">
                                  <Zap size={12}/> Sin estrategia activa
                              </p>
                          </div>
                      )}

                      {/* BOTONERA DE ACCIÓN (SIN MARKET) */}
                      <div className="mt-5 flex items-center gap-2">
                          
                          {/* 1. VOLAR */}
                          <button 
onClick={() => openFromStock(p)}
                            className="w-12 h-12 flex items-center justify-center rounded-[18px] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-105 active:scale-95 transition-all border border-emerald-100/50"
                            title="Ver en Mapa"
                          >
                              <Home size={18} strokeWidth={2.5}/>
                          </button>

                          {/* 2. GESTIONAR (GRANDE) */}
                          <button 
                            onClick={() => onEditProperty(p)}
                            className="flex-1 h-12 bg-[#252525] hover:bg-black text-white rounded-[18px] flex items-center justify-center gap-2 text-xs font-black tracking-wider uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                          >
                              <Edit3 size={14} /> GESTIONAR
                          </button>
{/* 3. BORRAR */}
<button
  onClick={(e) => {
    e.stopPropagation();

    const pid = String(p?.id || "").trim();
    if (!pid) return;

    // ✅ Mensaje correcto según sea tuya o sea solo favorito
    const msg = p?.isOwner
      ? "¿Eliminar propiedad permanentemente?"
      : "¿Quitar este activo de tu Stock? (solo se elimina de favoritos)";

    if (!confirm(msg)) return;

    // ✅ Enviamos id string garantizado (sin romper tu firma actual)
    if (onDelete) onDelete({ ...p, id: pid });

    // ✅ Señales para sincronizar corazones/NanoCard/Bóveda al instante
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("update-property-signal", {
          detail: {
            id: pid,
            updates: { isFav: false, isFavorited: false, isFavorite: false },
          },
        })
      );

      window.dispatchEvent(
        new CustomEvent("fav-change-signal", {
          detail: { id: pid, isFavorite: false },
        })
      );
    }
  }}
  className="w-12 h-12 flex items-center justify-center rounded-[18px] bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 hover:scale-105 active:scale-95 transition-all border border-red-100/50"
  title="Eliminar"
>
  <Trash2 size={18} strokeWidth={2.5} />
</button>


                      </div>
                  </div>
              );
          })}
          
          <div className="h-24"></div> 
      </div>

      {/* MODAL DE SERVICIOS (VER TODO) */}
      {servicesModalProp && (
        <div
            className="fixed inset-0 z-[999999] pointer-events-auto flex items-center justify-center bg-black/40 backdrop-blur-md animate-fade-in"
            onClick={() => setServicesModalProp(null)}
        >
            <div
                className="w-[min(600px,90vw)] bg-white rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden animate-slide-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-8 pt-8 pb-4 flex items-start justify-between border-b border-gray-100">
                    <div>
                        <p className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase flex items-center gap-2">
                            <Sparkles size={12} className="text-emerald-500" /> ESTRATEGIA COMPLETA
                        </p>
                        <h3 className="text-2xl font-black tracking-tight text-black mt-2">
                            {servicesModalProp.title || "Propiedad"}
                        </h3>
                    </div>
                    <button
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        onClick={() => setServicesModalProp(null)}
                    >
                        <X size={18} className="text-gray-500"/>
                    </button>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {getServiceIds(servicesModalProp).map((srvId: string) => {
                            const key = normalizeKey(srvId);
                            const Icon = ICON_MAP[key] || ICON_MAP[srvId] || Sparkles;
                            const isPack = key.startsWith('pack');
                            const label = srvId.replace('pack_', '').replace(/_/g, ' ');

                            return (
                                <div key={srvId} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-3xl border border-gray-100 hover:border-emerald-200 transition-colors text-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPack ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-black shadow-sm'}`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-600">{label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}