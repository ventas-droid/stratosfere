"use client";

import React, { useMemo, useState } from "react";
import {
  X,
  ArrowLeft,
  Check,
  XCircle,
  MessageCircle,
  Mail,
  Phone,
  Building2,
  MapPin,
  Sparkles,
  Loader2,
  Globe,
  Key,
  Copy,
  ShieldCheck 
} from "lucide-react";

// 🔥 IMPORTANTE: La acción del servidor para aceptar/rechazar propuesta y el comunicador de chat
import { respondToCampaignAction, sendMessageAction } from "@/app/actions";
// --- TIPOS ---
type Visibility = "PRIVATE" | "AGENCIES" | "PUBLIC";

export type OwnerProposal = {
  id: string; // campaignId
  status?: "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | string;
  createdAt?: string | number | Date;

  property?: {
    id?: string;
    title?: string;
    refCode?: string;
    location?: string;
    address?: string;
    rawPrice?: number | string;
    price?: number | string;
  };

 // Busque esto al principio:
  agency?: {
    id?: string;
    name?: string;
    companyName?: string;
    avatar?: string;
    companyLogo?: string; // <--- ¡AÑADA ESTA LÍNEA!
    coverImage?: string;
    phone?: string;
    mobile?: string;
    email?: string;
  };

  services?: Array<
    | string
    | {
        id?: string;
        label?: string;
        mode?: "ONLINE" | "OFFLINE";
      }
  >;

  terms?: {
    exclusive?: boolean;
    months?: number;
    commissionPct?: number;
    ivaPct?: number;

    commissionBaseEur?: number;
    ivaAmountEur?: number;
    commissionTotalEur?: number;

    sharePct?: number;
    shareVisibility?: Visibility;
    shareEstimatedEur?: number;
  };

  message?: string;
  conversationId?: string;
};

// --- HELPERS ---
function euro(v: any) {
  const n = Number(String(v ?? "").replace(",", "."));
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function pct(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `${n}%`;
}
function formatEuro(value: number | string) {
  const n = Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function safeText(v: any) {
  return String(v ?? "").trim();
}

function statusMeta(s?: string) {
  const v = (s || "SENT").toUpperCase();
  if (v === "ACCEPTED")
    return {
      label: "Aceptada",
      cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    };
  if (v === "REJECTED")
    return {
      label: "Rechazada",
      cls: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    };
  if (v === "EXPIRED")
    return {
      label: "Expirada",
      cls: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    };
  return {
    label: "Nueva",
    cls: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  };
}

function buildDefaultMessage(p: OwnerProposal) {
  const ref = p?.property?.refCode ? `(${p.property.refCode})` : "";
  const months = p?.terms?.months ?? 6;
  const ex = p?.terms?.exclusive ? "Exclusiva" : "No exclusiva";
  const cPct = p?.terms?.commissionPct ?? 3;
  const ivaPct = p?.terms?.ivaPct ?? 21;
  const total = p?.terms?.commissionTotalEur;
  const base = p?.terms?.commissionBaseEur;
  const iva = p?.terms?.ivaAmountEur;

  const services = (p?.services || [])
    .map((x: any) => (typeof x === "string" ? x : x?.label || x?.id))
    .filter(Boolean);

  const parts = [
    `Propuesta de gestión ${ref}. Mandato: ${ex} (${months} meses).`,
    `Comisión ${cPct}% + IVA ${ivaPct}%.`,
  ];

  if (Number.isFinite(Number(total))) {
    parts.push(`Importe: ${euro(base)} + IVA ${euro(iva)} = ${euro(total)}.`);
  }

  if (services.length > 0) {
    parts.push(`Incluye ${services.length} servicios.`);
  }

  return parts.join(" ");
}

// --- COMPONENTE PRINCIPAL ---
export default function OwnerProposalsPanel({
  rightPanel,
  toggleRightPanel,
  activeCampaignId,
  setActiveCampaignId,
  proposals = [],
  onAccept,
  onReject,
  soundEnabled,
  playSynthSound,
}: {
  rightPanel: any;
  toggleRightPanel: (p: any) => void;
  activeCampaignId: string | null;
  setActiveCampaignId?: (id: string | null) => void;
  proposals?: OwnerProposal[];
  onAccept?: (campaignId: string) => void | Promise<void>;
  onReject?: (campaignId: string) => void | Promise<void>;
  soundEnabled?: boolean;
  playSynthSound?: (k: string) => void;
}) {
  // ✅ ESTADO CORREGIDO: Objeto { id, decision }
  const [processing, setProcessing] = useState<{ id: string; decision: "ACCEPT" | "REJECT" } | null>(null);

  // 🛡️ ESTADOS DEL BÚNKER LEGAL
  const [showLegalModal, setShowLegalTerms] = useState<string | null>(null);
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);

  // 🚨 ESTADO DEL BOTÓN ROJO (NUEVO)
  const [showRevokeModal, setShowRevokeModal] = useState<string | null>(null);

  // --- LÓGICA DE ESTADO (HÍBRIDA: PADRE O LOCAL) ---
  const [localCampaignId, setLocalCampaignId] = useState<string | null>(null);
  const isControlled = typeof setActiveCampaignId === "function";
  const effectiveCampaignId = isControlled 
    ? (activeCampaignId ?? null) 
    : (localCampaignId ?? null);

  // MEMO: Calculamos el item seleccionado basándonos en el ID efectivo
  const items = Array.isArray(proposals) ? proposals : [];
  const selected = useMemo(() => {
    if (!effectiveCampaignId) return null;
    return items.find((x) => String(x.id) === String(effectiveCampaignId)) || null;
  }, [effectiveCampaignId, items]);

  // --- HANDLERS UNIFICADOS ---
  const handleSelectionChange = (newId: string | null) => {
    if (isControlled) {
      // @ts-ignore
      setActiveCampaignId(newId);
    } else {
      setLocalCampaignId(newId);
    }
  };

  const openDetail = (id: string) => {
    if (soundEnabled && playSynthSound) playSynthSound("click");
    handleSelectionChange(String(id));
  };

  const openChat = (e: React.MouseEvent, p: OwnerProposal) => {
    e.preventDefault();
    e.stopPropagation(); 
    if (soundEnabled && playSynthSound) playSynthSound("click");

    const toUserId = String(p?.agency?.id || "").trim();
    const propertyId = String(p?.property?.id || "").trim();
    const conversationId = String((p as any)?.conversationId || "").trim();

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-chat-signal", {
          detail: {
            conversationId,
            toUserId,
            propertyId,
            campaignId: p.id,
          },
        })
      );
    }
  };

  if (rightPanel !== "OWNER_PROPOSALS") return null;

 // 🤝 NUEVO MISIL DIPLOMÁTICO: SOLICITAR REUNIÓN / ASESORAMIENTO
  const handleRequestMeeting = async (e: React.MouseEvent, p: OwnerProposal) => {
    e.stopPropagation();
    if (soundEnabled && playSynthSound) playSynthSound("click");

    const cid = p.conversationId;
    if (!cid) return;

    try {
        // Disparamos el mensaje automático para agendar
        await sendMessageAction({
            conversationId: String(cid),
            text: "🤝 Hola. He estado revisando la propuesta de gestión y me gustaría solicitar una reunión o llamada de asesoramiento con vosotros para aclarar un par de detalles antes de formalizar el traspaso. ¿Qué disponibilidad de agenda tenéis para los próximos días?"
        });

        // Abrimos el canal de comunicaciones (el chat) automáticamente para que vea que se ha enviado
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("open-chat-signal", { 
                detail: { conversationId: String(cid) } 
            }));
        }
    } catch (err) {
        console.error("Error al solicitar reunión:", err);
    }
  };
 
 
  // 🔥 LÓGICA DE DECISIÓN CORREGIDA Y BLINDADA CON AUTORESPUESTA DE CHAT 🔥
  const handleDecision = async (
    e: React.MouseEvent,
    id: string,
    decision: "ACCEPT" | "REJECT"
  ) => {
    e.stopPropagation();
    
    // Si ya estamos procesando algo, salir
    if (processing) return;

    // Activar bloqueo específico
    setProcessing({ id, decision });

    try {
      // 1. LLAMADA AL SERVIDOR PARA ACEPTAR/RECHAZAR LA CAMPAÑA
      const res = await respondToCampaignAction(id, decision);

      if (res.success) {
        // 2. ÉXITO (VISUAL Y SONORO)
        if (decision === "ACCEPT") {
            if (soundEnabled && playSynthSound) playSynthSound("success");
            if (onAccept) await onAccept(id);
            
          // 🚀 INYECCIÓN TÁCTICA: EL CONTRATO DIGITAL AL CHAT 🚀
            const cid = selected?.conversationId;
            if (cid) {
                try {
                    // 💶 Filtro de Formateo de Moneda
                    const rawPrice = selected?.property?.rawPrice || selected?.property?.price || 0;
                    const precioStr = String(rawPrice).replace(/\D/g, ''); // Quitamos letras por si acaso
                    const precioFormateado = precioStr ? new Intl.NumberFormat("es-ES").format(Number(precioStr)) + " €" : "Consultar";

                    const contratoText = `📜 ACTA DE TRASPASO DE MANDO 📜\n\nEl propietario ha aceptado formalmente la propuesta y cede los derechos comerciales del expediente para su comercialización.\n\n• Ref: ${selected?.property?.refCode || "SF-N/A"}\n• Precio Base: ${precioFormateado}\n• Comisión Acordada: ${selected?.terms?.commissionPct}% + IVA\n• Mandato: ${selected?.terms?.exclusive ? "Exclusiva" : "No Exclusiva"} (${selected?.terms?.months} meses)\n\n⚠️ Stratosfere OS actúa únicamente como enlace tecnológico entre las partes.`;

                    await sendMessageAction({
                        conversationId: String(cid),
                        text: contratoText
                    });
                    
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("open-chat-signal", { 
                            detail: { conversationId: String(cid) } 
                        }));
                    }
                } catch (chatErr) {
                    console.error("Fallo al enviar el auto-mensaje de aceptación", chatErr);
                }
            }

        } else {
            if (soundEnabled && playSynthSound) playSynthSound("error");
            if (onReject) await onReject(id);
        }

        // 3. ACTUALIZAR RADARES
        if (typeof window !== "undefined") {
            window.dispatchEvent(
            new CustomEvent("respond-campaign-signal", {
                detail: { campaignId: id, decision },
            })
            );
        }
        
        // 4. LIMPIAR SELECCIÓN TRAS ÉXITO
        handleSelectionChange(null);

      } else {
        alert("Error: " + (res.error || "No se pudo procesar la solicitud"));
      }
    } catch (err) {
      console.error("Error crítico en decisión de campaña", err);
      alert("Error de conexión");
    } finally {
      // Liberar bloqueo siempre
      setProcessing(null);
    }
  };

// 💥 MISIL DE RUPTURA: REVOCAR MANDATO
  const handleRevoke = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (processing) return;
    
    // Bloqueamos la interfaz
    setProcessing({ id, decision: "REJECT" }); 

    try {
      // Usamos REJECT para romper el lazo en la base de datos
      const res = await respondToCampaignAction(id, "REJECT");
      
      if (res.success) {
        if (soundEnabled && playSynthSound) playSynthSound("error"); // Sonido de alerta
        
        // 🚀 DISPARO DEL MENSAJE FRÍO DE RUPTURA AL CHAT
        const cid = selected?.conversationId;
        if (cid) {
            try {
                await sendMessageAction({
                    conversationId: String(cid),
                    text: "🛑 [AVISO DEL SISTEMA] El propietario ha revocado unilateralmente los derechos de gestión digital sobre este expediente. El acceso de la agencia ha sido suspendido."
                });
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("open-chat-signal", { detail: { conversationId: String(cid) } }));
                }
            } catch (chatErr) {
                console.error("Error al enviar mensaje de revocación", chatErr);
            }
        }

        // Actualizar radares visuales
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("respond-campaign-signal", { detail: { campaignId: id, decision: "REJECT" } }));
        }
        handleSelectionChange(null);
      } else {
        alert("Error al revocar: " + (res.error || "Desconocido"));
      }
    } catch (err) {
      console.error("Error crítico al revocar", err);
    } finally {
      setProcessing(null);
      setShowRevokeModal(null);
    }
  };


  // --- LÓGICA DE SERVICIOS ---
  const processedServices = useMemo(() => {
    if (!selected) return { online: [], offline: [] };
    const raw = selected.services || [];
    const list = raw
      .map((x: any) => {
        if (typeof x === "string") return { label: x, mode: "ONLINE" as const };
        const mode = String(x?.mode || "ONLINE").toUpperCase();
        return {
          label: String(x?.label || x?.id || "").trim(),
          mode: (mode === "OFFLINE" ? "OFFLINE" : "ONLINE") as "ONLINE" | "OFFLINE",
        };
      })
      .filter((x) => Boolean(x.label));

    return {
      online: list.filter((x) => x.mode === "ONLINE"),
      offline: list.filter((x) => x.mode === "OFFLINE"),
    };
  }, [selected]);

  // Saber si está finalizada para deshabilitar botones
  const isFinal = selected?.status === "ACCEPTED" || selected?.status === "REJECTED";


 // --- RENDER ---
  return (
    <>
      <div 
        className="fixed inset-y-2 right-2 w-full md:w-[420px] z-[99999] flex flex-col pointer-events-auto animate-slide-in-right bg-[#F2F2F7]/95 backdrop-blur-xl shadow-2xl rounded-[24px] border border-white/50 overflow-hidden text-slate-900 font-sans"
        style={{ isolation: 'isolate' }}
      >
        
     {/* HEADER */}
      <div className="shrink-0 px-6 pt-6 pb-4 border-b border-slate-200/50 bg-white/40 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            
          {selected && (
            <button
                type="button"
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  if (soundEnabled && playSynthSound) playSynthSound("click");
                  handleSelectionChange(null);
                }}
                className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95"
                title="Volver al listado"
            >
                <ArrowLeft size={16} className="text-slate-700" />
            </button>
            )}

            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                {selected ? "Detalle Propuesta" : "Propuestas"}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {selected ? "Revisa condiciones y servicios" : "Gestión de campañas recibidas"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleRightPanel("NONE");
            }}
            className="w-8 h-8 rounded-full bg-slate-200/50 hover:bg-slate-300/50 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-slate-600" />
          </button>
        </div>
      </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar space-y-4">
          
          {/* EMPTY STATE */}
          {!selected && items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 opacity-60">
              <div className="w-16 h-16 rounded-3xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-center mb-6">
                <Sparkles size={28} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sin propuestas activas</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-[250px]">
                Tus inmuebles están visibles. Te avisaremos cuando una agencia envíe una oferta.
              </p>
            </div>
          )}

          {/* LISTA */}
          {!selected && items.length > 0 && (
            <div className="space-y-3">
              {items.map((p) => {
                const st = statusMeta(p.status);
                const title = safeText(p?.property?.title) || "Activo sin nombre";
                const ref = safeText(p?.property?.refCode);
                const agencyName = safeText(p?.agency?.companyName) || safeText(p?.agency?.name) || "Agencia";
                const total = p?.terms?.commissionTotalEur;

                return (
                  <button
                    key={p.id}
                    onClick={() => openDetail(p.id)}
                    className="w-full text-left bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-white/60 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:scale-[1.01] transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${st.cls}`}>
                            {st.label}
                          </span>
                          {ref && <span className="text-[10px] font-semibold text-slate-400">REF: {ref}</span>}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {title}
                        </h3>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Comisión</div>
                        <div className="text-sm font-bold text-slate-900">
                          {Number.isFinite(Number(total)) ? euro(total) : "—"}
                        </div>
                      </div>
                    </div>
                   <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {(p?.agency?.companyLogo || p?.agency?.avatar || (p?.agency as any)?.image) ? (
                          <img src={p.agency.companyLogo || p.agency.avatar || (p.agency as any).image} alt="" className="w-full h-full object-cover bg-white" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Building2 size={14} className="text-slate-400" /></div>
                        )}
                      </div>
                      <div className="truncate"><span className="text-xs font-semibold text-slate-700">{agencyName}</span></div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* DETALLE (EXPEDIENTE) */}
          {selected && (
            <div className="space-y-4 animate-fade-in-up pb-10">
              
             {/* 0. Tarjeta Activo */}
            <div className="bg-white rounded-[28px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-white/50">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Activo</div>
                <h3 className="text-xl font-black text-slate-900 mt-1 truncate">{safeText(selected?.property?.title) || "Activo"}</h3>
                {(safeText(selected?.property?.location) || safeText(selected?.property?.address)) && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{safeText(selected?.property?.location) || safeText(selected?.property?.address)}</span>
                    </div>
                )}
                </div>
                {safeText(selected?.property?.refCode) ? (
                <span className="shrink-0 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-700">
                    {safeText(selected?.property?.refCode)}
                </span>
                ) : null}
            </div>
            {!!selected?.property?.rawPrice || !!selected?.property?.price ? (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Precio</span>
                <span className="text-base font-black text-slate-900">
                {Number.isFinite(Number(selected?.property?.rawPrice)) ? formatEuro(selected?.property?.rawPrice) : formatEuro(selected?.property?.price)}
                </span>
                </div>
            ) : null}
            </div>

             
          {/* 1. Tarjeta Agencia (REDISEÑO PREMIUM SAAS) */}
              <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 relative group">
                
                {/* FONDO COVER DE ALTA GAMA */}
                <div className="h-32 relative overflow-hidden bg-slate-900">
                  {(selected.agency?.coverImage || (selected.agency as any)?.cover) ? (
                    <img src={selected.agency.coverImage || (selected.agency as any).cover} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900" />
                  )}
                  {/* Degradado para transición suave hacia el contenido blanco */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                </div>

                <div className="px-6 pb-6 relative">
                  {/* ZONA SUPERIOR: LOGO Y BOTÓN CHAT */}
                  <div className="flex justify-between items-end -mt-12 mb-5">
                    
                    {/* LOGO ENCAPSULADO TIPO APPLE */}
                    <div className="w-24 h-24 rounded-[22px] bg-white p-1.5 shadow-xl shadow-black/5 ring-1 ring-slate-100 relative z-10">
                      <div className="w-full h-full rounded-[16px] overflow-hidden bg-slate-50 relative flex items-center justify-center">
                        {(selected.agency?.companyLogo || selected.agency?.avatar || (selected.agency as any)?.image) ? (
                          <img 
                            src={selected.agency.companyLogo || selected.agency.avatar || (selected.agency as any).image} 
                            className="w-full h-full object-cover bg-white" 
                            alt="Logo" 
                          />
                        ) : (
                          <Building2 size={32} className="text-slate-300" />
                        )}
                      </div>
                      {/* Insignia Verificado Mini */}
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full ring-4 ring-white shadow-sm">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    </div>

                    {/* BOTÓN CHAT DE ACCIÓN RÁPIDA */}
                    <button
                      onClick={(e) => openChat(e, selected)}
                      className="h-10 px-5 bg-slate-900 text-white rounded-full text-[11px] font-black tracking-widest uppercase shadow-lg shadow-slate-900/20 hover:bg-indigo-600 hover:shadow-indigo-600/30 transition-all flex items-center gap-2 active:scale-95 mb-1"
                    >
                      <MessageCircle size={14} /> Iniciar Chat
                    </button>
                  </div>

                  {/* INFO PRINCIPAL DE LA AGENCIA */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        Agencia Candidata
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                      {selected.agency?.companyName || selected.agency?.name || "Agencia Oficial"}
                    </h2>
                  </div>

                 {/* GRID DE CONTACTO TÁCTICO */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-1.5 rounded-3xl border border-slate-100">
                    
                    {/* Botón Teléfono Copiable */}
                    <div 
                      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/50 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group/contact flex flex-col justify-between min-h-[90px]"
                      title="Copiar teléfono"
                      onClick={(e) => {
                        e.stopPropagation();
                        const phone = selected.agency?.mobile || selected.agency?.phone;
                        if (phone) navigator.clipboard.writeText(phone);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover/contact:bg-emerald-500 group-hover/contact:text-white transition-colors shrink-0">
                          <Phone size={10} />
                        </div>
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Teléfono</span>
                      </div>
                      <div className="flex items-end justify-between gap-2 mt-auto">
                        <p className="text-xs font-bold text-slate-700 break-all font-mono select-all leading-tight">
                          {selected.agency?.mobile || selected.agency?.phone || "—"}
                        </p>
                        <Copy size={14} className="text-slate-300 group-hover/contact:text-emerald-500 transition-colors shrink-0" />
                      </div>
                    </div>

                    {/* Botón Email Copiable */}
                    <div 
                      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/50 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group/contact flex flex-col justify-between min-h-[90px]"
                      title="Copiar email"
                      onClick={(e) => {
                        e.stopPropagation();
                        const email = selected.agency?.email;
                        if (email) navigator.clipboard.writeText(email);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover/contact:bg-blue-500 group-hover/contact:text-white transition-colors shrink-0">
                          <Mail size={10} />
                        </div>
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Email</span>
                      </div>
                      <div className="flex items-end justify-between gap-2 mt-auto">
                        <p className="text-[11px] font-bold text-slate-700 break-all select-all leading-tight">
                          {selected.agency?.email || "—"}
                        </p>
                        <Copy size={14} className="text-slate-300 group-hover/contact:text-blue-500 transition-colors shrink-0" />
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* 2. Mensaje */}
              <div className="bg-blue-600 text-white p-6 rounded-[28px] shadow-lg shadow-blue-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Sparkles size={120} /></div>
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Mensaje de propuesta</h3>
                <p className="text-sm leading-relaxed font-medium relative z-10">{safeText(selected?.message) || buildDefaultMessage(selected)}</p>
              </div>

              {/* 3. SERVICIOS */}
              {(processedServices.online.length > 0 || processedServices.offline.length > 0) && (
                <div className="bg-white rounded-[28px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-white/50">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Sparkles size={16} className="text-slate-400"/> Servicios incluidos
                    </h3>
                    <div className="space-y-4">
                        {processedServices.online.length > 0 && (
                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1"><Globe size={12}/> Marketing, Online & OFFLINE</div>
                                <div className="flex flex-wrap gap-2">
                                    {processedServices.online.map((s, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 shadow-sm">{String(s.label).replace(/_/g, " ")}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {processedServices.offline.length > 0 && (
                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1"><Key size={12}/> Visitas & Gestión</div>
                                <div className="flex flex-wrap gap-2">
                                    {processedServices.offline.map((s, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 shadow-sm">{String(s.label).replace(/_/g, " ")}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              )}

              {/* 4. Condiciones */}
              <div className="bg-white rounded-[28px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-white/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Condiciones</h3>
                  <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                    {selected?.terms?.exclusive ? "Exclusiva" : "No Exclusiva"}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-medium">Honorarios</span>
                    <span className="text-sm font-bold text-slate-900">{pct(selected?.terms?.commissionPct)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-medium">IVA Aplicable</span>
                    <span className="text-sm font-bold text-slate-900">{pct(selected?.terms?.ivaPct)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-medium">Duración Mandato</span>
                    <span className="text-sm font-bold text-slate-900">{selected?.terms?.months} Meses</span>
                  </div>
                  <div className="mt-4 bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-100">
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Estimado</span>
                    <div className="text-right">
                      <div className="text-xl font-black text-slate-900">
                        {Number.isFinite(Number(selected?.terms?.commissionTotalEur)) ? euro(selected?.terms?.commissionTotalEur) : "—"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">(IVA Incluido)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Info adicional */}
              <div className="px-2 pb-2">
                <div className="flex items-center gap-3 opacity-60">
                  <MapPin size={14} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-600 truncate">
  {safeText(selected?.property?.title)}
  {/* Si hay location, la pone. Si no, intenta address. Si no, pone "Madrid" o nada. */}
  {(selected?.property?.location || selected?.property?.address) 
      ? ` • ${selected?.property?.location || selected?.property?.address}`
      : " • Madrid, España"} 
</span>
                </div>
              </div>

          {/* 6. BOTONES DE ACCIÓN (DEFINITIVOS Y FUNCIONALES) */}
              <div className="pt-2 relative z-50 space-y-3">
                
                {/* 🔥 NUEVO BOTÓN TÁCTICO: SOLICITAR ASESORAMIENTO (Vía suave) 🔥 */}
                {!isFinal && (
                  <button
                  type="button"
                  disabled={!!processing}
                  onClick={(e) => handleRequestMeeting(e, selected)}
                  className="w-full h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all active:scale-[0.98] shadow-sm cursor-pointer pointer-events-auto"
                >
                  <Phone size={16} className="text-indigo-500" /> Solicitar Asesoramiento
                </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                    {/* BOTÓN RECHAZAR */}
                    <button
                      type="button"
                      disabled={!!processing || isFinal}
                      onClick={(e) => handleDecision(e, selected.id, "REJECT")}
                      className="h-14 rounded-2xl bg-white border border-rose-100 text-rose-600 font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm cursor-pointer relative z-50 pointer-events-auto"
                    >
                      {processing?.id === selected.id && processing?.decision === "REJECT" ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <>
                          <XCircle size={18} /> Rechazar
                        </>
                      )}
                    </button>

                 {/* BOTÓN ACEPTAR (INTERCEPTADO PARA ABRIR EL BÚNKER LEGAL) */}
                    <button
                      type="button"
                      disabled={!!processing || isFinal}
                      onClick={(e) => { 
                          e.stopPropagation(); 
                          setShowLegalTerms(selected.id); 
                      }}
                      className="h-14 rounded-2xl bg-slate-900 text-white font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-slate-900/20 cursor-pointer relative z-50 pointer-events-auto"
                    >
                        <Check size={18} /> Aceptar
                    </button>
                </div>
              </div> {/* <-- Cierre del contenedor de los botones de Acción --> */}

              {/* 🚨 PANEL DE EMERGENCIA: SOLO VISIBLE SI YA ESTÁ ACEPTADA 🚨 */}
              {selected?.status === "ACCEPTED" && (
                <div className="pt-4 relative z-50 border-t border-rose-100 mt-4">
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mb-3">
                    Zona de Peligro
                  </p>
                  <button
                    type="button"
                    disabled={!!processing}
                    onClick={(e) => { e.stopPropagation(); setShowRevokeModal(selected.id); }}
                    className="w-full h-12 rounded-2xl bg-white border border-rose-200 text-rose-600 font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-rose-50 transition-all active:scale-[0.98] shadow-sm cursor-pointer pointer-events-auto"
                  >
                    <XCircle size={16} /> Revocar Gestión Digital
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* 🛡️ MODAL DE SEGURIDAD LEGAL (TRIPLE CHECK) */}
      {showLegalModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in pointer-events-auto" onClick={() => setShowLegalTerms(null)}>
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative animate-slide-up" onClick={(e) => e.stopPropagation()}>
            
            <div className="bg-slate-900 p-6 text-white text-center relative">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-400">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-1">Confirmar Traspaso</h3>
              <p className="text-xs text-slate-400 font-medium">Revisión de términos comerciales</p>
            </div>

            <div className="p-6 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="pt-0.5">
                  <input type="checkbox" checked={check1} onChange={(e) => setCheck1(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 block mb-0.5">1. Cesión de Material y Derechos</strong>
                  Autorizo a la Agencia a utilizar las fotografías, descripciones y Nano Card de mi propiedad con fines comerciales durante la vigencia del mandato.
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="pt-0.5">
                  <input type="checkbox" checked={check2} onChange={(e) => setCheck2(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 block mb-0.5">2. Condiciones Económicas</strong>
                  Acepto las comisiones marcadas en esta propuesta y reconozco que cualquier modificación del precio base será consensuada con la Agencia.
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="pt-0.5">
                  <input type="checkbox" checked={check3} onChange={(e) => setCheck3(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 block mb-0.5">3. Exoneración Tecnológica</strong>
                  Entiendo que Stratosfere OS es únicamente una plataforma de conexión. La relación contractual y legal recae exclusivamente entre el Propietario y la Agencia.
                </div>
              </label>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowLegalTerms(null)}
                className="flex-1 py-3 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              
              <button 
                disabled={!check1 || !check2 || !check3 || !!processing}
                onClick={(e) => {
                  setShowLegalTerms(null);
                  handleDecision(e, showLegalModal, "ACCEPT");
                }}
                className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {processing?.id === showLegalModal ? <Loader2 size={16} className="animate-spin" /> : "Firmar Acuerdo"}
              </button>
            </div>

          </div>
        </div>
      )}
{/* 🚨 MODAL DE EMERGENCIA: REVOCAR GESTIÓN (BOTÓN ROJO) */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in pointer-events-auto" onClick={() => setShowRevokeModal(null)}>
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative animate-slide-up border-2 border-rose-500" onClick={(e) => e.stopPropagation()}>
            
            <div className="bg-rose-600 p-6 text-white text-center relative">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                <XCircle size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-1">Peligro: Revocación</h3>
              <p className="text-xs text-rose-200 font-medium">Estás a punto de cortar el acceso a la Agencia</p>
            </div>

            <div className="p-6">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-800 leading-relaxed font-medium mb-4">
                <strong className="block font-black mb-2 text-rose-900">🚨 ADVERTENCIA LEGAL</strong>
                Al confirmar, la Agencia perderá inmediatamente el control digital de tu expediente en Stratosfere. 
                <br/><br/>
                <strong>Sin embargo:</strong> Si firmaste un mandato de exclusividad, romperlo de forma unilateral podría acarrear penalizaciones económicas por parte de la Agencia en el mundo físico.
              </div>
              <p className="text-xs text-slate-500 text-center font-bold">
                Stratosfere ejecutará tu orden digital, pero no asume ninguna responsabilidad legal por incumplimiento de contrato entre las partes.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowRevokeModal(null)}
                className="flex-1 py-3 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                Abortar
              </button>
              
              <button 
                disabled={!!processing}
                onClick={(e) => handleRevoke(e, showRevokeModal)}
                className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-white bg-rose-600 rounded-xl shadow-lg hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
              >
                {processing?.id === showRevokeModal ? <Loader2 size={16} className="animate-spin" /> : "Ejecutar Ruptura"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}