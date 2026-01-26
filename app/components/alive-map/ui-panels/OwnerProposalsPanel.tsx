"use client";

import React, { useMemo } from "react";
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
} from "lucide-react";

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

  // puede venir como string[] o como objetos
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

    commissionBaseEur?: number; // base sin IVA (opcional si ya lo calculas en server)
    ivaAmountEur?: number; // IVA € (opcional)
    commissionTotalEur?: number; // total con IVA (ideal)

    sharePct?: number;
    shareVisibility?: Visibility;
    shareEstimatedEur?: number;
  };

  message?: string; // mensaje predeterminado ya “listo”
  conversationId?: string; // si lo tienes
};

function euro(v: any) {
  const n = Number(String(v ?? "").replace(",", "."));
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
}

function pct(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `${n}%`;
}

function safeText(v: any) {
  return String(v ?? "").trim();
}

function statusMeta(s?: string) {
  const v = (s || "SENT").toUpperCase();
  if (v === "ACCEPTED") return { label: "ACEPTADA", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  if (v === "REJECTED") return { label: "RECHAZADA", cls: "bg-rose-100 text-rose-700 border-rose-200" };
  if (v === "EXPIRED") return { label: "EXPIRADA", cls: "bg-slate-100 text-slate-600 border-slate-200" };
  return { label: "NUEVA", cls: "bg-blue-100 text-blue-700 border-blue-200" };
}

function buildDefaultMessage(p: OwnerProposal) {
  const ref = p?.property?.refCode ? `(${p.property.refCode})` : "(SF)";
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

  const servicesTxt = services.length ? `Servicios incluidos (${services.length}): ${services.join(", ")}.` : "Servicios incluidos: —.";

  const parts = [
    `Propuesta de gestión ${ref}. Mandato: ${ex} (${months} meses).`,
    `Comisión ${cPct}% + IVA ${ivaPct}%.`,
  ];

  if (Number.isFinite(Number(total))) {
    parts.push(`Importe comisión: ${euro(base)} + IVA ${euro(iva)} = ${euro(total)}.`);
  }

  parts.push(servicesTxt);
  parts.push("Si aceptas, abrimos expediente y chat directo.");

  return parts.join(" ");
}

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
  if (rightPanel !== "OWNER_PROPOSALS") return null;

  const items = Array.isArray(proposals) ? proposals : [];
  const selected = useMemo(
    () => (activeCampaignId ? items.find((x) => String(x.id) === String(activeCampaignId)) : null),
    [activeCampaignId, items]
  );

  const goList = () => {
    if (soundEnabled && playSynthSound) playSynthSound("click");
    if (setActiveCampaignId) setActiveCampaignId(null);
  };

  const openDetail = (id: string) => {
    if (soundEnabled && playSynthSound) playSynthSound("click");
    if (setActiveCampaignId) setActiveCampaignId(String(id));
  };

  const openChat = (p: OwnerProposal) => {
    if (soundEnabled && playSynthSound) playSynthSound("click");
    const toUserId = p?.agency?.id || "";
    const propertyId = p?.property?.id || "";
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-chat-signal", {
          detail: { toUserId, propertyId, campaignId: p.id },
        })
      );
    }
  };

  const accept = async (id: string) => {
    if (soundEnabled && playSynthSound) playSynthSound("success");
    if (onAccept) return onAccept(id);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("respond-campaign-signal", { detail: { campaignId: id, decision: "ACCEPT" } }));
    }
  };

  const reject = async (id: string) => {
    if (soundEnabled && playSynthSound) playSynthSound("error");
    if (onReject) return onReject(id);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("respond-campaign-signal", { detail: { campaignId: id, decision: "REJECT" } }));
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] z-[65000] flex flex-col pointer-events-auto animate-slide-in-right bg-[#E5E5EA] shadow-2xl">
      {/* HEADER */}
      <div className="shrink-0 px-7 pt-7 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {selected ? "Expediente" : "Propuestas"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Modo: <span className="font-bold">{selected ? "EXPEDIENTE" : "LISTA"}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selected && (
              <button
                onClick={goList}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                title="Volver"
              >
                <ArrowLeft size={18} />
              </button>
            )}

            <button
              onClick={() => toggleRightPanel("NONE")}
              className="px-5 py-2.5 rounded-full bg-black text-white text-xs font-black tracking-widest uppercase hover:opacity-90 transition-opacity"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-7 pb-10 custom-scrollbar">
        {/* EMPTY */}
        {!selected && items.length === 0 && (
          <div className="bg-white rounded-[28px] border border-slate-200 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Sparkles size={20} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Aún no hay propuestas</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Cuando una agencia te envíe una campaña, aparecerá aquí con su marca, servicios y comisión, lista para
              aceptar o rechazar.
            </p>
          </div>
        )}

        {/* LIST */}
        {!selected && items.length > 0 && (
          <div className="space-y-4">
            {items.map((p) => {
              const st = statusMeta(p.status);
              const title = safeText(p?.property?.title) || "Activo";
              const ref = safeText(p?.property?.refCode);
              const loc = safeText(p?.property?.location) || safeText(p?.property?.address);
              const agencyName =
                safeText(p?.agency?.companyName) || safeText(p?.agency?.name) || "Agencia";

              const total = p?.terms?.commissionTotalEur;
              const msg = safeText(p?.message) || buildDefaultMessage(p);

              const services = (p?.services || [])
                .map((x: any) => (typeof x === "string" ? x : x?.label || x?.id))
                .filter(Boolean);

              return (
                <button
                  key={p.id}
                  onClick={() => openDetail(p.id)}
                  className="w-full text-left bg-white rounded-[28px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                >
                  {/* Property row */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-black text-slate-900 truncate">{title}</h3>
                          {ref ? (
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {ref}
                            </span>
                          ) : null}
                        </div>
                        {loc ? (
                          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <MapPin size={12} />
                            <span className="truncate">{loc}</span>
                          </div>
                        ) : null}
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${st.cls}`}
                      >
                        {st.label}
                      </span>
                    </div>

                    {/* Agency brand mini */}
                    <div className="mt-5 rounded-[22px] border border-slate-200 overflow-hidden">
                      <div className="h-16 bg-gradient-to-r from-slate-900 to-slate-700 relative">
                        {p?.agency?.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.agency.coverImage}
                            alt="cover"
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                          />
                        ) : null}
                      </div>
                      <div className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                          {p?.agency?.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.agency.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 size={18} className="text-slate-500" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-400">
                            AGENCIA
                          </p>
                          <p className="font-black text-slate-900 truncate">{agencyName}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Comisión</p>
                          <p className="text-sm font-black text-slate-900">
                            {Number.isFinite(Number(total)) ? euro(total) : "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Message preview */}
                    <div className="mt-5 bg-blue-600 text-white rounded-[22px] p-4 text-sm leading-relaxed">
                      {msg}
                    </div>

                    {/* Services chips */}
                    {services.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {services.slice(0, 6).map((s: any, idx: number) => (
                          <span
                            key={`${p.id}-${idx}`}
                            className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {String(s).replace(/_/g, " ")}
                          </span>
                        ))}
                        {services.length > 6 && (
                          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-black text-white">
                            +{services.length - 6}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* DETAIL */}
        {selected && (
          <div className="space-y-4">
            {/* Property */}
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-400">ACTIVO</p>
                  <h3 className="text-xl font-black text-slate-900 mt-1 truncate">
                    {safeText(selected?.property?.title) || "Activo"}
                  </h3>
                  {(safeText(selected?.property?.location) || safeText(selected?.property?.address)) && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={14} />
                      <span className="truncate">
                        {safeText(selected?.property?.location) || safeText(selected?.property?.address)}
                      </span>
                    </div>
                  )}
                </div>

                {safeText(selected?.property?.refCode) ? (
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {selected.property?.refCode}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Agency brand full */}
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-28 bg-gradient-to-r from-slate-900 to-slate-700 relative">
                {selected?.agency?.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.agency.coverImage}
                    alt="cover"
                    className="absolute inset-0 w-full h-full object-cover opacity-85"
                  />
                ) : null}
                <button
                  onClick={() => toggleRightPanel("NONE")}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white border border-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors"
                  title="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden border border-slate-200 shadow-sm shrink-0 -mt-12">
                  {selected?.agency?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selected.agency.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={20} className="text-slate-600" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-400">AGENCIA</p>
                  <h4 className="text-xl font-black text-slate-900 mt-1 truncate">
                    {safeText(selected?.agency?.companyName) ||
                      safeText(selected?.agency?.name) ||
                      "Agencia"}
                  </h4>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Phone size={14} /> TEL / WHATSAPP
                      </p>
                      <p className="text-lg font-black text-slate-900 mt-1">
                        {safeText(selected?.agency?.mobile) || safeText(selected?.agency?.phone) || "—"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Mail size={14} /> EMAIL
                      </p>
                      <p className="text-sm font-black text-slate-900 mt-2 truncate">
                        {safeText(selected?.agency?.email) || "—"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openChat(selected)}
                    className="mt-4 w-full py-4 bg-black text-white rounded-[22px] text-xs font-black tracking-[0.35em] uppercase flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle size={18} />
                    CHAT DIRECTO
                  </button>
                </div>
              </div>
            </div>

            {/* Message bubble */}
            <div className="bg-blue-600 text-white rounded-[28px] p-6 text-sm leading-relaxed">
              {safeText(selected?.message) || buildDefaultMessage(selected)}
            </div>

            {/* Services + Terms */}
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6">
              <p className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-400 mb-4">
                SERVICIOS INCLUIDOS
              </p>

              {(() => {
                const s = (selected?.services || [])
                  .map((x: any) => {
                    if (typeof x === "string") return { label: x, mode: "ONLINE" as const };
                    return { label: x?.label || x?.id, mode: x?.mode || "ONLINE" };
                  })
                  .filter((x) => x.label);

                const online = s.filter((x) => x.mode === "ONLINE");
                const offline = s.filter((x) => x.mode === "OFFLINE");

                const renderList = (arr: any[]) => (
                  <div className="flex flex-wrap gap-2">
                    {arr.map((x, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {String(x.label).replace(/_/g, " ")}
                      </span>
                    ))}
                    {arr.length === 0 && <span className="text-sm text-slate-400">—</span>}
                  </div>
                );

                return (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">ONLINE</p>
                      {renderList(online)}
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">OFFLINE</p>
                      {renderList(offline)}
                    </div>
                  </div>
                );
              })()}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">MANDATO</p>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    {selected?.terms?.exclusive ? "EXCLUSIVA" : "NO EXCLUSIVA"}
                    {Number.isFinite(Number(selected?.terms?.months)) ? ` · ${selected?.terms?.months}m` : ""}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">COMISIÓN</p>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    {pct(selected?.terms?.commissionPct)} + IVA {pct(selected?.terms?.ivaPct)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 col-span-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">COMISIÓN TOTAL</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {Number.isFinite(Number(selected?.terms?.commissionTotalEur))
                      ? euro(selected?.terms?.commissionTotalEur)
                      : "—"}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Base: {euro(selected?.terms?.commissionBaseEur)}</span>
                    <span>IVA: {euro(selected?.terms?.ivaAmountEur)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => reject(selected.id)}
                className="py-4 rounded-[22px] bg-white border border-rose-200 text-rose-600 font-black text-xs tracking-[0.25em] uppercase flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors"
              >
                <XCircle size={16} />
                RECHAZAR
              </button>

              <button
                onClick={() => accept(selected.id)}
                className="py-4 rounded-[22px] bg-black text-white font-black text-xs tracking-[0.25em] uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Check size={16} />
                ACEPTAR
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed px-1 pb-6">
              Al aceptar, se abre el expediente y el chat directo con la agencia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
