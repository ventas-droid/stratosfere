import { prisma } from "@/app/lib/prisma";

// =========================================================
// 🚀 HELPER: EXPO PUSH REAL PARA STRATOSFERE MOBILE
// =========================================================

function isValidExpoPushToken(token?: string | null) {
  if (!token) return false;

  return (
    token.startsWith("ExponentPushToken[") ||
    token.startsWith("ExpoPushToken[")
  );
}

export async function sendExpoPushToUserId(
  userId: string,
  payload: {
    title: string;
    body: string;
    data?: Record<string, any>;
  }
) {
  try {
    if (!userId) {
      console.log("⚠️ [EXPO PUSH] No enviada: falta userId");
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        expoPushToken: true,
      },
    });

    const token = user?.expoPushToken;

    if (!isValidExpoPushToken(token)) {
      console.log("⚠️ [EXPO PUSH] No enviada: token vacío o inválido", {
        userId,
        token,
      });
      return null;
    }

    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: token,
        title: payload.title || "Stratosfere",
        body: payload.body || "Tienes una nueva notificación.",
        sound: "default",
        priority: "high",
        channelId: "canal-tactico-2",
        data: payload.data || {},
      }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("❌ [EXPO PUSH] Error HTTP enviando push:", {
        userId,
        status: res.status,
        response: json,
      });
      return null;
    }

    const status = json?.data?.status;

    if (status === "error") {
      console.error("❌ [EXPO PUSH] Expo devolvió error:", {
        userId,
        response: json,
      });
      return null;
    }

    console.log("✅ [EXPO PUSH] Enviada correctamente:", {
      userId,
      status: status || "unknown",
      response: json,
    });

    return json;
  } catch (e) {
    console.error("❌ [EXPO PUSH] Error general enviando push:", e);
    return null;
  }
}