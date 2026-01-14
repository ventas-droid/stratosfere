// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'next/navigation';

// 1. IMPORTACIÓN UNIFICADA DE ICONOS (CON BUILDING2 AÑADIDO)
import { 
  LayoutGrid, Search, Mic, Bell, MessageCircle, Heart, User, Sparkles, Activity, X, Send, 
  Square, Box, Crosshair, Sun, Phone, Maximize2, Bed, Bath, TrendingUp, CheckCircle2,
  Camera, Zap, Globe, Newspaper, Share2, Shield, Store, SlidersHorizontal,
  Briefcase, Home, Map as MapIcon, Lock, Unlock, Edit2, Building2 
} from 'lucide-react';

// --- 2. EL CEREBRO DE BÚSQUEDA ---
import { CONTEXT_CONFIG } from '../smart-search'; 

// --- 3. IMPORTACIONES DE SUS PANELES ---
import ProfilePanel from "./ProfilePanel";
import DualGateway from "./DualGateway";
import VaultPanel from "./VaultPanel";         
import HoloInspector from "./HoloInspector";   
import ExplorerHud from "./ExplorerHud";       
import ArchitectHud from "./ArchitectHud";     
import MarketPanel from './MarketPanel';      
import DualSlider from './DualSlider';

// --- 4. COMPONENTES LÓGICOS ---
import DetailsPanel from "./DetailsPanel"; 
import { playSynthSound } from './audio';
import StratosConsole from "./StratosConsole";
import LandingWaitlist from "./LandingWaitlist";
import AgencyPortfolioPanel from "./AgencyPortfolioPanel";
import AgencyProfilePanel from "./AgencyProfilePanel";
import AgencyMarketPanel from "./AgencyMarketPanel";
import AgencyDetailsPanel from "./AgencyDetailsPanel"; // <--- AÑADIR ESTO
// 🔥 AQUÍ ESTÁ LA CORRECCIÓN: AÑADIDAS LAS ACCIONES DE AGENCIA QUE FALTABAN
import { 
  getFavoritesAction, 
  toggleFavoriteAction, 
  getUserMeAction,
  getAgencyPortfolioAction, // <--- NUEVA: Para cargar su Stock real
  deleteFromStockAction     // <--- NUEVA: Para borrar de verdad
} from '@/app/actions';

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

  // 2. GESTIÓN DE IMÁGENES (Lógica original conservada)
  let safeImages: string[] = [];
  if (Array.isArray(base.images) && base.images.length > 0) {
    safeImages = base.images
      .map((i: any) => (typeof i === "string" ? i : i?.url))
      .filter(Boolean);
  } else if (base.img) {
    safeImages = [base.img].filter(Boolean);
  } else if (base.mainImage) {
    safeImages = [base.mainImage].filter(Boolean);
  }

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

  // 🔥 MOVIDO AQUÍ (ANTES DE USARSE EN EL EFECTO DE GATE)
  // --- DATOS USUARIO (SERVER-SIDE SOURCE OF TRUTH) ---
  const [activeUserKey, setActiveUserKey] = useState<string | null>(null);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [agencyProfileData, setAgencyProfileData] = useState<any>(null);
  const [localFavs, setLocalFavs] = useState<any[]>([]);
  const [agencyFavs, setAgencyFavs] = useState<any[]>([]);
 const [agencyLikes, setAgencyLikes] = useState<any[]>([]);
 const [userRole, setUserRole] = useState<'PARTICULAR' | 'AGENCIA' | null>(null);
 // --- 2. CREDENCIALES (SaaS Puro) ---
  const searchParams = useSearchParams();
  const [gateUnlocked, setGateUnlocked] = useState(false);

  // Efecto reactivo: Si tenemos usuario confirmado, abrimos la puerta.
  useEffect(() => {
      // AHORA SÍ: activeUserKey YA EXISTE AQUÍ
      if (activeUserKey && activeUserKey !== 'anon' && identityVerified) {
          setGateUnlocked(true);
      } else {
          setGateUnlocked(false);
      }
  }, [activeUserKey, identityVerified]);

  // --- 3. ESTADOS SISTEMA ---
  const [activePanel, setActivePanel] = useState('NONE'); 
  const [rightPanel, setRightPanel] = useState('NONE');   
  const [selectedProp, setSelectedProp] = useState<any>(null); 
  const [editingProp, setEditingProp] = useState<any>(null);
  const [marketProp, setMarketProp] = useState<any>(null);
  const [previousMode, setPreviousMode] = useState<'EXPLORER' | 'AGENCY'>('EXPLORER'); 

  // --- 4. ESTADOS DE FLUJO ---
  const [explorerIntroDone, setExplorerIntroDone] = useState(true);
  const [landingComplete, setLandingComplete] = useState(false); 
  const [showAdvancedConsole, setShowAdvancedConsole] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // --- 5. REFERENCIAS ---
  const prevFavIdsRef = useRef<Set<string>>(new Set());
const [dataVersion, setDataVersion] = useState(0);
  // --- 6. ESTADOS IA ---
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [selectedReqs, setSelectedReqs] = useState<string[]>([]);

  // ... (RESTO DEL CÓDIGO SIGUE IGUAL: useEffects de carga, handlers, render, etc.)

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

 // 2. IDENTIFICACIÓN DE USUARIO Y RANGO (EL CEREBRO DEL SISTEMA)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // A. LLAMADA AL SERVIDOR
        const me = await getUserMeAction();
        if (!alive) return;

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

                setLocalFavs(uniqueFavs);

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

      // C. SELECCIÓN DE BÓVEDA (CRUCIAL PARA NO MEZCLAR)
      // Si es AGENCIA -> Usamos 'agencyLikes' (Bóveda de Vigilancia)
      // Si es EXPLORER -> Usamos 'localFavs' (Favoritos Personales)
      const isAgencyMode = systemMode === 'AGENCY';
      
      // ⚠️ Si no creó 'agencyLikes' arriba, cambie 'agencyLikes' por 'localFavs' aquí, pero se mezclarán.
      const currentList = isAgencyMode ? agencyLikes : localFavs; 
      const setTargetList = isAgencyMode ? setAgencyLikes : setLocalFavs;
      const targetName = isAgencyMode ? "Bóveda de Agencia" : "Favoritos Personales";

      // D. Comprobar estado actual en la lista correspondiente
      const isCurrentlyFav = currentList.some((f: any) => String(f.id) === safeId);

      // ✅ Intención (respetar prop.isFav si viene forzado)
      let shouldAdd = !isCurrentlyFav;
      if (typeof prop?.isFav === "boolean") {
        shouldAdd = prop.isFav;
        if (shouldAdd === isCurrentlyFav) {
           console.log("🛡️ Acción redundante ignorada.");
           return;
        }
      }

      // Construimos el objeto seguro para guardar
      const safeProp = {
        ...cleaned,
        id: safeId,
        title: cleaned?.title || prop?.title || "Propiedad",
        formattedPrice: cleaned?.formattedPrice || cleaned?.price || "Consultar",
        savedAt: Date.now(),
        isFavorited: true 
      };

      // E. Lógica Optimista (Actualizamos la lista correcta)
      const prevList = currentList; // Backup para rollback
      let newList: any[] = [];
      let newStatus = false;

      if (!shouldAdd) {
        newList = currentList.filter((f: any) => String(f.id) !== safeId);
        addNotification(`Eliminado de ${targetName}`);
        newStatus = false;
      } else {
        newList = [...currentList, safeProp];
        addNotification(`Guardado en ${targetName}`);
        newStatus = true;
      }

      // 1) Aplicar cambio visual a la lista
      setTargetList(newList);

      // 2) Broadcast visual inmediato para NanoCards
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sync-property-state", { detail: { id: safeId, isFav: newStatus } }));
      }

      // 3) Persistencia Servidor (Tabla Favorites)
      try {
        await toggleFavoriteAction(String(safeId));
        // Opcional: Si quiere asegurar consistencia total, puede disparar recarga
        // setDataVersion(v => v + 1); 
      } catch (error) {
        console.error(error);
        // Rollback UI en caso de error
        setTargetList(prevList);
        addNotification("❌ Error guardando en servidor");
        // Rollback visual
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("sync-property-state", { detail: { id: safeId, isFav: isCurrentlyFav } })
          );
        }
      }
  };

  // 🔥 4. NUEVA FUNCIÓN: BORRADO LETAL DE AGENCIA (PARA EL BOTÓN DE PAPELERA)
  const handleDeleteAgencyAsset = async (asset: any) => {
      if (!asset) return;
      if (soundEnabled) playSynthSound('click');
      const targetId = String(asset.id || asset);

      // 1. Optimistic UI (Borrado inmediato en pantalla)
      const newStock = agencyFavs.filter((item: any) => String(item.id) !== targetId);
      setAgencyFavs(newStock);
      addNotification("Eliminando de Base de Datos...");

      // 2. LLAMADA A BASE DE DATOS (Borrado Real)
      if (activeUserKey && activeUserKey !== 'anon') {
          try {
              const result = await deleteFromStockAction(targetId);
              
              if (result.success) {
                  addNotification("✅ Propiedad eliminada permanentemente");
              } else {
                  console.warn("Fallo al borrar en servidor");
                  addNotification("❌ Error al borrar");
              }
          } catch (e) { console.error(e); }
      }

      // 3. Sincronizar Mapa
      if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent("sync-property-state", { detail: { id: targetId, isFav: false } }));
      }
  };
  

  const toggleRightPanel = (p: string) => { 
      if(soundEnabled) playSynthSound('click'); 
      const nextState = rightPanel === p ? 'NONE' : p;
      setRightPanel(nextState); 
      if (nextState !== 'NONE' && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('close-radar-signal'));
      }
  };

 const toggleMainPanel = (p: string) => { 
      if(soundEnabled) playSynthSound('click'); 
      if (p === 'ARCHITECT') {
          setPreviousMode(systemMode as 'EXPLORER' | 'AGENCY'); // <-- AÑADIR ESTO
          setEditingProp(null); 
          setRightPanel('NONE');
          setSystemMode('ARCHITECT');
      } else {
          setActivePanel(activePanel === p ? 'NONE' : p); 
      }
  };

 const handleEditAsset = (asset: any) => {
      if(soundEnabled) playSynthSound('click');
      setPreviousMode(systemMode as 'EXPLORER' | 'AGENCY'); // <-- AÑADIR ESTO
      setEditingProp(asset);      
      setRightPanel('NONE');      
      setActivePanel('NONE');
      setSystemMode('ARCHITECT'); 
  };

  const addNotification = (title: string) => {
      setNotifications(prev => [{title}, ...prev].slice(0, 3));
      setTimeout(() => setNotifications(prev => prev.slice(0, -1)), 4000);
  };

  const handleDayNight = () => {
      if(soundEnabled) playSynthSound('click');
      addNotification("Visión Nocturna Alternada");
  };

  const handleAICommand = (e: any) => {
    if (e) e.preventDefault(); 
    if (!aiInput.trim()) return;
    if (soundEnabled) playSynthSound('click');
    setIsAiTyping(true); 

    if (searchCity) {
        searchCity(aiInput); 
        addNotification(`Rastreando: ${aiInput.toUpperCase()}`);
    } else {
        console.warn("⚠️ searchCity no conectado.");
    }

    setTimeout(() => { 
        setAiResponse(`Objetivo confirmado: "${aiInput}". Iniciando aproximación...`); 
        setIsAiTyping(false); 
        setAiInput(""); 
    }, 1500);
  };

  // Escucha de señales (Actualizado para detectar cambios de Modo)
  useEffect(() => {
    const handleOpenDetails = (e: any) => {
        const cleanProp = sanitizePropertyData(e.detail);
        if (cleanProp) {
            setSelectedProp(cleanProp);
            setActivePanel('DETAILS');
            if(soundEnabled) playSynthSound('click');
        }
    };

    const handleToggleFavSignal = (e: any) => { handleToggleFavorite(e.detail); };
    
    // 🔥 ESTA ES LA PIEZA QUE FALTABA: EL GATILLO DE RECARGA
    const handleReload = () => {
        console.log("🔄 Recibida orden de recarga del servidor...");
        setDataVersion(v => v + 1); 
    };

    window.addEventListener('open-details-signal', handleOpenDetails);
    window.addEventListener('toggle-fav-signal', handleToggleFavSignal);
    window.addEventListener('reload-profile-assets', handleReload); // <--- Antena conectada
    
    return () => {
        window.removeEventListener('open-details-signal', handleOpenDetails);
        window.removeEventListener('toggle-fav-signal', handleToggleFavSignal);
        window.removeEventListener('reload-profile-assets', handleReload);
    };
  }, [soundEnabled, localFavs, agencyFavs, systemMode, identityVerified]);

  // 🔥 SINCRONIZACIÓN EN VIVO: Si la base de datos cambia, actualiza la ficha abierta YA.
  useEffect(() => {
      // Solo si tengo una ficha abierta
      if (selectedProp) {
          // Buscamos si existe una versión más nueva de esta propiedad en las listas cargadas
          const freshProp = localFavs.find((p: any) => String(p.id) === String(selectedProp.id)) || 
                            agencyFavs.find((p: any) => String(p.id) === String(selectedProp.id));
          
          // Si la encontramos, reemplazamos la vieja (silenciosamente)
          if (freshProp) {
              console.log("🔄 Inyectando datos frescos en el DetailsPanel...");
              
              // Mantenemos el estado de apertura/inspector para no cerrar el panel
              // Solo actualizamos los datos
              setSelectedProp(freshProp);
          }
      }
  }, [localFavs, agencyFavs]); // Se dispara cada vez que las listas cambian
  
  
  useEffect(() => {
      const handleEditMarket = (e: any) => {
          setMarketProp(e.detail);
          setActivePanel('MARKETPLACE');
      };
      window.addEventListener('edit-market-signal', handleEditMarket);
      return () => { window.removeEventListener('edit-market-signal', handleEditMarket); };
  }, []);

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
      setRightPanel('NONE');
      
      // 2. Cerrar Paneles Centrales/Modales
      setActivePanel('NONE');
      
      // 3. Limpiar Selecciones (Para que el mapa no brille por cosas viejas)
      setSelectedProp(null); 
      setEditingProp(null);
      setMarketProp(null);

      // 4. Sonido de transición (Mecánico)
      if (systemMode !== 'GATEWAY' && soundEnabled) {
           playSynthSound('click'); 
      }

  }, [systemMode]);
 
  // 🔥 PASO 2: sincronización visual corazones
useEffect(() => {
  const targetList = localFavs; // ✅ SIEMPRE referencias
  const targetIds = new Set(targetList.map((x:any) => String(x.id)));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent("reload-favorites"));

    // Apaga todo lo que no esté en referencias (si quieres limpieza)
    // (si NO quieres apagar stock visualmente, elimina este bloque)
    const allKnown = [...agencyFavs, ...localFavs];
    allKnown.forEach((p:any) => {
      if (!targetIds.has(String(p.id))) {
        window.dispatchEvent(new CustomEvent("sync-property-state", { detail: { id: String(p.id), isFav: false } }));
      }
    });

    targetList.forEach((p:any) => {
      window.dispatchEvent(new CustomEvent("sync-property-state", { detail: { id: String(p.id), isFav: true } }));
    });
  }
}, [systemMode, localFavs, agencyFavs]);


  // --- PROTOCOLO DE SEGURIDAD (GATE) ---
  if (!gateUnlocked) {
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center pointer-events-auto animate-fade-in select-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-80" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
            <path d="M-100,1200 C 400,900 600,1100 1100,700 C 1400,500 1500,450 1650,250" fill="none" stroke="black" strokeWidth="1.5" strokeDasharray="10 10" className="opacity-40" />
            <path d="M-200,1300 C 350,850 550,1000 1050,650 C 1450,450 1550,400 1680,280" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/>
            <g transform="translate(1680, 250) rotate(40) scale(0.9)">
                <path d="M0,-80 C 25,-50 25,50 20,80 L -20,80 C -25,50 -25,-50 0,-80 Z" fill="white" stroke="black" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M-20,60 L -40,90 L -20,80" fill="white" stroke="black" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M20,60 L 40,90 L 20,80" fill="white" stroke="black" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M0,60 L 0,90" stroke="black" strokeWidth="2" />
                <circle cx="0" cy="-20" r="10" fill="white" stroke="black" strokeWidth="2" />
                <path d="M0,-80 L 0,-100" stroke="black" strokeWidth="2" />
            </g>
        </svg>
        <div className="relative z-10 text-center mb-24 cursor-default">
            <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter leading-none text-black">Stratosfere OS.</h1>
        </div>
        <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); window.location.href = "/register"; }} className="group relative z-10 px-16 py-6 bg-[#0071e3] border-4 border-black text-white font-extrabold text-sm tracking-wider transition-all duration-200 shadow-[10px_10px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] hover:bg-black hover:text-white cursor-pointer uppercase">
            CREAR CUENTA
        </button>
      </div>
    );
  }

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
               <div className="absolute top-8 right-8 pointer-events-auto flex flex-col gap-3 items-end w-[280px] animate-fade-in-up delay-100 z-[50]">
                    <div className="glass-panel p-5 rounded-[1.5rem] w-full shadow-2xl bg-[#050505]/90 border border-white/10 hover:border-blue-500/30 transition-all">
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
                       <div className="relative glass-panel rounded-full p-2 px-6 flex items-center justify-between shadow-2xl gap-4 bg-[#050505]/90 backdrop-blur-xl border border-white/10">
                           
                           {/* IZQUIERDA: SALIR */}
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
                               <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('ping'); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('open-radar-signal')); }} className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95"><Crosshair size={18} /></button>
                               
                               {/* 2. MERCADO GLOBAL */}
                               <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setActivePanel(activePanel === 'AGENCY_MARKET' ? 'NONE' : 'AGENCY_MARKET'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${activePanel === 'AGENCY_MARKET' ? 'text-white bg-white/10' : 'text-white/50 hover:text-white'}`}><Shield size={18} /></button>

                               {/* 3. COMUNICACIONES */}
                               <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setActivePanel(activePanel === 'CHAT' ? 'NONE' : 'CHAT'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${activePanel==='CHAT' ? 'text-blue-400 bg-blue-500/10' : 'text-white/50 hover:text-white'}`}><MessageCircle size={18}/></button>

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
       {/* MODO EXPLORADOR (BARRA USUARIO) */}
       {systemMode === 'EXPLORER' && (
           <>
               {(showAdvancedConsole || !landingComplete) && <StratosConsole isInitial={!landingComplete} onClose={() => setShowAdvancedConsole(false)} onLaunch={handleStratosLaunch} />}
               
               <div className="absolute bottom-10 z-[10000] w-full px-6 pointer-events-none flex justify-center items-center">
                  <div className="pointer-events-auto w-full max-w-3xl animate-fade-in-up delay-300">
                      <div className="relative glass-panel rounded-full p-2 px-6 flex items-center justify-between shadow-2xl gap-4 bg-[#050505]/90 backdrop-blur-xl border border-white/10">
                        <div className="flex items-center gap-1">
                            <button onClick={() => { playSynthSound('click'); setSystemMode('GATEWAY'); }} className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"><LayoutGrid size={18}/></button>
                            <button onClick={() => { playSynthSound('click'); setShowAdvancedConsole(true); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${showAdvancedConsole ? 'text-white bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-white/50 hover:text-white'}`}><SlidersHorizontal size={18}/></button>
                        </div>
                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                        <div className="flex-grow flex items-center gap-4 bg-white/[0.05] px-5 py-3 rounded-full border border-white/5 focus-within:border-blue-500/50 focus-within:bg-blue-500/5 transition-all group">
                          <Search size={16} className="text-white/40 group-focus-within:text-white transition-colors"/>
                          <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); handleAICommand(e); } if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); (e.target as HTMLInputElement).blur(); } }} className="bg-transparent text-white w-full outline-none text-xs font-bold tracking-widest uppercase placeholder-white/20 cursor-text" placeholder="LOCALIZACIÓN..." />
                          <Mic size={16} className="text-white/30"/>
                        </div>
                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => { playSynthSound('click'); setActivePanel(activePanel === 'MARKETPLACE' ? 'NONE' : 'MARKETPLACE'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${activePanel==='MARKETPLACE'?'text-emerald-400':'text-white/50 hover:text-white'}`}><Store size={18}/></button>
                            <button onClick={() => { playSynthSound('click'); setActivePanel(activePanel === 'CHAT' ? 'NONE' : 'CHAT'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${activePanel==='CHAT' ? 'text-blue-400 bg-blue-500/10' : 'text-white/50 hover:text-white'}`}><MessageCircle size={18}/></button>
                            <button onClick={() => { playSynthSound('click'); setActivePanel(activePanel === 'AI' ? 'NONE' : 'AI'); }} className={`p-3 rounded-full transition-all relative group ${activePanel==='AI' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-blue-500/10 text-blue-400'}`}><Sparkles size={18} className="relative z-10"/></button>
                            <button onClick={() => { playSynthSound('click'); toggleRightPanel('VAULT'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${rightPanel==='VAULT'?'text-red-500':'text-white/50 hover:text-white'}`}><Heart size={18}/></button>
                            <button onClick={() => { playSynthSound('click'); toggleRightPanel('PROFILE'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${rightPanel==='PROFILE'?'text-white':'text-white/50 hover:text-white'}`}><User size={18}/></button>
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
                   favorites={localFavs} 
                   onToggleFavorite={handleToggleFavorite} 
                   map={map} 
                   soundEnabled={soundEnabled} 
                   playSynthSound={playSynthSound} 
               />
           )}
           
           {/* 4. PANELES DE AGENCIA (CONECTADOS AL BORRADO REAL) */}
           {/* Aquí estaba el duplicado. Esta es la versión ÚNICA y CORRECTA. */}
           <AgencyProfilePanel isOpen={rightPanel === 'AGENCY_PROFILE'} onClose={() => toggleRightPanel('NONE')} />
           <AgencyMarketPanel isOpen={activePanel === 'AGENCY_MARKET'} onClose={() => setActivePanel('NONE')} />
           
         <AgencyPortfolioPanel 
               isOpen={rightPanel === 'AGENCY_PORTFOLIO'} 
               onClose={() => setRightPanel('NONE')} 
               properties={agencyFavs}
               onCreateNew={() => handleEditAsset(null)} 
               onEditProperty={(p:any) => handleEditAsset(p)} 
               
               // 1. BORRADO (Ya lo teníamos)
               onDelete={(p:any) => handleDeleteAgencyAsset(p)}
               
               // 2. TOGGLE (Ya lo teníamos)
               onToggleFavorite={(p:any) => handleToggleFavorite(p)}

               // 3. 🔥 VUELO CINEMÁTICO (ESTO ES LO QUE FALTA)
               onSelect={(p:any) => {
                   // A. Buscamos las coordenadas exactas
                   const coords = p.coordinates || (p.latitude && p.longitude ? [p.longitude, p.latitude] : null);
                   
                   if (coords) {
                       // B. Ejecutamos la maniobra de vuelo
                       map?.current?.flyTo({ 
                           center: coords, 
                           zoom: 19,        // Zoom muy cerca para ver la Nano Card
                           pitch: 60,       // Inclinación 3D
                           bearing: -20,    // Un poco de rotación para estilo
                           duration: 3000,  // 3 segundos de viaje suave
                           essential: true
                       });
                       
                       // C. Efectos de sonido y visuales
                       if(soundEnabled) playSynthSound('warp');
                       addNotification(`📍 Localizando: ${p.title || 'Propiedad'}`);
                       
                       // D. (Opcional) Si quiere que el panel se aparte para ver el mapa, descomente esto:
                       // setRightPanel('NONE'); 

                   } else {
                       addNotification("⚠️ Propiedad sin coordenadas GPS");
                       console.warn("Fallo de vuelo: Sin coordenadas", p);
                   }
               }}
           />

       {/* 5. INSPECTOR Y DETALLES (DUAL: MODO AGENCIA vs USUARIO) */}
           <HoloInspector prop={selectedProp} isOpen={activePanel === 'INSPECTOR'} onClose={() => setActivePanel('DETAILS')} soundEnabled={soundEnabled} playSynthSound={playSynthSound} />
           
    {/* =========================================================
               EL PORTERO: DECIDE SI ABRIR COLUMNA AGENCIA O PARTICULAR
               ========================================================= */}
           {activePanel === 'DETAILS' && (
               (() => {
                   const owner = selectedProp?.user || null;

// fallbacks por si algún payload trae role/company en root
const ownerRole = String(owner?.role || selectedProp?.role || "").toUpperCase();
const ownerCompanyName = owner?.companyName || selectedProp?.companyName || null;
const ownerCompanyLogo = owner?.companyLogo || selectedProp?.companyLogo || null;
const ownerCif = owner?.cif || selectedProp?.cif || null;
const ownerLicense = owner?.licenseNumber || selectedProp?.licenseNumber || null;

const isAgency =
  ownerRole === "AGENCIA" ||
  ownerRole === "AGENCY" ||
  !!ownerCompanyName ||
  !!ownerCompanyLogo ||
  !!ownerCif ||
  !!ownerLicense;
  

                   // 3. ABRIMOS LA PUERTA CORRESPONDIENTE
                   return isAgency ? (
                       <AgencyDetailsPanel 
                           selectedProp={selectedProp} 
                           onClose={() => setActivePanel('NONE')} 
                           onToggleFavorite={handleToggleFavorite} 
                           favorites={localFavs}
                           onOpenInspector={() => setActivePanel('INSPECTOR')}
                           agencyData={owner} // <--- CLAVE: Pasamos el dueño
                       />
                   ) : (
                       <DetailsPanel 
                           selectedProp={selectedProp} 
                           onClose={() => setActivePanel('NONE')} 
                           onToggleFavorite={handleToggleFavorite} 
                           favorites={localFavs} 
                           soundEnabled={soundEnabled} 
                           playSynthSound={playSynthSound} 
                           onOpenInspector={() => setActivePanel('INSPECTOR')} 
                       />
                   );
               })()
           )}
       </div>
    
       {/* =================================================================
           CAPA ORBITAL (Z-20000) - CHAT E INTELIGENCIA ARTIFICIAL
           Siempre flotando sobre todo lo demás.
       ================================================================= */}
       
       {/* CHAT TÁCTICO */}
       {activePanel === 'CHAT' && (
           <div className="fixed bottom-40 left-1/2 transform -translate-x-1/2 w-80 z-[20000] pointer-events-auto">
               <div className="animate-fade-in glass-panel rounded-3xl border border-white/10 bg-[#050505]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col h-96">
                   <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                       <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                           <span className="text-xs font-bold tracking-widest text-white">COMMS LINK</span>
                       </div>
                       <button onClick={() => setActivePanel('NONE')} className="text-white/30 hover:text-white transition-colors p-2"><X size={16}/></button>
                   </div>
                   <div className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar">
                       <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-xs text-white/80 max-w-[90%] border border-white/5">
                           Sistema listo. ¿En qué puedo ayudarle, Agente?
                       </div>
                   </div>
                   <div className="p-3 border-t border-white/5 bg-black/20">
                       <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/5">
                           <input placeholder="Transmitir mensaje..." className="bg-transparent w-full text-xs text-white outline-none placeholder-white/20"/>
                           <button className="text-blue-400 hover:text-blue-300"><Send size={14}/></button>
                       </div>
                   </div>
               </div>
           </div>
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

