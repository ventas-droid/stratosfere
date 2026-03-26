// Ubicación: ./app/components/alive-map/ui-panels/StratosWelcomeGate.tsx
import React from 'react';
// IMPORTAMOS LOS ICONOS TÁCTICOS (Lucide React)
import { Apple, Play, Twitter, Instagram, Facebook, Youtube } from 'lucide-react'; 

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

      {/* 2️⃣ PARTE CENTRAL: EL MENSAJE Y BOTONES DE APP */}
      <div className="flex flex-col items-center justify-center text-center z-10 mb-10 animate-fade-in-up delay-300">
        <div className="p-10 md:p-14 rounded-[2.5rem] bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl max-w-3xl transform transition-all hover:bg-black/30 hover:border-white/20 mb-8">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg tracking-tight">
            Te damos la bienvenida.
          </h2>
          <p className="text-lg md:text-xl text-zinc-300 font-light drop-shadow-md leading-relaxed">
            Explora el mercado inmobiliario con la tecnología del mañana.<br/>Tu centro de mando orbital te espera.
          </p>
        </div>

        {/* 🔥 LOS BOTONES "SILICON VALLEY" (App Store & Google Play) 🔥 */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-400">
          {/* Botón Apple */}
          <button className="flex items-center gap-3 px-6 py-3 bg-black/40 hover:bg-black/80 border border-white/10 rounded-2xl backdrop-blur-md transition-all hover:scale-105 group">
            <Apple className="text-white group-hover:text-gray-200 transition-colors" size={32} strokeWidth={1.5} />
            <div className="text-left">
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider leading-none mb-1">Descárgalo en el</p>
              <p className="text-white font-bold text-sm leading-none tracking-wide">App Store</p>
            </div>
          </button>

          {/* Botón Google */}
          <button className="flex items-center gap-3 px-6 py-3 bg-black/40 hover:bg-black/80 border border-white/10 rounded-2xl backdrop-blur-md transition-all hover:scale-105 group">
            <Play className="text-white group-hover:text-[#3b82f6] transition-colors" size={30} strokeWidth={1.5} />
            <div className="text-left">
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider leading-none mb-1">Disponible en</p>
              <p className="text-white font-bold text-sm leading-none tracking-wide">Google Play</p>
            </div>
          </button>
        </div>
      </div>

      {/* 3️⃣ PARTE INFERIOR: REDES SOCIALES Y LEGALES */}
      <div className="z-10 flex flex-col items-center gap-5 animate-fade-in-up delay-500 mb-4">
        
       {/* Redes Sociales Minimalistas (Pájaro aniquilado) */}
        <div className="flex items-center gap-6 bg-black/20 backdrop-blur-md px-8 py-3 rounded-full border border-white/5">
          <a href="#" className="text-white/50 hover:text-[#E1306C] transition-all transform hover:scale-110">
            <Instagram size={20} strokeWidth={1.5} />
          </a>
          
          {/* 🔥 LA NUEVA "X" OFICIAL (SVG Vectorial Puro) 🔥 */}
          <a href="#" className="text-white/50 hover:text-white transition-all transform hover:scale-110">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>

          <a href="#" className="text-white/50 hover:text-[#0866FF] transition-all transform hover:scale-110">
            <Facebook size={20} strokeWidth={1.5} />
          </a>
          
          <a href="#" className="text-white/50 hover:text-[#FF0000] transition-all transform hover:scale-110">
            <Youtube size={22} strokeWidth={1.5} />
          </a>
        </div>

        {/* Pie de Página Legal */}
        <div className="backdrop-blur-md py-3 px-8 rounded-full bg-black/30 border border-white/5">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-white/70 tracking-wide font-light">
            <a className="hover:text-white transition-colors" href="/pricing">Pricing</a>
            <a className="hover:text-white transition-colors" href="/terms">Términos</a>
            <a className="hover:text-white transition-colors" href="/privacy">Privacidad</a>
            <a className="hover:text-white transition-colors" href="/refunds">Reembolsos</a>
            <span className="text-white/30 ml-2 font-mono">© {new Date().getFullYear()} Stratosfere</span>
          </div>
        </div>

      </div>

    </div>
  );
}