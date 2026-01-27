// app/components/billing/useMyPlan.ts
"use client";

import { useEffect, useState } from "react";
import { getBillingGateAction } from "@/app/actions";

export function useMyPlan() {
  const [plan, setPlan] = useState<any>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res: any = await getBillingGateAction();
      if (res?.success && res?.data) {
        setPlan(res.data);
        // ✅ Activo si NO hay paywall (TRIAL cuenta como acceso)
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
  };

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!alive) return;
      await load();
    };
    run();

    const onRefresh = () => load();
    window.addEventListener("billing-refresh-signal", onRefresh as any);

    return () => {
      alive = false;
      window.removeEventListener("billing-refresh-signal", onRefresh as any);
    };
  }, []);

  return { plan, isActive, loading };
}
