import Link from "next/link";

export const metadata = {
  title: "Privacidad — Stratosfere",
  description: "Política de privacidad de Stratosfere.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Política de privacidad
          </h1>
          <Link
            href="/terms"
            className="text-sm font-bold tracking-widest uppercase text-zinc-600 hover:text-black"
          >
            Términos
          </Link>
        </header>

        <div className="mt-6 text-sm text-zinc-600">
          <p>
            Responsable: <strong className="text-black">SF Urban S.L.</strong> (CIF{" "}
            <strong className="text-black">B-75965723</strong>) ·{" "}
            <a className="underline text-black" href="mailto:info@stratosfere.com">
              info@stratosfere.com
            </a>
          </p>
          <p className="mt-2">Última actualización: 25/01/2026</p>
        </div>

        <section className="mt-10 space-y-8 text-sm text-zinc-700 leading-6">
          <Block title="1. Datos que recopilamos">
            Datos de cuenta (email, nombre si lo proporcionas), datos técnicos (dispositivo, logs) y datos de uso
            (interacciones en la plataforma) para operar y mejorar el servicio.
          </Block>

          <Block title="2. Finalidades">
            Proveer el servicio, autenticar usuarios, atención al cliente, seguridad, analítica y mejoras del producto.
          </Block>

          <Block title="3. Pagos">
            Los pagos se procesan mediante <strong className="text-black">Paddle</strong>. Stratosfere no almacena
            directamente los datos completos de tu tarjeta.
          </Block>

          <Block title="4. Conservación">
            Conservamos datos mientras exista la cuenta o sea necesario para cumplir obligaciones legales y de seguridad.
          </Block>

          <Block title="5. Derechos">
            Puedes solicitar acceso, rectificación o supresión escribiendo a{" "}
            <a className="underline text-black" href="mailto:info@stratosfere.com">
              info@stratosfere.com
            </a>
            .
          </Block>

          <Block title="6. Más información">
            Consulta también:{" "}
            <Link href="/terms" className="underline text-black">
              Términos
            </Link>{" "}
            y{" "}
            <Link href="/refunds" className="underline text-black">
              Reembolsos
            </Link>
            .
          </Block>
        </section>

        {/* Footer legal (navegación clara para Paddle) */}
        <footer className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-600">
          <Link href="/terms" className="underline text-black">Términos</Link>{" "}
          · <Link href="/privacy" className="underline text-black">Privacidad</Link>{" "}
          · <Link href="/refunds" className="underline text-black">Reembolsos</Link>{" "}
          · <Link href="/pricing" className="underline text-black">Pricing</Link>
        </footer>
      </div>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-extrabold tracking-tight text-black">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}
