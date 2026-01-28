"use client";

import { getUserMeAction } from "@/app/actions";

type StartAgencyPaymentOpts = {
  amount?: string; // default 49.90
  redirectPath?: string; // default "/?access=agency"
};

export async function startAgencyPayment(opts: StartAgencyPaymentOpts = {}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const redirectUrl = `${origin}${opts.redirectPath ?? "/?access=agency&paid=1"}`;

  // Best-effort: attach userId/email in Mollie metadata (para que el webhook sepa a quién activar)
  let userId: string | undefined;
  let userEmail: string | undefined;

  try {
    const me = await getUserMeAction();
    if (me?.success && me.data) {
      userId = me.data?.id ? String(me.data.id) : undefined;
      userEmail = me.data?.email ? String(me.data.email) : undefined;
    }
  } catch {
    // si falla, seguimos igualmente (pero luego no podremos marcar BD sin userId)
  }

  const res = await fetch("/api/mollie/create-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: opts.amount ?? "49.90",
      currency: "EUR",
      description: "Agency SF PRO — 49,90 €/mes",
      redirectUrl,
      metadata: {
        kind: "AGENCY_SUBSCRIPTION",
        plan: "AGENCY_SF_PRO",
        userId,
        email: userEmail,
      },
    }),
  });

  const json = await res.json().catch(() => ({} as any));

  if (!res.ok || !json?.ok || !json?.checkoutUrl) {
    const msg = json?.error || `No se pudo iniciar el pago (HTTP ${res.status})`;
    throw new Error(msg);
  }

  // opcional: guardamos paymentId por si luego quieres “confirmar” al volver
  try {
    if (json.paymentId) localStorage.setItem("mollie:last_payment_id", json.paymentId);
  } catch {}

  window.location.href = String(json.checkoutUrl);
}
