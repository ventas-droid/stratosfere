"use client";

import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, Users, Calendar, MapPin, 
    MessageCircle, Phone, Mail, ChevronRight, 
    Clock, Loader2, Trash2, AlertTriangle // <--- AÑADIDO Trash2 y AlertTriangle
} from 'lucide-react';
// 🔥 IMPORTAMOS LA NUEVA ACCIÓN
import { getPropertiesAction, getEventAttendeesAction, cancelOpenHouseAction } from '@/app/actions';

export default function AgencyEventManager({ onClose }: { onClose: () => void }) {
    const [view, setView] = useState<'LIST' | 'DETAILS'>('LIST');
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [attendees, setAttendees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingAttendees, setLoadingAttendees] = useState(false);
    const [deleting, setDeleting] = useState(false); // Estado para el borrado

    // 1. CARGAR EVENTOS
    useEffect(() => {
        loadAgencyEvents();
    }, []);

    async function loadAgencyEvents() {
        setLoading(true);
        try {
            const res = await getPropertiesAction();
            if (res.success && res.data) {
                const activeEvents = res.data.filter((p: any) => {
                    const oh = p.openHouse || p.open_house || p.open_house_data;
                    return oh && oh.id; 
                });
                setEvents(activeEvents);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const handleSelectEvent = async (eventProp: any) => {
        const oh = eventProp.openHouse || eventProp.open_house || eventProp.open_house_data;
        if (!oh || !oh.id) return;

        setSelectedEvent(eventProp);
        setView('DETAILS');
        setLoadingAttendees(true);
        try {
            const res = await getEventAttendeesAction(oh.id);
            if (res.success) {
                setAttendees(res.attendees || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAttendees(false);
        }
    };

    const handleOpenChat = (user: any) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('open-chat-with-user', { 
                detail: { 
                    userId: user.id, 
                    userName: user.name, 
                    userAvatar: user.avatar 
                } 
            }));
        }
    };

    // 🔥 NUEVA FUNCIÓN: CANCELAR EVENTO
    const handleCancelEvent = async () => {
        if (!selectedEvent) return;
        const oh = selectedEvent.openHouse || selectedEvent.open_house;
        if (!oh?.id) return;

        if (!confirm("⚠️ ¿ESTÁS SEGURO?\n\nEsto cancelará el evento permanentemente y se notificará a los usuarios. Esta acción no se puede deshacer.")) {
            return;
        }

        setDeleting(true);
        try {
            const res = await cancelOpenHouseAction(oh.id);
            if (res.success) {
                // Éxito: Volvemos a la lista y recargamos
                setView('LIST');
                setSelectedEvent(null);
                await loadAgencyEvents(); // Recarga la lista para que desaparezca
                alert("✅ Evento cancelado correctamente.");
            } else {
                alert("Error al cancelar: " + res.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F5F7] animate-in slide-in-from-right duration-300">
            
            {/* --- VISTA 1: LISTA --- */}
            {view === 'LIST' && (
                <>
                    <div className="p-6 bg-white border-b border-slate-100 sticky top-0 z-10">
                        <div className="flex items-center gap-3 mb-1">
                            <button onClick={onClose} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                                <ArrowLeft size={20} className="text-slate-600"/>
                            </button>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Gestión de Eventos</h2>
                        </div>
                        <p className="text-sm text-slate-500 font-medium ml-10">
                            Controla asistencia y contacta con tus leads.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400"/></div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-20 opacity-50 flex flex-col items-center">
                                <Calendar size={48} className="mb-4 text-slate-300"/>
                                <p className="font-bold text-slate-600">No hay eventos activos</p>
                                <p className="text-xs text-slate-400 mt-2 max-w-[200px]">
                                    Crea un Open House desde el panel de arquitecto.
                                </p>
                            </div>
                        ) : (
                            events.map((prop) => {
                                const oh = prop.openHouse || prop.open_house || prop.open_house_data;
                                const date = oh && oh.startTime ? new Date(oh.startTime) : new Date();
                                const attendeeCount = prop.openHouseAttendeesCount || oh?._count?.attendees || 0;
                                const capacity = oh?.capacity || 50; 
                                const occupancy = capacity > 0 ? Math.round((attendeeCount / capacity) * 100) : 0;

                                return (
                                    <div key={prop.id} onClick={() => handleSelectEvent(prop)} className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                                        <div className="flex gap-4">
                                            <div className="w-20 h-24 rounded-2xl bg-slate-200 relative overflow-hidden shrink-0">
                                                {prop.mainImage ? (
                                                    <img src={prop.mainImage} className="w-full h-full object-cover" alt=""/>
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[9px] text-slate-400">Sin Foto</div>
                                                )}
                                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-center min-w-[40px] shadow-sm">
                                                    <span className="block text-[10px] font-bold text-slate-500 uppercase">{date.toLocaleDateString('es-ES',{month:'short'})}</span>
                                                    <span className="block text-lg font-black text-slate-900 leading-none">{date.getDate()}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-wider mb-1 inline-block">OPEN HOUSE</span>
                                                    {occupancy >= 100 && <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">FULL</span>}
                                                </div>
                                                <h3 className="font-bold text-slate-900 truncate text-base mb-1">{oh?.title || prop.title}</h3>
                                                <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate"><MapPin size={12}/> {prop.address}</p>
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-[10px] font-bold mb-1">
                                                        <span className="text-slate-600 flex items-center gap-1"><Users size={12}/> {attendeeCount} Inscritos</span>
                                                        <span className="text-slate-400">Cupo: {capacity}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${occupancy > 90 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(occupancy, 100)}%` }}/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-center pl-1">
                                                <ChevronRight className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all"/>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}

            {/* --- VISTA 2: DETALLES --- */}
            {view === 'DETAILS' && selectedEvent && (
                <>
                    <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                        <div className="p-4 flex items-center gap-3">
                            <button onClick={() => setView('LIST')} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-600 cursor-pointer">
                                <ArrowLeft size={16}/>
                            </button>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-sm font-black text-slate-900 truncate uppercase tracking-wide">LISTA DE INVITADOS</h2>
                                <p className="text-xs text-slate-500 truncate">{selectedEvent.openHouse?.title || "Evento"}</p>
                            </div>
                        </div>
                        
                        <div className="px-6 pb-4 flex gap-4">
                            <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                                <div className="text-2xl font-black text-slate-900">{attendees.length}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase">Confirmados</div>
                            </div>
                            <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                                <div className="text-2xl font-black text-indigo-600">{(selectedEvent.openHouse?.capacity || 50) - attendees.length}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase">Libres</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-white">
                        {loadingAttendees ? (
                            <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"/>)}</div>
                        ) : attendees.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-60 text-center opacity-50">
                                <Users size={40} className="text-slate-300 mb-3"/>
                                <p className="text-sm font-bold text-slate-600">Aún nadie se ha apuntado</p>
                                <p className="text-xs text-slate-400">Comparte el evento para conseguir leads.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {attendees.map((ticket) => {
                                    const user = ticket.user;
                                    return (
                                        <div key={ticket.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md hover:bg-slate-50 transition-all group">
                                            <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden relative shrink-0 border-2 border-white shadow-sm">
                                                {user.avatar ? (
                                                    <img src={user.avatar} className="w-full h-full object-cover" alt=""/>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-lg">{user.name?.[0]}</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 text-sm truncate">{user.name}</h4>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                    {user.email && <span className="truncate flex items-center gap-1"><Mail size={10}/> {user.email}</span>}
                                                </div>
                                                {user.mobile && <div className="text-[10px] text-slate-400 font-mono mt-0.5"><Phone size={10} className="inline mr-1"/>{user.mobile}</div>}
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenChat(user); }} className="w-10 h-10 rounded-full bg-[#1c1c1e] text-white flex items-center justify-center hover:bg-indigo-600 hover:scale-110 transition-all shadow-lg cursor-pointer">
                                                <MessageCircle size={18} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 🔥 ZONA DE PELIGRO: FOOTER DE CANCELACIÓN */}
                    <div className="p-4 bg-white border-t border-red-100">
                        <button 
                            onClick={handleCancelEvent}
                            disabled={deleting}
                            className="w-full py-4 rounded-xl bg-red-50 text-red-600 font-bold text-xs tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-200"
                        >
                            {deleting ? (
                                <><Loader2 size={14} className="animate-spin"/> CANCELANDO...</>
                            ) : (
                                <><Trash2 size={14}/> CANCELAR EVENTO</>
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}