"use client";

import React, { useState } from "react";
import { X, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { useMyPlan } from "../../billing/useMyPlan";

const AGENCY_PLAN = {
  id: "agency-pro",
  name: "Agency SF PRO",
  price: "49,90",
  period: "€/mes",
  desc: "La infraestructura profesional para operar como agencia.",
  features: [
    "Agency OS + Radar",
    "Campañas y captación avanzada",
    "Equipo / multiusuario",
    "Herramientas pro de control y seguimiento",
  ],
};

export default function AgencyMarketPanel({ isOpen, onClose }: any) {
  // ✅ OJO: useMyPlan devuelve { plan: BillingGate, isActive, loading }
  const { plan: gate, isActive, loading } = useMyPlan();

  // ✅ Normalizamos
  const planCode = String((gate as any)?.plan || "").toUpperCase();         // "AGENCY" | "PRO" | "STARTER"
  const status = String((gate as any)?.status || "").toUpperCase();         // "TRIAL" | "GRACE" | "ACTIVE" | "BLOCKED" | ...
  const trialEndsAt = (gate as any)?.trialEndsAt ?? null;                   // ISO string | null

  const [confirming, setConfirming] = useState(false);

  if (!isOpen) return null;

  const isAgency = planCode === "AGENCY";
  const isTrial = status === "TRIAL" || status === "GRACE";
  const isPaid = status === "ACTIVE";

  const handlePurchase = () => {
    setConfirming(true);

    // ✅ Aquí más adelante conectas Mollie (paso siguiente).
    // Tras pagar, backend pondrá status="ACTIVE" y luego:
    try {
      window.dispatchEvent(new CustomEvent("billing-refresh-signal"));
    } catch {}

    setTimeout(() => {
      setConfirming(false);
      onClose?.();
    }, 700);
  };

  return (
    <div className="fixed inset-y-0 left-0 w-full md:w-[460px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left">
      {/* Fondo Cupertino */}
      <div className="absolute inset-0 bg-[#F5F5F7]/95 backdrop-blur-2xl border-r border-black/5" />

      <div className="relative z-10 flex flex-col h-full text-slate-900">
        {/* CABECERA */}
        <div className="px-8 pt-10 pb-6 bg-white/60 backdrop-blur-md border-b border-black/5">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-black tracking-tight">Suscripción</h1>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4F6AEE]">
              Stratos Business
            </span>
            <span className="text-xs text-black/40">Seleccione su nivel operativo</span>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
          {/* ESTADO ACTUAL */}
          <div className="rounded-2xl bg-white border border-black/5 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-black/40 font-bold">
                Estado actual
              </div>

              <div className="text-sm font-black">
                {!isAgency ? (
                  "Cuenta Gratuita"
                ) : isPaid ? (
                  "Agency SF PRO"
                ) : isTrial ? (
                  "Agency SF PRO · Free trial"
                ) : (
                  "Acceso bloqueado"
                )}
              </div>

              {isAgency && isTrial && (
                <div className="mt-1 text-[11px] text-black/45">
                  {status === "GRACE" ? "Últimas 24h de gracia" : "Trial activo"}{" "}
                  {trialEndsAt ? "· con cuenta atrás en el popup" : ""}
                </div>
              )}
            </div>
          </div>
{/* ✅ ESPACIO EXTRA (esto es lo que realmente la baja) */}
<div className="h-6" />
          {/* TARJETA PRINCIPAL */}
          <div className="rounded-[28px] p-6 bg-black text-white shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/60 font-bold">
                  {isAgency
                    ? isPaid
                      ? "Licencia activa"
                      : status === "GRACE"
                      ? "Últimas 24h"
                      : "Free trial · 15 días"
                    : "Plan disponible para agencias"}
                </div>

                <h2 className="text-xl font-black mt-1">{AGENCY_PLAN.name}</h2>
              </div>

              {!isPaid && (
                <div className="text-right">
                  <div className="text-2xl font-black">{AGENCY_PLAN.price}€</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/50">
                    {AGENCY_PLAN.period}
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-white/80 mb-6 leading-relaxed">
              Operativa real para agencias: control, velocidad y equipo.
            </p>

            <div className="space-y-3">
              {AGENCY_PLAN.features.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center">
                    <Check size={10} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-bold tracking-wide">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        {isAgency && !isPaid && (
          <div className="px-8 pb-8">
            <div className="rounded-2xl bg-white border border-black/5 p-4 flex items-center justify-between shadow-lg">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-black/40 font-bold">
                  Total
                </div>
                <div className="text-lg font-black">{AGENCY_PLAN.price}€</div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={confirming || loading}
                className="h-11 px-8 rounded-xl bg-black text-white font-black tracking-wide flex items-center gap-2 hover:bg-black/80 active:scale-95 transition-all disabled:opacity-50"
              >
                {confirming ? "Procesando…" : "Activar ahora"}
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="mt-3 text-[11px] text-black/40 text-center">
              Sin permanencia · Cancela cuando quieras · IVA incl.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
