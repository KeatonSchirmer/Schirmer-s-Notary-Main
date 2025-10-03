"use client";
import { useState } from "react";

export default function ClientContact() {
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
            const res = await fetch("https://schirmer-s-notary-backend.onrender.com/contact", {
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
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-gray-100 p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-[#676767] mb-2">Direct Contact</h3>
                            <p className="text-sm">Email: <a href="mailto:schirmer.nikolas@gmail.com" className="text-[#676767] hover:underline">schirmer.nikolas@gmail.com</a></p>
                            <p className="text-sm">Phone: <a href="tel:+18503918706" className="text-[#676767] hover:underline">(850) 391-8706</a></p>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold text-[#676767] mb-2">Office Hours</h3>
                            <p className="text-sm">Monday - Friday: 9:00 AM - 6:00 PM</p>
                            <p className="text-sm">Saturday: By Appointment</p>
                            <p className="text-sm">Sunday: Closed</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-[#676767] mb-2">Service Area</h3>
                            <p className="text-sm">Bay County, Gulf County, Walton County, Washington County, Calhoun County</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-[#676767] mb-2">Emergency Services</h3>
                            <p className="text-sm">Rush and after-hours appointments available with premium pricing</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold mb-6 text-center text-[#676767]">Send Us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#676767] focus:border-transparent" 
                                required 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#676767] focus:border-transparent" 
                                required 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <textarea 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4} 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#676767] focus:border-transparent" 
                                placeholder="How can we help you?"
                                required 
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-[#676767] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#575757] disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Message"}
                        </button>

                        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg">{error}</div>}
                        {success && <div className="bg-green-50 text-[#676767] p-3 rounded-lg">{success}</div>}
                    </form>
                </div>
            </div>
        </div>
    );
}