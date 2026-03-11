"use client";
import React, { useEffect, useState } from 'react';
import { Handshake, AlertCircle, FileSignature, MapPin, Wallet, Loader2, Calendar, Edit2, Trash2 } from 'lucide-react';
import { getActiveDemandsAction, deleteDemandAction } from '@/app/actions-demands'; 
import { getUserMeAction } from '@/app/actions'; // ⚠️ Ajuste esta ruta a donde tenga su getUserMeAction
import ProposePropertyModal from './ProposePropertyModal';
import PublishDemandModal from './PublishDemandModal'; // 👈 Importamos el modal de publicar/editar
import { toast } from 'sonner';

export default function DemandBoard({ refreshTrigger }: { refreshTrigger: number }) {
    const [demands, setDemands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estados de control
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [demandToPropose, setDemandToPropose] = useState<any>(null);
    const [demandToEdit, setDemandToEdit] = useState<any>(null); // 👈 Nuevo estado para editar

    const refreshSilent = () => {
        getActiveDemandsAction().then(res => {
            if (res.success && res.data) setDemands(res.data);
        });
    };
   
   
    useEffect(() => {
        setLoading(true);
        // Lanzamos dos radares a la vez: buscar demandas y buscar quién soy yo
        Promise.all([
            getActiveDemandsAction(),
            getUserMeAction()
        ]).then(([demandsRes, userRes]) => {
            if (demandsRes.success && demandsRes.data) setDemands(demandsRes.data);
            if (userRes.success && userRes.data) setCurrentUserId(userRes.data.id);
            setLoading(false);
        });
    }, [refreshTrigger]);

    // Función formatea-fechas (Ej: "10 mar 2026")
    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateString));
    };

    // Función para detonar la demanda
    const handleDelete = async (id: string) => {
        if (!confirm("⚠️ ¿Estás seguro de que quieres retirar esta demanda del mercado?")) return;
        
        const res = await deleteDemandAction(id);
        if (res.success) {
            toast.success("Demanda retirada con éxito.");
            setDemands(prev => prev.filter(d => d.id !== id)); // La borramos de la pantalla al instante
        } else {
            toast.error(res.error || "Error al retirar la demanda.");
        }
    };

    if (loading) return <div className="w-full py-20 flex justify-center"><Loader2 className="animate-spin text-slate-400" size={32}/></div>;

    if (demands.length === 0) {
        return (
            <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-slate-200 shadow-sm">
                <AlertCircle size={40} className="mx-auto text-slate-300 mb-4"/>
                <h3 className="text-lg font-black text-slate-900">Mercado Despejado</h3>
                <p className="text-slate-500 text-sm mt-1">Nadie ha publicado demandas todavía. ¡Sé el primero!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
            {demands.map((demand) => {
                const isMine = currentUserId === demand.userId; // ¿Es mía esta tarjeta?

                return (
                    <div key={demand.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between group">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-2 flex-wrap items-center">
                                    {/* 🔥 LA FECHA INYECTADA 🔥 */}
                                    <span className="bg-slate-50 text-slate-500 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-slate-200 flex items-center gap-1">
                                        <Calendar size={12}/> {formatDate(demand.createdAt)}
                                    </span>

                                    {demand.urgent && (
                                        <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-1">
                                            <AlertCircle size={12}/> Urgente
                                        </span>
                                    )}
                                    {demand.mandate && (
                                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-1">
                                            <FileSignature size={12}/> Mandato
                                        </span>
                                    )}
                                </div>
                                
                                {/* COMISIÓN TOTAL + REPARTO */}
                                <div className="text-right flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                                        <p className="text-sm font-black text-slate-900">
                                            {demand.totalComm ? (demand.totalComm.includes('%') ? demand.totalComm : `${demand.totalComm}%`) : "N/D"}
                                        </p>
                                    </div>
                                    <div className="w-px h-6 bg-slate-200"></div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Reparto</p>
                                        <p className="text-sm font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                            {demand.split ? (demand.split.includes('%') ? demand.split : `${demand.split}%`) : "N/D"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{demand.title}</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <p className="text-slate-500 text-xs font-bold flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                                    <MapPin size={14} className="text-slate-400"/> {demand.location}
                                </p>
                                <p className="text-slate-900 text-xs font-black flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                                    <Wallet size={14} className="text-slate-400"/> 
                                    {demand.budget ? (demand.budget.includes('€') ? demand.budget : `${demand.budget} €`) : "N/D"}
                                </p>
                            </div>

                            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6 line-clamp-3">
                                {demand.description}
                            </p>
                        </div>

                        {/* 🔥 PANEL DE CONTROL: MIS BOTONES VS BOTONES DE OTROS 🔥 */}
                        <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3">
                            {isMine ? (
                                <>
                                    <button onClick={() => setDemandToEdit(demand)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95">
                                        <Edit2 size={16}/> Editar
                                    </button>
                                    <button onClick={() => handleDelete(demand.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 border border-red-100">
                                        <Trash2 size={16}/> Borrar
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setDemandToPropose(demand)} className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95">
                                    <Handshake size={16}/> Tengo lo que buscas
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
       
            {/* MODAL PARA ENVIAR PROPUESTA A OTRO AGENTE */}
            <ProposePropertyModal 
                isOpen={!!demandToPropose} 
                onClose={() => setDemandToPropose(null)} 
                demand={demandToPropose} 
            />

            {/* MODAL PARA EDITAR MI PROPIA DEMANDA */}
            {/* MODAL PARA EDITAR MI PROPIA DEMANDA */}
            <PublishDemandModal 
                isOpen={!!demandToEdit} 
                onClose={() => setDemandToEdit(null)}
                demandToEdit={demandToEdit}
                onSuccess={() => {
                    setDemandToEdit(null); // Cierra el modal
                    refreshSilent();       // 🔥 Recarga los datos de forma invisible
                }}
            />
        </div>
    );
}