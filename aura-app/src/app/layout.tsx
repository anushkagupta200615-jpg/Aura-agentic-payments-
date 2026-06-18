import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Aura Patron — AI-Powered Autonomous Creator Payments",
  description: "An autonomous micro-patron platform where AI agents track your content attention and stream fair micro-payments to creators via USDC on-chain. No clicks, no paywalls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} antialiased bg-bg-base text-text-main selection:bg-aura-500/30 h-full`}>
        <main className="h-full relative overflow-hidden">
          {/* Noise texture overlay for premium feel */}
          <div className="noise-overlay" />
          
          {/* Global Ambient Glow Orbs */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-aura-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-rose-500/8 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute top-[30%] left-[40%] w-[35%] h-[35%] bg-teal-500/6 rounded-full blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
          
          <div className="relative z-10 h-full">
            <Web3Provider>
              {children}
            </Web3Provider>
          </div>
        </main>
      </body>
    </html>
  );
}
