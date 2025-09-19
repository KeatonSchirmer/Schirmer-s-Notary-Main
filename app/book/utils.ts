export async function submitRequest(data: {
  name: string;
  email: string;
  client_id?: string | number;
  service: string;
  urgency?: string;
  date?: string;
  time?: string;
  location: string;
  notes?: string;
  journal_id?: string;
}) {
  try {
    console.log("[submitRequest] Sending booking request to backend", data);
    const res = await fetch('http://schirmer-s-notary-backend.onrender.com/jobs/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    console.log("[submitRequest] Response status:", res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error("[submitRequest] Backend error response:", errorText);
      throw new Error(errorText || `HTTP error ${res.status}`);
    }
    const json = await res.json();
    console.log("[submitRequest] Success response:", json);
    return json;
  } catch (err) {
    console.error("[submitRequest] Fetch failed:", err);
    throw err;
  }
}
