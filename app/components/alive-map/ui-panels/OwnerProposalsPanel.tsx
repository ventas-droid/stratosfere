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
} from "lucide-react";

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

  agency?: {
    id?: string; // toUserId para chat
    name?: string;
    companyName?: string;
    avatar?: string;
    coverImage?: string;
    phone?: string;
    mobile?: string;
    email?: string;
  };

  // Los servicios pueden venir como strings simples o como objetos
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
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- LÓGICA DE ESTADO (HÍBRIDA: PADRE O LOCAL) ---
  
  // 1. Fallback interno por si el componente Padre no nos controla
  const [localCampaignId, setLocalCampaignId] = useState<string | null>(null);

  // 2. ¿Quién manda aquí? (Si pasan la función, manda el Padre. Si no, Local).
  const isControlled = typeof setActiveCampaignId === "function";

  // 3. El ID real que vamos a usar
  const effectiveCampaignId = isControlled 
    ? (activeCampaignId ?? null) 
    : (localCampaignId ?? null);

  // 4. MEMO: Calculamos el item seleccionado basándonos en el ID efectivo
  const items = Array.isArray(proposals) ? proposals : [];
  const selected = useMemo(() => {
    if (!effectiveCampaignId) return null;
    return items.find((x) => String(x.id) === String(effectiveCampaignId)) || null;
  }, [effectiveCampaignId, items]);

  // --- HANDLERS UNIFICADOS ---

  // Función Maestra para cambiar de ID (evita repetir código)
  const handleSelectionChange = (newId: string | null) => {
    if (isControlled) {
      // @ts-ignore - Ya verificamos que es función
      setActiveCampaignId(newId);
    } else {
      setLocalCampaignId(newId);
    }
  };

  // Volver a la lista (o cerrar detalle)
  const goList = (e?: React.MouseEvent) => {
    // 🛑 IMPORTANTE: Detenemos la propagación para evitar "doble click" fantasma
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (soundEnabled && playSynthSound) playSynthSound("click");
    handleSelectionChange(null);
  };

  // Abrir detalle
  const openDetail = (id: string) => {
    // Nota: Aquí no pasamos evento porque suele venir de un onClick directo
    if (soundEnabled && playSynthSound) playSynthSound("click");
    handleSelectionChange(String(id));
  };

  // Abrir Chat (Lógica separada porque dispara evento de ventana)
  const openChat = (e: React.MouseEvent, p: OwnerProposal) => {
    e.preventDefault();
    e.stopPropagation(); // 🛑 Vital para que no abra la tarjeta al dar al chat

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


  const handleDecision = async (
    e: React.MouseEvent,
    id: string,
    decision: "ACCEPT" | "REJECT"
  ) => {
    e.stopPropagation();
    if (processingId) return;

    setProcessingId(id);

    try {
      if (decision === "ACCEPT") {
  if (soundEnabled && playSynthSound) playSynthSound("success");

  if (onAccept) {
    await onAccept(id);
  } else if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("respond-campaign-signal", {
        detail: { campaignId: id, decision: "ACCEPT" },
      })
    );
  }
} else {
  if (soundEnabled && playSynthSound) playSynthSound("error");

  if (onReject) {
    await onReject(id);
  } else if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("respond-campaign-signal", {
        detail: { campaignId: id, decision: "REJECT" },
      })
    );
  }
}

    } catch (err) {
      console.error("Error en decisión de campaña", err);
    } finally {
      setProcessingId(null);
    }
  };

  // --- LÓGICA DE SERVICIOS ---
// Extraemos y clasificamos los servicios para uso en el renderizado
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


  // --- RENDER ---
  return (
    <>
      <div
        className="fixed inset-0 z-[64000] bg-black/10 backdrop-blur-[2px]"
        onClick={() => toggleRightPanel("NONE")}
      />

      <div className="fixed inset-y-2 right-2 w-full md:w-[420px] z-[65000] flex flex-col pointer-events-auto animate-slide-in-right bg-[#F2F2F7]/95 backdrop-blur-xl shadow-2xl rounded-[24px] border border-white/50 overflow-hidden text-slate-900 font-sans">
        
     {/* HEADER */}
      <div className="shrink-0 px-6 pt-6 pb-4 border-b border-slate-200/50 bg-white/40 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            
            {/* 🔴 CORRECCIÓN: Este botón ahora solo aparece si hay algo seleccionado */}
          {selected && (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();

      if (soundEnabled && playSynthSound) playSynthSound("click");

      console.log("🔙 Back: setActiveCampaignId(null) o fallback local");

      if (typeof setActiveCampaignId === "function") {
        setActiveCampaignId(null);
      } else {
        setLocalCampaignId(null); // ✅ fallback interno
      }
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
                {selected
                  ? "Revisa condiciones y servicios"
                  : "Gestión de campañas recibidas"}
              </p>
            </div>
          </div>

          {/* Botón de Cerrar (Siempre visible) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleRightPanel("NONE");
            }}
            className="w-8 h-8 rounded-full bg-slate-200/50 hover:bg-slate-300/50 flex items-center justify-center transition-colors"
            title="Cerrar panel"
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
              <h3 className="text-lg font-bold text-slate-900">
                Sin propuestas activas
              </h3>
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
                          {ref && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              REF: {ref}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {title}
                        </h3>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Comisión
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {Number.isFinite(Number(total)) ? euro(total) : "—"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {p?.agency?.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.agency.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 size={14} className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-semibold text-slate-700">
                          {agencyName}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* DETALLE (EXPEDIENTE) */}
          {selected && (
            <div className="space-y-4 animate-fade-in-up pb-10">
              
             {/* 0. Tarjeta Activo (Property) — estilo cupertino */}
<div className="bg-white rounded-[28px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-white/50">
  <div className="flex items-start justify-between gap-4">
    <div className="min-w-0">
      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
        Activo
      </div>

      <h3 className="text-xl font-black text-slate-900 mt-1 truncate">
        {safeText(selected?.property?.title) || "Activo"}
      </h3>

      {(safeText(selected?.property?.location) || safeText(selected?.property?.address)) && (
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <MapPin size={14} className="shrink-0" />
          <span className="truncate">
            {safeText(selected?.property?.location) || safeText(selected?.property?.address)}
          </span>
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
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
        Precio
      </span>
      <span className="text-base font-black text-slate-900">
       {Number.isFinite(Number(selected?.property?.rawPrice))
  ? formatEuro(selected?.property?.rawPrice)
  : formatEuro(selected?.property?.price)}

      </span>
    </div>
  ) : null}
</div>

             
              {/* 1. Tarjeta Agencia */}
              <div className="bg-white rounded-[28px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-white/50 relative">
                <div className="h-32 bg-slate-100 relative overflow-hidden">
                  {selected.agency?.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selected.agency.coverImage} className="w-full h-full object-cover" alt="Cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-black/10" />
                </div>

                <div className="px-6 pb-6 relative">
                  <div className="flex justify-between items-end -mt-10 mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg">
                      <div className="w-full h-full rounded-xl overflow-hidden bg-slate-50 relative">
                        {selected.agency?.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={selected.agency.avatar} className="w-full h-full object-cover" alt="Logo" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="text-slate-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => openChat(e, selected)}
                      className="bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                    >
                      <MessageCircle size={14} /> Chat
                    </button>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                    {selected.agency?.companyName || selected.agency?.name || "Agencia"}
                  </h2>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                        <Phone size={10} /> Móvil
                      </div>
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {selected.agency?.mobile || selected.agency?.phone || "—"}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                        <Mail size={10} /> Email
                      </div>
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {selected.agency?.email || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Mensaje */}
              <div className="bg-blue-600 text-white p-6 rounded-[28px] shadow-lg shadow-blue-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Sparkles size={120} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">
                  Mensaje de propuesta
                </h3>
                <p className="text-sm leading-relaxed font-medium relative z-10">
                  {safeText(selected?.message) || buildDefaultMessage(selected)}
                </p>
              </div>

              {/* 3. SERVICIOS (PLAN DE ACCIÓN) - REINCORPORADO */}
              {(processedServices.online.length > 0 || processedServices.offline.length > 0) && (
                <div className="bg-white rounded-[28px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-white/50">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Sparkles size={16} className="text-slate-400"/> Servicios incluidos
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Servicios Online */}
                        {processedServices.online.length > 0 && (
                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                                    <Globe size={12}/> Marketing, Online & OFFLINE
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {processedServices.online.map((s, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 shadow-sm">
                                            {String(s.label).replace(/_/g, " ")}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Servicios Offline */}
                        {processedServices.offline.length > 0 && (
                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                                    <Key size={12}/> Visitas & Gestión
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {processedServices.offline.map((s, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 shadow-sm">
                                            {String(s.label).replace(/_/g, " ")}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              )}

              {/* 4. Condiciones Económicas */}
              <div className="bg-white rounded-[28px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-white/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Condiciones
                  </h3>
                  <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                    {selected?.terms?.exclusive ? "Exclusiva" : "No Exclusiva"}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-medium">Honorarios</span>
                    <span className="text-sm font-bold text-slate-900">
                      {pct(selected?.terms?.commissionPct)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-medium">IVA Aplicable</span>
                    <span className="text-sm font-bold text-slate-900">
                      {pct(selected?.terms?.ivaPct)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-medium">Duración Mandato</span>
                    <span className="text-sm font-bold text-slate-900">
                      {selected?.terms?.months} Meses
                    </span>
                  </div>

                  <div className="mt-4 bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-100">
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                      Total Estimado
                    </span>
                    <div className="text-right">
                      <div className="text-xl font-black text-slate-900">
                        {Number.isFinite(Number(selected?.terms?.commissionTotalEur))
                          ? euro(selected?.terms?.commissionTotalEur)
                          : "—"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        (IVA Incluido)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Activo */}
              <div className="px-2 pb-2">
                <div className="flex items-center gap-3 opacity-60">
                  <MapPin size={14} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-600 truncate">
                    {safeText(selected?.property?.title)} •{" "}
                    {safeText(selected?.property?.location) || "Ubicación desconocida"}
                  </span>
                </div>
              </div>

              {/* 6. Botones de Acción */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  disabled={!!processingId}
                  onClick={(e) => handleDecision(e, selected.id, "REJECT")}
                  className="h-14 rounded-2xl bg-white border border-rose-100 text-rose-600 font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
                >
                  {processingId === selected.id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <XCircle size={18} /> Rechazar
                    </>
                  )}
                </button>

                <button
                  disabled={!!processingId}
                  onClick={(e) => handleDecision(e, selected.id, "ACCEPT")}
                  className="h-14 rounded-2xl bg-slate-900 text-white font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-slate-900/20"
                >
                  {processingId === selected.id ? (
                    <Loader2 className="animate-spin text-white" size={18} />
                  ) : (
                    <>
                      <Check size={18} /> Aceptar
                    </>
                  )}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}