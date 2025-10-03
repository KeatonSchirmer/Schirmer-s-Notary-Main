"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "./auth-context";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, isPremium, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center px-4 md:px-6 py-4">
      <img src="/NBlogo.png" alt="Schirmer's Notary Logo" width={100} height={100} className="overflow-hidden"/>
      <h1 className="text-xl md:text-4xl font-serif font-bold text-black">Schirmer&apos;s Notary</h1>
        <button
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#676767]"
          aria-label="Open menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#676767]">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="hidden md:flex space-x-6 text-xl justify-end flex-1">
          {isLoggedIn ? (
            <>
              <Link href="/client" className="hover:text-[#676767]">Dashboard</Link>
              <Link href="/client/book" className="hover:text-[#676767]">Book</Link>
              <Link href="/client/bookings" className="hover:text-[#676767]">My Bookings</Link>
              <Link href="/client/history" className="hover:text-[#676767]">History</Link>
              <Link href="/client/services" className="hover:text-[#676767]">Services</Link>
              <Link href="/client/contact" className="hover:text-[#676767]">Contact</Link>
              <Link href="/client/account" className="hover:text-[#676767]">Account</Link>
              <button 
                onClick={logout}
                className="px-3 py-1 rounded-lg bg-[#676767] text-white hover:bg-[#575757]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/" className="hover:text-[#676767]">Home</Link>
              <Link href="/services" className="hover:text-[#676767]">Services</Link>
              <Link href="/about" className="hover:text-[#676767]">About</Link>
              <Link href="/book" className="hover:text-[#676767]">Book</Link>
              <Link href="/contact" className="hover:text-[#676767]">Contact</Link>
              <Link href="/login" className="px-3 py-1 rounded-lg bg-[#676767] text-white hover:bg-[#575757]">Login</Link>
            </>
          )}
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 text-black px-4 py-2 flex flex-col space-y-2">
          {isLoggedIn ? (
            <>
              <Link href="/client" className="hover:text-[#676767]" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/client/book" className="hover:text-[#676767]" onClick={() => setMenuOpen(false)}>Book</Link>
              <Link href="/client/bookings" className="hover:text-[#676767]" onClick={() => setMenuOpen(false)}>My Bookings</Link>
              <Link href="/client/history" className="hover:text-[#676767]" onClick={() => setMenuOpen(false)}>History</Link>
              <Link href="/client/services" className="hover:text-[#676767]" onClick={() => setMenuOpen(false)}>Services</Link>
              <Link href="/client/contact" className="hover:text-[#676767]" onClick={() => setMenuOpen(false)}>Contact</Link>
              <Link href="/client/account" className="hover:text-[#676767]" onClick={() => setMenuOpen(false)}>Account</Link>
              <button 
                onClick={() => { logout(); setMenuOpen(false); }}
                className="px-3 py-1 rounded-lg bg-[#676767] text-white hover:bg-[#575757] text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/" className="hover:text-[#676767]" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href="/services" className="hover:text-[#676767]" onClick={() => setMenuOpen(false)}>Services</Link>
              <Link href="/about" className="hover:text-[#676767]" onClick={() => setMenuOpen(false)}>About</Link>
              <Link href="/book" className="hover:text-[#676767]" onClick={() => setMenuOpen(false)}>Book</Link>
              <Link href="/contact" className="hover:text-[#676767]" onClick={() => setMenuOpen(false)}>Contact</Link>
              <Link href="/login" className="px-3 py-1 rounded-lg bg-[#676767] text-white hover:bg-[#575757]" onClick={() => setMenuOpen(false)}>Login</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
