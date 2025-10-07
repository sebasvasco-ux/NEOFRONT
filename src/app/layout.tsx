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
  title: "SPECTRA DC - Monitor Transaccional Inteligente",
  description: "Sistema avanzado de monitoreo transaccional con IA para detección de fraudes y gestión de riesgos financieros.",
  keywords: ["SPECTRA DC", "monitoreo transaccional", "fraude", "IA", "finanzas", "seguridad", "Next.js", "TypeScript"],
  authors: [{ name: "SPECTRA DC Team" }],
  openGraph: {
    title: "SPECTRA DC - Monitor Transaccional Inteligente",
    description: "Sistema avanzado de monitoreo transaccional con IA para detección de fraudes",
    url: "https://spectradc.app",
    siteName: "SPECTRA DC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SPECTRA DC - Monitor Transaccional Inteligente",
    description: "Sistema avanzado de monitoreo transaccional con IA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
