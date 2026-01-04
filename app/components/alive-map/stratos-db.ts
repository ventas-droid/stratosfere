// app/components/alive-map/stratos-db.ts

// Mantenemos esto para que no explote nada que busque fotos antiguas
export const IMAGES = {
    PENTHOUSE: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    VILLA:     "https://images.unsplash.com/photo-1600596542815-27b5aec872c3",
    MODERN:    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    OFFICE:    "https://images.unsplash.com/photo-1497366216548-37526070297c",
    LAND:      "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
    LOFT:      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    INDUSTRIAL:"https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
};

// VACIAR ESTO hace que desaparezcan los pisos falsos de Madrid, Alicante y Toledo.
// Sus fotos reales NO se borran (están en la base de datos, no aquí).
export const STRATOS_PROPERTIES = [];