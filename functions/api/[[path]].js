// Keep the browser session on the demo's own origin, including CSRF cookies.
export async function onRequest({ request, env }) {
  if (!env.API_ORIGIN) return Response.json({ error: 'The demo server is not configured yet.' }, { status: 503 });
  const incoming = new URL(request.url);
  const target = new URL(env.API_ORIGIN);
  if (target.protocol !== 'https:') return Response.json({ error: 'The demo server needs a secure connection.' }, { status: 503 });
  target.pathname = incoming.pathname.replace(/^\/api(?=\/|$)/, '') || '/';
  target.search = incoming.search;
  const forwarded = new Request(target, request);
  forwarded.headers.delete('Host');
  const upstream = await fetch(forwarded, { redirect: 'manual' });
  const response = new Response(upstream.body, upstream);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
