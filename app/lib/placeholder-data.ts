// Colores y Constantes
export const CORPORATE_BLUE = "#1d4ed8"; 
export const NEON_GLOW = "0 0 20px rgba(37, 99, 235, 0.5)"; 
export const TEXT_COLOR = "#d4d4d8"; 
export const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';

export const TIER_COLORS: any = {
    SMART: { hex: "#10b981", glow: "0 0 15px rgba(16, 185, 129, 0.8)" },   
    PREMIUM: { hex: "#1d4ed8", glow: "0 0 20px rgba(37, 99, 235, 0.8)" }, 
    HIGH_CLASS: { hex: "#d946ef", glow: "0 0 20px rgba(217, 70, 239, 0.8)" } 
};

export const LUXURY_IMAGES = [
    "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

export const TRANSLATIONS: any = {
  ES: {
    gatekeeper: { btn: "ACCESO CLIENTE", status: "ENLACE SEGURO", access: "BIENVENIDO" },
    searchPlaceholder: "Ej: 'Ático en Madrid menos de 2M'...",
    vault: { title: "FAVORITOS", totalValue: "VALOR CARTERA", items: "PROPIEDADES", empty: "SIN FAVORITOS", view: "VER", delete: "ELIMINAR" },
    panel: { details: "DETALLES", contact: "+ INFO", expand: "EXPANDIR" }, 
    specs: { bed: "hab", bath: "baños", sqm: "m²" },
    status: { online: "SISTEMA ONLINE", lang: "IDIOMA", audio: "SONIDO", clear: "BORRAR TODO" },
    dock: { map: "Mapa", chat: "Concierge", profile: "Perfil", vault: "Favs" },
    profile: { title: "PERFIL CLIENTE", rank: "PREMIUM", missions: "VISITAS", conquests: "ADQUISICIONES", tacticalProfile: "Actividad", logout: "CERRAR SESIÓN" },
    chat: { placeholder: "Escriba mensaje a su agente...", agent: "Agente Sarah", status: "En línea", system: "Concierge Activo", received: "Recibido" },
    commandPanel: { gallery: "MULTIMEDIA", description: "DATOS CLAVE", finance: "VALORACIÓN", roi: "RENTABILIDAD", monthly: "CUOTA HIPOTECA", down: "ENTRADA", score: "PUNTUACIÓN ACTIVO", contact: "CONTACTAR AGENTE", expand: "AMPLIAR VISTA" },
    filters: { title: "FILTROS TÁCTICOS", price: "PRECIO MAX", area: "AREA MIN", type: "TIPO", clear: "LIMPIAR" },
    notifications: { added: "Propiedad añadida a Favoritos", removed: "Propiedad eliminada", filter: "Filtros aplicados" }
  },
  EN: {
    gatekeeper: { btn: "CLIENT ACCESS", status: "SECURE LINK", access: "WELCOME" },
    searchPlaceholder: "Ex: 'Penthouse in Madrid under 2M'...",
    vault: { title: "FAVORITES", totalValue: "PORTFOLIO VALUE", items: "PROPERTIES", empty: "NO FAVORITES", view: "VIEW", delete: "REMOVE" },
    panel: { details: "DETAILS", contact: "+ INFO", expand: "EXPAND" },
    specs: { bed: "bed", bath: "bath", sqm: "sqm" },
    status: { online: "SYSTEM ONLINE", lang: "LANGUAGE", audio: "AUDIO", clear: "CLEAR NOTIFICATIONS" },
    dock: { map: "Map", chat: "Concierge", profile: "Profile", vault: "Favs" },
    profile: { title: "CLIENT PROFILE", rank: "PREMIUM", missions: "VISITS", conquests: "ACQUISITIONS", tacticalProfile: "Activity", logout: "LOGOUT" },
    chat: { placeholder: "Message your agent...", agent: "Agent Sarah", status: "Online", system: "Concierge Active", received: "Received" },
    commandPanel: { gallery: "MEDIA", description: "INTEL", finance: "VALUATION", roi: "YIELD EST.", monthly: "MONTHLY", down: "DOWN PMT", score: "ASSET SCORE", contact: "CONTACT AGENT", expand: "EXPAND VIEW" },
    filters: { title: "FILTERS", price: "MAX PRICE", area: "MIN AREA", type: "TYPE", clear: "RESET" },
    notifications: { added: "Property added to Favorites", removed: "Property removed from Favorites", filter: "Search filters updated" }
  }
};

export const generarGeoJSON = (cantidad: number) => {
  const features = [];
  const CIUDADES = [{lat: 40.4168, lng: -3.7038}, {lat: 41.40, lng: 2.15}, {lat: 39.47, lng: -0.37}];
  for (let i = 0; i < cantidad; i++) {
    const ciudad = CIUDADES[Math.floor(Math.random() * CIUDADES.length)];
    const r = 0.04 * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const lat = ciudad.lat + r * Math.sin(theta);
    const lng = ciudad.lng + r * Math.cos(theta);
    const priceValue = Math.floor(Math.random() * 1500000 + 150000); 
    let tier = "PREMIUM";
    if (priceValue < 300000) tier = "SMART";
    else if (priceValue > 600000) tier = "HIGH_CLASS";
    const colorCore = TIER_COLORS[tier].hex;
    const mainImgIdx = i % LUXURY_IMAGES.length;
    const mainImg = LUXURY_IMAGES[mainImgIdx];
    const gallery = JSON.stringify([mainImg, LUXURY_IMAGES[(mainImgIdx + 1) % LUXURY_IMAGES.length]]);

    features.push({
      type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: { 
          id: `SEC-${i}`, title: tier, tier, priceValue, precio: (priceValue/1000).toFixed(0)+"k €", 
          area: Math.floor(Math.random()*350+50), category: Math.random()>0.4?'PISO':'CASA', 
          rooms: Math.floor(Math.random()*5)+1, baths: Math.floor(Math.random()*3)+1,
          photoUrl: mainImg, gallery: gallery, colorCore, lat, lng, 
          assetScore: Math.floor(Math.random()*30+70) 
      }
    });
  }
  return { type: 'FeatureCollection', features };
};
export const DATA_PUNTOS = generarGeoJSON(5000);


