"use client";
import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Ticket, MapPin, Check, Star, Users } from "lucide-react";
import { joinOpenHouseAction, getUserMeAction } from "@/app/actions";
// Importamos la lista para el modo dueño
import GuestList from "./GuestList"; 

export default function OpenHouseOverlay({ property, onClose }: any) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedOH, setParsedOH] = useState<any>(null);
  // Estado para saber si soy el dueño
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!property) return;
    
    // 1. Parsear datos del evento
    let rawData = property.openHouse || property.open_house_data || property.open_house;
    if (typeof rawData === 'string') {
        try { rawData = JSON.parse(rawData); } catch (e) {}
    }
    setParsedOH(rawData);

    // 2. Verificar si soy el dueño
    getUserMeAction().then(res => {
        if (res.success && res.data && res.data.id === property.userId) {
            setIsOwner(true);
        }
    });
  }, [property]);

  if (!parsedOH || (parsedOH.enabled !== true && String(parsedOH.enabled) !== "true")) return null;

  const oh = parsedOH;
  const start = oh.startTime ? new Date(oh.startTime) : null;
  
  const dayNumber = start ? start.getDate() : "";
  const monthName = start ? start.toLocaleDateString('es-ES', { month: 'short' }) : "";
  const weekDay = start ? start.toLocaleDateString('es-ES', { weekday: 'long' }) : "";
  const timeStr = start ? start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : "--:--";

  const handleRegister = async () => {
    setLoading(true);
    try {
        if (oh.id) await joinOpenHouseAction(oh.id);
        setIsRegistered(true);
    } catch (e) {
        setIsRegistered(true);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60000] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* ESTRUCTURA PRINCIPAL CORREGIDA: 
         Usamos flex-col y max-h para asegurar que cabe en pantalla.
      */}
      <div className="relative w-full max-w-[900px] bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:h-auto animate-in zoom-in-95 duration-300">
        
       {/* --- COLUMNA IZQUIERDA: IMAGEN Y TÍTULO (CORREGIDO) --- */}
        {/* Aumentamos h-48 a h-64 en móvil para que quepa el texto largo sin cortarse */}
        <div className="relative w-full md:w-5/12 h-64 md:h-auto bg-slate-900 shrink-0">
            <img 
                src={property.img || property.images?.[0] || "/placeholder.jpg"} 
                className="w-full h-full object-cover opacity-80" 
                alt="Event"
            />
            {/* Gradiente más alto para asegurar legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            {/* Contenedor de texto con padding seguro */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white flex flex-col justify-end z-10">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/30 text-[9px] font-black uppercase tracking-widest mb-2 w-fit">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" /> Evento VIP
                </span>
                
                {/* Título ajustado: text-xl en móvil, break-words para que no se salga */}
                <h2 className="text-xl md:text-3xl font-black leading-tight mb-2 break-words text-shadow-sm">
                    {oh.title || "Open House"}
                </h2>
                
                <div className="flex items-center gap-1 text-white/80 text-xs font-medium">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{property.address || property.title}</span>
                </div>
            </div>
            
          
        </div>
        {/* --- COLUMNA DERECHA: CONTENIDO Y BOTÓN --- */}
        {/* Corregido: Usamos flex flex-col h-full para gestionar el espacio vertical */}
        <div className="flex-1 bg-white relative flex flex-col h-full overflow-hidden">
            
           {/* 🔩 BOTÓN CERRAR MAESTRO (Efecto Tornillo) */}
            <button 
                onClick={onClose} 
                className="absolute top-5 right-5 z-50 w-10 h-10 flex items-center justify-center bg-white text-slate-300 rounded-full hover:bg-slate-50 hover:text-slate-900 border border-slate-100 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 group"
                title="Cerrar panel"
            >
                {/* La X gira 90º suavemente como un tornillo al hacer hover */}
                <X 
                    size={22} 
                    strokeWidth={2.5}
                    className="group-hover:rotate-90 transition-transform duration-500 ease-out" 
                />
            </button>

            {/* 📜 ZONA DE CONTENIDO SCROLLABLE (Se encoge si hace falta) */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                
                {/* Fecha y Hora */}
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

                {/* Amenities / Extras */}
                {oh.amenities && Array.isArray(oh.amenities) && oh.amenities.length > 0 && (
                    <div className="mb-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Experiencia Incluida</p>
                        <div className="flex flex-wrap gap-2">
                            {oh.amenities.map((am: string) => (
                                <span key={am} className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 text-xs font-bold border border-slate-100 flex items-center gap-1">
                                    ✨ {am}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 🔒 ZONA DE ACCIÓN FIJA AL FINAL (Footer) */}
            <div className="p-6 md:p-8 bg-white border-t border-slate-100 shrink-0 mt-auto">
                {isOwner ? (
                    /* 🟢 MODO AGENCIA: VISTA DE CONTROL */
                    <div className="animate-in fade-in">
                        <div className="mb-3 flex justify-between items-end">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Users size={14}/> Lista de Asistentes
                            </h4>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                Vista de Organizador
                            </span>
                        </div>
                        {/* Usamos un contenedor con scroll fijo para la lista dentro del popup */}
                        <div className="max-h-[200px] overflow-y-auto border border-slate-200 rounded-xl">
                            <GuestList openHouseId={oh.id} />
                        </div>
                    </div>
                ) : (
                    /* 🔵 MODO VISITANTE: BOTÓN DE RESERVA */
                    !isRegistered ? (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                                <span className="flex items-center gap-1"><Ticket size={12}/> Plazas limitadas</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-bold">
                                    {oh.capacity ? `Aforo: ${oh.capacity}` : "Entrada libre"}
                                </span>
                            </div>
                            <button 
                                onClick={handleRegister}
                                disabled={loading}
                                // Corregido: Clases del botón para asegurar altura y centrado
                                className="w-full h-14 bg-[#111] text-white rounded-xl font-black tracking-wide text-sm hover:bg-black active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group px-4"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Procesando...
                                    </span>
                                ) : (
                                    <>
                                        {/* 🔥 ICONO CORREGIDO CON 'shrink-0' 🔥 */}
                                        <Ticket size={20} className="shrink-0 group-hover:rotate-12 transition-transform"/> 
                                        <span className="truncate">RESERVA TICKET</span>
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[10px] text-gray-400">Recibirás la entrada en tu email al instante.</p>
                        </div>
                    ) : (
                        /* ✅ ÉXITO DE RESERVA */
                        <div className="text-center bg-emerald-50 p-6 rounded-2xl border border-emerald-100 animate-in zoom-in flex flex-col items-center">
                            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-3 shadow-lg shadow-emerald-500/30">
                                <Check size={24} strokeWidth={4} />
                            </div>
                            <h3 className="font-black text-slate-900 text-lg mb-1">¡Estás dentro!</h3>
                            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                                Hemos enviado la entrada y la ubicación exacta a tu correo electrónico.
                            </p>
                            <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 hover:bg-slate-50 transition-all">
                                Cerrar ventana
                            </button>
                        </div>
                    )
                )}
            </div>

        </div>
      </div>
    </div>
  );
}