// @ts-nocheck
"use client";

import { useCallback } from 'react'; // <-- AÑADA ESTO
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import MapNanoCard from './ui-panels/MapNanoCard';
import VipAgencyMarker from './ui-panels/VipAgencyMarker';

export const useMapMarkers = (map: any, markersRef: any, agencyMarkersRef: any) => {

  // -------------------------------------------------------------------
  // D. PINTOR DE MARCADORES (UNIFICADO: SOLO USAMOS MapNanoCard)
  // --------------------------------------------------------------------
  const updateMarkers = () => {
    const mapInstance = map.current;
    if (!mapInstance || !mapInstance.getSource("properties")) return;

    // Solo pintamos propiedades individuales (no clusters)
    const features = mapInstance.querySourceFeatures("properties", {
      filter: ["!", ["has", "point_count"]],
    });

    // Ordenar visualmente para que las del sur queden por delante (Efecto 3D)
    features.sort((a: any, b: any) => b.geometry.coordinates[1] - a.geometry.coordinates[1]);
    
    // IDs como string
    const visibleIds = new Set(features.map((f: any) => String(f.properties.id)));

   // Limpiar marcadores viejos (CON DESTRUCCIÓN DE MEMORIA REACT)
    Object.keys(markersRef.current).forEach((id) => {
      if (!visibleIds.has(id)) {
        const targetMarker = markersRef.current[id];
        
        // 🔥 EL MATA-ZOMBIES: Si el marcador tiene un root pegado, lo destruimos para liberar RAM
        if (targetMarker._reactRoot) {
            targetMarker._reactRoot.unmount();
        }
        
        // Borramos el pin del mapa de Mapbox
        targetMarker.remove();
        delete markersRef.current[id];
      }
    });

    // Pintar nuevos marcadores
    features.forEach((feature: any) => {
      const id = String(feature.properties.id);
      if (markersRef.current[id]) return; // Si ya existe, no lo tocamos

      const el = document.createElement("div");
      el.className = "nanocard-marker";
      
      const root = createRoot(el);
      const p = feature.properties;
      // 1. RECUPERACIÓN DE IMAGEN
      let safeImages: any[] = [];
      if (Array.isArray(p.images)) {
        safeImages = p.images.map((i: any) => (typeof i === "string" ? i : i?.url)).filter(Boolean);
      } else if (typeof p.images === 'string') {
        try {
            const parsed = JSON.parse(p.images);
            safeImages = Array.isArray(parsed) ? parsed : [p.images];
        } catch (e) { safeImages = [p.images]; }
      }
      if (safeImages.length === 0 && p.img) safeImages = [p.img];
      const safeImg = safeImages[0] || null;

      // 2. METROS
      const finalM2 = Number(p.mBuilt || p.m2 || p.surface || 0);

     // 3. PARSEO DE USUARIO/SNAPSHOT Y DESCOMPRESIÓN BLINDADA 🔥
      const parseMaybeJSON = (v: any) => {
        if (!v) return null;
        if (typeof v === "object") return v;
        if (typeof v === "string") {
          try {
            const j = JSON.parse(v);
            return j && typeof j === "object" ? j : null;
          } catch {}
        }
        return null;
      };

      const snapObj = parseMaybeJSON(p.ownerSnapshot);
      const userObj = parseMaybeJSON(p.user) || snapObj;
      if (snapObj) p.ownerSnapshot = snapObj;
      if (userObj) p.user = userObj;

      // 🔥 RESCATE DE LA AMNESIA: Desenvasamos Agencia, Open House y Extras
      const openHouseObj = parseMaybeJSON(p.openHouse) || parseMaybeJSON(p.open_house_data);
      const activeCampaignObj = parseMaybeJSON(p.activeCampaign);
      const b2bObj = parseMaybeJSON(p.b2b);
      const servicesArray = typeof p.selectedServices === 'string' ? parseMaybeJSON(p.selectedServices) : p.selectedServices;

      if (openHouseObj) { p.openHouse = openHouseObj; p.open_house_data = openHouseObj; }
      if (activeCampaignObj) p.activeCampaign = activeCampaignObj;
      if (b2bObj) p.b2b = b2bObj;
      p.selectedServices = Array.isArray(servicesArray) ? servicesArray : [];

     p.role = p.role || p.user?.role || p.ownerSnapshot?.role || null;
      p.description = p.description || p.desc || "";

    
      // 🔥 AQUÍ ESTÁ EL CAMBIO: USAMOS SIEMPRE MapNanoCard 🔥
      // Él ya sabe leer "promotedTier" y ponerse Premium solo.
      
      root.render(
          <MapNanoCard
            id={id}
            data={p}
            promotedTier={p.promotedTier}
            isPromoted={p.isPromoted}
            price={p.price}
            priceValue={p.priceValue}
            rawPrice={p.priceValue}
            rooms={p.rooms}
            baths={p.baths}
            mBuilt={finalM2}
            m2={finalM2} 
            selectedServices={p.selectedServices}
            elevator={p.elevator}
            specs={p.specs}
            type={p.type}
            img={safeImg}
            images={safeImages}
            lat={feature.geometry.coordinates[1]}
            lng={feature.geometry.coordinates[0]}
            role={p.role}
            title={p.title}
            description={p.description}
            
           // 🔥 DATOS PUROS (Sin lavar, pasados directamente)
            address={p.address || null}
            city={p.city || null}
            postcode={p.postcode || null}
            region={p.region || null}
            
            communityFees={p.communityFees}
            energyConsumption={p.energyConsumption}
            energyEmissions={p.energyEmissions}
            energyPending={p.energyPending}
            
            // 🔥 INYECCIÓN DE LOS OBJETOS DESEMPAQUETADOS
            openHouse={p.openHouse}
            activeCampaign={p.activeCampaign}
            b2b={p.b2b}
          />
      );

     const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(feature.geometry.coordinates)
        .addTo(mapInstance);

      // 🔥 EL TRUCO: Le pegamos el root al marcador para poder destruirlo después
      (marker as any)._reactRoot = root; 

      markersRef.current[id] = marker;
    });
  };

  // --------------------------------------------------------------------
  // 🔥 2. EL DESPARRAMADOR VIP (Dibuja los HTML sueltos) 🔥
  // --------------------------------------------------------------------
  const updateVipMarkers = () => {
    const mapInstance = map.current;
    if (!mapInstance || !(mapInstance as any).getSource("vip-agencies")) return;

    // Solo busca cacahuetes SUELTOS (los que ya no están agrupados)
    const features = (mapInstance as any).querySourceFeatures("vip-agencies", { filter: ["!", ["has", "point_count"]] });
    const visibleIds = new Set(features.map((f: any) => String(f.properties.uniqueMarkerId)));

    // Limpia los que ya no se ven (CON EL MATA-ZOMBIES)
    Object.keys(agencyMarkersRef.current).forEach((id) => {
      if (!visibleIds.has(id)) {
        const targetMarker = agencyMarkersRef.current[id];
        
        // 🔥 EL MATA-ZOMBIES PARA AGENCIAS VIP
        if (targetMarker._reactRoot) {
            targetMarker._reactRoot.unmount();
        }

        if (targetMarker.remove) targetMarker.remove();
        delete agencyMarkersRef.current[id];
      }
    });

    // Dibuja los nuevos
    features.forEach((feature: any) => {
      const id = String(feature.properties.uniqueMarkerId);
      if (agencyMarkersRef.current[id]) return;

      const el = document.createElement("div");
      el.className = "vip-agency-marker";
      const root = createRoot(el);
      
      const agencyData = JSON.parse(feature.properties.agencyRawData);

      // 🍿 CÁLCULO DEL RETRASO ALEATORIO (Efecto metralleta de 0 a 0.25 seg)
      const popDelay = (Math.random() * 0.25).toFixed(2);

      root.render(
          // 🔥 ENVOLTORIO GREMLIN POP CON TAILWIND PURE
          <div className="animate-gremlin-pop" style={{ animationDelay: `${popDelay}s` }}>
              <VipAgencyMarker 
                  agency={agencyData} 
                  onClick={() => {
                      (mapInstance as any).flyTo({ center: agencyData.coordinates, zoom: 19, pitch: 70, duration: 2500 });
                      if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('open-market-panel', { detail: agencyData }));
                      }
                  }} 
              />
          </div>
      );

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat(feature.geometry.coordinates)
        .addTo(mapInstance as any);
      
      // 🔥 Le pegamos el root al marcador VIP para poder destruirlo después
      (marker as any)._reactRoot = root;
      
      agencyMarkersRef.current[id] = marker;
    });
  };

  // Exportamos las dos funciones
  return { updateMarkers, updateVipMarkers };
};