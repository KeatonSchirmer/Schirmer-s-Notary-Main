type Value = Date | [Date | null, Date | null] | null;
"use client";

import { submitRequest } from "./utils";
import React, { useState, useEffect } from "react";
import { useAuth } from "../auth-context";

const RequestPage: React.FC = () => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  // Helper: generate 30-min slots for today
  function generateSlots(date: Date) {
    const slots: string[] = [];
    const startHour = 9;
    const endHour = 17;
    for (let hour = startHour; hour < endHour; hour++) {
      for (let min of [0, 30]) {
        const slot = new Date(date);
        slot.setHours(hour, min, 0, 0);
        slots.push(slot.toISOString());
      }
    }
    return slots;
  }
  function isSlotAvailable(slot: string, busy: { start: string; end: string }[]) {
    const slotStart = new Date(slot);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60000);
    return !busy.some(b => {
      const busyStart = new Date(b.start);
      const busyEnd = new Date(b.end);
      return slotStart < busyEnd && slotEnd > busyStart;
    });
  }
  useEffect(() => {
    async function fetchBusySlots(date: Date) {
      const dateStr = date.toISOString().split('T')[0];
      const localRes = await fetch(`http://schirmer-s-notary-backend.onrender.com/calendar/local`);
      const localData = await localRes.json();
      const googleRes = await fetch(`http://schirmer-s-notary-backend.onrender.com/calendar/`);
      const googleData = await googleRes.json();
      const busy: { start: string; end: string }[] = [];
      for (const e of localData.events || []) {
        if (e.start_date && e.end_date && e.start_date.startsWith(dateStr)) {
          busy.push({ start: e.start_date, end: e.end_date });
        }
      }
      for (const e of googleData.events || []) {
        if (e.start && e.end && e.start.dateTime && e.end.dateTime && e.start.dateTime.startsWith(dateStr)) {
          busy.push({ start: e.start.dateTime, end: e.end.dateTime });
        }
      }
      const slots = generateSlots(date);
      setAvailableSlots(slots.filter(slot => isSlotAvailable(slot, busy)));
    }
    const today = new Date();
    fetchBusySlots(today);
  }, []);

  const [selectedDate, setSelectedDate] = useState<Value>(null);
  const getSelectedDateString = () => {
    if (!selectedDate) return "";
    if (Array.isArray(selectedDate)) {
      return selectedDate[0] ? selectedDate[0].toLocaleDateString() : "";
    }
    return selectedDate.toLocaleDateString();
  };
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [notes, setNotes] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { isLoggedIn } = useAuth();
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
      await submitRequest({
        name,
        email,
        document_type: "Notary Document",
        service,
        signer: name,
        location: notes,
        wording: notes,
        urgency,
        date: "",
        id_verification: "no",
        witness: "no"
      });
      setSuccess("Request submitted successfully!");
      setName(""); setEmail(""); setPhone(""); setService(""); setNotes("");
      if (isLoggedIn) fetchHistory();
    } catch (err: unknown) {
      console.error("Error submitting request:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit request.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const res = await fetch("http://schirmer-s-notary-backend.onrender.com/client/requests", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setHistory(data.requests || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setHistoryError(err.message);
      } else {
        setHistoryError("Failed to load history.");
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchHistory();
  }, [isLoggedIn]);

  return (
    <div className="text-black max-w-6xl mx-auto py-10 md:py-16 px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
      <div>
        <h3 className="text-lg md:text-xl font-bold mb-4">Available Appointment Times (Today)</h3>
        <div className="mb-6">
          <h4 className="font-bold mb-2">Choose a Time</h4>
          {availableSlots.length === 0 ? (
            <div className="text-gray-500">No available slots for today.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableSlots.map(slot => (
                <button key={slot} className="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded" onClick={() => setNotes(`Requested time: ${new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)}>
                  {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </button>
              ))}
            </div>
          )}
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
          {error && <div className="text-red-600 mt-2">{error}</div>}
          {success && <div className="text-green-600 mt-2">{success}</div>}
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
            <li>Please include date and time of the appointment.</li>
            <li>Please bring completed documents that require notarization.</li>
            <li>Accepted forms of ID: Driver&apos;s License, Passport, or Government-issued ID.</li>
            <li>Ensure all signers are present during the appointment.</li>
            <li>For online notarizations, ensure you have a stable internet connection.</li>
        </ul>
      </div>         
    </div>
  );
};

export default RequestPage;