"use client";

import React, { useState } from 'react';
import { submitPublicLeadAction } from '@/app/actions-public';
import { Send, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PublicContactForm({ propertyId, defaultMessage }: { propertyId: string, defaultMessage: string }) {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: defaultMessage });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        const res = await submitPublicLeadAction(propertyId, formData);
        
        if (res.success) {
            setSuccess(true);
            toast.success("¡Solicitud enviada a la agencia!");
        } else {
            toast.error("Hubo un error al enviar el mensaje.");
        }
        setLoading(false);
    };

    // 🔥 LA SOLUCIÓN: Envolvemos todo en un <div> estático que nunca desaparece
    return (
        <div className="w-full relative">
            
            {success ? (
                // VISTA 2: MENSAJE DE ÉXITO
                <div className="text-center p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 animate-in fade-in zoom-in duration-500 mt-6 shadow-inner">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100">
                        <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                    <h4 className="text-emerald-900 font-black text-xl mb-2">¡Solicitud Enviada!</h4>
                    <p className="text-sm text-emerald-700 font-medium mb-6">El agente ha recibido tus datos y te contactará a la brevedad.</p>
                    
                    <div className="h-px bg-emerald-200/50 w-full mb-6"></div>
                    
                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-3">Stratosfere OS.</p>
                    <p className="text-sm text-slate-700 font-medium mb-5">¿Quieres ver más propiedades exclusivas y guardar tus favoritos?</p>
                    <Link href="/?login=true" className="group w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200/50">
                        Registrarse Gratis <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                    </Link>
                </div>
            ) : (
                // VISTA 1: FORMULARIO ACTIVO
                <div className="mt-6 animate-in fade-in duration-300">
                    <div className="h-px bg-slate-100 w-full mb-5"></div>
                    <p className="text-sm font-black text-slate-900 mb-5 text-center uppercase tracking-widest">Solicitar Información</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input 
                            required type="text" placeholder="Nombre Completo" 
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-slate-400 shadow-sm"
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                            <input 
                                required type="email" placeholder="Email" 
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                            />
                            <input 
                                type="tel" placeholder="Teléfono" 
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} 
                            />
                        </div>

                        <textarea 
                            required rows={3} 
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-slate-400 resize-none shadow-sm leading-relaxed"
                            value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} 
                        />
                        
                        <button 
                            disabled={loading} type="submit" 
                            className="w-full py-4 bg-[#1c1c1e] hover:bg-black text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-200 mt-2 disabled:opacity-70 disabled:scale-100"
                        >
                            {loading ? 'Enviando...' : <><Send size={18}/> Enviar Solicitud</>}
                        </button>
                    </form>
                </div>
            )}
            
        </div>
    );
}

