import Link from "next/link";
import React from 'react';

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
            Política de Privacidad
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
          <p className="mt-2">Última actualización: 08/03/2026</p>
        </div>

        <section className="mt-10 space-y-8 text-sm text-zinc-700 leading-6">
          <Block title="1. Datos que recopilamos">
            Para ofrecer nuestros servicios, recopilamos datos de identificación (nombre, apellidos), datos de contacto (email, teléfono), datos profesionales (licencia de agencia, empresa) y datos de navegación (dirección IP, cookies técnicas). También procesamos la información de las propiedades inmobiliarias publicadas.
          </Block>

          <Block title="2. Finalidades y Base Legitimadora">
            Tratamos tus datos bajo las siguientes bases legales (RGPD):<br/>
            <strong>Ejecución de contrato:</strong> Para gestionar tu cuenta, suscripciones y operar la plataforma.<br/>
            <strong>Consentimiento:</strong> Para el envío de comunicaciones comerciales y el uso del formulario de contacto.<br/>
            <strong>Interés legítimo:</strong> Para mantener la seguridad de la plataforma, prevenir el fraude y analizar métricas de uso para mejorar el software.
          </Block>

          <Block title="3. Cesión a Terceros">
            Stratosfere no vende tus datos. Solo compartimos la información estrictamente necesaria con proveedores de servicios que actúan como encargados del tratamiento, tales como infraestructura en la nube (ej. Vercel), bases de datos (ej. Supabase/Upstash) y pasarelas de pago. <br/><br/>
            Los pagos se procesan de forma segura mediante <strong className="text-black">Paddle</strong>. Stratosfere no procesa ni almacena directamente los datos completos de tu tarjeta de crédito.
          </Block>

          <Block title="4. Política de Cookies">
            Utilizamos cookies técnicas de sesión para mantener tu acceso seguro, recordar tus preferencias (como Favoritos) y prevenir ataques automatizados (Rate Limiting). Puedes gestionar la eliminación de cookies desde las opciones de tu navegador.
          </Block>

          <Block title="5. Conservación de los Datos">
            Conservaremos tus datos personales mientras tu cuenta permanezca activa. Una vez cancelada, los datos serán bloqueados y conservados únicamente durante los plazos legales exigibles (obligaciones fiscales y prevención de blanqueo de capitales) antes de su destrucción total.
          </Block>

          <Block title="6. Tus Derechos (ARCO-POL)">
            Tienes derecho a solicitar el <strong>Acceso, Rectificación, Supresión (Olvido), Oposición, Limitación y Portabilidad</strong> de tus datos en cualquier momento. Para ejercer estos derechos, envía un correo electrónico indicando tu petición a{" "}
            <a className="underline text-black" href="mailto:info@stratosfere.com">
              info@stratosfere.com
            </a>. También tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).
          </Block>

          <Block title="7. Más información">
            Consulta también nuestra documentación legal complementaria:{" "}
            <Link href="/terms" className="underline text-black">
              Términos y Condiciones
            </Link>{" "}
            y{" "}
            <Link href="/refunds" className="underline text-black">
              Política de Reembolsos
            </Link>
            .
          </Block>
        </section>

        {/* Footer legal (navegación clara para Paddle) */}
        <footer className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-600">
          <Link href="/terms" className="underline text-black hover:text-indigo-600 transition-colors">Términos</Link>{" "}
          · <Link href="/privacy" className="underline text-black hover:text-indigo-600 transition-colors">Privacidad</Link>{" "}
          · <Link href="/refunds" className="underline text-black hover:text-indigo-600 transition-colors">Reembolsos</Link>{" "}
          · <Link href="/pricing" className="underline text-black hover:text-indigo-600 transition-colors">Pricing</Link>
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