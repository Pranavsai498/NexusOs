import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ 
  weight: ["400", "500", "600", "700", "800"], 
  subsets: ["latin"],
  variable: "--font-poppins" 
});

export const metadata: Metadata = {
  title: "NexusOS - AI Family Intelligence Platform",
  description: "The ultimate intelligent orchestrator for your household's finances, health, and legal documents.",
};

import AuthGuard from "@/components/AuthGuard";
import FloatingAssistant from "@/components/FloatingAssistant";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${poppins.variable} font-sans bg-[#F8FAFC] text-slate-900 antialiased`}>
        <div className="min-h-screen flex flex-col selection:bg-blue-200 selection:text-blue-900">
          <AuthGuard>
            {children}
            <FloatingAssistant />
          </AuthGuard>
        </div>
      </body>
    </html>
  );
}
