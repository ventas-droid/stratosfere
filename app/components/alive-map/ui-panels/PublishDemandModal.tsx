"use client";
import React, { useState, useEffect } from 'react';
import { X, Megaphone, MapPin, Wallet, Percent, AlertCircle, FileSignature, Loader2, Handshake, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { createDemandAction, updateDemandAction } from '@/app/actions-demands'; 

export default function PublishDemandModal({ isOpen, onClose, onSuccess, demandToEdit }: any) {
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        title: "", location: "", budget: "", totalComm: "5%", split: "50% / 50%", 
        urgent: false, mandate: false, description: ""
    });

    // Si abrimos el modal en "Modo Edición", rellenamos los datos
    useEffect(() => {
        if (demandToEdit) {
            setFormData({
                title: demandToEdit.title || "",
                location: demandToEdit.location || "",
                budget: demandToEdit.budget || "",
                totalComm: demandToEdit.totalComm || "5%",
                split: demandToEdit.split || "50% / 50%",
                urgent: demandToEdit.urgent || false,
                mandate: demandToEdit.mandate || false,
                description: demandToEdit.description || "",
            });
        } else {
            // Si es nueva, lo dejamos limpio
            setFormData({
                title: "", location: "", budget: "", totalComm: "5%", split: "50% / 50%", 
                urgent: false, mandate: false, description: ""
            });
        }
    }, [demandToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        
        let res;
        if (demandToEdit) {
            // Modo Editar
            res = await updateDemandAction(demandToEdit.id, formData);
        } else {
            // Modo Crear Nuevo
            res = await createDemandAction(formData);
        }
        
        if (res.success) {
            toast.success(demandToEdit ? "Demanda actualizada" : "Demanda publicada en el Mercado B2B");
            onSuccess(); 
        } else {
            toast.error(res.error || "Error de comunicaciones");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[70000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>
            
            <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        {demandToEdit ? <Edit2 className="text-blue-400" size={24}/> : <Megaphone className="text-emerald-400" size={24}/>}
                        <div>
                            <h2 className="text-lg font-black tracking-widest uppercase">
                                {demandToEdit ? "Reprogramar Demanda" : "Lanzar Demanda"}
                            </h2>
                            <p className="text-xs text-slate-400 font-medium">Mercado Inverso B2B</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <X size={18}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-5">
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Titular (¿Qué buscas?)</label>
                        <input required type="text" placeholder="Ej: Suelo para Hotel Boutique" value={formData.title}
                            className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-slate-900"
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Zona Objetiva</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                <input required type="text" placeholder="Málaga, Madrid..." value={formData.location}
                                    className="w-full h-12 pl-10 pr-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-900"
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Presupuesto</label>
                            <div className="relative">
                                <Wallet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                <input required type="text" placeholder="Hasta 15M€" value={formData.budget}
                                    className="w-full h-12 pl-10 pr-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-900"
                                    onChange={e => setFormData({...formData, budget: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Comisión Total</label>
                            <div className="relative">
                                <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                <input required type="text" placeholder="Ej: 5%" value={formData.totalComm}
                                    className="w-full h-12 pl-10 pr-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-slate-900"
                                    onChange={e => setFormData({...formData, totalComm: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tu Reparto</label>
                            <div className="relative">
                                <Handshake size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                <input required type="text" placeholder="Ej: 50% / 50%" value={formData.split}
                                    className="w-full h-12 pl-10 pr-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-emerald-700"
                                    onChange={e => setFormData({...formData, split: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={formData.urgent} className="w-4 h-4 rounded text-red-500 focus:ring-red-500/20 cursor-pointer" 
                                onChange={e => setFormData({...formData, urgent: e.target.checked})}
                            />
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1 group-hover:text-red-600 transition-colors"><AlertCircle size={14}/> Urgente</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={formData.mandate} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600/20 cursor-pointer" 
                                onChange={e => setFormData({...formData, mandate: e.target.checked})}
                            />
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1 group-hover:text-blue-700 transition-colors"><FileSignature size={14}/> Mandato Firmado</span>
                        </label>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Detalles de la Operación</label>
                        <textarea required placeholder="Explica exactamente qué busca tu cliente inversor..." rows={4} value={formData.description}
                            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-900 resize-none"
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    <button disabled={loading} type="submit" className={`w-full h-14 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${demandToEdit ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'}`}>
                        {loading ? <Loader2 className="animate-spin" size={18}/> : (demandToEdit ? <Edit2 size={18}/> : <Megaphone size={18}/>)}
                        {loading ? "Procesando..." : (demandToEdit ? "Actualizar Demanda" : "Publicar Demanda B2B")}
                    </button>
                </form>
            </div>
        </div>
    );
}