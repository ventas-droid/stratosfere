// EN app/components/alive-map/property-tiers.ts

import { CORPORATE_BLUE, NEON_GLOW } from './data';

// --- DEFINICIÓN DE UMBRALES DE CLASIFICACIÓN (TIER) ---
// Estos valores definen el color y la categoría de la propiedad basándose en su precio.
// Los valores son ejemplares y deben ajustarse a la realidad del mercado.

export const TIER_THRESHOLDS = {
    HIGH_CLASS: 800000,   // Propiedad de 800.000€ o más
    PREMIUM: 400000,      // Propiedad entre 400.000€ y 799.999€
    SMART: 0              // Propiedad hasta 399.999€
};

export const TIER_CONFIG = {
    HIGH_CLASS: {
        name: 'HIGH CLASS',
        color: '#FFD700', // Oro (Ejemplo)
        glow: `0 0 10px #FFD700`,
    },
    PREMIUM: {
        name: 'PREMIUM',
        color: CORPORATE_BLUE, // Azul Corporativo
        glow: NEON_GLOW,
    },
    SMART: {
        name: 'SMART',
        color: '#00BFFF', // Azul Cielo (Ejemplo)
        glow: `0 0 8px #00BFFF`,
    },
    DEFAULT: {
        name: 'N/A',
        color: '#CCCCCC', // Gris Neutro
        glow: 'none',
    },
};

/**
 * Función para asignar la categoría (TIER) de color basada en el precio.
 * @param price - El precio de venta ingresado.
 * @returns La clave de la categoría (e.g., 'HIGH_CLASS', 'PREMIUM').
 */
export const getPropertyTier = (price: number): keyof typeof TIER_CONFIG => {
    if (price >= TIER_THRESHOLDS.HIGH_CLASS) {
        return 'HIGH_CLASS';
    }
    if (price >= TIER_THRESHOLDS.PREMIUM) {
        return 'PREMIUM';
    }
    if (price >= TIER_THRESHOLDS.SMART) {
        return 'SMART';
    }
    return 'DEFAULT';
};

