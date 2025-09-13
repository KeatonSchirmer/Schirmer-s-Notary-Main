import Image from "next/image";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <section className="bg-gray-100 mt-6 md:mt-10 mb-8 md:mb-12 max-w-4xl mx-auto px-4 md:px-0">
        <div className="p-4 md:p-8 rounded-xl shadow-md text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">About Schirmer&apos;s Notary</h2>
          <p className="mb-6 md:mb-8 text-sm md:text-base text-center">
            Founded by Keaton Schirmer, Schirmer&apos;s Notary is built on the belief that notarization
            should be easy, accessible, and stress-free. With mobile and online services, we
            bring convenience and professionalism to every client.
          </p>
        </div>
      </section>

      <section className="mb-8 md:mb-12 max-w-4xl mx-auto px-4 md:px-0">
        <div className="flex flex-col items-center md:flex-row md:justify-center mx-auto">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md text-center w-full md:w-auto">
            <Image src="/keaton.jpeg" alt="Keaton Schirmer" width={112} height={112} className="rounded-full w-20 h-20 md:w-28 md:h-28 mx-auto mb-2 md:mb-4" />
            <h4 className="text-lg md:text-xl font-semibold">Keaton Schirmer</h4>
            <p className="text-gray-600 text-sm md:text-base">CEO & Notary</p>
            <p className="mt-2 md:mt-4 text-sm md:text-base">
              Keaton Schirmer is the founder and CEO of Schirmer&apos;s Notary, a mobile and online notary service dedicated to
              making notarization fast, reliable, and convenient. With a background in technology and business, Keaton brings
              a unique blend of innovation and professionalism to the notary industry.
              <br className="hidden md:block" />
              <br className="hidden md:block" />
              As the sole notary and operator, Keaton personally ensures that every client receives accurate, secure, and timely
              services—whether meeting at an office, a client&apos;s home, or virtually. His mission is to remove barriers to
              notarization, giving individuals and businesses peace of mind knowing their documents are handled with care.
              <br className="hidden md:block" />
              <br className="hidden md:block" />
              Outside of notarial work, Keaton is passionate about building tools and solutions that simplify complex processes,
              from client scheduling to digital recordkeeping. His vision for Schirmer&apos;s Notary is to combine modern technology
              with trusted notary practices, creating a seamless experience for clients today and into the future.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}