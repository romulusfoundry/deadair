import { serviceClient } from '../../../lib/supabase';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const installId = body?.install_id;
  if (!installId || !/^[0-9a-f-]{36}$/i.test(installId)) {
    return Response.json({ error: 'invalid install_id' }, { status: 400 });
  }

  const db = serviceClient();
  const { error } = await db.from('kickflip_installs').upsert(
    {
      id: installId,
      platform: String(body.platform || '').slice(0, 32),
      client_version: String(body.client_version || '').slice(0, 32)
    },
    { onConflict: 'id', ignoreDuplicates: true }
  );
  if (error) return Response.json({ error: 'db error' }, { status: 500 });

  const { data, error: readError } = await db
    .from('kickflip_installs_v')
    .select('install_number, founder, rev_share')
    .eq('id', installId)
    .single();
  if (readError) return Response.json({ error: 'db error' }, { status: 500 });

  return Response.json({
    install_id: installId,
    founder: data.founder,
    founder_number: data.founder ? data.install_number : null,
    rev_share: data.rev_share
  });
}
