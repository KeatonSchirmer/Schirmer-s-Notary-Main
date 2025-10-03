"use client";

import { useAuth } from "../auth-context";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Appointment {
  id: number;
  name: string;
  start_date: string;
  location: string;
  status: string;
}

interface Request {
  id: number;
  service: string;
  date: string;
  time: string;
  status: string;
  urgency: string;
  notes: string;
  created_at: string;
}

export default function ClientDashboard() {
  const { isLoggedIn, isPremium, userId, logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    fetchDashboardData();
  }, [isLoggedIn, router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      if (userId) {
        const appointmentsResponse = await fetch("https://schirmer-s-notary-backend.onrender.com/calendar/local", {
          method: "GET",
          headers: { "X-User-Id": String(userId) },
          credentials: "include"
        });
        const requestsResponse = await fetch("https://schirmer-s-notary-backend.onrender.com/jobs/pending", {
          method: "GET",
          headers: { "X-User-Id": String(userId) },
          credentials: "include"
        });
        
        // Try to get user name from session
        try {
          const sessionResponse = await fetch("https://schirmer-s-notary-backend.onrender.com/session", {
            credentials: "include"
          });
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            setUserName(sessionData.username || '');
          }
        } catch (err) {
          // Continue without username
        }
        
        const appointmentsData = appointmentsResponse.ok ? await appointmentsResponse.json() : [];
        const requestsData = requestsResponse.ok ? await requestsResponse.json() : [];
        
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
        setRequests(Array.isArray(requestsData) ? requestsData : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-0">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {userName || 'Client'}
          </h1>
          <p className="text-gray-600 mb-6">
            {new Date().toDateString()}
          </p>
        </div>

        {/* Upcoming Services Card */}
        <Link href="/client/calendar" className="block mb-6">
          <div className="bg-white p-8 md:p-12 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg md:text-xl font-semibold text-[#676767] mb-4">
              Upcoming Services:
            </h3>
            
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : (() => {
              const today = new Date();
              const twoWeeksFromNow = new Date();
              twoWeeksFromNow.setDate(today.getDate() + 14);
              
              const upcomingAppointments = appointments.filter(appt => {
                try {
                  if (!appt.start_date) return false;
                  
                  const apptDate = new Date(appt.start_date);
                  if (isNaN(apptDate.getTime())) return false;
                  
                  return apptDate >= today && apptDate <= twoWeeksFromNow;
                } catch (error) {
                  console.warn('Invalid appointment date:', appt.start_date, error);
                  return false;
                }
              }).sort((a, b) => {
                return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
              });
              
              return upcomingAppointments.length === 0 ? (
                <p className="text-gray-600">No upcoming bookings.</p>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appt) => {
                    const apptDate = new Date(appt.start_date);
                    const formattedDate = apptDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    });
                    const formattedTime = apptDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                    
                    return (
                      <div key={appt.id} className="pb-4 border-b border-gray-200 last:border-b-0">
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {appt.name}
                        </h4>
                        <p className="text-gray-600 text-sm mb-1">
                          {formattedDate} at {formattedTime}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {appt.location}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </Link>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link 
            href="/client/book" 
            className="bg-[#676767] text-white p-6 rounded-xl shadow-md hover:bg-[#575757] transition-colors text-center"
          >
            <h3 className="text-lg font-semibold mb-2">Book New Service</h3>
            <p className="text-gray-200 text-sm">Schedule your next notarization</p>
          </Link>
          
          <Link 
            href="/client/services" 
            className="bg-white border border-gray-200 text-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <h3 className="text-lg font-semibold mb-2 text-[#676767]">View Services</h3>
            <p className="text-gray-600 text-sm">See pricing and options</p>
          </Link>
        </div>

        {/* Recent Requests Summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-[#676767] mb-4">Recent Activity</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">{requests.length}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {requests.filter(r => r.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}