"use client";
import React, { useState, useEffect } from 'react';
import { 
    Wallet, TrendingUp, Users, Copy, Check, ArrowUpRight, 
    Link as LinkIcon, Award, MousePointerClick, Zap, Loader2
} from 'lucide-react';

// 🔥 IMPORTAMOS LAS ACCIONES REALES
import { getAmbassadorDashboardAction, getPromotablePropertiesAction, generateAffiliateLinkAction } from '@/app/actions-ambassador';

export default function AmbassadorDashboard() {
    
    // ESTADOS REALES
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({
        totalRevenue: 0,
        pendingPayout: 0,
        availablePayout: 0,
        score: 5.0,
        rank: "PARTNER",
        totalClicks: 0,
        totalLeads: 0,
        totalSales: 0
    });

    const [activeLinks, setActiveLinks] = useState<any[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // 🔄 CARGA DE DATOS AL INICIAR
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Pedimos las estadísticas del usuario
                const dashboardRes = await getAmbassadorDashboardAction();
                if (dashboardRes.success && dashboardRes.data) {
                    setStats(dashboardRes.data);
                }

                // 2. Pedimos el catálogo de propiedades
                const propsRes = await getPromotablePropertiesAction();
                if (propsRes.success && propsRes.data) {
                    setActiveLinks(propsRes.data);
                }

            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // 📋 FUNCIÓN DE COPIAR LINK INTELIGENTE
    const handleCopy = async (propertyId: string) => {
        // Generamos el link único para este usuario y esta propiedad
        const res = await generateAffiliateLinkAction(propertyId);
        
        if (res.success && res.link) {
            navigator.clipboard.writeText(res.link);
            setCopiedId(propertyId);
            setTimeout(() => setCopiedId(null), 2000);
        } else {
            alert("Error generando enlace. Intenta de nuevo.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] p-4 md:p-8 font-sans text-slate-900 animate-fade-in">
            
            {/* HEADER: IDENTIDAD & RANGO */}
            <div className="max-w-5xl mx-auto mb-8 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                            {stats.rank || "PARTNER"}
                        </span>
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        Centro de Mando
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">
                        Tu red de influencia en tiempo real.
                    </p>
                </div>
                
                {/* STRATOS SCORE */}
                <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance Score</p>
                        <p className="text-xl font-black text-slate-900 leading-none">{stats.score}/10</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-200">
                        <Award size={20} strokeWidth={2.5} />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. LA BILLETERA (DATOS REALES) */}
                <div className="md:col-span-2 bg-black text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-700"></div>
                    
                    <div className="relative z-10 flex justify-between items-start mb-12">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                            <Wallet size={24} className="text-white"/>
                        </div>
                        <button className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2">
                            Retirar Fondos <ArrowUpRight size={14}/>
                        </button>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Saldo Disponible</p>
                            <p className="text-5xl font-black tracking-tight">{stats.availablePayout}€</p>
                        </div>
                        <div className="border-l border-white/10 pl-8">
                            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">En Proceso (Arras)</p>
                            <p className="text-3xl font-bold text-emerald-400 tracking-tight">{stats.pendingPayout}€</p>
                        </div>
                    </div>
                </div>

                {/* 2. EL EMBUDO (DATOS REALES) */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-600"/> Tu Impacto Global
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400"><MousePointerClick size={16}/></div>
                                <span className="text-xs font-bold text-slate-600">Clicks Totales</span>
                            </div>
                            <span className="text-lg font-black text-slate-900">{stats.totalClicks}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-500"><Users size={16}/></div>
                                <span className="text-xs font-bold text-blue-900">Leads Cualificados</span>
                            </div>
                            <span className="text-lg font-black text-blue-600">{stats.totalLeads}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-amber-500"><Zap size={16}/></div>
                                <span className="text-xs font-bold text-amber-900">Cierres / Ventas</span>
                            </div>
                            <span className="text-lg font-black text-amber-600">{stats.totalSales}</span>
                        </div>
                    </div>
                </div>

                {/* 3. CATÁLOGO ACTIVO (DATOS REALES) */}
                <div className="md:col-span-3">
                    <div className="flex justify-between items-end mb-4 px-2">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Oportunidades Activas</h3>
                        <p className="text-xs font-bold text-slate-400">Comparte estos enlaces para empezar a sumar.</p>
                    </div>

                    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden min-h-[200px]">
                        {activeLinks.length === 0 ? (
                            <div className="p-10 text-center text-slate-400">
                                <p>No hay propiedades con programa de embajadores activo en este momento.</p>
                            </div>
                        ) : (
                            activeLinks.map((link: any, index: number) => (
                                <div key={link.id} className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-slate-50 transition-colors ${index !== activeLinks.length -1 ? 'border-b border-slate-100' : ''}`}>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                            <img src={link.image} alt={link.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm md:text-base">{link.title}</h4>
                                            <p className="text-xs text-slate-500 mb-1">{link.city}</p>
                                            
                                            {/* Aquí en el futuro pondremos las visitas específicas de este link */}
                                            <div className="flex items-center gap-3">
                                                <span className="bg-blue-50 text-blue-600 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                                    Programa Activo
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tu Comisión Est.</p>
                                            <p className="text-lg font-black text-amber-500">{link.commissionDisplay}</p>
                                        </div>

                                        <button 
                                            onClick={() => handleCopy(link.id)}
                                            className={`h-10 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shrink-0 ${
                                                copiedId === link.id 
                                                ? 'bg-green-500 text-white shadow-green-200 shadow-lg' 
                                                : 'bg-slate-900 text-white hover:bg-black shadow-lg'
                                            }`}
                                        >
                                            {copiedId === link.id ? <Check size={16}/> : <Copy size={16}/>}
                                            {copiedId === link.id ? '¡Listo!' : 'Copiar Link'}
                                        </button>
                                    </div>

                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}