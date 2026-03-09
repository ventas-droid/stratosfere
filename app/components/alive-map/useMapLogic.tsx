// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// 🔥 LOS 5 ESCUADRONES TÁCTICOS EXTRAÍDOS
import { useMapWebsockets } from './useMapWebsockets';
import { useMapSearch } from './useMapSearch'; 
import { useMapFlight } from './useMapFlight'; 
import { useMapMarkers } from './useMapMarkers'; 
import { useMapFilters } from './useMapFilters'; 

// ACCIONES DE BASE DE DATOS
import { getGlobalPropertiesAction } from '@/app/actions';
import { getVipAgenciesAction } from '@/app/actions-zones';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXNpZHJvMTAxLSIsImEiOiJjbWowdDljc3MwMWd2M2VzYTdkb3plZzZlIn0.w5sxTH21idzGFBxLSMkRIw';

// Helper universal
const isYes = (val: any) => {
  if (val === true || val === 1) return true;
  if (val === false || val === 0) return false;
  if (val === null || val === undefined) return false;
  const s = String(val).toLowerCase().trim();
  return ['true', '1', 'yes', 'si', 'sí', 'on'].includes(s);
};

// ----------------------------------------------------------------------
// CEREBRO CENTRAL DEL MAPA (ORQUESTADOR)
// ----------------------------------------------------------------------
export const useMapLogic = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef({});
  const agencyMarkersRef = useRef<any>({});
  
  // 🚀 1. ACTIVAMOS LAS TELECOMUNICACIONES (Websockets)
  useMapWebsockets();

  // 🚀 2. ACTIVAMOS EL BUSCADOR TÁCTICO (OmniSearch)
  const { searchCity } = useMapSearch(map);

  // 🚀 3. ACTIVAMOS EL PILOTO AUTOMÁTICO (Teletransporte)
  useMapFlight(map);

  // 🚀 4. ACTIVAMOS A LOS PINTORES DE TARJETAS (NanoCards y VIPs)
  const { updateMarkers, updateVipMarkers } = useMapMarkers(map, markersRef, agencyMarkersRef);

  // 🚀 5. ACTIVAMOS LOS FILTROS INTELIGENTES
  useMapFilters(map, markersRef, updateMarkers);

  // --------------------------------------------------------------------
  // A. INICIALIZACIÓN DEL MAPA (MOTOR ELITE V2 - 3D REAL)
  // --------------------------------------------------------------------
  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [-3.6883, 40.4280], 
      zoom: 16, 
      pitch: 75, 
      bearing: -20,
      antialias: true,
      projection: 'globe'
    });

    map.current.on('style.import.load', () => {
        map.current.setConfigProperty('basemap', 'show3dObjects', true);
        map.current.setConfigProperty('basemap', 'showLandmarks', true);
        
        const hour = new Date().getHours();
        let currentLighting = 'day'; 
        if (hour >= 20 || hour < 7) currentLighting = 'night';
        else if (hour >= 18) currentLighting = 'dusk';
        else if (hour >= 7 && hour < 9) currentLighting = 'dawn';
        
        map.current.setConfigProperty('basemap', 'lightPreset', currentLighting); 
        map.current.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
        map.current.setConfigProperty('basemap', 'showTransitLabels', false);
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }),
      'bottom-left'
    );

    map.current.on('load', () => {
      console.log("🟢 SISTEMA CARGADO Y OPERATIVO");
      setIsLoaded(true);

      // 🔥 BALIZA RADAR (Sensibilidad Máxima para Columnas Publicitarias)
      setInterval(() => {
          if (map.current) {
              const center = map.current.getCenter();
              window.dispatchEvent(new CustomEvent('map-center-updated', { 
                  detail: { lng: center.lng, lat: center.lat } 
              }));
          }
      }, 1000);

      if (map.current.getSource('properties')) {
        (map.current.getSource('properties') as any).setData({ type: 'FeatureCollection', features: [] });
      } else {
        map.current.addSource('properties', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          cluster: true,
          clusterMaxZoom: 15,
          clusterRadius: 80
        });
      }

      if (!map.current.getLayer('clusters')) {
        map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'properties',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#0071e3',
            'circle-radius': ['step', ['get', 'point_count'], 25, 100, 35, 750, 45],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 1,
            'circle-emissive-strength': 1
          }
        });
      }

      if (!map.current.getLayer('cluster-count')) {
        map.current.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'properties',
          filter: ['has', 'point_count'],
          layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['Arial Unicode MS Bold'], 'text-size': 16 },
          paint: { 'text-color': '#ffffff', 'text-emissive-strength': 1 }
        });
      }

      map.current.on('click', 'clusters', (e: any) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource('properties').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
          if (err) return;
          map.current.flyTo({ center: features[0].geometry.coordinates as [number, number], zoom: zoom + 1, speed: 0.5 });
        });
      });
      map.current.on('mouseenter', 'clusters', () => { map.current.getCanvas().style.cursor = 'pointer'; });
      map.current.on('mouseleave', 'clusters', () => { map.current.getCanvas().style.cursor = ''; });

      if (!map.current.getSource('vip-agencies')) {
        map.current.addSource('vip-agencies', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 60
        });
      }

      if (!map.current.getLayer('vip-clusters')) {
        map.current.addLayer({
          id: 'vip-clusters',
          type: 'circle',
          source: 'vip-agencies',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#eab308',
            'circle-radius': ['step', ['get', 'point_count'], 30, 10, 40, 50, 50],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.95
          }
        });
      }

      if (!map.current.getLayer('vip-cluster-count')) {
        map.current.addLayer({
          id: 'vip-cluster-count',
          type: 'symbol',
          source: 'vip-agencies',
          filter: ['has', 'point_count'],
          layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['Arial Unicode MS Bold'], 'text-size': 16 },
          paint: { 'text-color': '#ffffff' }
        });
      }

      map.current.on('click', 'vip-clusters', (e: any) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['vip-clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource('vip-agencies').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
          if (err) return;
          map.current.flyTo({ center: features[0].geometry.coordinates as [number, number], zoom: zoom + 1.5, speed: 0.8 });
        });
      });
      map.current.on('mouseenter', 'vip-clusters', () => { map.current.getCanvas().style.cursor = 'pointer'; });
      map.current.on('mouseleave', 'vip-clusters', () => { map.current.getCanvas().style.cursor = ''; });

      map.current.on('moveend', () => {
          updateMarkers();
          updateVipMarkers();
          
          const center = map.current.getCenter();
          window.dispatchEvent(new CustomEvent('map-center-updated', { detail: { lng: center.lng, lat: center.lat } }));
      });

      // 🔥 EL PERRO DE CAZA (Lee el CP en pleno vuelo al milímetro)
      map.current.on('move', () => {
          const center = map.current.getCenter();
          window.dispatchEvent(new CustomEvent('map-center-updated', { detail: { lng: center.lng, lat: center.lat } }));
      });

      updateMarkers();

      setTimeout(() => {
          if (map.current) {
              const initialCenter = map.current.getCenter();
              window.dispatchEvent(new CustomEvent('map-center-updated', { detail: { lng: initialCenter.lng, lat: initialCenter.lat } }));
          }
      }, 500);
      
    });
  }, [updateMarkers, updateVipMarkers]); 

  // --------------------------------------------------------------------
  // B. RECEPTOR DE NUEVAS PROPIEDADES (ADD PROPERTY) 
  // --------------------------------------------------------------------
  useEffect(() => {
    const handleNewProperty = async (event: any) => {
      const formData = event.detail;
      if (!map.current || !formData) return;

      let baseCoords = null; 
      if (formData.coordinates && Array.isArray(formData.coordinates) && formData.coordinates.length === 2) {
          baseCoords = formData.coordinates;
      } else if (formData.lng && formData.lat) {
          baseCoords = [Number(formData.lng), Number(formData.lat)];
      } else if (formData.longitude && formData.latitude) {
          baseCoords = [Number(formData.longitude), Number(formData.latitude)];
      }

      if (!baseCoords || isNaN(baseCoords[0]) || isNaN(baseCoords[1])) return;
      
      const jitter = () => (Math.random() - 0.5) * 0.0004;
      const finalCoords = [baseCoords[0] + jitter(), baseCoords[1] + jitter()];

      const userObj = formData.user && typeof formData.user === 'object' ? formData.user : null;
      const ownerSnapObj = formData.ownerSnapshot && typeof formData.ownerSnapshot === 'object' ? formData.ownerSnapshot : null;

      const newFeature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: baseCoords },
        properties: {
          ...formData,
          id: String(formData.id), 
          priceValue: Number(formData.price || 0),
          m2: Number(formData.mBuilt || 0),
          mBuilt: Number(formData.mBuilt || 0),
          elevator: isYes(formData.elevator),
          selectedServices: Array.isArray(formData.selectedServices) ? formData.selectedServices : [],
          img: formData.img || (formData.images && formData.images.length > 0 ? formData.images[0] : null),
          user: userObj ? JSON.stringify(userObj) : null,
          ownerSnapshot: ownerSnapObj ? JSON.stringify(ownerSnapObj) : null
        }
      };
      
      const src: any = map.current.getSource('properties');
      if (src && (src as any)._data) {
        const currentFeatures = (src as any)._data.features || [];
        const others = currentFeatures.filter((f: any) => String(f.properties.id) !== String(formData.id));
        src.setData({ type: 'FeatureCollection', features: [...others, newFeature] });
        map.current.flyTo({ center: finalCoords, zoom: 18, pitch: 60 });
        map.current.once('idle', () => updateMarkers());
      }
    };

    window.addEventListener('add-property-signal', handleNewProperty);
    return () => window.removeEventListener('add-property-signal', handleNewProperty);
  }, [updateMarkers]);

  // --------------------------------------------------------------------
  // C. SISTEMA DE ACTUALIZACIÓN EN TIEMPO REAL (UPDATE PROPERTY)
  // --------------------------------------------------------------------
  useEffect(() => {
    const handleUpdateProperty = (event: any) => {
      const { id, updates } = event.detail; 
      if (!map.current) return;

      const updateSource: any = map.current.getSource('properties');
      if (updateSource && (updateSource as any)._data) {
        const currentFeatures = (updateSource as any)._data.features || [];
        const updatedFeatures = currentFeatures.map((f: any) => {
          if (String(f.properties.id) === String(id)) {
            const safeUpdates = { ...updates };
            ['images', 'b2b', 'openHouse', 'user', 'ownerSnapshot', 'specs'].forEach(key => {
                if (safeUpdates[key] && typeof safeUpdates[key] === 'object') {
                    safeUpdates[key] = JSON.stringify(safeUpdates[key]); 
                }
            });

            return {
              ...f,
              properties: {
                ...f.properties,
                ...safeUpdates,
                priceValue: updates.price ? Number(updates.price) : f.properties.priceValue,
              },
            };
          }
          return f;
        });
        updateSource.setData({ type: 'FeatureCollection', features: updatedFeatures });
        map.current.once('idle', () => updateMarkers());
      }
    };

   window.addEventListener('update-property-signal', handleUpdateProperty);
    return () => window.removeEventListener('update-property-signal', handleUpdateProperty);
  }, [updateMarkers]);

  // --------------------------------------------------------------------
  // D. ESCANER TÁCTICO (RADAR HUD)
  // --------------------------------------------------------------------
  const scanVisibleProperties = () => {
    if (!map.current) return [];
    const bounds = map.current.getBounds();
    const radarSource: any = map.current.getSource('properties');
    if (!radarSource || !(radarSource as any)._data || !(radarSource as any)._data.features) return [];

    return (radarSource as any)._data.features
      .filter((f: any) => bounds.contains([f.geometry.coordinates[0], f.geometry.coordinates[1]]))
      .map((f: any) => ({
          id: f.properties.id,
          address: f.properties.address || "Ubicación Privada",
          price: f.properties.price || "Consultar",
          type: f.properties.type || "Propiedad",
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          gap: []
      }));
  };

  // --------------------------------------------------------------------
  // E. RADAR GLOBAL DINÁMICO (SAAS CLOUD) 
  // --------------------------------------------------------------------
  useEffect(() => {
    if (!map.current) return;
    let debounceTimer: any = null; 

    const executeRadar = async () => {
      try {
        if (!map.current) return;
        const b = map.current.getBounds();
        const bounds = { minLng: b.getWest() - 0.02, maxLng: b.getEast() + 0.02, minLat: b.getSouth() - 0.02, maxLat: b.getNorth() + 0.02 };

        const response = await getGlobalPropertiesAction(bounds);
        const rawData = response.success ? response.data : [];

        const serverData = rawData.filter((p: any) => {
            const status = String(p.status || "").toUpperCase();
            const isPremium = p.promotedTier === 'PREMIUM' || p.isPromoted === true;
            return status === "PUBLICADO" || status === "MANAGED" || status === "ACCEPTED" || isPremium;
        });

        const uniqueMap = new Map();
        serverData.forEach((p: any) => uniqueMap.set(String(p.id), p));
        const unifiedList = Array.from(uniqueMap.values());

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('stratos-inventory-ready', { detail: unifiedList }));
        }

        const coordTracker = new Map<string, number>(); 
        const features = unifiedList.map((p: any) => {
            let lng = Number(p.coordinates ? p.coordinates[0] : (p.lng ?? p.longitude));
            let lat = Number(p.coordinates ? p.coordinates[1] : (p.lat ?? p.latitude));
            if (!lng || !lat || isNaN(lng) || isNaN(lat)) return null;

            const coordKey = `${lng.toFixed(4)},${lat.toFixed(4)}`;
            const count = coordTracker.get(coordKey) || 0;
            if (count > 0) {
                const angle = count * (Math.PI * 2 / 5); 
                const radius = 0.0003 * (1 + Math.floor(count / 5)); 
                lng += Math.cos(angle) * radius; lat += Math.sin(angle) * radius;
            }
            coordTracker.set(coordKey, count + 1);

            return {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [lng, lat] },
                properties: {
                    ...p,
                    id: String(p.id),
                    priceValue: Number(p.rawPrice || p.priceValue || p.price || 0),
                    m2: Number(p.mBuilt || p.m2 || 0),       
                    elevator: isYes(p.elevator)
                }
            };
        }).filter(Boolean); 
       
        const injectSafely = (attempts = 0) => {
            if (!map.current) return;
            const source: any = map.current.getSource('properties');
            if (source) {
                source.setData({ type: 'FeatureCollection', features: features });
                const onSourceData = (e: any) => {
                    if (e.sourceId === 'properties' && map.current?.isSourceLoaded('properties')) {
                        updateMarkers();
                        map.current.off('sourcedata', onSourceData);
                    }
                };
                map.current.on('sourcedata', onSourceData);
                setTimeout(() => { try { updateMarkers(); } catch (e) {} }, 100);
            } else if (attempts < 10) setTimeout(() => injectSafely(attempts + 1), 100);
        };
        injectSafely();
      } catch (e) { console.error("Error en radar:", e); }
    };

    if (isLoaded) executeRadar();
    else map.current.once('load', executeRadar);

    const onMapMoveEnd = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => executeRadar(), 300); 
    };

    map.current.on('moveend', onMapMoveEnd);
    window.addEventListener('force-map-refresh', executeRadar);
    
    return () => {
        if (map.current) map.current.off('moveend', onMapMoveEnd);
        window.removeEventListener('force-map-refresh', executeRadar);
        if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [isLoaded, updateMarkers]); 

  // --------------------------------------------------------------------
  // F. RADAR DE AGENCIAS VIP 
  // --------------------------------------------------------------------
  useEffect(() => {
    if (!map.current || !isLoaded) return;
    const loadVipAgencies = async () => {
      try {
        const response = await getVipAgenciesAction(); 
        const agencies = response?.success ? response.data : [];
        const features = agencies.map((agency: any) => {
            if (!agency.coordinates) return null;
            return {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: agency.coordinates },
                properties: { uniqueMarkerId: `${agency.id}-${agency.targetZone}`, agencyRawData: JSON.stringify(agency) }
            };
        }).filter(Boolean);

        const source: any = map.current.getSource('vip-agencies');
        if (source) {
            source.setData({ type: 'FeatureCollection', features: features });
            map.current.once('idle', () => updateVipMarkers()); 
        }
      } catch (e) { console.error("Error Agencias VIP:", e); }
    };

    loadVipAgencies();
    window.addEventListener('reload-vip-agencies', loadVipAgencies);
    return () => window.removeEventListener('reload-vip-agencies', loadVipAgencies);
  }, [isLoaded, updateVipMarkers]);

  return { mapContainer, map, isMapLoaded: isLoaded, searchCity, scanVisibleProperties };
};