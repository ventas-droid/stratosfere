// @ts-nocheck
import { 
  Camera, Box, Radar, LayoutGrid, Sun, Square, 
  ArrowRight, Globe, Share2, Search, User, MessageCircle, Smartphone, Crosshair,
  BarChart3, Activity, Newspaper, Shield, Zap, Lock, Sparkles,
  Maximize2, Home, MapPin, Bed, Eye, Crown
} from 'lucide-react';

// =============================================================================
// CATÁLOGO ESTRATÉGICO: "DEMAND CONTROL" (BAIT & HOOK)
// =============================================================================

export const MARKET_CATALOG = [
    // --- PESTAÑA 1: ONLINE (ACCIONES DIGITALES) ---
    // TRAMO 1 (Básicos a 9.90€)
    { id: 101, category: 'ONLINE', name: "FOTOGRAFÍA HDR", marketValue: 350, price: 9.90, icon: Camera, tier: 'ESSENTIAL', desc: "Exijo calidad de revista." },
    { id: 105, category: 'ONLINE', name: "PLANO TÉCNICO", marketValue: 120, price: 9.90, icon: Square, tier: 'ESSENTIAL', desc: "Exijo levantamiento acotado." },
    { id: 106, category: 'ONLINE', name: "CERTIFICADO ECO", marketValue: 150, price: 9.90, icon: Activity, tier: 'ESSENTIAL', desc: "Exijo tramitación administrativa." },
    { id: 107, category: 'ONLINE', name: "NOTA REGISTRAL", marketValue: 40, price: 9.90, icon: Newspaper, tier: 'ESSENTIAL', desc: "Exijo transparencia legal." },
    
    // TRAMO 2 (Avanzados a 19.90€ - 29.90€)
    { id: 102, category: 'ONLINE', name: "TOUR MATTERPORT", marketValue: 450, price: 19.90, icon: Box, tier: 'PREMIUM', desc: "Exijo filtrado de curiosos." },
    { id: 103, category: 'ONLINE', name: "VIDEO CINEMÁTICO", marketValue: 550, price: 19.90, icon: Radar, tier: 'PREMIUM', desc: "Exijo narrativa visual." },
    { id: 110, category: 'ONLINE', name: "POSICIONAMIENTO TOP", marketValue: 200, price: 19.90, icon: ArrowRight, tier: 'ESSENTIAL', desc: "Exijo estar el primero." },
    { id: 109, category: 'ONLINE', name: "DIFUSIÓN GLOBAL", marketValue: 300, price: 19.90, icon: Globe, tier: 'PREMIUM', desc: "Exijo mercado internacional." },
    { id: 104, category: 'ONLINE', name: "HOME STAGING AI", marketValue: 250, price: 19.90, icon: LayoutGrid, tier: 'SMART', desc: "Exijo decoración virtual." },
    
    // TRAMO 3 (Elite a 39.90€+)
    { id: 111, category: 'ONLINE', name: "CAMPAÑA PAID SOCIAL", marketValue: 500, price: 39.90, icon: Share2, tier: 'PREMIUM', desc: "Exijo tráfico de pago segmentado." },
    { id: 115, category: 'ONLINE', name: "WEB EXCLUSIVA", marketValue: 900, price: 49.90, icon: Smartphone, tier: 'ELITE', desc: "Exijo landing page dedicada." },
    { id: 112, category: 'ONLINE', name: "RED DE INVERSORES", marketValue: 1500, price: 59.90, icon: User, tier: 'ELITE', desc: "Exijo acceso a capital privado." },
    { id: 113, category: 'ONLINE', name: "RETARGETING ACTIVO", marketValue: 450, price: 35.90, icon: Search, tier: 'SMART', desc: "Exijo perseguir visitas." },
    { id: 114, category: 'ONLINE', name: "EMAIL MARKETING VIP", marketValue: 300, price: 19.90, icon: MessageCircle, tier: 'SMART', desc: "Exijo newsletter dedicada." },
    { id: 108, category: 'ONLINE', name: "VALORACIÓN IA", marketValue: 100, price: 4.90, icon: BarChart3, tier: 'SMART', desc: "Exijo análisis de mercado." },
    { id: 117, category: 'ONLINE', name: "ASISTENTE LEGAL", marketValue: 600, price: 14.90, icon: Shield, tier: 'PREMIUM', desc: "Exijo soporte jurídico." },
    { id: 118, category: 'ONLINE', name: "CONTRATO DIGITAL", marketValue: 250, price: 19.90, icon: Zap, tier: 'SMART', desc: "Exijo firma biométrica." },
    { id: 119, category: 'ONLINE', name: "ESCROW SEGURO", marketValue: 500, price: 29.90, icon: Lock, tier: 'ELITE', desc: "Exijo custodia notarial." },
    { id: 120, category: 'ONLINE', name: "BIG DATA REPORT", marketValue: 350, price: 19.90, icon: Sparkles, tier: 'PREMIUM', desc: "Exijo datos de demanda." },
    { id: 121, category: 'ONLINE', name: "FILTRO DE COMPRADOR", marketValue: 250, price: 14.90, icon: Crosshair, tier: 'ESSENTIAL', desc: "Exijo cualificación financiera." },
    { id: 116, category: 'ONLINE', name: "RENDER ARQUITECTÓNICO", marketValue: 600, price: 39.90, icon: Sun, tier: 'ELITE', desc: "Exijo proyección de reforma." },

    // --- PESTAÑA 2: OFFLINE (ACCIONES FÍSICAS) ---
    { id: 201, category: 'OFFLINE', name: "LONA FACHADA XL", marketValue: 800, price: 49.90, icon: Maximize2, tier: 'PREMIUM', desc: "Exijo visibilidad en calle." },
    { id: 203, category: 'OFFLINE', name: "BUZONEO PREMIUM", marketValue: 400, price: 29.90, icon: MapPin, tier: 'ESSENTIAL', desc: "Exijo dominio del barrio." },
    { id: 204, category: 'OFFLINE', name: "REVISTA LUXURY", marketValue: 1200, price: 59.90, icon: Newspaper, tier: 'ELITE', desc: "Exijo prensa especializada." },
    { id: 202, category: 'OFFLINE', name: "OPEN HOUSE VIP", marketValue: 1800, price: 99.90, icon: Home, tier: 'ELITE', desc: "Exijo evento de puertas abiertas." },
    { id: 205, category: 'OFFLINE', name: "HOME STAGING FÍSICO", marketValue: 3500, price: 199.90, icon: Bed, tier: 'ELITE', desc: "Exijo muebles de diseño reales." },

    // --- PESTAÑA 3: PACKS (ACCESOS DIRECTOS) ---
    { id: 301, category: 'PACK', name: "KIT ESENCIAL", marketValue: 600, price: 29.90, icon: Zap, tier: 'ESSENTIAL', desc: "Foto + Plano + Certificado." },
    { id: 302, category: 'PACK', name: "KIT VISIBILIDAD", marketValue: 1500, price: 69.90, icon: Eye, desc: "Tour 3D + Portales Top + Redes." },
    { id: 303, category: 'PACK', name: "KIT DOMINATION", marketValue: 4000, price: 149.90, icon: Crown, desc: "Todo incluido + Abogado + Open House." }
];

