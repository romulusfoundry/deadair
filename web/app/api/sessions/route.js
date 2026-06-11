import { serviceClient } from '../../../lib/supabase';

const UUID = /^[0-9a-f-]{36}$/i;

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || !UUID.test(body.session_id || '') || !UUID.test(body.install_id || '')) {
    return Response.json({ error: 'invalid ids' }, { status: 400 });
  }
  const seconds = Math.round(Number(body.seconds));
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 86400) {
    return Response.json({ error: 'invalid seconds' }, { status: 400 });
  }

  const db = serviceClient();
  // session_id is the idempotency key: re-reports of the same session no-op
  const { error } = await db.from('kickflip_sessions').upsert(
    {
      session_id: body.session_id,
      install_id: body.install_id,
      cli: String(body.cli || 'unknown').slice(0, 16),
      seconds,
      started_at: body.started_at || null
    },
    { onConflict: 'session_id', ignoreDuplicates: true }
  );
  if (error) {
    const status = error.code === '23503' ? 400 : 500; // unknown install
    return Response.json({ error: 'db error' }, { status });
  }
  return new Response(null, { status: 204 });
}
