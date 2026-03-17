// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import {
  getMyConversationsAction as listMyConversationsAction,
  getConversationMessagesAction,
  sendMessageAction,
  getOrCreateConversationAction,
  deleteConversationAction,
  getPropertyByIdAction,
  markConversationReadAction,
} from "@/app/actions";
import { extractFirstUrl, isImageUrl } from "../../../utils/propertyCore";

// 📡 IMPORTAMOS EL RECEPTOR ESPACIAL (Ruta absoluta blindada)
import { getPusherClient } from "@/app/utils/pusher";

export const useStratosChat = (
  activeUserKey: string | null,
  identityVerified: boolean,
  addNotification: (msg: string) => void,
  setDataVersion: (fn: any) => void,
  setActivePanel: (fn: any) => void,
  setRightPanel: (fn: any) => void,
  systemMode: string,
  ownerProposals: any[],
  setActiveCampaignId: (id: string | null) => void
) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatThreads, setChatThreads] = useState<any[]>([]);
  const [chatConversationId, setChatConversationId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Unread logic
  const [unreadByConv, setUnreadByConv] = useState<Record<string, number>>({});
  const [unreadTotal, setUnreadTotal] = useState(0);

  const lastNotifiedAtRef = useRef<Record<string, number>>({});
  const lastSeenAtRef = useRef<Record<string, number>>({});
  const processedConversationRef = useRef<string | null>(null);

  // Cloudinary Upload
  const chatFileInputRef = useRef<any>(null);
  const [chatUploading, setChatUploading] = useState(false);
  const [chatUploadProgress, setChatUploadProgress] = useState(0);
  const chatUploadTempIdRef = useRef<string | null>(null);

  // Blocklist
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());

  // --- EFECTOS BÁSICOS ---
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const key = `stratos_chat_blocked_v1:${String(activeUserKey || "anon")}`;
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      setBlockedUsers(new Set((Array.isArray(arr) ? arr : []).map(String)));
    } catch {}
  }, [activeUserKey]);

  useEffect(() => {
    const total = Object.values(unreadByConv || {}).reduce((acc, n) => acc + Number(n || 0), 0);
    setUnreadTotal(total);
  }, [unreadByConv]);

  // Anti-loop proposals
  useEffect(() => {
    if (!chatConversationId) return;
    const cid = String(chatConversationId);
    if (processedConversationRef.current === cid) return;

    const match = (Array.isArray(ownerProposals) ? ownerProposals : []).find(
      (p: any) => String(p?.conversationId || "") === cid
    );

    if (match?.id) {
      processedConversationRef.current = cid;
      setActiveCampaignId(String(match.id));
    }
  }, [chatConversationId, ownerProposals, setActiveCampaignId]);

  useEffect(() => {
    if (!chatOpen) processedConversationRef.current = null;
  }, [chatOpen]);

  // --- HELPERS CHAT ---
  const getUserLabel = (u: any) => {
    if (!u) return "Usuario";
    const full = [u?.name, u?.surname].filter(Boolean).join(" ").trim();
    return (u?.companyName || full || u?.email || "Usuario").trim();
  };

  const getUserAvatar = (u: any) => u?.companyLogo || u?.avatar || null;

  const resolveOtherUser = (t: any) => {
    if (t?.otherUser) return t.otherUser;
    const parts = Array.isArray(t?.participants) ? t.participants : [];
    const other = parts
      .map((p: any) => p?.user || p)
      .find((u: any) => String(u?.id || "") && String(u?.id || "") !== String(activeUserKey || ""));
    return other || null;
  };

  const getThreadTitle = (t: any) => {
    if (t?.title) return t.title;
    const ref = t?.refCode ? String(t.refCode) : "";
    const pt = t?.propertyTitle ? String(t.propertyTitle) : "";
    if (ref && pt) return `${ref} — ${pt}`;
    return ref || pt || "Conversación";
  };

  const isBlockedThread = (t: any) => {
    const other = resolveOtherUser(t);
    const oid = String(other?.id || "");
    return oid ? blockedUsers.has(oid) : false;
  };

  const scrollChatToBottom = () => {
    setTimeout(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(".chat-scroll") as HTMLElement | null;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
      });
    }, 0);
  };

  // --- ACCIONES CHAT ---
  const toggleBlockUser = (userId: string) => {
    const uid = String(userId || "").trim();
    if (!uid) return;

    setBlockedUsers((prev) => {
      const next = new Set(prev || []);
      const isBlocked = next.has(uid);
      if (isBlocked) next.delete(uid);
      else next.add(uid);

      try {
        if (typeof window !== "undefined") {
          const key = `stratos_chat_blocked_v1:${String(activeUserKey || "anon")}`;
          localStorage.setItem(key, JSON.stringify(Array.from(next)));
        }
      } catch {}

      addNotification(isBlocked ? "✅ Usuario desbloqueado" : "⛔ Usuario bloqueado");
      setChatConversationId(null);
      setChatMessages([]);
      return next;
    });
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const cid = String(conversationId || "").trim();
    if (!cid) return;
    if (!confirm("¿Borrar esta conversación y sus mensajes?")) return;

    setChatThreads((prev: any[]) => (Array.isArray(prev) ? prev : []).filter((t: any) => String(t?.id) !== cid));
    setUnreadByConv((prev) => {
      const next = { ...(prev || {}) };
      delete next[cid];
      return next;
    });

    if (String(chatConversationId || "") === cid) {
      setChatConversationId(null);
      setChatMessages([]);
    }

    try {
      const fn = deleteConversationAction as any;
      if (typeof fn !== "function") {
        addNotification("⚠️ Falta action deleteConversationAction");
        return;
      }
      const res = await fn(cid);
      if (!res?.success) {
        addNotification(res?.error ? `⚠️ ${res.error}` : "⚠️ No pude borrar");
        setDataVersion((v: number) => v + 1);
        return;
      }
      addNotification("🗑️ Conversación eliminada");
    } catch (e) {
      console.error(e);
      addNotification("⚠️ Error borrando conversación");
      setDataVersion((v: number) => v + 1);
    }
  };

  const markConversationAsRead = (conversationId: string, lastAt?: number) => {
    if (!conversationId) return;
    const ts = Number.isFinite(Number(lastAt)) ? Number(lastAt) : Date.now();
    lastSeenAtRef.current[String(conversationId)] = ts;

    setUnreadByConv((prev) => {
      if (!prev || !prev[String(conversationId)]) return prev;
      const next = { ...(prev || {}) };
      delete next[String(conversationId)];
      return next;
    });

    lastNotifiedAtRef.current[String(conversationId)] = ts;

    try {
      const fn = markConversationReadAction as any;
      if (typeof fn === "function") fn(String(conversationId), ts);
    } catch (e) {}
  };

const updateUnreadFromThreads = (threads: any[]) => {
  try {
    const next: Record<string, number> = {};

    (Array.isArray(threads) ? threads : []).forEach((t: any) => {
      const id = String(t?.id || "");
      if (!id) return;

      // si el chat está abierto, no lo contamos como unread en la Omni
    if (chatOpen && String(chatConversationId || "") === id) return;

      const count = Number(t?.unreadCount || (t?.unread ? 1 : 0) || 0);

      if (count > 0) {
        next[id] = count;

        const lastAt = Number(t?.lastMessageAt || 0);
        const notifiedAt = Number(lastNotifiedAtRef.current[id] || 0);

        if (lastAt && lastAt > notifiedAt) {
          const title = t?.title || t?.propertyTitle || t?.refCode || "Nuevo mensaje";
          addNotification(`📩 ${title}`);
          lastNotifiedAtRef.current[id] = lastAt;
        }
      }
    });

    setUnreadByConv(next);
  } catch (err) {
    console.warn("updateUnreadFromThreads failed:", err);
  }
};

  const openConversation = async (conversationId: string) => {
    if (!conversationId) return;
    setChatConversationId(conversationId);
    setChatLoading(true);

    try {
      const res = await (getConversationMessagesAction as any)(conversationId);
      if (res?.success) {
        const msgs = Array.isArray(res.data) ? res.data : [];
        setChatMessages(msgs);

        const lastMsg = msgs[msgs.length - 1];
        const lastAt = lastMsg?.createdAt ? new Date(lastMsg.createdAt).getTime() : Date.now();
        try {
          if (typeof markConversationAsRead === "function") markConversationAsRead(conversationId, lastAt);
        } catch (err) {}

        try { await (markConversationReadAction as any)(String(conversationId)); } catch {}
        scrollChatToBottom();
      } else {
        addNotification("⚠️ No puedo cargar mensajes");
      }
    } catch (e) {
      console.error(e);
      addNotification("⚠️ Error cargando mensajes");
    } finally {
      setChatLoading(false);
    }
  };

  const openChatPanel = async () => {
    setChatOpen(true);
    setActivePanel((prev: any) => (prev === "AI" ? "NONE" : prev));
    setChatConversationId(null);
    setChatMessages([]);
    setChatLoading(true);

    try {
      const listFn = listMyConversationsAction as any;
      if (typeof listFn !== "function") {
        addNotification("⚠️ Falta action: getMyConversationsAction");
        return;
      }
      const res = await listFn();
      if (res?.success) {
        const threads = Array.isArray(res.data) ? res.data : [];
        setChatThreads(threads);
        if (typeof updateUnreadFromThreads === "function") updateUnreadFromThreads(threads);
      } else {
        addNotification("⚠️ No puedo listar conversaciones");
      }
    } catch (e) {
      console.error(e);
      addNotification("⚠️ Error cargando conversaciones");
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChat = async () => {
    const text = String(chatInput || "").trim();
    if (!text || !chatConversationId) return;

    setChatInput("");
    const tempId = `tmp-${Date.now()}`;
    const optimistic = { id: tempId, text, content: text, senderId: String(activeUserKey || "anon"), createdAt: new Date().toISOString() };

    setChatMessages((prev: any[]) => [...(Array.isArray(prev) ? prev : []), optimistic]);
    scrollChatToBottom();

    try {
      let res: any = null;
      try { res = await (sendMessageAction as any)(chatConversationId, text); } catch {}
      if (!res?.success) { try { res = await (sendMessageAction as any)({ conversationId: chatConversationId, text }); } catch {} }
      if (!res?.success) { try { res = await (sendMessageAction as any)({ conversationId: chatConversationId, content: text }); } catch {} }
      if (!res?.success) { try { res = await (sendMessageAction as any)(text, chatConversationId); } catch {} }

      if (res?.success && res?.data) {
        const serverMsg = res.data;
        const normalized = { ...serverMsg, text: serverMsg?.text ?? serverMsg?.content ?? text, content: serverMsg?.content ?? serverMsg?.text ?? text };
        setChatMessages((prev: any[]) => (Array.isArray(prev) ? prev : []).map((m: any) => (m.id === tempId ? normalized : m)));

        const sentAt = normalized?.createdAt ? new Date(normalized.createdAt).getTime() : Date.now();
        try { if (typeof markConversationAsRead === "function") markConversationAsRead(String(chatConversationId), sentAt); } catch {}
        try { await (markConversationReadAction as any)(String(chatConversationId)); } catch {}

        scrollChatToBottom();
        return;
      }
      setChatMessages((prev: any[]) => (Array.isArray(prev) ? prev : []).filter((m: any) => m.id !== tempId));
      addNotification(res?.error ? `❌ ${res.error}` : "❌ No se pudo enviar");
    } catch (e) {
      console.error(e);
      setChatMessages((prev: any[]) => (Array.isArray(prev) ? prev : []).filter((m: any) => m.id !== tempId));
      addNotification("❌ Error enviando");
    }
  };

  // --- CLOUDINARY UPLOAD ---
  const uploadChatFileToCloudinary = (file: File) => {
    const cloudName = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dn11trogr").trim();
    const uploadPreset = (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "stratos_upload").trim();
    if (!cloudName || !uploadPreset) throw new Error("Cloudinary configs missing");
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", uploadPreset);
    fd.append("folder", "stratos/chat");

    setChatUploadProgress(0);
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint);
      xhr.upload.onprogress = (ev) => {
        if (!ev.lengthComputable) return;
        const pct = Math.max(0, Math.min(100, Math.round((ev.loaded / ev.total) * 100)));
        setChatUploadProgress(pct);
        const tempId = chatUploadTempIdRef.current;
        if (tempId) {
          setChatMessages((prev: any[]) =>
            (Array.isArray(prev) ? prev : []).map((m: any) => (String(m?.id) === String(tempId) ? { ...m, __progress: pct } : m))
          );
        }
      };
      xhr.onerror = () => reject(new Error("Upload fallido (network)"));
      xhr.onload = () => {
        try {
          const ok = xhr.status >= 200 && xhr.status < 300;
          const data = JSON.parse(xhr.responseText || "{}");
          if (!ok) return reject(new Error(data?.error?.message || `Upload fallido (${xhr.status})`));
          const delivered = String(data?.secure_url || "").trim();
          if (!delivered) return reject(new Error("Cloudinary no devolvió secure_url"));
          if (!/^https?:\/\/res\.cloudinary\.com\//i.test(delivered)) return reject(new Error("URL no pública"));
          setChatUploadProgress(100);
          resolve(delivered);
        } catch (e: any) {
          reject(new Error(e?.message || "Upload: respuesta inválida"));
        }
      };
      xhr.send(fd);
    });
  };

  const handlePickChatFile = () => { try { chatFileInputRef.current?.click?.(); } catch {} };

  const handleChatFileSelected = async (e: any) => {
    const file: File | null = e?.target?.files?.[0] || null;
    if (e?.target) e.target.value = "";
    if (!file) return;
    if (!chatConversationId) return addNotification("⚠️ Selecciona una conversación");

    setChatUploading(true);
    setChatUploadProgress(0);

    const localPreview = file.type?.startsWith("image/") ? URL.createObjectURL(file) : null;
    const tempId = `tmp-upload-${Date.now()}`;
    chatUploadTempIdRef.current = tempId;

    setChatMessages((prev: any[]) => [
      ...(Array.isArray(prev) ? prev : []),
      { id: tempId, text: localPreview || `⏳ Subiendo: ${file.name}`, content: localPreview || `⏳ Subiendo: ${file.name}`, senderId: String(activeUserKey || "anon"), createdAt: new Date().toISOString(), __uploading: true, __filename: file.name, __progress: 0 },
    ]);
    scrollChatToBottom();
    await Promise.resolve();

    try {
      const url = await uploadChatFileToCloudinary(file);
      if (!url) {
        setChatMessages((prev: any[]) => (Array.isArray(prev) ? prev : []).filter((m: any) => m?.id !== tempId));
        return addNotification("⚠️ No recibí URL del upload");
      }

      setChatMessages((prev: any[]) => (Array.isArray(prev) ? prev : []).map((m: any) => (m.id === tempId ? { ...m, text: url, content: url, __uploading: false, __progress: 100 } : m)));
      scrollChatToBottom();
      if (localPreview) { try { URL.revokeObjectURL(localPreview); } catch {} }

      let res: any = null;
      try { res = await (sendMessageAction as any)(chatConversationId, url); } catch {}
      if (!res?.success) { try { res = await (sendMessageAction as any)({ conversationId: chatConversationId, text: url }); } catch {} }
      if (!res?.success) { try { res = await (sendMessageAction as any)({ conversationId: chatConversationId, content: url }); } catch {} }

      if (res?.success && res?.data) {
        const serverMsg = res.data;
        const normalized = { ...serverMsg, text: serverMsg?.text ?? serverMsg?.content ?? url, content: serverMsg?.content ?? serverMsg?.text ?? url, __uploading: false, __progress: 100 };
        setChatMessages((prev: any[]) => (Array.isArray(prev) ? prev : []).map((m: any) => (m.id === tempId ? normalized : m)));
        scrollChatToBottom();
        const sentAt = normalized?.createdAt ? new Date(normalized.createdAt).getTime() : Date.now();
        markConversationAsRead(String(chatConversationId), sentAt);
        return addNotification("✅ Archivo enviado");
      }
      addNotification(res?.error ? `⚠️ ${res.error}` : "⚠️ Subido pero no pude enviar");
    } catch (err: any) {
      console.error(err);
      setChatMessages((prev: any[]) => (Array.isArray(prev) ? prev : []).filter((m: any) => m?.id !== tempId));
      if (localPreview) { try { URL.revokeObjectURL(localPreview); } catch {} }
      addNotification(`❌ Upload: ${err?.message || "falló"}`);
    } finally {
      setChatUploading(false);
    }
  };

  const tryOpenDetailsFromThread = async (t: any) => {
    try {
      if (typeof window === "undefined") return;
      if (!t) return;
      
      const pidRaw = t?.propertyId || t?.property?.id || t?.property?.propertyId || t?.property?.uuid || null;
      const pid = pidRaw ? String(pidRaw).trim() : "";
      if (!pid) return;

      // 🔥 ORDEN INMEDIATA DE VUELO (Conectado al radar existente 'map-fly-to')
      if (t?.property?.longitude && t?.property?.latitude) {
          window.dispatchEvent(new CustomEvent("map-fly-to", {
              detail: { 
                  center: [Number(t.property.longitude), Number(t.property.latitude)],
                  zoom: 19,
                  pitch: 60,
                  duration: 2500
              }
          }));
      }

      const fn = getPropertyByIdAction as any;
      if (typeof fn !== "function") return;

      const res = await fn(pid);
      if (!res?.success || !res?.data) return;
      
      // 🔥 ORDEN DE ABRIR PANEL
      window.dispatchEvent(new CustomEvent("open-details-signal", { detail: res.data }));
      
      // 🔥 ORDEN DE VUELO DE RESPALDO (Por si la memoria caché falló)
      if (res.data.longitude && res.data.latitude) {
          window.dispatchEvent(new CustomEvent("map-fly-to", {
              detail: { 
                  center: [Number(res.data.longitude), Number(res.data.latitude)],
                  zoom: 19,
                  pitch: 60,
                  duration: 2500
              }
          }));
      }

    } catch (e) {
      console.warn("tryOpenDetailsFromThread failed:", e);
    }
  };

  // --- POLLING CHAT (El Motor de Respaldo Original) ---
  useEffect(() => {
    if (!identityVerified || !activeUserKey || activeUserKey === "anon") return;
    let alive = true;
    let timer: any = null;

    const poll = async () => {
      try {
        const listFn = listMyConversationsAction as any;
        if (typeof listFn === "function") {
          const res = await listFn();
          if (!alive) return;
          if (res?.success) {
            const threads = Array.isArray(res.data) ? res.data : [];
            setChatThreads(threads);
            if (typeof updateUnreadFromThreads === "function") updateUnreadFromThreads(threads);
          }
        }

        if (chatOpen && chatConversationId) {
          const msgFn = getConversationMessagesAction as any;
          if (typeof msgFn === "function") {
            const r2 = await msgFn(String(chatConversationId));
            if (!alive) return;
            if (r2?.success) {
              const nextMsgs = Array.isArray(r2.data) ? r2.data : [];
              setChatMessages((prev: any[]) => {
                const prevArr = Array.isArray(prev) ? prev : [];
                const prevLast = prevArr[prevArr.length - 1];
                const nextLast = nextMsgs[nextMsgs.length - 1];
                const prevKey = prevLast ? `${prevLast.id || ""}|${prevLast.createdAt || ""}` : "";
                const nextKey = nextLast ? `${nextLast.id || ""}|${nextLast.createdAt || ""}` : "";
                if (prevArr.length === nextMsgs.length && prevKey === nextKey) return prevArr;
                return nextMsgs;
              });

              try {
                const last = nextMsgs[nextMsgs.length - 1];
                const lastAt = last?.createdAt ? new Date(last.createdAt).getTime() : Date.now();
                if (typeof markConversationAsRead === "function") markConversationAsRead(String(chatConversationId), lastAt);
                scrollChatToBottom();
              } catch {}
            }
          }
        }
      } catch (e) {
        console.warn("chat poll failed", e);
      }
    };

    poll();
    timer = setInterval(poll, 12000);
    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  }, [identityVerified, activeUserKey, chatConversationId, chatOpen]);

  // 🌍 WEBSOCKET GLOBAL: actualiza Omni / threads aunque el chat esté cerrado
useEffect(() => {
  if (!identityVerified || !activeUserKey || activeUserKey === "anon") return;

  const pusher = getPusherClient();
  if (!pusher) return;

  const channelName = `user-${activeUserKey}`;
  const channel = pusher.subscribe(channelName);

  const refreshThreadsFromServer = async () => {
    try {
      const listFn = listMyConversationsAction as any;
      if (typeof listFn !== "function") return;

      const res = await listFn();
      if (!res?.success) return;

      const threads = Array.isArray(res.data) ? res.data : [];
      setChatThreads(threads);
      updateUnreadFromThreads(threads);
    } catch (e) {
      console.warn("global websocket refresh failed:", e);
    }
  };

  const onGlobalMessage = async (newMsg: any) => {
    await refreshThreadsFromServer();
  };

  channel.bind("new-message", onGlobalMessage);

  return () => {
    channel.unbind("new-message", onGlobalMessage);
    pusher.unsubscribe(channelName);
  };
}, [identityVerified, activeUserKey, chatConversationId]);

  // 🔥🔥🔥 WEBSOCKETS: RECEPTOR DE SEÑAL EN TIEMPO REAL (PUSHER) 🔥🔥🔥
  useEffect(() => {
  // solo escuchamos la sala si el chat está realmente abierto
  if (!chatOpen || !chatConversationId) return;
    // Encendemos la antena
    const pusher = getPusherClient();
    if (!pusher) return;

    // Sintonizamos el canal exacto de esta conversación
    const channelName = `chat-${chatConversationId}`;
    const channel = pusher.subscribe(channelName);

    // Cuando caiga un mensaje del satélite...
    channel.bind("new-message", (newMsg: any) => {
      console.log("📡 [PUSHER] ¡Mensaje interceptado en vivo!:", newMsg);

      setChatMessages((prev: any[]) => {
        const arr = Array.isArray(prev) ? prev : [];
        
        // 🛡️ Filtro Anti-Eco: Si el mensaje ya lo habíamos pintado nosotros mismos (Optimistic UI), lo ignoramos
        const alreadyExists = arr.some(
          (m) => String(m.id) === String(newMsg.id) || 
                 (m.text === newMsg.text && m.senderId === newMsg.senderId && Date.now() - new Date(m.createdAt || Date.now()).getTime() < 5000)
        );
        
        if (alreadyExists) return arr;

        // Si es nuevo de verdad, lo metemos al final de la lista al instante
        return [...arr, newMsg];
      });

      // Lo marcamos como leído automáticamente y bajamos el scroll
      const sentAt = newMsg.createdAt ? new Date(newMsg.createdAt).getTime() : Date.now();
      if (typeof markConversationAsRead === "function") {
        markConversationAsRead(String(chatConversationId), sentAt);
      }
      scrollChatToBottom();
    });

   // 🧹 Limpieza táctica: Cuando cerramos el chat o cambiamos de conversación, apagamos la radio de este canal
    return () => {
      channel.unbind("new-message");
      pusher.unsubscribe(channelName);
    };
  }, [chatOpen, chatConversationId]);

  
  return {
    chatOpen, setChatOpen,
    chatThreads, setChatThreads,
    chatConversationId, setChatConversationId,
    chatMessages, setChatMessages,
    chatInput, setChatInput,
    chatLoading,
    unreadTotal,
    unreadByConv,
    chatFileInputRef, chatUploading, handlePickChatFile, handleChatFileSelected,
    openChatPanel, openConversation, handleSendChat, handleDeleteConversation,
    toggleBlockUser, isBlockedThread, tryOpenDetailsFromThread,
    getUserLabel, getUserAvatar, getThreadTitle, resolveOtherUser,
    blockedUsers, updateUnreadFromThreads
  };
};