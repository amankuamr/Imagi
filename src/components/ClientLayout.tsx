"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup');

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main className="relative">
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}
