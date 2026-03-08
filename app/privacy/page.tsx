import Link from "next/link";
import React from 'react';
import { Shield, Lock, Eye, Database, Globe, Scale, Mail, CreditCard } from 'lucide-react';

export const metadata = {
  title: "Privacidad — Stratosfere OS",
  description: "Política de Privacidad y Tratamiento de Datos de Stratosfere.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-black selection:text-white">
      {/* HEADER HERO SECTION */}
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
            Tu privacidad no es una opción, es la base de nuestra arquitectura. 
            En Stratosfere procesamos tus datos con estándares de seguridad de grado militar y estricto cumplimiento normativo europeo (RGPD).
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4 text-xs font-medium text-zinc-500">
            <div className="bg-zinc-100 px-3 py-1.5 rounded-md border border-zinc-200">
              Última actualización: 08 de Marzo, 2026
            </div>
            <div className="bg-zinc-100 px-3 py-1.5 rounded-md border border-zinc-200">
              Normativa: RGPD (UE) 2016/679
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-16">
        
        {/* PRINCIPIOS CLAVE - DISEÑO PREMIUM */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <PrincipleCard 
            icon={<Shield className="text-black" size={24} />}
            title="Seguridad por Diseño"
            desc="Infraestructura blindada y datos encriptados tanto en tránsito como en reposo."
          />
          <PrincipleCard 
            icon={<Eye className="text-black" size={24} />}
            title="Transparencia Total"
            desc="No vendemos tus datos a terceros. Tu información es tuya y tú decides sobre ella."
          />
          <PrincipleCard 
            icon={<Lock className="text-black" size={24} />}
            title="Control Absoluto"
            desc="Herramientas directas para ejercer tus derechos de acceso, rectificación y borrado."
          />
        </div>

        {/* CONTENIDO LEGAL PROFUNDO */}
        <div className="mt-10 space-y-12 text-sm text-zinc-600 leading-relaxed">
          
          <Block title="1. Identidad del Responsable del Tratamiento" icon={<Scale size={20}/>}>
            El responsable del tratamiento de los datos personales recogidos en esta plataforma es <strong className="text-black">SF Urban S.L.</strong>, provista de NIF <strong className="text-black">B-75965723</strong>. Puedes contactar con nuestro Delegado de Protección de Datos (DPO) en cualquier momento a través del correo electrónico: <a className="underline text-black font-medium hover:text-indigo-600 transition-colors" href="mailto:legal@stratosfere.com">legal@stratosfere.com</a>.
          </Block>

          <Block title="2. Categorías de Datos que Recopilamos" icon={<Database size={20}/>}>
            Para ofrecer un servicio de alto rendimiento, el motor de Stratosfere recopila y procesa las siguientes categorías de datos:
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-black">Datos de Identificación y Contacto:</strong> Nombre, apellidos, dirección de correo electrónico y número de teléfono.</li>
              <li><strong className="text-black">Datos Profesionales (B2B):</strong> Nombre de la agencia, logotipos, número de licencia profesional (AICAT, API, etc.) y zona de actuación.</li>
              <li><strong className="text-black">Datos de Inmuebles:</strong> Direcciones, coordenadas, características técnicas y material multimedia de las propiedades subidas a la plataforma.</li>
              <li><strong className="text-black">Datos de Navegación (Telemetría):</strong> Direcciones IP, identificadores de dispositivo, cookies de sesión y trazas de actividad para prevenir el fraude y garantizar el rendimiento del sistema (Rate Limiting).</li>
            </ul>
          </Block>

          <Block title="3. Finalidades y Bases Legitimadoras (RGPD)" icon={<Shield size={20}/>}>
            El tratamiento de tus datos se realiza bajo las siguientes bases legales amparadas por el Artículo 6 del RGPD:
            <div className="mt-4 space-y-4">
              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg">
                <p className="font-bold text-black mb-1">A. Ejecución del Contrato</p>
                <p>Necesario para el registro de la cuenta, la prestación de los servicios de mapeo inmersivo, la publicación de inmuebles y la gestión de planes de suscripción.</p>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg">
                <p className="font-bold text-black mb-1">B. Interés Legítimo</p>
                <p>Prevención de ataques informáticos, protección de la infraestructura, análisis estadístico anónimo para mejorar la interfaz de usuario (UI/UX) y garantizar la estabilidad del servidor.</p>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg">
                <p className="font-bold text-black mb-1">C. Consentimiento Expreso</p>
                <p>Para la gestión de contactos mediante formularios de "Leads", registro en eventos "Open House" y envío de comunicaciones comerciales o actualizaciones de producto.</p>
              </div>
            </div>
          </Block>

          <Block title="4. Procesamiento de Pagos y Seguridad Financiera" icon={<CreditCard size={20}/>}>
            Stratosfere <strong className="text-black">no almacena, no procesa y no tiene acceso</strong> a los números completos de tu tarjeta de crédito ni al código CVV. 
            Toda la infraestructura de facturación está delegada y securizada mediante <strong className="text-black">Paddle</strong> (Merchant of Record). Paddle actúa como encargado del tratamiento y cumple con las normativas PCI-DSS de Nivel 1, los más altos estándares de seguridad financiera a nivel global.
          </Block>

          <Block title="5. Cesión de Datos a Terceros y Transferencias Internacionales" icon={<Globe size={20}/>}>
            Tus datos no serán cedidos a terceros, salvo obligación legal o cuando sea estrictamente necesario para la prestación del servicio. Trabajamos con proveedores tecnológicos de primer nivel (Subencargados de Tratamiento) que garantizan el cumplimiento normativo:
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-black">Infraestructura y Hosting:</strong> Vercel Inc. y Supabase/Upstash (Nodos ubicados en la Unión Europea).</li>
              <li><strong className="text-black">Comunicaciones:</strong> Resend (Envío de correos transaccionales y notificaciones de Leads).</li>
            </ul>
            Las transferencias internacionales, si las hubiera, se realizan bajo las Cláusulas Contractuales Tipo (CCT) aprobadas por la Comisión Europea.
          </Block>

          <Block title="6. Plazos de Conservación" icon={<Lock size={20}/>}>
            Conservaremos tus datos personales mientras mantengas tu cuenta activa. Si decides eliminar tu cuenta, tus datos serán bloqueados y conservados únicamente durante el tiempo necesario para atender posibles responsabilidades legales (ej. 5 años para obligaciones fiscales y de prevención de blanqueo de capitales). Pasado este plazo, serán destruidos mediante procesos de borrado seguro.
          </Block>

          <Block title="7. Ejercicio de tus Derechos (ARCO-POL)" icon={<Mail size={20}/>}>
            La legislación te otorga un control total sobre tu información. Puedes ejercer en cualquier momento los siguientes derechos:
            <ul className="list-none mt-3 space-y-2">
              <li>✓ <strong className="text-black">Acceso:</strong> Saber qué datos tenemos sobre ti.</li>
              <li>✓ <strong className="text-black">Rectificación:</strong> Corregir datos inexactos o incompletos.</li>
              <li>✓ <strong className="text-black">Supresión (Derecho al olvido):</strong> Solicitar el borrado de tus datos.</li>
              <li>✓ <strong className="text-black">Limitación y Oposición:</strong> Restringir o negarte a ciertos tratamientos.</li>
              <li>✓ <strong className="text-black">Portabilidad:</strong> Solicitar una copia de tus datos en formato estructurado.</li>
            </ul>
            <p className="mt-4">
              Para ejercerlos, escribe a <a className="underline text-black font-medium" href="mailto:info@stratosfere.com">info@stratosfere.com</a> desde el correo asociado a tu cuenta. Asimismo, te informamos de tu derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si consideras que tus derechos han sido vulnerados.
            </p>
          </Block>

</div>
        {/* FOOTER LEGAL */}
        <footer className="mt-20 border-t border-zinc-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-4 font-medium">
            <Link href="/terms" className="hover:text-black transition-colors">Términos de Servicio</Link>
            <span>·</span>
            <Link href="/privacy" className="text-black">Privacidad</Link>
            <span>·</span>
            <Link href="/refunds" className="hover:text-black transition-colors">Reembolsos</Link>
          </div>
          <p>© {new Date().getFullYear()} Stratosfere OS. Todos los derechos reservados.</p>
        </footer>
      </div>
    </main>
  );
}

// COMPONENTES AUXILIARES PARA EL DISEÑO
function PrincipleCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
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

function Block({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
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