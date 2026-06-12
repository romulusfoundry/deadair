import { serviceClient } from '../../../lib/supabase';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email || '').trim().slice(0, 200);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: 'invalid email' }, { status: 400 });
  }

  const bid = Number(body.bid);
  const db = serviceClient();
  const { error } = await db.from('deadair_sponsor_leads').insert({
    email,
    company: String(body.company || '').slice(0, 200),
    message: String(body.message || '').slice(0, 2000),
    bid_usd: Number.isFinite(bid) && bid > 0 && bid < 1000000 ? Math.round(bid * 100) / 100 : null
  });
  if (error) return Response.json({ error: 'db error' }, { status: 500 });
  return Response.json({ ok: true });
}
