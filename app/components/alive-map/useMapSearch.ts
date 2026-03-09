// @ts-nocheck
"use client";

import mapboxgl from 'mapbox-gl';

export const useMapSearch = (map: any) => {
  
  // --------------------------------------------------------------------
  // E. BÚSQUEDA OMNI V10 (INTERCEPTOR TÁCTICO) 🇪🇸🛡️
  // --------------------------------------------------------------------
  const searchCity = async (rawQuery: any) => {
    if (!rawQuery || !map.current) return;

    let query = String(rawQuery).toLowerCase().trim();
    query = query.replace(/quiero|buscar|piso en|casa en|chalet en|villa en|comprar en/gi, "").trim();

    if (query.length < 2) return;

    // 🛑 EL DICCIONARIO SALVAVIDAS (ARSENAL AMPLIADO) 🛑
    const overrides: Record<string, string> = {
        "palma de mallorca": "Palma, Illes Balears",
        "palma": "Palma, Illes Balears",
        "mallorca": "Mallorca, Illes Balears",
        "ibiza": "Eivissa, Illes Balears",
        "eivissa": "Eivissa, Illes Balears",
        "menorca": "Menorca, Illes Balears",
        "formentera": "Formentera, Illes Balears",
        "tenerife": "Isla de Tenerife, Canarias",
        "gran canaria": "Las Palmas de Gran Canaria",
        "lanzarote": "Isla de Lanzarote, Canarias",
        "cordoba": "Córdoba, Andalucía, España",
        "toledo": "Toledo, Castilla-La Mancha, España",
        "merida": "Mérida, Extremadura, España",
        "cartagena": "Cartagena, Región de Murcia, España",
        "santiago": "Santiago de Compostela, Galicia, España",
        "santiago de compostela": "Santiago de Compostela, Galicia, España",
        "san sebastian": "Donostia-San Sebastián, País Vasco",
        "donostia": "Donostia-San Sebastián, País Vasco",
        "vitoria": "Vitoria-Gasteiz, País Vasco",
        "alicante": "Alicante, Comunitat Valenciana, España",
        "valencia": "Valencia, Comunitat Valenciana, España",
        "la zagaleta": "La Zagaleta, Benahavís, Málaga",
        "sotogrande": "Sotogrande, San Roque, Cádiz",
        "puerto banus": "Puerto Banús, Marbella, Málaga",
        "la moraleja": "La Moraleja, Alcobendas, Madrid",
        "la finca": "La Finca, Pozuelo de Alarcón, Madrid",
        "barrio de salamanca": "Barrio de Salamanca, Madrid",
        "baqueira": "Baqueira Beret, Lleida",
        "valderrama": "Club de Golf Valderrama, San Roque, Cádiz",
        "altea hills": "Altea Hills, Altea, Alicante",
        "santiago bernabeu": "Estadio Santiago Bernabéu, Madrid",
        "bernabeu": "Estadio Santiago Bernabéu, Madrid",
        "estadio santiago bernabeu": "Estadio Santiago Bernabéu, Madrid",
        "camp nou": "Spotify Camp Nou, Barcelona",
        "spotify camp nou": "Spotify Camp Nou, Barcelona",
        "metropolitano": "Estadio Cívitas Metropolitano, Madrid",
        "wanda metropolitano": "Estadio Cívitas Metropolitano, Madrid",
        "mestalla": "Estadio de Mestalla, Valencia",
        "san mames": "Estadio San Mamés, Bilbao",
        "rico perez": "Estadio José Rico Pérez, Alicante",
        "estadio rico perez": "Estadio José Rico Pérez, Alicante",
        "sagrada familia": "La Sagrada Familia, Barcelona",
        "alhambra": "La Alhambra, Granada",
        "barajas": "Aeropuerto Adolfo Suárez Madrid-Barajas",
        "el prat": "Aeropuerto Josep Tarradellas Barcelona-El Prat",
        "bcn": "Barcelona, España",
        "mad": "Madrid, España",
        "vlc": "Valencia, España"
    };

    const finalQuery = overrides[query] || query;
    console.log(`🚀 RADAR ACTIVADO. Objetivo: "${finalQuery}"`);

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(finalQuery)}.json?access_token=${mapboxgl.accessToken}&language=es&limit=10`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        
        const sortedFeatures = data.features.sort((a: any, b: any) => {
            const rank: any = { 'place': 100, 'poi': 90, 'region': 80, 'locality': 70, 'neighborhood': 60, 'district': 50, 'postcode': 40, 'address': 10 };
            const scoreA = (rank[a.place_type[0]] || 0) + (a.relevance * 50);
            const scoreB = (rank[b.place_type[0]] || 0) + (b.relevance * 50);
            return scoreB - scoreA;
        });

        const bestMatch = sortedFeatures[0];
        const type = bestMatch.place_type[0];

        console.log(`✅ ATERRIZANDO EN: ${bestMatch.place_name} (Tipo: ${type})`);

        if (bestMatch.bbox && ['country', 'region', 'place', 'district', 'locality'].includes(type)) {
           const currentPitch = map.current.getPitch();
           const currentBearing = map.current.getBearing();

           map.current.fitBounds(bestMatch.bbox, { 
               padding: 50, 
               duration: 3000, 
               pitch: currentPitch,
               bearing: currentBearing,
               essential: true 
           });
        } else {
           let targetZoom = 16.5; 
           let targetPitch = 60;
           let targetBearing = -10;
           let flightSpeed = 1.5;

           if (type === 'poi') {
               targetZoom = 17.8;
               targetPitch = 75;
               targetBearing = 120;
               flightSpeed = 0.6;
               console.log("🚁 MODO DRON CINEMÁTICO DESPLEGADO");
           } else if (type === 'address') {
               targetZoom = 18.5; 
               targetPitch = 65;
           }
           
           map.current.flyTo({ 
               center: bestMatch.center, 
               zoom: targetZoom, 
               pitch: targetPitch, 
               bearing: targetBearing, 
               speed: flightSpeed, 
               curve: 1.2,
               essential: true 
           });
        }
      } else {
          console.warn("❌ Radar: Destino no encontrado.");
      }
    } catch (error) {
      console.error("🚨 Error:", error);
    }
  };

  // Retornamos la función para que el archivo principal la pueda usar
  return { searchCity };
};