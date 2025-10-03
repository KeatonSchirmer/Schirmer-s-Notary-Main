"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth-context";
import { useRouter } from "next/navigation";

export default function HistoryScreen() {
  const router = useRouter();
  const { isLoggedIn, userId } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<Array<{
    id: number;
    service?: string;
    status?: string;
    date?: string;
    time?: string;
    location?: string;
    notes?: string;
    client_rating?: number;
    client_feedback?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<{
    id: number;
    service?: string;
    status?: string;
    date?: string;
    time?: string;
    location?: string;
    notes?: string;
    client_rating?: number;
    client_feedback?: string;
  } | null>(null);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

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
          // Filter bookings to only show completed ones for this client
          const userBookings = Array.isArray(data) ? data.filter((booking: {client_id: number; status: string}) => 
            booking.client_id === userId && booking.status?.toLowerCase() === 'completed'
          ) : [];
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

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'Completed ✓';
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const openFeedbackModal = (booking: {
    id: number;
    service?: string;
    status?: string;
    client_rating?: number;
    client_feedback?: string;
  }) => {
    setSelectedBooking(booking);
    setRating(booking.client_rating || 0);
    setFeedback(booking.client_feedback || "");
    setFeedbackModal(true);
  };

  const submitFeedback = async () => {
    if (!selectedBooking || rating === 0) {
      alert("Please provide a rating before submitting.");
      return;
    }

    try {
      const response = await fetch(`https://schirmer-s-notary-backend.onrender.com/jobs/${selectedBooking.id}/feedback`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Id": String(userId) 
        },
        credentials: "include",
        body: JSON.stringify({
          rating: rating,
          feedback: feedback.trim()
        })
      });

      if (response.ok) {
        alert("Thank you for your feedback!");
        setFeedbackModal(false);
        fetchBookings(); // Refresh to show updated feedback
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (err) {
      alert("Failed to submit feedback. Please try again.");
    }
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && setRating(star)}
            disabled={!interactive}
            className={`mr-1 ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <svg
              className={`w-5 h-5 ${star <= currentRating ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
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
                Past Services
              </h1>
              <p className="text-gray-600 text-lg">
                Details of your previous service appointments.
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
            <div className="text-gray-600">Loading your service history...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200">
            <h3 className="font-semibold mb-2">Error Loading History</h3>
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
            <div className="text-6xl mb-4">📜</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">No Completed Services</h2>
            <p className="text-gray-600 mb-6">You don&apos;t have any completed services yet.</p>
            <a 
              href="/client/book" 
              className="inline-block bg-[#676767] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#575757] transition-colors"
            >
              Book Your First Service
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: {
              id: number;
              service?: string;
              status?: string;
              date?: string;
              time?: string;
              location?: string;
              notes?: string;
              client_rating?: number;
              client_feedback?: string;
            }) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="h-1 bg-green-500"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {booking.service || "Service Request"}
                      </h3>
                      <span className="text-green-600 font-semibold text-sm">
                        {getStatusText(booking.status || '')}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Service #{booking.id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-gray-600 mb-4">
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
                        <span>{booking.time}</span>
                      </div>
                    )}
                    
                    {booking.location && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        <span>{booking.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Show admin notes if available */}
                  {booking.notes && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span>📝</span>
                        Service Notes:
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {booking.notes}
                      </p>
                    </div>
                  )}

                  {/* Show existing rating/feedback if available */}
                  {booking.client_rating && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">
                        Your Rating:
                      </h4>
                      {renderStars(booking.client_rating)}
                      {booking.client_feedback && (
                        <p className="text-gray-700 text-sm mt-2 italic">
                          &quot;{booking.client_feedback}&quot;
                        </p>
                      )}
                    </div>
                  )}

                  {/* Feedback button */}
                  <button
                    onClick={() => openFeedbackModal(booking)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                  >
                    {booking.client_rating ? 'Update Review' : 'Leave Review'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback Modal */}
        {feedbackModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Rate Your Experience
              </h2>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {selectedBooking?.service}
              </h3>

              <p className="text-gray-600 mb-4">
                How was your notary service experience?
              </p>

              <div className="flex justify-center mb-4">
                {renderStars(rating, true)}
              </div>

              <textarea
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-500 resize-none"
                placeholder="Share your experience (optional)"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setFeedbackModal(false)}
                  className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedback}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}