// app/api/mollie/create-payment/route.ts
import { NextResponse } from "next/server";
import { createMollieClient } from "@mollie/api-client";

export const runtime = "nodejs";

function toAmountString(v: unknown) {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  if (!Number.isFinite(n) || n <= 0) throw new Error("Invalid amount");
  return n.toFixed(2);
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.MOLLIE_API_KEY;
    const webhookToken = process.env.MOLLIE_WEBHOOK_TOKEN;

    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "Missing MOLLIE_API_KEY" }, { status: 500 });
    }
    if (!webhookToken) {
      return NextResponse.json({ ok: false, error: "Missing MOLLIE_WEBHOOK_TOKEN" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));

    // Requeridos
    const amountValue = toAmountString(body.amount);
    const redirectUrl = String(body.redirectUrl || "").trim();

    if (!redirectUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing redirectUrl" },
        { status: 400 }
      );
    }

    // Opcionales
    const currency = String(body.currency || "EUR");
    const description = String(body.description || "Stratosfere payment");
    const metadata =
      body.metadata && typeof body.metadata === "object" ? body.metadata : undefined;

    // Webhook por pago (incluye token en query)
    const origin = new URL(req.url).origin;
    const webhookUrl = `${origin}/api/mollie/webhook?token=${encodeURIComponent(webhookToken)}`;

    const mollie = createMollieClient({ apiKey });

    const payment = await mollie.payments.create({
      amount: { currency, value: amountValue },
      description,
      redirectUrl,
      webhookUrl,
      metadata,
    });

    return NextResponse.json({
      ok: true,
      paymentId: payment.id,
      status: payment.status,
      checkoutUrl: payment.getCheckoutUrl?.() ?? null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
