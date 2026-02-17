// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Activity, ArrowLeft, ArrowRight, ArrowUp, Camera, Check, CheckCircle2, Clock,
  Eye, FileCheck, FileText, Flame, Globe, LayoutGrid, Loader2, Map as MapIcon,
  MapPin, Megaphone, Paintbrush, Radar, Ruler, Search, Shield, ShieldCheck,
  Smartphone, TrendingUp, Truck, UploadCloud, Video, X, Zap, Award, Crown, Play, Film,
  Box, Droplets, Star, Bed, Bath, Maximize2, Building2, Home, Briefcase, LandPlot, Warehouse, Sun,
  Wind, Thermometer, Armchair, Tent, Layers, Compass, SunDim, Trees, Hammer, Handshake, Coins, Calculator, Lock
} from "lucide-react";

import MapNanoCard from "./MapNanoCard";
import ExplorerHud from "./ExplorerHud";
import ProfilePanel from "./ProfilePanel";
import StepAgencyExtras from "./StepAgencyExtras";
import StepOpenHouse from "./StepOpenHouse";

import { savePropertyAction, getUserMeAction } from '@/app/actions';
import { uploadToCloudinary } from '@/app/utils/upload';

const MAPBOX_TOKEN = "pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw";

// CONSTANTES
const OFFICIAL_TYPES = [
  { id: "flat", label: "Piso", icon: Building2 },
  { id: "penthouse", label: "Ático", icon: Sun },
  { id: "duplex", label: "Dúplex", icon: Layers },
  { id: "loft", label: "Loft", icon: Maximize2 },
  { id: "villa", label: "Villa", icon: Home },
  { id: "bungalow", label: "Bungalow", icon: Tent },
  { id: "office", label: "Oficina", icon: Briefcase },
  { id: "land", label: "Suelo", icon: LandPlot },
  { id: "industrial", label: "Nave", icon: Warehouse }
];

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

// DATA MERCADO REAL
const REAL_MARKET_DB: Record<string, number> = {
  "IBIZA": 9200, "FORMENTERA": 8500, "SAN SEBASTIÁN": 6600, "MARBELLA": 6100,
  "MADRID": 5950, "BARCELONA": 5500, "SOTOGRANDE": 4800, "SITGES": 4600,
  "POZUELO": 5300, "MAJADAHONDA": 4900, "LAS ROZAS": 4300, "SANT CUGAT": 4700,
  "CALVIÀ": 5100, "ANDRATX": 6800, "BENAHAVÍS": 5200, "PALMA": 4200, "MÁLAGA": 3500,
  "VALENCIA": 2950, "ALICANTE": 2700, "BENIDORM": 3100, "JÁVEA": 3300, "DENIA": 2800,
  "ALTEA": 3000, "CALPE": 2900, "ESTEPONA": 3900, "FUENGIROLA": 3600, "NERJA": 3400,
  "CADIZ": 2800, "CANARIAS": 2600, "LAS PALMAS": 2500, "SANTA CRUZ": 2400, "ADEJE": 3800,
  "BILBAO": 3700, "VITORIA": 3100, "SANTANDER": 3000, "PAMPLONA": 2800, "A CORUÑA": 2700,
  "VIGO": 2600, "SANTIAGO": 2300, "GIJÓN": 2200, "OVIEDO": 2000, "ZARAGOZA": 2100,
  "SEVILLA": 2600, "GRANADA": 2300, "CÓRDOBA": 1900
};
const NATIONAL_AVG = 2150;

// ==================================================================================
// ✅ ARCHITECT HUD (MAIN)
// ==================================================================================
export default function ArchitectHud({ onCloseMode, soundFunc, initialData }: any) {
    
    // Pasos dinámicos (Agencia vs Particular)
    const [step, setStep] = useState<string>("LOCATION");
    const [isClosing, setIsClosing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showWizard, setShowWizard] = useState(true);
    
    // DATOS DE FORMULARIO
    const [formData, setFormData] = useState<any>({
        address: "", coordinates: null, type: "Piso", floor: "", door: "", elevator: false,
        mBuilt: "", rooms: 2, baths: 1, state: "Buen estado", exterior: true, orientation: "",
        title: "", description: "", energyConsumption: "", energyEmissions: "", energyPending: false,
        images: [], price: "", communityFees: "", selectedServices: [],
        videoUrl: "", tourUrl: "", simpleNoteUrl: "", energyCertUrl: "",
        openHouse: { enabled: false, amenities: [] },
        
        // 🔥 DATOS B2B (Agencia)
        mandateType: "ABIERTO",
        commissionPct: 3,
        sharePct: 0, 
        shareVisibility: "AGENCIES", 
        
        isAgencyContext: false,
        isEditMode: false
    });

    // Detectar Rol
    useEffect(() => {
        const verifyRole = async () => {
            try {
                const res = await getUserMeAction();
                if (res?.success && (res.data?.role === 'AGENCIA' || res.data?.licenseType === 'PRO')) {
                   console.log("🦅 HUD: RANGO DE AGENCIA CONFIRMADO.");
                   setFormData((prev: any) => ({ ...prev, isAgencyContext: true }));
                }
            } catch (e) { console.error(e); }
        };
        verifyRole();
    }, []);

    // Cargar datos iniciales
    useEffect(() => {
        if (initialData) {
            const normalizedPrice = initialData.rawPrice ? String(initialData.rawPrice) : (initialData.price ? String(initialData.price).replace(/\D/g, "") : "");
            
            setFormData((prev: any) => ({
                ...prev,
                ...initialData,
                mBuilt: initialData.mBuilt || initialData.m2 || "",
                price: normalizedPrice,
                // Recuperar B2B
                mandateType: initialData.activeCampaign?.mandateType || initialData.mandateType || "ABIERTO",
                commissionPct: initialData.activeCampaign?.commissionPct || initialData.commissionPct || 3,
                sharePct: initialData.activeCampaign?.commissionSharePct || initialData.b2b?.sharePct || 0,
                shareVisibility: initialData.activeCampaign?.commissionShareVisibility || "AGENCIES",
                
                isEditMode: !!initialData.id,
                isAgencyContext: initialData.isAgencyContext || prev.isAgencyContext
            }));

            if (initialData.address || initialData.id) setStep("BASICS");
            else setStep("LOCATION");
        }
    }, [initialData]);

    const updateData = (field: string, value: any) => setFormData((prev: any) => ({ ...prev, [field]: value }));

    const closeWizard = (payload?: any) => {
        setIsClosing(true);
        setTimeout(() => { if (onCloseMode) onCloseMode(!!payload, payload); }, 700);
    };

    // Barra de progreso
    const currentStepIndex = useMemo(() => {
        const allSteps = ["LOCATION", "BASICS", "SPECS", "DESCRIPTION", "ENERGY", "MEDIA", "PRICE", "AGENCY_EXTRAS", "OPEN_HOUSE", "AGENCY_B2B", "ANALYSIS", "RADAR", "SUCCESS"];
        return allSteps.indexOf(step) + 1;
    }, [step]);

    return (
        <div className="absolute inset-0 pointer-events-none z-[5000]">
            {/* NANO CARD PREVIEW */}
            {step !== "SUCCESS" && (
                <MapNanoCard 
                    {...formData} 
                    rawPrice={parsePriceInput(formData.price)} 
                    img={formData.images?.[0] || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80"}
                />
            )}

            {!showWizard && (
                <ExplorerHud onCloseMode={() => closeWizard()} soundFunc={soundFunc} onGoToMap={() => setShowWizard(true)} />
            )}

            {/* WIZARD MODAL */}
            {showWizard && (
                <div className={`fixed inset-0 z-[7000] flex items-center justify-center p-4 transition-all duration-500 ${isClosing ? "opacity-0" : "opacity-100"} pointer-events-auto`}>
                    <div className="absolute inset-0 bg-[#F5F5F7]/95 backdrop-blur-xl transition-all" />
                    
                    <div className={`relative z-10 w-[90vw] max-w-5xl h-[85vh] flex flex-col overflow-hidden transform transition-all duration-700 rounded-[32px] bg-white shadow-2xl ${isClosing ? "scale-95 translate-y-10" : "scale-100"}`}>
                        
                        {/* Header */}
                        {step !== "SUCCESS" && (
                            <div className="px-8 pt-8 pb-6 border-b border-gray-100 bg-white z-20 shrink-0">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase mb-1">ASISTENTE STRATOS</span>
                                        <span className="text-xl font-bold text-gray-900 tracking-tight">Paso {currentStepIndex} <span className="text-gray-300">/</span> {formData.isAgencyContext ? "10" : "9"}</span>
                                    </div>
                                    <button onClick={() => closeWizard()} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"><X size={20} className="text-gray-500" /></button>
                                </div>
                                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-black transition-all duration-700 ease-out" style={{ width: `${(currentStepIndex / (formData.isAgencyContext ? 10 : 9)) * 100}%` }} />
                                </div>
                            </div>
                        )}

                        {/* Contenido */}
                        <div className="flex-1 overflow-hidden relative z-10 bg-white">
                            <div className="h-full w-full overflow-y-auto custom-scrollbar p-8 lg:px-12">
                                <div className="max-w-4xl mx-auto h-full flex flex-col">
                                    {/* PASOS COMUNES */}
                                    {step === "LOCATION" && <StepLocation formData={formData} updateData={updateData} setStep={setStep} />}
                                    {step === "BASICS" && <StepBasics formData={formData} updateData={updateData} setStep={setStep} />}
                                    {step === "SPECS" && <StepSpecs formData={formData} updateData={updateData} setStep={setStep} />}
                                    {step === "DESCRIPTION" && <StepDescription formData={formData} updateData={updateData} setStep={setStep} />}
                                    {step === "ENERGY" && <StepEnergy formData={formData} updateData={updateData} setStep={setStep} />}
                                    {step === "MEDIA" && <StepMedia formData={formData} updateData={updateData} setStep={setStep} />}
                                    
                                    {/* PASO PRECIO (CON DESVÍO) */}
                                    {step === "PRICE" && <StepPrice formData={formData} updateData={updateData} setStep={setStep} />}
                                    
                                    {/* 🔥 RUTAS DIVERGENTES 🔥 */}
                                    
                                    {/* RUTA AGENCIA */}
                                    {step === "AGENCY_EXTRAS" && <StepAgencyExtrasWrapper formData={formData} setFormData={setFormData} setStep={setStep} />}
                                    {step === "OPEN_HOUSE" && <StepOpenHouseWrapper formData={formData} setFormData={setFormData} setStep={setStep} />}
                                    {step === "AGENCY_B2B" && <StepAgencyB2B formData={formData} updateData={updateData} setStep={setStep} />}
                                    
                                    {/* RUTA PARTICULAR */}
                                    {step === "ANALYSIS" && <MarketAnalysisStep formData={formData} onNext={() => setStep("RADAR")} />}
                                    {step === "RADAR" && <MarketRadarStep formData={formData} onNext={() => setStep("SUCCESS")} />}
                                    
                                    {/* FINAL COMÚN */}
                                    {step === "SUCCESS" && <StepSuccess formData={formData} handleClose={(p: any) => { window.dispatchEvent(new CustomEvent("reload-profile-assets")); closeWizard(p); }} />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* PANEL PERFIL (Opcional) */}
            <ProfilePanel
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
                onSelectProperty={(id: string) => { console.log("🎯 Objetivo fijado:", id); setActivePropertyId(id); setShowWizard(false); }}
                rightPanel={showProfile ? "PROFILE" : "NONE"}
                toggleRightPanel={(val: string) => setShowProfile(val === "PROFILE")}
            />
        </div>
    );
}

// ============================================================================
// 🧱 COMPONENTES DE PASOS (STEPS)
// ============================================================================

// --- STEP LOCATION ---
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
        const MADRID_CENTER = "-3.7038,40.4168"; 
        const SPAIN_BBOX = "-18.1612,27.6377,4.3279,43.7924"; 
        const TYPES = "district,locality,neighborhood,address,poi";
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_TOKEN}&country=es&types=${TYPES}&proximity=${MADRID_CENTER}&bbox=${SPAIN_BBOX}&language=es&autocomplete=true&fuzzyMatch=true&limit=10`;
        const res = await fetch(url);
        const data = await res.json();
        setResults(data.features || []);
      } catch (error) { console.error(error); setResults([]); } finally { setIsSearching(false); }
    } else {
      setResults([]); setShowResults(false);
    }
  };

  const selectAddress = (feature: any) => {
    setQuery(feature.place_name);
    updateData("address", feature.place_name);
    updateData("coordinates", feature.center);
    const ctx = feature?.context || [];
    const getCtx = (prefix: string) => { const hit = ctx.find((c: any) => (c.id || "").startsWith(prefix + ".")); return hit?.text || ""; };
    const postcode = getCtx("postcode"); const place = getCtx("place") || getCtx("locality"); const region = getCtx("region"); 
    if (postcode) updateData("postcode", postcode);
    if (place) updateData("city", place);
    if (region) updateData("region", region);
    setShowResults(false);
  };

  const canContinue = query.length > 5 && formData.address;

  return (
    <div className="h-full flex flex-col animate-fade-in-right p-1">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Ubicación</h2>
      <p className="text-gray-500 mb-6 text-sm">Busca la dirección exacta.</p>
      <div className="flex-1 flex flex-col gap-4 relative">
        <div className="relative z-50">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{isSearching ? <Loader2 size={20} className="animate-spin text-blue-500" /> : <Search size={20} />}</div>
          <input autoFocus value={query} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-12 p-4 bg-white rounded-xl border border-gray-200 focus:border-black outline-none font-medium text-gray-900 shadow-sm" placeholder="Ej: Calle Serrano 1..." />
          {showResults && results.length > 0 && (
            <div className="absolute top-[110%] left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto custom-scrollbar z-[60]">
              {results.map((item: any, index: number) => (
                <div key={`${item.id}-${index}`} onClick={() => selectAddress(item)} className="p-4 border-b border-gray-50 hover:bg-blue-50 cursor-pointer flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full text-gray-500 shrink-0"><MapPin size={14} /></div>
                  <div className="text-left overflow-hidden"><div className="font-bold text-gray-900 text-sm truncate">{item.text}</div><div className="text-xs text-gray-500 truncate">{item.place_name}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center bg-gray-50/50 min-h-[200px]">
          {canContinue ? (
            <div className="relative w-full h-full min-h-[220px] rounded-xl overflow-hidden shadow-md group animate-in zoom-in duration-300">
              {formData.coordinates && <img src={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/pin-s+ff0000(${formData.coordinates[0]},${formData.coordinates[1]})/${formData.coordinates[0]},${formData.coordinates[1]},17,0/600x300?access_token=${MAPBOX_TOKEN}`} alt="Satélite" className="absolute inset-0 w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
                <h3 className="text-white font-bold text-lg leading-tight truncate shadow-sm">{formData.address}</h3>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-40"><MapIcon size={48} className="mb-4 text-gray-400" /><span className="text-sm font-bold uppercase tracking-widest text-gray-400">Esperando dirección...</span></div>
          )}
        </div>
      </div>
      <button onClick={() => setStep("BASICS")} disabled={!canContinue} className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg mt-6 flex items-center justify-center gap-2 transition-all ${canContinue ? "bg-black hover:scale-[1.02]" : "bg-gray-200 cursor-not-allowed"}`}>Continuar <ArrowRight size={18} /></button>
    </div>
  );
};

// --- STEP BASICS ---
const StepBasics = ({ formData, updateData, setStep }: any) => {
  const [localDoor, setLocalDoor] = useState(formData.door || "");
  const saveDoor = () => updateData("door", localDoor);
  const isLandOrVilla = ["Suelo", "Nave", "Villa", "Bungalow"].includes(formData.type);

  return (
    <div className="h-full flex flex-col animate-fade-in-right">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Características</h2>
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-6">
        <div><label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Tipo</label>
        <div className="grid grid-cols-3 gap-3 pb-2">{OFFICIAL_TYPES.map((item) => { const isSelected = formData.type === item.label; return (<button key={item.id} onClick={() => { updateData("type", item.label); if (["Suelo", "Nave", "Villa", "Bungalow"].includes(item.label)) { updateData("floor", ""); updateData("elevator", false); } }} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${isSelected ? "border-blue-600 bg-blue-600 text-white shadow-md scale-105" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}><item.icon size={22} strokeWidth={isSelected ? 2 : 1.5} /><span className="text-[10px] font-bold uppercase">{item.label}</span></button>) })}</div></div>
        
        <div><label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Estado</label><div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">{['Obra Nueva', 'Buen Estado', 'Reformado', 'A Reformar'].map((st) => (<button key={st} onClick={() => updateData("state", st)} className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold border transition-all ${formData.state === st ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-200"}`}>{st}</button>))}</div></div>

        {!isLandOrVilla && (
           <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Planta</label><div className="relative"><select className="w-full p-4 bg-gray-50 rounded-xl border border-gray-300 text-gray-900 font-bold focus:border-black outline-none appearance-none cursor-pointer" value={formData.floor} onChange={(e) => updateData("floor", e.target.value)}><option value="" disabled>Select</option><option value="Bajo">Bajo</option>{[1,2,3,4,5,6,7,8,9,10,12,15].map((n) => (<option key={n} value={n}>{n}ª Planta</option>))}<option value="Atico">Ático</option></select></div></div>
             <div><label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Puerta</label><input className="w-full p-4 bg-gray-50 rounded-xl border border-gray-300 text-gray-900 font-bold focus:border-black outline-none" placeholder="Ej: 2B" value={localDoor} onChange={(e) => setLocalDoor(e.target.value)} onBlur={saveDoor} /></div>
           </div>
        )}
        
        {!isLandOrVilla && (
            <div className="grid grid-cols-2 gap-4">
               <div><label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Posición</label><div className="flex bg-gray-100 p-1 rounded-xl"><button onClick={() => updateData("exterior", true)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.exterior ? "bg-white shadow text-gray-900" : "text-gray-400"}`}>Exterior</button><button onClick={() => updateData("exterior", false)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!formData.exterior ? "bg-white shadow text-gray-900" : "text-gray-400"}`}>Interior</button></div></div>
               <div><label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Ascensor</label><div className="flex bg-gray-100 p-1 rounded-xl"><button onClick={() => updateData("elevator", true)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.elevator ? "bg-white shadow text-blue-600" : "text-gray-400"}`}>Sí</button><button onClick={() => updateData("elevator", false)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!formData.elevator ? "bg-white shadow text-gray-900" : "text-gray-400"}`}>No</button></div></div>
            </div>
        )}
      </div>
      <div className="mt-4 flex gap-4 pt-4 border-t border-gray-100">
        <button onClick={() => setStep("LOCATION")} className="p-4 bg-gray-100 text-gray-800 rounded-2xl hover:bg-gray-200"><ArrowLeft size={24} /></button>
        <button onClick={() => { saveDoor(); setStep("SPECS"); }} className="w-full py-4 bg-black text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02]">Siguiente <ArrowRight size={18} /></button>
      </div>
    </div>
  );
};

// --- STEP SPECS ---
const StepSpecs = ({ formData, updateData, setStep }: any) => {
  const [localM2, setLocalM2] = useState(formData.mBuilt || "");
  const EXTRAS = [ { id: 'pool', label: 'Piscina', icon: Droplets }, { id: 'garage', label: 'Garaje', icon: Box }, { id: 'terrace', label: 'Terraza', icon: SunDim }, { id: 'garden', label: 'Jardín', icon: Trees }, { id: 'storage', label: 'Trastero', icon: Warehouse }, { id: 'ac', label: 'Aire Acond.', icon: Wind }, { id: 'heating', label: 'Calefacción', icon: Thermometer }, { id: 'furnished', label: 'Amueblado', icon: Armchair }, { id: 'security', label: 'Seguridad', icon: ShieldCheck } ];
  const toggleExtra = (id: string) => { const current = formData.selectedServices || []; const updated = current.includes(id) ? current.filter((x: string) => x !== id) : [...current, id]; updateData("selectedServices", updated); };

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2">
      <div className="mb-6 shrink-0"><h2 className="text-3xl font-black text-gray-900 mb-2">Detalles</h2><p className="text-gray-500 font-medium">Espacios y extras.</p></div>
      <div className="flex-1 space-y-8 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-8 pt-2">
        <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 shadow-inner"><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Superficie</label><div className="relative flex items-baseline"><input className="w-full bg-transparent text-5xl font-black text-gray-900 outline-none" placeholder="0" value={localM2} onChange={(e) => setLocalM2(e.target.value)} onBlur={() => updateData("mBuilt", localM2)} autoFocus /><span className="text-xl font-bold text-gray-400 ml-2">m²</span></div></div>
        <div className="grid grid-cols-2 gap-6"><div className="p-5 rounded-[24px] border border-gray-100 bg-white shadow-sm"><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Habitaciones</label><div className="flex items-center justify-between"><button onClick={() => updateData("rooms", Math.max(0, Number(formData.rooms || 0) - 1))} className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 font-bold text-xl">-</button><span className="text-3xl font-black text-gray-900">{formData.rooms}</span><button onClick={() => updateData("rooms", Number(formData.rooms || 0) + 1)} className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold text-xl">+</button></div></div><div className="p-5 rounded-[24px] border border-gray-100 bg-white shadow-sm"><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Baños</label><div className="flex items-center justify-between"><button onClick={() => updateData("baths", Math.max(0, Number(formData.baths || 0) - 1))} className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 font-bold text-xl">-</button><span className="text-3xl font-black text-gray-900">{formData.baths}</span><button onClick={() => updateData("baths", Number(formData.baths || 0) + 1)} className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold text-xl">+</button></div></div></div>
        <div><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Extras</label><div className="grid grid-cols-2 gap-3">{EXTRAS.map((extra) => { const isSelected = (formData.selectedServices || []).includes(extra.id); return (<button key={extra.id} onClick={() => toggleExtra(extra.id)} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${isSelected ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-gray-500 border-gray-200'}`}><extra.icon size={18} /><span className="text-sm font-bold">{extra.label}</span></button>) })}</div></div>
      </div>
      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0"><button onClick={() => setStep("BASICS")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100"><ArrowLeft size={24} /></button><button onClick={() => setStep("DESCRIPTION")} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">Siguiente Paso <ArrowRight size={20} /></button></div>
    </div>
  );
};

// --- STEP DESCRIPTION ---
const StepDescription = ({ formData, updateData, setStep }: any) => {
  const [localTitle, setLocalTitle] = useState(formData.title || "");
  const [localDesc, setLocalDesc] = useState(formData.description || "");

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2">
      <div className="mb-6 shrink-0"><h2 className="text-3xl font-black text-gray-900 mb-2">Narrativa</h2><p className="text-gray-500 font-medium">Cuenta la historia de tu propiedad.</p></div>
      <div className="flex-1 space-y-8 overflow-y-auto px-4 -mx-4 custom-scrollbar pt-2 pb-4">
        <div className="group"><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Titular</label><input className="w-full p-5 bg-gray-50 rounded-[24px] border border-gray-100 text-2xl font-bold text-gray-900 placeholder:text-gray-300 outline-none" placeholder="Ej: Ático de lujo..." value={localTitle} onChange={(e) => setLocalTitle(e.target.value)} onBlur={() => updateData("title", localTitle)} autoFocus /></div>
        <div className="group h-full max-h-[40vh] flex flex-col"><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Descripción</label><textarea className="w-full flex-1 p-6 bg-gray-50 rounded-[24px] border border-gray-100 text-lg font-medium text-gray-700 leading-relaxed placeholder:text-gray-300 resize-none outline-none" placeholder="Describe los espacios, la luz..." value={localDesc} onChange={(e) => setLocalDesc(e.target.value)} onBlur={() => updateData("description", localDesc)} /></div>
      </div>
      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0"><button onClick={() => setStep("SPECS")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100"><ArrowLeft size={24} /></button><button onClick={() => setStep("ENERGY")} disabled={!localTitle} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50">Siguiente Paso <ArrowRight size={20} /></button></div>
    </div>
  );
};

// --- STEP ENERGY ---
const StepEnergy = ({ formData, updateData, setStep }: any) => {
  const RATINGS = ["A", "B", "C", "D", "E", "F", "G"];
  const togglePending = () => { const newState = !formData.energyPending; updateData("energyPending", newState); if (newState) { updateData("energyConsumption", ""); updateData("energyEmissions", ""); } };
  const getStyle = (r: string, current: string) => {
    const isSelected = current === r; const isDisabled = formData.energyPending;
    if (isDisabled) return "bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed scale-95 opacity-50";
    const colors: any = { A: "bg-[#009345]", B: "bg-[#4FB848]", C: "bg-[#B5D638]", D: "bg-[#FFF100]", E: "bg-[#FDB913]", F: "bg-[#F37021]", G: "bg-[#E30613]" };
    if (isSelected) return `${colors[r]} text-white shadow-lg scale-110 font-black ring-2 ring-white`;
    return `bg-white border-2 border-gray-100 hover:bg-gray-50`;
  };

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2">
      <div className="mb-6 shrink-0"><h2 className="text-3xl font-black text-gray-900 mb-2">Certificación</h2><p className="text-gray-500 font-medium">Eficiencia energética.</p></div>
      <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-4 pt-2 space-y-8">
        <div onClick={togglePending} className={`group cursor-pointer p-4 rounded-[20px] border-2 transition-all duration-300 flex items-center justify-between ${formData.energyPending ? "bg-blue-50 border-blue-500 shadow-md" : "bg-white border-gray-100 hover:border-gray-300"}`}><div className="flex items-center gap-4"><FileCheck size={24} /><span className="font-bold text-lg">En trámite</span></div>{formData.energyPending && <Check size={14} className="text-blue-600" />}</div>
        <div className={`transition-all duration-500 ${formData.energyPending ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
            <div className="mb-8"><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Consumo</label><div className="grid grid-cols-7 gap-2">{RATINGS.map((r) => (<button key={`c-${r}`} onClick={() => updateData("energyConsumption", r)} className={`aspect-square rounded-xl flex items-center justify-center ${getStyle(r, formData.energyConsumption)}`}>{r}</button>))}</div></div>
            <div><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Emisiones</label><div className="grid grid-cols-7 gap-2">{RATINGS.map((r) => (<button key={`e-${r}`} onClick={() => updateData("energyEmissions", r)} className={`aspect-square rounded-xl flex items-center justify-center ${getStyle(r, formData.energyEmissions)}`}>{r}</button>))}</div></div>
        </div>
      </div>
      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0"><button onClick={() => setStep("DESCRIPTION")} className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-2xl hover:bg-gray-100"><ArrowLeft size={24} /></button><button onClick={() => setStep("MEDIA")} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">Siguiente Paso <ArrowRight size={20} /></button></div>
    </div>
  );
};

// --- STEP MEDIA ---
const StepMedia = ({ formData, updateData, setStep }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = async (e: any) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const uploadPromises = files.map(async (file: any) => await uploadToCloudinary(file));
    const uploadedUrls = await Promise.all(uploadPromises);
    const validUrls = uploadedUrls.filter(url => url !== null);
    const currentImages = formData.images || [];
    updateData("images", [...currentImages, ...validUrls].slice(0, 10));
  };
  const removeImage = (index: number) => { updateData("images", (formData.images || []).filter((_: any, i: number) => i !== index)); };
  const images = formData.images || [];

  return (
    <div className="h-full flex flex-col animate-fade-in-right px-2">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple accept="image/*,video/*,application/pdf" />
      <div className="mb-6 shrink-0"><h2 className="text-3xl font-black text-gray-900 mb-2">Multimedia</h2><p className="text-gray-500 font-medium">Sube fotos o vídeos.</p></div>
      <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-4 pt-2">
        <div onClick={() => fileInputRef.current?.click()} className="group h-64 rounded-[24px] border-4 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50"><Camera size={32} className="text-blue-600 mb-4" /><h3 className="text-2xl font-black text-gray-900">Toca para Subir</h3></div>
        <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 gap-3">
           {images.map((url: string, i: number) => (
               <div key={i} className="aspect-square rounded-[20px] overflow-hidden relative group border border-gray-100 bg-gray-50">
                   <img src={url} alt="" className="w-full h-full object-cover" />
                   <button onClick={(e) => { e.stopPropagation(); removeImage(i); }} className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1"><X size={12} /></button>
               </div>
           ))}
        </div>
      </div>
      <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0"><button onClick={() => setStep("ENERGY")} className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-2xl hover:bg-gray-100"><ArrowLeft size={24} /></button><button onClick={() => setStep("PRICE")} className="flex-1 h-16 text-white font-bold rounded-2xl shadow-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">Siguiente Paso <ArrowRight size={20} /></button></div>
    </div>
  );
};

// --- STEP PRICE (MODIFICADO) ---
const StepPrice = ({ formData, updateData, setStep }: any) => {
    const formatCurrency = (v: string) => v ? v.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
    const [localPrice, setLocalPrice] = useState(() => { 
        const numericVal = parsePriceInput(formData.price); 
        return numericVal > 0 ? formatCurrency(String(numericVal)) : ""; 
    });
    const [localCommunity, setLocalCommunity] = useState(formData.communityFees || "");
    
    const syncData = () => { 
        updateData("price", localPrice.replace(/\./g, "")); 
        updateData("communityFees", localCommunity); 
    };

    const handleNext = () => {
        syncData();
        // 🔥 EL DESVÍO
        if (formData.isAgencyContext) {
            setStep("AGENCY_EXTRAS"); // Agencia -> Extras
        } else {
            setStep("ANALYSIS");      // Particular -> Análisis
        }
    };

    return (
        <div className="h-full flex flex-col animate-fade-in-right px-2 relative">
             <div className="mb-2 shrink-0 text-center"><h2 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Valoración</h2><p className="text-gray-500 font-medium text-xs">Define el precio de salida.</p></div>
             <div className="flex-1 flex flex-col items-center justify-center min-h-0 pb-24">
                <div className="relative w-full max-w-lg mx-auto group text-center mb-6">
                    <input className="w-full text-center bg-transparent text-6xl sm:text-7xl font-black outline-none placeholder:text-gray-200 p-0 text-gray-900" placeholder="0" value={localPrice} onChange={(e) => { let val = e.target.value.replace(/\D/g, ""); setLocalPrice(formatCurrency(val)); }} onBlur={syncData} autoFocus />
                    <span className="absolute top-0 -right-6 text-4xl font-bold opacity-30 pointer-events-none text-gray-900">€</span>
                </div>
                <div className="w-full max-w-xs px-4 mt-4"><label className="block text-center text-[10px] font-bold text-gray-400 uppercase mb-2">Comunidad (Mes)</label><input className="w-full py-3 px-6 bg-gray-50 text-center rounded-2xl font-bold outline-none" placeholder="0" value={localCommunity} onChange={(e) => setLocalCommunity(e.target.value.replace(/\D/g, ""))} onBlur={syncData} /></div>
             </div>
             <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
                <button onClick={() => setStep("MEDIA")} className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 active:scale-95"><ArrowLeft size={24} /></button>
                <button onClick={handleNext} disabled={!localPrice} className="flex-1 h-16 bg-[#1d1d1f] text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 text-lg hover:bg-black active:scale-[0.98] disabled:opacity-50">
                    {formData.isAgencyContext ? "Siguiente: Documentación" : "Analizar Mercado"} <ArrowRight size={20} />
                </button>
             </div>
        </div>
    );
};

// --- WRAPPERS ---

const StepAgencyExtrasWrapper = ({ formData, setFormData, setStep }: any) => {
    return (
        <div className="h-full flex flex-col animate-fade-in-right px-2">
            <div className="mb-6 shrink-0"><h2 className="text-3xl font-black text-gray-900 mb-2">Agencia Pro</h2><p className="text-gray-500 font-medium">Contenido multimedia y legal.</p></div>
            <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-8 pt-2">
                <StepAgencyExtras formData={formData} setFormData={setFormData} />
            </div>
            <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
                <button onClick={() => setStep("PRICE")} className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-2xl hover:bg-gray-100"><ArrowLeft size={24} /></button>
                <button onClick={() => setStep("OPEN_HOUSE")} className="flex-1 h-16 bg-[#1d1d1f] text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3">Gestionar Eventos <ArrowRight size={20} /></button>
            </div>
        </div>
    );
};

const StepOpenHouseWrapper = ({ formData, setFormData, setStep }: any) => {
    return (
        <div className="h-full flex flex-col animate-fade-in-right px-2">
            <div className="mb-6 shrink-0"><h2 className="text-3xl font-black text-gray-900 mb-2">Open House</h2><p className="text-gray-500 font-medium">Organiza jornadas de puertas abiertas.</p></div>
            <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar pb-8 pt-2">
                <StepOpenHouse formData={formData} setFormData={setFormData} />
            </div>
            <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
                <button onClick={() => setStep("AGENCY_EXTRAS")} className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-2xl hover:bg-gray-100"><ArrowLeft size={24} /></button>
                <button onClick={() => setStep("AGENCY_B2B")} className="flex-1 h-16 bg-[#1d1d1f] text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3">Definir Colaboración <ArrowRight size={20} /></button>
            </div>
        </div>
    );
};

// --- 🔥 NUEVO: STEP AGENCY B2B (COMISIONES Y MANDATO) ---
const StepAgencyB2B = ({ formData, updateData, setStep }: any) => {
    
    // Estados locales
    const [mandate, setMandate] = useState(formData.mandateType || "ABIERTO");
    const [comm, setComm] = useState(formData.commissionPct || 3);
    const [share, setShare] = useState(formData.sharePct || 0);
    const [visibility, setVisibility] = useState(formData.shareVisibility || "AGENCIES");

    // Cálculos en tiempo real
    const rawPrice = formData.price ? parseFloat(String(formData.price).replace(/\D/g, "")) : 0;
    const commAmount = rawPrice * (comm / 100);
    const shareAmount = commAmount * (share / 100);

    const saveData = () => {
        updateData("mandateType", mandate);
        updateData("commissionPct", comm);
        updateData("sharePct", share);
        updateData("shareVisibility", visibility);
    };

    return (
        <div className="h-full flex flex-col animate-fade-in-right px-2">
             <div className="mb-6 shrink-0"><h2 className="text-3xl font-black text-gray-900 mb-2">Colaboración</h2><p className="text-gray-500 font-medium">Define tu mandato y comparte comisiones.</p></div>
             
             <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar space-y-6 pb-6">
                
                {/* MANDATO */}
                <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tipo de Mandato</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['ABIERTO', 'EXCLUSIVE'].map(t => (
                            <button key={t} onClick={() => setMandate(t)} className={`py-3 rounded-xl text-xs font-bold border transition-all ${mandate === t ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}>
                                {t === 'EXCLUSIVE' ? 'Exclusiva' : 'Nota de Encargo'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* COMISIONES */}
                <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Honorarios Agencia</label>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                            <span className="text-xs font-bold text-gray-500 block mb-1">% Comisión</span>
                            <input type="number" value={comm} onChange={e => setComm(Number(e.target.value))} className="w-full bg-gray-50 p-3 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 ring-blue-100"/>
                        </div>
                        <div className="flex-1 text-right">
                            <span className="text-xs font-bold text-gray-500 block mb-1">Total Estimado</span>
                            <span className="text-xl font-black text-gray-900">{new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(commAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* REPARTO B2B */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-[24px] border border-amber-100 shadow-sm">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><Handshake size={20}/></div>
                        <h3 className="text-sm font-black text-amber-900 uppercase">Colaboración B2B</h3>
                     </div>

                     <label className="block text-[10px] font-black text-amber-800/60 uppercase tracking-widest mb-2">Porcentaje a Compartir (del total)</label>
                     <div className="flex items-center gap-4 mb-4">
                         <input type="range" min="0" max="100" value={share} onChange={e => setShare(Number(e.target.value))} className="flex-1 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"/>
                         <span className="text-2xl font-black text-amber-600 w-16 text-right">{share}%</span>
                     </div>

                     <div className="flex justify-between items-center bg-white/60 p-3 rounded-xl border border-amber-100/50 mb-4">
                         <span className="text-xs font-bold text-amber-800">Para el colaborador:</span>
                         <span className="text-lg font-black text-amber-600">{new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(shareAmount)}</span>
                     </div>

                     <label className="block text-[10px] font-black text-amber-800/60 uppercase tracking-widest mb-2">Visibilidad</label>
                     <div className="grid grid-cols-3 gap-2">
                        {[{id: 'PRIVATE', l: 'Privado'}, {id: 'AGENCIES', l: 'Solo Agencias'}, {id: 'PUBLIC', l: 'Público'}].map(opt => (
                            <button key={opt.id} onClick={() => setVisibility(opt.id)} className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${visibility === opt.id ? 'bg-amber-500 text-white' : 'bg-white text-amber-800/60'}`}>
                                {opt.l}
                            </button>
                        ))}
                     </div>
                </div>
             </div>

             <div className="mt-4 flex gap-4 pt-6 border-t border-gray-100 shrink-0">
                <button onClick={() => setStep("OPEN_HOUSE")} className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-2xl hover:bg-gray-100"><ArrowLeft size={24} /></button>
                <button onClick={() => { saveData(); setStep("SUCCESS"); }} className="flex-1 h-16 bg-[#1d1d1f] text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-black active:scale-[0.98]">
                    Finalizar y Publicar <CheckCircle2 size={20} />
                </button>
             </div>
        </div>
    );
};

// ... COMPONENTES PARTICULAR (ANALYSIS, RADAR, SUCCESS) ...
// (Reutilice los que ya tenía, no han cambiado, solo el Success se actualiza con datos nuevos)

const MarketAnalysisStep = ({ formData, onNext }: any) => {
    const [analyzing, setAnalyzing] = useState(true);
    const [progress, setProgress] = useState(0);
    const { pricePerM2, detectedZone, percentDiff, isExpensive, estimatedMonths, marketPosition } = useMemo(() => { const safePrice = formData?.price ? parseFloat(formData.price.toString().replace(/\D/g, "")) : 0; const safeM2 = formData?.mBuilt ? parseFloat(formData.mBuilt.toString().replace(/\D/g, "")) : 0; const m2 = safeM2 > 0 ? safeM2 : 100; const currentPriceM2 = m2 > 0 ? Math.round(safePrice / m2) : 0; let zoneName = "MEDIA NACIONAL"; let refPrice = NATIONAL_AVG; const searchAddress = (formData?.address || formData?.location || "").toUpperCase(); const matches = Object.keys(REAL_MARKET_DB).filter((city) => searchAddress.includes(city)); if (matches.length > 0) { const bestMatch = matches.reduce((a, b) => (a.length > b.length ? a : b)); zoneName = bestMatch; refPrice = REAL_MARKET_DB[bestMatch]; } const diff = currentPriceM2 - refPrice; const pDiff = refPrice > 0 ? ((diff / refPrice) * 100).toFixed(1) : "0"; const nPercent = parseFloat(pDiff || "0"); const expensive = diff > 0; const months = expensive ? (Math.abs(nPercent) > 20 ? 12 : 6) : 2; let visualPos = 50 + nPercent / 2; visualPos = Math.min(Math.max(visualPos, 5), 95); return { pricePerM2: currentPriceM2, detectedZone: zoneName, percentDiff: Math.abs(nPercent).toFixed(1), isExpensive: expensive, estimatedMonths: months, marketPosition: visualPos }; }, [formData]);
    useEffect(() => { const t1 = setTimeout(() => setProgress(30), 400); const t2 = setTimeout(() => setProgress(60), 1200); const t3 = setTimeout(() => setProgress(90), 2200); const t4 = setTimeout(() => { setProgress(100); setAnalyzing(false); }, 3200); return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); }; }, []);
  
    if (analyzing) { return (<div className="h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent pointer-events-none" /><div className="w-full max-w-sm relative z-10"><div className="mb-10 relative flex justify-center"><div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-20"></div><div className="absolute inset-2 border-4 border-blue-50 rounded-full animate-ping delay-100 opacity-30"></div><div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-[0_10px_40px_rgba(0,113,227,0.15)] relative z-10"><div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div><span className="text-3xl font-black text-gray-900">{progress}%</span></div></div><h2 className="text-xl font-bold text-gray-900 mb-2">Analizando Mercado</h2><p className="text-sm font-bold text-blue-600 uppercase tracking-widest animate-pulse">Escaneando {detectedZone}...</p><div className="h-1.5 w-full bg-gray-100 rounded-full mt-8 overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${progress}%` }}></div></div></div></div>); }
  
    return (
      <div className="h-full flex flex-col animate-fade-in-up px-2 relative">
        <div className="mb-2 shrink-0"><div className="flex items-center gap-2 mb-2"><div className={`w-2 h-2 rounded-full animate-pulse ${isExpensive ? "bg-orange-500" : "bg-emerald-500"}`}></div><span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Diagnóstico Completado</span></div><h2 className="text-3xl font-black text-gray-900 leading-none tracking-tight">Análisis de Precio</h2></div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 px-1">
          <div className="bg-white rounded-[24px] p-6 mb-6 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <div className="flex justify-between items-end mb-8"><div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tu Valoración</p><div className="flex items-baseline gap-1"><span className="text-5xl font-black text-gray-900 tracking-tight">{pricePerM2.toLocaleString()}</span><span className="text-sm font-bold text-gray-400">€/m²</span></div></div><div className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 ${isExpensive ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>{isExpensive ? <ArrowUp size={14} strokeWidth={3} /> : <TrendingUp size={14} strokeWidth={3} />}{percentDiff}% vs Media</div></div>
            <div className="relative h-12 mb-2 w-full select-none"><div className="absolute top-1/2 left-0 right-0 h-3 bg-gray-100 rounded-full -translate-y-1/2 overflow-hidden shadow-inner"><div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50 z-10"></div></div><div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all duration-1000" style={{ left: `${marketPosition}%` }}><div className={`w-5 h-5 rounded-full border-[3px] border-white shadow-lg -translate-x-1/2 ${isExpensive ? "bg-gray-900" : "bg-emerald-500"}`}></div><div className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 bg-gray-900 text-white text-[9px] font-black rounded-md tracking-wider shadow-sm">TÚ</div></div><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-60 flex flex-col items-center"><div className="w-3 h-3 bg-gray-400 rounded-full"></div><div className="absolute top-4 whitespace-nowrap text-[9px] font-bold text-gray-400 uppercase tracking-wider">Media {detectedZone}</div></div></div>
            <p className="text-sm text-gray-600 leading-relaxed font-medium mt-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">{isExpensive ? (<span>Tu propiedad se sitúa <strong className="text-gray-900">por encima</strong> del mercado. Esto puede implicar un tiempo de venta de <strong className="text-gray-900">{estimatedMonths} meses</strong>.</span>) : (<span>¡Precio competitivo! Estás <strong className="text-emerald-600">alineado</strong> con la zona {detectedZone}. Estimamos venta en <strong className="text-emerald-600">{estimatedMonths} meses</strong>.</span>)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-[24px] bg-gray-50 border border-gray-100 flex flex-col justify-between h-32 hover:bg-white hover:shadow-md transition-all"><div className="flex items-center gap-2 text-gray-400"><Clock size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Tiempo Estimado</span></div><div className="text-3xl font-black text-gray-900">{estimatedMonths} <span className="text-sm font-bold text-gray-400">Meses</span></div>{isExpensive && <div className="text-[10px] font-bold text-orange-500">Rotación Lenta</div>}{!isExpensive && <div className="text-[10px] font-bold text-emerald-500">Rotación Rápida</div>}</div>
            <div className="p-5 rounded-[24px] bg-gray-50 border border-gray-100 flex flex-col justify-between h-32 hover:bg-white hover:shadow-md transition-all"><div className="flex items-center gap-2 text-gray-400"><Search size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Demanda</span></div><div className="text-2xl font-black text-gray-900 flex items-center gap-2">ALTA <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span></div><div className="text-[10px] font-bold text-gray-400">Zona Caliente</div></div>
          </div>
        </div>
        <div className="sticky bottom-0 left-0 right-0 pt-4 pb-6 bg-white/95 backdrop-blur-xl border-t border-gray-100 flex gap-4 shrink-0 z-50 -mx-4 px-4 shadow-[0_-10px_20px_rgba(255,255,255,1)]"><button onClick={onNext} className="w-full bg-[#1d1d1f] hover:bg-black text-white rounded-2xl py-4 shadow-xl active:scale-[0.99] transition-all flex justify-between items-center px-8 h-16"><div className="flex flex-col items-start"><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Siguiente paso</span><span className="text-lg font-bold">Ver Competencia (Radar)</span></div><div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><Radar size={20} className="text-white" /></div></button></div>
      </div>
    );
  };
  
  const MarketRadarStep = ({ formData, onNext }: any) => {
    const [scanning, setScanning] = useState(true);
    const [selectedRival, setSelectedRival] = useState<number | null>(null);
    const basePrice = useMemo(() => { if (!formData?.price) return 0; const val = formData.price.toString().replace(/\D/g, ""); return val ? parseInt(val) : 0; }, [formData.price]);
    const RIVALS = [
      { id: 1, type: "COLD", name: "Propiedad Estancada", price: basePrice * 1.05, days: 245, visits: 12, img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80" },
      { id: 2, type: "WARM", name: "Competencia Directa", price: basePrice * 0.98, days: 45, visits: 180, img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { id: 3, type: "HOT", name: "Caso de Éxito", price: basePrice * 1.15, days: 12, visits: 3450, img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80" },
      { id: 4, type: "COLD", name: "Fuera de Mercado", price: basePrice * 1.1, days: 310, visits: 5, img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80" },
      { id: 5, type: "HOT", name: "Recién Listado", price: basePrice * 0.95, days: 3, visits: 890, img: "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=600&q=80" },
    ];
  
    useEffect(() => { const timer = setTimeout(() => setScanning(false), 2200); return () => clearTimeout(timer); }, []);
    const formatMoney = (amount: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
  
    if (scanning) { return (<div className="h-full flex flex-col items-center justify-center animate-fade-in text-center relative overflow-hidden"><div className="z-10 flex flex-col items-center gap-6 px-6 py-12"><div className="relative"><div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20 duration-[2000ms]"></div><div className="absolute inset-4 bg-blue-400 rounded-full animate-ping opacity-40 delay-300 duration-[2000ms]"></div><div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-[0_20px_60px_-10px_rgba(0,122,255,0.3)] relative z-10 border border-blue-50"><Radar className="text-[#007AFF] animate-spin-slow" size={40} strokeWidth={1.5} /></div></div><div><h3 className="text-xl font-bold tracking-tight text-gray-900">Escaneando Zona</h3><p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-2 animate-pulse">Localizando testigos comparables...</p></div></div></div>); }
  
    return (
      <div className="h-full flex flex-col animate-fade-in relative overflow-hidden">
        <div className="flex justify-between items-end mb-4 shrink-0 px-6 pt-2"><div><div className="flex items-center gap-2 mb-1"><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#007AFF]"></span></span><span className="text-[10px] font-black uppercase tracking-widest text-[#007AFF]">Radar Activo</span></div><h3 className="text-3xl font-black text-gray-900 tracking-tight">Competencia</h3></div><div className="text-right bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100"><p className="text-[9px] font-black text-gray-400 uppercase tracking-wide">Radio</p><p className="text-xs font-black text-gray-900">500m</p></div></div>
        <div className="flex-1 flex flex-col gap-5 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 pb-28">
          <div className="w-full h-40 bg-white rounded-[32px] border border-gray-100 relative flex items-center justify-center shrink-0 overflow-hidden shadow-sm mx-auto shadow-[inset_0_0_40px_rgba(0,0,0,0.02)]"><div className="absolute w-[80%] h-[80%] border border-gray-100 rounded-full"></div><div className="absolute w-[50%] h-[50%] border border-gray-100 rounded-full"></div><div className="absolute w-[20%] h-[20%] border border-blue-100 rounded-full bg-blue-50/50"></div><div className="absolute w-full h-[1px] bg-gray-50"></div><div className="absolute h-full w-[1px] bg-gray-50"></div><div className="absolute w-4 h-4 bg-[#007AFF] rounded-full shadow-[0_0_0_4px_rgba(255,255,255,1),0_4px_12px_rgba(0,122,255,0.4)] z-20"></div>{RIVALS.map((rival, index) => { const angle = index * 72 * (Math.PI / 180); const distance = 25 + index * 10; const top = 50 + Math.sin(angle) * distance; const left = 50 + Math.cos(angle) * distance; return <div key={rival.id} className={`absolute rounded-full transition-all duration-300 z-10 cursor-pointer border-2 border-white shadow-sm ${rival.type === "HOT" ? "bg-[#FF9500]" : "bg-gray-400"} ${selectedRival === rival.id ? "w-6 h-6 z-30 ring-4 ring-blue-100 scale-110" : "w-3 h-3 hover:scale-150"}`} style={{ top: `${top}%`, left: `${left}%` }} onMouseEnter={() => setSelectedRival(rival.id)} onMouseLeave={() => setSelectedRival(null)} />; })}</div>
          <div className="space-y-3 px-1">{RIVALS.map((rival) => { const isSelected = selectedRival === rival.id; return (<div key={rival.id} onMouseEnter={() => setSelectedRival(rival.id)} onMouseLeave={() => setSelectedRival(null)} className={`flex gap-4 p-3 rounded-[24px] border transition-all duration-300 cursor-pointer group w-full ${isSelected ? "bg-white border-blue-500 shadow-[0_8px_30px_rgba(0,113,227,0.15)] scale-[1.00]" : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-md"}`}><div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 relative bg-gray-100 shadow-sm"><img src={rival.img} className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-110" alt="Propiedad" />{rival.type === "HOT" && (<div className="absolute top-1.5 right-1.5 bg-[#FF9500] text-white p-1 rounded-full shadow-lg border border-white z-10"><Zap size={10} fill="currentColor" /></div>)}</div><div className="flex-1 flex flex-col justify-center min-w-0 py-1"><h4 className={`text-xs font-bold truncate mb-0.5 ${isSelected ? "text-blue-600" : "text-gray-500"}`}>{rival.name}</h4><span className="text-xl font-black tracking-tight text-gray-900 mb-2 block truncate">{formatMoney(rival.price)}</span><div className="flex flex-wrap gap-2"><div className={`px-2 py-0.5 rounded-md flex items-center gap-1 border ${rival.days > 90 ? "bg-red-50 border-red-100 text-red-600" : "bg-green-50 border-green-100 text-green-700"}`}><Clock size={10} strokeWidth={2.5} /><span className="text-[10px] font-bold tracking-wide">{rival.days}d</span></div><div className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-gray-500 flex items-center gap-1"><Eye size={10} strokeWidth={2.5} /><span className="text-[10px] font-bold tracking-wide">{rival.visits}</span></div></div></div><div className="flex flex-col justify-center pr-1"><div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSelected ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-300"}`}><ArrowRight size={14} /></div></div></div>); })}</div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex gap-4 z-50 shadow-[0_-10px_40px_rgba(255,255,255,0.8)]"><button onClick={onNext} className="w-full bg-[#1d1d1f] hover:bg-black text-white rounded-2xl py-4 shadow-xl active:scale-[0.99] transition-all flex justify-between items-center px-8 h-16"><div className="flex flex-col items-start"><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Siguiente paso</span><span className="text-lg font-bold">Definir Estrategia</span></div><div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><TrendingUp size={20} className="text-white" /></div></button></div>
      </div>
    );
  };
  
const StepSuccess = ({ handleClose, formData }: any) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const lastSavedIdRef = useRef<string | null>(formData?.id ? String(formData.id) : null);
  const currentStatus = formData?.status;
  const isPendingPayment = currentStatus === "PENDIENTE_PAGO";
  const isAgency = formData.isAgencyContext;
  const isEditMode = formData.isEditMode || currentStatus === "PUBLICADO";
  const isDirectSave = isAgency || (isEditMode && !isPendingPayment);
  const rawPrice = formData.price ? parseInt(formData.price.toString().replace(/\D/g, "")) : 0;
  const visualPrice = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(rawPrice);
  const hasUserPhoto = formData.images && formData.images.length > 0;
  const previewImage = hasUserPhoto ? formData.images[0] : "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80";

  const handleProcess = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    try {
      let targetStatus = formData.status;
      if (isDirectSave) { if (!targetStatus) targetStatus = "PUBLICADO"; } else { targetStatus = "PENDIENTE_PAGO"; }
      
      // ✅ AÑADIMOS CAMPOS B2B AL GUARDAR
      const cleanPayload = {
        ...formData,
        id: lastSavedIdRef.current || formData?.id || undefined,
        status: targetStatus,
        rooms: Number(formData.rooms || 0),
        baths: Number(formData.baths || 0),
        mBuilt: Number(formData.mBuilt || 0),
        price: formData.price,
        coordinates: formData.coordinates || [-3.6883, 40.4280],
        
        // CAMPOS AGENCIA B2B
        mandateType: formData.mandateType,
        commissionPct: Number(formData.commissionPct),
        sharePct: Number(formData.sharePct),
        shareVisibility: formData.shareVisibility,
        
        // EXTRAS
        videoUrl: formData.videoUrl,
        tourUrl: formData.tourUrl,
        openHouse: formData.openHouse
      };

      const response = await savePropertyAction(cleanPayload);
      if (response.success && response.property) {
        const serverProp = response.property;
        lastSavedIdRef.current = String(serverProp.id);
        
        if (isDirectSave) {
             const mapFormat = { ...serverProp, coordinates: [serverProp.longitude, serverProp.latitude], user: serverProp.user, img: serverProp.mainImage || (serverProp.images?.[0]?.url), price: new Intl.NumberFormat("es-ES").format(serverProp.price || 0), selectedServices: serverProp.selectedServices };
             if (typeof window !== "undefined") {
                const eventName = isEditMode ? "update-property-signal" : "add-property-signal";
                window.dispatchEvent(new CustomEvent(eventName, { detail: isEditMode ? { id: mapFormat.id, updates: mapFormat } : mapFormat }));
                window.dispatchEvent(new CustomEvent("reload-profile-assets"));
                window.dispatchEvent(new CustomEvent("force-map-refresh"));
             }
             handleClose(mapFormat);
             setIsPublishing(false);
        } else {
             // Lógica de pago particular...
             alert("Redirigiendo a pago...");
        }
      } else {
        alert("Error: " + response.error);
        setIsPublishing(false);
      }
    } catch (err) { console.error(err); alert("Error de conexión"); setIsPublishing(false); }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center animate-fade-in px-4 relative overflow-hidden">
      <div className="mb-8 relative"><div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(34,197,94,0.4)] animate-bounce-small z-10 relative"><CheckCircle2 size={48} className="text-white" strokeWidth={3} /></div><div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 duration-[2000ms]" /></div>
      <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight text-center">{isEditMode ? "¡Cambios Guardados!" : "¡Casi Listo!"}</h2>
      <p className="text-gray-500 mb-10 text-center font-medium max-w-sm text-lg">{isEditMode ? "Tus cambios se han actualizado." : "Publicando propiedad..."}</p>
      <div className="w-full max-w-xs bg-white rounded-[24px] border border-gray-100 shadow-xl p-4 mb-10 transform rotate-1 hover:rotate-0 transition-transform duration-500">
          <div className="aspect-video bg-gray-100 rounded-xl mb-4 relative overflow-hidden group"><img src={previewImage} className="absolute inset-0 w-full h-full object-cover" alt="Preview" /><div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm">{isEditMode ? "ACTUALIZADO" : "NUEVO"}</div></div>
          <div className="px-2 pb-2"><h3 className="text-sm font-black text-gray-900 line-clamp-1">{formData.title || "Propiedad"}</h3><p className="text-xs text-gray-500 font-medium mb-3 line-clamp-1">{formData.address}</p><div className="flex items-center justify-between border-t border-gray-50 pt-3"><span className="text-lg font-black text-gray-900">{visualPrice}€</span><span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase">{formData.type}</span></div></div>
      </div>
      <button onClick={handleProcess} disabled={isPublishing} className="w-full max-w-md bg-[#1d1d1f] hover:bg-black text-white rounded-2xl py-4 px-8 shadow-xl active:scale-[0.98] transition-all flex justify-between items-center group cursor-pointer">
        <div className="flex flex-col items-start"><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-300 transition-colors">{isDirectSave ? "PROCESO COMPLETADO" : "LANZAMIENTO"}</span><span className="text-lg font-bold">{isPublishing ? "Procesando..." : (isDirectSave ? "Guardar y Salir" : "Pagar y Publicar")}</span></div>
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">{isDirectSave ? <CheckCircle2 size={20} className="text-white"/> : <ArrowRight size={20} className="text-white"/>}</div>
      </button>
    </div>
  );
};