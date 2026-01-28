"use client";

import { getUserMeAction } from "@/app/actions";

type StartAgencyPaymentOpts = {
  amount?: string;        // default "49.90"
  redirectPath?: string;  // default "/?access=agency&paid=1"
  description?: string;   // default "Agency SF PRO — 49,90 €/mes"
};

function toAmountString(v?: string) {
  const n = Number(v ?? "49.90");
  if (!Number.isFinite(n) || n <= 0) return "49.90";
  return n.toFixed(2); // Mollie exige "xx.xx"
}

export async function startAgencyPayment(opts: StartAgencyPaymentOpts = {}) {
  if (typeof window === "undefined") {
    throw new Error("startAgencyPayment solo puede ejecutarse en el cliente (browser).");
  }

  const origin = window.location.origin;
  const redirectPath = (opts.redirectPath ?? "/?access=agency&paid=1").trim();

  // ✅ construye URL absoluta SIEMPRE correcta
  const redirectUrl = new URL(redirectPath, origin).toString();

  // Best-effort: metemos userId/email para que el webhook sepa a quién activar
  let userId: string | undefined;
  let userEmail: string | undefined;

  try {
    const me = await getUserMeAction();
    if (me?.success && me.data) {
      userId = me.data?.id ? String(me.data.id) : undefined;
      userEmail = me.data?.email ? String(me.data.email) : undefined;
    }
  } catch {
    // seguimos igualmente
  }

  const res = await fetch("/api/mollie/create-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: toAmountString(opts.amount),
      currency: "EUR",
      description: opts.description ?? "Agency SF PRO — 49,90 €/mes",
      redirectUrl,
      metadata: {
        kind: "AGENCY_SUBSCRIPTION",
        plan: "AGENCY_SF_PRO",
        userId,
        email: userEmail,
      },
    }),
  });

  const json: any = await res.json().catch(() => ({}));

  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || `No se pudo iniciar el pago (HTTP ${res.status}).`);
  }

  if (!json?.checkoutUrl) {
    throw new Error("Mollie no devolvió checkoutUrl.");
  }

  // opcional: guardar paymentId por si luego quieres confirmar al volver
  try {
    if (json.paymentId) localStorage.setItem("mollie:last_payment_id", String(json.paymentId));
  } catch {}

  window.location.assign(String(json.checkoutUrl));
}
