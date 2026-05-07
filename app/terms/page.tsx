import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos — Stratosfere",
  description: "Términos y condiciones de Stratosfere.",
};

export default function TermsPage() {
  return (
    <main className="h-screen overflow-y-auto bg-white text-black">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Términos del servicio
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
            Titular / Operador legal:{" "}
            <strong className="text-black">SF Urban S.L.</strong> (CIF{" "}
            <strong className="text-black">B-75965723</strong>) · Marca comercial:{" "}
            <strong className="text-black">Stratosfere</strong>
          </p>

          <p className="mt-2">
            Domicilio social:{" "}
            <strong className="text-black">
              Avenida de las Cumbres 13, 29604 Marbella, España
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
            <strong className="text-black">23/04/2026</strong>
          </p>
        </div>

        <section className="mt-10 space-y-8 text-sm text-zinc-700 leading-6">
          <Block title="1. Qué es Stratosfere">
            Stratosfere es una plataforma tecnológica y software como servicio (SaaS)
            que ofrece herramientas de exploración, publicación, gestión, comunicación,
            organización documental y flujos de trabajo relacionados con activos
            inmobiliarios y operaciones asociadas. Según el plan contratado, el rol del
            usuario y las funcionalidades habilitadas, el acceso a determinados módulos,
            automatizaciones o servicios puede variar.
          </Block>

          <Block title="2. Aceptación de los términos">
            Al acceder, registrarte o utilizar Stratosfere, aceptas estos Términos del
            servicio, así como las políticas y documentos enlazados desde esta página,
            incluida la{" "}
            <Link href="/privacy" className="underline text-black">
              Política de Privacidad
            </Link>{" "}
            y, cuando resulte aplicable, la política publicada en{" "}
            <Link href="/refunds" className="underline text-black">
              /refunds
            </Link>
            . Si no estás de acuerdo con estos términos, no debes utilizar la
            plataforma.
          </Block>

          <Block title="3. Capacidad y uso de la cuenta">
            Debes proporcionar información veraz, actual y completa al registrarte o al
            utilizar cualquier funcionalidad de la plataforma. Eres responsable de
            custodiar tus credenciales, dispositivos, sesiones activas y cualquier
            actividad realizada desde tu cuenta. No puedes ceder tu acceso a terceros ni
            utilizar cuentas ajenas sin autorización.
          </Block>

          <Block title="4. Roles de usuario y acceso a funcionalidades">
            Stratosfere puede operar con distintos perfiles, incluyendo particulares,
            agencias, profesionales, embajadores u otros roles que la plataforma pueda
            habilitar. Determinadas funciones, áreas privadas, paneles operativos,
            automatizaciones, herramientas de captación, B2B, difusión, posicionamiento o
            marketplace pueden estar limitados a determinados planes, perfiles o estados
            de cuenta. SF Urban S.L. podrá modificar, ampliar, restringir o reorganizar
            funcionalidades cuando sea necesario por motivos técnicos, comerciales,
            operativos o de cumplimiento.
          </Block>

          <Block title="5. Publicación de activos, datos y contenido del usuario">
            El usuario es el único responsable de la exactitud, licitud, actualización y
            legitimidad del contenido que publique, cargue, transmita o comparta en
            Stratosfere, incluyendo textos, fotos, vídeos, documentos, planos, mensajes,
            datos de contacto, precios, descripciones, ubicaciones, referencias,
            disponibilidades, autorizaciones, estados jurídicos o materiales comerciales.
            Asimismo, garantizas que dispones de los derechos, permisos, licencias o
            autorizaciones necesarios para utilizar y compartir dicho contenido en la
            plataforma.
          </Block>

          <Block title="6. Uso permitido y prohibiciones">
            Te comprometes a utilizar Stratosfere de forma lícita, leal y compatible con
            la finalidad del servicio. Queda prohibido, entre otros supuestos:
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>publicar información falsa, engañosa, ilícita o no autorizada;</li>
              <li>suplantar identidades o atribuirte facultades que no posees;</li>
              <li>extraer datos de forma masiva, automatizada o abusiva;</li>
              <li>realizar scraping agresivo, ingeniería inversa o ataques a la plataforma;</li>
              <li>enviar spam, malware o contenidos fraudulentos;</li>
              <li>interferir en el funcionamiento del servicio o en la experiencia de terceros;</li>
              <li>utilizar Stratosfere para fines ilícitos, competitivos desleales o contrarios a la buena fe.</li>
            </ul>
          </Block>

          <Block title="7. Comunicaciones, leads, mensajería y actividad entre usuarios">
            Stratosfere puede ofrecer herramientas de contacto, formularios, leads,
            mensajería, chat, alertas, invitaciones, propuestas, campañas, eventos,
            tickets, coordinación comercial y otras vías de interacción entre usuarios. SF
            Urban S.L. no garantiza la respuesta, disponibilidad, solvencia, veracidad,
            capacidad legal, capacidad de cierre o cumplimiento de las obligaciones por
            parte de otros usuarios, agencias, particulares, colaboradores o terceros.
            Cada usuario es responsable de sus decisiones, comunicaciones y relaciones
            comerciales.
          </Block>

          <Block title="8. Documentos, materiales y herramientas digitales">
            La plataforma puede permitir el envío, almacenamiento, visualización o
            intercambio de documentos, expedientes, certificados, imágenes, materiales de
            marketing u otros archivos digitales. Aunque Stratosfere puede incorporar
            medidas técnicas, automatizaciones o capas de organización, el usuario sigue
            siendo responsable del contenido que remite, de su legitimidad y de verificar
            que no vulnera derechos de terceros, confidencialidad, normativa aplicable o
            compromisos contractuales.
          </Block>

          <Block title="9. Pagos, facturación y renovaciones">
            La facturación se gestiona mediante{" "}
            <strong className="text-black">Mollie</strong> como Merchant of Record, salvo
            que en un servicio concreto se indique otro proveedor o flujo de cobro. Si
            contratas una suscripción, esta podrá renovarse automáticamente según el ciclo
            seleccionado (mensual, anual u otro) hasta que la canceles. Los precios,
            impuestos, comisiones, límites, condiciones de uso y prestaciones incluidas
            podrán variar según el plan, promoción, territorio, moneda o producto
            contratado.
          </Block>

          <Block title="10. Cancelación, baja, suspensión y terminación">
            Puedes cancelar tu suscripción o dejar de usar el servicio en cualquier
            momento. Salvo que se indique expresamente lo contrario, conservarás acceso
            hasta el final del periodo ya abonado y no se generarán nuevos cargos tras la
            cancelación de la renovación. SF Urban S.L. podrá suspender, limitar o cerrar
            cuentas, publicaciones o accesos, temporal o definitivamente, cuando detecte
            incumplimientos, riesgo operativo, fraude, abuso, conflicto legal, impagos,
            comportamiento perjudicial para la plataforma o para terceros, o necesidades de
            seguridad y cumplimiento.
          </Block>

          <Block title="11. Eliminación de cuenta">
            El usuario podrá solicitar la eliminación de su cuenta conforme a los
            mecanismos habilitados en la plataforma. La eliminación de la cuenta no
            implicará necesariamente la supresión inmediata de toda la información cuando
            exista una obligación legal de conservación, prevención del fraude, seguridad,
            defensa de reclamaciones, cumplimiento contractual, trazabilidad técnica o
            cierre administrativo de procesos en curso. En esos casos, los datos se
            conservarán únicamente durante el plazo necesario y con la finalidad
            estrictamente correspondiente.
          </Block>

          <Block title="12. Reembolsos">
            Nuestra política de reembolsos está disponible en{" "}
            <Link href="/refunds" className="underline text-black">
              /refunds
            </Link>
            . Sin perjuicio de lo anterior, cualquier derecho irrenunciable que pudiera
            corresponder al consumidor o usuario conforme a la normativa aplicable se
            respetará en los términos legalmente exigibles.
          </Block>

          <Block title="13. Propiedad intelectual e industrial">
            Stratosfere, su software, diseño, arquitectura, base visual, marca, nombre
            comercial, logotipos, interfaces, textos, estructura, código, materiales,
            elementos distintivos y funcionalidades son titularidad de SF Urban S.L. o de
            sus licenciantes, y están protegidos por la normativa aplicable de propiedad
            intelectual e industrial. Estos Términos no te transfieren ningún derecho de
            titularidad sobre la plataforma. Solo se concede un derecho de uso limitado,
            revocable, no exclusivo e intransferible, conforme a estos Términos.
          </Block>

          <Block title="14. Licencia limitada sobre el contenido que subes">
            En la medida necesaria para operar la plataforma, al subir contenido a
            Stratosfere concedes a SF Urban S.L. una licencia no exclusiva, revocable en
            cuanto resulte compatible con la operativa y las obligaciones legales,
            limitada al ámbito técnico y funcional del servicio, para alojar, tratar,
            reproducir, adaptar en formatos técnicos, mostrar y comunicar dicho contenido
            únicamente con la finalidad de prestar el servicio, mantener la operativa,
            mejorar la visualización, facilitar la publicación y habilitar las funciones
            contratadas por el usuario.
          </Block>

          <Block title="15. Disponibilidad del servicio y cambios">
            SF Urban S.L. no garantiza que Stratosfere esté disponible de forma
            ininterrumpida, libre de errores o compatible con cualquier dispositivo,
            navegador, integración o entorno técnico. La plataforma podrá incorporar
            mejoras, cambios de diseño, ajustes funcionales, nuevas capas de seguridad,
            mantenimiento, migraciones, pausas temporales, retirada de módulos o cambios
            en integraciones con terceros sin necesidad de previo aviso cuando ello sea
            razonablemente necesario.
          </Block>

          <Block title="16. Integraciones y servicios de terceros">
            Algunas funciones de Stratosfere pueden depender de servicios, pasarelas,
            sistemas, SDKs, APIs, proveedores de mapas, mensajería, pagos, correo,
            notificaciones, alojamiento, analítica u otras herramientas de terceros. SF
            Urban S.L. no responde por fallos, interrupciones, cambios, restricciones,
            incidencias, políticas o decisiones adoptadas por dichos terceros fuera del
            control razonable de la plataforma.
          </Block>

          <Block title="17. Limitación de responsabilidad">
            Stratosfere se ofrece “tal cual” y “según disponibilidad”. En la medida
            máxima permitida por la ley, SF Urban S.L. no será responsable por daños
            indirectos, lucro cesante, pérdida de oportunidades, pérdida de beneficios,
            pérdida de datos, caída de operaciones, interrupciones del servicio,
            indisponibilidad temporal, decisiones comerciales tomadas por usuarios,
            acuerdos fallidos entre partes, incumplimientos de terceros o expectativas de
            resultado no alcanzadas. En todo caso, cuando la ley permita limitar la
            responsabilidad, esta quedará acotada al importe efectivamente pagado por el
            usuario a SF Urban S.L. durante los doce meses anteriores al hecho causante,
            salvo dolo o aquellos supuestos en que la limitación no sea legalmente posible.
          </Block>

          <Block title="18. Indemnidad">
            Aceptas defender, indemnizar y mantener indemne a SF Urban S.L., sus
            administradores, empleados, colaboradores y proveedores frente a reclamaciones,
            daños, costes, pérdidas, gastos o responsabilidades derivadas de tu uso
            indebido de la plataforma, del contenido que publiques, del incumplimiento de
            estos Términos o de la vulneración de derechos de terceros.
          </Block>

          <Block title="19. Privacidad y protección de datos">
            El tratamiento de datos personales se rige por nuestra{" "}
            <Link href="/privacy" className="underline text-black">
              Política de Privacidad
            </Link>
            . El usuario declara haberla leído y comprendido. Cuando la plataforma
            incorpore comunicaciones, notificaciones, formularios, leads, chat,
            documentación o integraciones, el tratamiento de los datos se realizará
            conforme a dicha política y a la normativa aplicable.
          </Block>

          <Block title="20. Modificaciones de estos términos">
            SF Urban S.L. podrá actualizar estos Términos para adaptarlos a cambios
            legales, técnicos, operativos, comerciales o de producto. La versión vigente
            será la publicada en esta página con su fecha de actualización. El uso
            continuado del servicio tras la entrada en vigor de los cambios implicará la
            aceptación de la nueva versión, salvo que la ley exija un mecanismo adicional.
          </Block>

          <Block title="21. Ley aplicable y jurisdicción">
            Estos Términos se regirán e interpretarán conforme a la legislación española.
            Para cualquier controversia que pudiera surgir en relación con la plataforma o
            estos Términos, las partes se someten, con renuncia expresa a cualquier otro
            fuero que pudiera corresponderles, a los Juzgados y Tribunales de Marbella,
            salvo que una norma imperativa establezca otro fuero distinto, en especial en
            materia de consumidores y usuarios.
          </Block>

          <Block title="22. Contacto">
            Para soporte, consultas legales o ejercicio de derechos relacionados con estos
            Términos, puedes escribir a{" "}
            <a className="underline text-black" href="mailto:info@stratosfere.com">
              info@stratosfere.com
            </a>
            .
          </Block>
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

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-extrabold tracking-tight text-black">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}