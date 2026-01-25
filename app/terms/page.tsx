import Link from "next/link";

export const metadata = {
  title: "Términos — Stratosfere",
  description: "Términos y condiciones de Stratosfere.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Términos del servicio
          </h1>
          <Link href="/pricing" className="text-sm font-bold tracking-widest uppercase text-zinc-600 hover:text-black">
            Pricing
          </Link>
        </header>

       <div className="mt-6 text-sm text-zinc-600">
  <p>
    Titular / Operador legal:{" "}
    <strong className="text-black">SF Urban S.L.</strong> (CIF{" "}
    <strong className="text-black">B-75965723</strong>) · Marca comercial:{" "}
    <strong className="text-black">Stratosfere</strong>
  </p>

  <p className="mt-2">
    Domicilio social:{" "}
    <strong className="text-black">
      [AVENIDA DE LAS CUMBRES 13 - 29604 -  MARBELLA, ESPAÑA]
    </strong>
  </p>

  <p className="mt-2">
    Contacto:{" "}
    <a className="underline text-black" href="mailto:info@stratosfere.com">
      info@stratosfere.com
    </a>
  </p>

  <p className="mt-2">
    Última actualización:{" "}
    <strong className="text-black">25/01/2026</strong>
  </p>
</div>


        <section className="mt-10 space-y-8 text-sm text-zinc-700 leading-6">
          <Block title="1. Qué es Stratosfere">
            Stratosfere es un software (SaaS) que ofrece herramientas de exploración, gestión y comunicación
            relacionadas con activos inmobiliarios y flujos de trabajo asociados.
          </Block>

          <Block title="2. Cuenta y acceso">
            Debes proporcionar información veraz al registrarte. Eres responsable de mantener la confidencialidad
            de tus credenciales y de toda actividad realizada en tu cuenta.
          </Block>

          <Block title="3. Pagos, facturación y renovaciones">
            La facturación se gestiona mediante <strong className="text-black">Paddle</strong> como Merchant of Record.
            Si contratas una suscripción, esta puede renovarse automáticamente según el ciclo seleccionado
            (mensual/anual) hasta que la canceles.
          </Block>

          <Block title="4. Cancelación">
            Puedes cancelar en cualquier momento. Salvo que se indique lo contrario, conservarás acceso hasta
            el final del periodo ya pagado. No se generan nuevos cargos tras la cancelación.
          </Block>

          <Block title="5. Reembolsos">
            Nuestra política de reembolsos está disponible en{" "}
            <Link href="/refunds" className="underline text-black">
              /refunds
            </Link>
            .
          </Block>

          <Block title="6. Uso aceptable">
            Te comprometes a no usar el servicio para actividades ilícitas, abuso, scraping agresivo,
            ataques, envío de spam o cualquier acción que degrade la plataforma o afecte a terceros.
          </Block>

          <Block title="7. Limitación de responsabilidad">
            Stratosfere se ofrece “tal cual”. En la medida permitida por la ley, SF Urban S.L. no será responsable
            de daños indirectos, pérdida de beneficios, pérdida de datos o interrupciones del servicio.
          </Block>

          <Block title="8. Privacidad">
            Consulta la política de privacidad en{" "}
            <Link href="/privacy" className="underline text-black">
              /privacy
            </Link>
            .
          </Block>

          <Block title="9. Contacto">
            Para soporte o consultas legales:{" "}
            <a className="underline text-black" href="mailto:info@stratosfere.com">
              info@stratosfere.com
            </a>
          </Block>
        </section>

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
