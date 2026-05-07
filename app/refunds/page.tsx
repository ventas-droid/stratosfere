import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reembolsos — Stratosfere",
  description: "Política de reembolso de Stratosfere.",
};

export default function RefundsPage() {
  return (
    <main className="h-screen overflow-y-auto bg-white text-black">
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
            Responsable: <strong className="text-black">SF Urban S.L.</strong>{" "}
            (CIF <strong className="text-black">B-75965723</strong>) ·{" "}
            <a className="underline text-black" href="mailto:info@stratosfere.com">
              info@stratosfere.com
            </a>
          </p>
          <p className="mt-2">
            Última actualización: <strong className="text-black">23/04/2026</strong>
          </p>
        </div>

        <section className="mt-10 space-y-8 text-sm text-zinc-700 leading-6">
          <p>
            Stratosfere presta servicios digitales y software como servicio
            (SaaS). Los pagos realizados cubren el acceso, uso o activación de
            funcionalidades durante el periodo, plan o servicio contratado,
            salvo que en una oferta concreta se indique expresamente otra cosa.
          </p>

          <div className="border border-zinc-200 rounded-2xl p-5">
            <h2 className="font-extrabold text-black">1. Regla general</h2>
            <p className="mt-2">
              Puedes cancelar tu suscripción o dejar de utilizar el servicio en
              cualquier momento. Como norma general, la cancelación evita cargos
              futuros, pero no genera devolución automática de importes ya
              cobrados por periodos ya iniciados, consumidos, activados o
              ejecutados.
            </p>
          </div>

          <div className="border border-zinc-200 rounded-2xl p-5">
            <h2 className="font-extrabold text-black">
              2. Qué ocurre al cancelar una suscripción
            </h2>
            <p className="mt-2">
              Cuando cancelas una suscripción, conservarás acceso hasta la fecha
              de finalización del ciclo ya abonado, salvo que en el plan
              contratado se indique algo distinto. Tras ello, no se renovará el
              siguiente periodo, pero el periodo ya cobrado no será reembolsado
              de forma automática.
            </p>
          </div>

          <div className="border border-zinc-200 rounded-2xl p-5">
            <h2 className="font-extrabold text-black">
              3. Supuestos en los que sí puede revisarse un reembolso
            </h2>
            <p className="mt-2">
              Podremos estudiar solicitudes de reembolso, caso por caso, cuando
              exista una causa objetiva y verificable, por ejemplo:
            </p>
            <ul className="mt-3 space-y-2">
              <li>• Cobro duplicado o error de facturación acreditado.</li>
              <li>• Cargo no autorizado o actividad fraudulenta demostrable.</li>
              <li>• Fallo técnico grave atribuible a Stratosfere que impida el acceso esencial al servicio durante un periodo relevante.</li>
              <li>• Cobro incorrecto respecto a un plan, precio o condición distinta de la aceptada por el usuario.</li>
              <li>• Cualquier otro supuesto en que la normativa aplicable exija el reintegro.</li>
            </ul>
          </div>

          <div className="border border-zinc-200 rounded-2xl p-5">
            <h2 className="font-extrabold text-black">
              4. Supuestos en los que normalmente no procede reembolso
            </h2>
            <p className="mt-2">
              Salvo obligación legal en contrario, normalmente no procederá
              reembolso en los siguientes casos:
            </p>
            <ul className="mt-3 space-y-2">
              <li>• Cambio de opinión tras haber iniciado el periodo de uso.</li>
              <li>• Falta de uso del servicio por decisión del usuario.</li>
              <li>• Desconocimiento de funcionalidades, requisitos o compatibilidad ya informados.</li>
              <li>• Cancelación realizada una vez iniciado el periodo contratado.</li>
              <li>• Bloqueos, suspensiones o cierres derivados de incumplimientos de términos, fraude, abuso o uso ilícito.</li>
              <li>• Servicios digitales ya activados, ejecutados o consumidos, cuando la ley permita excluir el desistimiento.</li>
            </ul>
          </div>

          <div className="border border-zinc-200 rounded-2xl p-5">
            <h2 className="font-extrabold text-black">5. Cómo solicitar una revisión</h2>
            <p className="mt-2">
              Si consideras que tu caso encaja en un supuesto revisable, escribe
              a{" "}
              <a className="underline text-black" href="mailto:info@stratosfere.com">
                info@stratosfere.com
              </a>{" "}
              indicando, al menos:
            </p>
            <ul className="mt-3 space-y-2">
              <li>• email de la cuenta;</li>
              <li>• fecha del cargo;</li>
              <li>• importe abonado;</li>
              <li>• método de pago utilizado;</li>
              <li>• motivo detallado de la solicitud;</li>
              <li>• cualquier captura, recibo o evidencia que permita verificar el caso.</li>
            </ul>
          </div>

          <div className="border border-zinc-200 rounded-2xl p-5">
            <h2 className="font-extrabold text-black">6. Proceso de revisión</h2>
            <p className="mt-2">
              Cada solicitud será analizada individualmente. SF Urban S.L. podrá
              requerir información adicional antes de adoptar una decisión. La
              aprobación o denegación dependerá de la verificación del caso, del
              estado del servicio contratado, del historial del cargo y de la
              normativa aplicable.
            </p>
          </div>

          <div className="border border-zinc-200 rounded-2xl p-5">
            <h2 className="font-extrabold text-black">
              7. Método y plazo del reembolso
            </h2>
            <p className="mt-2">
              Si un reembolso es aprobado, se tramitará, siempre que sea
              posible, mediante el mismo método de pago utilizado en la compra.
              Los tiempos efectivos de devolución pueden depender del proveedor
              de pagos, la entidad bancaria o el emisor del medio de pago.
            </p>
          </div>

          <div className="border border-zinc-200 rounded-2xl p-5">
            <h2 className="font-extrabold text-black">
              8. Procesamiento de pagos por terceros
            </h2>
            <p className="mt-2">
              Los pagos pueden ser procesados mediante{" "}
              <strong className="text-black">Mollie</strong> u otros proveedores
              de pago autorizados, según el servicio concreto. La ejecución
              material del cobro, del eventual reintegro y de determinados
              tiempos operativos puede depender de dichos terceros.
            </p>
          </div>

          <div className="border border-zinc-200 rounded-2xl p-5">
            <h2 className="font-extrabold text-black">
              9. Derecho de desistimiento y servicios digitales
            </h2>
            <p className="mt-2">
              Cuando el usuario tenga la condición legal de consumidor, podrá
              corresponderle el derecho de desistimiento en los términos
              previstos por la normativa aplicable. No obstante, dicho derecho
              puede quedar excluido o limitado en servicios digitales ya
              ejecutados, activados o comenzados con el consentimiento del
              usuario, cuando así lo permita la ley.
            </p>
          </div>

          <div className="border border-zinc-200 rounded-2xl p-5">
            <h2 className="font-extrabold text-black">10. Contacto</h2>
            <p className="mt-2">
              Para cuestiones relacionadas con cobros, cancelaciones o revisión
              de reembolsos, contacta en{" "}
              <a className="underline text-black" href="mailto:info@stratosfere.com">
                info@stratosfere.com
              </a>
              .
            </p>
          </div>

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

        <footer className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-600">
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
          </Link>{" "}
          ·{" "}
          <Link href="/pricing" className="underline text-black">
            Pricing
          </Link>
        </footer>
      </div>
    </main>
  );
}