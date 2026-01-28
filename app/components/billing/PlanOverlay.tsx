"use client";

import React from "react";
import { useMyPlan } from "./useMyPlan";
import { startAgencyPayment } from "./startAgencyPayment";

type Props = {
  // ✅ IMPORTANTÍSIMO: esto lo pasaremos desde UIPanels
  // enabled = systemMode === "AGENCY"
  enabled: boolean;

  // rutas fallback
  pricingHref?: string; // donde llevará el botón "PAGAR" (de momento)
  landingHref?: string; // donde mandas si está BLOCKED y cierra

  // (compat) no lo usamos, pero lo dejamos para no romper imports antiguos
  userEmail?: string;
  userId?: string;
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

export default function PlanOverlay({
  enabled,
  pricingHref = "/pricing",
  landingHref = "/",
}: Props) {
  const { plan, loading } = useMyPlan();

  // ⏱ reloj para countdown
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!enabled) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [enabled]);

  // normalizamos status
  const rawStatus = String((plan as any)?.status || "").toUpperCase();
  const showPaywall = Boolean((plan as any)?.showPaywall);

  // trialEndsAt lo trae getBillingGateAction
  const trialEnds = safeTime((plan as any)?.trialEndsAt ?? null);

  // infer GRACE client-side (por si acaso)
  const inGrace =
    rawStatus === "EXPIRED" &&
    trialEnds != null &&
    Date.now() < trialEnds + DAY_MS;

  const status = ((): "TRIAL" | "GRACE" | "BLOCKED" | "ACTIVE" | "NONE" => {
    if (showPaywall) return "BLOCKED";
    if (rawStatus === "TRIAL") return "TRIAL";
    if (rawStatus === "GRACE") return "GRACE";
    if (inGrace) return "GRACE";
    if (rawStatus === "EXPIRED") return "BLOCKED"; // fallback
    if (rawStatus === "ACTIVE") return "ACTIVE";
    return "NONE";
  })();

  const isBlocked = status === "BLOCKED";
  const isNudge = status === "TRIAL" || status === "GRACE";

  // apertura/cierre del popup
  const [open, setOpen] = React.useState(false);
const dismissedUntilRef = React.useRef<number>(0);

  React.useEffect(() => {
  if (!enabled) {
    setOpen(false);
    return;
  }
  if (loading) return;
  if (!plan) return;

  // BLOCKED = siempre abierto
  if (isBlocked) {
    setOpen(true);
    return;
  }

  // TRIAL/GRACE = se puede cerrar, y no reabre hasta pasado EVERY_MS
  if (isNudge) {
    const now = Date.now();

    // si el usuario lo cerró hace poco, mantenlo cerrado aunque plan refresque
    if (dismissedUntilRef.current && now < dismissedUntilRef.current) {
      setOpen(false);
    } else {
      setOpen(true);
    }

    const id = setInterval(() => {
      const t = Date.now();
      if (!dismissedUntilRef.current || t >= dismissedUntilRef.current) {
        setOpen(true);
      }
    }, EVERY_MS);

    return () => clearInterval(id);
  }

  // ACTIVE/NONE = nada
  setOpen(false);
}, [enabled, loading, plan, isBlocked, isNudge]);


  // countdown
  const graceEnds = trialEnds ? trialEnds + DAY_MS : null;

  const remainingMs =
    status === "TRIAL" && trialEnds ? Math.max(0, trialEnds - now)
      : status === "GRACE" && graceEnds ? Math.max(0, graceEnds - now)
      : 0;

  const countdown = formatCountdown(remainingMs);

  const onPay = async () => {
  try {
    await startAgencyPayment(); // hace fetch a /api/mollie/create-payment y redirige a checkoutUrl
  } catch (e) {
    console.error(e);
    alert("No se pudo iniciar el pago");
  }
};

const onClose = () => {
  if (isBlocked) {
    // BLOCKED: cerrar => landing
    window.location.href = landingHref;
  } else {
    // TRIAL/GRACE: cerrar => silenciar 5 min
    dismissedUntilRef.current = Date.now() + EVERY_MS;
    setOpen(false);
  }
};

// ✅ AQUÍ (JUSTO AQUÍ)
if (!enabled || loading || !plan || !open) return null;
 return (
 
    <div
    className={`fixed inset-0 z-[27000] ${
      isBlocked ? "pointer-events-auto" : "pointer-events-none"
    }`}
  >
    {/* Velo negro SOLO en BLOCKED */}
    {isBlocked && <div className="absolute inset-0 bg-black/60" />}

    {/* Popup centrado */}
    <div className="absolute inset-0 flex items-center justify-center p-6">
      {/* ✅ Tarjeta clicable */}
      <div
       className="
  pointer-events-auto relative overflow-hidden
  w-[min(1040px,calc(100vw-48px))]
  rounded-[34px]
  border border-white/50 ring-1 ring-black/5
  bg-white/70 backdrop-blur-2xl
  p-10
  shadow-[0_28px_90px_rgba(0,0,0,0.18)]
"

      >
        {/* Accent sutil (cupertino) */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[#2F6BFF]/10 blur-3xl" />

        {/* Header */}
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            {/* LOGO (texto) */}
            <div className="flex items-center gap-3">
              <div className="text-[26px] font-black tracking-tight text-black">
                Stratosfere <span className="text-black">OS</span>
                <span className="text-black">.</span>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-[#2F6BFF]" />
                <span className="text-[10px] font-black tracking-[0.28em] uppercase text-black/45">
                  {isBlocked
                    ? "ACCESO BLOQUEADO"
                    : status === "GRACE"
                    ? "ÚLTIMAS 24H"
                    : "FREE TRIAL · 15 DÍAS"}
                </span>
              </div>
            </div>

            <div className="mt-5 text-[44px] leading-[1.05] font-black tracking-tight text-black">
              Agency SF PRO
            </div>

            <div className="mt-3 text-[15px] leading-relaxed text-black/70 max-w-[62ch]">
              Radar, campañas y operativa real de agencia. Activa tu licencia y trabaja con
              velocidad, control y consistencia.
            </div>
          </div>


{/* X (siempre visible): BLOCKED => onClose manda a landing, TRIAL/GRACE => cierra popup */}
<button
  onClick={onClose}
  aria-label="Cerrar"
  className="
    h-11 w-11 rounded-full
    bg-black/5 text-black/70
    border border-black/10
    backdrop-blur-md
    transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)]
    hover:bg-black/10 hover:text-black hover:border-black/15
    hover:rotate-90
    active:rotate-180 active:scale-95
    focus:outline-none focus:ring-4 focus:ring-black/10
    flex items-center justify-center
  "
>
  <span className="text-[18px] leading-none">✕</span>
</button>


          
        </div>

        {/* Main grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: Countdown */}
          {!isBlocked ? (
            <div className="rounded-[26px] border border-black/10 bg-[#F3F4F6] p-7">
              <div className="text-[10px] font-black tracking-[0.35em] uppercase text-black/40">
                Tu acceso expira en:
              </div>

              {/* ✅ RELOJ (no se monta) */}
              <div className="mt-3 font-black tracking-tight text-black tabular-nums whitespace-nowrap leading-[0.92]">
<span className="block text-[clamp(38px,4.4vw,56px)] leading-none font-black tracking-[-0.03em] tabular-nums">
  {countdown}
</span>

              </div>

              <div className="mt-4 text-[13px] text-black/65 font-semibold">
                Te recomendamos activar antes de que termine el trial para no cortar la operativa.
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full bg-white border border-black/10 text-[11px] font-bold text-black/60">
                  Sin permanencia
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white border border-black/10 text-[11px] font-bold text-black/60">
                  Cancelación flexible
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white border border-black/10 text-[11px] font-bold text-black/60">
                  IVA incluido
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-[26px] border border-black/10 bg-[#F3F4F6] p-7">
              <div className="text-[10px] font-black tracking-[0.35em] uppercase text-black/40">
                Acción requerida
              </div>
              <div className="mt-3 text-[18px] font-black text-black">
                Tu acceso está bloqueado
              </div>
              <div className="mt-2 text-[14px] text-black/70 font-semibold">
                Para continuar, activa la suscripción.
              </div>
            </div>
          )}

          {/* RIGHT: Plan + Price + Bullets */}
          <div className="rounded-[26px] border border-black/10 bg-white p-7">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-[10px] font-black tracking-[0.35em] uppercase text-black/40">
                  Suscripción mensual
                </div>
                <div className="mt-2 text-[14px] font-black text-black">
                  Agency SF PRO
                </div>
                <div className="mt-1 text-[12px] text-black/55 font-semibold">
                  Licencia operativa para agencias.
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-end justify-end gap-1">
                  <span className="text-[46px] leading-[1] font-black tracking-tight text-black">
                    49,90
                  </span>
                  <span className="text-[18px] font-black text-black">€</span>
                </div>
                <div className="mt-1 text-[10px] font-black tracking-[0.35em] uppercase text-black/40">
                  / mes
                </div>
              </div>
            </div>

            <div className="mt-6 h-px w-full bg-black/10" />

            <ul className="mt-6 space-y-3 text-[13px] text-black/70 font-semibold">
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-[#2F6BFF]" />
                <span>Radar + campañas con control de agencia</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-[#2F6BFF]" />
                <span>Flujo profesional: chat, propuestas y operativa diaria</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-[#2F6BFF]" />
                <span>Estado real controlado desde servidor (server-truth)</span>
              </li>
            </ul>
          </div>
        </div>

       {/* Buttons */}
<div className="mt-8 grid grid-cols-2 gap-4">
  <button
    onClick={onPay}
    className="
      h-14 w-full rounded-[18px]
      bg-black text-white
      font-black tracking-wide
      transition
      hover:bg-[#2F6BFF]
      focus:outline-none focus:ring-4 focus:ring-[#2F6BFF]/25
    "
  >
    Activar Agency SF PRO
  </button>

  <button
    onClick={onClose}
    className="
      h-14 w-full rounded-[18px]
      border border-black/20 bg-white text-black
      font-black tracking-wide
      transition
      hover:border-[#2F6BFF] hover:bg-[#2F6BFF]/10 hover:text-[#2F6BFF]
      focus:outline-none focus:ring-4 focus:ring-[#2F6BFF]/20
    "
  >
    Cerrar
  </button>
</div>


        <div className="mt-4 text-[13px] text-black/45 font-semibold">
          Acceso inmediato a herramientas profesionales. Tu estado se controla desde servidor.
        </div>
      </div>
    </div>
  </div>
);


}
