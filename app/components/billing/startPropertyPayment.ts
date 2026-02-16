"use client";

import { getUserMeAction } from "@/app/actions";

type StartPropertyPaymentOpts = {
  amount?: string;        // default "9.90"
  redirectPath?: string;  // default window.location.pathname + "?paid=1"
  description?: string;   // default "Publicación propiedad — 9,90€"
  refCode?: string;       // opcional para description
  // 🔥 NUEVO: Tipo de pago. Si no se pone, asume "PROPERTY_PUBLISH" (9.90€)
  kind?: "PROPERTY_PUBLISH" | "PREMIUM_BOOST"; 
};

function toAmountString(v?: string) {
  // Si viene vacío o inválido, ponemos el precio base de publicación
  const n = Number(v ?? "9.90");
  if (!Number.isFinite(n) || n <= 0) return "9.90";
  return n.toFixed(2);
}

export async function startPropertyPayment(
  propertyId: string,
  opts: StartPropertyPaymentOpts = {}
) {
  if (typeof window === "undefined") {
    throw new Error("startPropertyPayment solo puede ejecutarse en el cliente (browser).");
  }

  const pid = String(propertyId || "").trim();
  if (!pid) throw new Error("Missing propertyId");

  const origin = window.location.origin;

  const redirectPath =
    (opts.redirectPath ?? (window.location.pathname + window.location.search)).trim();

  const redirectUrl = new URL(redirectPath, origin).toString();

  // 🔥 SEGURIDAD: Si no especificamos tipo, es el clásico de publicar (9.90)
  const kind = opts.kind || "PROPERTY_PUBLISH";

  const description =
    (opts.description ?? "Publicación propiedad — 9,90€") +
    (opts.refCode ? ` (${opts.refCode})` : "");

  // Recuperamos usuario (Best-effort)
  let userId: string | undefined;
  let userEmail: string | undefined;

  try {
    const me = await getUserMeAction();
    if (me?.success && me.data) {
      const id = me.data?.id ? String(me.data.id).trim() : "";
      const email = me.data?.email ? String(me.data.email).trim() : "";
      userId = id || undefined;
      userEmail = email || undefined;
    }
  } catch {
    // seguimos igualmente
  }

  const res = await fetch("/api/mollie/create-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: toAmountString(opts.amount), // Enviamos el monto (9.90, 29.90 o 49.90)
      currency: "EUR",
      description,
      redirectUrl,
      metadata: {
        kind: kind, // 🔥 Enviamos el tipo para que el servidor sepa qué hacer
        propertyId: pid,
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

  try {
    if (json.paymentId) localStorage.setItem("mollie:last_payment_id", String(json.paymentId));
  } catch {}

  window.location.assign(String(json.checkoutUrl));
}

