"use client";

import { useAuth } from "../auth-context";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Booking {
  id: number;
  service: string;
  date: string;
  time: string;
  status: string;
  urgency: string;
  notes: string;
  created_at: string;
}

export default function Dashboard() {
  const { isLoggedIn, isPremium, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    fetchBookings();
  }, [isLoggedIn, router]);

  const fetchBookings = async () => {
    try {
      const res = await fetch("https://schirmer-s-notary-backend.onrender.com/client/requests", {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'accepted': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'declined': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#676767] text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-200 mt-2">
                {isPremium ? "Premium Member" : "Standard Member"}
              </p>
            </div>
            <div className="space-x-4">
              <Link 
                href="/book" 
                className="bg-white text-[#676767] px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
              >
                New Booking
              </Link>
              <button
                onClick={logout}
                className="bg-transparent border-2 border-white text-white px-4 py-2 rounded-lg font-semibold hover:bg-white hover:text-[#676767]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-[#676767] mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-gray-800">{bookings.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-[#676767] mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {bookings.filter((b: Booking) => b.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-[#676767] mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600">
              {bookings.filter((b: Booking) => b.status === 'completed').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-[#676767] mb-6">Recent Bookings</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-600">Loading your bookings...</div>
            </div>
          ) : error ? (
            <div className="text-red-600 py-8 text-center">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No bookings found.</p>
              <Link 
                href="/book" 
                className="bg-[#676767] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#575757]"
              >
                Book Your First Appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{booking.service}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>📅 {booking.date}</div>
                        <div>🕒 {booking.time}</div>
                        <div>⚡ {booking.urgency}</div>
                      </div>
                      {booking.notes && (
                        <p className="text-sm text-gray-600 mt-2">📝 {booking.notes}</p>
                      )}
                    </div>
                    <div className="mt-3 md:mt-0 text-right">
                      <p className="text-xs text-gray-500">
                        Requested: {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}