"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { startTrialAction } from "@/app/actions";

type Plan = {
  id: string;
  name: string;
  priceLabel: string;
  priceId: string; // pri_...
  perks: string[];
  highlight?: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void; // (en STARTER/paywall NO lo usamos para que no se “salten” el gate)
  userEmail?: string;
  userId?: string;
};

type Phase = "SELECT" | "TRIAL_OK";

export default function PlanOverlay({ isOpen, onClose, userEmail, userId }: Props) {
  const [trialBusy, setTrialBusy] = useState<null | "PRO" | "AGENCY">(null);

  // ✅ Fase 2 (anuncio)
  const [phase, setPhase] = useState<Phase>("SELECT");
  const [countdown, setCountdown] = useState(5);
  const [trialPlanName, setTrialPlanName] = useState<string | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);

  // para resetear limpio cuando ABRE el modal (sin pisar TRIAL_OK)
  const prevOpenRef = useRef(false);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = isOpen;

    // ✅ al abrir (transición false->true), resetea a SELECT limpio
    if (!wasOpen && isOpen) {
      setPhase("SELECT");
      setCountdown(5);
      setTrialPlanName(null);
      setTrialEndsAt(null);
      setTrialBusy(null);
    }
  }, [isOpen]);

  const plans: Plan[] = useMemo(
    () => [
      {
        id: "starter",
        name: "Starter",
        priceLabel: "9€/mes",
        priceId: "pri_REEMPLAZA_STARTER",
        perks: ["Acceso básico", "Guardado y favoritos", "Soporte estándar"],
      },
      {
        id: "pro",
        name: "Pro",
        priceLabel: "29€/mes",
        priceId: "pri_REEMPLAZA_PRO",
        perks: ["Todo Starter", "Agency OS", "Radar + campañas", "Soporte prioritario"],
        highlight: true,
      },
      {
        id: "agency",
        name: "Agency",
        priceLabel: "79€/mes",
        priceId: "pri_REEMPLAZA_AGENCY",
        perks: ["Todo Pro", "Créditos + wallet", "Equipo / multiusuario", "Soporte premium"],
      },
    ],
    []
  );

  const openCheckout = (priceId: string) => {
    const Paddle = (window as any)?.Paddle;
    if (!Paddle?.Checkout?.open) {
      alert("Paddle.js no está cargado / inicializado todavía.");
      return;
    }

    Paddle.Checkout.open({
      settings: {
        displayMode: "overlay",
        variant: "one-page",
        theme: "light",
        successUrl: `${window.location.origin}/app?paid=1`,
      },
      items: [{ priceId, quantity: 1 }],
      ...(userEmail ? { customer: { email: userEmail } } : {}),
      customData: { uid: userId || "unknown" },
    });
  };

  const startTrial = async (planCode: "PRO" | "AGENCY") => {
    try {
      setTrialBusy(planCode);

      const res: any = await startTrialAction(planCode);
      if (!res?.success) {
        alert(res?.error || "No se pudo iniciar el trial");
        return;
      }

      // ✅ FASE 2: anuncio 5s + sin botones
      const end = res?.data?.currentPeriodEnd ? new Date(res.data.currentPeriodEnd) : null;
      setTrialEndsAt(end ? end.toISOString() : null);
      setTrialPlanName(planCode === "AGENCY" ? "Agency" : "Pro");
      setPhase("TRIAL_OK");
      setCountdown(5);
    } finally {
      setTrialBusy(null);
    }
  };

  // ✅ autocierre publicitario 5s (sin recargar / sin volver a “la puerta”)
  useEffect(() => {
    if (!isOpen) return;
    if (phase !== "TRIAL_OK") return;

    let alive = true;

    const t = setInterval(() => {
      if (!alive) return;
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    const closeT = setTimeout(() => {
      if (!alive) return;

      // ✅ AQUÍ VA EXACTAMENTE TU LÍNEA:
      // ✅ refresca plan server-truth sin recargar
      try {
        window.dispatchEvent(new CustomEvent("billing-refresh-signal"));
      } catch {}

      // ✅ No forzamos onClose aquí: tu index.tsx cerrará el modal
      // automáticamente cuando showPaywall pase a false.
      //
      // (Dejamos onClose solo por compatibilidad, pero no lo usamos para
      // evitar que se “salten” el paywall cerrando manualmente.)
    }, 5000);

    return () => {
      alive = false;
      clearInterval(t);
      clearTimeout(closeT);
    };
  }, [isOpen, phase]);

  if (!isOpen) return null;

  const lockUI = phase === "TRIAL_OK";

  const prettyEnd = (() => {
    if (!trialEndsAt) return null;
    const d = new Date(trialEndsAt);
    try {
      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return d.toISOString().slice(0, 10);
    }
  })();

  return (
    <div className="fixed inset-0 z-[26000] pointer-events-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Modal */}
      <div className="absolute left-1/2 top-1/2 w-[min(1080px,94vw)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-white text-black">
        <div className="flex items-center justify-between px-10 py-7 border-b border-black/10">
          <div>
            <div className="text-xs font-black tracking-[0.28em] text-black/50">
              BILLING / PLAN
            </div>
            <div className="text-2xl font-black tracking-tight">
              {phase === "TRIAL_OK" ? "Prueba activa" : "Activa tu acceso"}
            </div>
          </div>

          {/* ✅ No permitimos cerrar en SELECT (paywall real) */}
          <button
            onClick={() => {
              // Solo dejamos cerrar si estás en TRIAL_OK (y aun así se cierra solo)
              if (phase === "TRIAL_OK") {
                try {
                  onClose();
                } catch {}
              }
            }}
            disabled={phase !== "TRIAL_OK"}
            className="h-10 px-5 rounded-xl border border-black/15 font-black tracking-wide hover:bg-black/5 disabled:opacity-30"
            title={
              phase !== "TRIAL_OK"
                ? "Activa un trial o completa el pago para continuar"
                : "Se cerrará automáticamente"
            }
          >
            {phase === "TRIAL_OK" ? `CERRANDO (${countdown}s)` : "CERRAR"}
          </button>
        </div>

        <div className="px-10 py-8">
          {/* ✅ FASE 2 (anuncio) */}
          {phase === "TRIAL_OK" && (
            <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-6 mb-6">
              <div className="text-[11px] font-black tracking-[0.28em] text-black/55 mb-2">
                TRIAL — 15 DÍAS (MÁXIMO)
              </div>

              <div className="text-3xl font-black tracking-tight mb-2">
                Estás en la prueba máxima de Stratosfere.
              </div>

              <div className="text-sm text-black/70 leading-relaxed">
                Has activado <b>{trialPlanName || "tu plan"}</b>. Durante los próximos{" "}
                <b>15 días</b> podrás usar la plataforma. Al finalizar, eliges y activas tu
                plan de pago.
              </div>

              <div className="mt-4 text-sm text-black/60">
                {prettyEnd ? (
                  <>
                    Tu trial finaliza el <b>{prettyEnd}</b>.
                  </>
                ) : (
                  <>Tu trial ya está guardado en BD.</>
                )}
                <span className="ml-2 text-black/40">
                  Se cerrará automáticamente en {countdown}s.
                </span>
              </div>
            </div>
          )}

          {/* Texto base */}
          {phase !== "TRIAL_OK" && (
            <div className="text-sm text-black/60 mb-6">
              Elige un plan para desbloquear la plataforma. Puedes cambiar o cancelar después.
            </div>
          )}

          {/* Planes */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${lockUI ? "opacity-60" : ""}`}>
            {plans.map((p) => {
              const isTrialPlan = p.id === "pro" || p.id === "agency";
              const busyHere =
                trialBusy === (p.id === "pro" ? "PRO" : p.id === "agency" ? "AGENCY" : null);

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-5 ${
                    p.highlight ? "border-[#4F6AEE] bg-[#4F6AEE]/[0.06]" : "border-black/10"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-lg font-black">{p.name}</div>
                      <div className="text-sm font-black text-black/50">{p.priceLabel}</div>
                    </div>
                    {p.highlight && (
                      <div className="text-[10px] font-black tracking-[0.22em] text-[#4F6AEE]">
                        RECOMENDADO
                      </div>
                    )}
                  </div>

                  <ul className="text-sm text-black/70 space-y-2 mb-4">
                    {p.perks.map((x) => (
                      <li key={x} className="flex gap-2">
                        <span className="mt-[7px] h-[6px] w-[6px] rounded-full bg-black/40" />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Trial */}
                  {isTrialPlan && (
                    <button
                      onClick={() => startTrial(p.id === "pro" ? "PRO" : "AGENCY")}
                      disabled={lockUI || trialBusy !== null}
                      className="w-full h-11 rounded-xl font-black tracking-wide border border-black bg-white text-black hover:bg-black/5 disabled:opacity-40 mb-2"
                    >
                      {busyHere ? "Activando..." : "Free trial 15 días"}
                    </button>
                  )}

                  {/* Pago */}
                  <button
                    onClick={() => openCheckout(p.priceId)}
                    disabled={lockUI}
                    className={`w-full h-11 rounded-xl font-black tracking-wide border disabled:opacity-40 ${
                      p.highlight
                        ? "bg-[#4F6AEE] text-white border-[#4F6AEE]"
                        : "bg-black text-white border-black"
                    }`}
                  >
                    CONTINUAR CON PAGO
                  </button>

                  <div className="text-[11px] text-black/45 mt-3">
                    Checkout seguro gestionado por Paddle (merchant of record).
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-[12px] text-black/45">
            Sistema SaaS (server-truth): el trial y su fecha fin se guardan en BD
            (Subscription.currentPeriodEnd).
          </div>
        </div>
      </div>
    </div>
  );
}
