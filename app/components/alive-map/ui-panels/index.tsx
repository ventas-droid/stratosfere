// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
// 👇 1. IMPORTANTE: AÑADIMOS ESTO PARA LEER LA URL
import { useSearchParams } from 'next/navigation';

// 1. IMPORTACIÓN UNIFICADA DE ICONOS (Sin duplicados)
import { 
  LayoutGrid, Search, Mic, Bell, MessageCircle, Heart, User, Sparkles, Activity, X, Send, 
  Square, Box, Crosshair, Sun, Phone, Maximize2, Bed, Bath, TrendingUp, CheckCircle2,
  Camera, Zap, Globe, Newspaper, Share2, Shield, Store, SlidersHorizontal,
  Briefcase, Home, Map as MapIcon,
  // 👇 NUEVOS AÑADIDOS (Para el sistema de Ubicación Personal)
  Lock, Unlock, Edit2
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

// --- 2. UTILIDADES ---
export const LUXURY_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100"
];
// --- 🔧 HERRAMIENTA DE REPARACIÓN DE DATOS (SANITIZER V3 - HONESTA Y SINCRONIZADA) ---
const sanitizePropertyData = (p: any) => {
  if (!p) return null;

  // 1. REPARACIÓN DE IMÁGENES (SIN FOTOS FALSAS)
  let safeImages: string[] = [];
  if (Array.isArray(p.images) && p.images.length > 0) {
      safeImages = p.images.map((i: any) => typeof i === 'string' ? i : i.url);
  } else if (p.img) {
      safeImages = [p.img];
  } else if (p.mainImage) {
      safeImages = [p.mainImage];
  }
  // 🛑 ELIMINADA LA IMAGEN DE EMERGENCIA. 
  // Si no hay foto, safeImages se queda vacío [].

  // 2. REPARACIÓN DE PRECIO (Núcleo Financiero)
  const safePrice = Number(p.priceValue || p.rawPrice || String(p.price).replace(/\D/g, '') || 0);

  return {
      ...p,
      id: String(p.id),
      
      // 🔥 LA CLAVE DEL ÉXITO: Sincronización total de precios
      price: safePrice, 
      priceValue: safePrice, // ESTO ACTUALIZA FAVORITOS
      rawPrice: safePrice,   // ESTO TAMBIÉN
      
      formattedPrice: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(safePrice),
      
      images: safeImages,
      img: safeImages[0] || null, // Si no hay foto, es NULL (Gris honesto)
      
      communityFees: p.communityFees || 0,
      mBuilt: Number(p.mBuilt || p.m2 || 0)
  };
};


export default function UIPanels({ 
  map, 
  searchCity, 
  lang, setLang, soundEnabled, toggleSound, systemMode, setSystemMode 
}: any) {
  
 // --- 🏠 MEMORIA DE UBICACIÓN PERSONAL (CASA) ---
  const [homeBase, setHomeBase] = useState<any>(null);

  // Cargar la casa guardada al iniciar (Solo en el cliente)
  useEffect(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('stratos_home_base');
          if (saved) {
              try {
                  setHomeBase(JSON.parse(saved));
              } catch (e) {
                  console.error("Error leyendo casa:", e);
              }
          }
      }
  }, []);
 
    // 1. LECTURA DE CREDENCIALES
  const searchParams = useSearchParams();
  const urlAccess = searchParams.get('access'); // ¿Viene pase en la URL?

  // 2. ESTADO INICIAL CERRADO (Por seguridad)
  const [gateUnlocked, setGateUnlocked] = useState(false);

  // 3. EFECTO DE MEMORIA Y LIMPIEZA DE RASTROS
  useEffect(() => {
    // A. Miramos si ya tenía el pase guardado en el bolsillo
    const storedAccess = localStorage.getItem('stratos_access_granted');
    
    // B. Si tiene pase en URL o en bolsillo
    if (urlAccess || storedAccess === 'true') {
        setGateUnlocked(true);
        
        // Guardar en bolsillo si no estaba
        if (!storedAccess) {
            localStorage.setItem('stratos_access_granted', 'true');
        }

        // 🔥 NUEVO: LIMPIEZA DE URL (MODO SIGILO)
        // Esto elimina "?access=granted" visualmente de la barra
        if (urlAccess) {
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({path: newUrl}, '', newUrl);
        }
    }
  }, [urlAccess]);

  // --- A. ESTADOS DEL SISTEMA (RESTO IGUAL) ---
  const [activePanel, setActivePanel] = useState('NONE'); 
  const [rightPanel, setRightPanel] = useState('NONE');   
  const [selectedProp, setSelectedProp] = useState<any>(null); 
  const [editingProp, setEditingProp] = useState<any>(null);
  const [marketProp, setMarketProp] = useState<any>(null);
  const [showRocket, setShowRocket] = useState(false);
  
  const [explorerIntroDone, setExplorerIntroDone] = useState(true);
  const [landingComplete, setLandingComplete] = useState(false); 
  const [showAdvancedConsole, setShowAdvancedConsole] = useState(false);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // ... (A PARTIR DE AQUÍ TODO SIGUE IGUAL, NO TOQUE NADA MÁS)
  
// --- C. VARIABLES DE FILTROS TÁCTICOS (NUEVOS RANGOS) ---
const [priceRange, setPriceRange] = useState({ min: 100000, max: 2000000 });
const [surfaceRange, setSurfaceRange] = useState({ min: 50, max: 500 });

// --- B. MEMORIA BLINDADA (FAVORITOS - CONEXIÓN SERVIDOR + LOCAL) ---
  const [localFavs, setLocalFavs] = useState<any[]>([]);

  // Añada el estado para saber qué estamos buscando
  const [searchContext, setSearchContext] = useState<'VIVIENDA' | 'NEGOCIO' | 'TERRENO'>('VIVIENDA');
 
  // 1. CARGA DE MEMORIA (PROTOCOLO HÍBRIDO: SERVIDOR PRIMERO, LUEGO LOCAL)
  useEffect(() => {
      const loadFavs = async () => {
          // A. INTENTO PRIMARIO: Leer del Servidor (La Verdad Absoluta)
          try {
              // Si el usuario está logueado, esto traerá sus favoritos reales
              const serverResponse = await getFavoritesAction();
              
              if (serverResponse && serverResponse.success && Array.isArray(serverResponse.data)) {
                  console.log("📥 VAULT: Sincronizado con Cuartel General. Activos:", serverResponse.data.length);
                  setLocalFavs(serverResponse.data);
                  
                  // Actualizamos la caché local para velocidad futura
                  localStorage.setItem('stratos_favorites_v1', JSON.stringify(serverResponse.data));
                  return; // Misión cumplida, no necesitamos mirar el bolsillo
              }
          } catch (e) {
              console.error("⚠️ Fallo de conexión con Vault Server (Usando modo offline):", e);
          }

          // B. PLAN DE CONTINGENCIA: Si falla el servidor, miramos el bolsillo (LocalStorage)
          const saved = localStorage.getItem('stratos_favorites_v1');
          if (saved) {
              try { setLocalFavs(JSON.parse(saved)); } 
              catch(e) { console.error("Error lectura local:", e); }
          }
      };

      loadFavs();

      // Escucha de eventos para recargas forzadas
      const onReloadFavs = () => loadFavs();
      window.addEventListener('reload-favorites', onReloadFavs);

      return () => window.removeEventListener('reload-favorites', onReloadFavs);
  }, []);

  // 2. REFLEJO EN LOCALSTORAGE (Para persistencia offline)
  useEffect(() => {
      if (localFavs.length > 0) {
          localStorage.setItem('stratos_favorites_v1', JSON.stringify(localFavs));
      }
  }, [localFavs]);

  // 3. FUNCIÓN DE GUARDADO BLINDADA (CONEXIÓN BIDIRECCIONAL)
  const handleToggleFavorite = async (prop: any) => {
      if (!prop) return;
      if (soundEnabled) playSynthSound('click');

      // Saneamiento de datos
      const safeProp = {
          ...prop,
          id: prop.id || Date.now(),
          title: prop.title || "Propiedad",
          formattedPrice: prop.formattedPrice || prop.price || "Consultar"
      };

      const exists = localFavs.some(f => String(f.id) === String(safeProp.id));
      let newFavs;
      let newStatus; 

      // --- FASE 1: ACTUALIZACIÓN VISUAL INMEDIATA (OPTIMISTIC UI) ---
      if (exists) {
          // A. BORRAR
          newFavs = localFavs.filter(f => String(f.id) !== String(safeProp.id));
          addNotification("Eliminado de colección");
          localStorage.removeItem(`fav-${safeProp.id}`); 
          newStatus = false;
      } else {
          // B. AÑADIR
          newFavs = [...localFavs, { ...safeProp, savedAt: Date.now() }];
          addNotification("Guardado en Favoritos");
          localStorage.setItem(`fav-${safeProp.id}`, 'true');
          setRightPanel('VAULT'); 
          newStatus = true;
      }
      
      // Actualizamos estado visual ya
      setLocalFavs(newFavs);

      // --- FASE 2: SINCRONIZACIÓN CON NANOCARDS ---
      if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sync-property-state', { 
              detail: { id: safeProp.id, isFav: newStatus } 
          }));
      }

      // --- FASE 3: GUARDADO REAL EN BASE DE DATOS (EL CABLE QUE FALTABA) ---
      try {
          // Esto asegura que si borra caché, el dato siga vivo en la nube
          await toggleFavoriteAction(String(safeProp.id));
          console.log(`☁️ SYNC: Estado de favorito actualizado en servidor: ${newStatus}`);
      } catch (error) {
          console.error("❌ Error sincronizando favorito con servidor:", error);
          // Opcional: Podríamos revertir el cambio visual aquí si falla
      }
  };
    // Estados Mercado e IA
  const [marketTab, setMarketTab] = useState('ONLINE');
  const [selectedReqs, setSelectedReqs] = useState<string[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  // Helpers
 // A. GESTIÓN PANEL LATERAL
  const toggleRightPanel = (p: string) => { 
      if(soundEnabled) playSynthSound('click'); 
      setRightPanel(rightPanel === p ? 'NONE' : p); 
  };

  // B. GESTIÓN DE MODOS (Aquí estaba el fallo)
  // Esta función decide si cambiamos un panel flotante o EL MODO ENTERO del sistema
  const toggleMainPanel = (p: string) => { 
      if(soundEnabled) playSynthSound('click'); 
      
      if (p === 'ARCHITECT') {
          // Si nos piden Arquitecto: Limpiamos edición, cerramos paneles y cambiamos MODO
          setEditingProp(null); 
          setRightPanel('NONE');
          setSystemMode('ARCHITECT');
      } else {
          // Si es otra cosa (Chat, Market...), solo cambiamos panel
          setActivePanel(activePanel === p ? 'NONE' : p); 
      }
  };

  // C. NUEVA FUNCIÓN: MANEJAR EDICIÓN
  const handleEditAsset = (asset: any) => {
      console.log("📝 EDITANDO ACTIVO:", asset);
      if(soundEnabled) playSynthSound('click');
      
      setEditingProp(asset);      
      setRightPanel('NONE');      
      setActivePanel('NONE');     // <--- AÑADE ESTO PARA CERRAR CHATS O DETALLES QUE ESTORBEN
      setSystemMode('ARCHITECT'); 
  };
  const toggleRequirement = (item: any) => {
      if(soundEnabled) playSynthSound('click');
      setSelectedReqs(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
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

    // 1. Sonido y Feedback
    if (soundEnabled) playSynthSound('click');
    setIsAiTyping(true); 

    // 2. 🔥 EL DISPARO REAL (Conectamos con el Mapa)
    if (searchCity) {
        searchCity(aiInput); 
        addNotification(`Rastreando: ${aiInput.toUpperCase()}`);
    } else {
        console.warn("⚠️ ALERTA: El cable 'searchCity' no está conectado arriba.");
    }

    // 3. Respuesta Visual de la IA
    setTimeout(() => { 
        setAiResponse(`Objetivo confirmado: "${aiInput}". Iniciando aproximación...`); 
        setIsAiTyping(false); 
        setAiInput(""); 
    }, 1500);
  };


// --- C. ESCUCHA DE EVENTOS (SISTEMA NERVIOSO CENTRAL) ---
  useEffect(() => {
    const handleOpenDetails = (e: any) => {
        // 🔥 AQUI ESTÁ EL TRUCO: SANITIZAMOS LO QUE LLEGA
        // Si viene de un Favorito antiguo con datos rotos, esto lo arregla al vuelo.
        const rawData = e.detail;
        
        // Usamos la herramienta de reparación que pusimos fuera
        const cleanProp = sanitizePropertyData(rawData);

        setSelectedProp(cleanProp);
        setActivePanel('DETAILS');
        if(soundEnabled) playSynthSound('click');
    };

    const handleToggleFavSignal = (e: any) => { 
        handleToggleFavorite(e.detail);
    };

    window.addEventListener('open-details-signal', handleOpenDetails);
    window.addEventListener('toggle-fav-signal', handleToggleFavSignal);
    
    // Nueva escucha para editar desde mercado (opcional si ya la tiene)
    const handleEditMarket = (e: any) => {
        setMarketProp(e.detail);
        setActivePanel('MARKETPLACE');
    };
    window.addEventListener('edit-market-signal', handleEditMarket);
    
   return () => {
        window.removeEventListener('open-details-signal', handleOpenDetails);
        window.removeEventListener('toggle-fav-signal', handleToggleFavSignal);
        window.removeEventListener('edit-market-signal', handleEditMarket);
    };
  }, [soundEnabled, localFavs]);

  // -----------------------------------------------------------------
  // 🔥 NUEVO RECEPTOR DE MERCADO (PEGAR ESTO JUSTO DEBAJO)
  // -----------------------------------------------------------------
  useEffect(() => {
      const handleEditMarket = (e: any) => {
          console.log("🛒 Abriendo Mercado para:", e.detail.id);
          setMarketProp(e.detail);       // 1. Guardamos la casa en la variable
          setActivePanel('MARKETPLACE'); // 2. Abrimos el panel automáticamente
      };

      window.addEventListener('edit-market-signal', handleEditMarket);
      
      return () => {
          window.removeEventListener('edit-market-signal', handleEditMarket);
      };
  }, []);
  // ----------------------------------------------------------------- 

// ---------------------------------------------------------------------------
  // ⚠️ ZONA NEUTRALIZADA: ESTA ERA LA LÍNEA QUE REINICIABA LA INTRO
  // LA HEMOS COMENTADO PARA QUE NO MOLESTE MÁS.
  // ---------------------------------------------------------------------------
  // useEffect(() => { if (systemMode !== 'EXPLORER') setExplorerIntroDone(false); }, [systemMode]);

  // ===========================================================================
  // ⚡️ LA PIEZA CLAVE: FUNCIÓN TRADUCTORA PARA EL EXPLORER (MENÚ BLANCO)
  // ===========================================================================
  const handleExplorerSearch = (datos: any) => {
      // 1. Sonido de éxito
      if (soundEnabled && typeof playSynthSound === 'function') playSynthSound('success');

      // 2. Definir límite máximo según categoría
      const maxSurface = (typeof CONTEXT_CONFIG !== 'undefined' && CONTEXT_CONFIG[datos.category]) 
          ? CONTEXT_CONFIG[datos.category].maxM2 
          : 50000;

      // 3. Empaquetar la orden para el mapa
      const payload = {
          priceRange: { min: 0, max: datos.price },      // Precio
          surfaceRange: { min: datos.surface, max: maxSurface }, // Superficie
          context: datos.category                        // Categoría
      };

      console.log("🛰️ EXPLORER BLANCO -> MAPA:", payload);

      // 4. Disparar la señal
      if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('apply-filter-signal', { 
              detail: payload 
          }));
      }

      // 5. Cerrar menú y notificar
      if (typeof setExplorerIntroDone === 'function') setExplorerIntroDone(true);
      if (typeof addNotification === 'function') addNotification(`Filtro Activo: ${datos.category}`);
  };
  // ===========================================================================
  // 🚀 CÓDIGO DE LANZAMIENTO (V3 - GPS CORREGIDO: NO MÁS MAR)
  // ===========================================================================
  const handleStratosLaunch = (data: any) => {
      // 1. Sonido Táctico
      if(soundEnabled) playSynthSound('warp');
      
      // 2. DICCIONARIO DE TRADUCCIÓN
      const TYPE_TRANSLATOR: Record<string, string> = {
          'flat': 'Piso',
          'penthouse': 'Ático',
          'villa': 'Villa',
          'house': 'Villa',
          'office': 'Oficina',
          'industrial': 'Nave',
          'land': 'Suelo',
          'solar': 'Suelo'
      };

      const rawType = data.type; 
      const dbType = TYPE_TRANSLATOR[rawType] || rawType; 

      // 3. Traductor de Contexto
      let derivedContext = 'VIVIENDA'; 
      if (['office', 'industrial', 'local', 'nave', 'oficina'].includes(rawType)) {
          derivedContext = 'NEGOCIO';
      } else if (['land', 'solar', 'suelo', 'terreno'].includes(rawType)) {
          derivedContext = 'TERRENO';
      }

      // 4. Enviar Señal de Filtros
      if (typeof window !== 'undefined') {
          console.log("🔍 Búsqueda Stratos:", { raw: rawType, translated: dbType, context: derivedContext });
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

      // 5. SISTEMA DE NAVEGACIÓN (CORREGIDO) 🧭
      // Si hay ubicación escrita, la buscamos. Si NO, vamos a MADRID.
      if(data.location && searchCity) {
          searchCity(data.location);
          if (typeof addNotification === 'function') addNotification(`Viajando a: ${data.location}`);
      } else {
          // 🔥 AQUÍ ESTÁ LA SOLUCIÓN AL "PUNTO PERDIDO EN EL MAR"
          console.log("📍 Sin destino específico. Volando a Base (Madrid).");
          map?.current?.flyTo({ 
              center: [-3.6883, 40.4280], // <--- COORDENADAS FIJAS
              pitch: 60, 
              zoom: 14,
              duration: 2000
          });
      }

      // 6. Aterrizaje
      setLandingComplete(true);
      setShowAdvancedConsole(false);
  };
// ===========================================================================
  // 🔒 PROTOCOLO DE SEGURIDAD (SOLO COHETE - SIN CANDADO)
  // ===========================================================================
  if (!gateUnlocked) {

    // YA NO HAY CAPA CIVIL. MOSTRAMOS DIRECTAMENTE LA CAPA MILITAR (COHETE)
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center pointer-events-auto animate-fade-in select-none overflow-hidden">
        
        {/* ILUSTRACIÓN DE FONDO (COHETE + ESTELA) */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-80" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
            {/* ESTELA */}
            <path 
                d="M-100,1200 C 400,900 600,1100 1100,700 C 1400,500 1500,450 1650,250" 
                fill="none" 
                stroke="black" 
                strokeWidth="1.5" 
                strokeDasharray="10 10" 
                className="opacity-40"
            />
            <path 
                d="M-200,1300 C 350,850 550,1000 1050,650 C 1450,450 1550,400 1680,280" 
                fill="none" 
                stroke="black" 
                strokeWidth="2" 
                strokeLinecap="round"
            />

            {/* COHETE */}
            <g transform="translate(1680, 250) rotate(40) scale(0.9)">
                <path d="M0,-80 C 25,-50 25,50 20,80 L -20,80 C -25,50 -25,-50 0,-80 Z" fill="white" stroke="black" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M-20,60 L -40,90 L -20,80" fill="white" stroke="black" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M20,60 L 40,90 L 20,80" fill="white" stroke="black" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M0,60 L 0,90" stroke="black" strokeWidth="2" />
                <circle cx="0" cy="-20" r="10" fill="white" stroke="black" strokeWidth="2" />
                <path d="M0,-80 L 0,-100" stroke="black" strokeWidth="2" />
            </g>
        </svg>

        {/* LOGO GIGANTE */}
        <div className="relative z-10 text-center mb-24 cursor-default">
            <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter leading-none text-black">
                Stratosfere OS.
            </h1>
        </div>

        {/* BOTÓN DE ACCESO DIRECTO AL REGISTRO */}
        <button 
            onClick={() => { 
                if(typeof playSynthSound === 'function') playSynthSound('click'); 
                // 🚀 SALTO AL HIPERESPACIO -> REGISTRO
                window.location.href = "/register"; 
            }} 
            className="group relative z-10 px-16 py-6 bg-[#0071e3] border-4 border-black text-white font-extrabold text-sm tracking-wider transition-all duration-200 shadow-[10px_10px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] hover:bg-black hover:text-white cursor-pointer uppercase"
        >
            CREAR CUENTA
        </button>
        
      </div>
    );
  }
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-end pb-8 animate-fade-in text-sans select-none">
       
       {systemMode === 'GATEWAY' && (
           <div className="fixed inset-0 z-[50000] flex items-center justify-center pointer-events-auto bg-[#050505]/80 backdrop-blur-xl animate-fade-in duration-1000">
               <DualGateway onSelectMode={(m:any) => { playSynthSound('boot'); setSystemMode(m); }} />
           </div>
       )}

     {/* BLOQUE 1: MODO ARQUITECTO (EDICIÓN BLINDADA Y SINCRONIZADA) 🚚 */}
       {systemMode === 'ARCHITECT' && (
           <ArchitectHud 
               soundFunc={typeof playSynthSound !== 'undefined' ? playSynthSound : undefined} 
               
               // 🔥 DATOS INICIALES (Para editar si existen)
               initialData={editingProp} 
               
               onCloseMode={(success: boolean, payload: any) => { 
                   // 1. Limpieza de memoria temporal
                   setEditingProp(null); 
                   
                   if (success && payload) {
                       console.log("✅ EDICIÓN COMPLETADA. Sincronizando sistemas...", payload);
                       
                       // 2. SANITIZAMOS LOS DATOS NUEVOS (Usando la herramienta que puso fuera)
                       const freshData = sanitizePropertyData(payload);

                       // 3. ACTUALIZAMOS FAVORITOS EN TIEMPO REAL 
                       // (Esto evita que al abrir favoritos salga el precio viejo)
                       setLocalFavs(currentFavs => {
                           return currentFavs.map(fav => {
                               if (String(fav.id) === String(freshData.id)) {
                                   console.log("🔄 Actualizando precio en Favoritos:", freshData.price);
                                   return { ...fav, ...freshData }; 
                               }
                               return fav;
                           });
                       });

                       // 4. ACTUALIZAMOS EL MAPA (Señal doble para asegurar)
                       if (typeof window !== 'undefined') {
                           // A. Si ya existía, actualizamos el marcador en vivo
                           window.dispatchEvent(new CustomEvent('update-property-signal', { 
                               detail: { id: freshData.id, updates: freshData } 
                           }));
                           
                           // B. Si era nueva, la añadimos al mapa
                           setTimeout(() => {
                               window.dispatchEvent(new CustomEvent('add-property-signal', { 
                                   detail: freshData 
                               }));
                           }, 100);
                       }
                       
                       // 5. TRANSICIÓN A MODO EXPLORADOR
                       setSystemMode('EXPLORER');
                       setLandingComplete(true); 
                       
                       if (typeof setExplorerIntroDone === 'function') {
                           setExplorerIntroDone(true); 
                       }

                   } else {
                       // SI CANCELA: Volvemos al menú principal
                       setSystemMode('GATEWAY');
                   }
               }} 
           />
       )}

     {/* BLOQUE 2: MODO EXPLORADOR (COMPRAR) */}
       {systemMode === 'EXPLORER' && (
           <>
               {/* ================================================================
                   🔥 1. CONSOLA STRATOS (EL CEREBRO NUEVO)
                   Sustituye al antiguo ExplorerHud.
                   Se muestra si:
                   A) No hemos aterrizado (!landingComplete) -> Intro
                   B) Pulsamos el botón de filtros (showAdvancedConsole) -> Filtros
                   ================================================================ */}
               {(showAdvancedConsole || !landingComplete) && (
                   <StratosConsole 
                       isInitial={!landingComplete} // Si es manual, muestra la X de cerrar
                       
                       // PERMITE CERRARLO MANUALMENTE
                       onClose={() => setShowAdvancedConsole(false)}

                       // EJECUTA LA BÚSQUEDA Y ATERRIZA
                       onLaunch={handleStratosLaunch}
                   />
               )}

               {/* INTERFAZ FLOTANTE (Logo, Botones, etc.) */}
               <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
  
  {/* --- 1. IZQUIERDA: SOLO EL LOGO (Sin botón, texto negro y grueso) --- */}
  <div className="absolute top-8 left-8 pointer-events-auto animate-fade-in-up">
    <h1 className="text-6xl font-extrabold tracking-tighter text-black leading-none cursor-default">
      Stratosfere OS.
    </h1>
  </div>
                  
                 <div className="absolute top-8 right-8 pointer-events-auto flex flex-col gap-3 items-end w-[280px] animate-fade-in-up delay-100">
    <div className="glass-panel p-5 rounded-[1.5rem] w-full shadow-2xl bg-[#050505]/90 border border-white/10 hover:border-blue-500/30 transition-all">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5 text-white">
            {/* CAMBIO AQUÍ: Sin icono, tipografía logo (extrabold, tracking-tighter), mismo tamaño [10px] */}
            <span className="text-[10px] font-extrabold tracking-tighter flex items-center gap-2">SYSTEM</span>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_blue]"></div><span className="text-[9px] font-mono text-blue-400">CONECTADO</span></div>
        </div>
        <div className="space-y-3">
            <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={()=>{playSynthSound('click'); setLang(lang==='ES'?'EN':'ES')}}><span className="tracking-widest">IDIOMA</span> <span className="text-white font-mono">{lang}</span></div>
            <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={()=>{playSynthSound('click'); toggleSound();}}><span className="tracking-widest">SONIDO</span> <span className={soundEnabled ? "text-emerald-400" : "text-zinc-500"}>{soundEnabled ? 'ON' : 'MUTED'}</span></div>
            <div className="flex justify-between text-[10px] text-white/60 cursor-pointer hover:text-white" onClick={handleDayNight}><span className="tracking-widest">VISIÓN</span> <div className="flex items-center gap-1"><Sun size={10}/> DÍA/NOCHE</div></div>
        </div>
        <div className="mt-4 pt-2 border-t border-white/5 space-y-1">
            {notifications.map((n,i)=>(<div key={i} className="bg-blue-900/20 border-l-2 border-blue-500 p-2 rounded flex items-center gap-2 animate-slide-in-right"><Bell size={10} className="text-blue-400"/><span className="text-[9px] text-blue-100">{n.title}</span></div>))}
        </div>
    </div>
</div>

<div className="absolute top-1/2 -translate-y-1/2 right-8 pointer-events-auto flex flex-col gap-2 animate-fade-in-right">
    <button onClick={() => {playSynthSound('click'); map?.current?.flyTo({pitch: 0});}} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black transition-all"><Square size={16}/></button>
    <button onClick={() => {playSynthSound('click'); map?.current?.flyTo({pitch: 60});}} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white hover:bg-white hover:text-black transition-all"><Box size={16}/></button>
</div>
      {/* --- WIDGET DE UBICACIÓN PERSONAL (CASA / GPS / EDICIÓN) --- */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2 group animate-fade-in-down z-[100]">
            
            {/* A. BOTÓN PRINCIPAL (IR A CASA O BUSCAR GPS) */}
            <button 
                className={`
                    p-4 rounded-full backdrop-blur-xl border transition-all duration-500 shadow-2xl relative
                    ${homeBase 
                        ? 'bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.4)] scale-105' 
                        : 'bg-black/40 text-white border-white/10 hover:bg-white/10 hover:scale-105'}
                `}
                onClick={() => {
                    if(soundEnabled) playSynthSound('click');
                    
                    if (homeBase) {
                        // --> CASO 1: TIENE CASA (Vuelo Directo a Base)
                        addNotification("Volviendo a Ubicación Personal");
                        map?.current?.flyTo({
                            center: homeBase.center,
                            zoom: homeBase.zoom,
                            pitch: homeBase.pitch,
                            bearing: -20,
                            duration: 2500,
                            essential: true
                        });
                    } else {
                        // --> CASO 2: NO TIENE CASA (Buscar Satélites y Guardar)
                        if ("geolocation" in navigator) {
                            addNotification("Configurando Ubicación...");
                            navigator.geolocation.getCurrentPosition(
                                (position) => {
                                    const { latitude, longitude } = position.coords;
                                    
                                    // 1. Volar al sitio
                                    map?.current?.flyTo({
                                        center: [longitude, latitude],
                                        zoom: 16.5,
                                        pitch: 60,
                                        duration: 3000
                                    });

                                    // 2. Guardar en memoria y actualizar icono
                                    const newData = { center: [longitude, latitude], zoom: 16.5, pitch: 60 };
                                    localStorage.setItem('stratos_home_base', JSON.stringify(newData));
                                    setHomeBase(newData); // <--- ESTO CAMBIA EL ICONO A 'CASA'
                                    
                                    addNotification("Ubicación guardada con Candado");
                                },
                                () => addNotification("Ubicación no disponible")
                            );
                        }
                    }
                }}
                title={homeBase ? "Ir a mi ubicación guardada" : "Localizar y guardar ubicación"}
            >
                {/* ICONOGRAFÍA DINÁMICA */}
                {homeBase ? (
                    <Home className="w-5 h-5" strokeWidth={2.5} />
                ) : (
                    <Crosshair className="w-5 h-5 opacity-80" />
                )}
                
                {/* CANDADO DE SEGURIDAD (Indicador de "Fijado") */}
                {homeBase && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white rounded-full flex items-center justify-center border border-white shadow-sm animate-bounce-small">
                        <Lock size={8} />
                    </div>
                )}
            </button>

            {/* B. BOTÓN EDICIÓN (LÁPIZ) - Solo aparece si ya tienes casa y pasas el ratón */}
            {homeBase && (
                <button
                    onClick={() => {
                        if(soundEnabled) playSynthSound('click');
                        if (map?.current) {
                            // SOBRESCRIBIR LA CASA CON LA VISTA ACTUAL DEL MAPA
                            const center = map.current.getCenter();
                            const zoom = map.current.getZoom();
                            const pitch = map.current.getPitch();
                            
                            const newData = { center: [center.lng, center.lat], zoom, pitch };
                            localStorage.setItem('stratos_home_base', JSON.stringify(newData));
                            setHomeBase(newData); // Actualizar estado visual
                            
                            addNotification("Nueva ubicación fijada aquí");
                        }
                    }}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-lg opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 duration-300 cursor-pointer"
                    title="Actualizar mi ubicación a lo que veo ahora"
                >
                    <Edit2 size={14} />
                </button>
            )}
        </div>
               </div> 
               
              {/* DOCK BARRA INFERIOR (SONIDO ACTIVADO) */}
               <div className="absolute bottom-10 z-[10000] w-full px-6 pointer-events-none flex justify-center items-center">
                  <div className="pointer-events-auto w-full max-w-3xl animate-fade-in-up delay-300">
                      <div className="relative glass-panel rounded-full p-2 px-6 flex items-center justify-between shadow-2xl gap-4 bg-[#050505]/90 backdrop-blur-xl border border-white/10">
                        
                       {/* ZONA 1: IZQUIERDA */}
                        <div className="flex items-center gap-1">
                            {/* Botón Menú Principal */}
                            <button 
                                onClick={() => { playSynthSound('click'); setSystemMode('GATEWAY'); }} 
                                className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all" 
                                title="Menú Principal"
                            >
                                <LayoutGrid size={18}/>
                            </button>
                            
                            {/* 🔥 BOTÓN FILTROS (CORREGIDO): AHORA ABRE LA CONSOLA NUEVA */}
                            <button 
                                onClick={() => { playSynthSound('click'); setShowAdvancedConsole(true); }} 
                                className={`p-3 rounded-full hover:bg-white/10 transition-all ${showAdvancedConsole ? 'text-white bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-white/50 hover:text-white'}`} 
                                title="Filtros Avanzados"
                            >
                                <SlidersHorizontal size={18}/>
                            </button>
                        </div>

                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

                        {/* ZONA 2: OMNI SEARCH (ESCRIBIBLE + ENTER PARA VOLAR, NO ABRE FILTROS) */}
<div
  className="flex-grow flex items-center gap-4 bg-white/[0.05] px-5 py-3 rounded-full border border-white/5 focus-within:border-blue-500/50 focus-within:bg-blue-500/5 transition-all group"
>
  <Search size={16} className="text-white/40 group-focus-within:text-white transition-colors"/>
  <input
    value={aiInput}
    onChange={(e) => setAiInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleAICommand(e);
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
                        
                     {/* ZONA 3: APLICACIONES (SONIDO ACTIVADO) */}
                        <div className="flex items-center gap-1">
                            
                            {/* 1. MARKETPLACE (MULTITAREA: NO cierra perfil) */}
                            <button 
                                onClick={() => { 
                                    playSynthSound('click'); 
                                    setActivePanel(activePanel === 'MARKETPLACE' ? 'NONE' : 'MARKETPLACE'); 
                                }} 
                                className={`p-3 rounded-full hover:bg-white/10 transition-all ${activePanel==='MARKETPLACE'?'text-emerald-400':'text-white/50 hover:text-white'}`}
                            >
                                <Store size={18}/>
                            </button>

                            {/* 2. CHAT */}
                            <button 
                                onClick={() => { 
                                    playSynthSound('click'); 
                                    setActivePanel(activePanel === 'CHAT' ? 'NONE' : 'CHAT'); 
                                }} 
                                className={`p-3 rounded-full hover:bg-white/10 transition-all ${activePanel==='CHAT' ? 'text-blue-400 bg-blue-500/10' : 'text-white/50 hover:text-white'}`}
                            >
                                <MessageCircle size={18}/>
                            </button>
                            
                            {/* 3. IA OMNI */}
                            <button 
                                onClick={() => { 
                                    playSynthSound('click'); 
                                    setActivePanel(activePanel === 'AI' ? 'NONE' : 'AI'); 
                                }} 
                                className={`p-3 rounded-full transition-all relative group ${activePanel==='AI' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-blue-500/10 text-blue-400'}`}
                            >
                                <Sparkles size={18} className="relative z-10"/>
                            </button>
                            
                            {/* 4. BÓVEDA (DERECHA) */}
                            <button 
                                onClick={() => { 
                                    playSynthSound('click'); 
                                    toggleRightPanel('VAULT'); 
                                }} 
                                className={`p-3 rounded-full hover:bg-white/10 transition-all ${rightPanel==='VAULT'?'text-red-500':'text-white/50 hover:text-white'}`}
                            >
                                <Heart size={18}/>
                            </button>
                            
                            {/* 5. PERFIL (DERECHA) */}
                            <button 
                                onClick={() => { 
                                    playSynthSound('click'); 
                                    toggleRightPanel('PROFILE'); 
                                }} 
                                className={`p-3 rounded-full hover:bg-white/10 transition-all ${rightPanel==='PROFILE'?'text-white':'text-white/50 hover:text-white'}`}
                            >
                                <User size={18}/>
                            </button>
                        </div>
                        
                      {/* 🔥 ESTOS SON LOS CIERRES QUE FALTABAN Y CAUSABAN EL ERROR ROJO: */}
                      </div>
                  </div>
               </div>

         {/* --- SISTEMA DE CONSOLAS (CORREGIDO) --- */}
               
               {/* 1. FILTROS INTELIGENTES: ELIMINADO 🗑️ */}
               {/* (La nueva consola StratosConsole se encarga de esto ahora) */}

            {/* 2. CHAT PANEL */}
               {activePanel === 'CHAT' && (
                   <div className="fixed bottom-40 left-1/2 transform -translate-x-1/2 w-80 z-[20000] pointer-events-auto">
                       <div className="animate-fade-in glass-panel rounded-3xl border border-white/10 bg-[#050505]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col h-96">
                           <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                               <div className="flex items-center gap-3">
                                   <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                   <span className="text-xs font-bold tracking-widest text-white">ASISTENTE</span>
                               </div>
                               <button onClick={() => setActivePanel('NONE')} className="text-white/30 hover:text-white transition-colors p-2"><X size={16}/></button>
                           </div>
                           <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                               <div className="flex flex-col gap-1 items-start animate-fade-in">
                                   <span className="text-[9px] text-white/30 ml-2">SOPORTE • AHORA</span>
                                   <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-xs text-white/80 max-w-[90%] border border-white/5">
                                       Hola. ¿En qué puedo ayudarte con tu búsqueda inmobiliaria hoy?
                                   </div>
                               </div>
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

               {/* 3. IA OMNI PANEL */}
               {activePanel === 'AI' && (
                   <div className="fixed bottom-40 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-[20000] pointer-events-auto">
                      <div className="animate-fade-in rounded-[2.5rem] p-8 bg-[#050505]/95 backdrop-blur-2xl border border-blue-500/30 shadow-[0_0_100px_rgba(59,130,246,0.2)]">
                          <div className="flex justify-between items-center mb-8 text-white">
                              <span className="text-xs font-bold tracking-[0.3em] flex items-center gap-2">
                                  <Sparkles size={14} className="text-blue-500 animate-pulse"/> OMNI INTELLIGENCE
                              </span>
                              <button onClick={() => setActivePanel('NONE')} className="hover:text-red-500 transition-colors p-2"><X size={18}/></button>
                          </div>
                          <div className="h-48 flex flex-col items-center justify-center text-center gap-4 relative">
                              <div className="w-full">
                                  {isAiTyping ? (
                                      <div className="flex justify-center gap-2">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"/>
                                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"/>
                                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"/>
                                      </div>
                                  ) : (
                                      <p className="text-white/30 text-xs tracking-widest font-mono">
                                          {aiResponse ? aiResponse : "SISTEMAS A LA ESPERA DE COMANDO..."}
                                      </p>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
               )}
           
           {/* 🔥 AQUÍ ESTÁN LAS LLAVES DE CIERRE QUE FALTABAN: */}
           </>
       )}
{/* =================================================================
    BLOQUE 3 MAESTRO: MODO AGENCIA (OMNI COMPLETA CON BÓVEDA)
   ================================================================= */}
       {systemMode === 'AGENCY' && (
           <>
               {/* 1. BARRA OMNI DE CRISTAL (DISEÑO 100% PREMIUM) */}
               <div className="absolute bottom-10 z-[10000] w-full px-6 pointer-events-none flex justify-center items-center">
                   <div className="pointer-events-auto w-full max-w-3xl animate-fade-in-up delay-300">
                       
                       <div className="relative glass-panel rounded-full p-2 px-6 flex items-center justify-between shadow-2xl gap-4 bg-[#050505]/90 backdrop-blur-xl border border-white/10">

                           {/* A. IZQUIERDA: SALIR */}
                           <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => { 
                                        if(typeof playSynthSound === 'function') playSynthSound('click'); 
                                        setSystemMode('GATEWAY'); 
                                    }} 
                                    className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
                                    title="Salir de Agencia"
                                >
                                    <LayoutGrid size={18}/>
                                </button>
                           </div>

                           <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

                           {/* B. CENTRO: BUSCADOR (IA TÁCTICA) */}
                           <div className="flex-grow flex items-center gap-4 bg-white/[0.05] px-5 py-3 rounded-full border border-white/5 focus-within:border-emerald-500/50 focus-within:bg-emerald-500/5 transition-all group">
                               <Search size={16} className="text-white/40 group-focus-within:text-white transition-colors"/>
                               <input
                                   value={aiInput}
                                   onChange={(e) => setAiInput(e.target.value)}
                                   onKeyDown={(e) => {
                                       if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); handleAICommand(e); }
                                       if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); (e.target as HTMLInputElement).blur(); }
                                   }}
                                   className="bg-transparent text-white w-full outline-none text-xs font-bold tracking-widest uppercase placeholder-white/20 cursor-text"
                                   placeholder="COMANDO DE AGENCIA..."
                               />
                               <Mic size={16} className="text-white/30"/>
                           </div>

                           <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

                           {/* C. DERECHA: HERRAMIENTAS (AHORA CON BÓVEDA) */}
                           <div className="flex items-center gap-1">
                               
                               {/* 1. RADAR (Mira Táctica) */}
                               <button 
                                   onClick={() => { 
                                       if(typeof playSynthSound === 'function') playSynthSound('ping'); 
                                       if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('open-radar-signal'));
                                   }} 
                                   className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
                                   title="Activar Escáner"
                               >
                                   <Crosshair size={18} />
                               </button>

                               {/* 2. MERCADO (Licencias) */}
                               <button 
                                   onClick={() => { 
                                       if(typeof playSynthSound === 'function') playSynthSound('click'); 
                                       setActivePanel(activePanel === 'AGENCY_MARKET' ? 'NONE' : 'AGENCY_MARKET'); 
                                   }} 
                                   className={`p-3 rounded-full hover:bg-white/10 transition-all ${activePanel === 'AGENCY_MARKET' ? 'text-white bg-white/10' : 'text-white/50 hover:text-white'}`}
                                   title="Mercado de Servicios"
                               >
                                   <Shield size={18} />
                               </button>

                               {/* 3. BÓVEDA / FAVORITOS (¡AÑADIDO!) */}
                               <button 
                                   onClick={() => { 
                                       if(typeof playSynthSound === 'function') playSynthSound('click'); 
                                       toggleRightPanel('VAULT'); 
                                   }} 
                                   className={`p-3 rounded-full hover:bg-white/10 transition-all ${rightPanel === 'VAULT' ? 'text-red-500 bg-white/10' : 'text-white/50 hover:text-white'}`}
                                   title="Bóveda de Referencias"
                               >
                                   <Heart size={18}/>
                               </button>

                               {/* 4. PERFIL AGENCIA */}
                               <button 
                                   onClick={() => { 
                                       if(typeof playSynthSound === 'function') playSynthSound('click'); 
                                       toggleRightPanel('AGENCY_PROFILE'); 
                                   }} 
                                   className={`p-3 rounded-full hover:bg-white/10 transition-all ${rightPanel === 'AGENCY_PROFILE' ? 'text-white bg-white/10' : 'text-white/50 hover:text-white'}`}
                                   title="Perfil Corporativo"
                               >
                                   <Briefcase size={18}/>
                               </button>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 2. PANELES LATERALES DE AGENCIA */}
               <AgencyProfilePanel 
                   isOpen={rightPanel === 'AGENCY_PROFILE'} 
                   onClose={() => toggleRightPanel('NONE')} 
               />
               <AgencyMarketPanel 
                   isOpen={activePanel === 'AGENCY_MARKET'} 
                   onClose={() => setActivePanel('NONE')} 
               />
               {/* Cartera (si la usa) */}
               <AgencyPortfolioPanel 
                   isOpen={rightPanel === 'AGENCY_PORTFOLIO'} 
                   onClose={() => setRightPanel('NONE')} 
                   onCreateNew={() => handleEditAsset(null)} 
                   onEditProperty={(p:any) => handleEditAsset(p)}
               />
           </>
       )}

  {/* --- PANELES LATERALES Y FLOTANTES (SISTEMA MULTITAREA) --- */}
       
       {/* 1. PERFIL (COLUMNA DERECHA) */}
       {/* Se mantiene visible si rightPanel es 'PROFILE' */}
       <ProfilePanel 
           rightPanel={rightPanel} 
           toggleRightPanel={toggleRightPanel} 
           toggleMainPanel={toggleMainPanel} 
           onEdit={handleEditAsset}       
           selectedReqs={selectedReqs}    
           soundEnabled={soundEnabled} 
           playSynthSound={playSynthSound} 
       />

    {/* 2. MERCADO DE SERVICIOS (COLUMNA IZQUIERDA) */}
     {activePanel === 'MARKETPLACE' && (
        <div className="absolute inset-y-0 left-0 w-[420px] z-[50] shadow-2xl animate-slide-in-left bg-white pointer-events-auto">
            
            <MarketPanel 
                onClose={() => setActivePanel('NONE')} 
                activeProperty={marketProp} // <--- ¡ESTO ES LO QUE LE FALTABA!
            />
        </div>
     )}
       
       {/* 3. BÓVEDA DE FAVORITOS (AHORA CON CANDADO) */}
       {rightPanel === 'VAULT' && (
           <VaultPanel 
               rightPanel={rightPanel} 
               // Esto asegura que al cerrar se ponga en NONE
               toggleRightPanel={(p: any) => setRightPanel('NONE')} 
               favorites={localFavs}               
               onToggleFavorite={handleToggleFavorite} 
               map={map} 
               soundEnabled={soundEnabled} 
               playSynthSound={playSynthSound} 
           />
       )}
       
       {/* 4. INSPECTOR HOLOGRÁFICO (FLOTANTE) */}
       <HoloInspector 
           prop={selectedProp} 
           isOpen={activePanel === 'INSPECTOR'} 
           onClose={() => setActivePanel('DETAILS')} 
           soundEnabled={soundEnabled} 
           playSynthSound={playSynthSound} 
       />
       
       {/* 5. FICHA DE DETALLES (CENTRAL) */}
       {activePanel === 'DETAILS' && (
           <DetailsPanel 
               selectedProp={selectedProp} 
               onClose={() => setActivePanel('NONE')} 
               onToggleFavorite={handleToggleFavorite} // <--- GATILLO COMPARTIDO
               favorites={localFavs}               // <--- MUNICIÓN COMPARTIDA
               soundEnabled={soundEnabled} 
               playSynthSound={playSynthSound} 
               onOpenInspector={() => setActivePanel('INSPECTOR')} 
           />
       )}

      {/* ================================================================
           🔥 CAPA DE SUPERPOSICIÓN: STRATOS CONSOLE (CORREGIDA)
           Ahora traduce el tipo (Oficina/Suelo) al contexto correcto.
           ================================================================ */}
       {systemMode === 'EXPLORER' && !landingComplete && (
           <StratosConsole 
               isInitial={true}
               onLaunch={(data: any) => {
                   if(soundEnabled) playSynthSound('warp');
                   
                   // 🧠 TRADUCTOR INTELIGENTE DE CONTEXTO
                   // Si elige "Oficina" -> Cambia modo a NEGOCIO.
                   // Si elige "Suelo" -> Cambia modo a TERRENO.
                   let derivedContext = 'VIVIENDA'; 
                   const t = data.type; // 'office', 'land', etc.

                   if (['office', 'industrial', 'local', 'nave'].includes(t)) {
                       derivedContext = 'NEGOCIO';
                   } else if (['land', 'solar'].includes(t)) {
                       derivedContext = 'TERRENO';
                   }

                   // 1. Enviar orden de filtros al mapa
                   if (typeof window !== 'undefined') {
                       window.dispatchEvent(new CustomEvent('apply-filter-signal', { 
                           detail: { 
                               priceRange: { min: 0, max: data.priceMax },
                               surfaceRange: { min: 0, max: 10000 }, // Rango abierto por defecto
                               context: derivedContext, // <--- LA CLAVE: Contexto dinámico
                               specs: data.specs
                           } 
                       }));
                   }

                   // 2. Volar a la ciudad
                   if(data.location && searchCity) {
                       searchCity(data.location);
                   } else {
                       map?.current?.flyTo({ pitch: 60, zoom: 14 });
                   }

                   // 3. Retirar la consola (Aterrizaje completado)
                   setLandingComplete(true);
               }}
           />
       )}

    </div>
  );
}