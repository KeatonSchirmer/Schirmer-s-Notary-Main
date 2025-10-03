"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "../auth-context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { isLoggedIn, login } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoggedIn) {
            router.push('/client');
        }
    }, [isLoggedIn, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError("Please enter both email and password");
            return;
        }
        
        setLoading(true);
        setError("");
        
        try {
            const response = await fetch("https://schirmer-s-notary-backend.onrender.com/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || "Invalid credentials");
            }

            const data = await response.json();
            
            let username = '';
            try {
                const sessionResponse = await fetch("https://schirmer-s-notary-backend.onrender.com/session");
                if (sessionResponse.ok) {
                    const sessionData = await sessionResponse.json();
                    username = sessionData.username || '';
                }
            } catch (err) {
            }

            const userData = {
                id: data.user_id || 1,
                email: email,
                type: data.user_type as 'admin' | 'client',
                name: username
            };

            await login(email, password);
            
            // Always route to client portal since this is a client-only site
            router.push('/client');
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
        <div className="text-black max-w-sm mx-auto py-10 md:py-16 px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">Client Login</h2>
            <form className="bg-white p-4 md:p-8 rounded-xl shadow-md space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base" required value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base" required value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit" className="bg-[#676767] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-[#575757] w-full text-sm md:text-base" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
                </button>
                {error && <div className="text-red-600 mt-2">{error}</div>}
            </form>
            <p className="text-center mt-4 text-xs md:text-sm text-gray-600">
            Don&apos;t have an account? <Link href="/book" className="text-[#676767] hover:underline">Book an Appointment</Link>
            </p>
            <p className="text-center mt-2 text-xs md:text-sm text-gray-600">
                <Link href="/book" className="text-[#676767] hover:underline">Register</Link>
            </p>         
        </div>
    );
}