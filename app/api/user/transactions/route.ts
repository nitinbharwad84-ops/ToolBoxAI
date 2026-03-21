import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);
  const offset = Number(searchParams.get('offset') ?? 0);

  const supabase = getServiceSupabase();
  const { data, count } = await supabase
    .from('credit_transactions')
    .select('*', { count: 'exact' })
    .eq('clerk_id', clerkId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return NextResponse.json({ items: data ?? [], total: count ?? 0 });
}
