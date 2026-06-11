import { serviceClient } from '../../../lib/supabase';

export const revalidate = 0;

export async function GET(request) {
  const installId = new URL(request.url).searchParams.get('install_id');
  if (!installId || !/^[0-9a-f-]{36}$/i.test(installId)) {
    return Response.json({ error: 'invalid install_id' }, { status: 400 });
  }

  const db = serviceClient();
  const [{ data: install }, { data: sessions, error }] = await Promise.all([
    db.from('deadair_installs_v').select('founder, rev_share').eq('id', installId).single(),
    db.from('deadair_sessions').select('seconds').eq('install_id', installId)
  ]);
  if (error || !install) return Response.json({ error: 'not found' }, { status: 404 });

  const seconds = sessions.reduce((sum, s) => sum + s.seconds, 0);
  return Response.json({
    seconds,
    rev_share: install.rev_share,
    founder: install.founder,
    // No sponsor revenue pool yet — accrual math lands when the first
    // founding sponsor pays. Until then this is honestly zero.
    accrued_cents: 0
  });
}
