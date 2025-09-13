import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "./Navbar";
import Link from 'next/link';
import "./globals.css";
import { AuthProvider } from "./auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Schirmer's Notary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}
      >
        <AuthProvider>
          <Navbar />

          <main className="flex-grow">{children}</main>

          <footer className="bg-gray-900 text-gray-300 py-8 text-center">
            <div className="space-x-3 md:space-x-6 mb-4 text-xs md:text-base">
              <Link href="/" className="hover:text-white">Home</Link>
              <Link href="/services" className="hover:text-white">Services</Link>
              <Link href="/about" className="hover:text-white">About</Link>
              <Link href="/request" className="hover:text-white">Request</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
            <p>© {new Date().getFullYear()} Schirmer&apos;s Notary. All rights reserved.</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
