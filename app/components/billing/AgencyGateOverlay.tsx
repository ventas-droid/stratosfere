"use client";

import React from "react";
import { useMyPlan } from "./useMyPlan";

type Props = {
  enabled: boolean;                 // systemMode === "AGENCY"
  pricingHref?: string;             // fallback si aún no hay pasarela Mollie
  landingHref?: string;             // landing corporativa
};

const EVERY_MS = 5 * 60 * 1000; // 5 minutos
const DAY_MS = 24 * 60 * 60 * 1000;

function safeTime(v?: string | null) {
  if (!v) return null;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : null;
}

function formatCountdown(ms: number) {
  if (!ms || ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const hh = h % 24;
    return `${d}d ${pad(hh)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function AgencyGateOverlay({
  enabled,
  pricingHref = "/pricing",
  landingHref = "/",
}: Props) {
const { plan, isActive, loading } = useMyPlan();

  // reloj para countdown
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!enabled) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [enabled]);

  // status server (si no viene, inferimos)
  const rawStatus = String(plan?.status || "").toUpperCase();
  const inferredStatus =
    plan?.showPaywall ? "BLOCKED" : rawStatus || "TRIAL"; // fallback

  const status = inferredStatus as "TRIAL" | "GRACE" | "BLOCKED" | "ACTIVE" | "NONE";

  const isBlocked = Boolean(plan?.showPaywall) || status === "BLOCKED";
  const isNudge = !isBlocked && (status === "TRIAL" || status === "GRACE");

  // apertura/cierre del popup
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) {
      setOpen(false);
      return;
    }
    if (loading) return;
    if (!plan) return;

    // BLOCKED = siempre abierto (no se puede cerrar)
    if (isBlocked) {
      setOpen(true);
      return;
    }

    // TRIAL/GRACE = abre al entrar + cada 5 min
    if (isNudge) {
      setOpen(true);
      const id = setInterval(() => setOpen(true), EVERY_MS);
      return () => clearInterval(id);
    }

    // ACTIVE/NONE = nada
    setOpen(false);
  }, [enabled, loading, plan, isBlocked, isNudge]);

  // countdown (TRIAL hasta trialEndsAt, GRACE hasta trialEndsAt + 24h)
  const trialEnds = safeTime(plan?.trialEndsAt ?? null);
  const graceEnds = trialEnds ? trialEnds + DAY_MS : null;

  const remainingMs =
    status === "TRIAL" && trialEnds ? Math.max(0, trialEnds - now) :
    status === "GRACE" && graceEnds ? Math.max(0, graceEnds - now) :
    0;

  const countdown = formatCountdown(remainingMs);

  if (!enabled || loading || !plan || !open) return null;

  const onPay = () => {
    // Paso 4 conectamos Mollie aquí.
    // De momento: llevar al pricing/market para comprar.
    window.location.href = pricingHref;
  };

  const onClose = () => {
    if (isBlocked) {
      // BLOCKED: cerrar => landing corporativa
      window.location.href = landingHref;
    } else {
      // TRIAL/GRACE: cerrar solo oculta hasta el próximo recordatorio
      setOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[27000] pointer-events-auto">
      {/* Velo negro SOLO en BLOCKED (tu requisito) */}
      {isBlocked && <div className="absolute inset-0 bg-black/60" />}

      {/* Popup centrado */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold tracking-widest text-black/50">
                {isBlocked ? "ACCESO BLOQUEADO" : status === "GRACE" ? "ÚLTIMAS 24H" : "FREE TRIAL"}
              </div>

              <div className="mt-1 text-xl font-black text-black">
                Agency SF PRO — 49,90 €/mes
              </div>

              {!isBlocked && (
                <div className="mt-2 text-sm text-black/70">
                  Tiempo restante: <span className="font-black">{countdown}</span>
                </div>
              )}

              {isBlocked && (
                <div className="mt-2 text-sm text-black/70">
                  Para continuar, activa la suscripción.
                </div>
              )}
            </div>

            {/* X solo si NO es blocked */}
            {!isBlocked && (
              <button
                onClick={() => setOpen(false)}
                className="h-9 w-9 rounded-full bg-black/5 text-black"
                aria-label="Cerrar"
              >
                ✕
              </button>
            )}
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={onPay}
              className="flex-1 h-11 rounded-xl bg-black text-white font-black tracking-wide"
            >
              PAGAR 49,90 €
            </button>

            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-black/15 bg-white text-black font-black tracking-wide"
            >
              CERRAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
