import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { billingCycle } = await req.json();

    const { data: user, error: userError } = await getServiceSupabase()
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (userError || !user) throw new Error('User not found in db');

    // Make them Pro and give 1000 credits
    const newBalance = user.credits + 1000;

    await getServiceSupabase()
      .from('users')
      .update({ 
        plan: 'pro', 
        credits: newBalance,
        subscription_status: 'active',
        // Simulated next billing date
        subscription_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId);

    await getServiceSupabase()
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: 1000,
        type: 'granted',
        description: `Pro Plan Upgrade (${billingCycle}) - 1000 Credits (Simulated)`,
        balance_after: newBalance
      });

    return NextResponse.json({ success: true, plan: 'pro' });
  } catch (error) {
    console.error('Fake subscribe API error:', error);
    return NextResponse.json({ error: 'Failed to process simulated subscription' }, { status: 500 });
  }
}
