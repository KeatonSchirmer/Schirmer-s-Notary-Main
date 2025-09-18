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
  const res = await fetch('http://schirmer-s-notary-backend.onrender.com/jobs/request', {
      method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
  return await res.json();
}
