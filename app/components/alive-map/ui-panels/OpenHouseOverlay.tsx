"use client";
import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Ticket, MapPin, Check, Star, Users, LogOut, AlertCircle } from "lucide-react";
// Importamos todas las acciones necesarias
import { joinOpenHouseAction, leaveOpenHouseAction, checkOpenHouseStatusAction, getUserMeAction } from "@/app/actions";
import GuestList from "./GuestList"; 

// Añadimos isOrganizer a los parámetros recibidos
export default function OpenHouseOverlay({ property, onClose, isOrganizer }: any) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedOH, setParsedOH] = useState<any>(null);
  
  // 🔥 AHORA OBEDECE A LO QUE LE DICTA EL PANEL PRINCIPAL
  const [isOwner, setIsOwner] = useState(isOrganizer || false);
  
  // ESTADOS NUEVOS PARA INTELIGENCIA DE AFORO
  const [occupancy, setOccupancy] = useState(0);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!property) return;
    
    // 1. PARSEAR DATOS
    let rawData = property.openHouse || property.open_house_data || property.open_house;
    if (typeof rawData === 'string') {
        try { rawData = JSON.parse(rawData); } catch (e) {}
    }
    setParsedOH(rawData);

    if (rawData?.id) {
       
        // 3. CHECK: ¿YA ESTOY DENTRO?
        checkOpenHouseStatusAction(rawData.id).then(res => {
            setIsRegistered(res.isJoined);
        });

        // 4. CHECK: AFORO INICIAL
        const capacity = rawData.capacity || 0;
        // Intentamos obtener el conteo actual si viene en la propiedad
        const current = property.openHouseAttendeesCount || rawData._count?.attendees || 0; 
        setOccupancy(current);
        if (capacity > 0 && current >= capacity) {
            setIsSoldOut(true);
        }
    }
  }, [property]);

  if (!parsedOH || (parsedOH.enabled !== true && String(parsedOH.enabled) !== "true")) return null;

  const oh = parsedOH;
  // Calcular fechas
  const start = oh.startTime ? new Date(oh.startTime) : null;
  const dayNumber = start ? start.getDate() : "";
  const monthName = start ? start.toLocaleDateString('es-ES', { month: 'short' }) : "";
  const weekDay = start ? start.toLocaleDateString('es-ES', { weekday: 'long' }) : "";
  const timeStr = start ? start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : "--:--";

// --- MANIOBRA DE RESERVA (VERSIÓN PRODUCCIÓN) ---
  const handleRegister = async () => {
    // Capturamos el ID de forma segura sin dejar logs en la consola
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
        }
    } catch (e) {
        setErrorMsg("Error de conexión con el servidor.");
    } finally {
        setLoading(false);
    }
  };

  // --- MANIOBRA DE RETIRADA (CANCELAR) ---
  const handleLeave = async () => {
      if(!confirm("¿Seguro que quieres liberar tu plaza? Perderás tu entrada.")) return;
      
      setLoading(true);
      try {
          const res = await leaveOpenHouseAction(oh.id);
          if (res.success) {
              setIsRegistered(false);
              setIsSoldOut(false); // Optimismo: si salgo yo, hay sitio
          }
      } catch(e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[60000] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[900px] bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:h-auto animate-in zoom-in-95 duration-300">
        
       {/* --- COLUMNA IZQUIERDA: VISUAL --- */}
        <div className="relative w-full md:w-5/12 h-48 md:h-auto bg-slate-900 shrink-0">
            <img 
                src={property.img || property.images?.[0] || "/placeholder.jpg"} 
                className={`w-full h-full object-cover transition-opacity duration-500 ${isSoldOut && !isRegistered ? 'opacity-40 grayscale' : 'opacity-80'}`} 
                alt="Event"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white flex flex-col justify-end z-10">
                {/* ETIQUETA DE ESTADO */}
                {isSoldOut && !isRegistered ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-red-600/90 backdrop-blur-md border border-red-500/50 text-[10px] font-black uppercase tracking-widest mb-2 w-fit animate-pulse">
                        ⛔ Aforo Completo
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/30 text-[9px] font-black uppercase tracking-widest mb-2 w-fit">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" /> Evento VIP
                    </span>
                )}
                
                <h2 className="text-xl md:text-3xl font-black leading-tight mb-2 break-words text-shadow-sm">
                    {oh.title || "Open House"}
                </h2>
                
                <div className="flex items-center gap-1 text-white/80 text-xs font-medium">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{property.address || property.title}</span>
                </div>
            </div>
        </div>
        
        {/* --- COLUMNA DERECHA: INTERACCIÓN --- */}
        <div className="flex-1 bg-white relative flex flex-col h-full overflow-hidden">
            
           {/* BOTÓN CERRAR */}
            <button 
                onClick={onClose} 
                className="absolute top-5 right-5 z-50 w-10 h-10 flex items-center justify-center bg-white text-slate-300 rounded-full hover:bg-slate-50 hover:text-slate-900 border border-slate-100 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md group"
            >
                <X size={22} className="group-hover:rotate-90 transition-transform duration-500 ease-out" />
            </button>

            {/* CONTENIDO SCROLLABLE */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex flex-col items-center justify-center shrink-0 border border-slate-200">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{monthName}</span>
                        <span className="text-xl font-black text-slate-900 leading-none">{dayNumber}</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 capitalize">{weekDay}, {timeStr}H</h3>
                        {oh.description && (
                             <p className="text-sm text-slate-500 leading-relaxed mt-1 line-clamp-3">
                                {oh.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Amenities */}
                {oh.amenities && Array.isArray(oh.amenities) && oh.amenities.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            {oh.amenities.map((am: string) => (
                                <span key={am} className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-[10px] font-bold border border-slate-100 uppercase tracking-wide">
                                    {am}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* MENSAJES DE ERROR VISUALES */}
                {errorMsg && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-xs text-red-600 animate-in slide-in-from-top-2">
                        <AlertCircle size={14} /> {errorMsg}
                    </div>
                )}
            </div>

            {/* 🔒 FOOTER DE ACCIÓN (INTELIGENTE) */}
            <div className="p-6 md:p-8 bg-white border-t border-slate-100 shrink-0 mt-auto">
                {isOwner ? (
                    /* 🟢 MODO AGENCIA */
                    <div className="animate-in fade-in">
                        <div className="mb-3 flex justify-between items-end">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Users size={14}/> Radar de Asistentes
                            </h4>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                                Organizador
                            </span>
                        </div>
                        <div className="max-h-[250px] overflow-y-auto border border-slate-200 rounded-xl shadow-inner bg-slate-50/50">
                            <GuestList openHouseId={oh.id} capacity={oh.capacity || 50} />
                        </div>
                    </div>
                ) : (
                    /* 🔵 MODO VISITANTE */
                isRegistered ? (
  <div className="w-full flex flex-col gap-4 animate-in zoom-in duration-300">
    {/* CARD PREMIUM (no se corta) */}
    <div className="relative w-full overflow-hidden rounded-[28px] border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-7 py-7 shadow-[0_18px_55px_rgba(5,150,105,0.18)]">
      {/* halos suaves */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-60 w-60 rounded-full bg-emerald-200/55 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-60 w-60 rounded-full bg-teal-200/45 blur-3xl" />

      <div className="relative flex flex-col items-center text-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_10px_25px_rgba(5,150,105,0.35)] ring-4 ring-white">
          <Check size={30} strokeWidth={3.2} />
        </div>

        <div className="w-full">
          <h3 className="text-2xl font-black tracking-tight text-emerald-950 leading-tight">
            ¡Entrada confirmada!
          </h3>
          <p className="mt-1 text-sm font-semibold text-emerald-800/90">
            Te hemos enviado los detalles por email.
          </p>

          <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold text-emerald-900/70 border border-emerald-200/60">
            <Ticket size={14} className="shrink-0 text-emerald-700" />
            <span className="truncate">
              Acceso activo · {oh.capacity ? `Cupo ${oh.capacity} familias` : "Acceso libre"}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* CTA cancelar */}
    <button
      type="button"
      onClick={handleLeave}
      disabled={loading}
      className="w-full rounded-2xl py-4 text-xs font-bold text-red-500/80 hover:text-red-700 hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
    >
      {loading ? <Clock size={14} className="animate-spin" /> : <LogOut size={14} />}
      Cancelar asistencia
    </button>
  </div>
) : (
                        /* ESTADO 2: NO TENGO TICKET -> BOTÓN RESERVAR O SOLD OUT */
                        <div className="space-y-4 animate-in fade-in">
                            <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                                <span className="flex items-center gap-1">
                                    {isSoldOut ? <AlertCircle size={12} className="text-red-500"/> : <Ticket size={12}/>} 
                                    {isSoldOut ? <span className="text-red-600 font-bold">Sin plazas disponibles</span> : "Tickets por Grupo"}
                                </span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-bold">
                                    {oh.capacity ? `Cupo: ${oh.capacity} Familias` : "Acceso libre"}
                                </span>
                            </div>

                            <button 
                                onClick={handleRegister}
                                disabled={loading || isSoldOut}
                                className={`w-full h-14 rounded-xl font-black tracking-wide text-sm transition-all shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group px-4
                                    ${isSoldOut 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                                        : 'bg-[#111] text-white hover:bg-black active:scale-[0.98]'
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Clock className="animate-spin h-5 w-5" /> Procesando...
                                    </span>
                                ) : isSoldOut ? (
                                    <>
                                        <X size={20} className="shrink-0" />
                                        <span>AGOTADO (SOLD OUT)</span>
                                    </>
                                ) : (
                                    <>
                                        <Ticket size={20} className="shrink-0 group-hover:rotate-12 transition-transform"/> 
                                        <div className="flex flex-col items-start leading-none text-left">
                                            <span className="truncate">RESERVAR ENTRADA</span>
                                            <span className="text-[9px] font-normal opacity-70 normal-case tracking-normal">Válido para ti y tus acompañantes</span>
                                        </div>
                                    </>
                                )}
                            </button>
                            
                            {!isSoldOut && (
                                <p className="text-center text-[10px] text-gray-400">
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
}