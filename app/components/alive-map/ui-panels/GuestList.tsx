"use client";
import React, { useEffect, useState } from 'react';
import { getOpenHouseAttendeesAction } from "@/app/actions";
import { Users, Mail, Phone, Loader2, CalendarClock } from "lucide-react";

export default function GuestList({ openHouseId }: { openHouseId: string }) {
    const [guests, setGuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOpenHouseAttendeesAction(openHouseId).then(res => {
            if (res.success) setGuests(res.data);
            setLoading(false);
        });
    }, [openHouseId]);

    if (loading) return <div className="p-8 flex flex-col items-center text-xs text-gray-400 gap-2"><Loader2 className="animate-spin text-gray-900" size={20}/> Cargando lista...</div>;

    if (guests.length === 0) return (
        <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Users className="mx-auto text-gray-300 mb-2" size={32}/>
            <p className="text-sm font-bold text-gray-500">Aún no hay inscritos.</p>
            <p className="text-xs text-gray-400">Los usuarios aparecerán aquí cuando se apunten.</p>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <div className="bg-black text-white px-4 py-3 rounded-t-xl flex justify-between items-center sticky top-0 z-10">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Users size={12}/> Lista de Asistentes
                </span>
                <span className="bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full">{guests.length} PAX</span>
            </div>
            <div className="overflow-y-auto max-h-[300px] bg-white border border-t-0 border-gray-200 rounded-b-xl shadow-inner">
                {guests.map((g, i) => (
                    <div key={i} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group">
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-black text-gray-900">{g.name || "Usuario Anónimo"}</p>
                            <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                {new Date(g.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                            <div className="flex items-center gap-2 text-xs text-gray-600 group-hover:text-blue-600 transition-colors cursor-pointer" title="Copiar Email">
                                <Mail size={12} className="shrink-0"/> 
                                <span className="truncate">{g.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 group-hover:text-green-600 transition-colors">
                                <Phone size={12} className="shrink-0"/> 
                                <span>{g.phone || "Sin teléfono"}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}