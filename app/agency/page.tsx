"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgencyPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente al mapa principal (donde está el nuevo Radar)
    router.push("/");
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Cargando Stratos OS...</p>
      </div>
    </div>
  );
}