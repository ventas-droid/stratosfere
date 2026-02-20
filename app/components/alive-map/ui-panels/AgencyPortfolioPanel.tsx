// @ts-nocheck
"use client";

import React, { useState } from "react";
import { 
  X, Plus, Home, Edit3, Trash2, MapPin, Zap, 
  Waves, Car, Trees, ShieldCheck, ArrowUp, Sun, Box, Star, Award, Crown, 
  TrendingUp, Camera, Globe, Plane, Hammer, Ruler, LayoutGrid, Share2, 
  Mail, FileText, FileCheck, Activity, Newspaper, KeyRound, Sofa, 
  Droplets, Paintbrush, Truck, Briefcase, Sparkles, Clock, Check, 
  Lock, Handshake, Eye, MessageCircle, Calculator, Coins, Navigation 
} from "lucide-react";

// --- DICCIONARIO DE ICONOS ---
const ICON_MAP: Record<string, any> = {
    'pool': Waves, 'piscina': Waves, 'garage': Car, 'garaje': Car,
    'garden': Trees, 'jardin': Trees, 'jardín': Trees,
    'security': ShieldCheck, 'seguridad': ShieldCheck,
    'elevator': ArrowUp, 'ascensor': ArrowUp,
    'terrace': Sun, 'terraza': Sun,
    'storage': Box, 'trastero': Box, 'ac': Zap,
    'pack_basic': Star, 'pack_pro': Award, 'pack_elite': Crown, 
    'pack_investor': TrendingUp, 'pack_express': Zap,
    'foto': Camera, 'video': Globe, 'drone': Plane, 
    'tour3d': Box, 'render': Hammer, 'plano_2d': Ruler, 'plano_3d': LayoutGrid, 
    'destacado': TrendingUp, 'ads': Share2, 'email': Mail, 
    'certificado': FileCheck, 'cedula': FileText, 'nota_simple': FileText, 
    'tasacion': Activity, 'lona': LayoutGrid, 'buzoneo': MapPin, 
    'revista': Newspaper, 'openhouse': KeyRound, 'homestaging': Sofa, 
    'limpieza': Droplets, 'pintura': Paintbrush, 'mudanza': Truck, 
    'seguro': ShieldCheck, 'abogado': Briefcase
};

const normalizeKey = (v: any) => String(v || '').toLowerCase().trim();

const getServiceIds = (prop: any): string[] => {
    let ids = Array.isArray(prop?.selectedServices) ? prop.selectedServices : [];
    if (prop.pool) ids.push('pool');
    if (prop.garage) ids.push('garage');
    if (prop.terrace) ids.push('terrace');
    const filtered = ids.filter((id: any) => normalizeKey(id) && !['pool','garage','terrace'].includes(normalizeKey(id))); 
    return Array.from(new Set(filtered));
};

export default function AgencyPortfolioPanel({ 
  isOpen, onClose, onEditProperty, onCreateNew, properties, onDelete 
}: any) {
  
  const [contractModalProp, setContractModalProp] = useState<any | null>(null);
  const [servicesModalProp, setServicesModalProp] = useState<any | null>(null);

  if (!isOpen) return null;
  const safeList = Array.isArray(properties) ? properties : [];

  // 🔥 VUELO TÁCTICO (SOLUCIONA EL CONFLICTO DE REDIMENSIÓN)
  const handleFlyTo = (e: any, p: any) => {
    e.stopPropagation();

    try {
      // 1. EXTRACCIÓN Y CONVERSIÓN INMEDIATA
      // Buscamos el dato donde sea y aseguramos que sea NÚMERO
      let lng = p.coordinates?.[0] ?? p.longitude ?? p.lng;
      let lat = p.coordinates?.[1] ?? p.latitude ?? p.lat;

      lng = parseFloat(String(lng));
      lat = parseFloat(String(lat));

      // 2. VALIDACIÓN ESTRICTA
      // Si no es un número real o es 0 (océano), no intentamos volar
      let target = null;
      if (Number.isFinite(lng) && Number.isFinite(lat) && (Math.abs(lng) > 0.0001 || Math.abs(lat) > 0.0001)) {
          target = [lng, lat];
      }

      // 3. DATOS B2B
      const b2bData = p.b2b || (p.activeCampaign ? {
          sharePct: Number(p.activeCampaign.commissionSharePct || 0),
          visibility: p.activeCampaign.commissionShareVisibility || 'PRIVATE'
      } : null);

      const richPayload = {
          ...p,
          id: String(p.id),
          coordinates: target, 
          b2b: b2bData,
          user: p.user || p.ownerSnapshot || { name: "Agencia" },
          isCaptured: p.isCaptured || (p.activeCampaign?.status === 'ACCEPTED'),
          activeCampaign: p.activeCampaign
      };

      console.log(`🦅 Agencia -> Secuencia de vuelo iniciada hacia:`, target);

      // 4. PASO A: SELECCIÓN Y APERTURA DE PANEL (Inmediato)
      window.dispatchEvent(new CustomEvent("select-property-signal", { detail: { id: String(p.id) } }));
      window.dispatchEvent(new CustomEvent("open-details-signal", { detail: richPayload }));

      // 5. PASO B: VUELO RETARDADO (La clave del éxito)
      // Esperamos 200ms a que el panel empiece a abrirse para que el mapa no cancele el vuelo.
      if (target) {
          setTimeout(() => {
              window.dispatchEvent(new CustomEvent('fly-to-location', { 
                  detail: { 
                      center: target, 
                      zoom: 18.5, 
                      pitch: 60, 
                      duration: 1500 
                  } 
              }));
          }, 200); 
      } else {
          console.warn("⚠️ Coordenadas inválidas, no se vuela.");
      }

    } catch (err) { console.error("Error vuelo:", err); }
  };

  // 🔥 CHAT REAL
  const handleChat = (p: any) => {
      const targetUser = p.clientData || p.user;
      if (targetUser && targetUser.id) {
          window.dispatchEvent(
              new CustomEvent("open-chat-with-user", { 
                  detail: { 
                      userId: targetUser.id,
                      userName: targetUser.name,
                      propertyId: p.id,
                      propertyRef: p.refCode
                  } 
              })
          );
      } else {
          alert("Error: No se puede contactar con el propietario.");
      }
  };

  return (
    <div className="absolute inset-y-0 right-0 w-[480px] max-w-full z-[50000] bg-[#F8F9FB] border-l border-black/5 flex flex-col shadow-2xl animate-slide-in-right font-sans pointer-events-auto">
      
      {/* HEADER */}
      <div className="p-6 pb-4 bg-white/90 backdrop-blur-xl sticky top-0 z-10 flex justify-between items-center border-b border-gray-100">
          <div>
              <button onClick={onClose} className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest mb-1">
                 <X size={12} /> CERRAR
              </button>
              <h2 className="text-2xl font-black text-black tracking-tight">Mi Cartera</h2>
          </div>
          <button onClick={onCreateNew} className="bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2 cursor-pointer">
             <Plus size={14}/> NUEVO
          </button>
      </div>

      {/* LISTA */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {safeList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-4"><Home size={32} className="text-black/30"/></div>
                  <p className="text-sm font-bold text-black/50">STOCK VACÍO</p>
              </div>
          )}

          {safeList.map((p: any) => {
              const mainImg = p.img || (p.images && p.images[0]?.url) || "";
              const priceDisplay = p.formattedPrice || (typeof p.price === 'number' ? `${p.price.toLocaleString()}€` : p.price) || "Consultar";
              const titleDisplay = p.title || "Propiedad Sin Nombre";
              const addressDisplay = p.address || "Ubicación Privada";
              
              const isRadar = p.isCaptured && p.activeCampaign;
              const activeServices = isRadar ? (p.activeCampaign.services || []) : getServiceIds(p);

              return (
                  <div key={p.id} className={`p-4 rounded-[24px] transition-all group relative overflow-hidden ${isRadar ? 'bg-white shadow-[0_4px_20px_rgba(79,70,229,0.1)] ring-1 ring-indigo-50' : 'bg-white shadow-sm border border-gray-100'}`}>
                      
                      {isRadar && (
                          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black px-3 py-1.5 rounded-bl-xl tracking-widest uppercase z-10 flex items-center gap-1 shadow-md">
                              <Zap size={8} className="fill-white animate-pulse" /> Captada por Radar
                          </div>
                      )}

                      <div className="flex gap-4">
                          {/* FOTO: CLICK PARA VOLAR */}
                          <div 
                              className="w-20 h-20 rounded-[20px] overflow-hidden bg-gray-100 shrink-0 cursor-pointer hover:opacity-90 transition-opacity relative shadow-inner" 
                              onClick={(e) => handleFlyTo(e, p)}
                          >
                             <img src={mainImg} className="w-full h-full object-cover" alt={titleDisplay}/>
                             {isRadar && <div className="absolute inset-0 bg-indigo-900/5 mix-blend-multiply pointer-events-none"/>}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h3 className="font-extrabold text-base text-slate-900 leading-tight mb-0.5 truncate" title={titleDisplay}>{titleDisplay}</h3>
                              
                              {p.refCode && (
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                      REF: <span className="text-slate-600">{p.refCode}</span>
                                  </p>
                              )}

                              <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold mb-2 truncate">
                                <MapPin size={10} /> <span className="truncate">{addressDisplay}</span>
                              </div>
                              <div className="text-xl font-black text-slate-900 tracking-tight leading-none">{priceDisplay}</div>
                          </div>
                      </div>

                     {/* ========================================== */}
                      {/* 🌟 ZONA SAAS UNIFICADA (PARA TODAS LAS PROPIEDADES) 🌟 */}
                      {/* ========================================== */}
                      <div className="mt-4 pt-3 border-t border-indigo-50">
                          <div className="bg-indigo-50/40 rounded-xl p-3 border border-indigo-100/50">
                              <div className="flex justify-between items-center mb-3">
                                  <div className="flex items-center gap-2">
                                      {/* Leemos si es EXCLUSIVA desde cualquier origen (creada o heredada) */}
                                      {p.mandateType === "EXCLUSIVE" || p.activeCampaign?.mandateType === "EXCLUSIVE" || p.radarType === "EXCLUSIVE" ? (
                                          <div className="flex items-center gap-1 px-2 py-1 bg-white border border-indigo-100 text-indigo-700 rounded-lg shadow-sm">
                                              <Lock size={10} />
                                              <span className="text-[9px] font-black tracking-wider uppercase">EXCLUSIVA</span>
                                          </div>
                                      ) : (
                                          <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg">
                                              <FileText size={10} />
                                              <span className="text-[9px] font-black tracking-wider uppercase">MANDATO SIMPLE</span>
                                          </div>
                                      )}
                                  </div>
                              </div>
                              
                              <button 
                                  onClick={(e) => {
                                      e.stopPropagation(); // Evita clics fantasma
                                      setContractModalProp(p);
                                  }} 
                                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200"
                              >
                                  <Eye size={12} /> Ver Expediente Oficial
                              </button>
                          </div>
                      </div>
                      {/* ========================================== */}
                      {/* BOTONERA */}
                      <div className="mt-4 flex gap-2">
                          {/* BOTÓN VOLAR */}
                          <button 
                              onClick={(e) => handleFlyTo(e, p)} 
                              className="h-10 w-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-black hover:text-white flex items-center justify-center transition-colors" 
                              title="Volar a la propiedad"
                          >
                              <Navigation size={16} strokeWidth={2}/>
                          </button>

                          {/* BOTÓN CHAT */}
                          {isRadar && (
                              <button onClick={() => handleChat(p)} className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors border border-emerald-100">
                                  <MessageCircle size={16} strokeWidth={2}/>
                              </button>
                          )}

                          <button onClick={() => onEditProperty(p)} className="flex-1 h-10 bg-white border border-gray-200 text-gray-700 hover:border-black hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                              <Edit3 size={14} /> Gestionar
                          </button>

                          <button onClick={(e) => { e.stopPropagation(); if(confirm("¿Eliminar?")) onDelete && onDelete(p); }} className="h-10 w-10 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                              <Trash2 size={16} strokeWidth={2}/>
                          </button>
                      </div>
                  </div>
              );
          })}
          <div className="h-24"></div> 
      </div>

     {/* MODAL SERVICIOS */}
      {servicesModalProp && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-md animate-fade-in" onClick={() => setServicesModalProp(null)}>
            <div className="w-[400px] bg-white rounded-[2rem] p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="grid grid-cols-2 gap-3">
                    {getServiceIds(servicesModalProp).map((srvId: string) => {
                        return <div key={srvId} className="p-3 bg-gray-50 rounded-xl text-xs font-bold uppercase text-center">{srvId.replace(/_/g, ' ')}</div>
                    })}
                </div>
            </div>
        </div>
      )}

     {/* ================================================================================== */}
      {/* 🌟 MODAL EXPEDIENTE COMPLETO (MOTOR FINANCIERO PREMIUM) 🌟 */}
      {/* ================================================================================== */}
      {contractModalProp && (
          <div className="fixed inset-0 z-[60000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in" onClick={() => setContractModalProp(null)}>
              {/* Modal más ancho (850px) para acomodar los datos financieros */}
              <div className="bg-white w-[850px] max-w-full rounded-[30px] overflow-hidden shadow-2xl animate-scale-in flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                  
                  {(() => {
                      // 1. EXTRACCIÓN DE DATOS
                      const price = Number(contractModalProp.rawPrice || String(contractModalProp.price || "0").replace(/[^0-9]/g, ""));
                      const commissionPct = Number(contractModalProp.activeCampaign?.commissionPct ?? contractModalProp.commissionPct ?? 0);
                      const vatPct = 21; 
                      const sharePct = Number(contractModalProp.activeCampaign?.commissionSharePct ?? contractModalProp.sharePct ?? contractModalProp.b2b?.sharePct ?? 0);
                      const isB2bActive = sharePct > 0;
                      
// Lógica limpia para el Mandato y los Meses
const mandateType = contractModalProp.mandateType || contractModalProp.activeCampaign?.mandateType || "MANDATO SIMPLE";

// 🔥 EL CABLE DE LOS MESES CONECTADO AL PANEL 🔥
// Leemos directamente el número. Si por algún motivo no hay nada guardado, ponemos 6 por defecto.
const rawMonths = contractModalProp.activeCampaign?.exclusiveMonths || contractModalProp.exclusiveMonths || 6;
const duration = `${rawMonths} MESES`;
                      // 2. MATEMÁTICAS - AGENCIA CAPTADORA
                      const commissionAmount = price * (commissionPct / 100);
                      const vatAmount = commissionAmount * (vatPct / 100);
                      const totalCommission = commissionAmount + vatAmount;

                      // 3. MATEMÁTICAS - AGENCIA COLABORADORA
                      const collabAmount = commissionAmount * (sharePct / 100);
                      const collabVat = collabAmount * (vatPct / 100);
                      const collabTotal = collabAmount + collabVat;

                      const formatCurrency = (amount: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

                      return (
                          <>
                              {/* HEADER OSCURO PREMIUM */}
                              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden shrink-0">
                                  <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"/>
                                  
                                  <div className="flex justify-between items-start relative z-10">
                                      <div className="flex-1 pr-4">
                                          <p className="text-[10px] font-black tracking-[0.3em] opacity-70 uppercase mb-2 text-blue-300">Expediente Oficial</p>
                                          <h3 className="text-3xl font-black truncate">{contractModalProp.title || "Propiedad sin título"}</h3>
                                          <p className="text-slate-400 text-xs font-bold mt-1.5 uppercase tracking-wider">REF: {contractModalProp.refCode || "---"}</p>
                                      </div>
                                      
                                      {/* PRECIO DE VENTA A LA DERECHA */}
                                      <div className="flex flex-col items-end text-right shrink-0 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Precio Venta Actual</p>
                                          <p className="text-3xl font-black text-emerald-400 tracking-tight">{formatCurrency(price)}</p>
                                      </div>
                                  </div>
                                  
                              {/* BADGES */}
                                  <div className="flex gap-2 mt-6 relative z-10">
                                     <div className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 uppercase shadow-sm">
                                        <Lock size={12} className="text-blue-300" /> {mandateType}
                                     </div>
                                     <div className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 uppercase shadow-sm">
                                        <Clock size={12} className="text-amber-300" /> {duration}
                                     </div>
                                  </div>
                              </div>

                              {/* BODY: DESGLOSES FINANCIEROS */}
                              <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar bg-slate-50">
                                  
                                  {/* BLOQUE 1: TUS HONORARIOS (AGENCIA CAPTADORA) */}
                                  <div>
                                      <div className="flex items-center justify-between mb-4 px-1">
                                          <p className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                              <Calculator size={16} className="text-blue-600"/> Honorarios Agencia Captadora
                                          </p>
                                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-[10px] font-bold border border-blue-200 shadow-sm">
                                              TU COMISIÓN: {commissionPct}%
                                          </span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-4">
                                          <div className="p-5 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Base Imponible</p>
                                              <p className="text-xl font-black text-slate-800 tracking-tight">{formatCurrency(commissionAmount)}</p>
                                          </div>
                                          <div className="p-5 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">IVA ({vatPct}%)</p>
                                              <p className="text-xl font-black text-slate-800 tracking-tight">{formatCurrency(vatAmount)}</p>
                                          </div>
                                          <div className="p-5 bg-blue-600 rounded-2xl border border-blue-700 text-center shadow-md text-white">
                                              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Total a Facturar</p>
                                              <p className="text-2xl font-black tracking-tight">{formatCurrency(totalCommission)}</p>
                                          </div>
                                      </div>
                                  </div>

                                  {/* BLOQUE 2: COLABORACIÓN B2B */}
                                  {isB2bActive ? (
                                      <div className="relative pt-8 border-t border-slate-200 border-dashed">
                                          <div className="flex items-center justify-between mb-4 px-1">
                                              <p className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                                                  <Handshake size={16} className="text-emerald-600"/> Reparto Colaborador (B2B)
                                              </p>
                                              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md text-[10px] font-bold border border-emerald-200 shadow-sm">
                                                  COMPARTES: {sharePct}%
                                              </span>
                                          </div>
                                          <div className="grid grid-cols-3 gap-4">
                                              <div className="p-5 bg-white rounded-2xl border border-emerald-100 text-center shadow-sm">
                                                  <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Base Cedida</p>
                                                  <p className="text-lg font-black text-emerald-900 tracking-tight">{formatCurrency(collabAmount)}</p>
                                              </div>
                                              <div className="p-5 bg-white rounded-2xl border border-emerald-100 text-center shadow-sm">
                                                  <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1">IVA ({vatPct}%)</p>
                                                  <p className="text-lg font-black text-emerald-900 tracking-tight">{formatCurrency(collabVat)}</p>
                                              </div>
                                              <div className="p-5 bg-emerald-500 rounded-2xl border border-emerald-600 text-center shadow-md text-white">
                                                  <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mb-1">Total Colaborador</p>
                                                  <p className="text-2xl font-black tracking-tight">{formatCurrency(collabTotal)}</p>
                                              </div>
                                          </div>
                                      </div>
                                  ) : (
                                      <div className="pt-6 border-t border-slate-200 border-dashed">
                                          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-100/50 flex items-center gap-4">
                                              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                                                  <Handshake size={24}/>
                                              </div>
                                              <div>
                                                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-0.5">Sin Colaboración Activa</p>
                                                  <p className="text-xs font-medium text-slate-400">Esta propiedad no comparte honorarios con otras agencias.</p>
                                              </div>
                                          </div>
                                      </div>
                                  )}

                              </div>
                              
                              {/* FOOTER */}
                              <div className="p-6 bg-white border-t border-slate-100 flex justify-end shrink-0">
                                  <button onClick={() => setContractModalProp(null)} className="px-10 py-4 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                                      <Check size={16} /> Cerrar Expediente
                                  </button>
                              </div>
                          </>
                      );
                  })()}
              </div>
          </div>
      )}
    </div>
  );
}