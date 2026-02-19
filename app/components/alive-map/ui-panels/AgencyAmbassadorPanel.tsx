"use client";
import React, { useState, useEffect } from 'react';
import { 
    Users, ShieldCheck, X, Search, 
    MessageSquare, Phone, MapPin, Trash2, Navigation, 
    Loader2, TrendingUp, Mail, Award, Clock
} from 'lucide-react';
import { toast } from 'sonner';

// IMPORTAMOS LA INTELIGENCIA
import { getAgencyAmbassadorsAction, getAgencyLeadsAction, deleteAgencyLeadAction } from '@/app/actions-agency';

export default function AgencyAmbassadorPanel({ onClose }: { onClose: () => void }) {
    
    // --- ESTADOS ---
    const [activeTab, setActiveTab] = useState<"TROOPS" | "LEADS">("TROOPS");
    const [loading, setLoading] = useState(true);
    const [ambassadors, setAmbassadors] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // 🔄 CARGA DE DATOS
    useEffect(() => {
        loadIntelligence();
    }, []);

    const loadIntelligence = async () => {
        setLoading(true);
        try {
            const troopsRes = await getAgencyAmbassadorsAction();
            if (troopsRes.success) setAmbassadors(troopsRes.data);

            const leadsRes = await getAgencyLeadsAction();
            if (leadsRes.success) setLeads(leadsRes.data);
        } catch (error) {
            toast.error("Error de comunicación.");
        } finally {
            setLoading(false);
        }
    };

    // 🔙 MANIOBRA DE RETIRADA
    const handleBackToProfile = () => {
        onClose(); 
        setTimeout(() => {
            if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('open-agency-profile'));
        }, 50);
    };

    // 🔥 VUELO TÁCTICO Y FILTRO DE PRIVACIDAD (INTACTO)
    const handleFlyTo = (e: any, p: any) => {
        e.stopPropagation();

        try {
            let lng = p.coordinates?.[0] ?? p.longitude ?? p.lng;
            let lat = p.coordinates?.[1] ?? p.latitude ?? p.lat;

            lng = parseFloat(String(lng));
            lat = parseFloat(String(lat));

            let target = null;
            if (Number.isFinite(lng) && Number.isFinite(lat) && (Math.abs(lng) > 0.0001 || Math.abs(lat) > 0.0001)) {
                target = [lng, lat]; 
            }

            const assignmentObj = Array.isArray(p.assignment) ? p.assignment[0] : p.assignment;
            
            let safeUser = p.user || p.ownerSnapshot || { name: "Agencia" };
            
            if (assignmentObj?.agency) {
                const ag = assignmentObj.agency;
                safeUser = {
                    ...ag,
                    role: 'AGENCIA',
                    avatar: ag.companyLogo || ag.avatar,
                    name: ag.companyName || ag.name
                };
            }

            const b2bData = p.b2b || (p.activeCampaign ? {
                sharePct: Number(p.activeCampaign.commissionSharePct || 0),
                visibility: p.activeCampaign.commissionShareVisibility || 'PRIVATE'
            } : null);

            const richPayload = {
                ...p,
                id: String(p.id),
                coordinates: target, 
                b2b: b2bData,
                userId: safeUser.id, 
                user: safeUser,
                ownerSnapshot: safeUser,
                clientData: null, 
                isCaptured: p.isCaptured || (p.activeCampaign?.status === 'ACCEPTED'),
                activeCampaign: p.activeCampaign,
                price: p.formattedPrice || p.price || "Consultar",
                mBuilt: p.mBuilt || p.m2 || p.surface || 0,
                rooms: p.rooms || 0,
                baths: p.baths || 0,
                img: p.img || p.mainImage || (p.images && p.images[0]?.url)
            };

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent("select-property-signal", { detail: { id: String(p.id) } }));
                window.dispatchEvent(new CustomEvent("open-details-signal", { detail: richPayload }));

                if (target) {
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('fly-to-location', { 
                            detail: { center: target, zoom: 18.5, pitch: 60, duration: 1500 } 
                        }));
                    }, 200); 
                } else {
                    toast.warning("Abriendo ficha (Sin coordenadas GPS)");
                }
            }
        } catch (err) { 
            console.error("Error vuelo Ambassador:", err); 
        }
    };

    const handleDeleteLead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(!confirm("¿Eliminar este mensaje permanentemente?")) return;

        const res = await deleteAgencyLeadAction(id);
        if(res.success) {
            toast.success("Mensaje eliminado");
            setLeads(prev => prev.filter(l => l.id !== id));
        } else {
            toast.error("Error al eliminar");
        }
    };

    const filteredAmbassadors = ambassadors.filter(a => a.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredLeads = leads.filter(l => l.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || l.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    // ============================================================================
    // 🎨 RENDERIZADO VISUAL - NIVEL ÉLITE MUNDIAL
    // ============================================================================
    return (
        <div className="h-full flex flex-col bg-[#F2F2F7] w-full font-sans relative overflow-hidden">
            
            {/* FONDO EFECTO CRISTAL / ILUMINACIÓN */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-100/50 to-transparent pointer-events-none -z-10"></div>

            {/* --- CABECERA PREMIUM --- */}
            <div className="px-8 py-6 bg-white/70 backdrop-blur-2xl sticky top-0 z-20 flex justify-between items-center border-b border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                <div>
                    <button onClick={handleBackToProfile} className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em] mb-1.5 cursor-pointer group">
                        <X size={12} className="group-hover:rotate-90 transition-transform duration-300"/> CERRAR
                    </button>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Embajadores<span className="text-indigo-600">.</span></h2>
                </div>
                <div className="bg-indigo-50/80 text-indigo-700 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-indigo-100/50 shadow-inner">
                    <ShieldCheck size={16} strokeWidth={2.5}/> {leads.length} Leads
                </div>
            </div>

            {/* --- CONTROLES INTELIGENTES --- */}
            <div className="px-8 py-5 bg-white/40 backdrop-blur-md border-b border-black/5 space-y-4 z-10">
                {/* Switcher iOS Style */}
                <div className="flex p-1 bg-slate-200/50 rounded-[18px] backdrop-blur-xl border border-white/50 shadow-inner">
                    <button 
                        onClick={() => setActiveTab("TROOPS")}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === "TROOPS" ? 'bg-white text-slate-900 shadow-sm border border-black/5' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <Users size={16}/> EMBAJADORES ({ambassadors.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab("LEADS")}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === "LEADS" ? 'bg-white text-indigo-600 shadow-sm border border-black/5' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <MessageSquare size={16}/> Leads ({leads.length})
                    </button>
                </div>
                
                {/* Buscador Pro */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" size={18}/>
                    <input 
                        type="text" 
                        placeholder={activeTab === 'LEADS' ? "Buscar lead o propiedad..." : "Buscar embajador..."}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-white/60 backdrop-blur-sm border border-white rounded-2xl text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 outline-none transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                    />
                </div>
            </div>

            {/* --- CUERPO DE BATALLA --- */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar relative z-0">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 opacity-60 py-32">
                        <div className="w-16 h-16 relative">
                            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Sincronizando Malla...</span>
                    </div>
                ) : (
                    <>
                        {/* ============================================================== */}
                        {/* 🎖️ VISTA DE TROPAS (EMBAJADORES) */}
                        {/* ============================================================== */}
                        {activeTab === "TROOPS" && (
                            <div className="space-y-4">
                                {filteredAmbassadors.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                        <div className="w-24 h-24 bg-slate-200/50 rounded-full flex items-center justify-center mb-5 border border-white"><Users size={40} className="text-slate-400"/></div>
                                        <p className="text-sm font-black text-slate-600 uppercase tracking-widest">Sin Tropas Activas</p>
                                    </div>
                                )}
                                {filteredAmbassadors.map((soldier) => (
                                    <div key={soldier.id} className="bg-white p-5 rounded-[28px] shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-indigo-100 hover:shadow-[0_10px_40px_rgba(79,70,229,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-slate-100 rounded-[20px] overflow-hidden border-2 border-white shadow-md relative group-hover:scale-105 transition-transform">
                                                {soldier.avatar ? <img src={soldier.avatar} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-slate-300"><Users size={24}/></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-lg text-slate-900 leading-tight mb-0.5 truncate group-hover:text-indigo-600 transition-colors">{soldier.name}</h3>
                                                <p className="text-[11px] font-bold text-slate-400 mb-2 truncate">{soldier.email}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-indigo-50 text-indigo-700 text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border border-indigo-100/50">
                                                        {soldier.ambassadorStats?.rank || "RECLUTA"}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                                        <Award size={12}/> Score: {soldier.ambassadorStats?.score || "5.0"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ============================================================== */}
                        {/* 📡 VISTA DE LEADS (BUZÓN DE TRANSMISIONES) */}
                        {/* ============================================================== */}
                        {activeTab === "LEADS" && (
                            <div className="space-y-6">
                                {filteredLeads.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                        <div className="w-24 h-24 bg-slate-200/50 rounded-full flex items-center justify-center mb-5 border border-white"><MessageSquare size={40} className="text-slate-400"/></div>
                                        <p className="text-sm font-black text-slate-600 uppercase tracking-widest">Buzón Vacío</p>
                                    </div>
                                )}
                                {filteredLeads.map((lead) => {
                                    const p = lead.property;
                                    const mainImg = p?.img || p?.mainImage || (p?.images && p.images[0]?.url) || "/placeholder.jpg";
                                    const hasCoords = (p?.coordinates && p.coordinates[0]) || (p?.longitude && p.longitude !== 0);
                                    const isNew = new Date(lead.date || lead.createdAt).getTime() > Date.now() - 86400000; // 24h

                                    return (
                                        <div key={lead.id} className="bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 hover:border-indigo-200 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] hover:-translate-y-1 transition-all duration-500 group/card relative overflow-hidden flex flex-col">
                                            
                                            {/* Decoración de fondo */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-[100px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                            {/* --- 1. CABECERA: PROPIEDAD Y CLIENTE --- */}
                                            <div className="flex gap-5 mb-5 relative z-10">
                                                {/* FOTO CLICK PARA VOLAR */}
                                                <div 
                                                    className="w-24 h-24 rounded-[24px] overflow-hidden bg-slate-100 shrink-0 cursor-pointer relative shadow-inner group/img ring-2 ring-transparent group-hover/card:ring-indigo-50 transition-all" 
                                                    onClick={(e) => handleFlyTo(e, p)}
                                                >
                                                    <img src={mainImg} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700 ease-out" alt="Propiedad"/>
                                                    <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                                                        <Navigation size={28} strokeWidth={2} className="text-white drop-shadow-xl -rotate-45 group-hover/img:rotate-0 transition-transform duration-500" />
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    {/* Botón Papelera Flotante (Solo visible en hover) */}
                                                    <button 
                                                        onClick={(e) => handleDeleteLead(lead.id, e)} 
                                                        className="absolute top-0 right-0 p-2.5 rounded-xl bg-white text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors shadow-sm border border-slate-100 opacity-0 group-hover/card:opacity-100 translate-y-2 group-hover/card:translate-y-0"
                                                        title="Eliminar Mensaje"
                                                    >
                                                        <Trash2 size={16} strokeWidth={2.5}/>
                                                    </button>
                                                    
                                                    <div className="flex items-center gap-2 mb-1 pr-10">
                                                        <h3 className="font-black text-xl text-slate-900 leading-tight truncate">{lead.name || "Interesado Anónimo"}</h3>
                                                        {isNew && <span className="bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black tracking-widest shadow-sm animate-pulse">NUEVO</span>}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest">
                                                            REF: {p?.refCode || "---"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold truncate">
                                                        <MapPin size={12} className="text-indigo-400"/> <span className="truncate">{p?.address || p?.title || "Propiedad en Radar"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* --- 2. EL MENSAJE (Cita elegante) --- */}
                                            <div className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-[20px] mb-5 border border-slate-100 relative shadow-inner">
                                                <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-indigo-400 rounded-r-full"></div>
                                                <p className="text-sm text-slate-600 font-medium italic leading-relaxed pl-3 line-clamp-4">
                                                    "{lead.message || 'El usuario ha solicitado contacto sin dejar un mensaje escrito.'}"
                                                </p>
                                                <div className="mt-3 pl-3 flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                                    <Clock size={10}/> RECIBIDO: {new Date(lead.date || lead.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {/* --- 3. FICHAS DE CONTACTO --- */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                                                {/* Teléfono */}
                                                <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl group/phone hover:bg-emerald-50 hover:border-emerald-200 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50 shrink-0">
                                                            <Phone size={16} strokeWidth={2.5}/>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest mb-0.5">Móvil</p>
                                                            <p className="text-sm font-black text-slate-900 font-mono select-all truncate">{lead.phone || "No facilitado"}</p>
                                                        </div>
                                                    </div>
                                                    {lead.phone && (
                                                        <a href={`tel:${lead.phone}`} className="w-10 h-10 rounded-full bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm opacity-0 group-hover/phone:opacity-100 -translate-x-2 group-hover/phone:translate-x-0 shrink-0">
                                                            <Phone size={14} fill="currentColor"/>
                                                        </a>
                                                    )}
                                                </div>

                                                {/* Email */}
                                                <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-2xl group/email hover:bg-blue-50 hover:border-blue-200 transition-colors">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-50 shrink-0">
                                                            <Mail size={16} strokeWidth={2.5}/>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[9px] font-black text-blue-600/70 uppercase tracking-widest mb-0.5">Email</p>
                                                            <p className="text-sm font-black text-slate-900 truncate select-all">{lead.email || "No facilitado"}</p>
                                                        </div>
                                                    </div>
                                                    {lead.email && (
                                                        <a href={`mailto:${lead.email}`} className="w-10 h-10 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-500 hover:text-white transition-all shadow-sm opacity-0 group-hover/email:opacity-100 -translate-x-2 group-hover/email:translate-x-0 shrink-0">
                                                            <Mail size={14} strokeWidth={2.5}/>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* --- 4. ATRIBUCIÓN EMBAJADOR (B2B) --- */}
                                            {lead.ambassador && (
                                                <div className="bg-gradient-to-r from-indigo-50 to-white border border-indigo-100/50 rounded-[18px] p-3 flex items-center justify-between mb-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-white border-2 border-indigo-200 overflow-hidden shrink-0 shadow-sm">
                                                            {lead.ambassador.avatar ? <img src={lead.ambassador.avatar} className="w-full h-full object-cover"/> : <div className="bg-indigo-100 w-full h-full flex items-center justify-center"><Users size={12} className="text-indigo-400"/></div>}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[9px] font-black uppercase text-indigo-500 tracking-widest leading-none mb-1">Traído por</p>
                                                            <p className="text-xs font-black text-slate-800 truncate leading-none">{lead.ambassador.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-indigo-50 text-indigo-400">
                                                        <Award size={14}/>
                                                    </div>
                                                </div>
                                            )}

                                            {/* --- 5. BOTÓN MAESTRO DE ACCIÓN --- */}
                                            <button 
                                                onClick={(e) => handleFlyTo(e, p)} 
                                                className={`mt-auto h-14 w-full rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-lg active:scale-[0.98] ${hasCoords ? 'bg-[#1c1c1e] text-white hover:bg-indigo-600 hover:shadow-indigo-500/25' : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'}`}
                                            >
                                                <Navigation size={18} className={hasCoords ? "animate-bounce-subtle" : ""}/> 
                                                {hasCoords ? "Volar a la Propiedad" : "Abrir Ficha (Sin GPS)"}
                                            </button>
                                        </div>
                                    );
                                })}
                                <div className="h-16"></div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}