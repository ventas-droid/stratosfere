import { prisma } from "@/app/lib/prisma";

// =========================================================
// 🚀 HELPER: CAÑÓN UNIVERSAL DE EXPO PUSH
// =========================================================
export async function sendExpoPushToUserId(
  userId: string,
  payload: { title: string; body: string; data?: any }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { expoPushToken: true },
    });

    if (!user?.expoPushToken) return;

    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: user.expoPushToken,
        sound: "default",
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
      }),
    });

    const json = await res.json().catch(() => null);
    console.log("🚀 [EXPO PUSH] Disparo a", userId, "- Estado:", json?.data?.status || "OK");
  } catch (e) {
    console.error("⚠️ [EXPO PUSH] Error de disparo:", e);
  }
}