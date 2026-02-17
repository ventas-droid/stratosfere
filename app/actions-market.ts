"use server";

import { prisma } from './lib/prisma'; // Asegúrese de que la ruta a prisma es correcta, suele ser esta o '@/lib/prisma'

// =========================================================
// 📡 RADAR DE MERCADO REAL (DIVISIÓN DE INTELIGENCIA)
// =========================================================
export async function getMarketRadarAction(lat: number, lng: number, type: string) {
  try {
    // 1. Definir radio de búsqueda táctico (aprox 2km = ~0.02 grados)
    const DELTA = 0.02;

    // 2. Buscar testigos enemigos/aliados en la zona
    const rivals = await prisma.property.findMany({
      where: {
        status: "PUBLICADO",
        // Filtro geográfico (Caja de combate)
        latitude: { gte: lat - DELTA, lte: lat + DELTA },
        longitude: { gte: lng - DELTA, lte: lng + DELTA },
        // Opcional: Filtrar por tipo para comparar manzanas con manzanas
        // type: { equals: type, mode: 'insensitive' } 
      },
      select: {
        id: true,
        title: true,
        price: true,
        mBuilt: true,
        views: true,
        createdAt: true,
        mainImage: true,
        images: true,
        address: true
      },
      take: 10 // Top 10 rivales más relevantes
    });

    // 3. Procesar Inteligencia (Calcular temperatura y métricas)
    const processedRivals = rivals.map((p: any) => {
        const daysOnMarket = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const visits = p.views || 0;
        
        // Algoritmo de Calor: 
        // HOT: Muchas visitas (>50) O muy nuevo (<7 días)
        // COLD: Mucho tiempo (>90 días) Y pocas visitas (<20)
        let temperature = "WARM";
        if (visits > 50 || daysOnMarket < 7) temperature = "HOT";
        if (daysOnMarket > 90 && visits < 20) temperature = "COLD";

        const img = p.mainImage || (p.images && p.images.length > 0 ? p.images[0].url : null) || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80";

        return {
            id: p.id,
            name: p.title || "Propiedad Vecina",
            price: p.price || 0,
            days: daysOnMarket,
            visits: visits,
            type: temperature,
            img: img,
            address: p.address
        };
    });

    // 4. Calcular Medias del Sector
    const totalM2Price = rivals.reduce((acc: number, curr: any) => {
        const price = curr.price || 0;
        const m2 = curr.mBuilt || 1; 
        return acc + (price / m2);
    }, 0);
    
    const avgPriceM2 = rivals.length > 0 ? Math.round(totalM2Price / rivals.length) : 0;

    return { 
        success: true, 
        rivals: processedRivals, 
        stats: { avgPriceM2, count: rivals.length } 
    };

  } catch (error) {
    console.error("Fallo en sonar de mercado:", error);
    return { success: false, rivals: [], stats: { avgPriceM2: 0, count: 0 } };
  }
}