"use client";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Maintenance Mode</h1>
        <p className="text-gray-600 mb-4">Our login portal is temporarily unavailable due to technical difficulties. We&#39;re working to restore service as quickly as possible.</p>
        <p className="text-gray-500 text-sm mb-6">If you need urgent assistance, please contact <a href="mailto:schirmer.nikolas@gmail.com" className="text-[#676767] underline">schirmer.nikolas@gmail.com</a>.</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => typeof window !== 'undefined' && window.location.reload()}
            className="bg-[#676767] text-white px-4 py-2 rounded-lg hover:bg-[#575757]"
          >
            Refresh
          </button>
          <a href="/" className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">Home</a>
        </div>
      </div>
    </div>
  );
}