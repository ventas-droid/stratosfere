"use client";
import React, { useState } from 'react';
import { 
    User, Phone, MapPin, CreditCard, Save, 
    ShieldCheck, Building2, ArrowLeft, Loader2, FileText
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
// Aquí importaremos la acción de guardar (la crearemos luego)
// import { updateAmbassadorProfileAction } from '@/app/actions-ambassador';

export default function AmbassadorProfile({ onBack }: { onBack: () => void }) {
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        dni: "",
        phone: "",
        address: "",
        iban: "",
        city: ""
    });

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        // SIMULACIÓN DE GUARDADO (Aquí conectaremos con la base de datos real luego)
        setTimeout(() => {
            setLoading(false);
            toast.success("Identidad Verificada", {
                description: "Tus datos fiscales han sido encriptados y guardados."
            });
        }, 1500);
        
        // Cuando tengamos la acción real:
        // const res = await updateAmbassadorProfileAction(formData);
        // if (res.success) toast.success(...)
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] p-4 md:p-8 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Toaster position="bottom-center" richColors />

            <div className="w-full max-w-2xl">
                {/* CABECERA */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onBack} className="p-3 bg-white hover:bg-slate-50 rounded-xl shadow-sm border border-slate-200 transition-colors">
                        <ArrowLeft size={20} className="text-slate-600"/>
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            EXPEDIENTE <span className="text-blue-600">OFICIAL</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Completa tu ficha para habilitar los pagos de comisiones.
                        </p>
                    </div>
                </div>

                {/* FORMULARIO */}
                <form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                    
                    {/* Decoración de fondo */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10 space-y-6">
                        
                        {/* SECCIÓN 1: IDENTIDAD */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={14}/> Identidad Operativa
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nombre Completo / Razón Social</label>
                                    <input 
                                        name="fullName"
                                        placeholder="Ej: Juan Pérez o InmoS.L." 
                                        className="w-full h-12 px-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-900 outline-none"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">DNI / NIF / CIF</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                        <input 
                                            name="dni"
                                            placeholder="Documento Oficial" 
                                            className="w-full h-12 pl-10 pr-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-900 outline-none uppercase"
                                            onChange={handleChange}
                                        />
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
                                    <input 
                                        name="phone"
                                        type="tel"
                                        placeholder="+34 600 000 000" 
                                        className="w-full h-12 px-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-900 outline-none"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Ciudad Base</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                        <input 
                                            name="city"
                                            placeholder="Ej: Madrid" 
                                            className="w-full h-12 pl-10 pr-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-900 outline-none"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Dirección Fiscal</label>
                                <input 
                                    name="address"
                                    placeholder="Calle, Número, Piso..." 
                                    className="w-full h-12 px-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-900 outline-none"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <hr className="border-slate-100"/>

                        {/* SECCIÓN 3: BANCA (OPCIONAL PERO POTENTE) */}
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                            <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest flex items-center gap-2 mb-3">
                                <CreditCard size={14}/> Datos de Cobro (IBAN)
                            </h3>
                            <input 
                                name="iban"
                                placeholder="ES00 0000 0000 0000 0000" 
                                className="w-full h-12 px-4 bg-white rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500/20 font-mono text-slate-900 outline-none placeholder:text-slate-300"
                                onChange={handleChange}
                            />
                            <p className="text-[10px] text-amber-700/60 mt-2 font-medium">
                                * Necesario para recibir transferencias de comisiones superiores a 3.000€.
                            </p>
                        </div>

                        {/* BOTÓN DE ACCIÓN */}
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-wide hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin"/> : <ShieldCheck size={18}/>}
                            {loading ? "Verificando..." : "Guardar Ficha Oficial"}
                        </button>
                    </div>

                    {/* Footer Legal del Formulario */}
                    <div className="mt-6 text-center">
                        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <Building2 size={10}/>
                            Tus datos están protegidos bajo la LOPD y solo se compartirán con la agencia pagadora.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}