// app/components/billing/useMyPlan.ts
"use client";

import { useEffect, useState } from "react";

export function useMyPlan() {
  const [plan, setPlan] = useState<any>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // TODO: aquí tu fetch real (server action / api)
        // const res = await getMyPlanAction()
        // if (!alive) return
        // setPlan(res.data)
        // setIsActive(!!res.data?.isActive)

        // placeholder mínimo seguro:
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
