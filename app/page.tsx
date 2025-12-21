// @ts-nocheck
"use client";

import React, { useMemo, useState } from "react";
import AliveMap from "./components/alive-map/AliveMap";
import UIPanels from "./components/alive-map/ui-panels";

export default function Page() {
  const [systemMode, setSystemMode] = useState("GATEWAY");
  const [mapInstance, setMapInstance] = useState(null);

  // Bridge: UIPanels a veces usa map.flyTo() y a veces map.current.*
  const mapBridge = useMemo(() => {
    return {
      current: mapInstance,
      flyTo: (opts) => mapInstance?.flyTo?.(opts),
      jumpTo: (opts) => mapInstance?.jumpTo?.(opts),
      getConfig: (...args) => mapInstance?.getConfig?.(...args),
      setConfig: (...args) => mapInstance?.setConfig?.(...args),
    };
  }, [mapInstance]);

  const [favorites, setFavorites] = useState([]);
  const onToggleFavorite = (prop) => {
    const key = prop?.id ?? prop?.price ?? JSON.stringify(prop);
    setFavorites((prev) => {
      const exists = prev.some((p) => (p?.id ?? p?.price ?? JSON.stringify(p)) === key);
      return exists
        ? prev.filter((p) => (p?.id ?? p?.price ?? JSON.stringify(p)) !== key)
        : [prop, ...prev];
    });
  };

  const [lang, setLang] = useState("ES");
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <AliveMap systemMode={systemMode} onMapLoad={setMapInstance} />
      <UIPanels
        map={mapBridge}
        onToggleFavorite={onToggleFavorite}
        favorites={favorites}
        lang={lang}
        setLang={setLang}
        soundEnabled={soundEnabled}
        toggleSound={() => setSoundEnabled((s) => !s)}
        systemMode={systemMode}
        setSystemMode={setSystemMode}
      />
    </div>
  );
}


