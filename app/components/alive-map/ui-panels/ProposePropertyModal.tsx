"use client";
import React, { useState } from 'react';
import { X, Handshake, Shield, ArrowRight, Loader2, Key, CheckCircle2, Phone, EyeOff, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { sendProposalAction } from '@/app/actions-demands';

export default function ProposePropertyModal({ isOpen, onClose, demand }: any) {
    const [mode, setMode] = useState<"REF" | "OFF_MARKET">("REF"); // 🔥 EL NUEVO INTERRUPTOR
    const [reference, setReference] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen || !demand) return null;

   const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // Preparamos la munición
    const payload = {
        demandId: demand.id,
        receiverId: demand.userId, // El dueño de la demanda
        mode: mode,
        reference: mode === "REF" ? reference : undefined,
        phone: mode === "OFF_MARKET" ? phone : undefined,
        notes: mode === "OFF_MARKET" ? notes : undefined
    };

    // Disparamos el misil
    const res = await sendProposalAction(payload);

    if (res.success) {
        setSuccess(true);
        toast.success(mode === "REF" ? "Referencia enviada" : "Contacto Off-Market enviado", { 
            description: "El creador de la demanda ha sido notificado." 
        });

        // Cerramos el modal tras la confirmación visual
        setTimeout(() => {
            onClose();
            setSuccess(false);
            setReference("");
            setPhone("");
            setNotes("");
        }, 2000);
    } else {
        toast.error(res.error || "Error de transmisión al enviar la propuesta.");
    }

    setLoading(false);
};

    return (
        <div className="fixed inset-0 z-[80000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl transition-opacity animate-in fade-in duration-500" onClick={!loading ? onClose : undefined}></div>
            
            <div className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_0_80px_rgba(0,0,0,0.2)] border border-white/50 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 overflow-hidden flex flex-col">
                
                {success ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center h-[400px] animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 size={40} className="text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Propuesta Enviada</h3>
                        <p className="text-slate-500 font-medium">El creador de la demanda revisará tu activo en breve.</p>
                    </div>
                ) : (
                    <>
                        <div className="absolute top-4 right-4 z-10">
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
                                <X size={16}/>
                            </button>
                        </div>

                        <div className="pt-10 px-8 pb-4 text-center">
                            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-slate-900/20">
                                <Handshake size={32} className="text-white"/>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Enviar Propuesta</h2>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">
                                Para: <strong className="text-slate-900">"{demand.title}"</strong>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
                            
                            {/* 🔥 INTERRUPTOR ESTILO APPLE (Segmented Control) 🔥 */}
                            <div className="bg-slate-100 p-1.5 rounded-2xl flex relative">
                                <div className={`absolute inset-y-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${mode === "OFF_MARKET" ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'}`}></div>
                                
                                <button type="button" onClick={() => setMode("REF")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl relative z-10 transition-colors ${mode === "REF" ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <Hash size={14}/> Plataforma
                                </button>
                                <button type="button" onClick={() => setMode("OFF_MARKET")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl relative z-10 transition-colors ${mode === "OFF_MARKET" ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <EyeOff size={14}/> Off-Market
                                </button>
                            </div>

                            {/* CAMPOS CONDICIONALES */}
                            <div className="min-h-[80px]">
                                {mode === "REF" ? (
                                    <div className="animate-in fade-in slide-in-from-left-4 duration-300 relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                            <Key size={20} className="text-slate-400 group-focus-within:text-slate-900 transition-colors"/>
                                        </div>
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="Referencia (Ej: REF-994)" 
                                            value={reference}
                                            onChange={e => setReference(e.target.value.toUpperCase())}
                                            className="w-full h-16 pl-12 pr-4 bg-slate-100/50 hover:bg-slate-100 focus:bg-white rounded-2xl border border-transparent focus:border-slate-300 focus:ring-4 focus:ring-slate-100 outline-none font-mono font-bold text-lg text-slate-900 transition-all text-center uppercase tracking-widest placeholder:text-sm placeholder:font-sans placeholder:font-medium placeholder:tracking-normal placeholder:normal-case"
                                        />
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-3">
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                <Phone size={18} className="text-slate-400 group-focus-within:text-slate-900 transition-colors"/>
                                            </div>
                                            <input required type="tel" placeholder="Tu teléfono de contacto" value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-12 pl-12 pr-4 bg-slate-100/50 hover:bg-slate-100 focus:bg-white rounded-xl border border-transparent focus:border-slate-300 focus:ring-4 focus:ring-slate-100 outline-none font-bold text-slate-900 transition-all"/>
                                        </div>
                                        <textarea required placeholder="Tengo una villa que no está publicada por privacidad. Llámame..." rows={2} value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-4 bg-slate-100/50 hover:bg-slate-100 focus:bg-white rounded-xl border border-transparent focus:border-slate-300 focus:ring-4 focus:ring-slate-100 outline-none font-medium text-slate-900 text-sm transition-all resize-none"></textarea>
                                    </div>
                                )}
                            </div>

                            <button disabled={loading || (mode === "REF" ? !reference : (!phone || !notes))} type="submit" className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-30 disabled:hover:bg-slate-900">
                                {loading ? <Loader2 className="animate-spin" size={20}/> : (
                                    <>Enviar Propuesta Ciega <ArrowRight size={18}/></>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                <Shield size={14}/>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Operación B2B Blindada</span>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}