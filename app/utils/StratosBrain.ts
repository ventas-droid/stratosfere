// app/utils/StratosBrain.ts

// 🛠️ HELPER: Normalizador Fonético (Aniquila faltas de ortografía)
const normalizeText = (text: string) => {
    if (!text) return "";
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/b/g, 'v') // Convierte todas las B en V (Manilba -> manilva)
        .replace(/h/g, '')  // Aniquila las H mudas (Hatico -> atico)
        .trim();
};

export const StratosBrain = {

    // ====================================================================
    // 🕵️‍♂️ DETECTOR DE AMBIGÜEDADES (El Faldón Inteligente)
    // ====================================================================
    getClarifications: (query: string): string[] => {
        const q = normalizeText(query);
        
        // Diccionario de los conflictos más comunes en España
        const conflicts: Record<string, string[]> = {
            'salamanca': ['Barrio de Salamanca, Madrid', 'Salamanca, Castilla y León'],
            'elche': ['Elche, Alicante', 'Elche de la Sierra, Albacete'],
            'san juan': ['San Juan de Alicante', 'San Juan de Aznalfarache', 'Sant Joan (Mallorca)'],
            'santiago': ['Santiago de Compostela', 'Santiago del Teide, Tenerife'],
            'arona': ['Arona, Tenerife', 'Arona, Italia'],
            'toledo': ['Toledo (Ciudad)', 'Puerta de Toledo, Madrid'],
            'retiro': ['Barrio del Retiro, Madrid', 'El Retiro, Antioquia']
        };

        // Limpiamos palabras basura para ver si la palabra central es un conflicto
        const cleanQ = q.replace(/\b(en|quiero|busco|piso|chalet|villa|casa)\b/g, '').trim();

        for (const [key, options] of Object.entries(conflicts)) {
            // Si el usuario escribe exactamente "salamanca" o "en salamanca", dispara el faldón
            if (cleanQ === key) {
                return options;
            }
        }
        return [];
    },

    // ====================================================================
    // 🧠 MOTOR PRINCIPAL DE PROCESAMIENTO (NLP + SCORING)
    // ====================================================================
    process: (query: string, properties: any[]) => {
        if (!query || query.trim() === "") return properties.map(p => ({ ...p, dopamineTags: [] }));

        const q = normalizeText(query);

        // --- 1. EXTRAER HABITACIONES Y BAÑOS ---
        const bedsMatch = q.match(/(\d+)\s*(hab|dorm|cama|cuarto)/);
        const reqBeds = bedsMatch ? parseInt(bedsMatch[1]) : 0;

        const bathsMatch = q.match(/(\d+)\s*(ban|aseo)/);
        const reqBaths = bathsMatch ? parseInt(bathsMatch[1]) : 0;

        // --- 2. EXTRAER SUPERFICIE ---
        const m2Match = q.match(/(?:mas de|mas|>|minimo|desde)?\s*(\d+)\s*(?:m2|metros|mts)/);
        const reqM2 = m2Match ? parseInt(m2Match[1]) : 0;

        // --- 3. EXTRAER PRECIO MÁXIMO ---
        let reqMaxPrice = Infinity;
        const qCleanPrice = q.replace(/\./g, '').replace(/,/g, '.'); 
        const explicitPriceMatch = qCleanPrice.match(/(?:hasta|maximo|max|<|por menos de|menos de|tope)\s*(\d+(?:\.\d+)?)\s*(k|m|millon|millones|euros|€)?/);
        
        if (explicitPriceMatch) {
            let val = parseFloat(explicitPriceMatch[1]);
            const modifier = explicitPriceMatch[2];
            if (modifier) {
                if (modifier.includes('k')) val *= 1000;
                else if (modifier.includes('m') || modifier.includes('millon')) val *= 1000000;
            } else if (val < 10000) {
                val *= 1000; 
            }
            reqMaxPrice = val;
        } else {
            const loosePriceMatch = qCleanPrice.match(/(\d+(?:\.\d+)?)\s*(k|m|millon|millones|euros|€)/);
            if (loosePriceMatch) {
                let val = parseFloat(loosePriceMatch[1]);
                const modifier = loosePriceMatch[2];
                if (modifier && (modifier.includes('m') || modifier.includes('millon'))) val *= 1000000;
                else if (modifier && modifier.includes('k')) val *= 1000;
                if (val > 10000) reqMaxPrice = val;
            }
        }

        // --- 4. EXTRAER TIPOLOGÍA ---
        const typeDict: Record<string, string[]> = {
            'flat': ['piso', 'apartamento', 'vivienda', 'planta baja', 'bajo'],
            'penthouse': ['atico', 'penthouse'],
            'duplex': ['duplex'],
            'loft': ['loft', 'estudio'],
            'villa': ['villa', 'chalet', 'casa', 'adosado', 'pareado', 'finca', 'mansion'],
            'office': ['oficina', 'despacho', 'local'],
            'land': ['suelo', 'terreno', 'parcela'],
            'industrial': ['nave', 'industrial']
        };
        let reqTypes: string[] = [];
        Object.entries(typeDict).forEach(([typeKey, words]) => {
            if (words.some(w => new RegExp(`\\b${w}\\b`).test(q))) reqTypes.push(typeKey);
        });

        // --- 5. ESTILO DE VIDA (VIBES) ---
        const vibeDictionaries = {
            inversor: ['rentabilidad', 'inversion', 'reformar', 'oportunidad', 'chollo', 'turistico'],
            familia: ['colegio', 'tranquilo', 'parque', 'familia', 'residencial', 'verde', 'ninos'],
            lujo: ['lujo', 'exclusivo', 'premium', 'standing', 'alta gama', 'espectacular'],
            luminoso: ['luz', 'luminoso', 'sol', 'despejadas', 'ventanales'],
            mar: ['mar', 'playa', 'costa', 'oceano', 'primera linea'],
            reformar: ['reformar', 'proyecto', 'ruina', 'rehabilitar'],
            obranueva: ['nuevo', 'obra nueva', 'estrenar', 'promocion'],
            exterior: ['exterior', 'fuera', 'calle'],
            orientacionSur: ['sur', 'mediodia']
        };
        let reqVibes: string[] = [];
        Object.entries(vibeDictionaries).forEach(([vibe, words]) => {
            if (words.some(w => new RegExp(`\\b${w}\\b`).test(q))) reqVibes.push(vibe);
        });

        // --- 6. EXTRACCIÓN DE CIUDAD ---
        let locationWordsStr = q
            .replace(/(\d+)\s*(hab|dorm|cama|cuarto)s?/g, '')
            .replace(/(\d+)\s*(ban|aseo)s?/g, '')
            .replace(/(?:mas de|mas|>|minimo|desde)?\s*(\d+)\s*(?:m2|metros|mts)/g, '')
            .replace(/(?:hasta|maximo|max|<|por menos de|menos de|tope)?\s*(\d+(?:\.\d+)?)\s*(k|m|millon|millones|euros|€)?/g, '');
        
        const allDictionaryWords = [
            ...Object.values(vibeDictionaries).flat(),
            ...Object.values(typeDict).flat(),
            'piscina', 'terraza', 'garaje', 'parking', 'ascensor', 'jardin', 'trastero', 'balcon', 'aire', 'calefaccion', 'amueblado',
            'en', 'con', 'de', 'y', 'o', 'un', 'una', 'para', 'comprar', 'alquilar', 'quiero', 'busco', 'necesito', 'que', 'tenga', 'el', 'la', 'los', 'las'
        ];
        allDictionaryWords.forEach(w => { 
            locationWordsStr = locationWordsStr.replace(new RegExp(`\\b${w}\\b`, 'g'), ''); 
        });

        const cleanLocationWords = locationWordsStr.split(/\s+/).filter(w => w.length > 2);

        // ====================================================================
        // ⚖️ FASE 2: SCORING Y LÍNEAS ROJAS
        // ====================================================================

        let processed = properties.map(p => {
            const propPrice = Number(String(p.priceValue || p.price || "0").replace(/\D/g, ""));
            const propM2 = Number(p.mBuilt || p.m2 || 0);
            const propBeds = Number(p.rooms || 0);
            const propBaths = Number(p.baths || 0);
            const propTypeStr = normalizeText(p.type || "");
            
            const coreLocationText = normalizeText(`${p.city} ${p.region} ${p.address} ${p.postcode}`);
            const fullText = normalizeText(`${coreLocationText} ${p.title} ${p.description}`);
            
            let dopamineTags: string[] = [];

            // 🛑 LÍNEA ROJA 1: PRECIO
            let adjustedLimit = reqMaxPrice;
            if (reqMaxPrice < Infinity && propPrice > adjustedLimit) return { ...p, aiScore: 0 };
            
            // 🛑 LÍNEA ROJA 2: UBICACIÓN
            if (cleanLocationWords.length > 0) {
                const matchesLoc = cleanLocationWords.some(w => coreLocationText.includes(w));
                if (!matchesLoc) return { ...p, aiScore: 0 };
            }

            let score = 0;
            let maxPossibleScore = 0; 

            // A. Evaluación Ubicación
            if (cleanLocationWords.length > 0) {
                maxPossibleScore += 40;
                score += 40; 
            }

            // B. Evaluación Tipología
            if (reqTypes.length > 0) {
                maxPossibleScore += 30;
                let propInternalType = "";
                Object.entries(typeDict).forEach(([key, words]) => {
                    if (words.some(w => propTypeStr.includes(w))) propInternalType = key;
                });
                if (reqTypes.includes(propInternalType)) {
                    score += 30;
                    dopamineTags.push('🎯 Tu tipología ideal');
                } else {
                    score -= 10; 
                }
            }

            // C. Evaluación Espacios (Habs/Baños)
            if (reqBeds > 0) {
                maxPossibleScore += 20;
                if (propBeds >= reqBeds) {
                    score += 20;
                    if (propBeds > reqBeds) dopamineTags.push(`🛏️ ¡${propBeds - reqBeds} Hab extra!`);
                } else {
                    score -= (reqBeds - propBeds) * 30; 
                }
            }

            if (reqBaths > 0) {
                maxPossibleScore += 10;
                if (propBaths >= reqBaths) score += 10;
                else score -= (reqBaths - propBaths) * 20;
            }

            // D. Evaluación Superficie
            if (reqM2 > 0) {
                maxPossibleScore += 20;
                if (propM2 >= reqM2) {
                    score += 20;
                    if (propM2 > reqM2 + 20) dopamineTags.push('📐 Espacio de sobra');
                } else {
                    score -= 20; 
                }
            }

            // E. Recompensa Precio
            if (reqMaxPrice < Infinity && propPrice > 0) {
                maxPossibleScore += 10;
                const ahorro = reqMaxPrice - propPrice;
                if (ahorro >= 10000 && propPrice >= (reqMaxPrice * 0.4)) { 
                    score += 10;
                    dopamineTags.push(`💰 Ahorras ${ahorro.toLocaleString('es-ES')}€`);
                } else if (propPrice > 0) {
                    score += 10;
                }
            }

            // F. Estilo de Vida
            const propState = normalizeText(p.state || "");
            const propOrientation = normalizeText(p.orientation || "");
            const propIsExterior = p.exterior === true;

            reqVibes.forEach(vibe => {
                maxPossibleScore += 15;
                const words = vibeDictionaries[vibe as keyof typeof vibeDictionaries];
                const matchesText = words.some(w => new RegExp(`\\b${w}\\b`).test(fullText));
                
                let matched = matchesText;

                if (vibe === 'reformar' && propState.includes('reformar')) matched = true;
                if (vibe === 'obranueva' && (propState.includes('nueva') || propState.includes('estrenar'))) matched = true;
                if (vibe === 'exterior' && propIsExterior) matched = true;
                if (vibe === 'orientacionSur' && propOrientation.includes('sur')) matched = true;

                if (matched) {
                    score += 15;
                    if (vibe === 'reformar') dopamineTags.push('🛠️ Ideal para reformar');
                    else if (vibe === 'obranueva') dopamineTags.push('✨ Obra Nueva');
                    else if (vibe === 'exterior') dopamineTags.push('🌳 Totalmente Exterior');
                    else if (vibe === 'orientacionSur') dopamineTags.push('🧭 Sol todo el día');
                    else if (vibe === 'mar') dopamineTags.push('🌊 Joya junto al mar');
                    else if (vibe === 'luminoso') dopamineTags.push('☀️ Altamente luminoso');
                    else if (vibe === 'inversor') dopamineTags.push('📈 Alta Rentabilidad');
                    else if (vibe === 'familia') dopamineTags.push('🏡 Ideal para familias');
                    else if (vibe === 'lujo') dopamineTags.push('💎 Categoría Premium');
                }
            });

            // G. Extras
            const extraKeywords = ['piscina', 'terraza', 'garaje', 'parking', 'ascensor', 'jardin', 'trastero', 'balcon'];
            extraKeywords.forEach(kw => {
                if (new RegExp(`\\b${kw}\\b`).test(q)) {
                    maxPossibleScore += 15;
                    const inText = new RegExp(`\\b${kw}\\b`).test(fullText);
                    const inServices = Array.isArray(p.selectedServices) && p.selectedServices.includes(kw);
                    
                    let explicitBool = false;
                    if (kw === 'ascensor') explicitBool = p.elevator === true;
                    if (kw === 'garaje' || kw === 'parking') explicitBool = p.garage === true;
                    if (kw === 'piscina') explicitBool = p.pool === true;

                    if (inText || inServices || explicitBool) {
                        score += 15;
                        dopamineTags.push(`✨ Tiene ${kw}`);
                    }
                }
            });

// H. 🚀 INYECCIÓN DE DOPAMINA EXTRA (Energía y Gastos)
            const propEnergy = String(p.energyConsumption || "").toUpperCase();
            if (propEnergy === 'A' || propEnergy === 'B') {
                score += 10;
                dopamineTags.push('🍃 Alta Eficiencia (Ahorro Luz)');
            }

            const propCommunity = Number(p.communityFees || 0);
            if (propPrice > 300000 && propCommunity > 0 && propCommunity <= 60) {
                score += 10;
                dopamineTags.push('💸 Comunidad muy baja');
            }


            // ====================================================================
            // 📊 CÁLCULO FINAL DE AFINIDAD
            // ====================================================================
            if (maxPossibleScore === 0) {
                return { ...p, aiScore: 100, matchPercentage: 100, dopamineTags: [], isPerfectMatch: true };
            }

            let matchPct = Math.round((score / maxPossibleScore) * 100);
            matchPct = Math.min(100, Math.max(0, matchPct));

            dopamineTags = Array.from(new Set(dopamineTags)).slice(0, 3);

            return { 
                ...p, 
                aiScore: score, 
                matchPercentage: matchPct, 
                dopamineTags, 
                isPerfectMatch: matchPct >= 98 
            };
        });

        // 🧹 Limpiamos la basura: Ocultamos propiedades con menos de un 30% de afinidad o score negativo
        processed = processed.filter(p => p.matchPercentage >= 30 && p.aiScore > 0);
        return processed;
    }
};