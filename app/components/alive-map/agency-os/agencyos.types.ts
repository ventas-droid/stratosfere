export const AGENCYOS_VERSION = 1 as const;

export type StorageScope = { ownerId: string; agencyId: string };

export type PublicSatisfaction = "EXCELLENT" | "GOOD" | "OK" | "BAD";

export type OwnerValidation = {
  score: number;
  onTimePct: number;
  reworkPct: number;
  updatedAt: number;
};

export type Target = {
  propertyId: string;
  title?: string;
  city?: string;
  address?: string;
};

export type OfferStatus = "SENT" | "ACTIVE" | "WON" | "LOST";

export type Offer = {
  id: string;
  propertyId: string;
  createdAt: number;
  status: OfferStatus;
  services: string[];
};

export type CaseStatus = "ACTIVE" | "DONE";

export type Case = {
  id: string;
  offerId: string;
  propertyId: string;
  createdAt: number;
  updatedAt: number;
  status: CaseStatus;
  triads: string[];
  services: string[];
  score: number;
};

export type WorkOrderStatus = "TODO" | "DOING" | "DONE";

export type WorkOrder = {
  id: string;
  caseId: string;
  propertyId: string;
  serviceId: string;
  createdAt: number;
  updatedAt: number;
  status: WorkOrderStatus;
};

export type Review = {
  caseId: string;
  ownerId: string;
  publicStatus: PublicSatisfaction;
  comment?: string;
  publishedAt: number;
};

export type AgencyStats = {
  score: number;
  onTimePct: number;
  reworkPct: number;
  offers: number;
  cases: number;
  workOrders: number;
};

export type AgencyOSState = {
  version: number;
  scope: StorageScope;
  updatedAt: number;

  target?: Target;

  offers: Offer[];
  cases: Case[];
  workOrders: WorkOrder[];

  review?: Review;
  ownerValidation?: OwnerValidation;

  agencyStats: AgencyStats;
};
