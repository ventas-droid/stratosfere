"use server";

import { prisma } from '@/app/lib/prisma';

export async function fetchAgencyForBillingAction(agencyId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: agencyId },
      // 🎯 SELECCIÓN QUIRÚRGICA: Solo pedimos lo que existe en el schema.prisma
      select: {
        legalName: true,
        companyName: true,
        name: true,
        email: true,
        cif: true,
        address: true,
        postalCode: true,
      }
    });

    if (!user) {
      return { success: false, error: "Agencia no encontrada en la Base de Datos." };
    }

    // 🎯 RECONSTRUCCIÓN DE DATOS PARA LA ETIQUETA
    // Usamos el nombre legal, si no el comercial, si no el nombre personal.
    const finalName = user.legalName || user.companyName || user.name || "AGENCIA VIP";
    
    // Unimos la calle y el código postal elegantemente.
    const fullAddress = [user.address, user.postalCode].filter(Boolean).join(" - ") || "DIRECCIÓN NO ESPECIFICADA";

    return {
      success: true,
      data: {
        name: finalName.toUpperCase(),
        address: fullAddress.toUpperCase(),
        cif: user.cif || "CIF / NIF NO DEFINIDO",
        email: user.email || "Sin email"
      }
    };
  } catch (error: any) {
    return { success: false, error: "Fallo en la conexión satelital con la DB." };
  }
}

// 🚀 1. GUARDAR UN ALBARÁN EN LA CAJA FUERTE
export async function createTacticalInvoiceAction(data: {
  invoiceNumber: string;
  agencyId?: string;
  agencyName: string;
  targetRef?: string;
  serviceType: string;
  amount: number;
  mollieLink?: string;
}) {
  try {
    const newInvoice = await prisma.tacticalInvoice.create({ 
      data: {
        ...data,
        status: 'PENDIENTE' // Todo misil nace pendiente de impactar
      }
    });
    return { success: true, data: newInvoice };
  } catch (error) {
    console.error("🚨 Error al guardar el Albarán:", error);
    return { success: false, error: "Fallo en los servidores centrales." };
  }
}

// 📡 2. LEER TODO EL HISTORIAL PARA EL RADAR (Ordenado de más nuevo a más viejo)
export async function getTacticalInvoicesAction() {
  try {
    const invoices = await prisma.tacticalInvoice.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: invoices };
  } catch (error) {
    console.error("🚨 Error leyendo el historial:", error);
    return { success: false, error: "Radar desconectado." };
  }
}

// ✅ 3. MARCAR MANUALMENTE COMO PAGADO (El Check Azul)
export async function markInvoiceAsPaidAction(id: string) {
  try {
    const updated = await prisma.tacticalInvoice.update({
      where: { id },
      data: { status: 'PAGADO' }
    });
    return { success: true, data: updated };
  } catch (error) {
    console.error("🚨 Error al confirmar pago:", error);
    return { success: false, error: "No se pudo actualizar el estado." };
  }
}