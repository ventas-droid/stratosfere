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
  Handshake
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

type RoleFilter = "ALL" | "PARTICULAR" | "AGENCY" | "B2B" | "MINE";

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

  // ✅ IDENTIFICADOR DE ACTIVOS PROPIOS
  const isMyAsset = (t: any) => {
    if (!meId) return false;
    const ownerId = String(t?.user?.id || t?.userId || t?.ownerId || t?.ownerSnapshot?.id || "");
    return ownerId === meId;
  };

 // ✅ NUEVO: ESCÁNER ESTRICTO B2B (Basado en Prisma Schema real) 🔥
  const isB2BActive = (t: any) => {
    // Leemos las variables exactas de su esquema de Prisma
    const sharePct = Number(t?.sharePct || 0);
    const shareVisibility = String(t?.shareVisibility || "").toUpperCase();

    // Una propiedad está en colaboración B2B si comparte porcentaje (> 0)
    // Y si esa compartición NO es estrictamente privada.
    // (Aceptamos "AGENCIES", "PUBLIC" u otros estados que no sean "PRIVATE")
    const isSharing = sharePct > 0 && shareVisibility !== "PRIVATE";

    // Mantenemos las de respaldo por si el objeto de campaña viene anidado
    const fallbackB2B = !!(t?.b2b || t?.isB2b || t?.campaign?.b2b);

    return isSharing || fallbackB2B;
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

 // ✅ Mensaje masterizado (propuesta) CON ESCUDO ANTI "CARGANDO"
  const buildDefaultProposalMessage = (opts?: {
    refCode?: string;
    price?: any;
    ownerName?: string;
  }) => {
    const ref = String(opts?.refCode || "SF").trim() || "SF";
    
    // 🔥 EL ESCUDO ANTI "Cargando..." 🔥
    const rawOwner = String(opts?.ownerName || "").trim();
    const owner = (!rawOwner || rawOwner.toLowerCase().includes("cargando")) 
        ? "Propietario" 
        : rawOwner;
        
    const greet = `Hola ${owner},`;

    const sids = getServiceIdsForCampaign();
    const list = sids.map((id) => `– ${getServiceLabel(id)}`).join("\n");
    const count = sids.length;

    const mandateTxt = exclusiveMandate
      ? `Condiciones: Exclusiva durante ${exclusiveMonths} meses.`
      : `Condiciones: No exclusiva.`;

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
      
      const realDataArray = [];

      for (const t of targets) {
        const pid = String(t?.id || "").trim();
        if (pid) {
          try {
            const res: any = await getPropertyByIdAction(pid);
            if (res?.success && res?.data) {
              realDataArray.push({ ...t, ...res.data });
            } else {
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
  }, [targets]); 

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

  // ✅ Normaliza mensajes DB -> UI 
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

  // ✅ polling mensajes
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

  // --- 3. MOTOR DE BÚSQUEDA (CORRECCIÓN DOBLE TOQUE Y FEEDBACK VISUAL) ---
  const performGlobalSearch = async () => {
    if (!searchTerm) return;

    setIsFlying(true);
    // Vaciamos la lista al instante para que el usuario vea que está pasando algo
    setEnrichedTargets([]);

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

          // 🔥 ELIMINAMOS EL setSearchTerm("") PARA NO CORTAR LA BÚSQUEDA 🔥
          
          // 🚀 RÁFAGA DE RADAR: Lanzamos 3 escaneos seguidos para atrapar las chinchetas
          // sin importar lo que tarde el vuelo de la cámara (sea corto o largo).
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("trigger-scan-signal"));
          }, 2000);

          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("trigger-scan-signal"));
          }, 3500);

          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("trigger-scan-signal"));
            setIsFlying(false); // Apagamos el loader al finalizar el último pulso
          }, 5000);
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

// ⚠️ NUEVO MOTOR DEL BOTÓN DE VUELO
  const handleVolarAPropiedad = async (e: any, target: any) => {
    e.stopPropagation(); 

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

    // 2. Extraemos la base de datos real
    let prop: any = target;
    try {
      const res: any = await getPropertyByIdAction(pid);
      if (res?.success && res?.data) prop = res.data;
    } catch {}

    // 3. Disparamos la señal global del SaaS.
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("select-property-signal", { detail: { id: pid } }));
      window.dispatchEvent(new CustomEvent("open-details-signal", { 
        detail: { 
          ...prop,
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
        commissionPct: numericPct,
        commissionIvaPct: numericIva,
        totalAmount: numericTotal,
        exclusiveMandate: isExclusive,
        exclusiveMonths: numericMonths,
        servicesSnapshot,
        servicesCount: serviceIds.length,
        proposalSummary: defaultMsg,
        priceAtProposal: parsePriceNumber(selectedTarget?.price),
        terms: {
          commissionPct: numericPct,
          ivaPct: numericIva,
          totalAmount: numericTotal,
          exclusive: isExclusive,
          durationMonths: numericMonths,
          servicesCount: serviceIds.length,
        },
      };

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

    try {
        let res: any = null;
        try { res = await (sendMessageAction as any)(cid, text); } catch {}
        if (!res?.success) { try { res = await (sendMessageAction as any)({ conversationId: cid, text }); } catch {} }
        if (!res?.success) { try { res = await (sendMessageAction as any)({ conversationId: cid, content: text }); } catch {} }
        if (!res?.success) { try { res = await (sendMessageAction as any)(text, cid); } catch {} }

        if (!res?.success) {
          console.error("sendMessage failed:", res?.error);
          return;
        }

        setChatHistory((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          { sender: "me", text },
        ]);

        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("open-chat-signal", { 
                detail: { conversationId: cid } 
            }));
        }

        try {
          await markConversationReadAction(cid);
        } catch {}

    } catch (error) {
        console.error("Error crítico al enviar el mensaje:", error);
    }
  };

  // 🔥 FILTRO INTELIGENTE BLINDADO 🔥
  // ✅ MOTOR MATEMÁTICO B2B
  const getB2BInfo = (t: any) => {
    const sharePercent = Number(
      t?.b2b?.sharePct ??
      t?.activeCampaign?.commissionSharePct ??
      t?.campaign?.commissionSharePct ??
      t?.campaigns?.[0]?.commissionSharePct ??
      t?.commissionSharePct ??
      t?.sharePct ?? 0
    );

    const visibilityMode = String(
      t?.b2b?.visibility ??
      t?.activeCampaign?.commissionShareVisibility ??
      t?.campaign?.commissionShareVisibility ??
      t?.campaigns?.[0]?.commissionShareVisibility ??
      t?.shareVisibility ?? "PRIVATE"
    ).toUpperCase();

    const baseCommissionPct = Number(
      t?.activeCampaign?.commissionPct ??
      t?.campaign?.commissionPct ??
      t?.campaigns?.[0]?.commissionPct ??
      t?.commissionPct ?? 3
    );

    const numericPrice = Number(String(t?.price || "0").replace(/[^0-9]/g, ""));
    const estimatedEarnings = numericPrice * (baseCommissionPct / 100) * (sharePercent / 100);

    const isB2B = sharePercent > 0 && visibilityMode !== "PRIVATE";

    return {
      isB2B,
      sharePercent,
      formattedEarnings: new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(estimatedEarnings)
    };
  };

  // 🔥 FILTRO INTELIGENTE BLINDADO 🔥
  const filteredTargets = useMemo(() => {
    const list = Array.isArray(enrichedTargets) ? enrichedTargets : [];
    
    return list.filter((t: any) => {
      const r = pickRole(t); 
      const isMine = isMyAsset(t);
      const b2bInfo = getB2BInfo(t);

      if (roleFilter === "ALL") return true;
      if (roleFilter === "PARTICULAR") return r === "PARTICULAR" && !isMine;
      if (roleFilter === "AGENCY") return r === "AGENCY" && !isMine;
      
      if (roleFilter === "B2B") {
           if (r === "PARTICULAR" && !isMine) return false; 
           return b2bInfo.isB2B; 
      }
      
      if (roleFilter === "MINE") return isMine;
      
      return false; 
    });
  }, [enrichedTargets, roleFilter, meId]);

// 👇 PEGAR AQUÍ EL PASO 1 (LA CALCULADORA) 👇
  const getB2BData = (t: any) => {
    const sharePercent = Number(t?.b2b?.sharePct ?? t?.campaign?.commissionSharePct ?? t?.campaigns?.[0]?.commissionSharePct ?? t?.sharePct ?? 0);
    const numericPrice = Number(String(t?.price || "0").replace(/[^0-9]/g, ""));
    const baseCommissionPct = Number(t?.activeCampaign?.commissionPct ?? t?.campaign?.commissionPct ?? t?.campaigns?.[0]?.commissionPct ?? t?.commissionPct ?? 3);
    
    const estimatedEarnings = numericPrice * (baseCommissionPct / 100) * (sharePercent / 100);
    
    return { 
        sharePercent, 
        formattedEarnings: new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(estimatedEarnings) 
    };
  };

  // --- RENDERIZADO ---
  return (
    <div className="flex flex-col h-full w-full bg-white z-[70000] relative text-slate-900 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.35)] font-sans border-l border-slate-200 pointer-events-auto">
      
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
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 hover:rotate-90 flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md border border-white/20 text-white shadow-md shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* BARRA DE NAVEGACIÓN (VUELO) */}
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
            <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />

              <div className="flex items-start gap-4 mt-2">
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
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {getServiceIdsForCampaign().length}
                  </p>
                </div>
              </div>
            </div>

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

                      <div className="mt-4 bg-white border border-slate-200/60 rounded-3xl p-4 shadow-[0_14px_50px_-36px_rgba(0,0,0,0.35)]">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          Resumen de Propuesta
                        </p>

                        <div className="space-y-2 text-[11px] font-semibold text-slate-700">
                          
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Condiciones</span>
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

              {/* ✅ BARRA DE PESTAÑAS (Scroll Horizontal si no caben) */}
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
                <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200/60 flex shadow-inner shrink-0">
                  <button
                    onClick={() => setRoleFilter("ALL")}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      roleFilter === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setRoleFilter("PARTICULAR")}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      roleFilter === "PARTICULAR"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Particulares
                  </button>
                  <button
                    onClick={() => setRoleFilter("AGENCY")}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      roleFilter === "AGENCY"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Agencias
                  </button>

                  {/* ✅ BOTÓN B2B ESTILO LUXURY YELLOW */}
                  <button
                    onClick={() => setRoleFilter("B2B")}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      roleFilter === "B2B"
                        ? "bg-white text-[#E5B842] shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <div className={`p-[3px] rounded flex items-center justify-center transition-colors ${roleFilter === "B2B" ? "bg-[#E5B842]" : "bg-slate-300"}`}>
                      <Handshake size={10} className="text-white" strokeWidth={2.5} />
                    </div>
                    B2B
                  </button>

                  {/* ✅ BOTÓN MIS ACTIVOS */}
                  <button
                    onClick={() => setRoleFilter("MINE")}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1 ${
                      roleFilter === "MINE"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <ShieldCheck size={10} strokeWidth={2.5}/> Mis Activos
                  </button>
                </div>

                {isFlying && <Loader2 size={12} className="animate-spin text-slate-400" />}
              </div>
            </div>

            <div className="px-4 py-2 space-y-2">
              {filteredTargets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 opacity-50">
                  {isFlying ? (
                     <Loader2 size={32} className="mb-3 text-slate-300 animate-spin" />
                  ) : (
                     <Search size={32} className="mb-3 text-slate-300" />
                  )}
                  <p className="text-xs font-black text-slate-400">
                    {isFlying ? "Escaneando coordenadas..." : "Sin señales en este sector."}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[180px] text-center font-semibold">
                    Use el buscador superior para mover el satélite.
                  </p>
                </div>
              ) : (
           filteredTargets.map((t: any) => {
                  const isProcessed = processedIds.includes(String(t.id));
                  const isMine = isMyAsset(t);
                  const img = pickImageUrl(t);
                  const rb = roleBadge(t);
                  const b2bInfo = getB2BInfo(t); // Ejecuta el motor B2B aquí

        return (
                    <div
                      key={t.id}
                      onClick={() => {
                        openDetailsAndFlyFromTarget(t);
                        if (!isMine) {
                          handleTrabajar(t);
                        }
                      }}
                      className={`group relative flex items-center p-3 rounded-2xl transition-all border
                        ${
                          isMine 
                            ? "bg-amber-50/30 border-amber-200 cursor-pointer hover:border-amber-300 hover:shadow-md" 
                            : isProcessed
                              ? "bg-white border-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)] z-10 cursor-pointer"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md cursor-pointer"
                        }
                      `}
                    >
                      <div className={`absolute top-3 bottom-3 left-0 w-1 rounded-r-md ${isMine ? "bg-[#E5B842]" : rb.tone === "blue" ? "bg-blue-500" : "bg-slate-300"}`} />

                      {/* ✅ BADGE "COLABORACIÓN ACTIVA" CON PORCENTAJE EN PESTAÑA B2B O ALL */}
                      {!isMine && rb.tone === "blue" && (roleFilter === "B2B" || roleFilter === "ALL") && b2bInfo.isB2B && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#E5B842] to-yellow-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 z-30 border border-white/50">
                          <Handshake size={9} /> {b2bInfo.sharePercent}% COLAB
                        </div>
                      )}

                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0 ml-2 mr-4 relative flex items-center justify-center shadow-inner group-hover:bg-white transition-colors duration-300">
                        {img ? (
                          <img src={img} alt="Property" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <span className="font-black text-[26px] leading-none tracking-tighter text-slate-300 group-hover:text-blue-600 transition-colors duration-300 select-none mt-1">
                            Sf
                          </span>
                        )}
                        
                        {isProcessed && !isMine && (
                          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <div className="bg-white/80 backdrop-blur-md rounded-full p-1 shadow-sm border border-emerald-200">
                              <CheckCircle2 size={22} className="text-emerald-500" strokeWidth={2.5}/>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          {!isMine && (
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${rb.tone === "blue" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                              {rb.label}
                            </span>
                          )}

                          {isMine && (
                             <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-amber-50 text-[#E5B842] border-amber-200 flex items-center gap-1">
                               <ShieldCheck size={8}/> Tu Activo
                             </span>
                          )}

                          {isProcessed && !isMine && <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">Procesado</span>}
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm truncate leading-tight">{t.title || t.type || "Propiedad"}</h3>
                        <p className="mt-0.5 text-[9px] text-slate-400 font-black tracking-widest uppercase truncate">
                          {t.refCode ? `REF: ${t.refCode}` : "REF: ---"}
                        </p>
                      </div>

                     {/* ✅ ÁREA DE PRECIO Y BOTÓN DE VUELO (REDISEÑADA PARA NO PISARSE) */}
                      <div className="shrink-0 flex items-center gap-3 pl-2">
                        <div className="flex flex-col items-end">
                            <span className="block font-black text-slate-900 text-sm tracking-tight">
                              {t.price || "---"}
                            </span>
                            {/* 🔥 Muestra el porcentaje Y los euros de forma limpia */}
                            {b2bInfo.isB2B && b2bInfo.sharePercent > 0 && (
                               <span className="text-[9px] font-black text-[#E5B842] mt-1 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap flex items-center gap-1">
                                  {b2bInfo.sharePercent}% <span className="opacity-50">|</span> +{b2bInfo.formattedEarnings}
                               </span>
                            )}
                        </div>
                        
                        <button
                          onClick={(e) => handleVolarAPropiedad(e, t)}
                          className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-all border border-slate-200 shadow-sm z-20 shrink-0"
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