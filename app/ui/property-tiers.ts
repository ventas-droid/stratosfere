// EN app/ui/property-tiers.ts

// 1. DEFINIMOS LOS COLORES AQUÍ MISMO (Sin importaciones rotas)
const CORPORATE_BLUE = '#0052CC';
const NEON_GLOW = '0 0 10px #0052CC';

// 2. RESTO DE LA LÓGICA
export const TIER_THRESHOLDS = {
    HIGH_CLASS: 800000,
    PREMIUM: 400000,
    SMART: 0
};

export const TIER_CONFIG = {
    HIGH_CLASS: {
        name: 'HIGH CLASS',
        color: '#FFD700',
        glow: `0 0 10px #FFD700`,
    },
    PREMIUM: {
        name: 'PREMIUM',
        color: CORPORATE_BLUE,
        glow: NEON_GLOW,
    },
    SMART: {
        name: 'SMART',
        color: '#00BFFF',
        glow: `0 0 8px #00BFFF`,
    },
    DEFAULT: {
        name: 'N/A',
        color: '#CCCCCC',
        glow: 'none',
    },
};

export const getPropertyTier = (price: number): keyof typeof TIER_CONFIG => {
    if (price >= TIER_THRESHOLDS.HIGH_CLASS) return 'HIGH_CLASS';
    if (price >= TIER_THRESHOLDS.PREMIUM) return 'PREMIUM';
    if (price >= TIER_THRESHOLDS.SMART) return 'SMART';
    return 'DEFAULT';
};