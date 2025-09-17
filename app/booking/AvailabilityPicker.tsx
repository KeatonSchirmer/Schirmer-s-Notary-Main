"use client";
import React, { useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AvailabilityPicker({
  initialOfficeStart = "09:00",
  initialOfficeEnd = "17:00",
  initialAvailableDays = ["Mon", "Tue", "Wed", "Thu", "Fri"],
  onSave,
}: {
  initialOfficeStart?: string;
  initialOfficeEnd?: string;
  initialAvailableDays?: string[];
  onSave?: (data: { officeStart: string; officeEnd: string; availableDays: string[] }) => void;
}) {
  const [officeStart, setOfficeStart] = useState(initialOfficeStart);
  const [officeEnd, setOfficeEnd] = useState(initialOfficeEnd);
  const [availableDays, setAvailableDays] = useState<string[]>(initialAvailableDays);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleDayToggle = (day: string) => {
    setAvailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("https://schirmer-s-notary-backend.onrender.com/calendar/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          officeStart,
          officeEnd,
          availableDays,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess("Availability saved.");
      if (onSave) onSave({ officeStart, officeEnd, availableDays });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save availability.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Set Your Availability</h2>
      <div className="mb-4">
        <label className="block font-medium mb-1">Office Start Time:</label>
        <input
          type="time"
          value={officeStart}
          onChange={e => setOfficeStart(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Office End Time:</label>
        <input
          type="time"
          value={officeEnd}
          onChange={e => setOfficeEnd(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Available Days:</label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map(day => (
            <button
              key={day}
              type="button"
              className={`px-3 py-1 rounded border ${availableDays.includes(day) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
              onClick={() => handleDayToggle(day)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      <button
        className="bg-green-700 text-white px-4 py-2 rounded font-semibold w-full"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Availability"}
      </button>
      {success && <div className="text-green-600 mt-2">{success}</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}
