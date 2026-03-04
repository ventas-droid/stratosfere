// Ubicación: ./app/components/alive-map/ui-panels/StratosChatWindow.tsx
import React from "react";
import { X, Lock, Unlock, Trash2, Camera, Send } from "lucide-react";
import { extractFirstUrl, isImageUrl } from "../../../utils/propertyCore";

export default function StratosChatWindow({
  chatEngine,
  systemMode,
  ownerProposals,
  setActiveCampaignId,
  activeUserKey,
  addNotification,
  setRightPanel // 👈 ¡AÑADA ESTA LÍNEA AQUÍ!
}: any) {

  // Extraemos las herramientas del motor que necesitamos para pintar la interfaz
  const {
    chatOpen, setChatOpen, chatThreads, chatConversationId, setChatConversationId,
    chatMessages, setChatMessages, chatInput, setChatInput, chatLoading,
    unreadTotal, unreadByConv, chatFileInputRef, chatUploading, handlePickChatFile,
    handleChatFileSelected, openChatPanel, openConversation, handleSendChat, handleDeleteConversation,
    toggleBlockUser, isBlockedThread, tryOpenDetailsFromThread, getUserLabel,
    getUserAvatar, getThreadTitle, resolveOtherUser, blockedUsers
  } = chatEngine;

  if (!chatOpen) return null;

  return (
  <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[680px] max-w-[95vw] z-[20000] pointer-events-auto">
    <div className="animate-fade-in glass-panel rounded-3xl border border-white/10 bg-[#050505]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col h-[520px]">

      {/* Header */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-black tracking-widest text-white uppercase">COMMS LINK</span>
            <span className="text-[10px] text-white/40 font-mono">
              {unreadTotal > 0 ? `UNREAD ${unreadTotal}` : "ONLINE"}
            </span>
          </div>
        </div>

        <button
          onClick={() => setChatOpen(false)}
          className="text-white/30 hover:text-white transition-colors p-2"
          title="Cerrar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body 2-column */}
      <div className="flex-1 min-h-0 grid grid-cols-5">

        {/* LEFT: threads */}
        <div className="col-span-2 min-h-0 border-r border-white/10 overflow-y-auto custom-scrollbar">
          <div className="p-3">
            {(chatThreads || []).length === 0 && !chatLoading ? (
              <div className="bg-white/10 p-3 rounded-2xl text-xs text-white/70 border border-white/5">
                No hay conversaciones todavía. Abre una desde Details con “MENSAJE”.
              </div>
            ) : null}
          </div>

          <div className="px-3 pb-3 space-y-2">
            {(chatThreads || []).map((t: any) => {
              const id = String(t?.id || "");
              if (!id) return null;

              const other = resolveOtherUser(t);
              const otherName = getUserLabel(other);
              const avatar = getUserAvatar(other);
              const title = getThreadTitle(t);

              const snippet =
                t?.lastMessage?.text ||
                t?.lastMessage?.content ||
                t?.lastMessage ||
                "";

              const blocked = isBlockedThread(t);
              const active = String(chatConversationId || "") === id;
              const unread = Number(unreadByConv?.[id] || 0) > 0;

           return (
                <button
                  key={id}
                  onClick={async () => {
                    if (blocked) {
                      // 🔥 LA LLAVE MAESTRA: Si está bloqueado, le damos la opción de indulto al hacer clic
                      if (window.confirm(`¿Desea desbloquear a ${otherName} y restaurar las comunicaciones?`)) {
                          toggleBlockUser(String(other?.id));
                      }
                      return;
                    }

    // ✅ 1) abre Details (si hay property) y espera a que cargue del server si hace falta
    await tryOpenDetailsFromThread(t);

    // ✅ 2) abre el chat
    await openConversation(id);

    // ✅ 3) SOLO en EXPLORER (particular) podemos abrir OwnerProposalsPanel
if (systemMode === "EXPLORER") {
  const hasPropCtx = !!(
    t?.propertyId ||
    t?.property?.id ||
    t?.refCode ||
    t?.propertyRef ||
    /\bSF-[A-Z0-9-]+\b/i.test(String(title || ""))
  );

  if (hasPropCtx) {
    setRightPanel("OWNER_PROPOSALS");

    // si ya está en memoria, abre directamente el expediente correcto
    const match = (Array.isArray(ownerProposals) ? ownerProposals : []).find(
      (p: any) => String(p?.conversationId || "") === String(id)
    );

    setActiveCampaignId(match?.id ? String(match.id) : null);
  }
}

  }}
  className={`w-full text-left border rounded-2xl p-3 transition-all ${
    active
      ? "bg-blue-500/15 border-blue-500/30"
      : "bg-white/5 hover:bg-white/10 border-white/10"
  } ${blocked ? "opacity-40" : ""}`}
>
  <div className="flex items-center gap-3">
    {/* avatar */}
    <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 border border-white/10 shrink-0 flex items-center justify-center">
      {avatar ? (
        <img src={avatar} className="w-full h-full object-cover" alt="" />
      ) : (
        <span className="text-[10px] font-black text-white/60">
          {String(otherName || "U").slice(0, 1).toUpperCase()}
        </span>
      )}
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-black tracking-widest text-white uppercase truncate">
          {otherName}
        </div>
        <div className="flex items-center gap-2">
          {unread && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
          {blocked && <span className="text-[9px] text-white/30 font-mono">BLOCK</span>}
        </div>
      </div>

      <div className="mt-0.5 text-[10px] text-white/50 font-mono truncate">
        {title}
      </div>

      <div className="mt-1 text-[10px] text-white/40 line-clamp-2">
        {snippet ? String(snippet) : "Sin mensajes aún"}
      </div>
    </div>
  </div>
</button>

              );
            })}
          </div>
        </div>

        {/* RIGHT: conversation */}
        <div className="col-span-3 min-h-0 flex flex-col">
          {/* header right */}
          <div className="p-3 border-b border-white/10 bg-black/20 flex items-center justify-between">
            {chatConversationId ? (
              (() => {
                const t = (chatThreads || []).find((x: any) => String(x?.id) === String(chatConversationId));
                const other = resolveOtherUser(t);
                const otherName = getUserLabel(other);
                const avatar = getUserAvatar(other);
                const blocked = other?.id ? blockedUsers.has(String(other.id)) : false;

                return (
                  <div className="flex items-center justify-between w-full gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 border border-white/10 shrink-0 flex items-center justify-center">
                        {avatar ? (
                          <img src={avatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-[10px] font-black text-white/60">
                            {String(otherName || "U").slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-black tracking-widest text-white uppercase truncate">
                          {otherName}
                        </div>
                        <div className="text-[10px] text-white/40 font-mono truncate">
                          {t ? getThreadTitle(t) : "Conversación"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* bloquear / desbloquear */}
                      {other?.id ? (
                        <button
                          onClick={() => toggleBlockUser(String(other.id))}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
                          title={blocked ? "Desbloquear" : "Bloquear"}
                        >
                          {blocked ? <Unlock size={16} /> : <Lock size={16} />}
                        </button>
                      ) : null}

                      {/* borrar conversación */}
                      <button
                        onClick={() => handleDeleteConversation(String(chatConversationId))}
                        className="p-2 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10 text-white/70 hover:text-red-300 transition-all"
                        title="Borrar conversación"
                      >
                        <Trash2 size={16} />
                      </button>

                      {/* volver */}
                      <button
                        onClick={() => {
                          setChatConversationId(null);
                          setChatMessages([]);
                        }}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black tracking-widest uppercase text-white/70 hover:text-white transition-all"
                        title="Volver a la lista"
                      >
                        ← Volver
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-[10px] text-white/40 tracking-widest uppercase">
                Selecciona una conversación a la izquierda
              </div>
            )}
          </div>

   {/* messages */}
<div className="chat-scroll flex-1 min-h-0 p-3 overflow-y-auto custom-scrollbar space-y-2">
  {chatLoading && (
    <div className="text-[10px] text-white/40 tracking-widest uppercase">
      Cargando...
    </div>
  )}

  {!chatConversationId && !chatLoading ? (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white/60">
      Aquí verás los mensajes. La lista de la izquierda mantiene tus threads.
    </div>
  ) : null}

  {chatConversationId ? (
    (chatMessages || []).length === 0 && !chatLoading ? (
      <div className="bg-white/10 p-3 rounded-2xl text-xs text-white/70 border border-white/5">
        Aún no hay mensajes. Envía el primero.
      </div>
    ) : (
      <div className="space-y-2">
        {(chatMessages || []).map((m: any) => {
          const mine = String(m?.senderId || "") === String(activeUserKey || "");
          const text = m?.text ?? m?.content ?? "";

          const uploading = !!m?.__uploading;
          const pct = Math.max(0, Math.min(100, Number(m?.__progress || 0)));

          const s = String(text || "").trim();
          const media = extractFirstUrl(s) || s;
          const isImg = isImageUrl(media);
          const isUrl =
            /^https?:\/\//i.test(media) ||
            /^blob:/i.test(media) ||
            /^data:image\//i.test(media);

          return (
            <div
              key={String(m?.id || Math.random())}
              className={`max-w-[90%] p-3 rounded-2xl text-xs border ${
                mine
                  ? "ml-auto bg-blue-500/20 border-blue-500/30 text-white"
                  : "mr-auto bg-white/10 border-white/10 text-white/80"
              } ${mine ? "rounded-tr-none" : "rounded-tl-none"}`}
            >
              {/* contenido */}
              {isImg ? (
                <a href={media} target="_blank" rel="noreferrer" className="block">
                  <img
                    src={media}
                    className="max-w-full rounded-xl border border-white/10"
                    alt="Adjunto"
                  />
                </a>
              ) : isUrl ? (
                <a
                  href={media}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-white/90 break-all"
                >
                  {media}
                </a>
              ) : (
                s || <span className="text-white/30">...</span>
              )}

              {/* progreso moderno */}
              {uploading && (
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-blue-400 transition-all"
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-white/50 font-mono">
                    Subiendo… {pct}%
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )
  ) : null}
</div>

{/* footer input */}
<div className="p-3 border-t border-white/10 bg-black/20 pointer-events-auto">
  <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10 pointer-events-auto">
    {/* input oculto (imagen/pdf) */}
    <input
      ref={chatFileInputRef}
      type="file"
      accept="image/*,application/pdf"
      className="hidden"
      onChange={handleChatFileSelected}
    />

    {/* adjuntos (Cloudinary) */}
    <button
      type="button"
      onClick={handlePickChatFile}
disabled={chatUploading}
      className="text-white/40 hover:text-white transition-colors pointer-events-auto disabled:opacity-30"
      title={!chatConversationId ? "Selecciona una conversación" : "Adjuntar (Cloudinary)"}
    >
      <Camera size={14} />
    </button>

   <input
      autoFocus
      value={chatInput}
      onChange={(e) => setChatInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSendChat();
        }
      }}
      placeholder={
        !chatConversationId
          ? "Selecciona una conversación..."
          : chatUploading
          ? "Subiendo archivo..."
          : "Transmitir mensaje..."
      }
      disabled={!chatConversationId || chatUploading}
      className="pointer-events-auto bg-transparent w-full text-xs text-white outline-none placeholder-white/20 disabled:opacity-40"
    />

    <button
      type="button"
      onClick={handleSendChat}
      disabled={!chatConversationId || chatUploading || !String(chatInput || "").trim()}
      className="text-blue-400 hover:text-blue-300 disabled:opacity-30 pointer-events-auto"
      title="Enviar"
    >
      <Send size={14} />
    </button>
  </div>
</div>


        </div>
      </div>

    </div>
  </div>
  );
}