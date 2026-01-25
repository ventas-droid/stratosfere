import Link from "next/link";

export const metadata = {
  title: "Pricing — Stratosfere",
  description: "Planes y precios de Stratosfere.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="flex items-start justify-between gap-6">
          <div>
            <div className="text-xs font-bold tracking-[0.25em] uppercase text-zinc-500">
              Stratosfere
            </div>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
              Pricing
            </h1>
            <p className="mt-4 text-zinc-600 max-w-2xl">
              Acceso a Stratosfere OS: exploración, bóveda, cartera (agencia), chat y herramientas
              premium. La facturación se gestiona mediante Paddle (Merchant of Record).
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

        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlanCard
            title="Starter"
            price="9€ / mes"
            desc="Para usuarios particulares."
            items={[
              "Exploración y mapa",
              "Guardar favoritos (Bóveda)",
              "Detalles y fichas",
              "Soporte básico",
            ]}
          />

          <PlanCard
            title="Pro"
            price="29€ / mes"
            highlight
            desc="Para usuarios avanzados."
            items={[
              "Todo lo anterior",
              "Chat y comunicaciones",
              "Herramientas avanzadas",
              "Soporte prioritario",
            ]}
          />

          <PlanCard
            title="Agency"
            price="79€ / mes"
            desc="Para agencias y equipos."
            items={[
              "Cartera (Mi Stock)",
              "Gestión de activos",
              "Chat + workflows",
              "Soporte premium",
            ]}
          />
        </section>

        <section className="mt-10 border-t border-zinc-200 pt-8 text-sm text-zinc-600">
          <p>
            <strong className="text-black">Cancelación:</strong> puedes cancelar en cualquier momento.
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

function PlanCard({
  title,
  price,
  desc,
  items,
  highlight,
}: {
  title: string;
  price: string;
  desc: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border p-6 bg-white",
        highlight ? "border-black" : "border-zinc-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black tracking-[0.25em] uppercase text-zinc-500">
            Plan
          </div>
          <h2 className="mt-2 text-xl font-extrabold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-zinc-600">{desc}</p>
        </div>

        {highlight ? (
          <span className="text-[10px] font-black tracking-widest uppercase border border-black px-2 py-1 rounded-full">
            Recomendado
          </span>
        ) : null}
      </div>

      <div className="mt-6 text-3xl font-extrabold tracking-tight">{price}</div>

      <ul className="mt-6 space-y-2 text-sm text-zinc-700">
        {items.map((x) => (
          <li key={x} className="flex gap-2">
            <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-black shrink-0" />
            <span>{x}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/register"
        className="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-black bg-black text-white px-4 py-3 text-xs font-black tracking-widest uppercase hover:bg-zinc-900"
      >
        Empezar
      </Link>
    </div>
  );
}
