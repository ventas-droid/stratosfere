// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Activity, ArrowLeft, ArrowRight, ArrowUp, Camera, Check, CheckCircle2, Clock,
  Eye, FileCheck, FileText, Flame, Globe, LayoutGrid, Loader2, Map as MapIcon,
  MapPin, Megaphone, Paintbrush, Radar, Ruler, Search, Shield, ShieldCheck, Zap, Crown, TrendingUp,
  Smartphone, Truck, UploadCloud, Video, X, Award, Play, Film, Navigation,
  Box, Droplets, Star, Bed, Bath, Maximize2, Building2, Home, Briefcase, LandPlot, Warehouse, Sun, Handshake, Coins, Calculator, Lock,
  // 🔥 NUEVOS ICONOS AÑADIDOS
  Wind, Thermometer, Armchair, Tent, Layers, Compass, SunDim, Trees, Hammer
} from "lucide-react";

import MapNanoCard from "./MapNanoCard";
import ExplorerHud from "./ExplorerHud";
import ProfilePanel from "./ProfilePanel";

// 👇 AÑADA SOLO ESTAS DOS LÍNEAS AQUÍ:
import StepAgencyExtras from "./StepAgencyExtras";
import StepOpenHouse from "./StepOpenHouse";
import StepAgencyB2B from "./StepAgencyB2B"; // 👈 AÑADA ESTA LÍNEA

//  Hemos añadido getUserMeAction para poder verificar el rol
import { savePropertyAction, getUserMeAction } from '@/app/actions';
import { getMarketRadarAction } from '@/app/actions-market';
import { getUploadUrl } from '@/app/utils/r2-server'; // 📞 Nueva Radio R2 directa
import imageCompression from 'browser-image-compression'; // 🗜️ Para comprimir

const MAPBOX_TOKEN = "pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw";

// ==================================================================================
// 1. CONSTANTES GLOBALES (DEFINICIÓN ÚNICA - TIPOLOGÍAS AMPLIADAS)
// ==================================================================================
const OFFICIAL_TYPES = [
  { id: "flat", label: "Piso", icon: Building2 },
  { id: "penthouse", label: "Ático", icon: Sun },
  { id: "duplex", label: "Dúplex", icon: Layers }, // 🔥 NUEVO
  { id: "loft", label: "Loft", icon: Maximize2 },   // 🔥 NUEVO
  { id: "villa", label: "Villa", icon: Home },
  { id: "bungalow", label: "Bungalow", icon: Tent }, // 🔥 NUEVO
  { id: "office", label: "Oficina", icon: Briefcase },
  { id: "land", label: "Suelo", icon: LandPlot },
  { id: "industrial", label: "Nave", icon: Warehouse }
];

const PROPERTY_ICONS = {
  "Piso": Building2,
  "Ático": Sun,
  "Dúplex": Layers,    // 🔥 NUEVO
  "Loft": Maximize2,   // 🔥 NUEVO
  "Villa": Home,
  "Bungalow": Tent,    // 🔥 NUEVO
  "Oficina": Briefcase,
  "Suelo": LandPlot,
  "Nave": Warehouse
};

// --- PARSEADOR LOCAL ---
const parsePriceInput = (input: any): number => {
  if (typeof input === 'number') return input;
  if (!input) return 0;
  let str = String(input).toUpperCase().trim();
  let multiplier = 1;
  if (str.includes("M")) multiplier = 1_000_000;
  else if (str.includes("K")) multiplier = 1_000;
  str = str.replace(/\./g, "").replace(/,/g, ".").replace(/[^\d.]/g, "");
  const val = parseFloat(str);
  return (isNaN(val) ? 0 : val) * multiplier;
};

// ==================================================================================
// 🧠 DB MERCADO
// ==================================================================================
const REAL_MARKET_DB: Record<string, number> = {
  "IBIZA": 9200, "FORMENTERA": 8500, "SAN SEBASTIÁN": 6600, "MARBELLA": 6100,
  "MADRID": 5950, "BARCELONA": 5500, "SOTOGRANDE": 4800, "SITGES": 4600,
  "POZUELO": 5300, "MAJADAHONDA": 4900, "LAS ROZAS": 4300, "SANT CUGAT": 4700,
  "CALVIÀ": 5100, "ANDRATX": 6800, "BENAHAVÍS": 5200,
  "PALMA": 4200, "MÁLAGA": 3500, "VALENCIA": 2950, "ALICANTE": 2700,
  "BENIDORM": 3100, "JÁVEA": 3300, "DENIA": 2800, "ALTEA": 3000, "CALPE": 2900,
  "SANT JOAN": 2300, "CAMPELLO": 2500, "TORREVIEJA": 2100, "ORIHUELA": 2400,
  "ESTEPONA": 3900, "FUENGIROLA": 3600, "NERJA": 3400, "CADIZ": 2800,
  "CANARIAS": 2600, "LAS PALMAS": 2500, "SANTA CRUZ": 2400, "ADEJE": 3800,
  "BILBAO": 3700, "VITORIA": 3100, "SANTANDER": 3000, "PAMPLONA": 2800,
  "A CORUÑA": 2700, "VIGO": 2600, "SANTIAGO": 2300, "GIJÓN": 2200, "OVIEDO": 2000,
  "ZARAGOZA": 2100, "SEVILLA": 2600, "GRANADA": 2300, "CÓRDOBA": 1900,
  "VALLADOLID": 2000, "SALAMANCA": 2400, "BURGOS": 2100, "LEÓN": 1700,
  "TOLEDO": 1800, "GUADALAJARA": 2100, "SEGOVIA": 2000,
  "MURCIA": 1800, "CARTAGENA": 1600, "ALMERÍA": 1700, "HUELVA": 1600,
  "CASTELLÓN": 1500, "TARRAGONA": 2300, "GIRONA": 2700, "LLEIDA": 1400,
  "BADAJOZ": 1500, "CÁCERES": 1600, "CIUDAD REAL": 1200, "ALBACETE": 1700,
  "LOGROÑO": 1900, "HUESCA": 1700, "TERUEL": 1300, "SORIA": 1400,
  "ZAMORA": 1300, "PALENCIA": 1500, "ÁVILA": 1400, "CUENCA": 1300,
  "JAÉN": 1300, "CEUTA": 1900, "MELILLA": 1800,
};
const NATIONAL_AVG = 2150;

// ==================================================================================
// ✅ ARCHITECT HUD (MAIN)
// ==================================================================================
export default function ArchitectHud({ onCloseMode, soundFunc, initialData }: any) {
const STEPS = [
  "LOCATION",
  "BASICS",
  "SPECS",
  "DESCRIPTION",
  "ENERGY",
  "MEDIA",
  "PRICE",
  "ANALYSIS",
  "RADAR",
  "SUCCESS",
];
const LABEL_STEPS = ["LOCATION","BASICS","SPECS","DESCRIPTION","ENERGY","MEDIA","PRICE","ANALYSIS","RADAR"];

  const [step, setStep] = useState<string>("LOCATION");
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(false);
 const [showProfile, setShowProfile] = useState(false);
const [showWizard, setShowWizard] = useState(true);

  
/// ---------------------------------------------------------------------------
  // 🧠 CEREBRO DE GESTIÓN HÍBRIDO + ANTENA DE MAPA
  // ---------------------------------------------------------------------------
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
// 🔥 PARCHE DE EMERGENCIA: DETECTAR ROL DE AGENCIA AUTOMÁTICAMENTE
  useEffect(() => {
    const verifyRole = async () => {
      try {
        // @ts-ignore
        const res = await getUserMeAction();
        if (res?.success && res.data?.role === 'AGENCIA') {
           console.log("🦅 HUD: RANGO DE AGENCIA CONFIRMADO. ACTIVANDO HERRAMIENTAS.");
           setFormData((prev: any) => ({ ...prev, isAgencyContext: true }));
        }
      } catch (e) { console.error("Error verificando rol", e); }
    };
    verifyRole();
  }, []);
  // 1. Detectar cuál es la propiedad activa real
  const activeProperty = myProperties.find(p => String(p.id) === String(activePropertyId)) || null;

  // 2. Cargar flota Y ESCUCHAR AL MAPA 📡
  useEffect(() => {
    // A. Cargar propiedades del disco duro
    const loadFleet = () => {
      try {
        const saved = localStorage.getItem('stratos_my_properties');
        if (saved) {
          const parsed = JSON.parse(saved);
          setMyProperties(parsed);
          // Si no hay activa, seleccionamos la primera por defecto
          if (parsed.length > 0 && !activePropertyId) {
            setActivePropertyId(parsed[0].id);
          }
        }
      } catch (e) { console.error("Fallo de radar:", e); }
    };

    // B. Escuchar clicks en el Mapa (NanoCards)
    const handleMapSelection = (e: any) => {
        const id = e.detail?.id; 
        if (id) {
            console.log("📍 HUD: Objetivo fijado en mapa ->", id);
            setActivePropertyId(id); // Fijamos la propiedad
            setShowWizard(false);    // Salimos del modo creación
         
            setShowProfile(true);    // Opcional: abrir perfil o lo que prefiera
        }
    };

    loadFleet();

    // SUSCRIPCIONES A EVENTOS
    window.addEventListener('reload-profile-assets', loadFleet);
    window.addEventListener('select-property-signal', handleMapSelection);

    return () => {
        window.removeEventListener('reload-profile-assets', loadFleet);
        window.removeEventListener('select-property-signal', handleMapSelection);
    };
  }, [activePropertyId]);

  // 3. EL GATILLO INTELIGENTE (El Interruptor)
  const handleSmartToggle = (serviceId: string) => {
    // A. MODO WIZARD (Protegemos lo sagrado: Usa tu lógica original)
    if (showWizard) {
      toggleService(serviceId); 
      return;
    }

    // B. MODO MAPA (Edición en vivo)
    if (activeProperty) {
      const current = activeProperty.selectedServices || [];
      const updated = current.includes(serviceId)
        ? current.filter((x: any) => x !== serviceId) // Quitar
        : [...current, serviceId]; // Añadir

      // Guardamos en la Base de Datos Real
      const newFleet = myProperties.map(p => 
        p.id === activeProperty.id ? { ...p, selectedServices: updated } : p
      );
      setMyProperties(newFleet);
      localStorage.setItem('stratos_my_properties', JSON.stringify(newFleet));

      // Avisamos al Mapa para que pinte la NanoCard nueva
      const event = new CustomEvent('update-property-signal', { 
        detail: { id: activeProperty.id, updates: { selectedServices: updated } } 
      });
      window.dispatchEvent(event);
    }
  };

 const [formData, setFormData] = useState<any>({
    address: "",
    coordinates: null,
    type: "Piso",
    floor: "",
    door: "",
    elevator: false,
    mBuilt: "",
    mUseful: "",
    rooms: 2,
    baths: 1,
    state: "Buen estado",
    exterior: true,
    title: "",
    description: "",
    energyConsumption: "",
    energyEmissions: "",
    energyPending: false,
    images: [],
    price: "", 
    communityFees: "",
    selectedServices: [],
    
    // ✅ CORRECTO: Se inician como texto vacío. 
    // Cuando suba el PDF, aquí se guardará "https://cloudinary.com/..." automáticamente.
    videoUrl: "",
    tourUrl: "",
    simpleNoteUrl: "",
    energyCertUrl: "",
// 🔥 RECUPERACIÓN DE MEMORIA OPEN HOUSE
openHouse: initialData?.openHouse || initialData?.open_house_data || { enabled: false, amenities: [] },    // 🔥 IMPORTANTE: FALSE por defecto para proteger el pago de particulares
    isAgencyContext: false 
  });

 // EDICIÓN BLINDADA V5: RECUPERACIÓN TOTAL DE DATOS DE AGENCIA
  useEffect(() => {
    if (initialData) {
      console.log("🔍 MODO ARQUITECTO ACTIVO:", initialData);

      const normalizedServices = initialData.selectedServices || [];
      
      // Rescate de Ascensor
      let rawElevator = initialData.elevator;
      if (rawElevator === undefined && initialData.specs) {
          rawElevator = initialData.specs.elevator;
      }
      const normalizedElevator = rawElevator === true || String(rawElevator) === "true" || rawElevator === 1;

      // Normalización de Precio
      const normalizedPrice = initialData.rawPrice 
          ? String(initialData.rawPrice) 
          : (initialData.price ? String(initialData.price).replace(/\D/g, "") : "");

      // 🔥 RESCATE DE DATOS B2B DE LA CAMPAÑA
      // Si la propiedad tiene una activeCampaign, la leemos para rellenar los inputs
      const camp = initialData.activeCampaign || null;

      setFormData((prev: any) => ({
        ...prev,
        ...initialData,
        mBuilt: initialData.mBuilt || initialData.m2 || "",
        elevator: normalizedElevator,      
        selectedServices: normalizedServices,
        price: normalizedPrice,
        
        communityFees: (initialData.communityFees ?? ""),
        energyConsumption: initialData.energyConsumption || "", 
        energyEmissions: initialData.energyEmissions || "",      
        energyPending: initialData.energyPending === true,      
        
        // ⚡️ Recuperar Extras Pro
        videoUrl: initialData.videoUrl || "",
        tourUrl: initialData.tourUrl || "",
        simpleNoteUrl: initialData.simpleNoteUrl || "",
        energyCertUrl: initialData.energyCertUrl || "",

        // ⚡️ Recuperar Open House
        openHouse: initialData.openHouse || initialData.open_house_data || { enabled: false, amenities: [] },

        // ⚡️ Recuperar Datos B2B (Vital para que no se borren)
        mandateType: camp ? camp.mandateType : (initialData.mandateType || "ABIERTO"),
       exclusiveMonths: camp ? camp.exclusiveMonths : (initialData.exclusiveMonths || 6),
        commissionPct: camp ? camp.commissionPct : (initialData.commissionPct || 0),
        sharePct: camp ? camp.commissionSharePct : (initialData.sharePct || initialData.b2b?.sharePct || 0),
        shareVisibility: camp ? camp.commissionShareVisibility : (initialData.shareVisibility || initialData.b2b?.visibility || "PRIVATE"),

        isEditMode: !!initialData.id, 
        isAgencyContext: initialData.isAgencyContext || false,
        coordinates: initialData.coordinates || prev.coordinates || null,
      }));

      // Salto inteligente
      if (initialData.address || initialData.id) {
          setStep("BASICS");
      } else {
          setStep("LOCATION");
      }
    }
  }, [initialData]);

  const updateData = (field: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, [field]: value }));
// HANDLERS SERVICIOS (EXTRAS) - VERSIÓN BLINDADA
  const toggleService = (id: string) => {
    // 1. Leemos la verdad actual del formulario
    const currentList = formData.selectedServices || [];
    let newList = [];

    // 2. Aplicamos la lógica (Packs exclusivos vs Extras acumulables)
    if (id.startsWith("pack_")) {
      if (currentList.includes(id)) {
          newList = currentList.filter((x: string) => x !== id);
      } else {
          // Quitamos otros packs, pero MANTENEMOS los extras (pool, garage, etc)
          const nonPackServices = currentList.filter((x: string) => !x.startsWith("pack_"));
          newList = [...nonPackServices, id];
      }
    } else {
      // Toggle Normal (Añadir/Quitar)
      newList = currentList.includes(id) 
        ? currentList.filter((x: string) => x !== id) 
        : [...currentList, id];
    }
    
    // 3. Sincronizamos SOLO EL FORMULARIO (La línea vieja se ha eliminado)
    setFormData((f: any) => ({ ...f, selectedServices: newList }));
  };

  const progress = useMemo(() => {
    const idx = STEPS.indexOf(step);
    const safeIdx = idx < 0 ? 0 : idx;
    return ((safeIdx + 1) / STEPS.length) * 100;
  }, [step]);

  const labelStep = useMemo(() => {
    const idx = LABEL_STEPS.indexOf(step);
    if (idx >= 0) return idx + 1;
    return LABEL_STEPS.length;
  }, [step]);

  const closeWizard = (payload?: any) => {
    setIsClosing(true);
    setTimeout(() => {
      if (onCloseMode) onCloseMode(!!payload, payload);
    }, 700);
  };

  const currentRawPrice = useMemo(() => {
      return parsePriceInput(formData.price);
  }, [formData.price]);

  return (
    <div className="absolute inset-0 pointer-events-none z-[5000]">
    {/* NANO CARD PREVIEW BLINDADA */}
      {step !== "SUCCESS" && (
        <MapNanoCard 
            {...formData} 
            rooms={formData.rooms}
            baths={formData.baths}
            mBuilt={formData.mBuilt}
            rawPrice={currentRawPrice} 
            priceValue={currentRawPrice} 
            price={formData.price}
            // 👇 ESTO ARREGLA LA FOTO ROTA: Si no hay imagen, pone una genérica
            img={formData.images?.[0] || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80"}
        />
      )}

      {!showWizard && (
        <ExplorerHud
          onCloseMode={() => closeWizard()}
          soundFunc={soundFunc}
          onGoToMap={() => setShowWizard(true)}
        />
      )}

     {/* --- 1. PANEL DE PERFIL --- */}
      <ProfilePanel
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        
        onSelectProperty={(id: string) => {
             console.log("🎯 Objetivo fijado:", id);
             setActivePropertyId(id);
             setShowWizard(false); 
              
        }}

        // ❌ BORRE ESTA LÍNEA QUE CAUSA EL ERROR:
        // activeServicesCount={currentServiceCount} 

        // ✅ DEJE ESTAS:
        rightPanel={showProfile ? "PROFILE" : "NONE"}
        toggleRightPanel={(val: string) => setShowProfile(val === "PROFILE")}
      />
   

    {showWizard && (
        <div
          className={`fixed inset-0 z-[7000] flex items-center justify-center p-4 transition-all duration-500 ${
            isClosing ? "opacity-0" : "opacity-100"
          } pointer-events-auto`}
        >
          {/* FONDO GLASS */}
          <div className="absolute inset-0 bg-[#F5F5F7]/95 backdrop-blur-xl transition-all" />

          {/* CONTENEDOR PRINCIPAL */}
          <div
            className={`relative z-10 w-[90vw] max-w-5xl h-[85vh] flex flex-col overflow-hidden 
            transform transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1)
            rounded-[32px] bg-gradient-to-b from-white to-[#FAFAFA] 
            shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.03)]
            ${isClosing ? "scale-95 translate-y-10 opacity-0" : "scale-100 translate-y-0 opacity-100"}`}
          >
            {/* Header */}
            {step !== "SUCCESS" && (
              <div className="px-8 pt-8 pb-6 border-b border-gray-100/50 bg-white/80 backdrop-blur-md z-20 shrink-0">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase mb-1">
                      ASISTENTE STRATOS
                    </span>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">
                      Paso {labelStep} <span className="text-gray-300">/</span> {LABEL_STEPS.length}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => closeWizard()} 
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 active:scale-90"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                
                {/* Barra Progreso */}
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#0071e3] shadow-[0_0_10px_rgba(0,113,227,0.3)] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            )}

          {/* Contenido Dinámico */}
            <div className="flex-1 overflow-hidden relative z-10 p-0 bg-white">
              <div className="h-full w-full overflow-y-auto custom-scrollbar p-8 lg:px-12">
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                    
                    {/* --- 1. PASOS COMUNES --- */}
                    {step === "LOCATION" && <StepLocation formData={formData} updateData={updateData} setStep={setStep} />}
                    {step === "BASICS" && <StepBasics formData={formData} updateData={updateData} setStep={setStep} />}
                    {step === "SPECS" && <StepSpecs formData={formData} updateData={updateData} setStep={setStep} />}
                    {step === "DESCRIPTION" && <StepDescription formData={formData} updateData={updateData} setStep={setStep} />}
                    {step === "ENERGY" && <StepEnergy formData={formData} updateData={updateData} setStep={setStep} />}
                    {step === "MEDIA" && <StepMedia formData={formData} updateData={updateData} setStep={setStep} />}
                    {step === "PRICE" && <StepPrice formData={formData} updateData={updateData} setStep={setStep} />}

                    {/* --- 2. RUTA AGENCIA (EXTRAS -> OPEN HOUSE -> B2B) --- */}
                    
                    {step === "AGENCY_EXTRAS" && (
                        <div className="h-full flex flex-col animate-fade-in-right px-2">
                            <div className="mb-6 shrink-0">
                                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Agencia Pro</h2>
                                <p className="text-gray-500 font-medium">Contenido multimedia y documentación legal.</p>
                            </div>
                            <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-8 pt-2">
                                <StepAgencyExtras formData={formData} setFormData={setFormData} />
                            </div>
                            <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
                                <button onClick={() => setStep("PRICE")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95">
                                    <ArrowLeft size={24} />
                                </button>
                                <button onClick={() => setStep("OPEN_HOUSE")} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">
                                    Gestionar Eventos <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "OPEN_HOUSE" && (
                        <div className="h-full flex flex-col animate-fade-in-right px-2">
                            <div className="mb-6 shrink-0">
                                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Open House</h2>
                                <p className="text-gray-500 font-medium">Organiza jornadas de puertas abiertas.</p>
                            </div>
                            <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-8 pt-2">
                                <StepOpenHouse formData={formData} setFormData={setFormData} />
                            </div>
                            <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
                                <button onClick={() => setStep("AGENCY_EXTRAS")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95">
                                    <ArrowLeft size={24} />
                                </button>
                                {/* 🔥 EL BOTÓN QUE LLEVA AL B2B 🔥 */}
                                <button onClick={() => setStep("AGENCY_B2B")} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">
                                    Definir Colaboración <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 🔥 AQUÍ ESTÁ EL ESLABÓN PERDIDO: EL PASO B2B 🔥 */}
                    {step === "AGENCY_B2B" && (
                        <StepAgencyB2B formData={formData} updateData={updateData} setStep={setStep} />
                    )}


                    {/* --- 3. RUTA PARTICULAR (ANÁLISIS -> RADAR) --- */}
                    
                    {step === "ANALYSIS" && <MarketAnalysisStep formData={formData} onNext={() => setStep("RADAR")} />}

                    {step === "RADAR" && (
                        <MarketRadarStep
                            formData={formData}
                            onNext={() => setStep("SUCCESS")}
                        />
                    )}

                    {/* --- 4. FINAL COMÚN --- */}
                    
                    {step === "SUCCESS" && (
                        <StepSuccess
                            formData={formData}
                            handleClose={(payload: any) => {
                                if (typeof window !== "undefined") {
                                    window.dispatchEvent(new CustomEvent("reload-profile-assets"));
                                    window.dispatchEvent(new CustomEvent("force-map-refresh"));
                                }
                                closeWizard(payload);
                            }}
                        />
                    )}

                </div>
              </div>

              {/* Loader */}
              {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-fade-in">
                  <div className="relative">
                      <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
                      <div className="absolute top-0 w-12 h-12 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Sincronizando...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}</div>
  );
}

// ============================================================================
// 🧱 STEPS COMPONENTS
// ============================================================================

const StepLocation = ({ formData, updateData, setStep }: any) => {
  const [query, setQuery] = useState(formData.address || "");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

 const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      setIsSearching(true);
      setShowResults(true);
      try {
        // COORDENADAS DE LA PUERTA DEL SOL (MADRID)
        // Esto obliga a Mapbox a poner lo que esté cerca de Madrid PRIMERO.
        const MADRID_CENTER = "-3.7038,40.4168"; 
        
        // SOLO ESPAÑA
        const SPAIN_BBOX = "-18.1612,27.6377,4.3279,43.7924"; 

        // TIPOS DE DATOS
        const TYPES = "district,locality,neighborhood,address,poi";

        // 🚨 CHIVATO EN CONSOLA (Si no ve esto, no se ha actualizado)
        console.log("🚨 BUSCANDO CON PRIORIDAD MADRID 🚨:", text);

        // 🔥 LA URL MAESTRA:
        // proximity=MADRID: Gana Madrid.
        // bbox=SPAIN: Solo España.
        // limit=10: Vemos hasta 10 resultados.
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_TOKEN}&country=es&types=${TYPES}&proximity=${MADRID_CENTER}&bbox=${SPAIN_BBOX}&language=es&autocomplete=true&fuzzyMatch=true&limit=10`;

        const res = await fetch(url);
        const data = await res.json();
        setResults(data.features || []);

      } catch (error) {
        console.error(error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const selectAddress = (feature: any) => {
    setQuery(feature.place_name);
    updateData("address", feature.place_name);
    updateData("coordinates", feature.center);

    const ctx = feature?.context || [];
    const getCtx = (prefix: string) => {
      const hit = ctx.find((c: any) => (c.id || "").startsWith(prefix + "."));
      return hit?.text || "";
    };

    const postcode = getCtx("postcode"); 
    const place = getCtx("place") || getCtx("locality"); 
    const region = getCtx("region"); 

    if (postcode) updateData("postcode", postcode);
    if (place) updateData("city", place);
    if (region) updateData("region", region);

    setShowResults(false);
  };

  const canContinue = query.length > 5 && formData.address;

  return (
    <div className="h-full flex flex-col animate-fade-in-right p-1">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Ubicación</h2>
      <p className="text-gray-500 mb-6 text-sm">Busca la dirección exacta del activo.</p>

      <div className="flex-1 flex flex-col gap-4 relative">
        <div className="relative z-50">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {isSearching ? <Loader2 size={20} className="animate-spin text-blue-500" /> : <Search size={20} />}
          </div>

          <input
            autoFocus
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 p-4 bg-white rounded-xl border border-gray-200 focus:border-black outline-none font-medium text-gray-900 shadow-sm transition-all"
            placeholder="Ej: Ciudad, Calle y Número..."
          />

          {showResults && results.length > 0 && (
            <div className="absolute top-[110%] left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto custom-scrollbar z-[60]">
              {results.map((item: any, index: number) => (
                <div
                  key={`${item.id}-${index}`}
                  onClick={() => selectAddress(item)}
                  className="p-4 border-b border-gray-50 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <div className="p-2 bg-gray-100 rounded-full text-gray-500 shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className="font-bold text-gray-900 text-sm truncate">{item.text}</div>
                    <div className="text-xs text-gray-500 truncate">{item.place_name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center bg-gray-50/50 min-h-[200px]">
          {canContinue ? (
           /* ✅ NUEVO BLOQUE: VISIÓN SATÉLITE (Sustituye al Check verde) */
            <div className="relative w-full h-full min-h-[220px] rounded-xl overflow-hidden shadow-md group animate-in zoom-in duration-300">
              
              {/* 1. LA IMAGEN DEL MAPA (Usamos formData.coordinates que ya guardó antes) */}
              {formData.coordinates && (
                <img 
                 src={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/pin-s+ff0000(${formData.coordinates[0]},${formData.coordinates[1]})/${formData.coordinates[0]},${formData.coordinates[1]},17,0/600x300?access_token=${MAPBOX_TOKEN}`}
                  alt="Vista Satélite"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}

              {/* 2. CAPA DE TEXTO ELEGANTE (SOBRE EL MAPA) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
                <div className="flex items-center gap-2 mb-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Objetivo Localizado</span>
                </div>
                
                <h3 className="text-white font-bold text-lg leading-tight truncate shadow-sm">
                  {formData.address}
                </h3>
                
                <p className="text-gray-300 text-xs mt-1 truncate font-medium">
                  {formData.city ? `${String(formData.city).toUpperCase()}${formData.postcode ? ` (${formData.postcode})` : ""}` : ""}
                </p>
              </div>

              {/* 3. BOTÓN "X" PARA CANCELAR (Arriba a la derecha) */}
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Evita clics fantasma
                  setQuery(""); 
                  updateData("coordinates", null);
                  updateData("address", "");
                  // Al borrar el query y address, 'canContinue' pasará a false automáticamente
                }}
                className="absolute top-3 right-3 bg-black/40 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-all border border-white/20 z-20"
                title="Cambiar ubicación"
              >
                <X size={16} /> 
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-40">
              <MapIcon size={48} className="mb-4 text-gray-400" />
              <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Esperando dirección...</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setStep("BASICS")}
        disabled={!canContinue}
        className="w-full py-4 text-white font-bold rounded-2xl shadow-lg mt-6 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: canContinue ? "#000000" : "#cccccc" }}
      >
        Continuar <ArrowRight size={18} />
      </button>
    </div>
  );
};

// --- PASO 2: BÁSICOS (VERSIÓN 2.0 - ESTADO + ORIENTACIÓN + NUEVAS TIPOLOGÍAS) ---
const StepBasics = ({ formData, updateData, setStep }: any) => {
  const [localDoor, setLocalDoor] = useState(formData.door || "");
  const saveDoor = () => updateData("door", localDoor);

  // 🔥 LÓGICA AMPLIADA: Bungalow, Villa, Suelo y Nave NO piden planta/ascensor
  const isLandOrVilla = ["Suelo", "Nave", "Villa", "Bungalow"].includes(formData.type);
  const isFloorRequired = !isLandOrVilla;
  
  // Validación para continuar
  const floorValid = isFloorRequired ? (formData.floor !== "" && formData.floor !== undefined) : true;
  const canContinue = formData.type && floorValid;

  return (
    <div className="h-full flex flex-col animate-fade-in-right">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Características</h2>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-6">
        
        {/* 1. TIPO DE INMUEBLE (Usa la lista global actualizada) */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">
            Tipo de inmueble <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3 pb-2">
            {OFFICIAL_TYPES.map((item) => {
                const isSelected = formData.type === item.label;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                        updateData("type", item.label);
                        // Si es tipo suelo/casa, limpiamos planta y ascensor
                        if (["Suelo", "Nave", "Villa", "Bungalow"].includes(item.label)) {
                            updateData("floor", ""); 
                            updateData("elevator", false);
                        }
                    }}
                    className={`
                        flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200
                        ${isSelected 
                            ? "border-blue-600 bg-blue-600 text-white shadow-md scale-105" 
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300"}
                    `}
                  >
                    <item.icon size={22} strokeWidth={isSelected ? 2 : 1.5} />
                    <span className="text-[10px] font-bold uppercase">{item.label}</span>
                  </button>
                )
            })}
          </div>
        </div>

        {/* 2. 🔥 NUEVO: ESTADO DE CONSERVACIÓN */}
        <div>
           <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Estado</label>
           <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {['Obra Nueva', 'Buen Estado', 'Reformado', 'A Reformar'].map((st) => (
                  <button
                    key={st}
                    onClick={() => updateData("state", st)}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                        formData.state === st 
                        ? "bg-black text-white border-black" 
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {st}
                  </button>
              ))}
           </div>
        </div>

        {/* 3. PLANTA Y PUERTA (Solo si aplica) */}
        {!isLandOrVilla && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">
                    Planta <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <select
                      className="w-full p-4 bg-gray-50 rounded-xl border border-gray-300 text-gray-900 font-bold focus:border-black outline-none transition-all appearance-none cursor-pointer"
                      value={formData.floor}
                      onChange={(e) => updateData("floor", e.target.value)}
                    >
                      <option value="" disabled className="text-gray-400">Selecciona</option>
                      <option value="Bajo">Bajo</option>
                      <option value="Entreplanta">Entreplanta</option>
                      {[1,2,3,4,5,6,7,8,9,10,11,12,15,20].map((n) => (
                        <option key={n} value={n}>{n}ª Planta</option>
                      ))}
                      <option value="Atico">Ático</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowUp size={16} className="text-gray-400"/>
                    </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Puerta</label>
                <input
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-300 text-gray-900 font-bold focus:border-black outline-none transition-all placeholder:text-gray-400"
                  placeholder="Ej: 2B"
                  value={localDoor}
                  onChange={(e) => setLocalDoor(e.target.value)}
                  onBlur={saveDoor}
                />
              </div>
            </div>
        )}

        {/* 4. 🔥 NUEVO: EXTERIOR Y ASCENSOR */}
        {!isLandOrVilla && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                {/* Selector Exterior/Interior */}
                <div>
                   <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Posición</label>
                   <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button 
                        onClick={() => updateData("exterior", true)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.exterior ? "bg-white shadow text-gray-900" : "text-gray-400"}`}
                      >Exterior</button>
                      <button 
                        onClick={() => updateData("exterior", false)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!formData.exterior ? "bg-white shadow text-gray-900" : "text-gray-400"}`}
                      >Interior</button>
                   </div>
                </div>
                
                {/* Selector Ascensor */}
                <div>
                   <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Ascensor</label>
                   <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button 
                        onClick={() => updateData("elevator", true)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.elevator ? "bg-white shadow text-blue-600" : "text-gray-400"}`}
                      >Sí</button>
                      <button 
                        onClick={() => updateData("elevator", false)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!formData.elevator ? "bg-white shadow text-gray-900" : "text-gray-400"}`}
                      >No</button>
                   </div>
                </div>
            </div>
        )}

        {/* 5. 🔥 NUEVO: ORIENTACIÓN */}
        <div>
           <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Orientación</label>
           <div className="grid grid-cols-4 gap-2">
              {['Norte', 'Sur', 'Este', 'Oeste'].map((ori) => (
                  <button
                    key={ori}
                    onClick={() => updateData("orientation", ori)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        formData.orientation === ori 
                        ? "bg-blue-50 text-blue-600 border-blue-200" 
                        : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    {ori}
                  </button>
              ))}
           </div>
        </div>

      </div>

      <div className="mt-4 flex gap-4 pt-4 border-t border-gray-100">
        <button onClick={() => setStep("LOCATION")} className="p-4 bg-gray-100 text-gray-800 rounded-2xl hover:bg-gray-200 transition-all active:scale-95">
          <ArrowLeft size={24} />
        </button>
        <button 
            onClick={() => { saveDoor(); setStep("SPECS"); }} 
            disabled={!canContinue}
            className={`
                w-full py-4 font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all 
                ${canContinue 
                    ? "bg-black text-white hover:scale-[1.02] active:scale-95 cursor-pointer" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"}
            `}
        >
          {canContinue ? "Siguiente" : "Completa los datos"} 
          {canContinue && <ArrowRight size={18} />}
        </button>
      </div>
    </div>
  );
};

// --- PASO 3: DETALLES Y EXTRAS (ARSENAL COMPLETO) ---
const StepSpecs = ({ formData, updateData, setStep }: any) => {
  const formatNumber = (val: any) => {
    if (!val) return "";
    const raw = val.toString().replace(/\D/g, "");
    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const [localM2, setLocalM2] = useState(formData.mBuilt ? formatNumber(formData.mBuilt) : "");

  const toggleExtra = (id: string) => {
      const current = formData.selectedServices || [];
      const updated = current.includes(id) 
        ? current.filter((x: string) => x !== id)
        : [...current, id];
      updateData("selectedServices", updated);
  };

  // 🔥 LISTA DE EXTRAS ACTUALIZADA (10 ELEMENTOS)
  const EXTRAS = [
      { id: 'pool', label: 'Piscina', icon: Droplets },
      { id: 'garage', label: 'Garaje', icon: Box },
      { id: 'garden', label: 'Jardín', icon: Trees },      // Actualizado a Trees (más lógico)
      { id: 'terrace', label: 'Terraza', icon: SunDim },    // Nuevo
      { id: 'balcony', label: 'Balcón', icon: Compass },    // Nuevo
      { id: 'storage', label: 'Trastero', icon: Warehouse },// Nuevo (Usa icono Warehouse)
      { id: 'ac', label: 'Aire Acond.', icon: Wind },       // Nuevo
      { id: 'heating', label: 'Calefacción', icon: Thermometer }, // Nuevo
      { id: 'furnished', label: 'Amueblado', icon: Armchair },    // Nuevo
      { id: 'security', label: 'Seguridad', icon: ShieldCheck }
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2">
      <div className="mb-6 shrink-0">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Detalles</h2>
        <p className="text-gray-500 font-medium">Define espacios y extras.</p>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-8 pt-2">
        {/* SUPERFICIE */}
        <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 shadow-inner group focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-blue-600">Superficie Construida</label>
          <div className="relative flex items-baseline">
            <input 
                className="w-full bg-transparent text-5xl font-black text-gray-900 outline-none placeholder:text-gray-300 tracking-tight" 
                placeholder="0" 
                value={localM2} 
                onChange={(e) => setLocalM2(formatNumber(e.target.value))} 
                onBlur={() => updateData("mBuilt", localM2.replace(/\./g, ""))} 
                autoFocus 
            />
            <span className="text-xl font-bold text-gray-400 ml-2">m²</span>
          </div>
        </div>

        {/* HABITACIONES Y BAÑOS */}
        <div className="grid grid-cols-2 gap-6">
          <div className="p-5 rounded-[24px] border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Habitaciones</label>
            <div className="flex items-center justify-between">
              <button onClick={() => updateData("rooms", Math.max(0, Number(formData.rooms || 0) - 1))} className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 font-bold text-xl">-</button>
              <span className="text-3xl font-black text-gray-900 min-w-[40px] text-center">{formData.rooms}</span>
              <button onClick={() => updateData("rooms", Number(formData.rooms || 0) + 1)} className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xl">+</button>
            </div>
          </div>

          <div className="p-5 rounded-[24px] border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Baños</label>
            <div className="flex items-center justify-between">
              <button onClick={() => updateData("baths", Math.max(0, Number(formData.baths || 0) - 1))} className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 font-bold text-xl">-</button>
              <span className="text-3xl font-black text-gray-900 min-w-[40px] text-center">{formData.baths}</span>
              <button onClick={() => updateData("baths", Number(formData.baths || 0) + 1)} className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xl">+</button>
            </div>
          </div>
        </div>

        {/* EXTRAS - REJILLA AMPLIADA */}
        <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Extras y Comodidades</label>
            <div className="grid grid-cols-2 gap-3">
                {EXTRAS.map((extra) => {
                    const isSelected = (formData.selectedServices || []).includes(extra.id);
                    return (
                        <button 
                            key={extra.id} 
                            onClick={() => toggleExtra(extra.id)} 
                            className={`
                                flex items-center gap-3 p-4 rounded-xl border transition-all 
                                ${isSelected 
                                    ? 'bg-black text-white border-black shadow-lg scale-[1.02]' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                            `}
                        >
                            <extra.icon size={18} />
                            <span className="text-sm font-bold">{extra.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
      </div>

      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
        <button onClick={() => setStep("BASICS")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95">
          <ArrowLeft size={24} />
        </button>
        <button onClick={() => setStep("DESCRIPTION")} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">
          Siguiente Paso <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

const StepDescription = ({ formData, updateData, setStep }: any) => {
  const [localTitle, setLocalTitle] = useState(formData.title || "");
  const [localDesc, setLocalDesc] = useState(formData.description || "");

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2">
      <div className="mb-6 shrink-0">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Narrativa</h2>
        <p className="text-gray-500 font-medium">Cuenta la historia de tu propiedad.</p>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto px-4 -mx-4 custom-scrollbar pt-2 pb-4">
        <div className="group">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-blue-600">Titular del Anuncio</label>
          <input className="w-full p-5 bg-gray-50 rounded-[24px] border border-gray-100 text-2xl font-bold text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:bg-white focus:shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-blue-500/10" placeholder="Ej: Ático de lujo en Serrano..." value={localTitle} onChange={(e) => setLocalTitle(e.target.value)} onBlur={() => updateData("title", localTitle)} autoFocus />
        </div>

        <div className="group h-full max-h-[40vh] flex flex-col">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-blue-600">Descripción Detallada</label>
          <textarea className="w-full flex-1 p-6 bg-gray-50 rounded-[24px] border border-gray-100 text-lg font-medium text-gray-700 leading-relaxed placeholder:text-gray-300 resize-none outline-none transition-all focus:bg-white focus:text-gray-900 focus:shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-blue-500/10" placeholder="Describe los espacios, la luz, los acabados y lo que hace única a esta propiedad..." value={localDesc} onChange={(e) => setLocalDesc(e.target.value)} onBlur={() => updateData("description", localDesc)} />
        </div>
      </div>

      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
        <button onClick={() => setStep("SPECS")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"><ArrowLeft size={24} /></button>
        <button onClick={() => setStep("ENERGY")} disabled={!localTitle} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">Siguiente Paso <ArrowRight size={20} /></button>
      </div>
    </div>
  );
};

const StepEnergy = ({ formData, updateData, setStep }: any) => {
  const RATINGS = ["A", "B", "C", "D", "E", "F", "G"];
  const togglePending = () => { const newState = !formData.energyPending; updateData("energyPending", newState); if (newState) { updateData("energyConsumption", ""); updateData("energyEmissions", ""); } };
  const getStyle = (r: string, current: string) => {
    const isSelected = current === r; const isDisabled = formData.energyPending;
    if (isDisabled) return "bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed scale-95 opacity-50";
    const colors: any = { A: { bg: "bg-[#009345]", text: "text-[#009345]", border: "border-[#009345]", shadow: "shadow-[#009345]/40" }, B: { bg: "bg-[#4FB848]", text: "text-[#4FB848]", border: "border-[#4FB848]", shadow: "shadow-[#4FB848]/40" }, C: { bg: "bg-[#B5D638]", text: "text-[#B5D638]", border: "border-[#B5D638]", shadow: "shadow-[#B5D638]/40" }, D: { bg: "bg-[#FFF100]", text: "text-[#D4C800]", border: "border-[#FFF100]", shadow: "shadow-[#FFF100]/40" }, E: { bg: "bg-[#FDB913]", text: "text-[#FDB913]", border: "border-[#FDB913]", shadow: "shadow-[#FDB913]/40" }, F: { bg: "bg-[#F37021]", text: "text-[#F37021]", border: "border-[#F37021]", shadow: "shadow-[#F37021]/40" }, G: { bg: "bg-[#E30613]", text: "text-[#E30613]", border: "border-[#E30613]", shadow: "shadow-[#E30613]/40" } };
    const c = colors[r];
    if (isSelected) { return `${c.bg} border-transparent text-white shadow-lg ${c.shadow} scale-110 z-10 font-black ring-2 ring-white ring-offset-2 ${r === 'D' ? '!text-gray-900' : ''}`; }
    return `bg-white border-2 ${c.border} ${c.text} font-bold hover:bg-gray-50 hover:scale-105 transition-transform`;
  };

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2">
      <div className="mb-6 shrink-0"><h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Certificación</h2><p className="text-gray-500 font-medium">Eficiencia energética y emisiones.</p></div>
      <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-4 pt-2 space-y-8">
        <div onClick={togglePending} className={`group cursor-pointer p-4 rounded-[20px] border-2 transition-all duration-300 flex items-center justify-between ${formData.energyPending ? "bg-blue-50 border-blue-500 shadow-md" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"}`}>
            <div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${formData.energyPending ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"}`}><FileCheck size={24} /></div><div><span className={`block font-bold text-lg ${formData.energyPending ? "text-blue-900" : "text-gray-900"}`}>En trámite / Exento</span><span className="text-xs text-gray-500 font-medium">Aún no dispongo del certificado oficial</span></div></div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.energyPending ? "bg-blue-600 border-blue-600 scale-110" : "border-gray-300"}`}>{formData.energyPending && <Check size={14} className="text-white" />}</div>
        </div>
        <div className={`transition-all duration-500 ${formData.energyPending ? "opacity-30 pointer-events-none grayscale blur-[1px]" : "opacity-100"}`}>
            <div className="mb-8"><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Zap size={14} className="text-yellow-500" fill="currentColor"/> Consumo de Energía</label><div className="grid grid-cols-7 gap-2 sm:gap-3">{RATINGS.map((r) => (<button key={`cons-${r}`} onClick={() => updateData("energyConsumption", r)} className={`aspect-square rounded-xl sm:rounded-2xl text-lg sm:text-xl transition-all duration-300 flex items-center justify-center ${getStyle(r, formData.energyConsumption)}`}>{r}</button>))}</div></div>
            <div><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Flame size={14} className="text-orange-500" fill="currentColor"/> Emisiones CO₂</label><div className="grid grid-cols-7 gap-2 sm:gap-3">{RATINGS.map((r) => (<button key={`em-${r}`} onClick={() => updateData("energyEmissions", r)} className={`aspect-square rounded-xl sm:rounded-2xl text-lg sm:text-xl transition-all duration-300 flex items-center justify-center ${getStyle(r, formData.energyEmissions)}`}>{r}</button>))}</div></div>
        </div>
      </div>
      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0"><button onClick={() => setStep("DESCRIPTION")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"><ArrowLeft size={24} /></button><button onClick={() => setStep("MEDIA")} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">Siguiente Paso <ArrowRight size={20} /></button></div>
    </div>
  );
};

const StepMedia = ({ formData, updateData, setStep }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 👇 NUEVA LÓGICA BLINDADA PARA CLOUDFLARE R2
  const handleFileUpload = async (e: any) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 1. Enviamos cada archivo a nuestro propio servidor (R2)
    const uploadPromises = files.map(async (file: any) => {
        try {
            let fileToUpload = file;

            // 🛡️ Comprimimos la imagen antes de enviarla
            if (file.type.startsWith('image/')) {
                fileToUpload = await imageCompression(file, { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true });
            }

            // 📡 Pedimos pista de aterrizaje a Cloudflare R2
            const { success, uploadUrl, publicUrl } = await getUploadUrl(fileToUpload.name, fileToUpload.type);
            
            if (!success || !uploadUrl) {
                console.error("❌ Cloudflare denegó el pase");
                return null;
            }

            // 🚀 Disparamos el archivo directo al búnker
            const response = await fetch(uploadUrl, {
                method: "PUT",
                body: fileToUpload,
                headers: { "Content-Type": fileToUpload.type },
            });

            if (!response.ok) {
                console.error("❌ Fallo en R2:", response.statusText);
                return null;
            }

            console.log("✅ FOTO EN CLOUDFLARE R2:", publicUrl);
            return publicUrl;
        } catch (error) {
            console.error("❌ Derribado en vuelo:", error);
            return null;
        }
    });

    // 2. Esperamos a que la escuadra vuelva con las URLs seguras
    const uploadedUrls = await Promise.all(uploadPromises);

    // 3. Filtramos las bajas (si alguna falló)
    const validUrls = uploadedUrls.filter(url => url !== null);

    // 4. Actualizamos el radar del formulario
    const currentImages = formData.images || [];
    const combined = [...currentImages, ...validUrls].slice(0, 10);
    updateData("images", combined);
  };

  const removeImage = (index: number) => { 
      const currentImages = formData.images || []; 
      const filtered = currentImages.filter((_: any, i: number) => i !== index); 
      updateData("images", filtered); 
  };
  
  const images = formData.images || [];

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        multiple 
        accept="image/*,video/*,application/pdf" 
      />
      
      <div className="mb-6 shrink-0">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Multimedia</h2>
        <p className="text-gray-500 font-medium">Sube fotos, vídeos o planos (PDF).</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-4 pt-2">
        {/* ZONA DE CARGA (DRAG & DROP VISUAL) */}
        <div onClick={() => fileInputRef.current?.click()} className="group relative h-64 rounded-[24px] border-4 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/50 overflow-hidden shadow-sm hover:shadow-md active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/0 to-blue-100/0 group-hover:via-white/20 group-hover:to-blue-100/30 transition-all duration-500" />
          <div className="relative z-10 flex flex-col items-center p-6">
            <div className="flex items-center gap-5 mb-6">
                <div className="w-18 h-18 p-4 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-300"><Camera size={32} className="text-blue-600" strokeWidth={2} /></div>
                <div className="w-18 h-18 p-4 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 group-hover:rotate-[6deg] transition-transform duration-300 delay-75"><UploadCloud size={32} className="text-purple-600" strokeWidth={2} /></div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Toca para Subir</h3>
            <p className="text-sm font-bold text-gray-400 mb-3">JPG, PNG, PDF, MP4 a la Nube.</p>
            <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-widest rounded-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">Abrir Galería</button>
          </div>
        </div>

        {/* GALERÍA INTELIGENTE */}
        <div className="mt-8">
          <div className="flex justify-between items-baseline mb-4 px-1">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Tus Archivos</p>
            <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg">
                <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{images.length} / 10</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((url: string, i: number) => {
               // 🕵️ DETECTIVE DE FORMATOS
               const isVideo = url.match(/\.(mp4|mov|webm|mkv)$/i) || url.includes("/video/upload");
               const isPdf = url.match(/\.pdf$/i) || url.includes(".pdf");

               return (
                <div key={i} className="aspect-square rounded-[20px] overflow-hidden relative group border border-gray-100 shadow-sm animate-fade-in bg-gray-50">
                  
                  {/* --- CASO 1: ES VIDEO 🎥 --- */}
                  {isVideo ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-gray-900">
                      <video src={url} className="w-full h-full object-cover opacity-60" muted playsInline />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50">
                           <Play size={12} className="text-white fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[8px] font-bold text-white uppercase flex items-center gap-1">
                        <Film size={8} /> Video
                      </span>
                    </div>
                  ) : isPdf ? (
                  /* --- CASO 2: ES PDF 📄 --- */
                    <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 p-2 text-center group-hover:bg-red-100 transition-colors cursor-pointer relative">
                      <FileText size={32} className="text-red-500 mb-2" />
                      <span className="text-[8px] font-bold text-red-900 uppercase tracking-wider line-clamp-1 break-all px-2">
                        Documento PDF
                      </span>
                      {/* Enlace invisible para abrir el PDF al hacer clic */}
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="absolute inset-0 z-10" 
                        title="Ver Documento"
                      />
                    </div>
                  ) : (
                  /* --- CASO 3: ES FOTO (LO DE SIEMPRE) 📸 --- */
                    <img src={url} alt={`Foto ${i}`} className="w-full h-full object-cover" />
                  )}

                  {/* BOTÓN ELIMINAR (COMÚN A TODOS) */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); removeImage(i); }} 
                    className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-md cursor-pointer z-20 border border-gray-100"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>

                  {/* ETIQUETA PORTADA (SOLO EL PRIMERO) */}
                  {i === 0 && (
                    <span className="absolute bottom-2 left-2 right-2 text-center text-[8px] font-black text-white uppercase tracking-widest bg-black/50 backdrop-blur-md py-1 rounded-md z-10 pointer-events-none">
                      Portada
                    </span>
                  )}
                </div>
              );
            })}
            
            {/* BOTÓN AÑADIR MÁS */}
            {images.length < 10 && (
                <div onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-[20px] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-300 hover:text-blue-500 active:scale-95">
                    <span className="font-black text-3xl">+</span>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
        <button onClick={() => setStep("ENERGY")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95">
            <ArrowLeft size={24} />
        </button>
        <button onClick={() => setStep("PRICE")} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">
            Siguiente Paso <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
// --- STEP PRICE (MODIFICADO: CRUCE DE CAMINOS) ---
const StepPrice = ({ formData, updateData, setStep }: any) => {
  const formatCurrency = (v: string) => v ? v.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
  
  const [localPrice, setLocalPrice] = useState(() => { 
      const numericVal = parsePriceInput(formData.price); 
      return numericVal > 0 ? formatCurrency(String(numericVal)) : ""; 
  });
  
  const [localCommunity, setLocalCommunity] = useState(formData.communityFees || "");
  
  const getPriceStyle = (priceStr: string) => { 
      const p = parsePriceInput(priceStr); 
      if (!p || p <= 0) return { hex: "#1d1d1f", color: "text-gray-400", bg: "bg-gray-50", border: "border-gray-200", label: "DEFINIR PRECIO" }; 
      if (p < 200000) return { hex: "#34C759", color: "text-[#34C759]", bg: "bg-[#34C759]/10", border: "border-[#34C759]", label: "INVEST" }; 
      if (p < 550000) return { hex: "#Eab308", color: "text-[#Eab308]", bg: "bg-[#Eab308]/10", border: "border-[#Eab308]", label: "OPPORTUNITY" }; 
      if (p < 1200000) return { hex: "#F97316", color: "text-[#F97316]", bg: "bg-[#F97316]/10", border: "border-[#F97316]", label: "PREMIUM" }; 
      if (p < 3000000) return { hex: "#EF4444", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", border: "border-[#EF4444]", label: "LUXURY" }; 
      return { hex: "#A855F7", color: "text-[#A855F7]", bg: "bg-[#A855F7]/10", border: "border-[#A855F7]", label: "EXCLUSIVE" }; 
  };
  
  const style = getPriceStyle(localPrice);
  
  const syncData = () => { 
      updateData("price", localPrice.replace(/\./g, "")); 
      updateData("communityFees", localCommunity); 
  };

  // 🔥 LÓGICA DE DESVÍO TÁCTICO
  const handleNext = () => {
      syncData(); // 1. Guardar datos
      
      if (formData.isAgencyContext) {
          // 2A. RUTA AGENCIA: Vamos a los extras PRO
          setStep("AGENCY_EXTRAS"); 
      } else {
          // 2B. RUTA PARTICULAR: Vamos al análisis de mercado
          setStep("ANALYSIS");      
      }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2 relative">
      <div className="mb-2 shrink-0 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Valoración</h2>
          <p className="text-gray-500 font-medium text-xs">Define el precio de salida al mercado.</p>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 pb-24">
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-6 transition-all duration-500 border shadow-sm ${style.bg} ${style.color} ${style.border}`}>
            {style.label}
        </div>
        
        <div className="relative w-full max-w-lg mx-auto group text-center mb-6">
            <input 
                className={`w-full text-center bg-transparent text-6xl sm:text-7xl font-black outline-none placeholder:text-gray-200 transition-all duration-300 p-0 ${style.color} drop-shadow-sm`} 
                placeholder="0" 
                value={localPrice} 
                onChange={(e) => { 
                    let val = e.target.value.replace(/\D/g, ""); 
                    if (val.length > 1 && val.startsWith("0")) val = val.substring(1); 
                    setLocalPrice(formatCurrency(val)); 
                }} 
                onBlur={syncData} 
                autoFocus 
            />
            <span className={`absolute top-0 -right-2 sm:-right-6 text-3xl sm:text-4xl font-bold opacity-30 pointer-events-none transition-colors duration-300 ${style.color}`}>€</span>
            <div className={`h-1.5 w-1/3 mx-auto mt-2 rounded-full transition-all duration-500 ${style.bg.replace('/10', '')}`} />
        </div>
        
        <div className="w-full max-w-xs animate-fade-in-up delay-100 px-4 mt-4">
            <label className="block text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Gastos Comunidad (Mes)</label>
            <div className="relative group">
                <input 
                    className="w-full py-4 px-6 bg-gray-50 text-center rounded-2xl border-2 border-transparent text-gray-900 text-2xl font-black focus:bg-white focus:border-gray-200 focus:shadow-lg outline-none transition-all placeholder:text-gray-300" 
                    placeholder="0" 
                    value={localCommunity} 
                    onChange={(e) => setLocalCommunity(e.target.value.replace(/\D/g, ""))} 
                    onBlur={syncData} 
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold group-focus-within:text-gray-900 transition-colors">€</span>
            </div>
        </div>
      </div>
      
      <div className="sticky bottom-0 left-0 right-0 pt-4 pb-6 bg-white/95 backdrop-blur-xl border-t border-gray-100 flex gap-4 shrink-0 z-50 -mx-4 px-4 shadow-[0_-10px_20px_rgba(255,255,255,1)]">
          <button onClick={() => setStep("MEDIA")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95 border border-transparent hover:border-gray-200">
            <ArrowLeft size={24} />
          </button>
          
          <button 
            onClick={handleNext} 
            disabled={!localPrice} 
            className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:grayscale" 
            style={{ backgroundColor: style.hex }}
          >
            <span className="brightness-200 contrast-200">
                {/* Texto dinámico según rango */}
                {formData.isAgencyContext ? "Siguiente: Extras Pro" : "Analizar Mercado"}
            </span> 
            <ArrowRight size={20} />
          </button>
      </div>
    </div>
  );
};

// ============================================================================
// 📡 COMPONENTES DE INTELIGENCIA (REAL DATA)
// ============================================================================

const MarketAnalysisStep = ({ formData, onNext }: any) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [marketData, setMarketData] = useState<any>({ avgPriceM2: 0, count: 0 });

  // 1. Datos de MI propiedad actual
  const myPrice = formData.price ? parseFloat(String(formData.price).replace(/\D/g, "")) : 0;
  const myM2 = formData.mBuilt ? parseFloat(String(formData.mBuilt).replace(/\D/g, "")) : 1;
  const myPriceM2 = myM2 > 0 ? Math.round(myPrice / myM2) : 0;

  // 2. Lógica de carga REAL al servidor
  useEffect(() => {
    const runSonar = async () => {
        setProgress(30);
        
        // Coordenadas del formulario (o Madrid centro por defecto)
        const lat = formData.coordinates ? formData.coordinates[1] : 40.4168;
        const lng = formData.coordinates ? formData.coordinates[0] : -3.7038;

        // 🔥 LLAMADA REAL A LA BASE DE DATOS (Requiere import de actions-market)
        // Si no tienes el import, esto fallará. Asegúrate de importar getMarketRadarAction.
        try {
             // @ts-ignore
             if (typeof getMarketRadarAction !== 'undefined') {
                 const res = await getMarketRadarAction(lat, lng, formData.type);
                 if (res.success) setMarketData(res.stats);
             } else {
                 console.warn("⚠️ getMarketRadarAction no importado. Usando datos simulados.");
             }
        } catch (e) { console.error(e); }
        
        setProgress(80);

        setTimeout(() => {
            setProgress(100);
            setAnalyzing(false);
        }, 800);
    };

    runSonar();
  }, []);

  // 3. Cálculos comparativos (Real vs Yo)
  // Si no encuentra vecinos, usamos 2500 como referencia base para no romper la gráfica
  const refPrice = marketData.avgPriceM2 > 0 ? marketData.avgPriceM2 : 2500; 
  const diff = myPriceM2 - refPrice;
  const percentDiff = refPrice > 0 ? ((diff / refPrice) * 100).toFixed(1) : "0";
  const isExpensive = diff > 0;
  
  // Posición visual en la barra (5% min, 95% max)
  const marketPosition = Math.min(Math.max(50 + (parseFloat(percentDiff) / 2), 5), 95);
  const estimatedMonths = isExpensive ? (Math.abs(Number(percentDiff)) > 20 ? 12 : 6) : 2;

  if (analyzing) { return (<div className="h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent pointer-events-none" /><div className="w-full max-w-sm relative z-10"><div className="mb-10 relative flex justify-center"><div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-20"></div><div className="absolute inset-2 border-4 border-blue-50 rounded-full animate-ping delay-100 opacity-30"></div><div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-[0_10px_40px_rgba(0,113,227,0.15)] relative z-10"><div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div><span className="text-3xl font-black text-gray-900">{progress}%</span></div></div><h2 className="text-xl font-bold text-gray-900 mb-2">Buscando Coordenadas</h2><p className="text-sm font-bold text-blue-600 uppercase tracking-widest animate-pulse">Analizando zona en tiempo real...</p><div className="h-1.5 w-full bg-gray-100 rounded-full mt-8 overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${progress}%` }}></div></div></div></div>); }

  return (
    <div className="h-full flex flex-col animate-fade-in-up px-2 relative">
      <div className="mb-2 shrink-0"><div className="flex items-center gap-2 mb-2"><div className={`w-2 h-2 rounded-full animate-pulse ${isExpensive ? "bg-orange-500" : "bg-emerald-500"}`}></div><span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Datos Reales de Mercado</span></div><h2 className="text-3xl font-black text-gray-900 leading-none tracking-tight">Análisis de Precio</h2></div>
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 px-1">
        <div className="bg-white rounded-[24px] p-6 mb-6 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-end mb-8"><div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tu Valoración</p><div className="flex items-baseline gap-1"><span className="text-5xl font-black text-gray-900 tracking-tight">{myPriceM2.toLocaleString()}</span><span className="text-sm font-bold text-gray-400">€/m²</span></div></div><div className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 ${isExpensive ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>{isExpensive ? <ArrowUp size={14} strokeWidth={3} /> : <TrendingUp size={14} strokeWidth={3} />}{Math.abs(Number(percentDiff))}% vs Media</div></div>
          
          <div className="relative h-12 mb-2 w-full select-none"><div className="absolute top-1/2 left-0 right-0 h-3 bg-gray-100 rounded-full -translate-y-1/2 overflow-hidden shadow-inner"><div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50 z-10"></div></div><div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all duration-1000" style={{ left: `${marketPosition}%` }}><div className={`w-5 h-5 rounded-full border-[3px] border-white shadow-lg -translate-x-1/2 ${isExpensive ? "bg-gray-900" : "bg-emerald-500"}`}></div><div className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 bg-gray-900 text-white text-[9px] font-black rounded-md tracking-wider shadow-sm">TÚ</div></div><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-60 flex flex-col items-center"><div className="w-3 h-3 bg-gray-400 rounded-full"></div><div className="absolute top-4 whitespace-nowrap text-[9px] font-bold text-gray-400 uppercase tracking-wider">Media Zona ({refPrice}€)</div></div></div>
          
          <p className="text-sm text-gray-600 leading-relaxed font-medium mt-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             Hemos analizado <strong>{marketData.count} testigos</strong> reales en tu zona. 
             {marketData.count === 0 ? " Aún hay pocos datos en esta área, eres pionero." : (isExpensive ? " Estás por encima de la media detectada." : " Tu precio es muy competitivo respecto a tus vecinos.")}
          </p>
        </div>
   <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-[24px] bg-gray-50 border border-gray-100 flex flex-col justify-between h-32 hover:bg-white hover:shadow-md transition-all"><div className="flex items-center gap-2 text-gray-400"><Clock size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Tiempo Estimado</span></div><div className="text-3xl font-black text-gray-900">{estimatedMonths} <span className="text-sm font-bold text-gray-400">Meses</span></div>{isExpensive && <div className="text-[10px] font-bold text-orange-500">Rotación Lenta</div>}{!isExpensive && <div className="text-[10px] font-bold text-emerald-500">Rotación Rápida</div>}</div>
          <div className="p-5 rounded-[24px] bg-gray-50 border border-gray-100 flex flex-col justify-between h-32 hover:bg-white hover:shadow-md transition-all"><div className="flex items-center gap-2 text-gray-400"><Search size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Demanda</span></div><div className="text-2xl font-black text-gray-900 flex items-center gap-2">ALTA <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span></div><div className="text-[10px] font-bold text-gray-400">Zona Caliente</div></div>
        </div>

        {/* --- 🚀 UPSELL TÁCTICO: PROMOCIÓN NANO CARD PREMIUM (Reposicionada abajo) --- */}
        <div className="mt-24 rounded-[24px] bg-gradient-to-br from-[#1a1a1f] to-[#0f0f13] border border-orange-500/20 p-5 relative overflow-hidden shadow-xl group cursor-pointer hover:border-orange-500/40 transition-all duration-300">
            {/* Efecto de radar/brillo de fondo */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-orange-500/20 transition-colors duration-500"></div>

            <div className="flex gap-4 relative z-10">
                {/* Icono del Rayo Naranja (Referencia visual a su panel) */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF9500] to-[#FF5E00] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,149,0,0.3)] group-hover:scale-105 transition-transform duration-300">
                    <Zap size={24} className="text-white" fill="currentColor" />
                </div>

                {/* Textos y Promesa de Venta */}
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Crown size={12} className="text-[#FF9500]" />
                        <h4 className="text-[9px] font-black text-[#FF9500] uppercase tracking-widest">Nivel Táctico Superior</h4>
                    </div>
                    
                    <h3 className="text-base font-bold text-white leading-tight mb-1.5">
                        Activa el modo <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9500] to-[#FF5E00] font-black">FUEGO</span>
                    </h3>
                    
                    <p className="text-[10px] text-gray-400 font-medium mb-3 pr-2 leading-relaxed">
                        Haz clic en el <strong className="text-gray-200">Rayo Naranja</strong> de tu panel de gestión. Multiplica las visitas y domina la zona.
                    </p>

                    {/* Mini-Grid de Beneficios */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <Flame size={10} className="text-[#FF9500]" />
                            <span className="text-[8px] font-bold text-gray-300 uppercase tracking-wide">Visibilidad x5</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={10} className="text-[#FF9500]" />
                            <span className="text-[8px] font-bold text-gray-300 uppercase tracking-wide">Posición Top #1</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

     {/* --- 🎨 VISUAL NANO CARD FUEGO EXAMPLE (CENTRADÍSIMO REAL) --- */}
        <div className="mt-24 mb-12 flex flex-col items-center justify-center select-none w-full mx-auto">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">Así brillará tu propiedad en el mapa</p>
            
            {/* CONTENEDOR PRINCIPAL DEL CLON */}
            <div className="pointer-events-none flex flex-col items-center group relative z-[200]">
                
                {/* 1. LA TARJETA */}
                <div className="flex w-[370px] min-h-[135px] bg-white border-[2px] border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] rounded-[16px] overflow-hidden relative">
                    
                    {/* 📸 FOTO DEL USUARIO (50%) */}
                    <div className="relative shrink-0 overflow-hidden w-[185px]">
                        <img 
                            src={(formData.images && formData.images.length > 0) ? formData.images[0] : "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80"} 
                            className="object-cover w-full h-full" 
                            alt="Propiedad" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 via-transparent to-white/10 mix-blend-overlay"></div>
                        
                        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                            <div className="px-1.5 py-0.5 rounded backdrop-blur-md bg-white/95 shadow-sm flex items-center gap-1 border border-red-100 w-fit">
                                <Crown size={10} className="text-red-600 fill-red-500 animate-[pulse_1.5s_ease-in-out_infinite]"/>
                                <span className="text-[8px] font-black uppercase tracking-widest text-red-700 leading-none mt-[1px]">FUEGO</span>
                            </div>
                        </div>
                    </div>

                    {/* 📝 TEXTOS */}
                    <div className="flex flex-col justify-between p-3 flex-1 min-w-0 bg-gradient-to-br from-[#FFF8F6] to-white">
                        <div>
                            <div className="flex justify-between items-start gap-1 mb-0.5">
                                <span className="font-black uppercase tracking-widest block leading-none truncate text-[7.5px] text-red-500">
                                    REF-PRO
                                </span>
                            </div>
                            
                            <h3 className="font-black text-slate-900 truncate tracking-tight text-[15px] mb-1">
                                {(formData.type || "PROPIEDAD").toUpperCase()}
                            </h3>

                            <div className="mb-1.5">
                                <span className="block font-black tracking-tighter leading-none text-[24px] bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                                    {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(parseFloat(String(formData.price).replace(/\D/g, "")) || 0)}
                                </span>
                            </div>

                            <div className="flex items-start gap-1">
                                <Navigation size={9} className="shrink-0 mt-[1px] text-red-400" />
                                <span className="font-bold uppercase line-clamp-2 leading-snug tracking-wider text-[8px] text-slate-600">
                                    {String(formData.address || formData.city || "UBICACIÓN PRIVADA").toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Specs */}
                        <div className="mt-1.5 pt-1.5 flex items-center justify-between border-t border-red-100">
                            <div className="flex items-center gap-1 text-slate-800">
                                <Bed size={11} className="text-red-400" />
                                <span className="font-black text-[11px]">{formData.rooms || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-800">
                                <Bath size={11} className="text-red-400" />
                                <span className="font-black text-[11px]">{formData.baths || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-800">
                                <Maximize2 size={11} className="text-red-400" />
                                <span className="font-black text-[11px]">{formData.mBuilt || 0}<span className="font-bold text-slate-400 ml-[1px] text-[7px]">m²</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🎯 2. EL PIN FLOTANTE */}
                <div className="relative rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)] flex flex-col items-center justify-center z-[300] scale-105 px-4 py-1.5 border-orange-200 border-[3px] mt-2" style={{ background: 'linear-gradient(to bottom right, #fbbf24, #ef4444)' }}>
                    <span className="absolute inset-0 rounded-full border-4 border-[#f97316] opacity-80 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                    <span className="absolute inset-0 rounded-full border-2 border-white opacity-90 animate-pulse"></span>
                    <span className="text-sm font-black font-sans tracking-tight whitespace-nowrap text-white">
                        {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(parseFloat(String(formData.price).replace(/\D/g, "")) || 0)}
                    </span>
                    <div className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-transparent border-r-transparent -bottom-[7px] border-l-[8px] border-r-[8px] border-t-[9px] border-t-[#ef4444]"></div>
                </div>

            </div>
        </div>

      </div>
      <div className="sticky bottom-0 left-0 right-0 pt-4 pb-6 bg-white/95 backdrop-blur-xl border-t border-gray-100 flex gap-4 shrink-0 z-50 -mx-4 px-4 shadow-[0_-10px_20px_rgba(255,255,255,1)]"><button onClick={onNext} className="w-full bg-[#1d1d1f] hover:bg-black text-white rounded-2xl py-4 shadow-xl active:scale-[0.99] transition-all flex justify-between items-center px-8 h-16"><div className="flex flex-col items-start"><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Siguiente paso</span><span className="text-lg font-bold">Ver Competencia (Radar)</span></div><div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><Radar size={20} className="text-white" /></div></button></div>
    </div>
  );
};

const MarketRadarStep = ({ formData, onNext }: any) => {
  const [scanning, setScanning] = useState(true);
  const [rivals, setRivals] = useState<any[]>([]); // 🔥 Aquí guardaremos los reales
  const [selectedRival, setSelectedRival] = useState<string | null>(null);

  useEffect(() => {
    const scan = async () => {
        const lat = formData.coordinates ? formData.coordinates[1] : 40.4168;
        const lng = formData.coordinates ? formData.coordinates[0] : -3.7038;
        
        try {
             // @ts-ignore
             if (typeof getMarketRadarAction !== 'undefined') {
                 const res = await getMarketRadarAction(lat, lng, formData.type);
                 if (res.success) setRivals(res.rivals);
             }
        } catch (e) { console.error(e); }

        setScanning(false);
    };
    scan();
  }, []);

  const formatMoney = (amount: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);

  if (scanning) { return (<div className="h-full flex flex-col items-center justify-center animate-fade-in text-center relative overflow-hidden"><div className="z-10 flex flex-col items-center gap-6 px-6 py-12"><div className="relative"><div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20 duration-[2000ms]"></div><div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-[0_20px_60px_-10px_rgba(0,122,255,0.3)] relative z-10 border border-blue-50"><Radar className="text-[#007AFF] animate-spin-slow" size={40} strokeWidth={1.5} /></div></div><div><h3 className="text-xl font-bold tracking-tight text-gray-900">Buscando Testigos</h3><p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-2 animate-pulse">Consultando base de datos Stratos...</p></div></div></div>); }

  return (
    <div className="h-full flex flex-col animate-fade-in relative overflow-hidden">
      <div className="flex justify-between items-end mb-4 shrink-0 px-6 pt-2"><div><div className="flex items-center gap-2 mb-1"><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#007AFF]"></span></span><span className="text-[10px] font-black uppercase tracking-widest text-[#007AFF]">Radar Activo</span></div><h3 className="text-3xl font-black text-gray-900 tracking-tight">Competencia Real</h3></div><div className="text-right bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100"><p className="text-[9px] font-black text-gray-400 uppercase tracking-wide">Radio</p><p className="text-xs font-black text-gray-900">2 KM</p></div></div>
      <div className="flex-1 flex flex-col gap-5 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 pb-28">
        
     {/* RADAR VISUAL (Círculo Perfecto) */}
        <div className="w-full py-5 bg-white rounded-[32px] border border-gray-100 flex flex-col items-center justify-center shrink-0 shadow-sm mx-auto relative overflow-hidden mb-2">
            
            {/* Efecto de fondo suave */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent opacity-50"></div>

            {/* Contenedor Cuadrado (Garantiza que el radar sea 100% redondo) */}
            <div className="relative w-40 h-40 flex items-center justify-center">
                
                {/* Anillos de Radar */}
                <div className="absolute inset-0 border border-gray-200 rounded-full"></div>
                <div className="absolute w-[66%] h-[66%] border border-gray-200 rounded-full"></div>
                <div className="absolute w-[33%] h-[33%] border border-blue-100 bg-blue-50/50 rounded-full shadow-inner"></div>
                
                {/* Cruceta del Radar (Targeting) */}
                <div className="absolute w-full h-[1px] bg-gray-100"></div>
                <div className="absolute h-full w-[1px] bg-gray-100"></div>

                {/* Tu Posición (El Centro) */}
                <div className="absolute w-3.5 h-3.5 bg-blue-600 rounded-full shadow-[0_0_0_3px_rgba(255,255,255,1)] z-20"></div>
                <div className="absolute w-10 h-10 bg-blue-500/20 rounded-full animate-ping z-10"></div>

                {/* Puntos (Rivales reales) */}
                {rivals.map((rival: any, index: number) => { 
                    const angle = index * (360 / Math.max(1, rivals.length)) * (Math.PI / 180);
                    // Distribuir en el radio matemáticamente (del 18% al 42% para no salirse)
                    const distance = 18 + (index % 3) * 12; 
                    const top = 50 + Math.sin(angle) * distance; 
                    const left = 50 + Math.cos(angle) * distance; 
                    
                    const isSelected = selectedRival === rival.id;
                    const isMyProperty = formData.id && String(rival.id) === String(formData.id);
                    const isFire = rival.isFire || rival.price === 45666 || rival.price === 210000;

                    // Código de Colores Inteligente
                    let dotColor = "bg-gray-400";
                    if (isMyProperty) dotColor = "bg-blue-600";
                    else if (isFire) dotColor = "bg-[#FF9500]";

                    return (
                        <div 
                            key={rival.id} 
                            className={`absolute w-3 h-3 rounded-full transition-all duration-300 z-30 cursor-pointer border-2 border-white shadow-sm ${dotColor} ${isSelected ? "scale-[2.5] ring-4 ring-blue-100" : "hover:scale-150"}`} 
                            style={{ top: `${top}%`, left: `${left}%` }} 
                            onMouseEnter={() => setSelectedRival(rival.id)} 
                            onMouseLeave={() => setSelectedRival(null)} 
                        >
                            {/* Pulso para los que son Fuego */}
                            {isFire && !isMyProperty && (
                                <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-60"></div>
                            )}
                        </div>
                    ); 
                })}
            </div>

            {/* Leyenda de Mando */}
            <div className="mt-5 flex gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest relative z-10">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm"></div> TÚ</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF9500] shadow-sm"></div> FUEGO</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-400 shadow-sm"></div> NORMAL</div>
            </div>
        </div>

 {/* LISTA DE PROPIEDADES REALES */}
        <div className="space-y-3 px-1">
            {rivals.length === 0 ? (
                <div className="text-center py-8 opacity-50"><p className="text-xs font-bold">No se encontraron propiedades cercanas.</p></div>
            ) : (
                rivals.map((rival: any) => { 
                    const isSelected = selectedRival === rival.id; 
                    const isMyProperty = formData.id && String(rival.id) === String(formData.id);
                    const showFire = rival.isFire || rival.price === 45666 || rival.price === 210000;

                    return (
                        // 🎯 AÑADIDO 'items-center' PARA ALINEAR LAS 3 COLUMNAS
                        <div key={rival.id} onMouseEnter={() => setSelectedRival(rival.id)} onMouseLeave={() => setSelectedRival(null)} className={`flex items-center gap-4 p-3 rounded-[24px] border transition-all duration-300 cursor-pointer group w-full ${isMyProperty ? "bg-blue-50/50 border-blue-500 shadow-md" : isSelected ? "bg-white border-blue-500 shadow-md scale-[1.01]" : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm"}`}>
                            
                            {/* COLUMNA 1: FOTO PROPIEDAD */}
                            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 relative bg-gray-100 shadow-sm border border-gray-200/50">
                                <img src={rival.img || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Propiedad" />
                            </div>
                            
                            {/* COLUMNA 2: DATOS DE LA PROPIEDAD */}
                            <div className="flex-1 flex flex-col justify-center min-w-0 py-1">
                                <div className="flex justify-between items-start mb-0.5">
                                    <h4 className={`text-[10px] font-black uppercase tracking-widest truncate ${isSelected || isMyProperty ? "text-blue-600" : "text-gray-500"}`}>
                                        {rival.type || "Activo"} <span className="opacity-50 mx-0.5">•</span> {rival.mBuilt || 0} m²
                                    </h4>
                                </div>
                                
                                <span className="text-xl font-black tracking-tight text-gray-900 mb-2 block truncate">
                                    {Number(rival.price || 0).toLocaleString('es-ES')} €
                                </span>
                                
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className={`px-2 py-0.5 rounded-md flex items-center gap-1 border whitespace-nowrap ${Number(rival.days) > 90 ? "bg-red-50 border-red-100 text-red-600" : "bg-green-50 border-green-100 text-green-700"}`}>
                                        <Clock size={10} strokeWidth={2.5} />
                                        <span className="text-[10px] font-bold tracking-wide">
                                            {Number(rival.days) === 0 ? 'Hoy' : `${rival.days || 0} Días`}
                                        </span>
                                    </div>
                                    
                                    <div className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-gray-500 flex items-center gap-1 whitespace-nowrap">
                                        <Eye size={10} strokeWidth={2.5} />
                                        <span className="text-[10px] font-bold tracking-wide">{rival.visits || 0}</span>
                                    </div>

                                    {showFire && (
                                        <div className="px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center gap-1 shadow-sm whitespace-nowrap border border-white/40 animate-pulse">
                                            <Flame size={10} fill="currentColor" />
                                            <span className="text-[10px] font-black tracking-wide uppercase">Fuego</span>
                                        </div>
                                    )}

                                    {Number(rival.pricePerM2) > 0 && (
                                        <div className="px-2 py-0.5 rounded-md bg-slate-900 text-white flex items-center gap-1 whitespace-nowrap ml-auto shadow-sm">
                                            <span className="text-[10px] font-black tracking-widest">
                                                {Number(rival.pricePerM2).toLocaleString('es-ES')} €/m²
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        {/* COLUMNA 3: BLOQUE VIP DE AGENCIA / IDENTIDAD */}
                            <div className="shrink-0 flex flex-col items-center justify-center pl-4 border-l border-gray-100 min-w-[110px]">
                                {isMyProperty ? (
                                    <>
                                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500 shadow-sm mb-1.5">
                                            <ShieldCheck size={24} className="text-blue-600" />
                                        </div>
                                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest text-center leading-tight">Tu<br/>Propiedad</span>
                                    </>
                                ) : rival.agency ? (
                                    <>
                                        {/* AVATAR VIP DE AGENCIA */}
                                        {rival.agency.logo ? (
                                            <img src={rival.agency.logo} className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shadow-sm bg-white mb-1.5" alt="Agencia"/>
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center border-2 border-gray-200 shadow-sm mb-1.5">
                                                <Briefcase size={24} className="text-gray-400" />
                                            </div>
                                        )}
                                        {/* NOMBRE Y TELÉFONO */}
                                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-wider text-center w-full max-w-[100px] truncate mb-0.5">
                                            {rival.agency.name}
                                        </span>
                                        {rival.agency.phone && (
                                            <span className="text-[9px] font-bold text-gray-500 flex items-center justify-center gap-1">
                                                <Smartphone size={10} className="text-blue-500" /> {rival.agency.phone}
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    /* 🔥 NUEVO DISEÑO PREMIUM PARA PARTICULARES */
                                    <div className="w-full flex flex-col items-center">
                                         <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border-2 border-slate-200 shadow-sm mb-1.5 group-hover:bg-slate-100 transition-colors">
                                             <Home size={22} className="text-slate-600" />
                                         </div>
                                         <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest text-center">Particular</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ); 
                })
            )}
        </div>
      </div> 
      
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex gap-4 z-50 shadow-[0_-10px_40px_rgba(255,255,255,0.8)]">
          <button onClick={onNext} className="w-full bg-[#1d1d1f] hover:bg-black text-white rounded-2xl py-4 shadow-xl active:scale-[0.99] transition-all flex justify-between items-center px-8 h-16">
              <div className="flex flex-col items-start">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Siguiente paso</span>
                  <span className="text-lg font-bold">Definir Estrategia</span>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
              </div>
          </button>
      </div>

    </div> 
  );
};

const StepVerify = ({ formData, setStep }: any) => {
  const rawPrice = useMemo(() => { if (!formData.price) return 0; return parseInt(formData.price.toString().replace(/\D/g, "")); }, [formData.price]);
  const visualPrice = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(rawPrice);
  const getPriceStyle = (p: number) => { if (p < 200000) return { hex: "#34C759", bg: "bg-[#34C759]/10", text: "text-[#34C759]", label: "INVEST" }; if (p < 550000) return { hex: "#Eab308", bg: "bg-[#Eab308]/10", text: "text-[#Eab308]", label: "OPPORTUNITY" }; if (p < 1200000) return { hex: "#F97316", bg: "bg-[#F97316]/10", text: "text-[#F97316]", label: "PREMIUM" }; if (p < 3000000) return { hex: "#EF4444", bg: "bg-[#EF4444]/10", text: "text-[#EF4444]", label: "LUXURY" }; return { hex: "#A855F7", bg: "bg-[#A855F7]/10", text: "text-[#A855F7]", label: "EXCLUSIVE" }; };
  const style = getPriceStyle(rawPrice);

 return (
    <div className="h-full flex flex-col animate-fade-in relative px-4">
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 pb-10">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-4 shadow-sm animate-bounce-small"><ShieldCheck size={32} /></div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Resumen Final</h2>
            <p className="text-gray-500 font-medium">Confirma los datos antes de continuar.</p>
        </div>
        
        {/* TARJETA RESUMEN (NO TOCAR) */}
        <div className="w-full max-w-sm bg-white rounded-[32px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden relative group">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500">{formData.type || "Inmueble"}</span>
                    {formData.state && (<span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formData.state}</span>)}
                </div>
                <div className="flex items-start gap-2 text-gray-900">
                    <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="font-bold leading-tight line-clamp-2">{formData.address || "Ubicación Premium"}</p>
                </div>
            </div>
            <div className="p-8 text-center bg-white relative">
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase ${style.bg} ${style.text}`}>{style.label}</div>
                <div className={`text-5xl font-black tracking-tighter mt-4 mb-1 ${style.text}`}>{visualPrice}<span className="text-3xl align-top opacity-50 ml-1">€</span></div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor de Salida</p>
            </div>
            <div className="grid grid-cols-3 border-t border-gray-100 divide-x divide-gray-100 bg-gray-50/30">
                <div className="p-4 text-center"><span className="block text-xl font-black text-gray-900">{formData.rooms}</span><span className="text-[9px] font-bold text-gray-400 uppercase">Habit.</span></div>
                <div className="p-4 text-center"><span className="block text-xl font-black text-gray-900">{formData.baths}</span><span className="text-[9px] font-bold text-gray-400 uppercase">Baños</span></div>
                <div className="p-4 text-center"><span className="block text-xl font-black text-gray-900">{formData.mBuilt}</span><span className="text-[9px] font-bold text-gray-400 uppercase">m²</span></div>
            </div>
        </div>
      </div>

      {/* BOTONERA INFERIOR BLINDADA */}
      <div className="shrink-0 pb-6 pt-2">
          {/* BOTÓN PRINCIPAL */}
          <button 
            onClick={() => { 
                // ⚡️ SI ES EDICIÓN O AGENCIA -> SALTAR SMS E IR A SUCCESS
                if (formData.isEditMode || formData.isAgencyContext) { 
                    setStep("SUCCESS"); 
                } else { 
                    setStep("SECURITY"); 
                } 
            }} 
            className="w-full h-16 bg-[#1d1d1f] hover:bg-black text-white rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-between px-8 group"
          >
            <div className="flex flex-col items-start">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-400 transition-colors">
                    {(formData.isEditMode || formData.isAgencyContext) ? "Proceso Completado" : "Último Paso"}
                </span>
                <span className="text-lg font-bold">
                    {(formData.isEditMode || formData.isAgencyContext) ? "Guardar y Publicar" : "Verificar Identidad"}
                </span>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                {(formData.isEditMode || formData.isAgencyContext) ? <CheckCircle2 size={20} className="text-white"/> : <Smartphone size={20} className="text-white"/>}
            </div>
          </button>
          
          {/* BOTÓN VOLVER INTELIGENTE */}
          <button 
            onClick={() => {
                // Si es agencia, volvemos a RADAR (porque nos saltamos Estrategia)
                if (formData.isAgencyContext) {
                    setStep("RADAR");
                } else {
                    setStep("STRATEGY");
                }
            }} 
            className="w-full py-3 mt-2 text-gray-400 font-bold hover:text-gray-600 text-xs transition-colors"
          >
            Volver a {(formData.isAgencyContext) ? "Radar" : "Estrategia"}
          </button>
      </div>
    </div>
  );
};

// ==================================================================================
// 🏆 STEP SUCCESS: VERSIÓN BLINDADA (FILTRO ANTI-IMPAGO)
// ==================================================================================
const StepSuccess = ({ handleClose, formData }: any) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const lastSavedIdRef = useRef<string | null>(formData?.id ? String(formData.id) : null);
  
  // 1. ANÁLISIS DE LA SITUACIÓN BLINDADO 🛡️
  const currentStatus = formData?.status;
  const isPendingPayment = currentStatus === "PENDIENTE_PAGO"; // ¿Es un borrador sin pagar?
  const isAgency = formData.isAgencyContext;

  // Calculamos si es edición visualmente (para textos)
  const isEditMode = formData.isEditMode || currentStatus === "PUBLICADO";
  
  // 🔥 LÓGICA CRÍTICA DE PAGO:
  // Solo permitimos "Guardar directo" (Gratis) si:
  // A) Es Agencia (Siempre gratis).
  // B) Es Particular EDITANDO algo que NO está pendiente de pago.
  // SI ESTÁ PENDIENTE DE PAGO -> isDirectSave será FALSE -> Obliga a Pagar.
  const isDirectSave = isAgency || (isEditMode && !isPendingPayment);

  // Visuales (Precio y Foto)
  const rawPrice = formData.price ? parseInt(formData.price.toString().replace(/\D/g, "")) : 0;
  const visualPrice = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(rawPrice);
  const hasUserPhoto = formData.images && formData.images.length > 0;
  const previewImage = hasUserPhoto ? formData.images[0] : "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80";
  // --- 🔥 EL CEREBRO DE LA OPERACIÓN ---
  const handleProcess = async () => {
    if (isPublishing) return;
    setIsPublishing(true);

    try {
      // ---------------------------------------------------------
      // 🛡️ LÓGICA DE INVISIBILIDAD REFORZADA
      // ---------------------------------------------------------
      let targetStatus = formData.status;

      if (isDirectSave) {
          // Si es Agencia o Edición: Mantenemos estado o Publicamos
          if (!targetStatus) targetStatus = "PUBLICADO";
      } else {
          // 🛑 SI ES PARTICULAR NUEVO: ¡FORZAMOS INVISIBILIDAD!
          // No importa lo que diga el formulario, aquí mandamos nosotros.
          targetStatus = "PENDIENTE_PAGO";
      }

      // 2. PREPARAR EL PAQUETE DE DATOS
      const cleanPayload = {
        ...formData,
        id: lastSavedIdRef.current || formData?.id || undefined,
        status: targetStatus, // ✅ APLICAMOS EL ESTADO SEGURO
        rooms: Number(formData.rooms || 0),
        baths: Number(formData.baths || 0),
        mBuilt: Number(formData.mBuilt || 0),
        price: formData.price,
        
        // 🔥 CORRECCIÓN CRÍTICA:
        coordinates: formData.coordinates || undefined, 
        
        // 🎯 NUEVO: INYECCIÓN DIRECTA DE B2B A LA RAÍZ DE PRISMA
        // Extraemos los datos del sub-objeto b2b que genera StepAgencyB2B
        sharePct: Number(formData.b2b?.sharePct || formData.sharePct || 0),
        shareVisibility: String(formData.b2b?.visibility || formData.shareVisibility || "PRIVATE").toUpperCase(),
      };

      console.log("📡 GUARDANDO EN BASE DE DATOS (Estado:", targetStatus, ")...");

      // 3. 💾 GUARDADO REAL (Aquí se crea la propiedad en la DB)
      const response = await savePropertyAction(cleanPayload);

      if (response.success && response.property) {
        const serverProp = response.property;
        const serverId = String(serverProp.id);
        
        // Guardamos el ID por si acaso
        lastSavedIdRef.current = serverId;

        // 4. RECUPERAR IDENTIDAD DEL DUEÑO (Para el pago)
        let ownerId = serverProp.userId || serverProp.user?.id;
        let ownerEmail = serverProp.user?.email;

        // Intentamos recuperar si falta
        if (!ownerId) {
            try {
                // @ts-ignore 
                const me = await getUserMeAction();
                if (me?.success && me.data) {
                    ownerId = me.data.id;
                    ownerEmail = me.data.email;
                }
            } catch (e) { console.error("Info: No se pudo verificar sesión extra", e); }
        }

        // 5. DECISIÓN FINAL
        if (isDirectSave) {
            // === CAMINO A: AGENCIA/EDICIÓN (Misión Cumplida) ===
            
            // Preparamos datos para el mapa con MEMORIA TOTAL
            let secureImage = null;
            if (serverProp.mainImage) secureImage = serverProp.mainImage;
            else if (serverProp.images && serverProp.images.length > 0) secureImage = serverProp.images[0].url;
            else if (formData.images && formData.images.length > 0) secureImage = formData.images[0];

            // Inyectamos todo lo que nos devolvió la base de datos (Open House, B2B, etc.)
            const activeCampaign = (serverProp.campaigns && serverProp.campaigns.length > 0) ? serverProp.campaigns[0] : null;
            const openHouseObj = (serverProp.openHouses && serverProp.openHouses.length > 0) ? { ...serverProp.openHouses[0], enabled: true } : null;

            const mapFormat = {
                ...serverProp,
                coordinates: [serverProp.longitude, serverProp.latitude],
                user: serverProp.user || formData.user,
                img: secureImage,
                images: serverProp.images?.map((i: any) => i.url) || (secureImage ? [secureImage] : []),
                price: new Intl.NumberFormat("es-ES").format(serverProp.price || 0),
                selectedServices: serverProp.selectedServices,
                
                // 🔥 RECUPERACIÓN DE LA MEMORIA:
                openHouse: openHouseObj,
                open_house_data: openHouseObj,
                activeCampaign: activeCampaign,
                b2b: {
                    sharePct: activeCampaign ? activeCampaign.commissionSharePct : serverProp.sharePct,
                    visibility: activeCampaign ? activeCampaign.commissionShareVisibility : serverProp.shareVisibility
                }
            };
            // Actualizamos la pantalla del usuario
            if (typeof window !== "undefined") {
                const eventName = isEditMode ? "update-property-signal" : "add-property-signal";
                window.dispatchEvent(new CustomEvent(eventName, { 
                    detail: isEditMode ? { id: mapFormat.id, updates: mapFormat } : mapFormat 
                }));
                window.dispatchEvent(new CustomEvent("reload-profile-assets"));
                window.dispatchEvent(new CustomEvent("force-map-refresh"));
            }
            
            // Cerramos la ventana
            handleClose(mapFormat);
            setIsPublishing(false);

        } else {
            // === CAMINO B: PARTICULAR NUEVO (Cobrar Misión) ===
            // La propiedad YA EXISTE en la DB, pero como "PENDIENTE_PAGO" (Invisible).
            
            if (!ownerId) {
                alert("Seguridad: No se ha detectado la sesión del usuario. Recargue la página.");
                setIsPublishing(false);
                return;
            }

            console.log("💳 REDIRIGIENDO A MOLLIE... (ID:", serverId, ")");
            
            // Llamamos a la función de pago (que está al final del archivo)
            await startPropertyPayments(serverId, {
                userId: String(ownerId),
                email: ownerEmail ? String(ownerEmail) : undefined
            });
            // No ponemos setIsPublishing(false) porque nos vamos de la página
        }

      } else {
        alert("Error del servidor al guardar: " + response.error);
        setIsPublishing(false);
      }
    } catch (err) {
      console.error("❌ Error grave:", err);
      alert("Error de conexión. Verifique su internet.");
      setIsPublishing(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center animate-fade-in px-4 relative overflow-hidden">
      
      {/* Fondo Animado */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-400/20 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -z-10 animate-pulse delay-700" />

      {/* Icono Central */}
      <div className="mb-8 relative">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(34,197,94,0.4)] animate-bounce-small z-10 relative">
            <CheckCircle2 size={48} className="text-white" strokeWidth={3} />
        </div>
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 duration-[2000ms]" />
      </div>

      {/* Textos */}
      <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight text-center">
        {isEditMode ? "¡Cambios Guardados!" : "¡Casi Listo!"}
      </h2>
      <p className="text-gray-500 mb-10 text-center font-medium max-w-sm text-lg">
         {isEditMode ? "Tus cambios se han actualizado." : "Conectando con la pasarela de pago..."}
      </p>

      {/* Tarjeta Resumen */}
      <div className="w-full max-w-xs bg-white rounded-[24px] border border-gray-100 shadow-xl p-4 mb-10 transform rotate-1 hover:rotate-0 transition-transform duration-500">
          <div className="aspect-video bg-gray-100 rounded-xl mb-4 relative overflow-hidden group">
             <img src={previewImage} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
             <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm">
                {isEditMode ? "ACTUALIZADO" : "NUEVO"}
             </div>
          </div>
          <div className="px-2 pb-2">
             <h3 className="text-sm font-black text-gray-900 line-clamp-1">{formData.title || "Propiedad"}</h3>
             <p className="text-xs text-gray-500 font-medium mb-3 line-clamp-1">{formData.address}</p>
             <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <span className="text-lg font-black text-gray-900">{visualPrice}€</span>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase">{formData.type}</span>
             </div>
          </div>
      </div>

     {/* Botón de Acción BLINDADO */}
      <button
        onClick={handleProcess}
        disabled={isPublishing}
        className="w-full max-w-md bg-[#1d1d1f] hover:bg-black text-white rounded-2xl py-4 px-8 shadow-xl active:scale-[0.98] transition-all flex justify-between items-center group cursor-pointer"
      >
        <div className="flex flex-col items-start">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-300 transition-colors">
             {/* Texto Superior */}
             {isDirectSave ? "PROCESO COMPLETADO" : "LANZAMIENTO"}
          </span>
          <span className="text-lg font-bold">
             {/* Texto Principal: Aquí se ve la magia */}
             {isPublishing 
                ? "Procesando..." 
                : (isDirectSave ? "Guardar y Salir" : "Pagar y Publicar")}
          </span>
        </div>
        
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
           {/* Icono: Check si es gratis, Flecha si es pago */}
           {isDirectSave ? <CheckCircle2 size={20} className="text-white"/> : <ArrowRight size={20} className="text-white"/>}
        </div>
      </button>

    </div>
  );
};
// ==================================================================================
// 💰 LÓGICA DE PAGO BLINDADA (CON IDENTIFICACIÓN DE USUARIO)
// ==================================================================================

function toAmountStringLocal(v?: string) {
  const n = Number(v ?? "9.90");
  if (!Number.isFinite(n) || n <= 0) return "9.90";
  return n.toFixed(2);
}

// ✅ AHORA ACEPTA 'userId' Y 'email' EN LAS OPCIONES
async function startPropertyPayments(
  propertyId: string,
  opts: { 
    amount?: string; 
    redirectPath?: string; 
    description?: string; 
    refCode?: string;
    userId?: string;  // <--- NUEVO
    email?: string;   // <--- NUEVO
  } = {}
) {
  if (typeof window === "undefined") return;
  
  const pid = String(propertyId || "").trim();
  if (!pid) {
    alert("Error crítico: Falta ID de propiedad.");
    return;
  }

  // 1. INTENTAMOS OBTENER EL USUARIO DE LOS PARÁMETROS (PRIORIDAD)
  let finalUserId = opts.userId;
  let finalUserEmail = opts.email;

  // 2. SI NO VIENE, INTENTAMOS RESCATARLO DEL SISTEMA (FALLBACK)
  if (!finalUserId) {
    try {
      // Intentamos llamar a la acción si está importada
      // @ts-ignore
      if (typeof getUserMeAction !== 'undefined') {
         // @ts-ignore
         const me = await getUserMeAction();
         if (me?.success && me.data) {
           finalUserId = String(me.data.id);
           finalUserEmail = me.data.email;
         }
      }
    } catch (e) { console.log("No se pudo autodetectar usuario", e); }
  }

  // 🚨 SI SIGUE FALTANDO, ALERTA ROJA
  if (!finalUserId) {
      alert("Error de Seguridad: No se ha podido identificar al usuario (Missing userId). Por favor, recargue e inicie sesión.");
      return;
  }

  const origin = window.location.origin;
  const redirectPath = (opts.redirectPath ?? (window.location.pathname + window.location.search)).trim();
  const redirectUrl = new URL(redirectPath, origin).toString();
  const description = (opts.description ?? "Publicación propiedad — 9,90€") + (opts.refCode ? ` (${opts.refCode})` : "");

  try {
    const res = await fetch("/api/mollie/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: toAmountStringLocal(opts.amount),
        currency: "EUR",
        description,
        redirectUrl,
        metadata: {
          kind: "PROPERTY_PUBLISH",
          propertyId: pid,
          userId: finalUserId,     // ✅ AQUÍ VA EL ID SEGURO
          email: finalUserEmail,
        },
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json?.ok) {
      alert(json?.error || `Error iniciando pago (HTTP ${res.status}).`);
      return;
    }

    if (!json?.checkoutUrl) {
      alert("Error: Pasarela de pago no respondió con URL.");
      return;
    }

    // AL ATAQUE
    window.location.assign(String(json.checkoutUrl));
    
  } catch (err) {
    console.error("Error red pago:", err);
    alert("Error de conexión al iniciar pago.");
  }
}