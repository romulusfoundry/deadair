import { serviceClient } from '../../../lib/supabase';
import { sanitizeCreative } from '../../../lib/sanitize';

export const revalidate = 0;

export async function GET() {
  const db = serviceClient();
  const { data, error } = await db
    .from('deadair_creatives')
    .select('id, text, sponsor, url, weight')
    .eq('active', true);
  if (error) return Response.json({ error: 'db error' }, { status: 500 });
  // sanitize on serve: the API is the chokepoint, so a creative that slipped
  // into the table dirty can never reach a terminal dirty
  const creatives = (data || [])
    .map(sanitizeCreative)
    .filter((c) => c.text.length >= 3);
  return Response.json({ creatives, refresh_after: 900 });
}
