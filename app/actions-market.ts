"use server";

import { prisma } from './lib/prisma';

// =========================================================
// 🧮 1. FÓRMULA HAVERSINE (Distancia real en KM en el servidor)
// =========================================================
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radio de la Tierra en KM
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// =========================================================
// 🧬 2. CLUSTERS DE TIPOLOGÍA (El Cerebro Tasador)
// =========================================================
const normalizeType = (t: string) => String(t || "").toLowerCase().trim();

function getAppraisalCluster(type: string) {
    const t = normalizeType(type);
    if (["piso", "apartamento", "vivienda", "bajo"].some(x => t.includes(x))) return "FLAT";
    if (["atico", "ático", "penthouse"].some(x => t.includes(x))) return "PENTHOUSE";
    if (["duplex", "dúplex"].some(x => t.includes(x))) return "DUPLEX";
    if (["loft", "estudio"].some(x => t.includes(x))) return "LOFT";
    if (["villa", "chalet", "casa", "adosado", "finca"].some(x => t.includes(x))) return "HOUSE";
    if (["oficina", "despacho"].some(x => t.includes(x))) return "OFFICE";
    if (["nave", "industrial"].some(x => t.includes(x))) return "INDUSTRIAL";
    if (["suelo", "terreno", "parcela"].some(x => t.includes(x))) return "LAND";
    return "UNKNOWN";
}

// =========================================================
// 📡 3. RADAR DE VALORACIÓN INTELIGENTE (Stratos Valuator)
// =========================================================
export async function getMarketRadarAction(lat: number, lng: number, baseType: string, baseM2?: number) {
  try {
    if (!lat || !lng || !baseType) return { success: false, rivals: [], stats: null };

    const targetCluster = getAppraisalCluster(baseType);
    
    // 1. ONDA DE CHOQUE AMPLIA (Buscamos todo en ~5km a la redonda para no quedarnos ciegos)
    const SEARCH_DELTA = 0.05; 
    
    const rawCandidates = await prisma.property.findMany({
      where: {
        status: "PUBLICADO",
        latitude: { gte: lat - SEARCH_DELTA, lte: lat + SEARCH_DELTA },
        longitude: { gte: lng - SEARCH_DELTA, lte: lng + SEARCH_DELTA },
        mBuilt: { gt: 0 }, // Fundamental para no dividir entre 0
        price: { gt: 0 }
      },
   select: { 
          id: true, title: true, price: true, mBuilt: true, type: true, 
          views: true, createdAt: true, mainImage: true, images: true, 
          latitude: true, longitude: true, address: true, 
          
          promotedTier: true, 
          promotedUntil: true, // Para saber si caducó
          
       // 🔥 AHORA TRAEMOS EL TELÉFONO TAMBIÉN
          user: { select: { role: true, companyLogo: true, avatar: true, companyName: true, name: true, licenseType: true, phone: true } },
          assignment: { 
              where: { status: 'ACTIVE' }, 
              select: { agency: { select: { companyLogo: true, avatar: true, companyName: true, name: true, licenseType: true, phone: true } } } 
          }
      }
    });

    // 2. FILTRADO INTELIGENTE Y CÁLCULO DE AFINIDAD (Score de Tasación)
    const scoredCandidates = rawCandidates.map((p: any) => {
        const distanceKm = calculateDistance(lat, lng, Number(p.latitude), Number(p.longitude));
        const pCluster = getAppraisalCluster(p.type);
        
        let affinityScore = 0;
        let matchTags = [];

        // A) Afinidad por Tipología (Peras con peras... o manzanas si no hay peras)
        let isExactType = false;
        if (pCluster === targetCluster) {
            affinityScore += 100; // Es exactamente la misma familia (Ej: Ático con Ático)
            isExactType = true;
            matchTags.push("Tipología Exacta");
        } else if (
            // Si es residencial, aceptamos mezclar pisos con dúplex o áticos si no hay más remedio, pero con menos nota
            ["FLAT", "PENTHOUSE", "DUPLEX", "LOFT"].includes(targetCluster) && 
            ["FLAT", "PENTHOUSE", "DUPLEX", "LOFT"].includes(pCluster)
        ) {
            affinityScore += 50;
            matchTags.push("Residencial Similar");
        } else {
            // Si buscamos un Chalet y es un Local, lo matamos (Score -1000)
            affinityScore -= 1000; 
        }

        // B) Afinidad por Distancia
        if (distanceKm <= 0.5) { affinityScore += 100; matchTags.push("En el mismo barrio"); }
        else if (distanceKm <= 1.5) { affinityScore += 70; matchTags.push("Cercano (<1.5km)"); }
        else if (distanceKm <= 3) { affinityScore += 30; }
        else { affinityScore -= 20; } // Muy lejos penaliza

        // C) Afinidad por Tamaño (Si nos pasaron los m2 de referencia)
        if (baseM2 && baseM2 > 0) {
            const sizeDiffRatio = Math.abs(Number(p.mBuilt) - baseM2) / baseM2;
            if (sizeDiffRatio <= 0.1) { affinityScore += 80; matchTags.push("Tamaño gemelo"); } // 10% diff
            else if (sizeDiffRatio <= 0.25) { affinityScore += 40; matchTags.push("Tamaño similar"); } // 25% diff
            else if (sizeDiffRatio > 0.6) { affinityScore -= 50; } // Demasiada diferencia de tamaño
        }

        // D) Bonus por Datos Frescos
        const daysOnMarket = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysOnMarket < 30) matchTags.push("Mercado Reciente");

        return {
            ...p,
            distanceKm,
            affinityScore,
            isExactType,
            matchTags: matchTags.slice(0, 2), // Solo 2 tags para la UI
            pricePerM2: Math.round(Number(p.price) / Number(p.mBuilt))
        };
    });

    // 3. PURGA Y SELECCIÓN (Los Mejores Testigos)
    // Filtramos los que no tienen nada que ver (Score < 0) y ordenamos por los más afines
    const validWitnesses = scoredCandidates
        .filter(c => c.affinityScore > 0)
        .sort((a, b) => b.affinityScore - a.affinityScore)
        .slice(0, 12); // Nos quedamos con los 12 mejores testigos para el cálculo

    // 4. MATEMÁTICA FINANCIERA (El Análisis)
    if (validWitnesses.length === 0) {
        return { success: true, rivals: [], stats: { avgPriceM2: 0, highestM2: 0, lowestM2: 0, count: 0, confidence: "BAJA" } };
    }

    const m2Prices = validWitnesses.map(w => w.pricePerM2).sort((a, b) => a - b);
    
    // Eliminamos extremos si hay más de 4 testigos (Quitar el más barato y el más caro para evitar distorsiones)
    let corePrices = m2Prices;
    if (m2Prices.length >= 4) {
        corePrices = m2Prices.slice(1, -1); 
    }

    const avgPriceM2 = Math.round(corePrices.reduce((acc, curr) => acc + curr, 0) / corePrices.length);
    const highestM2 = Math.max(...m2Prices);
    const lowestM2 = Math.min(...m2Prices);

    // Nivel de Confianza (Confidence)
    let confidence = "MEDIA";
    const exactMatchesCount = validWitnesses.filter(w => w.isExactType && w.distanceKm <= 2).length;
    if (exactMatchesCount >= 5) confidence = "ALTA";
    if (validWitnesses.length < 3) confidence = "BAJA";

 // 4. Formateo para el Frontend (Datos reales y Agencia blindada)
    const formattedRivals = validWitnesses.map(p => {
        // 🕵️ DETECTOR DE AGENCIA INFALIBLE (Acepta mayúsculas, minúsculas, etc.)
        const activeAssignment = p.assignment && p.assignment.length > 0 ? p.assignment[0] : null;
        const isUserAgency = String(p.user?.role || '').toUpperCase().includes('AGEN');
        const agencyData = activeAssignment ? activeAssignment.agency : (isUserAgency ? p.user : null);

        // 🔥 LÓGICA DE IGNICIÓN REAL
        const tier = String(p.promotedTier || '').toUpperCase().trim();
        let isPremium = tier === 'PREMIUM';

        if (isPremium && p.promotedUntil) {
            const expiryDate = new Date(p.promotedUntil);
            if (expiryDate < new Date()) {
                isPremium = false;
            }
        }

        if (agencyData && agencyData.licenseType) {
            const license = String(agencyData.licenseType).toUpperCase().trim();
            if (license === 'PRO' || license === 'PREMIUM') {
                isPremium = true;
            }
        }

        return {
            id: p.id,
            name: p.title || "Activo Similar",
            type: p.type,
            price: p.price,
            mBuilt: p.mBuilt, // 📏 METROS CUADRADOS
            pricePerM2: p.pricePerM2,
            distanceKm: p.distanceKm,
            affinityScore: p.affinityScore,
            tags: p.matchTags,
            img: p.mainImage || (p.images && p.images.length > 0 ? p.images[0].url : null),
            
            isFire: isPremium, // ✅ FUEGO REAL
            
            // 🏢 DATOS VIP DE LA AGENCIA
            agency: agencyData ? {
                name: agencyData.companyName || agencyData.name || "Agencia",
                logo: agencyData.companyLogo || agencyData.avatar || null,
                phone: agencyData.phone || null
            } : null,
            
            days: Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
            visits: p.views || 0
        };
    });
    return { 
        success: true, 
        rivals: formattedRivals, 
        stats: { 
            avgPriceM2, 
            highestM2, 
            lowestM2, 
            count: validWitnesses.length, 
            confidence,
            baseCluster: targetCluster
        } 
    };

  } catch (error) {
    console.error("Fallo en Stratos Valuator:", error);
    return { success: false, rivals: [], stats: null, error: "Error en el análisis de mercado" };
  }
}