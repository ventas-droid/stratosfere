"use client";
import React, { useState, useEffect } from "react";
import { Handshake, Briefcase, Coins, Check, Eye, Lock, Globe, ArrowLeft } from "lucide-react";
export default function StepAgencyB2B({ formData, updateData, setStep }: any) {
    
    // Inicialización segura
    const [mandate, setMandate] = useState(formData.mandateType || "ABIERTO");
    const [comm, setComm] = useState(formData.commissionPct || 3);
    const [share, setShare] = useState(formData.sharePct || 0);
    const [visibility, setVisibility] = useState(formData.shareVisibility || "AGENCIES");

    // Guardado en tiempo real al cambiar inputs
    useEffect(() => {
        updateData("mandateType", mandate);
        updateData("commissionPct", comm);
        updateData("sharePct", share);
        updateData("shareVisibility", visibility);
    }, [mandate, comm, share, visibility]);

    // Cálculos visuales (Estimaciones)
    const rawPrice = formData.price ? parseFloat(String(formData.price).replace(/\D/g, "")) : 0;
    const commAmount = rawPrice * (comm / 100);
    const shareAmount = commAmount * (share / 100);

    const formatMoney = (amount: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="h-full flex flex-col animate-in slide-in-from-right duration-500 px-2">
             
             {/* CABECERA */}
             <div className="mb-6 shrink-0">
                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Colaboración</h2>
                <p className="text-gray-500 font-medium">Define tu mandato y comparte honorarios.</p>
             </div>
             
             <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar space-y-6 pb-6">
                
                {/* 1. TIPO DE MANDATO */}
                <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Briefcase size={12}/> Tipo de Mandato
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setMandate("ABIERTO")} className={`py-4 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-2 ${mandate === "ABIERTO" ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                            <span className="uppercase tracking-wider">Nota Encargo</span>
                        </button>
                        <button onClick={() => setMandate("EXCLUSIVE")} className={`py-4 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-2 ${mandate === "EXCLUSIVE" ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                            <span className="uppercase tracking-wider">Exclusiva</span>
                        </button>
                    </div>
                </div>

{/* --- INICIO BLOQUE MESES --- */}
        <div className="mt-6">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Tiempo (Meses)
            </label>
            <input 
                type="number"
                min="1"
                max="60"
                className="w-full p-4 bg-white rounded-xl border border-gray-200 text-gray-900 font-bold text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
                placeholder="Ej: 6"
                value={formData.exclusiveMonths || ""}
                onChange={(e) => updateData("exclusiveMonths", e.target.value === "" ? "" : Number(e.target.value))}
            />
        </div>
        {/* --- FIN BLOQUE MESES --- */}

                {/* 2. HONORARIOS AGENCIA */}
                <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Coins size={12}/> Honorarios Totales
                    </label>
                    <div className="flex items-center gap-4">
                        <div className="w-24">
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={comm} 
                                    onChange={e => setComm(Number(e.target.value))} 
                                    className="w-full bg-gray-50 p-3 rounded-xl font-black text-gray-900 outline-none focus:ring-2 ring-blue-100 text-center text-lg"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                            </div>
                        </div>
                        <div className="flex-1 text-right bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <span className="text-[9px] font-bold text-gray-400 block mb-0.5 uppercase tracking-wide">Total Estimado</span>
                            <span className="text-lg font-black text-gray-900">{formatMoney(commAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* 3. REPARTO B2B (EL BOTÓN DORADO) */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-[24px] border border-amber-100 shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/20 rounded-full blur-3xl pointer-events-none"></div>
                     
                     <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shadow-sm border border-amber-200"><Handshake size={20}/></div>
                        <div>
                            <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">Colaboración B2B</h3>
                            <p className="text-[10px] text-amber-700/70 font-medium">Define cuánto compartes con el colaborador.</p>
                        </div>
                     </div>

                     <div className="mb-6 relative z-10">
                        <div className="flex justify-between items-end mb-2">
                             <label className="text-[10px] font-black text-amber-800/60 uppercase tracking-widest">Porcentaje a Compartir</label>
                             <span className="text-3xl font-black text-amber-600">{share}%</span>
                        </div>
                        <input type="range" min="0" max="100" step="5" value={share} onChange={e => setShare(Number(e.target.value))} className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"/>
                        <div className="flex justify-between text-[9px] text-amber-700/50 mt-1 font-bold">
                            <span>0% (Sin Colab)</span>
                            <span>50% (Mita y Mita)</span>
                            <span>100% (Referido)</span>
                        </div>
                     </div>

                     <div className="flex justify-between items-center bg-white/80 p-4 rounded-xl border border-amber-100/50 mb-6 backdrop-blur-sm relative z-10">
                         <span className="text-xs font-bold text-amber-800">Para el colaborador:</span>
                         <span className="text-xl font-black text-amber-600">{formatMoney(shareAmount)}</span>
                     </div>

                     <div className="relative z-10">
                        <label className="block text-[10px] font-black text-amber-800/60 uppercase tracking-widest mb-2">Visibilidad del Dato</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => setVisibility("PRIVATE")} className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all flex flex-col items-center gap-1 ${visibility === "PRIVATE" ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-amber-800/60 hover:bg-amber-50'}`}>
                                <Lock size={12}/> Privado
                            </button>
                            <button onClick={() => setVisibility("AGENCIES")} className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all flex flex-col items-center gap-1 ${visibility === "AGENCIES" ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-amber-800/60 hover:bg-amber-50'}`}>
                                <Briefcase size={12}/> Agencias
                            </button>
                            <button onClick={() => setVisibility("PUBLIC")} className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all flex flex-col items-center gap-1 ${visibility === "PUBLIC" ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-amber-800/60 hover:bg-amber-50'}`}>
                                <Globe size={12}/> Público
                            </button>
                        </div>
                     </div>
                </div>
             </div>

             {/* BOTONERA INFERIOR */}
             <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
                <button onClick={() => setStep("OPEN_HOUSE")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95">
                    <ArrowLeft size={24} />
                </button>
                <button onClick={() => setStep("SUCCESS")} className="flex-1 h-16 bg-[#1d1d1f] text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-black active:scale-[0.98] transition-all">
                    Finalizar y Publicar <Check size={20} />
                </button>
             </div>
        </div>
    );
}