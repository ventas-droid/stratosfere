// app/components/alive-map/stratos-db.ts

// 📸 GALERÍA 4K TÁCTICA
export const IMAGES = {
    PENTHOUSE: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    VILLA:     "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80",
    MODERN:    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    OFFICE:    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    LAND:      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    LOFT:      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    INDUSTRIAL:"https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
};

// 🗄️ RED NACIONAL DE ACTIVOS
export const STRATOS_PROPERTIES = [
    // --- MADRID ---
    {
        id: 101, type: "Ático", title: "Penthouse Salamanca Royal", price: 5200000, mBuilt: 450,
        rooms: 4, baths: 4, coordinates: [-3.6883, 40.4280], location: "MADRID - SALAMANCA",
        images: [IMAGES.PENTHOUSE], specs: { pool: true, terrace: true, elevator: true, security: true },
        role: "PREMIUM"
    },
    {
        id: 102, type: "Oficina", title: "Torre Azca Corporate", price: 2500000, mBuilt: 500,
        rooms: 0, baths: 4, coordinates: [-3.6930, 40.4500], location: "MADRID - AZCA",
        images: [IMAGES.OFFICE], specs: { elevator: true, garage: true }, role: "CORPORATE"
    },

    // --- ALICANTE ---
    {
        id: 301, type: "Piso", title: "Explanada Sea View", price: 680000, mBuilt: 180,
        rooms: 4, baths: 3, coordinates: [-0.4815, 38.3430], location: "ALICANTE CENTRO",
        images: [IMAGES.MODERN], specs: { elevator: true, terrace: true }, role: "EXCLUSIVO"
    },
    {
        id: 302, type: "Villa", title: "Chalet Cabo Huertas", price: 2100000, mBuilt: 450,
        rooms: 5, baths: 4, coordinates: [-0.4300, 38.3550], location: "ALICANTE - CABO",
        images: [IMAGES.VILLA], specs: { pool: true, garden: true }, role: "PREMIUM"
    },

    // --- MARBELLA ---
    {
        id: 201, type: "Villa", title: "Villa Sierra Blanca", price: 15900000, mBuilt: 2000,
        rooms: 10, baths: 12, coordinates: [-4.9100, 36.5300], location: "MARBELLA",
        images: [IMAGES.VILLA], specs: { pool: true, security: true }, role: "LEYENDA"
    },

    // --- TOLEDO (La prueba de fuego) ---
    {
        id: 401, type: "Casa", title: "Casona Histórica Toledo", price: 890000, mBuilt: 350,
        rooms: 6, baths: 3, coordinates: [-4.0240, 39.8581], location: "TOLEDO CASCO",
        images: [IMAGES.MODERN], specs: { garden: true }, role: "HISTÓRICO"
    },
    {
        id: 402, type: "Finca", title: "Cigarral Vistas Tajo", price: 1250000, mBuilt: 600,
        rooms: 8, baths: 6, coordinates: [-4.0400, 39.8450], location: "TOLEDO CIGARRALES",
        images: [IMAGES.VILLA], specs: { pool: true, garden: true }, role: "EXCLUSIVO"
    },

    // --- TOMELLOSO ---
    {
        id: 501, type: "Nave", title: "Bodega Industrial", price: 450000, mBuilt: 1200,
        rooms: 2, baths: 2, coordinates: [-3.0200, 39.1570], location: "TOMELLOSO",
        images: [IMAGES.INDUSTRIAL], specs: { industrial: true }, role: "INVERSIÓN"
    }
];