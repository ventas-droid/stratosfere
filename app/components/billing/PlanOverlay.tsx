// app/components/billing/PlanOverlay.tsx
"use client";

import React, { useMemo, useEffect, useState } from "react";
import { startTrialAction, getBillingGateAction } from "@/app/actions";

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
  onClose: () => void;
  userEmail?: string;
  userId?: string;
  isActive?: boolean;
};

export default function PlanOverlay({
  isOpen,
  onClose,
  userEmail,
  userId,
}: Props) {
  // ✅ Gate state
  const [gateLoading, setGateLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(true);

  // ✅ Trial state
  const [trialBusy, setTrialBusy] = useState<null | "PRO" | "AGENCY">(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res: any = await getBillingGateAction();
        if (!alive) return;

        const sp = !!res?.data?.showPaywall;
        setShowPaywall(sp);

        // ✅ Importantísimo: si NO hay paywall, cerramos para liberar el wrapper exterior si existe
        if (sp === false) {
          try {
            onClose();
          } catch {}
        }
      } catch {
        // si falla gate, dejamos showPaywall=true para que no pierdas control
        setShowPaywall(true);
      } finally {
        if (alive) setGateLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [onClose]);

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

      // ✅ cierra y recarga para que el gate desaparezca ya
      try {
        onClose();
      } catch {}
      window.location.reload();
    } finally {
      setTrialBusy(null);
    }
  };

  // ✅ Render gate
  if (!isOpen) return null;
  if (gateLoading) return null;
  if (!showPaywall) return null;

  return (
  <div
    className="fixed inset-0 z-[26000] pointer-events-auto"
    onMouseDown={(e) => e.stopPropagation()}
    onTouchStart={(e) => e.stopPropagation()}
    onClick={(e) => e.stopPropagation()}
  >
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    />

    {/* Modal */}
    <div
      className="absolute left-1/2 top-1/2 w-[min(980px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-white text-black pointer-events-auto"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-8 py-6 border-b border-black/10">
        <div>
          <div className="text-xs font-black tracking-[0.28em] text-black/50">
            BILLING / PLAN
          </div>
          <div className="text-2xl font-black tracking-tight">Activa tu acceso</div>
        </div>

        <button
          onClick={onClose}
          className="h-10 px-5 rounded-xl border border-black/15 font-black tracking-wide hover:bg-black/5"
        >
          CERRAR
        </button>
      </div>

        <div className="px-8 py-7">
          <div className="text-sm text-black/60 mb-6">
            Elige un plan para desbloquear la plataforma. Puedes cambiar o cancelar después.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  {/* ✅ Trial button (PRO + AGENCY) */}
                  {isTrialPlan && (
                    <button
                      onClick={() => startTrial(p.id === "pro" ? "PRO" : "AGENCY")}
                      disabled={trialBusy !== null}
                      className="w-full h-11 rounded-xl font-black tracking-wide border border-black bg-white text-black hover:bg-black/5 disabled:opacity-40 mb-2"
                    >
                      {busyHere ? "Activando..." : "Free trial 15 días"}
                    </button>
                  )}

                  {/* ✅ Pay button */}
                  <button
                    onClick={() => openCheckout(p.priceId)}
                    className={`w-full h-11 rounded-xl font-black tracking-wide border ${
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
            Importante: para que deje de aparecer este modal, tu webhook debe marcar tu usuario como{" "}
            <b>plan activo</b>.
          </div>
        </div>
      </div>
    </div>
  );
}
