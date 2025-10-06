import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ClientLayout from "@/components/ClientLayout";

const chillax = localFont({
  src: [
    {
      path: '../../public/fonts/chillax/Chillax-Extralight.otf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/chillax/Chillax-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/chillax/Chillax-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/chillax/Chillax-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/chillax/Chillax-Semibold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/chillax/Chillax-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-chillax',
});

export const metadata: Metadata = {
  title: "IMAGI - Game Gallery Platform",
  description: "Transform your gaming memories into stunning visual stories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={chillax.className}>
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
