import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter, Poppins } from "next/font/google";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({ 
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Game Gallery",
  description: "Showcase your games beautifully",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="bg-gray-900 text-white font-sans">
        {/* Navbar on all pages */}
        <Navbar />

        <main className="min-h-screen">{children}</main>

        {/* Footer on all pages */}
        <Footer />
      </body>
    </html>
  );
}
