// Ubicación: ./app/components/alive-map/ui-panels/StratosWelcomeGate.tsx
import React from 'react';

export default function StratosWelcomeGate({ playSynthSound }: any) {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col justify-between items-center p-8 sm:p-20 pointer-events-auto animate-fade-in select-none overflow-hidden bg-black">

      {/* 📽️ VÍDEO DE FONDO CINEMÁTICO (La Tierra girando) */}
     <video
  autoPlay
  loop
  muted
  playsInline
  className="absolute top-0 left-0 w-full h-full object-cover -z-10"
>
  <source src="/videos/color.mp4" type="video/mp4" />
</video>

      {/* 1️⃣ PARTE SUPERIOR: LOGO Y BOTÓN */}
      <div className="w-full flex flex-col items-center gap-8 z-10 mt-10 animate-fade-in-up delay-100">
        <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold tracking-tight text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] cursor-default mt-4 md:mt-0">
          Stratosfere OS.
        </h1>
        <button
          onClick={() => {
            if (typeof playSynthSound === "function") playSynthSound("click");
            window.location.href = "/register";
          }}
          className="px-10 py-4 bg-[#0071e3]/90 hover:bg-[#0077ED] text-white font-bold rounded-full shadow-[0_0_20px_rgba(0,113,227,0.4)] hover:shadow-[0_0_40px_rgba(0,113,227,0.8)] transition-all transform hover:scale-105 backdrop-blur-md uppercase tracking-widest text-sm border border-white/10"
        >
          Crear Cuenta
        </button>
      </div>

      {/* 2️⃣ PARTE CENTRAL: EL MENSAJE DE BIENVENIDA (Estilo Apple Glassmorphism) */}
      <div className="flex flex-col items-center justify-center text-center z-10 mb-20 animate-fade-in-up delay-300">
        <div className="p-10 md:p-14 rounded-[2.5rem] bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl max-w-3xl transform transition-all hover:bg-black/30 hover:border-white/20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg tracking-tight">
            Te damos la bienvenida.
          </h2>
          <p className="text-lg md:text-xl text-zinc-300 font-light drop-shadow-md leading-relaxed">
            Explora el mercado inmobiliario con la tecnología del mañana.<br/>Tu centro de mando orbital te espera.
          </p>
        </div>
      </div>

      {/* 3️⃣ PARTE INFERIOR: PIE DE PÁGINA LEGAL Y SUTIL */}
      <div className="z-10 mb-4 backdrop-blur-md py-3 px-8 rounded-full bg-black/30 border border-white/5 animate-fade-in-up delay-500">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-white/70 tracking-wide font-light">
          <a className="hover:text-white transition-colors" href="/pricing">Pricing</a>
          <a className="hover:text-white transition-colors" href="/terms">Términos</a>
          <a className="hover:text-white transition-colors" href="/privacy">Privacidad</a>
          <a className="hover:text-white transition-colors" href="/refunds">Reembolsos</a>
          <span className="text-white/30 ml-2 font-mono">© {new Date().getFullYear()} Stratosfere</span>
        </div>
      </div>

    </div>
  );
}