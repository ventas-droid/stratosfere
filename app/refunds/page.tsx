import Link from "next/link";

export const metadata = {
  title: "Reembolsos — Stratosfere",
  description: "Política de reembolso de Stratosfere.",
};

export default function RefundsPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Política de reembolso
          </h1>
          <Link
            href="/pricing"
            className="text-sm font-bold tracking-widest uppercase text-zinc-600 hover:text-black"
          >
            Pricing
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

        <section className="mt-10 space-y-6 text-sm text-zinc-700 leading-6">
          <p>
            Stratosfere es un servicio digital por suscripción. Por defecto, los pagos cubren el acceso al servicio
            durante el periodo contratado.
          </p>

          <div className="border border-zinc-200 rounded-2xl p-5">
            <h2 className="font-extrabold text-black">Regla general</h2>
            <p className="mt-2">
              Puedes cancelar en cualquier momento y conservarás acceso hasta el final del ciclo pagado. No se realizan
              reembolsos por periodos ya iniciados salvo excepciones.
            </p>
          </div>

          <div className="border border-zinc-200 rounded-2xl p-5">
            <h2 className="font-extrabold text-black">Excepciones (casos típicos)</h2>
            <ul className="mt-2 space-y-2">
              <li>• Cobro duplicado o error de facturación comprobable.</li>
              <li>• Acceso imposible por fallo técnico grave atribuible a Stratosfere.</li>
              <li>• Actividad fraudulenta demostrable.</li>
            </ul>
            <p className="mt-3">
              Para solicitar revisión, escribe a{" "}
              <a className="underline text-black" href="mailto:info@stratosfere.com">
                info@stratosfere.com
              </a>{" "}
              indicando email de la cuenta y fecha del cargo.
            </p>
          </div>

          <p>
            Los pagos se procesan mediante <strong className="text-black">Paddle</strong>. En caso de reembolso aprobado,
            se aplicará por el mismo método de pago según sus tiempos de procesamiento.
          </p>

          <p>
            Ver también:{" "}
            <Link href="/terms" className="underline text-black">
              Términos
            </Link>{" "}
            y{" "}
            <Link href="/privacy" className="underline text-black">
              Privacidad
            </Link>
            .
          </p>
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
