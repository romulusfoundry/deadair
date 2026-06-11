import { serviceClient } from '../../../lib/supabase';

export const revalidate = 0;

export async function GET() {
  const db = serviceClient();
  const { data, error } = await db
    .from('deadair_creatives')
    .select('text, sponsor, url, weight')
    .eq('active', true);
  if (error) return Response.json({ error: 'db error' }, { status: 500 });
  return Response.json({ creatives: data, refresh_after: 900 });
}
