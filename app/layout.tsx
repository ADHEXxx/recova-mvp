import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { StoreProvider } from "@/lib/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recova — Simbiosis industrial inteligente",
  description:
    "Recova conecta generadores de residuos aprovechables con empresas que pueden utilizarlos como materia prima secundaria, impulsado por EVA.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <StoreProvider>
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster position="top-center" />
          </TooltipProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
