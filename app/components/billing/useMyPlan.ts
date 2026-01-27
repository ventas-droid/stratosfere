// app/components/billing/useMyPlan.ts
"use client";

import { useEffect, useState } from "react";
import { getBillingGateAction } from "@/app/actions";

export function useMyPlan() {
  const [plan, setPlan] = useState<any>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res: any = await getBillingGateAction();
        if (!alive) return;

        if (res?.success && res?.data) {
          // res.data = { plan, status, showPaywall, trialEndsAt }
          setPlan(res.data);

          // ✅ “activo” = NO paywall (TRIAL cuenta como activo)
          setIsActive(!res.data.showPaywall);
        } else {
          setPlan(null);
          setIsActive(false);
        }
      } catch {
        setPlan(null);
        setIsActive(false);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { plan, isActive, loading };
}
