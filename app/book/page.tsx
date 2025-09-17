"use client";

import { submitRequest } from "./utils";
import React, { useState, useEffect } from "react";
import { useAuth } from "../auth-context";

const RequestPage: React.FC = () => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    async function fetchSlots() {
      try {
  const res = await fetch(`https://schirmer-s-notary-backend.onrender.com/calendar/slots?date=${selectedDate}`);
        const data = await res.json();
        setAvailableSlots(
          (data.slots || [])
            .filter((slot: { id: string | number; date: string; time: string; available: boolean }) => slot.available)
            .map((slot: { date: string; time: string }) => `${slot.date}T${slot.time}`)
        );
      } catch {
        setAvailableSlots([]);
      }
    }
    fetchSlots();
  }, [selectedDate]);

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
  const res = await fetch("https://schirmer-s-notary-backend.onrender.com/client/requests", { credentials: "include" });
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
        
        {/*
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
              return displayDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            })()}
          </h4>
          {availableSlots.length === 0 ? (
            <div className="text-gray-500">No available slots for this day.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availableSlots.map(slot => {
                const [datePart, timePart] = slot.split('T');
                return (
                  <button
                    key={slot}
                    className="bg-white border border-green-300 text-green-700 px-4 py-3 rounded-lg shadow-sm w-full text-base font-semibold hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400"
                    style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
                    onClick={() => setNotes(`Requested time: ${timePart}`)}
                  >
                    {timePart}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        */}

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