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
  metadataBase: new URL("https://lamuchachada.vercel.app"),
  title: "La Muchachada",
  description: "Clips y buenos momentos con los amigos",
  openGraph: {
    title: "La Muchachada DX",
    description: "Clips y buenos momentos con los amigos",
    url: "/",
    siteName: "La Muchachada",
    locale: "es_CL",
    type: "website",
    images: [
      {
        url: "/preview.png",
        width: 600,
        height: 600,
        alt: "La Muchachada DX",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "La Muchachada DX",
    description: "Clips y buenos momentos con los amigos",
    images: ["/preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body className={`${pricedown.variable} antialiased`}>
        <Fondo />
        {children}
      </body>
    </html>
  );
}