import { serviceClient } from '../../../lib/supabase';

// Click redirect: ad lines rendered by the CLI are OSC-8 hyperlinks pointing
// here. Log the click (creative, surface, optional install, country — no IP
// stored), then 302 to the sponsor's URL. This is what makes CTR a real,
// billable metric per creative.
export const revalidate = 0;

const UUID = /^[0-9a-f-]{36}$/i;
const SURFACES = new Set(['codex-exec', 'codex-banner', 'gemini-pool', 'generic-banner', 'site']);

export async function GET(request, { params }) {
  const { id } = await params;
  if (!UUID.test(id || '')) {
    return Response.redirect('https://deadair.online', 302);
  }

  const url = new URL(request.url);
  const surface = SURFACES.has(url.searchParams.get('s')) ? url.searchParams.get('s') : null;
  const install = url.searchParams.get('i');
  const country = (request.headers.get('x-vercel-ip-country') || '').slice(0, 2) || null;

  const db = serviceClient();
  const { data: creative } = await db
    .from('deadair_creatives')
    .select('url')
    .eq('id', id)
    .single();

  if (creative) {
    await db.from('deadair_clicks').insert({
      creative_id: id,
      install_id: UUID.test(install || '') ? install : null,
      surface,
      country
    });
  }

  const dest = creative?.url && /^https:\/\//.test(creative.url)
    ? creative.url
    : 'https://deadair.online';
  return Response.redirect(dest, 302);
}
