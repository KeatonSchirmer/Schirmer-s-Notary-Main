export async function submitRequest(data: {
  name: string;
  email: string;
  document_type: string;
  service: string;
  signer: string;
  urgency?: string;
  date?: string;
  location: string;
  wording?: string;
  id_verification?: string;
  witness?: string;
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
