import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getServiceSupabase } from '@/lib/supabase';

const PACK_CREDITS: Record<string, number> = {
  'pack_50': 50,
  'pack_200': 200,
  'pack_500': 500
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { packageId } = await req.json();
    const creditsToAdd = PACK_CREDITS[packageId];
    if (!creditsToAdd) return NextResponse.json({ error: 'Invalid package' }, { status: 400 });

    const { data: user, error: userError } = await getServiceSupabase()
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (userError || !user) throw new Error('User not found in db');

    const newBalance = user.credits + creditsToAdd;

    // Add credits
    await getServiceSupabase()
      .from('users')
      .update({ credits: newBalance, updated_at: new Date().toISOString() })
      .eq('id', userId);

    // Log transaction
    await getServiceSupabase()
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: creditsToAdd,
        type: 'purchased',
        description: `Purchased ${creditsToAdd} credits (Simulated Checkout)`,
        balance_after: newBalance
      });

    return NextResponse.json({ success: true, balance: newBalance });
  } catch (error) {
    console.error('Fake buy API error:', error);
    return NextResponse.json({ error: 'Failed to process simulated payment' }, { status: 500 });
  }
}
