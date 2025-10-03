"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../auth-context';
import Link from 'next/link';

interface BookingDetail {
  id: number;
  client_id: number;
  service: string;
  status: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  urgency?: string;
  feedback?: string;
  rating?: number;
  created_at?: string;
}

export default function ClientBookingDetailScreen() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const id = params?.id as string;
  
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    fetchBookingDetail();
  }, [id, isLoggedIn, router]);

  const fetchBookingDetail = async () => {
    if (!id) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://schirmer-s-notary-backend.onrender.com/jobs/${id}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const bookingData = data.job || data;
        
        if (bookingData) {
          setBooking(bookingData);
        } else {
          setError('Booking not found');
        }
      } else {
        throw new Error('Failed to fetch booking details');
      }
    } catch (err) {
      console.error('Error fetching booking detail:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return '#10b981';
      case 'declined':
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
    
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'Accepted';
      case 'declined':
      case 'rejected':
        return 'Declined';
      case 'completed':
        return 'Completed';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const getPriorityColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'rush':
        return '#ef4444'; 
      case 'urgent':
        return '#f59e0b';
      case 'normal':
      default:
        return '#10b981';
    }
  };

  if (!isLoggedIn) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#676767] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {error || 'Booking not found'}
          </h2>
          <Link 
            href="/client/bookings"
            className="inline-block bg-[#676767] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#575757] transition-colors"
          >
            Go Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <Link 
            href="/client/bookings" 
            className="mr-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-800 flex-1 text-center mr-10">
            Booking Details
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Status Section */}
        <div 
          className="bg-white rounded-xl shadow-md p-6 border-l-4"
          style={{ borderLeftColor: getStatusColor(booking.status) }}
        >
          <div className="flex justify-between items-center mb-4">
            <span
              className="px-4 py-2 rounded-full text-white font-bold text-sm uppercase"
              style={{ backgroundColor: getStatusColor(booking.status) }}
            >
              {getStatusText(booking.status)}
            </span>
            <div className="text-right">
              <p className="text-sm text-gray-500">Request #{booking.id}</p>
            </div>
          </div>
          
          {booking.created_at && (
            <p className="text-gray-600 text-sm">
              Created: {new Date(booking.created_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* Service Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Service Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Service Type</p>
              <p className="text-gray-800 text-lg font-semibold">
                {booking.service || 'Not specified'}
              </p>
            </div>

            {booking.urgency && (
              <div>
                <p className="text-gray-600 text-sm mb-2">Priority Level</p>
                <span
                  className="inline-block px-3 py-1 rounded-full text-white font-bold text-xs uppercase"
                  style={{ backgroundColor: getPriorityColor(booking.urgency) }}
                >
                  {booking.urgency}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Appointment Details
          </h2>

          <div className="space-y-4">
            {booking.date && (
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-[#676767] rounded-full mr-4">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Date</p>
                  <p className="text-gray-800 font-semibold">
                    {new Date(booking.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            {booking.time && (
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-[#676767] rounded-full mr-4">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Time</p>
                  <p className="text-gray-800 font-semibold">
                    {booking.time}
                  </p>
                </div>
              </div>
            )}

            {booking.location && (
              <div className="flex items-start">
                <div className="flex items-center justify-center w-8 h-8 bg-[#676767] rounded-full mr-4 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-600 text-sm">Location</p>
                  <p className="text-gray-800 font-semibold">
                    {booking.location}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        {booking.notes && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Additional Notes
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed">
                {booking.notes}
              </p>
            </div>
          </div>
        )}

        {/* Feedback Section (for completed bookings) */}
        {booking.status?.toLowerCase() === 'completed' && (booking.feedback || booking.rating) && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Service Feedback
            </h2>
            
            <div className="space-y-4">
              {booking.rating && (
                <div>
                  <p className="text-gray-600 text-sm mb-2">Rating</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${star <= booking.rating! ? 'text-yellow-400' : 'text-gray-300'} mr-1`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              )}
              
              {booking.feedback && (
                <div>
                  <p className="text-gray-600 text-sm mb-2">Comments</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 leading-relaxed">
                      {booking.feedback}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/client/bookings"
            className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-center"
          >
            Back to Bookings
          </Link>
          
          {booking.status?.toLowerCase() === 'pending' && (
            <Link 
              href="/client/contact"
              className="flex-1 bg-[#676767] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#575757] transition-colors text-center"
            >
              Contact Support
            </Link>
          )}
          
          {booking.status?.toLowerCase() === 'completed' && !booking.feedback && (
            <button 
              onClick={() => {
                // In a real implementation, you'd navigate to a feedback form
                alert('Feedback feature coming soon!');
              }}
              className="flex-1 bg-[#676767] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#575757] transition-colors"
            >
              Leave Feedback
            </button>
          )}
        </div>
      </div>
    </div>
  );
}