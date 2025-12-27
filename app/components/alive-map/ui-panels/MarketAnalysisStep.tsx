import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Clock, Search, ArrowRight, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';

// ==================================================================================
// 🧠 1. BASE DE DATOS MASIVA (PRECIOS REFERENCIA 2025)
// ==================================================================================
const REAL_MARKET_DB: Record<string, number> = {
    // --- TOP TIER / LUXURY ---
    'IBIZA': 9200, 'FORMENTERA': 8500, 'SAN SEBASTIÁN': 6600, 'MARBELLA': 6100,
    'MADRID': 5950, 'BARCELONA': 5500, 'SOTOGRANDE': 4800, 'SITGES': 4600,
    'POZUELO': 5300, 'MAJADAHONDA': 4900, 'LAS ROZAS': 4300, 'SANT CUGAT': 4700,
    'CALVIÀ': 5100, 'ANDRATX': 6800, 'BENAHAVÍS': 5200,

    // --- COSTAS & TURISMO ---
    'PALMA': 4200, 'MÁLAGA': 3500, 'VALENCIA': 2950, 'ALICANTE': 2700,
    'BENIDORM': 3100, 'JÁVEA': 3300, 'DENIA': 2800, 'ALTEA': 3000, 'CALPE': 2900,
    'SANT JOAN': 2300, 'CAMPELLO': 2500, 'TORREVIEJA': 2100, 'ORIHUELA': 2400,
    'ESTEPONA': 3900, 'FUENGIROLA': 3600, 'NERJA': 3400, 'CADIZ': 2800,
    'CANARIAS': 2600, 'LAS PALMAS': 2500, 'SANTA CRUZ': 2400, 'ADEJE': 3800,

    // --- NORTE ---
    'BILBAO': 3700, 'VITORIA': 3100, 'SANTANDER': 3000, 'PAMPLONA': 2800,
    'A CORUÑA': 2700, 'VIGO': 2600, 'SANTIAGO': 2300, 'GIJÓN': 2200, 'OVIEDO': 2000,

    // --- CENTRO & RESTO DE CAPITALES ---
    'ZARAGOZA': 2100, 'SEVILLA': 2600, 'GRANADA': 2300, 'CÓRDOBA': 1900,
    'VALLADOLID': 2000, 'SALAMANCA': 2400, 'BURGOS': 2100, 'LEÓN': 1700,
    'TOLEDO': 1800, 'GUADALAJARA': 2100, 'SEGOVIA': 2000,
    'MURCIA': 1800, 'CARTAGENA': 1600, 'ALMERÍA': 1700, 'HUELVA': 1600,
    'CASTELLÓN': 1500, 'TARRAGONA': 2300, 'GIRONA': 2700, 'LLEIDA': 1400,
    'BADAJOZ': 1500, 'CÁCERES': 1600, 'CIUDAD REAL': 1200, 'ALBACETE': 1700,
    'LOGROÑO': 1900, 'HUESCA': 1700, 'TERUEL': 1300, 'SORIA': 1400,
    'ZAMORA': 1300, 'PALENCIA': 1500, 'ÁVILA': 1400, 'CUENCA': 1300,
    'JAÉN': 1300, 'CEUTA': 1900, 'MELILLA': 1800
};
const NATIONAL_AVG = 2150; 

// --- 8. ANÁLISIS DE MERCADO (INTELIGENCIA ARTIFICIAL) ---
const MarketAnalysisStep = ({ formData, onNext }: any) => {
  const [analyzing, setAnalyzing] = useState(true);

  // ==================================================================================
  // 1. LÓGICA DE NEGOCIO (TU BASE DE DATOS ORIGINAL)
  // ==================================================================================
  const { 
    pricePerM2, marketRef, detectedZone, percentDiff, 
    numPercent, isExpensive, estimatedMonths, marketPosition 
  } = useMemo(() => {
    const safePrice = formData?.price ? parseFloat(formData.price.toString().replace(/\D/g, '')) : 0;
    const safeM2 = formData?.mBuilt ? parseFloat(formData.mBuilt.toString().replace(/\D/g, '')) : 100;
    const currentPriceM2 = safeM2 > 0 ? Math.round(safePrice / safeM2) : 0;

    let zoneName = "TU ZONA";
    let refPrice = typeof NATIONAL_AVG !== 'undefined' ? NATIONAL_AVG : 2150; 
    
    const searchAddress = (formData?.address || formData?.location || '').toUpperCase();
    
    // Conexión con tu DB Real
    if (searchAddress && typeof REAL_MARKET_DB !== 'undefined') {
        const matches = Object.keys(REAL_MARKET_DB).filter(city => searchAddress.includes(city));
        if (matches.length > 0) {
             const bestMatch = matches[matches.length - 1]; 
             zoneName = bestMatch;
             refPrice = REAL_MARKET_DB[bestMatch];
        }
    }

    const diff = currentPriceM2 - refPrice; 
    const pDiff = refPrice > 0 ? ((diff / refPrice) * 100).toFixed(1) : "0";
    const nPercent = parseFloat(pDiff);
    const expensive = diff > 0;

    let months = 4;
    if (nPercent > 20) months = 12;
    else if (nPercent > 10) months = 8;
    else if (nPercent > 0) months = 6;
    else if (nPercent > -10) months = 3;
    else months = 1;

    let visualPos = (currentPriceM2 / (refPrice * 2)) * 100;
    visualPos = Math.min(Math.max(visualPos, 5), 95);

    return {
        pricePerM2: currentPriceM2, marketRef: refPrice, detectedZone: zoneName,
        percentDiff: pDiff, numPercent: nPercent, isExpensive: expensive,
        estimatedMonths: months, marketPosition: visualPos
    };
  }, [formData]);

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // ==================================================================================
  // ESTILOS: Arreglado para que ocupe todo el alto (h-full) y no sea una "Nano Card"
  // ==================================================================================
  const cardBaseClass = "relative w-full h-full flex flex-col bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/50";

  // ----------------------------------------------------------------------------------
  // VISTA DE CARGA (SPINNER)
  // ----------------------------------------------------------------------------------
  if (analyzing) {
    return (
      <div className={cardBaseClass}>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in w-full">
            <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-black animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="text-gray-900 animate-pulse" size={20} />
                </div>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Analizando Mercado</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100/50 px-3 py-1 rounded-full">
                <MapPin size={10} /> {detectedZone}
            </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------------
  // VISTA DE RESULTADOS (TU DISEÑO ORIGINAL)
  // ----------------------------------------------------------------------------------
  return (
    <div className={cardBaseClass}>
      {/* HEADER */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100/50 flex justify-between items-center shrink-0">
        <div>
            <div className="flex items-center gap-1.5 opacity-60">
                <Activity size={12} className="text-black" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Stratos AI</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mt-1">Valoración</h3>
        </div>
        <div className="text-right">
            <span className="text-[9px] font-bold text-gray-400 block uppercase">Ref. Zona</span>
            <span className="text-sm font-bold text-gray-900">{marketRef.toLocaleString()} €</span>
        </div>
      </div>

      {/* CONTENIDO SCROLLABLE */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar w-full">
          {/* GRÁFICO PRECIO */}
          <div className="bg-white/60 rounded-xl p-4 border border-white shadow-sm mb-5 relative">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Tu Precio</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-gray-900">{pricePerM2.toLocaleString()}</span>
                            <span className="text-xs font-bold text-gray-400">€/m²</span>
                        </div>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold border ${isExpensive ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {numPercent > 0 ? '+' : ''}{percentDiff}% vs Media
                    </div>
                </div>

                {/* BARRA VISUAL */}
                <div className="relative h-8 mb-2 w-full">
                    <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-200 rounded-full -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-[50%] -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full border border-white z-10"></div>
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all duration-1000"
                        style={{ left: `${marketPosition}%` }}
                    >
                        <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm -translate-x-1/2 ${isExpensive ? 'bg-gray-900' : 'bg-emerald-500'}`}></div>
                    </div>
                </div>
                <div className="text-[11px] leading-relaxed text-gray-600 font-medium">
                     {isExpensive 
                        ? <span>Estás <strong className="text-gray-900">por encima</strong> de mercado.</span>
                        : <span>Estás <strong className="text-emerald-700">por debajo</strong> del mercado.</span>
                    }
                </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="p-3 rounded-xl bg-white/50 border border-white shadow-sm">
                 <div className="flex items-center gap-1.5 mb-1 text-gray-400">
                    <Clock size={12} /> <span className="text-[9px] font-bold uppercase">Tiempo</span>
                 </div>
                 <div className="text-lg font-black text-gray-900">{estimatedMonths} <span className="text-[10px] font-medium text-gray-500">Meses</span></div>
              </div>
              <div className="p-3 rounded-xl bg-white/50 border border-white shadow-sm">
                 <div className="flex items-center gap-1.5 mb-1 text-gray-400">
                    <Search size={12} /> <span className="text-[9px] font-bold uppercase">Demanda</span>
                 </div>
                 <div className="text-lg font-black text-gray-900">Alta</div>
              </div>
          </div>
      </div>

      {/* FOOTER */}
      <div className="p-5 pt-3 bg-white/40 border-t border-white shrink-0 mt-auto w-full">
        <button 
            onClick={onNext}
            className="w-full bg-gray-900 hover:bg-black text-white rounded-xl py-3.5 px-4 shadow-lg flex justify-between items-center transition-all active:scale-95"
        >
            <span className="text-xs font-bold ml-1">Siguiente Paso</span>
            <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};