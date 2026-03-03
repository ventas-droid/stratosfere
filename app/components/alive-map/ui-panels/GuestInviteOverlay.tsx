"use client";

import React from "react";
import { Sparkles, Heart, Search, ShieldCheck } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function GuestInviteOverlay({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60000] pointer-events-auto flex items-center justify-center p-6 animate-fade-in">
      {/* Velo oscuro */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Tarjeta Premium */}
      <div className="relative overflow-hidden w-[min(900px,calc(100vw-48px))] rounded-[34px] border border-white/20 bg-white/80 backdrop-blur-2xl p-10 shadow-[0_28px_90px_rgba(0,0,0,0.3)] animate-scale-in">
        
        {/* Brillo de fondo */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Cabecera */}
        <div className="flex items-start justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="text-[26px] font-black tracking-tight text-slate-900">
                Stratosfere <span className="text-blue-600">OS</span>.
              </div>
              <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[10px] font-black tracking-[0.28em] uppercase text-blue-700">
                  INVITACIÓN VIP
                </span>
              </div>
            </div>

            <div className="mt-5 text-[44px] leading-[1.05] font-black tracking-tight text-slate-900">
              Únete a la Élite.
            </div>

            <div className="mt-3 text-[15px] leading-relaxed text-slate-600 max-w-[50ch]">
              Tu Pase Efímero ha finalizado. Registra tu cuenta gratuita ahora y despliega todo el arsenal de herramientas de nuestro Supercaza Inmobiliario.
            </div>
          </div>

          <button onClick={onClose} className="h-11 w-11 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all flex items-center justify-center">
            ✕
          </button>
        </div>

        {/* Grid de Ventas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          
          {/* IZQUIERDA: Lo que te llevas */}
          <div className="rounded-[26px] border border-white bg-white/60 shadow-sm p-7">
            <div className="text-[10px] font-black tracking-[0.35em] uppercase text-slate-400 mb-6">
              Arsenal Desbloqueado
            </div>

            <ul className="space-y-4 text-[13px] text-slate-700 font-semibold">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Search size={14}/></div>
                <span>Buscador Inteligente Omni-Search</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500"><Heart size={14}/></div>
                <span>Bóveda de Favoritos y Nano Cards</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Sparkles size={14}/></div>
                <span>Pases exclusivos a eventos Open House</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><ShieldCheck size={14}/></div>
                <span>Contacto blindado con Agencias PRO</span>
              </li>
            </ul>
          </div>

          {/* DERECHA: El Precio (Gratis) */}
          <div className="rounded-[26px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-7 flex flex-col justify-center">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-black tracking-[0.35em] uppercase text-blue-500">Plan actual</div>
                <div className="mt-2 text-[18px] font-black text-slate-900">Explorer (Particular)</div>
              </div>
              <div className="text-right">
                <div className="text-[46px] leading-[1] font-black tracking-tight text-slate-900">0 €</div>
                <div className="mt-1 text-[10px] font-black tracking-[0.35em] uppercase text-slate-400">PARA SIEMPRE</div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              {/* SUSTITUYE '/login' POR TU RUTA REAL DE REGISTRO (ej: /sign-up, /auth, etc) */}
              <a href="/login" className="h-14 w-full rounded-[18px] bg-blue-600 text-white font-black tracking-wide transition hover:bg-blue-700 hover:scale-[1.02] active:scale-95 flex items-center justify-center shadow-lg shadow-blue-600/30">
                Crear Cuenta Gratuita
              </a>
              <button onClick={onClose} className="h-12 w-full rounded-[18px] text-slate-500 font-bold text-sm hover:text-slate-900 transition-colors">
                Volver a la vista global
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}