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
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      {!isAuthPage && !isAdminPage && <Navbar />}
      <main className="relative">
        {children}
      </main>
      {!isAuthPage && !isAdminPage && <Footer />}
    </>
  );
}
