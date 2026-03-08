// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

// 1. IMPORTAMOS EL ESCUDO LEGAL (Ajustado a la ruta de su captura)
import CookieConsent from '@/app/components/alive-map/ui-panels/CookieConsent';

export const metadata: Metadata = {
  title: "Stratosfere os",
  description: "Search Better.", // O el lema que elijas
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-black text-zinc-100">
        {children}
        
        {/* 2. INYECTAMOS EL COMPONENTE AL FINAL DE TODO */}
        <CookieConsent />
      </body>
    </html>
  );
}