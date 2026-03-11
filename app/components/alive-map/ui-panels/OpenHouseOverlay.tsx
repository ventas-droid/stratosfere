// @ts-nocheck
"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // 🔥 EL TELETRANSPORTADOR DE REACT
import { X, Calendar, Clock, Ticket, MapPin, Check, Loader2,  Star, Users, LogOut, AlertCircle, CalendarX } from "lucide-react";
// Importamos todas las acciones necesarias
import { joinOpenHouseAction, leaveOpenHouseAction, checkOpenHouseStatusAction, getUserMeAction } from "@/app/actions";
import GuestList from "./GuestList"; 

export default function OpenHouseOverlay({ property, onClose, isOrganizer }: any) {
  const [mounted, setMounted] = useState(false); // 🔥 Para activar el teletransporte
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedOH, setParsedOH] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(isOrganizer || false);
  const [occupancy, setOccupancy] = useState(0);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setMounted(true); // Avisamos que estamos listos para renderizar en el body
    if (!property) return;
    let rawData = property.openHouse || property.open_house_data || property.open_house;
    if (typeof rawData === 'string') {
        try { rawData = JSON.parse(rawData); } catch (e) {}
    }
    setParsedOH(rawData);

    if (rawData?.id) {
        checkOpenHouseStatusAction(rawData.id).then(res => {
            setIsRegistered(res.isJoined);
        });

        const capacity = rawData.capacity || 0;
        const current = property.openHouseAttendeesCount || rawData._count?.attendees || 0; 
        setOccupancy(current);
        if (capacity > 0 && current >= capacity) {
            setIsSoldOut(true);
        }
    }
  }, [property]);

  if (!parsedOH || (parsedOH.enabled !== true && String(parsedOH.enabled) !== "true")) return null;

  const oh = parsedOH;
  const start = oh.startTime ? new Date(oh.startTime) : null;
  const dayNumber = start ? start.getDate() : "";
  const monthName = start ? start.toLocaleDateString('es-ES', { month: 'short' }) : "";
  const weekDay = start ? start.toLocaleDateString('es-ES', { weekday: 'long' }) : "";
  const timeStr = start ? start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : "--:--";

  const durationMs = (oh.duration || 120) * 60000;
  const isPast = start ? (start.getTime() + durationMs) < Date.now() : false;

  const handleRegister = async () => {
    if (isPast) return; 

    const targetId = oh.id || oh._id || property.id;
    setLoading(true);
    setErrorMsg("");
    
    try {
        const res = await joinOpenHouseAction(targetId);
        if (!res.success) {
            if (res.error === "SOLD_OUT") {
                setIsSoldOut(true);
                setErrorMsg("⛔ Vaya... Se acaban de agotar las plazas.");
            } else if (res.message === "ALREADY_JOINED") {
                setIsRegistered(true);
            } else if (res.error === "NEED_EMAIL" || res.message?.includes("iniciar sesión")) {
                setErrorMsg("Debes iniciar sesión para apuntarte.");
            } else {
                setErrorMsg(res.error || res.message || "Error al intentar registrarse.");
            }
       } else {
            setIsRegistered(true);
            // 🔥 BENGALAS TÁCTICAS
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('refresh-user-tickets'));
                window.dispatchEvent(new CustomEvent('refresh-open-house-status', { detail: { joined: true } }));
                
                // 🎬 COREOGRAFÍA HOLLYWOOD (1.5 segundos de gloria)
                setTimeout(() => {
                    // ¡DISPARAMOS LA BENGALA ANTES DE CERRAR!
                    window.dispatchEvent(new CustomEvent('force-open-tickets'));
                    onClose(); // Ahora cerramos el modal
                }, 1500);
            }
        }
        
    } catch (e) {
        setErrorMsg("Error de conexión con el servidor.");
    } finally {
        setLoading(false);
    }
  };

 const handleLeave = async () => {
      if(!confirm("¿Seguro que quieres liberar tu plaza? Perderás tu entrada.")) return;
      setLoading(true);
      try {
          const res = await leaveOpenHouseAction(oh.id);
          if (res.success) {
              setIsRegistered(false);
              setIsSoldOut(false);
              // 🔥 BENGALAS TÁCTICAS: Avisan a toda la pantalla que hemos cancelado
              if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('refresh-user-tickets'));
                  window.dispatchEvent(new CustomEvent('refresh-open-house-status'));
              }
          }
      } catch(e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  // 🔥 Si Next.js aún no ha montado el componente en el cliente, no renderizamos
  if (!mounted) return null;

  // 🔥 EMPAQUETAMOS TODO EL MODAL EN UNA VARIABLE
  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center pointer-events-auto">
      
      {/* FONDO OSCURO */}
      <div 
         className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer animate-in fade-in duration-300" 
         onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} 
      />

      {/* TARJETA DEL MODAL */}
      <div 
         className="relative w-[95%] max-w-[850px] bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:h-auto animate-in zoom-in-95 duration-300 z-10 m-auto"
         onClick={(e) => e.stopPropagation()} 
      >
        
       {/* --- COLUMNA IZQUIERDA: VISUAL --- */}
        <div className="relative w-full md:w-[45%] h-56 md:h-auto bg-slate-900 shrink-0">
            <img 
                src={property.img || property.images?.[0] || "/placeholder.jpg"} 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${(isSoldOut && !isRegistered) || isPast ? 'opacity-40 grayscale' : 'opacity-80'}`} 
                alt="Event"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white flex flex-col justify-end z-10">
                {isPast ? (
                     <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-slate-600/90 backdrop-blur-md border border-slate-500/50 text-[10px] font-black uppercase tracking-widest mb-3 w-fit">
                         ⏳ EVENTO FINALIZADO
                     </span>
                ) : isSoldOut && !isRegistered ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-red-600/90 backdrop-blur-md border border-red-500/50 text-[10px] font-black uppercase tracking-widest mb-3 w-fit animate-pulse">
                        ⛔ Aforo Completo
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black uppercase tracking-widest mb-3 w-fit shadow-lg">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" /> Evento VIP
                    </span>
                )}
                
                <h2 className="text-3xl md:text-4xl font-black leading-tight mb-2 drop-shadow-md tracking-tight">
                    {oh.title || "Open House"}
                </h2>
                
                <div className="flex items-start gap-1.5 text-white/80 text-xs font-medium">
                    <MapPin size={14} className="shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-snug">{property.address || property.title}</span>
                </div>
            </div>
        </div>
        
        {/* --- COLUMNA DERECHA: INTERACCIÓN --- */}
        <div className="flex-1 bg-white relative flex flex-col h-full overflow-hidden">
            
           {/* BOTÓN CERRAR GIGANTE */}
            <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} 
                className="absolute top-5 right-5 z-[100] w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-all duration-300 shadow-sm cursor-pointer active:scale-90"
            >
                <X size={24} />
            </button>

            {/* CONTENIDO SCROLLABLE */}
            <div className="p-8 flex-1 overflow-y-auto">
                
                {/* 🔥 AÑADIDO pr-16 (padding-right) PARA QUE EL TEXTO NO CHOQUE CON LA 'X' */}
                <div className="flex items-start gap-5 mb-8 pt-2 pr-16">
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border-2 ${isPast ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-inner'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">{monthName}</span>
                        <span className={`text-2xl font-black leading-none mt-0.5 ${isPast ? 'line-through decoration-slate-300' : ''}`}>{dayNumber}</span>
                    </div>
                    <div className="pt-1">
                        <h3 className={`text-xl font-black capitalize tracking-tight ${isPast ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-900'}`}>{weekDay}, {timeStr}H</h3>
                        {oh.description && (
                             <p className="text-sm text-slate-500 leading-relaxed mt-2 line-clamp-3 font-medium">
                                {isPast ? "Este evento ya ha finalizado. Gracias por tu interés." : oh.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Amenities */}
                {oh.amenities && Array.isArray(oh.amenities) && oh.amenities.length > 0 && (
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                            {oh.amenities.map((am: string) => (
                                <span key={am} className={`px-3 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-widest ${isPast ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-white text-slate-700 border-slate-200 shadow-sm'}`}>
                                    {am}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* MENSAJES DE ERROR VISUALES */}
                {errorMsg && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm font-bold text-red-600 animate-in slide-in-from-top-2">
                        <AlertCircle size={18} className="shrink-0" /> {errorMsg}
                    </div>
                )}
            </div>

            {/* 🔒 FOOTER DE ACCIÓN (INTELIGENTE) */}
            <div className="p-8 bg-slate-50/50 border-t border-slate-100 shrink-0 mt-auto">
                {isOwner ? (
                    <div className="animate-in fade-in">
                        <div className="mb-4 flex justify-between items-end">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Users size={16} className="text-indigo-500"/> Radar de Asistentes
                            </h4>
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${isPast ? 'bg-slate-200 text-slate-500 border-slate-300' : 'text-slate-600 bg-white border-slate-200 shadow-sm'}`}>
                                {isPast ? 'EVENTO PASADO' : 'Modo Organizador'}
                            </span>
                        </div>
                        <div className="max-h-[250px] overflow-y-auto border border-slate-200 rounded-2xl shadow-inner bg-white">
                            <GuestList openHouseId={oh.id} capacity={oh.capacity || 50} />
                        </div>
                    </div>
                ) : (
                isRegistered ? (
                  <div className="w-full flex flex-col gap-4 animate-in zoom-in duration-300">
                    <div className={`relative w-full overflow-hidden rounded-[24px] border px-7 py-7 ${isPast ? 'border-slate-200 bg-slate-100 shadow-none' : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg'}`}>
                      {!isPast && (
                          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
                      )}

                      <div className="relative flex items-center gap-5">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-md ${isPast ? 'bg-slate-400' : 'bg-emerald-500'}`}>
                          {isPast ? <CalendarX size={24} strokeWidth={2.5}/> : <Check size={28} strokeWidth={3} />}
                        </div>

                        <div className="w-full">
                          <h3 className={`text-xl font-black tracking-tight leading-tight ${isPast ? 'text-slate-600' : 'text-emerald-900'}`}>
                            {isPast ? 'Evento Finalizado' : '¡Plaza Confirmada!'}
                          </h3>
                          <p className={`mt-0.5 text-xs font-semibold ${isPast ? 'text-slate-500' : 'text-emerald-700'}`}>
                            {isPast ? 'Gracias por tu asistencia.' : 'Te esperamos en la propiedad.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {!isPast && (
                        <button
                          type="button"
                          onClick={handleLeave}
                          disabled={loading}
                          className="w-full rounded-xl py-4 text-xs font-black tracking-widest uppercase text-red-500 hover:text-red-700 hover:bg-red-50 transition-all flex items-center justify-center gap-2 border border-transparent hover:border-red-100 disabled:opacity-50"
                        >
                          {loading ? <Clock size={16} className="animate-spin" /> : <LogOut size={16} />}
                          Cancelar mi asistencia
                        </button>
                    )}
                  </div>
                ) : (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-2">
                                <span className="flex items-center gap-1.5">
                                    {isPast ? <CalendarX size={14} className="text-slate-400"/> : isSoldOut ? <AlertCircle size={14} className="text-red-500"/> : <Ticket size={14} className="text-indigo-500"/>} 
                                    {isPast ? <span className="text-slate-400">Fuera de plazo</span> : isSoldOut ? <span className="text-red-600">Sin plazas disponibles</span> : "Pase para Grupo Familiar"}
                                </span>
                                <span className="bg-slate-200/50 px-3 py-1 rounded-md text-slate-700">
                                    {oh.capacity ? `Cupo: ${oh.capacity} Familias` : "Acceso libre"}
                                </span>
                            </div>

                            <button 
                                onClick={handleRegister}
                                disabled={loading || isSoldOut || isPast}
                                className={`w-full h-16 rounded-2xl font-black tracking-wider text-base transition-all shadow-xl flex items-center justify-center gap-4 relative overflow-hidden group
                                    ${isPast || isSoldOut 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
                                        : 'bg-[#1c1c1e] text-white hover:bg-black active:scale-[0.98]'
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="animate-spin h-5 w-5" /> Procesando...
                                    </span>
                                ) : isPast ? (
                                    <>
                                        <CalendarX size={20} className="shrink-0" />
                                        <span>EVENTO FINALIZADO</span>
                                    </>
                                ) : isSoldOut ? (
                                    <>
                                        <X size={20} className="shrink-0" />
                                        <span>AGOTADO (SOLD OUT)</span>
                                    </>
                                ) : (
                                    <>
                                        <Ticket size={24} className="shrink-0 group-hover:rotate-12 transition-transform text-yellow-400"/> 
                                        <span>RESERVAR ENTRADA</span>
                                    </>
                                )}
                            </button>
                            
                            {!isSoldOut && !isPast && (
                                <p className="text-center text-[10px] text-gray-400 font-medium">
                                    Una sola inscripción cubre a toda tu unidad familiar.
                                </p>
                            )}
                        </div>
                    )
                )}
            </div>

        </div>
      </div>
    </div>
  );

  // 🔥 EYECTAMOS EL MODAL FUERA DE CUALQUIER SCROLL, DIRECTO AL BODY
  return createPortal(modalContent, document.body);
}