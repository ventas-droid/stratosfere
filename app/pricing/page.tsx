import Link from "next/link";

export const metadata = {
  title: "Pricing — Stratosfere",
  description: "Planes y precios de Stratosfere.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* --- HEADER (INTACTO CON SUS ENLACES) --- */}
        <header className="flex items-start justify-between gap-6">
          <div>
            <div className="text-xs font-bold tracking-[0.25em] uppercase text-zinc-500">
              Stratosfere
            </div>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
              Pricing
            </h1>
            <p className="mt-4 text-zinc-600 max-w-2xl">
              Acceso a Stratosfere OS. Elige entre publicación puntual para particulares 
              o la potencia completa de la suite para agencias. Pagos seguros vía Mollie.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-bold tracking-widest uppercase text-zinc-600 hover:text-black"
            >
              Inicio
            </Link>
            <Link
              href="/terms"
              className="text-sm font-bold tracking-widest uppercase text-zinc-600 hover:text-black"
            >
              Términos
            </Link>
          </div>
        </header>

        {/* --- SECCIÓN DE PLANES (CAMBIADO A 2 COLUMNAS: PARTICULAR VS AGENCIA) --- */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* PLAN 1: PARTICULAR (PAGO ÚNICO) */}
          <PlanCard
            title="Particular"
            price="9,90€"
            period="pago único"
            desc="Para propietarios que quieren vender o alquilar sin ataduras."
            items={[
              "Publicación de propiedad",
              "Visibilidad máxima en mapa",
              "Gestión de interesados",
              "Fichas de detalle completas",
              "Pago único (sin renovaciones)"
            ]}
          />

          {/* PLAN 2: AGENCIA (SUSCRIPCIÓN) */}
          <PlanCard
            title="Agencia"
            price="49,90€"
            period="/ mes"
            highlight // Esto lo pone en negro (Recomendado)
            desc="Stratosfere OS completo para equipos y profesionales."
            items={[
              "Cartera ilimitada (Mi Stock)",
              "Gestión de activos y CRM",
              "Chat y Workflows avanzados",
              "Soporte prioritario",
              "Cancelable en cualquier momento"
            ]}
          />

        </section>

        {/* --- FOOTER LEGAL (INTACTO CON SUS ENLACES) --- */}
        <section className="mt-10 border-t border-zinc-200 pt-8 text-sm text-zinc-600">
          <p>
            <strong className="text-black">Cancelación Agencia:</strong> puedes cancelar en cualquier momento.
            El acceso permanece activo hasta el final del periodo facturado.
          </p>
          <p className="mt-2">
            <strong className="text-black">Reembolsos:</strong> consulta la{" "}
            <Link href="/refunds" className="underline text-black">
              política de reembolso
            </Link>
            .
          </p>
          <p className="mt-2">
            <strong className="text-black">Legal:</strong>{" "}
            <Link href="/terms" className="underline text-black">
              Términos
            </Link>{" "}
            ·{" "}
            <Link href="/privacy" className="underline text-black">
              Privacidad
            </Link>{" "}
            ·{" "}
            <Link href="/refunds" className="underline text-black">
              Reembolsos
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

// --- COMPONENTE VISUAL (LIGERO AJUSTE PARA MOSTRAR "PERIOD" PEQUEÑO AL LADO DEL PRECIO) ---
function PlanCard({
  title,
  price,
  period,
  desc,
  items,
  highlight,
}: {
  title: string;
  price: string;
  period: string;
  desc: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border p-6 bg-white transition-all hover:shadow-lg",
        highlight ? "border-black ring-1 ring-black" : "border-zinc-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black tracking-[0.25em] uppercase text-zinc-500">
            Plan
          </div>
          <h2 className="mt-2 text-xl font-extrabold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-zinc-600 min-h-[40px]">{desc}</p>
        </div>

        {highlight ? (
          <span className="text-[10px] font-black tracking-widest uppercase border border-black bg-black text-white px-2 py-1 rounded-full">
            Recomendado
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold tracking-tight">{price}</span>
        <span className="text-sm font-medium text-zinc-500">{period}</span>
      </div>

      <ul className="mt-6 space-y-3 text-sm text-zinc-700 mb-8">
        {items.map((x) => (
          <li key={x} className="flex gap-2">
            <span className={`mt-[7px] h-1.5 w-1.5 rounded-full shrink-0 ${highlight ? "bg-black" : "bg-zinc-400"}`} />
            <span>{x}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/register"
        className={[
          "inline-flex w-full items-center justify-center rounded-xl border px-4 py-3 text-xs font-black tracking-widest uppercase transition-colors",
          highlight 
            ? "border-black bg-black text-white hover:bg-zinc-800" 
            : "border-black bg-white text-black hover:bg-zinc-50"
        ].join(" ")}
      >
        Empezar
      </Link>
    </div>
  );
}