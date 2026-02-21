// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stratosfere os",
  description: "Search Better.", 
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      {/* 🔥 ESCUDOS ACTIVADOS: antialiased y optimizeLegibility inyectados */}
      <body className="bg-black text-zinc-100 antialiased [text-rendering:optimizeLegibility]">
        {children}
      </body>
    </html>
  );
}