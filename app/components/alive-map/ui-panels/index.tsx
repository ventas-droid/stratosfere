// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from 'react';
// ==================================================================================
// 1. IMPORTACIÓN UNIFICADA DE ICONOS (Blindada contra duplicados)
// ==================================================================================
import { 
  LayoutGrid, Search, Mic, Bell, MessageCircle, Heart, User, Sparkles, Activity, X, Send, 
  Square, Box, Crosshair, Sun, Phone, Maximize2, Bed, Bath, TrendingUp, CheckCircle2, MapPinCheck, // <--- CORREGIDO (Antes MapCheck)
  Camera, Zap, Globe, Newspaper, Share2, Shield, Store, SlidersHorizontal, Settings,
  // --- Iconos Específicos de Agencia ---
  Briefcase,  // Para Perfil Corporativo
  Building,   // Para Stock/Cartera
  Home, 
  Map as MapIcon,
  Loader2, // <--- AÑADA ESTE TAMBIÉN (Lo necesita el spinner de carga)
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
import DiffuserDashboard from './DiffuserDashboard';

// --- 4. COMPONENTES LÓGICOS ---
import DetailsPanel from "./DetailsPanel"; 
import { playSynthSound } from './audio';
import StratosConsole from "./StratosConsole";

// --- 5. PANELES DE AGENCIA ---
// ❌ Eliminamos AgencyOSPropertyBridge porque borraste la carpeta
import TacticalRadarController from "./TacticalRadarController"; // ✅ NUEVO RADAR APPLE

import AgencyMarketPanel from "./AgencyMarketPanel"; 
import AgencyProfilePanel from "./AgencyProfilePanel";
import AgencyPortfolioPanel from "./AgencyPortfolioPanel";

import LandingWaitlist from "./LandingWaitlist";

// --- 6. IMÁGENES DE MUESTRA ---
export const LUXURY_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100"
];

// ==================================================================================
// COMPONENTE PRINCIPAL (UIPanels)
// ==================================================================================
export default function UIPanels({ 
  map, 
  searchCity, 
  lang, setLang, soundEnabled, toggleSound, systemMode, setSystemMode 
}: any) {
  
  // ----------------------------------------------------------------------------------
  // 🛡️ PROTOCOLO DE SEGURIDAD (SMART-SWITCH)
  // ----------------------------------------------------------------------------------
  // 1. Detectamos entorno: Restauramos la detección automática
  // Si está en su PC, esto será TRUE. Si está en la Web, será FALSE.
  const isDev = process.env.NODE_ENV === 'development';

  // 2. Estado de la Cortina: 
  // - En Web (!isDev)   -> TRUE (Muestra Landing).
  // - En Local (isDev)  -> FALSE (¡Muestra su Cohete! 🚀).
  const [showLanding, setShowLanding] = useState(!isDev);

  // ==================================================================================
  // A. ESTADOS DEL SISTEMA (VARIABLES DE CONTROL)
  // ==================================================================================
  const [gateUnlocked, setGateUnlocked] = useState(false); 
  const [activePanel, setActivePanel] = useState('NONE'); 
  const [rightPanel, setRightPanel] = useState('NONE');   
  const [selectedProp, setSelectedProp] = useState<any>(null); 
  const [editingProp, setEditingProp] = useState<any>(null);
  
  // ... (Aquí sigue el resto de su código normal: explorerIntroDone, etc.)
  
  // Control de Intros y Aterrizaje
  const [explorerIntroDone, setExplorerIntroDone] = useState(true);
  const [landingComplete, setLandingComplete] = useState(false); 
  const [showAdvancedConsole, setShowAdvancedConsole] = useState(false);
  
  // Memoria del Mercado y Notificaciones
  const [marketTargetProp, setMarketTargetProp] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
 // Variables de Filtros Tácticos
  const [priceRange, setPriceRange] = useState({ min: 100000, max: 2000000 });
  const [surfaceRange, setSurfaceRange] = useState({ min: 50, max: 500 });
  const [selectedReqs, setSelectedReqs] = useState<string[]>([]);
  const [searchContext, setSearchContext] = useState<'VIVIENDA' | 'NEGOCIO' | 'TERRENO'>('VIVIENDA');

  // ... sus otros estados ...
  const [showRadarBtn, setShowRadarBtn] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0); 
  const [radarTargets, setRadarTargets] = useState<any[]>([]); 
  
  // ✅ NUEVO: Estado del Botón (INITIAL, SCANNING, READY)
  const [radarState, setRadarState] = useState<'INITIAL' | 'SCANNING' | 'READY'>('INITIAL');
  // ==================================================================================
  // B. MEMORIA BLINDADA (FAVORITOS & IA)
  // ==================================================================================
  const [localFavs, setLocalFavs] = useState<any[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // 1. Cargar memoria (Favoritos) al iniciar
  useEffect(() => {
      const saved = localStorage.getItem('stratos_favorites_v1');
      if (saved) {
          try { setLocalFavs(JSON.parse(saved)); } 
          catch(e) { console.error(e); }
      }
  }, []);

  // 2. Guardar memoria cada vez que cambia
  useEffect(() => {
      localStorage.setItem('stratos_favorites_v1', JSON.stringify(localFavs));
  }, [localFavs]);

  // 3. FUNCIÓN DE GUARDADO BLINDADA
  const handleToggleFavorite = (prop: any) => {
      if (!prop) return;
      if (soundEnabled) playSynthSound('click');

      const safeProp = {
          ...prop,
          id: prop.id || Date.now(),
          title: prop.title || "Propiedad",
          formattedPrice: prop.formattedPrice || prop.price || "Consultar"
      };

      const exists = localFavs.some(f => f.id === safeProp.id);
      let newFavs;
      let newStatus; 

      if (exists) {
          newFavs = localFavs.filter(f => f.id !== safeProp.id);
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
          window.dispatchEvent(new CustomEvent('sync-property-state', { 
              detail: { id: safeProp.id, isFav: newStatus } 
          }));
      }
  };

  // ==================================================================================
  // PIEZA 1: SENSOR DE MOVIMIENTO (CORREGIDO)
  // ==================================================================================
  useEffect(() => {
    if (!map?.current) return;
    const m = map.current;

    // 1. AL EMPEZAR A MOVERSE: LIMPIEZA VISUAL (Pero respetando el panel)
    const onMoveStart = () => {
        setRadarTargets([]);      // Limpia los puntos del radar para que no "floten"
        setVisibleCount(0);
        setShowRadarBtn(false);   // Esconde el botón de escanear
        setRadarState('INITIAL'); 
        
        // ❌ ELIMINADO: setRightPanel('NONE'); 
        // Ahora el panel lateral NO se cierra al mover el mapa.
    };

    // 2. AL TERMINAR DE MOVERSE: PREPARAMOS EL NUEVO ESCANEO
    const onMoveEnd = () => {
      if (!landingComplete) return;

      setShowRadarBtn(true); // Ya podemos buscar

      // Si venimos de un vuelo automático (Launch), escaneamos solo
      if (radarAutoScanRef.current) {
        radarAutoScanRef.current = false;
        // Esperamos 1.5s a que cargue el mapa nuevo
        setTimeout(() => {
            handleScanAreaRef.current({ autoOpen: true });
        }, 1500); 
      }
    };

    m.on("movestart", onMoveStart);
    m.on("moveend", onMoveEnd);
    return () => {
        m.off("movestart", onMoveStart);
        m.off("moveend", onMoveEnd);
    };
  }, [map, landingComplete]);
// ==================================================================================
// ==================================================================================
  // 🔥 PROTOCOLO DE EMERGENCIA: SEGURIDAD Y RETRASO DE CARGA
  // ==================================================================================

  // 1. REFS
  const radarScanLockRef = useRef(false);
  const radarIntervalRef = useRef(null);
  const radarAutoScanRef = useRef(false);
  const handleScanAreaRef = useRef(() => {});

  // 2. SENSOR DE VUELO
  useEffect(() => {
    const onFlyTo = () => {
      radarAutoScanRef.current = true; 
    };
    window.addEventListener("fly-to-location", onFlyTo);
    return () => window.removeEventListener("fly-to-location", onFlyTo);
  }, []);

  // 3. SENSOR DE MOVIMIENTO (EL ARREGLO ESTÁ AQUÍ)
  useEffect(() => {
    if (!map?.current) return;
    const m = map.current;

    const onMoveStart = () => {
        setShowRadarBtn(false); // Ocultar al mover
    };

    const onMoveEnd = () => {
      if (!landingComplete) return;

      // A. LIMPIEZA INCONDICIONAL AL LLEGAR
      setRadarTargets([]);
      setVisibleCount(0);
      setRadarState('INITIAL'); 
      setShowRadarBtn(true); // <--- FORZAMOS QUE EL BOTÓN APAREZCA SIEMPRE

      // B. AUTO-ESCANEO CON RETRASO (Para dar tiempo a que cargue Madrid)
      if (radarAutoScanRef.current) {
        radarAutoScanRef.current = false;
        
        // 🔥 ESPERAMOS 1.5 SEGUNDOS ANTES DE ESCANEAR AUTOMÁTICAMENTE
        setTimeout(() => {
            handleScanAreaRef.current({ autoOpen: true });
        }, 1500); 
      }
    };

    m.on("movestart", onMoveStart);
    m.on("moveend", onMoveEnd);
    return () => {
        m.off("movestart", onMoveStart);
        m.off("moveend", onMoveEnd);
    };
  }, [map, landingComplete]);

 // ==================================================================================
  // PIEZA 2: ESCÁNER FILTRADO (SOLO LO QUE VEO EN PANTALLA)
  // ==================================================================================
  const handleScanArea = async (opts: any = {}) => {
    const m = map.current;
    if (!m) return;
    
    // Evitar doble click
    if (radarState === 'SCANNING' && !opts.autoOpen) return;

    setRadarState("SCANNING");
    if (soundEnabled && !opts.autoOpen) playSynthSound("click");

    // LÓGICA DE INTENTOS (Por si el mapa tarda en cargar)
    let attempts = 0;
    const maxAttempts = 3;

    const performScan = async () => {
        const bounds = m.getBounds();
        const rawFeatures = m.querySourceFeatures("properties"); 
        
        // 1. FILTRO: ¿Está el piso dentro de mi pantalla actual?
        const visibleFeatures = rawFeatures.filter((f: any) => {
             return f?.geometry && bounds.contains(f.geometry.coordinates);
        });

        // Si no hay nada, esperamos y reintentamos (Cargando...)
        if (visibleFeatures.length === 0 && attempts < maxAttempts) {
            attempts++;
            await new Promise(r => setTimeout(r, 1000)); // Espera 1s
            performScan();
            return;
        }

        // PROCESAR RESULTADOS
        const uniqueMap = new Map();
        visibleFeatures.forEach((f: any) => {
            const p = f.properties || {};
            const id = p.id || f.id;
            if(!uniqueMap.has(id)) {
                uniqueMap.set(id, {
                    ...p, 
                    id,
                    numericPrice: parseFloat(p.price) || 0,
                    numericSurface: parseFloat(p.surface) || 0
                });
            }
        });

        const candidates = Array.from(uniqueMap.values());

        // 2. FILTRO: Precio y Superficie (Tus sliders)
        const filtered = candidates.filter((item: any) => {
            const priceOk = item.numericPrice >= priceRange.min && item.numericPrice <= priceRange.max;
            const surfaceOk = item.numericSurface >= surfaceRange.min && item.numericSurface <= surfaceRange.max;
            return priceOk && surfaceOk;
        });

        if (filtered.length > 0) {
            setRadarTargets(filtered);
            setVisibleCount(filtered.length);
            setRightPanel("AGENCY_HUD"); // Abre la lista
            setShowRadarBtn(false);
            if (soundEnabled) playSynthSound("success");
        } else {
            setRadarTargets([]); // Asegura que esté vacío
            if (!opts.autoOpen) addNotification("Sin resultados en esta zona.");
            setShowRadarBtn(true);
        }
        setRadarState("INITIAL");
    };

    performScan();
  };

  // VINCULACIÓN NECESARIA
  useEffect(() => { handleScanAreaRef.current = handleScanArea; });
  // ==================================================================================
  // C. HELPERS DE NAVEGACIÓN Y ACCIONES
  // ==================================================================================
  
  // Gestión del Panel Derecho (Perfil, Bóveda, Agencia)
  const toggleRightPanel = (p: string) => { 
      if(soundEnabled) playSynthSound('click'); 
      setRightPanel(rightPanel === p ? 'NONE' : p); 
  };

  // Gestión de Paneles Principales vs Modos
  const toggleMainPanel = (p: string) => { 
      if(soundEnabled) playSynthSound('click'); 
      if (p === 'ARCHITECT') {
          // Si activamos Arquitecto, limpiamos todo y cambiamos de modo
          setEditingProp(null); 
          setRightPanel('NONE');
          setSystemMode('ARCHITECT');
      } else {
          setActivePanel(activePanel === p ? 'NONE' : p); 
      }
  };

  // Editar Activo (Abre Architect con datos)
  const handleEditAsset = (asset: any) => {
      console.log("📝 EDITANDO ACTIVO:", asset);
      if(soundEnabled) playSynthSound('click');
      setEditingProp(asset);  
      setRightPanel('NONE');  
      setSystemMode('ARCHITECT'); 
  };

  // Sistema de Notificaciones
  const addNotification = (title: string) => {
      setNotifications(prev => [{title}, ...prev].slice(0, 3));
      setTimeout(() => setNotifications(prev => prev.slice(0, -1)), 4000);
  };

  // Cambio Día/Noche
  const handleDayNight = () => {
      if(soundEnabled) playSynthSound('click');
      addNotification("Visión Nocturna Alternada");
  };

  // Comando de Voz / Texto IA
  const handleAICommand = (e: any) => {
    if (e) e.preventDefault(); 
    if (!aiInput.trim()) return;

    if (soundEnabled) playSynthSound('click');
    setIsAiTyping(true); 

    // 🔥🔥 AQUÍ ESTÁ LA LÍNEA QUE ARREGLA EL VUELO 🔥🔥
    radarAutoScanRef.current = true;

    // Conexión con el Mapa (Si existe la función searchCity)
    if (searchCity) {
        searchCity(aiInput); 
        addNotification(`Rastreando: ${aiInput.toUpperCase()}`);
    } else {
        console.warn("⚠️ ALERTA: searchCity no está conectado.");
    }

    // Simulación de respuesta IA
    setTimeout(() => { 
        setAiResponse(`Objetivo confirmado: "${aiInput}". Iniciando aproximación...`); 
        setIsAiTyping(false); 
        setAiInput(""); 
    }, 1500);
  };
  // ==================================================================================
  // D. LISTENERS DEL SISTEMA NERVIOSO (Eventos Globales)
  // ==================================================================================
  useEffect(() => {
    const handleOpenDetails = (e: any) => {
      const propData = e?.detail || {};
      const stableId = propData?.id ?? propData?.propertyId ?? propData?._id ?? propData?.uuid ?? Date.now();

      const finalProp = {
        ...propData,
        id: stableId,
        img: propData.img || LUXURY_IMAGES[0],
        formattedPrice: propData.formattedPrice || propData.displayPrice || "Consultar",
      };

      // Guardar en el puente de Agencia por si acaso
      try {
        localStorage.setItem("agencyos:last_property_id", String(finalProp.id));
        localStorage.setItem("agencyos:last_property_snapshot", JSON.stringify(finalProp));
      } catch {}

      setSelectedProp(finalProp);
      setActivePanel("DETAILS");
      if (soundEnabled) playSynthSound("click");
    };

    const handleToggleFavSignal = (e: any) => { handleToggleFavorite(e.detail); };
    
    // Listener para abrir el Market desde una propiedad
    const handleEditAssetServices = (e: any) => {
      const prop = e?.detail;
      if (!prop) return;
      setMarketTargetProp(prop); 
      setActivePanel("MARKETPLACE"); 
    };

    // Listener para actualizaciones en vivo
    const handleUpdateDetailsLive = (e: any) => {
      const updated = e?.detail;
      if (!updated?.id) return;
      setSelectedProp((prev: any) => prev && String(prev.id) === String(updated.id) ? { ...prev, ...updated } : prev);
      setMarketTargetProp((prev: any) => prev && String(prev.id) === String(updated.id) ? { ...prev, ...updated } : prev);
    };

    // Suscripción a eventos
    window.addEventListener("open-details-signal", handleOpenDetails);
    window.addEventListener("toggle-fav-signal", handleToggleFavSignal);
    window.addEventListener("edit-asset-services", handleEditAssetServices);
    window.addEventListener("update-details-live", handleUpdateDetailsLive);

    return () => {
      window.removeEventListener("open-details-signal", handleOpenDetails);
      window.removeEventListener("toggle-fav-signal", handleToggleFavSignal);
      window.removeEventListener("edit-asset-services", handleEditAssetServices);
      window.removeEventListener("update-details-live", handleUpdateDetailsLive);
    };
  }, [soundEnabled, localFavs]);

  // ==================================================================================
  // E. LÓGICA DE LANZAMIENTO (STRATOS CONSOLE)
  // ==================================================================================
  const handleStratosLaunch = (data: any) => {
      if(soundEnabled) playSynthSound('warp');
      
      // Diccionario de traducción
      const TYPE_TRANSLATOR: Record<string, string> = {
          'flat': 'Piso', 'penthouse': 'Ático', 'villa': 'Villa', 'house': 'Villa',
          'office': 'Oficina', 'industrial': 'Nave', 'land': 'Suelo', 'solar': 'Suelo'
      };

      const rawType = data.type; 
      const dbType = TYPE_TRANSLATOR[rawType] || rawType; 
      
      // Deducción de Contexto
      let derivedContext = 'VIVIENDA'; 
      if (['office', 'industrial', 'local', 'nave', 'oficina'].includes(rawType)) derivedContext = 'NEGOCIO';
      else if (['land', 'solar', 'suelo', 'terreno'].includes(rawType)) derivedContext = 'TERRENO';

      // Envío de señal de filtros al mapa
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

      // 🔥🔥 AQUÍ ESTÁ LA LÍNEA QUE ARREGLA EL VUELO 🔥🔥
      radarAutoScanRef.current = true; 

      // Navegación GPS
      if(data.location && searchCity) {
          searchCity(data.location);
          addNotification(`Viajando a: ${data.location}`);
      } else {
          // Vuelo a Base (Madrid) si no hay destino
          map?.current?.flyTo({ center: [-3.6883, 40.4280], pitch: 60, zoom: 14, duration: 2000 });
      }

      setLandingComplete(true);
      setShowAdvancedConsole(false);
  };

  // ==================================================================================
  // F. RENDERIZADO VISUAL
  // ==================================================================================

  // 🔒 0. LA CORTINA DE HIERRO (Solo en Web Pública)
  // Si estamos en la web, esto salta PRIMERO y protege su cohete.
  if (showLanding) {
      return <LandingWaitlist onUnlock={() => setShowLanding(false)} />;
  }

  // 🚀 1. SU PANTALLA DE INICIO (El Cohete)
  // Al desbloquear la landing (o si está en local), el código llega aquí y muestra SU cohete.
  if (!gateUnlocked) {
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center pointer-events-auto animate-fade-in select-none overflow-hidden">
        {/* ... (TODO SU CÓDIGO DEL COHETE SIGUE AQUÍ, NO LO TOQUE) ... */}
        {/* Fondo Artístico */}
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
        
        {/* Contenido Central */}
        <div className="relative z-10 text-center mb-24 cursor-default">
            <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter leading-none text-black">Stratosfere OS.</h1>
        </div>
        <button onClick={() => { playSynthSound('boot'); setGateUnlocked(true); }} className="group relative z-10 px-16 py-6 bg-[#0071e3] border-4 border-black text-white font-extrabold text-sm tracking-wider transition-all duration-200 shadow-[10px_10px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] hover:bg-black hover:text-white">
            INITIALIZE SYSTEM
        </button>
      </div>
    );
  }

  // 2. SISTEMA OPERATIVO ACTIVO
  return (
    // 👇👇👇 ¡¡¡CAMBIE ESTE 'z-50' POR 'z-[50000]'!!! 👇👇👇
    <div className="pointer-events-none fixed inset-0 z-[50000] flex flex-col justify-end pb-8 animate-fade-in text-sans select-none">
    
       {/* A. GATEWAY (SELECCIÓN DE MODO) */}
       {systemMode === 'GATEWAY' && (
           <div className="fixed inset-0 z-[50000] flex items-center justify-center pointer-events-auto bg-[#050505]/80 backdrop-blur-xl animate-fade-in duration-1000">
               <DualGateway onSelectMode={(m:any) => { playSynthSound('boot'); setSystemMode(m); }} />
           </div>
       )}

       {/* B. MODO ARQUITECTO (EDITOR) - LÓGICA DE RETORNO CORREGIDA */}
       {systemMode === 'ARCHITECT' && (
           <ArchitectHud 
               soundFunc={typeof playSynthSound !== 'undefined' ? playSynthSound : undefined} 
               initialData={editingProp} 
               onCloseMode={(success: boolean, payload: any) => { 
                   // 1. Detectamos si veníamos de Agencia
                   const wasAgency = editingProp?.isAgencyContext || (payload && payload.isAgencyContext);
                   
                   setEditingProp(null); 

                   if (success) {
                       if (wasAgency) {
                           // ✅ SI ES AGENCIA: Mantenemos modo AGENCIA y reabrimos el Stock
                           setSystemMode('AGENCY');
                           setRightPanel('AGENCY_PORTFOLIO');
                       } else {
                           // ✅ SI ES USUARIO: Vamos al modo EXPLORER
                           setSystemMode('EXPLORER');
                           setLandingComplete(true); 
                           if (typeof setExplorerIntroDone === 'function') setExplorerIntroDone(true); 
                       }
                       
                       // Emitimos señal de nuevo activo
                       if (payload) {
                           setTimeout(() => { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('add-property-signal', { detail: payload })); }, 100);
                       }
                   } else {
                       // Si cancela (X)
                       if (wasAgency) {
                           setSystemMode('AGENCY');
                           setRightPanel('AGENCY_PORTFOLIO'); // Volvemos al stock
                       } else {
                           setSystemMode('GATEWAY');
                       }
                   }
               }} 
           />
       )}

       {/* C. MODO DIFUSOR */}
       {systemMode === 'DIFFUSER' && (
           <DiffuserDashboard onClose={() => setSystemMode('GATEWAY')} />
       )}

      {/* ================================================================
           D. MODO MAPA UNIFICADO (EXPLORER + AGENCIA)
           ================================================================ */}
       {(systemMode === 'EXPLORER' || systemMode === 'AGENCY') && (
           <>
               {/* 1. CONSOLA STRATOS (BUSCADOR) */}
               {(showAdvancedConsole || !landingComplete) && (
                   <StratosConsole 
                       isInitial={!landingComplete} 
                       onClose={() => setShowAdvancedConsole(false)}
                       onLaunch={(data: any) => {
                           if(typeof playSynthSound === 'function') playSynthSound('warp');
                           handleStratosLaunch(data);
                           setLandingComplete(true);
                       }}
                   />
               )}

        {/* 2. INTERFAZ FLOTANTE SUPERIOR (HUD COMPLETO) */}
<div className="absolute top-0 left-0 w-full h-full pointer-events-none">
  
 

  
   {/* --- C. LOGO STRATOSFERE --- */}
   <div className="absolute top-8 left-8 pointer-events-auto animate-fade-in-up">
        <h1 className="text-6xl font-extrabold tracking-tighter text-black leading-none cursor-default">Stratosfere OS.</h1>
        {systemMode === 'AGENCY' && (
            <div className="mt-2 inline-block bg-black text-white text-[10px] font-bold px-2 py-1 tracking-widest uppercase rounded">
                Agency Mode Active
            </div>
        )}
   </div>
   
  {/* --- D. PANEL SISTEMA (DERECHA) --- */}
   {rightPanel === 'NONE' && activePanel === 'NONE' && (
       <div className="absolute top-8 right-8 pointer-events-auto flex flex-col gap-3 items-end w-[280px] animate-fade-in-up delay-100">
            <div className="glass-panel p-5 rounded-[1.5rem] w-full shadow-2xl bg-[#050505]/90 border border-white/10 hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5 text-white">
                    <span className="text-[10px] font-extrabold tracking-tighter flex items-center gap-2">SYSTEM</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_blue]"></div>
                        <span className="text-[9px] font-mono text-blue-400">CONECTADO</span>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {/* Selector Idioma */}
                    <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" 
                         onClick={()=>{if(typeof playSynthSound==='function') playSynthSound('click'); setLang(lang==='ES'?'EN':'ES')}}>
                        <span className="tracking-widest">IDIOMA</span> 
                        <span className="text-white font-mono">{lang}</span>
                    </div>
                    {/* Selector Sonido */}
                    <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" 
                         onClick={()=>{if(typeof playSynthSound==='function') playSynthSound('click'); toggleSound();}}>
                        <span className="tracking-widest">SONIDO</span> 
                        <span className={soundEnabled ? "text-emerald-400" : "text-zinc-500"}>{soundEnabled ? 'ON' : 'MUTED'}</span>
                    </div>
                    {/* Selector Día/Noche */}
                    <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={handleDayNight}>
                        <span className="tracking-widest">VISIÓN</span> 
                        <div className="flex items-center gap-1"><Sun size={10}/> DÍA/NOCHE</div>
                    </div>
                </div>

                {/* Notificaciones */}
                <div className="mt-4 pt-2 border-t border-white/5 space-y-1">
                    {notifications.map((n,i)=>(
                        <div key={i} className="bg-blue-900/20 border-l-2 border-blue-500 p-2 rounded flex items-center gap-2 animate-slide-in-right">
                            <Bell size={10} className="text-blue-400"/>
                            <span className="text-[9px] text-blue-100">{n.title}</span>
                        </div>
                    ))}
                </div>
            </div>
       </div>
   )}

   {/* --- E. CONTROLES MAPA 2D/3D --- */}
   <div className="absolute top-1/2 -translate-y-1/2 right-8 pointer-events-auto flex flex-col gap-2 animate-fade-in-right">
       <button onClick={() => {if(typeof playSynthSound==='function') playSynthSound('click'); map?.current?.flyTo({pitch: 0});}} 
               className="w-10 h-10 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black transition-all">
           <Square size={16}/>
       </button>
       <button onClick={() => {if(typeof playSynthSound==='function') playSynthSound('click'); map?.current?.flyTo({pitch: 60});}} 
               className="w-10 h-10 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black transition-all">
           <Box size={16}/>
       </button>
   </div>

   {/* --- F. BOTÓN GPS --- */}
   <button 
       className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-auto p-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all shadow-2xl group animate-fade-in-down" 
       onClick={() => { 
           if ("geolocation" in navigator) {
               navigator.geolocation.getCurrentPosition((position) => {
                   const { latitude, longitude } = position.coords;
                   if (typeof addNotification === 'function') addNotification("GPS: UBICACIÓN ACTUAL");
                   if (soundEnabled) playSynthSound('warp');
                   map?.current?.flyTo({ center: [longitude, latitude], zoom: 16.5, pitch: 60, bearing: 0, duration: 3000 });
               }, (error) => { 
                   console.error("GPS Error:", error); 
                   if (typeof addNotification === 'function') addNotification("ERROR: PERMISO GPS DENEGADO"); 
               });
           } else { 
               if (typeof addNotification === 'function') addNotification("ERROR: GPS NO DISPONIBLE"); 
           }
       }}
   >
       <Crosshair className="w-5 h-5 text-white/80 group-hover:rotate-90 transition-transform duration-700" />
   </button>

</div>
            {/* 3. DOCK BARRA INFERIOR (COMPLETO) */}
               {/* 🔥 CAMBIO CLAVE: z-[30000] PARA ESTAR ENCIMA DEL RADAR SIEMPRE 🔥 */}
               <div className="absolute bottom-10 z-[30000] w-full px-6 pointer-events-none flex justify-center items-center">
                  <div className="pointer-events-auto w-full max-w-3xl animate-fade-in-up delay-300">
                      <div className="relative glass-panel rounded-full p-2 px-6 flex items-center justify-between shadow-2xl gap-4 bg-[#050505]/90 backdrop-blur-xl border border-white/10">
                        
                       {/* ZONA IZQUIERDA (Menu/Filtros) */}
                        <div className="flex items-center gap-1">
                            <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setSystemMode('GATEWAY'); }} className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all" title="Menú Principal"><LayoutGrid size={18}/></button>
                            <button onClick={() => { if(typeof playSynthSound === 'function') playSynthSound('click'); setShowAdvancedConsole(true); }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${showAdvancedConsole ? 'text-white bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-white/50 hover:text-white'}`} title="Filtros Avanzados"><SlidersHorizontal size={18}/></button>
                        </div>
                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

                        {/* ZONA CENTRAL (Omni Search) */}
                        <div className="flex-grow flex items-center gap-4 bg-white/[0.05] px-5 py-3 rounded-full border border-white/5 focus-within:border-blue-500/50 focus-within:bg-blue-500/5 transition-all group">
                          <Search size={16} className="text-white/40 group-focus-within:text-white transition-colors"/>
                          <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); handleAICommand(e); } if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); (e.target as HTMLInputElement).blur(); } }} className="bg-transparent text-white w-full outline-none text-xs font-bold tracking-widest uppercase placeholder-white/20 cursor-text" placeholder="LOCALIZACIÓN..." />
                          <Mic size={16} className="text-white/30"/>
                        </div>
                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                        
                        {/* ZONA DERECHA (Apps + Lógica Agencia) */}
                        <div className="flex items-center gap-1">
                            
                            {/* 1. MARKETPLACE */}
                            <button onClick={() => { 
                                if(typeof playSynthSound === 'function') playSynthSound('click'); 
                                // MATA AL RADAR
                                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('close-radar-signal'));
                                setActivePanel(activePanel === 'MARKETPLACE' ? 'NONE' : 'MARKETPLACE'); 
                            }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${activePanel==='MARKETPLACE'?'text-emerald-400':'text-white/50 hover:text-white'}`}><Store size={18}/></button>
                            
                            {/* 2. CHAT */}
                            <button onClick={() => { 
                                if(typeof playSynthSound === 'function') playSynthSound('click'); 
                                // MATA AL RADAR
                                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('close-radar-signal'));
                                setActivePanel(activePanel === 'CHAT' ? 'NONE' : 'CHAT'); 
                            }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${activePanel==='CHAT' ? 'text-blue-400 bg-blue-500/10' : 'text-white/50 hover:text-white'}`}><MessageCircle size={18}/></button>
                            
                            {/* 3. OMNI AI */}
                            <button onClick={() => { 
                                if(typeof playSynthSound === 'function') playSynthSound('click'); 
                                // MATA AL RADAR
                                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('close-radar-signal'));
                                setActivePanel(activePanel === 'AI' ? 'NONE' : 'AI'); 
                            }} className={`p-3 rounded-full transition-all relative group ${activePanel==='AI' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-blue-500/10 text-blue-400'}`}><Sparkles size={18} className="relative z-10"/></button>
                            
                            {/* 4. FAVORITOS (VAULT) */}
                            <button onClick={() => { 
                                if(typeof playSynthSound === 'function') playSynthSound('click'); 
                                // MATA AL RADAR
                                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('close-radar-signal'));
                                toggleRightPanel('VAULT'); 
                            }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${rightPanel==='VAULT'?'text-red-500':'text-white/50 hover:text-white'}`}><Heart size={18}/></button>
                            
                            {/* 🔥 SWITCH TÁCTICO: AGENCIA vs USUARIO 🔥 */}
                            {systemMode === 'AGENCY' ? (
                                <>{/* A. CARTERA (Icono Edificio) - ABRE EL PANEL DE STOCK */}
<button 
    onClick={() => { 
        if(typeof playSynthSound === 'function') playSynthSound('click'); 
        // 1. Cierra el radar si está abierto
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('close-radar-signal'));
        // 2. Alterna el panel de Cartera
        setRightPanel(rightPanel === 'AGENCY_PORTFOLIO' ? 'NONE' : 'AGENCY_PORTFOLIO'); 
    }} 
    className={`p-3 rounded-full transition-all ${
        rightPanel === 'AGENCY_PORTFOLIO' 
        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' // Estado Activo (Blanco)
        : 'text-white/50 hover:text-white' // Estado Inactivo
    }`} 
    title="Mi Cartera"
>
    <Building size={18}/>
</button>
                                    {/* PERFIL */}
                                    <button onClick={() => { 
                                        if(typeof playSynthSound === 'function') playSynthSound('click'); 
                                        // MATA AL RADAR
                                        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('close-radar-signal'));
                                        setRightPanel(rightPanel === 'AGENCY_PROFILE' ? 'NONE' : 'AGENCY_PROFILE'); 
                                    }} className={`p-3 rounded-full transition-all ${rightPanel==='AGENCY_PROFILE' ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:text-white'}`} title="Perfil Corporativo"><Briefcase size={18}/></button>
                                    
                                    {/* ✅ BOTÓN ENGRANAJE (ESTE SÍ ABRE EL RADAR) */}
                                    <button 
                                        onClick={() => { 
                                            if(typeof playSynthSound === 'function') playSynthSound('click'); 
                                            
                                            // 1. CIERRA CUALQUIER PANEL ABIERTO
                                            setRightPanel('NONE'); 
                                            setActivePanel('NONE');
                                            
                                            // 2. ABRE EL RADAR (LANZA LA SEÑAL)
                                            if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('open-radar-signal'));
                                        }} 
                                        className="p-3 rounded-full transition-all text-emerald-400 hover:bg-white/10 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                                        title="Centro de Mando"
                                    >
                                        <Settings size={18}/>
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => { 
                                    if(typeof playSynthSound === 'function') playSynthSound('click'); 
                                    // MATA AL RADAR
                                    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('close-radar-signal'));
                                    toggleRightPanel('PROFILE'); 
                                }} className={`p-3 rounded-full hover:bg-white/10 transition-all ${rightPanel==='PROFILE'?'text-white':'text-white/50 hover:text-white'}`}><User size={18}/></button>
                            )}
                        </div>
                      </div>
                  </div>
               </div>

               {/* 4. CHAT PANEL (Flotante) */}
               {activePanel === 'CHAT' && (
                   <div className="fixed bottom-40 left-1/2 transform -translate-x-1/2 w-80 z-[20000] pointer-events-auto">
                       <div className="animate-fade-in glass-panel rounded-3xl border border-white/10 bg-[#050505]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col h-96">
                           <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                               <div className="flex items-center gap-3">
                                   <div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-xs font-bold tracking-widest text-white">ASISTENTE</span>
                               </div>
                               <button onClick={() => setActivePanel('NONE')} className="text-white/30 hover:text-white transition-colors p-2"><X size={16}/></button>
                           </div>
                           <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                               <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-xs text-white/80 max-w-[90%] border border-white/5">Hola. ¿En qué puedo ayudarte con tu búsqueda inmobiliaria hoy?</div>
                           </div>
                           <div className="p-3 border-t border-white/5 bg-black/20">
                               <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/5">
                                   <input placeholder="Escribir mensaje..." className="bg-transparent w-full text-xs text-white outline-none placeholder-white/20"/>
                                   <button className="text-blue-400 hover:text-blue-300"><Send size={14}/></button>
                               </div>
                           </div>
                       </div>
                   </div>
               )}

               {/* 5. IA OMNI PANEL (Flotante) */}
               {activePanel === 'AI' && (
                   <div className="fixed bottom-40 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-[20000] pointer-events-auto">
                      <div className="animate-fade-in rounded-[2.5rem] p-8 bg-[#050505]/95 backdrop-blur-2xl border border-blue-500/30 shadow-[0_0_100px_rgba(59,130,246,0.2)]">
                          <div className="flex justify-between items-center mb-8 text-white">
                              <span className="text-xs font-bold tracking-[0.3em] flex items-center gap-2"><Sparkles size={14} className="text-blue-500 animate-pulse"/> OMNI INTELLIGENCE</span>
                              <button onClick={() => setActivePanel('NONE')} className="hover:text-red-500 transition-colors p-2"><X size={18}/></button>
                          </div>
                          <div className="h-48 flex flex-col items-center justify-center text-center gap-4 relative">
                              <p className="text-white/30 text-xs tracking-widest font-mono">{aiResponse ? aiResponse : "SISTEMAS A LA ESPERA DE COMANDO..."}</p>
                          </div>
                      </div>
                  </div>
               )}
           {/* ------------------------------------------------------- */}
               {/* ✅ 2. PERFIL DE AGENCIA (Icono Maletín 💼) - AQUÍ VA */}
               {/* ------------------------------------------------------- */}
               {(systemMode === 'AGENCY' && rightPanel === 'AGENCY_PROFILE') && ( 
                   <AgencyProfilePanel 
                       isOpen={true} 
                       onClose={() => setRightPanel('NONE')} 
                   /> 
               )}

            {/* 3. GESTOR DE STOCK (PORTFOLIO) */}
               {(systemMode === 'AGENCY' && rightPanel === 'AGENCY_PORTFOLIO') && ( 
                   <AgencyPortfolioPanel 
                       isOpen={true} 
                       onClose={() => setRightPanel('NONE')} 
                       
                       // 🔌 CASO 1: CREAR NUEVA (Inyectamos la credencial de Agencia)
                       onCreateNew={() => { 
                           // En lugar de null, pasamos un objeto con la "bandera" de agencia
                           setEditingProp({ isAgencyContext: true }); 
                           setRightPanel('NONE'); 
                           setSystemMode('ARCHITECT'); 
                       }} 
                       
                       // 🔌 CASO 2: EDITAR EXISTENTE (Mantenemos datos + credencial)
                       onEditProperty={(prop: any) => { 
                           // Combinamos los datos de la casa con la "bandera" de agencia
                           setEditingProp({ ...prop, isAgencyContext: true }); 
                           setRightPanel('NONE'); 
                           setSystemMode('ARCHITECT'); 
                       }} 
                   /> 
               )}

             

              {/* 6B. PANELES COMUNES Y USUARIO (Perfil Normal) */}
               {(systemMode !== 'AGENCY' && rightPanel === 'PROFILE') && ( 
                   <ProfilePanel 
                       rightPanel={rightPanel} 
                       toggleRightPanel={(p: any) => setRightPanel(p === rightPanel ? 'NONE' : p)} 
                       toggleMainPanel={toggleMainPanel} 
                       onEdit={handleEditAsset} 
                       selectedReqs={selectedReqs} 
                       soundEnabled={soundEnabled} 
                       playSynthSound={playSynthSound} 
                   /> 
               )}

               {/* 🚨 CORRECCIÓN AQUÍ: AÑADIMOS LA CONDICIÓN 'rightPanel === VAULT' 🚨 */}
               {rightPanel === 'VAULT' && (
                   <VaultPanel 
                       rightPanel={rightPanel} 
                       // La función de cierre debe ser directa para que la 'X' funcione
                       toggleRightPanel={(p: any) => setRightPanel('NONE')} 
                       favorites={localFavs} 
                       onToggleFavorite={handleToggleFavorite} 
                       map={map} 
                       soundEnabled={soundEnabled} 
                       playSynthSound={playSynthSound} 
                   />
               )}
   
   <HoloInspector 
       prop={selectedProp}
                   isOpen={activePanel === 'INSPECTOR'} 
                   onClose={() => setActivePanel('DETAILS')} 
                   soundEnabled={soundEnabled} 
                   playSynthSound={playSynthSound} 
               />
               
               {activePanel === 'DETAILS' && ( 
                   <DetailsPanel 
                       selectedProp={selectedProp} 
                       onClose={() => setActivePanel('NONE')} 
                       onToggleFavorite={handleToggleFavorite} 
                       favorites={localFavs} 
                       soundEnabled={soundEnabled} 
                       playSynthSound={playSynthSound} 
                       onOpenInspector={() => setActivePanel('INSPECTOR')} 
                   /> 
               )}

               {/* 6D. MARKETPLACES (Diferenciados por Modo) */}
               {(systemMode === 'AGENCY' && activePanel === 'MARKETPLACE') && ( 
                   <AgencyMarketPanel isOpen={true} onClose={() => setActivePanel('NONE')} /> 
               )}
               
               {(systemMode === 'EXPLORER' && activePanel === 'MARKETPLACE') && ( 
                   <div className="absolute inset-y-0 left-0 w-[420px] z-[50] shadow-2xl animate-slide-in-left bg-white pointer-events-auto">
                       <MarketPanel 
                           activeProperty={marketTargetProp || selectedProp} 
                           isOpen={true} 
                           onClose={() => { setActivePanel('NONE'); setMarketTargetProp(null); }} 
                       />
                   </div> 
               )}
               
           </>
       )}
    </div>
  );
}