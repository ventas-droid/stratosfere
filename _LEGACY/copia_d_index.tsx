// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'next/navigation';

// 1. IMPORTACIÓN UNIFICADA DE ICONOS (CON BUILDING2 AÑADIDO)
import { 
  LayoutGrid, Search, Mic, Bell, MessageCircle, Heart, User, Sparkles, Activity, X, Send, 
  Square, Box, Crosshair, Sun, Phone, Maximize2, Bed, Bath, TrendingUp, CheckCircle2,
  Camera, Zap, Globe, Newspaper, Share2, Shield, Store, SlidersHorizontal,
  Briefcase, Home, Map as MapIcon, Lock, Unlock, Edit2, Building2, Trash2, Crown,
} from 'lucide-react';

// --- 2. EL CEREBRO DE BÚSQUEDA ---
import { CONTEXT_CONFIG } from "../smart-search";

// --- 3. IMPORTACIONES DE SUS PANELES ---
import ProfilePanel from "./ProfilePanel";
import DualGateway from "./DualGateway";
import VaultPanel from "./VaultPanel";
import HoloInspector from "./HoloInspector";
import ExplorerHud from "./ExplorerHud";
import ArchitectHud from "./ArchitectHud";
import MarketPanel from "./MarketPanel";
import DualSlider from "./DualSlider";
import OwnerProposalsPanel from "./OwnerProposalsPanel";

// --- 4. COMPONENTES LÓGICOS ---
import DetailsPanel from "./DetailsPanel";
import { playSynthSound } from "./audio";
import StratosConsole from "./StratosConsole";
import LandingWaitlist from "./LandingWaitlist";
import AgencyPortfolioPanel from "./AgencyPortfolioPanel";
import AgencyProfilePanel from "./AgencyProfilePanel";
import AgencyMarketPanel from "./AgencyMarketPanel";
import AgencyDetailsPanel from "./AgencyDetailsPanel"; // <--- AÑADIR ESTO
import AgencyAmbassadorPanel from "./AgencyAmbassadorPanel";
import PremiumUpgradePanel from "./PremiumUpgradePanel";
import PlanOverlay from "@/app/components/billing/PlanOverlay";
import { useMyPlan } from "@/app/components/billing/useMyPlan";
import SmartSidebar from '@/app/components/alive-map/ui-panels/SmartSidebar';

// 🔥 IMPORTS ACTIONS (chat + favoritos + agency)
import {
  getFavoritesAction,
  toggleFavoriteAction,
  getUserMeAction,
  getAgencyPortfolioAction,
  deleteFromStockAction,

  // ✅ unread/read
  markConversationReadAction,

  // ✅ threads/messages
  getMyConversationsAction as listMyConversationsAction,
  getConversationMessagesAction,
  sendMessageAction,
  getOrCreateConversationAction,
  deleteConversationAction,
getPropertyByIdAction,

  // ✅ OWNER proposals
  getOwnerProposalsAction,
} from "@/app/actions";

// --- UTILIDADES ---
export const LUXURY_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100"
];

// HERRAMIENTA DE REPARACIÓN DE DATOS E INYECCIÓN DE NANO CARDS (CORREGIDA Y BLINDADA)
export const sanitizePropertyData = (p: any) => {
  if (!p) return null;

  // 1. APLANADO INTELIGENTE
  // Usamos { ...p } en el else para crear una copia y poder modificarla sin afectar al original
  const base = p?.property
    ? { ...p.property, propertyId: p.propertyId, favoriteId: p.id }
    : { ...p };

  // 🔥 FIX CRÍTICO: RESCATE DEL DUEÑO
  // Si el objeto padre 'p' tiene 'user' (el creador) pero 'base' lo perdió al aplanar, lo recuperamos.
  if (!base.user && p.user) {
      base.user = p.user;
  }

  // 2. GESTIÓN DE IMÁGENES (FIX robusto: soporta secure_url/src/etc. sin romper nada)
const collectUrls = (val: any): string[] => {
  const out: string[] = [];

  const push = (u: any) => {
    if (!u) return;

    if (typeof u === "string") {
      const s = u.trim();
      if (!s) return;

      // soporta "url1,url2,url3" si algún backend lo manda así
      if (s.includes(",") && /^https?:\/\//i.test(s.split(",")[0].trim())) {
        s.split(",").forEach((p) => push(p));
        return;
      }

      out.push(s);
      return;
    }

    if (typeof u === "object") {
      const cand =
        u.url ||
        u.secure_url ||
        u.secureUrl ||
        u.src ||
        u.href ||
        u.path ||
        u.image ||
        u.imageUrl ||
        u.publicUrl;

      if (cand) push(cand);
    }
  };

  if (Array.isArray(val)) val.forEach(push);
  else push(val);

  return Array.from(new Set(out.filter(Boolean)));
};

let safeImages: string[] = [];

// prioridad: galerías/listas típicas
safeImages = collectUrls(base.images);
if (safeImages.length === 0) safeImages = collectUrls(base.imageUrls);
if (safeImages.length === 0) safeImages = collectUrls(base.photos);
if (safeImages.length === 0) safeImages = collectUrls(base.gallery);
if (safeImages.length === 0) safeImages = collectUrls(base.media);
if (safeImages.length === 0) safeImages = collectUrls(base.assets);

// fallback: single
if (safeImages.length === 0) safeImages = collectUrls(base.img);
if (safeImages.length === 0) safeImages = collectUrls(base.mainImage);
if (safeImages.length === 0) safeImages = collectUrls(base.image);
if (safeImages.length === 0) safeImages = collectUrls(base.coverImage);


  // 3. GESTIÓN DE PRECIOS (Lógica original conservada)
  const safePrice = Number(
    base.priceValue || base.rawPrice || String(base.price).replace(/\D/g, "") || 0
  );

const safeIdRaw = base.propertyId ?? base.id ?? base._id ?? base.uuid;
if (!safeIdRaw) return null; // ✅ sin id real, no inventamos
const safeId = String(safeIdRaw);

  // 4. GESTIÓN DE COORDENADAS (Lógica original conservada al 100%)
  const lngRaw =
    base.lng ??
    base.longitude ??
    (Array.isArray(base.coordinates) ? base.coordinates[0] : undefined) ??
    base.geometry?.coordinates?.[0] ??
    (Array.isArray(base.location) ? base.location[0] : undefined);

  const latRaw =
    base.lat ??
    base.latitude ??
    (Array.isArray(base.coordinates) ? base.coordinates[1] : undefined) ??
    base.geometry?.coordinates?.[1] ??
    (Array.isArray(base.location) ? base.location[1] : undefined);

  const lng = lngRaw !== undefined && lngRaw !== null ? Number(lngRaw) : undefined;
  const lat = latRaw !== undefined && latRaw !== null ? Number(latRaw) : undefined;

  const hasCoords = Number.isFinite(lng) && Number.isFinite(lat);
  const coordinates = hasCoords ? [lng as number, lat as number] : undefined;

  // 5. REQUISITOS (Lógica original conservada)
  let nanoRequirements = base.requirements || [];
  if (!Array.isArray(nanoRequirements)) nanoRequirements = [];

  if (nanoRequirements.length === 0) {
    if (safePrice > 1000000) {
      nanoRequirements = ["Acuerdo de Confidencialidad (NDA)", "Video Drone 4K", "Filtrado Financiero"];
    } else if (base.type === "land" || base.type === "suelo") {
      nanoRequirements = ["Levantamiento Topográfico", "Informe Urbanístico", "Cédula"];
    } else if (base.type === "commercial" || base.type === "local") {
      nanoRequirements = ["Licencia de Apertura", "Plano de Instalaciones", "Estudio de Mercado"];
    } else {
      nanoRequirements = ["Reportaje Fotográfico", "Certificado Energético", "Nota Simple"];
    }
  }

 // 6. RETORNO FINAL
  return {
    ...base,
    id: safeId,
    
    // 🔥 PASAPORTE DIPLOMÁTICO PARA LA DIRECCIÓN (Los 4 datos puros pasan sin ser tocados)
    address: base.address || null,
    city: base.city || null,
    postcode: base.postcode || null,
    region: base.region || null,
    
    price: safePrice,
    priceValue: safePrice,
    rawPrice: safePrice,
    formattedPrice: new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(safePrice),
    images: safeImages,
    img: safeImages[0] || null,
    longitude: hasCoords ? (lng as number) : base.longitude,
    latitude: hasCoords ? (lat as number) : base.latitude,
    lng: hasCoords ? (lng as number) : base.lng,
    lat: hasCoords ? (lat as number) : base.lat,
    coordinates,
    communityFees: base.communityFees || 0,
    mBuilt: Number(base.mBuilt || base.m2 || 0),
    requirements: nanoRequirements,
    
    // 🔥 ASEGURAMOS QUE EL DUEÑO VIAJE SIEMPRE AL FRONTEND (blindado)
    user: (base.user || p.user)
      ? {
          ...(base.user || p.user),
          role: (base.user || p.user)?.role || base?.role || null,
          companyName: (base.user || p.user)?.companyName || base?.companyName || null,
          companyLogo: (base.user || p.user)?.companyLogo || base?.companyLogo || null,
          cif: (base.user || p.user)?.cif || base?.cif || null,
          licenseNumber: (base.user || p.user)?.licenseNumber || base?.licenseNumber || null,
        }
      : null,
  };
};
const extractFirstUrl = (s: string) => {
  const m = String(s || "").match(/(https?|blob):\/\/[^\s]+/i);
  if (!m?.[0]) return "";
  return m[0].replace(/[)\],.]+$/g, "");
};

const isPdfUrl = (u: string) =>
  /\/raw\/upload\//i.test(u) || /\.pdf(\?|#|$)/i.test(u);

const isImageUrl = (u: string) =>
  /^blob:/i.test(u) ||
  /^data:image\//i.test(u) ||
  /\/image\/upload\//i.test(u) ||
  (/res\.cloudinary\.com\/.+\/upload\//i.test(u) && !/\.pdf(\?|#|$)/i.test(u)) ||
  /\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(u);

export default function UIPanels({ 
  map, searchCity, lang, setLang, soundEnabled, toggleSound, systemMode, setSystemMode 
}: any) {
 
 // 🔥 DETECTOR DE ENLACES MEJORADO (CON VIP PASS PARA PÚBLICO)
  const searchParams = useSearchParams();
  const [isVipGuest, setIsVipGuest] = useState(false);

  useEffect(() => {
      const checkUrl = async () => {
          const propId = searchParams.get('p') || searchParams.get('selectedProp'); 
          
          if (propId) {
               console.log("🎯 Link detectado. Ejecutando VIP PASS para:", propId);
               try {
                   const res = await getPropertyByIdAction(propId);
                   
                   if (res?.success && res.data) {
                       const cleanProp = sanitizePropertyData(res.data);

                       if (cleanProp) {
                           // 1. ABRIMOS LAS COMPUERTAS A CIVILES
                           setIsVipGuest(true);
                           setGateUnlocked(true);

                           // 2. Forzamos modo EXPLORER PRIMERO
                           if (typeof setSystemMode === 'function') {
                               setSystemMode('EXPLORER');
                           }
                           
                           // 3. Limpiamos la intro
                           setLandingComplete(true); 
                           setShowAdvancedConsole(false);
                           
                           // 🔥 4. RETRASO TÁCTICO: Esperamos 500ms para esquivar el "Protocolo de Descontaminación"
                           // y luego le lanzamos la propiedad a la pantalla.
                           setTimeout(() => {
                               setSelectedProp(cleanProp);
                               setActivePanel('DETAILS');
                               
                               // 5. Volamos hacia la casa
                           if (cleanProp.coordinates && map?.current) {
                                   map.current.flyTo({ 
                                       center: cleanProp.coordinates, 
                                       zoom: 18, 
                                       pitch: 60,
                                       duration: 3000 
                                   });
                               }
                               }, 500);
                           }
                       }
               } catch (e) {
                   console.error("Error abriendo link:", e);
               }
          }
      };
      
      checkUrl();
  }, [searchParams, map]);

 
  // --- 1. MEMORIA DE UBICACIÓN ---
  const [homeBase, setHomeBase] = useState<any>(null);
  useEffect(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('stratos_home_base');
          if (saved) try { setHomeBase(JSON.parse(saved)); } catch (e) {}
      }
  }, []);

  // 🔥 MOVIDO AQUÍ (ANTES DE USARSE EN EL EFECTO DE GATE)
  // --- DATOS USUARIO (SERVER-SIDE SOURCE OF TRUTH) ---
  const [activeUserKey, setActiveUserKey] = useState<string | null>(null);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [agencyProfileData, setAgencyProfileData] = useState<any>(null);
  const [localFavs, setLocalFavs] = useState<any[]>([]);
  const [agencyFavs, setAgencyFavs] = useState<any[]>([]);
  const [agencyLikes, setAgencyLikes] = useState<any[]>([]);
  const uiFavs = systemMode === "AGENCY" ? agencyLikes : localFavs;
  const [userRole, setUserRole] = useState<'PARTICULAR' | 'AGENCIA' | null>(null);
  const [gateUnlocked, setGateUnlocked] = useState(false);

// Efecto reactivo: Si tenemos usuario confirmado, O UN PASE VIP, abrimos la puerta.
  useEffect(() => {
      // 🔥 BYPASS TÁCTICO: Si hay cualquier llave que no sea anon, abrimos la puerta. 
      // No esperamos a que identityVerified sea true porque el cambio de roles lo retrasa.
      if (isVipGuest || (activeUserKey && activeUserKey !== 'anon')) {
          setGateUnlocked(true);
          setIdentityVerified(true); // Forzamos la verificación
      } else {
          setGateUnlocked(false);
      }
  }, [activeUserKey, isVipGuest]);

  // 👇👇👇 PEGUE EL COMITÉ AQUÍ ABAJO 👇👇👇

  // 🧠 COMITÉ DE BIENVENIDA (MEMORIA DE REGRESO TRAS REGISTRO/LOGIN)
  useEffect(() => {
      // Solo actuamos si el Gate está abierto Y el usuario es real (ya se ha registrado/logueado)
      if (gateUnlocked && identityVerified && activeUserKey && activeUserKey !== 'anon') {
          
          // Revisamos si dejó algo en la mochila antes de irse
          const returnIntentId = localStorage.getItem('stratos_return_intent');
          
          if (returnIntentId) {
              console.log("🧠 Recuperando objetivo previo al registro:", returnIntentId);
              
              // 1. Borramos la huella para que no se quede en bucle infinito
              localStorage.removeItem('stratos_return_intent');
              
              // 2. Vamos a buscar la casa a la base de datos
              getPropertyByIdAction(returnIntentId).then(res => {
                  if (res?.success && res.data) {
                      const cleanProp = sanitizePropertyData(res.data);
                      if (cleanProp) {
                          // 3. ¡ZAS! Le abrimos la casa automáticamente
                          setSelectedProp(cleanProp);
                          setActivePanel('DETAILS');
                          
                          // 4. Y le volamos el mapa a su posición
                          if (cleanProp.coordinates && map?.current) {
                              setTimeout(() => {
                                  map.current.flyTo({ center: cleanProp.coordinates, zoom: 18, pitch: 60, duration: 3000 });
                              }, 500);
                          }
                          
                          if (typeof addNotification === 'function') {
                              addNotification("✅ Bienvenido de nuevo. Aquí tienes tu expediente.");
                          }
                      }
                  }
              }).catch(console.error);
          }
      }
  }, [gateUnlocked, identityVerified, activeUserKey, map]);

  // --- 3. ESTADOS SISTEMA ---
  const [activePanel, setActivePanel] = useState('NONE'); 
  const [rightPanel, setRightPanel] = useState('NONE');   
useEffect(() => {
  if (systemMode === "AGENCY" && rightPanel === "OWNER_PROPOSALS") {
    setRightPanel("NONE");
    setActiveCampaignId(null);
  }
}, [systemMode, rightPanel]);

  // ✅ Propuestas (Campaign) en columna derecha
const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
const [ownerProposals, setOwnerProposals] = useState<any[]>([]);
const [ownerProposalsLoading, setOwnerProposalsLoading] = useState(false);
const [ownerProposalsManualList, setOwnerProposalsManualList] = useState(false);

// ✅ loader robusto (Owner Proposals) — con mapping COMPLETO (comisión/terms) + anti-duplicados + anti-stale
const ownerProposalsReqRef = useRef(0);

const loadOwnerProposals = async () => {
  // ✅ PRIVACIDAD: OwnerProposals SOLO en EXPLORER (particular)
  if (systemMode !== "EXPLORER") return;

  // 🚫 sin sesión
  if (!activeUserKey || activeUserKey === "anon") return;

  // ✅ evita doble llamada si ya está cargando
  if (ownerProposalsLoading) return;

  const reqId = ++ownerProposalsReqRef.current;

  try {
    setOwnerProposalsLoading(true);

    const fn = getOwnerProposalsAction as any;
    if (typeof fn !== "function") {
      console.warn("getOwnerProposalsAction is not a function");
      if (reqId === ownerProposalsReqRef.current) setOwnerProposals([]);
      return;
    }

    const r = await fn();
    if (reqId !== ownerProposalsReqRef.current) return;

    if (!r?.success) {
      console.warn("getOwnerProposalsAction failed:", r?.error);
      setOwnerProposals([]);
      return;
    }

    const rawList = Array.isArray(r?.data) ? r.data : [];
    
    // ✅ anti-duplicados por id
    const dedup = new Map<string, any>();
    for (const x of rawList) {
      const id = String(x?.id || "").trim();
      if (!id) continue;
      if (!dedup.has(id)) dedup.set(id, x);
    }

    // ✅ BLINDAJE: catálogo de servicios
    const catalog: any[] =
      (globalThis as any)?.SERVICES_CATALOG && Array.isArray((globalThis as any).SERVICES_CATALOG)
        ? (globalThis as any).SERVICES_CATALOG
        : (typeof (SERVICES_CATALOG as any) !== "undefined" && Array.isArray(SERVICES_CATALOG as any))
        ? (SERVICES_CATALOG as any[])
        : [];

    const normalized = Array.from(dedup.values()).map((raw: any) => {
      // 1. Mapeo de Servicios
      const services = (Array.isArray(raw?.serviceIds) ? raw.serviceIds : [])
        .map((sid: any) => String(sid).trim())
        .filter(Boolean)
        .map((sid: string) => {
          const hit = catalog.find((s: any) => String(s?.id) === sid);
          return hit
            ? { id: String(hit.id), label: String(hit.label || hit.name || sid), mode: hit.mode || hit.category }
            : { id: sid, label: sid, mode: undefined };
        });

      // 2. 🔥 RED DE ARRASTRE DE DATOS (CORREGIDA PARA COINCIDIR CON RADAR) 🔥
      // Unificamos todo en un objeto fuente 'src' para buscar fácil
      const terms = raw?.terms || raw?.financials || {};
      const src = { ...raw, ...terms }; 

      // -- EXTRACCIÓN DE DINERO (BUSCANDO LO QUE ENVÍA EL RADAR) --
      const totalAmount = Number(src.totalAmount || src.commissionTotalEur || src.amount || 0);
      
      const commissionPct = Number(src.commissionPct || src.commission || 0);
      
      // OJO: El radar envía 'commissionIvaPct', no 'vatPct'
      const vatPct = Number(src.commissionIvaPct || src.vatPct || src.ivaPct || src.vat || 21);

      // -- EXTRACCIÓN DE TIEMPO Y EXCLUSIVA --
      // OJO: El radar envía 'exclusiveMonths', no 'durationMonths'
      const duration = Number(src.exclusiveMonths || src.durationMonths || src.months || src.duration || 0);
      
      // OJO: El radar envía 'exclusiveMandate'
      const isExclusive = Boolean(
          src.exclusiveMandate === true || src.isExclusive === true || src.exclusive === true || 
          String(src.exclusiveMandate) === "true" || String(src.isExclusive) === "true"
      );

      // Cálculos derivados (Base e IVA en euros)
      const baseEur = totalAmount > 0 ? (totalAmount / (1 + (vatPct/100))) : 0;
      const ivaEur = totalAmount - baseEur;

      return {
        id: String(raw?.id || ""),
        status: raw?.status || "SENT",
        createdAt: raw?.createdAt || null,

        property: raw?.property || null,
        agency: raw?.agency || null,

        message: raw?.message || "",
        conversationId: raw?.conversationId ? String(raw.conversationId) : "",

        services,

        // 🔥🔥 TRADUCCIÓN FINAL PARA EL PANEL VISUAL 🔥🔥
        terms: {
            exclusive: isExclusive,
            months: duration,
            commissionPct: commissionPct,
            ivaPct: vatPct,
            
            // DINERO:
            commissionTotalEur: totalAmount,
            commissionBaseEur: baseEur, 
            ivaAmountEur: ivaEur
        }
      };
    });

    setOwnerProposals(normalized);
  } catch (e) {
    console.error("loadOwnerProposals error:", e);
    setOwnerProposals([]);
  } finally {
    if (reqId === ownerProposalsReqRef.current) setOwnerProposalsLoading(false);
  }
};


/// ✅ CARGA AUTOMÁTICA de propuestas SOLO en EXPLORER (particular)
useEffect(() => {
  if (systemMode !== "EXPLORER") return;
  if (!activeUserKey || activeUserKey === "anon") return;

  // Cargar cuando:
  // - abres la columna OWNER_PROPOSALS
  // - o hay un campaign seleccionado
  if (rightPanel === "OWNER_PROPOSALS" || !!activeCampaignId) {
    loadOwnerProposals();
  }
}, [systemMode, activeUserKey, rightPanel, activeCampaignId]);



  const [selectedProp, setSelectedProp] = useState<any>(null);
 const [premiumProp, setPremiumProp] = useState<any>(null);
  const [editingProp, setEditingProp] = useState<any>(null);
  const [marketProp, setMarketProp] = useState<any>(null);
  const [previousMode, setPreviousMode] = useState<"EXPLORER" | "AGENCY">("EXPLORER");
  const [selectedReqs, setSelectedReqs] = useState<any[]>([]);

  // --- 4. ESTADOS DE FLUJO ---
  const [explorerIntroDone, setExplorerIntroDone] = useState(true);
  const [landingComplete, setLandingComplete] = useState(false);
  const [showAdvancedConsole, setShowAdvancedConsole] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  
  // --- 5. REFERENCIAS ---
  const prevFavIdsRef = useRef<Set<string>>(new Set());
const [dataVersion, setDataVersion] = useState(0);
 // ✅ Cache global en RAM: userId -> perfil actualizado (logo/cover/etc.)
const userCacheRef = useRef<Record<string, any>>({});
 
// ✅ Inyección de branding fresco al abrir Details (usa cache RAM)
const applyFreshOwnerBranding = (prop: any) => {
  if (!prop) return prop;

  const ownerId =
    prop?.user?.id ||
    prop?.ownerSnapshot?.id ||
    prop?.userId ||
    prop?.ownerId ||
    null;

  if (!ownerId) return prop;

  const cached = userCacheRef.current[String(ownerId)];
  if (!cached) return prop;

  return {
    ...prop,
    user: { ...(prop.user || {}), ...cached },
    ownerSnapshot: { ...(prop.ownerSnapshot || {}), ...cached },

    // compat por si algún panel mira root:
    companyLogo: cached.companyLogo || cached.avatar || prop.companyLogo,
    coverImage: cached.coverImage || cached.cover || prop.coverImage,
    role: prop.role || cached.role || prop?.user?.role || "AGENCIA",
  };
};
// --- 6. ESTADOS IA ---
const [chatOpen, setChatOpen] = useState(false);
const [chatThreads, setChatThreads] = useState<any[]>([]);
const [chatContextProp, setChatContextProp] = useState<any>(null);
const [chatConversationId, setChatConversationId] = useState<string | null>(null);



// ✅ Añádelo aquí (una sola vez) para el anti-loop definitivo:
const processedConversationRef = useRef<string | null>(null);

// ✅ Auto-select SOLO 1 vez por conversación (anti-loop definitivo)
useEffect(() => {
  if (rightPanel !== "OWNER_PROPOSALS") return;
  if (!chatConversationId) return;

  const cid = String(chatConversationId);

  // ✅ si ya procesamos esta conversación, no re-seleccionamos aunque cambie ownerProposals
  if (processedConversationRef.current === cid) return;

  const match = (Array.isArray(ownerProposals) ? ownerProposals : []).find(
    (p: any) => String(p?.conversationId || "") === cid
  );

  // Solo auto-seleccionamos si NO hay nada seleccionado
  if (match?.id && !activeCampaignId) {
    processedConversationRef.current = cid; // ✅ marcamos como “ya procesado”
    setActiveCampaignId(String(match.id));
  }
  // ⚠️ mantenemos activeCampaignId fuera del deps para no re-disparar por el set
}, [rightPanel, chatConversationId, ownerProposals]);

// ✅ (A) Reset al cerrar/salir de OWNER_PROPOSALS
useEffect(() => {
  if (rightPanel !== "OWNER_PROPOSALS") {
    processedConversationRef.current = null;
  }
}, [rightPanel]);

// ✅ (B) Reset al cerrar el Chat
useEffect(() => {
  if (!chatOpen) {
    processedConversationRef.current = null;
  }
}, [chatOpen]);

const [chatMessages, setChatMessages] = useState<any[]>([]);
const [chatInput, setChatInput] = useState("");
const [chatLoading, setChatLoading] = useState(false);

const [aiInput, setAiInput] = useState("");
const [aiResponse, setAiResponse] = useState("");
const [isAiTyping, setIsAiTyping] = useState(false);

// ✅ CHAT UNREAD (badge + alertas)
const [unreadByConv, setUnreadByConv] = useState<Record<string, number>>({});
const [unreadTotal, setUnreadTotal] = useState(0);

// convId -> timestamp del último mensaje por el que YA notificamos (para no spamear)
const lastNotifiedAtRef = useRef<Record<string, number>>({});
const lastSeenAtRef = useRef<Record<string, number>>({});

// ✅ BILLING / PLAN OVERLAY (nuevo - mínimo)
const [planOpen, setPlanOpen] = useState(false);

// ⬇️ RECOMENDADO: que el hook devuelva también "loading"
const { plan, isActive, loading: planLoading } = useMyPlan();
const planDismissedRef = useRef(false);

const closePlanOverlay = () => {
  planDismissedRef.current = true; // evita que se reabra en esta sesión
  setPlanOpen(false);
};

// ✅ Si cambia el usuario, permitimos que el overlay vuelva a mostrarse en esta sesión
useEffect(() => {
  planDismissedRef.current = false;
}, [activeUserKey]);

// ✅ Mostrar PlanOverlay SOLO si hay PAYWALL real (STARTER o EXPIRED)
// Fuente de verdad: plan.showPaywall (server truth via getBillingGateAction)
useEffect(() => {
  if (!gateUnlocked) return;
  if (planLoading) return;
  if (!plan) return;

  const showPaywall = !!(plan as any)?.showPaywall;

  // Si está abierto y ya no toca, lo cerramos
  if (planOpen) {
    if (!showPaywall) setPlanOpen(false);
    return;
  }

  // Evitar reabrir si el usuario lo cerró manualmente en esta sesión
  if (planDismissedRef.current) return;

  // STARTER / EXPIRED => modal
  if (showPaywall) setPlanOpen(true);
}, [gateUnlocked, planLoading, plan, planOpen]);


// recalcular total
useEffect(() => {
  const total = Object.values(unreadByConv || {}).reduce(
    (acc, n) => acc + Number(n || 0),
    0
  );
  setUnreadTotal(total);
}, [unreadByConv]);

const markConversationAsRead = (conversationId: string, lastAt?: number) => {
  if (!conversationId) return;

  const ts = Number.isFinite(Number(lastAt)) ? Number(lastAt) : Date.now();
  lastSeenAtRef.current[String(conversationId)] = ts;

  // ✅ UI instantánea: quita badge local
  setUnreadByConv((prev) => {
    if (!prev || !prev[String(conversationId)]) return prev;
    const next = { ...(prev || {}) };
    delete next[String(conversationId)];
    return next;
  });

  // ✅ evita notificar de nuevo por el mismo último mensaje
  lastNotifiedAtRef.current[String(conversationId)] = ts;

  // ✅ server-truth (blindado para no romper nada)
  try {
    const fn = markConversationReadAction as any;
    if (typeof fn === "function") fn(String(conversationId), ts);
  } catch (e) {
    // silencioso
  }
};

// ✅ calcula unread + notifica (server-truth)
const updateUnreadFromThreads = (threads: any[]) => {
  try {
    const next: Record<string, number> = {};

    (Array.isArray(threads) ? threads : []).forEach((t: any) => {
      const id = String(t?.id || "");
      if (!id) return;

      // ✅ si estás dentro de esa conversación, no mostramos unread
      if (String(chatConversationId || "") === id) {
        return;
      }

      // ✅ SERVER TRUTH: ya viene de actions.ts (normalizeThread)
      const isUnread = !!t?.unread;

      if (isUnread) {
        next[id] = 1;

        // ✅ notificación 1 vez por "nuevo lastMessageAt"
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

// ✅ polling ligero: refresca threads/unread y, si estás dentro, mensajes (cada 12s)
useEffect(() => {
  if (!identityVerified || !activeUserKey || activeUserKey === "anon") return;

  let alive = true;
  let timer: any = null;

  const poll = async () => {
    try {
      // 1) Threads + unread
      const listFn = listMyConversationsAction as any;
      if (typeof listFn === "function") {
        const res = await listFn();
        if (!alive) return;

        if (res?.success) {
          const threads = Array.isArray(res.data) ? res.data : [];
          setChatThreads(threads);
          if (typeof updateUnreadFromThreads === "function") {
            updateUnreadFromThreads(threads);
          }
        }
      }

      // 2) Si hay conversación abierta, refrescamos mensajes
      if (chatOpen && chatConversationId) {
        const msgFn = getConversationMessagesAction as any;
        if (typeof msgFn === "function") {
          const r2 = await msgFn(String(chatConversationId));
          if (!alive) return;

          if (r2?.success) {
            const nextMsgs = Array.isArray(r2.data) ? r2.data : [];

            // evita re-render inútil si no cambió nada
            setChatMessages((prev: any[]) => {
              const prevArr = Array.isArray(prev) ? prev : [];
              const prevLast = prevArr[prevArr.length - 1];
              const nextLast = nextMsgs[nextMsgs.length - 1];

              const prevKey = prevLast
                ? `${prevLast.id || ""}|${prevLast.createdAt || ""}`
                : "";
              const nextKey = nextLast
                ? `${nextLast.id || ""}|${nextLast.createdAt || ""}`
                : "";

              if (prevArr.length === nextMsgs.length && prevKey === nextKey) return prevArr;
              return nextMsgs;
            });

            // marca como leído por si llegó algo nuevo
            try {
              const last = nextMsgs[nextMsgs.length - 1];
              const lastAt = last?.createdAt ? new Date(last.createdAt).getTime() : Date.now();
              if (typeof markConversationAsRead === "function") {
                markConversationAsRead(String(chatConversationId), lastAt);
              }
            } catch {}

            // scroll suave al final si hubo novedades
            try {
              scrollChatToBottom();
            } catch {}
          }
        }
      }
    } catch (e) {
      // silencioso (no spamear notificaciones)
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

// --- EFECTOS INICIALES ---

  // 1. Cargador Ligero de Perfil (FUSIONADO)
  useEffect(() => {
      const fetchAgencyData = async () => {
          if (activeUserKey && activeUserKey !== 'anon') {
              try {
                  const res = await getUserMeAction();
                  
                  if (res.success) {
                      setAgencyProfileData({
                          ...res.data,
                          avatar: res.data.companyLogo || res.data.avatar 
                      });
                  }
              } catch (e) {}
          }
      };
      fetchAgencyData();
  }, [activeUserKey]);

 // 🔥 FUNCIÓN DE LIMPIEZA TÁCTICA (Faltaba definirla)
  const handleLogoutCleanup = () => {
      setActiveUserKey(null);
      setIdentityVerified(false);
      setGateUnlocked(false);
      if (typeof setUserRole === 'function') {
          setUserRole(null);
      }
  };

  // 2. IDENTIFICACIÓN DE USUARIO Y RANGO (EL CEREBRO DEL SISTEMA)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
       // A. LLAMADA AL SERVIDOR
        const me = await getUserMeAction();
        if (!alive) return;

        console.log("🧠 getUserMeAction ->", me);


        // B. OBTENCIÓN DE ID
        const key = me?.success && me?.data?.id ? String(me.data.id) : "anon";
        
        if (key !== "anon") {
            // ✅ IDENTIDAD CONFIRMADA
            setActiveUserKey(key);
            setIdentityVerified(true);
            
            // 🔥 CÓDIGO NUEVO: DETECCIÓN DE RANGO (ROL)
            // Aquí leemos si en la base de datos es 'AGENCIA' o 'PARTICULAR'
            const dbRole = me.data?.role; 
            console.log("👮‍♂️ IDENTIDAD SERVIDOR:", key, "| RANGO:", dbRole);
            
            // Guardamos el rol en el estado (IMPORTANTE: asegúrese de tener const [userRole, setUserRole] arriba)
            if (typeof setUserRole === 'function') {
                setUserRole(dbRole); 
            }

            // 🔥 DISPARO DE EVENTOS
            window.dispatchEvent(new CustomEvent("user-changed", { detail: { userKey: key } }));
            window.dispatchEvent(new CustomEvent("reload-favorites"));
        } else {
            // 🚫 NO HAY SESIÓN
            handleLogoutCleanup();
        }

      } catch (e) {
        if (!alive) return;
        console.warn("⚠️ FALLO DE RED/SERVER.");
        handleLogoutCleanup();
      }
    })();
    
    return () => { alive = false; };
  }, []);

  const normalizeFavList = (arr: any[]) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item: any) => {
      if (!item) return null;
      const base = item?.property ? { ...item.property, propertyId: item.propertyId } : item;
      const propId = base.propertyId || item.propertyId || base.id || item.id;
      if (!propId) return null;
      const merged = { ...base, id: String(propId), isFavorited: true };
      const safe = sanitizePropertyData(merged) || merged;
      const lng = (Array.isArray(safe.coordinates) ? safe.coordinates[0] : undefined) ?? safe.longitude ?? safe.lng;
      const lat = (Array.isArray(safe.coordinates) ? safe.coordinates[1] : undefined) ?? safe.latitude ?? safe.lat;
      const nLng = Number(lng);
      const nLat = Number(lat);
      const coords = Number.isFinite(nLng) && Number.isFinite(nLat) ? [nLng, nLat] : safe.coordinates;
      return { ...safe, id: String(propId), coordinates: coords, isFavorited: true };
    }).filter(Boolean);
  };

 // ✅ Mirror SOLO por eventos (sin localStorage)
const mirrorGlobalFavsForNanoCard = (list: any[]) => {
  try {
    const prevIds = prevFavIdsRef.current || new Set<string>();
    const nextIds = new Set(
      (Array.isArray(list) ? list : [])
        .map((x: any) => String(x?.id))
        .filter(Boolean)
    );

    // 1) Apagar los que ya no están
    prevIds.forEach((pid) => {
      if (!nextIds.has(pid)) {
        window.dispatchEvent(
          new CustomEvent("sync-property-state", { detail: { id: pid, isFav: false } })
        );
      }
    });

    // 2) Encender los nuevos
    nextIds.forEach((nid) => {
      if (!prevIds.has(nid)) {
        window.dispatchEvent(
          new CustomEvent("sync-property-state", { detail: { id: nid, isFav: true } })
        );
      }
    });

    // 3) Guardar snapshot en memoria (RAM)
    prevFavIdsRef.current = nextIds;
  } catch {}
};

  // ✅ Persistencia Inteligente (CON MEMORIA DE SUPERVIVENCIA)
  const persistFavsForUser = (userKey: string, list: any[]) => {
    try {
      const safeUser = userKey || "anon";
      const LIST_KEY = `stratos_favorites_v1:${safeUser}`;
      const safeList = Array.isArray(list) ? list : [];

      localStorage.setItem(LIST_KEY, JSON.stringify(safeList));

      if (safeList.length > 0) {
          localStorage.setItem("stratos_favorites_last_good", JSON.stringify(safeList));
      }

      mirrorGlobalFavsForNanoCard(safeList);

      safeList.forEach((x: any) => {
        const id = String(x?.id);
        if (!id) return;
        if (safeUser !== "anon") localStorage.setItem(`fav-${safeUser}-${id}`, "true");
        localStorage.setItem(`fav-${id}`, "true");
      });
    } catch {}
  };

// 2. CARGA DE DATOS MULTI-USUARIO (CONEXIÓN REAL A BASE DE DATOS)
  useEffect(() => {
    let isMounted = true;

    const loadRealData = async () => {
        // Si no hay usuario, no cargamos nada
        if (!activeUserKey || activeUserKey === 'anon') return;

        // A. CARGA MODO PARTICULAR (Favoritos)
        try {
           const favResult = await getFavoritesAction();
           if (favResult.success && isMounted) {
                // ✅ Normalizamos para que el ID sea SIEMPRE el de la Property
                const normalized = normalizeFavList(favResult.data);
                
                // 🔥 FILTRO ANTI-DUPLICADOS (Por si acaso viene sucio del server)
                const uniqueFavs = Array.from(new Map(normalized.map(item => [String(item.id), item])).values());

                // ✅ En EXPLORER -> localFavs | en AGENCY -> agencyLikes (server-backed)
if (systemMode === "AGENCY") {
  setAgencyLikes(uniqueFavs);
} else {
  setLocalFavs(uniqueFavs);
}


                // Mantenemos el espejo para las NanoCards
                if (typeof mirrorGlobalFavsForNanoCard === 'function') {
                    mirrorGlobalFavsForNanoCard(uniqueFavs);
                }
           }
        } catch (e) {}

        // B. CARGA MODO AGENCIA (Stock Real)
        if (systemMode === 'AGENCY') {
            try {
                const stockResult = await getAgencyPortfolioAction();
                if (stockResult.success && isMounted) {
                    
                    // 🔥 FILTRO ANTI-DUPLICADOS PARA AGENCIA (CRÍTICO)
                    // Si la DB devuelve algo raro, esto lo limpia antes de pintarlo en la lista
                    const rawStock = stockResult.data || [];
                    const uniqueStock = Array.from(new Map(rawStock.map((item:any) => [String(item.id), item])).values());
                    
                    setAgencyFavs(uniqueStock);
                    console.log("🏢 STOCK CARGADO (LIMPIO):", uniqueStock.length);
                }
            } catch (e) {
                console.error("Error cargando Stock:", e);
            }
        }
    };

    loadRealData();
    
    return () => { isMounted = false; };
    
  }, [activeUserKey, systemMode, identityVerified, dataVersion]);
  
 // 3. TOGGLE FAVORITE (BIFURCADO: Agency Likes vs Private Likes)
const handleToggleFavorite = async (prop: any) => {
  // A. Validaciones iniciales
  if (!prop || activeUserKey === null) return;
  if (soundEnabled) playSynthSound("click");

  const userKey = activeUserKey;

  // 🚫 SaaS puro: Validación de identidad
  if (!identityVerified || userKey === "anon") {
    addNotification("Inicia sesión para guardar Referencias");
    return;
  }

  // B. Limpieza de datos (Sanitización robusta)
  const cleaned = sanitizePropertyData(prop) || prop;

  // 🚫 Validación de ID seguro
  const safeIdRaw = cleaned?.id || prop?.id;
  if (!safeIdRaw) {
    console.warn("handleToggleFavorite: sin id real, abortado");
    return;
  }
  const safeId = String(safeIdRaw);

  // C. Selección de bóveda
  const isAgencyMode = systemMode === "AGENCY";
  const currentList = isAgencyMode ? agencyLikes : localFavs;
  const setTargetList = isAgencyMode ? setAgencyLikes : setLocalFavs;
  const targetName = isAgencyMode ? "Bóveda de Agencia" : "Favoritos Personales";

  // D. Estado actual (en la lista activa)
  const isCurrentlyFav = (Array.isArray(currentList) ? currentList : []).some(
    (f: any) => String(f?.id) === safeId
  );

  // ✅ Intención: si viene forzada (isFav), se respeta SIEMPRE (sin “redundante”)
  const desired =
    typeof prop?.isFav === "boolean" ? prop.isFav : !isCurrentlyFav;

  // Construimos el objeto seguro para guardar (solo si desired=true)
  const safeProp = {
    ...cleaned,
    id: safeId,
    title: cleaned?.title || prop?.title || "Propiedad",
    formattedPrice: cleaned?.formattedPrice || cleaned?.price || "Consultar",
    savedAt: Date.now(),
    isFavorited: true,
    isFav: true,
    isFavorite: true,
  };

  const dedupeById = (list: any[]) => {
    const m = new Map<string, any>();
    (Array.isArray(list) ? list : []).forEach((x: any) => {
      const id = x?.id != null ? String(x.id) : "";
      if (!id) return;
      m.set(id, x);
    });
    return Array.from(m.values());
  };

  // ✅ Broadcast TRIPLE (Details + NanoCard + Vault)
  const broadcastFav = (status: boolean) => {
    if (typeof window === "undefined") return;

    // 1) NanoCards / mapa (tu canal principal)
    window.dispatchEvent(
      new CustomEvent("sync-property-state", { detail: { id: safeId, isFav: status } })
    );

    // 2) Live update genérico (Details escucha esto en tu panel)
    window.dispatchEvent(
      new CustomEvent("update-property-signal", {
        detail: { id: safeId, updates: { isFav: status, isFavorite: status, isFavorited: status } },
      })
    );

    // 3) Canal específico de favoritos (por si tu bóveda/notifs lo usan)
    window.dispatchEvent(
      new CustomEvent("fav-change-signal", { detail: { id: safeId, isFavorite: status } })
    );
  };

  // E. Snapshot para rollback
  const prevListSnapshot = Array.isArray(currentList) ? [...currentList] : [];

  // 1) Optimistic UI (lista)
  setTargetList((prev: any[]) => {
    const base = Array.isArray(prev) ? prev : [];
    if (desired) return dedupeById([...base, safeProp]);
    return base.filter((x: any) => String(x?.id) !== safeId);
  });

  // 2) Optimistic UI (Details si está abierta esa prop)
  setSelectedProp((prev: any) => {
    if (!prev) return prev;
    if (String(prev?.id) !== safeId) return prev;
    return { ...prev, isFav: desired, isFavorited: desired, isFavorite: desired };
  });

  addNotification(desired ? `Guardado en ${targetName}` : `Eliminado de ${targetName}`);
  broadcastFav(!!desired);

  // 3) Servidor (source of truth)
  try {
    const res: any = await toggleFavoriteAction(String(safeId), !!desired);

    const serverState =
      typeof res?.isFavorite === "boolean"
        ? res.isFavorite
        : typeof res?.data?.isFavorite === "boolean"
        ? res.data.isFavorite
        : !!desired;

    // Corrección si el server decide distinto
    if (serverState !== !!desired) {
      setTargetList((prev: any[]) => {
        const base = Array.isArray(prev) ? prev : [];
        if (serverState) return dedupeById([...base, safeProp]);
        return base.filter((x: any) => String(x?.id) !== safeId);
      });

      setSelectedProp((prev: any) => {
        if (!prev) return prev;
        if (String(prev?.id) !== safeId) return prev;
        return { ...prev, isFav: serverState, isFavorited: serverState, isFavorite: serverState };
      });

      broadcastFav(!!serverState);
    } else {
      // re-broadcast para “resucitar” sync si algún panel se quedó atrás
      broadcastFav(!!serverState);
    }
  } catch (error) {
    console.error(error);

    // Rollback UI
    setTargetList(prevListSnapshot);
    setSelectedProp((prev: any) => {
      if (!prev) return prev;
      if (String(prev?.id) !== safeId) return prev;
      return { ...prev, isFav: isCurrentlyFav, isFavorited: isCurrentlyFav, isFavorite: isCurrentlyFav };
    });

    broadcastFav(!!isCurrentlyFav);
    addNotification("❌ Error guardando en servidor");
  }
};


// 🔥 4. NUEVA FUNCIÓN: BORRADO LETAL DE AGENCIA (PARA EL BOTÓN DE PAPELERA)
const handleDeleteAgencyAsset = async (asset: any) => {
  if (!asset) return;
  if (soundEnabled) playSynthSound("click");

  const targetId = String(asset?.id || asset || "").trim();
  if (!targetId) return;

  const isOwnerHint = asset?.isOwner === true; // si tu lista unificada marca owner, mejor

  // 1) Optimistic UI: quitar del Stock visual
  setAgencyFavs((prev: any[]) =>
    (Array.isArray(prev) ? prev : []).filter((x: any) => String(x?.id) !== targetId)
  );

  // 1.1) Si está abierto en Details, apagamos corazón/estado para evitar desync visual
  setSelectedProp((prev: any) => {
    if (!prev) return prev;
    if (String(prev?.id) !== targetId) return prev;
    return { ...prev, isFav: false, isFavorited: false, isFavorite: false };
  });

  addNotification("Eliminando de Base de Datos...");

  try {
    // 2) Llamada real a servidor
    const result: any = await deleteFromStockAction(targetId);

    if (!result?.success) {
      addNotification("❌ Error al borrar");
      setDataVersion((v: number) => v + 1);
      return;
    }

    // 2.x) Interpretación robusta (si tu action no devuelve type)
    const type =
      result?.type ||
      (isOwnerHint ? "property_deleted" : "favorite_removed");

    // 2.1) Si fue “quitar favorito” (no borrar propiedad)
    if (type === "favorite_removed" || type === "favorite_noop") {
      setAgencyLikes((prev: any[]) =>
        (Array.isArray(prev) ? prev : []).filter((x: any) => String(x?.id) !== targetId)
      );
      setLocalFavs((prev: any[]) =>
        (Array.isArray(prev) ? prev : []).filter((x: any) => String(x?.id) !== targetId)
      );

      addNotification("✅ Eliminado de Favoritos");
    }

    // 2.2) Si fue “borrar propiedad”
    if (type === "property_deleted") {
      // fuera también de favoritos (por si estaba)
      setAgencyLikes((prev: any[]) =>
        (Array.isArray(prev) ? prev : []).filter((x: any) => String(x?.id) !== targetId)
      );
      setLocalFavs((prev: any[]) =>
        (Array.isArray(prev) ? prev : []).filter((x: any) => String(x?.id) !== targetId)
      );

      // cerrar Details SOLO si estabas viendo esa misma propiedad
      setActivePanel((p: any) => {
        const isThisOpen = String(selectedProp?.id || "") === targetId;
        if (p === "DETAILS" && isThisOpen) return "NONE";
        return p;
      });

      addNotification("✅ Propiedad eliminada permanentemente");
    }

    // 3) Sincronizar Mapa/NanoCards (manteniendo tu sistema)
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sync-property-state", { detail: { id: targetId, isFav: false } })
      );
    }

    // 4) Re-sync final desde server
    setDataVersion((v: number) => v + 1);
  } catch (e) {
    console.error(e);
    addNotification("❌ Error al borrar");
    setDataVersion((v: number) => v + 1);
  }
};

const toggleRightPanel = (p: string) => {
  if (soundEnabled) playSynthSound("click");
  const nextState = rightPanel === p ? "NONE" : p;

  // Si abrimos Propuestas desde el HUD, es modo LISTA (sin campaignId)
  if (nextState === "OWNER_PROPOSALS") {
    setActiveCampaignId(null);
  }

  setRightPanel(nextState);

  // 🔥 NUEVO BLINDAJE: Si abro un panel derecho, MATO cualquier panel central/izquierdo que estorbe (como el Premium)
  if (nextState !== "NONE") {
      setActivePanel('NONE');
      setPremiumProp(null); // Apagamos también la prop premium por si acaso
  }

  // 📡 COMUNICACIONES: Avisamos a los radares y buscadores
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent('park-smart-sidebar', { 
        detail: { park: nextState !== "NONE" } 
    }));

    if (nextState !== "NONE") {
      window.dispatchEvent(new CustomEvent("close-radar-signal"));
    }
  }
};

const toggleMainPanel = (p: string) => {
  if (soundEnabled) playSynthSound("click");
  if (p === "ARCHITECT") {
    setPreviousMode(systemMode as "EXPLORER" | "AGENCY");
    setEditingProp(null);
    setRightPanel("NONE");
    setSystemMode("ARCHITECT");
  } else {
    setActivePanel(activePanel === p ? "NONE" : p);
  }
};

const handleEditAsset = (asset: any) => {
  if (soundEnabled) playSynthSound("click");
  setPreviousMode(systemMode as "EXPLORER" | "AGENCY");
  setEditingProp(asset);
  setRightPanel("NONE");
  setActivePanel("NONE");
  setSystemMode("ARCHITECT");
};

const addNotification = (title: string) => {
  setNotifications((prev) => [{ title }, ...prev].slice(0, 3));
  setTimeout(() => setNotifications((prev) => prev.slice(0, -1)), 4000);
};

// =======================
// ✅ CHAT helpers (avatar/nombre + blocklist + delete thread)
// =======================
const getUserLabel = (u: any) => {
  if (!u) return "Usuario";
  const full = [u?.name, u?.surname].filter(Boolean).join(" ").trim();
  return (u?.companyName || full || u?.email || "Usuario").trim();
};

const getUserAvatar = (u: any) => {
  return u?.companyLogo || u?.avatar || null;
};

// intenta sacar “el otro” usuario de un thread
const resolveOtherUser = (t: any) => {
  if (t?.otherUser) return t.otherUser;

  const parts = Array.isArray(t?.participants) ? t.participants : [];
  const other =
    parts
      .map((p: any) => p?.user || p)
      .find((u: any) => String(u?.id || "") && String(u?.id || "") !== String(activeUserKey || ""));

  return other || null;
};

// title coherente
const getThreadTitle = (t: any) => {
  if (t?.title) return t.title;
  const ref = t?.refCode ? String(t.refCode) : "";
  const pt = t?.propertyTitle ? String(t.propertyTitle) : "";
  if (ref && pt) return `${ref} — ${pt}`;
  return ref || pt || "Conversación";
};

// ---- blocklist local (sin server, 0 riesgo)
const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());

useEffect(() => {
  try {
    if (typeof window === "undefined") return;
    const key = `stratos_chat_blocked_v1:${String(activeUserKey || "anon")}`;
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    setBlockedUsers(new Set((Array.isArray(arr) ? arr : []).map(String)));
  } catch {}
}, [activeUserKey]);

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

    // si estabas dentro de una conversación, vuelves a lista para evitar líos
    setChatConversationId(null);
    setChatMessages([]);

    return next;
  });
};

const isBlockedThread = (t: any) => {
  const other = resolveOtherUser(t);
  const oid = String(other?.id || "");
  return oid ? blockedUsers.has(oid) : false;
};

const handleDeleteConversation = async (conversationId: string) => {
  const cid = String(conversationId || "").trim();
  if (!cid) return;
  if (!confirm("¿Borrar esta conversación y sus mensajes?")) return;

  // optimista (quita de UI)
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
      setDataVersion((v: number) => v + 1); // re-sync duro
      return;
    }
    addNotification("🗑️ Conversación eliminada");
  } catch (e) {
    console.error(e);
    addNotification("⚠️ Error borrando conversación");
    setDataVersion((v: number) => v + 1);
  }
};
// ✅ Threads -> abre Details SIEMPRE con property COMPLETA (sin stub)
const tryOpenDetailsFromThread = async (t: any) => {
  try {
    if (typeof window === "undefined") return;
    if (!t) return;

    // 1) propertyId robusto (por si tu normalizeThread cambia forma)
    const pidRaw =
      t?.propertyId ||
      t?.property?.id ||
      t?.property?.propertyId ||
      t?.property?.uuid ||
      null;

    const pid = pidRaw ? String(pidRaw).trim() : "";
    if (!pid) return;

    // 2) evita llamadas repetidas si ya estás viendo esa misma prop
    if (String(selectedProp?.id || "") === pid) {
      window.dispatchEvent(new CustomEvent("open-details-signal", { detail: selectedProp }));
      return;
    }

    // 3) action existente
    const fn = getPropertyByIdAction as any;
    if (typeof fn !== "function") {
      console.warn("tryOpenDetailsFromThread: falta getPropertyByIdAction");
      return;
    }

    const res = await fn(pid);
    if (!res?.success || !res?.data) return;

    // 4) dispara tu canal global (tu listener ya sanitiza y abre DETAILS)
    window.dispatchEvent(new CustomEvent("open-details-signal", { detail: res.data }));
  } catch (e) {
    console.warn("tryOpenDetailsFromThread failed:", e);
  }
};



// =======================
// ✅ CHAT: abrir panel + cargar conversaciones
// =======================
const openChatPanel = async () => {
  setChatOpen(true);
  
  // 🔥 BLINDAJE: Si la IA está abierta, la aniquilamos para hacer hueco al Chat
  setActivePanel(prev => prev === 'AI' ? 'NONE' : prev); 

  setChatConversationId(null);
  setChatMessages([]);
  setChatLoading(true);
  try {
    // ✅ Source of truth: alias importado
    const listFn = listMyConversationsAction as any;

    if (typeof listFn !== "function") {
      addNotification("⚠️ Falta action: getMyConversationsAction (alias listMyConversationsAction)");
      return;
    }

    const res = await listFn();

    if (res?.success) {
      const threads = Array.isArray(res.data) ? res.data : [];
      setChatThreads(threads);

      // ✅ refresca badge/unread al instante (si existe el helper)
      if (typeof updateUnreadFromThreads === "function") {
        updateUnreadFromThreads(threads);
      }
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

// ✅ abrir una conversación y cargar mensajes
const openConversation = async (conversationId: string) => {
  if (!conversationId) return;

  setChatConversationId(conversationId);
  setChatLoading(true);

  try {
    const res = await (getConversationMessagesAction as any)(conversationId);

    if (res?.success) {
      const msgs = Array.isArray(res.data) ? res.data : [];
      setChatMessages(msgs);

      // ✅ marca como leído LOCAL (UI instantánea)
      const lastMsg = msgs[msgs.length - 1];
      const lastAt = lastMsg?.createdAt ? new Date(lastMsg.createdAt).getTime() : Date.now();

      // IMPORTANT: non-blocking
      try {
        if (typeof markConversationAsRead === "function") {
          markConversationAsRead(conversationId, lastAt);
        }
      } catch (err) {
        console.warn("markConversationAsRead failed (non-blocking):", err);
      }

      // ✅ marca como leído SERVER (multi-dispositivo)
      try {
        await (markConversationReadAction as any)(String(conversationId));
      } catch {}

      // ✅ baja al final para ver lo último
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

// ✅ enviar mensaje (robusto + debug)
const handleSendChat = async () => {
  const text = String(chatInput || "").trim();
  if (!text || !chatConversationId) return;

  setChatInput("");

  // Optimista
  const tempId = `tmp-${Date.now()}`;
  const optimistic = {
    id: tempId,
    text,
    content: text,
    senderId: String(activeUserKey || "anon"),
    createdAt: new Date().toISOString(),
  };

  setChatMessages((prev: any[]) => [...(Array.isArray(prev) ? prev : []), optimistic]);
  scrollChatToBottom();

  try {
    let res: any = null;

    // A) firma (conversationId, text)
    try {
      res = await (sendMessageAction as any)(chatConversationId, text);
    } catch {}

    // B) firma ({ conversationId, text })
    if (!res?.success) {
      try {
        res = await (sendMessageAction as any)({ conversationId: chatConversationId, text });
      } catch {}
    }

    // C) firma ({ conversationId, content })
    if (!res?.success) {
      try {
        res = await (sendMessageAction as any)({ conversationId: chatConversationId, content: text });
      } catch {}
    }

    // D) firma (text, conversationId) por si está al revés
    if (!res?.success) {
      try {
        res = await (sendMessageAction as any)(text, chatConversationId);
      } catch {}
    }

    console.log("sendMessageAction ->", res);

    if (res?.success && res?.data) {
      const serverMsg = res.data;

      const normalized = {
        ...serverMsg,
        text: serverMsg?.text ?? serverMsg?.content ?? text,
        content: serverMsg?.content ?? serverMsg?.text ?? text,
      };

      setChatMessages((prev: any[]) =>
        (Array.isArray(prev) ? prev : []).map((m: any) => (m.id === tempId ? normalized : m))
      );

      // ✅ al enviar, esa conversación cuenta como "vista" (LOCAL + SERVER)
      const sentAt = normalized?.createdAt ? new Date(normalized.createdAt).getTime() : Date.now();

      // IMPORTANT: no dejes que un bug en markConversationAsRead convierta un envío OK en "Error enviando"
      try {
        if (typeof markConversationAsRead === "function") {
          markConversationAsRead(String(chatConversationId), sentAt);
        }
      } catch (err) {
        console.warn("markConversationAsRead failed (non-blocking):", err);
      }

      try {
        await (markConversationReadAction as any)(String(chatConversationId));
      } catch {}

      scrollChatToBottom();
      return;
    }

    // fallo -> quitamos el optimista
    setChatMessages((prev: any[]) => (Array.isArray(prev) ? prev : []).filter((m: any) => m.id !== tempId));
    addNotification(res?.error ? `❌ ${res.error}` : "❌ No se pudo enviar");
  } catch (e) {
    console.error(e);
    setChatMessages((prev: any[]) => (Array.isArray(prev) ? prev : []).filter((m: any) => m.id !== tempId));
    addNotification("❌ Error enviando");
  }
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


// ✅ UPLOAD Cloudinary (chat adjuntos: imagen/pdf)
const chatFileInputRef = useRef<any>(null);
const [chatUploading, setChatUploading] = useState(false);
const [chatUploadProgress, setChatUploadProgress] = useState(0); // 0-100
const chatUploadTempIdRef = useRef<string | null>(null); // para “enganchar” el mensaje optimista

const uploadChatFileToCloudinary = (file: File) => {
  const cloudName = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dn11trogr").trim();
  const uploadPreset = (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "stratos_upload").trim();

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary: falta NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME o NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET");
  }

  // ✅ auto/upload (Cloudinary decide image/raw)
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

      // ✅ engancha progreso al mensaje temporal (si existe)
      const tempId = chatUploadTempIdRef.current; // ✅ FIX (antes: uploadTempIdRef)
      if (tempId) {
        setChatMessages((prev: any[]) =>
          (Array.isArray(prev) ? prev : []).map((m: any) =>
            String(m?.id) === String(tempId) ? { ...m, __progress: pct } : m
          )
        );
      }
    };

    xhr.onerror = () => reject(new Error("Upload fallido (network)"));

    xhr.onload = () => {
      try {
        const ok = xhr.status >= 200 && xhr.status < 300;
        const data = JSON.parse(xhr.responseText || "{}");

        if (!ok) {
          return reject(new Error(data?.error?.message || `Upload fallido (${xhr.status})`));
        }

        const delivered = String(data?.secure_url || "").trim();
        console.log("CLOUDINARY_DELIVERY_URL:", delivered);

        if (!delivered) return reject(new Error("Cloudinary no devolvió secure_url"));

        // si no es un delivery público, ni lo mandamos al chat
        if (!/^https?:\/\/res\.cloudinary\.com\//i.test(delivered)) {
          return reject(new Error("Cloudinary devolvió una URL no pública (no es res.cloudinary.com)"));
        }

        setChatUploadProgress(100);
        resolve(delivered);
      } catch (e: any) {
        reject(new Error(e?.message || "Upload: respuesta inválida"));
      }
    };

    xhr.send(fd);
  });
};

const handlePickChatFile = () => {
  try {
    chatFileInputRef.current?.click?.();
  } catch {}
};

const handleChatFileSelected = async (e: any) => {
  const file: File | null = e?.target?.files?.[0] || null;
  if (e?.target) e.target.value = "";
  if (!file) return;

  if (!chatConversationId) {
    addNotification("⚠️ Selecciona una conversación");
    return;
  }

  setChatUploading(true);
  setChatUploadProgress(0);

  // ✅ PREVIEW INMEDIATO (miniatura local) mientras sube
const localPreview =
  file.type?.startsWith("image/") ? URL.createObjectURL(file) : null;

const tempId = `tmp-upload-${Date.now()}`;
chatUploadTempIdRef.current = tempId;

setChatMessages((prev: any[]) => [
  ...(Array.isArray(prev) ? prev : []),
  {
    id: tempId,
    // si es imagen -> preview ya; si no -> texto "subiendo..."
    text: localPreview ? localPreview : `⏳ Subiendo: ${file.name}`,
    content: localPreview ? localPreview : `⏳ Subiendo: ${file.name}`,
    senderId: String(activeUserKey || "anon"),
    createdAt: new Date().toISOString(),
    __uploading: true,
    __filename: file.name,
    __progress: 0,
  },
]);

// ✅ auto-scroll para ver el preview al instante
scrollChatToBottom();

// ✅ fuerza a pintar ya el preview (por si React agrupa updates)
await Promise.resolve();

try {
  const url = await uploadChatFileToCloudinary(file);

  if (!url) {
    setChatMessages((prev: any[]) =>
      (Array.isArray(prev) ? prev : []).filter((m: any) => m?.id !== tempId)
    );
    addNotification("⚠️ No recibí URL del upload");
    return;
  }

  // ✅ sustituye el preview local por la URL real (sin recargar)
  setChatMessages((prev: any[]) =>
    (Array.isArray(prev) ? prev : []).map((m: any) =>
      m.id === tempId
        ? { ...m, text: url, content: url, __uploading: false, __progress: 100 }
        : m
    )
  );

  // ✅ al reemplazar por URL, baja otra vez (por si el layout cambió)
  scrollChatToBottom();

  // ✅ libera blob (evita leaks)
  if (localPreview) {
    try {
      URL.revokeObjectURL(localPreview);
    } catch {}
  }

  // enviar al servidor (firma simple)
  let res: any = null;
  try {
    res = await (sendMessageAction as any)(chatConversationId, url);
  } catch {}

  // fallback por si tu action usa objeto
  if (!res?.success) {
    try {
      res = await (sendMessageAction as any)({
        conversationId: chatConversationId,
        text: url,
      });
    } catch {}
  }
  if (!res?.success) {
    try {
      res = await (sendMessageAction as any)({
        conversationId: chatConversationId,
        content: url,
      });
    } catch {}
  }

  // si el server devuelve mensaje, reemplazamos el temp por el real
  if (res?.success && res?.data) {
    const serverMsg = res.data;
    const normalized = {
      ...serverMsg,
      text: serverMsg?.text ?? serverMsg?.content ?? url,
      content: serverMsg?.content ?? serverMsg?.text ?? url,
      __uploading: false,
      __progress: 100,
    };

    setChatMessages((prev: any[]) =>
      (Array.isArray(prev) ? prev : []).map((m: any) =>
        m.id === tempId ? normalized : m
      )
    );

    // ✅ scroll final al quedar el mensaje real
    scrollChatToBottom();

    const sentAt = normalized?.createdAt
      ? new Date(normalized.createdAt).getTime()
      : Date.now();
    markConversationAsRead(String(chatConversationId), sentAt);

    addNotification("✅ Archivo enviado");
    return;
  }

  addNotification(res?.error ? `⚠️ ${res.error}` : "⚠️ Subido pero no pude enviar");
} catch (err: any) {
  console.error(err);

  // limpia el mensaje temp
  setChatMessages((prev: any[]) =>
    (Array.isArray(prev) ? prev : []).filter((m: any) => m?.id !== tempId)
  );

  // libera blob si existía
  if (localPreview) {
    try {
      URL.revokeObjectURL(localPreview);
    } catch {}
  }

  addNotification(`❌ Upload: ${err?.message || "falló"}`);
}
};


const handleDayNight = () => {
  if (soundEnabled) playSynthSound("click");
  addNotification("Visión Nocturna Alternada");
};

const handleAICommand = (e: any) => {
  if (e) e.preventDefault();
  const rawInput = String(aiInput || "").trim();
  if (!rawInput) return;

  if (soundEnabled) playSynthSound("click");

 // --- 1) Detectar REF (o pegado con "Ref:" o incluso dentro de una URL) ---
const extractRefCode = (input: string) => {
  // 1) Normalizamos a MAYÚSCULA y quitamos "Ref:" si viene
  let s = String(input || "").toUpperCase().trim();
  s = s.replace(/^REF[^A-Z0-9]*?/i, "").trim();

  // 2) Buscamos SF + separadores raros + código (acepta espacios/saltos/guiones/":", etc.)
  //    Ejemplos que cubre:
  //    "SF-UWNDPX"
  //    "SF- \n CMKJQR9TS0002..."
  //    "https://.../propiedad/... SF- CMK...."
  const m = s.match(/SF[^A-Z0-9]*([A-Z0-9]{4,80})/);
  if (!m?.[1]) return null;

  let code = m[1].trim();

  // 3) Si el pegado mezcló cosas y dentro aparece "CMK...", nos quedamos desde ahí (Prisma ids)
  const cmkIndex = code.indexOf("CMK");
  if (cmkIndex > 0) code = code.slice(cmkIndex);

  // 4) Devolvemos formato final normalizado
  return `SF-${code}`;
};

  const refCode = extractRefCode(rawInput);

  // --- 2) Si es una REF, buscamos en LISTAS YA CARGADAS (Stock + Favoritos) ---
  if (refCode) {
   const pool = [
  // ✅ STOCK REAL de agencia (tu cartera)
  ...(Array.isArray(agencyFavs) ? agencyFavs : []),

  // ✅ favoritos/likes
  ...(Array.isArray(agencyLikes) ? agencyLikes : []),
  ...(Array.isArray(localFavs) ? localFavs : []),

  // ✅ (opcional) si tienes más listas globales, las añadiremos en el paso 2
].filter(Boolean);


    const found = pool.find(
      (p: any) => String(p?.refCode || "").toUpperCase() === refCode
    );

    if (found) {
      // A) Abrir DETAILS (tu listener ya lo maneja)
      window.dispatchEvent(new CustomEvent("open-details-signal", { detail: found }));

      // B) Vuelo cinematográfico al punto
      const coords =
        found?.coordinates ||
        (Number.isFinite(Number(found?.longitude)) && Number.isFinite(Number(found?.latitude))
          ? [Number(found.longitude), Number(found.latitude)]
          : null);

      if (coords) {
        window.dispatchEvent(
          new CustomEvent("map-fly-to", {
            detail: { center: coords, zoom: 19, pitch: 60, bearing: -20, duration: 2500 },
          })
        );
      } else {
        addNotification("⚠️ Encontrada, pero sin coordenadas GPS");
      }

      addNotification(`✅ Ref localizada: ${refCode}`);
      setAiInput("");
      return; // <- MUY IMPORTANTE: no seguimos con searchCity
    }

    addNotification(`⚠️ No encuentro ${refCode} en tu Stock/Favoritos`);
    setAiInput("");
    return;
  }

  // --- 3) Si NO es REF, comportamiento actual (búsqueda de ciudad / comando) ---
  setIsAiTyping(true);

  if (searchCity) {
    searchCity(rawInput);
    addNotification(`Rastreando: ${rawInput.toUpperCase()}`);
  } else {
    console.warn("⚠️ searchCity no conectado.");
  }

  setTimeout(() => {
    setAiResponse(`Objetivo confirmado: "${rawInput}". Iniciando aproximación...`);
    setIsAiTyping(false);
    setAiInput("");
  }, 1500);
};


  // Escucha de señales (Actualizado para detectar cambios de Modo)
  useEffect(() => {
  const handleOpenDetails = (e: any) => {
    const cleanProp = sanitizePropertyData(e.detail);
    if (cleanProp) {
     setSelectedProp(applyFreshOwnerBranding(cleanProp));
    setActivePanel("DETAILS");
      if (soundEnabled) playSynthSound("click");
    }
  };

  const handleToggleFavSignal = (e: any) => {
    handleToggleFavorite(e.detail);
  };

  // 🔥 GATILLO DE RECARGA
  const handleReload = () => {
    console.log("🔄 Recibida orden de recarga del servidor...");
    setDataVersion((v) => v + 1);
  };

 // ✅ NUEVO: Perfil agencia actualizado (logo/cover) -> refresca UI + Details + cache RAM
const handleAgencyProfileUpdated = (e: any) => {
  const u = e?.detail;
  if (!u) return;

  const uid = u?.id ? String(u.id) : null;

  // 0) ✅ Guardar SIEMPRE en cache RAM (para futuras aperturas de Details)
  if (uid) {
    const prev = userCacheRef.current[uid] || {};
    userCacheRef.current[uid] = {
      ...prev,
      ...u,
      // normalizamos branding
      companyLogo: u.companyLogo || u.avatar || prev.companyLogo || prev.avatar || null,
      avatar: u.companyLogo || u.avatar || prev.avatar || prev.companyLogo || null,
      coverImage: u.coverImage || u.cover || prev.coverImage || prev.cover || null,
      cover: u.coverImage || u.cover || prev.cover || prev.coverImage || null,
      role: u.role || prev.role || "AGENCIA",
    };
  }

  // 1) Refresca panel de perfil agencia (si lo estás usando)
  setAgencyProfileData((prev: any) => {
    if (!prev) return prev;
    if (uid && prev?.id && String(prev.id) !== uid) return prev;

    return {
      ...prev,
      ...u,
      avatar: u.companyLogo || u.avatar || prev.avatar,
      companyLogo: u.companyLogo || u.avatar || prev.companyLogo,
      coverImage: u.coverImage || u.cover || prev.coverImage,
    };
  });

  // 2) Refresca Details abierto si el dueño coincide
  setSelectedProp((prev: any) => {
    if (!prev) return prev;

    const ownerId =
      prev?.user?.id ||
      prev?.ownerSnapshot?.id ||
      prev?.userId ||
      prev?.ownerId ||
      null;

    // si el evento trae id y no coincide con el dueño actual, no tocamos
    if (uid && ownerId && String(ownerId) !== uid) return prev;

    return {
      ...prev,
      user: { ...(prev.user || {}), ...u },
      ownerSnapshot: { ...(prev.ownerSnapshot || {}), ...u },

      // compat por si algún panel mira root
      companyLogo: u.companyLogo || u.avatar || prev.companyLogo,
      coverImage: u.coverImage || u.cover || prev.coverImage,
      role: prev.role || u.role || prev?.user?.role || "AGENCIA",
    };
  });
};
// ✅ CHAT: abrir desde Details/AgencyDetails (evento global)
const handleOpenChatSignal = async (e: any) => {
  // helper: extrae ids robusto (string/number/object)
  const asId = (v: any) => {
    if (!v) return "";
    if (typeof v === "string" || typeof v === "number") return String(v);
    if (typeof v === "object")
      return String(v.id || v.userId || v.ownerId || v._id || v.uuid || "");
    return "";
  };

  try {
    const d = e?.detail || {};
// ✅ NUEVO: soporta abrir chat DIRECTO por conversationId (sin toUserId)
const passedConversationId =
  asId(d?.conversationId) ||
  asId(d?.convId) ||
  asId(d?.conversation?.id) ||
  "";

// ✅ NUEVO: campaña/propuesta (para abrir columna derecha)
const campaignId =
  asId(d?.campaignId) ||
  asId(d?.campaign?.id) ||
  "";

const openProposal = !!d?.openProposal || !!campaignId;

    // 🔥 IDs robustos
    const propertyId =
      asId(d?.propertyId) ||
      asId(d?.property?.id) ||
      asId(d?.property) ||
      asId(d?.id) ||
      "";

    const toUserId =
      asId(d?.toUserId) ||
      asId(d?.otherUserId) ||
      asId(d?.userId) ||
      asId(d?.user?.id) ||
      asId(d?.ownerId) ||
      asId(d?.owner?.id) ||
      asId(d?.ownerSnapshot?.id);

    // ✅ Si ya me pasan conversationId, abro directamente y no exijo toUserId
if (passedConversationId) {
  await openChatPanel();
  await openConversation(String(passedConversationId));

    if (openProposal && systemMode === "EXPLORER") {
    setActiveCampaignId(campaignId || null);
    setRightPanel("OWNER_PROPOSALS");
  }

  addNotification("✅ Canal de comunicación abierto");
  return;
}


    // 🚫 Evitar chat contigo mismo
    if (String(toUserId) === String(activeUserKey)) {
      addNotification("⚠️ No puedes abrir chat contigo mismo");
      return;
    }

    // 1) Abrimos el panel (carga threads)
    await openChatPanel();

    // 2) Creamos/obtenemos conversación (server) — soporta varias firmas
    let res: any = null;

    // A) firma (propertyId, toUserId) SOLO si hay propertyId
    if (propertyId) {
      try {
        res = await (getOrCreateConversationAction as any)(propertyId, toUserId);
      } catch {}
    }

    // B) firma ({ propertyId, toUserId })
    if (!res?.success) {
      try {
        res = await (getOrCreateConversationAction as any)({ propertyId: propertyId || null, toUserId });
      } catch {}
    }

    // C) firma ({ propertyId, otherUserId })
    if (!res?.success) {
      try {
        res = await (getOrCreateConversationAction as any)({
          propertyId: propertyId || null,
          otherUserId: toUserId,
        });
      } catch {}
    }

    // D) firma (toUserId, propertyId) (por si tu action lo tiene al revés)
    if (!res?.success && propertyId) {
      try {
        res = await (getOrCreateConversationAction as any)(toUserId, propertyId);
      } catch {}
    }

    console.log("getOrCreateConversationAction ->", res);

    if (res?.success === false) {
      addNotification(res?.error ? `⚠️ ${res.error}` : "⚠️ No puedo abrir conversación");
      return;
    }

    const thread = res?.data || null;

    const convId =
      asId(thread?.conversationId) ||
      asId(thread?.id) ||
      asId(res?.conversationId) ||
      asId(res?.id);

    if (!convId) {
      addNotification("⚠️ No puedo abrir conversación (sin id)");
      return;
    }

    // ✅ CLAVE: inyecta/actualiza el thread en la lista para que se vea el usuario a la PRIMERA
    try {
      if (thread) {
        setChatThreads((prev: any[]) => {
          const arr = Array.isArray(prev) ? prev : [];
          const filtered = arr.filter((t: any) => String(t?.id) !== String(convId));
          return [thread, ...filtered];
        });
      }
    } catch (err) {
      console.warn("setChatThreads merge failed (non-blocking):", err);
    }

    // 3) Abrimos esa conversación y cargamos mensajes
    await openConversation(String(convId));

    addNotification("✅ Canal de comunicación abierto");
  } catch (err) {
    console.error(err);
    addNotification("⚠️ Error abriendo chat");
  }
};


// ... dentro del useEffect ...

// 🔥🔥 ESTAS SON LAS QUE FALTABAN (POR ESO NO SE ABRÍA NADA) 🔥🔥
window.addEventListener("open-details-signal", handleOpenDetails);
window.addEventListener("toggle-fav-signal", handleToggleFavSignal);

// ESTAS YA LAS TENÍA
window.addEventListener("reload-profile-assets", handleReload);
window.addEventListener("agency-profile-updated", handleAgencyProfileUpdated);
// 📡 ANTENA DEL NUEVO RADAR LATERAL
window.addEventListener("stratos-property-selected", handleOpenDetails);
// ✅ CHAT
window.addEventListener("open-chat-signal", handleOpenChatSignal as any);
window.addEventListener("open-chat-with-user", handleOpenChatSignal as any); 
// 🔥 NUEVO: ESCUCHA PARA ABRIR MESA DE GUERRA (EMBAJADORES)
const handleOpenAmbassadors = () => {
    setRightPanel('AMBASSADORS'); // Abre el panel derecho
    if (soundEnabled) playSynthSound('click');
};
window.addEventListener("open-ambassadors-signal", handleOpenAmbassadors);

// --- FASE DE LIMPIEZA (RETURN) ---
return () => {
  window.removeEventListener("open-details-signal", handleOpenDetails);
  window.removeEventListener("toggle-fav-signal", handleToggleFavSignal);
  window.removeEventListener("reload-profile-assets", handleReload);
  window.removeEventListener("agency-profile-updated", handleAgencyProfileUpdated);

  // ✅ CHAT STANDARD
  window.removeEventListener("open-chat-signal", handleOpenChatSignal as any);
  
// 🔥🔥 LIMPIEZA NUEVO EVENTO 🔥🔥
  window.removeEventListener("open-chat-with-user", handleOpenChatSignal as any);

  // ✅ NUEVO: Limpieza de la señal de Embajadores
  window.removeEventListener("open-ambassadors-signal", handleOpenAmbassadors);
};

// ✅ deps mínimos para no re-enganchar listeners por cambios de listas
}, [soundEnabled, systemMode, identityVerified, activeUserKey]);
   // ✅ VUELO GLOBAL — escucha "map-fly-to" (Mi Stock, Vault, columnas, etc.)
useEffect(() => {
  const onFly = (e: any) => {
    try {
      const d = e?.detail || {};
      const center = d.center;
      if (!map?.current || !center) return;

      map.current.flyTo({
        center,
        zoom: typeof d.zoom === "number" ? d.zoom : 17,
        pitch: typeof d.pitch === "number" ? d.pitch : 55,
        bearing: typeof d.bearing === "number" ? d.bearing : -20,
        duration: typeof d.duration === "number" ? d.duration : 1200,
        essential: true,
      });
    } catch (err) {
      console.warn("map-fly-to failed:", err);
    }
  };

  window.addEventListener("map-fly-to", onFly as any);
  return () => window.removeEventListener("map-fly-to", onFly as any);
}, [map]);

  
  useEffect(() => {
      const handleEditMarket = (e: any) => {
          setMarketProp(e.detail);
          setActivePanel('MARKETPLACE');
      };
      window.addEventListener('edit-market-signal', handleEditMarket);
      return () => { window.removeEventListener('edit-market-signal', handleEditMarket); };
  }, []);

  // 🔥🔥🔥 NUEVO: ESCUCHA PARA ABRIR NANO CARD PREMIUM 🔥🔥🔥
  useEffect(() => {
      const handleOpenPremium = (e: any) => {
          const p = e.detail; // La propiedad que queremos mejorar
          if (p) {
              setPremiumProp(p);
              if (soundEnabled) playSynthSound('click'); // Sonido táctico
          }
      };
      window.addEventListener("open-premium-signal", handleOpenPremium);
      return () => window.removeEventListener("open-premium-signal", handleOpenPremium);
  }, [soundEnabled]);
 
  const handleStratosLaunch = (data: any) => {
      if(soundEnabled) playSynthSound('warp');
      const TYPE_TRANSLATOR: Record<string, string> = {
          'flat': 'Piso', 'penthouse': 'Ático', 'villa': 'Villa', 'house': 'Villa',
          'office': 'Oficina', 'industrial': 'Nave', 'land': 'Suelo', 'solar': 'Suelo'
      };
      const rawType = data.type; 
      const dbType = TYPE_TRANSLATOR[rawType] || rawType; 
      let derivedContext = 'VIVIENDA'; 
      if (['office', 'industrial', 'local', 'nave', 'oficina'].includes(rawType)) derivedContext = 'NEGOCIO';
      else if (['land', 'solar', 'suelo', 'terreno'].includes(rawType)) derivedContext = 'TERRENO';

      if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('apply-filter-signal', { 
              detail: { 
                  priceRange: { min: 0, max: data.priceMax },
                  surfaceRange: { min: 0, max: 10000 }, 
                  context: derivedContext, 
                  specs: data.specs,
                  specificType: dbType
              } 
          }));
      }

      if(data.location && searchCity) {
          searchCity(data.location);
          if (typeof addNotification === 'function') addNotification(`Viajando a: ${data.location}`);
      } else {
          map?.current?.flyTo({ center: [-3.6883, 40.4280], pitch: 60, zoom: 14, duration: 2000 });
      }
      setLandingComplete(true);
      setShowAdvancedConsole(false);
  };

 // --------------------------------------------------------
// 🔥 PROTOCOLO DE DESCONTAMINACIÓN (CLEAN SLATE)
// --------------------------------------------------------
useEffect(() => {
  // Cada vez que cambiamos de modo (GATEWAY <-> EXPLORER <-> AGENCY)
  // Cerramos todas las compuertas para evitar cruce de datos.

  console.log(`🔄 CAMBIO DE MODO DETECTADO: ${systemMode}`);

  // 1. Cerrar Paneles Laterales
  setRightPanel("NONE");

  // 2. Cerrar Paneles Centrales/Modales
  setActivePanel("NONE");

  // ✅ 2.1 Cerrar CHAT flotante (overlay) para que no sobreviva al cambio de modo
setChatOpen(false);

// ✅ Solo cerramos el PlanOverlay si vuelves a GATEWAY (no al entrar en EXPLORER/AGENCY)
if (systemMode === "GATEWAY") setPlanOpen(false);

  // 3. Limpiar Selecciones (Para que el mapa no brille por cosas viejas)
  setSelectedProp(null);
  setEditingProp(null);
  setMarketProp(null);

  // 4. Sonido de transición (Mecánico)
  if (systemMode !== "GATEWAY" && soundEnabled) {
    playSynthSound("click");
  }
}, [systemMode]);

 
useEffect(() => {
  const targetList = systemMode === "AGENCY" ? agencyLikes : localFavs;
  mirrorGlobalFavsForNanoCard(Array.isArray(targetList) ? targetList : []);
}, [systemMode, agencyLikes, localFavs]);

// 🔥 PROTOCOLO DE EXCLUSIÓN MUTUA (POLICÍA DE TRÁFICO DE PANELES)
useEffect(() => {
    // REGLA 1: Si abro un panel central (como PREMIUM_STORE o DETAILS)...
    if (activePanel !== 'NONE') {
        
        // 🔥 BLINDAJE FAVORITOS: Solo cerramos el panel derecho si NO estamos abriendo Detalles.
        // Así podemos mantener la lista de favoritos abierta mientras vemos la ficha del piso.
        if (rightPanel !== 'NONE' && activePanel !== 'DETAILS') {
            setRightPanel('NONE');
        }
        
        // 🔥 NUEVA REGLA DE EXCLUSIÓN: Si abro la IA, el Chat se cierra automáticamente
        if (activePanel === 'AI') {
            setChatOpen(false);
        }

        // ...y aparco el buscador (excepto si son los detalles)
        if (typeof window !== 'undefined' && activePanel !== 'DETAILS') {
            window.dispatchEvent(new CustomEvent('park-smart-sidebar', { detail: { park: true } }));
        }
    }
}, [activePanel]);

useEffect(() => {
    // REGLA 2: Si me llega un premiumProp (alguien pulsó el rayo en una casa)...
    if (premiumProp) {
        // ...cierro el panel derecho
        if (rightPanel !== 'NONE') setRightPanel('NONE');
        // ...y aparco el buscador
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('park-smart-sidebar', { detail: { park: true } }));
        }
    }
}, [premiumProp]);

 // --- PROTOCOLO DE SEGURIDAD (GATE) ---
  if (!gateUnlocked) {
    return (
      <div className="fixed inset-0 z-[99999] flex flex-col justify-between items-center p-8 sm:p-20 pointer-events-auto animate-fade-in select-none overflow-hidden bg-black">

        {/* 📽️ VÍDEO DE FONDO CINEMÁTICO (La Tierra girando) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-80"
        >
          {/* Busca el vídeo en la carpeta /public */}
          <source src="/background-video.mp4" type="video/mp4" />
        </video>

        {/* 1️⃣ PARTE SUPERIOR: LOGO Y BOTÓN */}
        <div className="w-full flex flex-col items-center gap-8 z-10 mt-10 animate-fade-in-up delay-100">
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold tracking-tight text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] cursor-default mt-4 md:mt-0">
            Stratosfere OS.
        </h1>
          <button
            onClick={() => {
              if (typeof playSynthSound === "function") playSynthSound("click");
              window.location.href = "/register";
            }}
            className="px-10 py-4 bg-[#0071e3]/90 hover:bg-[#0077ED] text-white font-bold rounded-full shadow-[0_0_20px_rgba(0,113,227,0.4)] hover:shadow-[0_0_40px_rgba(0,113,227,0.8)] transition-all transform hover:scale-105 backdrop-blur-md uppercase tracking-widest text-sm border border-white/10"
          >
            Crear Cuenta
          </button>
        </div>

        {/* 2️⃣ PARTE CENTRAL: EL MENSAJE DE BIENVENIDA (Estilo Apple Glassmorphism) */}
        <div className="flex flex-col items-center justify-center text-center z-10 mb-20 animate-fade-in-up delay-300">
          <div className="p-10 md:p-14 rounded-[2.5rem] bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl max-w-3xl transform transition-all hover:bg-black/30 hover:border-white/20">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg tracking-tight">
              Te damos la bienvenida.
            </h2>
            <p className="text-lg md:text-xl text-zinc-300 font-light drop-shadow-md leading-relaxed">
              Explora el mercado inmobiliario con la tecnología del mañana.<br/>Tu centro de mando orbital te espera.
            </p>
          </div>
        </div>

        {/* 3️⃣ PARTE INFERIOR: PIE DE PÁGINA LEGAL Y SUTIL */}
        <div className="z-10 mb-4 backdrop-blur-md py-3 px-8 rounded-full bg-black/30 border border-white/5 animate-fade-in-up delay-500">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-white/70 tracking-wide font-light">
            <a className="hover:text-white transition-colors" href="/pricing">Pricing</a>
            <a className="hover:text-white transition-colors" href="/terms">Términos</a>
            <a className="hover:text-white transition-colors" href="/privacy">Privacidad</a>
            <a className="hover:text-white transition-colors" href="/refunds">Reembolsos</a>
            <span className="text-white/30 ml-2 font-mono">© {new Date().getFullYear()} Stratosfere</span>
          </div>
        </div>

      </div>
    );
  }
// 🛡️ ESCUDO ANTI-INTRUSOS (CON MEMORIA DE REGRESO)
  const requireAuth = (callback: Function) => {
      if (!identityVerified || activeUserKey === 'anon') {
          if (typeof playSynthSound === 'function') playSynthSound('error'); 
          
          if (typeof addNotification === 'function') {
              addNotification("🔒 Acción restringida. Regístrate para explorar más.");
          }

          // 🧠 TÁCTICA DE RETENCIÓN: Guardamos el ID del piso en la mochila (localStorage)
          if (selectedProp?.id) {
              localStorage.setItem('stratos_return_intent', selectedProp.id);
          }
          
          setTimeout(() => {
              setGateUnlocked(false); 
          }, 1500);
          
          return; 
      }
      callback();
  };

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-end pb-8 animate-fade-in text-sans select-none">
       
     {systemMode === 'GATEWAY' && (
           // 🔥 SOLUCIÓN FINAL: 
           // 1. 'pointer-events-auto': Para que el ratón NO atraviese y no salga la mano del mapa.
           // 2. SIN 'bg-black': Para que no haya velo negro.
           <div className="fixed inset-0 z-[50000] pointer-events-auto">
               <DualGateway 
                   onSelectMode={(m:any) => { playSynthSound('boot'); setSystemMode(m); }} 
                   userRole={userRole} 
               />
           </div>
       )}

      {/* MODO ARQUITECTO (CON MEMORIA + VUELO CINEMÁTICO) */}
       {systemMode === 'ARCHITECT' && (
           <ArchitectHud 
               soundFunc={typeof playSynthSound !== 'undefined' ? playSynthSound : undefined} 
               initialData={editingProp} 
               onCloseMode={(success: boolean, payload: any) => { 
                   setEditingProp(null); 
                   
                   if (success && payload) {
                       // 1. Procesar datos frescos
                       const freshData = sanitizePropertyData(payload);
                       
                       // 2. Actualizar listas en caliente (Stock y Favoritos)
                       // Esto evita tener que recargar la página para ver los cambios
                       setLocalFavs(prev => prev.map(f => String(f.id) === String(freshData.id) ? { ...f, ...freshData } : f));
                       
                       setAgencyFavs(prev => {
                           const exists = prev.some(f => String(f.id) === String(freshData.id));
                           if (exists) {
                               return prev.map(f => String(f.id) === String(freshData.id) ? { ...f, ...freshData } : f);
                           } else {
                               return [freshData, ...prev]; // Si es nueva, arriba del todo
                           }
                       });

                       // 3. Emitir señales al sistema
                       if (typeof window !== 'undefined') {
                           window.dispatchEvent(new CustomEvent('update-property-signal', { detail: { id: freshData.id, updates: freshData } }));
                           if (!editingProp) { // Solo si es nueva
                               setTimeout(() => { window.dispatchEvent(new CustomEvent('add-property-signal', { detail: freshData })); }, 100);
                           }
                       }
                       
                       // 4. 🔥 VUELO CINEMÁTICO (ATERRIZAJE EN LA PROPIEDAD)
                       if (map?.current && freshData.coordinates) {
                           map.current.flyTo({
                               center: freshData.coordinates,
                               zoom: 19,
                               pitch: 60,
                               bearing: -20,
                               duration: 3000, // 3 segundos de viaje suave
                               essential: true
                           });
                       }

                       setLandingComplete(true); 
                       if (typeof setExplorerIntroDone === 'function') setExplorerIntroDone(true); 
                   }
                   
                   // 5. RETORNO SEGURO A LA BASE (Agencia o Explorer)
                   setSystemMode(previousMode || 'EXPLORER');
               }} 
           />
       )}
       {/* INTERFAZ COMPARTIDA (HUD) - SE VE EN EXPLORER Y AGENCIA */}
       {(systemMode === 'EXPLORER' || systemMode === 'AGENCY') && (
           <>
               {/* 1. LOGO */}
               <div className="absolute top-8 left-8 pointer-events-auto animate-fade-in-up z-[50]">
                    <h1 className="text-6xl font-extrabold tracking-tighter text-black leading-none cursor-default">Stratosfere OS.</h1>
                    {systemMode === 'AGENCY' && <div className="mt-2 inline-block bg-black text-white text-[10px] font-bold px-2 py-1 tracking-widest uppercase rounded shadow-lg">Agency Command</div>}
               </div>
               
               {/* 2. PANEL SISTEMA */}
<div className="absolute top-32 left-4 right-4 md:top-8 md:right-8 md:left-auto pointer-events-auto flex flex-col gap-3 items-center md:items-end w-auto md:w-[280px] animate-fade-in-up delay-100 z-[50]">                    <div className="glass-panel p-5 rounded-[1.5rem] w-full shadow-2xl bg-[#050505]/90 border border-white/10 hover:border-blue-500/30 transition-all">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5 text-white">
                            <span className="text-[10px] font-extrabold tracking-tighter flex items-center gap-2">SYSTEM</span>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_blue]"></div><span className="text-[9px] font-mono text-blue-400">ONLINE</span></div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={()=>{if(typeof playSynthSound==='function') playSynthSound('click'); setLang(lang==='ES'?'EN':'ES')}}><span className="tracking-widest">IDIOMA</span> <span className="text-white font-mono">{lang}</span></div>
                            <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={()=>{if(typeof playSynthSound==='function') playSynthSound('click'); toggleSound();}}><span className="tracking-widest">SONIDO</span> <span className={soundEnabled ? "text-emerald-400" : "text-zinc-500"}>{soundEnabled ? 'ON' : 'MUTED'}</span></div>
                            <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={handleDayNight}><span className="tracking-widest">VISIÓN</span> <div className="flex items-center gap-1"><Sun size={10}/> DÍA/NOCHE</div></div>
                        </div>
                        <div className="mt-4 pt-2 border-t border-white/5 space-y-1">
                            {notifications.map((n,i)=>(<div key={i} className="bg-blue-900/20 border-l-2 border-blue-500 p-2 rounded flex items-center gap-2 animate-slide-in-right"><Bell size={10} className="text-blue-400"/><span className="text-[9px] text-blue-100">{n.title}</span></div>))}
                        </div>
                    </div>
               </div>

               {/* 3. CONTROLES 3D */}
               <div className="absolute top-1/2 -translate-y-1/2 right-8 pointer-events-auto flex flex-col gap-2 animate-fade-in-right z-[50]">
                   <button onClick={() => {if(typeof playSynthSound==='function') playSynthSound('click'); map?.current?.flyTo({pitch: 0});}} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black transition-all shadow-xl"><Square size={16}/></button>
                   <button onClick={() => {if(typeof playSynthSound==='function') playSynthSound('click'); map?.current?.flyTo({pitch: 60});}} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black transition-all shadow-xl"><Box size={16}/></button>
               </div>

               {/* 4. WIDGET GPS/CASA */}
               <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2 group animate-fade-in-down z-[100]">
                    <button 
                        className={`p-4 rounded-full backdrop-blur-xl border transition-all duration-500 shadow-2xl relative ${homeBase ? 'bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.4)] scale-105' : 'bg-black/40 text-white border-white/10 hover:bg-white/10 hover:scale-105'}`}
                        onClick={() => {
                            if(soundEnabled) playSynthSound('click');
                            if (homeBase) {
                                addNotification("Volviendo a Ubicación Personal");
                                map?.current?.flyTo({ center: homeBase.center, zoom: homeBase.zoom, pitch: homeBase.pitch, bearing: -20, duration: 2500, essential: true });
                            } else {
                                if ("geolocation" in navigator) {
                                    addNotification("Configurando Ubicación...");
                                    navigator.geolocation.getCurrentPosition(
                                        (position) => {
                                            const { latitude, longitude } = position.coords;
                                            map?.current?.flyTo({ center: [longitude, latitude], zoom: 16.5, pitch: 60, duration: 3000 });
                                            const newData = { center: [longitude, latitude], zoom: 16.5, pitch: 60 };
                                            localStorage.setItem('stratos_home_base', JSON.stringify(newData));
                                            setHomeBase(newData);
                                            addNotification("Ubicación guardada con Candado");
                                        },
                                        () => addNotification("Ubicación no disponible")
                                    );
                                }
                            }
                        }}
                    >
                        {homeBase ? <Home className="w-5 h-5" strokeWidth={2.5} /> : <Crosshair className="w-5 h-5 opacity-80" />}
                        {homeBase && <div className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white rounded-full flex items-center justify-center border border-white shadow-sm animate-bounce-small"><Lock size={8} /></div>}
                    </button>
                    {homeBase && (
                        <button
                            onClick={() => {
                                if(soundEnabled) playSynthSound('click');
                                if (map?.current) {
                                    const center = map.current.getCenter();
                                    const zoom = map.current.getZoom();
                                    const pitch = map.current.getPitch();
                                    const newData = { center: [center.lng, center.lat], zoom, pitch };
                                    localStorage.setItem('stratos_home_base', JSON.stringify(newData));
                                    setHomeBase(newData);
                                    addNotification("Nueva ubicación fijada aquí");
                                }
                            }}
                            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-lg opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 duration-300 cursor-pointer"
                        >
                            <Edit2 size={14} />
                        </button>
                    )}
               </div>
           </>
       )}

   {/* MODO AGENCIA (BARRA OMNI TÁCTICA CON CHAT E IA) */}
       {systemMode === 'AGENCY' && (
           <>
               <div className="absolute bottom-10 z-[10000] w-full px-6 pointer-events-none flex justify-center items-center">
                   <div className="pointer-events-auto w-full max-w-3xl animate-fade-in-up delay-300">
<div className="relative omni-obsidian-bar rounded-[32px] p-2 px-3 md:px-6 flex items-center gap-3 md:gap-4 w-full overflow-x-auto scrollbar-hide snap-x">                           {/* IZQUIERDA: SALIR */}
                           <div className="flex items-center gap-1">
                                <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setSystemMode('GATEWAY'); }} className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"><LayoutGrid size={18}/></button>
                           </div>

                           <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

                           {/* CENTRO: BUSCADOR */}
                           <div className="flex-grow flex items-center gap-4 bg-white/[0.05] px-5 py-3 rounded-full border border-white/5 focus-within:border-emerald-500/50 focus-within:bg-emerald-500/5 transition-all group">
                               <Search size={16} className="text-white/40 group-focus-within:text-white transition-colors"/>
                               <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); handleAICommand(e); } if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); (e.target as HTMLInputElement).blur(); } }} className="bg-transparent text-white w-full outline-none text-xs font-bold tracking-widest uppercase placeholder-white/20 cursor-text" placeholder="COMANDO DE AGENCIA..." />
                               <Mic size={16} className="text-white/30"/>
                           </div>

                           <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

                 {/* DERECHA: ARSENAL TÁCTICO DE AGENCIA (DOBLE CANAL) */}
<div className="flex items-center gap-1">
  {/* 1. RADAR */}
  <button
    onClick={() => {
      if (typeof playSynthSound === "function") playSynthSound("ping");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-radar-signal"));
      }
    }}
    className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
  >
    <Crosshair size={18} />
  </button>

  {/* 2. MERCADO GLOBAL (gated por plan) */}
  <button
    onClick={() => {
      if (typeof playSynthSound === "function") playSynthSound("click");

      // ✅ si no hay plan activo -> abre overlay y NO abre el panel
      if (!isActive) {
        setPlanOpen(true);
        addNotification("⚡ Activa un plan para desbloquear Mercado");
        return;
      }

      setActivePanel(activePanel === "AGENCY_MARKET" ? "NONE" : "AGENCY_MARKET");
    }}
    className={`p-3 rounded-full hover:bg-white/10 transition-all ${
      activePanel === "AGENCY_MARKET"
        ? "text-white bg-white/10"
        : "text-white/50 hover:text-white"
    }`}
  >
    <Shield size={18} />
  </button>

  {/* 3. COMUNICACIONES */}
  <button
    onClick={() => {
      if (typeof playSynthSound === "function") playSynthSound("click");
      if (chatOpen) setChatOpen(false);
      else openChatPanel();
    }}
    className={`p-3 rounded-full hover:bg-white/10 transition-all ${
      chatOpen ? "text-blue-400 bg-blue-500/10" : "text-white/50 hover:text-white"
    }`}
  >
    <span className="relative inline-flex">
      <MessageCircle size={18} />
      {unreadTotal > 0 && (
        <>
          <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-black text-[10px] font-black flex items-center justify-center">
            {unreadTotal > 9 ? "9+" : unreadTotal}
          </span>
        </>
      )}
    </span>
  </button>

                               {/* 4. IA */}
                               <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setActivePanel(activePanel === 'AI' ? 'NONE' : 'AI'); }} className={`p-3 rounded-full transition-all relative group ${activePanel==='AI' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-blue-500/10 text-white/50 hover:text-white'}`}><Sparkles size={18}/></button>
                               
                               {/* 5. 🏢 MI STOCK (ABRE PORTAFOLIO DE VENTAS) */}
                               <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setRightPanel(rightPanel === 'AGENCY_PORTFOLIO' ? 'NONE' : 'AGENCY_PORTFOLIO'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${rightPanel === 'AGENCY_PORTFOLIO' ? 'text-emerald-400 bg-white/10' : 'text-white/50 hover:text-white'}`}><Building2 size={18}/></button>

                               {/* 6. ❤️ MIS FAVORITOS (ABRE BÓVEDA DE REFERENCIAS) */}
                               <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); toggleRightPanel('VAULT'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${rightPanel === 'VAULT' ? 'text-red-500 bg-white/10' : 'text-white/50 hover:text-white'}`}><Heart size={18}/></button>
                               
                               {/* 7. PERFIL */}
                               <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); toggleRightPanel('AGENCY_PROFILE'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${rightPanel === 'AGENCY_PROFILE' ? 'text-white bg-white/10' : 'text-white/50 hover:text-white'}`}><Briefcase size={18}/></button>
                           </div>
                       </div>
                   </div>
               </div>
               
               {/* 🗑️ AQUÍ HE ELIMINADO LOS PANELES DUPLICADOS 🗑️ */}
               {/* Ahora el sistema usará obligatoriamente los que están definidos al final del archivo, que sí funcionan bien. */}
           </>
       )}
   {/* MODO EXPLORADOR (BARRA USUARIO BLINDADA) */}
       {systemMode === 'EXPLORER' && (
           <>
               {/* 🚀 NUEVO CEREBRO: COLUMNA DERECHA INTELIGENTE (Ahora sí obedece a la orden de abrir/cerrar) */}
               {showAdvancedConsole && (
                   <SmartSidebar onClose={() => setShowAdvancedConsole(false)} />
               )}
               
               <div className="absolute bottom-10 z-[10000] w-full px-6 pointer-events-none flex justify-center items-center">
                  <div className="pointer-events-auto w-full max-w-3xl animate-fade-in-up delay-300">
                      <div className="relative omni-obsidian-bar rounded-[32px] p-2 px-3 md:px-6 flex items-center gap-3 md:gap-4 w-full overflow-x-auto scrollbar-hide snap-x">                          
                          
                        {/* BOTÓN BUSCADOR INTELIGENTE (CON ESCUDO) */}
                         <button 
                            onClick={() => requireAuth(() => {
        if (typeof playSynthSound === 'function') playSynthSound('click');
        
                                // Si hay algún panel derecho abierto, lo matamos
        if (rightPanel !== 'NONE') {
            setRightPanel('NONE');
                                    setShowAdvancedConsole(true);
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('park-smart-sidebar', { detail: { park: false } }));
            }
        } else {
            setShowAdvancedConsole(!showAdvancedConsole);
        }
                            })}
                            className={`p-3 rounded-full transition-all relative group ${
                                showAdvancedConsole 
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                                    : 'text-white/50 hover:text-white hover:bg-white/10 border border-transparent'
                            }`}
                            title="Buscador Inteligente"
                        >
                            {/* 🔍 COMBO TÁCTICO: Lupa + Casa */}
                            <div className="relative flex items-center justify-center">
                                <Search size={18} strokeWidth={2.5} />
                                <div className={`absolute -bottom-1 -right-1 rounded-full p-[1px] ${showAdvancedConsole ? 'bg-[#050505]' : 'bg-transparent group-hover:bg-[#050505]'}`}>
                                    <Home size={10} strokeWidth={3} className={showAdvancedConsole ? "text-blue-300" : "text-white/70"} />
                                </div>
                            </div>
</button>
                        
                        {/* BOTONES IZQUIERDA (Menu + Ajustes) -> Libre de acceso para que puedan volver al inicio */}
                        <div className="flex items-center gap-1">
                            <button onClick={() => { playSynthSound('click'); setSystemMode('GATEWAY'); }} className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"><LayoutGrid size={18}/></button>
                        </div>
                        
                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                        
                        {/* BARRA BUSCADORA CENTRAL (CON ESCUDO AL PULSAR ENTER) */}
                        <div className="flex-grow flex items-center gap-4 bg-white/[0.05] px-5 py-3 rounded-full border border-white/5 focus-within:border-blue-500/50 focus-within:bg-blue-500/5 transition-all group">
                          <Search size={16} className="text-white/40 group-focus-within:text-white transition-colors"/>
                          <input 
                              value={aiInput} 
                              onChange={(e) => setAiInput(e.target.value)} 
                              onKeyDown={(e) => { 
                                  if (e.key === "Enter") { 
                                      e.preventDefault(); 
                                      e.stopPropagation(); 
                                      requireAuth(() => handleAICommand(e)); 
                                  } 
                                  if (e.key === "Escape") { 
                                      e.preventDefault(); 
                                      e.stopPropagation(); 
                                      (e.target as HTMLInputElement).blur(); 
                                  } 
                              }} 
                              className="bg-transparent text-white w-full outline-none text-xs font-bold tracking-widest uppercase placeholder-white/20 cursor-text" 
                              placeholder="LOCALIZACIÓN..." 
                          />
                          <Mic size={16} className="text-white/30"/>
                        </div>
                        
                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                        
                        {/* ARSENAL DERECHA (Aquí están los nuevos botones, TODOS BLINDADOS) */}
                        <div className="flex items-center gap-1">
                            
                            {/* 1. MERCADO INMOBILIARIO */}
                            <button
                              onClick={() => requireAuth(() => {
                                playSynthSound('click');
                                setActivePanel(activePanel === 'MARKETPLACE' ? 'NONE' : 'MARKETPLACE');
                              })}
                              className={`p-3 rounded-full hover:bg-white/10 transition-all ${
                                activePanel === 'MARKETPLACE' ? 'text-emerald-400 bg-white/10' : 'text-white/50 hover:text-white'
                              }`}
                              title="Mercado"
                            >
                              <Store size={18} />
                            </button>

                            {/* 2. 🔥 AGENCIAS (NUEVO) */}
                            <button
                                onClick={() => requireAuth(() => {
                                    playSynthSound('click');
                                    setActivePanel(activePanel === 'AGENCIES_LIST' ? 'NONE' : 'AGENCIES_LIST');
                                })}
                                className={`p-3 rounded-full hover:bg-white/10 transition-all ${
                                    activePanel === 'AGENCIES_LIST' ? 'text-indigo-400 bg-white/10' : 'text-white/50 hover:text-white'
                                }`}
                                title="Directorio Agencias"
                            >
                                <Briefcase size={18} />
                            </button>

                            {/* 3. 👑 PREMIUM NANO STORE (NUEVO) */}
                            <button
                                onClick={() => requireAuth(() => {
                                    playSynthSound('click');
                                    setActivePanel(activePanel === 'PREMIUM_STORE' ? 'NONE' : 'PREMIUM_STORE');
                                })}
                                className={`p-3 rounded-full hover:bg-white/10 transition-all ${
                                    activePanel === 'PREMIUM_STORE' ? 'text-orange-400 bg-white/10' : 'text-white/50 hover:text-white'
                                }`}
                                title="Premium Store"
                            >
                                <Crown size={18} />
                            </button>

                            {/* 4. CHAT */}
                            <button
                              onClick={() => requireAuth(() => {
                                playSynthSound('click');
                               if (chatOpen) {
                                  setChatOpen(false);
                                } else {
                                  openChatPanel();
                                }
                              })}
                             className={`p-3 rounded-full hover:bg-white/10 transition-all ${
                              chatOpen ? 'text-blue-400 bg-blue-500/10' : 'text-white/50 hover:text-white'
                            }`}
                            >
                              <span className="relative inline-flex">
                                <MessageCircle size={18} />
                                {unreadTotal > 0 && (
                                  <>
                                    <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-black text-[10px] font-black flex items-center justify-center">
                                      {unreadTotal > 9 ? "9+" : unreadTotal}
                                    </span>
                                  </>
                                )}
                              </span>
                            </button>

                            {/* 5. IA */}
                            <button
                              onClick={() => requireAuth(() => {
                                playSynthSound('click');
                                setActivePanel(activePanel === 'AI' ? 'NONE' : 'AI');
                              })}
                              className={`p-3 rounded-full transition-all relative group ${
                                activePanel === 'AI' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-blue-500/10 text-blue-400'
                              }`}
                            >
                              <Sparkles size={18} className="relative z-10" />
                            </button>

                            {/* 6. FAVORITOS (VAULT) */}
                            <button
                              onClick={() => requireAuth(() => {
                                playSynthSound('click');
                                toggleRightPanel('VAULT');
                              })}
                              className={`p-3 rounded-full hover:bg-white/10 transition-all ${
                                rightPanel === 'VAULT' ? 'text-red-500' : 'text-white/50 hover:text-white'
                              }`}
                            >
                              <Heart size={18} />
                            </button>

                            {/* 7. PERFIL */}
                            <button
                              onClick={() => requireAuth(() => {
                                playSynthSound('click');
                                toggleRightPanel('PROFILE');
                              })}
                              className={`p-3 rounded-full hover:bg-white/10 transition-all ${
                                rightPanel === 'PROFILE' ? 'text-white' : 'text-white/50 hover:text-white'
                              }`}
                            >
                              <User size={18} />
                            </button>
                        </div>
                      </div>
                  </div>
               </div>
           </>
       )}
{/* =================================================================
           CAPA ESTRATOSFERA (Z-80) - TODOS LOS PANELES (USUARIO Y AGENCIA)
           Esta capa vive POR ENCIMA del Radar (Z-60) y del Mapa.
       ================================================================= */}
       <div className="absolute inset-0 z-[80] pointer-events-none"> {/* 🔥 CAMBIO: absolute inset-0 */}
          
           {/* 1. PERFIL DE USUARIO */}
           <ProfilePanel 
               rightPanel={rightPanel} 
               toggleRightPanel={toggleRightPanel} 
               toggleMainPanel={toggleMainPanel} 
               onEdit={handleEditAsset} 
               selectedReqs={selectedReqs} 
               soundEnabled={soundEnabled} 
               playSynthSound={playSynthSound} 
           />
           
           {/* 2. MERCADO DE USUARIO (Izquierda) */}
           {activePanel === 'MARKETPLACE' && (
                <div className="absolute inset-y-0 left-0 w-[420px] shadow-2xl animate-slide-in-left bg-white pointer-events-auto">
                    <MarketPanel onClose={() => setActivePanel('NONE')} activeProperty={marketProp} />
                </div>
           )}
           
           {/* 3. BÓVEDA / FAVORITOS (Derecha - Solo en modo Explorer) */}
           {rightPanel === 'VAULT' && (
               <VaultPanel 
                   rightPanel={rightPanel} 
                   toggleRightPanel={(p: any) => setRightPanel('NONE')} 
                   favorites={uiFavs}
                   onToggleFavorite={handleToggleFavorite} 
                   map={map} 
                   soundEnabled={soundEnabled} 
                   playSynthSound={playSynthSound} 
               />
           )}
     {systemMode === "EXPLORER" && rightPanel === "OWNER_PROPOSALS" && (
<OwnerProposalsPanel
  rightPanel={rightPanel}
  toggleRightPanel={toggleRightPanel}
  proposals={ownerProposals}
  activeCampaignId={activeCampaignId}
  setActiveCampaignId={setActiveCampaignId}
  setOwnerProposalsManualList={setOwnerProposalsManualList}
  ownerProposalsManualList={ownerProposalsManualList}
  soundEnabled={soundEnabled}
  playSynthSound={playSynthSound}
/>

)}




           {/* 4. PANELES DE AGENCIA (CONECTADOS AL BORRADO REAL) */}
           {/* Aquí estaba el duplicado. Esta es la versión ÚNICA y CORRECTA. */}
           <AgencyProfilePanel isOpen={rightPanel === 'AGENCY_PROFILE'} onClose={() => toggleRightPanel('NONE')} />
           <AgencyMarketPanel isOpen={activePanel === 'AGENCY_MARKET'} onClose={() => setActivePanel('NONE')} />
           
       {/* 4. PORTFOLIO DE AGENCIA (STOCK) */}
           <AgencyPortfolioPanel 
               isOpen={rightPanel === 'AGENCY_PORTFOLIO'} 
               onClose={() => setRightPanel('NONE')} 
               properties={agencyFavs}
               onCreateNew={() => handleEditAsset(null)} 
               onEditProperty={(p:any) => handleEditAsset(p)}
               
               // Funciones de gestión (Borrar y Favoritos)
               onDelete={(p:any) => handleDeleteAgencyAsset(p)}
               onToggleFavorite={(p:any) => handleToggleFavorite(p)}

               // Vuelo Cinemático al seleccionar propiedad
               onSelect={(p:any) => {
                   const coords = p.coordinates || (p.latitude && p.longitude ? [p.longitude, p.latitude] : null);
                   if (coords) {
                       map?.current?.flyTo({ 
                           center: coords, 
                           zoom: 19, 
                           pitch: 60, 
                           bearing: -20, 
                           duration: 3000, 
                           essential: true 
                       });
                       if(soundEnabled) playSynthSound('warp');
                       addNotification(`📍 Localizando: ${p.title || 'Propiedad'}`);
                   } else {
                       addNotification("⚠️ Propiedad sin coordenadas GPS");
                   }
               }}
           />

           {/* 5. 🎖️ MESA DE GUERRA (EMBAJADORES) - Ancho Especial 700px */}
           {rightPanel === 'AMBASSADORS' && (
               <div className="absolute inset-y-0 right-0 w-[700px] shadow-2xl animate-slide-in-right bg-white pointer-events-auto z-[90] border-l border-slate-200">
                   <AgencyAmbassadorPanel onClose={() => setRightPanel('NONE')} />
               </div>
           )}
           
       {/* 5. INSPECTOR Y DETALLES (DUAL: MODO AGENCIA vs USUARIO) */}
           <HoloInspector prop={selectedProp} isOpen={activePanel === 'INSPECTOR'} onClose={() => setActivePanel('DETAILS')} soundEnabled={soundEnabled} playSynthSound={playSynthSound} />
           
  {/* =========================================================
                EL PORTERO CON CHIVATOS (DEBUG) - SAAS MULTIUSUARIO V2
                ========================================================= */}
           {activePanel === 'DETAILS' && (
               (() => {
                   const owner = selectedProp?.user || selectedProp?.ownerSnapshot || null;

                   // 1. ANÁLISIS DEL DUEÑO (LA CASA Y SU GESTIÓN)
                   const ownerRole = String(owner?.role || selectedProp?.role || "").toUpperCase();
                   
                   // 🔥 MAGIA TÁCTICA: ¿Tiene la casa una campaña B2B o Agencia aceptada?
                   const hasActiveCampaign = !!selectedProp?.activeCampaign && selectedProp?.activeCampaign?.status === 'ACCEPTED';
                   const hasB2B = !!selectedProp?.b2b;

                 // Es Agencia SI el rol es Agencia, O SI ha sido cedida, O SI TIENE UN EVENTO
                   const isOwnerAgency =
                      ownerRole === "AGENCIA" ||
                      ownerRole === "AGENCY" ||
                      !!owner?.companyName ||
                      !!selectedProp?.companyName ||
                      hasActiveCampaign || 
                      hasB2B ||
                      !!selectedProp?.openHouse ||       // 🔥 REGLA CEO: Si hay evento, abre panel PRO
                      !!selectedProp?.open_house_data;   // 🔥 REGLA CEO: Si hay evento, abre panel PRO

                   // 2. ANÁLISIS DEL VISITANTE (USTED)
                   const roleVisitante = String(agencyProfileData?.role || "").toUpperCase();
                   
                   // Lógica de ser agencia (Solo para los chivatos, YA NO fuerza la apertura del panel)
                   const soyAgencia = 
                        systemMode === 'AGENCY' || 
                        roleVisitante === 'AGENCIA' || 
                        roleVisitante === 'AGENCY' ||
                        !!agencyProfileData?.cif ||
                        !!agencyProfileData?.licenseNumber;

                   // 🕵️ CHIVATO: ¿QUÉ ESTÁ VIENDO EL SISTEMA?
                   console.log("🕵️ PORTERO DICE (V2 MULTIUSUARIO):");
                   console.log("   - Casa ID:", selectedProp?.id);
                   console.log("   - Dueño Casa (Original):", ownerRole);
                   console.log("   - ¿Casa Gestionada por Agencia (Campaña/B2B)?:", hasActiveCampaign || hasB2B);
                   console.log("   - ¿Se mostrará como Agencia?:", isOwnerAgency);
                   console.log("   - Visitante (Usted):", roleVisitante);
                   console.log("   - ¿Usted es Agencia?:", soyAgencia);

                   // 3. DECISIÓN FINAL (REGLAS UNIVERSALES SAAS)
                   // LA CASA MANDA. Si la casa la lleva una Agencia, abre PRO. Si no, CIVIL.
                   const usarPanelPro = isOwnerAgency;
                   
                   console.log("   - 🚪 PUERTA ELEGIDA:", usarPanelPro ? "PANEL PRO (Agencia)" : "PANEL CIVIL (Particular)");

                   // 4. ABRIMOS LA PUERTA
                   return usarPanelPro ? (
                        <AgencyDetailsPanel 
                            key={`agency-panel-${selectedProp?.id}`} 
                            selectedProp={selectedProp} 
                            onClose={() => setActivePanel('NONE')} 
                            onToggleFavorite={handleToggleFavorite} 
                            favorites={uiFavs}
                            onOpenInspector={() => setActivePanel('INSPECTOR')}
                            agencyData={owner} 
                            currentUser={agencyProfileData} 
                        />
                    ) : (
                       <DetailsPanel 
                           key={`civil-panel-${selectedProp?.id}`}
                           selectedProp={selectedProp} 
                           onClose={() => setActivePanel('NONE')} 
                           onToggleFavorite={handleToggleFavorite} 
                           favorites={uiFavs}
                           soundEnabled={soundEnabled} 
                           playSynthSound={playSynthSound} 
                           onOpenInspector={() => setActivePanel('INSPECTOR')} 
                           currentUser={agencyProfileData}
                       />
                   );
               })()
           )}
       </div>
    
       {/* =================================================================
           CAPA ORBITAL (Z-20000) - CHAT E INTELIGENCIA ARTIFICIAL
           Siempre flotando sobre todo lo demás.
       ================================================================= */}
       
{/* CHAT TÁCTICO (CONECTADO) */}
{chatOpen && (
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
      addNotification("⛔ Usuario bloqueado");
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
)}

<PlanOverlay
  enabled={systemMode === "AGENCY"}
  pricingHref="/pricing"
  landingHref="/"
/>
{/* 👇👇👇 PEGUE EL PASO 3 AQUÍ (PANEL PREMIUM) 👇👇👇 */}
{premiumProp && (
   <PremiumUpgradePanel 
       property={premiumProp}
       onClose={() => setPremiumProp(null)}
   />
)}
{/* 👆👆👆 FIN DEL PEGADO 👆👆👆 */}
{/* ======================================================== */}
           {/* 🔥 ZONA DE DESPLIEGUE: PANELES NUEVOS (AGENCIA Y PREMIUM) */}
           {/* ======================================================== */}

           {/* 1. DIRECTORIO DE AGENCIAS (Modo Búsqueda) */}
           {activePanel === 'AGENCIES_LIST' && (
                <AgencyMarketPanel 
                    onClose={() => setActivePanel('NONE')} 
                    // Le pasamos la ubicación del usuario (homeBase) para que busque agencias cercanas
                    activeProperty={homeBase || { city: "España" }} 
                />
           )}

           {/* 2. TIENDA PREMIUM (Nano Card & Fuego) */}
           {/* Se abre si pulsas el botón de la barra (PREMIUM_STORE) O si pulsas el rayo en una casa (premiumProp) */}
           {(activePanel === 'PREMIUM_STORE' || premiumProp) && (
               <PremiumUpgradePanel 
                   // Si venimos del botón global, usamos un título genérico
                   property={premiumProp || { title: "Suscripción Nano Card", img: null }} 
                   onClose={() => {
                       setPremiumProp(null); // Limpiamos la propiedad seleccionada
                       if (activePanel === 'PREMIUM_STORE') setActivePanel('NONE'); // Cerramos el panel
                   }}
               />
           )}

       {/* IA / OMNI INTELLIGENCE */}
       {activePanel === 'AI' && (
           <div className="fixed bottom-40 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-[20000] pointer-events-auto">
              <div className="animate-fade-in rounded-[2.5rem] p-8 bg-[#050505]/95 backdrop-blur-2xl border border-blue-500/30 shadow-[0_0_100px_rgba(59,130,246,0.2)]">
                  <div className="flex justify-between items-center mb-8 text-white">
                      <span className="text-xs font-bold tracking-[0.3em] flex items-center gap-2">
                          <Sparkles size={14} className="text-blue-500 animate-spin-slow"/> STRATOS AI
                      </span>
                      <button onClick={() => setActivePanel('NONE')} className="hover:text-red-500 transition-colors p-2"><X size={18}/></button>
                  </div>
                  <div className="h-48 flex flex-col items-center justify-center text-center gap-4 relative">
                      <div className="w-16 h-16 rounded-full border border-blue-500/30 flex items-center justify-center animate-pulse">
                          <div className="w-8 h-8 bg-blue-500 rounded-full blur-md"></div>
                      </div>
                      <p className="text-white/50 text-xs tracking-widest font-mono">
                          {aiResponse ? aiResponse : "ESCUCHANDO FRECUENCIA..."}
                      </p>
                  </div>
              </div>
          </div>
       )}
    </div>
  );
}

