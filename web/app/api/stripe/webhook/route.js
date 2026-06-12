import crypto from 'node:crypto';
import { serviceClient } from '../../../../lib/supabase';
import { creativeRejectionReason, sanitizeText } from '../../../../lib/sanitize';

// Stripe webhook. Verifies the signature with node crypto (no stripe SDK, no
// extra dependency). On a completed checkout we record the sponsor as paid and
// stage their creative INACTIVE — it only goes live after manual approval, so
// payment never auto-publishes unreviewed text to terminals.
export const revalidate = 0;

const TOLERANCE_S = 300;

function verify(rawBody, sigHeader, secret) {
  const parts = Object.fromEntries(
    (sigHeader || '').split(',').map((kv) => kv.split('=').map((x) => x.trim()))
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > TOLERANCE_S) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${t}.${rawBody}`)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: 'webhook not configured' }, { status: 501 });

  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature');
  if (!verify(rawBody, sig, secret)) {
    return Response.json({ error: 'bad signature' }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: 'bad json' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data?.object || {};
    const email = sanitizeText(session.customer_details?.email || session.customer_email || '', 200);
    // advertiser can pass their desired line via a custom field at checkout
    const proposed = sanitizeText(
      session.custom_fields?.find?.((f) => f.key === 'ad_line')?.text?.value || '',
      60
    );

    const db = serviceClient();
    await db.from('deadair_sponsor_leads').insert({
      email: email || 'unknown@stripe',
      company: sanitizeText(session.customer_details?.name || '', 200),
      message: proposed,
      status: 'paid'
    });

    // Stage the creative only if it passes the denylist; always inactive until
    // a human flips active = true.
    if (proposed && !creativeRejectionReason(proposed)) {
      await db.from('deadair_creatives').insert({
        text: proposed,
        sponsor: sanitizeText(session.customer_details?.name || 'Sponsor', 24),
        url: null,
        weight: 1,
        active: false
      });
    }
  }

  return new Response(null, { status: 204 });
}
