"use client";

import React, { useState } from "react";

const RequestPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('email', email);
      form.append('phone', phone);
      form.append('notes', notes);

      uploadedFiles.forEach(file => {
        form.append('attachments', file);
      });

      const res = await fetch("https://schirmer-s-notary-backend.onrender.com/jobs/tempRequest", {
        method: 'POST',
        body: form,
      });

      if (res.ok) {
        setSuccess("Request submitted successfully! We'll contact you soon.");
        setName("");
        setEmail("");
        setPhone("");
        setNotes("");
        setUploadedFiles([]);
      } else {
        throw new Error("Failed to submit request.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit request.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-black max-w-6xl mx-auto py-10 md:py-16 px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
      <div>
        <h3 className="text-lg md:text-xl font-bold mb-4">Email to Book</h3>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Request a Service</h2>
        <form className="bg-white p-4 md:p-8 rounded-xl shadow-md space-y-4 md:space-y-6" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Full Name" 
            className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base" 
            required 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="tel" 
            placeholder="Phone Number (optional)" 
            className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
          />
          <textarea 
            placeholder="Notes / Additional Information (include location)" 
            className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base" 
            rows={4} 
            value={notes} 
            onChange={e => setNotes(e.target.value)}
          />
          
          {/* File upload input */}
          <input 
            type="file" 
            multiple 
            onChange={handleFileUpload}
            className="w-full p-2 md:p-3 border rounded-lg text-sm md:text-base"
            accept=".pdf,image/*"
          />
          
          {/* Show uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-sm mb-2">Attachments ({uploadedFiles.length}):</p>
              <ul className="text-sm space-y-1">
                {uploadedFiles.map((file, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button 
            type="submit" 
            className="bg-[#676767] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-[#575757] w-full text-sm md:text-base disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
          {success && (
            <div className="bg-gray-100 border border-gray-400 text-[#676767] rounded-lg px-4 py-2 mt-2 text-center font-semibold">
              {success}
            </div>
          )}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
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