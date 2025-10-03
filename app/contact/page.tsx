"use client";
import { useState } from "react";

export default function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch("http://schirmer-s-notary-backend.onrender.com/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message })
            });
            if (!res.ok) throw new Error(await res.text());
            setSuccess("Message sent successfully!");
            setName(""); setEmail(""); setMessage("");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed to send message.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-black max-w-6xl mx-auto py-10 md:py-16 px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="bg-gray-100 p-4 md:p-6 rounded-xl shadow-md">
                <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Contact Information</h2>
                <p className="text-sm md:text-base">Email: <a href="mailto:schirmer.nikolas@gmail.com" className="text-[#676767]">schirmer.nikolas@gmail.com</a></p>
                <p className="text-sm md:text-base">Phone: <a href="tel:+18503918706" className="text-[#676767]">(850) 391-8706</a></p>
                <p className="text-sm md:text-base">Office Hours: Mon - Fri, 9am - 6pm</p>
                <p className="text-sm md:text-base">Service Area: Bay County, Gulf County, Walton County, Washington County, Calhoun County</p>
            </div>
            <form className="bg-white p-4 md:p-8 rounded-xl shadow-md space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">Send Us a Message</h2>
                <input type="text" placeholder="Your Name" className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base" required value={name} onChange={e => setName(e.target.value)} />
                <input type="email" placeholder="Your Email" className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base" required value={email} onChange={e => setEmail(e.target.value)} />
                <textarea placeholder="Your Message" className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base" rows={4} required value={message} onChange={e => setMessage(e.target.value)}></textarea>
                <button type="submit" className="bg-[#676767] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-[#575757] w-full text-sm md:text-base" disabled={loading}>
                    {loading ? "Sending..." : "Send Message"}
                </button>
                {error && <div className="text-red-600 mt-2">{error}</div>}
                {success && <div className="text-[#676767] mt-2">{success}</div>}
            </form>
        </div>
    );
}