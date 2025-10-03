"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../auth-context";
import { useRouter } from "next/navigation";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface BookingForm {
  name: string;
  email: string;
  phone: string;
  service: string;
  urgency: string;
  notes: string;
  location: string;
}

export default function ClientBook() {
  const { isLoggedIn, userId } = useAuth();
  const router = useRouter();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [events, setEvents] = useState<Array<{
    date: string;
    title?: string;
    name?: string;
    start_date?: string;
    time?: string;
    location?: string;
    notes?: string;
  }>>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    configured?: boolean;
    office_start?: string;
    office_end?: string;
  } | null>(null);
  const [message, setMessage] = useState("");
  
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    name: "",
    email: "",
    phone: "",
    service: "",
    urgency: "normal",
    notes: "",
    location: ""
  });

  // Handle authentication redirect
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    fetchEventsForMonth(currentDate.getFullYear(), currentDate.getMonth());
    checkAvailabilityStatus();
  }, [currentDate]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
      fetchAvailableSlots(dateStr);
    }
  }, [selectedDate, currentDate]);

  function generateCalendar(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = Array(firstDay).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }
    return weeks;
  }

  if (!isLoggedIn) {
    return null;
  }

  const weeks = generateCalendar(currentDate);

  async function checkAvailabilityStatus() {
    try {
      const response = await fetch("https://schirmer-s-notary-backend.onrender.com/calendar/availability/status");
      if (response.ok) {
        const statusRes = await response.json();
        setAvailabilityStatus(statusRes);
        return statusRes;
      }
    } catch (error) {
      console.error('Error checking availability status:', error);
      return null;
    }
  }

  async function fetchEventsForMonth(year: number, month: number) {
    try {
      const response = await fetch("https://schirmer-s-notary-backend.onrender.com/calendar/local", {
        credentials: "include"
      });
      if (response.ok) {
        const res = await response.json();
        setEvents(Array.isArray(res) ? res : []);
      } else {
        setEvents([]);
      }
    } catch {
      setEvents([]);
    }
  }

  async function fetchAvailableSlots(date: string) {
    try {
      let allSlots = [];
      
      // Check availability status first
      try {
        const statusResponse = await fetch("https://schirmer-s-notary-backend.onrender.com/calendar/availability/status");
        if (statusResponse.ok) {
          const statusRes = await statusResponse.json();
          
          if (statusRes && !statusRes.configured) {
            try {
              await fetch("https://schirmer-s-notary-backend.onrender.com/calendar/availability/quick-setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  office_start: "09:00",
                  office_end: "17:00",
                  available_days: "0,1,2,3,4,5"
                })
              });
            } catch (setupError) {
              console.warn('Setup error:', setupError);
            }
          }
        }
      } catch (statusError) {
        console.warn('Status check error:', statusError);
      }
      
      // Fetch available slots
      try {
        const response = await fetch(`https://schirmer-s-notary-backend.onrender.com/calendar/slots?date=${date}`);
        if (response.ok) {
          const res = await response.json();
          
          if (res && res.slots && Array.isArray(res.slots)) {
            allSlots = res.slots;
          } else if (Array.isArray(res)) {
            allSlots = res;
          } else if (res && res.error) {
            if (res.error.includes('No availability configured')) {
              setMessage('Business hours need to be configured. Please contact the administrator.');
            }
            allSlots = [];
          } else {
            allSlots = [];
          }
        }
      } catch (slotsError) {
        console.error('Slots endpoint error:', slotsError);
        allSlots = [];
      }
      
      // Fetch booked slots
      let booked: string[] = [];
      try {
        const response = await fetch("https://schirmer-s-notary-backend.onrender.com/jobs/", {
          credentials: "include"
        });
        if (response.ok) {
          const jobsRes = await response.json();
          booked = (jobsRes.jobs || jobsRes || [])
            .filter((job: {status: string}) => job.status === 'pending' || job.status === 'accepted')
            .map((job: {date: string; time: string; status: string}) => {
              const jobDate = job.date;
              const jobTime = job.time;
              if (jobDate && jobTime) {
                const normalizedDate = typeof jobDate === 'string' ? jobDate.split('T')[0] : jobDate;
                const normalizedTime = typeof jobTime === 'string' ? jobTime.split('T')[1] || jobTime : jobTime;
                return `${normalizedDate}T${normalizedTime}`;
              }
              return null;
            })
            .filter(Boolean);
        }
      } catch (jobsError) {
        console.warn('Jobs endpoint error:', jobsError);
        booked = [];
      }
      
      // booked slots are handled in filtering below
      
      const now = new Date();
      const isToday = date === now.toISOString().split('T')[0];
      
      const filtered = allSlots
        .filter((slot: {available?: boolean; date?: string; time: string; datetime?: string}) => {
          if (slot.available === false) return false;
          
          const slotDate = slot.date || date;
          const slotTime = slot.time;
          const slotDateTime = `${slotDate}T${slotTime}`;
          
          const isBooked = booked.some(bookedSlot => {
            const [bookedDate, bookedTime] = bookedSlot.split('T');
            const [currentDate, currentTime] = slotDateTime.split('T');
            return bookedDate === currentDate && bookedTime === currentTime;
          });
          
          if (isBooked) return false;
          
          if (isToday) {
            const slotDateTime = new Date(`${slotDate}T${slotTime}`);
            return slotDateTime > now;
          }
          
          return true;
        })
        .map((slot: {date?: string; time?: string; datetime?: string}) => `${slot.date || date}T${slot.time || slot.datetime?.split('T')[1]}`);
      
      setAvailableSlots(filtered);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    }
  }

  async function submitBooking() {
    if (!selectedSlot || !userId) {
      setMessage("Please select a time slot");
      return;
    }

    if (!bookingForm.name || !bookingForm.email || !bookingForm.service) {
      setMessage("Please fill in all required fields");
      return;
    }

    setBookingLoading(true);
    setMessage("");

    try {
      const [date, time] = selectedSlot.split("T");
      const payload = {
        name: bookingForm.name,
        email: bookingForm.email,
        client_id: userId.toString(),
        service: bookingForm.service,
        urgency: bookingForm.urgency,
        date,
        time,
        location: bookingForm.location,
        notes: bookingForm.notes,
        journal_id: undefined,
      };

      let response;
      try {
        const res = await fetch("https://schirmer-s-notary-backend.onrender.com/jobs/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          response = await res.json();
        } else {
          throw new Error("First endpoint failed");
        }
      } catch (firstError) {
        try {
          const res = await fetch("https://schirmer-s-notary-backend.onrender.com/jobs/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            response = await res.json();
          } else {
            throw new Error("Second endpoint failed");
          }
        } catch (secondError) {
          try {
            const res = await fetch("https://schirmer-s-notary-backend.onrender.com/jobs/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              response = await res.json();
            } else {
              throw new Error("Third endpoint failed");
            }
          } catch (thirdError) {
            const simplePayload = {
              client_name: payload.name,
              client_email: payload.email,
              service_type: payload.service,
              appointment_date: payload.date,
              appointment_time: payload.time,
              location: payload.location,
              notes: payload.notes,
              urgency: payload.urgency
            };
            const res = await fetch("https://schirmer-s-notary-backend.onrender.com/bookings/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(simplePayload)
            });
            if (res.ok) {
              response = await res.json();
            } else {
              throw new Error("All booking endpoints failed");
            }
          }
        }
      }

      if (response) {
        setMessage("Booking submitted! You will receive a confirmation soon.");
        setShowBookingModal(false);
        setSelectedSlot(null);
        setBookingForm({
          name: "",
          email: "",
          phone: "",
          service: "",
          urgency: "normal",
          notes: "",
          location: ""
        });
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
        fetchAvailableSlots(dateStr);
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      setMessage(`Failed to submit booking: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support.`);
    } finally {
      setBookingLoading(false);
    }
  }

  function getEventsForSelectedDate() {
    if (!selectedDate) return [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return events.filter((event: {date?: string; start_date?: string}) => {
      const rawDate = event.date || event.start_date;
      if (!rawDate) return false;

      const [datePart] = rawDate.split("T");
      const [eventYear, eventMonth, eventDay] = datePart.split("-").map(Number);

      return (
        eventYear === year &&
        eventMonth - 1 === month &&
        eventDay === selectedDate
      );
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#676767] mb-8 text-center">Book an Appointment</h1>
        
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') || message.includes('Booking submitted') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Calendar Navigation */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-md">
          <button
            onClick={() => {
              setCurrentDate((prev) => {
                const year = prev.getFullYear();
                const month = prev.getMonth();
                if (month === 0) {
                  return new Date(year - 1, 11, 1);
                }
                return new Date(year, month - 1, 1);
              });
            }}
            className="text-2xl text-blue-600 font-bold hover:text-blue-800"
          >
            ◀
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={() => {
              setCurrentDate((prev) => {
                const year = prev.getFullYear();
                const month = prev.getMonth();
                if (month === 11) {
                  return new Date(year + 1, 0, 1);
                }
                return new Date(year, month + 1, 1);
              });
            }}
            className="text-2xl text-blue-600 font-bold hover:text-blue-800"
          >
            ▶
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          {weeks.map((week: (number | null)[], i: number) => (
            <div key={i} className="grid grid-cols-7 gap-2 mb-2">
              {week.map((day: number | null, j: number) => (
                <button
                  key={j}
                  disabled={!day}
                  onClick={() => {
                    if (day) {
                      setSelectedDate(day);
                    }
                  }}
                  className={`
                    h-12 rounded-lg transition-colors
                    ${!day 
                      ? 'transparent' 
                      : selectedDate === day
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Available Appointment Slots */}
        {selectedDate && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-[#676767] mb-4">
              Available Appointments - {selectedDate} {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </h3>
            
            {availabilityStatus && availabilityStatus.configured && (
              <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4 text-center">
                <span className="font-bold">✓ Available Appointments</span>
              </div>
            )}

            {availableSlots.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {availableSlots.map((slot) => {
                    const [datePart, timePart] = slot.split('T');
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`
                          px-4 py-2 rounded-lg font-medium transition-all
                          ${isSelected
                            ? 'bg-[#676767] text-white shadow-lg'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
                          }
                        `}
                      >
                        {timePart}
                      </button>
                    );
                  })}
                </div>
                
                {selectedSlot && (
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-[#676767] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#575757] transition-colors"
                  >
                    Book Appointment at {selectedSlot.split('T')[1]}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No appointment slots are available for this day.</p>
                
                {availabilityStatus && !availabilityStatus.configured ? (
                  <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg mb-4">
                    <span className="font-bold">⚠️ Business hours not configured yet. Please contact the administrator.</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Availability is based on the notary&apos;s configured business hours and existing bookings.
                    </p>
                    {availabilityStatus && availabilityStatus.configured && (
                      <p className="text-xs text-gray-500 mb-4">
                        Business Hours: {availabilityStatus.office_start} - {availabilityStatus.office_end}
                      </p>
                    )}
                  </div>
                )}
                
                <button
                  onClick={() => {
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
                    fetchAvailableSlots(dateStr);
                    checkAvailabilityStatus();
                  }}
                  className="bg-[#676767] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#575757] transition-colors"
                >
                  Refresh Availability
                </button>
              </div>
            )}
          </div>
        )}

        {/* Events for selected date */}
        {selectedDate && getEventsForSelectedDate().length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-[#676767] mb-4">
              Your Events - {selectedDate} {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </h3>
            {getEventsForSelectedDate().map((event, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4 mb-3">
                <h4 className="font-semibold text-gray-800">
                  {event.title || event.name || "Event"}
                </h4>
                <p className="text-gray-600 text-sm">
                  {event.start_date || event.date} {event.time ? `@ ${event.time}` : ""}
                </p>
                {event.location && (
                  <p className="text-gray-600 text-sm">
                    Location: {event.location}
                  </p>
                )}
                {event.notes && (
                  <p className="text-[#676767] text-sm mt-2">
                    Notes: {event.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#676767]">Book Appointment</h2>
                  {selectedSlot && (
                    <p className="text-gray-600 mt-1">
                      {selectedSlot.split('T')[0]} at {selectedSlot.split('T')[1]}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
                  <div className="space-y-2">
                    {['Mobile Notary', 'Online Notary', 'Business Notary'].map((service) => (
                      <label key={service} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="service"
                          value={service}
                          checked={bookingForm.service === service}
                          onChange={(e) => setBookingForm({...bookingForm, service: e.target.value})}
                          className="mr-3 text-[#676767] focus:ring-[#676767]"
                        />
                        <span className="font-medium">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={bookingForm.location}
                    onChange={(e) => setBookingForm({...bookingForm, location: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                    placeholder="Enter appointment location"
                  />
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                  <div className="space-y-2">
                    {[
                      { label: 'Normal (Standard Service)', value: 'normal' },
                      { label: 'Urgent (5-24 hours, extra charge)', value: 'urgent' },
                      { label: 'Rush (0-5 hours, highest priority)', value: 'rush' }
                    ].map((urgencyOption) => (
                      <label key={urgencyOption.value} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="urgency"
                          value={urgencyOption.value}
                          checked={bookingForm.urgency === urgencyOption.value}
                          onChange={(e) => setBookingForm({...bookingForm, urgency: e.target.value})}
                          className="mr-3 text-[#676767] focus:ring-[#676767]"
                        />
                        <span>{urgencyOption.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#676767] focus:border-transparent"
                    placeholder="Additional notes or requirements"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowBookingModal(false)}
                  disabled={bookingLoading}
                  className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitBooking}
                  disabled={bookingLoading || !bookingForm.name || !bookingForm.email || !bookingForm.service}
                  className="flex-2 bg-[#676767] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#575757] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {bookingLoading ? 'Booking...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}