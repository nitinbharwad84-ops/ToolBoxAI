import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
  };
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let event: ClerkWebhookEvent;
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { type, data } = event;

  if (type === 'user.created') {
    const email = data.email_addresses?.[0]?.email_address ?? '';

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        clerk_id: data.id,
        email,
        first_name: data.first_name ?? null,
        last_name: data.last_name ?? null,
        image_url: data.image_url ?? null,
        plan: 'free',
        credits: 100,
      })
      .select('id, credits')
      .single();

    if (error) {
      console.error('Failed to create user:', error);
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 });
    }

    await supabase.from('credit_transactions').insert({
      user_id: newUser.id,
      clerk_id: data.id,
      type: 'initial_grant',
      amount: 100,
      balance_after: 100,
      description: 'Welcome — 100 free credits',
    });
  }

  if (type === 'user.updated') {
    const email = data.email_addresses?.[0]?.email_address;
    await supabase
      .from('users')
      .update({
        ...(email && { email }),
        first_name: data.first_name ?? null,
        last_name: data.last_name ?? null,
        image_url: data.image_url ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', data.id);
  }

  if (type === 'user.deleted') {
    await supabase.from('users').delete().eq('clerk_id', data.id);
  }

  return NextResponse.json({ success: true });
}
