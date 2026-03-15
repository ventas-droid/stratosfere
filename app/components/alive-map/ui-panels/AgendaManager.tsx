"use client";

import React, { useState, useEffect } from "react";
import { 
    X, ArrowLeft, Phone, Calendar, Mail, 
    MessageCircle, Clock, MapPin, ShieldCheck, Sparkles, Loader2, CheckCircle2, User, CalendarPlus
} from "lucide-react";

import { getAgencyLeadsAction, confirmLeadMeetingAction } from "@/app/actions-agenda";

export default function AgendaManager({ onBack, onClose, onOpenChat }: any) {
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados para el formulario de confirmación
    const [managingId, setManagingId] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [meetingForm, setMeetingForm] = useState({
        agentName: "",
        date: "",
        time: "",
        address: ""
    });

    // Guardar los enlaces de Google Calendar generados
    const [gcalLinks, setGcalLinks] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchRealLeads = async () => {
            try {
                if (typeof getAgencyLeadsAction === 'function') {
                    const res: any = await getAgencyLeadsAction();
                    if (res?.success && res?.data) setLeads(res.data);
                }
            } catch (error) {
                console.error("Error cargando la agenda:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRealLeads();
    }, []);

    const submitMeeting = async (e: React.FormEvent, lead: any) => {
        e.preventDefault();
        setIsConfirming(true);

        const propRef = lead.property?.refCode || lead.propertyRef || "SF-N/A";
        const clientName = lead.user?.name || lead.clientName || "Propietario";
        const email = lead.user?.email || lead.email || "";

        try {
            const res = await confirmLeadMeetingAction({
                leadId: lead.id,
                agentName: meetingForm.agentName,
                date: meetingForm.date,
                time: meetingForm.time,
                address: meetingForm.address,
                clientEmail: email,
                clientName: clientName,
                propertyRef: propRef
            });

            if (res.success) {
                // Actualizar estado local
                setLeads(prev => prev.map(l => l.id === lead.id ? { 
                    ...l, 
                    status: "MANAGED",
                    // Añadimos el texto histórico visualmente sin recargar
                    message: `${l.message}\n\n✅ GESTIONADO POR: ${meetingForm.agentName} | ${meetingForm.date} a las ${meetingForm.time}`
                } : l));
                
                // Guardar link de Google Calendar
                if (res.gcalLink) {
                    setGcalLinks(prev => ({ ...prev, [lead.id]: res.gcalLink }));
                }
                
                setManagingId(null);
            } else {
                alert("Error al confirmar la cita");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F5F7]">
            {/* HEADER */}
            <div className="shrink-0 px-6 pt-6 pb-4 border-b border-slate-200/50 bg-white/40 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95">
                            <ArrowLeft size={16} className="text-slate-700" />
                        </button>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Agenda & Leads</h2>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Gestión de Citas B2B</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200/50 hover:bg-slate-300/50 flex items-center justify-center transition-colors">
                        <X size={16} className="text-slate-600" />
                    </button>
                </div>
            </div>

            {/* CUERPO */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-60">
                        <Loader2 size={32} className="text-indigo-400 animate-spin mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">Sincronizando...</h3>
                    </div>
                ) : leads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-60 animate-fade-in">
                        <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-4 border border-slate-100">
                            <Sparkles size={28} className="text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Bandeja Limpia</h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-[250px]">No hay solicitudes pendientes en este momento.</p>
                    </div>
                ) : (
                    leads.map((lead) => {
                        const isPending = lead.status !== "MANAGED" && lead.status !== "CONTACTED";
                        const isManagingThis = managingId === lead.id;
                        const propRef = lead.property?.refCode || lead.propertyRef || "SF-N/A";
                        const clientName = lead.user?.name || lead.clientName || "Propietario";
                        const phone = lead.user?.phone || lead.phone || "---";
                        const email = lead.user?.email || lead.email || "---";

                        // Extraer histórico si existe
                        const msgParts = (lead.message || "").split("✅ CITA CONFIRMADA:");
                        const originalMsg = msgParts[0];
                        const historicalData = msgParts.length > 1 ? msgParts[1] : null;

                        // Igual si se acaba de confirmar en la misma sesión
                        const manualHistory = (lead.message || "").split("✅ GESTIONADO POR:");
                        const hasManualHistory = manualHistory.length > 1;

                        return (
                            <div key={lead.id} className={`bg-white rounded-[24px] border transition-all duration-300 shadow-sm overflow-hidden ${isPending ? 'border-indigo-200 shadow-indigo-500/10' : 'border-slate-200'}`}>
                                
                                <div className={`px-5 py-3 border-b flex justify-between items-center ${isPending ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isPending ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isPending ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                            {isPending ? 'Pendiente de Cita' : 'Cita Agendada'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                        <Clock size={10} /> {new Date(lead.createdAt || Date.now()).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin size={14} className="text-slate-400" />
                                        <span className="text-sm font-black text-slate-900 tracking-tight">REF: {propRef}</span>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200/60">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Propietario</p>
                                                <p className="text-sm font-bold text-slate-900 leading-none">{clientName}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2">
                                                <Calendar size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                                                <div className="text-xs text-slate-600 font-medium whitespace-pre-line">
                                                    <span className="font-bold text-slate-800">Mensaje original:</span> {originalMsg}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-emerald-500 shrink-0" />
                                                <span className="text-xs font-bold text-slate-700">{phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🔥 ZONA HISTÓRICA / CONFIRMADA 🔥 */}
                                    {(!isPending || historicalData || hasManualHistory) && !isManagingThis && (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Cita Confirmada</span>
                                            </div>
                                            <div className="text-xs text-emerald-800 font-medium whitespace-pre-line">
                                                {historicalData ? historicalData : manualHistory[1]}
                                            </div>
                                        </div>
                                    )}

                                    {/* 🔥 BOTONES DE GOOGLE CALENDAR 🔥 */}
                                    {gcalLinks[lead.id] && !isManagingThis && (
                                        <a href={gcalLinks[lead.id]} target="_blank" rel="noopener noreferrer" className="w-full mb-4 py-3 bg-white border border-blue-200 text-blue-600 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-blue-50 transition-all shadow-sm">
                                            <CalendarPlus size={14} /> Añadir a Google Calendar
                                        </a>
                                    )}

                                    {/* FORMULARIO DESPLEGABLE PARA CERRAR LA CITA */}
                                    {isManagingThis ? (
                                        <form onSubmit={(e) => submitMeeting(e, lead)} className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 animate-fade-in">
                                            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-3">Fijar Cita Definitiva</p>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Agente a cargo</label>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <User size={12} className="text-indigo-400" />
                                                        <input required value={meetingForm.agentName} onChange={e=>setMeetingForm({...meetingForm, agentName: e.target.value})} placeholder="Nombre del agente..." className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-400" />
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Fecha</label>
                                                        <input required type="date" value={meetingForm.date} onChange={e=>setMeetingForm({...meetingForm, date: e.target.value})} className="w-full mt-1 bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Hora</label>
                                                        <input required type="time" value={meetingForm.time} onChange={e=>setMeetingForm({...meetingForm, time: e.target.value})} className="w-full mt-1 bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-400" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Lugar Exacto</label>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <MapPin size={12} className="text-indigo-400" />
                                                        <input required value={meetingForm.address} onChange={e=>setMeetingForm({...meetingForm, address: e.target.value})} placeholder="Dirección de la cita..." className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-400" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-4 pt-4 border-t border-indigo-100">
                                                <button type="button" onClick={() => setManagingId(null)} className="flex-1 py-2 bg-white text-slate-500 rounded-lg text-xs font-bold uppercase tracking-widest border border-slate-200 hover:bg-slate-50">Cancelar</button>
                                                <button type="submit" disabled={isConfirming} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-md">
                                                    {isConfirming ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar Cita'}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button 
                                                    onClick={() => window.location.href = `tel:${phone.replace(/\s/g, '')}`}
                                                    className="py-3 bg-white border border-emerald-200 text-emerald-600 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-50 active:scale-95 transition-all shadow-sm"
                                                >
                                                    <Phone size={14} /> Llamar
                                                </button>

                                                <button 
                                                    onClick={() => {
                                                        onOpenChat({ 
                                                            propertyId: lead.propertyId, 
                                                            toUserId: lead.userId || lead.user?.id 
                                                        });
                                                    }}
                                                    className="py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all shadow-md shadow-slate-900/20"
                                                >
                                                    <MessageCircle size={14} /> Chat
                                                </button>
                                            </div>
                                            
                                            {isPending && (
                                                <button 
                                                    onClick={() => {
                                                        setManagingId(lead.id);
                                                        // Pre-rellenamos la dirección de la casa si es posible
                                                        setMeetingForm({
                                                            agentName: "",
                                                            date: "",
                                                            time: "",
                                                            address: lead.property?.address || ""
                                                        });
                                                    }}
                                                    className="w-full mt-3 py-3 rounded-xl border border-indigo-200 bg-indigo-50 text-xs font-black text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 uppercase tracking-widest text-center transition-colors shadow-sm"
                                                >
                                                    Asignar Cita Definitiva
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}