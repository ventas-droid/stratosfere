import { prisma } from "@/app/lib/prisma";

// =========================================================
// 🚀 HELPER: CAÑÓN UNIVERSAL DE EXPO PUSH (ARMADO AL MÁXIMO)
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
        sound: "default",             // 🔊 HABILITA EL "CLIN CLIN"
        priority: "high",             // 🔥 HABILITA LA VIBRACIÓN Y BAJA LA VENTANA
        channelId: "canal-tactico-1", // 🎯 APUNTA AL CANAL NUEVO QUE CREAMOS EN EL MÓVIL
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