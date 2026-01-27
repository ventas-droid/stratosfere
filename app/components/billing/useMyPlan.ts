// app/components/billing/useMyPlan.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { getBillingGateAction } from "@/app/actions";

export function useMyPlan() {
  const [plan, setPlan] = useState<any>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res: any = await getBillingGateAction();

      if (res?.success && res?.data) {
        // data: { plan, status, showPaywall, trialEndsAt }
        setPlan(res.data);

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
    let alive = true;

    const run = async () => {
      if (!alive) return;
      await refresh();
    };

    run();

    // ✅ refresh “server-truth” sin localStorage
    const onRefresh = () => refresh();
    window.addEventListener("billing-refresh-signal", onRefresh as any);

    return () => {
      alive = false;
      window.removeEventListener("billing-refresh-signal", onRefresh as any);
    };
  }, [refresh]);

  return { plan, isActive, loading, refresh };
}
