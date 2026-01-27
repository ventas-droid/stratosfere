"use client";

import { useCallback, useEffect, useState } from "react";
import { getBillingGateAction } from "@/app/actions";

type BillingGate = {
  plan?: string;
  status?: string;
  showPaywall?: boolean;
  trialEndsAt?: string | null;
};

export function useMyPlan() {
  const [plan, setPlan] = useState<BillingGate | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await getBillingGateAction();

      if (res?.success && res?.data) {
        setPlan(res.data as BillingGate);
        // ✅ Activo = NO paywall (TRIAL cuenta como acceso)
        setIsActive(!res.data.showPaywall);
      } else {
        setPlan(null);
        setIsActive(false);
      }
    } catch {
      setPlan(null);
      setIsActive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    // ✅ refresh server-truth (sin localStorage)
    const onRefresh = () => {
      void load();
    };

    window.addEventListener("billing-refresh-signal", onRefresh as any);

    return () => {
      window.removeEventListener("billing-refresh-signal", onRefresh as any);
    };
  }, [load]);

  return { plan, isActive, loading };
}
