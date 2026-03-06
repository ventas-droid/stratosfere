"use client";
import React, { useState } from 'react';
import { Crown, X, MapPin, Target, Zap, Shield, CheckCircle2, Loader2, Send } from 'lucide-react';
// 🔥 IMPORTAMOS LA ACCIÓN
import { createVanguardRequestAction } from '@/app/actions-zones';

export default function VanguardRequestModal({ 
    isOpen, 
    onClose, 
    agencyData, 
    propertiesCount = 0, 
    fireCount = 0 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    agencyData: any, 
    propertiesCount?: number, 
    fireCount?: number 
}) {
    const [targetZone, setTargetZone] = useState("");
    const [phone, setPhone] = useState(agencyData?.mobile || agencyData?.phone || "");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // 🔥 EMPAQUETAMOS EXACTAMENTE LO QUE PIDE SU SERVIDOR
        const payload = {
            targetZone: targetZone,
            phone: phone,
            agencyId: agencyData?.id || "ID_DESCONOCIDO",
            agencyEmail: agencyData?.email || "sin_email@stratosfere.com",
            agencyName: agencyData?.name || agencyData?.companyName || "Agencia VIP",
            agencyDataSnapshot: {
                ...agencyData,
                totalProps: propertiesCount,
                fireProps: fireCount
            }
        };

        // Disparamos al servidor
        const res = await createVanguardRequestAction(payload);

        setLoading(false);
        if (res?.success) {
            setSuccess(true);
            setTimeout(() => { onClose(); setSuccess(false); }, 4000);
        } else {
            alert("Error al enviar la petición. Inténtelo de nuevo.");
        }
    };

    return (
        <div className="fixed inset-0 z-[60000] flex items-center justify-center p-4 animate-fade-in pointer-events-auto">
            {/* Fondo borroso */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>

            {/* Modal Principal */}
            <div className="relative bg-[#0A0A0B] border border-white/10 w-full max-w-2xl rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col md:flex-row">
                
                {/* COLUMNA IZQUIERDA: EL PITCH DE VENTAS */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-amber-900/40 to-black p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] mb-6">
                        <Crown size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight mb-2">Vanguard Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Network</span></h2>
                    <p className="text-white/60 text-sm mb-6 leading-relaxed">Lidere un código postal en exclusiva. Nuestro <strong className="text-white">Growth Team</strong> diseñará una estrategia a medida para su agencia.</p>
                    
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <MapPin size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-white/80"><strong className="text-white">Liderazgo de Zona:</strong> Exclusividad total en su código postal objetivo.</p>
                        </li>
                        <li className="flex items-start gap-3">
                            <Zap size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-white/80"><strong className="text-white">Radar VIP:</strong> Atracción de tráfico mediante gatillos visuales en el mapa 3D.</p>
                        </li>
                        <li className="flex items-start gap-3">
                            <Shield size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-white/80"><strong className="text-white">Leads Fantasma:</strong> Alertas silenciosas de ROI directo a su panel de control.</p>
                        </li>
                    </ul>
                </div>

                {/* COLUMNA DERECHA: EL FORMULARIO */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-[#0F0F11]">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all">
                        <X size={16} />
                    </button>

                    {success ? (
                        <div className="text-center animate-fade-in-up">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                                <CheckCircle2 size={32} className="text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">Petición Recibida</h3>
                            <p className="text-white/60 text-sm">Nuestro equipo de estrategia analizará la viabilidad de la zona y le contactará en menos de 24h.</p>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Target size={18} className="text-amber-500"/> Solicitar Estudio de Zona</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5">Código Postal Objetivo</label>
                                    <input 
                                        type="text" 
                                        value={targetZone} 
                                        onChange={(e) => setTargetZone(e.target.value)} 
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm font-medium" 
                                        placeholder="Ej: 29692" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5">Teléfono Directo (CEO / Manager)</label>
                                    <input 
                                        type="tel" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)} 
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm font-medium" 
                                        placeholder="+34 600 000 000" 
                                        required 
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                                >
                                    {loading ? <><Loader2 size={16} className="animate-spin" /> Transmitiendo...</> : <><Send size={16} /> Solicitar Estrategia VIP</>}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}