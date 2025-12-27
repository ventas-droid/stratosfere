// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, ArrowUp, Camera, Check, CheckCircle2, Clock,
  Eye, FileCheck, FileText, Flame, Globe, LayoutGrid, Loader2, Map as MapIcon,
  MapPin, Megaphone, Paintbrush, Radar, Ruler, Search, Shield, ShieldCheck,
  Smartphone, TrendingUp, Truck, UploadCloud, Video, X, Zap, Award, Crown,
  Box, Droplets, Star, Bed, Bath, Maximize2
} from "lucide-react";

import { PROPERTY_TYPES } from "./property-types";
import MapNanoCard from "./MapNanoCard";
import ExplorerHud from "./ExplorerHud";
import ProfilePanel from "./ProfilePanel";
import MarketPanel from "./MarketPanel";

const MAPBOX_TOKEN = "pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw";

// --- PARSEADOR LOCAL PARA EL GUARDADO ---
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
// 📦 CATÁLOGO SERVICIOS
// ==================================================================================
const SERVICES_CATALOG = [
  { id: "pack_basic", name: "KIT INICIADO", price: 29.9, category: "PACKS", icon: Star, desc: "Foto Pro + Plano + Certificado.", role: "VALIDADO" },
  { id: "pack_pro", name: "KIT VISIBILIDAD", price: 99.9, category: "PACKS", icon: Award, desc: "Tour 3D + Portales Top + Redes.", role: "PRO SELLER" },
  { id: "pack_elite", name: "STRATOS GOD MODE", price: 199.9, category: "PACKS", icon: Crown, desc: "Todo incluido + Abogado + Open House.", role: "LEYENDA" },
  { id: "pack_investor", name: "PACK INVERSOR", price: 149.9, category: "PACKS", icon: TrendingUp, desc: "Dossier rentabilidad + Emailing.", role: "BROKER" },
  { id: "pack_express", name: "VENTA EXPRESS", price: 79.9, category: "PACKS", icon: Zap, desc: "Destacado agresivo 15 días.", role: "SPEED" },

  { id: "foto", name: "FOTOGRAFÍA HDR", price: 99.0, category: "ONLINE", icon: Camera, desc: "Calidad revista. 20 fotos." },
  { id: "video", name: "VÍDEO CINE", price: 199.9, category: "ONLINE", icon: Video, desc: "Narrativa emocional 4K." },
  { id: "drone", name: "FOTOGRAFÍA DRONE", price: 120.0, category: "ONLINE", icon: Globe, desc: "Vistas aéreas del entorno." },
  { id: "tour3d", name: "TOUR VIRTUAL 3D", price: 150.0, category: "ONLINE", icon: Box, desc: "Matterport inmersivo." },
  { id: "destacado", name: "POSICIONAMIENTO", price: 49.0, category: "ONLINE", icon: ArrowUp, desc: "Siempre primero en listas." },
  { id: "ads", name: "PAID SOCIAL ADS", price: 79.9, category: "ONLINE", icon: Megaphone, desc: "Campaña Instagram & FB." },
  { id: "plano_2d", name: "PLANO TÉCNICO", price: 59.0, category: "ONLINE", icon: Ruler, desc: "Cotas y distribución 2D." },
  { id: "plano_3d", name: "PLANO 3D", price: 89.0, category: "ONLINE", icon: Box, desc: "Volumetría amueblada." },
  { id: "email", name: "EMAIL INVERSORES", price: 149.0, category: "ONLINE", icon: FileText, desc: "Acceso a base de datos VIP." },
  { id: "copy", name: "COPYWRITING PRO", price: 39.0, category: "ONLINE", icon: FileText, desc: "Textos persuasivos de venta." },

  { id: "certificado", name: "CERTIFICADO ENERG.", price: 120.0, category: "OFFLINE", icon: FileCheck, desc: "Etiqueta oficial obligatoria." },
  { id: "cedula", name: "CÉDULA HABITAB.", price: 90.0, category: "OFFLINE", icon: FileText, desc: "Trámite ayuntamiento." },
  { id: "nota_simple", name: "NOTA SIMPLE", price: 20.0, category: "OFFLINE", icon: FileText, desc: "Verificación registral." },
  { id: "tasacion", name: "TASACIÓN OFICIAL", price: 250.0, category: "OFFLINE", icon: Activity, desc: "Valoración bancaria." },
  { id: "lona", name: "LONA FACHADA XL", price: 49.9, category: "OFFLINE", icon: LayoutGrid, desc: "Visibilidad física 24/7." },
  { id: "buzoneo", name: "BUZONEO PREMIUM", price: 29.9, category: "OFFLINE", icon: MapPin, desc: "Dominio del barrio (2000 u)." },
  { id: "revista", name: "REVISTA LUXURY", price: 59.9, category: "OFFLINE", icon: FileText, desc: "Prensa papel local." },
  { id: "openhouse", name: "OPEN HOUSE VIP", price: 149.9, category: "OFFLINE", icon: Zap, desc: "Evento puertas abiertas." },
  { id: "homestaging", name: "HOME STAGING", price: 299.0, category: "OFFLINE", icon: Box, desc: "Muebles de cartón/reales." },
  { id: "limpieza", name: "LIMPIEZA PRO", price: 89.9, category: "OFFLINE", icon: Droplets, desc: "Puesta a punto total." },
  { id: "pintura", name: "LAVADO DE CARA", price: 450.0, category: "OFFLINE", icon: Paintbrush, desc: "Pintura blanco neutro." },
  { id: "mudanza", name: "MUDANZA", price: 300.0, category: "OFFLINE", icon: Truck, desc: "Servicio logística." },
  { id: "seguro", name: "SEGURO IMPAGO", price: 199.0, category: "OFFLINE", icon: ShieldCheck, desc: "Protección alquiler/venta." },
];

// ==================================================================================
// 🧠 DB MERCADO (NO TOCAR - MANTENER INTACTA)
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
// ✅ ARCHITECT HUD (CORREGIDO)
// ==================================================================================
export default function ArchitectHud({ onCloseMode, soundFunc, initialData }: any) {
  const STEPS = ["LOCATION","BASICS","SPECS","DESCRIPTION","ENERGY","MEDIA","PRICE","ANALYSIS","RADAR","STRATEGY","VERIFY","SECURITY","SUCCESS"];
  const LABEL_STEPS = ["LOCATION","BASICS","SPECS","DESCRIPTION","ENERGY","MEDIA","PRICE","ANALYSIS"]; 

  const [step, setStep] = useState<string>("LOCATION");
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showProfile, setShowProfile] = useState(false);
  const [showMarket, setShowMarket] = useState(false);
  const [showWizard, setShowWizard] = useState(true);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  // ESTADO GLOBAL DEL FORMULARIO
  const [formData, setFormData] = useState<any>({
    address: "",
    coordinates: null,
    type: PROPERTY_TYPES?.PISO ?? "Piso",
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
    price: "", // Se guarda como STRING limpio "650000"
    communityFees: "",
    phone: "",
    phoneCode: "",
    strategyTier: "",
  });

 useEffect(() => {
    if (initialData) {
      setFormData((prev: any) => ({
        ...prev,
        ...initialData,
        coordinates: initialData.coordinates || prev.coordinates || null,
      }));
      if (initialData.selectedServices) setSelectedServices(initialData.selectedServices);
    }
  }, [initialData]);

  const updateData = (field: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, [field]: value }));

  // 🔥 FIX UI: Asegurar que abrir uno no cierra el otro incorrectamente
  const toggleProfile = () => setShowProfile((v) => !v);
  
  const toggleMarket = () => {
      // Solo abrimos/cerramos Market, NO tocamos Profile aquí para evitar conflicto de cierre
      setShowMarket((v) => !v);
  };

  const toggleService = (id: string) => {
    setSelectedServices((prev) => {
      let current = [...prev];
      if (id.startsWith("pack_")) {
        if (current.includes(id)) return current.filter((x) => x !== id);
        current = current.filter((x) => !x.startsWith("pack_"));
        current.push(id);
        return current;
      }
      return current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    });
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

  // 🔥 CÁLCULO EN TIEMPO REAL: Convertir el string guardado a número puro para la NanoCard
  const currentRawPrice = useMemo(() => {
      return parsePriceInput(formData.price);
  }, [formData.price]);

  return (
    <div className="absolute inset-0 pointer-events-none z-[5000]">
      {/* 🔥 NANO CARD PREVIEW: Pasamos datos explícitos para que no fallen los iconos */}
      {step !== "SUCCESS" && (
        <MapNanoCard 
            {...formData} 
            // Forzamos el paso de los datos clave
            rooms={formData.rooms}
            baths={formData.baths}
            mBuilt={formData.mBuilt}
            // Precio corregido
            rawPrice={currentRawPrice} 
            priceValue={currentRawPrice} 
            price={formData.price} // String para display si hace falta
        />
      )}

      {!showWizard && (
        <ExplorerHud
          onCloseMode={() => closeWizard()}
          soundFunc={soundFunc}
          onGoToMap={() => setShowWizard(true)}
        />
      )}

      {/* PANELES */}
      <ProfilePanel
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onOpenMarket={toggleMarket}
        activeServicesCount={selectedServices.length}
        rightPanel={showProfile ? "PROFILE" : "NONE"}
        toggleRightPanel={(val: string) => setShowProfile(val === "PROFILE")}
      />
      <MarketPanel
        isOpen={showMarket}
        onClose={() => setShowMarket(false)}
        selectedReqs={selectedServices}
        toggleRequirement={toggleService}
      />

    {showWizard && (
        <div
          className={`fixed inset-0 z-[7000] flex items-center justify-center p-4 transition-all duration-500 ${
            isClosing ? "opacity-0" : "opacity-100"
          } pointer-events-auto`}
        >
          {/* 🛑 FONDO "APPLE GLASS" */}
          <div className="absolute inset-0 bg-[#F5F5F7]/95 backdrop-blur-xl transition-all" />

          {/* 🎨 CONTENEDOR PRINCIPAL PREMIUM (CORREGIDO) */}
          <div
            className={`relative z-10 w-[90vw] max-w-5xl h-[85vh] flex flex-col overflow-hidden 
            transform transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1)
            rounded-[32px] 
            /* Degradado sutil + Sombra profunda sin bordes duros */
            bg-gradient-to-b from-white to-[#FAFAFA] 
            shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.03)]
            ${isClosing ? "scale-95 translate-y-10 opacity-0" : "scale-100 translate-y-0 opacity-100"}`}
          >
            {/* Header Limpio */}
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
                  
                  {/* Botón Cerrar Estilo Apple */}
                  <button 
                    onClick={() => closeWizard()} 
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 active:scale-90"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                
                {/* Barra de Progreso Ultra Fina */}
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#0071e3] shadow-[0_0_10px_rgba(0,113,227,0.3)] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            )}

            {/* Contenido */}
            <div className="flex-1 overflow-hidden relative z-10 p-0 bg-white">
              {/* Scrollbar oculto para limpieza visual */}
              <div className="h-full w-full overflow-y-auto custom-scrollbar p-8 lg:px-12">
                
                {/* Contenedor centrado para evitar estiramientos feos */}
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                    {step === "LOCATION" && <StepLocation formData={formData} updateData={updateData} setStep={setStep} />}
                    {step === "BASICS" && <StepBasics formData={formData} updateData={updateData} setStep={setStep} />}
                    {step === "SPECS" && <StepSpecs formData={formData} updateData={updateData} setStep={setStep} />}
                    {step === "DESCRIPTION" && <StepDescription formData={formData} updateData={updateData} setStep={setStep} />}
                    {step === "ENERGY" && <StepEnergy formData={formData} updateData={updateData} setStep={setStep} />}
                    {step === "MEDIA" && <StepMedia setStep={setStep} />}
                    {step === "PRICE" && <StepPrice formData={formData} updateData={updateData} setStep={setStep} />}

                    {step === "ANALYSIS" && <MarketAnalysisStep formData={formData} onNext={() => setStep("RADAR")} />}
                    {step === "RADAR" && <MarketRadarStep formData={formData} onNext={() => setStep("STRATEGY")} />}
                    {step === "STRATEGY" && (
                    <InternalMarketStrategyStep selectedServices={selectedServices} toggleService={toggleService} onNext={() => setStep("VERIFY")} />
                    )}

                    {step === "VERIFY" && <StepVerify formData={formData} setStep={setStep} />}
                    {step === "SECURITY" && <StepSecurity setStep={setStep} setLoading={setLoading} />}
                    
                    {step === "SUCCESS" && (
                    <StepSuccess
                        formData={formData} 
                        handleClose={(payload: any) => {
                            // LOGICA ORIGINAL INTACTA
                            const rawNum = parsePriceInput(formData.price);
                            if (typeof window !== "undefined") {
                            try {
                                    const saved = JSON.parse(localStorage.getItem("stratos_my_properties") || "[]");
                                    const idx = saved.findIndex((p: any) => p.id === payload.id);
                                    if (idx >= 0) saved[idx] = payload;
                                    else saved.push(payload);
                                    localStorage.setItem("stratos_my_properties", JSON.stringify(saved));
                                    window.dispatchEvent(new CustomEvent("reload-profile-assets"));
                                    window.dispatchEvent(new CustomEvent("force-map-refresh"));
                            } catch (e) { console.error(e); }
                            }
                            closeWizard(payload);
                        }}
                    />
                    )}
                </div>
              </div>

              {/* Loader Apple Style */}
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

// ... (Resto de los componentes Steps igual que antes, el parser ya está global arriba) ...
// He incluido todo el archivo arriba para asegurar que no falta nada.
// Simplemente copia y pega el bloque de arriba completo.

// ============================================================================
// 🧱 STEPS (MISMOS COMPONENTES, SOLO CAMBIAMOS LA LÓGICA PRINCIPAL ARRIBA)
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
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_TOKEN}&country=es&types=address,poi&language=es`
        );
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
            placeholder="Ej: Paseo de la Castellana 34..."
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
            <div className="animate-fade-in flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <span className="text-lg font-bold text-green-700">Ubicación Confirmada</span>
              <span className="text-sm text-gray-400 mt-2 px-8 truncate max-w-[400px]">
                {formData.city ? `${String(formData.city).toUpperCase()}${formData.postcode ? ` (${formData.postcode})` : ""}` : formData.address}
              </span>
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

const StepBasics = ({ formData, updateData, setStep }: any) => {
  const [localDoor, setLocalDoor] = useState(formData.door || "");
  const saveDoor = () => updateData("door", localDoor);

  return (
    <div className="h-full flex flex-col animate-fade-in-right">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Características</h2>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Tipo de inmueble</label>
          <div className="grid grid-cols-2 gap-3 pb-2">
            {Object.values(PROPERTY_TYPES).map((t: any) => (
              <button
                key={t}
                onClick={() => updateData("type", t)}
                className={`py-3 border rounded-xl text-xs font-bold w-full transition-all ${
                  formData.type === t ? "border-blue-600 bg-blue-600 text-white shadow-md" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Planta</label>
            <select
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-300 text-gray-900 font-bold focus:border-black outline-none transition-all appearance-none"
              value={formData.floor}
              onChange={(e) => updateData("floor", e.target.value)}
            >
              <option value="" className="text-gray-400">Selecciona</option>
              <option value="Bajo">Bajo</option>
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <option key={n} value={n}>{n}ª Planta</option>
              ))}
            </select>
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

        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">¿Tiene ascensor?</label>
          <div className="flex gap-4">
            <button
              onClick={() => updateData("elevator", true)}
              className={`flex-1 py-3 border rounded-xl text-sm font-bold transition-all ${
                formData.elevator ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Sí
            </button>
            <button
              onClick={() => updateData("elevator", false)}
              className={`flex-1 py-3 border rounded-xl text-sm font-bold transition-all ${
                !formData.elevator ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              No
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-4 pt-4 border-t border-gray-100">
        <button onClick={() => setStep("LOCATION")} className="p-4 bg-gray-100 text-gray-800 rounded-2xl hover:bg-gray-200 transition-all active:scale-95">
          <ArrowLeft size={24} />
        </button>
        <button onClick={() => { saveDoor(); setStep("SPECS"); }} className="w-full py-4 text-white font-bold rounded-2xl shadow-lg bg-black hover:opacity-90 active:scale-95">
          Siguiente
        </button>
      </div>
    </div>
  );
};

const StepSpecs = ({ formData, updateData, setStep }: any) => {
  const formatNumber = (val: any) => {
    if (!val) return "";
    const raw = val.toString().replace(/\D/g, "");
    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const [localM2, setLocalM2] = useState(formData.mBuilt ? formatNumber(formData.mBuilt) : "");

  // Helper de Estilo (Consistencia con Paso 2)
  const getSelectionStyle = (isSelected: boolean) =>
    isSelected
      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-transparent transform scale-[1.02] z-10"
      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md";

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2">
      {/* Encabezado */}
      <div className="mb-6 shrink-0">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Dimensiones</h2>
        <p className="text-gray-500 font-medium">Define el tamaño y la distribución.</p>
      </div>

      {/* 🛑 FIX: Padding horizontal (px-4) para evitar corte de sombras laterales */}
      <div className="flex-1 space-y-8 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-8 pt-2">
        
        {/* SUPERFICIE: Input Gigante */}
        <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 shadow-inner group focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-blue-600">
            Superficie Construida
          </label>
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

        {/* CONTADORES: Habitaciones y Baños */}
        <div className="grid grid-cols-2 gap-6">
          {/* Habitaciones */}
          <div className="p-5 rounded-[24px] border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">
              Habitaciones
            </label>
            <div className="flex items-center justify-between">
              <button 
                onClick={() => updateData("rooms", Math.max(0, Number(formData.rooms || 0) - 1))} 
                className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 font-bold text-xl transition-colors active:scale-90 flex items-center justify-center"
              >
                -
              </button>
              <span className="text-3xl font-black text-gray-900 min-w-[40px] text-center">
                {formData.rooms}
              </span>
              <button 
                onClick={() => updateData("rooms", Number(formData.rooms || 0) + 1)} 
                className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xl transition-colors active:scale-90 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Baños */}
          <div className="p-5 rounded-[24px] border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">
              Baños
            </label>
            <div className="flex items-center justify-between">
              <button 
                onClick={() => updateData("baths", Math.max(0, Number(formData.baths || 0) - 1))} 
                className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 font-bold text-xl transition-colors active:scale-90 flex items-center justify-center"
              >
                -
              </button>
              <span className="text-3xl font-black text-gray-900 min-w-[40px] text-center">
                {formData.baths}
              </span>
              <button 
                onClick={() => updateData("baths", Number(formData.baths || 0) + 1)} 
                className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xl transition-colors active:scale-90 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* ESTADO: Grid con padding extra para evitar corte de sombras */}
        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">
            Estado de conservación
          </label>
          <div className="grid grid-cols-3 gap-3 p-1">
            {["Obra nueva", "Buen estado", "A reformar"].map((s) => (
              <button
                key={s}
                onClick={() => updateData("state", s)}
                className={`py-4 px-1 rounded-2xl text-xs font-bold transition-all border ${getSelectionStyle(formData.state === s)}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ORIENTACIÓN: Toggle con más espacio interno */}
        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">
            Orientación
          </label>
          {/* 🛑 FIX: p-1.5 para dar aire al botón interior */}
          <div className="flex gap-4 p-1.5 bg-gray-100/80 rounded-[22px] backdrop-blur-sm">
             <button
                onClick={() => updateData("exterior", true)}
                className={`flex-1 py-4 rounded-[18px] text-sm font-bold transition-all duration-300 ${
                  formData.exterior 
                  ? "bg-white text-gray-900 shadow-md scale-[1.00] ring-1 ring-black/5" 
                  : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Exterior
              </button>
              <button
                onClick={() => updateData("exterior", false)}
                className={`flex-1 py-4 rounded-[18px] text-sm font-bold transition-all duration-300 ${
                  !formData.exterior 
                  ? "bg-white text-gray-900 shadow-md scale-[1.00] ring-1 ring-black/5" 
                  : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Interior
              </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
        <button 
            onClick={() => setStep("BASICS")} 
            className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
            onClick={() => setStep("DESCRIPTION")} 
            className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
        >
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
      {/* Encabezado */}
      <div className="mb-6 shrink-0">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Narrativa</h2>
        <p className="text-gray-500 font-medium">Cuenta la historia de tu propiedad.</p>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto px-4 -mx-4 custom-scrollbar pt-2 pb-4">
        
        {/* TITULAR: Estilo Editorial */}
        <div className="group">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-blue-600">
            Titular del Anuncio
          </label>
          <input
            className="w-full p-5 bg-gray-50 rounded-[24px] border border-gray-100 text-2xl font-bold text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:bg-white focus:shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-blue-500/10"
            placeholder="Ej: Ático de lujo en Serrano..."
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={() => updateData("title", localTitle)}
            autoFocus
          />
        </div>

        {/* DESCRIPCIÓN: Área de redacción cómoda */}
        <div className="group h-full max-h-[40vh] flex flex-col">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-blue-600">
            Descripción Detallada
          </label>
          <textarea
            className="w-full flex-1 p-6 bg-gray-50 rounded-[24px] border border-gray-100 text-lg font-medium text-gray-700 leading-relaxed placeholder:text-gray-300 resize-none outline-none transition-all focus:bg-white focus:text-gray-900 focus:shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-blue-500/10"
            placeholder="Describe los espacios, la luz, los acabados y lo que hace única a esta propiedad..."
            value={localDesc}
            onChange={(e) => setLocalDesc(e.target.value)}
            onBlur={() => updateData("description", localDesc)}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
        <button 
            onClick={() => setStep("SPECS")} 
            className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
            onClick={() => setStep("ENERGY")} 
            disabled={!localTitle}
            className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente Paso <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

const StepEnergy = ({ formData, updateData, setStep }: any) => {
  const RATINGS = ["A", "B", "C", "D", "E", "F", "G"];

  const togglePending = () => {
    // Toggle simple logic
    const newState = !formData.energyPending;
    updateData("energyPending", newState);
    if (newState) {
      updateData("energyConsumption", "");
      updateData("energyEmissions", "");
    }
  };

  // 🎨 PALETA OFICIAL ENERGÉTICA
  const getStyle = (r: string, current: string) => {
    const isSelected = current === r;
    const isDisabled = formData.energyPending;
    
    if (isDisabled) return "bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed scale-95 opacity-50";

    const colors: any = {
        A: { bg: "bg-[#009345]", text: "text-[#009345]", border: "border-[#009345]", shadow: "shadow-[#009345]/40" },
        B: { bg: "bg-[#4FB848]", text: "text-[#4FB848]", border: "border-[#4FB848]", shadow: "shadow-[#4FB848]/40" },
        C: { bg: "bg-[#B5D638]", text: "text-[#B5D638]", border: "border-[#B5D638]", shadow: "shadow-[#B5D638]/40" },
        D: { bg: "bg-[#FFF100]", text: "text-[#D4C800]", border: "border-[#FFF100]", shadow: "shadow-[#FFF100]/40" },
        E: { bg: "bg-[#FDB913]", text: "text-[#FDB913]", border: "border-[#FDB913]", shadow: "shadow-[#FDB913]/40" },
        F: { bg: "bg-[#F37021]", text: "text-[#F37021]", border: "border-[#F37021]", shadow: "shadow-[#F37021]/40" },
        G: { bg: "bg-[#E30613]", text: "text-[#E30613]", border: "border-[#E30613]", shadow: "shadow-[#E30613]/40" },
    };

    const c = colors[r];

    if (isSelected) {
        // ACTIVO: Full Color + Sombra Glow
        return `${c.bg} border-transparent text-white shadow-lg ${c.shadow} scale-110 z-10 font-black ring-2 ring-white ring-offset-2 ${r === 'D' ? '!text-gray-900' : ''}`;
    }
    
    // INACTIVO: Borde Color + Fondo Blanco
    return `bg-white border-2 ${c.border} ${c.text} font-bold hover:bg-gray-50 hover:scale-105 transition-transform`;
  };

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2">
      {/* Encabezado */}
      <div className="mb-6 shrink-0">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Certificación</h2>
        <p className="text-gray-500 font-medium">Eficiencia energética y emisiones.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-4 pt-2 space-y-8">
        
        {/* SWITCH: EN TRÁMITE */}
        <div 
            onClick={togglePending}
            className={`
                group cursor-pointer p-4 rounded-[20px] border-2 transition-all duration-300 flex items-center justify-between
                ${formData.energyPending 
                    ? "bg-blue-50 border-blue-500 shadow-md" 
                    : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"}
            `}
        >
            <div className="flex items-center gap-4">
                <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-colors
                    ${formData.energyPending ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"}
                `}>
                    <FileCheck size={24} />
                </div>
                <div>
                    <span className={`block font-bold text-lg ${formData.energyPending ? "text-blue-900" : "text-gray-900"}`}>
                        En trámite / Exento
                    </span>
                    <span className="text-xs text-gray-500 font-medium">Aún no dispongo del certificado oficial</span>
                </div>
            </div>
            
            {/* Check Visual */}
            <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                ${formData.energyPending ? "bg-blue-600 border-blue-600 scale-110" : "border-gray-300"}
            `}>
                 {formData.energyPending && <Check size={14} className="text-white" />}
            </div>
        </div>

        {/* SELECCIÓN DE ETIQUETAS */}
        <div className={`transition-all duration-500 ${formData.energyPending ? "opacity-30 pointer-events-none grayscale blur-[1px]" : "opacity-100"}`}>
            
            {/* CONSUMO */}
            <div className="mb-8">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Zap size={14} className="text-yellow-500" fill="currentColor"/> Consumo de Energía
                </label>
                <div className="grid grid-cols-7 gap-2 sm:gap-3">
                    {RATINGS.map((r) => (
                        <button
                            key={`cons-${r}`}
                            onClick={() => updateData("energyConsumption", r)}
                            className={`aspect-square rounded-xl sm:rounded-2xl text-lg sm:text-xl transition-all duration-300 flex items-center justify-center ${getStyle(r, formData.energyConsumption)}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* EMISIONES */}
            <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Flame size={14} className="text-orange-500" fill="currentColor"/> Emisiones CO₂
                </label>
                <div className="grid grid-cols-7 gap-2 sm:gap-3">
                    {RATINGS.map((r) => (
                        <button
                            key={`em-${r}`}
                            onClick={() => updateData("energyEmissions", r)}
                            className={`aspect-square rounded-xl sm:rounded-2xl text-lg sm:text-xl transition-all duration-300 flex items-center justify-center ${getStyle(r, formData.energyEmissions)}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
        <button 
            onClick={() => setStep("DESCRIPTION")} 
            className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
            onClick={() => setStep("MEDIA")} 
            className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
        >
          Siguiente Paso <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

// Asegúrese de tener estos imports al principio del archivo principal:
// import { Camera, Video, UploadCloud, ArrowLeft, ArrowRight } from "lucide-react";

const StepMedia = ({ setStep }: any) => {
  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2">
      {/* Encabezado Premium */}
      <div className="mb-6 shrink-0">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Multimedia</h2>
        <p className="text-gray-500 font-medium">Una imagen vale más que mil palabras. Un vídeo, más.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-4 pt-2">

        {/* DROPZONE PRO: CÁMARA + VÍDEO */}
        <div className="group relative h-64 rounded-[24px] border-4 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/50 overflow-hidden shadow-sm hover:shadow-md">
          
          {/* Capa de fondo animada sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/0 to-blue-100/0 group-hover:via-white/20 group-hover:to-blue-100/30 transition-all duration-500" />

          <div className="relative z-10 flex flex-col items-center p-6">
             {/* Iconos Duales Animados */}
             <div className="flex items-center gap-5 mb-6">
               <div className="w-18 h-18 p-4 bg-white rounded-3xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100 group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-300">
                  <Camera size={32} className="text-blue-600" strokeWidth={2} />
               </div>
               <div className="w-18 h-18 p-4 bg-white rounded-3xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100 group-hover:scale-110 group-hover:rotate-[6deg] transition-transform duration-300 delay-75">
                  <Video size={32} className="text-purple-600" strokeWidth={2} />
               </div>
             </div>

             <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Arrastra Fotos y Vídeos</h3>
             <p className="text-sm font-bold text-gray-400 mb-3">Soporte para alta calidad (JPG, PNG, MP4).</p>
             
             <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-widest rounded-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                Explorar Archivos
             </button>
          </div>
        </div>

        {/* GRID 10 SLOTS (CORREGIDO) */}
        <div className="mt-8">
          <div className="flex justify-between items-baseline mb-4 px-1">
             <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Galería del Inmueble</p>
             <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg">
                <UploadCloud size={12} className="text-gray-500"/>
                <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest">0 / 10 MÁX</p>
             </div>
          </div>

          {/* CSS Grid 5 columnas x 2 filas */}
          <div className="grid grid-cols-5 gap-3">
            {/* 🛑 FIX: Bucle de 10 elementos exactos */}
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-[20px] border-2 border-dashed border-gray-200 bg-white/50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group relative overflow-hidden"
              >
                <span className="text-gray-300 font-black text-3xl group-hover:text-blue-500 transition-colors scale-90 group-hover:scale-110 duration-300">+</span>
                {i === 0 && (
                    <span className="absolute bottom-2 text-[8px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-1.5 py-0.5 rounded-md group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">Principal</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
        <button
            onClick={() => setStep("ENERGY")}
            className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
        <button
            onClick={() => setStep("PRICE")}
            className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
        >
          Siguiente Paso <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

const StepPrice = ({ formData, updateData, setStep }: any) => {
  // Función auxiliar para miles
  const formatCurrency = (v: string) => v ? v.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";

  // 1. Estado Local
  const [localPrice, setLocalPrice] = useState(() => {
    const numericVal = parsePriceInput(formData.price); 
    return numericVal > 0 ? formatCurrency(String(numericVal)) : "";
  });

  const [localCommunity, setLocalCommunity] = useState(formData.communityFees || "");

  // 2. Motor de Colores (FIX: Añadimos propiedad 'hex' explícita para evitar errores)
  const getPriceStyle = (priceStr: string) => {
     const p = parsePriceInput(priceStr); 
     
     // Caso 0 / Vacío -> Negro
     if (!p || p <= 0) return { hex: "#1d1d1f", color: "text-gray-400", bg: "bg-gray-50", border: "border-gray-200", label: "DEFINIR PRECIO" };
     
     // Rangos de Precio -> Colores Específicos
     if (p < 200000) return { hex: "#34C759", color: "text-[#34C759]", bg: "bg-[#34C759]/10", border: "border-[#34C759]", label: "INVEST" };
     if (p < 550000) return { hex: "#Eab308", color: "text-[#Eab308]", bg: "bg-[#Eab308]/10", border: "border-[#Eab308]", label: "OPPORTUNITY" };
     if (p < 1200000) return { hex: "#F97316", color: "text-[#F97316]", bg: "bg-[#F97316]/10", border: "border-[#F97316]", label: "PREMIUM" };
     if (p < 3000000) return { hex: "#EF4444", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", border: "border-[#EF4444]", label: "LUXURY" };
     
     // Más de 3M -> Exclusive
     return { hex: "#A855F7", color: "text-[#A855F7]", bg: "bg-[#A855F7]/10", border: "border-[#A855F7]", label: "EXCLUSIVE" };
  };

  const style = getPriceStyle(localPrice);

  const syncData = () => {
    updateData("price", localPrice.replace(/\./g, ""));
    updateData("communityFees", localCommunity);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2 relative">
      {/* Encabezado */}
      <div className="mb-2 shrink-0 text-center">
        <h2 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Valoración</h2>
        <p className="text-gray-500 font-medium text-xs">Define el precio de salida al mercado.</p>
      </div>

      {/* CONTENIDO SCROLLEABLE */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 pb-24">
        
        {/* BADGE DINÁMICO */}
        <div className={`
            px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-6 transition-all duration-500 border shadow-sm
            ${style.bg} ${style.color} ${style.border}
        `}>
            {style.label}
        </div>

        {/* INPUT PRECIO GIGANTE */}
        <div className="relative w-full max-w-lg mx-auto group text-center mb-6">
            <input
                className={`
                    w-full text-center bg-transparent text-6xl sm:text-7xl font-black outline-none placeholder:text-gray-200 transition-all duration-300 p-0
                    ${style.color} drop-shadow-sm
                `}
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
            <span className={`
                absolute top-0 -right-2 sm:-right-6 text-3xl sm:text-4xl font-bold opacity-30 pointer-events-none transition-colors duration-300
                ${style.color}
            `}>€</span>
            
            <div className={`h-1.5 w-1/3 mx-auto mt-2 rounded-full transition-all duration-500 ${style.bg.replace('/10', '')}`} />
        </div>

        {/* INPUT COMUNIDAD */}
        <div className="w-full max-w-xs animate-fade-in-up delay-100 px-4 mt-4">
             <label className="block text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Gastos Comunidad (Mes)
             </label>
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

      {/* FOOTER FIX (Sticky Bottom con color seguro) */}
      <div className="sticky bottom-0 left-0 right-0 pt-4 pb-6 bg-white/95 backdrop-blur-xl border-t border-gray-100 flex gap-4 shrink-0 z-50 -mx-4 px-4 shadow-[0_-10px_20px_rgba(255,255,255,1)]">
        <button 
            onClick={() => setStep("MEDIA")} 
            className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-95 border border-transparent hover:border-gray-200"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
            onClick={() => { syncData(); setStep("ANALYSIS"); }} 
            disabled={!localPrice} 
            className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:grayscale"
            style={{ 
                // ✅ FIX: Usamos el HEX directo, sin replace() peligrosos
                backgroundColor: style.hex 
            }}
        >
          <span className="brightness-200 contrast-200">
             Analizar Mercado
          </span> 
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

// ==================================================================================
// 🧠 ANÁLISIS (fix: no se queda infinito en el progreso)
// ==================================================================================
const MarketAnalysisStep = ({ formData, onNext }: any) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);

  // 1. Lógica de Cálculo (Intacta)
  const {
    pricePerM2,
    marketRef,
    detectedZone,
    percentDiff,
    isExpensive,
    estimatedMonths,
    marketPosition,
  } = useMemo(() => {
    const safePrice = formData?.price
      ? parseFloat(formData.price.toString().replace(/\D/g, ""))
      : 0;

    const safeM2 = formData?.mBuilt
      ? parseFloat(formData.mBuilt.toString().replace(/\D/g, ""))
      : 0;

    const m2 = safeM2 > 0 ? safeM2 : 100; 
    const currentPriceM2 = m2 > 0 ? Math.round(safePrice / m2) : 0;

    // Simulación de DB de mercado
    let zoneName = "MEDIA NACIONAL";
    let refPrice = NATIONAL_AVG; 
    const searchAddress = (formData?.address || formData?.location || "").toUpperCase();
    const matches = Object.keys(REAL_MARKET_DB).filter((city) => searchAddress.includes(city));

    if (matches.length > 0) {
      const bestMatch = matches.reduce((a, b) => (a.length > b.length ? a : b));
      zoneName = bestMatch;
      refPrice = REAL_MARKET_DB[bestMatch];
    }

    const diff = currentPriceM2 - refPrice;
    const pDiff = refPrice > 0 ? ((diff / refPrice) * 100).toFixed(1) : "0";
    const nPercent = parseFloat(pDiff || "0");
    const expensive = diff > 0;

    const months = expensive ? (Math.abs(nPercent) > 20 ? 12 : 6) : 2;

    let visualPos = 50 + nPercent / 2;
    visualPos = Math.min(Math.max(visualPos, 5), 95);

    return {
      pricePerM2: currentPriceM2,
      marketRef: refPrice,
      detectedZone: zoneName,
      percentDiff: Math.abs(nPercent).toFixed(1),
      isExpensive: expensive,
      estimatedMonths: months,
      marketPosition: visualPos,
    };
  }, [formData]);

  // 2. Efecto de "Escaneo"
  useEffect(() => {
    const t1 = setTimeout(() => setProgress(30), 400);
    const t2 = setTimeout(() => setProgress(60), 1200);
    const t3 = setTimeout(() => setProgress(90), 2200);
    const t4 = setTimeout(() => {
      setProgress(100);
      setAnalyzing(false);
    }, 3200);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  }, []);

  // --- VISTA 1: CARGANDO (SCANNER) ---
  if (analyzing) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in relative overflow-hidden">
        {/* Fondo animado sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent pointer-events-none" />
        
        <div className="w-full max-w-sm relative z-10">
          <div className="mb-10 relative flex justify-center">
            {/* Anillos de radar */}
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-2 border-4 border-blue-50 rounded-full animate-ping delay-100 opacity-30"></div>
            
            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-[0_10px_40px_rgba(0,113,227,0.15)] relative z-10">
               <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
               <span className="text-3xl font-black text-gray-900">{progress}%</span>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analizando Mercado</h2>
          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest animate-pulse">
            Escaneando {detectedZone}...
          </p>
          
          <div className="h-1.5 w-full bg-gray-100 rounded-full mt-8 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA 2: RESULTADOS (DASHBOARD) ---
  return (
    <div className="h-full flex flex-col animate-fade-in-up px-2 relative">
      <div className="mb-2 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isExpensive ? "bg-orange-500" : "bg-emerald-500"}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Diagnóstico Completado</span>
        </div>
        <h2 className="text-3xl font-black text-gray-900 leading-none tracking-tight">Análisis de Precio</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 px-1">
        
        {/* TARJETA PRINCIPAL: COMPARATIVA */}
        <div className="bg-white rounded-[24px] p-6 mb-6 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tu Valoración</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-gray-900 tracking-tight">{pricePerM2.toLocaleString()}</span>
                <span className="text-sm font-bold text-gray-400">€/m²</span>
              </div>
            </div>

            <div className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 ${isExpensive ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
              {isExpensive ? <ArrowUp size={14} strokeWidth={3} /> : <TrendingUp size={14} strokeWidth={3} />}
              {percentDiff}% vs Media
            </div>
          </div>

          {/* TERMÓMETRO VISUAL (SLIDER) */}
          <div className="relative h-12 mb-2 w-full select-none">
            {/* Track Base */}
            <div className="absolute top-1/2 left-0 right-0 h-3 bg-gray-100 rounded-full -translate-y-1/2 overflow-hidden shadow-inner">
               <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50 z-10"></div>
            </div>

            {/* Marcador TÚ */}
            <div
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all duration-1000"
              style={{ left: `${marketPosition}%` }}
            >
              <div className={`w-5 h-5 rounded-full border-[3px] border-white shadow-lg -translate-x-1/2 ${isExpensive ? "bg-gray-900" : "bg-emerald-500"}`}></div>
              <div className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 bg-gray-900 text-white text-[9px] font-black rounded-md tracking-wider shadow-sm">
                TÚ
              </div>
            </div>

            {/* Marcador MEDIA */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-60 flex flex-col items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <div className="absolute top-4 whitespace-nowrap text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                Media {detectedZone}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed font-medium mt-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            {isExpensive ? (
              <span>
                Tu propiedad se sitúa <strong className="text-gray-900">por encima</strong> del mercado. 
                Esto puede implicar un tiempo de venta de <strong className="text-gray-900">{estimatedMonths} meses</strong>.
              </span>
            ) : (
              <span>
                ¡Precio competitivo! Estás <strong className="text-emerald-600">alineado</strong> con la zona {detectedZone}. 
                Estimamos venta en <strong className="text-emerald-600">{estimatedMonths} meses</strong>.
              </span>
            )}
          </p>
        </div>

        {/* GRID DE KPIs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-[24px] bg-gray-50 border border-gray-100 flex flex-col justify-between h-32 hover:bg-white hover:shadow-md transition-all">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Tiempo Estimado</span>
            </div>
            <div className="text-3xl font-black text-gray-900">
              {estimatedMonths} <span className="text-sm font-bold text-gray-400">Meses</span>
            </div>
            {isExpensive && <div className="text-[10px] font-bold text-orange-500">Rotación Lenta</div>}
            {!isExpensive && <div className="text-[10px] font-bold text-emerald-500">Rotación Rápida</div>}
          </div>

          <div className="p-5 rounded-[24px] bg-gray-50 border border-gray-100 flex flex-col justify-between h-32 hover:bg-white hover:shadow-md transition-all">
            <div className="flex items-center gap-2 text-gray-400">
              <Search size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Demanda</span>
            </div>
            <div className="text-2xl font-black text-gray-900 flex items-center gap-2">
              ALTA <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
            </div>
            <div className="text-[10px] font-bold text-gray-400">Zona Caliente</div>
          </div>
        </div>
      </div>

      {/* FOOTER FIX (Sticky Bottom) */}
      <div className="sticky bottom-0 left-0 right-0 pt-4 pb-6 bg-white/95 backdrop-blur-xl border-t border-gray-100 flex gap-4 shrink-0 z-50 -mx-4 px-4 shadow-[0_-10px_20px_rgba(255,255,255,1)]">
        <button
          onClick={onNext}
          className="w-full bg-[#1d1d1f] hover:bg-black text-white rounded-2xl py-4 shadow-xl active:scale-[0.99] transition-all flex justify-between items-center px-8 h-16"
        >
          <div className="flex flex-col items-start">
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Siguiente paso</span>
             <span className="text-lg font-bold">Ver Competencia (Radar)</span>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
             <Radar size={20} className="text-white" />
          </div>
        </button>
      </div>
    </div>
  );
};

const MarketRadarStep = ({ formData, onNext }: any) => {
  const [scanning, setScanning] = useState(true);
  const [selectedRival, setSelectedRival] = useState<number | null>(null);

  const basePrice = useMemo(() => {
     if (!formData?.price) return 0;
     const val = formData.price.toString().replace(/\D/g, "");
     return val ? parseInt(val) : 0;
  }, [formData.price]);

  const RIVALS = [
    {
      id: 1, type: "COLD", name: "Propiedad Estancada",
      price: basePrice * 1.05, days: 245, visits: 12,
      img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2, type: "WARM", name: "Competencia Directa",
      price: basePrice * 0.98, days: 45, visits: 180,
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3, type: "HOT", name: "Caso de Éxito",
      price: basePrice * 1.15, days: 12, visits: 3450,
      img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4, type: "COLD", name: "Fuera de Mercado",
      price: basePrice * 1.1, days: 310, visits: 5,
      img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 5, type: "HOT", name: "Recién Listado",
      price: basePrice * 0.95, days: 3, visits: 890,
      img: "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=600&q=80",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setScanning(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);

  // --- MODO ESCANEO ---
  if (scanning) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in text-center relative overflow-hidden">
        <div className="z-10 flex flex-col items-center gap-6 px-6 py-12">
          <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20 duration-[2000ms]"></div>
              <div className="absolute inset-4 bg-blue-400 rounded-full animate-ping opacity-40 delay-300 duration-[2000ms]"></div>
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-[0_20px_60px_-10px_rgba(0,122,255,0.3)] relative z-10 border border-blue-50">
                <Radar className="text-[#007AFF] animate-spin-slow" size={40} strokeWidth={1.5} />
              </div>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-gray-900">Escaneando Zona</h3>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-2 animate-pulse">
              Localizando testigos comparables...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- INTERFAZ PRINCIPAL ---
  return (
    // 🛑 FIX: overflow-hidden global para evitar scrollbar de página
    <div className="h-full flex flex-col animate-fade-in relative overflow-hidden">
      
      {/* HEADER con padding lateral seguro */}
      <div className="flex justify-between items-end mb-4 shrink-0 px-6 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#007AFF]"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#007AFF]">Radar Activo</span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">Competencia</h3>
        </div>
        <div className="text-right bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-wide">Radio</p>
             <p className="text-xs font-black text-gray-900">500m</p>
        </div>
      </div>

      {/* 🛑 FIX CRÍTICO: 
         1. overflow-x-hidden: Mata el scroll horizontal
         2. px-4: Margen interno para que las tarjetas no toquen los bordes
         3. pb-28: Espacio extra abajo para que el último elemento no quede tapado por el footer sticky
      */}
      <div className="flex-1 flex flex-col gap-5 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 pb-28">
        
        {/* RADAR VISUAL */}
        <div className="w-full h-40 bg-white rounded-[32px] border border-gray-100 relative flex items-center justify-center shrink-0 overflow-hidden shadow-sm mx-auto shadow-[inset_0_0_40px_rgba(0,0,0,0.02)]">
          <div className="absolute w-[80%] h-[80%] border border-gray-100 rounded-full"></div>
          <div className="absolute w-[50%] h-[50%] border border-gray-100 rounded-full"></div>
          <div className="absolute w-[20%] h-[20%] border border-blue-100 rounded-full bg-blue-50/50"></div>
          <div className="absolute w-full h-[1px] bg-gray-50"></div>
          <div className="absolute h-full w-[1px] bg-gray-50"></div>
          <div className="absolute w-4 h-4 bg-[#007AFF] rounded-full shadow-[0_0_0_4px_rgba(255,255,255,1),0_4px_12px_rgba(0,122,255,0.4)] z-20"></div>

          {RIVALS.map((rival, index) => {
            const angle = index * 72 * (Math.PI / 180);
            const distance = 25 + index * 10; 
            const top = 50 + Math.sin(angle) * distance;
            const left = 50 + Math.cos(angle) * distance;
            const isSelected = selectedRival === rival.id;
            return (
              <div
                key={rival.id}
                className={`absolute rounded-full transition-all duration-300 z-10 cursor-pointer border-2 border-white shadow-sm
                  ${rival.type === "HOT" ? "bg-[#FF9500]" : "bg-gray-400"}
                  ${isSelected ? "w-6 h-6 z-30 ring-4 ring-blue-100 scale-110" : "w-3 h-3 hover:scale-150"}
                `}
                style={{ top: `${top}%`, left: `${left}%` }}
                onMouseEnter={() => setSelectedRival(rival.id)}
                onMouseLeave={() => setSelectedRival(null)}
              />
            );
          })}
        </div>

        {/* LISTA DE RIVALES */}
        <div className="space-y-3 px-1">
          {RIVALS.map((rival) => {
            const isSelected = selectedRival === rival.id;
            return (
                <div
                key={rival.id}
                onMouseEnter={() => setSelectedRival(rival.id)}
                onMouseLeave={() => setSelectedRival(null)}
                className={`
                    flex gap-4 p-3 rounded-[24px] border transition-all duration-300 cursor-pointer group w-full
                    ${isSelected 
                        ? "bg-white border-blue-500 shadow-[0_8px_30px_rgba(0,113,227,0.15)] scale-[1.00]" /* FIX: Scale 1.00 evita el pixel overflow */
                        : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-md"}
                `}
                >
                {/* FOTO */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 relative bg-gray-100 shadow-sm">
                    <img 
                        src={rival.img} 
                        className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-110" 
                        alt="Propiedad" 
                    />
                    {rival.type === "HOT" && (
                       <div className="absolute top-1.5 right-1.5 bg-[#FF9500] text-white p-1 rounded-full shadow-lg border border-white z-10">
                          <Zap size={10} fill="currentColor" />
                       </div>
                    )}
                </div>

                {/* INFO - min-w-0 evita que el texto empuje la caja */}
                <div className="flex-1 flex flex-col justify-center min-w-0 py-1">
                    <h4 className={`text-xs font-bold truncate mb-0.5 ${isSelected ? "text-blue-600" : "text-gray-500"}`}>
                        {rival.name}
                    </h4>
                    
                    <span className="text-xl font-black tracking-tight text-gray-900 mb-2 block truncate">
                        {formatMoney(rival.price)}
                    </span>

                    <div className="flex flex-wrap gap-2">
                        <div className={`px-2 py-0.5 rounded-md flex items-center gap-1 border ${rival.days > 90 ? "bg-red-50 border-red-100 text-red-600" : "bg-green-50 border-green-100 text-green-700"}`}>
                            <Clock size={10} strokeWidth={2.5} />
                            <span className="text-[10px] font-bold tracking-wide">{rival.days}d</span>
                        </div>
                        <div className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-gray-500 flex items-center gap-1">
                            <Eye size={10} strokeWidth={2.5} />
                            <span className="text-[10px] font-bold tracking-wide">{rival.visits}</span>
                        </div>
                    </div>
                </div>
                
                {/* FLECHA */}
                <div className="flex flex-col justify-center pr-1">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSelected ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-300"}`}>
                     <ArrowRight size={14} />
                   </div>
                </div>
                </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER FIX - Sticky dentro del contenedor relativo */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex gap-4 z-50 shadow-[0_-10px_40px_rgba(255,255,255,0.8)]">
        <button
          onClick={onNext}
          className="w-full bg-[#1d1d1f] hover:bg-black text-white rounded-2xl py-4 shadow-xl active:scale-[0.99] transition-all flex justify-between items-center px-8 h-16"
        >
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

// ==================================================================================
// 💎 COMPONENTE: INTERNAL MARKET STRATEGY (CUPERTINO / TESLA STYLE)
// ==================================================================================

const InternalMarketStrategyStep = ({ selectedServices, toggleService, onNext }: any) => {
  // 1. TÁCTICA: Empezamos en ONLINE, dejamos los Packs para el final
  const [tab, setTab] = useState("ONLINE");
  const TABS = ["ONLINE", "OFFLINE", "PACKS"];

  // --- LÓGICA DE NEGOCIO ---
  const calculateAuthority = () => {
    let score = 0;
    const count = selectedServices.filter((id: string) => !id.startsWith("pack_")).length;
    score += count * 5;
    if (selectedServices.includes("pack_basic")) score = Math.max(score, 20);
    if (selectedServices.includes("pack_express")) score = Math.max(score, 35);
    if (selectedServices.includes("pack_pro")) score = Math.max(score, 60);
    if (selectedServices.includes("pack_investor")) score = Math.max(score, 80);
    if (selectedServices.includes("pack_elite")) score = 100;
    return Math.min(100, score);
  };

  const authorityLevel = calculateAuthority();

  const getRoleStyle = (level: number) => {
    if (level >= 100) return { label: "LEYENDA", gradient: "from-indigo-500 via-purple-500 to-pink-500" };
    if (level >= 80) return { label: "BROKER", gradient: "from-emerald-400 to-cyan-500" };
    if (level >= 60) return { label: "PRO SELLER", gradient: "from-blue-400 to-indigo-500" };
    if (level >= 35) return { label: "AVANZADO", gradient: "from-amber-400 to-orange-500" };
    return { label: "NOVATO", gradient: "from-gray-300 to-gray-400" };
  };

  const roleStyle = getRoleStyle(authorityLevel);

  const totalInvestment = selectedServices.reduce((acc: number, id: string) => {
    const item = SERVICES_CATALOG.find((s) => s.id === id);
    return acc + (item ? item.price : 0);
  }, 0);

  // Helper para colores de iconos iOS
  const getIconColor = (id: string) => {
      if (id.includes("foto")) return "bg-blue-100 text-blue-600";
      if (id.includes("video")) return "bg-purple-100 text-purple-600";
      if (id.includes("drone")) return "bg-sky-100 text-sky-600";
      if (id.includes("tour")) return "bg-indigo-100 text-indigo-600";
      if (id.includes("cert")) return "bg-green-100 text-green-600";
      if (id.includes("pack")) return "bg-gray-900 text-white"; 
      return "bg-gray-100 text-gray-600"; 
  };

  // --- RENDERIZADO ---
  return (
    <div className="h-full flex flex-col bg-gray-50/50 relative overflow-hidden font-sans">
      
      {/* 1. HEADER: POWER GAUGE (Con más aire superior) */}
      <div className="shrink-0 pt-6 pb-4 px-8 bg-white/50 backdrop-blur-sm z-10">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Estrategia de Venta</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Potencia de marketing</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest text-white shadow-md bg-gradient-to-r ${roleStyle.gradient}`}>
            {roleStyle.label}
          </div>
        </div>

        {/* Barra Segmentada */}
        <div className="flex gap-1.5 h-2 w-full">
          {[...Array(20)].map((_, i) => {
            const threshold = (i + 1) * 5;
            const isActive = authorityLevel >= threshold;
            return (
              <div 
                key={i}
                className={`flex-1 rounded-full transition-all duration-500 ${
                  isActive 
                    ? `bg-gradient-to-r ${roleStyle.gradient} opacity-100 scale-y-100` 
                    : "bg-gray-200 opacity-30 scale-y-75"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* 2. TABS ESTILO iOS (Con márgenes laterales amplios) */}
      <div className="px-8 mb-6 shrink-0">
        <div className="bg-gray-100 p-1.5 rounded-xl flex relative h-12 shadow-inner">
          {/* Fondo Animado */}
          <div 
            className="absolute top-1.5 bottom-1.5 bg-white rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ 
              left: tab === "ONLINE" ? "6px" : tab === "OFFLINE" ? "33.33%" : "66.66%",
              width: "calc(33.33% - 8px)",
              transform: tab === "ONLINE" ? "translateX(0)" : tab === "OFFLINE" ? "translateX(2px)" : "translateX(4px)"
            }}
          />
          
          {TABS.map((t) => {
             const isActive = tab === t;
             return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 text-[11px] font-black uppercase tracking-widest rounded-lg transition-colors duration-200 relative z-10 flex items-center justify-center gap-2 ${
                  isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t === "PACKS" && <Star size={12} className={isActive ? "text-yellow-500 fill-yellow-500" : ""} />}
                {t}
              </button>
             );
          })}
        </div>
      </div>

      {/* 3. GRID DE SERVICIOS (Con mucho más aire) */}
      {/* FIX: px-8 para márgenes laterales amplios, gap-6 para separación interna */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-32 pt-2">
        <div className="grid grid-cols-2 gap-6">
          {SERVICES_CATALOG.filter((s) => s.category === tab).map((item: any) => {
            const isActive = selectedServices.includes(item.id);
            const isPack = item.category === "PACKS";

            return (
              <div
                key={item.id}
                onClick={() => toggleService(item.id)}
                className={`
                  group relative p-6 rounded-[28px] cursor-pointer transition-all duration-300 border flex flex-col justify-between min-h-[180px] overflow-hidden
                  ${isActive 
                    ? "bg-white border-blue-500 ring-4 ring-blue-500/10 shadow-[0_20px_40px_rgba(0,113,227,0.15)] transform scale-[1.02] z-10" 
                    : "bg-white border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:border-gray-100 hover:-translate-y-1"
                  }
                  ${isPack && !isActive ? "bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] text-white border-transparent" : ""}
                `}
              >
                {/* Header del Card */}
                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm
                    ${isPack && !isActive ? "bg-white/10 text-white" : getIconColor(item.id)}
                  `}>
                    <item.icon size={22} strokeWidth={2} />
                  </div>
                  
                  {/* Checkbox Visual */}
                  <div className={`
                    w-7 h-7 rounded-full border-[3px] flex items-center justify-center transition-all duration-300
                    ${isActive 
                        ? "bg-blue-600 border-blue-600 scale-110 shadow-md" 
                        : isPack && !isActive ? "border-white/20" : "border-gray-100 bg-gray-50"}
                  `}>
                    {isActive && <Check size={14} className="text-white" strokeWidth={4} />}
                  </div>
                </div>

                {/* Contenido */}
                <div className="relative z-10">
                  <h3 className={`text-base font-bold leading-tight mb-2 ${isPack && !isActive ? "text-white" : "text-gray-900"}`}>
                    {item.name}
                  </h3>
                  
                  <p className={`text-xs font-medium leading-relaxed line-clamp-2 ${isPack && !isActive ? "text-gray-400" : "text-gray-400"}`}>
                      {item.desc}
                  </p>
                </div>

                {/* Precio */}
                <div className={`mt-5 pt-4 border-t flex items-center justify-between ${isPack && !isActive ? "border-white/10" : "border-gray-50"}`}>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isPack && !isActive ? "text-gray-500" : "text-gray-300"}`}>Inversión</span>
                    <span className={`text-base font-black tracking-tight ${isPack && !isActive ? "text-white" : "text-gray-900"}`}>
                      {item.price}€
                    </span>
                </div>

                {/* Decoración Pack (Brillo de fondo) */}
                {isPack && !isActive && (
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DOCK FLOTANTE (Centrado y Elevado) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] z-30">
        <div className="bg-[#1d1d1f]/95 backdrop-blur-2xl p-3 pr-3 pl-8 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-between border border-white/10 ring-1 ring-black/5">
          
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Estimado</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white tracking-tighter">
                {totalInvestment.toLocaleString('es-ES')}
              </span>
              <span className="text-sm font-bold text-gray-500">€</span>
            </div>
          </div>

          <button
            onClick={onNext}
            disabled={totalInvestment === 0 && !selectedServices.some((s: string) => s.startsWith("pack_"))}
            className={`
              h-14 px-8 rounded-[24px] flex items-center gap-3 transition-all duration-300 transform active:scale-95
              ${(totalInvestment > 0 || selectedServices.some((s: string) => s.startsWith("pack_")))
                ? "bg-white text-black hover:bg-gray-200 shadow-lg" 
                : "bg-white/10 text-white/30 cursor-not-allowed"}
            `}
          >
            <span className="text-xs font-black tracking-wide uppercase">Confirmar</span>
            <ArrowRight size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
      
    </div>
  );
};

// ==================================================================================
// ✅ VERIFY
// ==================================================================================
const StepVerify = ({ formData, setStep }: any) => {
  
  // 1. LÓGICA DE PRECIO Y COLOR
  const rawPrice = useMemo(() => {
      if (!formData.price) return 0;
      return parseInt(formData.price.toString().replace(/\D/g, ""));
  }, [formData.price]);

  // Formato Europeo con puntos
  const visualPrice = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(rawPrice);

  const getPriceStyle = (p: number) => {
     if (p < 200000) return { hex: "#34C759", bg: "bg-[#34C759]/10", text: "text-[#34C759]", label: "INVEST" };
     if (p < 550000) return { hex: "#Eab308", bg: "bg-[#Eab308]/10", text: "text-[#Eab308]", label: "OPPORTUNITY" };
     if (p < 1200000) return { hex: "#F97316", bg: "bg-[#F97316]/10", text: "text-[#F97316]", label: "PREMIUM" };
     if (p < 3000000) return { hex: "#EF4444", bg: "bg-[#EF4444]/10", text: "text-[#EF4444]", label: "LUXURY" };
     return { hex: "#A855F7", bg: "bg-[#A855F7]/10", text: "text-[#A855F7]", label: "EXCLUSIVE" };
  };

  const style = getPriceStyle(rawPrice);

  return (
    <div className="h-full flex flex-col animate-fade-in relative px-4">
      
      {/* CENTRADO VERTICAL */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 pb-10">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-4 shadow-sm animate-bounce-small">
                <ShieldCheck size={32} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">¡Todo listo para el lanzamiento!</h2>
            <p className="text-gray-500 font-medium">Revisa los datos finales antes de firmar.</p>
        </div>

        {/* TARJETA "GOLDEN TICKET" */}
        <div className="w-full max-w-sm bg-white rounded-[32px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden relative group">
            
            {/* Cabecera */}
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {formData.type || "Inmueble"}
                    </span>
                    {formData.state && (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {formData.state}
                        </span>
                    )}
                </div>
                <div className="flex items-start gap-2 text-gray-900">
                    <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="font-bold leading-tight line-clamp-2">
                        {formData.address || "Ubicación Premium"}
                    </p>
                </div>
            </div>

            {/* CUERPO CENTRAL */}
            <div className="p-8 text-center bg-white relative">
                <div className={`
                    absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase
                    ${style.bg} ${style.text}
                `}>
                    {style.label}
                </div>

                <div className={`text-5xl font-black tracking-tighter mt-4 mb-1 ${style.text}`}>
                    {visualPrice}<span className="text-3xl align-top opacity-50 ml-1">€</span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor de Salida</p>
            </div>

            {/* SPECS GRID */}
            <div className="grid grid-cols-3 border-t border-gray-100 divide-x divide-gray-100 bg-gray-50/30">
                <div className="p-4 text-center">
                    <span className="block text-xl font-black text-gray-900">{formData.rooms}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Habit.</span>
                </div>
                <div className="p-4 text-center">
                    <span className="block text-xl font-black text-gray-900">{formData.baths}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Baños</span>
                </div>
                <div className="p-4 text-center">
                    <span className="block text-xl font-black text-gray-900">{formData.mBuilt}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">m²</span>
                </div>
            </div>
        </div>

      </div>

      {/* FOOTER ACTION */}
      <div className="shrink-0 pb-6 pt-2">
        <button
          onClick={() => setStep("SECURITY")}
          className="w-full h-16 bg-[#1d1d1f] hover:bg-black text-white rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-between px-8 group"
        >
          <div className="flex flex-col items-start">
             <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-400 transition-colors">Último Paso</span>
             <span className="text-lg font-bold">Verificar Identidad</span>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
             <Smartphone size={20} className="text-white" />
          </div>
        </button>
        
        <button 
            onClick={() => setStep("STRATEGY")} 
            className="w-full py-3 mt-2 text-gray-400 font-bold hover:text-gray-600 text-xs transition-colors"
        >
          Volver a Estrategia
        </button>
      </div>
    </div>
  );
};

// ==================================================================================
// 🔒 SECURITY (BANK-GRADE UI + Z-INDEX FIX)
// ==================================================================================
const StepSecurity = ({ setStep, setLoading }: any) => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stepAuth, setStepAuth] = useState<"PHONE" | "CODE">("PHONE");

  const isDev = process.env.NODE_ENV !== "production";

  const sendCode = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) return; 

    setLoading?.(true);
    setTimeout(() => {
      setLoading?.(false);
      setStepAuth("CODE");
    }, 1500);
  };

  const verifyCode = () => {
    const digits = code.replace(/\D/g, "");
    if (!isDev && digits.length < 4) return;

    setLoading?.(true);
    setTimeout(() => {
      setLoading?.(false);
      setStep("SUCCESS");
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in px-6 relative">
      
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 pb-20">
        
        <div className="w-20 h-20 bg-black rounded-[28px] flex items-center justify-center mb-8 shadow-2xl shadow-gray-200 rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
           <ShieldCheck size={36} className="text-white" />
        </div>

        <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight text-center">
          {stepAuth === "PHONE" ? "Verificación Móvil" : "Código de Seguridad"}
        </h2>

        <p className="text-gray-500 mb-10 text-center font-medium max-w-xs leading-relaxed">
          {stepAuth === "PHONE"
            ? "Te enviaremos un código SMS para firmar digitalmente la propiedad."
            : <span>Código enviado al <strong className="text-gray-900">{phone}</strong>.</span>}
        </p>

        <div className="w-full max-w-sm relative">
          {stepAuth === "PHONE" ? (
            <div className="animate-fade-in-up">
              <div className="group relative bg-gray-50 border-2 border-gray-100 rounded-[24px] px-6 py-5 flex items-center transition-all duration-300 focus-within:bg-white focus-within:border-blue-500 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]">
                <span className="text-xl font-bold text-gray-400 mr-3 select-none flex items-center gap-2 border-r border-gray-200 pr-3">
                   🇪🇸 +34
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="600 000 000"
                  className="bg-transparent outline-none font-black text-2xl w-full text-gray-900 placeholder:text-gray-200 tracking-wide"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-4 text-center font-bold uppercase tracking-widest">
                 Protegemos tu identidad con cifrado SSL
              </p>
            </div>
          ) : (
            <div className="animate-fade-in-right">
              {/* ZONA DE CÓDIGO */}
              <div className="relative mb-8 h-24 flex justify-center items-center">
                
                {/* Visual Boxes (Fondo) */}
                <div className="flex gap-4 absolute inset-0 justify-center items-center z-10 pointer-events-none">
                  {[0, 1, 2, 3].map((_, i) => {
                    const digit = code[i] || "";
                    const isActive = code.length === i; 
                    const isFilled = code.length > i;   
                    
                    return (
                      <div
                        key={i}
                        className={`
                           w-16 h-20 rounded-2xl flex items-center justify-center text-4xl font-black transition-all duration-200 border-2
                           ${isActive 
                              ? "border-blue-500 bg-white shadow-[0_0_0_4px_rgba(59,130,246,0.1)] scale-110" 
                              : isFilled 
                                ? "border-gray-900 bg-white text-gray-900" 
                                : "border-gray-100 bg-gray-50 text-gray-300"}
                        `}
                      >
                        {digit}
                      </div>
                    );
                  })}
                </div>

                {/* 🛑 INPUT REAL (z-50 para estar encima de todo) */}
                <input
                  value={code}
                  onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setCode(val);
                      if (val.length === 4) verifyCode();
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoFocus
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 font-mono text-[1px]" 
                />
              </div>

              <div className="text-center">
                 <button 
                    onClick={() => { setStepAuth("PHONE"); setCode(""); }}
                    className="text-xs font-bold text-blue-600 hover:underline relative z-50"
                 >
                    ¿Número equivocado?
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 pb-6 pt-2">
        {stepAuth === "PHONE" && (
            <button
              onClick={sendCode}
              disabled={phone.length < 9}
              className="w-full h-16 bg-[#1d1d1f] hover:bg-black text-white rounded-[24px] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar Código SMS <ArrowRight size={20} />
            </button>
        )}
        
        {stepAuth === "CODE" && (
             <button
                onClick={verifyCode}
                disabled={code.length < 4}
                className="w-full h-16 bg-[#1d1d1f] hover:bg-black text-white rounded-[24px] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verificar <ShieldCheck size={20} />
              </button>
        )}
      </div>
    </div>
  );
};

// ==================================================================================
// 🏆 SUCCESS (CINEMATIC MAP LAUNCH)
// ==================================================================================
const StepSuccess = ({ handleClose, formData }: any) => {
  
  const rawPrice = formData.price ? parseInt(formData.price.toString().replace(/\D/g, "")) : 0;
  const visualPrice = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(rawPrice);

  return (
    <div className="h-full flex flex-col items-center justify-center animate-fade-in px-4 relative overflow-hidden">
      
      {/* Fondo de celebración */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-400/20 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -z-10 animate-pulse delay-700" />

      {/* ICONO */}
      <div className="mb-8 relative">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(34,197,94,0.4)] animate-bounce-small z-10 relative">
           <CheckCircle2 size={48} className="text-white" strokeWidth={3} />
        </div>
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 duration-[2000ms]" />
      </div>

      <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight text-center">
        ¡Propiedad Publicada!
      </h2>
      <p className="text-gray-500 mb-10 text-center font-medium max-w-sm text-lg">
        Tu activo ha sido indexado en la red Stratos y ya es visible para los inversores.
      </p>

      {/* TARJETA RESUMEN */}
      <div className="w-full max-w-xs bg-white rounded-[24px] border border-gray-100 shadow-xl p-4 mb-10 transform rotate-1 hover:rotate-0 transition-transform duration-500">
          <div className="aspect-video bg-gray-100 rounded-xl mb-4 relative overflow-hidden">
             <div className="absolute inset-0 flex items-center justify-center text-gray-300 bg-gray-50">
                <MapIcon size={32} />
             </div>
             {formData.images && formData.images.length > 0 && (
                 <img src={formData.images[0]} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
             )}
             <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm">
                Nuevo
             </div>
          </div>
          
          <div className="px-2 pb-2">
             <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-black text-gray-900 line-clamp-1">{formData.title || "Nueva Propiedad"}</h3>
             </div>
             <p className="text-xs text-gray-500 font-medium mb-3 line-clamp-1">{formData.address}</p>
             
             <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <span className="text-lg font-black text-gray-900">{visualPrice}€</span>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase">
                    {formData.type}
                </span>
             </div>
          </div>
      </div>

      {/* BOTÓN FINAL + VUELO MAPA */}
      <button
        onClick={() => {
           const finalPrice = rawPrice;
           const finalPayload = {
               ...formData,
               id: formData.id || Date.now(),
               price: visualPrice,
               rawPrice: finalPrice,
               priceValue: finalPrice,
               location: (formData.city || formData.location || "UBICACIÓN PREMIUM").toUpperCase(),
               rooms: Number(formData.rooms || 0),
               baths: Number(formData.baths || 0),
               mBuilt: Number(formData.mBuilt || 0),
               isNewEntry: true,
           };

           if (typeof window !== "undefined") {
               try {
                   const saved = JSON.parse(localStorage.getItem("stratos_my_properties") || "[]");
                   const idx = saved.findIndex((p: any) => p.id === finalPayload.id);
                   if (idx >= 0) saved[idx] = finalPayload;
                   else saved.push(finalPayload);
                   localStorage.setItem("stratos_my_properties", JSON.stringify(saved));
                   
                   window.dispatchEvent(new CustomEvent("reload-profile-assets"));
                   window.dispatchEvent(new CustomEvent("force-map-refresh")); 

                   // 🚀 DISPARAR VUELO CINEMÁTICO
                   if (formData.coordinates) {
                       window.dispatchEvent(new CustomEvent("map-fly-to", { 
                           detail: { 
                               center: formData.coordinates, 
                               zoom: 18, 
                               pitch: 60,
                               duration: 3000 
                           } 
                       }));
                   }

               } catch (e) { console.error(e); }
           }
           
           handleClose(finalPayload);
        }}
        className="px-10 py-5 bg-[#1d1d1f] hover:bg-black text-white font-bold rounded-[24px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] active:scale-95 transition-all flex items-center gap-3 text-lg"
      >
        <span>Ir al Mapa</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};