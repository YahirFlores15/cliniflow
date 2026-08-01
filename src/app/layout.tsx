import "./globals.css";

import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import type { Metadata } from "next";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ClinicFlow",
    template: "%s | ClinicFlow",
  },
  description:
    "Sistema web para la administración y operación de una clínica privada.",
  applicationName: "ClinicFlow",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}