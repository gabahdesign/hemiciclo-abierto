import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hemiciclo Abierto · Generales 29N",
  description: "Todas las candidaturas al Congreso, participación ciudadana y pactos con fuentes oficiales.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
