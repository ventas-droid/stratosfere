import Link from "next/link";

export const metadata = {
  title: "Pricing — Stratosfere",
  description: "Planes tácticos y licencias operativas de Stratosfere OS.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-black pb-20">
      
      {/* --- BANNER TÁCTICO SUPERIOR (CABALLO DE TROYA) --- */}
      <div className="bg-zinc-950 text-white text-center py-3 px-4 text-xs font-bold tracking-widest uppercase">
        <span className="text-zinc-400">STATUS:</span> EXPLORAR EL MAPA Y USAR LA APP ES 100% GRATIS.{" "}
        <span className="text-[#3b82f6]">SOLO INVIERTES AL PUBLICAR.</span>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-16">
          <div className="max-w-3xl">
            <div className="text-xs font-black tracking-[0.25em] uppercase text-zinc-400 mb-2">
              Vanguard Market Network
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900">
              Licencias Operativas.
            </h1>
            <p className="mt-4 text-zinc-600 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
              Descarga la App 24/7. Explora, guarda favoritos y asiste a eventos sin coste. 
              Desbloquea la Torre de Control cuando estés listo para dominar el mercado.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-zinc-200 shadow-sm">
            <Link href="/" className="text-xs font-black tracking-widest uppercase text-zinc-400 hover:text-black transition-colors">
              Inicio
            </Link>
            <span className="text-zinc-300">•</span>
            <Link href="/terms" className="text-xs font-black tracking-widest uppercase text-zinc-400 hover:text-black transition-colors">
              Términos
            </Link>
          </div>
        </header>

        {/* --- MATRIZ DE PRECIOS (3 COLUMNAS HIGH-TOP) --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* ========================================================= */}
          {/* 1. PLAN PARTICULAR (BASE) */}
          {/* ========================================================= */}
          <div className="relative flex flex-col bg-white rounded-3xl p-8 border border-zinc-200 shadow-xl shadow-zinc-200/50 hover:-translate-y-1 transition-transform duration-300">
            <div className="mb-6">
              <div className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400 mb-2">Protocolo Base</div>
              <h2 className="text-2xl font-black tracking-tight text-zinc-900">Explorador</h2>
              <p className="mt-2 text-sm text-zinc-500 min-h-[40px] font-medium">Posiciona tu activo en el mapa 3D y toma el control total, sin intermediarios no deseados.</p>
            </div>
            
            <div className="mb-8 flex items-baseline gap-1 border-b border-zinc-100 pb-8">
              <span className="text-5xl font-black tracking-tighter text-zinc-900">9,90€</span>
              <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">/ Pago Único</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              <FeatureItem text="App Móvil 24/7 (iOS/Android)" />
              <FeatureItem text="Publicación Inmersiva 3D" />
              <FeatureItem text="Escudo Anti-Spam (0 Llamadas)" />
              <FeatureItem text="Bandeja Propuestas Oficiales" />
              <FeatureItem text="Chat Seguro DropDoc Flash®" />
              <FeatureItem text="Gestión de Eventos Open House" />
            </ul>

            <Link href="/register" className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200 rounded-xl py-4 text-xs font-black tracking-widest uppercase text-center transition-colors">
              INICIAR DESPLIEGUE
            </Link>
          </div>

          {/* ========================================================= */}
          {/* 2. NANO CARD PREMIUM (MODO FUEGO) - DESTACADO */}
          {/* ========================================================= */}
          <div className="relative flex flex-col bg-zinc-900 rounded-3xl p-8 border border-orange-500/50 shadow-2xl shadow-orange-500/20 hover:-translate-y-1 transition-transform duration-300 overflow-hidden">
            {/* Resplandor de fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

            <div className="mb-6 relative z-10">
              <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] font-black tracking-[0.2em] uppercase text-orange-400">Multiplicador x5</div>
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1">
                  <FireIcon /> MODO FUEGO
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Nano Card VIP</h2>
              <p className="mt-2 text-sm text-zinc-400 min-h-[40px] font-medium">Para propietarios y agentes que necesitan liquidar el activo en tiempo récord.</p>
            </div>
            
            <div className="mb-8 flex flex-col gap-1 border-b border-zinc-800 pb-8 relative z-10">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black tracking-tighter text-white">29,90€</span>
                <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">/ 15 Días</span>
              </div>
              <div className="text-xs text-orange-400/80 font-bold tracking-wider uppercase mt-1">Opción Full: 49,90€ / 30 Días</div>
            </div>

            <ul className="space-y-4 mb-10 flex-1 relative z-10">
              <FeatureItem text="Todo lo del Protocolo Base" dark />
              <FeatureItem text="Posición Top #1 en tu Zona" dark iconColor="text-orange-500" />
              <FeatureItem text="Efecto Fuego visual en Mapa" dark iconColor="text-orange-500" />
              <FeatureItem text="Tarjeta Expandida XL en Radar" dark iconColor="text-orange-500" />
              <FeatureItem text="Algoritmo Venta Acelerada" dark iconColor="text-orange-500" />
            </ul>

            <Link href="/register" className="relative z-10 w-full bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-400 hover:to-red-500 rounded-xl py-4 text-xs font-black tracking-widest uppercase text-center shadow-lg shadow-orange-500/30 transition-all">
              ACTIVAR MODO FUEGO
            </Link>
          </div>

          {/* ========================================================= */}
          {/* 3. AGENCIA (TORRE DE CONTROL B2B) */}
          {/* ========================================================= */}
          <div className="relative flex flex-col bg-[#0a0f1c] rounded-3xl p-8 border border-blue-900/50 shadow-2xl shadow-blue-900/20 hover:-translate-y-1 transition-transform duration-300 overflow-hidden">
            {/* Resplandor de fondo B2B */}
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

            <div className="mb-6 relative z-10">
              <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-400">Licencia Profesional</div>
                <span className="border border-blue-500/30 text-blue-400 text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full">
                  B2B Realty
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Agency SF PRO</h2>
              <p className="mt-2 text-sm text-zinc-400 min-h-[40px] font-medium">La Torre de Control definitiva. Workflows, Bóveda B2B y Captación por Radar.</p>
            </div>
            
            <div className="mb-8 flex flex-col gap-1 border-b border-zinc-800 pb-8 relative z-10">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black tracking-tighter text-white">49,90€</span>
                <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">/ Mes</span>
              </div>
              <div className="text-xs text-[#38bdf8] font-black tracking-widest uppercase mt-1 flex items-center gap-1">
                 🎁 INCLUYE 15 DÍAS GRATIS
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1 relative z-10">
              <FeatureItem text="Cartera & Demandas Ilimitadas" dark iconColor="text-blue-500" />
              <FeatureItem text="Bóveda B2B (Cookies a 30 días)" dark iconColor="text-blue-500" />
              <FeatureItem text="SF Notes (Consola 100% Privada)" dark iconColor="text-blue-500" />
              <FeatureItem text="Generador Expedientes Oficiales" dark iconColor="text-blue-500" />
              <FeatureItem text="Red B2B (Comisiones Compartidas)" dark iconColor="text-blue-500" />
              <FeatureItem text="Acceso Vanguard Market (Zonas CP)" dark iconColor="text-blue-500" />
            </ul>

            <Link href="/register" className="relative z-10 w-full bg-blue-600 text-white hover:bg-blue-500 rounded-xl py-4 text-xs font-black tracking-widest uppercase text-center shadow-lg shadow-blue-600/20 transition-all">
              DESBLOQUEAR TORRE
            </Link>
          </div>

        </section>

        {/* --- FOOTER LEGAL Y OPERATIVO --- */}
        <section className="mt-20 border-t border-zinc-200 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="text-xs text-zinc-500 space-y-2">
            <p>
              <strong className="text-zinc-900 font-bold uppercase tracking-wider">Garantía Operativa:</strong> Las licencias Agency se pueden cancelar en cualquier momento.
            </p>
            <p>
              <strong className="text-zinc-900 font-bold uppercase tracking-wider">Campañas Top Agency (CP):</strong> La exclusividad de Código Postal se cotiza a medida.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-zinc-400">
            <Link href="/terms" className="hover:text-zinc-900 transition-colors">Términos</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-zinc-900 transition-colors">Privacidad</Link>
            <span>·</span>
            <Link href="/refunds" className="hover:text-zinc-900 transition-colors">Reembolsos</Link>
          </div>
        </section>

      </div>
    </main>
  );
}

// ============================================================================
// COMPONENTES TÁCTICOS REUTILIZABLES (ICONOS Y LISTAS)
// ============================================================================

function FeatureItem({ text, dark = false, iconColor = "" }: { text: string; dark?: boolean; iconColor?: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className={`mt-[2px] shrink-0 ${iconColor || (dark ? "text-zinc-400" : "text-zinc-900")}`}>
        <CheckIcon />
      </div>
      <span className={`text-sm font-medium ${dark ? "text-zinc-300" : "text-zinc-700"} leading-snug`}>
        {text}
      </span>
    </li>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function FireIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2C12 2 8 6.5 8 11.5C8 15.64 11.36 19 15.5 19C19.64 19 23 15.64 23 11.5C23 11.5 23 11.5 23 11.49C22.61 14.53 19.98 16.9 16.8 16.9C13.49 16.9 10.8 14.21 10.8 10.9C10.8 8.07 12.63 5.61 15.17 4.58C14.28 3.59 13.21 2.73 12 2ZM9 8C6.24 8 4 10.24 4 13C4 15.76 6.24 18 9 18C11.76 18 14 15.76 14 13C14 12.87 13.98 12.75 13.96 12.62C12.87 13.43 11.49 13.9 10 13.9C6.69 13.9 4 11.21 4 7.9C4 7.8 4 7.7 4 7.6C4.4 7.8 4.8 7.9 5.2 7.9C6.8 7.9 8.2 6.9 8.8 5.5C8.9 6.3 9 7.1 9 8Z"></path>
    </svg>
  );
}