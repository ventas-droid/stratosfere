"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  X, ArrowLeft, Check, XCircle, MessageCircle, Mail, Phone,
  Building2, MapPin, Sparkles, Loader2, Globe, Key, Copy, ShieldCheck,
  CalendarPlus, Timer, CheckCircle2
} from "lucide-react";

import { respondToCampaignAction, sendMessageAction } from "@/app/actions";

type Visibility = "PRIVATE" | "AGENCIES" | "PUBLIC";

export type OwnerProposal = {
  id: string; 
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

  agency?: {
    id?: string;
    name?: string;
    companyName?: string;
    avatar?: string;
    companyLogo?: string; 
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
  const [processing, setProcessing] = useState<{ id: string; decision: "ACCEPT" | "REJECT" | "MEETING" } | null>(null);

  const [showLegalModal, setShowLegalTerms] = useState<string | null>(null);
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);

  const [showRevokeModal, setShowRevokeModal] = useState<string | null>(null);

  // ✅ ESTADOS DEL NUEVO MODAL DE ASESORAMIENTO
  const [showMeetingModal, setShowMeetingModal] = useState<string | null>(null);
  const [meetingForm, setMeetingForm] = useState({
      date1: "",
      date2: "",
      phone: "",
      email: "",
  });
  const [requestedMeetings, setRequestedMeetings] = useState<string[]>([]);

  const [localCampaignId, setLocalCampaignId] = useState<string | null>(null);
  const isControlled = typeof setActiveCampaignId === "function";
  const effectiveCampaignId = isControlled 
    ? (activeCampaignId ?? null) 
    : (localCampaignId ?? null);

  const items = Array.isArray(proposals) ? proposals : [];
  
  // 1. SE DEFINE EL OBJETIVO (selected)
  const selected = useMemo(() => {
    if (!effectiveCampaignId) return null;
    return items.find((x) => String(x.id) === String(effectiveCampaignId)) || null;
  }, [effectiveCampaignId, items]);

  // 📡 2. ESTADO DE RADAR (EL ESPEJO DE LA AGENCIA) - ¡Ahora va después de selected!
  const [meetingState, setMeetingState] = useState<{ status: 'NONE' | 'PENDING' | 'CONFIRMED', details?: any }>({ status: 'NONE' });
// 🔥 ESTADO PARA RECORDAR SI YA LO HA GUARDADO EN SU CALENDARIO
  const [addedToCalendar, setAddedToCalendar] = useState<string[]>([]);
  
  // El sistema lee la memoria al arrancar para no olvidarlo si cierra el navegador
  useEffect(() => {
      if (typeof window !== "undefined") {
          const saved = localStorage.getItem("stratos_calendar_saved");
          if (saved) setAddedToCalendar(JSON.parse(saved));
      }
  }, []);
  // 🔥 3. EFECTO ESPEJO: Comprueba el estado en tiempo real
  useEffect(() => {
    if (!selected?.property?.id || !selected?.agency?.id) {
        setMeetingState({ status: 'NONE' });
        return;
    }
    
    const fetchStatus = async () => {
        try {
            const { checkMeetingStatusAction } = require("@/app/actions");
            const res = await checkMeetingStatusAction(selected.property?.id, selected.agency?.id);
            if (res?.success && res.data) setMeetingState(res.data);
        } catch (e) {
            console.error("Error leyendo estado de la cita:", e);
        }
    };
    fetchStatus();
  }, [selected?.id, selected?.property?.id, selected?.agency?.id]);

  // 4. VARIABLES DE CONTROL PARA EL BOTÓN
  const isMeetingPending = meetingState.status === 'PENDING' || requestedMeetings.includes(selected?.id || "");
  const isMeetingConfirmed = meetingState.status === 'CONFIRMED';


  // --- FUNCIONES DE NAVEGACIÓN ---
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

  // 🛑 LA PUERTA DE SEGURIDAD (Siempre DEBE ir después de los Hooks)
  if (rightPanel !== "OWNER_PROPOSALS") return null;

  // ✅ NUEVO HANDLER: ABRIR MODAL
  const handleRequestMeeting = (e: React.MouseEvent, p: OwnerProposal) => {
    e.stopPropagation();
    if (soundEnabled && playSynthSound) playSynthSound("click");
    setShowMeetingModal(p.id);
  };

  // ✅ NUEVO HANDLER: ENVIAR FORMULARIO CON REGISTRO DE LEAD B2B
  const submitMeetingRequest = async (e: React.FormEvent, p: OwnerProposal) => {
    e.preventDefault();
    if (soundEnabled && playSynthSound) playSynthSound("success");

    const cid = p.conversationId;
    if (!cid) return;

    setProcessing({ id: p.id, decision: "MEETING" }); 

    try {
        const agencyName = p.agency?.companyName || p.agency?.name || "la Agencia";
        
        const meetingText = `🤝 **SOLICITUD DE ASESORAMIENTO** 🤝\n\nHola, ${agencyName}. He revisado vuestra propuesta de gestión para la propiedad REF: ${p.property?.refCode || "SF-N/A"}.\n\nMe gustaría solicitar una reunión o llamada para aclarar detalles antes de formalizar el traspaso.\n\n📅 **Disponibilidad propuesta:**\nOpción 1: ${meetingForm.date1}\nOpción 2: ${meetingForm.date2 || "No especificada"}\n\n📞 **Mis datos de contacto directos:**\nTeléfono: ${meetingForm.phone}\nEmail: ${meetingForm.email}\n\nQuedo a la espera de confirmación.`;

        // 1. Envía el mensaje al Chat
        await sendMessageAction({
            conversationId: String(cid),
            text: meetingText
        });

        // 🔥 2. GUARDA EL LEAD EN LA BASE DE DATOS (ESTO ES LO QUE FALTABA) 🔥
        // Importante: Asegúrese de tener importado 'submitLeadAction' arriba del todo
        try {
            const { submitLeadAction } = require("@/app/actions");
            await submitLeadAction({
                propertyId: p.property?.id || "",
                name: "Propietario (" + (p.property?.refCode || "Sin Ref") + ")",
                email: meetingForm.email,
                phone: meetingForm.phone,
                message: `Cita solicitada. Opciones: ${meetingForm.date1} / ${meetingForm.date2}`,
                source: "B2B_MEETING", // 🎯 EL SELLO MÁGICO PARA LA AGENDA
                managerId: p.agency?.id 
            });
            console.log("✅ Lead B2B registrado en la base de datos.");
        } catch (dbError) {
            console.error("⚠️ Fallo al guardar en la tabla Lead:", dbError);
        }

        // Lo marcamos como verde
        setRequestedMeetings(prev => [...prev, p.id]);
        
        setShowMeetingModal(null);
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("open-chat-signal", { 
                detail: { conversationId: String(cid) } 
            }));
        }
    } catch (err) {
        console.error("Error al solicitar reunión:", err);
        alert("Error de conexión al enviar la solicitud.");
    } finally {
        setProcessing(null);
    }
  };

  const handleDecision = async (
    e: React.MouseEvent,
    id: string,
    decision: "ACCEPT" | "REJECT"
  ) => {
    e.stopPropagation();
    if (processing) return;
    setProcessing({ id, decision });

    try {
      const res = await respondToCampaignAction(id, decision);

      if (res.success) {
        if (decision === "ACCEPT") {
            if (soundEnabled && playSynthSound) playSynthSound("success");
            if (onAccept) await onAccept(id);
            
            const cid = selected?.conversationId;
            if (cid) {
                try {
                    const rawPrice = selected?.property?.rawPrice || selected?.property?.price || 0;
                    const precioStr = String(rawPrice).replace(/\D/g, ''); 
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

        if (typeof window !== "undefined") {
            window.dispatchEvent(
            new CustomEvent("respond-campaign-signal", {
                detail: { campaignId: id, decision },
            })
            );
        }
        
        handleSelectionChange(null);

      } else {
        alert("Error: " + (res.error || "No se pudo procesar la solicitud"));
      }
    } catch (err) {
      console.error("Error crítico en decisión de campaña", err);
      alert("Error de conexión");
    } finally {
      setProcessing(null);
    }
  };

  const handleRevoke = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (processing) return;
    setProcessing({ id, decision: "REJECT" }); 

    try {
      const res = await respondToCampaignAction(id, "REJECT");
      
      if (res.success) {
        if (soundEnabled && playSynthSound) playSynthSound("error"); 
        
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
            } catch (chatErr) {}
        }

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

  const isFinal = selected?.status === "ACCEPTED" || selected?.status === "REJECTED";

  return (
    <>
      <div 
        className="fixed inset-y-2 right-2 w-full md:w-[420px] z-[99999] flex flex-col pointer-events-auto animate-slide-in-right bg-[#F2F2F7]/95 backdrop-blur-xl shadow-2xl rounded-[24px] border border-white/50 overflow-hidden text-slate-900 font-sans"
        style={{ isolation: 'isolate' }}
      >
        
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

        <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar space-y-4">
          
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

          {selected && (
            <div className="space-y-4 animate-fade-in-up pb-10">
              
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

              <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 relative group">
                
                <div className="h-32 relative overflow-hidden bg-slate-900">
                  {(selected.agency?.coverImage || (selected.agency as any)?.cover) ? (
                    <img src={selected.agency.coverImage || (selected.agency as any).cover} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                </div>

                <div className="px-6 pb-6 relative">
                  <div className="flex justify-between items-end -mt-12 mb-5">
                    
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
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full ring-4 ring-white shadow-sm">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    </div>

                    <button
                      onClick={(e) => openChat(e, selected)}
                      className="h-10 px-5 bg-slate-900 text-white rounded-full text-[11px] font-black tracking-widest uppercase shadow-lg shadow-slate-900/20 hover:bg-indigo-600 hover:shadow-indigo-600/30 transition-all flex items-center gap-2 active:scale-95 mb-1"
                    >
                      <MessageCircle size={14} /> Iniciar Chat
                    </button>
                  </div>

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

                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-1.5 rounded-3xl border border-slate-100">
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

              <div className="bg-blue-600 text-white p-6 rounded-[28px] shadow-lg shadow-blue-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Sparkles size={120} /></div>
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Mensaje de propuesta</h3>
                <p className="text-sm leading-relaxed font-medium relative z-10">{safeText(selected?.message) || buildDefaultMessage(selected)}</p>
              </div>

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

              <div className="px-2 pb-2">
                <div className="flex items-center gap-3 opacity-60">
                  <MapPin size={14} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-600 truncate">
                    {safeText(selected?.property?.title)}
                    {(selected?.property?.location || selected?.property?.address) 
                        ? ` • ${selected?.property?.location || selected?.property?.address}`
                        : " • Madrid, España"} 
                  </span>
                </div>
              </div>

              <div className="pt-2 relative z-50 space-y-3">
                
            {/* 🔥 TARJETA DE CONFIRMACIÓN DE CITA (NUEVO) 🔥 */}
                {isMeetingConfirmed && meetingState.details && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-3 animate-fade-in-up">
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-1.5"><CheckCircle2 size={14}/> Cita Confirmada por la Agencia</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><p className="text-xs text-emerald-900"><strong>Asesor:</strong> {meetingState.details.agent}</p></div>
                            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><p className="text-xs text-emerald-900"><strong>Cuándo:</strong> {meetingState.details.date} a las {meetingState.details.time}</p></div>
                            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><p className="text-xs text-emerald-900"><strong>Dónde:</strong> {meetingState.details.address}</p></div>
                        </div>
                    </div>
                )}

               {/* 🔥 BOTÓN ASESORAMIENTO MUTANTE (LAS 4 FASES AHORA) 🔥 */}
                {!isFinal && (
                  <button
                    type="button"
                    disabled={!!processing || isMeetingPending}
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        if (isMeetingConfirmed) {
                            // 🧠 FASE 4: MARCAMOS EN MEMORIA QUE YA LO HA GUARDADO
                            if (typeof window !== "undefined") {
                                const nextSaved = [...addedToCalendar, selected.id];
                                setAddedToCalendar(nextSaved);
                                localStorage.setItem("stratos_calendar_saved", JSON.stringify(nextSaved));
                            }

                            // GENERAR ENLACE GOOGLE CALENDAR
                            const d = meetingState.details;
                            const eventTitle = encodeURIComponent(`Asesoramiento Stratosfere: Ref ${selected?.property?.refCode || "N/A"}`);
                            const eventDetails = encodeURIComponent(`Cita con el asesor: ${d.agent}\nAgencia: ${selected?.agency?.companyName || "Asociada"}`);
                            const eventLocation = encodeURIComponent(d.address);
                            
                            try {
                                const [year, month, day] = d.date.split("-");
                                const [hour, minute] = d.time.split(":");
                                const startDate = new Date(Number(year), Number(month)-1, Number(day), Number(hour), Number(minute));
                                const endDate = new Date(startDate.getTime() + 60*60*1000);
                                const formatGCalDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
                                const gcalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&location=${eventLocation}&dates=${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;
                                window.open(gcalLink, '_blank');
                            } catch(err) {
                                const gcalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&location=${eventLocation}`;
                                window.open(gcalLink, '_blank');
                            }
                        } else {
                            setShowMeetingModal(selected.id); 
                        }
                    }}
                    className={`w-full h-12 rounded-2xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer pointer-events-auto mb-3
                        ${isMeetingConfirmed 
                            ? (addedToCalendar.includes(selected.id)
                                ? "bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 active:scale-[0.98]" // 👈 FASE 4: Ya guardado
                                : "bg-emerald-600 border border-emerald-700 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-[0.98]") // Fase 3: Confirmado
                            : isMeetingPending
                            ? "bg-amber-50 border border-amber-200 text-amber-600 scale-[0.98] cursor-not-allowed" // Fase 2: Esperando
                            : "bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 active:scale-[0.98]" // Fase 1: Solicitar
                        }
                    `}
                  >
                    {isMeetingConfirmed ? (
                        addedToCalendar.includes(selected.id) ? (
                            <><CheckCircle2 size={16} /> Guardado (Actualizar)</>
                        ) : (
                            <><CalendarPlus size={16} /> Añadir a Google Calendar</>
                        )
                    ) : isMeetingPending ? (
                        <><Timer size={16} /> Esperando Agencia...</>
                    ) : (
                        <><Phone size={16} /> Solicitar Asesoramiento</>
                    )}
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
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

                    <button
                      type="button"
                      disabled={!!processing || isFinal}
                      onClick={(e) => { 
                          e.stopPropagation(); 
                          setShowLegalTerms(selected.id); 
                      }}
                      className="h-14 rounded-2xl bg-slate-900 text-white font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-slate-900/20 cursor-pointer relative z-50 pointer-events-auto"
                    >
                        <Check size={18} /> Aceptar Gestión
                    </button>
                </div>
              </div>

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

      {/* 📅 MODAL DE SOLICITUD DE AGENDA (NUEVO PROTAGONISMO) */}
      {showMeetingModal && selected && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in pointer-events-auto" onClick={() => setShowMeetingModal(null)}>
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative animate-slide-up border border-indigo-100" onClick={(e) => e.stopPropagation()}>
            
            <div className="bg-indigo-600 p-6 text-white text-center relative">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                <Phone size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-1">Agendar Llamada</h3>
              <p className="text-xs text-indigo-200 font-medium">Conecta con {selected?.agency?.companyName || selected?.agency?.name || "el Agente"} antes de decidir</p>
            </div>

            <form onSubmit={(e) => submitMeetingRequest(e, selected)} className="p-6 space-y-4">
              
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-4 text-sm text-indigo-800 leading-relaxed font-medium">
                Propón dos opciones de fecha y hora para que la agencia te contacte y aclare tus dudas sobre la propuesta.
              </div>

              <div className="grid grid-cols-2 gap-3">
                  <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Opción 1 <span className="text-rose-500">*</span></label>
                      <input type="text" required value={meetingForm.date1} onChange={e => setMeetingForm({...meetingForm, date1: e.target.value})} placeholder="Ej: Lunes a las 16:00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Opción 2</label>
                      <input type="text" value={meetingForm.date2} onChange={e => setMeetingForm({...meetingForm, date2: e.target.value})} placeholder="Ej: Martes por la mañana" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 outline-none" />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                  <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tu Teléfono <span className="text-rose-500">*</span></label>
                      <input type="tel" required value={meetingForm.phone} onChange={e => setMeetingForm({...meetingForm, phone: e.target.value})} placeholder="Para que te llamen" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tu Email <span className="text-rose-500">*</span></label>
                      <input type="email" required value={meetingForm.email} onChange={e => setMeetingForm({...meetingForm, email: e.target.value})} placeholder="Para confirmación" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 outline-none" />
                  </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowMeetingModal(null)} className="flex-1 py-3 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={!!processing} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-white bg-indigo-600 rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer">
                  {processing?.id === selected.id && processing?.decision === "MEETING" ? <Loader2 size={16} className="animate-spin" /> : "Enviar Petición"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      
    </> 
  );
}