import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import type { UserProfile } from '@/types';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceSupabase();
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  if (error || !user) {
    // ── FALLBACK: Auto-sync user if webhook missed them locally ──
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        clerk_id: userId,
        email,
        first_name: clerkUser.firstName ?? null,
        last_name: clerkUser.lastName ?? null,
        image_url: clerkUser.imageUrl ?? null,
        plan: 'free',
        credits: 100,
      })
      .select('*')
      .single();

    if (insertError || !newUser) {
      console.error('Failed to auto-sync user:', insertError);
      return NextResponse.json({ error: 'Failed to auto-sync user' }, { status: 500 });
    }

    // Grant 100 starting credits
    await supabase.from('credit_transactions').insert({
      user_id: newUser.id,
      clerk_id: userId,
      type: 'initial_grant',
      amount: 100,
      balance_after: 100,
      description: 'Welcome — 100 free credits',
    });

    user = newUser;
  }

  const profile: UserProfile = {
    id: user.id,
    clerk_id: user.clerk_id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    image_url: user.image_url,
    plan: user.plan,
    credits: user.credits,
    total_credits_used: user.total_credits_used,
    subscription_status: user.subscription_status,
    user_api_key_set: !!user.user_api_key_encrypted,
    user_api_provider: user.user_api_provider,
    default_language: user.default_language,
    show_provider_badge: user.show_provider_badge,
    auto_save_history: user.auto_save_history,
    response_format: user.response_format,
  };

  return NextResponse.json(profile);
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const allowedFields = ['default_language', 'show_provider_badge', 'auto_save_history', 'response_format'];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field];
  }

  const supabase = getServiceSupabase();
  const { error } = await supabase.from('users').update(updates).eq('clerk_id', userId);

  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
