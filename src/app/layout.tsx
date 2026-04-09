import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

import { BRAND_CONFIG, getBrand } from "@/config/branding";

const brand = getBrand();

export const metadata: Metadata = {
  title: `${brand.name} : ${brand.subtitle || "ML Attribution System"}`,
  description: "Enterprise-Scale Cloud AI Model Attribution & Chargeback Dashboard",
  icons: {
    icon: "/favicon.svg",
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}


