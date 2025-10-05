import "../globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin panel for game gallery",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {children}
    </div>
  );
}
