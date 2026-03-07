import React, { useState, useEffect } from 'react';
import { Crown, MapPin, Phone, Mail, Globe, ArrowRight, ShieldCheck } from 'lucide-react';

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

            {/* 2. LA TARJETA BLACK CARD */}
            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-500 pointer-events-none group-hover:pointer-events-auto flex flex-col items-center w-[320px] cursor-default">
                
                {/* 🔥 EL PUENTE INVISIBLE DE CRISTAL 🔥 */}
                {/* Este bloque transparente une el pin con la tarjeta. Al pasar el ratón por aquí, el menú no se cierra. */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-24 h-10 bg-transparent cursor-pointer"></div>

                <div className="bg-slate-950/95 backdrop-blur-xl border border-amber-500/50 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] w-full flex flex-col relative overflow-hidden">
                    
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700 via-yellow-400 to-amber-700"></div>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-500/20 rounded-md">
                                <Crown size={14} className="text-amber-400" />
                            </div>
                            <span className="text-[10px] font-black text-amber-400 tracking-[0.2em] uppercase">Vanguard VIP</span>
                        </div>
                        {targetCP && (
                            <span className="bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 text-[10px] px-2.5 py-1 rounded-sm font-black tracking-widest shadow-lg">
                                CP {targetCP}
                            </span>
                        )}
                    </div>

                    <div className="relative z-10 mb-4 text-center">
                        <h3 className="text-white font-black text-xl leading-tight truncate tracking-tight">
                            {agency.companyName || agency.name || "Agencia VIP"}
                        </h3>
                        <p className="text-amber-400/80 text-[11px] mt-1.5 tracking-widest uppercase truncate font-semibold">
                            Agencia Exclusiva en {cityName || 'Cargando...'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 relative z-10">
                        <div className="flex items-start gap-3 text-white/80 text-xs bg-white/5 p-2.5 rounded-lg border border-white/5">
                            <MapPin size={16} className="shrink-0 mt-0.5 text-amber-500" />
                            <div className="flex flex-col">
                                {agency.address && (
                                    <span className="leading-relaxed font-medium text-white/80">
                                        {agency.address}
                                    </span>
                                )}
                                <span className="font-bold text-white uppercase tracking-wider mt-0.5 text-[10px]">
                                    {cityName || `C.P. ${targetCP}`}
                                </span>
                            </div>
                        </div>
                        
                        {(displayPhone || agency.email) && (
                            <div className="grid grid-cols-1 gap-2">
                                {displayPhone && (
                                    <div className="flex items-center gap-3 text-white/80 text-xs bg-white/5 p-2.5 rounded-lg border border-white/5">
                                        <Phone size={16} className="shrink-0 text-amber-500" />
                                        <span className="font-bold tracking-wide">{displayPhone}</span>
                                    </div>
                                )}
                                {agency.email && (
                                    <div className="flex items-center gap-3 text-white/80 text-xs bg-white/5 p-2.5 rounded-lg border border-white/5">
                                        <Mail size={16} className="shrink-0 text-amber-500" />
                                        <span className="truncate font-medium">{agency.email}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {agency.website && (
                            <a 
                                href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()} 
                                className="flex items-center justify-center gap-2 text-amber-400 text-xs bg-amber-500/10 hover:bg-amber-500/20 p-2.5 rounded-lg border border-amber-500/20 mt-1 transition-colors relative z-20"
                            >
                                <Globe size={14} className="shrink-0" />
                                <span className="truncate font-bold tracking-wide">{agency.website.replace(/^https?:\/\//, '')}</span>
                            </a>
                        )}
                    </div>

                    <div className="mt-3 bg-indigo-900/30 border border-indigo-500/30 p-2 rounded-lg flex items-center justify-center gap-2 relative z-10 shadow-inner">
                        <ShieldCheck size={14} className="text-indigo-400 shrink-0" />
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-bold text-indigo-300/70 uppercase tracking-widest leading-none mb-0.5">Licencia Certificada Stratosfere</span>
                            <span className="text-[11px] font-mono font-black text-indigo-400 tracking-[0.1em] leading-none">{licenseKey}</span>
                        </div>
                    </div>

                    {/* 🔥 BOTÓN INFERIOR DE REDIRECCIÓN 🔥 */}
                    <div 
                        onClick={fireMarketPanel}
                        className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-white/40 hover:text-amber-400 transition-colors cursor-pointer group/btn relative z-20"
                    >
                        <span className="text-[10px] font-black tracking-widest uppercase">Click para ver propiedades</span>
                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                </div>

                <div className="relative z-10 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-amber-500/50 mt-[1px]"></div>
            </div>
        </div>
    );
}