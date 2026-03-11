"use client";
import { useState, useMemo, useEffect } from "react";
import AdminZoneManager from './AdminZoneManager';
import AdminGeoLocator from './AdminGeoLocator';
import AdminTop10Panel from './AdminTop10Panel'; // Ajuste ruta si es necesario
import AdminBillingManager from './AdminBillingManager';
import { togglePropertyPremiumAction, togglePropertyFireAction, togglePropertyStatusAction, toggleUserStatusAction, deletePropertyAction, deleteUserAction, createProspectAction, sendProspectEmailAction, importarBaseDeDatosAction, toggleUserSubscriptionAction, resetFreeTrialAction, resolveVipRequestAction } from "@/app/components/admin/actions";
import { 
    ShieldCheck, Ban, User, Search, Home, Clock, CreditCard, Building2, Crown, Crosshair,
    MapPin, BarChart3, Users, Gem, LayoutDashboard, LogOut, Trash2, Eye, EyeOff, Lock,
    Flame, Timer, ArrowRightLeft, Briefcase, FileText,  Star, Phone, Mail, AlertTriangle, CheckCircle2, Power, PowerOff, Target, Send, MessageCircle, X
} from "lucide-react";

const MASTER_PASSWORD = process.env.NEXT_PUBLIC_GOD_MODE_PASS;

// 🔥 MOTOR DE RELOJ AISLADO (Mejora de Rendimiento Extremo)
const LiveTimer = ({ endDate }: { endDate: string | Date }) => {
    const [timeLeft, setTimeLeft] = useState<string>("Calculando...");

    useEffect(() => {
        if (!endDate) return;
        const updateTimer = () => {
            const diff = new Date(endDate).getTime() - new Date().getTime();
            if (diff <= 0) return setTimeLeft("¡CADUCADO!");
            
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / 1000 / 60) % 60);
            const s = Math.floor((diff / 1000) % 60);
            setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
        };
        
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endDate]);

    return <>{timeLeft}</>;
};

export default function AdminDashboard({ users, properties = [], prospects = [], activeZones = [] }: { users: any[], properties?: any[], prospects?: any[], activeZones?: any[] }) {  
    const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const [activeTab, setActiveTab] = useState<'USERS' | 'PROPERTIES' | 'CRM' | 'ZONAS' | 'GEO' | 'TOP10' | 'BILLING'>('USERS');const [now, setNow] = useState<Date | null>(null);
// 🔥 SUB-NIVELES DEL CRM
const [crmTab, setCrmTab] = useState<'INBOUND' | 'OUTBOUND'>('INBOUND');

// 🔥 MEMORIA RAM TÁCTICA PARA VELOCIDAD ZAS ZAS
  const [localProperties, setLocalProperties] = useState(properties);
 
  // ESTADO DEL FORMULARIO DEL CRM
  const [newProspect, setNewProspect] = useState({ companyName: '', email: '', phone: '', city: '' });
  const [isSending, setIsSending] = useState(false);
// 🔥 ESTADOS PARA EL VISOR DE DOSSIERES VIP
  const [selectedDossier, setSelectedDossier] = useState<string | null>(null);
  const [showDossierModal, setShowDossierModal] = useState(false);

// 🔥 MOTOR DE BÚSQUEDA SILENCIADO (Debounce táctico)
  useEffect(() => {
      const handler = setTimeout(() => {
          setDebouncedSearch(searchTerm);
      }, 350); // 350ms de espera desde la última pulsación
      return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => { setLocalProperties(properties); }, [properties]);
 
useEffect(() => {
    setIsMounted(true);
    if (sessionStorage.getItem("god_mode_auth") === "true") setIsAuthenticated(true);
    
    // 🔥 MEMORIA DE PESTAÑA: Recordar en qué sección estaba el General
    const savedTab = sessionStorage.getItem("god_mode_tab");
    if (savedTab) setActiveTab(savedTab as 'USERS' | 'PROPERTIES' | 'CRM');

   setNow(new Date());
    // 🔥 Reloj gigante apagado para liberar la memoria RAM
  }, []);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeSubs = users.filter(u => u.subscription?.status === "ACTIVE").length;
    const activeTrials = users.filter(u => (u.role === 'AGENCIA' || u.role === 'AGENCY') && u.subscription?.status !== "ACTIVE" && u.subscription?.status !== "BLOCKED").length;
    // 👇 CAMBIADO A localProperties
    const indecisos = localProperties.filter(p => p.status === 'BORRADOR' || p.status === 'PENDIENTE_PAGO').length;
    return { totalUsers, activeSubs, activeTrials, indecisos };
  }, [users, localProperties]); // 👇 CAMBIADO A localProperties

const search = debouncedSearch.toLowerCase().trim();
 
const filteredUsers = users.filter(u => {
    if (!search) return true;
    return (u.name || "").toLowerCase().includes(search) || (u.companyName || "").toLowerCase().includes(search) || (u.email || "").toLowerCase().includes(search) || (u.phone || "").toLowerCase().includes(search) || (u.mobile || "").toLowerCase().includes(search);
  });

  // 🎯 BÚSQUEDA TÁCTICA: Ahora el God Mode detecta Precios y Ciudades
  const filteredProperties = localProperties.filter(p => { // 👇 CAMBIADO A localProperties
    if (!search) return true;
    const agency = p.assignment?.agency || p.campaigns?.[0]?.agency || {};
    const city = (p.city || p.address || "").toLowerCase();
    const priceStr = String(p.price || "");
    
    return (p.title || "").toLowerCase().includes(search) || (p.refCode || p.id || "").toLowerCase().includes(search) || 
           (p.user?.name || "").toLowerCase().includes(search) || (p.user?.email || "").toLowerCase().includes(search) || 
           (agency.name || "").toLowerCase().includes(search) || (agency.companyName || "").toLowerCase().includes(search) ||
           city.includes(search) || priceStr.includes(search);
  });

  const filteredProspects = prospects.filter(p => {
    if (!search) return true;
    return (p.companyName || "").toLowerCase().includes(search) || (p.email || "").toLowerCase().includes(search) || (p.city || "").toLowerCase().includes(search);
  });

  // 🔥 CONEXIÓN AL MICRO-RELOJ TÁCTICO
  const getTimeRemaining = (endDate: string | Date | null) => {
    if (!endDate) return null;
    return <LiveTimer endDate={endDate} />;
  };

  const formatDateExact = (date: any) => {
    if (!date) return "Sin datos";
    return new Date(date).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const checkIsFire = (prop: any) => prop.isFire === true || prop.isPromoted === true || (prop.promotedUntil && now && new Date(prop.promotedUntil) > now) || String(prop.promotedTier).toUpperCase().includes('FUEGO');
  const checkIsPremium = (prop: any) => prop.isPremium === true || prop.isPromoted === true || String(prop.promotedTier).toUpperCase().includes('PREMIUM');
  
  // FUNCIÓN PARA AÑADIR AGENCIA AL CRM
  const handleAddProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProspect.companyName || !newProspect.email) return alert("Nombre y Email son obligatorios.");
    setIsSending(true);
    const res = await createProspectAction(newProspect);
    if(res.success) {
        setNewProspect({ companyName: '', email: '', phone: '', city: '' });
        window.location.reload();
    } else {
        alert(res.error || "Error al añadir la agencia.");
        setIsSending(false);
    }
  };

 // ÓRDEN DE ATAQUE: IMPORTACIÓN MASIVA
  const handleCargarTropas = async () => {
    if (window.confirm("🔥 ¿Autoriza la importación masiva de tropas desde la base de datos?")) {
        const resultado = await importarBaseDeDatosAction();
        if (resultado.success) {
            alert(`¡MISIÓN CUMPLIDA! Se han desplegado ${resultado.count} agencias nuevas en el radar.`);
            window.location.reload(); 
        } else {
            alert("⚠️ Error en el despliegue de tropas.");
        }
    }
  };
 
if (!isMounted) return <div className="fixed inset-0 bg-gray-50" />;

if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100000] bg-[#050505] flex items-center justify-center font-sans overflow-hidden">
        {/* LUCES TÁCTICAS DE FONDO */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse"></div>

        <div className="relative z-10 w-full max-w-[440px] p-6">
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center">
                
                {/* ICONO ESCUDO CON GLOW */}
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-blue-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(79,70,229,0.3)] transform -rotate-3 hover:rotate-0 transition-all duration-700">
                    <ShieldCheck size={48} strokeWidth={1.5} />
                </div>
                
                <h1 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase italic">Stratosfere</h1>
                <p className="text-indigo-400/60 font-bold tracking-[0.4em] text-[10px] uppercase mb-12">God Mode Access</p>
                
                <div className="relative mb-8">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20">
                        <Lock size={20} />
                    </div>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="CÓDIGO SUPREMO" 
                        className="w-full pl-14 pr-14 py-5 bg-white/[0.05] border border-white/10 rounded-2xl text-white text-center text-lg font-black tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-white/10 placeholder:font-normal placeholder:tracking-normal" 
                        value={passwordInput} 
                        onChange={(e) => setPasswordInput(e.target.value)} 
                        onKeyDown={(e) => { if (e.key === 'Enter' && passwordInput === MASTER_PASSWORD) { setIsAuthenticated(true); sessionStorage.setItem("god_mode_auth", "true"); } }} 
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-indigo-400 transition-colors"
                    >
                        {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                </div>

                <button 
                    onClick={() => { if (passwordInput === MASTER_PASSWORD) { setIsAuthenticated(true); sessionStorage.setItem("god_mode_auth", "true"); } }} 
                    className="w-full bg-white text-black font-black py-5 rounded-2xl text-sm uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-[0.97]"
                >
                    Desbloquear Sistema
                </button>
            </div>
            
            <div className="flex justify-center items-center gap-4 mt-10">
                <div className="h-[1px] w-12 bg-white/10"></div>
                <p className="text-white/20 text-[10px] font-bold tracking-widest uppercase">Encriptación AES-256 Activa</p>
                <div className="h-[1px] w-12 bg-white/10"></div>
            </div>
        </div>
      </div>
    );
}

  return (
<div className="fixed inset-0 overflow-y-auto bg-[#f8fafc] z-[100000] font-sans pointer-events-auto selection:bg-indigo-500 selection:text-white" style={{ height: "100vh", width: "100vw" }}>
     <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center"><LayoutDashboard size={18} /></div>
                <span className="font-bold text-gray-900 tracking-tight">Stratosfere <span className="text-gray-400 font-normal">God Mode</span></span>
            </div>
           <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
               <button onClick={() => { setActiveTab('USERS'); sessionStorage.setItem('god_mode_tab', 'USERS'); }} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'USERS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><Users size={14}/> Agencias</button>
                <button onClick={() => { setActiveTab('PROPERTIES'); sessionStorage.setItem('god_mode_tab', 'PROPERTIES'); }} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'PROPERTIES' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><Flame size={14} className={activeTab === 'PROPERTIES' ? "text-orange-500" : ""} /> Radar</button>
                <button onClick={() => { setActiveTab('CRM'); sessionStorage.setItem('god_mode_tab', 'CRM'); }} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'CRM' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-indigo-600'}`}><Target size={14}/> CRM Captación</button>
               
               {/* 👑 NUEVO BOTÓN: ZONAS VIP */}
                <button onClick={() => { setActiveTab('ZONAS' as any); sessionStorage.setItem('god_mode_tab', 'ZONAS'); }} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'ZONAS' as any ? 'bg-amber-100 text-amber-700 shadow-sm border border-amber-200' : 'text-gray-500 hover:text-amber-600'}`}><Crown size={14}/> Market Network</button>

               {/* 🎯 NUEVO BOTÓN: GEO SNIPER VIP */}
                <button onClick={() => { setActiveTab('GEO' as any); sessionStorage.setItem('god_mode_tab', 'GEO'); }} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'GEO' as any ? 'bg-emerald-100 text-emerald-700 shadow-sm border border-emerald-200' : 'text-gray-500 hover:text-emerald-600'}`}><Crosshair size={14}/> Geo Sniper</button>

            {/* ⭐ NUEVO BOTÓN: COMANDO TOP 10 */}
                <button onClick={() => { setActiveTab('TOP10' as any); sessionStorage.setItem('god_mode_tab', 'TOP10'); }} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'TOP10' as any ? 'bg-amber-100 text-amber-700 shadow-sm border border-amber-200' : 'text-gray-500 hover:text-amber-500'}`}><Star size={14} className={activeTab === 'TOP10' as any ? 'fill-amber-600' : ''}/> Top 10</button>

                {/* 💶 NUEVO BOTÓN: ALBARANES TÁCTICOS */}
                <button onClick={() => { setActiveTab('BILLING' as any); sessionStorage.setItem('god_mode_tab', 'BILLING'); }} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'BILLING' as any ? 'bg-black text-white shadow-sm border border-gray-800' : 'text-gray-500 hover:text-black'}`}><FileText size={14}/> Albaranes</button>
            </div>

            <button onClick={() => { setIsAuthenticated(false); sessionStorage.removeItem("god_mode_auth"); }} className="text-gray-400 hover:text-red-600" title="Cerrar Sesión"><LogOut size={18} /></button>        
        </div>
      </nav>
      <div className="max-w-7xl mx-auto p-6 md:p-8 pb-20">
        
        {/* KPI CARDS (Solo en Usuarios y Propiedades) */}
        {activeTab !== 'CRM' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><div className="flex justify-between items-start mb-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20}/></div></div><p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Usuarios Registrados</p><h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</h3></div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><div className="flex justify-between items-start mb-4"><div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Building2 size={20}/></div></div><p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Agencias PREMIUM</p><h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activeSubs}</h3></div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><div className="flex justify-between items-start mb-4"><div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20}/></div></div><p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Free Trials en Curso</p><h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activeTrials}</h3></div>
                <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm"><div className="flex justify-between items-start mb-4"><div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertTriangle size={20}/></div></div><p className="text-red-800 text-xs font-bold uppercase tracking-wider">Indecisos (Sin Pagar)</p><h3 className="text-2xl font-black text-red-600 mt-1">{stats.indecisos}</h3></div>
            </div>
        )}

        {/* 🔭 BARRA DE BÚSQUEDA OMNISCIENTE */}
        <div className="mb-6 bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
            <div className="pl-4 text-gray-400"><Search size={20} /></div>
            <input 
                type="text" 
                placeholder="Radar de francotirador: Buscar por Nombre, Email, Teléfono, Referencia, Agencia..." 
                className="w-full py-3 bg-transparent focus:outline-none text-gray-800 font-medium placeholder-gray-400 text-sm"
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
           {searchTerm && (
    <button onClick={() => setSearchTerm("")} className="pr-4 text-gray-400 hover:text-red-500 transition-colors" title="Limpiar búsqueda">
        <X size={18} /> {/* CAMBIE LogOut POR X AQUÍ */}
    </button>
)}
        </div>

        {/* ========================================================= */}
        {/* 🔥 PESTAÑA 3: CRM DE CAPTACIÓN (REDISEÑO ESCINDIDO) 🔥 */}
        {/* ========================================================= */}
        {activeTab === 'CRM' && (
            <div className="space-y-6">
                
                {/* 🎛️ SUB-MENÚ DE NAVEGACIÓN TÁCTICA */}
                <div className="flex gap-2 p-1.5 bg-gray-200/50 rounded-xl w-fit border border-gray-200 shadow-inner">
                    <button
                        onClick={() => setCrmTab('INBOUND')}
                        className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${crmTab === 'INBOUND' ? 'bg-white text-amber-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-amber-600'}`}
                    >
                        <Crown size={16}/> Peticiones VIP ({prospects.filter(p => p.status === 'VANGUARD_VIP').length})
                    </button>
                    <button
                        onClick={() => setCrmTab('OUTBOUND')}
                        className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${crmTab === 'OUTBOUND' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-indigo-600'}`}
                    >
                        <Target size={16}/> Base Outbound ({prospects.filter(p => p.status !== 'VANGUARD_VIP' && p.status !== 'VIP_RESOLVED').length})
                    </button>
                </div>
{/* --------------------------------------------------------- */}
                {/* 👑 SUB-PESTAÑA: INBOUND VIP (Peticiones Calientes) */}
                {/* --------------------------------------------------------- */}
                {crmTab === 'INBOUND' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-amber-50/50 text-xs font-semibold text-amber-700 uppercase tracking-wider border-b border-amber-100">
                                <tr>
                                    <th className="p-5 font-medium w-1/3">Agencia Solicitante</th>
                                    <th className="p-5 font-medium w-1/4">Zona Demandada</th>
                                    <th className="p-5 font-medium text-center w-1/5">Estado de Petición</th>
                                    <th className="p-5 font-medium text-center w-1/4">Acciones de Mando</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredProspects.filter(p => p.status === 'VANGUARD_VIP' || p.status === 'VIP_RESOLVED').length === 0 ? (
                                    <tr><td colSpan={4} className="p-10 text-center text-gray-400">No hay peticiones VIP en el radar.</td></tr>
                                ) : filteredProspects.filter(p => p.status === 'VANGUARD_VIP' || p.status === 'VIP_RESOLVED').map((prospect) => (
                                    <tr key={prospect.id} className={`transition-colors ${prospect.status === 'VIP_RESOLVED' ? 'bg-gray-50 opacity-70' : 'hover:bg-amber-50/30'}`}>
                                        
                                        {/* COLUMNA 1: AGENCIA */}
                                        <td className="p-5 border-r border-gray-100/50">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-bold text-gray-900 text-base">{prospect.companyName}</p>
                                                <span className="text-xs text-gray-500 flex items-center gap-1.5"><Mail size={12}/> {prospect.email}</span>
                                                {prospect.phone && <span className="text-xs text-gray-500 flex items-center gap-1.5"><Phone size={12}/> {prospect.phone}</span>}
                                            </div>
                                        </td>
                                        
                                        {/* COLUMNA 2: ZONA DEMANDADA + RELOJES EN VIVO */}
                                        <td className="p-5 border-r border-gray-100/50">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-start gap-1.5 text-gray-700 font-medium text-xs">
                                                    <MapPin size={14} className="text-amber-500 shrink-0 mt-0.5"/> 
                                                    <span className="leading-relaxed">{prospect.city || "Sin definir"}</span>
                                                </div>
                                                
                                                {/* ⏱️ RADAR DE TIEMPO REAL (ZONAS ACTIVAS CON RELOJ) ⏱️ */}
                                                {(() => {
                                                    // 1. Extraemos el ID de la agencia del dossier
                                                    const agencyIdMatch = prospect.notes?.match(/ID Agencia:\s*([^\n]+)/);
                                                    const agencyId = agencyIdMatch ? agencyIdMatch[1].trim() : null;
                                                    if (!agencyId) return null;
                                                    
                                                    // 2. Buscamos sus zonas en la base de datos viva (Blindaje anti-errores)
                                                    const susZonas = activeZones?.filter((z: any) => z.agencyId === agencyId && z.isActive) || [];
                                                    if (susZonas.length === 0) return null;

                                                    // 3. Pintamos las medallas con el reloj
                                                    return (
                                                        <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-gray-100">
                                                            <span className="text-[9px] font-black uppercase text-amber-600 tracking-widest flex items-center gap-1">
                                                                <Crown size={10}/> DOMINIOS ACTIVOS ({susZonas.length})
                                                            </span>
                                                            <div className="flex flex-col gap-1.5 mt-1">
                                                                {susZonas.map((zona: any) => (
                                                                    <div key={zona.id} className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-orange-50 px-2 py-1.5 rounded-md border border-amber-300 shadow-sm w-fit">
                                                                        <MapPin size={10} className="text-amber-600"/>
                                                                        <span className="text-[10px] font-black text-amber-900">{zona.postalCode}</span>
                                                                        <div className="h-3 w-px bg-amber-300 mx-0.5"></div>
                                                                        <Timer size={10} className="text-orange-500"/>
                                                                        <span className="text-[9px] font-mono font-bold text-orange-700">
                                                                            {getTimeRemaining(zona.expiresAt) || "Ilimitado"}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </td>

                                        {/* COLUMNA 3: ESTADO */}
                                        <td className="p-5 text-center border-r border-gray-100/50 relative overflow-hidden">
                                            {prospect.status === 'VANGUARD_VIP' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,1)]"></div>}
                                            
                                            {prospect.status === 'VANGUARD_VIP' ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse">
                                                        <Crown size={12}/> ESPERANDO ZONA
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-600 font-bold text-[10px] uppercase tracking-wider rounded-full border border-gray-300">
                                                    <CheckCircle2 size={12}/> YA GESTIONADO
                                                </span>
                                            )}
                                        </td>

                                        {/* COLUMNA 4: ACCIONES */}
                                        <td className="p-5 text-center">
                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => { setSelectedDossier(prospect.notes); setShowDossierModal(true); }} className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-all uppercase shadow-sm">
                                                    <Eye size={14} className="text-amber-700"/> Ver Dossier
                                                </button>
                                                
                                                {prospect.status === 'VANGUARD_VIP' && (
                                                    <>
                                                        <button onClick={() => setActiveTab('ZONAS' as any)} className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black text-white bg-slate-900 hover:bg-black transition-all uppercase shadow-sm">
                                                            <MapPin size={14}/> Ir a Desplegar Zona
                                                        </button>
                                                        <button 
                                                            onClick={async () => {
                                                                if(window.confirm("¿Silenciar esta alerta? Se marcará como gestionada y dejará de parpadear.")) {
                                                                    const res = await resolveVipRequestAction(prospect.id);
                                                                    if(res.success) window.location.reload();
                                                                }
                                                            }} 
                                                            className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all uppercase shadow-sm"
                                                        >
                                                            <CheckCircle2 size={14}/> Marcar Resuelto
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* --------------------------------------------------------- */}
                {/* 🎯 SUB-PESTAÑA: OUTBOUND (Base Fría de Captación) */}
                {/* --------------------------------------------------------- */}
                {crmTab === 'OUTBOUND' && (
                    <div className="space-y-6 animate-fade-in-up">
                        {/* FORMULARIO PARA AÑADIR AGENCIAS */}
                        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
                            <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-4"><Target size={20}/> Añadir Objetivo (Nueva Agencia)</h2>
                            <form onSubmit={handleAddProspect} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <input type="text" placeholder="Nombre de la Agencia *" className="bg-white text-gray-900 p-3 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newProspect.companyName} onChange={e=>setNewProspect({...newProspect, companyName: e.target.value})} required/>
                                <input type="email" placeholder="Email de contacto *" className="bg-white text-gray-900 p-3 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newProspect.email} onChange={e=>setNewProspect({...newProspect, email: e.target.value})} required/>
                                <input type="tel" placeholder="Teléfono" className="bg-white text-gray-900 p-3 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newProspect.phone} onChange={e=>setNewProspect({...newProspect, phone: e.target.value})}/>
                                <input type="text" placeholder="Ciudad / Zona" className="bg-white text-gray-900 p-3 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newProspect.city} onChange={e=>setNewProspect({...newProspect, city: e.target.value})}/>
                                
                                <div className="flex gap-2">
                                    <button type="submit" disabled={isSending} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg text-sm hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50">
                                        {isSending ? 'Añadiendo...' : '+ Guardar Agencia'}
                                    </button>
                                    <button type="button" onClick={handleCargarTropas} className="w-full bg-black text-white font-bold py-3 rounded-lg text-sm hover:bg-gray-800 transition-colors shadow-md border border-gray-900">
                                        🔥 Importar (BD)
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* TABLA DE PROSPECTOS FRÍOS */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                    <tr>
                                        <th className="p-5 font-medium w-1/3">Agencia Objetivo</th>
                                        <th className="p-5 font-medium w-1/5">Localización</th>
                                        <th className="p-5 font-medium text-center w-1/5">Estado Contacto</th>
                                        <th className="p-5 font-medium text-center w-1/4">Lanzar Campaña</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {filteredProspects.filter(p => p.status !== 'VANGUARD_VIP' && p.status !== 'VIP_RESOLVED').length === 0 ? (
                                        <tr><td colSpan={4} className="p-10 text-center text-gray-400">No hay agencias en la base de datos fría.</td></tr>
                                    ) : filteredProspects.filter(p => p.status !== 'VANGUARD_VIP' && p.status !== 'VIP_RESOLVED').map((prospect) => {
                                        const isContacted = prospect.status === 'CONTACTED';
                                        
                                        return (
                                            <tr key={prospect.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-5 border-r border-gray-100/50">
                                                    <div className="flex flex-col gap-1">
                                                        <p className="font-bold text-gray-900 text-base">{prospect.companyName}</p>
                                                        <span className="text-xs text-gray-500 flex items-center gap-1.5"><Mail size={12}/> {prospect.email}</span>
                                                        {prospect.phone && <span className="text-xs text-gray-500 flex items-center gap-1.5"><Phone size={12}/> {prospect.phone}</span>}
                                                    </div>
                                                </td>
                                                <td className="p-5 border-r border-gray-100/50">
                                                    <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                                                        <MapPin size={14} className="text-gray-400"/> {prospect.city || "Sin definir"}
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center border-r border-gray-100/50">
                                                    {isContacted ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 font-bold text-[10px] uppercase tracking-wider rounded-full border border-blue-200"><CheckCircle2 size={12}/> Email Enviado</span>
                                                            <span className="text-[10px] text-gray-400 font-medium">Envíos: {prospect.emailsSent}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 font-bold text-[10px] uppercase tracking-wider rounded-full border border-gray-200">VIRGEN (Sin Tocar)</span>
                                                    )}
                                                </td>
                                                <td className="p-5 text-center">
                                                    <div className="flex flex-col gap-2">
                                                        <button 
                                                            onClick={() => {
                                                                if(!prospect.phone) return alert("Falta teléfono.");
                                                                let cleanPhone = prospect.phone.replace(/\D/g, '');
                                                                if(cleanPhone.length === 9) cleanPhone = '34' + cleanPhone;
                                                                const message = `Hola, equipo de ${prospect.companyName}... [Mensaje Automático de Stratosfere]... 👉 https://stratosfere.com/vip?inv=${prospect.id}&src=wa`;
                                                                window.open(`https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`, '_blank'); 
                                                            }} 
                                                            className={`w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all shadow-sm ${prospect.phone ? 'bg-[#25D366] text-white hover:bg-[#128C7E]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                                        >
                                                            <MessageCircle size={14}/> WhatsApp
                                                        </button>

                                                        <button 
                                                            onClick={async () => {
                                                                if(window.confirm(`¿Disparar email a ${prospect.companyName}?`)) {
                                                                    const res = await sendProspectEmailAction(prospect.id);
                                                                    if(res.success) window.location.reload();
                                                                }
                                                            }} 
                                                            className={`w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all shadow-sm ${isContacted ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-black text-white hover:bg-gray-800'}`}
                                                        >
                                                            <Send size={14}/> {isContacted ? 'Reenviar Email' : 'Disparar Email'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* --- PESTAÑA 1: RESUMEN GLOBAL (DISEÑO PRO Y FREE TRIAL CLARO) --- */}
        {activeTab === 'USERS' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="p-5 font-medium w-[30%]">Usuario / Contacto (Nivel PRO)</th>
                                <th className="p-5 font-medium w-[35%]">Resumen Global de Inventario</th>
                                <th className="p-5 font-medium text-center w-[15%]">Estado Comercial</th>
                                <th className="p-5 font-medium text-center w-[20%]">Master Switch</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-400 text-sm">No se encontraron usuarios.</td></tr>
                            ) : filteredUsers.map((user) => {
                                const isAgency = user.role === 'AGENCIA' || user.role === 'AGENCY';
                                const subStatus = user.subscription?.status || "NO_DATA";
                                const isBlocked = subStatus === "BLOCKED" || subStatus === "CANCELED";
                                const isActive = subStatus === "ACTIVE";
                                const isTrial = subStatus === "TRIAL" || (!isActive && !isBlocked && isAgency);

                                const lastActive = user.lastLoginAt ? new Date(user.lastLoginAt) : new Date(user.updatedAt);
const isOnline = (new Date().getTime() - lastActive.getTime()) / 36e5 < 0.5;
                                const phoneList = [user.phone, user.mobile].filter(Boolean);
                                const phones = phoneList.length > 0 ? phoneList.join(" / ") : "Sin tlf registrado";

                                const myProps = properties.filter(p => p.userId === user.id);
                                const cededProps = myProps.filter(p => p.assignment?.agencyId || p.campaigns?.[0]?.agencyId);
                                const selfProps = myProps.filter(p => !cededProps.includes(p));
                                const inheritedProps = properties.filter(p => p.userId !== user.id && (p.assignment?.agencyId === user.id || p.campaigns?.[0]?.agencyId === user.id));
                                
                                const agencyNames = Array.from(new Set(cededProps.map(p => p.assignment?.agency?.companyName || p.assignment?.agency?.name || p.campaigns?.[0]?.agency?.name).filter(Boolean)));
                                const cededToText = agencyNames.length > 0 ? agencyNames.join(", ") : "Agencias";

                                let timeRest = null;
                                if (isTrial && user.subscription?.currentPeriodEnd) timeRest = getTimeRemaining(user.subscription.currentPeriodEnd);
                                else if (user.agencyTrialEndsAt) timeRest = getTimeRemaining(user.agencyTrialEndsAt);

                                return (
                                    <tr key={user.id} className={`transition-colors ${isBlocked ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}>
                                        
                                      <td className="p-5 border-r border-gray-100/50 align-top">
                                            <div className="flex items-start gap-4">
                                                <div className="relative shrink-0 mt-1">
                                                    {user.avatar || user.companyLogo ? (
                                                        <img src={user.avatar || user.companyLogo} className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-sm" alt="Avatar" />
                                                    ) : (
                                                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200 shadow-sm">
                                                            <User size={24} className="text-gray-400"/>
                                                        </div>
                                                    )}
                                                    {isOnline && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>}
                                                </div>
                                                
                                                <div className="flex flex-col gap-1 w-full overflow-hidden">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-black text-gray-900 text-sm truncate">{user.companyName || user.name || "Usuario"}</p>
                                                        {isAgency ? <span className="bg-gray-900 text-white px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest uppercase shrink-0">AGENCIA</span> : <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border shrink-0">PARTICULAR</span>}
                                                    </div>
                                                    <span className="text-xs text-gray-600 flex items-center gap-1.5 font-medium truncate"><Mail size={12} className="text-gray-400 shrink-0"/> {user.email}</span>
                                                    <span className="text-xs text-gray-600 flex items-center gap-1.5 font-medium truncate"><Phone size={12} className="text-gray-400 shrink-0"/> {phones}</span>
{/* 🔥 DOSSIER DE INTELIGENCIA: LICENCIA, CIF, ZONA Y DIRECCIÓN 🔥 */}
                                                    {isAgency && (
                                                        <div className="mt-3 pt-3 border-t border-gray-100/80 flex flex-col gap-1.5 w-full">
                                                            
                                                            <div className="flex items-center justify-between text-[10px]">
                                                                <span className="text-gray-400 font-bold tracking-wider">LICENCIA SF:</span>
                                                                <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 shadow-sm">
                                                                    SF-PRO-{String(user.id).slice(-6).toUpperCase()}
                                                                </span>
                                                            </div>

                                                         {/* 🔥 AQUÍ ESTÁ EL CHIVATO DE LA RAZÓN SOCIAL (SIEMPRE VISIBLE) 🔥 */}
                                                            <div className="flex items-center justify-between text-[10px]">
                                                                <span className="text-gray-400 font-bold tracking-wider">R. SOCIAL:</span>
                                                                <span className="font-bold text-gray-700 truncate ml-2 text-right" title={user.legalName}>
                                                                    {user.legalName ? user.legalName : <span className="text-gray-400 italic font-normal">No definida</span>}
                                                                </span>
                                                            </div>
                                                            
                                                            {user.cif && (
                                                                <div className="flex items-center justify-between text-[10px]">
                                                                    <span className="text-gray-400 font-bold tracking-wider">CIF / NIF:</span>
                                                                    <span className="font-bold text-gray-700">{user.cif}</span>
                                                                </div>
                                                            )}
                                                            
                                                            {user.zone && (
                                                                <div className="flex items-center justify-between text-[10px]">
                                                                    <span className="text-gray-400 font-bold tracking-wider">ZONA:</span>
                                                                    <span className="font-bold text-gray-700 truncate ml-2">{user.zone}</span>
                                                                </div>
                                                            )}
                                                            
                                                            {(user.address || user.postalCode) && (
                                                                <div className="flex flex-col text-[10px] bg-gray-50 p-1.5 rounded border border-gray-100 mt-0.5">
                                                                    <span className="text-gray-400 font-bold tracking-wider mb-0.5">DIRECCIÓN FÍSICA Y CP:</span>
                                                                    <span className="font-medium text-gray-700 leading-tight">
                                                                        {user.address} {user.address && user.postalCode ? ' - ' : ''} {user.postalCode}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-5 border-r border-gray-100/50">
                                            <div className="flex flex-col gap-2">
                                                <div className="font-bold text-sm text-gray-800 border-b border-gray-100 pb-1">Total Creadas: {myProps.length}</div>
                                                
                                                {selfProps.length > 0 && (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600 pl-2 border-l-2 border-blue-500">
                                                        <ShieldCheck size={12}/> Gestiona él mismo: <strong>{selfProps.length}</strong> 
                                                        <span className="text-gray-400">({selfProps.filter(checkIsFire).length} Fuego, {selfProps.length - selfProps.filter(checkIsFire).length} Normal)</span>
                                                    </div>
                                                )}

                                                {cededProps.length > 0 && (
                                                    <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium pl-2 border-l-2 border-orange-500">
                                                        <ArrowRightLeft size={12}/> Cedidas a {cededToText}: <strong>{cededProps.length}</strong>
                                                        <span className="text-orange-400">({cededProps.filter(checkIsFire).length} Fuego, {cededProps.length - cededProps.filter(checkIsFire).length} Normal)</span>
                                                    </div>
                                                )}

                                                {inheritedProps.length > 0 && (
                                                    <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold bg-indigo-50 p-1.5 rounded mt-1">
                                                        <Briefcase size={12}/> Heredadas de Particulares: <strong>{inheritedProps.length}</strong>
                                                        <span className="text-indigo-400">({inheritedProps.filter(checkIsFire).length} Fuego)</span>
                                                    </div>
                                                )}
                                                
                                                {myProps.length === 0 && inheritedProps.length === 0 && <span className="text-xs text-gray-400 italic">Inventario vacío</span>}
                                            </div>
                                        </td>

                                   {/* COLUMNA 3: ESTADO COMERCIAL (CON LA VERDAD DE LA BD) */}
                                        <td className="p-5 text-center">
                                            {isBlocked ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 font-bold text-[10px] uppercase tracking-wider rounded-full border border-red-200"><Ban size={12}/> BLOQUEADO</span>
                                            ) : isAgency ? (
                                                isActive ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-wider rounded-full border border-indigo-200 shadow-sm"><Building2 size={12}/> AGENCIA PREMIUM</span>
                                                        <span className="text-[8px] text-gray-400 font-mono tracking-tighter">Inicio: {formatDateExact(user.subscription?.currentPeriodStart)}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 font-bold text-[10px] uppercase tracking-wider rounded-full border border-amber-200 shadow-sm"><Timer size={12}/> FREE TRIAL</span>
                                                        <span className="text-[11px] text-amber-600 font-mono font-black tracking-widest">{timeRest || "¡CADUCADO!"}</span>
                                                        <span className="text-[8px] text-gray-400 font-mono tracking-tighter">Inicio: {formatDateExact(user.subscription?.currentPeriodStart)}</span>
                                                    </div>
                                                )
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider rounded-full border border-emerald-200"><Gem size={12}/> PAGO POR USO</span>
                                            )}
                                        </td>

                                        {/* COLUMNA 4: MASTER SWITCH (ARSENAL DE DIOS) */}
                                        <td className="p-5 text-center">
                                            <div className="flex flex-col gap-2">
                                                
                                                {/* BOTONES EXCLUSIVOS PARA AGENCIAS */}
                                                {isAgency && (
                                                    <>
                                                        <button 
                                                            onClick={async () => {
                                                                if(window.confirm(`¿Convertir a ${user.companyName || user.name} en PREMIUM VITALICIO?`)) {
                                                                    const res = await toggleUserSubscriptionAction(user.id, "ACTIVE");
                                                                    if(res.success) window.location.reload();
                                                                }
                                                            }} 
                                                            className="w-full flex justify-center items-center gap-2 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all shadow-sm bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-700"
                                                        >
                                                            <Gem size={12}/> HACER PREMIUM
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={async () => {
                                                                const daysStr = window.prompt("¿Cuántos días de Free Trial quiere asignarle?", "15");
                                                                const days = parseInt(daysStr || "0");
                                                                if(days > 0) {
                                                                    const res = await resetFreeTrialAction(user.id, days);
                                                                    if(res.success) window.location.reload();
                                                                }
                                                            }} 
                                                            className="w-full flex justify-center items-center gap-2 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all shadow-sm bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
                                                        >
                                                            <Timer size={12}/> INYECTAR TIEMPO
                                                        </button>
                                                    </>
                                                )}

                                                <button 
                                                    onClick={async () => {
                                                        const confirmMsg = isBlocked ? "¿Activar a este usuario en el sistema?" : "¿Bloquear a este usuario por mala conducta?";
                                                        if(window.confirm(confirmMsg)) {
                                                            const res = await toggleUserStatusAction(user.id, isBlocked);
                                                            if(res.success) window.location.reload();
                                                        }
                                                    }} 
                                                    className={`w-full flex justify-center items-center gap-2 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all shadow-sm ${isBlocked ? "bg-emerald-500 text-white hover:bg-emerald-600 border border-emerald-600" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}
                                                >
                                                    {isBlocked ? <><Power size={12}/> REACTIVAR</> : <><Ban size={12}/> BLOQUEAR</>}
                                                </button>

                                                <button 
                                                    onClick={async () => {
                                                        if(window.confirm("¡ALERTA! ¿Desea EJECUTAR a este usuario? Se borrará ÉL Y TODAS SUS PROPIEDADES. NO HAY VUELTA ATRÁS.")) {
                                                            const res = await deleteUserAction(user.id);
                                                            if(res.success) window.location.reload();
                                                        }
                                                    }} 
                                                    className="w-full flex justify-center items-center gap-2 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all shadow-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                                >
                                                    <Trash2 size={12}/> ELIMINAR
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                 </div>
             </div>
        )}

        {/* --- PESTAÑA 2: RADAR DE ACTIVOS --- */}
        {activeTab === 'PROPERTIES' && (
            <div className="space-y-4">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">Arsenal y Radar de Ventas <Flame size={20} className="text-orange-500"/></h2>
                 </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            <tr>
                               <th className="p-5 font-medium">Propiedad</th>
                                <th className="p-5 font-medium">Contactos (Creador / Gestor)</th>
                                <th className="p-5 text-center font-bold text-blue-600">1. Alta en Mapa (Visible)</th>
                                <th className="p-5 text-center font-bold text-red-600">2. Nano Card FUEGO</th>
                                <th className="p-5 text-center font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredProperties.length === 0 ? (
                                <tr><td colSpan={6} className="p-10 text-center text-gray-400 text-sm">No hay propiedades.</td></tr>
                            ) : filteredProperties.map((prop) => {
                                
                                const creator = prop.user || {};
                                const isCreatorParticular = creator.role !== 'AGENCIA' && creator.role !== 'AGENCY';
                                const creatorPhones = [creator.phone, creator.mobile].filter(Boolean).join(" / ") || "Sin tlf";

                              const activeAssignment = prop.assignment?.agency || prop.campaigns?.[0]?.agency || null;
                                const isCeded = !!activeAssignment;

                                // 💥 CERO PEGAMENTO: LA BASE DE DATOS MANDA ABSOLUTAMENTE.
                                // Si usted pulsa el botón, cambia en la BD y se queda como usted diga.
                                const isPremium = prop.isPremium === true || prop.promotedTier === 'PREMIUM';
                                const isFire = prop.isFire === true || prop.promotedTier === 'FUEGO';
                                
                                // El botón azul (Alta Radar) solo estará encendido si la BD dice que está publicado.
                                const isPublished = prop.status === 'PUBLICADO' || prop.status === 'MANAGED' || prop.status === 'ACCEPTED';
                                
                                const managerName = isCeded ? (activeAssignment.companyName || activeAssignment.name) : "Gestión Propia";
                                const managerPhones = isCeded ? ([activeAssignment.phone, activeAssignment.mobile].filter(Boolean).join(" / ") || "Sin tlf") : creatorPhones;
                                const managerEmail = isCeded ? (activeAssignment.email || "Sin email") : creator.email;

                                // 🎯 CORREGIDO: Leemos el tiempo del canal oficial
const premiumTime = isPremium ? getTimeRemaining(prop.promotedUntil) : null;
const fireTime = isFire ? getTimeRemaining(prop.promotedUntil) : null;

                                return (
                                    <tr key={prop.id} className={`transition-colors ${!isPublished ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-gray-50'}`}>
                                      {/* 1. INFO DE LA PROPIEDAD ENRIQUECIDA */}
                                        <td className="p-5 w-1/5">
                                            <div className="flex items-center gap-3">
                                                <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border ${!isPublished ? 'bg-red-100 text-red-500 border-red-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}><Home size={16}/></div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 text-sm truncate">{prop.title || "Sin título"}</p>
                                                    
                                                    {/* El Precio y la Ciudad (NUEVO) */}
                                                    <div className="flex items-center gap-2 mt-1.5 mb-1">
                                                         <span className="text-[11px] font-black text-gray-900 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded shadow-sm">
                                                             {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(prop.price || 0)}
                                                         </span>
                                                         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide flex items-center gap-0.5 truncate">
                                                             <MapPin size={10} className="text-gray-400" /> {prop.city || "Ubicación oculta"}
                                                         </span>
                                                    </div>

                                                 <div className="flex flex-col gap-1 mt-1">
                                                       {/* 🍏 CAJA DE INTELIGENCIA MEJORADA (Ref y Agencia ID) */}
                                                        <div className="mt-1.5 flex flex-col gap-2 bg-[#F5F5F7] p-3 rounded-2xl border border-gray-200/60 shadow-sm w-fit transition-all hover:bg-white hover:shadow-md">
                                                            
                                                            {/* 🔥 FILA REF (Con botón de copiar) */}
                                                            <div className="flex items-center justify-between gap-6">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest w-8">REF</span>
                                                                    <span className="text-[11px] font-mono font-black text-indigo-700">{prop.refCode || "Sin Ref"}</span>
                                                                </div>
                                                                <button 
                                                                    onClick={() => {
                                                                        const refToCopy = prop.refCode || "";
                                                                        navigator.clipboard.writeText(refToCopy);
                                                                        alert("✅ REFERENCIA COPIADA:\n" + refToCopy);
                                                                    }} 
                                                                    className="text-gray-400 hover:text-indigo-600 transition-colors p-1 hover:bg-indigo-50 rounded-md" 
                                                                    title="Copiar Referencia"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                                                </button>
                                                            </div>

                                                            <div className="h-px w-full bg-gray-200/50"></div>

                                                            {/* 🔥 FILA ID AGENCIA (El que necesita para crear campañas) */}
                                                            <div className="flex items-center justify-between gap-6">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest w-8">ID AGE</span>
                                                                    <span className="text-[10px] font-mono font-bold text-slate-700 max-w-[120px] truncate">
                                                                        {isCeded ? activeAssignment.id : creator.id}
                                                                    </span>
                                                                </div>
                                                                <button 
                                                                    onClick={() => {
                                                                        const targetId = isCeded ? activeAssignment.id : creator.id;
                                                                        navigator.clipboard.writeText(targetId);
                                                                        alert("✅ ID DE AGENCIA COPIADO:\n" + targetId);
                                                                    }} 
                                                                    className="text-gray-400 hover:text-indigo-600 transition-colors p-1 hover:bg-indigo-50 rounded-md" 
                                                                    title="Copiar ID de la Agencia"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                                                </button>
                                                            </div>
                                                            
                                                            <div className="h-px w-full bg-gray-200/50"></div>

                                                            {/* FILA GEO */}
                                                            <div className="flex items-center justify-between gap-6">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest w-8">GEO</span>
                                                                    <span className="text-[10px] font-mono font-bold text-indigo-600">
                                                                        {prop.lng ?? prop.longitude ?? (prop.coordinates && prop.coordinates[0]) ?? "N/A"}, {prop.lat ?? prop.latitude ?? (prop.coordinates && prop.coordinates[1]) ?? "N/A"}
                                                                    </span>
                                                                </div>
                                                                <button 
                                                                    onClick={() => {
                                                                        const lng = prop.lng ?? prop.longitude ?? (prop.coordinates && prop.coordinates[0]) ?? "N/A";
                                                                        const lat = prop.lat ?? prop.latitude ?? (prop.coordinates && prop.coordinates[1]) ?? "N/A";
                                                                        navigator.clipboard.writeText(`lng: ${lng},\nlat: ${lat}`);
                                                                        alert("✅ Coordenadas listas para pegar en el código");
                                                                    }} 
                                                                    className="text-gray-400 hover:text-indigo-600 transition-colors p-1 hover:bg-indigo-50 rounded-md" 
                                                                    title="Copiar Coordenadas Formateadas"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="p-5 border-r border-gray-100/50">
                                            <div className="flex flex-col gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2 text-xs mb-0.5">
                                                        <span className="text-gray-400">Creador:</span>
                                                        <span className="font-bold text-gray-800">{creator.name || "Desconocido"}</span>
                                                        <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded ${!isCreatorParticular ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>{isCreatorParticular ? 'PART' : 'AGENCIA'}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><Phone size={10}/> {creatorPhones}</span>
                                                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><Mail size={10}/> {creator.email}</span>
                                                </div>

                                                {isCeded && (
                                                    <div className="bg-indigo-50/70 p-2 rounded-lg border border-indigo-100/50 w-fit shadow-sm">
                                                        <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold mb-1"><ArrowRightLeft size={10}/> Gestiona: {managerName}</div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[10px] text-indigo-600/80 flex items-center gap-1"><Phone size={10}/> {managerPhones}</span>
                                                            <span className="text-[10px] text-indigo-600/80 flex items-center gap-1"><Mail size={10}/> {managerEmail}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        
                                        <td className="p-5 text-center bg-gray-50/30">
                                            <div className="flex flex-col items-center gap-1.5">
                                               <button onClick={async () => {
                                                    // ⚡️ ZAS ZAS 1: Efecto visual inmediato (Optimista)
                                                    setLocalProperties(prev => prev.map(p => {
                                                        if (p.id === prop.id) {
                                                            return { 
                                                                ...p, 
                                                                status: !isPublished ? 'PUBLICADO' : 'PENDIENTE_PAGO',
                                                                // Si apagamos, aplicamos la acetona visualmente también
                                                                ...(isPublished ? { isFire: false, isPremium: false, isPromoted: false, promotedTier: 'FREE' } : {})
                                                            };
                                                        }
                                                        return p;
                                                    }));

                                                    // ⚡️ ZAS ZAS 2: Envío silencioso a la base de datos
                                                    const res = await togglePropertyStatusAction(prop.id, !isPublished);
                                                    if(!res.success) {
                                                        alert("Fallo de comunicación satelital.");
                                                        window.location.reload(); // Solo recarga si hay un fallo
                                                    }
                                                }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublished ? 'bg-blue-500' : 'bg-red-200'}`}>
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                                {isPublished ? (
<span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1"><CheckCircle2 size={10}/> Visible en Mapa</span>                                                ) : (
                                                    <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-md border border-red-200 animate-pulse flex items-center gap-1"><AlertTriangle size={10}/> INDECISO</span>
                                                )}
                                            </div>
                                        </td>

                                        
                                        {/* 3. FUEGO */}
                                        <td className="p-5 text-center">
                                            <div className={`flex flex-col items-center gap-1.5 ${!isPublished ? 'opacity-30 pointer-events-none' : ''}`}>
                                               <button onClick={async () => {
                                                        // ⚡️ ZAS ZAS 1: Efecto visual inmediato (Optimista)
                                                        setLocalProperties(prev => prev.map(p => {
                                                            if (p.id === prop.id) {
                                                                return { 
                                                                    ...p, 
                                                                    isFire: !isFire,
                                                                    isPremium: false,
                                                                    promotedTier: !isFire ? 'FUEGO' : 'FREE'
                                                                };
                                                            }
                                                            return p;
                                                        }));

                                                        // ⚡️ ZAS ZAS 2: Envío silencioso a la base de datos
                                                        const res = await togglePropertyFireAction(prop.id, !isFire);
                                                        if(!res.success) {
                                                            alert("Fallo de comunicación satelital.");
                                                            window.location.reload(); // Solo recarga si hay fallo
                                                        }
                                                    }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isFire ? 'bg-red-600' : 'bg-gray-200'}`}>
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isFire ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                                
                                                {isFire ? (
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className="text-[10px] font-mono text-[#FF3B30] font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 whitespace-nowrap"><Timer size={10} className="inline mr-1"/>{fireTime || "Activa"}</span>
                                                        <span className="text-[8px] font-black text-[#FF3B30] uppercase tracking-widest mt-0.5">SF-NANOFREETRIAL</span>
                                                    </div>
                                                ) : (
                                                    !isCreatorParticular ? <span className="text-[9px] text-gray-400 uppercase font-bold text-center leading-tight">Origen<br/>Agencia</span> : null
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-5 text-center">
                                            <button 
                                                onClick={async () => {
                                                    if(window.confirm("¿Confirmar lanzamiento de misil TOMAHAWK sobre esta propiedad? Se borrará permanentemente del mapa y la base de datos.")) {
                                                        const res = await deletePropertyAction(prop.id);
                                                        if(res.success) window.location.reload();
                                                        else alert("Error: El objetivo no pudo ser destruido.");
                                                    }
                                                }} 
                                                className="group bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg border border-gray-200 transition-all shadow-sm"
                                                title="Eliminar Propiedad Permanentemente"
                                            >
                                                <Trash2 size={16} className="group-hover:scale-110 transition-transform"/>
                                            </button>
                                        </td>
                                    </tr>
                                );
                     })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

       {/* ========================================================= */}
        {/* 👑 PESTAÑA 4: ZONAS VIP / MARKET NETWORK (NUEVA) 👑 */}
        {/* ========================================================= */}
        {activeTab === 'ZONAS' as any && (
            <div className="animate-fade-in-up">
                <AdminZoneManager />
            </div>
        )}

        {/* ========================================================= */}
        {/* 🎯 PESTAÑA 5: GEO SNIPER VIP (COORDENADAS) 🎯 */}
        {/* ========================================================= */}
        {activeTab === 'GEO' as any && (
            <div className="animate-fade-in-up">
                <AdminGeoLocator />
            </div>
        )}

        {/* ========================================================= */}
        {/* ⭐ PESTAÑA 6: COMANDO TOP 10 ⭐ */}
        {/* ========================================================= */}
        {activeTab === 'TOP10' as any && (
            <div className="animate-fade-in-up">
                <AdminTop10Panel />
            </div>
        )}
{/* ========================================================= */}
        {/* 💶 PESTAÑA 7: ALBARANES TÁCTICOS (BILLING) 💶 */}
        {/* ========================================================= */}
       {activeTab === 'BILLING' as any && (
            <div className="animate-fade-in-up">
                <AdminBillingManager /> {/* ✅ CORREGIDO */}
            </div>
        )}

        {/* ========================================================= */}
        {/* 🕵️‍♂️ VISOR DE INTELIGENCIA VIP (MODAL B2B) */}
        {/* ========================================================= */}
        {showDossierModal && (
            <div className="fixed inset-0 z-[110000] flex items-center justify-center p-4 animate-fade-in pointer-events-auto">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowDossierModal(false)}></div>
                
                <div className="relative bg-[#0F0F11] border border-white/10 w-full max-w-2xl rounded-[32px] shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col max-h-[85vh] overflow-hidden">
                    
                    {/* CABECERA DEL PANEL */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-gradient-to-r from-amber-900/30 to-black">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                                <Crown size={24} className="text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-xl tracking-tight">Historial B2B</h3>
                                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.2em] mt-0.5">Dossier de Inteligencia Táctica</p>
                            </div>
                        </div>
                        <button onClick={() => setShowDossierModal(false)} className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-full transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    {/* CUERPO DEL PANEL (CON SCROLL INFINITO Y DISEÑO TÁCTICO) */}
                    <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-black">
                        <div className="whitespace-pre-wrap text-[13px] text-emerald-400/90 font-mono leading-relaxed bg-[#050505] p-6 rounded-2xl border border-white/5 shadow-inner">
                            {selectedDossier || "No hay datos de inteligencia registrados en el satélite."}
                        </div>
                    </div>

                    {/* PIE DEL PANEL */}
                    <div className="p-5 border-t border-white/5 bg-[#0F0F11] flex justify-end shrink-0">
                        <button onClick={() => setShowDossierModal(false)} className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-white/5">
                            Cerrar Expediente
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}