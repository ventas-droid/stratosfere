// @ts-nocheck
"use client";

const KEY_STATE = "stratos_agency_state_v1";
const KEY_TARGET = "agencyos:last_property_snapshot";

// --- CARGAR ESTADO ---
export function loadAgencyOSState(scope: any) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_STATE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Storage Load Error:", e);
    return null;
  }
}

// --- GUARDAR ESTADO ---
export function saveAgencyOSState(scope: any, state: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY_STATE, JSON.stringify(state));
    console.log("💾 AgencyOS State Saved", state);
  } catch (e) {
    console.error("Storage Save Error:", e);
  }
}

// --- LEER EL BRIDGE (Lo que viene del mapa) ---
export function readLastTargetFromBridge() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_TARGET);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}