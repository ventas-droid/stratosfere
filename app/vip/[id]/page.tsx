"use client";

import React, { useEffect, useState } from "react";
import { getPropertyByIdAction, getActiveManagementAction, submitLeadAction } from "@/app/actions";
import { Loader2, Phone, Mail, ShieldCheck, Check, MapPin, Maximize2, Bed, Bath, User, Briefcase, Camera, Send, Handshake, Lock, Coins, FileText, Building2, ChevronRight, X } from "lucide-react";
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
    
    // 🔥 ESTADO DEL MODAL B2B
    const [showB2BModal, setShowB2BModal] = useState(false);

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
        
        // 🔥 EL CHIVATO TÁCTICO: Se envía como "B2B_NETWORK" a tu buzón de Leads
        const res = await submitLeadAction({
            propertyId: prop.id,
            name: leadForm.name,
            email: leadForm.email,
            phone: leadForm.phone,
            message: leadForm.message || `[ALIANZA B2B] Hola, represento a una agencia y tengo un cliente cualificado para la propiedad REF: ${prop.refCode}. Solicito acceso y confirmación de colaboración.`,
            source: "B2B_NETWORK" 
        });
        setSending(false);

        if (res.success) {
            toast.success("Alianza Solicitada", { description: "El Agente Gestor ha recibido tu petición." });
            setLeadForm({ name: '', email: '', phone: '', message: '' });
        } else {
            toast.error("Error de Transmisión", { description: "Verifica los datos e inténtalo de nuevo." });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
                <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                    <div className="absolute inset-0 border-t-2 border-amber-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-r-2 border-amber-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    <Handshake size={24} className="text-amber-500 animate-pulse" />
                </div>
                <p className="text-amber-500 font-black tracking-[0.3em] uppercase text-[10px] animate-pulse">Accediendo a Red Privada B2B...</p>
            </div>
        );
    }

    if (error || !prop) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#0A0A0A] to-[#0A0A0A]"></div>
                <Lock size={64} className="text-red-500/50 mb-6 relative z-10" />
                <h1 className="text-white text-2xl font-black mb-2 tracking-tight relative z-10">Expediente Clasificado</h1>
                <p className="text-slate-400 text-sm max-w-sm relative z-10">Este enlace de colaboración B2B ha caducado, la propiedad ya no está disponible o no tienes permisos de acceso.</p>
            </div>
        );
    }

    // 🧮 MATEMÁTICAS Y DATOS TÁCTICOS
    let allImages = prop.images || [];
    if (!Array.isArray(allImages)) allImages = prop.mainImage ? [prop.mainImage] : [];
    if (allImages.length === 0 && prop.img) allImages = [prop.img];
    
    const img = allImages.length > 0 ? (typeof allImages[0] === 'string' ? allImages[0] : allImages[0].url) : "https://dummyimage.com/800x600/1e293b/94a3b8&text=Imagen+No+Disponible";
    const galleryImages = allImages.slice(1, 5); 

    const avatar = owner?.companyLogo || owner?.avatar || null;
    const numericPrice = Number(String(prop.price).replace(/\D/g, ''));

    const sharePercent = Number(prop.b2b?.sharePct ?? prop.activeCampaign?.commissionSharePct ?? prop.sharePct ?? 0);
    const baseCommissionPct = Number(prop.activeCampaign?.commissionPct ?? prop.commissionPct ?? 3);
    const totalCommissionEur = numericPrice * (baseCommissionPct / 100);
    const estimatedEarnings = totalCommissionEur * (sharePercent / 100);
    
    const formatMoney = (val: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);

   return (
        <div className="flex flex-col h-[100dvh] overflow-hidden bg-[#0A0A0A] font-sans selection:bg-amber-500 selection:text-slate-900">
            <Toaster position="bottom-center" richColors theme="dark" />

            {/* 0. BARRA DE NAVEGACIÓN VIP (Fija arriba) */}
            <div className="shrink-0 w-full bg-black/80 backdrop-blur-xl border-b border-white/5 z-50 px-6 py-4 flex justify-between items-center relative">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black text-white tracking-[0.3em] uppercase">Stratosfere VIP Network</span>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                    <Lock size={10} className="text-amber-500"/>
                    <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Enlace Privado</span>
                </div>
            </div>

            {/* 1. ZONA SCROLLABLE (El contenido real de la propiedad) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative pb-10">
                
                {/* CABECERA HERO TÁCTICA */}
                <div className="relative w-full h-[55vh] sm:h-[65vh] bg-black overflow-hidden">
                    <img src={img} className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105" alt="Propiedad Principal" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
                    
                    <div className="absolute bottom-8 left-0 w-full px-4 sm:px-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-amber-500 text-black px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                                    {prop.type || "Inmueble"}
                                </span>
                                <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
                                    {prop.city || "Ubicación Privada"}
                                </span>
                                <span className="bg-black/50 backdrop-blur-md text-slate-300 border border-white/10 px-3 py-1 rounded-md text-[10px] font-mono tracking-widest">
                                    REF: {prop.refCode || "S/R"}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-2 drop-shadow-lg">{prop.title || "Propiedad Exclusiva"}</h1>
                            <p className="text-2xl font-black text-amber-400 drop-shadow-md">{formatMoney(numericPrice)} <span className="text-sm text-slate-400 font-bold tracking-widest uppercase ml-1">Inversor</span></p>
                        </div>
                    </div>
                </div>

                {/* CONTENIDO PRINCIPAL */}
                <div className="max-w-4xl mx-auto px-4 sm:px-8 relative z-10 -mt-2">
                    
                    {/* 💰 LA BÓVEDA B2B */}
                    <div className="bg-gradient-to-br from-slate-900 to-[#111] rounded-[24px] p-1 shadow-2xl border border-white/10 relative overflow-hidden mb-8">
                        <div className="bg-[#0A0A0A] rounded-[20px] p-6 sm:p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"/>
                            
                            <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Coins size={14}/> Resumen Financiero de la Operación
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                                <div className="flex flex-col sm:border-r border-white/10 pb-4 sm:pb-0">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Precio Cierre</span>
                                    <span className="font-black text-white text-2xl">{formatMoney(numericPrice)}</span>
                                </div>
                                <div className="flex flex-col sm:border-r border-white/10 pb-4 sm:pb-0">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Honorarios Totales</span>
                                    <span className="font-black text-slate-300 text-2xl">{formatMoney(totalCommissionEur)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1 bg-amber-500/10 inline-block w-max px-2 py-0.5 rounded border border-amber-500/20">Tu Parte ({sharePercent}%)</span>
                                    <span className="font-black text-amber-500 text-4xl tracking-tighter drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                                        {formatMoney(estimatedEarnings)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* COLUMNA IZQUIERDA: FOTOS Y DATOS */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* GALERÍA DE FOTOS */}
                            {galleryImages.length > 0 && (
                                <div className="bg-[#111] rounded-[24px] p-5 border border-white/5">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Camera size={14} className="text-slate-400"/> Anexo Visual
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {galleryImages.map((img: any, i: number) => {
                                            const url = typeof img === 'string' ? img : img.url;
                                            return (
                                                <div key={i} className="aspect-video rounded-xl overflow-hidden bg-slate-800 relative group">
                                                    <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt={`Vista ${i+1}`} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* DESCRIPCIÓN Y ESPECIFICACIONES */}
                            <div className="bg-[#111] rounded-[24px] p-6 sm:p-8 border border-white/5">
                                <div className="grid grid-cols-3 gap-4 mb-8 border-b border-white/5 pb-8">
                                    <div className="flex flex-col items-center justify-center p-4 bg-black/50 rounded-2xl border border-white/5">
                                        <Bed size={20} className="text-amber-500 mb-2"/>
                                        <p className="font-black text-xl text-white leading-none">{prop.rooms || 0}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Dormitorios</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-4 bg-black/50 rounded-2xl border border-white/5">
                                        <Bath size={20} className="text-amber-500 mb-2"/>
                                        <p className="font-black text-xl text-white leading-none">{prop.baths || 0}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Baños</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-4 bg-black/50 rounded-2xl border border-white/5">
                                        <MapPin size={20} className="text-amber-500 mb-2"/>
                                        <p className="font-black text-xl text-white leading-none">{prop.mBuilt || prop.m2 || 0}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Metros m²</p>
                                    </div>
                                </div>

                                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FileText size={14} className="text-slate-400"/> Memoria Descriptiva
                                </h3>
                                <div className="text-sm text-slate-400 leading-relaxed font-medium space-y-4">
                                    {prop.description ? (
                                        <p>{prop.description}</p>
                                    ) : (
                                        <p className="italic opacity-50">La agencia gestora no ha proporcionado una descripción pública. Solicite el dossier completo mediante el formulario de colaboración.</p>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* COLUMNA DERECHA: FORMULARIO Y AGENTE */}
                        <div className="space-y-6">
                            
                            {/* Tarjeta del Agente Gestor */}
                            <div className="bg-[#111] rounded-[24px] p-5 border border-white/5 flex items-center gap-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl pointer-events-none"/>
                                <div className="w-14 h-14 rounded-full bg-black border-2 border-slate-800 overflow-hidden shrink-0 flex items-center justify-center relative z-10">
                                    {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="Agente"/> : <Briefcase size={20} className="text-slate-500"/>}
                                </div>
                                <div className="flex-1 relative z-10">
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Agencia Gestora</p>
                                    <h2 className="text-sm font-black text-white leading-tight truncate">{owner?.companyName || owner?.name || "Agencia Partner"}</h2>
                                </div>
                            </div>

                            {/* Formulario de Contacto B2B */}
                            <div id="b2b-form" className="bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] rounded-[24px] p-1 shadow-2xl border border-white/10 relative overflow-hidden">
                                <div className="bg-[#111] rounded-[20px] p-6">
                                    <div className="text-center mb-6">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
                                            <Handshake size={20} className="text-amber-500"/>
                                        </div>
                                        <h4 className="text-white font-black text-lg tracking-tight">Iniciar Colaboración</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Petición Segura B2B</p>
                                    </div>
                                    
                                    <form onSubmit={handleSendLead} className="space-y-3">
                                        <div>
                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Tu Agencia / Nombre</label>
                                            <input id="agent-name-input" className="w-full p-3.5 bg-black text-white rounded-xl text-sm font-medium border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder:text-slate-600 transition-all" placeholder="Ej: Inmobiliaria Centro" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} required />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Email Profesional</label>
                                            <input type="email" className="w-full p-3.5 bg-black text-white rounded-xl text-sm font-medium border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder:text-slate-600 transition-all" placeholder="agencia@correo.com" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} required />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Teléfono Directo</label>
                                            <input type="tel" className="w-full p-3.5 bg-black text-white rounded-xl text-sm font-medium border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder:text-slate-600 transition-all" placeholder="+34 600 000 000" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} required />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Mensaje / Cliente</label>
                                            <textarea className="w-full p-3.5 bg-black text-white rounded-xl text-sm font-medium border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none min-h-[100px] placeholder:text-slate-600 transition-all custom-scrollbar" placeholder="Tengo un cliente cualificado interesado en visitar..." value={leadForm.message} onChange={e => setLeadForm({...leadForm, message: e.target.value})} />
                                        </div>
                                        
                                        <button type="submit" disabled={sending} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black text-[11px] uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 transition-all active:scale-95 mt-4">
                                            {sending ? <Loader2 className="animate-spin" size={16}/> : <ShieldCheck size={16}/>}
                                            {sending ? "Transmitiendo..." : "Solicitar Alianza Segura"}
                                        </button>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Protocolo Legal Footer */}
                    <div className="mt-12 pt-8 mb-8 border-t border-white/5 text-center">
                        <p className="text-slate-500/50 text-[10px] font-medium max-w-2xl mx-auto leading-relaxed">
                            STRATOSFERE OS actúa como notario digital de esta transacción. La solicitud de colaboración registra su autoría para proteger sus honorarios en caso de éxito. Operación confidencial sujeta a los términos y condiciones de la red privada B2B.
                        </p>
                    </div>
                </div>
            </div> {/* <-- FIN ZONA SCROLLABLE */}

            {/* 🚀 FOOTER B2B (Siempre pegado al fondo absoluto de la pantalla) */}
            <div className="shrink-0 w-full p-4 sm:p-5 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 flex justify-center z-40 relative shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <div className="w-full max-w-4xl flex gap-3">
                    <button 
                        onClick={() => setShowB2BModal(true)} 
                        className="w-14 h-14 bg-gradient-to-br from-amber-200 to-yellow-400 text-yellow-900 rounded-[20px] border border-yellow-300 shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 animate-pulse-slow shrink-0" 
                        title={`Colaboración disponible: ${sharePercent}%`}
                    >
                        <Handshake size={24} strokeWidth={2.5} />
                    </button>
                    <button 
                        onClick={() => {
                            document.getElementById('b2b-form')?.scrollIntoView({ behavior: 'smooth' });
                            setTimeout(() => document.getElementById('agent-name-input')?.focus(), 500);
                        }} 
                        className="flex-1 h-14 bg-white text-black rounded-[20px] font-black shadow-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95 uppercase tracking-wider text-xs"
                    >
                        <Send size={18} className="text-amber-600"/> Enviar Petición
                    </button>
                </div>
            </div>

            {/* 🔥 MODAL B2B ULTRA PREMIUM 🔥 */}
            {showB2BModal && (
                <div className="fixed inset-0 z-[60000] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 sm:p-6 animate-fade-in" onClick={() => setShowB2BModal(false)}>
                    <div className="bg-[#0A0A0A] w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-white/10 relative animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Luces de fondo */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"/>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"/>
                        
                        <button onClick={() => setShowB2BModal(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md border border-white/10 text-slate-400 hover:text-white z-20">
                            <X size={20} />
                        </button>
                        
                        <div className="p-8 relative z-10">
                            {/* Cabecera */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] border border-amber-300/50 shrink-0">
                                    <Handshake size={28} className="text-black drop-shadow-sm"/>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white leading-tight">Alianza B2B</h3>
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">Protocolo Abierto</p>
                                </div>
                            </div>

                            <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed">
                                Esta propiedad admite colaboración inmediata. Rellene el formulario seguro para notificar a la agencia gestora y dejar constancia de su lead.
                            </p>

                            {/* La Bóveda Financiera */}
                            <div className="bg-gradient-to-br from-slate-900 to-black border border-white/10 rounded-[24px] p-5 mb-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                                
                                <div className="flex justify-between items-end mb-4 border-b border-white/5 pb-4">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Precio Inversor</p>
                                        <p className="text-lg font-black text-slate-200">{formatMoney(numericPrice)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Honorarios Totales</p>
                                        <p className="text-lg font-black text-slate-400">{formatMoney(totalCommissionEur)}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Tu Comisión B2B</p>
                                        <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[9px] font-black border border-amber-500/30">
                                            {sharePercent}% DEL TOTAL
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)] flex items-center gap-2 justify-end">
                                            <Coins size={20} className="text-amber-500"/> {formatMoney(estimatedEarnings)}
                                        </p>
                                        <p className="text-[8px] text-slate-500 mt-1 font-mono uppercase tracking-widest">Estimado (+ IVA)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Botón de Acción Táctico */}
                            <button 
                                onClick={() => { 
                                    setShowB2BModal(false); 
                                    document.getElementById('b2b-form')?.scrollIntoView({ behavior: 'smooth' });
                                    setTimeout(() => document.getElementById('agent-name-input')?.focus(), 500);
                                }} 
                                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <ShieldCheck size={18}/> Iniciar Trámite de Alianza
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}