import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

// POST /api/payments - Process payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, type, amount, payment_method, order_id } = body;

    // Validate required fields
    if (!user_id || !type || !amount || !payment_method || !order_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Integrate with Toss Payments API
    // For now, we'll simulate a successful payment

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id,
        type,
        amount,
        status: 'completed',
        payment_method,
        order_id,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Handle different payment types
    if (type === 'coins') {
      // Add coins to user
      const coinsToAdd = calculateCoinsFromPayment(amount);
      await supabaseAdmin.rpc('add_coins', {
        user_id,
        amount: coinsToAdd,
      });

      // Record coin transaction
      await supabaseAdmin.from('coin_transactions').insert({
        user_id,
        amount: coinsToAdd,
        type: 'purchase',
        description: `코인 구매 (${coinsToAdd}개)`,
        related_id: payment.id,
      });
    } else if (type === 'subscription') {
      // Update subscription
      const tier = getSubscriptionTierFromAmount(amount);
      const current_period_start = new Date();
      const current_period_end = new Date();
      current_period_end.setMonth(current_period_end.getMonth() + 1);

      await supabaseAdmin.from('subscriptions').insert({
        user_id,
        tier,
        status: 'active',
        current_period_start: current_period_start.toISOString(),
        current_period_end: current_period_end.toISOString(),
      });

      // Update user subscription
      await supabaseAdmin
        .from('users')
        .update({
          subscription_tier: tier,
          subscription_expires_at: current_period_end.toISOString(),
        })
        .eq('id', user_id);
    }

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

function calculateCoinsFromPayment(amount: number): number {
  // Map payment amount to coins (with bonuses)
  const packages = [
    { price: 5000, coins: 1000, bonus: 0 },
    { price: 14000, coins: 3000, bonus: 500 },
    { price: 22000, coins: 5000, bonus: 1000 },
    { price: 40000, coins: 10000, bonus: 3000 },
  ];

  const pkg = packages.find((p) => p.price === amount);
  return pkg ? pkg.coins + pkg.bonus : 0;
}

function getSubscriptionTierFromAmount(amount: number): string {
  if (amount === 39000) return 'premium';
  if (amount === 59000) return 'premium_plus';
  return 'free';
}
