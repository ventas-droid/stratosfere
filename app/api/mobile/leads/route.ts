import { NextResponse } from 'next/server';
import { submitLeadAction } from '@/app/actions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Le pasamos el paquete recibido del móvil a su función blindada
    const result = await submitLeadAction(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en puente POST leads:", error);
    return NextResponse.json({ success: false, error: "Error en el servidor" }, { status: 500 });
  }
}