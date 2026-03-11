import React, { useState, useEffect } from 'react';
import { Crown, MapPin, Phone, Mail, Globe, ArrowRight, ShieldCheck, X } from 'lucide-react';

export default function VipAgencyMarker({ agency, onClick }: { agency: any, onClick: () => void }) {
    const displayPhone = agency.mobile || agency.phone;
    const targetCP = agency.targetZone || agency.postalCode;
    
    const [cityName, setCityName] = useState<string>(agency.city || "");

    useEffect(() => {
        if (agency.city) {
            setCityName(agency.city);
            return;
        }

        if (!targetCP) {
            setCityName("Zona Desconocida");
            return;
        }

        const cachedCity = sessionStorage.getItem(`geo_cp_${targetCP}`);
        if (cachedCity) {
            setCityName(cachedCity);
            return;
        }

        fetch(`https://api.zippopotam.us/es/${targetCP}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.places && data.places.length > 0) {
                    const realCity = data.places[0]["place name"];
                    setCityName(realCity);
                    sessionStorage.setItem(`geo_cp_${targetCP}`, realCity);
                } else {
                    setCityName(`C.P. ${targetCP}`);
                }
            })
            .catch(() => setCityName(`C.P. ${targetCP}`));
    }, [agency.city, targetCP]);

    const licenseKey = agency.id ? `SF-PRO-${String(agency.id).slice(-6).toUpperCase()}` : 'SF-PRO-VIP';

    // 🔥 DOBLE GATILLO DE FUERZA BRUTA (Bloquea interferencias del mapa)
    const fireMarketPanel = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Evita que Mapbox se trague el clic
        
        // 1. Ordenamos a la cámara que vuele hacia el objetivo
        if (onClick) onClick();

        // 2. Disparamos DOBLE BENGALA para despertar al Cerebro Central
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('open-market-panel', { detail: agency }));
            // Disparo táctico secundario por si el primero falla
            window.dispatchEvent(new CustomEvent('edit-market-signal', { detail: agency }));
        }
    };

    return (
        <div 
            onClick={fireMarketPanel}
            onPointerDown={(e) => e.stopPropagation()} // Blindaje extra contra el motor 3D
            className="group relative cursor-pointer z-[40] flex items-center justify-center transition-all duration-500 hover:z-[60]"
        >
            {/* 1. EL PIN FÍSICO */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-[3px] shadow-[0_0_25px_rgba(245,158,11,0.6)] group-hover:shadow-[0_0_40px_rgba(245,158,11,0.9)] group-hover:scale-110 transition-all duration-300">
                <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden relative z-10">
                    {agency.companyLogo || agency.avatar ? (
                        <img 
                            src={agency.companyLogo || agency.avatar} 
                            alt="Logo" 
                            className="w-full h-full object-cover rounded-full scale-105" 
                        />
                    ) : (
                        <Crown size={28} className="text-amber-500" />
                    )}
                </div>
            </div>

   {/* 2. LA TARJETA BLACK CARD (FOTO TIPO DNI + C.P. DIRECTO) */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 pointer-events-none group-hover:pointer-events-auto flex flex-col items-center cursor-default z-50">
                
                {/* 🔥 EL PUENTE INVISIBLE DE CRISTAL 🔥 */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-28 h-8 bg-transparent cursor-pointer"></div>

                {/* CONTENEDOR PRINCIPAL RECALIBRADO (w-[360px]) */}
                <div className="bg-slate-950/95 backdrop-blur-xl border border-amber-500/40 p-1.5 rounded-[18px] shadow-[0_15px_40px_rgba(0,0,0,0.8)] w-[360px] flex flex-col relative overflow-hidden">
                    
                    {/* Efectos de luz premium */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-700 via-yellow-400 to-amber-700"></div>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                    {/* CUERPO DE LA TARJETA: 2 COLUMNAS */}
                    <div className="flex gap-1.5 relative z-10">
                        
                        {/* COLUMNA IZQUIERDA: AVATAR DNI GIGANTE (45%) */}
                        <div className="w-[45%] bg-slate-900/50 rounded-xl p-3 flex flex-col items-center justify-center border border-white/5 text-center relative overflow-hidden">
                            {/* Corona de fondo decorativa */}
                            <Crown size={100} className="absolute text-amber-500/5 rotate-12 -right-3 -bottom-3 pointer-events-none" />
                            
                            {/* 🔥 LOGO TIPO DNI (Sin caja dentro de caja, full cover) 🔥 */}
                            <div className="w-20 h-20 mb-3 rounded-xl border-2 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.3)] bg-slate-950 flex items-center justify-center shrink-0 overflow-hidden">
                                {agency.companyLogo || agency.avatar ? (
                                    <img src={agency.companyLogo || agency.avatar} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Crown size={36} className="text-amber-500" />
                                )}
                            </div>

                            <div className="mb-2">
                                <span className="px-2 py-1 rounded-sm text-[8px] font-black tracking-[0.25em] uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 leading-none shadow-sm">
                                    Vanguard VIP
                                </span>
                            </div>

                            <h3 className="text-white font-black text-[15px] leading-tight tracking-tight w-full truncate px-1">
                                {agency.companyName || agency.name || "Agencia VIP"}
                            </h3>
                        </div>

                        {/* COLUMNA DERECHA: DATOS CLAROS Y DIRECTOS (55%) */}
                        <div className="w-[55%] flex flex-col justify-center gap-1.5 p-1">
                            
                            {/* Dirección + Ciudad */}
                            {agency.address && (
                                <div className="flex items-center gap-2 text-white/90 text-[11px] bg-white/5 px-2.5 py-2.5 rounded-lg border border-white/5">
                                    <MapPin size={14} className="shrink-0 text-amber-500" />
                                    <span className="truncate font-medium">{agency.address}{cityName ? `, ${cityName}` : ''}</span>
                                </div>
                            )}
                            
                            {/* Teléfono Solitario y Gigante */}
                            {displayPhone && (
                                <div className="flex items-center justify-center gap-2.5 text-white text-[12px] bg-white/5 px-3 py-2.5 rounded-lg border border-white/5">
                                    <Phone size={14} className="shrink-0 text-amber-500" />
                                    <span className="font-black tracking-widest">{displayPhone}</span>
                                </div>
                            )}

                            {/* Website */}
                            {agency.website && (
                                <a 
                                    href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()} 
                                    className="flex items-center justify-center gap-1.5 text-amber-400 text-[10px] bg-amber-500/10 hover:bg-amber-500/20 px-2 py-2 rounded-lg border border-amber-500/20 transition-colors"
                                >
                                    <Globe size={12} className="shrink-0" />
                                    <span className="truncate font-bold tracking-wider uppercase">{agency.website.replace(/^https?:\/\//, '')}</span>
                                </a>
                            )}

                            {/* Licencia Inferior */}
                            <div className="mt-0.5 bg-indigo-950/40 border border-indigo-500/30 py-1.5 px-2.5 rounded-lg flex items-center justify-between gap-1 shadow-inner">
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck size={12} className="text-indigo-400 shrink-0" />
                                    <span className="text-[7px] font-bold text-indigo-300/70 uppercase tracking-widest leading-none mt-[1px]">Licencia Stratosfere</span>
                                </div>
                                <span className="text-[8.5px] font-mono font-black text-indigo-400 tracking-[0.1em] leading-none mt-[1px]">{licenseKey}</span>
                            </div>

                        </div>
                    </div>

                    {/* 🔥 FALDÓN DE AUTORIDAD: DIRECTO AL GRANO 🔥 */}
                    <div 
                        onClick={fireMarketPanel}
                        className="mt-1.5 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/15 rounded-xl py-2 px-3 flex items-center justify-center text-amber-400 transition-all cursor-pointer group/btn relative z-20 shadow-inner"
                    >
                        <span className="text-[11px] font-black tracking-[0.2em] uppercase truncate">
                           Agencia de Referencia en  C.P: {targetCP || 'NO ASIGNADO'}
                        </span>
                    </div>

                </div>

                {/* Piquito inferior */}
                <div className="relative z-10 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-amber-500/40 mt-[1px]"></div>
            </div>
            
        </div>
    );
}