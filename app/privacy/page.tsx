import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Globe,
  Scale,
  Mail,
  CreditCard,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacidad — Stratosfere OS",
  description: "Política de Privacidad y Tratamiento de Datos de Stratosfere.",
};

export default function PrivacyPage() {
  return (
    <main className="h-screen overflow-y-auto bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-black selection:text-white">
      <div className="bg-white border-b border-zinc-200 pt-20 pb-16 px-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="text-xs font-bold tracking-widest uppercase text-zinc-400 hover:text-black transition-colors mb-8 inline-block"
          >
            ← Volver a Stratosfere
          </Link>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black mb-4">
            Política de Privacidad
          </h1>

          <p className="text-lg text-zinc-500 max-w-2xl leading-relaxed">
            En Stratosfere tratamos los datos personales con criterios de
            minimización, seguridad, confidencialidad y cumplimiento normativo.
            Esta política explica qué datos recopilamos, por qué los tratamos,
            con qué base legal, durante cuánto tiempo y qué derechos puedes
            ejercer sobre tu información.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 text-xs font-medium text-zinc-500">
            <div className="bg-zinc-100 px-3 py-1.5 rounded-md border border-zinc-200">
              Última actualización: 23 de abril de 2026
            </div>
            <div className="bg-zinc-100 px-3 py-1.5 rounded-md border border-zinc-200">
              Normativa: RGPD (UE) 2016/679
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <PrincipleCard
            icon={<Shield className="text-black" size={24} />}
            title="Seguridad por diseño"
            desc="Aplicamos medidas técnicas y organizativas razonables para proteger la confidencialidad, integridad y disponibilidad de los datos."
          />
          <PrincipleCard
            icon={<Eye className="text-black" size={24} />}
            title="Transparencia"
            desc="Explicamos de forma clara qué datos usamos, con qué finalidad y qué opciones tienes sobre ellos."
          />
          <PrincipleCard
            icon={<Lock className="text-black" size={24} />}
            title="Control del usuario"
            desc="Puedes solicitar acceso, rectificación, supresión, oposición, limitación y portabilidad en los términos previstos por la ley."
          />
        </div>

        <div className="mt-10 space-y-12 text-sm text-zinc-600 leading-relaxed">
          <Block
            title="1. Identidad del responsable del tratamiento"
            icon={<Scale size={20} />}
          >
            El responsable del tratamiento de los datos personales recogidos a
            través de Stratosfere es <strong className="text-black">SF Urban S.L.</strong>,
            con NIF <strong className="text-black">B-75965723</strong>.
            <br />
            <br />
            Puedes contactar con nosotros en{" "}
            <a
              className="underline text-black font-medium hover:text-indigo-600 transition-colors"
              href="mailto:info@stratosfere.com"
            >
              info@stratosfere.com
            </a>
            {" "}para consultas generales, soporte o ejercicio de derechos en
            materia de privacidad.
          </Block>

          <Block
            title="2. Qué datos personales recopilamos"
            icon={<Database size={20} />}
          >
            En función de cómo utilices Stratosfere, podemos tratar las
            siguientes categorías de datos:
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>
                <strong className="text-black">Datos identificativos y de cuenta:</strong>{" "}
                nombre, apellidos, correo electrónico, contraseña cifrada,
                rol de usuario, identificadores internos de cuenta y estado de suscripción.
              </li>
              <li>
                <strong className="text-black">Datos de contacto:</strong>{" "}
                teléfono, móvil, dirección postal, zona de actuación o datos de
                contacto profesional cuando sean facilitados por el usuario.
              </li>
              <li>
                <strong className="text-black">Datos profesionales y de perfil:</strong>{" "}
                nombre comercial, logotipo, imagen de perfil, imagen de portada,
                licencia profesional, web, tagline y demás información que el
                usuario decida publicar en su perfil.
              </li>
              <li>
                <strong className="text-black">Datos de inmuebles y expedientes:</strong>{" "}
                direcciones, referencias, coordenadas, características técnicas,
                fotografías, vídeos, documentos, certificados, estados, precios,
                servicios seleccionados y otra información vinculada a activos
                publicados o gestionados dentro de la plataforma.
              </li>
              <li>
                <strong className="text-black">Datos de comunicaciones:</strong>{" "}
                mensajes de chat, formularios de contacto, leads, propuestas,
                solicitudes de asesoramiento, tickets, eventos y otros
                intercambios realizados dentro de Stratosfere.
              </li>
              <li>
                <strong className="text-black">Datos técnicos y de uso:</strong>{" "}
                dirección IP, identificadores de dispositivo, sesiones, trazas
                básicas de actividad, registros de errores, datos de navegación y
                otros datos técnicos necesarios para seguridad, diagnóstico,
                prevención de fraude y mantenimiento del servicio.
              </li>
              <li>
                <strong className="text-black">Datos de notificaciones:</strong>{" "}
                token push del dispositivo y preferencias técnicas relacionadas
                con el envío de avisos, cuando el usuario autorice las
                notificaciones.
              </li>
            </ul>
          </Block>

          <Block
            title="3. Cómo obtenemos tus datos"
            icon={<Eye size={20} />}
          >
            Los datos pueden provenir de distintas fuentes:
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>de la información que introduces al registrarte o editar tu perfil;</li>
              <li>del uso de las funciones de Stratosfere, como publicación, chat, leads, propuestas o eventos;</li>
              <li>de la información asociada a tus inmuebles, expedientes y documentos;</li>
              <li>de interacciones con otros usuarios dentro de la plataforma;</li>
              <li>de proveedores tecnológicos o pasarelas de pago cuando sea necesario para operar el servicio;</li>
              <li>del propio dispositivo o navegador, para seguridad, rendimiento y operación técnica.</li>
            </ul>
          </Block>

          <Block
            title="4. Finalidades del tratamiento y bases legitimadoras"
            icon={<Shield size={20} />}
          >
            Tratamos tus datos personales con las siguientes finalidades y bases
            legales, conforme al artículo 6 del RGPD:
            <div className="mt-4 space-y-4">
              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg">
                <p className="font-bold text-black mb-1">A. Ejecución del contrato</p>
                <p>
                  Para crear y mantener tu cuenta, permitir el acceso a la
                  plataforma, gestionar perfiles, inmuebles, mensajes,
                  documentos, funciones operativas, soporte y cualquier servicio
                  contratado dentro de Stratosfere.
                </p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg">
                <p className="font-bold text-black mb-1">B. Cumplimiento de obligaciones legales</p>
                <p>
                  Para atender deberes fiscales, contables, regulatorios, de
                  prevención del fraude, cooperación con autoridades o defensa
                  ante reclamaciones cuando resulte exigible.
                </p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg">
                <p className="font-bold text-black mb-1">C. Interés legítimo</p>
                <p>
                  Para proteger la seguridad de la plataforma, prevenir abusos,
                  investigar incidencias, mejorar estabilidad técnica, medir uso
                  de funciones, optimizar rendimiento y garantizar una experiencia
                  razonable y segura para el conjunto de usuarios.
                </p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg">
                <p className="font-bold text-black mb-1">D. Consentimiento</p>
                <p>
                  Cuando sea necesario solicitarlo, por ejemplo para el envío de
                  notificaciones push, determinadas comunicaciones comerciales,
                  formularios concretos o usos que requieran autorización expresa
                  del usuario.
                </p>
              </div>
            </div>
          </Block>

          <Block
            title="5. Pagos, facturación y datos financieros"
            icon={<CreditCard size={20} />}
          >
            Stratosfere no almacena de forma íntegra los datos completos de
            tarjetas bancarias ni el código CVV. La gestión de cobros,
            facturación o suscripciones puede apoyarse en proveedores externos
            especializados, incluido <strong className="text-black">Mollie</strong>{" "}
            como Merchant of Record cuando así corresponda al servicio
            contratado.
            <br />
            <br />
            Dichos proveedores actúan conforme a sus propias condiciones y
            políticas, así como bajo los estándares de seguridad aplicables a la
            industria de pagos.
          </Block>

          <Block
            title="6. Leads, chat, documentos y notificaciones"
            icon={<Mail size={20} />}
          >
            Algunas funciones de Stratosfere implican necesariamente el
            tratamiento de datos para facilitar la comunicación entre usuarios y
            la operativa inmobiliaria:
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>
                <strong className="text-black">Leads y formularios:</strong>{" "}
                tratamos los datos aportados para trasladar solicitudes de
                contacto, interés comercial o asesoramiento.
              </li>
              <li>
                <strong className="text-black">Chat y mensajería:</strong>{" "}
                tratamos mensajes y metadatos mínimos asociados para prestar la
                función de comunicación entre usuarios y mantener la trazabilidad
                operativa del servicio.
              </li>
              <li>
                <strong className="text-black">Documentos y archivos:</strong>{" "}
                tratamos documentos, imágenes y materiales que el usuario sube o
                comparte dentro de la plataforma para su almacenamiento,
                visualización o envío a otros usuarios autorizados.
              </li>
              <li>
                <strong className="text-black">Notificaciones push:</strong>{" "}
                si el usuario concede permiso en su dispositivo, podremos usar el
                token técnico correspondiente para enviar avisos funcionales,
                operativos o relacionados con actividad de su cuenta.
              </li>
            </ul>
          </Block>

          <Block
            title="7. Destinatarios, encargados del tratamiento y transferencias"
            icon={<Globe size={20} />}
          >
            No vendemos tus datos personales a terceros.
            <br />
            <br />
            Sí podemos compartirlos con proveedores que actúan como encargados o
            subencargados del tratamiento cuando ello sea necesario para la
            prestación del servicio, por ejemplo en áreas de hosting,
            infraestructura, comunicaciones, correo transaccional, mapas,
            almacenamiento, analítica, soporte técnico o pagos.
            <br />
            <br />
            Cuando alguno de estos proveedores esté fuera del Espacio Económico
            Europeo o implique una transferencia internacional de datos, se
            aplicarán las garantías adecuadas exigidas por la normativa
            aplicable, incluidas en su caso cláusulas contractuales tipo u otros
            mecanismos válidos de protección.
          </Block>

          <Block
            title="8. Conservación de los datos"
            icon={<Lock size={20} />}
          >
            Conservaremos tus datos personales mientras mantengas una cuenta
            activa o mientras resulten necesarios para la finalidad para la que
            fueron recogidos.
            <br />
            <br />
            Cuando solicites la baja o eliminación de tu cuenta, los datos
            podrán quedar bloqueados durante el tiempo imprescindible para:
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>cumplir obligaciones legales o fiscales;</li>
              <li>atender reclamaciones o defender derechos de SF Urban S.L.;</li>
              <li>prevenir fraude, abuso o accesos no autorizados;</li>
              <li>cerrar procesos técnicos, administrativos o contractuales en curso.</li>
            </ul>
            Tras ello, serán eliminados o anonimizados cuando proceda.
          </Block>

          <Block
            title="9. Derechos del usuario"
            icon={<Scale size={20} />}
          >
            Puedes ejercer los derechos reconocidos por la normativa de
            protección de datos, entre ellos:
            <ul className="list-none mt-3 space-y-2">
              <li>✓ <strong className="text-black">Acceso</strong></li>
              <li>✓ <strong className="text-black">Rectificación</strong></li>
              <li>✓ <strong className="text-black">Supresión</strong></li>
              <li>✓ <strong className="text-black">Oposición</strong></li>
              <li>✓ <strong className="text-black">Limitación del tratamiento</strong></li>
              <li>✓ <strong className="text-black">Portabilidad</strong></li>
              <li>✓ <strong className="text-black">Retirada del consentimiento</strong>, cuando el tratamiento se base en él</li>
            </ul>
            <p className="mt-4">
              Para ejercerlos, puedes escribir a{" "}
              <a
                className="underline text-black font-medium hover:text-indigo-600 transition-colors"
                href="mailto:info@stratosfere.com"
              >
                info@stratosfere.com
              </a>
              .
            </p>
            <p className="mt-4">
              También tienes derecho a presentar una reclamación ante la Agencia
              Española de Protección de Datos (AEPD) u otra autoridad de control
              competente si consideras que el tratamiento no se ajusta a la ley.
            </p>
          </Block>

          <Block
            title="10. Seguridad de la información"
            icon={<Shield size={20} />}
          >
            Aplicamos medidas técnicas y organizativas razonables para proteger
            los datos frente a pérdida, destrucción, acceso no autorizado,
            alteración o divulgación indebida. No obstante, ningún sistema es
            absolutamente invulnerable, por lo que el usuario también debe
            colaborar manteniendo la confidencialidad de sus credenciales y el
            uso seguro de sus dispositivos.
          </Block>

          <Block
            title="11. Menores de edad"
            icon={<Lock size={20} />}
          >
            Stratosfere no está orientada a menores de edad sin la intervención
            o autorización legalmente válida de sus representantes. Si detectamos
            que se han recogido datos de un menor de forma incompatible con la
            normativa aplicable, podremos adoptar medidas para su supresión o
            restricción.
          </Block>

          <Block
            title="12. Cambios en esta política"
            icon={<Eye size={20} />}
          >
            Podremos actualizar esta Política de Privacidad para adaptarla a
            cambios legales, técnicos, operativos o funcionales. La versión
            vigente será siempre la publicada en esta página, con indicación de
            su fecha de última actualización.
          </Block>

          <Block
            title="13. Contacto"
            icon={<Mail size={20} />}
          >
            Si tienes dudas sobre esta política o sobre el tratamiento de tus
            datos, puedes contactar con nosotros en{" "}
            <a
              className="underline text-black font-medium hover:text-indigo-600 transition-colors"
              href="mailto:info@stratosfere.com"
            >
              info@stratosfere.com
            </a>
            .
          </Block>
        </div>

        <footer className="mt-20 border-t border-zinc-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-4 font-medium">
            <Link href="/terms" className="hover:text-black transition-colors">
              Términos de Servicio
            </Link>
            <span>·</span>
            <Link href="/privacy" className="text-black">
              Privacidad
            </Link>
            <span>·</span>
            <Link href="/refunds" className="hover:text-black transition-colors">
              Reembolsos
            </Link>
          </div>
          <p>© {new Date().getFullYear()} Stratosfere OS. Todos los derechos reservados.</p>
        </footer>
      </div>
    </main>
  );
}

function PrincipleCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-zinc-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-black font-bold mb-2">{title}</h3>
      <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function Block({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="scroll-mt-24">
      <h2 className="text-lg font-bold tracking-tight text-black flex items-center gap-3 border-b border-zinc-100 pb-3">
        {icon && <span className="text-zinc-400">{icon}</span>}
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}