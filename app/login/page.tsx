"use client";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) throw new Error(await res.text());
            setSuccess("Login successful!");
            setEmail(""); setPassword("");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed to log in.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto py-16 px-6">
            <h2 className="text-3xl font-bold mb-6 text-center">Client Login</h2>
            <form className="bg-white p-8 rounded-xl shadow-md space-y-6" onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" required value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg" required value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit" className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
                </button>
                {error && <div className="text-red-600 mt-2">{error}</div>}
                {success && <div className="text-green-600 mt-2">{success}</div>}
            </form>
            <p className="text-center mt-4 text-sm text-gray-600">
            Don&apos;t have an account? <Link href="/request" className="text-green-700 hover:underline">Request a Service</Link>
            </p>          
        </div>
    );
}