// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// 1. IMPORTACIÓN UNIFICADA DE ICONOS
import { 
  LayoutGrid, Search, Mic, Bell, MessageCircle, Heart, User, Sparkles, Activity, X, Send, 
  Square, Box, Crosshair, Sun, Phone, Maximize2, Bed, Bath, TrendingUp, CheckCircle2,
  Camera, Zap, Globe, Newspaper, Share2, Shield, Store, SlidersHorizontal,
  Briefcase, Home, Map as MapIcon, Lock, Unlock, Edit2
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
import { getFavoritesAction, toggleFavoriteAction } from '@/app/actions';

// --- UTILIDADES ---
export const LUXURY_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100"
];

// HERRAMIENTA DE REPARACIÓN DE DATOS E INYECCIÓN DE NANO CARDS
const sanitizePropertyData = (p: any) => {
  if (!p) return null;

  // ✅ SOPORTE: si llega un Favorite de Prisma con include { property: true }
  // (Ej: { id, userId, propertyId, property: {...} })
  const base = p?.property
    ? { ...p.property, propertyId: p.propertyId, favoriteId: p.id }
    : p;

  // 1. Limpieza de imágenes y precios
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

  const safePrice = Number(
    base.priceValue || base.rawPrice || String(base.price).replace(/\D/g, "") || 0
  );

  // ✅ ID UNIFICADO (muy importante para multi-origen y favoritos)
  // - Si viene como Favorite row, preferimos propertyId (porque es el ID real de la propiedad)
  const safeId = String(base.propertyId || base.id || base._id || base.uuid || Date.now());

  // ✅ COORDENADAS UNIFICADAS:
  // Prisma: latitude/longitude
  // Legacy: lat/lng
  // GeoJSON: coordinates / geometry.coordinates / location
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

  // 2. GENERADOR AUTOMÁTICO DE NANO CARD (Si no trae requisitos, los creamos según el tipo)
  let nanoRequirements = base.requirements || [];
  if (!Array.isArray(nanoRequirements)) nanoRequirements = [];

  if (nanoRequirements.length === 0) {
    // Lógica de Inteligencia de Mercado
    if (safePrice > 1000000) {
      nanoRequirements = [
        "Acuerdo de Confidencialidad (NDA)",
        "Video Drone 4K",
        "Filtrado Financiero",
      ];
    } else if (base.type === "land" || base.type === "suelo") {
      nanoRequirements = ["Levantamiento Topográfico", "Informe Urbanístico", "Cédula"];
    } else if (base.type === "commercial" || base.type === "local") {
      nanoRequirements = ["Licencia de Apertura", "Plano de Instalaciones", "Estudio de Mercado"];
    } else {
      // Residencial estándar
      nanoRequirements = ["Reportaje Fotográfico", "Certificado Energético", "Nota Simple"];
    }
  }

  return {
    ...base,

    // ✅ ID real de propiedad
    id: safeId,

    // Precio (mantenemos tu formato actual)
    price: safePrice,
    priceValue: safePrice,
    rawPrice: safePrice,
    formattedPrice: new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(safePrice),

    // Imágenes
    images: safeImages,
    img: safeImages[0] || null,

    // ✅ Puentes de coordenadas (para VaultPanel / fly-to / mapa)
    longitude: hasCoords ? (lng as number) : base.longitude,
    latitude: hasCoords ? (lat as number) : base.latitude,
    lng: hasCoords ? (lng as number) : base.lng,
    lat: hasCoords ? (lat as number) : base.lat,
    coordinates,

    communityFees: base.communityFees || 0,
    mBuilt: Number(base.mBuilt || base.m2 || 0),

    // INYECTAMOS LA NANO CARD AQUÍ
    requirements: nanoRequirements,
  };
};


export default function UIPanels({ 
  map, 
  searchCity, 
  lang, setLang, soundEnabled, toggleSound, systemMode, setSystemMode 
}: any) {
  
  // --- 🏠 MEMORIA DE UBICACIÓN PERSONAL (CASA) ---
  const [homeBase, setHomeBase] = useState<any>(null);

  useEffect(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('stratos_home_base');
          if (saved) {
              try { setHomeBase(JSON.parse(saved)); } catch (e) { console.error("Error leyendo casa:", e); }
          }
      }
  }, []);
 
  // 1. LECTURA DE CREDENCIALES
  const searchParams = useSearchParams();
  const urlAccess = searchParams.get('access');
  const [gateUnlocked, setGateUnlocked] = useState(false);

  // 3. EFECTO DE MEMORIA Y LIMPIEZA DE RASTROS
  useEffect(() => {
    const storedAccess = localStorage.getItem('stratos_access_granted');
    if (urlAccess || storedAccess === 'true') {
        setGateUnlocked(true);
        if (!storedAccess) localStorage.setItem('stratos_access_granted', 'true');
        if (urlAccess) {
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({path: newUrl}, '', newUrl);
        }
    }
  }, [urlAccess]);

 // --- ESTADOS DEL SISTEMA ---
  const [activePanel, setActivePanel] = useState('NONE'); 
  const [rightPanel, setRightPanel] = useState('NONE');   
  const [selectedProp, setSelectedProp] = useState<any>(null); 
  const [editingProp, setEditingProp] = useState<any>(null);
  const [marketProp, setMarketProp] = useState<any>(null);
  
  const [explorerIntroDone, setExplorerIntroDone] = useState(true);
  const [landingComplete, setLandingComplete] = useState(false); 
  const [showAdvancedConsole, setShowAdvancedConsole] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const [priceRange, setPriceRange] = useState({ min: 100000, max: 2000000 });
  const [surfaceRange, setSurfaceRange] = useState({ min: 50, max: 500 });

  // --- FAVORITOS ---
  const [localFavs, setLocalFavs] = useState<any[]>([]);
  const [searchContext, setSearchContext] = useState<'VIVIENDA' | 'NEGOCIO' | 'TERRENO'>('VIVIENDA');

  // --- 🔥 SOLUCIÓN 1: PROTOCOLO DE LIMPIEZA AL CAMBIAR DE MODO ---
  // Esto detecta cuando usted pulsa "Salir" o entra en "Agencia" y cierra las ventanas viejas.
  useEffect(() => {
    setActivePanel('NONE');
    setRightPanel('NONE');
    setEditingProp(null);
    setMarketProp(null);
  }, [systemMode]);
 
 useEffect(() => {
  let isMounted = true;

  // Normaliza cualquier formato (servidor / localStorage / Prisma include)
  const normalizeFavList = (arr: any[]) => {
    if (!Array.isArray(arr)) return [];

    return arr
      .map((item: any) => {
        if (!item) return null;

        // Si viene como Favorite + property (include), el inmueble real está en item.property
        const base = item?.property ? { ...item.property, propertyId: item.propertyId } : item;

        // En Prisma Favorite, item.id puede ser el ID del favorito -> usamos propertyId si existe
        const propId = base.propertyId || item.propertyId || base.id || item.id;
        if (!propId) return null;

        const merged = { ...base, id: String(propId), isFavorited: true };

        // Reutilizamos tu saneador (precio, images, mBuilt, requirements)
        const safe = sanitizePropertyData(merged) || merged;

        // Coordenadas robustas (para que SIEMPRE vuele)
        const lng =
          (Array.isArray(safe.coordinates) ? safe.coordinates[0] : undefined) ??
          safe.longitude ??
          safe.lng ??
          safe?.geometry?.coordinates?.[0];

        const lat =
          (Array.isArray(safe.coordinates) ? safe.coordinates[1] : undefined) ??
          safe.latitude ??
          safe.lat ??
          safe?.geometry?.coordinates?.[1];

        const nLng = Number(lng);
        const nLat = Number(lat);

        const coords =
          Number.isFinite(nLng) && Number.isFinite(nLat) ? [nLng, nLat] : safe.coordinates;

        return { ...safe, id: String(propId), coordinates: coords, isFavorited: true };
      })
      .filter(Boolean);
  };

  // Persistencia + limpieza de “fav-*” para evitar mezcla entre users
  const persistFavs = (list: any[]) => {
    try {
      // 1) IDs previos (antes de sobrescribir)
      let prevIds: string[] = [];
      try {
        const prevRaw = localStorage.getItem("stratos_favorites_v1");
        const prevParsed = prevRaw ? JSON.parse(prevRaw) : [];
        if (Array.isArray(prevParsed)) {
          prevIds = prevParsed.map((x: any) => String(x?.id)).filter(Boolean);
        }
      } catch (e) {}

      const nextIds = new Set(
        (Array.isArray(list) ? list : []).map((x: any) => String(x?.id)).filter(Boolean)
      );

      // 2) Guardar master list (SIEMPRE)
      localStorage.setItem("stratos_favorites_v1", JSON.stringify(Array.isArray(list) ? list : []));

      // 3) Quitar flags viejos y notificar a las nanocards
      prevIds.forEach((id) => {
        if (!nextIds.has(id)) {
          localStorage.removeItem(`fav-${id}`);
          window.dispatchEvent(
            new CustomEvent("sync-property-state", { detail: { id, isFav: false } })
          );
        }
      });

      // 4) Poner flags nuevos y notificar a las nanocards
      (Array.isArray(list) ? list : []).forEach((x: any) => {
        const id = String(x?.id);
        if (!id) return;
        localStorage.setItem(`fav-${id}`, "true");
        window.dispatchEvent(
          new CustomEvent("sync-property-state", { detail: { id, isFav: true } })
        );
      });
    } catch (e) {}
  };

  const loadFavs = async () => {
    // 1) Intento servidor
    try {
      const serverResponse = await getFavoritesAction();

      // ✅ OK: lista del servidor (aunque venga vacía)
      if (serverResponse?.success && Array.isArray(serverResponse.data)) {
        const normalized = normalizeFavList(serverResponse.data);
        if (isMounted) setLocalFavs(normalized);
        persistFavs(normalized);
        return;
      }

      // ✅ Sin sesión / no autorizado: limpiamos y NO mezclamos con storage de otro user
      if (serverResponse && serverResponse.success === false) {
        if (isMounted) setLocalFavs([]);
        persistFavs([]);
        return;
      }
    } catch (e) {
      console.error("Modo offline:", e);
    }

    // 2) Fallback localStorage SOLO si hubo excepción (offline real)
    try {
      const saved = localStorage.getItem("stratos_favorites_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const normalized = normalizeFavList(parsed);
          if (isMounted) setLocalFavs(normalized);
          persistFavs(normalized);
          return;
        }
      }
    } catch (e) {}

    // 3) Si no hay nada, vacío seguro
    if (isMounted) {
      setLocalFavs([]);
      persistFavs([]);
    }
  };

  loadFavs();

  const onReloadFavs = () => loadFavs();
  window.addEventListener("reload-favorites", onReloadFavs);

  return () => {
    isMounted = false;
    window.removeEventListener("reload-favorites", onReloadFavs);
  };
}, []);



 useEffect(() => {
  try {
    // ✅ Guardar SIEMPRE, incluso si está vacío (clave para multiusuario)
    localStorage.setItem("stratos_favorites_v1", JSON.stringify(Array.isArray(localFavs) ? localFavs : []));
  } catch (e) {}
}, [localFavs]);



  const handleToggleFavorite = async (prop: any) => {
      if (!prop) return;
      if (soundEnabled) playSynthSound('click');

      const safeProp = {
          ...prop,
          id: prop.id || Date.now(),
          title: prop.title || "Propiedad",
          formattedPrice: prop.formattedPrice || prop.price || "Consultar"
      };

      const exists = localFavs.some(f => String(f.id) === String(safeProp.id));
      let newFavs;
      let newStatus; 

      if (exists) {
          newFavs = localFavs.filter(f => String(f.id) !== String(safeProp.id));
          addNotification("Eliminado de colección");
          localStorage.removeItem(`fav-${safeProp.id}`); 
          newStatus = false;
      } else {
          newFavs = [...localFavs, { ...safeProp, savedAt: Date.now() }];
          addNotification("Guardado en Favoritos");
          localStorage.setItem(`fav-${safeProp.id}`, 'true');
          setRightPanel('VAULT'); 
          newStatus = true;
      }
      setLocalFavs(newFavs);

      if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sync-property-state', { detail: { id: safeProp.id, isFav: newStatus } }));
      }

      try { await toggleFavoriteAction(String(safeProp.id)); } catch (error) { console.error(error); }
  };

  const [selectedReqs, setSelectedReqs] = useState<string[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);

 const toggleRightPanel = (p: string) => { 
      if(soundEnabled) playSynthSound('click'); 
      
      const nextState = rightPanel === p ? 'NONE' : p;
      setRightPanel(nextState); 

      // 🔥 FIX: SI ABRIMOS UN PANEL, MANDAMOS ORDEN DE CERRAR EL RADAR
      if (nextState !== 'NONE') {
          if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('close-radar-signal'));
          }
      }
  };

  const toggleMainPanel = (p: string) => { 
      if(soundEnabled) playSynthSound('click'); 
      if (p === 'ARCHITECT') {
          setEditingProp(null); 
          setRightPanel('NONE');
          setSystemMode('ARCHITECT');
      } else {
          setActivePanel(activePanel === p ? 'NONE' : p); 
      }
  };

  const handleEditAsset = (asset: any) => {
      if(soundEnabled) playSynthSound('click');
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

  useEffect(() => {
    const handleOpenDetails = (e: any) => {
        const rawData = e.detail;
        const cleanProp = sanitizePropertyData(rawData);
        setSelectedProp(cleanProp);
        setActivePanel('DETAILS');
        if(soundEnabled) playSynthSound('click');
    };

    const handleToggleFavSignal = (e: any) => { handleToggleFavorite(e.detail); };
    window.addEventListener('open-details-signal', handleOpenDetails);
    window.addEventListener('toggle-fav-signal', handleToggleFavSignal);
    return () => {
        window.removeEventListener('open-details-signal', handleOpenDetails);
        window.removeEventListener('toggle-fav-signal', handleToggleFavSignal);
    };
  }, [soundEnabled, localFavs]);

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
           <div className="fixed inset-0 z-[50000] flex items-center justify-center pointer-events-auto bg-[#050505]/80 backdrop-blur-xl animate-fade-in duration-1000">
               <DualGateway onSelectMode={(m:any) => { playSynthSound('boot'); setSystemMode(m); }} />
           </div>
       )}

       {/* MODO ARQUITECTO */}
       {systemMode === 'ARCHITECT' && (
           <ArchitectHud 
               soundFunc={typeof playSynthSound !== 'undefined' ? playSynthSound : undefined} 
               initialData={editingProp} 
               onCloseMode={(success: boolean, payload: any) => { 
                   setEditingProp(null); 
                   if (success && payload) {
                       const freshData = sanitizePropertyData(payload);
                       setLocalFavs(currentFavs => currentFavs.map(fav => String(fav.id) === String(freshData.id) ? { ...fav, ...freshData } : fav));
                       if (typeof window !== 'undefined') {
                           window.dispatchEvent(new CustomEvent('update-property-signal', { detail: { id: freshData.id, updates: freshData } }));
                           setTimeout(() => { window.dispatchEvent(new CustomEvent('add-property-signal', { detail: freshData })); }, 100);
                       }
                       setSystemMode('EXPLORER');
                       setLandingComplete(true); 
                       if (typeof setExplorerIntroDone === 'function') setExplorerIntroDone(true); 
                   } else {
                       setSystemMode('GATEWAY');
                   }
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

                           {/* DERECHA: ARSENAL COMPLETO (6 BOTONES) */}
                           <div className="flex items-center gap-1">
                               {/* 1. RADAR */}
                               <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('ping'); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('open-radar-signal')); }} className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95"><Crosshair size={18} /></button>
                               
                               {/* 2. MERCADO */}
                               <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setActivePanel(activePanel === 'AGENCY_MARKET' ? 'NONE' : 'AGENCY_MARKET'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${activePanel === 'AGENCY_MARKET' ? 'text-white bg-white/10' : 'text-white/50 hover:text-white'}`}><Shield size={18} /></button>

                               {/* 3. CHAT (NUEVO) */}
                               <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setActivePanel(activePanel === 'CHAT' ? 'NONE' : 'CHAT'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${activePanel==='CHAT' ? 'text-blue-400 bg-blue-500/10' : 'text-white/50 hover:text-white'}`}><MessageCircle size={18}/></button>

                               {/* 4. IA (NUEVO) */}
                               <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setActivePanel(activePanel === 'AI' ? 'NONE' : 'AI'); }} className={`p-3 rounded-full transition-all relative group ${activePanel==='AI' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-blue-500/10 text-white/50 hover:text-white'}`}><Sparkles size={18}/></button>
                               
                               {/* 5. BÓVEDA */}
                               <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); toggleRightPanel('VAULT'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${rightPanel === 'VAULT' ? 'text-red-500 bg-white/10' : 'text-white/50 hover:text-white'}`}><Heart size={18}/></button>
                               
                               {/* 6. PERFIL */}
                               <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); toggleRightPanel('AGENCY_PROFILE'); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${rightPanel === 'AGENCY_PROFILE' ? 'text-white bg-white/10' : 'text-white/50 hover:text-white'}`}><Briefcase size={18}/></button>
                           </div>
                       </div>
                   </div>
               </div>
               
               <AgencyProfilePanel isOpen={rightPanel === 'AGENCY_PROFILE'} onClose={() => toggleRightPanel('NONE')} />
               <AgencyMarketPanel isOpen={activePanel === 'AGENCY_MARKET'} onClose={() => setActivePanel('NONE')} />
               <AgencyPortfolioPanel isOpen={rightPanel === 'AGENCY_PORTFOLIO'} onClose={() => setRightPanel('NONE')} onCreateNew={() => handleEditAsset(null)} onEditProperty={(p:any) => handleEditAsset(p)} />
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
       <div className="relative z-[80] pointer-events-none">
           
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
           
           {/* 3. BÓVEDA / FAVORITOS (Derecha) */}
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
           
           {/* 4. PANELES DE AGENCIA (¡IMPORTANTE: ESTABAN PERDIDOS, AQUI SE RECUPERAN!) */}
           <AgencyProfilePanel isOpen={rightPanel === 'AGENCY_PROFILE'} onClose={() => toggleRightPanel('NONE')} />
           <AgencyMarketPanel isOpen={activePanel === 'AGENCY_MARKET'} onClose={() => setActivePanel('NONE')} />
           <AgencyPortfolioPanel isOpen={rightPanel === 'AGENCY_PORTFOLIO'} onClose={() => setRightPanel('NONE')} onCreateNew={() => handleEditAsset(null)} onEditProperty={(p:any) => handleEditAsset(p)} />

           {/* 5. INSPECTOR Y DETALLES */}
           <HoloInspector prop={selectedProp} isOpen={activePanel === 'INSPECTOR'} onClose={() => setActivePanel('DETAILS')} soundEnabled={soundEnabled} playSynthSound={playSynthSound} />
           {activePanel === 'DETAILS' && <DetailsPanel selectedProp={selectedProp} onClose={() => setActivePanel('NONE')} onToggleFavorite={handleToggleFavorite} favorites={localFavs} soundEnabled={soundEnabled} playSynthSound={playSynthSound} onOpenInspector={() => setActivePanel('INSPECTOR')} />}
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