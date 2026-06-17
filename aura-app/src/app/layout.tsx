import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aura - Agentic Payments",
  description: "The Agentic Micro-Patron Platform. Built for Speedrun.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-bg-base text-text-main selection:bg-aura-500/30">
        <main className="min-h-screen relative overflow-hidden">
          {/* Global Background Glow Elements */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-aura-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 min-h-screen">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
