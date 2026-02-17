"use client";
import React, { useState, useEffect } from 'react';
import { 
    X, Handshake, Briefcase, MessageCircle, MapPin, 
    Phone, Mail, User, Building2, Coins, Trash2, 
    ShieldCheck, ArrowRight, ArrowLeft, Copy, Check, Smartphone, 
    ExternalLink
} from 'lucide-react';
import { getMyConversationsAction, deleteConversationAction, getPropertyByIdAction } from '@/app/actions';

// --- SUB-COMPONENTE DE CONTACTO INTELIGENTE (COPIAR SIN SALIR) ---
const ContactItem = ({ icon: Icon, value, label }: { icon: any, value: string | null | undefined, label: string }) => {
    const [status, setStatus] = useState<'IDLE' | 'COPIED'>('IDLE');

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation(); // Evita abrir el chat o la tarjeta
        if (!value) return;
        
        navigator.clipboard.writeText(value);
        setStatus('COPIED');
        setTimeout(() => setStatus('IDLE'), 2000);
    };

    if (!value) return null;

    return (
        <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 group relative ${
                status === 'COPIED' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:shadow-sm'
            }`}
            title={`Copiar ${label}`}
        >
            <Icon size={13} className={status === 'COPIED' ? 'text-emerald-600' : 'text-slate-400 group-hover:text-indigo-500'} />
            
            <span className="text-[11px] font-bold font-mono tracking-tight">
                {value}
            </span>

            {/* Feedback Visual: Icono Cambiante */}
            <div className="pl-1 border-l border-slate-100 ml-1">
                {status === 'COPIED' ? (
                    <Check size={12} className="text-emerald-600 animate-bounce" />
                ) : (
                    <Copy size={12} className="text-slate-300 group-hover:text-slate-500" />
                )}
            </div>

            {/* Tooltip Flotante */}
            <span className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg transition-opacity pointer-events-none ${status === 'COPIED' ? 'opacity-100' : 'opacity-0'}`}>
                ¡Copiado!
            </span>
        </button>
    );
};

export default function CollaborationManager({ onClose, onBack, onOpenChat }: any) {
    const [collabs, setCollabs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res: any = await getMyConversationsAction();
            if (res.success && res.data) {
                // 1. Filtramos conversaciones de negocio (con propiedad vinculada)
                const businessChats = res.data.filter((c: any) => c.property || c.propertyRef);
                
                // 2. Enriquecimiento: Traemos datos frescos de la propiedad
                const enrichedChats = await Promise.all(businessChats.map(async (chat: any) => {
                    const propId = chat.property?.id || chat.propertyId;
                    if (propId) {
                        const propRes = await getPropertyByIdAction(propId);
                        if (propRes.success && propRes.data) {
                            return { ...chat, property: propRes.data };
                        }
                    }
                    return chat;
                }));

                setCollabs(enrichedChats);
            }
        } catch (e) {
            console.error("Error cargando B2B:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: any, conversationId: string) => {
        e.stopPropagation(); 
        if(!confirm("⚠️ ¿Cerrar negociación y borrar chat?")) return;
        setCollabs(prev => prev.filter(c => c.id !== conversationId));
        try {
            await deleteConversationAction(conversationId);
        } catch(err) { console.error(err); }
    };

    const formatMoney = (amount: number) => {
        if (isNaN(amount)) return "0 €";
        return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F7FA]">
            
            {/* CABECERA */}
            <div className="bg-[#111] p-6 pt-8 pb-8 shrink-0 relative overflow-hidden shadow-lg z-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                
                <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={onBack} 
                            className="flex items-center gap-2 text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer group"
                        >
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                                <ArrowLeft size={12}/>
                            </div>
                            Volver al Perfil
                        </button>

                        <div>
                            <div className="flex items-center gap-2 text-amber-400 mb-1">
                                <Handshake size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">B2B CENTER</span>
                            </div>
                            <h2 className="text-2xl font-black text-white leading-none tracking-tight">Gestión de Alianzas</h2>
                        </div>
                    </div>

                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/5">
                        <X size={16}/>
                    </button>
                </div>
            </div>

            {/* LISTA */}
            <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-60">
                        <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cargando datos...</p>
                    </div>
                ) : collabs.length === 0 ? (
                    <div className="text-center py-20 opacity-50 flex flex-col items-center">
                        <Briefcase size={32} className="mb-4 text-slate-300"/>
                        <h3 className="text-sm font-bold text-slate-600">Sin negociaciones activas</h3>
                    </div>
                ) : (
                    collabs.map((collab) => {
                        const other = collab.otherUser || {};
                        const prop = collab.property || {};
                        const isAgency = other.role === 'AGENCIA' || !!other.companyName;
                        
                        const price = prop.rawPrice || prop.priceValue || 0;
                        const sharePct = prop.b2b?.sharePct || prop.sharePct || prop.commissionSharePct || 0; 
                        const potentialEarnings = sharePct > 0 ? (price * 0.03 * (sharePct / 100)) : 0;

                        // 🔥 DETECCIÓN INTELIGENTE DE TELÉFONO 🔥
                        // Prioridad: Móvil > Fijo > "Sin teléfono"
                        const realPhone = other.mobile || other.phone;

                        return (
                            <div key={collab.id} className="bg-white rounded-[20px] shadow-sm border border-slate-200/60 hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden group">
                                
                                {/* 1. HEADER: DATOS DEL AGENTE (REALES Y COPIABLES) */}
                                <div className="p-4 border-b border-slate-100 flex items-start gap-4 bg-slate-50/30">
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                                            {other.avatar || other.companyLogo ? (
                                                <img src={other.avatar || other.companyLogo} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><User size={20}/></div>
                                            )}
                                        </div>
                                        {isAgency && (
                                            <div className="absolute -bottom-1.5 -right-1.5 bg-black text-amber-400 p-1 rounded-full border-2 border-white shadow-sm text-[8px] font-black w-5 h-5 flex items-center justify-center">
                                                PRO
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Info Textual */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-slate-900 text-sm truncate pr-2">
                                                {other.companyName || other.name || "Usuario"}
                                            </h4>
                                            {/* Etiqueta Rol */}
                                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                {isAgency ? "Agencia" : "Particular"}
                                            </span>
                                        </div>

                                        {/* 🔥 BOTONERA DE CONTACTO (CLICK TO COPY) 🔥 */}
                                        <div className="flex flex-wrap gap-2">
                                            {realPhone ? (
                                                <ContactItem 
                                                    icon={Smartphone} 
                                                    value={realPhone} 
                                                    label="Teléfono" 
                                                />
                                            ) : (
                                                <span className="text-[10px] text-slate-400 italic py-1 px-2">Sin teléfono</span>
                                            )}
                                            
                                            {other.email ? (
                                                <ContactItem 
                                                    icon={Mail} 
                                                    value={other.email} 
                                                    label="Email" 
                                                />
                                            ) : (
                                                <span className="text-[10px] text-slate-400 italic py-1 px-2">Sin email</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. BODY: LA OPORTUNIDAD (PROPIEDAD) */}
                                <div className="p-4 flex gap-4">
                                    <div className="w-20 h-20 rounded-lg bg-slate-200 shrink-0 relative overflow-hidden border border-slate-100 shadow-inner">
                                        {prop.mainImage || prop.img ? (
                                            <img src={prop.mainImage || prop.img} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400"><Building2 size={20}/></div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-start mb-1">
                                            <h5 className="font-black text-slate-800 text-xs uppercase tracking-wide truncate max-w-[140px]">{prop.title || "Propiedad"}</h5>
                                            <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{prop.refCode || "NO-REF"}</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                            <div className="bg-amber-50 rounded border border-amber-100 p-2">
                                                <p className="text-[8px] font-bold text-amber-700/50 uppercase">Precio</p>
                                                <p className="text-xs font-black text-amber-900">{formatMoney(price)}</p>
                                            </div>
                                            <div className="bg-emerald-50 rounded border border-emerald-100 p-2 text-right">
                                                <p className="text-[8px] font-bold text-emerald-700/50 uppercase">
                                                    Share {sharePct > 0 ? `${sharePct}%` : ""}
                                                </p>
                                                <p className="text-xs font-black text-emerald-700">
                                                    {sharePct > 0 ? `~${formatMoney(potentialEarnings)}` : "N/D"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. FOOTER: ACCIONES */}
                                <div className="flex border-t border-slate-100">
                                    <button 
                                        onClick={(e) => handleDelete(e, collab.id)}
                                        className="p-4 hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors border-r border-slate-100"
                                        title="Eliminar Negociación"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                    
                                    <button 
                                        onClick={() => {
                                            if (typeof window !== 'undefined') {
                                                window.dispatchEvent(new CustomEvent('open-details-signal', { detail: prop }));
                                                if (prop.latitude && prop.longitude) {
                                                    window.dispatchEvent(new CustomEvent('fly-to-location', { 
                                                        detail: { center: [prop.longitude, prop.latitude], zoom: 18 } 
                                                    }));
                                                }
                                            }
                                        }}
                                        className="flex-1 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-widest transition-colors"
                                    >
                                        Ver Ficha
                                    </button>

                                    <button 
                                        onClick={() => onOpenChat && onOpenChat({ conversationId: collab.id })}
                                        className="flex-[1.5] bg-[#1c1c1e] hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                    >
                                        Abrir Chat <ArrowRight size={12}/>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}