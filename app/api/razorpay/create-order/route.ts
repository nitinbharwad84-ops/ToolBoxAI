import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getRazorpayClient } from '@/lib/razorpay';

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { packageId } = await req.json();
  const supabase = getServiceSupabase();

  const { data: pkg } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('id', packageId)
    .eq('active', true)
    .single();

  if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

  const razorpay = getRazorpayClient();

  const order = await razorpay.orders.create({
    amount: pkg.price_paise,
    currency: 'INR',
    receipt: `credits_${clerkId}_${Date.now()}`,
    notes: { clerk_id: clerkId, package_name: pkg.name, credits: pkg.credits.toString() },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: pkg.price_paise,
    currency: 'INR',
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    packageName: pkg.name,
    credits: pkg.credits,
  });
}
