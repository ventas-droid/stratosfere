// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'next/navigation';

// 1. IMPORTACIÓN UNIFICADA DE ICONOS (CON BUILDING2 AÑADIDO)
import { 
  LayoutGrid, Search, Mic, Bell, MessageCircle, Heart, User, Sparkles, Activity, X, Send, 
  Square, Box, Crosshair, Sun, Moon,  Phone, Maximize2, Bed, Bath, TrendingUp, CheckCircle2,
  Camera, Zap, Globe, Newspaper, Share2, Shield, Store, SlidersHorizontal, StickyNote, 
  Briefcase, Home, Map as MapIcon, Lock, Unlock, Edit2, Building2, Trash2, Crown, Gem
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
import StratosNotesWidget from "./StratosNotesWidget"; // O la ruta correcta
import SmartSidebar from "./SmartSidebar";
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
import GuestInviteOverlay from "./GuestInviteOverlay";
import { useMyPlan } from "@/app/components/billing/useMyPlan";
import StratosAIConsole from "./StratosAIConsole";
import { handleRealDeployment } from './deploymentService';
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

import { 
  LUXURY_IMAGES, 
  sanitizePropertyData, 
  extractFirstUrl, 
  isPdfUrl, 
  isImageUrl 
} from "../../../utils/propertyCore";

import { useOwnerProposals } from "./useOwnerProposals";
import { useStratosFavorites } from "./useStratosFavorites"; // 👈 NUEVO
import { useStratosAI } from "./useStratosAI";
import { useStratosChat } from "./useStratosChat";
import StratosChatWindow from "./StratosChatWindow";
import StratosWelcomeGate from "./StratosWelcomeGate";
import { useStratosVipLink } from "./useStratosVipLink";
// 🔥 EL RADAR DE ZONAS VIP
import { getZoneCampaignAction } from '@/app/actions-zones';
const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';
export default function UIPanels({ 
  map, searchCity, lang, setLang, soundEnabled, toggleSound, systemMode, setSystemMode 
}: any) {
 
 // --- 1. MEMORIA DE UBICACIÓN ---
  const [homeBase, setHomeBase] = useState<any>(null);
  useEffect(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('stratos_home_base');
          if (saved) try { setHomeBase(JSON.parse(saved)); } catch (e) {}
      }
  }, []);
// ========================================================
  // 🎰 MOTOR "LAS VEGAS": SONAR ACTIVO DE ZONAS VIP (BLINDADO)
  // ========================================================
  const [vipZoneActive, setVipZoneActive] = useState(false);

  useEffect(() => {
      let lastZip: string | null = null;
      let lastCheckedCoords = { lng: 0, lat: 0 }; // 🧠 Memoria táctica de posición
      let isAlive = true;

      const sonarInterval = setInterval(async () => {
          if (!map?.current) return;
          
          try {
              // 1. Obtenemos coordenadas exactas
              let lng, lat;
              if (typeof map.current.getCenter === 'function') {
                  const center = map.current.getCenter();
                  lng = center.lng;
                  lat = center.lat;
              } else if (map.current.center) {
                  lng = map.current.center.lng;
                  lat = map.current.center.lat;
              }
              
              if (!lng || !lat) return;

              // 🛑 ESCUDO FINANCIERO: Si el mapa no se ha movido, no gastamos saldo de API
              const diffLng = Math.abs(lng - lastCheckedCoords.lng);
              const diffLat = Math.abs(lat - lastCheckedCoords.lat);
              if (diffLng < 0.0005 && diffLat < 0.0005) return; // Retirada silenciosa

              // Actualizamos la memoria con la nueva posición
              lastCheckedCoords = { lng, lat };

              // 2. Disparamos a Mapbox (solo cuando hay movimiento real)
              const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=postcode,locality,place&language=es`;
              const res = await fetch(url);
              const data = await res.json();

              let currentZip = null;
              if (data.features && data.features.length > 0) {
                  data.features.forEach((f: any) => {
                      if (f.place_type.includes('postcode')) currentZip = f.text;
                  });
              }

              // 3. Consultamos la Base de Datos solo si el código postal ha cambiado
              if (currentZip !== lastZip) {
                  lastZip = currentZip;
                  if (currentZip) {
                      const dbCampaign = await getZoneCampaignAction(currentZip);
                      if (isAlive) setVipZoneActive(!!(dbCampaign?.success && dbCampaign.data));
                  } else {
                      if (isAlive) setVipZoneActive(false);
                  }
              }
          } catch (error) {
              // Silencioso para no molestar
          }
      }, 1500); // Pulso letal cada 1.5 segundos

      return () => {
          isAlive = false;
          clearInterval(sonarInterval);
      };
  }, [map]); // 🔥 Recuperamos el [map] de forma segura
  // ========================================================
  // ========================================================

  // 🔥 MOVIDO AQUÍ (ANTES DE USARSE EN EL EFECTO DE GATE)
  // --- DATOS USUARIO (SERVER-SIDE SOURCE OF TRUTH) ---
  const [activeUserKey, setActiveUserKey] = useState<string | null>(null);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [agencyProfileData, setAgencyProfileData] = useState<any>(null);
  const [userRole, setUserRole] = useState<'PARTICULAR' | 'AGENCIA' | null>(null);
  const [gateUnlocked, setGateUnlocked] = useState(false);

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
 // Estados para la Recepción de Documentos (El Cristal)
  const [incomingFile, setIncomingFile] = useState<File | null>(null);
  const [hasAiNotification, setHasAiNotification] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [rightPanel, setRightPanel] = useState('NONE');   

  useEffect(() => {
  if (systemMode === "AGENCY" && rightPanel === "OWNER_PROPOSALS") {
    setRightPanel("NONE");
    setActiveCampaignId(null);
  }
}, [systemMode, rightPanel]);

 // ✅ Propuestas (Campaign) en columna derecha
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const { ownerProposals, ownerProposalsLoading, ownerProposalsManualList, setOwnerProposalsManualList } = useOwnerProposals(systemMode, activeUserKey, rightPanel, activeCampaignId);

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
  const [showTacticalNotes, setShowTacticalNotes] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showGuestInvite, setShowGuestInvite] = useState(false);
  // 🔥 MOTOR VIP PASS (BLINDADO CONTRA BUCLES)
  const searchParams = useSearchParams();
  const { isVipGuest } = useStratosVipLink(
    searchParams, map, setSystemMode, setSelectedProp, setActivePanel, setLandingComplete, setShowAdvancedConsole, setGateUnlocked
  );

  // EFECTO REACTIVO DE PUERTAS (SEGURO)
  useEffect(() => {
      if (isVipGuest) {
          setGateUnlocked(true);
      } else if (activeUserKey && activeUserKey !== 'anon') {
          setGateUnlocked(true);
      } else {
          setGateUnlocked(false);
      }
  }, [activeUserKey, isVipGuest]);
  
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

  // 🛡️ NUEVO MOTOR DE FAVORITOS (ATERRIZAJE SEGURO)
  const { 
    localFavs, 
    setLocalFavs, 
    agencyLikes, 
    setAgencyLikes, 
    agencyFavs, 
    setAgencyFavs, 
    handleToggleFavorite, 
    handleDeleteAgencyAsset, 
    mirrorGlobalFavsForNanoCard 
  } = useStratosFavorites(
    systemMode, 
    activeUserKey, 
    identityVerified, 
    addNotification, 
    soundEnabled, 
    playSynthSound, 
    setDataVersion, 
    setActivePanel, 
    setSelectedProp
  );
  const uiFavs = systemMode === "AGENCY" ? agencyLikes : localFavs;

// 👇 PEGUE EL NUEVO MOTOR DE IA EXACTAMENTE AQUÍ 👇
  const { 
    aiInput, 
    setAiInput, 
    aiResponse, 
    isAiTyping, 
    handleAICommand 
  } = useStratosAI(
    searchCity, 
    addNotification, 
    playSynthSound, 
    soundEnabled, 
    agencyFavs, 
    agencyLikes, 
    localFavs
  );
// 📡 NUEVO MOTOR CENTRAL DE COMUNICACIONES (CHAT)
  const chatEngine = useStratosChat(
    activeUserKey,
    identityVerified,
    addNotification,
    setDataVersion,
    setActivePanel,
    setRightPanel,
    systemMode,
    ownerProposals,
    setActiveCampaignId
  );
  
  // Extraemos solo lo que el Cuartel General necesita tocar:
  const { chatOpen, setChatOpen, openChatPanel, openConversation, unreadTotal } = chatEngine;

  // 🚀 PUENTE DE TRANSMISIÓN DE ARCHIVOS
  const executeDeploymentWrapper = async (file: File, reference: string) => {
    const success = await handleRealDeployment(file, reference, agencyProfileData);
    
    // ❌ HEMOS BORRADO EL setHasAiNotification(true) DE AQUÍ.
    // Ahora solo parpadeará si alguien de verdad le envía algo.
    
    return success;
  };
  
const handleDayNight = () => {
  if (soundEnabled) playSynthSound("click");
  
  const nextMode = !isNightMode;
  setIsNightMode(nextMode);

  // 1. Orden directa al motor 3D de Mapbox (Estilo Standard v3)
  try {
    if (map?.current?.setConfigProperty) {
      map.current.setConfigProperty('basemap', 'lightPreset', nextMode ? 'night' : 'day');
    }
  } catch (e) {
    console.warn("No se pudo cambiar la iluminación nativa del mapa", e);
  }

  // 2. Por si su componente de Mapa prefiere escuchar eventos globales
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("toggle-map-vision", { detail: { isNight: nextMode } }));
  }

  addNotification(nextMode ? "🌙 Visión Nocturna Activada" : "☀️ Visión Diurna Activada");
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

  //  AÑADA ESTAS  LÍNEA 
  window.removeEventListener("stratos-property-selected", handleOpenDetails);



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

      // 🔥 EL NUEVO CABLE: Escucha la bengala del Pin VIP
      const handleOpenMarketPanel = (e: any) => {
          setMarketProp(e.detail); // 1. Carga los datos de la Agencia VIP
          setActivePanel('MARKETPLACE'); // 2. Da la orden de abrir el panel izquierdo
      };

      window.addEventListener('edit-market-signal', handleEditMarket);
      window.addEventListener('open-market-panel', handleOpenMarketPanel); // 👈 Antena activada
      
      return () => { 
          window.removeEventListener('edit-market-signal', handleEditMarket); 
          window.removeEventListener('open-market-panel', handleOpenMarketPanel);
      };
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
    return <StratosWelcomeGate playSynthSound={playSynthSound} />;
  }

// 🛡️ ESCUDO ANTI-INTRUSOS (CON MEMORIA DE REGRESO Y TRAMPA VIP)
  const requireAuth = (callback: Function) => {
      if (!identityVerified || activeUserKey === 'anon') {
          if (typeof playSynthSound === 'function') playSynthSound('error'); 
          
          if (typeof addNotification === 'function') {
              addNotification("🔒 Acción restringida. Regístrate para explorar más.");
          }

          // 🧠 TÁCTICA DE RETENCIÓN: Guardamos el ID del piso en la mochila
          if (selectedProp?.id) {
              localStorage.setItem('stratos_return_intent', selectedProp.id);
          }
          
          // 🔥 LA TRAMPA: Si el intruso tiene un Pase VIP y toca donde no debe, se lo rompemos.
          if (isVipGuest) {
              if (typeof revokeVipPass === 'function') revokeVipPass();
              setSystemMode('GATEWAY'); 
              setShowGuestInvite(true); 
              return; // 👈 CORTAFUEGOS: Salimos de la función YA para que no cierre el candado
          }
          
          setTimeout(() => {
              setGateUnlocked(false); // (Esto solo le pasará a los que NO son VIP)
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
<div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={handleDayNight}>
  <span className="tracking-widest">VISIÓN</span> 
  <div className={`flex items-center gap-1 ${isNightMode ? 'text-indigo-400' : 'text-amber-400'}`}>
    {isNightMode ? <Moon size={10}/> : <Sun size={10}/>} 
    <span className="text-white">{isNightMode ? 'NOCHE' : 'DÍA'}</span>
  </div>
</div>                        </div>
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

  {/* 2. MERCADO GLOBAL / SUSCRIPCIÓN SAAS (EL ESCUDO) */}
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
    title="Suscripción y Herramientas"
  >
    <Shield size={18} />
  </button>

  {/* 2.5. VANGUARD VIP MARKET (EL DIAMANTE) */}
  <button
    onClick={() => {
      if (typeof playSynthSound === "function") playSynthSound("click");
      // 🔥 Abre directamente la columna de Market para la conquista de zonas
      setActivePanel(activePanel === "MARKETPLACE" ? "NONE" : "MARKETPLACE");
    }}
    className={`p-3 rounded-full transition-all duration-500 relative group cursor-pointer ${
        vipZoneActive 
          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:scale-110 z-50'
          : activePanel === 'MARKETPLACE' 
              ? 'text-amber-400 bg-white/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
              : 'text-white/50 hover:text-amber-400/70 hover:bg-white/10'
    }`}
    title={vipZoneActive ? "¡Zona VIP Libre Detectada!" : "Vanguard VIP Market"}
  >
    {/* Onda expansiva dorada si hay zona libre */}
    {vipZoneActive && <span className="absolute inset-0 rounded-full border-2 border-amber-300 animate-ping opacity-75"></span>}
    
    <Gem size={18} className={`relative z-10 transition-transform ${vipZoneActive ? 'drop-shadow-md animate-pulse' : 'group-hover:scale-110'}`} />
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
<button onClick={() => { 
    if(typeof playSynthSound === 'function') playSynthSound('click'); 
    setActivePanel(activePanel === 'AI' ? 'NONE' : 'AI'); 
    if (activePanel !== 'AI') setHasAiNotification(false);
}} className={`p-3 rounded-full transition-all relative group ${activePanel==='AI' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-blue-500/10 text-white/50 hover:text-white'}`}>
    <Sparkles size={18} className="relative z-10" />
    {hasAiNotification && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] animate-pulse" style={{ animationDuration: '0.8s' }}></span>
    )}
</button>
                               
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
                            
                       {/* 1. MERCADO INMOBILIARIO (EFECTO TESORO VIP) */}
                            <button
                              onClick={() => requireAuth(() => {
                                if (typeof playSynthSound === 'function') playSynthSound('click');
                                setActivePanel(activePanel === 'MARKETPLACE' ? 'NONE' : 'MARKETPLACE');
                              })}
                              className={`p-3 rounded-full transition-all duration-500 relative group ${
                                vipZoneActive 
                                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:scale-110 z-50'
                                  : activePanel === 'MARKETPLACE' 
                                      ? 'text-emerald-400 bg-white/10' 
                                      : 'text-white/50 hover:text-white hover:bg-white/10'
                              }`}
                              title={vipZoneActive ? "¡Joyas VIP Detectadas!" : "Mercado"}
                            >
                              {/* Onda expansiva dorada */}
                              {vipZoneActive && <span className="absolute inset-0 rounded-full border-2 border-amber-300 animate-ping opacity-75"></span>}
                              
                              {/* 💎 EL DIAMANTE */}
                              <Gem size={18} className={vipZoneActive ? "relative z-10 drop-shadow-md animate-pulse" : ""} />
                            </button>

                           {/* 2. 📝 BLOC DE NOTAS TÁCTICO */}
                            <button
                                onClick={() => requireAuth(() => {
                                    if (typeof playSynthSound === 'function') playSynthSound('click');
                                    setShowTacticalNotes(!showTacticalNotes);
                                })}
                                className={`p-3 rounded-full transition-all relative group ${
                                    showTacticalNotes ? 'text-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'text-white/50 hover:text-white hover:bg-white/10'
                                }`}
                                title="Bloc de Notas Táctico"
                            >
                                <StickyNote size={18} />
                                {/* Chivato visual: un pequeño punto parpadeante cuando el bloc está abierto */}
                                {showTacticalNotes && <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(245,158,11,0.8)]"></span>}
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
    if(typeof playSynthSound === 'function') playSynthSound('click');
    setActivePanel(activePanel === 'AI' ? 'NONE' : 'AI');
    if (activePanel !== 'AI') setHasAiNotification(false);
  })}
  className={`p-3 rounded-full transition-all relative group ${
    activePanel === 'AI' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-blue-500/10 text-white/50 hover:text-white'
  }`}
>
  <Sparkles size={18} className="relative z-10" />
  {hasAiNotification && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] animate-pulse" style={{ animationDuration: '0.8s' }}></span>
  )}
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
{/* EL BLOC DE NOTAS CINEMÁTICO */}
<StratosNotesWidget 
    isOpen={showTacticalNotes} 
    onClose={() => setShowTacticalNotes(false)} 
    soundEnabled={soundEnabled} 
    playSynthSound={playSynthSound} 
/>


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

              // 🛡️ FUNCIÓN DE CIERRE BLINDADA
                   const handleCloseDetails = () => {
                       setActivePanel('NONE');
                       // Si es un invitado VIP y NO tiene cuenta registrada, lo echamos al Gateway y le vendemos
                       if (isVipGuest && (!activeUserKey || activeUserKey === 'anon')) {
                           if (typeof revokeVipPass === 'function') revokeVipPass(); 
                           // ✂️ LÍNEA BORRADA AQUÍ (setGateUnlocked)
                           setSystemMode('GATEWAY'); 
                           setShowGuestInvite(true); // 👈 INVITACIÓN
                       }
                   };

                   // 4. ABRIMOS LA PUERTA
                   return usarPanelPro ? (
                        <AgencyDetailsPanel 
                            key={`agency-panel-${selectedProp?.id}`} 
                            selectedProp={selectedProp} 
                            onClose={handleCloseDetails} // 👈 SUSTITUIDO
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
                           onClose={handleCloseDetails} // 👈 SUSTITUIDO
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
       ================================================================= */}
       
    {/* CHAT TÁCTICO (NUEVO CHASIS) */}
       <StratosChatWindow 
           chatEngine={chatEngine}
           systemMode={systemMode}
           ownerProposals={ownerProposals}
           setActiveCampaignId={setActiveCampaignId}
           activeUserKey={activeUserKey}
           addNotification={addNotification}
           setRightPanel={setRightPanel} // 👈 ¡ENCHUFE EL CABLE AQUÍ!
       />

      
<PlanOverlay
  enabled={systemMode === "AGENCY"}
  pricingHref="/pricing"
  landingHref="/"
/>

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
<StratosAIConsole 
    isOpen={activePanel === 'AI'} 
    onClose={() => {
        setActivePanel('NONE');
        setHasAiNotification(false);
    }} 
    aiResponse={aiResponse} 
    onDeploy={executeDeploymentWrapper}
    incomingFile={incomingFile}
    onClearFile={() => setIncomingFile(null)}
    activeUserKey={activeUserKey}
    currentUser={agencyProfileData} // 👈 ¡NUEVA LÍNEA AÑADIDA!
    onUnreadAlert={(hasUnread: boolean) => {
        if (hasUnread) setHasAiNotification(true); 
    }}
/>
       
      {/* 🕸️ LA RED DE CAPTURA PARA INVITADOS VIP 🕸️ */}
      <GuestInviteOverlay 
         isOpen={showGuestInvite} 
         onClose={() => {
             setShowGuestInvite(false);
             setGateUnlocked(false); 
         }} 
         onAccept={() => {
             setShowGuestInvite(false);
             setGateUnlocked(false); 
         }}
      />

    </div>
  );
}
