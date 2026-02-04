"use client";
import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Ticket, MapPin, Check, Star } from "lucide-react";
import { joinOpenHouseAction, getUserMeAction } from "@/app/actions"; 
import GuestList from "./GuestList"; // 👈 Asegúrese de que la ruta sea correcta

export default function OpenHouseOverlay({ property, onClose }: any) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedOH, setParsedOH] = useState<any>(null);
  
  // 🔥 NUEVO: Estado para saber si soy el dueño
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!property) return;
    
    // 1. Parsear datos
    let rawData = property.openHouse || property.open_house_data || property.open_house;
    if (typeof rawData === 'string') {
        try { rawData = JSON.parse(rawData); } catch (e) {}
    }
    setParsedOH(rawData);

    // 2. ¿Soy el dueño? (Chequeo de seguridad)
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
        if (oh.id) await joinOpenHouseAction(oh.id); // 🔥 Esto dispara el email de Resend
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

      {/* TARJETA PRINCIPAL - Arreglo de overflow */}
      <div className="relative w-full max-w-[900px] max-h-[90vh] bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        
        {/* IZQUIERDA: IMAGEN (En móvil se queda arriba pequeña, en desktop ocupa lado izquierdo) */}
        <div className="relative w-full md:w-5/12 h-48 md:h-auto bg-slate-900 shrink-0">
            <img 
                src={property.img || property.images?.[0] || "/placeholder.jpg"} 
                className="w-full h-full object-cover opacity-80" 
                alt="Event"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/30 text-[9px] font-black uppercase tracking-widest mb-2">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" /> Evento VIP
                </span>
                <h2 className="text-2xl md:text-3xl font-black leading-tight mb-1">
                    {oh.title || "Open House"}
                </h2>
                <div className="flex items-center gap-1 text-white/70 text-xs truncate">
                    <MapPin size={12} />
                    <span className="truncate">{property.address || property.title}</span>
                </div>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur transition-all md:hidden z-20">
                <X size={20} />
            </button>
        </div>

        {/* DERECHA: CONTENIDO (Scrollable si es muy alto) */}
        <div className="flex-1 bg-white relative flex flex-col overflow-y-auto">
            <button onClick={onClose} className="absolute top-4 right-4 hover:bg-slate-100 p-2 rounded-full transition-all hidden md:block z-20">
                <X size={20} className="text-slate-400" />
            </button>

            <div className="p-6 md:p-8 flex flex-col h-full">
                
                {/* 1. INFORMACIÓN BÁSICA */}
                <div className="flex items-start gap-4 mb-8">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex flex-col items-center justify-center shrink-0 border border-slate-200">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{monthName}</span>
                        <span className="text-xl font-black text-slate-900 leading-none">{dayNumber}</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 capitalize">{weekDay}, {timeStr}H</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            {oh.description || "Descubre esta propiedad exclusiva con un ambiente único."}
                        </p>
                    </div>
                </div>

                {/* 2. EXTRAS (AMENITIES) */}
                {oh.amenities && Array.isArray(oh.amenities) && oh.amenities.length > 0 && (
                    <div className="mb-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Incluido</p>
                        <div className="flex flex-wrap gap-2">
                            {oh.amenities.map((am: string) => (
                                <span key={am} className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 text-xs font-bold border border-slate-100">
                                    ✨ {am}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. ZONA DE ACCIÓN: ¿SOY DUEÑO O VISITANTE? */}
                <div className="mt-auto pt-6 border-t border-slate-100">
                    
                    {isOwner ? (
                        /* 🟢 MODO AGENCIA: LISTA DE GESTIÓN */
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                           <div className="mb-2 flex justify-between items-end">
                                <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">
                                    Panel de Control
                                </h4>
                                <span className="text-[10px] text-gray-400">Eres el organizador</span>
                           </div>
                           {/* AQUI MOSTRAMOS LA LISTA */}
                           <GuestList openHouseId={oh.id} />
                        </div>
                    ) : (
                        /* 🔵 MODO VISITANTE: BOTÓN DE RESERVA */
                        !isRegistered ? (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                                    <span>Plazas limitadas</span>
                                    <span>{oh.capacity ? `Aforo: ${oh.capacity}` : "Entrada libre"}</span>
                                </div>
                                <button 
                                    onClick={handleRegister}
                                    disabled={loading}
                                    className="w-full py-4 bg-black text-white rounded-xl font-black tracking-wide text-sm hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>Procesando...</>
                                    ) : (
                                        <><Ticket size={18} /> RESERVAR MI PLAZA GRATIS</>
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-gray-400">Recibirás la entrada en tu email al instante.</p>
                            </div>
                        ) : (
                            /* ✅ ÉXITO DE RESERVA */
                            <div className="text-center bg-green-50 p-6 rounded-2xl border border-green-100 animate-in zoom-in">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-green-500/30">
                                    <Check size={24} strokeWidth={4} />
                                </div>
                                <h3 className="font-black text-slate-900 text-lg">¡Apuntado!</h3>
                                <p className="text-xs text-slate-600 mb-4">
                                    Hemos enviado la entrada y la ubicación a tu correo electrónico.
                                </p>
                                <button onClick={onClose} className="text-xs font-bold text-slate-900 underline">
                                    Cerrar ventana
                                </button>
                            </div>
                        )
                    )}

                </div>
            </div>
        </div>
      </div>
    </div>
  );
}