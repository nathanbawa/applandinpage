import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Toronto Student App",
  description: "Your Toronto Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[var(--color-bg-color)] text-[var(--color-text-dark)] flex justify-center antialiased`}>
        <div className="app-container w-full max-w-[480px] bg-[var(--color-bg-color)] min-h-screen relative pb-[100px] shadow-[0_12px_32px_rgba(0,0,0,0.06)] overflow-x-hidden">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
