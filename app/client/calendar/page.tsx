"use client";

import { useAuth } from "../../auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Appointment {
  id: number;
  name: string;
  start_date: string;
  location: string;
  status: string;
  notes?: string;
}

export default function ClientCalendar() {
  const { isLoggedIn, userId } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    fetchAppointments();
  }, [isLoggedIn, router]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      if (userId) {
        const response = await fetch("https://schirmer-s-notary-backend.onrender.com/calendar/local", {
          method: "GET",
          headers: { "X-User-Id": String(userId) },
          credentials: "include"
        });
        
        if (response.ok) {
          const data = await response.json();
          setAppointments(Array.isArray(data) ? data : []);
        } else {
          throw new Error("Failed to fetch appointments");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid Time';
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#676767] mb-8 text-center">Your Appointments</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading your appointments...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-lg text-center">
            {error}
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-md text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">No Appointments Scheduled</h2>
            <p className="text-gray-600 mb-6">You don&apos;t have any appointments scheduled yet.</p>
            <a 
              href="/client/book" 
              className="inline-block bg-[#676767] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#575757] transition-colors"
            >
              Book Your First Appointment
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments
              .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
              .map((appointment) => (
                <div key={appointment.id} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex flex-col md:flex-row md:items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {appointment.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📅</span>
                          <span>{formatDate(appointment.start_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🕒</span>
                          <span>{formatTime(appointment.start_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📍</span>
                          <span>{appointment.location || 'Location TBD'}</span>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Notes:</strong> {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          ID: {appointment.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <a 
            href="/client/book" 
            className="inline-block bg-[#676767] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#575757] transition-colors mr-4"
          >
            Book New Appointment
          </a>
          <a 
            href="/client/contact" 
            className="inline-block border border-[#676767] text-[#676767] px-6 py-3 rounded-lg font-semibold hover:bg-[#676767] hover:text-white transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}