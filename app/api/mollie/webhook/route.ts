import { NextResponse } from "next/server";
import { createMollieClient } from "@mollie/api-client";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Mollie hace HEAD/OPTIONS a veces
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export async function POST(req: Request) {
  try {
    // 0) Seguridad por token en query
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || "";
    const expected = process.env.MOLLIE_WEBHOOK_TOKEN || "";

    if (!expected) {
      console.error("❌ Missing MOLLIE_WEBHOOK_TOKEN (server env)");
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    if (token !== expected) {
      console.warn("⚠️ Webhook token inválido");
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    // 1) Mollie manda body: id=tr_xxx (x-www-form-urlencoded)
    const raw = await req.text();
    const params = new URLSearchParams(raw);
    const paymentId = params.get("id") || "";

    if (!paymentId) {
      console.warn("⚠️ Webhook sin payment id");
      return NextResponse.json({ ok: true });
    }

    const apiKey = process.env.MOLLIE_API_KEY || "";
    if (!apiKey) {
      console.error("❌ Missing MOLLIE_API_KEY (server env)");
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    // 2) Verificar estado real consultando a Mollie
    const mollie = createMollieClient({ apiKey });
    const payment: any = await mollie.payments.get(paymentId);

    // 3) Solo actuamos si está pagado
    if (String(payment?.status || "").toLowerCase() !== "paid") {
      return NextResponse.json({ ok: true });
    }

    const metadata: any = payment?.metadata || {};
    const kind = String(metadata.kind || metadata.type || "").trim();

    // ------------------------------------------------------------------
    // 4A) AGENCIA — 49,90€ (activamos Subscription en tu BD)
    // metadata.kind = "AGENCY_SUBSCRIPTION"
    // metadata.userId = "..."
    // ------------------------------------------------------------------
    if (kind === "AGENCY_SUBSCRIPTION") {
      const userId = String(metadata.userId || "").trim();
      if (!userId) {
        console.error("❌ AGENCY_SUBSCRIPTION sin userId");
        return NextResponse.json({ ok: true });
      }

      const now = new Date();
      const end = daysFromNow(30); // “mes” simple. (Luego lo hacemos exacto con suscripción real)

      await prisma.subscription.upsert({
        where: { userId },
        update: {
          plan: "AGENCY",
          status: "ACTIVE",
          provider: "MOLLIE",
          providerSubId: String(payment.id),
          currentPeriodStart: now,
          currentPeriodEnd: end,
        },
        create: {
          userId,
          plan: "AGENCY",
          status: "ACTIVE",
          provider: "MOLLIE",
          providerSubId: String(payment.id),
          currentPeriodStart: now,
          currentPeriodEnd: end,
        },
      });

      console.log(`✅ Agency ACTIVE (userId=${userId})`);
      return NextResponse.json({ ok: true });
    }

    // ------------------------------------------------------------------
    // 4B) PARTICULAR — 9,90€ (publicar propiedad)
    // metadata.kind = "PROPERTY_PUBLISH"
    // metadata.propertyId = "..."
    //
    // IMPORTANTE: NO tocamos ServiceOrder aquí para no chocar con tu Prisma Client.
    // ------------------------------------------------------------------
    if (kind === "PROPERTY_PUBLISH") {
      const propertyId = String(metadata.propertyId || "").trim();
      if (!propertyId) {
        console.error("❌ PROPERTY_PUBLISH sin propertyId");
        return NextResponse.json({ ok: true });
      }

      await prisma.property.update({
        where: { id: propertyId },
        data: { status: "PUBLICADO" },
      });

      console.log(`✅ Propiedad PUBLICADA (id=${propertyId})`);
      return NextResponse.json({ ok: true });
    }

    // Si llega otro kind, no hacemos nada
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("❌ Mollie webhook error:", e?.message || e);
    // Respondemos 200 para que Mollie no reintente en bucle
    return NextResponse.json({ ok: true });
  }
}
