"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  X, Navigation, ChevronLeft, Search, Check, ShieldCheck,
  MessageSquare, User, Loader2, Send, CheckCircle2, FileText, MapPin
} from "lucide-react";

import {
  getUserMeAction,
  getMyAgencyCampaignPropertyIdsAction,

  // ✅ Radar/Comms real
  getCampaignByPropertyAction,
  sendCampaignAction,

  // ✅ Chat real
  getConversationMessagesAction,
  sendMessageAction,
  markConversationReadAction,

  // ✅ Abrir Details con snapshot completo
  getPropertyByIdAction,
} from "@/app/actions";

export default function TacticalRadarController({ targets = [], onClose }: any) {

  // --- 1. ESTADOS ---
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [msgStatus, setMsgStatus] = useState<"IDLE" | "SENDING" | "SENT">("IDLE");

  // Chat Real
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ✅ Estado “procesado” (SERVER TRUTH, ya no localStorage)
  const [processedIds, setProcessedIds] = useState<string[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
// Búsqueda y Navegación
const [searchTerm, setSearchTerm] = useState("");
const [isFlying, setIsFlying] = useState(false);
const [activeTab, setActiveTab] = useState<"RADAR" | "COMMS">("RADAR");

// ✅ Propuesta de campaña (SERVICIOS = selección de la AGENCIA, NO propietario, NO localStorage)
const [servicesTab, setServicesTab] = useState<"ONLINE" | "OFFLINE">("ONLINE");
const [proposalServiceIds, setProposalServiceIds] = useState<string[]>([]);

// ✅ Comisión + IVA gestión
const [commissionPct, setCommissionPct] = useState<number>(3); // % gestión
const [commissionIvaPct, setCommissionIvaPct] = useState<number>(21); // IVA por defecto
const [commissionSharePct, setCommissionSharePct] = useState<number>(0); // % del total (privado entre agencias)
type CommissionShareVisibility = "PRIVATE" | "AGENCIES" | "PUBLIC";
const [commissionShareVisibility, setCommissionShareVisibility] =
  useState<CommissionShareVisibility>("AGENCIES");

// ✅ Mandato / Exclusividad (VISIBLE AL CLIENTE)
const [exclusiveMandate, setExclusiveMandate] = useState<boolean>(true);
const [exclusiveMonths, setExclusiveMonths] = useState<number>(6);

const toggleProposalService = (id: string) => {
  const sid = String(id || "").trim();
  if (!sid) return;
  setProposalServiceIds((prev) => {
    const list = Array.isArray(prev) ? prev : [];
    return list.includes(sid) ? list.filter((x) => x !== sid) : [...list, sid];
  });
};

// ✅ Catálogo ONLINE/OFFLINE (sin precios aquí; esto es SOLO para proponer acciones)
const RADAR_SERVICES = [
  // ONLINE
  { id: "foto", name: "FOTOGRAFÍA HDR", category: "ONLINE" },
  { id: "video", name: "VÍDEO CINE", category: "ONLINE" },
  { id: "drone", name: "FOTOGRAFÍA DRONE", category: "ONLINE" },
  { id: "tour3d", name: "TOUR VIRTUAL 3D", category: "ONLINE" },
  { id: "destacado", name: "POSICIONAMIENTO", category: "ONLINE" },
  { id: "ads", name: "PAID SOCIAL ADS", category: "ONLINE" },
  { id: "plano_2d", name: "PLANO TÉCNICO", category: "ONLINE" },
  { id: "plano_3d", name: "PLANO 3D", category: "ONLINE" },
  { id: "email", name: "EMAIL INVERSORES", category: "ONLINE" },
  { id: "copy", name: "COPYWRITING PRO", category: "ONLINE" },

  // OFFLINE
  { id: "certificado", name: "CERTIFICADO ENERG.", category: "OFFLINE" },
  { id: "cedula", name: "CÉDULA HABITAB.", category: "OFFLINE" },
  { id: "nota_simple", name: "NOTA SIMPLE", category: "OFFLINE" },
  { id: "tasacion", name: "TASACIÓN OFICIAL", category: "OFFLINE" },
  { id: "lona", name: "LONA FACHADA XL", category: "OFFLINE" },
  { id: "buzoneo", name: "BUZONEO PREMIUM", category: "OFFLINE" },
  { id: "revista", name: "REVISTA LUXURY", category: "OFFLINE" },
  { id: "openhouse", name: "OPEN HOUSE VIP", category: "OFFLINE" },
  { id: "homestaging", name: "HOME STAGING", category: "OFFLINE" },
  { id: "limpieza", name: "LIMPIEZA PRO", category: "OFFLINE" },
  { id: "pintura", name: "LAVADO DE CARA", category: "OFFLINE" },
  { id: "mudanza", name: "MUDANZA", category: "OFFLINE" },
  { id: "seguro", name: "SEGURO IMPAGO", category: "OFFLINE" },
] as const;

const RADAR_SERVICE_MAP: Record<string, { id: string; name: string; category: string }> =
  Object.fromEntries(
    RADAR_SERVICES.map((s) => [String(s.id), { id: String(s.id), name: String(s.name), category: String(s.category) }])
  );

const getServiceLabel = (id: string) =>
  RADAR_SERVICE_MAP[String(id)]?.name || String(id);

// ✅ SOLO lo que selecciona la agencia para esta propuesta (ONLINE/OFFLINE)
const getServiceIdsForCampaign = () => {
  return (Array.isArray(proposalServiceIds) ? proposalServiceIds : [])
    .map((x) => String(x).trim())
    .filter(Boolean)
    .filter((id) => !String(id).startsWith("pack_"));
};

// ✅ Mensaje por defecto (propuesta) + mandato + exclusividad + total comisión (si hay precio)
const buildDefaultProposalMessage = (opts?: { agencyRole?: string; refCode?: string; price?: any }) => {
  const roleTxt = opts?.agencyRole ? `Rol: ${opts.agencyRole}. ` : "";
  const sids = getServiceIdsForCampaign();
  const count = sids.length;
  const list = sids.map(getServiceLabel).join(", ");

  const mandateTxt = exclusiveMandate
    ? `Mandato: Exclusiva (${exclusiveMonths} meses). `
    : `Mandato: No exclusiva. `;

  const rawPrice = String(opts?.price ?? "").trim();
  const priceNum = rawPrice
    ? Number(
        rawPrice
          .replace(/\s/g, "")
          .replace(/€/g, "")
          .replace(/\./g, "")
          .replace(/,/g, ".")
      )
    : NaN;

  const base = Number.isFinite(priceNum) ? priceNum * (commissionPct / 100) : NaN;
  const iva = Number.isFinite(base) ? base * (commissionIvaPct / 100) : NaN;
  const total = Number.isFinite(base) && Number.isFinite(iva) ? base + iva : NaN;

   const moneyTxt = Number.isFinite(total)
    ? `Importe comisión: ${base.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}€ + IVA ${iva.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}€ = ${total.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}€. `
    : "";

  const sharePct = Math.max(0, Math.min(100, Number(commissionSharePct || 0)));
  const shareAmount = Number.isFinite(total) ? total * (sharePct / 100) : NaN;

  const shareTxt =
    commissionShareVisibility === "PUBLIC" && Number.isFinite(shareAmount) && sharePct > 0
      ? `Reparto agente: ${sharePct}% del total (${shareAmount.toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}€). `
      : "";

  return (
    `Propuesta de gestión (${opts?.refCode || "SF"}). ` +
    mandateTxt +
    `${roleTxt}` +
    `Comisión ${commissionPct}% + IVA ${commissionIvaPct}%. ` +
    moneyTxt +
    shareTxt +
    `\nServicios incluidos (${count}): ${list || "—"}.` +
    `\nSi aceptas, abrimos expediente y chat directo.`
  );
};

// --- helpers comisión total + reparto (solo UI) ---
const parsePriceNumber = (val: any) => {
  const raw = String(val ?? "").trim();
  if (!raw) return 0;

  const cleaned = raw
    .replace(/[^\d.,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const propertyPriceEur = parsePriceNumber(selectedTarget?.price);
const commissionBaseEur = propertyPriceEur * (Number(commissionPct || 0) / 100);
const commissionTotalEur = commissionBaseEur * (1 + Number(commissionIvaPct || 0) / 100);

const sharedPct = Math.max(0, Math.min(100, Number(commissionSharePct || 0)));
const sharedAmountEur = commissionTotalEur * (sharedPct / 100);


// UI chat espera { sender: 'me'|'other', text }
const normalizeMessagesForUI = (msgs: any[], myId: string | null) => {
  const list = Array.isArray(msgs) ? msgs : [];
  return list.map((m: any) => {
    const senderId = String(m?.senderId || m?.sender?.id || "");
    const isMe = !!myId && senderId && String(senderId) === String(myId);
    return { sender: isMe ? "me" : "other", text: String(m?.text ?? m?.content ?? "") };
  });
};

  
  // --- 2. MEMORIA (SERVER) ---
  useEffect(() => {
    (async () => {
      try {
        const meRes: any = await getUserMeAction();
        if (meRes?.success && meRes?.data?.id) setMeId(String(meRes.data.id));

        const idsRes: any = await getMyAgencyCampaignPropertyIdsAction();
        if (idsRes?.success && Array.isArray(idsRes?.data)) {
          setProcessedIds(idsRes.data.map((x: any) => String(x)));
        }
      } catch (e) {
        console.error("Radar init error:", e);
      }
    })();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, activeTab]);
// ✅ Normaliza mensajes DB -> UI actual ({sender:'me'|'other', text})
const mapDbMessagesToUi = (msgs: any[]) => {
  const list = Array.isArray(msgs) ? msgs : [];
  return list.map((m: any) => ({
    sender: String(m?.senderId || "") === String(meId) ? "me" : "other",
    text: String(m?.text ?? m?.content ?? ""),
  }));
};

const openConversation = async (cid: string) => {
  const safe = String(cid || "").trim();
  if (!safe) return;

  setConversationId(safe);
  setActiveTab("COMMS");

  const msgsRes: any = await getConversationMessagesAction(safe);
  if (msgsRes?.success) {
    setChatHistory(mapDbMessagesToUi(msgsRes.data || []));
  }

  // ✅ unread real
  try {
    await markConversationReadAction(safe);
  } catch {}
};

  // --- 3. MOTOR DE BÚSQUEDA (SIN FILTRAR LA LISTA - SOLO VUELO) ---
  const performGlobalSearch = async () => {
    if (!searchTerm) return;

    setIsFlying(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const location = data[0];
        const lat = parseFloat(location.lat);
        const lon = parseFloat(location.lon);

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("fly-to-location", {
              detail: { center: [lon, lat], zoom: 14, pitch: 45 },
            })
          );

          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("trigger-scan-signal"));
            setIsFlying(false);
          }, 2000);
        }
      } else {
        setIsFlying(false);
      }
    } catch (error) {
      console.error("Error navegación:", error);
      setIsFlying(false);
    }
  };

  // --- 4. LÓGICA DE NEGOCIO (LEER NANOCARD) ---
 const handleTrabajar = async (target: any) => {
  setSelectedTarget(target);

  const pid = String(target?.id || "").trim();
  const isProcessed = processedIds.includes(pid);

  if (isProcessed) {
    setMsgStatus("SENT");

    // ✅ Server truth: buscamos Campaign y abrimos su conversación
    const campRes: any = await getCampaignByPropertyAction(pid);
    const cid = campRes?.success ? campRes?.data?.conversationId : null;

    if (cid) {
      await openConversation(String(cid));
    } else {
      // fallback suave: abre COMMS sin historial (no rompe)
      setActiveTab("COMMS");
      setChatHistory([]);
    }
  } else {
    setMsgStatus("IDLE");
    setActiveTab("RADAR");
    setConversationId(null);
    setChatHistory([]);
  }
};
  const handleVolarAPropiedad = (e: any, target: any) => {
    e.stopPropagation(); 
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("fly-to-location", { 
        detail: { center: [target.lng || target.longitude, target.lat || target.latitude], zoom: 18, pitch: 60 } 
      }));
    }
  };
const openDetailsAndFlyFromTarget = async (target: any) => {
  const pid = String(target?.id || "").trim();
  if (!pid) return;

  // Intento: traer snapshot completo (por si targets es “stub”)
  let prop: any = target;
  try {
    const res: any = await getPropertyByIdAction(pid);
    if (res?.success && res?.data) prop = res.data;
  } catch {}

  // Coordenadas seguras
  const lng =
    prop?.lng ?? prop?.longitude ?? (Array.isArray(prop?.coordinates) ? prop.coordinates[0] : null);
  const lat =
    prop?.lat ?? prop?.latitude ?? (Array.isArray(prop?.coordinates) ? prop.coordinates[1] : null);

  // 1) Vuelo
  if (typeof window !== "undefined" && lng != null && lat != null) {
    window.dispatchEvent(
      new CustomEvent("fly-to-location", {
        detail: { center: [lng, lat], zoom: 18, pitch: 60 },
      })
    );
  }

  // 2) Abrir Details
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-details-signal", {
        detail: {
          propertyId: pid,
          propertySnapshot: prop,
          property: prop,
          id: pid,
        },
      })
    );
  }
};

// --- 5. ACEPTAR/PROPONER ENCARGO (REAL) ---
const aceptarEncargo = async () => {
  if (!selectedTarget) return;

  const pid = String(selectedTarget?.id || "").trim();
  if (!pid) return;

  setMsgStatus("SENDING");

  try {
    // ✅ serviceIds = selección del AGENTE (ONLINE + OFFLINE), sin packs
    const serviceIds = Array.from(
      new Set(
        (Array.isArray(proposalServiceIds) ? proposalServiceIds : [])
          .map((s: any) => String(s).trim())
          .filter(Boolean)
          .filter((id) => !id.startsWith("pack_"))
      )
    );

    const defaultMsg = buildDefaultProposalMessage({
  agencyRole: undefined,
  refCode: selectedTarget?.refCode,
  price: selectedTarget?.price,
});

const res: any = await sendCampaignAction({
  propertyId: pid,
  message: defaultMsg,
  serviceIds,
  // ✅ IMPORTANTE: si tu backend NO tiene "PROPOSED", deja "ACCEPTED"
  status: "PROPOSED",
});

if (!res?.success) {
  console.error("sendCampaignAction failed:", res?.error);
  setMsgStatus("IDLE");
  return;
}

const convId = res?.data?.conversationId ? String(res.data.conversationId) : null;


    // ✅ refrescar procesados desde server truth
    try {
      const idsRes: any = await getMyAgencyCampaignPropertyIdsAction();
      if (idsRes?.success && Array.isArray(idsRes?.data)) {
        setProcessedIds(idsRes.data.map((x: any) => String(x)));
      }
    } catch {}

    setMsgStatus("SENT");

    if (convId) {
      setConversationId(convId);
      setActiveTab("COMMS");

      const msgsRes: any = await getConversationMessagesAction(convId);
      const msgs = msgsRes?.success && Array.isArray(msgsRes.data) ? msgsRes.data : [];

      setChatHistory(
        msgs.map((m: any) => ({
          sender: String(m?.senderId || "") === String(meId || "") ? "me" : "other",
          text: String(m?.text ?? m?.content ?? ""),
        }))
      );

      try {
        await markConversationReadAction(convId);
      } catch {}
    } else {
      setActiveTab("COMMS");
    }
  } catch (e) {
    console.error("aceptarEncargo error:", e);
    setMsgStatus("IDLE");
  }
};

 const enviarMensaje = async () => {
  const text = String(inputMsg || "").trim();
  if (!text) return;

  const cid = conversationId ? String(conversationId) : "";
  if (!cid) return; // si no hay conversación, no enviamos (no rompe)

  setInputMsg("");

  const res: any = await sendMessageAction({ conversationId: cid, text });
  if (!res?.success) {
    console.error("sendMessage failed:", res?.error);
    return;
  }

  // ✅ Añadimos al UI sin recargar todo
  setChatHistory((prev) => [...(Array.isArray(prev) ? prev : []), { sender: "me", text }]);

  // ✅ unread real (tuya = leída)
  try {
    await markConversationReadAction(cid);
  } catch {}
};


  // --- RENDERIZADO ---
  return (
    <div className="flex flex-col h-full w-full bg-[#F5F5F7]/95 backdrop-blur-3xl text-slate-900 shadow-2xl font-sans border-l border-white/40 pointer-events-auto">
      
      {/* 1. CABECERA DE CONTROL DE MISIÓN (SIEMPRE VISIBLE) */}
      <div className="shrink-0 p-6 pb-4 border-b border-black/5 z-20 bg-white/40 backdrop-blur-md">
         <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
               {selectedTarget && (
                   <button onClick={() => setSelectedTarget(null)} className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-sm border border-black/5 transition-all">
                       <ChevronLeft size={18} className="text-slate-600"/>
                   </button>
               )}
               <div>
                   <h2 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                       {selectedTarget ? "Expediente" : "Radar de Zona"}
                   </h2>
                   {!selectedTarget && (
                       <p className="text-[10px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                           {isFlying ? <Loader2 size={10} className="animate-spin"/> : <MapPin size={10}/>}
                           {isFlying ? "Reposicionando satélite..." : "Escaneo activo"}
                       </p>
                   )}
               </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all">
               <X size={16} />
            </button>
         </div>

         {/* BARRA DE NAVEGACIÓN (VUELO) - NO FILTRA, SOLO MUEVE */}
         {!selectedTarget && (
             <div className="flex gap-2">
                 <div className="flex-1 bg-white flex items-center px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-blue-500 transition-all">
                     <Search size={14} className="text-slate-400 mr-2" />
                     <input 
                        type="text" 
                        placeholder="Ir a zona (ej: Manilva)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && performGlobalSearch()}
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-full placeholder-slate-400"
                     />
                 </div>
                 <button 
                    onClick={performGlobalSearch} 
                    className="px-4 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-colors shadow-md"
                    disabled={isFlying}
                 >
                     {isFlying ? <Loader2 size={14} className="animate-spin"/> : <Navigation size={14} />}
                 </button>
             </div>
         )}
      </div>

      {/* 2. CUERPO PRINCIPAL */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-0">
         
         {selectedTarget ? (
            /* --- VISTA DE EXPEDIENTE (NANOCARD REAL) --- */
            <div className="p-6 space-y-6 animate-fade-in-up">
                
                {/* FICHA TÉCNICA */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">Campaña Activa</span>
                        <span className="text-lg font-black text-slate-900">{selectedTarget.price || "Consultar"}</span>
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 leading-tight mb-1">{selectedTarget.type || "Propiedad Residencial"}</h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Navigation size={10}/> {selectedTarget.address || "Ubicación por confirmar"}
                    </p>
                </div>

                {/* TABS DE GESTIÓN */}
                <div className="bg-slate-100 p-1 rounded-xl flex text-center">
                    <button onClick={() => setActiveTab('RADAR')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'RADAR' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Campaña</button>
                    <button onClick={() => setActiveTab('COMMS')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'COMMS' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Chat Directo</button>
                </div>

                {activeTab === 'RADAR' && (
                    <div className="animate-fade-in">
                        {msgStatus === 'SENT' ? (
                            <div className="text-center py-6 bg-white rounded-3xl border border-slate-100 border-dashed">
                                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2"/>
                                <p className="text-sm font-bold text-slate-900">Encargo Aceptado</p>
                                <p className="text-[10px] text-slate-400 mt-1">El propietario ha recibido su confirmación.</p>
                                <button onClick={() => setActiveTab('COMMS')} className="mt-4 text-[10px] text-blue-600 font-bold hover:underline">Ir a mensajería</button>
                            </div>
                        ) : (
                            <>
                                                                {/* PROPUESTA DE CAMPAÑA (SERVICIOS QUE OFRECE LA AGENCIA) */}
                                <div className="mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Servicios de la Agencia</p>

                                    {/* Tabs ONLINE / OFFLINE */}
                                    <div className="bg-slate-100 p-1 rounded-xl flex text-center mb-3">
                                        <button
                                            onClick={() => setServicesTab("ONLINE")}
                                            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${servicesTab === "ONLINE" ? "bg-white shadow-sm text-slate-900" : "text-slate-400"}`}
                                        >
                                            Online
                                        </button>
                                        <button
                                            onClick={() => setServicesTab("OFFLINE")}
                                            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${servicesTab === "OFFLINE" ? "bg-white shadow-sm text-slate-900" : "text-slate-400"}`}
                                        >
                                            Offline
                                        </button>
                                    </div>

                                    {/* Lista seleccionable */}
                                    <div className="bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
                                        {RADAR_SERVICES
  .filter((s) => String(s?.category) === String(servicesTab))
  .map((item, i) => {
    const sid = String(item?.id || "");
    const isOn = proposalServiceIds.includes(sid);
    return (
      <button
        key={`${sid}_${i}`}
        type="button"
        onClick={() => toggleProposalService(sid)}
        className="w-full text-left flex items-center gap-3 p-3 border-b border-slate-50 last:border-0"
      >
        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${isOn ? "bg-blue-600 border-blue-600" : "bg-white border-slate-200"}`}>
          {isOn && <Check size={12} strokeWidth={4} className="text-white" />}
        </div>
        <span className="text-xs font-bold text-slate-700">{String(item?.name || sid)}</span>
      </button>
    );
  })}

                                    </div>

                                  {/* ✅ Mandato + Exclusividad (VISIBLE AL CLIENTE) */}
<div className="mt-3 bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
    Mandato
  </p>

  <div className="grid grid-cols-2 gap-2">
    <button
      type="button"
      onClick={() => setExclusiveMandate(true)}
      className={`h-10 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all
        ${exclusiveMandate ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-700 border-slate-200"}
      `}
    >
      Exclusiva
    </button>

    <button
      type="button"
      onClick={() => setExclusiveMandate(false)}
      className={`h-10 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all
        ${!exclusiveMandate ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-700 border-slate-200"}
      `}
    >
      No exclusiva
    </button>
  </div>

  <div className="mt-2">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
      Tiempo (meses)
    </p>
    <input
      type="number"
      min={0}
      step={1}
      value={exclusiveMonths}
      onChange={(e) => setExclusiveMonths(Number(e.target.value || 0))}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
    />
  </div>
</div>

{/* Comisión + IVA */}
<div className="mt-3 grid grid-cols-2 gap-2">
  <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Comisión %</p>
    <input
      type="number"
      step="0.1"
      value={commissionPct}
      onChange={(e) => setCommissionPct(Number(e.target.value))}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
    />
  </div>

  <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">IVA %</p>
    <input
      type="number"
      step="0.1"
      value={commissionIvaPct}
      onChange={(e) => setCommissionIvaPct(Number(e.target.value))}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
    />
  </div>
</div>
{/* Comisión total + reparto (privado entre agencias) */}
<div className="mt-2 grid grid-cols-2 gap-2">
  <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
      Comisión total €
    </p>
    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900">
      {commissionTotalEur.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
    </div>

       <div className="mt-3">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">
        Reparto estimado €
      </p>
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 text-center">
        {sharedAmountEur.toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}€
      </div>
    </div>
  </div>

  <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
      Reparto agente %
    </p>

    <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl p-1 grid grid-cols-3 gap-1">
      <button
        type="button"
        onClick={() => setCommissionShareVisibility("PRIVATE")}
        className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all
          ${commissionShareVisibility === "PRIVATE" ? "bg-blue-600 text-white" : "text-slate-500"}
        `}
      >
        Privado
      </button>

      <button
        type="button"
        onClick={() => setCommissionShareVisibility("AGENCIES")}
        className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all
          ${commissionShareVisibility === "AGENCIES" ? "bg-blue-600 text-white" : "text-slate-500"}
        `}
      >
        Agencias
      </button>

      <button
        type="button"
        onClick={() => setCommissionShareVisibility("PUBLIC")}
        className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all
          ${commissionShareVisibility === "PUBLIC" ? "bg-blue-600 text-white" : "text-slate-500"}
        `}
      >
        Público
      </button>
    </div>

    <p className="mt-2 text-[9px] text-slate-400 font-bold">
      {commissionShareVisibility === "PRIVATE"
        ? "Solo tú (no se muestra)."
        : commissionShareVisibility === "AGENCIES"
        ? "Solo agencias (no lo ve el cliente)."
        : "Cliente + agencias (visible)."}
    </p>

    <input
      type="number"
      step="0.1"
      min={0}
      max={100}
      value={commissionSharePct}
      onChange={(e) => setCommissionSharePct(Number(e.target.value))}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
    />
  </div>
</div>

{/* Total servicios seleccionados */}
<p className="mt-4 text-center text-[12px] font-black uppercase tracking-widest text-slate-500">
  TOTAL SERVICIOS SELECCIONADOS:{" "}
  <span className="text-[12px] font-black text-slate-900">
    {proposalServiceIds.length}
  </span>
</p>


                                </div>

                                <button
                                    onClick={aceptarEncargo}
                                    disabled={msgStatus === "SENDING" || proposalServiceIds.length === 0}
                                    className="w-full bg-slate-900 text-white font-bold text-xs py-4 rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {msgStatus === "SENDING" ? <Loader2 size={14} className="animate-spin" /> : "ENVIAR PROPUESTA"}
                                </button>
                                <p className="text-[9px] text-center text-slate-400 mt-3">Al enviar propuesta, se abrirá un canal directo con el propietario.</p>
                            </>

                        )}
                    </div>
                )}

                {activeTab === 'COMMS' && (
                    <div className="flex flex-col h-[350px] bg-white rounded-3xl border border-slate-100 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                            {chatHistory.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full opacity-40">
                                    <MessageSquare size={24} className="mb-2 text-slate-400"/>
                                    <p className="text-[10px] font-medium">Historial vacío</p>
                                </div>
                            )}
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex gap-2 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`p-3 rounded-2xl text-[11px] max-w-[85%] font-medium leading-relaxed ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                            <input 
                                value={inputMsg}
                                onChange={e => setInputMsg(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && enviarMensaje()}
                                type="text" 
                                placeholder="Escribir al propietario..."
                                className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-xs outline-none text-slate-800 font-medium"
                            />
                            <button onClick={enviarMensaje} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-black"><Send size={14}/></button>
                        </div>
                    </div>
                )}
            </div>
         ) : (
            /* --- VISTA LISTA (RESULTADOS DEL ESCANEO) --- */
            <div className="pb-10">
                <div className="px-6 py-3 bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Resultados ({targets.length})
                    </span>
                    {isFlying && <Loader2 size={12} className="animate-spin text-slate-400"/>}
                </div>

                <div className="px-4 py-2 space-y-2">
                    {targets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 opacity-50">
                             <Search size={32} className="mb-3 text-slate-300"/>
                             <p className="text-xs font-bold text-slate-400">Sin señales en este sector.</p>
                             <p className="text-[10px] text-slate-400 mt-1 max-w-[150px] text-center">Use el buscador superior para mover el satélite.</p>
                        </div>
                    ) : (
                        targets.map((t: any) => {
                            const isProcessed = processedIds.includes(String(t.id));
                            return (
                                <div 
                                   key={t.id}
onClick={() => {
  handleTrabajar(t);
  openDetailsAndFlyFromTarget(t);
}}
className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border border-transparent
  ${isProcessed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white hover:border-slate-200 hover:shadow-md'}
`}

                                >
                                    <div className="flex-1 min-w-0 pr-3">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="font-bold text-slate-900 text-xs truncate">{t.type || "Propiedad"}</span>
                                            {isProcessed && <CheckCircle2 size={12} className="text-emerald-500"/>}
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1">
                                            <MapPin size={10} className="shrink-0"/> {t.address || "Ubicación desconocida"}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="block font-black text-slate-900 text-xs">{t.price || "---"}</span>
                                        <div className="flex justify-end mt-1">
                                            <button 
                                                onClick={(e) => handleVolarAPropiedad(e, t)}
                                                className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all"
                                            >
                                                <Navigation size={10}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
         )}
      </div>
    </div>
  );
}

