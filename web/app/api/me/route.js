import { serviceClient } from '../../../lib/supabase';

export const revalidate = 0;

export async function GET(request) {
  const installId = new URL(request.url).searchParams.get('install_id');
  if (!installId || !/^[0-9a-f-]{36}$/i.test(installId)) {
    return Response.json({ error: 'invalid install_id' }, { status: 400 });
  }

  const db = serviceClient();
  const [{ data: install }, { data: stats, error }] = await Promise.all([
    db.from('deadair_installs_v').select('founder, rev_share').eq('id', installId).single(),
    // countable_seconds applies the 8h/day anti-farming cap (SQL view) —
    // this is the figure accrual math will use, so status shows it too
    db.from('deadair_install_seconds_v').select('countable_seconds').eq('install_id', installId).maybeSingle()
  ]);
  if (error || !install) return Response.json({ error: 'not found' }, { status: 404 });

  return Response.json({
    seconds: stats?.countable_seconds ?? 0,
    rev_share: install.rev_share,
    founder: install.founder,
    // No sponsor revenue pool yet — accrual math lands when the first
    // founding sponsor pays. Until then this is honestly zero.
    accrued_cents: 0
  });
}
