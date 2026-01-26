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
  title: "ProXis",
  description: "Sistema de Gestión de Obras y Proyectos",
  keywords: ["ProXis", "Gestión", "Proyectos", "Construcción", "Next.js"],
  authors: [{ name: "ProXis" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ProXis",
    description: "Sistema de Gestión de Obras y Proyectos",
    url: "http://localhost:3000",
    siteName: "ProXis",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProXis",
    description: "Sistema de Gestión de Obras y Proyectos",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
