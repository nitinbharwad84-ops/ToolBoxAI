import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceSupabase();
  const { searchParams } = new URL(req.url);
  const tool = searchParams.get('tool');
  const limit = parseInt(searchParams.get('limit') ?? '20');
  const offset = parseInt(searchParams.get('offset') ?? '0');

  const { data: user } = await supabase
    .from('users')
    .select('id, plan')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  let query = supabase
    .from('tool_history')
    .select('*', { count: 'exact' })
    .eq('clerk_id', clerkId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (tool) query = query.eq('tool_name', tool);

  // Free users: 7-day history only
  if (user.plan === 'free') {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte('created_at', sevenDaysAgo);
  }

  const { data, count, error } = await query;

  if (error) return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });

  return NextResponse.json({ items: data ?? [], total: count ?? 0, limit, offset });
}

export async function DELETE(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = getServiceSupabase();
  await supabase.from('tool_history').delete().eq('id', id).eq('clerk_id', clerkId);

  return NextResponse.json({ success: true });
}
