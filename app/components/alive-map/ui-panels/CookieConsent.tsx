"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Al aterrizar, el radar busca si ya nos dio permiso antes
        const consent = localStorage.getItem('stratos_cookie_consent');
        if (!consent) {
            // Si es nuevo, esperamos 1.5 segundos para no agobiarle nada más entrar
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        // Registramos el permiso en su ordenador y desaparecemos
        localStorage.setItem('stratos_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 z-[9999] max-w-sm w-[calc(100%-3rem)] animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-5 shadow-2xl overflow-hidden relative">
                {/* Reflejo táctico de fondo */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-start gap-4 relative z-10">
                    <div className="bg-white/10 p-2 rounded-xl text-indigo-400 shrink-0">
                        <ShieldCheck size={20} />
                    </div>
                    
                    <div className="flex-1">
                        <h3 className="text-white text-sm font-bold mb-1 tracking-tight">Seguridad y Cookies</h3>
                        <p className="text-slate-400 text-xs leading-relaxed mb-4">
                            Utilizamos cookies esenciales para garantizar la operatividad y encriptación de tu sesión en Stratosfere.
                        </p>
                        
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={acceptCookies}
                                className="bg-white text-black hover:bg-slate-200 transition-colors text-xs font-bold px-5 py-2 rounded-lg cursor-pointer"
                            >
                                Entendido
                            </button>
                            <a 
    href="/privacy" 
    className="text-xs text-slate-500 hover:text-white transition-colors cursor-pointer"
>
    Leer más
</a>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsVisible(false)}
                        className="text-slate-500 hover:text-white transition-colors shrink-0 cursor-pointer"
                        title="Cerrar"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}