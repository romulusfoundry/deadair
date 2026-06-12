import { serviceClient } from '../../../lib/supabase';

const UUID = /^[0-9a-f-]{36}$/i;
const SURFACES = new Set(['codex-exec', 'codex-banner', 'gemini-pool']);
const MAX_EVENTS = 50;

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || !UUID.test(body.session_id || '') || !UUID.test(body.install_id || '')) {
    return Response.json({ error: 'invalid ids' }, { status: 400 });
  }
  const seconds = Math.round(Number(body.seconds));
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 86400) {
    return Response.json({ error: 'invalid seconds' }, { status: 400 });
  }

  // Vercel geo header — country only, no IP stored. This is the entire
  // "audience" data model: tool, OS, country, time. Nothing personal.
  const country = (request.headers.get('x-vercel-ip-country') || '').slice(0, 2) || null;
  const cli = String(body.cli || 'unknown').slice(0, 16);

  const db = serviceClient();
  // session_id is the idempotency key: re-reports of the same session no-op
  const { error } = await db.from('deadair_sessions').upsert(
    {
      session_id: body.session_id,
      install_id: body.install_id,
      cli,
      seconds,
      started_at: body.started_at || null,
      country
    },
    { onConflict: 'session_id', ignoreDuplicates: true }
  );
  if (error) {
    const status = error.code === '23503' ? 400 : 500; // unknown install
    return Response.json({ error: 'db error' }, { status });
  }

  // Per-creative serve events (impression ledger). Sponsor-billable data,
  // so validate hard and cap: a session can't claim more rendered ms than
  // its own wall time.
  const events = Array.isArray(body.events) ? body.events.slice(0, MAX_EVENTS) : [];
  const maxMs = (seconds + 60) * 1000;
  const rows = events
    .filter((e) => e && UUID.test(e.creative_id || '') && SURFACES.has(e.surface))
    .map((e) => ({
      session_id: body.session_id,
      install_id: body.install_id,
      creative_id: e.creative_id,
      cli,
      surface: e.surface,
      ms: Math.min(Math.max(0, Math.round(Number(e.ms) || 0)), maxMs),
      country
    }));
  if (rows.length) {
    await db.from('deadair_impressions').upsert(rows, {
      onConflict: 'session_id,creative_id,surface',
      ignoreDuplicates: true
    });
  }
  return new Response(null, { status: 204 });
}
