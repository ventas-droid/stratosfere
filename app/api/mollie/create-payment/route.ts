// app/api/mollie/create-payment/route.ts
import { NextResponse } from "next/server";
import { createMollieClient } from "@mollie/api-client";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AGENCY_PRICE_EUR = "49.90";
const PUBLISH_PRICE_EUR = "9.90";

function getPublicOrigin(req: Request) {
  // Soporta proxies (Firebase/Vercel/etc.)
  const xfProto = req.headers.get("x-forwarded-proto");
  const xfHost = req.headers.get("x-forwarded-host");
  const host = xfHost || req.headers.get("host");
  if (host) return `${xfProto || "https"}://${host}`;
  return new URL(req.url).origin;
}

export async function POST(req: Request) {
  try {
    const apiKey = String(process.env.MOLLIE_API_KEY || "").trim();
    const webhookToken = String(process.env.MOLLIE_WEBHOOK_TOKEN || "").trim();

    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "Missing MOLLIE_API_KEY" }, { status: 500 });
    }
    if (!webhookToken) {
      return NextResponse.json({ ok: false, error: "Missing MOLLIE_WEBHOOK_TOKEN" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({} as any));
    const origin = getPublicOrigin(req);

    const redirectUrlRaw = String(body.redirectUrl || "").trim();
    if (!redirectUrlRaw) {
      return NextResponse.json({ ok: false, error: "Missing redirectUrl" }, { status: 400 });
    }
    const redirectUrl = new URL(redirectUrlRaw, origin).toString();

    const metaObj =
      body.metadata && typeof body.metadata === "object"
        ? (body.metadata as Record<string, any>)
        : {};

    // Aceptamos kind o type por compatibilidad
    // 🔥 AÑADIMOS PREMIUM_BOOST A LA LISTA DE TIPOS VÁLIDOS
    const kind = String(metaObj.kind || metaObj.type || "")
      .trim()
      .toUpperCase();

    if (
        kind !== "AGENCY_SUBSCRIPTION" && 
        kind !== "PROPERTY_PUBLISH" && 
        kind !== "PREMIUM_BOOST"
    ) {
      return NextResponse.json({ ok: false, error: "Invalid kind" }, { status: 400 });
    }

    const mollie = createMollieClient({ apiKey });

    // Webhook por pago (token en query)
    const webhookUrl = `${origin}/api/mollie/webhook?token=${encodeURIComponent(webhookToken)}`;

    // 💰 LÓGICA DE PRECIOS DINÁMICA
    let amountValue = PUBLISH_PRICE_EUR; // Default fallback
    let description = "Stratosfere Service";

    if (kind === "AGENCY_SUBSCRIPTION") {
        amountValue = AGENCY_PRICE_EUR;
        description = "Stratosfere Agency — 49,90€/mes";
    } 
    else if (kind === "PROPERTY_PUBLISH") {
        amountValue = PUBLISH_PRICE_EUR;
        description = "Stratosfere — Publicar propiedad 9,90€";
    }
    else if (kind === "PREMIUM_BOOST") {
        // 🔥 LOGICA PREMIUM: Confiamos en el amount enviado (validado)
        // Solo permitimos 29.90 o 49.90 para evitar manipulaciones raras
        const reqAmount = String(body.amount);
        if (reqAmount === "29.90" || reqAmount === "49.90") {
            amountValue = reqAmount;
            description = `Nano Card Premium (${reqAmount}€)`;
        } else {
            // Si intentan algo raro, forzamos el precio base de Premium Express
            amountValue = "29.90";
            description = "Nano Card Premium (Standard)";
        }
    }

    // Base payload (server-truth)
    const paymentPayload: any = {
      amount: {
        currency: "EUR",
        value: amountValue,
      },
      description,
      redirectUrl,
      webhookUrl,
      metadata: {
        ...metaObj,
        kind, // normalizamos
      },
    };

    // ------------------------------------------------------------------
    // 🏢 AGENCY: “Netflix mode” (INTACTO)
    // ------------------------------------------------------------------
    if (kind === "AGENCY_SUBSCRIPTION") {
      const userId = String(metaObj.userId || "").trim();
      if (!userId) {
        return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
      }

      // Leemos Subscription para providerCustomerId
      const sub = await prisma.subscription.findUnique({
        where: { userId },
        select: { providerCustomerId: true },
      });

      let customerId = sub?.providerCustomerId || undefined;

      if (!customerId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, companyName: true, email: true },
        });

        if (!user || !user.email) {
          return NextResponse.json({ ok: false, error: "User not found or missing email" }, { status: 404 });
        }

        const newCustomer = await mollie.customers.create({
          name: user.name || user.companyName || "Usuario Stratosfere",
          email: user.email,
          metadata: { userId: user.id },
        });

        customerId = newCustomer.id;

        await prisma.subscription.upsert({
          where: { userId: user.id },
          update: { providerCustomerId: customerId },
          create: { userId: user.id, providerCustomerId: customerId },
        });
      }

      paymentPayload.customerId = customerId;
      paymentPayload.sequenceType = "first";
    }

    // ------------------------------------------------------------------
    // 🏠 PROPERTY_PUBLISH O PREMIUM_BOOST: pago único limpio
    // - Verificación de propiedad y dueño
    // ------------------------------------------------------------------
    if (kind === "PROPERTY_PUBLISH" || kind === "PREMIUM_BOOST") {
      const propertyId = String(metaObj.propertyId || "").trim();
      if (!propertyId) {
        return NextResponse.json({ ok: false, error: "Missing propertyId" }, { status: 400 });
      }

      const userId = String(metaObj.userId || "").trim();
      if (!userId) {
        return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
      }

      // 🔒 Verificamos que la propiedad pertenece al usuario
      const prop = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { id: true, userId: true },
      });

      if (!prop) {
        return NextResponse.json({ ok: false, error: "Property not found" }, { status: 404 });
      }

      if (!prop.userId) {
        return NextResponse.json(
          { ok: false, error: "Property has no userId (cannot verify owner)" },
          { status: 400 }
        );
      }

      if (String(prop.userId) !== userId) {
        return NextResponse.json({ ok: false, error: "Forbidden (not owner)" }, { status: 403 });
      }
    }

    // 1) Crear pago en Mollie
    const payment = await mollie.payments.create(paymentPayload);

    // 2) Guardar un ServiceOrder (Recibo)
    // Sirve tanto para PUBLISH como para PREMIUM_BOOST
    if (kind === "PROPERTY_PUBLISH" || kind === "PREMIUM_BOOST") {
      const propertyId = String((paymentPayload?.metadata as any)?.propertyId || "").trim();

      await prisma.serviceOrder.create({
        data: {
          // Campos obligatorios del schema
          serviceId: kind, // "PROPERTY_PUBLISH" o "PREMIUM_BOOST"
          name: description,
          price: parseFloat(amountValue),
          paid: false,

          // Tracking Mollie
          provider: "MOLLIE",
          providerPayId: String(payment.id),

          payStatus: "OPEN",
          paidAt: null,
          metadata: (paymentPayload?.metadata ?? undefined) as any,

          propertyId,
        },
      });
    }

    const checkoutUrl =
      typeof (payment as any)?.getCheckoutUrl === "function"
        ? (payment as any).getCheckoutUrl()
        : (payment as any)?._links?.checkout?.href || null;

    return NextResponse.json({
      ok: true,
      paymentId: payment.id,
      status: payment.status,
      checkoutUrl,
    });

  } catch (err: any) {
    console.error("Error create-payment:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}