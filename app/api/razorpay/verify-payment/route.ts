import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyPaymentSignature } from '@/lib/razorpay';

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packageId } = await req.json();

  // Verify signature
  const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    return NextResponse.json({ error: 'PAYMENT_VERIFICATION_FAILED', message: 'Payment could not be verified.' }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  // Get package
  const { data: pkg } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('id', packageId)
    .single();

  if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

  // Add credits
  const { data: creditResult } = await supabase.rpc('add_credits', {
    p_clerk_id: clerkId,
    p_amount: pkg.credits,
  });

  const row = creditResult?.[0] ?? creditResult;
  if (!row?.success) {
    return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 });
  }

  // Get user for transaction
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  // Log transaction
  if (user) {
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      clerk_id: clerkId,
      type: 'purchase',
      amount: pkg.credits,
      balance_after: row.new_balance,
      description: `Purchased ${pkg.name} — ${pkg.credits} credits`,
      razorpay_order_id,
      razorpay_payment_id,
    });
  }

  return NextResponse.json({ success: true, newBalance: row.new_balance });
}
