"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "./auth-context";

export default function Home() {
  const { isLoggedIn, isPremium } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <section className="bg-[#676767] text-white text-center py-12 md:py-20 px-4">
        {isLoggedIn ? (
          <>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Welcome Back!</h2>
            <p className="mb-6 text-base md:text-lg">
              {isPremium ? "Premium Member - Enjoy priority booking and exclusive features." : "Ready to book your next notary appointment?"}
            </p>
            <div className="space-x-4">
              <Link href="/book" className="bg-white text-[#676767] px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-200 text-sm md:text-base">
                Book Appointment
              </Link>
              <Link href="/dashboard" className="bg-transparent border-2 border-white text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-white hover:text-[#676767] text-sm md:text-base">
                View Dashboard
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Fast, Reliable, and Mobile Notary Services</h2>
            <p className="mb-6 text-base md:text-lg">We meet you where you are—office, home, or online.</p>
            <div className="space-x-4">
              <Link href="/book" className="bg-white text-[#676767] px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-200 text-sm md:text-base">
                Book an Appointment
              </Link>
              <Link href="/login" className="bg-transparent border-2 border-white text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-white hover:text-[#676767] text-sm md:text-base">
                Login
              </Link>
            </div>
          </>
        )}
      </section>

      <section className="max-w-7xl mx-auto py-10 md:py-16 px-4 md:px-6">
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10">Our Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg">
            <h4 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Mobile Notary</h4>
            <p className="text-sm md:text-base">Convenient notarization at your home, office, or chosen location. <span className="font-bold">From $30</span></p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg">
            <h4 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Online Notary</h4>
            <p className="text-sm md:text-base">Secure and legal online notarizations from anywhere. <span className="font-bold">From $30</span></p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg">
            <h4 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Business Services</h4>
            <p className="text-sm md:text-base">Fast, reliable notary solutions for your company&apos;s needs. <span className="font-bold">Premium plans available</span></p>
          </div>
        </div>
        <div className="text-center mt-6 md:mt-8">
          <Link href="/services" className="text-[#676767] font-semibold hover:underline text-sm md:text-base">View All Services →</Link>
        </div>
      </section>

      <section className="bg-gray-100 py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">About Us</h3>
          <p className="mb-4 md:mb-6 text-sm md:text-base">
            Schirmer&apos;s Notary is committed to making notarizations faster, more reliable,
            and more convenient. Led by CEO and notary professional Keaton Schirmer, our mission
            is to bring trusted services to clients wherever they need them.
          </p>
          <div className="flex flex-col items-center md:flex-row md:justify-center md:space-x-8 mt-6 md:mt-8">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-4 md:mb-0">
              <Image src="/keaton.jpeg" alt="Keaton Schirmer" width={96} height={96} className="rounded-full w-20 h-20 md:w-24 md:h-24 mx-auto mb-2 md:mb-4" />
              <h4 className="text-lg md:text-xl font-semibold">Keaton Schirmer</h4>
              <p className="text-gray-600 text-sm md:text-base">CEO & Notary</p>
            </div>
          </div>
          <Link href="/about" className="bg-[#676767] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-[#575757] mt-6 md:mt-8 inline-block text-sm md:text-base">
            Learn More
          </Link>
        </div>
      </section>

      <section className="bg-[#676767] text-white text-center py-10 md:py-16 px-4">
        {isLoggedIn ? (
          <>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Quick Actions</h3>
            <p className="mb-6 text-sm md:text-base">Manage your appointments and account settings.</p>
            <div className="space-x-4">
              <Link href="/book" className="bg-white text-[#676767] px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-200 text-sm md:text-base">
                New Appointment
              </Link>
              <Link href="/dashboard" className="bg-transparent border-2 border-white text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-white hover:text-[#676767] text-sm md:text-base">
                My Bookings
              </Link>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Need a Notary Today?</h3>
            <p className="mb-6 text-sm md:text-base">Book an appointment now and we&apos;ll get back to you promptly.</p>
            <Link href="/book" className="bg-white text-[#676767] px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-200 text-sm md:text-base">
              Book an Appointment
            </Link>
          </>
        )}
      </section>
    </div>
  );
}