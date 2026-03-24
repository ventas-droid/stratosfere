// Ubicación: app/vip/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getPropertyByIdAction, getActiveManagementAction, submitLeadAction } from "@/app/actions";
import { Loader2, Phone, Mail, ShieldCheck, Check, MapPin, Maximize2, Bed, Bath, User, Briefcase, Camera, Send, Handshake, Lock, Coins, FileText } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useParams } from "next/navigation";

export default function VipB2BPropertyPage() {
    const params = useParams();
    const propertyId = params?.id as string;

    const [prop, setProp] = useState<any>(null);
    const [owner, setOwner] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [sending, setSending] = useState(false);
    const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', message: '' });

    useEffect(() => {
        if (!propertyId) return;

        const loadB2BData = async () => {
            try {
                const res = await getPropertyByIdAction(propertyId);
                if (res?.success && res?.data) {
                    setProp(res.data);
                    
                    const mgmt = await getActiveManagementAction(res.data.id);
                    if (mgmt?.success && mgmt?.data?.agency) {
                        setOwner(mgmt.data.agency);
                    } else {
                        setOwner(res.data.user || res.data.ownerSnapshot || {});
                    }
                } else {
                    setError(true);
                }
            } catch (e) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        loadB2BData();
    }, [propertyId]);

    const handleSendLead = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        const res = await submitLeadAction({
            propertyId: prop.id,
            name: leadForm.name,
            email: leadForm.email,
            phone: leadForm.phone,
            message: leadForm.message || `Hola, me interesa colaborar en la propiedad REF: ${prop.refCode}`,
            source: "B2B_NETWORK" // 🎖️ Chivato B2B
        });
        setSending(false);

        if (res.success) {
            toast.success("Solicitud B2B Enviada", { description: "El agente gestor ha sido notificado." });
            setLeadForm({ name: '', email: '', phone: '', message: '' });
        } else {
            toast.error("Error", { description: "Inténtalo de nuevo." });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 className="text-amber-500 animate-spin mb-4" size={40} />
                <p className="text-amber-500/50 font-black tracking-widest uppercase text-xs animate-pulse">Accediendo a Bóveda B2B...</p>
            </div>
        );
    }

    if (error || !prop) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <Lock size={60} className="text-slate-800 mb-4" />
                <h1 className="text-white text-2xl font-black mb-2">Expediente Clasificado</h1>
                <p className="text-slate-500 text-sm">Este enlace B2B ha caducado o no tienes permisos de acceso.</p>
            </div>
        );
    }

    // 🧮 MATEMÁTICAS TÁCTICAS B2B
    const img = prop.img || (prop.images && prop.images[0]) || "/placeholder.jpg";
    const avatar = owner?.companyLogo || owner?.avatar || null;
    const isAgency = String(owner?.role || "").toUpperCase().includes("AGEN");
    const numericPrice = Number(String(prop.price).replace(/\D/g, ''));
    const priceFormatted = new Intl.NumberFormat("es-ES").format(numericPrice);

    const sharePercent = Number(prop.b2b?.sharePct ?? prop.activeCampaign?.commissionSharePct ?? prop.sharePct ?? 0);
    const baseCommissionPct = Number(prop.activeCampaign?.commissionPct ?? prop.commissionPct ?? 3);
    const estimatedEarnings = numericPrice * (baseCommissionPct / 100) * (sharePercent / 100);
    const formattedEarnings = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(estimatedEarnings);

    return (
        <div className="min-h-screen bg-slate-950 font-sans selection:bg-amber-500 selection:text-slate-900 pb-24">
            <Toaster position="bottom-center" richColors theme="dark" />

            {/* 1. CABECERA TÁCTICA */}
            <div className="relative w-full h-[45vh] bg-black overflow-hidden border-b border-white/10">
                <img src={img} className="w-full h-full object-cover opacity-40 mix-blend-luminosity" alt="Propiedad" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-black/20" />
                
                {/* Sello B2B Superior */}
                <div className="absolute top-6 left-6 flex gap-2">
                    <div className="bg-amber-500 text-amber-950 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                        <Handshake size={14} className="animate-pulse"/>
                        <span className="text-[10px] font-black uppercase tracking-widest">Colaboración Abierta</span>
                    </div>
                </div>
            </div>

            {/* 2. CONTENIDO PRINCIPAL */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-24 relative z-10">
                
                {/* 💰 LA BÓVEDA B2B (EL GANCHO) */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 shadow-2xl border border-white/10 relative overflow-hidden mb-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"/>
                    
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div>
                            <span className="bg-white/10 text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 inline-block border border-amber-500/20">
                                {prop.type || "Inmueble"} • {prop.city}
                            </span>
                            <h1 className="text-3xl font-black text-white leading-tight mb-1">{prop.title}</h1>
                            <p className="text-slate-400 text-sm font-medium">REF: <span className="text-white font-mono">{prop.refCode}</span></p>
                        </div>

                        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/5 w-full md:w-auto min-w-[240px] text-center shrink-0">
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Tu Comisión B2B ({sharePercent}%)</p>
                            <p className="text-4xl font-black text-white tracking-tighter flex items-center justify-center gap-2">
                                <Coins size={24} className="text-amber-400"/>
                                {formattedEarnings}
                            </p>
                            <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase tracking-wider">Honorarios Estimados (+IVA)</p>
                        </div>
                    </div>
                </div>

                {/* Tarjeta del Agente Gestor */}
                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 shadow-xl border border-white/10 flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
                        {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="Agente"/> : <Briefcase size={20} className="text-slate-400"/>}
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Agencia Gestora</p>
                        <h2 className="text-base font-black text-white leading-tight truncate">{owner?.companyName || owner?.name || "Agencia Partner"}</h2>
                    </div>
                </div>

                {/* Características Básicas */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                        <p className="font-black text-lg text-white">{prop.rooms || 0}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Habitaciones</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                        <p className="font-black text-lg text-white">{prop.baths || 0}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Baños</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                        <p className="font-black text-lg text-white">{prop.mBuilt || prop.m2 || 0} m²</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Superficie</p>
                    </div>
                </div>

                {/* Protocolo B2B */}
                <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 mb-8">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-amber-500"/> Protocolo de Operaciones
                    </h3>
                    <div className="space-y-4 text-xs text-slate-400 leading-relaxed font-medium">
                        <div className="flex gap-3">
                            <div className="w-1 min-w-[4px] h-auto bg-slate-700 rounded-full"></div>
                            <div><strong className="text-white block mb-0.5">Operación Ciega (Marca Blanca)</strong>Tus clientes no verán el nombre de la agencia vendedora. Tu cliente es tuyo.</div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-1 min-w-[4px] h-auto bg-amber-500/50 rounded-full"></div>
                            <div><strong className="text-white block mb-0.5">Protección de Lead</strong>Al enviar la solicitud desde aquí, Stratosfere registra tu autoría en la operación.</div>
                        </div>
                    </div>
                </div>

                {/* Formulario de Contacto B2B */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 relative overflow-hidden">
                    <div className="text-center mb-6">
                        <h4 className="text-white font-black text-lg">Aceptar Colaboración</h4>
                        <p className="text-xs text-slate-400 font-medium mt-1">Notifica a la agencia gestora para iniciar el trámite.</p>
                    </div>
                    
                    <form onSubmit={handleSendLead} className="space-y-3">
                        <input className="w-full p-4 bg-black/40 text-white rounded-xl text-sm font-bold border border-white/10 focus:border-amber-500 outline-none placeholder:text-slate-500" placeholder="Nombre de tu Agencia o Agente" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} required />
                        <div className="grid grid-cols-2 gap-3">
                            <input type="email" className="w-full p-4 bg-black/40 text-white rounded-xl text-sm font-bold border border-white/10 focus:border-amber-500 outline-none placeholder:text-slate-500" placeholder="Email" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} required />
                            <input type="tel" className="w-full p-4 bg-black/40 text-white rounded-xl text-sm font-bold border border-white/10 focus:border-amber-500 outline-none placeholder:text-slate-500" placeholder="Teléfono" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} required />
                        </div>
                        <textarea className="w-full p-4 bg-black/40 text-white rounded-xl text-sm font-medium border border-white/10 focus:border-amber-500 outline-none resize-none min-h-[100px] placeholder:text-slate-500" placeholder="Tengo un cliente interesado en visitar esta propiedad..." value={leadForm.message} onChange={e => setLeadForm({...leadForm, message: e.target.value})} />
                        
                        <button type="submit" disabled={sending} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 transition-all active:scale-95 mt-2">
                            {sending ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
                            {sending ? "Transmitiendo..." : "Solicitar Colaboración Segura"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

