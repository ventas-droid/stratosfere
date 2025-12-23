// @ts-nocheck
// ARCHIVO: app/components/alive-map/ui-panels/smart-search.ts

// 1. IMPORTAMOS LA LEY
// ✅ CORRECCIÓN TÁCTICA: Entramos en la carpeta 'ui-panels' para encontrar el archivo
import { PROPERTY_TYPES, CATEGORY_MAP } from './ui-panels/property-types';

// 2. CONFIGURACIÓN VISUAL Y DE CONTEXTO
export const CONTEXT_CONFIG = {
  VIVIENDA: { 
    id: 'VIVIENDA', label: "Pisos y Casas", maxM2: 1000, step: 50, maxPrice: 5000000, 
    colors: { from: '#34d399', to: '#059669' } 
  },
  NEGOCIO: { 
    id: 'NEGOCIO', label: "Oficinas y Naves", maxM2: 2000, step: 50, maxPrice: 10000000, 
    colors: { from: '#60a5fa', to: '#2563eb' } 
  },
  TERRENO: { 
    id: 'TERRENO', label: "Fincas y Suelo", maxM2: 10000, step: 100, maxPrice: 20000000, 
    colors: { from: '#fbbf24', to: '#d97706' } 
  }
};

export const getSmartSurfaceQuery = (v) => v === 0 ? 0 : Math.floor(v * 0.90);

export const calculateScore = (price, m2) => {
  if (!price || !m2) return 'CONSULTAR';
  const ratio = price / m2;
  if (ratio < 2500) return 'OPORTUNIDAD';
  if (ratio < 6000) return 'MERCADO';
  return 'PREMIUM';
};

// ---------------------------------------------------------
// 🧠 3. OMNI PARSER V5 (CONECTADO AL DICCIONARIO REAL)
// ---------------------------------------------------------
export const parseOmniSearch = (text: string) => {
  if (!text) return { location: '', filters: {} };
  
  const query = text.toLowerCase();
  
  // A. DETECTAR PRECIO (Soporta "1.2M", "500k", "1.000.000")
  let maxPrice = null;
  const millionsMatch = query.match(/(\d+[.,]?\d*)\s*m([€]|\s|$)/); 
  const numberMatch = query.match(/(\d+[.,]?\d*)\s*k/) || query.match(/(\d{1,3}([.,]\d{3})+)/);

  if (millionsMatch) {
    maxPrice = parseFloat(millionsMatch[1].replace(',', '.')) * 1000000;
  } else if (numberMatch) {
    const raw = numberMatch[0].replace(/[kK]/g, '').replace(/\./g, '').replace(/,/g, '');
    let val = parseFloat(raw);
    if (query.includes('k')) val *= 1000; 
    maxPrice = val;
  }

  // B. DETECTAR SUPERFICIE
  let minM2 = 0;
  const m2Match = query.match(/(\d+)\s*(m2|mts|metro|met|m²)/);
  if (m2Match) minM2 = parseInt(m2Match[1]);

  // C. DETECTAR TIPO EXACTO (Usando el Diccionario importado)
  let specificType = null;
  let context = null;

  // Barrido de reconocimiento de patrones usando la LEY (property-types.ts)
  if (query.includes('piso')) specificType = PROPERTY_TYPES.PISO;
  else if (query.includes('atico') || query.includes('ático')) specificType = PROPERTY_TYPES.ATICO;
  else if (query.includes('duplex') || query.includes('dúplex')) specificType = PROPERTY_TYPES.DUPLEX;
  else if (query.includes('loft')) specificType = PROPERTY_TYPES.LOFT;
  else if (query.includes('estudio')) specificType = PROPERTY_TYPES.ESTUDIO;
  else if (query.includes('chalet')) specificType = PROPERTY_TYPES.CHALET;
  else if (query.includes('villa')) specificType = PROPERTY_TYPES.VILLA;
  else if (query.includes('bungalow')) specificType = PROPERTY_TYPES.BUNGALOW;
  else if (query.includes('oficina')) specificType = PROPERTY_TYPES.OFICINA;
  else if (query.includes('local')) specificType = PROPERTY_TYPES.LOCAL;
  else if (query.includes('nave')) specificType = PROPERTY_TYPES.NAVE;
  else if (query.includes('edificio')) specificType = PROPERTY_TYPES.EDIFICIO;
  else if (query.includes('solar') || query.includes('suelo')) specificType = PROPERTY_TYPES.SOLAR;
  else if (query.includes('finca')) specificType = PROPERTY_TYPES.FINCA;
  else if (query.includes('garage') || query.includes('garaje')) specificType = PROPERTY_TYPES.GARAGE;
  else if (query.includes('trastero')) specificType = PROPERTY_TYPES.TRASTERO;

  // D. DEDUCIR CONTEXTO (COLOR) AUTOMÁTICAMENTE
  if (specificType) {
      // Si detectamos el tipo, usamos el mapa de colores importado
      context = CATEGORY_MAP[specificType];
  } else {
      // Búsqueda genérica si no hay tipo específico
      if (query.match(/negocio|empresa/)) context = 'NEGOCIO';
      else if (query.match(/terreno|parcela/)) context = 'TERRENO';
      else if (query.match(/casa|hogar|vivienda/)) context = 'VIVIENDA';
  }

  // E. LIMPIEZA GEOGRÁFICA (Para que Mapbox entienda la dirección)
  let locationQuery = query
    .replace(/(\d+[.,]?\d*)\s*(m|k|€|eur|euro|euros)/g, '')
    .replace(/(\d{1,3}([.,]\d{3})+)/g, '')
    .replace(/(\d+)\s*(m2|mts|metro|met|m²)/g, '')
    .replace(/pisos?|casas?|aticos?|chalets?|villas?|bungalows?|trasteros?|garajes?|solares?|fincas?|naves?|locales?|oficinas?|de|en|por|menos|maximo/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { 
    location: locationQuery, 
    filters: { 
      priceMax: maxPrice, 
      m2Min: minM2, 
      context: context, 
      type: specificType 
    } 
  };
};


