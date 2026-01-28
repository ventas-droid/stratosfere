import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Mollie hace HEAD / OPTIONS / POST en hook.ping
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

export async function POST() {
  return NextResponse.json({ ok: true });
}

// Solo para pruebas manuales en navegador
export async function GET() {
  return NextResponse.json({ ok: true });
}
