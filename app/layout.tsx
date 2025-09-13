import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import React, { useState } from "react";
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

  // Mobile menu state
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}
      >
        <AuthProvider>
          <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-6 py-4">
              <h1 className="text-xl md:text-2xl font-bold text-black">Schirmer&apos;s Notary</h1>
              {/* Hamburger for mobile */}
              <button
                className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-700"
                aria-label="Open menu"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              {/* Desktop nav */}
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="hover:text-green-700">Home</Link>
                <Link href="/services" className="hover:text-green-700">Services</Link>
                <Link href="/about" className="hover:text-green-700">About</Link>
                <Link href="/request" className="hover:text-green-700">Jobs</Link>
                <Link href="/contact" className="hover:text-green-700">Contact</Link>
                <Link href="/login" className="px-3 py-1 rounded-lg bg-green-700 text-white hover:bg-green-800">Login</Link>
              </nav>
            </div>
            {/* Mobile nav menu */}
            {menuOpen && (
              <nav className="md:hidden bg-white border-t border-gray-200 px-4 py-2 flex flex-col space-y-2">
                <Link href="/" className="hover:text-green-700" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link href="/services" className="hover:text-green-700" onClick={() => setMenuOpen(false)}>Services</Link>
                <Link href="/about" className="hover:text-green-700" onClick={() => setMenuOpen(false)}>About</Link>
                <Link href="/request" className="hover:text-green-700" onClick={() => setMenuOpen(false)}>Jobs</Link>
                <Link href="/contact" className="hover:text-green-700" onClick={() => setMenuOpen(false)}>Contact</Link>
                <Link href="/login" className="px-3 py-1 rounded-lg bg-green-700 text-white hover:bg-green-800" onClick={() => setMenuOpen(false)}>Login</Link>
              </nav>
            )}
          </header>

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
