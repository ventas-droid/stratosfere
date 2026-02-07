"use client";

import React, { useEffect, useState } from 'react';
import { getUserTicketsAction, cancelTicketAction } from "@/app/actions";
import { Ticket, MapPin, Clock, Calendar, X, ExternalLink, Loader2, Trash2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function UserTickets({ onClose }: { onClose: () => void }) {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        loadTickets();
    }, []);

    async function loadTickets() {
        const res = await getUserTicketsAction();
        if (res.success) {
            setTickets(res.data || []);
        }
        setLoading(false);
    }

    async function handleCancel(ticketId: string) {
        if (!confirm("¿Seguro que quieres cancelar esta visita?")) return;
        setCancellingId(ticketId);
        
        const res = await cancelTicketAction(ticketId);
        if (res.success) {
            // Eliminar localmente para que sea instantáneo
            setTickets(prev => prev.filter(t => t.id !== ticketId));
        }
        setCancellingId(null);
    }

    return (
        <div className="fixed inset-0 z-[60000] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* FONDO OSCURO */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-300">
                
                {/* CABECERA */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-indigo-600" /> Mis Entradas
                        </h2>
                        <p className="text-xs text-slate-500">Tus próximas visitas programadas</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* LISTA DE TICKETS */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-3">
                            <Loader2 className="animate-spin w-6 h-6" />
                            <span className="text-xs">Buscando tus pases...</span>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-slate-400 text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                            <Ticket className="w-12 h-12 mb-3 opacity-20" />
                            <p className="font-bold text-slate-600">No tienes entradas</p>
                            <p className="text-xs mt-1">Explora el mapa y apúntate a un Open House.</p>
                        </div>
                    ) : (
                        tickets.map((ticket) => {
                            const event = ticket.openHouse;
                            const property = event.property;
                            const start = new Date(event.startTime);
                            const isPast = new Date() > start;

                            return (
                                <div key={ticket.id} className={`group relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md ${cancellingId === ticket.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                    
                                    {/* CABECERA DEL TICKET (FOTO) */}
                                    <div className="h-24 relative bg-slate-900">
                                        <Image 
                                            src={property.mainImage || "/placeholder.jpg"} 
                                            alt="Property" 
                                            fill 
                                            className="object-cover opacity-60 group-hover:opacity-70 transition-opacity"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                        
                                        <div className="absolute bottom-3 left-4 right-4 text-white">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 flex items-center gap-1 mb-1">
                                                        {event.title || "Open House"}
                                                    </span>
                                                    <h3 className="font-bold text-lg leading-none truncate pr-4">
                                                        {property.address}
                                                    </h3>
                                                </div>
                                                <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-xs font-mono font-bold border border-white/30">
                                                    {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CUERPO DEL TICKET */}
                                    <div className="p-4">
                                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                                            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                                                <Calendar size={14} className="text-indigo-600"/>
                                                <span className="font-bold text-slate-900">
                                                    {start.toLocaleDateString([], {weekday: 'short', day: 'numeric', month: 'short'})}
                                                </span>
                                            </div>
                                            {isPast ? (
                                                <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">FINALIZADO</span>
                                            ) : (
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ACTIVO
                                                </span>
                                            )}
                                        </div>

                                        {/* INFO DE AGENCIA */}
                                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden relative border border-slate-200">
                                                    {property.user?.companyLogo ? (
                                                        <Image src={property.user.companyLogo} fill className="object-cover" alt="Logo"/>
                                                    ) : (
                                                        <span className="flex items-center justify-center w-full h-full text-[9px] font-bold text-slate-400">AG</span>
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium text-slate-500 truncate max-w-[120px]">
                                                    {property.user?.companyName || "Agencia"}
                                                </span>
                                            </div>

                                            {/* BOTÓN CANCELAR */}
                                            {!isPast && (
                                                <button 
                                                    onClick={() => handleCancel(ticket.id)}
                                                    className="text-[10px] font-bold text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                                >
                                                    <Trash2 size={10} /> CANCELAR
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* DECORACIÓN "TICKET CUT" (Muescas laterales) */}
                                    <div className="absolute top-24 -left-2 w-4 h-4 bg-slate-50 rounded-full" />
                                    <div className="absolute top-24 -right-2 w-4 h-4 bg-slate-50 rounded-full" />
                                </div>
                            );
                        })
                    )}
                </div>
                
                {/* FOOTER */}
                <div className="p-4 bg-white border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400">
                        Muestra este ticket en la entrada. Código: <span className="font-mono text-slate-600">#{tickets[0]?.id.slice(-6).toUpperCase() || "---"}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}