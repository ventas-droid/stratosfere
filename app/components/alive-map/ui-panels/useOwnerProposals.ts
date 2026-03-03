// Ubicación: ./app/components/alive-map/ui-panels/useOwnerProposals.ts
import { useState, useRef, useEffect } from "react";
import { getOwnerProposalsAction } from "@/app/actions";

export const useOwnerProposals = (
  systemMode: string,
  activeUserKey: string | null,
  rightPanel: string,
  activeCampaignId: string | null
) => {
  const [ownerProposals, setOwnerProposals] = useState<any[]>([]);
  const [ownerProposalsLoading, setOwnerProposalsLoading] = useState(false);
  const [ownerProposalsManualList, setOwnerProposalsManualList] = useState(false);

  const ownerProposalsReqRef = useRef(0);

  const loadOwnerProposals = async () => {
    // ✅ PRIVACIDAD: OwnerProposals SOLO en EXPLORER (particular)
    if (systemMode !== "EXPLORER") return;
    // 🚫 sin sesión
    if (!activeUserKey || activeUserKey === "anon") return;
    // ✅ evita doble llamada si ya está cargando
    if (ownerProposalsLoading) return;

    const reqId = ++ownerProposalsReqRef.current;

    try {
      setOwnerProposalsLoading(true);

      const fn = getOwnerProposalsAction as any;
      if (typeof fn !== "function") {
        console.warn("getOwnerProposalsAction is not a function");
        if (reqId === ownerProposalsReqRef.current) setOwnerProposals([]);
        return;
      }

      const r = await fn();
      if (reqId !== ownerProposalsReqRef.current) return;

      if (!r?.success) {
        console.warn("getOwnerProposalsAction failed:", r?.error);
        setOwnerProposals([]);
        return;
      }

      const rawList = Array.isArray(r?.data) ? r.data : [];
      
      // ✅ anti-duplicados por id
      const dedup = new Map<string, any>();
      for (const x of rawList) {
        const id = String(x?.id || "").trim();
        if (!id) continue;
        if (!dedup.has(id)) dedup.set(id, x);
      }

    // ✅ BLINDAJE TÁCTICO: catálogo de servicios (TS Friendly)
      const catalog: any[] =
        typeof window !== "undefined" && Array.isArray((window as any).SERVICES_CATALOG)
          ? (window as any).SERVICES_CATALOG
          : typeof globalThis !== "undefined" && Array.isArray((globalThis as any).SERVICES_CATALOG)
          ? (globalThis as any).SERVICES_CATALOG
          : [];

      const normalized = Array.from(dedup.values()).map((raw: any) => {
        const services = (Array.isArray(raw?.serviceIds) ? raw.serviceIds : [])
          .map((sid: any) => String(sid).trim())
          .filter(Boolean)
          .map((sid: string) => {
            const hit = catalog.find((s: any) => String(s?.id) === sid);
            return hit
              ? { id: String(hit.id), label: String(hit.label || hit.name || sid), mode: hit.mode || hit.category }
              : { id: sid, label: sid, mode: undefined };
          });

        const terms = raw?.terms || raw?.financials || {};
        const src = { ...raw, ...terms }; 

        const totalAmount = Number(src.totalAmount || src.commissionTotalEur || src.amount || 0);
        const commissionPct = Number(src.commissionPct || src.commission || 0);
        const vatPct = Number(src.commissionIvaPct || src.vatPct || src.ivaPct || src.vat || 21);
        const duration = Number(src.exclusiveMonths || src.durationMonths || src.months || src.duration || 0);
        const isExclusive = Boolean(
            src.exclusiveMandate === true || src.isExclusive === true || src.exclusive === true || 
            String(src.exclusiveMandate) === "true" || String(src.isExclusive) === "true"
        );

        const baseEur = totalAmount > 0 ? (totalAmount / (1 + (vatPct/100))) : 0;
        const ivaEur = totalAmount - baseEur;

        return {
          id: String(raw?.id || ""),
          status: raw?.status || "SENT",
          createdAt: raw?.createdAt || null,
          property: raw?.property || null,
          agency: raw?.agency || null,
          message: raw?.message || "",
          conversationId: raw?.conversationId ? String(raw.conversationId) : "",
          services,
          terms: {
              exclusive: isExclusive,
              months: duration,
              commissionPct: commissionPct,
              ivaPct: vatPct,
              commissionTotalEur: totalAmount,
              commissionBaseEur: baseEur, 
              ivaAmountEur: ivaEur
          }
        };
      });

      setOwnerProposals(normalized);
    } catch (e) {
      console.error("loadOwnerProposals error:", e);
      setOwnerProposals([]);
    } finally {
      if (reqId === ownerProposalsReqRef.current) setOwnerProposalsLoading(false);
    }
  };

  useEffect(() => {
    if (systemMode !== "EXPLORER") return;
    if (!activeUserKey || activeUserKey === "anon") return;

    if (rightPanel === "OWNER_PROPOSALS" || !!activeCampaignId) {
      loadOwnerProposals();
    }
  }, [systemMode, activeUserKey, rightPanel, activeCampaignId]);

  return {
    ownerProposals,
    ownerProposalsLoading,
    ownerProposalsManualList,
    setOwnerProposalsManualList
  };
};