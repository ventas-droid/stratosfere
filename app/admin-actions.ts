"use server"; // 👈 ¡OBLIGATORIO ARRIBA DEL TODO!

import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";

// =========================================================
// ⚡ SUPER ADMIN: GESTIÓN DE SUSCRIPCIONES (UPSERT)
// =========================================================
export async function toggleUserSubscriptionAction(userId: string, targetStatus: "ACTIVE" | "INACTIVE") {
  try {
    // 1. SI ES ACTIVAR -> UPSERT (Crear o Actualizar a AGENCY/ACTIVE)
    if (targetStatus === "ACTIVE") {
        await prisma.subscription.upsert({
            where: { userId: userId },
            update: {
                status: "ACTIVE",
                plan: "AGENCY",
                currentPeriodEnd: new Date("2030-01-01"), // Licencia vitalicia
            },
            create: {
                userId: userId,
                status: "ACTIVE",
                plan: "AGENCY",
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date("2030-01-01"),
            }
        });
    } 
    // 2. SI ES DESACTIVAR -> UPDATE A CANCELLED
    else {
        try {
            await prisma.subscription.update({
                where: { userId: userId },
                data: { status: "CANCELLED" }
            });
        } catch (e) {
            // Ignoramos si no existía, da igual
        }
    }

    revalidatePath("/admin"); // Refresca la página de admin
    return { success: true };

  } catch (error) {
    console.error("Error Admin Action:", error);
    return { success: false, error: "Fallo en la matriz" };
  }
}