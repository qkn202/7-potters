import type { Metadata } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/lib/GameContext";

const inter = Inter({ subsets: ["latin", "vietnamese"] });
const playfair = Playfair_Display({ 
  subsets: ["latin", "vietnamese"], 
  weight: ["600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap"
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
  variable: "--font-cormorant",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Battle of the Seven Potters",
  description: "A social deduction game for Potterheads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} ${playfair.variable} ${cormorant.variable} text-gray-200 antialiased min-h-screen`}>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
