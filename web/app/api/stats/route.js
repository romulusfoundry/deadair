import { serviceClient } from '../../../lib/supabase';

export const revalidate = 0;

export async function GET() {
  const db = serviceClient();
  const { count, error } = await db
    .from('deadair_installs')
    .select('*', { count: 'exact', head: true });
  if (error) return Response.json({ error: 'db error' }, { status: 500 });
  return Response.json({
    installs: count,
    founder_slots_left: Math.max(0, 1000 - count)
  });
}
