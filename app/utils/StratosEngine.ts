// ----------------------------------------------------------------------
// 🚀 STRATOSFERE ENGINE: EL CEREBRO DE RECOMENDACIÓN TÁCTICA
// ----------------------------------------------------------------------

// 1. DICCIONARIO UNIVERSAL (El políglota inmobiliario)
const DICTIONARY: Record<string, string[]> = {
  flat: ['piso', 'apartamento', 'flat', 'vivienda', 'appartement', 'apartment', 'квартира'],
  penthouse: ['ático', 'atico', 'penthouse', 'attic'],
  duplex: ['dúplex', 'duplex'],
  loft: ['loft', 'estudio', 'studio'],
  villa: ['villa', 'chalet', 'casa', 'vivienda', 'house', 'maison', 'дом', 'mansion'],
  bungalow: ['bungalow', 'adosado', 'pareado', 'townhouse'],
  office: ['oficina', 'despacho', 'office', 'local', 'bureau'],
  land: ['suelo', 'terreno', 'parcela', 'solar', 'finca', 'land', 'plot', 'terrain'],
  industrial: ['nave', 'industrial', 'almacén', 'warehouse', 'entrepôt']
};

export interface SearchIntent {
  location?: string;
  budget?: number;
  type?: string;
  beds?: number;
  baths?: number;
  features?: string[];
  premiumOnly?: boolean;
}

export const StratosEngine = {
  
  /**
   * Ejecuta el escáner sobre toda la base de datos y devuelve el inventario puntuado.
   */
  processRadar: (inventory: any[], intent: SearchIntent) => {
    
    // Si el usuario no busca nada específico, devolvemos todo tal cual
    const isBlankSearch = !intent.location && !intent.budget && (!intent.type || intent.type === 'all');
    if (isBlankSearch) {
      return inventory.map(p => ({ ...p, matchScore: 100, isPerfectMatch: false }));
    }

    const scoredInventory = inventory.map(property => {
      let score = 0;
      let isEliminated = false; // Solo matamos la propiedad si incumple algo crítico (ej: Modo Fuego)

      const pType = String(property.type || "").toLowerCase();
      const pTitle = String(property.title || "").toLowerCase();
      const pDesc = String(property.description || "").toLowerCase();
      const pText = `${pType} ${pTitle} ${pDesc}`;
      const price = Number(property.priceValue || property.price || 0);

      // -----------------------------------------------------------
      // 1. REGLA DE EXTERMINIO VIP (MODO FUEGO)
      // -----------------------------------------------------------
      if (intent.premiumOnly) {
         const tier = String(property.promotedTier || "").toUpperCase();
         const isPremium = tier === 'PREMIUM' || tier === 'PRO' || property.isPromoted === true || property.premium === true;
         if (!isPremium) isEliminated = true; // Aquí sí eliminamos, el Fuego no perdona.
      }

      if (isEliminated) return { ...property, matchScore: 0 };

      // -----------------------------------------------------------
      // 2. MATEMÁTICAS DE ZONA (Hasta +30 Puntos)
      // -----------------------------------------------------------
      if (intent.location && intent.location.length > 2) {
         const locTarget = intent.location.toLowerCase();
         const pCity = String(property.city || "").toLowerCase();
         const pAddress = String(property.address || "").toLowerCase();
         
         if (pCity.includes(locTarget) || pAddress.includes(locTarget)) {
             score += 30; // Match directo
         } else if (pText.includes(locTarget)) {
             score += 15; // Mencionan la zona en la descripción (Cerca de...)
         } else {
             // Si el usuario pone "Madrid" y esto está en "Málaga", le restamos puntuación
             // pero NO la borramos (a no ser que queramos ser muy estrictos).
             score -= 50; 
         }
      } else {
         score += 30; // Si no busca zona, todas ganan estos puntos
      }

      // -----------------------------------------------------------
      // 3. MATEMÁTICAS DE TIPO (Hasta +30 Puntos)
      // -----------------------------------------------------------
      if (intent.type && intent.type !== 'all') {
          const targetType = intent.type.toLowerCase();
          const validTerms = DICTIONARY[targetType] || [targetType];
          
          const hasTypeMatch = validTerms.some(term => pText.includes(term));
          if (hasTypeMatch) {
              score += 30;
          } else {
              score -= 30; // No es lo que busca, la hundimos en la lista.
          }
      } else {
          score += 30;
      }

      // -----------------------------------------------------------
      // 4. MATEMÁTICAS FINANCIERAS (Hasta +20 Puntos)
      // -----------------------------------------------------------
      if (intent.budget && intent.budget > 0) {
          if (price > 0) {
              if (price <= intent.budget) {
                  score += 20; // Entra en presupuesto
              } else if (price <= intent.budget * 1.15) {
                  score += 10; // Se pasa hasta un 15% (Se la enseñamos por si quiere negociar)
              } else {
                  score -= 40; // Se sale totalmente de presupuesto
              }
          }
      } else {
          score += 20;
      }

      // -----------------------------------------------------------
      // 5. MATEMÁTICAS DE CONFORT (Hasta +20 Puntos)
      // -----------------------------------------------------------
      const rooms = Number(property.rooms || 0);
      const baths = Number(property.baths || 0);

      if (intent.beds && intent.beds > 0) {
          if (rooms >= intent.beds) score += 10; // Tiene las que pide o más
          else if (rooms === intent.beds - 1) score += 3; // Le falta una (Opción B)
      } else { score += 10; }

      if (intent.baths && intent.baths > 0) {
          if (baths >= intent.baths) score += 10;
          else if (baths === intent.baths - 1) score += 3;
      } else { score += 10; }

      // -----------------------------------------------------------
      // 6. LOS "CALCETINES" (Extras) - Puntos extra
      // -----------------------------------------------------------
      if (intent.features && intent.features.length > 0) {
          const safeServices = Array.isArray(property.selectedServices) ? property.selectedServices : [];
          
          intent.features.forEach((feat: string) => {
              if (
                  (feat === 'pool' && (property.pool || safeServices.includes('pool') || pText.includes('piscina'))) ||
                  (feat === 'garage' && (property.garage || safeServices.includes('garage') || pText.includes('garaje'))) ||
                  (feat === 'terrace' && (property.terrace || safeServices.includes('terrace') || pText.includes('terraza')))
                  // (Se pueden añadir el resto de extras aquí)
              ) {
                  score += 5; // Puntos extra por cada "calcetín" que coincida
              }
          });
      }

      // Limitamos el score a un máximo visual de 100 y mínimo de 0
      const finalScore = Math.max(0, Math.min(100, score));

      return {
          ...property,
          matchScore: finalScore,
          isPerfectMatch: finalScore >= 95 // 🔥 SI ES 95 O MÁS, ES SU ALMA GEMELA
      };
    });

    // 7. ORDENACIÓN MILITAR (De mayor a menor puntuación)
    // Eliminamos las que tengan score muy bajo (ej: menos de 20 puntos)
    const finalList = scoredInventory
        .filter(p => p.matchScore >= 20)
        .sort((a, b) => b.matchScore - a.matchScore);

    return finalList;
  }
};