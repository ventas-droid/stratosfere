"use client";
import { useState, useMemo } from "react";
// ⚠️ Verifique que la ruta a sus actions sea correcta
import { toggleUserSubscriptionAction } from "@/app/admin-actions"; 
import { 
    ShieldCheck, Ban, Loader2, User, Search, Home, Phone, Calendar, 
    Lock, Clock, CreditCard, Building2, Activity, MapPin, BarChart3, 
    Users, Gem, LayoutDashboard, TrendingUp, LogOut
} from "lucide-react";

// Clave de acceso
const MASTER_PASSWORD = "GENERAL_ISIDRO"; 

export default function AdminDashboard({ users }: { users: any[] }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'USERS' | 'ANALYTICS'>('USERS');

  // --- 1. PROCESAMIENTO DE DATOS (MÉTRICAS DE NEGOCIO) ---
  const stats = useMemo(() => {
    const totalUsers = users.length;
    // Filtramos suscripciones activas
    const activeSubs = users.filter(u => u.subscription?.status === "ACTIVE").length;
    // Filtramos Trials activos
    const activeTrials = users.filter(u => u.agenciaTrialEndsAt && new Date(u.agenciaTrialEndsAt) > new Date()).length;
    
    const totalProperties = users.reduce((acc, curr) => acc + (curr._count?.properties || 0), 0);
    
    // Análisis Geográfico (Zonas)
    const zones: Record<string, number> = {};
    users.forEach(u => {
        const z = u.zone || "Ubicación no definida";
        zones[z] = (zones[z] || 0) + 1;
    });
    // Top 5 Zonas
    const topZones = Object.entries(zones).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { totalUsers, activeSubs, activeTrials, totalProperties, topZones };
  }, [users]);

  // --- 2. FILTRADO DE USUARIOS ---
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- 3. LOGIN ADMINISTRATIVO ---
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md">
                <ShieldCheck size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Stratosfere Admin</h1>
            <p className="text-gray-500 mb-8 text-sm">Panel de Control & Gestión</p>
            
            <div className="relative">
                <input 
                    type="password" 
                    placeholder="Contraseña de acceso"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && passwordInput === MASTER_PASSWORD) setIsAuthenticated(true); }}
                />
            </div>
            
            <button 
                onClick={() => { if (passwordInput === MASTER_PASSWORD) setIsAuthenticated(true); else alert("Credenciales incorrectas"); }}
                className="w-full bg-black text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-all text-sm shadow-lg shadow-gray-200"
            >
                Acceder al Dashboard
            </button>
        </div>
        <p className="mt-8 text-xs text-gray-400 font-medium">© 2024 Stratosfere Systems</p>
      </div>
    );
  }

  // --- 4. LÓGICA DE ESTADO (FINANCIERO Y ACTIVIDAD) ---
  const handleToggle = async (user: any) => {
    setLoadingId(user.id);
    const isPro = user.subscription?.status === "ACTIVE";
    const newStatus = isPro ? "INACTIVE" : "ACTIVE"; 
    await toggleUserSubscriptionAction(user.id, newStatus);
    setLoadingId(null);
  };

  const getStatusInfo = (user: any) => {
    const sub = user.subscription;
    const now = new Date();
    
    // Actividad reciente
    const lastActive = user.lastLoginAt ? new Date(user.lastLoginAt) : new Date(user.updatedAt);
    const hoursSinceActive = Math.abs(now.getTime() - lastActive.getTime()) / 36e5;
    const isOnline = hoursSinceActive < 0.5; // Consideramos online si hubo acción en últimos 30min

    // Lógica Financiera / Plan
    let plan = { name: "Gratuito", style: "bg-gray-100 text-gray-500 border-gray-200", icon: <User size={12}/>, daysLeft: 0 };
    
    if (sub?.status === "ACTIVE") {
        const end = new Date(sub.currentPeriodEnd);
        const days = Math.ceil((end.getTime() - now.getTime()) / (86400000));
        
        if (user.role === 'AGENCY') {
            plan = { name: "Agencia Pro", style: "bg-indigo-50 text-indigo-700 border-indigo-100", icon: <Building2 size={12}/>, daysLeft: days };
        } else {
            plan = { name: "Particular Pro", style: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: <Gem size={12}/>, daysLeft: days };
        }

    } else if (user.agenciaTrialEndsAt) {
        const end = new Date(user.agenciaTrialEndsAt);
        const days = Math.ceil((end.getTime() - now.getTime()) / (86400000));
        
        if (days > 0) {
            plan = { name: "Periodo de Prueba", style: "bg-amber-50 text-amber-700 border-amber-100", icon: <Clock size={12}/>, daysLeft: days };
        } else {
            plan = { name: "Prueba Caducada", style: "bg-red-50 text-red-600 border-red-100", icon: <Ban size={12}/>, daysLeft: 0 };
        }
    }

    return { plan, isOnline, lastActive };
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-gray-50 z-50 font-sans">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                    <LayoutDashboard size={18} />
                </div>
                <span className="font-bold text-gray-900 tracking-tight">Stratosfere <span className="text-gray-400 font-normal">Manager</span></span>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button 
                    onClick={() => setActiveTab('USERS')}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'USERS' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <Users size={14}/> Usuarios
                </button>
                <button 
                    onClick={() => setActiveTab('ANALYTICS')}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'ANALYTICS' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <BarChart3 size={14}/> Analítica
                </button>
            </div>

            <button onClick={() => setIsAuthenticated(false)} className="text-gray-400 hover:text-red-600 transition-colors">
                <LogOut size={18} />
            </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 md:p-8 pb-20">
        
        {/* KPI CARDS - RESUMEN EJECUTIVO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20}/></div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1"><TrendingUp size={10}/> Total</span>
                </div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Usuarios Registrados</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</h3>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CreditCard size={20}/></div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Recurrente</span>
                </div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Suscripciones Activas</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activeSubs}</h3>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20}/></div>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Potenciales</span>
                </div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Trials en Curso</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activeTrials}</h3>
            </div>

             <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Home size={20}/></div>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Inventario</span>
                </div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Propiedades Totales</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProperties}</h3>
            </div>
        </div>

        {/* --- PESTAÑA 1: GESTIÓN DE USUARIOS --- */}
        {activeTab === 'USERS' && (
            <div className="space-y-4">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Directorio de Usuarios</h2>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre, email..." 
                            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                 </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="p-5 font-medium">Usuario / Rol</th>
                                <th className="p-5 font-medium">Ubicación</th>
                                <th className="p-5 font-medium">Estado & Actividad</th>
                                <th className="p-5 font-medium">Plan Actual</th>
                                <th className="p-5 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredUsers.map((user) => {
                                const { plan, isOnline, lastActive } = getStatusInfo(user);
                                const isAgency = user.role === 'AGENCY';
                                const isLoading = loadingId === user.id;

                                return (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                {user.avatar ? (
                                                    <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"><User size={18}/></div>
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-gray-900">{user.name}</p>
                                                        {isAgency ? (
                                                            <span className="bg-gray-900 text-white px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase">AGENCIA</span>
                                                        ) : (
                                                            <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border border-gray-200">PARTICULAR</span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-500 text-xs mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 text-gray-600 text-xs">
                                                <MapPin size={14} className="text-gray-400"/>
                                                {user.zone || <span className="text-gray-400 italic">No especificado</span>}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                                    <span className={`text-xs font-medium ${isOnline ? 'text-emerald-700' : 'text-gray-500'}`}>
                                                        {isOnline ? "En línea ahora" : "Desconectado"}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-gray-400">
                                                    Último acceso: {lastActive.toLocaleDateString()}
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Home size={12} className="text-gray-400"/>
                                                    <span className="text-xs font-medium text-gray-700">{user._count?.properties || 0} Propiedades</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${plan.style}`}>
                                                {plan.icon} {plan.name}
                                            </div>
                                            {plan.daysLeft > 0 && (
                                                <p className="text-[11px] text-gray-500 mt-1.5 ml-1">
                                                    Vence en <span className="font-bold text-gray-700">{plan.daysLeft} días</span>
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-5 text-right">
                                             <button 
                                                onClick={() => handleToggle(user)}
                                                disabled={isLoading}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                                                    plan.name.includes("Pro") || plan.name.includes("Prueba")
                                                    ? "bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" 
                                                    : "bg-black text-white hover:bg-gray-800 shadow-md shadow-gray-200"
                                                }`}
                                            >
                                                {isLoading ? <Loader2 size={14} className="animate-spin mx-auto"/> : (plan.name.includes("Pro") || plan.name.includes("Prueba")) ? "Suspender" : "Activar"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        No se encontraron usuarios con ese criterio de búsqueda.
                    </div>
                )}
            </div>
        )}

        {/* --- PESTAÑA 2: ANALÍTICA --- */}
        {activeTab === 'ANALYTICS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* ZONAS GEOGRÁFICAS */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <MapPin size={18} className="text-rose-500"/> Distribución Geográfica
                        </h3>
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">Top 5 Zonas</span>
                    </div>
                    
                    <div className="space-y-5">
                        {stats.topZones.map(([zone, count], index) => {
                            const percentage = Math.round((count / stats.totalUsers) * 100);
                            return (
                                <div key={zone}>
                                    <div className="flex justify-between text-xs font-medium text-gray-600 mb-2">
                                        <span className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">{index + 1}</span>
                                            {zone || "Sin Ubicación"}
                                        </span>
                                        <span className="text-gray-900 font-bold">{count} <span className="text-gray-400 font-normal">({percentage}%)</span></span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="h-full bg-rose-500 rounded-full" 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* TASA DE CONVERSIÓN */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <Activity size={18} className="text-indigo-500"/> Rendimiento Comercial
                        </h3>
                    </div>

                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="relative w-40 h-40 rounded-full border-[12px] border-gray-50 flex items-center justify-center mb-6">
                            {/* Gráfico circular simulado con CSS clip-path */}
                            <div className="absolute inset-0 border-[12px] border-emerald-500 rounded-full transform -rotate-90" 
                                 style={{ clipPath: `polygon(50% 50%, 50% 0%, ${stats.activeSubs > 0 ? '100% 0, 100% 100%, 0 100%, 0 0' : '50% 0%'})` }}>
                                     {/* Nota: Esto es una simplificación visual. Para un gráfico real se recomienda Chart.js o Recharts, pero esto funciona sin instalar nada extra */}
                            </div>
                            <div className="text-center z-10">
                                <span className="block text-3xl font-bold text-gray-900">{Math.round((stats.activeSubs / stats.totalUsers) * 100) || 0}<span className="text-sm">%</span></span>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Conversión</span>
                            </div>
                        </div>
                        
                        <div className="w-full grid grid-cols-2 gap-4 text-center">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Total Usuarios</p>
                                <p className="text-lg font-bold text-gray-900">{stats.totalUsers}</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-lg">
                                <p className="text-xs text-emerald-600 mb-1">Clientes de Pago</p>
                                <p className="text-lg font-bold text-emerald-700">{stats.activeSubs}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}