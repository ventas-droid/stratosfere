// @ts-nocheck
"use client";

import React, { useState } from "react";
import { 
  X, Plus, Home, Edit3, Trash2, MapPin, Zap, 
  Waves, Car, Trees, ShieldCheck, ArrowUp, Sun, Box, Star, Award, Crown, 
  TrendingUp, Camera, Globe, Plane, Hammer, Ruler, LayoutGrid, Share2, 
  Mail, FileText, FileCheck, Activity, Newspaper, KeyRound, Sofa, 
  Droplets, Paintbrush, Truck, Briefcase, Sparkles, 
  Lock, Handshake, Eye, MessageCircle, Calculator, Coins, Navigation // <--- Navigation Importado
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

  // 🔥🔥🔥 FUNCIÓN DE VUELO CORREGIDA (COPIADA DE LA LÓGICA DE PARTICULAR) 🔥🔥🔥
  const handleFlyTo = (p: any) => {
    try {
      // 1. Detectar coordenadas (ya sean sueltas o en array)
      // Esto soluciona el problema de que unas vienen como lat/lng y otras como array
      let lat = p.latitude;
      let lng = p.longitude;

      if ((!lat || !lng) && p.coordinates && Array.isArray(p.coordinates)) {
          lng = p.coordinates[0];
          lat = p.coordinates[1];
      }

      // 2. Abrir Ficha (NanoCard)
      window.dispatchEvent(new CustomEvent("open-details-signal", { detail: p }));
      window.dispatchEvent(new CustomEvent("select-property-signal", { detail: { id: String(p?.id) } }));

      // 3. ORDENAR EL VUELO (ESTA ES LA LÍNEA QUE FALTABA EN SU CÓDIGO)
      if (lat && lng) {
          console.log(`🦅 Agencia volando a: ${lat}, ${lng}`); 
          window.dispatchEvent(new CustomEvent('fly-to-location', { 
              detail: { 
                  center: [lng, lat], 
                  zoom: 18.5, 
                  pitch: 60,
                  duration: 2000 
              } 
          }));
      } else {
          console.warn("⚠️ Propiedad sin coordenadas válidas para volar.");
      }

    } catch (e) { console.error("Error al volar:", e); }
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
          alert("Error: No se puede contactar con el propietario (ID perdido).");
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
                          {/* FOTO: CLICK PARA VOLAR (Corregido: ahora llama a handleFlyTo) */}
                          <div className="w-20 h-20 rounded-[20px] overflow-hidden bg-gray-100 shrink-0 cursor-pointer hover:opacity-90 transition-opacity relative shadow-inner" onClick={() => handleFlyTo(p)}>
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

                      {/* ZONA SAAS */}
                      {isRadar ? (
                        <div className="mt-4 pt-3 border-t border-indigo-50">
                            <div className="bg-indigo-50/40 rounded-xl p-3 border border-indigo-100/50">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        {p.radarType === "EXCLUSIVE" ? (
                                            <div className="flex items-center gap-1 px-2 py-1 bg-white border border-indigo-100 text-indigo-700 rounded-lg shadow-sm">
                                                <Lock size={10} />
                                                <span className="text-[9px] font-black tracking-wider uppercase">EXCLUSIVA</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg">
                                                <FileText size={10} />
                                                <span className="text-[9px] font-black tracking-wider uppercase">MANDATO</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Honorarios</span>
                                        <span className="text-sm font-black text-indigo-800">{p.activeCampaign.commission}%</span>
                                    </div>
                                </div>
                                <button onClick={() => setContractModalProp(p)} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200">
                                    <Eye size={12} /> Ver Expediente Oficial
                                </button>
                            </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                                {activeServices.slice(0, 3).map((srv: string, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-gray-50 text-gray-500 rounded-md text-[9px] font-bold uppercase">{srv}</span>
                                ))}
                                {activeServices.length > 3 && <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded-md text-[9px] font-bold">+{activeServices.length - 3}</span>}
                            </div>
                        </div>
                      )}

                      {/* BOTONERA */}
                      <div className="mt-4 flex gap-2">
                          {/* BOTÓN VOLAR (Ahora usa handleFlyTo correctamente) */}
                          <button onClick={() => handleFlyTo(p)} className="h-10 w-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-black hover:text-white flex items-center justify-center transition-colors" title="Volar a la propiedad">
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

      {/* MODAL EXPEDIENTE COMPLETO */}
      {contractModalProp && (
          <div className="fixed inset-0 z-[60000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in" onClick={() => setContractModalProp(null)}>
              <div className="bg-white w-[700px] max-w-full rounded-[30px] overflow-hidden shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                  
                  {/* HEADER */}
                  <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 p-8 text-white relative overflow-hidden">
                      <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"/>
                      <div className="flex justify-between items-start relative z-10">
                          <div>
                              <p className="text-[10px] font-black tracking-[0.3em] opacity-70 uppercase mb-2">Expediente Oficial</p>
                              <h3 className="text-3xl font-black">{contractModalProp.title}</h3>
                              <p className="text-indigo-200 text-xs font-medium mt-1 uppercase tracking-wide">REF: {contractModalProp.refCode || "---"}</p>
                          </div>
                          <div className="flex gap-2">
                             <div className="px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-bold backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                <Lock size={12} /> {contractModalProp.radarType === "EXCLUSIVE" ? "EXCLUSIVA" : "MANDATO SIMPLE"}
                             </div>
                             <div className="px-4 py-1.5 bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                                <Zap size={12} /> {contractModalProp.activeCampaign.duration || "6 Meses"}
                             </div>
                          </div>
                      </div>
                  </div>

                  {/* BODY: DESGLOSE FINANCIERO */}
                  <div className="p-8 space-y-8">
                      <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Calculator size={14} /> Desglose Económico
                          </p>
                          <div className="grid grid-cols-3 gap-4">
                              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Honorarios Netos</p>
                                  <p className="text-xl font-bold text-gray-800">{contractModalProp.activeCampaign.financials?.base || "---"}</p>
                                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">{contractModalProp.activeCampaign.commission}%</span>
                              </div>
                              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">IVA (21%)</p>
                                  <p className="text-xl font-bold text-gray-600">{contractModalProp.activeCampaign.financials?.ivaAmount || "---"}</p>
                              </div>
                              <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 text-center shadow-inner">
                                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                                  <p className="text-2xl font-black text-indigo-700">{contractModalProp.activeCampaign.financials?.total || "---"}</p>
                              </div>
                          </div>
                      </div>

                      {/* B2B */}
                      {contractModalProp.b2b && contractModalProp.b2b.sharePct > 0 && (
                          <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                      <Handshake size={20}/>
                                  </div>
                                  <div>
                                      <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Colaboración Activa</p>
                                      <p className="text-xs text-emerald-600 font-medium">Visible para la red de agencias.</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="text-[10px] font-bold text-emerald-500 uppercase">Compartes</p>
                                  <p className="text-2xl font-black text-emerald-700">{contractModalProp.b2b.sharePct}%</p>
                              </div>
                          </div>
                      )}

                      {/* SERVICIOS */}
                      <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Sparkles size={14} /> Servicios Incluidos
                          </p>
                          <div className="flex flex-wrap gap-2">
                              {(contractModalProp.activeCampaign.services || []).map((srv: string) => {
                                  const key = normalizeKey(srv);
                                  const Icon = ICON_MAP[key] || Sparkles;
                                  return (
                                    <div key={srv} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-[10px] font-bold uppercase shadow-sm flex items-center gap-2 hover:border-indigo-300 transition-colors">
                                        <Icon size={12} className="text-indigo-500"/> {srv.replace(/_/g, " ")}
                                    </div>
                                  );
                              })}
                          </div>
                      </div>
                  </div>
                  
                  {/* FOOTER */}
                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                      <button onClick={() => setContractModalProp(null)} className="px-8 py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-800 hover:scale-105 transition-all shadow-lg">
                          Cerrar Expediente
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}