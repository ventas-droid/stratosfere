// app/components/billing/startAgencyPayment.ts

export async function startAgencyPayment() {
  const res = await fetch("/api/mollie/create-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: 49.90,
      currency: "EUR",
      description: "Agency SF PRO – Suscripción mensual",
      redirectUrl: `${window.location.origin}/?paid=agency`,
      metadata: {
        plan: "AGENCY_SF_PRO",
      },
    }),
  });

  const data = await res.json();

  if (!data.ok || !data.checkoutUrl) {
    throw new Error("No se pudo iniciar el pago");
  }

  // 🔴 AQUÍ ESTÁ LA CLAVE: redirección REAL
  window.location.href = data.checkoutUrl;
}
