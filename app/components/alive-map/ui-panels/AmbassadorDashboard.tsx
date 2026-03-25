"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Wallet, Users, Copy, Check, ArrowUpRight, Mail, Star,
    Link as LinkIcon, MousePointerClick, Zap, Loader2, Inbox, Play, Film,
    ArrowLeft, Search, MapPin, X, Building2, ExternalLink, Megaphone, PlusCircle, Maximize2,
    BadgeCheck, ChevronDown, Filter, Hash, ShieldCheck, Info, Briefcase, User, Lock, Handshake
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
import HolinspectorModal from './HolinspectorModal';

export default function AmbassadorDashboard() {
    const router = useRouter();
    
    // --- ESTADOS DE VISTA ---
    const [view, setView] = useState<"DASHBOARD" | "PROFILE">("DASHBOARD");
    const [activeTab, setActiveTab] = useState<"PROPERTIES" | "DEMANDS">("PROPERTIES");
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [refreshDemands, setRefreshDemands] = useState(0); 
  
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
    
    // --- MODALES DETALLE ---
    const [selectedProperty, setSelectedProperty] = useState<any>(null); 
    const [generatedLink, setGeneratedLink] = useState<string>(""); 
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showCollabModal, setShowCollabModal] = useState<any>(null); // 🔥 MODAL B2B
    const [showHolinspector, setShowHolinspector] = useState<any>(null);
   const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
   
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

  // 🧠 FILTRADO DE PROPIEDADES EN EL RADAR
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

    // 💰 CÁLCULO DE LA BOLSA B2B TOTAL (Suma de todas las comisiones compartidas)
    const totalBolsaB2B = useMemo(() => {
        return properties.reduce((total, prop) => {
            const amount = Number(prop.commission || prop.b2b?.shareEstimatedEur || 0);
            return total + amount;
        }, 0);
    }, [properties]);

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

    const formatMoney = (amount: any) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(amount || 0));

   // 🔥 CONDICIONAL MAESTRO: ¿Mostramos Perfil o Dashboard?
    if (view === "PROFILE") {
        return (
            <AmbassadorProfile 
                initialTab={profileStartTab} 
                onBack={() => {
                    setView("DASHBOARD");
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

           {/* --- CABECERA FLOTANTE (ESTILO GLASS PREMIUM) --- */}
            <div className="sticky top-4 z-30 px-4 md:px-8 pointer-events-none">
                <header className="max-w-7xl mx-auto bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[28px] px-4 py-3 flex items-center justify-between pointer-events-auto">
                    
                    {/* IZQUIERDA: Back + Logo */}
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200/60 flex items-center justify-center transition-all active:scale-95 shadow-sm group">
                            <ArrowLeft size={18} className="text-slate-700 group-hover:-translate-x-0.5 transition-transform"/>
                        </button>
                        <div className="scale-90 origin-left md:scale-100">
                            <AmbassadorLogo /> 
                        </div>
                    </div>
                    
                    {/* DERECHA: Controles y Rango */}
                    <div className="flex items-center gap-4">
                        {/* 🛡️ Centro de Control Unificado */}
                        <div className="flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                            <button 
                                onClick={() => { setProfileStartTab("INBOX"); setView("PROFILE"); }} 
                                className="relative p-2.5 rounded-xl hover:bg-white hover:shadow-sm transition-all text-slate-500 hover:text-indigo-600 group"
                                title="Buzón de Mensajes"
                            >
                                <Inbox size={18} className="group-hover:scale-110 transition-transform" />
                                {hasUnread && (
                                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                                    </span>
                                )}
                            </button>
                            
                            <div className="w-px h-5 bg-slate-200 mx-1"></div>
                            
                            <button 
                                onClick={() => { setProfileStartTab("PROFILE"); setView("PROFILE"); }} 
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-white hover:shadow-sm transition-all text-slate-700 font-black text-[10px] uppercase tracking-widest group"
                            >
                                <User size={16} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                                <span className="hidden sm:inline">Mi Ficha</span>
                            </button>
                        </div>

                        {/* 🏅 Rango Táctico */}
                        <div className="hidden sm:flex items-center gap-3 bg-slate-900 text-white pl-4 pr-2 py-1.5 rounded-full shadow-lg shadow-slate-300/50">
                            <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400">{stats.rank}</span>
                            <div className="bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider flex items-center gap-1">
                                <Star size={10} className="text-amber-400 fill-amber-400"/>
                                {stats.score}/10
                            </div>
                        </div>
                    </div>
                </header>
            </div>

            {/* --- BODY --- */}
            <main className="flex-grow overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-8 pb-20">

                 {/* --- PANEL DE MÉTRICAS UNIFICADO (BÓVEDA DE MANDO) --- */}
                    <div className="relative bg-slate-900 rounded-[32px] p-2 shadow-2xl shadow-slate-300/50 overflow-hidden mt-16 mb-12">
                        {/* Efectos de fondo y luces de neón */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 relative z-10">
                            
                            {/* 💰 ZONA CARTERA (Izquierda) */}
                            <div className="lg:col-span-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[28px] p-8 flex flex-col justify-between min-h-[240px]">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-3 text-white/60">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/5">
                                            <Wallet size={18} className="text-white" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest block text-white">Bóveda B2B</span>
                                            <span className="text-xs font-medium">Balance Operativo</span>
                                        </div>
                                    </div>
                                    <button className="bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 group">
                                        Retirar Fondos <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"/>
                                    </button>
                                </div>
                                
                              <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start sm:items-end">
                                    {/* 1. EL GRAN MARCADOR: VOLUMEN COMPARTIDO A LA RED */}
                                    <div>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <Handshake size={12} className="text-amber-400"/> Volumen en Red
                                        </p>
                                        <p className="text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-md leading-none">
                                            {formatMoney(totalBolsaB2B)}
                                        </p>
                                    </div>
                                    
                                    {/* 2. TUS INGRESOS DISPONIBLES */}
                                    <div className="sm:border-l sm:border-white/10 sm:pl-6">
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">
                                            Tus Ingresos
                                        </p>
                                        <p className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none">
                                            {formatMoney(stats.availablePayout)}
                                        </p>
                                    </div>

                                    {/* 3. DINERO EN PROCESO */}
                                    <div className="sm:border-l sm:border-white/10 sm:pl-6">
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            En Proceso <Loader2 size={10} className="animate-spin text-emerald-400"/>
                                        </p>
                                        <p className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tight leading-none">
                                            {formatMoney(stats.pendingPayout)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 📊 ZONA ESTADÍSTICAS (Derecha) */}
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 flex flex-col gap-3">
                                <div className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl border border-white/5 group cursor-default">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-slate-700 transition-colors">
                                            <MousePointerClick size={18} className="text-slate-400 group-hover:text-white transition-colors"/>
                                        </div>
                                        <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Tráfico</span>
                                    </div>
                                    <span className="font-black text-2xl text-white">{stats.totalClicks}</span>
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-blue-500/10 hover:bg-blue-500/20 transition-colors rounded-2xl border border-blue-500/20 group cursor-default">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-900/50 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-blue-800 transition-colors">
                                            <Users size={18} className="text-blue-400 group-hover:text-blue-300 transition-colors"/>
                                        </div>
                                        <span className="text-[11px] font-black text-blue-200 uppercase tracking-widest">Leads</span>
                                    </div>
                                    <span className="font-black text-2xl text-blue-400">{stats.totalLeads}</span>
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-amber-500/10 hover:bg-amber-500/20 transition-colors rounded-2xl border border-amber-500/20 group cursor-default flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-amber-900/50 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-amber-800 transition-colors">
                                            <Zap size={18} className="text-amber-400 group-hover:text-amber-300 transition-colors"/>
                                        </div>
                                        <span className="text-[11px] font-black text-amber-200 uppercase tracking-widest">Conversiones</span>
                                    </div>
                                    <span className="font-black text-2xl text-amber-400">{stats.totalSales}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CONTROLES TÁCTICOS (CENTRO DE COMANDO REDISEÑADO) */}
{/* CONTROLES TÁCTICOS (LIMPIOS Y SIN EFECTOS CUADRADOS) */}
                    <div className="sticky top-0 z-10 pt-2 pb-6 -mx-2 px-2 bg-[#F5F5F7] space-y-4">                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            
                            {/* Pestañas estilo "Centro de Comando" */}
                            <div className="bg-white p-1.5 rounded-2xl inline-flex shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200/60 self-start">
                                <button 
                                    onClick={() => setActiveTab("PROPERTIES")} 
                                    className={`relative px-5 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-2.5 overflow-hidden ${activeTab === "PROPERTIES" ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                                >
                                    {activeTab === "PROPERTIES" && <span className="absolute left-0 w-1 h-full bg-blue-500 rounded-r-md"></span>}
                                    <Building2 size={16} className={activeTab === "PROPERTIES" ? "text-blue-400" : ""}/> 
                            Activos B2B
                                    {/* Indicador de radar activo (opcional: poner {properties.length}) */}
                                    <span className={`flex h-2 w-2 relative ml-1 ${activeTab === "PROPERTIES" ? 'opacity-100' : 'opacity-0'}`}>
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                </button>
                                
                                <button 
                                    onClick={() => setActiveTab("DEMANDS")} 
                                    className={`relative px-5 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-2.5 overflow-hidden ${activeTab === "DEMANDS" ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                                >
                                    {activeTab === "DEMANDS" && <span className="absolute left-0 w-1 h-full bg-amber-400 rounded-r-md"></span>}
                                    <Megaphone size={16} className={activeTab === "DEMANDS" ? "text-amber-400" : ""}/> 
                                    Demandas Activas
                                    <span className={`flex h-2 w-2 relative ml-1 ${activeTab === "DEMANDS" ? 'opacity-100' : 'opacity-0'}`}>
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                    </span>
                                </button>
                            </div>

                            {/* Botón de Publicar (ahora integrado de forma más natural a la derecha) */}
                            {activeTab === "DEMANDS" && (
                                <button 
                                    onClick={() => setShowPublishModal(true)} 
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-950 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_4px_16px_rgba(251,191,36,0.3)] transition-transform active:scale-95"
                                >
                                    <PlusCircle size={16}/> Emitir Señal de Búsqueda
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
                                   filteredProperties.map((prop) => {
                                        // 🧠 LÓGICA DE VISIBILIDAD B2B
                                        const visibility = prop.b2b?.visibility || prop.shareVisibility || "PRIVATE";
                                        const isVisible = visibility === "PUBLIC" || visibility === "AGENCIES";

                                        return (
                                        <div 
                                            key={prop.id} 
                                            onClick={() => {
                                                // 🛡️ EL BLINDAJE: Si es privado, bloqueamos la ficha y sacamos el modal oscuro
                                                if (isVisible) {
                                                    setSelectedProperty(prop);
                                                } else {
                                                    setShowCollabModal(prop);
                                                }
                                            }} 
                                            className="bg-white rounded-[28px] p-3 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col"
                                        >
                                           <div className="aspect-[4/3] bg-slate-100 rounded-[20px] overflow-hidden relative mb-4">
    {(() => {
        // 1. Extraemos la URL de la imagen/vídeo
        const mediaUrl = prop.img || prop.image || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80";
        
        // 2. Detective de formato (¿Es un vídeo?)
        const isVideo = mediaUrl.match(/\.(mp4|mov|webm|mkv)$/i) || mediaUrl.includes("/video/upload");

        if (isVideo) {
            // 🎬 MODO VÍDEO ACTIVO
            return (
                <div className="w-full h-full relative bg-slate-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <video src={mediaUrl} className="w-full h-full object-cover opacity-70" muted playsInline loop autoPlay />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 shadow-lg">
                            <Play size={16} className="text-white fill-white ml-0.5" />
                        </div>
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded-lg text-[9px] font-bold text-white uppercase flex items-center gap-1 shadow-sm">
                        <Film size={10} /> Video
                    </span>
                </div>
            );
        }

        // 📸 MODO FOTO NORMAL
        return (
            <img src={mediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Propiedad" />
        );
    })()}
    
    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-sm flex items-center gap-1 z-10">
        <Briefcase size={12} className="text-amber-600"/> B2B
    </div>
</div>
                                      <div className="px-2 flex-grow">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-slate-200 shrink-0">REF: {prop.refCode || "S/R"}</span>
                                                    
                                                    {/* 🔥 ETIQUETA TIPO MANDATO (LEE LA BD EXACTA) */}
                                                    {(() => {
                                                        const mandate = String(prop.mandateType || "").toUpperCase();
                                                        if (mandate === "EXCLUSIVE" || mandate === "EXCLUSIVA") {
                                                            return (
                                                                <span className="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest border border-amber-200 shrink-0 flex items-center gap-1">
                                                                    <Briefcase size={10} /> Exclusiva
                                                                </span>
                                                            );
                                                        } else {
                                                            return (
                                                                <span className="bg-slate-50 text-slate-400 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest border border-slate-200 shrink-0">
                                                                    No Exclusiva
                                                                </span>
                                                            );
                                                        }
                                                    })()}
                                                </div>
                                                
                                                <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1 line-clamp-1">{prop.title}</h3>
                                                
                                                {/* 🔥 INYECCIÓN DEL PRECIO REAL JUNTO A LA UBICACIÓN 🔥 */}
                                                <div className="flex justify-between items-center mb-4 mt-1">
                                                    <p className="text-slate-400 text-xs font-medium flex items-center gap-1"><MapPin size={12}/> {prop.city}</p>
                                                    <p className="text-sm font-black text-slate-900 tracking-tight bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">{formatMoney(prop.price)}</p>
                                                </div>
                                            </div>

                                        {/* 🔥 EL BOTÓN MUTANTE B2B (CON AVATAR INYECTADO) 🔥 */}
                                            <div 
                                                onClick={(e) => { e.stopPropagation(); setShowCollabModal(prop); }}
                                                className="bg-slate-50 rounded-[20px] p-4 flex justify-between items-center mt-auto border border-slate-100 group-hover:border-amber-200 transition-colors hover:bg-amber-50 cursor-pointer group/btn"
                                            >
                                                {isVisible ? (
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 group-hover/btn:text-amber-600 transition-colors">Tu Comisión</p>
                                                        <p className="text-xl font-black text-slate-900">{formatMoney(prop.commission || prop.b2b?.shareEstimatedEur || 0)}</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 group-hover/btn:text-amber-600 transition-colors">Colaboración</p>
                                                        <p className="text-sm font-black text-slate-700 flex items-center gap-1.5"><Lock size={14} className="text-slate-400"/> Consultar Honorarios</p>
                                                    </div>
                                                )}
                                                
                                                {/* Contenedor del Botón y el Avatar */}
                                                <div className="flex items-center gap-2">
                                                    
                                                    {/* 🛡️ EL AVATAR DE LA AGENCIA */}
                                                    <div 
                                                        className="relative group/avatar cursor-help"
                                                        title={`Gestionado por: ${prop.agencyName || 'Agencia Partner'}`}
                                                    >
                                                        {prop.agencyLogo ? (
                                                            <img 
                                                                src={prop.agencyLogo} 
                                                                alt={prop.agencyName} 
                                                                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200/50 group-hover/btn:ring-amber-200 transition-all"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center shadow-sm ring-1 ring-slate-200/50 group-hover/btn:ring-amber-200 transition-all">
                                                                <Briefcase size={12} className="text-slate-400" />
                                                            </div>
                                                        )}
                                                        
                                                        {/* Tooltip táctico flotante (Opcional, pero letal) */}
                                                        <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                                                            {prop.agencyName || 'Agencia Partner'}
                                                        </div>
                                                    </div>

                                                    {/* El botón de apretón de manos original */}
                                                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover/btn:text-amber-600 group-hover/btn:bg-amber-100 group-hover/btn:scale-110 transition-all border border-slate-100 group-hover/btn:border-amber-200">
                                                        <Handshake size={20}/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    })
                                )}
                            </div>
                        ) : (
                            <DemandBoard refreshTrigger={refreshDemands} /> 
                        )}
                    </div>

                </div>
            </main>

     {/* --- MODAL DETALLE (PROPIEDADES - PANEL LATERAL CON GALERÍA) --- */}
            {selectedProperty && (
                <div className="fixed inset-0 z-50 flex justify-end items-stretch">
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedProperty(null)}></div>
                    <div className="relative w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        
                        {/* HEADER */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
                            <h2 className="font-black text-xl text-slate-900 truncate pr-4">{selectedProperty.title}</h2>
                            <button onClick={() => setSelectedProperty(null)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors shrink-0">
                                <X size={20} className="text-slate-500"/>
                            </button>
                        </div>
                        
                        <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 shrink-0">
                             <Hash size={12} className="text-slate-400"/>
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">REF: {selectedProperty.refCode || "SIN REFERENCIA"}</span>
                        </div>

                        {/* BODY SCROLLABLE */}
                        <div className="flex-grow overflow-y-auto p-6 space-y-8 bg-white custom-scrollbar">
                            
                        {/* 🔥 NUEVA GALERÍA DE IMÁGENES BLINDADA (FOTO + VÍDEO) 🔥 */}
                            <div className="w-full overflow-x-auto custom-scrollbar pb-2 -mx-2 px-2 snap-x snap-mandatory">
                                <div className="flex gap-3">
                                    {(() => {
                                        const imagesList = Array.isArray(selectedProperty.images) && selectedProperty.images.length > 0 
                                            ? selectedProperty.images 
                                            : [selectedProperty.image || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80"];

                                        return imagesList.map((img: string, i: number) => {
                                            // 🕵️ Detective Multimedia
                                            const isVideo = img.match(/\.(mp4|mov|webm|mkv)$/i) || img.includes("/video/upload");

                                            return (
                                                <div 
                                                    key={i} 
                                                    onClick={() => setShowHolinspector(selectedProperty)}
                                                    className="aspect-video w-[85%] shrink-0 rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-900 snap-center relative group cursor-pointer"
                                                >
                                                    {isVideo ? (
                                                        <>
                                                            <video src={img} className="w-full h-full object-cover opacity-80" muted playsInline loop autoPlay />
                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 shadow-lg">
                                                                    <Play size={16} className="text-white fill-white ml-0.5" />
                                                                </div>
                                                            </div>
                                                            <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded-lg text-[9px] font-bold text-white uppercase flex items-center gap-1 shadow-sm">
                                                                <Film size={10} /> Video
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <img src={img} className="w-full h-full object-cover" alt={`Vista ${i+1}`} />
                                                    )}
                                                    
                                                    {/* Efecto visual al pasar el ratón para indicar que se puede ampliar */}
                                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-all duration-300 flex items-center justify-center">
                                                        <div className="bg-white/90 backdrop-blur text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 shadow-lg transform translate-y-2 group-hover:translate-y-0">
                                                            <Maximize2 size={12} /> Ver Expediente
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                            
                            {/* 🛡️ LÓGICA DE BLINDAJE B2B */}
                            {(() => {
                                const isPublicDetail = selectedProperty.b2b?.visibility === "PUBLIC" || selectedProperty.b2b?.visibility === "AGENCIES" || selectedProperty.shareVisibility === "PUBLIC" || selectedProperty.shareVisibility === "AGENCIES";

                                if (isPublicDetail) {
                                    return (
                                        <>
                                        {/* 🔥 PANEL DE DIFUSIÓN DUO TÁCTICO 🔥 */}
                                        <div className="bg-slate-50 rounded-[24px] p-2 mb-2 border border-slate-200 shadow-sm">
                                            <h3 className="text-center text-[11px] font-black text-slate-900 uppercase tracking-widest py-3 mb-2 border-b border-slate-200/50">
                                                Centro de Enlaces de Difusión
                                            </h3>

                                            <div className="p-1 space-y-3">
                                                
                                                {/* ==========================================
                                                    ENLACE PÚBLICO (MARCA BLANCA)
                                                ========================================== */}
                                                <div className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-200"></div>
                                                    
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                            <LinkIcon size={14} className="text-slate-400" /> Enlace Público <span className="text-[10px] text-slate-400 font-bold">(Marca Blanca)</span>
                                                        </h4>
                                                    </div>
                                                    
                                                    <p className="text-[10px] font-bold text-slate-500 mb-2 leading-tight">
                                                        Oculta la agencia gestora y detalles de comisión. Ideal para tus clientes directos.
                                                    </p>

                                                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                                        <div className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs text-slate-600 font-mono truncate select-all cursor-text flex items-center">
                                                            {generatedLink ? generatedLink.replace('/vip/', '/p/') : "Cargando..."}
                                                        </div>
                                                        <div className="flex gap-2 shrink-0">
                                                            <button 
                                                                onClick={() => handleCopyLink(generatedLink ? generatedLink.replace('/vip/', '/p/') : "", "link-white")}
                                                                className={`px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${copiedId === "link-white" ? "bg-green-500 text-white shadow-lg shadow-green-500/30" : "bg-slate-900 text-white hover:bg-black"}`}
                                                            >
                                                                {copiedId === "link-white" ? <Check size={16}/> : <Copy size={16}/>} Copiar
                                                            </button>
                                                            <button 
                                                                onClick={() => window.open(generatedLink ? generatedLink.replace('/vip/', '/p/') : "", '_blank')} 
                                                                className="px-5 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center font-bold bg-white gap-2"
                                                                title="Probar Enlace"
                                                            >
                                                                <ExternalLink size={16}/> Abrir
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* ==========================================
                                                    ENLACE PROFESIONAL (B2B)
                                                ========================================== */}
                                                <div className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300"></div>

                                                    {(() => {
                                                        const sharePct = selectedProperty.b2b?.sharePct || 0;
                                                        const myCommission = selectedProperty.commission || 0;
                                                        const totalCommission = sharePct > 0 ? (myCommission * 100) / sharePct : 0;
                                                        
                                                        return (
                                                        <>
                                                            <div className="flex justify-between items-center mb-3">
                                                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                                    <Handshake size={14} className="text-amber-600"/> Enlace Profesional <span className="text-[10px] text-amber-600 font-bold">(B2B)</span>
                                                                </h4>
                                                                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-[9px] font-black tracking-widest border border-amber-200">
                                                                    {sharePct}% B2B
                                                                </span>
                                                            </div>
                                                            
                                                            <p className="text-[10px] font-bold text-slate-500 mb-4 leading-tight">
                                                                Acceso a protocolos de alianza, cookie a 30 días y detalles financieros. Exclusivo para agentes.
                                                            </p>

                                                            {/* Finanzas Compactas B2B */}
                                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                                <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-slate-200/60 pb-2 sm:pb-0">
                                                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Precio Inversor</span>
                                                                    <span className="font-black text-slate-900 text-sm">{formatMoney(selectedProperty.price)}</span>
                                                                </div>
                                                                <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-slate-200/60 pb-2 sm:pb-0">
                                                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total {selectedProperty.totalCommissionPct > 0 ? `(${selectedProperty.totalCommissionPct}%)` : ''}</span>
                                                                    <span className="font-black text-slate-700 text-sm">{formatMoney(totalCommission)}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] text-green-700 font-bold uppercase tracking-widest mb-1">Tu Comisión ({sharePct}%)</span>
                                                                    <span className="font-black text-green-600 text-sm">{formatMoney(myCommission)}</span>
                                                                </div>
                                                            </div>

                                                            {/* Controles de Enlace B2B */}
                                                            <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                                                <div className="flex-grow bg-amber-50/50 border border-amber-200/60 rounded-xl px-3 py-3 text-xs text-slate-700 font-mono truncate select-all cursor-text flex items-center">
                                                                    {generatedLink || "Cargando..."}
                                                                </div>
                                                                <div className="flex gap-2 shrink-0">
                                                                    <button 
                                                                        onClick={() => handleCopyLink(generatedLink, "link-black")}
                                                                        className={`px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${copiedId === "link-black" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" : "bg-slate-900 text-white hover:bg-black"}`}
                                                                    >
                                                                        {copiedId === "link-black" ? <><Check size={16}/> Copiado</> : <><Copy size={16}/> Copiar B2B</>}
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => window.open(generatedLink, '_blank')} 
                                                                        className="px-5 py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition-colors flex items-center justify-center gap-2 font-bold border border-amber-300/50"
                                                                    >
                                                                        <ExternalLink size={16}/> Abrir
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </>
                                                        );
                                                    })()}
                                                </div>
                                                
                                            </div>
                                        </div>
                                        
                                        </>
                                    );
                                } else {
                                    return (
                                        <>
                                            {/* LINK SECTION (PRIVADO) */}
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                                                <Lock size={28} className="text-slate-400 mb-3"/>
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Enlace Bloqueado</h3>
                                                <p className="text-xs text-slate-500 leading-relaxed font-medium">Esta propiedad es de gestión privada. Contacta con la agencia para solicitar permiso de comercialización.</p>
                                            </div>

                                            {/* DETAILS SECTION (PRIVADO) */}
                                            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500 font-bold">Precio Inversor</span>
                                                    <span className="font-black text-slate-900">{formatMoney(selectedProperty.price)}</span>
                                                </div>
                                                <div className="h-px bg-slate-200"></div>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-black text-slate-900">COMISIÓN (TÚ)</span>
                                                    <span className="text-xl font-black text-slate-400 flex items-center gap-1.5"><Lock size={18}/> Oculta</span>
                                                </div>
                                            </div>
                                        </>
                                    );
                                }
                            })()}

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
         {/* 🤝 MODAL OSCURO B2B (COLABORACIÓN INTELIGENTE) */}
            {showCollabModal && (
                <div className="fixed inset-0 z-[100000] flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowCollabModal(null)}></div>
                    <div className="relative w-full max-w-sm bg-[#1A1C23] rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center border border-white/10" onClick={(e) => e.stopPropagation()}>
                        
                        <button onClick={() => setShowCollabModal(null)} className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                            <X size={16}/>
                        </button>

                        <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)] mb-6">
                            <Handshake size={32} className="text-amber-900" strokeWidth={2.5}/>
                        </div>

                        {/* Título dinámico */}
                        <h2 className="text-xl font-black text-white tracking-tight mb-2">
                            {(showCollabModal.b2b?.visibility === "PUBLIC" || showCollabModal.b2b?.visibility === "AGENCIES" || showCollabModal.shareVisibility === "PUBLIC" || showCollabModal.shareVisibility === "AGENCIES") ? "Colaboración Activa" : "Colaboración Privada"}
                        </h2>
                        
                        {/* Texto dinámico */}
                        <p className="text-xs text-slate-400 text-center leading-relaxed font-medium mb-8 max-w-[250px]">
                            {(showCollabModal.b2b?.visibility === "PUBLIC" || showCollabModal.b2b?.visibility === "AGENCIES" || showCollabModal.shareVisibility === "PUBLIC" || showCollabModal.shareVisibility === "AGENCIES") 
                                ? "Esta propiedad admite colaboración inmediata. Trae a tu comprador y comparte honorarios." 
                                : "Esta agencia comparte honorarios, pero requiere un contacto previo para negociar las condiciones y revelar la comisión."}
                        </p>

                        <div className="w-full bg-white/5 rounded-[24px] p-5 border border-white/10 mb-6 flex flex-col items-center">
                            <div className="flex w-full justify-between items-center mb-3">
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Tu Comisión</span>
                                {(showCollabModal.b2b?.visibility === "PUBLIC" || showCollabModal.b2b?.visibility === "AGENCIES" || showCollabModal.shareVisibility === "PUBLIC" || showCollabModal.shareVisibility === "AGENCIES") && (
                                    <span className="bg-white/10 text-slate-300 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                        {showCollabModal.b2b?.sharePct || showCollabModal.sharePct || 50}% DEL TOTAL
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2 mb-1">
                                {(showCollabModal.b2b?.visibility === "PUBLIC" || showCollabModal.b2b?.visibility === "AGENCIES" || showCollabModal.shareVisibility === "PUBLIC" || showCollabModal.shareVisibility === "AGENCIES") ? (
                                    <>
                                        <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center border border-amber-400/30">
                                            <span className="text-amber-400 font-black text-xs">€</span>
                                        </div>
                                        <span className="text-3xl font-black text-white tracking-tighter">
                                            {formatMoney(showCollabModal.commission || showCollabModal.b2b?.shareEstimatedEur || 0)}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Lock size={24} className="text-slate-500 mr-1"/>
                                        <span className="text-2xl font-black text-slate-300 tracking-tighter">Oculto</span>
                                    </>
                                )}
                            </div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Estimado (+ IVA)</span>
                        </div>

                        {/* 🔥 BOTÓN INTELIGENTE (Desvío Táctico) */}
                        <button 
                            onClick={() => {
                                const isPub = showCollabModal.b2b?.visibility === "PUBLIC" || showCollabModal.b2b?.visibility === "AGENCIES" || showCollabModal.shareVisibility === "PUBLIC" || showCollabModal.shareVisibility === "AGENCIES";
                                if (isPub) {
                                    // RUTA A: Es público, abrimos la ficha
                                    setShowCollabModal(null);
                                    setSelectedProperty(showCollabModal); 
                                } else {
                                    // RUTA B: Es privado, NO abrimos la ficha. Le obligamos a enviar un correo.
                                    setShowCollabModal(null);
                                    const email = showCollabModal.user?.email || "";
                                    if (email) {
                                        window.location.href = `mailto:${email}?subject=Consulta Colaboración REF: ${showCollabModal.refCode || "S/R"}`;
                                    } else {
                                        toast.info("Contacta mediante el buzón directo con la agencia.");
                                    }
                                }
                            }} 
                            className={`w-full py-4 font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                (showCollabModal.b2b?.visibility === "PUBLIC" || showCollabModal.b2b?.visibility === "AGENCIES" || showCollabModal.shareVisibility === "PUBLIC" || showCollabModal.shareVisibility === "AGENCIES")
                                ? "bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                                : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 shadow-sm"
                            }`}
                        >
                            {(showCollabModal.b2b?.visibility === "PUBLIC" || showCollabModal.b2b?.visibility === "AGENCIES" || showCollabModal.shareVisibility === "PUBLIC" || showCollabModal.shareVisibility === "AGENCIES") ? (
                                <><Briefcase size={16}/> Aceptar Colaboración</>
                            ) : (
                                <><Mail size={16}/> Contactar Agencia</>
                            )}
                        </button>
                    </div>
                </div>
            )}
{/* 🔎 ======================================================== 🔎 */}
            {/* 🔎 HOLINSPECTOR (NUEVO MODAL DETALLE A PANTALLA COMPLETA) 🔎 */}
            {/* 🔎 ======================================================== 🔎 */}
            {showHolinspector && (() => {
                // BLINDAJE ANTI-CRASH: Obligamos a que sea un Array sí o sí
                const imagesList = Array.isArray(showHolinspector.images) && showHolinspector.images.length > 0 
                    ? showHolinspector.images 
                    : [showHolinspector.image || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80"];

                return (
                    <div className="fixed inset-0 z-[110000] flex items-center justify-center p-4 sm:p-6">
                        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowHolinspector(null)}></div>
                        
                        <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                            
                            {/* HEADER */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10 shrink-0">
                                <div className="flex items-center gap-3">
                                    <h2 className="font-black text-lg text-slate-900 uppercase tracking-tight">
                                       DATOS <span className="text-blue-600">GENERALES</span>
                                    </h2>
                                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-slate-200 hidden sm:inline-block">
                                        REF: {showHolinspector.refCode || "S/R"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {showHolinspector.agencyName && (
                                        <div className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg">
                                            <Briefcase size={12} className="text-slate-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{showHolinspector.agencyName}</span>
                                        </div>
                                    )}
                                    <button onClick={() => setShowHolinspector(null)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                                        <X size={18} className="text-slate-600"/>
                                    </button>
                                </div>
                            </div>

                            {/* BODY SCROLLABLE */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-slate-50">
                                
                              {/* 🔥 GALERÍA DE IMÁGENES DEL HOLINSPECTOR (CON BOTÓN DE AMPLIAR) 🔥 */}
                                <div className="mb-6 sm:mb-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 h-48 sm:h-64">
                                        {imagesList.slice(0, 3).map((img: string, i: number) => (
                                            <div 
                                                key={`main-foto-${i}`} 
                                                onClick={() => setFullscreenImage(img)} // 💣 ESTE ES EL DETONADOR
                                                className="relative rounded-2xl overflow-hidden shadow-sm group bg-slate-200 cursor-pointer"
                                            >
                                                <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={`Vista ${i+1}`} />
                                                
                                                {/* Botón visual "Ampliar" que aparece al pasar el ratón */}
                                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-all duration-300 flex items-center justify-center">
                                                    <div className="bg-slate-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 shadow-2xl transform translate-y-4 group-hover:translate-y-0">
                                                        <Maximize2 size={16} /> Ampliar
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {imagesList.length > 3 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 h-24 sm:h-32">
                                            {imagesList.slice(3, 8).map((img: string, i: number) => (
                                                <div 
                                                    key={`thumb-foto-${i}`} 
                                                    onClick={() => setFullscreenImage(img)} // 💣 DETONADOR MINIS
                                                    className="relative rounded-xl overflow-hidden shadow-sm group bg-slate-200 cursor-pointer"
                                                >
                                                    <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={`Miniatura ${i+1}`} />
                                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                                                        <Maximize2 size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* GRID DE INFORMACIÓN (3 COLUMNAS) */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
                                    
                               {/* COLUMNA 1: PLANO / MAPA (MAPBOX INTEGRADO) */}
                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Ubicación Estratégica</h3>
                                        
                                        <div className="aspect-square rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group shadow-sm bg-slate-100">
                                            {/* Renderizado Condicional: Si hay coordenadas, pintamos Mapbox. Si no, blueprint. */}
                                            {showHolinspector.longitude && showHolinspector.latitude ? (
                                                <img 
                                                    src={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/pin-s+3b82f6(${showHolinspector.longitude},${showHolinspector.latitude})/${showHolinspector.longitude},${showHolinspector.latitude},16,0/600x600?access_token=pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw`}
                                                    alt="Mapa Satélite"
                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/blueprint.png')]"></div>
                                            )}
                                            
                                            {/* Overlay Oscuro para que se lea el texto y el icono siempre */}
                                            <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors flex flex-col items-center justify-center p-4">
                                                <MapPin size={40} className="text-white group-hover:scale-110 transition-all duration-300 relative z-10 mb-3 drop-shadow-lg" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest relative z-10 text-center drop-shadow-lg">
                                                    {showHolinspector.city || "Zona de Operaciones"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COLUMNA 2: SPECS & AMENITIES */}
                                    <div className="flex flex-col gap-6">
                                        <div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Especificaciones</h3>
                                            <div className="space-y-2.5">
                                                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-1.5">
                                                    <span className="text-slate-500 font-medium">Construido</span>
                                                    <span className="font-bold text-slate-900">{showHolinspector.mBuilt || showHolinspector.m2 || 0} m²</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-1.5">
                                                    <span className="text-slate-500 font-medium">Habitaciones</span>
                                                    <span className="font-bold text-slate-900">{showHolinspector.rooms || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-1.5">
                                                    <span className="text-slate-500 font-medium">Baños</span>
                                                    <span className="font-bold text-slate-900">{showHolinspector.baths || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-1.5">
                                                    <span className="text-slate-500 font-medium">Estado</span>
                                                    <span className="font-bold text-slate-900">{showHolinspector.state || "Buen estado"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Amenities</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {['pool', 'garage', 'garden', 'terrace', 'ac', 'heating'].filter(k => showHolinspector[k]).length > 0 ? (
                                                    ['pool', 'garage', 'garden', 'terrace', 'ac', 'heating'].filter(k => showHolinspector[k]).map((key, i) => {
                                                        const labels: any = { pool: "Piscina", garage: "Garaje", garden: "Jardín", terrace: "Terraza", ac: "Aire Acond.", heating: "Calefacción" };
                                                        return (
                                                            <span key={i} className="bg-slate-100 text-slate-600 text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider border border-slate-200">
                                                                {labels[key]}
                                                            </span>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-medium">Sin amenities registradas.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
{/* COLUMNA 3: DESCRIPCIÓN & FINANZAS */}
                                    <div className="flex flex-col gap-6">
                                        
                                        {/* TOUR VIRTUAL */}
                                        <div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">3D Tour</h3>
                                            <button 
                                                className={`w-full py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shadow-sm ${showHolinspector.tourUrl ? 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                                onClick={() => showHolinspector.tourUrl && window.open(showHolinspector.tourUrl, '_blank')}
                                            >
                                                {showHolinspector.tourUrl ? "Iniciar Inspección Virtual" : "Tour No Disponible"}
                                            </button>
                                        </div>

                                        {/* DESCRIPCIÓN */}
                                        <div className="flex-1 flex flex-col min-h-[100px] max-h-[200px]">
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2 shrink-0">Descripción</h3>
                                            <div className="text-xs text-slate-600 leading-relaxed font-medium overflow-y-auto custom-scrollbar pr-2 flex-1">
                                                {showHolinspector.description || `Exclusiva propiedad en ${showHolinspector.city || 'su zona'}. Contacte para más detalles.`}
                                            </div>
                                        </div>

                                      {/* 🔥 CAJA FINANCIERA B2B 🔥 */}
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm mt-auto">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Condiciones Económicas</h3>
                                            <div className="space-y-3">
                                                
                                                {/* Precio de Venta */}
                                                <div className="flex justify-between items-end border-b border-slate-200/60 pb-2">
                                                    <span className="text-xs font-bold text-slate-600">Precio Venta:</span>
                                                    <span className="text-lg font-black text-slate-900">{formatMoney(showHolinspector.price)}</span>
                                                </div>

                                                {/* Lógica de Comisión B2B */}
                                                {(() => {
                                                    const isPublic = showHolinspector.b2b?.visibility === "PUBLIC" || showHolinspector.b2b?.visibility === "AGENCIES";
                                                    
                                                    // 🧮 MATEMÁTICAS TÁCTICAS: Calculamos el total a partir de tu porcentaje
                                                    const sharePct = showHolinspector.b2b?.sharePct || 0;
                                                    const myCommission = showHolinspector.commission || 0;
                                                    const totalCommission = sharePct > 0 ? (myCommission * 100) / sharePct : 0;
                                                    
                                                    if (isPublic) {
                                                        return (
                                                            <>
                                                               {/* Línea: Honorarios Totales + Porcentaje Original */}
                                                                <div className="flex justify-between items-end border-b border-slate-200/60 pb-2">
                                                                    <span className="text-xs font-bold text-slate-500">
                                                                        Honorarios Totales {showHolinspector.totalCommissionPct > 0 ? `(${showHolinspector.totalCommissionPct}%)` : ''}:
                                                                    </span>
                                                                    <span className="text-sm font-black text-slate-700">{formatMoney(totalCommission)}</span>
                                                                </div>

                                                                {/* Tu Comisión */}
                                                                <div className="flex justify-between items-end pt-1">
                                                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Tu Comisión ({sharePct}%):</span>
                                                                    <span className="text-xl font-black text-emerald-600">{formatMoney(myCommission)}</span>
                                                                </div>
                                                            </>
                                                        );
                                                    } else {
                                                        return (
                                                            <div className="flex justify-between items-end pt-1">
                                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comisión B2B:</span>
                                                                <span className="text-sm font-black text-slate-400 flex items-center gap-1">
                                                                    <Lock size={14}/> A Consultar
                                                                </span>
                                                            </div>
                                                        );
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- FIN DE LA COLUMNA 3 --- */}

                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
{/* 🔍 ======================================================== 🔍 */}
            {/* 🔍 VISOR DE FOTOS A PANTALLA COMPLETA (CON MARCA DE AGUA) 🔍 */}
            {/* 🔍 ======================================================== 🔍 */}
            {fullscreenImage && (
                <div className="fixed inset-0 z-[120000] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
                    
                    {/* Botón Cerrar */}
                    <button 
                        onClick={() => setFullscreenImage(null)} 
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 backdrop-blur-md cursor-pointer"
                    >
                        <X size={24}/>
                    </button>

                    {/* Contenedor de la Imagen y Marca de Agua */}
                    <div className="relative max-w-7xl max-h-[90vh] w-full h-full p-4 flex items-center justify-center">
                        <img 
                            src={fullscreenImage} 
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
                            alt="Vista Ampliada Stratosfere" 
                        />
                        
                        {/* 💧 MARCA DE AGUA TODOTERRENO (Visible en luz y oscuridad) */}
                        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center select-none">
                            <p className="text-white/40 text-4xl md:text-7xl font-black tracking-tighter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] transform -rotate-12">
                                Stratosfere OS
                            </p>
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