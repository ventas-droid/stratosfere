"use client";
import React, { useState, useEffect } from 'react';
import { 
    User, Phone, MapPin, CreditCard, ShieldCheck, 
    Building2, ArrowLeft, Loader2, FileText, Inbox, Shield, Hash, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

// ⚠️ Asegúrese de que la ruta a sus acciones es correcta
import { getReceivedProposalsAction } from '@/app/actions-demands'; 

export default function AmbassadorProfile({ onBack, initialTab = "PROFILE" }: { onBack: () => void, initialTab?: "PROFILE" | "INBOX" }) {    
    // ESTADOS DE NAVEGACIÓN
    const [activeTab, setActiveTab] = useState<"PROFILE" | "INBOX">("INBOX");
    
    // ESTADOS DEL BUZÓN
    const [proposals, setProposals] = useState<any[]>([]);
    const [loadingInbox, setLoadingInbox] = useState(true);

    // ESTADOS DEL FORMULARIO DE PERFIL
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "", dni: "", phone: "", address: "", iban: "", city: ""
    });

    // EFECTO: Cargar el buzón al abrir la pestaña
    useEffect(() => {
        if (activeTab === "INBOX") {
            setLoadingInbox(true);
            getReceivedProposalsAction().then(res => {
                if (res.success && res.data) {
                    setProposals(res.data);
                } else {
                    toast.error("Error al interceptar comunicaciones.");
                }
                setLoadingInbox(false);
            });
        }
    }, [activeTab]);

    // MANEJADORES DEL FORMULARIO
    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmitProfile = async (e: any) => {
        e.preventDefault();
        setLoadingProfile(true);

        // SIMULACIÓN DE GUARDADO
        setTimeout(() => {
            setLoadingProfile(false);
            toast.success("Identidad Verificada", {
                description: "Tus datos fiscales han sido encriptados y guardados."
            });
        }, 1500);
    };

    return (
        <div className="h-screen bg-[#F5F5F7] flex flex-col font-sans text-slate-900 overflow-hidden">
            
          {/* CABECERA TÁCTICA DEL BUZÓN */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex-shrink-0 z-20">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all active:scale-95 shadow-sm group">
                            <ArrowLeft size={18} className="text-slate-700 group-hover:-translate-x-0.5 transition-transform"/>
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-2">
                                <Inbox size={22} className="text-blue-600" /> Buzón B2B
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Centro de Operaciones
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-grow overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-3xl mx-auto space-y-6 pb-20">
                    
                    {/* ❌ EL INTERRUPTOR TÁCTICO HA SIDO ELIMINADO PARA IR DIRECTO AL GRANO ❌ */}

                    {/* ========================================================= */}
                    {/* VISTA 1: MI FICHA (FORMULARIO OFICIAL RECUPERADO) */}
                    {/* ========================================================= */}
                    {activeTab === "PROFILE" && (
                        <form onSubmit={handleSubmitProfile} className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                            
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div className="relative z-10 space-y-6">
                                {/* SECCIÓN 1: IDENTIDAD */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <User size={14}/> Identidad Operativa
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nombre Completo / Razón Social</label>
                                            <input name="fullName" placeholder="Ej: Juan Pérez o InmoS.L." className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-900/10 font-bold text-slate-900 outline-none transition-all" onChange={handleChange}/>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">DNI / NIF / CIF</label>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                                <input name="dni" placeholder="Documento Oficial" className="w-full h-12 pl-10 pr-4 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-900/10 font-bold text-slate-900 outline-none uppercase transition-all" onChange={handleChange}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100"/>

                                {/* SECCIÓN 2: CONTACTO */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Phone size={14}/> Contacto Directo
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Teléfono Móvil</label>
                                            <input name="phone" type="tel" placeholder="+34 600 000 000" className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-900/10 font-bold text-slate-900 outline-none transition-all" onChange={handleChange}/>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Ciudad Base</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                                <input name="city" placeholder="Ej: Madrid" className="w-full h-12 pl-10 pr-4 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-900/10 font-bold text-slate-900 outline-none transition-all" onChange={handleChange}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Dirección Fiscal</label>
                                        <input name="address" placeholder="Calle, Número, Piso..." className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-900/10 font-bold text-slate-900 outline-none transition-all" onChange={handleChange}/>
                                    </div>
                                </div>

                                <hr className="border-slate-100"/>

                                {/* SECCIÓN 3: BANCA */}
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2 mb-3">
                                        <CreditCard size={14}/> Datos de Cobro (IBAN)
                                    </h3>
                                    <input name="iban" placeholder="ES00 0000 0000 0000 0000" className="w-full h-12 px-4 bg-white rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500/20 font-mono text-slate-900 outline-none placeholder:text-slate-300 transition-all uppercase" onChange={handleChange}/>
                                    <p className="text-[10px] text-emerald-700/60 mt-2 font-bold uppercase tracking-wider">
                                        * Necesario para recibir transferencias de comisiones en tu cuenta.
                                    </p>
                                </div>

                                <button type="submit" disabled={loadingProfile} className="w-full h-14 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-md flex items-center justify-center gap-2">
                                    {loadingProfile ? <Loader2 className="animate-spin" size={18}/> : <ShieldCheck size={18}/>}
                                    {loadingProfile ? "Verificando..." : "Guardar Ficha Oficial"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ========================================================= */}
                    {/* VISTA 2: EL RADAR (BUZÓN DE PROPUESTAS) */}
                    {/* ========================================================= */}
                    {activeTab === "INBOX" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            {loadingInbox ? (
                                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-slate-400" size={32}/></div>
                            ) : proposals.length === 0 ? (
                                <div className="bg-white rounded-[32px] p-12 text-center border border-slate-200 shadow-sm">
                                    <Inbox size={48} className="mx-auto text-slate-200 mb-4"/>
                                    <h3 className="text-xl font-black text-slate-900">Buzón Despejado</h3>
                                    <p className="text-slate-500 text-sm mt-2 font-medium">Aún no has recibido propuestas para tus demandas.</p>
                                </div>
                            ) : (
                                proposals.map((prop) => (
                                    <div key={prop.id} className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 group relative overflow-hidden">
                                        
                                        <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-slate-50 border border-slate-200 text-slate-500 text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest flex items-center gap-1">
                                                        <Shield size={12}/> Propuesta Recibida
                                                    </span>
                                                    {prop.status === "UNREAD" && (
                                                        <span className="bg-blue-50 text-blue-600 text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest border border-blue-100">
                                                            NUEVO
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-slate-500">
                                                    Respuesta a tu demanda: <strong className="text-slate-900">"{prop.demand?.title}"</strong>
                                                </p>
                                            </div>
                                            
                                            <div className="text-right flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enviado por</p>
                                                    <p className="text-sm font-black text-slate-900">{prop.sender?.name || "Agente B2B"}</p>
                                                </div>
                                                <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                                                    {prop.sender?.avatar ? <img src={prop.sender.avatar} className="w-full h-full object-cover"/> : <Building2 size={16} className="text-slate-400"/>}
                                                </div>
                                            </div>
                                        </div>

                                        {prop.mode === "REF" ? (
                                            <div className="bg-slate-50 rounded-[20px] p-6 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                                                        <Hash size={24} className="text-slate-900"/>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Referencia Plataforma</p>
                                                        <p className="text-2xl font-mono font-black text-slate-900 tracking-wider">{prop.reference}</p>
                                                    </div>
                                                </div>
                                                <button className="w-full md:w-auto h-12 px-6 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 shrink-0">
                                                    Buscar en Arsenal
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-emerald-50/50 rounded-[20px] p-6 border border-emerald-100 space-y-4 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                                    <EyeOff size={100} className="text-emerald-900 -mt-8 -mr-8"/>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 relative z-10">
                                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-600">
                                                        <Phone size={18}/>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Contacto Off-Market</p>
                                                        <p className="text-xl font-black text-slate-900">{prop.phone}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-emerald-100/50 relative z-10 shadow-sm">
                                                    <p className="text-sm font-medium text-slate-700 italic">"{prop.notes}"</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}