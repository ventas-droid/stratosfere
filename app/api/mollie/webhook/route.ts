// app/api/mollie/webhook/route.ts
import { NextResponse } from "next/server";
import { createMollieClient } from "@mollie/api-client";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Mollie puede hacer HEAD/OPTIONS en algunos entornos
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

// Solo para pruebas manuales en navegador
export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  try {
    // ------------------------------------------------------------------
    // 0) Seguridad opcional por token en la URL (?token=...)
    // ------------------------------------------------------------------
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

    // ------------------------------------------------------------------
    // 1) Mollie manda el payment id en x-www-form-urlencoded: "id=tr_xxx"
    // ------------------------------------------------------------------
    const raw = await req.text();
    const params = new URLSearchParams(raw);
    const paymentId = String(params.get("id") || "").trim();

    if (!paymentId) {
      console.warn("⚠️ Mollie webhook sin payment id. Body:", raw);
      return NextResponse.json({ ok: true });
    }

    // ------------------------------------------------------------------
    // 2) Consultamos a Mollie (server-truth)
    // ------------------------------------------------------------------
    const mollie = createMollieClient({ apiKey });
    const payment: any = await mollie.payments.get(paymentId);

    const status = String(payment?.status || "").toLowerCase();
    if (status !== "paid") {
      // no hacemos nada si no está paid
      return NextResponse.json({ ok: true });
    }

    const metadata =
      payment?.metadata && typeof payment.metadata === "object" ? payment.metadata : {};

    // Aceptamos kind o type por compat (por si en create-payment usas uno u otro)
    const kind = String((metadata as any).kind || (metadata as any).type || "")
      .trim()
      .toUpperCase();

    const now = new Date();

    // ------------------------------------------------------------------
    // 3A) AGENCIA — 49,90€ (activar acceso)
    // metadata.kind/type = "AGENCY_SUBSCRIPTION"
    // metadata.userId = "..."
    // ------------------------------------------------------------------
    if (kind === "AGENCY_SUBSCRIPTION") {
      const userId = String((metadata as any).userId || "").trim();
      if (!userId) {
        console.error("❌ AGENCY_SUBSCRIPTION sin userId");
        return NextResponse.json({ ok: true });
      }

      // Periodo simple (30 días). Si luego pasas a Mollie Subscriptions, se cambia aquí.
      const start = now;
      const end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.subscription.upsert({
        where: { userId },
        update: {
          plan: "AGENCY",
          status: "ACTIVE",
          provider: "MOLLIE",
          providerSubId: String(payment.id), // referencia mínima
          currentPeriodStart: start,
          currentPeriodEnd: end,
        },
        create: {
          userId,
          plan: "AGENCY",
          status: "ACTIVE",
          provider: "MOLLIE",
          providerSubId: String(payment.id),
          currentPeriodStart: start,
          currentPeriodEnd: end,
        },
      });

      console.log(`✅ Agency ACTIVE (userId=${userId}, payment=${payment.id})`);
      return NextResponse.json({ ok: true });
    }

    // ------------------------------------------------------------------
    // 3B) PARTICULAR — 9,90€ (publicar propiedad)
    // metadata.kind/type = "PROPERTY_PUBLISH"
    // metadata.propertyId = "..."
    //
    // ✅ Aquí SÍ guardamos trazabilidad SIN payStatus:
    // - paid=true
    // - provider="MOLLIE"
    // - providerPayId=payment.id
    // - paidAt=now
    // - metadata=metadata
    // ------------------------------------------------------------------
    if (kind === "PROPERTY_PUBLISH") {
      const propertyId = String((metadata as any).propertyId || "").trim();
      if (!propertyId) {
        console.error("❌ PROPERTY_PUBLISH sin propertyId");
        return NextResponse.json({ ok: true });
      }

      // 1) Marcar orden(es) como pagada(s) de esa propiedad (si existe/n)
      // ⚠️ NO usamos payStatus porque tu Prisma Client ahora mismo NO lo reconoce.
      await prisma.serviceOrder.updateMany({
        where: {
          propertyId,
          paid: false,
        },
        data: {
          paid: true,
          provider: "MOLLIE",
          providerPayId: String(payment.id),
          paidAt: now,
          metadata: metadata ?? undefined,
        },
      });

      // 2) Publicar propiedad
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: "PUBLICADO" },
      });

      console.log(`✅ Property PUBLICADO (id=${propertyId}, payment=${payment.id})`);
      return NextResponse.json({ ok: true });
    }

    // kind desconocido → noop
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("❌ Mollie webhook error:", e?.message || e);
    // siempre 200 para que Mollie no reintente sin parar
    return NextResponse.json({ ok: true });
  }
}
