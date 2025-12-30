// app/components/alive-map/stratos-db.ts

// 📸 GALERÍA 4K CENTRALIZADA (RECURSOS TÁCTICOS)
export const IMAGES = {
    PENTHOUSE: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    VILLA:     "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80",
    MODERN:    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    OFFICE:    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    LAND:      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    LOFT:      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    INDUSTRIAL:"https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
};

// 🗄️ BASE DE DATOS MAESTRA (MADRID - MARBELLA - ALICANTE)
export const STRATOS_PROPERTIES = [
    
    // ========================================================================
    // 📍 ZONA 1: MADRID (Cuartel General)
    // ========================================================================
    {
        id: 101,
        type: "Ático", 
        title: "Penthouse Salamanca Royal",
        price: 5200000,
        mBuilt: 450,
        rooms: 4, baths: 4,
        coordinates: [-3.6883, 40.4280], // Serrano
        location: "BARRIO SALAMANCA",
        images: [IMAGES.PENTHOUSE],
        description: "Ático triplex con piscina privada y vistas al skyline.",
        specs: { pool: true, terrace: true, elevator: true, security: true },
        role: "PREMIUM"
    },
    {
        id: 102,
        type: "Villa",
        title: "Mansión La Moraleja",
        price: 8500000,
        mBuilt: 1200,
        rooms: 8, baths: 9,
        coordinates: [-3.6500, 40.5100], // La Moraleja
        location: "LA MORALEJA",
        images: [IMAGES.VILLA],
        description: "Seguridad privada, búnker y helipuerto.",
        specs: { pool: true, garden: true, security: true, garage: true },
        role: "VIP CLASS"
    },
    {
        id: 103,
        type: "Oficina",
        title: "Torre Azca Corporate",
        price: 2500000,
        mBuilt: 500,
        rooms: 0, baths: 4,
        coordinates: [-3.6930, 40.4500], // Azca
        location: "CASTELLANA / AZCA",
        images: [IMAGES.OFFICE],
        description: "Planta completa en rascacielos financiero.",
        specs: { elevator: true, security: true, garage: true },
        role: "CORPORATE"
    },
    {
        id: 104,
        type: "Piso",
        title: "Apartamento Chamberí",
        price: 890000,
        mBuilt: 140,
        rooms: 3, baths: 2,
        coordinates: [-3.7000, 40.4350], // Chamberí
        location: "CHAMBERÍ",
        images: [IMAGES.MODERN],
        description: "Clásico renovado con techos altos.",
        specs: { elevator: true, terrace: false },
        role: "FAMILIAR"
    },
    {
        id: 105,
        type: "Suelo",
        title: "Terreno Urbanizable Valdebebas",
        price: 1200000,
        mBuilt: 3000, // Edificabilidad
        rooms: 0, baths: 0,
        coordinates: [-3.6200, 40.4800], // Valdebebas
        location: "VALDEBEBAS",
        images: [IMAGES.LAND],
        description: "Licencia directa para promoción residencial.",
        specs: { industrial: false },
        role: "DESARROLLO"
    },
    {
        id: 106,
        type: "Nave",
        title: "Centro Logístico Getafe",
        price: 650000,
        mBuilt: 1000,
        rooms: 0, baths: 2,
        coordinates: [-3.7200, 40.3000], // Getafe
        location: "GETAFE INDUSTRIAL",
        images: [IMAGES.INDUSTRIAL],
        description: "Nave con muelles de carga y acceso tráiler.",
        specs: { industrial: true, garage: true },
        role: "OPORTUNIDAD"
    },

    // ========================================================================
    // 📍 ZONA 2: MARBELLA (Lujo Costa)
    // ========================================================================
    {
        id: 201,
        type: "Villa",
        title: "Villa Sierra Blanca",
        price: 15900000,
        mBuilt: 2000,
        rooms: 10, baths: 12,
        coordinates: [-4.9100, 36.5300], // Sierra Blanca
        location: "MARBELLA - SIERRA BLANCA",
        images: [IMAGES.VILLA],
        description: "Vistas panorámicas al mar, spa y cine privado.",
        specs: { pool: true, garden: true, security: true, garage: true },
        role: "LEYENDA"
    },
    {
        id: 202,
        type: "Ático",
        title: "Puerto Banús Frontline",
        price: 3200000,
        mBuilt: 250,
        rooms: 3, baths: 3,
        coordinates: [-4.9500, 36.4850], // Puerto Banús
        location: "PUERTO BANÚS",
        images: [IMAGES.PENTHOUSE],
        description: "Primera línea de puerto. Amarre opcional.",
        specs: { terrace: true, elevator: true, security: true },
        role: "LUXURY"
    },
    {
        id: 203,
        type: "Suelo",
        title: "Parcela La Zagaleta",
        price: 4500000,
        mBuilt: 5000,
        rooms: 0, baths: 0,
        coordinates: [-5.0000, 36.5500], // La Zagaleta
        location: "LA ZAGALETA",
        images: [IMAGES.LAND],
        description: "La urbanización más exclusiva de Europa.",
        specs: { security: true, garden: true },
        role: "VIP CLASS"
    },
    {
        id: 204,
        type: "Piso",
        title: "Apartamento Golden Mile",
        price: 1100000,
        mBuilt: 160,
        rooms: 2, baths: 2,
        coordinates: [-4.9000, 36.5050], // Milla de Oro
        location: "GOLDEN MILE",
        images: [IMAGES.MODERN],
        description: "En urbanización con jardines tropicales.",
        specs: { pool: true, garden: true, garage: true },
        role: "PREMIUM"
    },

    // ========================================================================
    // 📍 ZONA 3: ALICANTE (Costa Blanca)
    // ========================================================================
    {
        id: 301,
        type: "Piso",
        title: "Explanada Sea View",
        price: 680000,
        mBuilt: 180,
        rooms: 4, baths: 3,
        coordinates: [-0.4815, 38.3430], // Alicante Puerto
        location: "ALICANTE CENTRO",
        images: [IMAGES.MODERN],
        description: "Primera línea con vistas al puerto deportivo.",
        specs: { elevator: true, terrace: true },
        role: "EXCLUSIVO"
    },
    {
        id: 302,
        type: "Villa",
        title: "Chalet Cabo de las Huertas",
        price: 2100000,
        mBuilt: 450,
        rooms: 5, baths: 4,
        coordinates: [-0.4300, 38.3550], // Cabo Huertas
        location: "CABO HUERTAS",
        images: [IMAGES.VILLA],
        description: "Acceso directo a calas privadas.",
        specs: { pool: true, garden: true, garage: true },
        role: "PREMIUM"
    },
    {
        id: 303,
        type: "Piso",
        title: "Playa San Juan Resort",
        price: 390000,
        mBuilt: 110,
        rooms: 2, baths: 2,
        coordinates: [-0.4100, 38.3700], // Playa San Juan
        location: "PLAYA SAN JUAN",
        images: [IMAGES.LOFT],
        description: "Residencial con pistas de pádel y piscina.",
        specs: { pool: true, garden: true, elevator: true, garage: true },
        role: "VACACIONAL"
    },
    {
        id: 304,
        type: "Nave",
        title: "Nave Industrial Elche Park",
        price: 420000,
        mBuilt: 800,
        rooms: 0, baths: 1,
        coordinates: [-0.6900, 38.2600], // Elche
        location: "ELCHE PARQUE EMPRESARIAL",
        images: [IMAGES.INDUSTRIAL],
        description: "Excelente ubicación logística.",
        specs: { industrial: true },
        role: "INVERSIÓN"
    },
    {
        id: 305,
        type: "Suelo",
        title: "Finca Rústica Altea",
        price: 550000,
        mBuilt: 10000, // m2 terreno
        rooms: 0, baths: 0,
        coordinates: [-0.0500, 38.6000], // Altea
        location: "ALTEA HILLS",
        images: [IMAGES.LAND],
        description: "Terreno con vistas al mar para proyecto singular.",
        specs: { garden: true },
        role: "DESARROLLO"
    },
    {
        id: 306,
        type: "Oficina",
        title: "Coworking Luceros",
        price: 180000,
        mBuilt: 90,
        rooms: 0, baths: 1,
        coordinates: [-0.4850, 38.3460], // Plaza Luceros
        location: "ALICANTE CENTRO",
        images: [IMAGES.OFFICE],
        description: "Oficina moderna en el corazón de la ciudad.",
        specs: { elevator: true },
        role: "OPORTUNIDAD"
    }
];