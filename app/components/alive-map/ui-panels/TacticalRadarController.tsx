"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Navigation,
  ChevronLeft,
  Search,
  Check,
  MessageSquare,
  Loader2,
  Send,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Sparkles,
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

type MsgStatus = "IDLE" | "SENDING" | "SENT" | "ACCEPTED" | "REJECTED";

type RoleFilter = "ALL" | "PARTICULAR" | "AGENCY";

export default function TacticalRadarController({ targets = [], onClose }: any) {
  // --- 1. ESTADOS ---
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [msgStatus, setMsgStatus] = useState<MsgStatus>("IDLE");

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

  // ✅ Filtro roles (UI)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
// 🔥 ESTADO DE LA LISTA ENRIQUECIDA (Con datos reales de DB)
  const [enrichedTargets, setEnrichedTargets] = useState<any[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);
  // ✅ Propuesta de campaña (SERVICIOS = selección de la AGENCIA, NO propietario, NO localStorage)
  const [servicesTab, setServicesTab] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [proposalServiceIds, setProposalServiceIds] = useState<string[]>([]);

  // ✅ Comisión + IVA gestión
  const [commissionPct, setCommissionPct] = useState<number>(3); // % gestión
  const [commissionIvaPct, setCommissionIvaPct] = useState<number>(21); // IVA por defecto

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
    { id: "video", name: "VÍDEO CINEMÁTICO", category: "ONLINE" },
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
      RADAR_SERVICES.map((s) => [
        String(s.id),
        { id: String(s.id), name: String(s.name), category: String(s.category) },
      ])
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

  // --- helpers premium/DB ---
  const pickImageUrl = (t: any) => {
    const url =
      t?.mainImage ||
      t?.img ||
      (Array.isArray(t?.images) ? t.images?.[0]?.url : null) ||
      null;
    return url ? String(url) : null;
  };

  const pickOwnerName = (t: any) => {
    const n =
      t?.user?.name ||
      t?.ownerSnapshot?.name ||
      t?.owner?.name ||
      t?.user?.displayName ||
      "";
    return String(n || "").trim();
  };

 // --- 1. DETECCIÓN DE ROL BLINDADA ---
  const pickRole = (t: any): "AGENCY" | "PARTICULAR" => {
    const raw =
      t?.user?.role ||
      t?.ownerSnapshot?.role ||
      t?.owner?.role ||
      t?.role ||
      "";
    const role = String(raw || "").toUpperCase();
    
    if (role.includes("AGENCY") || role.includes("AGENCIA")) return "AGENCY";
    if (t?.companyName || t?.agencyId || t?.agencyName) return "AGENCY";

    // Si no es agencia, devolvemos SIEMPRE Particular. Adiós textos vacíos.
    return "PARTICULAR";
  };

  // --- 2. BADGE VISUAL LIMPIO ---
  const roleBadge = (t: any) => {
    const r = pickRole(t);
    if (r === "AGENCY") return { label: "Agencia", tone: "blue" as const };
    return { label: "Particular", tone: "slate" as const };
  };

  // --- helpers comisión total ---
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
  const commissionTotalEur =
    commissionBaseEur * (1 + Number(commissionIvaPct || 0) / 100);

  const servicesForSummary = useMemo(() => {
    const ids = getServiceIdsForCampaign();
    return ids.map((id) => ({
      id,
      name: getServiceLabel(id),
      category: RADAR_SERVICE_MAP[String(id)]?.category || "",
    }));
  }, [proposalServiceIds, servicesTab]);

  // ✅ Mensaje masterizado (propuesta)
  const buildDefaultProposalMessage = (opts?: {
    refCode?: string;
    price?: any;
    ownerName?: string;
  }) => {
    const ref = String(opts?.refCode || "SF").trim() || "SF";
    const owner = String(opts?.ownerName || "").trim();
    const greet = owner ? `Hola ${owner},` : "Hola,";

    const sids = getServiceIdsForCampaign();
    const list = sids.map((id) => `– ${getServiceLabel(id)}`).join("\n");
    const count = sids.length;

    const mandateTxt = exclusiveMandate
      ? `Mandato: Exclusiva durante ${exclusiveMonths} meses.`
      : `Mandato: No exclusiva.`;

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
      ? `Total estimado agencia: ${total.toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}€ (incluye IVA).`
      : `Total agencia: se calcula con el precio de referencia.`;

    return (
      `${greet}\n\n` +
      `Te presento nuestra propuesta de gestión para la propiedad ${ref}.\n\n` +
      `${mandateTxt}\n` +
      `Comisión: ${commissionPct}% + IVA ${commissionIvaPct}%.\n` +
      `${moneyTxt}\n\n` +
      `Servicios incluidos (${count}):\n` +
      `${list || "– —"}\n\n` +
      `Si aceptas, activaremos el expediente y abriremos el canal directo para coordinar todo.\n\n` +
      `Quedo atento.`
    );
  };
// 🔥 MOTOR DE ENRIQUECIMIENTO (PRE-FETCH DE DATOS REALES) 🔥
  useEffect(() => {
    const enrichTargets = async () => {
      if (!targets || targets.length === 0) {
        setEnrichedTargets([]);
        return;
      }

      setIsEnriching(true);
      
      // Creamos un array para guardar las propiedades reales
      const realDataArray = [];

      // Recorremos las chinchetas del mapa
      for (const t of targets) {
        const pid = String(t?.id || "").trim();
        if (pid) {
          try {
            // Preguntamos a la base de datos por la VERDAD ABSOLUTA de esta propiedad
            const res: any = await getPropertyByIdAction(pid);
            if (res?.success && res?.data) {
              // Si la encontramos, la mezclamos con los datos del mapa para no perder coords
              realDataArray.push({ ...t, ...res.data });
            } else {
              // Si falla, dejamos la chincheta original por si acaso
              realDataArray.push(t);
            }
          } catch (e) {
            realDataArray.push(t);
          }
        }
      }

      setEnrichedTargets(realDataArray);
      setIsEnriching(false);
    };

    enrichTargets();
  }, [targets]); // Se ejecuta cada vez que el mapa envía nuevas chinchetas
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

  // ✅ Normaliza mensajes DB -> UI ({ sender:'me'|'other', text })
  const mapDbMessagesToUi = (msgs: any[]) => {
    const list = Array.isArray(msgs) ? msgs : [];
    const my = String(meId || "");
    return list.map((m: any) => ({
      sender: String(m?.senderId || "") === my ? "me" : "other",
      text: String(m?.text ?? m?.content ?? ""),
    }));
  };

  // ✅ Abrir conversación + marcar leída
  const openConversation = async (cid: string) => {
    const safe = String(cid || "").trim();
    if (!safe) return;

    setConversationId(safe);
    setActiveTab("COMMS");

    const msgsRes: any = await getConversationMessagesAction(safe);
    if (msgsRes?.success) {
      setChatHistory(mapDbMessagesToUi(msgsRes.data || []));
    }

    try {
      await markConversationReadAction(safe);
    } catch {}
  };

  // ✅ polling mensajes conversación (Radar) cada 6s cuando está en COMMS
  useEffect(() => {
    if (!conversationId) return;
    if (activeTab !== "COMMS") return;

    let alive = true;
    const cid = String(conversationId || "").trim();
    if (!cid) return;

    const tick = async () => {
      try {
        const msgsRes: any = await getConversationMessagesAction(cid);
        if (!alive) return;
        if (msgsRes?.success) setChatHistory(mapDbMessagesToUi(msgsRes.data || []));
      } catch (e) {
        console.warn("radar chat poll failed", e);
      }
    };

    tick();
    const t = setInterval(tick, 6000);

    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [conversationId, activeTab, meId]);

  // --- 3. MOTOR DE BÚSQUEDA (SIN FILTRAR LA LISTA - SOLO VUELO) ---
  const performGlobalSearch = async () => {
    if (!searchTerm) return;

    setIsFlying(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchTerm
        )}`
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

  // --- 4. LÓGICA DE NEGOCIO (LEER NANOCARD BLINDADA) ---
  const handleTrabajar = async (target: any) => {
    // 1. Fijar objetivo
    setSelectedTarget(target);
    const pid = String(target?.id || "").trim();

    // ✅ upgrade suave: si el radar trae "stub", traemos snapshot real
    if (pid) {
      try {
        const p: any = await getPropertyByIdAction(pid);
        if (p?.success && p?.data) {
          setSelectedTarget((prev: any) => ({ ...(prev || {}), ...(p.data || {}) }));
        }
      } catch {}
    }

    try {
      // 2. CONSULTA DE INTELIGENCIA AL SERVIDOR (Server Truth)
      const campRes: any = await getCampaignByPropertyAction(pid);

      if (campRes?.success && campRes?.data) {
        const campaign = campRes.data;

        // 3. CLASIFICACIÓN DEL OBJETIVO
        if (campaign.status === "ACCEPTED") {
          setMsgStatus("ACCEPTED");
        } else if (campaign.status === "REJECTED") {
          setMsgStatus("REJECTED");
        } else {
          setMsgStatus("SENT"); // pendiente/enviada
        }

        // 4. ENLACE DE COMUNICACIONES (CHAT)
        const cid = campaign.conversationId;
        if (cid) {
          await openConversation(String(cid));
        } else {
          setActiveTab("COMMS");
          setChatHistory([]);
        }
      } else {
        // 5. OBJETIVO NUEVO (LIMPIO PARA ATACAR)
        setMsgStatus("IDLE");
        setActiveTab("RADAR");
        setConversationId(null);
        setChatHistory([]);
        setProposalServiceIds([]);
      }
    } catch (error) {
      console.error("Error táctico en handleTrabajar:", error);
      setMsgStatus("IDLE");
      setActiveTab("RADAR");
    }
  };

// ⚠️ NUEVO MOTOR DEL BOTÓN DE VUELO: VUELA Y ABRE EL PANEL EXTERNO (SIN ABRIR EL RADAR)
  const handleVolarAPropiedad = async (e: any, target: any) => {
    e.stopPropagation(); // Bloquea el clic para que no se abra la pestaña de proponer Campaña

    const pid = String(target?.id || "").trim();
    if (!pid) return;

    // 1. Vuelo táctico inmediato
    const lng = target?.lng ?? target?.longitude ?? (Array.isArray(target?.coordinates) ? target.coordinates[0] : null);
    const lat = target?.lat ?? target?.latitude ?? (Array.isArray(target?.coordinates) ? target.coordinates[1] : null);

    if (typeof window !== "undefined" && lng != null && lat != null) {
      window.dispatchEvent(new CustomEvent("fly-to-location", { 
        detail: { center: [lng, lat], zoom: 18.5, pitch: 60 } 
      }));
    }

    // 2. Extraemos la base de datos real para saber quién es el creador (Agencia o Particular)
    let prop: any = target;
    try {
      const res: any = await getPropertyByIdAction(pid);
      if (res?.success && res?.data) prop = res.data;
    } catch {}

    // 3. Disparamos la señal global del SaaS.
    // El layout principal escuchará esto y abrirá AgencyDetailsPanel o DetailsPanel según el 'prop.user.role'
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("select-property-signal", { detail: { id: pid } }));
      window.dispatchEvent(new CustomEvent("open-details-signal", { 
        detail: { 
          ...prop, // Expandimos los datos en la raíz para que el mapa lea el rol
          propertyId: pid, 
          propertySnapshot: prop, 
          property: prop, 
          id: pid 
        } 
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
      prop?.lng ??
      prop?.longitude ??
      (Array.isArray(prop?.coordinates) ? prop.coordinates[0] : null);
    const lat =
      prop?.lat ??
      prop?.latitude ??
      (Array.isArray(prop?.coordinates) ? prop.coordinates[1] : null);

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

  // --- 5. ENVIAR PROPUESTA (limpio, premium, sin B2B interno) ---
  const aceptarEncargo = async () => {
    if (!selectedTarget) return;

    const pid = String(selectedTarget?.id || "").trim();
    if (!pid) return;

    setMsgStatus("SENDING");

    try {
      // ✅ 1. SERVICIOS
      const serviceIds = Array.from(
        new Set(
          (Array.isArray(proposalServiceIds) ? proposalServiceIds : [])
            .map((s: any) => String(s).trim())
            .filter(Boolean)
            .filter((id) => !id.startsWith("pack_"))
        )
      );

    // ✅ 2. MENSAJE MASTERIZADO
      let defaultMsg = buildDefaultProposalMessage({
        refCode: selectedTarget?.refCode,
        price: selectedTarget?.price,
        ownerName: pickOwnerName(selectedTarget),
      });

      // 🔥 INYECCIÓN MILITAR DE REFERENCIA 🔥
      // Forzamos a que el texto empiece siempre con la Referencia si existe
      const refReal = selectedTarget?.refCode || "";
      if (refReal && !defaultMsg.includes(refReal)) {
        defaultMsg = `REF: ${refReal} - ${defaultMsg}`;
      }

      // ✅ 3. MATEMÁTICA (pre-cálculo)
      const numericPct = Number(commissionPct || 0);
      const numericIva = Number(commissionIvaPct || 21);
      const numericTotal = Number.isFinite(commissionTotalEur) ? commissionTotalEur : 0;
      const numericMonths = Number(exclusiveMonths || 0);
      const isExclusive = Boolean(exclusiveMandate);

      // ✅ 4. Snapshot premium (para DB, aunque el servidor lo ignore por ahora)
      const servicesSnapshot = serviceIds.map((id) => ({
        id,
        name: RADAR_SERVICE_MAP[String(id)]?.name || String(id),
        category: RADAR_SERVICE_MAP[String(id)]?.category || "",
      }));

      const payload = {
        propertyId: pid,
        message: defaultMsg,
        serviceIds,
        status: "SENT",

        // términos limpios (cliente)
        commissionPct: numericPct,
        commissionIvaPct: numericIva,
        totalAmount: numericTotal,
        exclusiveMandate: isExclusive,
        exclusiveMonths: numericMonths,

        // ✅ snapshot para que Owner/Agency HUD sea consistente
        servicesSnapshot,
        servicesCount: serviceIds.length,
        proposalSummary: defaultMsg,

        // Precio de referencia
        priceAtProposal: parsePriceNumber(selectedTarget?.price),

        // Objeto terms (por compat)
        terms: {
          commissionPct: numericPct,
          ivaPct: numericIva,
          totalAmount: numericTotal,
          exclusive: isExclusive,
          durationMonths: numericMonths,
          servicesCount: serviceIds.length,
        },
      };

      console.log("🚀 PROPUESTA (limpia/premium):", payload);

      const res: any = await sendCampaignAction(payload as any);

      if (!res?.success) {
        console.error("sendCampaignAction failed:", res?.error);
        setMsgStatus("IDLE");
        return;
      }

      const convId = res?.data?.conversationId ? String(res.data.conversationId) : null;
      const campaignId = String(
        res?.data?.id || res?.data?.campaignId || res?.data?.campaign?.id || ""
      ).trim();

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("open-chat-signal", {
            detail: {
              conversationId: convId || "",
              campaignId,
              openProposal: true,
              propertyId: pid,
            },
          })
        );
      }

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
        if (msgsRes?.success) setChatHistory(mapDbMessagesToUi(msgsRes.data || []));
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
    if (!cid) return;

    setInputMsg("");

    const res: any = await sendMessageAction({ conversationId: cid, text });
    if (!res?.success) {
      console.error("sendMessage failed:", res?.error);
      return;
    }

    setChatHistory((prev) => [
      ...(Array.isArray(prev) ? prev : []),
      { sender: "me", text },
    ]);

    try {
      await markConversationReadAction(cid);
    } catch {}
  };

  // 🔥 FILTRO CONECTADO A LA VERDAD DE LA BASE DE DATOS 🔥
  const filteredTargets = useMemo(() => {
    // AHORA MIRAMOS enrichedTargets EN LUGAR DE targets
    const list = Array.isArray(enrichedTargets) ? enrichedTargets : [];
    if (roleFilter === "ALL") return list;
    
    return list.filter((t: any) => {
      const r = pickRole(t); 
      if (roleFilter === "AGENCY") return r === "AGENCY"; 
      if (roleFilter === "PARTICULAR") return r === "PARTICULAR";
      return true;
    });
  }, [enrichedTargets, roleFilter]); // <-- Dependencia actualizada

  // --- RENDERIZADO ---
  return (
    <div className="flex flex-col h-full w-full bg-white/85 backdrop-blur-2xl text-slate-900 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.35)] font-sans border-l border-slate-200/60 pointer-events-auto">
      {/* 1. CABECERA */}
      <div className="shrink-0 p-6 pb-4 border-b border-slate-200/70 z-20 bg-white/75 backdrop-blur-xl shadow-[inset_0_-1px_0_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            {selectedTarget && (
              <button
                onClick={() => setSelectedTarget(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 flex items-center justify-center border border-slate-200/70 transition-all"
              >
                <ChevronLeft size={18} className="text-slate-600" />
              </button>
            )}

            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                {selectedTarget ? "Expediente" : "Radar de Zona"}
              </h2>

              {!selectedTarget && (
                <p className="text-[10px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                  {isFlying ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={10} />
                  )}
                  {isFlying ? "Reposicionando satélite..." : "Escaneo activo"}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* BARRA DE NAVEGACIÓN (VUELO) - NO FILTRA, SOLO MUEVE */}
        {!selectedTarget && (
          <div className="flex gap-2">
            <div className="flex-1 bg-white flex items-center px-3 py-2.5 rounded-2xl border border-slate-200 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.25)] focus-within:border-blue-500 transition-all">
              <Search size={14} className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Ir a zona (ej: Manilva)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && performGlobalSearch()}
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-full placeholder-slate-400"
              />
            </div>

            <button
              onClick={performGlobalSearch}
              className="px-4 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-black transition-colors shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)]"
              disabled={isFlying}
            >
              {isFlying ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Navigation size={14} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* 2. CUERPO */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-0">
        {selectedTarget ? (
          /* --- VISTA EXPEDIENTE --- */
          <div className="p-6 space-y-6 animate-fade-in-up">
          {/* FICHA CORREGIDA */}
            <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden">
              {/* Banda de color superior, más fina y sin romper el borde redondeado */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />

              <div className="flex items-start gap-4 mt-2">
                {/* Imagen */}
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                  {pickImageUrl(selectedTarget) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pickImageUrl(selectedTarget) as string}
                      alt="Property"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 size={14} className="animate-spin text-slate-300" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 truncate">
                        {selectedTarget?.refCode ? `REF: ${selectedTarget.refCode}` : "REF: —"}
                      </p>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${roleBadge(selectedTarget).tone === "blue" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                        {roleBadge(selectedTarget).label}
                      </span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-slate-900 leading-tight truncate">
                    {selectedTarget?.type || "Propiedad"}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 truncate mt-0.5">
                    <MapPin size={10} className="shrink-0" /> {selectedTarget?.address || "Ubicación por confirmar"}
                  </p>
                  <span className="block text-xl font-black text-slate-900 tracking-tight mt-1">
                    {selectedTarget?.price || "Consultar"}
                  </span>
                </div>
              </div>

             {/* total agencia + servicios */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Total a percibir
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {Number.isFinite(commissionTotalEur) && commissionTotalEur > 0
                      ? `${commissionTotalEur.toLocaleString("es-ES", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}€`
                      : "—"}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500 font-semibold">
                    Comisión {commissionPct}% + IVA {commissionIvaPct}%
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Servicios Seleccionados
                  </p>
                  {/* Número limpio sin icono ni lista de servicios */}
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {getServiceIdsForCampaign().length}
                  </p>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className="bg-slate-100 p-1 rounded-2xl flex text-center border border-slate-200/60">
              <button
                onClick={() => setActiveTab("RADAR")}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === "RADAR"
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-400"
                }`}
              >
                Propuesta
              </button>
              <button
                onClick={() => setActiveTab("COMMS")}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === "COMMS"
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-400"
                }`}
              >
                Chat Directo
              </button>
            </div>

            {activeTab === "RADAR" && (
              <div className="animate-fade-in">
                {msgStatus === "ACCEPTED" && (
                  <div className="text-center py-6 bg-white rounded-3xl border border-emerald-200/70">
                    <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-black text-slate-900">Campaña aceptada</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      El propietario ha aceptado. Expediente activo.
                    </p>
                    <button
                      onClick={() => setActiveTab("COMMS")}
                      className="mt-4 text-[10px] text-blue-600 font-black hover:underline"
                    >
                      Ir a mensajería
                    </button>
                  </div>
                )}

                {msgStatus === "REJECTED" && (
                  <div className="text-center py-6 bg-white rounded-3xl border border-rose-200/70">
                    <p className="text-sm font-black text-slate-900">Propuesta rechazada</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Puedes ajustar servicios o términos y reenviar.
                    </p>
                  </div>
                )}

                {msgStatus === "SENT" && (
                  <div className="text-center py-6 bg-white rounded-3xl border border-slate-200/70">
                    <CheckCircle2 size={32} className="text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-black text-slate-900">Propuesta enviada</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      En espera de respuesta del propietario.
                    </p>
                    <button
                      onClick={() => setActiveTab("COMMS")}
                      className="mt-4 text-[10px] text-blue-600 font-black hover:underline"
                    >
                      Abrir chat
                    </button>
                  </div>
                )}

                {msgStatus === "IDLE" || msgStatus === "SENDING" ? (
                  <>
                    {/* SERVICIOS */}
                    <div className="mb-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        Servicios de la Agencia
                      </p>

                      <div className="bg-slate-100 p-1 rounded-2xl flex text-center mb-3 border border-slate-200/60">
                        <button
                          onClick={() => setServicesTab("ONLINE")}
                          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                            servicesTab === "ONLINE"
                              ? "bg-white shadow-sm text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          Online
                        </button>
                        <button
                          onClick={() => setServicesTab("OFFLINE")}
                          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                            servicesTab === "OFFLINE"
                              ? "bg-white shadow-sm text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          Offline
                        </button>
                      </div>

                      <div className="bg-white border border-slate-200/60 rounded-3xl p-1 shadow-[0_14px_50px_-36px_rgba(0,0,0,0.35)]">
                        {RADAR_SERVICES.filter((s) => String(s?.category) === String(servicesTab)).map(
                          (item, i) => {
                            const sid = String(item?.id || "");
                            const isOn = proposalServiceIds.includes(sid);
                            return (
                              <button
                                key={`${sid}_${i}`}
                                type="button"
                                onClick={() => toggleProposalService(sid)}
                                className="w-full text-left flex items-center gap-3 p-3 border-b border-slate-100/70 last:border-0 hover:bg-slate-50/60 rounded-2xl transition-all"
                              >
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                                    isOn
                                      ? "bg-blue-600 border-blue-600"
                                      : "bg-white border-slate-200"
                                  }`}
                                >
                                  {isOn && <Check size={12} strokeWidth={4} className="text-white" />}
                                </div>
                                <span className="text-xs font-black text-slate-800">
                                  {String(item?.name || sid)}
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>

                      {/* Mandato */}
                      <div className="mt-4 bg-white border border-slate-200/60 rounded-3xl p-4 shadow-[0_14px_50px_-36px_rgba(0,0,0,0.35)]">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          Mandato
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setExclusiveMandate(true)}
                            className={`h-10 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                              exclusiveMandate
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            Exclusiva
                          </button>

                          <button
                            type="button"
                            onClick={() => setExclusiveMandate(false)}
                            className={`h-10 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                              !exclusiveMandate
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            No exclusiva
                          </button>
                        </div>

                        <div className="mt-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Tiempo (meses)
                          </p>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={exclusiveMonths}
                            onChange={(e) => setExclusiveMonths(Number(e.target.value || 0))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-black text-slate-900 outline-none"
                          />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                              Comisión %
                            </p>
                            <input
                              type="number"
                              step="0.1"
                              value={commissionPct}
                              onChange={(e) => setCommissionPct(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs font-black text-slate-900 outline-none"
                            />
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                              IVA %
                            </p>
                            <input
                              type="number"
                              step="0.1"
                              value={commissionIvaPct}
                              onChange={(e) => setCommissionIvaPct(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs font-black text-slate-900 outline-none"
                            />
                          </div>
                        </div>

                        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Total a percibir por la agencia
                          </p>
                          <p className="mt-1 text-sm font-black text-slate-900">
                            {Number.isFinite(commissionTotalEur) && commissionTotalEur > 0
                              ? `${commissionTotalEur.toLocaleString("es-ES", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}€`
                              : "—"}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-500 font-semibold">
                            Basado en el precio de referencia
                          </p>
                        </div>
                      </div>

                      {/* Resumen */}
                      <div className="mt-4 bg-white border border-slate-200/60 rounded-3xl p-4 shadow-[0_14px_50px_-36px_rgba(0,0,0,0.35)]">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          Resumen de Propuesta
                        </p>

                        <div className="space-y-2 text-[11px] font-semibold text-slate-700">
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Mandato</span>
                            <span className="font-black text-slate-900">
                              {exclusiveMandate ? `Exclusiva ${exclusiveMonths}m` : "No exclusiva"}
                            </span>
                          </div>

                          <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Comisión</span>
                            <span className="font-black text-slate-900">
                              {commissionPct}% + IVA {commissionIvaPct}%
                            </span>
                          </div>

                          <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Total agencia</span>
                            <span className="font-black text-slate-900">
                              {Number.isFinite(commissionTotalEur) && commissionTotalEur > 0
                                ? `${commissionTotalEur.toLocaleString("es-ES", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}€`
                                : "—"}
                            </span>
                          </div>

                          <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Servicios</span>
                            <span className="font-black text-slate-900">
                              {getServiceIdsForCampaign().length}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-200/60">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Incluye
                          </p>
                          <div className="space-y-1">
                            {servicesForSummary.length ? (
                              servicesForSummary.slice(0, 6).map((s) => (
                                <p key={s.id} className="text-[11px] font-semibold text-slate-800">
                                  – {s.name}
                                </p>
                              ))
                            ) : (
                              <p className="text-[11px] font-semibold text-slate-500">—</p>
                            )}
                            {servicesForSummary.length > 6 && (
                              <p className="text-[10px] font-black text-slate-500">
                                +{servicesForSummary.length - 6} más
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="mt-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                          TOTAL SERVICIOS SELECCIONADOS:{" "}
                          <span className="text-slate-900">{proposalServiceIds.length}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={aceptarEncargo}
                      disabled={msgStatus === "SENDING" || proposalServiceIds.length === 0}
                      className="w-full bg-slate-900 text-white font-black text-xs py-4 rounded-3xl shadow-[0_16px_50px_-30px_rgba(0,0,0,0.65)] hover:bg-black active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {msgStatus === "SENDING" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "ENVIAR PROPUESTA"
                      )}
                    </button>

                    <p className="text-[9px] text-center text-slate-500 mt-3 font-semibold">
                      Al enviar, se abrirá un canal directo con el propietario.
                    </p>
                  </>
                ) : null}
              </div>
            )}

            {activeTab === "COMMS" && (
              <div className="flex flex-col h-[360px] bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-[0_14px_50px_-36px_rgba(0,0,0,0.35)]">
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
                  {chatHistory.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-50">
                      <MessageSquare size={24} className="mb-2 text-slate-400" />
                      <p className="text-[10px] font-semibold text-slate-500">Historial vacío</p>
                    </div>
                  )}

                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 ${msg.sender === "me" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`p-3 rounded-2xl text-[11px] max-w-[85%] font-semibold leading-relaxed ${
                          msg.sender === "me"
                            ? "bg-blue-600 text-white rounded-tr-sm"
                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-3 bg-white border-t border-slate-200/60 flex gap-2">
                  <input
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
                    type="text"
                    placeholder="Escribir al propietario..."
                    className="flex-1 bg-slate-100 rounded-2xl px-4 py-2 text-xs outline-none text-slate-800 font-semibold border border-slate-200/60"
                  />
                  <button
                    onClick={enviarMensaje}
                    className="p-2.5 bg-slate-900 text-white rounded-2xl hover:bg-black shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)]"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* --- VISTA LISTA --- */
          <div className="pb-10">
            <div className="px-6 py-3 bg-white/70 sticky top-0 backdrop-blur-xl z-10 border-b border-slate-200/70 flex justify-between items-center">
              
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Resultados ({filteredTargets.length})
                {isEnriching && (
                  <span className="text-blue-500 animate-pulse text-[8px]">Analizando...</span>
                )}
              </span>

              <div className="flex items-center gap-2">
                <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200/60 flex shadow-inner">
                  <button
                    onClick={() => setRoleFilter("ALL")}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      roleFilter === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setRoleFilter("PARTICULAR")}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      roleFilter === "PARTICULAR"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Particulares
                  </button>
                  <button
                    onClick={() => setRoleFilter("AGENCY")}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      roleFilter === "AGENCY"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Agencias
                  </button>
                </div>

                {isFlying && <Loader2 size={12} className="animate-spin text-slate-400" />}
              </div>
            </div>

            <div className="px-4 py-2 space-y-2">
              {filteredTargets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 opacity-50">
                  <Search size={32} className="mb-3 text-slate-300" />
                  <p className="text-xs font-black text-slate-400">Sin señales en este sector.</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[180px] text-center font-semibold">
                    Use el buscador superior para mover el satélite.
                  </p>
                </div>
              ) : (
                filteredTargets.map((t: any) => {
                  const isProcessed = processedIds.includes(String(t.id));
                  const img = pickImageUrl(t);
                  const rb = roleBadge(t);

        return (
                    <div
                      key={t.id}
                      onClick={() => {
                        handleTrabajar(t);
                        openDetailsAndFlyFromTarget(t);
                      }}
                      className={`group relative flex items-center p-3 rounded-2xl cursor-pointer transition-all border
                        ${
                          isProcessed
                            ? "bg-white border-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)] z-10"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                        }
                      `}
                    >
                      {/* Banda lateral fina */}
                      <div className={`absolute top-3 bottom-3 left-0 w-1 rounded-r-md ${rb.tone === "blue" ? "bg-blue-500" : "bg-slate-300"}`} />

                      {/* 🔥 THUMBNAIL (FOTO REAL, NUNCA SE TAPA) 🔥 */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0 ml-2 mr-4 relative flex items-center justify-center shadow-inner group-hover:bg-white transition-colors duration-300">
                        
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="Property" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <span className="font-black text-[26px] leading-none tracking-tighter text-slate-300 group-hover:text-blue-600 transition-colors duration-300 select-none mt-1">
                            Sf
                          </span>
                        )}
                        
                        {/* 🔥 CHECK FLOTANTE (Solo un circulito transparente, deja ver la foto 100%) 🔥 */}
                        {isProcessed && (
                          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <div className="bg-white/80 backdrop-blur-md rounded-full p-1 shadow-sm border border-emerald-200">
                              <CheckCircle2 size={22} className="text-emerald-500" strokeWidth={2.5}/>
                            </div>
                          </div>
                        )}

                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${rb.tone === "blue" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                            {rb.label}
                          </span>
                          {isProcessed && <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">Procesado</span>}
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm truncate leading-tight">{t.title || t.type || "Propiedad"}</h3>
                        <p className="mt-0.5 text-[9px] text-slate-400 font-black tracking-widest uppercase truncate">
                          {t.refCode ? `REF: ${t.refCode}` : "REF: ---"}
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex flex-col justify-between items-end h-16 py-0.5">
                        <span className="block font-black text-slate-900 text-sm tracking-tight">
                          {t.price || "---"}
                        </span>
                        
                        {/* BOTÓN DE VUELO */}
                        <button
                          onClick={(e) => handleVolarAPropiedad(e, t)}
                          className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-all border border-slate-200 shadow-sm z-20 relative"
                        >
                          <Navigation size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}