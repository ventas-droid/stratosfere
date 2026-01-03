// @ts-nocheck
import type { StorageScope, Target, AgencyOSState } from "./agencyos.types";
import { loadAgencyOSState, saveAgencyOSState, readLastTargetFromBridge } from "./agencyos.storage.local";
import { applySmoke } from "./agencyos.engine";

// Helper interno para simular servicios si no existen
function resolveServicesForProperty(id: string) {
    return ["PHOTO_PRO", "LEGAL_CHECK", "PORTAL_PREMIUM"];
}

export type SmokeInput = {
  scope: StorageScope;
  target?: Target | null;
};

// --- FUNCIÓN PRINCIPAL DEL MOTOR ---
export function runAgencyOSSmoke(input?: Partial<SmokeInput>) {
  console.log("💨 SMOKE PROTOCOL INITIATED");
  const scope = input?.scope || { ownerId: "owner_demo", agencyId: "agency_demo" };
  
  let prev = loadAgencyOSState(scope);
  if (!prev) prev = { version: 1, scope, offers: [], cases: [], workOrders: [], agencyStats: { score: 0 } };

  const target = input?.target || prev.target || readLastTargetFromBridge();
  
  if (!target?.propertyId) {
    console.warn("SMOKE: Target Missing");
    return { state: prev, message: "SMOKE ABORTED: No Target Locked." };
  }

  const services = resolveServicesForProperty(target.propertyId);
  const next = applySmoke(prev, target, services);

  saveAgencyOSState(scope, next);

  return {
    state: next,
    message: `SMOKE EXECUTED: Tactical Data Generated for ID ${target.propertyId}`,
    ok: true,
    case: next.cases[0]
  };
}

// --- 🔥 ESTA ES LA PIEZA QUE LE FALTABA Y CAUSA EL ERROR ROJO 🔥 ---
export function exposeAgencyOSSmokeToWindow() {
  if (typeof window === "undefined") return;
  try {
    (window as any).AgencyOS = (window as any).AgencyOS || {};
    (window as any).AgencyOS.runSmoke = (opts: any) => runAgencyOSSmoke(opts);
    console.log("✅ AgencyOS Smoke Protocol Exposed to Window");
  } catch (e) {
    console.error("Failed to expose Smoke to window", e);
  }
}