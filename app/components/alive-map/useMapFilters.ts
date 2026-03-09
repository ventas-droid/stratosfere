// @ts-nocheck
"use client";

import { useEffect } from 'react';

// Helper local para detectar "sí" / "true"
const isYes = (val: any) => {
  if (val === true || val === 1) return true;
  if (val === false || val === 0) return false;
  if (val === null || val === undefined) return false;
  const s = String(val).toLowerCase().trim();
  return ['true', '1', 'yes', 'si', 'sí', 'on'].includes(s);
};

export const useMapFilters = (map: any, markersRef: any, updateMarkers: () => void) => {
  
  // ----------------------------------------------------------------------
  // 3. LÓGICA DE FILTRADO INTELIGENTE V2
  // ----------------------------------------------------------------------
  useEffect(() => {
    const handleFilterSignal = (e: any) => {
      if (!map.current || !map.current.getSource('properties')) return;

      const { priceMax, surfaceRange, type, specs, premiumOnly } = e.detail;
      const priceRange = { min: 0, max: priceMax || 999999999 }; 
      console.log(`🔍 FILTRANDO AVANZADO:`, { priceRange, type, specs, premiumOnly });
   
      const source: any = map.current.getSource('properties');
      const sourceFeaturesRaw = (source as any)?._data?.features;
      let masterFeatures: any[] = Array.isArray(sourceFeaturesRaw) ? sourceFeaturesRaw : [];

      masterFeatures = masterFeatures.map((f: any) => {
        const p = f.properties || {};
        const idStr = String(p.id ?? p._id ?? f.id ?? Date.now());

        const priceValue = Number(p.priceValue ?? p.rawPrice ?? (typeof p.price === 'string' ? String(p.price).replace(/\D/g, '') : p.price) ?? 0);
        const m2 = Number(p.m2 ?? p.mBuilt ?? 0);
        const mBuilt = Number(p.mBuilt ?? p.m2 ?? 0);

        let safeServices = [];
        if (Array.isArray(p.selectedServices)) safeServices = p.selectedServices;
        else if (typeof p.selectedServices === 'string') {
            try { safeServices = JSON.parse(p.selectedServices); } catch(err) { safeServices = []; }
        }

        let safeSpecs: any = {};
        if (typeof p.specs === 'object' && p.specs !== null) safeSpecs = p.specs;
        else if (typeof p.specs === 'string') {
            try { safeSpecs = JSON.parse(p.specs); } catch(err) { safeSpecs = {}; }
        }

        return {
          ...f,
          properties: {
            ...p, 
            id: idStr,
            priceValue,
            m2,
            mBuilt,
            selectedServices: safeServices,
            specs: safeSpecs,
            elevator: (isYes(p.elevator) || isYes(p.ascensor) || isYes(p.hasElevator) || isYes(p?.specs?.elevator) || isYes(safeSpecs?.elevator))
          }
        };
      });

      const allData = masterFeatures.filter((f: any) => {
        const pid = f?.properties?.id ?? f?.properties?._id ?? f?.id;
        return pid !== undefined && pid !== null && String(pid).trim() !== "";
      });

      if (allData.length === 0) {
        console.warn("⏳ Filtro recibido pero no hay features válidas aún. No aplico para no borrar NanoCards.");
        return;
      }

      const filteredFeatures = allData.filter(f => {
        const p = f.properties;

        if (premiumOnly === true || String(premiumOnly) === "true") {
           const tier = String(p.promotedTier || "").toUpperCase();
           const isPremium = tier === 'PREMIUM' || p.isPromoted === true || p.premium === true;
           if (!isPremium) return false;
        }

        if (p.priceValue < priceRange.min || p.priceValue > priceRange.max) return false;

        const m2 = p.m2 || Math.floor(p.priceValue / 4000);
        if (m2 < (surfaceRange?.min || 0) || m2 > (surfaceRange?.max || 99999999)) return false;

        if (specs) {
          if (specs.beds > 0 && (p.rooms || 0) < specs.beds) return false;
          if (specs.baths > 0 && (p.baths || 0) < specs.baths) return false;

          if (specs.features && specs.features.length > 0) {
            const safeServices = Array.isArray(p.selectedServices) ? p.selectedServices : [];
            const safeText = ` ${(p.title || '')} ${(p.description || '')} `.toUpperCase();

            const hasAllFeatures = specs.features.every((feat: string) => {
              if (feat === 'pool') return p.pool === true || safeServices.includes('pool') || safeText.includes('PISCINA');
              if (feat === 'garage') return p.garage === true || safeServices.includes('garage') || safeText.includes('GARAJE') || safeText.includes('PARKING');
              if (feat === 'garden') return p.garden === true || safeServices.includes('garden') || safeText.includes('JARDÍN') || safeText.includes('GARDEN');
              if (feat === 'security') return p.security === true || safeServices.includes('security') || safeText.includes('SEGURIDAD') || safeText.includes('VIGILANCIA');
              if (feat === 'terrace') return p.terrace === true || safeServices.includes('terrace') || safeText.includes('TERRAZA');
              if (feat === 'balcony') return p.balcony === true || safeServices.includes('balcony') || safeText.includes('BALCÓN');
              if (feat === 'storage') return p.storage === true || safeServices.includes('storage') || safeText.includes('TRASTERO');
              if (feat === 'ac') return p.ac === true || safeServices.includes('ac') || safeText.includes('AIRE');
              if (feat === 'heating') return p.heating === true || safeServices.includes('heating') || safeText.includes('CALEFACCIÓN');
              if (feat === 'furnished') return p.furnished === true || safeServices.includes('furnished') || safeText.includes('AMUEBLADO');
              return true; 
            });
            if (!hasAllFeatures) return false;
          }
        }

        const pType = String(p.type || "").toLowerCase().trim();
        const targetType = String(type || "all").toLowerCase().trim();
        if (targetType !== "all" && targetType !== "") {
            if (!pType.includes(targetType)) return false; 
        }

        return true;
      });

      // 🔥 3. ACTUALIZAR MAPA (AHORA CON EL MATA-ZOMBIES INTEGRADO)
      Object.values(markersRef.current).forEach((targetMarker: any) => {
          if (targetMarker._reactRoot) {
              targetMarker._reactRoot.unmount(); // Destruye memoria al filtrar
          }
          if (targetMarker.remove) targetMarker.remove();
      });
      markersRef.current = {};

      const src: any = map.current.getSource('properties');
      if (src) {
        src.setData({ type: 'FeatureCollection', features: filteredFeatures });
      }

      map.current.once('idle', () => {
        console.log(`✅ Filtro aplicado: ${filteredFeatures.length} activos encontrados.`);
        updateMarkers();
      });
    };

    window.addEventListener('apply-filter-signal', handleFilterSignal);
    return () => window.removeEventListener('apply-filter-signal', handleFilterSignal);
  }, []); // 🔥 RESTAURADO AL VACÍO ORIGINAL (Cero parpadeos)
};