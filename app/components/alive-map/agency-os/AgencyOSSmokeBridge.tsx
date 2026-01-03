// @ts-nocheck
"use client";

import { useEffect } from "react";
// Importamos directamente del archivo que acabamos de arreglar
import { exposeAgencyOSSmokeToWindow } from "./agencyos.smoke";

export default function AgencyOSSmokeBridge() {
  useEffect(() => {
    // Al montar el componente, exponemos la función global
    // Esto permite que el Dashboard llame a window.AgencyOS.runSmoke si fuera necesario,
    // o simplemente asegura que el motor está listo.
    if (typeof window !== "undefined") {
        exposeAgencyOSSmokeToWindow();
    }
  }, []);

  // Este componente es invisible, solo lógica
  return null;
}