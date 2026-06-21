import { getStore } from '@netlify/blobs';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-bot-secret',
};

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const store = getStore('mechanic-messages');

  // GET — return last 200 messages sorted newest first
  if (request.method === 'GET') {
    try {
      const { blobs } = await store.list();
      const sorted = blobs
        .sort((a, b) => b.key.localeCompare(a.key))
        .slice(0, 200);
      const messages = await Promise.all(
        sorted.map(b => store.get(b.key, { type: 'json' }).catch(() => null))
      );
      return new Response(JSON.stringify(messages.filter(Boolean)), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    } catch {
      return new Response('[]', {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
  }

  // POST — save a new message (from the WhatsApp bot)
  if (request.method === 'POST') {
    const secret   = request.headers.get('x-bot-secret');
    const expected = process.env.BOT_SECRET;
    if (expected && secret !== expected) {
      return new Response('Forbidden', { status: 403, headers: CORS });
    }
    try {
      const msg = await request.json();
      const id  = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await store.setJSON(id, { ...msg, id, serverTimestamp: Date.now() });
      return new Response(JSON.stringify({ ok: true, id }), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method not allowed', { status: 405, headers: CORS });
};

export const config = { path: '/api/messages' };
