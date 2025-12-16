// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

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
      </body>
    </html>
  );
}


