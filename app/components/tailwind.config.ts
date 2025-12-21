import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // COLORES PERSONALIZADOS (SI LOS NECESITAMOS MÁS ADELANTE)
      colors: {
        'stratos-dark': '#050505',
        'neon-blue': '#2563eb',
      },
      // ANIMACIONES FLUIDAS (SILICON VALLEY STANDARD)
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards', // Efecto "Pop" suave
        'fade-in': 'fadeIn 1s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'zoom-in': 'zoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite', // Latido lento y tecnológico
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'translate(-50%, -120%) scale(0.85)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -140%) scale(1)' },
        }
      },
      // EFECTOS DE NEÓN (BOX SHADOWS)
      boxShadow: {
        'neon-blue': '0 0 20px rgba(37, 99, 235, 0.5)',
        'neon-amber': '0 0 20px rgba(245, 158, 11, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
};
export default config;

