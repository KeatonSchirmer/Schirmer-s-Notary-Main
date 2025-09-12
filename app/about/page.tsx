import Image from "next/image";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <section className="bg-gray-100 mt-10 mb-12 max-w-4xl mx-auto">
        <div className="p-8 rounded-xl shadow-md text-center">
          <h2 className="text-3xl font-bold mb-6 text-center">About Schirmer&apos;s Notary</h2>
          <p className="mb-8 text-center">
          Founded by Keaton Schirmer, Schirmer&apos;s Notary is built on the belief that notarization
          should be easy, accessible, and stress-free. With mobile and online services, we
          bring convenience and professionalism to every client.
          </p>
        </div>
      </section>

      <section className="mb-12 max-w-4xl mx-auto">
      <div className="flex justify-center mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <Image src="/keaton.jpeg" alt="Keaton Schirmer" width={112} height={112} className="rounded-full w-28 h-28 mx-auto mb-4" />
          <h4 className="text-xl font-semibold">Keaton Schirmer</h4>
          <p className="text-gray-600">CEO & Notary</p>
          <p className="mt-4">
            Keaton Schirmer is the founder and CEO of Schirmer&apos;s Notary, a mobile and online notary service dedicated to 
            making notarization fast, reliable, and convenient. With a background in technology and business, Keaton brings 
            a unique blend of innovation and professionalism to the notary industry.
            <br />
            <br />
            As the sole notary and operator, Keaton personally ensures that every client receives accurate, secure, and timely 
            services—whether meeting at an office, a client&apos;s home, or virtually. His mission is to remove barriers to 
            notarization, giving individuals and businesses peace of mind knowing their documents are handled with care.
            <br />
            <br />
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