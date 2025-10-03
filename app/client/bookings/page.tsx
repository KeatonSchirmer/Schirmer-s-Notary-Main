"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClientBookingsScreen() {
  const router = useRouter();
  const { isLoggedIn, userId } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (userId) {
        const response = await fetch("https://schirmer-s-notary-backend.onrender.com/jobs/", {
          method: "GET",
          headers: { "X-User-Id": String(userId) },
          credentials: "include"
        });
        
        if (response.ok) {
          const data = await response.json();
          const jobsArray = data.jobs || data;
          const userBookings = Array.isArray(jobsArray) ? jobsArray.filter((booking: any) => booking.client_id === userId) : [];
          setBookings(userBookings);
        } else {
          throw new Error("Failed to fetch bookings");
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load bookings");
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    fetchBookings();
  }, [isLoggedIn, router, fetchBookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings().finally(() => setRefreshing(false));
  }, [fetchBookings]);

  const getStatusColor = (status: string) => {
    if (!status) return '#f59e0b';
    
    switch (status.toLowerCase().trim()) {
      case 'accepted':
        return '#10b981';
      case 'declined':
      case 'denied':
      case 'rejected':
        return '#ef4444';
      case 'completed':
        return '#325969';
      case 'pending':
      default:
        return '#f59e0b';
    }
  };

  const getStatusText = (status: string) => {
    if (!status) return 'Pending';
    
    switch (status.toLowerCase().trim()) {
      case 'accepted':
        return 'Accepted';
      case 'declined':
      case 'denied':
      case 'rejected':
        return 'Declined';
      case 'completed':
        return 'Completed';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const getStatusBgColor = (status: string) => {
    if (!status) return 'bg-yellow-50';
    
    switch (status.toLowerCase().trim()) {
      case 'accepted':
        return 'bg-green-50';
      case 'declined':
      case 'denied':
      case 'rejected':
        return 'bg-red-50';
      case 'completed':
        return 'bg-blue-50';
      case 'pending':
      default:
        return 'bg-yellow-50';
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                My Booking Requests
              </h1>
              <p className="text-gray-600 text-lg">
                Track the status of your notary service requests
              </p>
            </div>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="bg-[#676767] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#575757] disabled:opacity-50 transition-colors"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="text-gray-600">Loading your booking requests...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200">
            <h3 className="font-semibold mb-2">Error Loading Bookings</h3>
            <p>{error}</p>
            <button
              onClick={onRefresh}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-md text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">No Booking Requests</h2>
            <p className="text-gray-600 mb-6">You haven't made any booking requests yet.</p>
            <Link 
              href="/client/book" 
              className="inline-block bg-[#676767] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#575757] transition-colors"
            >
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: any) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              >
                <div className={`h-1 ${getStatusBgColor(booking.status)}`} style={{ backgroundColor: getStatusColor(booking.status) }}></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {booking.service || "Service Request"}
                      </h3>
                      <div className="flex items-center">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold uppercase text-white"
                          style={{ backgroundColor: getStatusColor(booking.status) }}
                        >
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Request #{booking.id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-gray-600">
                    {booking.date && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📅</span>
                        <span>
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    
                    {booking.time && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🕒</span>
                        <span>Time: {booking.time}</span>
                      </div>
                    )}
                    
                    {booking.location && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        <span>Location: {booking.location}</span>
                      </div>
                    )}
                    
                    {booking.urgency && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        <span 
                          className={`font-semibold ${
                            booking.urgency === 'High' || booking.urgency === 'rush' ? 'text-red-600' : 
                            booking.urgency === 'Medium' || booking.urgency === 'urgent' ? 'text-yellow-600' : 'text-green-600'
                          }`}
                        >
                          Priority: {booking.urgency}
                        </span>
                      </div>
                    )}

                    {booking.notes && (
                      <div className="flex items-start gap-2 mt-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-lg">📝</span>
                        <div>
                          <p className="font-medium text-gray-700">Notes:</p>
                          <p className="text-sm text-gray-600">{booking.notes}</p>
                        </div>
                      </div>
                    )}

                    {booking.created_at && (
                      <div className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-200">
                        Requested on {new Date(booking.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        {bookings.length > 0 && (
          <div className="mt-12 text-center">
            <Link 
              href="/client/book" 
              className="inline-block bg-[#676767] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#575757] transition-colors mr-4"
            >
              Book New Appointment
            </Link>
            <Link 
              href="/client/contact" 
              className="inline-block border border-[#676767] text-[#676767] px-6 py-3 rounded-lg font-semibold hover:bg-[#676767] hover:text-white transition-colors"
            >
              Contact Support
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}