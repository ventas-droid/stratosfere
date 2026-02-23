"use client";
import { useState, useMemo, useEffect } from "react";
import { togglePropertyPremiumAction, togglePropertyFireAction, togglePropertyStatusAction, toggleUserStatusAction, deletePropertyAction, deleteUserAction, createProspectAction, sendProspectEmailAction } from "@/app/components/admin/actions"; 
import { 
    ShieldCheck, Ban, User, Search, Home, Clock, CreditCard, Building2, 
    MapPin, BarChart3, Users, Gem, LayoutDashboard, LogOut, Trash2,
    Flame, Timer, ArrowRightLeft, Briefcase, Phone, Mail, AlertTriangle, CheckCircle2, Power, PowerOff, Target, Send, MessageCircle
} from "lucide-react";

const MASTER_PASSWORD = "GENERAL_ISIDRO"; 

export default function AdminDashboard({ users, properties = [], prospects = [] }: { users: any[], properties?: any[], prospects?: any[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'USERS' | 'PROPERTIES' | 'CRM'>('USERS'); 
  const [now, setNow] = useState<Date | null>(null);
// 🔥 MEMORIA RAM TÁCTICA PARA VELOCIDAD ZAS ZAS
  const [localProperties, setLocalProperties] = useState(properties);
 
  // ESTADO DEL FORMULARIO DEL CRM
  const [newProspect, setNewProspect] = useState({ companyName: '', email: '', phone: '', city: '' });
  const [isSending, setIsSending] = useState(false);

 useEffect(() => {
    setIsMounted(true);
    if (sessionStorage.getItem("god_mode_auth") === "true") setIsAuthenticated(true);
    
    // 🔥 MEMORIA DE PESTAÑA: Recordar en qué sección estaba el General
    const savedTab = sessionStorage.getItem("god_mode_tab");
    if (savedTab) setActiveTab(savedTab as 'USERS' | 'PROPERTIES' | 'CRM');

    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeSubs = users.filter(u => u.subscription?.status === "ACTIVE").length;
    const activeTrials = users.filter(u => (u.role === 'AGENCIA' || u.role === 'AGENCY') && u.subscription?.status !== "ACTIVE" && u.subscription?.status !== "BLOCKED").length;
    // 👇 CAMBIADO A localProperties
    const indecisos = localProperties.filter(p => p.status === 'BORRADOR' || p.status === 'PENDIENTE_PAGO').length;
    return { totalUsers, activeSubs, activeTrials, indecisos };
  }, [users, localProperties]); // 👇 CAMBIADO A localProperties

  const search = searchTerm.toLowerCase().trim();

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

  const getTimeRemaining = (endDate: string | Date | null) => {
    if (!endDate || !now) return null;
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "¡CADUCADO!";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `${days}d ${hours}h`; 
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

  if (!isMounted) return null;

if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md"><ShieldCheck size={24} /></div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Stratosfere Admin</h1>
            <p className="text-gray-500 mb-8 text-sm">Centro de Mando Supremo</p>
            <input type="password" placeholder="Contraseña de acceso" className="w-full p-3 bg-white text-gray-900 border border-gray-200 rounded-lg mb-4 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && passwordInput === MASTER_PASSWORD) { setIsAuthenticated(true); sessionStorage.setItem("god_mode_auth", "true"); } }} />
            <button onClick={() => { if (passwordInput === MASTER_PASSWORD) { setIsAuthenticated(true); sessionStorage.setItem("god_mode_auth", "true"); } }} className="w-full bg-black text-white font-medium py-3 rounded-lg text-sm">Acceder</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-y-auto bg-gray-50 z-50 font-sans">
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
            </div>
<button onClick={() => { setIsAuthenticated(false); sessionStorage.removeItem("god_mode_auth"); }} className="text-gray-400 hover:text-red-600"><LogOut size={18} /></button>        
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
                    <LogOut size={18} />
                </button>
            )}
        </div>

        {/* ========================================================= */}
        {/* 🔥 PESTAÑA 3: CRM DE CAPTACIÓN (NUEVA) 🔥 */}
        {/* ========================================================= */}
        {activeTab === 'CRM' && (
            <div className="space-y-6">
                 
                 {/* FORMULARIO PARA AÑADIR AGENCIAS */}
                 <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
                    <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-4"><Target size={20}/> Añadir Objetivo (Nueva Agencia)</h2>
                   <form onSubmit={handleAddProspect} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <input type="text" placeholder="Nombre de la Agencia *" className="bg-white text-gray-900 p-3 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newProspect.companyName} onChange={e=>setNewProspect({...newProspect, companyName: e.target.value})} required/>
                        <input type="email" placeholder="Email de contacto *" className="bg-white text-gray-900 p-3 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newProspect.email} onChange={e=>setNewProspect({...newProspect, email: e.target.value})} required/>
                        <input type="tel" placeholder="Teléfono" className="bg-white text-gray-900 p-3 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newProspect.phone} onChange={e=>setNewProspect({...newProspect, phone: e.target.value})}/>
                        <input type="text" placeholder="Ciudad / Zona" className="bg-white text-gray-900 p-3 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newProspect.city} onChange={e=>setNewProspect({...newProspect, city: e.target.value})}/>
                        <button type="submit" disabled={isSending} className="bg-indigo-600 text-white font-bold py-3 rounded-lg text-sm hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50">
                            {isSending ? 'Añadiendo...' : '+ Guardar Agencia'}
                        </button>
                    </form>
                 </div>

                 {/* TABLA DE PROSPECTOS */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="p-5 font-medium w-1/3">Agencia Objetivo</th>
                                <th className="p-5 font-medium w-1/5">Localización</th>
                                <th className="p-5 font-medium text-center w-1/5">Estado / Historial</th>
                                <th className="p-5 font-medium text-center w-1/4">Lanzar Campaña</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredProspects.length === 0 ? (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-400">No hay objetivos en la base de datos de captación. Añada una agencia arriba.</td></tr>
                            ) : filteredProspects.map((prospect) => {
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
                                                    <span className="text-[10px] text-gray-400 font-medium">Envíos totales: {prospect.emailsSent}</span>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 font-bold text-[10px] uppercase tracking-wider rounded-full border border-gray-200">VIRGEN (Sin Tocar)</span>
                                            )}
                                        </td>
                                       <td className="p-5 text-center">
                                            <div className="flex flex-col gap-2">
                                             {/* 📱 BOTÓN WHATSAPP (Con Aviso de Ordenador - Desktop First) */}
                                                <button 
                                                    onClick={() => {
                                                        if(!prospect.phone) return alert("Esta agencia no tiene teléfono registrado.");
                                                        
                                                        // Limpiamos el teléfono y le ponemos el +34 de España si es necesario
                                                        let cleanPhone = prospect.phone.replace(/\D/g, '');
                                                        if(cleanPhone.length === 9) cleanPhone = '34' + cleanPhone;

                                                        // EL MISIL DE TEXTO EXACTO (CON ADVERTENCIA DESKTOP)
                                                        const message = `Hola, equipo de ${prospect.companyName}. Soy Alex, del Growth & Partnerships Team de Stratosfere.\n\nEstamos seleccionando e invitando en esta fase de lanzamiento a agencias con un sólido bagaje en el sector y producto en gestión en ${prospect.city || 'su zona'}. El objetivo es que sean de nuestros primeros colaboradores desde el 'Día 0', lo que a futuro les otorgará ventajas y extras exclusivos.\n\nConocemos que ya usan portales tradicionales para la promoción y conexión con el mercado. Por eso, hemos lanzado un modelo completamente distinto: un portal inmobiliario impulsado por un Sistema Operativo B2B (SaaS) en tiempo real, conectado a un mapa vía satélite en 3D. Aquí geolocalizarán su producto con una exposición que rompe las barreras tecnológicas y genera un atractivo visual innegable.\n\nLa tecnología está diseñada para multiplicar sus cierres: venta cruzada, captación de exclusivas sin levantar el teléfono, organización de eventos online, red de embajadores (leads) y una bolsa segura para compartir comisiones con otros profesionales... entre otras funciones que esperamos descubran ustedes mismos al testearla.\n\nLes dejo un breve vídeo operando el radar por dentro:\n🎥 [ENLACE-AL-VIDEO-AQUI]\n\nLo mejor es que lo comprueben ustedes mismos. Para ello, les hemos habilitado una invitación de 15 días de acceso total, 100% operativo. Si tras la prueba deciden quedarse en esta fase de lanzamiento, disfrutarán de una operatividad del 100% sin restricciones ni permanencia por una suscripción de mantenimiento de 49,90 €/mes.\n\n⚠️ IMPORTANTE: Stratosfere es una herramienta de alto rendimiento. Para desplegar todo el potencial del mapa 3D y de la edicion, es imprescindible abrir este enlace desde un ORDENADOR. Una vez registrados, les facilitaremos las instrucciones para descargar la App complementaria (iOS/Android) y mantener el control 24/7 desde el móvil.\n\nPueden activar su acceso VIP aquí:\n👉 https://stratosfere.com/vip?inv=${prospect.id}&src=wa\n\nCualquier duda, pueden escribirme por aquí o a info@stratosfere.com. Un saludo y bienvenidos.`;
                                                        
const waUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;                                                       
 window.open(waUrl, '_blank'); 
                                                    }} 
                                                    className={`w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all shadow-sm ${prospect.phone ? 'bg-[#25D366] text-white hover:bg-[#128C7E]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                                    title={prospect.phone ? "Abrir en WhatsApp Web" : "Falta Teléfono"}
                                                >
                                                    <MessageCircle size={14}/> WhatsApp
                                                </button>

                                                {/* 📩 BOTÓN EMAIL (Bombardeo Formal y Controlado) */}
                                                <button 
                                                    onClick={async () => {
                                                        if(window.confirm(`¿Disparar email de invitación con 15 días gratis a ${prospect.companyName}?`)) {
                                                            const res = await sendProspectEmailAction(prospect.id);
                                                            if(res.success) {
                                                                alert("¡Misil enviado con éxito!");
                                                                window.location.reload();
                                                            } else { alert("Error al enviar el correo."); }
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
                                const isOnline = now && (now.getTime() - lastActive.getTime()) / 36e5 < 0.5;

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
                                        
                                        <td className="p-5 border-r border-gray-100/50">
                                            <div className="flex items-center gap-4">
                                                <div className="relative shrink-0">
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

                                        <td className="p-5 text-center">
                                            {isBlocked ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 font-bold text-[10px] uppercase tracking-wider rounded-full border border-red-200"><Ban size={12}/> BLOQUEADO</span>
                                            ) : isAgency ? (
                                                isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-wider rounded-full border border-indigo-200"><Building2 size={12}/> AGENCIA PREMIUM</span>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 font-bold text-[10px] uppercase tracking-wider rounded-full border border-amber-200"><Timer size={12}/> FREE TRIAL</span>
                                                        <span className="text-[10px] text-amber-600 font-mono font-bold">{timeRest || "Sin caducidad en BD"}</span>
                                                    </div>
                                                )
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider rounded-full border border-emerald-200"><Gem size={12}/> PAGO POR USO</span>
                                            )}
                                        </td>

                                        <td className="p-5 text-center">
                                            <div className="flex flex-col gap-2">
                                                <button 
                                                    onClick={async () => {
                                                        const confirmMsg = isBlocked ? "¿Activar a este usuario en el sistema y darle acceso?" : "¿Bloquear/Desactivar a este usuario por mala conducta?";
                                                        if(window.confirm(confirmMsg)) {
                                                            const res = await toggleUserStatusAction(user.id, isBlocked);
                                                            if(res.success) window.location.reload();
                                                            else alert("Error de conexión");
                                                        }
                                                    }} 
                                                    className={`w-full flex justify-center items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all shadow-sm ${isBlocked ? "bg-emerald-500 text-white hover:bg-emerald-600 border border-emerald-600" : "bg-white text-amber-600 hover:bg-amber-50 border border-amber-200"}`}
                                                >
                                                    {isBlocked ? <><Power size={12}/> REACTIVAR</> : <><PowerOff size={12}/> BLOQUEAR</>}
                                                </button>

                                                <button 
                                                    onClick={async () => {
                                                        if(window.confirm("¡ALERTA GENERAL! ¿Está seguro de que desea EJECUTAR a este usuario? Se borrará ÉL Y TODAS SUS PROPIEDADES de la faz de la tierra. NO HAY VUELTA ATRÁS.")) {
                                                            const res = await deleteUserAction(user.id);
                                                            if(res.success) window.location.reload();
                                                            else alert("Error: No se pudo eliminar el objetivo.");
                                                        }
                                                    }} 
                                                    className="w-full flex justify-center items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all shadow-sm bg-red-600 text-white hover:bg-red-700 border border-red-700"
                                                >
                                                    <Trash2 size={12}/> BORRAR CUENTA
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

                                                    <p className="text-[10px] text-gray-400 font-mono">{prop.refCode || prop.id}</p>
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
      </div>
    </div>
  );
}