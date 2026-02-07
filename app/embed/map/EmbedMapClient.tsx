"use client";

import AliveMap from "@/app/components/alive-map/AliveMap";
import { useEffect } from "react";

type Props = {
  agency: string;
  role: string;
  access: string;
};

export default function EmbedMapClient({ agency, role, access }: Props) {
  // Ajusta el modo que usa tu app internamente
  const systemMode =
    role?.toUpperCase() === "AGENCIA" || role?.toUpperCase() === "AGENCY"
      ? "AGENCY"
      : "EXPLORER";

  // Opcional: deja contexto en localStorage por si tu lógica lo usa
  useEffect(() => {
    try {
      localStorage.setItem("stratos:embed", "1");
      localStorage.setItem("stratos:agency", agency);
      localStorage.setItem("stratos:role", role);
      localStorage.setItem("stratos:access", access);
    } catch {}
  }, [agency, role, access]);

  // Handlers “noop” (AliveMap los exige)
  const onMapLoad = () => {};
  const onRegisterSearch = () => {};

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <AliveMap
        onMapLoad={onMapLoad}
        systemMode={systemMode}
        onRegisterSearch={onRegisterSearch}
      />
    </div>
  );
}