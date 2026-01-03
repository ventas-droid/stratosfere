// @ts-nocheck
"use client";

import { useEffect } from "react";

const KEY_LAST_ID = "agencyos:last_property_id";
const KEY_LAST_SNAPSHOT = "agencyos:last_property_snapshot";

export default function AgencyOSPropertyBridge() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const write = (prop: any) => {
      if (!prop) return;

      const id = prop?.id ?? prop?.propertyId ?? prop?._id ?? prop?.uid;
      if (!id) return;

      try {
        localStorage.setItem(KEY_LAST_ID, String(id));
        localStorage.setItem(KEY_LAST_SNAPSHOT, JSON.stringify(prop));
      } catch {}
    };

    // 1) MAPA / DETAILS (izquierda)
    const onOpenDetails = (e: any) => write(e?.detail);

    // 2) MIS ACTIVOS / SERVICIOS (derecha) -> ESTE ES EL IMPORTANTE PARA services
    const onEditAssetServices = (e: any) => write(e?.detail);

    // 3) Cuando se guardan cambios de servicios/prop desde MarketPanel
    const onUpdateDetailsLive = (e: any) => write(e?.detail);

    window.addEventListener("open-details-signal", onOpenDetails);
    window.addEventListener("edit-asset-services", onEditAssetServices);
    window.addEventListener("update-details-live", onUpdateDetailsLive);

    return () => {
      window.removeEventListener("open-details-signal", onOpenDetails);
      window.removeEventListener("edit-asset-services", onEditAssetServices);
      window.removeEventListener("update-details-live", onUpdateDetailsLive);
    };
  }, []);

  return null;
}
