import type { AgencyOSState, Offer, Case, WorkOrder, Review, Target, StorageScope } from "./agencyos.types";
import { AGENCYOS_VERSION } from "./agencyos.types";
import { computeAgencyStats, computeCaseScore } from "./agencyos.score";

const rid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export function createEmptyAgencyOSState(scope: StorageScope): AgencyOSState {
  return {
    version: AGENCYOS_VERSION,
    scope,
    updatedAt: 0,
    offers: [],
    cases: [],
    workOrders: [],
    agencyStats: { score: 0, onTimePct: 0, reworkPct: 0, offers: 0, cases: 0, workOrders: 0 },
  };
}

export function createOffer(target: Target, services: string[]): Offer {
  return {
    id: rid("offer"),
    propertyId: String(target.propertyId),
    createdAt: Date.now(),
    status: "ACTIVE",
    services,
  };
}

export function createCase(offer: Offer, triads: string[], services: string[]): Case {
  const c: Case = {
    id: rid("case"),
    offerId: offer.id,
    propertyId: offer.propertyId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "ACTIVE",
    triads,
    services,
    score: 0,
  };
  c.score = computeCaseScore(c);
  return c;
}

export function createWorkOrders(c: Case, services: string[]): WorkOrder[] {
  const now = Date.now();
  return services.map((sid) => ({
    id: rid("wo"),
    caseId: c.id,
    propertyId: c.propertyId,
    serviceId: sid,
    createdAt: now,
    updatedAt: now,
    status: "TODO",
  }));
}

export function createReview(c: Case): Review {
  return {
    caseId: c.id,
    ownerId: "owner_demo",
    publicStatus: "EXCELLENT",
    comment: "“Ejecución impecable, tiempos perfectos.”",
    publishedAt: Date.now(),
  };
}

export function createAgencyStats(state: AgencyOSState) {
  return computeAgencyStats(state);
}

export function applySmoke(state: AgencyOSState, target: Target, services: string[]) {
  const offer = createOffer(target, services);

  // triads placeholder (no te rompo nada)
  const triads = services.slice(0, 3).map((s) => `TRIAD_${s}`);

  const c = createCase(offer, triads, services);
  const wos = createWorkOrders(c, services);

  const next: AgencyOSState = {
    ...state,
    version: AGENCYOS_VERSION,
    updatedAt: Date.now(),
    target,
    offers: [offer, ...(state.offers || [])],
    cases: [c, ...(state.cases || [])],
    workOrders: [...wos, ...(state.workOrders || [])],
    review: createReview(c),
  };

  next.agencyStats = createAgencyStats(next);
  return next;
}
