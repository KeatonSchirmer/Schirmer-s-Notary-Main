import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      <section className="bg-green-700 text-white text-center py-20">
        <h2 className="text-4xl font-bold mb-4">Fast, Reliable, and Mobile Notary Services</h2>
        <p className="mb-6">We meet you where you are—office, home, or online.</p>
        <Link href="/request" className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200">
        Request a Service
        </Link>
      </section>

      <section className="max-w-7xl mx-auto py-16 px-6">
        <h3 className="text-3xl font-bold text-center mb-10">Our Services</h3>
        <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg">
          <h4 className="text-xl font-semibold mb-3">Mobile Notary</h4>
          <p>Convenient notarization at your home, office, or chosen location. <span className="font-bold">From $30</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg">
          <h4 className="text-xl font-semibold mb-3">Online Notary</h4>
          <p>Secure and legal online notarizations from anywhere. <span className="font-bold">From $30</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg">
          <h4 className="text-xl font-semibold mb-3">Business Services</h4>
          <p>Fast, reliable notary solutions for your company&apos;s needs. <span className="font-bold">Premium plans available</span></p>
        </div>
        </div>
        <div className="text-center mt-8">
          <Link href="/services" className="text-green-700 font-semibold hover:underline">View All Services →</Link>
        </div>
      </section>

      <section className="bg-gray-100 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">About Us</h3>
          <p className="mb-6">
          Schirmer&apos;s Notary is committed to making notarizations faster, more reliable,
          and more convenient. Led by CEO and notary professional Keaton Schirmer, our mission
          is to bring trusted services to clients wherever they need them.
          </p>
          <div className="flex justify-center space-x-8 mt-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <Image src="/keaton.jpeg" alt="Keaton Schirmer" width={96} height={96} className="rounded-full w-24 h-24 mx-auto mb-4" />
              <h4 className="text-xl font-semibold">Keaton Schirmer</h4>
              <p className="text-gray-600">CEO & Notary</p>
            </div>
          </div>
          <Link href="/about" className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 mt-8 inline-block">
          Learn More
          </Link>
        </div>
      </section>

      <section className="bg-green-700 text-white text-center py-16">
        <h3 className="text-3xl font-bold mb-4">Need a Notary Today?</h3>
        <p className="mb-6">Submit a request now and we&apos;ll get back to you promptly.</p>
        <Link href="/request" className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200">
        Request a Service
        </Link>
      </section>
    </div>
  );
}