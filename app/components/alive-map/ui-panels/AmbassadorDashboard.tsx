"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Wallet, Users, Copy, Check, ArrowUpRight, 
    Link as LinkIcon, MousePointerClick, Zap, Loader2, Inbox, 
    ArrowLeft, Search, MapPin, X, Building2, ExternalLink, Megaphone, PlusCircle,
    BadgeCheck, ChevronDown, Filter, Hash, ShieldCheck, Info, Briefcase, User 
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// IMPORTAMOS LAS ACCIONES
import { getAmbassadorDashboardAction, getPromotablePropertiesAction, generateAffiliateLinkAction } from '@/app/actions-ambassador';


// 🔥 IMPORTAMOS LOS COMPONENTES EXTERNOS
import AmbassadorProfile from './AmbassadorProfile';
import AmbassadorLogo from './AmbassadorLogo';
import DemandBoard from './DemandBoard';
import PublishDemandModal from './PublishDemandModal';
import { getReceivedProposalsAction } from '@/app/actions-demands'; 

export default function AmbassadorDashboard() {
    const router = useRouter();
    
    // --- ESTADOS DE VISTA ---
    const [view, setView] = useState<"DASHBOARD" | "PROFILE">("DASHBOARD");
    const [activeTab, setActiveTab] = useState<"PROPERTIES" | "DEMANDS">("PROPERTIES"); // 🔥 Estado para las pestañas
const [showPublishModal, setShowPublishModal] = useState(false);
const [refreshDemands, setRefreshDemands] = useState(0); // Gatillo para recargar la lista
  
// 🔥 ESTADOS DEL RADAR GLOBAL DE MENSAJES
    const [hasUnread, setHasUnread] = useState(false);
    const [profileStartTab, setProfileStartTab] = useState<"PROFILE" | "INBOX">("PROFILE");

    // 📡 RADAR: Busca si hay mensajes sin leer al cargar el Dashboard
    useEffect(() => {
        getReceivedProposalsAction().then(res => {
            if (res.success && res.data) {
                setHasUnread(res.data.some((prop: any) => prop.status === "UNREAD"));
            }
        });
    }, []);


// --- ESTADOS DE DATOS ---
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({
        totalRevenue: 0, pendingPayout: 0, availablePayout: 0,
        score: 5.0, rank: "PARTNER",
        totalClicks: 0, totalLeads: 0, totalSales: 0
    });
    const [properties, setProperties] = useState<any[]>([]);
    
    // --- FILTROS ---
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedZone, setSelectedZone] = useState("TODAS");
    const [sortOrder, setSortOrder] = useState<"HIGHEST" | "LOWEST">("HIGHEST");

    // --- SELECTOR ZONA ---
    const [isZoneOpen, setIsZoneOpen] = useState(false);
    const [zoneSearch, setZoneSearch] = useState("");
    const zoneWrapperRef = useRef<HTMLDivElement>(null);
    
    // --- MODAL DETALLE ---
    const [selectedProperty, setSelectedProperty] = useState<any>(null); 
    const [generatedLink, setGeneratedLink] = useState<string>(""); 
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // 🔄 CARGA INICIAL
    useEffect(() => {
        const loadData = async () => {
            if (view === "PROFILE") return;
            setLoading(true);
            try {
                const [statsRes, propsRes] = await Promise.all([
                    getAmbassadorDashboardAction(),
                    getPromotablePropertiesAction()
                ]);

                if (statsRes.success) setStats(statsRes.data);
                if (propsRes.success) setProperties(propsRes.data);
            } catch (error) {
                console.error("Error loading dashboard:", error);
                toast.error("Error de conexión. Intenta recargar.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [view]);

    // 🧠 CERRAR SELECTOR AL CLICKAR FUERA
    useEffect(() => {
        function handleClickOutside(event: any) {
            if (zoneWrapperRef.current && !zoneWrapperRef.current.contains(event.target)) {
                setIsZoneOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [zoneWrapperRef]);

    // 🧠 GENERAR LINK AL ABRIR MODAL
    useEffect(() => {
        if (selectedProperty) {
            setGeneratedLink("Generando enlace seguro...");
            generateAffiliateLinkAction(selectedProperty.id).then(res => {
                if (res.success && res.link) {
                    setGeneratedLink(res.link);
                } else {
                    setGeneratedLink("Error al generar enlace");
                    toast.error("No se pudo generar el enlace único.");
                }
            });
        }
    }, [selectedProperty]);

    // 🧠 CÁLCULO DE ZONAS Y FILTRADO
    const zoneStats = useMemo(() => {
        const stats: Record<string, number> = {};
        properties.forEach(p => {
            if(p.city) stats[p.city] = (stats[p.city] || 0) + 1;
        });
        return stats;
    }, [properties]);

    const filteredZonesList = useMemo(() => {
        const allZones = Object.keys(zoneStats);
        if (!zoneSearch) return allZones;
        return allZones.filter(z => z.toLowerCase().includes(zoneSearch.toLowerCase()));
    }, [zoneStats, zoneSearch]);

    const filteredProperties = useMemo(() => {
        let result = [...properties];
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(p => 
                p.title?.toLowerCase().includes(lower) || 
                p.city?.toLowerCase().includes(lower) ||
                p.refCode?.toLowerCase().includes(lower)
            );
        }
        if (selectedZone !== "TODAS") {
            result = result.filter(p => p.city === selectedZone);
        }
        result.sort((a, b) => sortOrder === "HIGHEST" ? b.commission - a.commission : a.commission - b.commission);
        return result;
    }, [properties, searchTerm, selectedZone, sortOrder]);

    // 📋 COPIAR LINK
    const handleCopyLink = async (textToCopy: string, id: string) => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopiedId(id);
            toast.success("Enlace copiado", { description: "Listo para compartir." });
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            toast.error("Error al copiar");
        }
    };

    const handleQuickCopy = async (e: React.MouseEvent, propertyId: string) => {
        e.stopPropagation(); 
        const promise = generateAffiliateLinkAction(propertyId);
        toast.promise(promise, {
            loading: 'Generando enlace...',
            success: (data) => {
                if (data.success && data.link) {
                    navigator.clipboard.writeText(data.link);
                    setCopiedId(propertyId);
                    setTimeout(() => setCopiedId(null), 2000);
                    return "¡Enlace copiado!";
                } else throw new Error("Fallo");
            },
            error: 'Error al generar',
        });
    };

    const formatMoney = (amount: any) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(amount || 0));

   // 🔥 CONDICIONAL MAESTRO: ¿Mostramos Perfil o Dashboard?
    if (view === "PROFILE") {
        return (
            <AmbassadorProfile 
                initialTab={profileStartTab} 
                onBack={() => {
                    setView("DASHBOARD");
                    // Recargamos el radar por si ha leído los mensajes
                    getReceivedProposalsAction().then(res => {
                        if (res.success && res.data) {
                            setHasUnread(res.data.some((prop: any) => prop.status === "UNREAD"));
                        }
                    });
                }} 
            />
        );
    }

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#F5F5F7]"><Loader2 className="animate-spin text-slate-400" size={32} /></div>;

    return (
        <div className="h-screen bg-[#F5F5F7] flex flex-col font-sans text-slate-900 overflow-hidden">
            <Toaster position="bottom-center" richColors theme="light" />

      {/* --- CABECERA DEFINITIVA Y OPERATIVA --- */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex-shrink-0 z-20 sticky top-0">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                
                {/* 🛡️ FLANCO IZQUIERDO: Navegación y Marca */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all active:scale-95 shadow-sm group">
                        <ArrowLeft size={18} className="text-slate-700 group-hover:-translate-x-0.5 transition-transform"/>
                    </button>
                    {/* 🚀 LOGO ENCAPSULADO */}
                    <AmbassadorLogo /> 
                </div>
                
                {/* ⚙️ FLANCO DERECHO: Centro de Mando Operativo */}
                <div className="flex items-center gap-3">
                    
                    {/* 📬 BOTÓN DEL BUZÓN (MOTOR CONECTADO Y RADAR INTELIGENTE) */}
                    <button 
                        onClick={() => {
                            setProfileStartTab("INBOX");
                            setView("PROFILE");
                        }} 
                        className="relative p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all active:scale-95 shadow-sm group flex items-center gap-2"
                    >
                        <Inbox size={18} className="text-slate-600 group-hover:text-emerald-600 transition-colors" />
                        <span className="hidden md:inline text-xs font-bold text-slate-700 uppercase tracking-widest group-hover:text-emerald-700 transition-colors">Buzón</span>
                        
                        {/* El Chivato Rojo Inteligente */}
                        {hasUnread && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white shadow-sm"></span>
                            </span>
                        )}
                    </button>

                    {/* 👤 BOTÓN MI FICHA */}
                    <button 
                        onClick={() => {
                            setProfileStartTab("PROFILE");
                            setView("PROFILE");
                        }} 
                        className="hidden sm:flex items-center gap-2 p-2.5 px-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all active:scale-95 shadow-sm group"
                    >
                        <User size={16} className="text-slate-500 group-hover:text-slate-800 transition-colors" />
                        <span className="hidden md:inline text-xs font-bold text-slate-700 uppercase tracking-widest">Mi Ficha</span>
                    </button>

                    {/* 🎖️ RANGO PARTNER */}
                    <div className="flex items-center gap-2 bg-slate-900 text-white pl-4 pr-2 py-1.5 rounded-full shadow-lg shadow-slate-200 ml-2">
                        <span className="text-[10px] font-black tracking-widest uppercase">{stats.rank}</span>
                        <div className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-mono">{stats.score}/10</div>
                    </div>
                    
                </div>
            </div>
        </header>

            {/* --- BODY --- */}
            <main className="flex-grow overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-8 pb-20">

                    {/* METRICAS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-[#0A0A0A] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-300/50">
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[80px]"></div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-3 text-white/50">
                                        <Wallet size={20}/> <span className="text-xs font-bold uppercase tracking-widest">Cartera</span>
                                    </div>
                                    <button className="bg-white text-black px-5 py-2.5 rounded-full text-xs font-bold hover:scale-105 transition-transform flex items-center gap-2">
                                        Retirar <ArrowUpRight size={14}/>
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-12">
                                    <div>
                                        <p className="text-4xl md:text-5xl font-black tracking-tighter mb-1">{formatMoney(stats.availablePayout)}</p>
                                        <p className="text-white/40 text-xs font-bold">Disponible</p>
                                    </div>
                                    <div className="border-l border-white/10 pl-8">
                                        <p className="text-2xl md:text-3xl font-bold text-emerald-400 tracking-tight mb-1">{formatMoney(stats.pendingPayout)}</p>
                                        <p className="text-white/40 text-xs font-bold">En Proceso</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm"><MousePointerClick size={16} className="text-slate-400"/></div>
                                        <span className="text-xs font-bold text-slate-600">Clicks</span>
                                    </div>
                                    <span className="font-black text-slate-900">{stats.totalClicks}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm"><Users size={16} className="text-blue-500"/></div>
                                        <span className="text-xs font-bold text-blue-700">Leads</span>
                                    </div>
                                    <span className="font-black text-blue-700">{stats.totalLeads}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm"><Zap size={16} className="text-amber-500"/></div>
                                        <span className="text-xs font-bold text-amber-700">Ventas</span>
                                    </div>
                                    <span className="font-black text-amber-700">{stats.totalSales}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CONTROLES TÁCTICOS (TABS Y BUSCADOR) */}
                    <div className="sticky top-0 z-10 py-4 -mx-2 px-2 bg-[#F5F5F7]/90 backdrop-blur space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="bg-slate-200/70 p-1.5 rounded-2xl inline-flex shadow-inner">
                                <button onClick={() => setActiveTab("PROPERTIES")} className={`px-6 py-2.5 rounded-xl text-sm font-black tracking-widest uppercase transition-all flex items-center gap-2 ${activeTab === "PROPERTIES" ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <Building2 size={16}/> Arsenal B2B
                                </button>
                                <button onClick={() => setActiveTab("DEMANDS")} className={`px-6 py-2.5 rounded-xl text-sm font-black tracking-widest uppercase transition-all flex items-center gap-2 ${activeTab === "DEMANDS" ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <Megaphone size={16}/> Demandas Activas
                                </button>
                            </div>
                         {activeTab === "DEMANDS" && (
    <button onClick={() => setShowPublishModal(true)} className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-slate-900/20 transition-transform active:scale-95">
        <PlusCircle size={16}/> Publicar Demanda
    </button>
)}
                        </div>

                        {activeTab === "PROPERTIES" && (
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="relative flex-grow group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20}/>
                                    <input type="text" placeholder="Buscar referencia, nombre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl border-none shadow-sm focus:ring-4 focus:ring-blue-100 outline-none font-medium transition-all placeholder:text-slate-300"/>
                                </div>
                                <div className="relative w-full md:w-80" ref={zoneWrapperRef}>
                                    <button onClick={() => setIsZoneOpen(!isZoneOpen)} className={`w-full h-14 bg-white rounded-2xl shadow-sm flex items-center justify-between px-4 transition-all ${isZoneOpen ? 'ring-4 ring-blue-100' : ''}`}>
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedZone !== "TODAS" ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}><MapPin size={16} /></div>
                                            <div className="text-left overflow-hidden">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Zona</p>
                                                <p className="text-sm font-bold text-slate-900 truncate">{selectedZone === "TODAS" ? "Todas las Zonas" : selectedZone}</p>
                                            </div>
                                        </div>
                                        <ChevronDown size={18} className={`text-slate-400 transition-transform ${isZoneOpen ? 'rotate-180' : ''}`}/>
                                    </button>
                                    {isZoneOpen && (
                                        <div className="absolute top-full right-0 mt-2 w-full md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                                            <div className="relative mb-2">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                <input type="text" placeholder="Filtrar ciudad..." value={zoneSearch} onChange={e => setZoneSearch(e.target.value)} autoFocus className="w-full h-10 pl-9 pr-3 bg-slate-50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none"/>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                                                <button onClick={() => { setSelectedZone("TODAS"); setIsZoneOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex justify-between items-center transition-colors ${selectedZone === "TODAS" ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}>
                                                    <span>🌍 Todas las Zonas</span>{selectedZone === "TODAS" && <Check size={14}/>}
                                                </button>
                                                {filteredZonesList.map(city => (
                                                    <button key={city} onClick={() => { setSelectedZone(city); setIsZoneOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex justify-between items-center transition-colors ${selectedZone === city ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                                                        <span>{city}</span><span className="bg-slate-100 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">{zoneStats[city]}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* GRID MAESTRO (PROPIEDADES O DEMANDAS) */}
                    <div className="w-full">
                        {activeTab === "PROPERTIES" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredProperties.length === 0 ? (
                                    <div className="col-span-full py-20 text-center">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><Filter size={32} className="text-slate-300"/></div>
                                        <h3 className="text-lg font-bold text-slate-900">Sin resultados en esta zona</h3>
                                    </div>
                                ) : (
                                    filteredProperties.map((prop) => (
                                        <div key={prop.id} onClick={() => setSelectedProperty(prop)} className="bg-white rounded-[28px] p-3 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col">
                                            <div className="aspect-[4/3] bg-slate-100 rounded-[20px] overflow-hidden relative mb-4">
                                                <img src={`${prop.image}?t=${Date.now()}`} className="w-full h-full object-cover" />                                        
                                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-sm flex items-center gap-1">
                                                    <Briefcase size={12} className="text-green-800"/> B2B
                                                </div>
                                            </div>
                                            <div className="px-2 flex-grow">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-slate-200">REF: {prop.refCode || "S/R"}</span>
                                                </div>
                                                <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1 line-clamp-1">{prop.title}</h3>
                                                <p className="text-slate-400 text-xs font-medium flex items-center gap-1 mb-4"><MapPin size={12}/> {prop.city}</p>
                                            </div>
                                            <div className="bg-slate-50 rounded-[20px] p-4 flex justify-between items-center mt-auto border border-slate-100 group-hover:border-green-100 transition-colors">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Comisión</p>
                                                    <p className="text-xl font-black text-slate-900">{formatMoney(prop.commission)}</p>
                                                </div>
                                                <button onClick={(e) => handleQuickCopy(e, prop.id)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-green-700 group-hover:scale-110 transition-all">
                                                    <ArrowUpRight size={20}/>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <DemandBoard refreshTrigger={refreshDemands} /> 
                        )}
                    </div>

                </div>
            </main>

            {/* --- MODAL DETALLE (PROPIEDADES) --- */}
            {selectedProperty && (
                <div className="fixed inset-0 z-50 flex justify-end items-stretch">
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedProperty(null)}></div>
                    <div className="relative w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                            <h2 className="font-black text-xl text-slate-900 truncate pr-4">{selectedProperty.title}</h2>
                            <button onClick={() => setSelectedProperty(null)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors shrink-0">
                                <X size={20} className="text-slate-500"/>
                            </button>
                        </div>
                        
                        <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                             <Hash size={12} className="text-slate-400"/>
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">REF: {selectedProperty.refCode || "SIN REFERENCIA"}</span>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 space-y-8 bg-white">
                            <div className="aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white">
                                <img src={`${selectedProperty.image}?t=${Date.now()}`} className="w-full h-full object-cover" />                            
                            </div>
                            
                            {/* LINK SECTION */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <LinkIcon size={14} className="text-green-700"/> Enlace Único (B2B)
                                </h3>
                                <div className="flex gap-2 mb-3">
                                    <div className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-600 font-mono truncate select-all cursor-text">
                                        {generatedLink || "Cargando..."}
                                    </div>
                                    <button 
                                        onClick={() => handleCopyLink(generatedLink, "link-main")}
                                        className={`px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${copiedId === "link-main" ? "bg-green-500 text-white" : "bg-slate-900 text-white hover:bg-black"}`}
                                    >
                                        {copiedId === "link-main" ? <Check size={16}/> : <Copy size={16}/>}
                                    </button>
                                </div>
                                <button onClick={() => window.open(generatedLink, '_blank')} className="w-full py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                    <ExternalLink size={14}/> Probar Enlace
                                </button>
                            </div>

                            {/* DETAILS */}
                            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold">Precio Inversor</span>
                                    <span className="font-black text-slate-900">{formatMoney(selectedProperty.price)}</span>
                                </div>
                                <div className="h-px bg-slate-200"></div>
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-slate-900">COMISIÓN (TÚ)</span>
                                    <span className="text-2xl font-black text-green-700">{formatMoney(selectedProperty.commission)}</span>
                                </div>
                            </div>

                            {/* LEGAL / PROTOCOLO */}
                             <div className="pt-4 border-t border-slate-100 pb-4">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-slate-400"/> Protocolo de Operaciones
                                </h4>
                                <div className="space-y-4 text-xs text-slate-500 leading-relaxed font-medium">
                                    <div className="flex gap-3">
                                        <div className="w-1 min-w-[4px] h-auto bg-slate-200 rounded-full"></div>
                                        <div>
                                            <strong className="text-slate-900 block mb-0.5">Operación Ciega (Marca Blanca)</strong>
                                            Tus clientes no verán el nombre de la agencia vendedora en el enlace. Tu cliente es tuyo.
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-1 min-w-[4px] h-auto bg-blue-200 rounded-full"></div>
                                        <div>
                                            <strong className="text-slate-900 block mb-0.5">Atribución Inteligente</strong>
                                            El enlace instala una <em>cookie de 30 días</em>. Si el cliente contacta en ese plazo, la operación se te asigna automáticamente.
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-1 min-w-[4px] h-auto bg-green-200 rounded-full"></div>
                                        <div>
                                            <strong className="text-slate-900 block mb-0.5">Garantía de Cobro</strong>
                                            Los pagos se liberan a tu "Wallet" una vez la agencia gestora ha cobrado sus honorarios en notaría.
                                        </div>
                                    </div>
                                </div>
                               <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                                    <Info size={14} className="text-slate-400 shrink-0 mt-0.5"/>
                                    <p className="text-[10px] text-slate-400 leading-tight">
                                        Stratosfere actúa como notario digital. Registramos temporalmente cada clic y cada lead para proteger tus comisiones.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
            
            {/* 🔥 MODAL DE PUBLICAR DEMANDAS (INYECTADO AL FINAL) 🔥 */}
            <PublishDemandModal 
                isOpen={showPublishModal} 
                onClose={() => setShowPublishModal(false)}
                onSuccess={() => {
                    setShowPublishModal(false);
                    setRefreshDemands(prev => prev + 1); // Dispara la recarga del tablón
                }}
            />
       
        </div>
    );
}