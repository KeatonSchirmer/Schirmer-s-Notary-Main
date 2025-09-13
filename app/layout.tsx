import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
          <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
              <h1 className="text-2xl font-bold text-black">Schirmer&apos;s Notary</h1>
              <nav className="space-x-6">
                <Link href="/" className="hover:text-green-700">Home</Link>
                <Link href="/services" className="hover:text-green-700">Services</Link>
                <Link href="/about" className="hover:text-green-700">About</Link>
                <Link href="/request" className="hover:text-green-700">Jobs</Link>
                <Link href="/contact" className="hover:text-green-700">Contact</Link>
                <Link href="/login" className="px-3 py-1 rounded-lg bg-green-700 text-white hover:bg-green-800">Login</Link>
              </nav>
            </div>
          </header>

          <main className="flex-grow">{children}</main>

          <footer className="bg-gray-900 text-gray-300 py-8 text-center">
            <div className="space-x-6 mb-4">
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
