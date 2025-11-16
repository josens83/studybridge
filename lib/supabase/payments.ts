import { supabase } from './client';

// Process coin purchase
export async function purchaseCoins(
  userId: string,
  packagePrice: number,
  orderId: string,
  paymentKey?: string
) {
  // Calculate coins to add based on package
  const packages = [
    { price: 5000, coins: 1000, bonus: 0 },
    { price: 14000, coins: 3000, bonus: 500 },
    { price: 22000, coins: 5000, bonus: 1000 },
    { price: 40000, coins: 10000, bonus: 3000 },
  ];

  const pkg = packages.find((p) => p.price === packagePrice);
  if (!pkg) throw new Error('Invalid package');

  const totalCoins = pkg.coins + pkg.bonus;

  // Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      type: 'coins',
      amount: packagePrice,
      status: 'completed',
      payment_method: 'card',
      payment_key: paymentKey,
      order_id: orderId,
    })
    .select()
    .single();

  if (paymentError) throw paymentError;

  // Add coins to user
  await supabase.rpc('add_coins', {
    user_id: userId,
    amount: totalCoins,
  });

  // Record transaction
  await supabase.from('coin_transactions').insert({
    user_id: userId,
    amount: totalCoins,
    type: 'purchase',
    description: `코인 구매 (${totalCoins.toLocaleString()}개)`,
    related_id: payment.id,
  });

  return payment;
}

// Process subscription purchase
export async function purchaseSubscription(
  userId: string,
  tier: 'premium' | 'premium_plus',
  orderId: string,
  paymentKey?: string
) {
  const prices = {
    premium: 39000,
    premium_plus: 59000,
  };

  const amount = prices[tier];

  // Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      type: 'subscription',
      amount,
      status: 'completed',
      payment_method: 'card',
      payment_key: paymentKey,
      order_id: orderId,
    })
    .select()
    .single();

  if (paymentError) throw paymentError;

  // Calculate subscription period
  const currentPeriodStart = new Date();
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

  // Create or update subscription
  const { error: subError } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    tier,
    status: 'active',
    current_period_start: currentPeriodStart.toISOString(),
    current_period_end: currentPeriodEnd.toISOString(),
    cancel_at_period_end: false,
  });

  if (subError) throw subError;

  // Update user subscription tier
  await supabase
    .from('users')
    .update({
      subscription_tier: tier,
      subscription_expires_at: currentPeriodEnd.toISOString(),
    })
    .eq('id', userId);

  return payment;
}

// Cancel subscription
export async function cancelSubscription(userId: string) {
  const { error } = await supabase
    .from('subscriptions')
    .update({ cancel_at_period_end: true })
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) throw error;
}

// Get payment history
export async function getPaymentHistory(userId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Get coin transaction history
export async function getCoinTransactions(userId: string) {
  const { data, error } = await supabase
    .from('coin_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

// Get point transaction history
export async function getPointTransactions(userId: string) {
  const { data, error } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}
