"use client";

import { submitRequest } from "./utils";
import React, { useState, useEffect } from "react";
import { useAuth } from "../auth-context";

const RequestPage: React.FC = () => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [notes, setNotes] = useState("");
  const [time, setTime] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchSlotsAndBookings() {
      try {
        const res = await fetch(`https://schirmer-s-notary-backend.onrender.com/calendar/slots?date=${selectedDate}`);
        const data = await res.json();
        const now = new Date();
        const isToday = selectedDate === now.toISOString().split('T')[0];
        const allSlotsRaw = (data.slots || []);
          const jobsRes = await fetch(`https://schirmer-s-notary-backend.onrender.com/jobs/`);
          let booked: string[] = [];
          if (jobsRes.ok) {
            const jobsData = await jobsRes.json();
            booked = (jobsData.jobs || jobsData || [])
              .filter((b: { status: string }) => b.status === 'pending' || b.status === 'accepted')
              .map((b: { date: string; time: string }) => `${b.date}T${b.time}`);
          }
          setBookedSlots(booked);
        const padTime = (t: string) => {
          const [h, m] = t.split(":");
          return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
        };
        const normalizeDate = (d: string) => {
          if (d.includes("-")) return d;
          const [mm, dd, yyyy] = d.split("/");
          return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
        };
        const filteredSlots = allSlotsRaw
          .filter((slot: { date: string; time: string; available: boolean }) => {
            const slotDateNorm = normalizeDate(slot.date);
            const slotTimeNorm = padTime(slot.time);
            const isBooked = booked.some(bk => {
              const [bDate, bTime] = bk.split("T");
              const bDateNorm = normalizeDate(bDate);
              const bTimeNorm = padTime(bTime);
              return bDateNorm === slotDateNorm && bTimeNorm === slotTimeNorm;
            });
            if (isBooked) return false;
            if (!slot.available) return false;
            if (isToday) {
              const slotDateObj = new Date(`${slotDateNorm}T${slotTimeNorm}`);
              return slotDateObj > now;
            }
            return true;
          })
          .map((slot: { date: string; time: string }) => `${normalizeDate(slot.date)}T${padTime(slot.time)}`);
        setAvailableSlots(filteredSlots);
      } catch {
        setAvailableSlots([]);
        setBookedSlots([]);
      }
    }
    fetchSlotsAndBookings();
  }, [selectedDate, success]);
  const { isLoggedIn, userId } = useAuth();
  type RequestHistoryItem = {
    id: number;
    service: string;
    status?: string;
    created_at?: string;
    urgency?: string;
    notes?: string;
  };
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!selectedSlot) {
        setError("Please select an appointment time.");
        setLoading(false);
        return;
      }
      const [date, time] = selectedSlot.split("T");
      const payload = {
        name,
        email,
        client_id: userId || "",
        service,
        urgency,
        date,
        time,
        location: '',
        notes,
        journal_id: undefined,
      };
      console.log("[handleSubmit] Booking payload:", payload);
      let response;
      try {
        response = await submitRequest(payload);
      } catch (err) {
        if (err instanceof Error) {
          setError("Booking could not be submitted.\n" + err.message);
          console.error("[handleSubmit] Error submitting booking:", err.message);
        } else {
          setError("Booking could not be submitted. Unknown error.");
          console.error("[handleSubmit] Unknown error submitting booking:", err);
        }
        setLoading(false);
        return;
      }
      if (response && response.message) {
        setSuccess("Booking submitted! You will receive a confirmation soon.");
        console.log("[handleSubmit] Booking success:", response);
      } else {
        setError("Booking could not be submitted. No success message returned.");
        console.error("[handleSubmit] No success message returned:", response);
      }
      setName(""); setEmail(""); setPhone(""); setService(""); setNotes(""); setSelectedSlot(null);
      if (isLoggedIn) fetchHistory();
    } finally {
      setLoading(false);
    }
  };
1
  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const res = await fetch("https://schirmer-s-notary-backend.onrender.com/client/requests", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setHistory(data.requests || []);
    } catch (err) {
      setHistoryError("Failed to load history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  // success is now declared before useEffect
  useEffect(() => {
    if (isLoggedIn) fetchHistory();
  }, [isLoggedIn]);

  return (
    <div className="text-black max-w-6xl mx-auto py-10 md:py-16 px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
      <div>
        <h3 className="text-lg md:text-xl font-bold mb-4">Available Appointment Times</h3>
        <div className="mb-4">
          <label className="font-medium mr-2 text-gray-800">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split('T')[0]}
            max={(() => {
              const d = new Date();
              d.setFullYear(d.getFullYear() + 1);
              return d.toISOString().split('T')[0];
            })()}
            onChange={e => setSelectedDate(e.target.value)}
            className="p-2 border rounded bg-white text-gray-900 w-full md:w-auto"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
          />
        </div>
        <div className="mb-6">
          <h4 className="font-bold mb-2 text-gray-900">
            {(() => {
              const [year, month, day] = selectedDate.split('-').map(Number);
              const displayDate = new Date(year, month - 1, day);
              return displayDate.toLocaleDateString();
            })()}
          </h4>
          <div>
            {availableSlots.length === 0 ? (
              <div className="text-gray-600">No available slots for this date.</div>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
                style={{ maxHeight: '320px', overflowY: 'auto', minHeight: '120px' }}
              >              
                {availableSlots.map(slot => {
                  const [datePart, timePart] = slot.split('T');
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      className={`bg-white border ${isSelected ? 'border-green-700 bg-green-100' : 'border-green-300'} text-green-700 px-4 py-3 rounded-lg shadow-sm w-full text-base font-semibold hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400`}
                      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {timePart}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Request a Service</h2>
        <form className="bg-white p-4 md:p-8 rounded-xl shadow-md space-y-4 md:space-y-6" onSubmit={handleSubmit}>
          <input type="text" placeholder="Full Name" className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base" required value={name} onChange={e => setName(e.target.value)} />
          <input type="email" placeholder="Email Address" className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base" required value={email} onChange={e => setEmail(e.target.value)} />
          <input type="tel" placeholder="Phone Number (optional)" className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base" value={phone} onChange={e => setPhone(e.target.value)} />
          <select className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base" required value={service} onChange={e => setService(e.target.value)}>
            <option value="">Select Service Type</option>
            <option value="Mobile Notary">Mobile Notary</option>
            <option value="Online Notary">Online Notary</option>
            <option value="Business Notary">Business Notary</option>
          </select>
          <select className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base" required value={urgency} onChange={e => setUrgency(e.target.value)}>
            <option value="normal">Normal (Standard Service)</option>
            <option value="urgent">Urgent (5-24 hours, extra charge)</option>
            <option value="rush">Rush (0-5 hours, highest priority, extra charge)</option>
          </select>
          <textarea placeholder="Notes / Additional Information" className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base" rows={4} value={notes} onChange={e => setNotes(e.target.value)}></textarea>
          <button type="submit" className="bg-green-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-green-800 w-full text-sm md:text-base" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-800 rounded-lg px-4 py-2 mt-2 text-center font-semibold">
              {success}
            </div>
          )}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>

        {isLoggedIn && (
          <div className="mt-6 md:mt-10">
            <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Your Request History</h3>
            {historyLoading ? (
              <div>Loading...</div>
            ) : historyError ? (
              <div className="text-red-600">{historyError}</div>
            ) : history.length === 0 ? (
              <div className="text-gray-600">No previous requests found.</div>
            ) : (
              <ul className="space-y-2 md:space-y-4">
                {history.map((req, idx) => (
                  <li key={req.id || idx} className="bg-white p-2 md:p-4 rounded-lg shadow">
                    <div className="font-semibold text-sm md:text-base">{req.service} ({req.status})</div>
                    <div className="text-xs md:text-sm text-gray-700">Requested: {req.created_at}</div>
                    <div className="text-xs md:text-sm">Urgency: {req.urgency}</div>
                    <div className="text-xs md:text-sm">Notes: {req.notes}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="bg-gray-100 p-4 md:p-6 rounded-xl shadow-md mt-6 md:mt-0">
        <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Instructions</h3>
        <ul className="list-disc list-inside space-y-1 md:space-y-2 text-sm md:text-base">
            <li>Please include location of the appointment.</li>
            <li>Please bring completed documents that require notarization.</li>
            <li>Accepted forms of ID: Driver&apos;s License, Passport, or Government-issued ID.</li>
            <li>Ensure all signers are present during the appointment.</li>
            <li>For online notarizations, ensure you have a stable internet connection.</li>
            <li>Please be prepared for contact on further instructions.</li>
        </ul>
      </div>         
    </div>
  );
};

export default RequestPage;