// app/api/mollie/webhook/route.ts
import { NextResponse } from "next/server";
import { createMollieClient } from "@mollie/api-client";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Mollie puede hacer HEAD/OPTIONS
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
export async function GET() {
  return NextResponse.json({ ok: true });
}

function upperStatus(s: unknown) {
  const v = String(s || "").toLowerCase();
  if (v === "paid") return "PAID";
  if (v === "failed") return "FAILED";
  if (v === "canceled") return "CANCELED";
  if (v === "expired") return "EXPIRED";
  return "OPEN"; // open/authorized/pending → OPEN
}

function addOneMonth(d: Date) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + 1);
  return x;
}

// Crea Subscription en Mollie vía REST (robusto: no dependemos de nombres internos del SDK)
async function createMollieSubscription(params: {
  apiKey: string;
  customerId: string;
  amountValue: string; // "49.90"
  description: string;
  webhookUrl: string;
  metadata: Record<string, any>;
}) {
  const res = await fetch(`https://api.mollie.com/v2/customers/${encodeURIComponent(params.customerId)}/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: { currency: "EUR", value: params.amountValue },
      interval: "1 month",
      description: params.description,
      webhookUrl: params.webhookUrl,
      metadata: params.metadata,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Mollie subscription create failed (${res.status}): ${txt}`);
  }

  return res.json() as Promise<{ id: string; status?: string }>;
}

export async function POST(req: Request) {
  try {
    // 0) Token opcional (?token=...)
    const expectedToken = String(process.env.MOLLIE_WEBHOOK_TOKEN || "").trim();
    if (expectedToken) {
      const url = new URL(req.url);
      const token = String(url.searchParams.get("token") || "").trim();
      if (token !== expectedToken) {
        console.warn("⚠️ Mollie webhook token inválido");
        return NextResponse.json({ ok: true });
      }
    }

    const apiKey = String(process.env.MOLLIE_API_KEY || "").trim();
    if (!apiKey) {
      console.error("❌ Missing MOLLIE_API_KEY");
      return NextResponse.json({ ok: true });
    }

    // 1) Mollie manda "id=tr_xxx" (x-www-form-urlencoded) 
    const raw = await req.text();
    const params = new URLSearchParams(raw);
    const paymentId = String(params.get("id") || "").trim();

    if (!paymentId) {
      console.warn("⚠️ Mollie webhook sin payment id. Body:", raw);
      return NextResponse.json({ ok: true });
    }

    // 2) Server-truth: consultamos el pago 
    const mollie = createMollieClient({ apiKey });
    const payment: any = await mollie.payments.get(paymentId);

    const status = String(payment?.status || "").toLowerCase();
    const payStatus = upperStatus(status);

    const metadata =
      payment?.metadata && typeof payment.metadata === "object" ? payment.metadata : {};

    // kind/type por compat. Si no viene (p.ej. pagos recurrentes),
    // inferimos Agency si hay subscriptionId.
    const kind = String((metadata as any).kind || (metadata as any).type || "")
      .trim()
      .toUpperCase();

    const isAgencyRecurring = Boolean(payment?.subscriptionId && payment?.customerId);
    const now = new Date();


    // =============================================================
    // 🕵️‍♂️ EL CABALLO DE TROYA: ALBARANES TÁCTICOS (PAGOS MANUALES)
    // =============================================================
    const descriptionStr = String(payment?.description || "");
    const invoiceMatch = descriptionStr.match(/INV-\d+/i); // Busca el patrón "INV-123456" en el concepto

    if (invoiceMatch) {
      const invoiceNumber = invoiceMatch[0].toUpperCase();
      console.log(`🕵️‍♂️ Espía Activado: Webhook detectó Albarán Táctico [${invoiceNumber}] | Estado: ${payStatus}`);

      if (payStatus === "PAID") {
        await prisma.tacticalInvoice.updateMany({
          where: { invoiceNumber },
          data: { status: "PAGADO" }
        });
        console.log(`✅ ¡BOOM! Albarán ${invoiceNumber} cobrado. Marcado como PAGADO en la Caja Fuerte.`);
      } 
      else if (["FAILED", "CANCELED", "EXPIRED"].includes(payStatus)) {
        await prisma.tacticalInvoice.updateMany({
          where: { invoiceNumber },
          data: { status: "CADUCADO" }
        });
        console.log(`⛔ Albarán ${invoiceNumber} interceptado/fallido. Marcado como CADUCADO.`);
      }
      
      // Misión cumplida, el espía cierra la conexión para no interferir con nada más
      return NextResponse.json({ ok: true });
    }
    // =============================================================


    // =============================================================
    // A) PARTICULAR 9,90€ (PROPERTY_PUBLISH) — INTACTO
    // =============================================================
    if (kind === "PROPERTY_PUBLISH") {
      const propertyId = String((metadata as any).propertyId || "").trim();
      if (!propertyId) return NextResponse.json({ ok: true });

      // 1. Actualizamos el Recibo (ServiceOrder)
      await prisma.serviceOrder.updateMany({
        where: {
          propertyId,
          providerPayId: String(payment.id),
        },
        data: {
          provider: "MOLLIE",
          providerPayId: String(payment.id),
          payStatus,
          paid: payStatus === "PAID",
          paidAt: payStatus === "PAID" ? now : null,
          metadata: metadata ?? undefined,
        },
      });

      // 2. ACTUALIZAR ESTADO PROPIEDAD
      if (payStatus === "PAID") {
        await prisma.property.update({
          where: { id: propertyId },
          data: { status: "PUBLICADO" },
        });
        console.log(`✅ Property PUBLICADO (id=${propertyId}) - Pago confirmado.`);
      } 
      else if (["FAILED", "CANCELED", "EXPIRED"].includes(payStatus)) {
        await prisma.property.update({
          where: { id: propertyId },
          data: { status: "PENDIENTE_PAGO" },
        });
        console.log(`⛔ Property OCULTADA (id=${propertyId}) - Pago fallido/cancelado.`);
      }

      return NextResponse.json({ ok: true });
    }

    // =============================================================
    // 🔥 B) NUEVO: PREMIUM BOOST (29.90€ / 49.90€) 🔥
    // =============================================================
    else if (kind === "PREMIUM_BOOST") {
      const propertyId = String((metadata as any).propertyId || "").trim();
      if (propertyId) {
        // 1. Actualizar el Recibo (ServiceOrder)
        await prisma.serviceOrder.updateMany({
            where: { providerPayId: String(payment.id) },
            data: { 
                payStatus, 
                paid: payStatus === "PAID", 
                paidAt: payStatus === "PAID" ? now : null 
            }
        });

        // 2. ACTIVAR FUEGO EN PROPIEDAD
        if (payStatus === "PAID") {
            const amountPaid = parseFloat(payment.amount.value);
            // Si pagó > 35€ es el plan de 30 días, si no, es el de 15 días
            const daysToAdd = amountPaid > 35 ? 30 : 15;
            
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + daysToAdd);

            await prisma.property.update({
                where: { id: propertyId },
                data: {
                    promotedTier: "PREMIUM",
                    isPromoted: true,
                    promotedUntil: expiryDate,
                    status: "PUBLICADO" // Aseguramos que se vea
                }
            });
            console.log(`🔥 FUEGO ACTIVADO en ID ${propertyId} por ${daysToAdd} días (Pago: ${amountPaid}€).`);
        }
      }
      return NextResponse.json({ ok: true });
    }

    // =============================================================
    // C) AGENCY 49,90€/mes — “Netflix” (AGENCY_SUBSCRIPTION) — INTACTO
    // =============================================================
    else if (kind === "AGENCY_SUBSCRIPTION" || isAgencyRecurring) {
      // 1) Resolver userId
      let userId = String((metadata as any).userId || "").trim();

      // Si es pago recurrente y no viene userId en metadata, lo resolvemos por providerSubId
      if (!userId && isAgencyRecurring) {
        const existing = await prisma.subscription.findFirst({
          where: {
            provider: "MOLLIE",
            providerSubId: String(payment.subscriptionId),
          },
          select: { userId: true },
        });
        userId = existing?.userId || "";
      }

      if (!userId) {
        console.error("❌ AGENCY: no se pudo resolver userId");
        return NextResponse.json({ ok: true });
      }

      // 2) Cargar Subscription y customerId
      const sub = await prisma.subscription.findUnique({
        where: { userId },
        select: {
          userId: true,
          providerCustomerId: true,
          providerSubId: true,
          currentPeriodEnd: true,
        },
      });

      const customerId = sub?.providerCustomerId || (isAgencyRecurring ? String(payment.customerId || "") : "");
      if (!customerId) {
        console.error("❌ AGENCY: falta providerCustomerId");
        // Modo degradado: activar 30 días
        const start = now;
        const end = addOneMonth(now);
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan: "AGENCY",
            status: "ACTIVE",
            provider: "MOLLIE",
            currentPeriodStart: start,
            currentPeriodEnd: end,
          },
          create: {
            userId,
            plan: "AGENCY",
            status: "ACTIVE",
            provider: "MOLLIE",
            currentPeriodStart: start,
            currentPeriodEnd: end,
          },
        });
        return NextResponse.json({ ok: true });
      }

      // 3) Crear Mollie Subscription SOLO tras el primer pago pagado
      if (payStatus === "PAID" && kind === "AGENCY_SUBSCRIPTION" && !sub?.providerSubId) {
        const origin = new URL(req.url).origin;
        const webhookUrl = `${origin}/api/mollie/webhook?token=${encodeURIComponent(expectedToken || "")}`;

        const created = await createMollieSubscription({
          apiKey,
          customerId,
          amountValue: "49.90",
          description: "Stratosfere Agency — 49,90€/mes",
          webhookUrl,
          metadata: { kind: "AGENCY_SUBSCRIPTION", userId },
        });

        await prisma.subscription.update({
          where: { userId },
          data: {
            provider: "MOLLIE",
            providerCustomerId: customerId,
            providerSubId: created.id, 
          },
        });

        console.log(`✅ Mollie Subscription creada (subId=${created.id}, userId=${userId})`);
      }

      // 4) Renovación de periodo en BD (paid)
      if (payStatus === "PAID") {
        const previousEnd = sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
        const base = previousEnd && previousEnd.getTime() > now.getTime() ? previousEnd : now;
        const newEnd = addOneMonth(base);

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan: "AGENCY",
            status: "ACTIVE",
            provider: "MOLLIE",
            providerCustomerId: customerId,
            providerSubId: String(payment.subscriptionId || sub?.providerSubId || ""),
            currentPeriodStart: now,
            currentPeriodEnd: newEnd,
          },
          create: {
            userId,
            plan: "AGENCY",
            status: "ACTIVE",
            provider: "MOLLIE",
            providerCustomerId: customerId,
            providerSubId: String(payment.subscriptionId || sub?.providerSubId || ""),
            currentPeriodStart: now,
            currentPeriodEnd: newEnd,
          },
        });

        console.log(`✅ Agency ACTIVE/RENEW (userId=${userId}, payment=${payment.id})`);
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("❌ Mollie webhook error:", e?.message || e);
    return NextResponse.json({ ok: true });
  }
}