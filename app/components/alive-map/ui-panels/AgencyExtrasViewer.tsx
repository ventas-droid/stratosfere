"use client";
import React, { useState, useEffect } from "react";
import { FileText, Video, Globe, Calendar, Clock, MapPin, ShieldCheck, Download, ExternalLink, CheckCircle2 } from "lucide-react";
import { checkOpenHouseStatusAction } from "@/app/actions";

export default function AgencyExtrasViewer({ property, onOpenHouseClick }: any) {  
  // 1. ESTADO DE MEMORIA (Debe ir antes de cualquier 'return')
  const [isRegistered, setIsRegistered] = useState(false);

  // 2. DETECTAMOS EL EVENTO 
  const openHouse = property?.openHouse || property?.open_house_data;
  const hasOpenHouse = openHouse && (openHouse.enabled === true || openHouse.enabled === "true");

  // 3. EL CEREBRO SILENCIOSO: Pregunta a la base de datos si ya tenemos entrada
  useEffect(() => {
      if (hasOpenHouse && openHouse?.id) {
          checkOpenHouseStatusAction(openHouse.id)
              .then(res => { if (res?.isJoined) setIsRegistered(true); })
              .catch(e => console.log("Silencio...", e));
      }
  }, [hasOpenHouse, openHouse?.id]);

  // 4. REGLAS DE REPLIEGUE ORIGINALES
  if (!property) return null;

  const hasVideo = property.videoUrl && property.videoUrl.length > 5;
  const hasTour = property.tourUrl && property.tourUrl.length > 5;
  const hasNote = property.simpleNoteUrl && property.simpleNoteUrl.length > 5;
  const hasCert = property.energyCertUrl && property.energyCertUrl.length > 5;
  
  if (!hasVideo && !hasTour && !hasNote && !hasCert && !hasOpenHouse) return null;
  return (
    <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. SECCIÓN OPEN HOUSE (EVENTO VIP) */}
      {hasOpenHouse && (
        <div className="relative overflow-hidden rounded-2xl bg-[#1d1d1f] text-white p-6 shadow-xl border border-gray-800">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full blur-2xl opacity-20"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-yellow-400">
                    <Calendar size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Evento Exclusivo</span>
                </div>
                <h3 className="text-2xl font-black mb-1">{openHouse.title || "Open House VIP"}</h3>
                
                <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>
                            {openHouse.startTime ? new Date(openHouse.startTime).toLocaleDateString() : "Fecha Pendiente"} 
                            {" • "} 
                            {openHouse.startTime ? new Date(openHouse.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                        </span>
                    </div>
                    {openHouse.capacity && (
                        <div className="bg-white/10 px-2 py-0.5 rounded text-xs text-white">
                            Aforo: {openHouse.capacity} pax
                        </div>
                    )}
                </div>

                {/* Lista de Amenities del Evento */}
                {openHouse.amenities && openHouse.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {openHouse.amenities.map((am: string) => (
                            <span key={am} className="px-3 py-1 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-wider bg-white/5">
                                {am}
                            </span>
                        ))}
                    </div>
                )}
{/* 🔥 EL BOTÓN MUTANTE 🔥 */}
                {isRegistered ? (
                    <div className="mt-6 w-full py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex flex-col items-center justify-center text-emerald-400 cursor-default select-none shadow-inner">
                        <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle2 size={14} /> ¡Ya estás apuntado!
                        </span>
                        <span className="text-[9px] font-medium mt-1 text-emerald-500/60 uppercase tracking-wider">
                            Para cancelar, ve a MIS ENTRADAS
                        </span>
                    </div>
                ) : (
                    <button onClick={onOpenHouseClick} className="mt-6 w-full py-3 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors shadow-lg cursor-pointer">
                        Solicitar Invitación
                    </button>
                )}
            </div>
        </div>
      )}

      {/* 2. SECCIÓN MULTIMEDIA (CINE) */}
      {(hasVideo || hasTour) && (
        <div className="grid grid-cols-2 gap-3">
            {hasVideo && (
                <a href={property.videoUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-all cursor-pointer group">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform">
                        <Video size={18} fill="currentColor" />
                    </div>
                    <span className="text-xs font-bold text-blue-900">Ver Vídeo</span>
                </a>
            )}
            {hasTour && (
                <a href={property.tourUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-4 bg-purple-50 border border-purple-100 rounded-2xl hover:bg-purple-100 transition-all cursor-pointer group">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform">
                        <Globe size={18} />
                    </div>
                    <span className="text-xs font-bold text-purple-900">Tour 3D</span>
                </a>
            )}
        </div>
      )}

      {/* 3. SECCIÓN DOCUMENTACIÓN (TRANSPARENCIA) */}
      {(hasNote || hasCert) && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500"/> Documentación Verificada
            </h4>
            <div className="space-y-3">
                {hasNote && (
                    <a href={property.simpleNoteUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 group-hover:text-red-500 transition-colors">
                                <FileText size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-700">Nota Simple Oficial</span>
                                <span className="text-[10px] text-gray-400">PDF • Verificado</span>
                            </div>
                        </div>
                        <Download size={16} className="text-gray-400 group-hover:text-black"/>
                    </a>
                )}
                {hasCert && (
                    <a href={property.energyCertUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 group-hover:text-green-500 transition-colors">
                                <ShieldCheck size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-700">Certificado Energético</span>
                                <span className="text-[10px] text-gray-400">PDF • Oficial</span>
                            </div>
                        </div>
                        <Download size={16} className="text-gray-400 group-hover:text-black"/>
                    </a>
                )}
            </div>
        </div>
      )}
    </div>
  );
}