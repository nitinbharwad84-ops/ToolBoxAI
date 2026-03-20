import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyWebhookSignature } from '@/lib/razorpay';

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const eventType = event.event;
  const supabase = getServiceSupabase();

  const clerkId =
    event.payload?.subscription?.entity?.notes?.clerk_id ??
    event.payload?.payment?.entity?.notes?.clerk_id;

  if (!clerkId) {
    return NextResponse.json({ success: true, message: 'No clerk_id in notes' });
  }

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) return NextResponse.json({ success: true, message: 'User not found' });

  if (eventType === 'subscription.activated') {
    await supabase
      .from('users')
      .update({
        plan: 'pro',
        subscription_status: 'active',
        razorpay_subscription_id: event.payload.subscription.entity.id,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', clerkId);

    const { data: creditResult } = await supabase.rpc('add_credits', {
      p_clerk_id: clerkId,
      p_amount: 1000,
    });

    const row = creditResult?.[0] ?? creditResult;
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      clerk_id: clerkId,
      type: 'subscription_grant',
      amount: 1000,
      balance_after: row?.new_balance ?? 0,
      description: 'Pro subscription activated — 1000 credits',
      razorpay_subscription_id: event.payload.subscription.entity.id,
    });
  }

  if (eventType === 'subscription.charged') {
    const { data: creditResult } = await supabase.rpc('add_credits', {
      p_clerk_id: clerkId,
      p_amount: 1000,
    });

    const row = creditResult?.[0] ?? creditResult;
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      clerk_id: clerkId,
      type: 'subscription_grant',
      amount: 1000,
      balance_after: row?.new_balance ?? 0,
      description: 'Monthly Pro renewal — 1000 credits',
      razorpay_subscription_id: event.payload.subscription.entity.id,
    });

    await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('clerk_id', clerkId);
  }

  if (eventType === 'subscription.cancelled') {
    await supabase
      .from('users')
      .update({
        plan: 'free',
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', clerkId);
  }

  if (eventType === 'subscription.halted') {
    await supabase
      .from('users')
      .update({
        subscription_status: 'halted',
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', clerkId);
  }

  return NextResponse.json({ success: true });
}
