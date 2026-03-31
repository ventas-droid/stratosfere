"use client";
import React, { useState, useEffect } from 'react';
import { 
    Users, ShieldCheck, X, Search, Handshake,
    MessageSquare, Phone, MapPin, Trash2, Navigation, 
    Loader2, TrendingUp, Mail, Award, Clock, Crown,
    Check, MessageCircle, Link as LinkIcon, Coins, 
    Building2, Heart, BedDouble, Bath, Maximize
} from 'lucide-react';
import { toast } from 'sonner';

// IMPORTAMOS LA INTELIGENCIA
import { getAgencyAmbassadorsAction, getAgencyLeadsAction, deleteAgencyLeadAction, getMyCommanderAction  } from '@/app/actions-agency';
import { getPusherClient } from '@/app/utils/pusher';
import { getUserMeAction } from '@/app/actions';

export default function AgencyAmbassadorPanel({ onClose }: { onClose: () => void }) {
    
    // --- ESTADOS ---
    const [activeTab, setActiveTab] = useState<"TROOPS" | "LEADS">("TROOPS");
    const [loading, setLoading] = useState(true);
    const [ambassadors, setAmbassadors] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // 🔥 NUEVOS ESTADOS TÁCTICOS PARA BOMBARDERO MASIVO Y RECLUTAMIENTO
    const [selectedTroops, setSelectedTroops] = useState<string[]>([]);
    const [myAgencyId, setMyAgencyId] = useState<string>("");
    
    // 🛡️ NUEVO ESTADO: EL COMANDANTE (Para mostrar el escudo si fui reclutado)
    const [myCommander, setMyCommander] = useState<any>(null);

    // 🔄 CARGA DE DATOS INICIAL
    useEffect(() => {
        loadIntelligence();
    }, []);

    const loadIntelligence = async () => {
        setLoading(true);
        try {
            // 🔥 Identificamos nuestra propia frecuencia (nuestro ID)
           const meRes = await getUserMeAction();
            if (meRes?.data?.id) {
                setMyAgencyId(meRes.data.id);
                
                // 🛡️ BÚSQUEDA DEL COMANDANTE (Si me han reclutado)
                if (meRes.data.recruitedById) {
                    const cmdRes = await getMyCommanderAction();
                    if (cmdRes?.success && cmdRes.data) {
                        setMyCommander(cmdRes.data);
                    }
                }
            }

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

    // 📡 ANTENA DE TIEMPO REAL: Escucha las bengalas del servidor
    useEffect(() => {
        let channelName = "";
        const pusher = getPusherClient(); // 🔥 ENCENDEMOS EL MOTOR DE PUSHER AQUÍ

        const turnOnRadar = async () => {
            try {
                if (myAgencyId) {
                    channelName = `user-${myAgencyId}`;
                    
                    // 2. Nos sintonizamos a nuestro canal privado
                    pusher.subscribe(channelName);
                    
                    // 3. Cuando escuchemos "new-lead", disparamos la alarma y recargamos
                    pusher.bind("new-lead", (incomingLead: any) => {
                        toast.success("🎯 ¡Nuevo contacto B2B detectado en el radar!");
                        // Recargamos la lista en segundo plano para traer el lead completo
                        loadIntelligence(); 
                    });
                }
            } catch (error) {
                console.error("Error sintonizando radar:", error);
            }
        };

        if (myAgencyId) {
            turnOnRadar();
        }

        // 4. Apagamos la radio si cerramos el panel (limpieza táctica)
        return () => {
            if (channelName) {
                pusher.unbind("new-lead");
                pusher.unsubscribe(channelName);
            }
        };
    }, [myAgencyId]);

    // 🔙 MANIOBRA DE RETIRADA
    const handleBackToProfile = () => {
        onClose(); 
        setTimeout(() => {
            if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('open-agency-profile'));
        }, 50);
    };

    // 🔥 VUELO TÁCTICO Y FILTRO DE PRIVACIDAD (INTACTO ORIGINAL)
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
    // 🔥 NUEVA LÓGICA DE RECLUTAMIENTO Y PANEL MASIVO B2B
    // ============================================================================
    const handleCopyInviteLink = async () => {
        if (!myAgencyId) {
            alert("Radar no sincronizado. Imposible generar código.");
            return;
        }

        // 🎯 LECTURA TÁCTICA AUTOMÁTICA: Detecta el dominio real sin fallos
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://stratosfere.com';
        const inviteLink = `${baseUrl}/join?sponsor=${myAgencyId}`;        
        
        try {
            await navigator.clipboard.writeText(inviteLink);
            alert("🎯 ¡ENLACE COPIADO CON ÉXITO!\n\n" + inviteLink + "\n\nYa puede pegarlo en WhatsApp o Email.");
        } catch (err) {
            alert("Error al copiar. Copie este enlace manualmente:\n" + inviteLink);
        }
    };

    const handleSelectAll = () => {
        if (selectedTroops.length === filteredAmbassadors.length) {
            setSelectedTroops([]);
        } else {
            setSelectedTroops(filteredAmbassadors.map(a => a.id));
        }
    };

    const toggleTroop = (id: string) => {
        setSelectedTroops(prev => 
            prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
        );
    };

  const handleMassEmail = () => {
        const emails = ambassadors.filter(a => selectedTroops.includes(a.id)).map(a => a.email).filter(Boolean);
        if(emails.length) {
            // Esto abre el correo PREDETERMINADO del usuario (Outlook, Mail, Gmail app...)
            window.location.href = `mailto:?bcc=${emails.join(',')}`;
            toast.success("Cliente de correo abierto en copia oculta.");
        } else {
            toast.error("Las tropas seleccionadas no tienen email registrado.");
        }
    };

   const handleMassWhatsApp = () => {
        const phones = ambassadors
            .filter(a => selectedTroops.includes(a.id))
            .map(a => a.phone || a.mobile)
            .filter(Boolean)
            .map(p => String(p).replace(/\D/g, '')); 

        if (phones.length === 0) {
            toast.error("Ninguno de los contactos seleccionados tiene teléfono.");
            return;
        }

        if (phones.length === 1) {
            // 🛡️ DETECCIÓN INTELIGENTE DE DISPOSITIVO
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            if (isMobile) {
                // Si es un móvil, abrimos la App nativa directamente
                window.open(`https://wa.me/${phones[0]}`, '_blank');
            } else {
                // Si es ordenador, FORZAMOS WhatsApp Web para evitar apps viejas o rotas
                window.open(`https://web.whatsapp.com/send?phone=${phones[0]}`, '_blank');
            }
        } else {
            navigator.clipboard.writeText(phones.join(', '));
            toast.success(`📱 ${phones.length} teléfonos copiados para Lista de Difusión.`);
            alert(`WhatsApp Anti-Spam:\nNo se pueden abrir ${phones.length} chats a la vez.\n\nHemos copiado los números al portapapeles para que los pegue en una Lista de Difusión de WhatsApp:\n\n${phones.join(', ')}`);
        }
    };

    const handleMassCall = () => {
        const phones = ambassadors
            .filter(a => selectedTroops.includes(a.id))
            .map(a => a.phone || a.mobile)
            .filter(Boolean)
            .map(p => String(p).replace(/\D/g, ''));

        if (phones.length === 0) {
            toast.error("Ninguna de las tropas seleccionadas tiene teléfono.");
            return;
        }

        if (phones.length === 1) {
            // Llamada directa desde móvil o Mac
            window.location.href = `tel:+${phones[0]}`;
        } else {
            toast.warning("Comandante, solo puede realizar 1 llamada telefónica a la vez. Seleccione solo 1 tropa.");
        }
    };
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
                <div className="flex items-center gap-3">
                    {/* 🔥 NUEVO BOTÓN RECLUTAR */}
                    <button 
                        onClick={handleCopyInviteLink} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                    >
                        <LinkIcon size={14} strokeWidth={2.5}/> Invitar a red
                    </button>

                    <div className="bg-indigo-50/80 text-indigo-700 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-indigo-100/50 shadow-inner">
                        <ShieldCheck size={16} strokeWidth={2.5}/> {leads.length} Leads
                    </div>
                </div>
            </div>

            {/* ---{/* --- CONTROLES INTELIGENTES --- */}
            <div className="px-8 py-5 bg-white/40 backdrop-blur-md border-b border-black/5 space-y-4 z-10">
                
                {/* 🛡️ ESCUDO DE ALIANZA (SOLO VISIBLE SI FUI INVITADO POR ALGUIEN) */}
                {myCommander && (
                    <div className="bg-slate-900 rounded-[20px] p-4 flex items-center justify-between shadow-xl shadow-slate-900/10 border border-slate-800 animate-in fade-in slide-in-from-top-4 mb-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-amber-500/50 flex items-center justify-center overflow-hidden shrink-0">
                                {myCommander.companyLogo || myCommander.avatar ? (
                                    <img src={myCommander.companyLogo || myCommander.avatar} className="w-full h-full object-cover" alt="Comandante" />
                                ) : (
                                    <ShieldCheck className="text-amber-500" size={20} />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                    <Handshake size={10} /> Alianza B2B Activa
                                </p>
                                <p className="text-sm font-bold text-white leading-none truncate">{myCommander.companyName || myCommander.name}</p>
                            </div>
                        </div>
                        {(myCommander.mobile || myCommander.phone) && (
                            <a 
                                href={`https://wa.me/${String(myCommander.mobile || myCommander.phone).replace(/\D/g,'')}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 shrink-0"
                                title="Contactar por WhatsApp"
                            >
                                <MessageCircle size={16} />
                            </a>
                        )}
                    </div>
                )}

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
            <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar relative z-0">
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
                            <div className={`space-y-4 ${selectedTroops.length > 0 ? 'pb-24' : 'pb-6'}`}>
                                
                                {/* 🔥 CONTROL MAESTRO: SELECCIONAR TODOS 🔥 */}
                                {filteredAmbassadors.length > 0 && (
                                    <div 
                                        onClick={handleSelectAll}
                                        className="flex items-center justify-between bg-white/60 backdrop-blur-md p-4 rounded-[20px] mb-2 border border-slate-200 shadow-sm cursor-pointer group transition-all hover:bg-white"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all ${selectedTroops.length === filteredAmbassadors.length ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white group-hover:border-indigo-400'}`}>
                                                {selectedTroops.length === filteredAmbassadors.length && <Check size={14} strokeWidth={3} />}
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 group-hover:text-indigo-600 transition-colors">
                                                Seleccionar Todos los Embajadores ({filteredAmbassadors.length})
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* 🔥 ESTADO VACÍO NUEVO (BOTÓN DE COPIAR ENLACE) 🔥 */}
                                {filteredAmbassadors.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-24 opacity-90 animate-in fade-in zoom-in duration-500">
                                        <div className="w-28 h-28 bg-indigo-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-xl shadow-indigo-600/10">
                                            <Handshake size={48} className="text-indigo-500"/>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-3">Red Desplegada</h3>
                                        <p className="text-sm text-slate-500 text-center max-w-sm mb-8 leading-relaxed font-medium">
                                            Aún no tiene soldados asignados a su agencia. Copie su enlace seguro y envíelo a comerciales independientes para expandir su red de ventas.
                                        </p>
                                        <button 
                                            onClick={handleCopyInviteLink}
                                            className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 active:scale-95"
                                        >
                                            <LinkIcon size={18}/> Copiar Enlace B2B
                                        </button>
                                    </div>
                                )}

                        {/* 🔥 LISTA DE ALIADOS MODIFICADA CON CHECKBOX Y NANO-CARD B2B 🔥 */}
                                {filteredAmbassadors.map((soldier) => {
                                    const isSelected = selectedTroops.includes(soldier.id);
                                    const property = soldier.featuredProperty; // 🎯 Capturamos la propiedad de la ruleta

                                    return (
                                        <div 
                                            key={soldier.id} 
                                            onClick={() => toggleTroop(soldier.id)}
                                            className={`bg-white p-5 rounded-[28px] cursor-pointer shadow-[0_2px_20px_rgba(0,0,0,0.03)] border transition-all duration-300 group mb-4 ${isSelected ? 'border-indigo-500 shadow-[0_10px_40px_rgba(79,70,229,0.15)] ring-1 ring-indigo-500' : 'border-slate-100 hover:border-indigo-200 hover:shadow-[0_10px_40px_rgba(79,70,229,0.08)] hover:-translate-y-1'}`}
                                        >
                                            <div className="flex items-center gap-5">
                                            {/* CHECKBOX INDIVIDUAL */}
                                                <div className={`shrink-0 w-6 h-6 rounded-[8px] border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-slate-50 group-hover:border-indigo-400'}`}>
                                                    {isSelected && <Check size={14} strokeWidth={3} />}
                                                </div>

                                                {/* AVATAR O LOGO DE LA AGENCIA */}
                                                <div className="w-16 h-16 bg-slate-100 rounded-[20px] overflow-hidden border-2 border-white shadow-md relative group-hover:scale-105 transition-transform shrink-0">
                                                    {(soldier.companyLogo || soldier.avatar) ? (
                                                        <img src={soldier.companyLogo || soldier.avatar} alt={soldier.companyName || soldier.name || "Avatar"} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-slate-300">
                                                            <Users size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* DATOS DE LA AGENCIA / SOLDADO */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-black text-lg text-slate-900 leading-tight mb-0.5 truncate group-hover:text-indigo-600 transition-colors">
                                                        {soldier.companyName || soldier.name}
                                                    </h3>
                                                    
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <p className="text-[11px] font-bold text-slate-400 truncate">
                                                            {soldier.email}
                                                        </p>
                                                        
                                                        {/* 📱 CHIVATO DEL TELÉFONO */}
                                                        {(soldier.phone || soldier.mobile) && (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shadow-sm shrink-0">
                                                                <Phone size={10} strokeWidth={2.5} /> 
                                                                {soldier.phone || soldier.mobile}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                       <span className="bg-indigo-50 text-indigo-700 text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border border-indigo-100/50">
                                                            {soldier.ambassadorStats?.rank || "NUEVO ALIADO"} 
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                                            <Award size={12}/> Score: {soldier.ambassadorStats?.score || "5.0"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                           {/* 🔥 LA FICHA TÁCTICA DE LA PROPIEDAD (LA QUE VUELA) 🔥 */}
                                            {property && (
                                                <div 
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // 🛡️ Evita que se marque el checkbox del embajador
                                                        
                                                        const lng = parseFloat(String(property.longitude || 0));
                                                        const lat = parseFloat(String(property.latitude || 0));
                                                        const areCoordsValid = Number.isFinite(lng) && Number.isFinite(lat) && (Math.abs(lng) > 0.0001);

                                                        let finalCoords = null;
                                                        if (areCoordsValid) {
                                                            finalCoords = (Math.abs(lng) > 30 && Math.abs(lat) < 20) ? [lat, lng] : [lng, lat];
                                                        }

                                                        const richPayload = {
                                                            ...property,
                                                            user: { 
                                                                name: soldier.companyName || soldier.name, 
                                                                companyLogo: soldier.companyLogo, 
                                                                role: 'AGENCIA' 
                                                            }
                                                        };

                                                        if (typeof window !== 'undefined') {
                                                            window.dispatchEvent(new CustomEvent("select-property-signal", { detail: { id: String(property.id) } }));
                                                            window.dispatchEvent(new CustomEvent('open-details-signal', { detail: richPayload }));
                                                            
                                                            if (finalCoords) {
                                                                requestAnimationFrame(() => {
                                                                    window.dispatchEvent(new CustomEvent('fly-to-location', { 
                                                                        detail: { center: finalCoords, zoom: 18.5, pitch: 60, duration: 1500 } 
                                                                    }));
                                                                });
                                                            }
                                                        }
                                                    }} 
                                                    className="mt-5 bg-[#f8f9fa] border border-slate-200 rounded-[24px] flex flex-col md:flex-row min-h-[150px] cursor-pointer hover:border-amber-300 hover:shadow-xl transition-all duration-300 group/prop overflow-hidden relative"
                                                >
                                                    {/* FOTO IZQUIERDA */}
                                                    <div className="w-full md:w-[150px] h-[150px] md:h-auto relative shrink-0 overflow-hidden bg-slate-200 border-r border-slate-200">
                                                        <img 
                                                            src={property.mainImage || "/placeholder.jpg"} 
                                                            alt={property.title} 
                                                            className="w-full h-full object-cover group-hover/prop:scale-110 transition-transform duration-700" 
                                                        />
                                                        {/* BADGE TIPO */}
                                                        <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-[8px] flex items-center gap-1.5 shadow-sm">
                                                            <Building2 size={12} className="text-indigo-600"/>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">{property.type || "PISO"}</span>
                                                        </div>
                                                        {/* BADGE CORAZÓN */}
                                                        <div className="absolute bottom-3 left-3 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                                            <Heart size={14} className="text-white"/>
                                                        </div>
                                                    </div>

                                                    {/* DATOS DERECHA */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-between bg-gradient-to-r from-transparent to-slate-50/50">
                                                        <div className="p-4 pb-2 flex justify-between items-start gap-4">
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 truncate">
                                                                    {property.refCode || "REF. PENDIENTE"}
                                                                </p>
                                                                <h4 className="font-extrabold text-base text-slate-900 leading-tight truncate">
                                                                    {property.title || "Propiedad Confidencial"}
                                                                </h4>
                                                                <div className="font-black text-[22px] tracking-tight text-slate-900 mt-1">
                                                                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price || 0)}
                                                                </div>
                                                                <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 mt-1.5 truncate">
                                                                    <Navigation size={12} className="shrink-0"/> {property.address || property.city || "Ubicación Privada"}
                                                                </p>
                                                            </div>

                                                            {/* 🔥 GANCHO B2B (Mano dorada) OPUESTO A LA FOTO 🔥 */}
                                                            {Number(property.sharePct) > 0 && (
                                                                <div className="shrink-0 flex flex-col items-center bg-white border border-amber-200 rounded-2xl p-2.5 shadow-[0_4px_15px_rgba(245,158,11,0.15)] group-hover/prop:border-amber-400 transition-all duration-300 group-hover/prop:-translate-y-1">
                                                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-white mb-1 shadow-inner">
                                                                        <Handshake size={20} strokeWidth={2.5} />
                                                                    </div>
                                                                    <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest mt-1">Tu Comisión</span>
                                                                    <span className="font-black text-amber-600 text-base leading-none mt-0.5">{property.sharePct}%</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* ICONOS BOTTOM */}
                                                        <div className="px-4 pb-4 flex items-center gap-5 text-slate-500 mt-2">
                                                            <div className="flex items-center gap-1.5">
                                                                <BedDouble size={14} strokeWidth={2}/>
                                                                <span className="text-sm font-bold text-slate-700">{property.rooms || "-"}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Bath size={14} strokeWidth={2}/>
                                                                <span className="text-sm font-bold text-slate-700">{property.baths || "-"}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Maximize size={14} strokeWidth={2}/>
                                                                <span className="text-sm font-bold text-slate-700">{property.mBuilt || "-"} <span className="text-[10px]">m²</span></span>
                                                            </div>
                                                        </div>

                                                   {/* 🔥 EL BANNER INFERIOR "QUIERO PULSAR" 🔥 */}
                                                        {Number(property.sharePct) > 0 && (
                                                            <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between group-hover/prop:bg-slate-950 transition-colors w-full border-t border-slate-800">
                                                                <span className="text-xs font-black text-amber-400 tracking-widest uppercase flex items-center gap-2 group-hover/prop:translate-x-1 transition-transform">
                                                                    ¡Cierra este acuerdo!
                                                                </span>
                                                                <span className="text-sm font-black text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                                                                    + {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(((Number(property.price || 0) * Number(property.commissionPct || 3)) / 100) * (Number(property.sharePct || 0) / 100))}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {/* ============================================================== */}
                        {/* 📡 VISTA DE LEADS (BUZÓN DE TRANSMISIONES) -> INTACTO DEL ORIGINAL */}
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
                                                    
                                               <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-slate-200">
                                                        REF: {p?.refCode || "---"}
                                                    </span>
                                                    
                                                    {/* 🔥 ROI CAMPAÑA VIP */}
                                                    {(lead.source === 'MARKET_NETWORK' || lead.campaignId || lead.name?.includes('VIP')) && (
                                                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm border border-orange-400">
                                                            <Crown size={10} className="text-white"/> ROI CAMPAÑA VIP
                                                        </span>
                                                    )}

                                                    {/* 🏎️ 🔥 EL NUEVO CHIVATO FERRARI NEGRO (B2B) 🔥 🏎️ */}
                                                    {lead.source === 'B2B_NETWORK' && (
                                                        <span className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm border border-amber-500/30">
                                                            <Handshake size={10} className="text-amber-500"/> ALIANZA B2B
                                                        </span>
                                                    )}
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
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ============================================================== */}
            {/* 🚀 PANEL FLOTANTE DE BOMBARDERO MASIVO (SOLO ACTIVO AL SELECCIONAR) */}
            {/* ============================================================== */}
            {activeTab === "TROOPS" && selectedTroops.length > 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-900 rounded-[24px] p-3 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-slate-700/50 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="flex items-center gap-3 pl-3">
                        <div className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-inner">
                            {selectedTroops.length}
                        </div>
                       <div className="flex flex-col">
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white leading-none">
        Contactos
    </span>
    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
        Seleccionados
    </span>
</div>
                    </div>
                    
                    <div className="flex gap-2">
                        {/* WhatsApp */}
                        <button 
                            onClick={handleMassWhatsApp} 
                            className="w-12 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition-all hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                            title="Lanzar WhatsApp Masivo"
                        >
                            <MessageCircle size={20} strokeWidth={2.5}/>
                        </button>
                        {/* Email */}
                        <button 
                            onClick={handleMassEmail} 
                            className="w-12 h-12 rounded-xl bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center transition-all hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                            title="Lanzar Email Masivo"
                        >
                            <Mail size={20} strokeWidth={2.5}/>
                        </button>
                        {/* Call */}
                        <button 
                            onClick={handleMassCall} 
                            className="w-12 h-12 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white flex items-center justify-center transition-all hover:scale-105 shadow-md" 
                            title="Auto-Marcado Simultáneo"
                        >
                            <Phone size={20} strokeWidth={2.5}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

