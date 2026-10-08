import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Fondo from "@/components/Fondo";

const pricedown = localFont({
  src: "./fonts/pricedown-bl.otf",
  variable: "--font-pricedown",
  display: "swap",
});

export const metadata: Metadata = {
  title: "La Muchachada",
  description: "Clips y buenos momentos con los amigos",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${pricedown.variable} antialiased`}>
        <Fondo />
        {children}
      </body>
    </html>
  );
}