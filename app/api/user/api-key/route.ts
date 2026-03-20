import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { encrypt } from '@/lib/encryption';

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { provider, key } = await req.json();
  if (!provider || !key) {
    return NextResponse.json({ error: 'Provider and key required' }, { status: 400 });
  }

  const encrypted = encrypt(key);
  const supabase = getServiceSupabase();

  await supabase
    .from('users')
    .update({
      user_api_provider: provider,
      user_api_key_encrypted: encrypted,
      user_api_key_set_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('clerk_id', clerkId);

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceSupabase();

  await supabase
    .from('users')
    .update({
      user_api_provider: null,
      user_api_key_encrypted: null,
      user_api_key_set_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('clerk_id', clerkId);

  return NextResponse.json({ success: true });
}
