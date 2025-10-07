import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spectra DC - Acceso Seguro",
  description: "Plataforma de acceso seguro con autenticación cuántica y tecnología de vanguardia para Spectra DC.",
  keywords: ["Spectra DC", "Acceso Seguro", "Autenticación Cuántica", "OAuth 2.0", "Seguridad", "PKCE", "256-bit"],
  authors: [{ name: "Spectra DC Team" }],
  openGraph: {
    title: "Spectra DC - Acceso Seguro",
    description: "Plataforma de acceso seguro con autenticación cuántica para Spectra DC",
    url: "https://spectra-dc.com",
    siteName: "Spectra DC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spectra DC - Acceso Seguro",
    description: "Plataforma de acceso seguro con autenticación cuántica para Spectra DC",
  },
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}>
      {children}
      <Toaster />
    </div>
  );
}
