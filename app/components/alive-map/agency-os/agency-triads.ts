export type ServiceId = string;

export type Target = {
  propertyId: string;
  title: string;
  location?: string;
  serviceIds: ServiceId[];
  snapshot?: any;
  source?: string;
  updatedAt: number;
};

export type OfferStatus = "SENT" | "ACTIVE" | "CLOSED";
export type CaseStatus = "ACTIVE" | "CLOSED";
export type WorkOrderStatus = "ASSIGNED" | "DONE";

export type Offer = {
  id: string;
  propertyId: string;
  serviceIds: ServiceId[];
  status: OfferStatus;
  createdAt: number;
};

export type Case = {
  id: string;
  offerId: string;
  propertyId: string;
  status: CaseStatus;
  score: number;
  createdAt: number;
};

export type WorkOrder = {
  id: string;
  caseId: string;
  propertyId: string;
  serviceId: ServiceId;
  status: WorkOrderStatus;
  createdAt: number;
  completedAt?: number;
};

export type ReviewRating = "EXCELLENT" | "GOOD" | "OK" | "BAD";

export type Review = {
  id: string;
  caseId: string;
  propertyId: string;
  rating: ReviewRating;
  text: string;
  createdAt: number;
  isPublic: boolean;
};

export type Scope = {
  ownerId: string;
  agencyId: string;
};

export type AgencyOSState = {
  version: 1;
  scope: Scope;
  updatedAt: number;
  offers: Offer[];
  cases: Case[];
  workOrders: WorkOrder[];
  reviews: Review[];
};

// ✅ Lo que te faltaba exportar para agency-triads.ts
export type Triad = {
  id: string;
  propertyId: string;
  title: string;
  status: "ACTIVE" | "PENDING" | "CLOSED";
  serviceIds: ServiceId[];
  updatedAt: number;
};
