"use client";

import React, { useEffect, useState } from 'react';
import { getEventAttendeesAction } from '@/app/actions';
import { Loader2, User, Mail, Phone, Calendar } from 'lucide-react';

// ELIMINAMOS "import Image from 'next/image'" PARA EVITAR EL BLOQUEO
// Usaremos <img> estándar html

export default function GuestList({ openHouseId, capacity }: { openHouseId: string, capacity: number }) {
    const [attendees, setAttendees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (openHouseId) {
            loadAttendees();
        }
    }, [openHouseId]);

    async function loadAttendees() {
        try {
            const res = await getEventAttendeesAction(openHouseId);
            if (res.success) {
                setAttendees(res.attendees || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-2">
                <Loader2 className="animate-spin" size={20}/>
                <span className="text-xs font-medium">Escaneando invitados...</span>
            </div>
        );
    }

    if (attendees.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                    <User className="text-slate-300" size={20}/>
                </div>
                <p className="text-xs font-bold text-slate-500">Lista de invitados vacía</p>
                <p className="text-[10px] text-slate-400 mt-1">Comparte el evento para conseguir leads.</p>
            </div>
        );
    }

    return (
        <div className="space-y-1 p-2">
            {/* CONTADOR DE AFORO */}
            <div className="flex items-center justify-between px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Total: {attendees.length} Pax</span>
                <span>Restantes: {Math.max(0, capacity - attendees.length)}</span>
            </div>

            {/* LISTA */}
            <div className="space-y-2">
                {attendees.map((ticket) => {
                    const user = ticket.user;
                    const date = new Date(ticket.createdAt);
                    
                    return (
                        <div key={ticket.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100 group">
                            
                            {/* AVATAR (USANDO IMG NORMAL PARA EVITAR ERRORES) */}
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                                {user.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                        {user.name?.[0] || "?"}
                                    </div>
                                )}
                            </div>

                            {/* DATOS */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-xs font-bold text-slate-900 truncate">{user.name}</h4>
                                    <span className="text-[9px] text-slate-300 font-mono">
                                        {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {user.email && (
                                        <span className="text-[9px] text-slate-500 truncate flex items-center gap-1">
                                            {user.email}
                                        </span>
                                    )}
                                </div>
                                {(user.mobile || user.phone) && (
                                    <div className="text-[9px] text-emerald-600 font-mono mt-0.5 flex items-center gap-1">
                                        <Phone size={8}/> {user.mobile || user.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

