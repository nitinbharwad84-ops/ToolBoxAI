import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(req: Request) {
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
    return NextResponse.json({ error: 'PRO_REQUIRED', message: 'Export requires Pro.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') ?? 'json';

  const { data } = await supabase
    .from('tool_history')
    .select('*')
    .eq('clerk_id', clerkId)
    .order('created_at', { ascending: false });

  if (format === 'csv') {
    const headers = ['Date', 'Tool', 'Credits', 'Provider', 'Status', 'Preview'];
    const rows = (data ?? []).map((item) => [
      new Date(item.created_at).toISOString(),
      item.tool_display_name,
      item.credits_used,
      item.ai_provider_used ?? '',
      item.status,
      (item.input_preview ?? '').replace(/,/g, ' ').replace(/\n/g, ' '),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=toolboxai-history.csv',
      },
    });
  }

  return NextResponse.json(data ?? []);
}
