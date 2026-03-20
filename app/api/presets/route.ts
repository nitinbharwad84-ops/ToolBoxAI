import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const toolName = searchParams.get('tool');

  const supabase = getServiceSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('id, plan')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.plan !== 'pro') {
    return NextResponse.json({ error: 'PRO_REQUIRED' }, { status: 403 });
  }

  let query = supabase
    .from('tool_presets')
    .select('*')
    .eq('clerk_id', clerkId)
    .order('created_at', { ascending: false });

  if (toolName) query = query.eq('tool_name', toolName);

  const { data } = await query;
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('id, plan')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.plan !== 'pro') {
    return NextResponse.json({ error: 'PRO_REQUIRED' }, { status: 403 });
  }

  const { tool_name, preset_name, config } = await req.json();

  // Max 5 presets per tool
  const { count } = await supabase
    .from('tool_presets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('tool_name', tool_name);

  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: 'MAX_PRESETS', message: 'Maximum 5 presets per tool.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tool_presets')
    .insert({
      user_id: user.id,
      clerk_id: clerkId,
      tool_name,
      preset_name,
      config,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to save preset' }, { status: 500 });

  return NextResponse.json(data);
}
