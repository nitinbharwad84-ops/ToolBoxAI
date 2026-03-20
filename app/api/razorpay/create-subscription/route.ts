import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getRazorpayClient } from '@/lib/razorpay';

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { billingCycle } = await req.json();
  const supabase = getServiceSupabase();

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const razorpay = getRazorpayClient();

  // Create/get Razorpay customer
  let customerId = user.razorpay_customer_id;
  if (!customerId) {
    const customer = await razorpay.customers.create({
      name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'ToolboxAI User',
      email: user.email,
      notes: { clerk_id: clerkId },
    });
    customerId = customer.id;
    await supabase.from('users').update({ razorpay_customer_id: customerId }).eq('clerk_id', clerkId);
  }

  // Get plan
  const planField = billingCycle === 'yearly' ? 'razorpay_yearly_plan_id' : 'razorpay_monthly_plan_id';
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('plan_key', 'pro')
    .single();

  const planId = plan?.[planField as keyof typeof plan] as string;
  if (!planId) {
    return NextResponse.json({ error: 'Plan not configured in Razorpay' }, { status: 500 });
  }

  const subscription = await razorpay.subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    total_count: 12,
    notes: { clerk_id: clerkId },
  });

  return NextResponse.json({
    subscriptionId: subscription.id,
    shortUrl: subscription.short_url,
  });
}
