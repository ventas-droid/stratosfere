import type { AgencyOSState, AgencyStats, Case } from "./agencyos.types";

export function computeCaseScore(c: Case): number {
  // Score simple pero estable (sin liarte)
  const base = 50;
  const triadsBoost = Math.min(30, (c.triads?.length || 0) * 5);
  const servicesBoost = Math.min(20, (c.services?.length || 0) * 1);
  const score = base + triadsBoost + servicesBoost;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function computeAgencyStats(state: AgencyOSState): AgencyStats {
  const offers = state.offers?.length || 0;
  const cases = state.cases?.length || 0;
  const workOrders = state.workOrders?.length || 0;

  // Score global = media de cases (si hay)
  const avgCase =
    cases > 0
      ? Math.round(
          state.cases.reduce((acc, c) => acc + (c.score || 0), 0) / Math.max(1, cases)
        )
      : 0;

  // Por ahora: estable
  const onTimePct = 100;
  const reworkPct = 0;

  return {
    score: avgCase || 100,
    onTimePct,
    reworkPct,
    offers,
    cases,
    workOrders,
  };
}
