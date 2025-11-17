import { supabase } from './client';

export interface CoinPackage {
  id: string;
  name: string;
  price: number;
  coins: number;
  bonus: number;
  totalCoins: number;
  popular?: boolean;
  savings?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'premium' | 'premium_plus';
  price: number;
  features: string[];
  popular?: boolean;
}

// Coin packages available for purchase
export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'basic',
    name: '기본',
    price: 5000,
    coins: 1000,
    bonus: 0,
    totalCoins: 1000,
  },
  {
    id: 'standard',
    name: '인기',
    price: 14000,
    coins: 3000,
    bonus: 500,
    totalCoins: 3500,
    popular: true,
    savings: '10% 할인',
  },
  {
    id: 'premium',
    name: '프리미엄',
    price: 22000,
    coins: 5000,
    bonus: 1000,
    totalCoins: 6000,
    savings: '15% 할인',
  },
  {
    id: 'mega',
    name: '메가',
    price: 40000,
    coins: 10000,
    bonus: 3000,
    totalCoins: 13000,
    savings: '20% 할인',
  },
];

// Subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'premium',
    name: '프리미엄',
    tier: 'premium',
    price: 39000,
    features: [
      '무제한 질문',
      '광고 제거',
      '우선 답변',
      'AI 도우미 (베타)',
      '질문 우선 노출',
    ],
    popular: true,
  },
  {
    id: 'premium_plus',
    name: '프리미엄+',
    tier: 'premium_plus',
    price: 59000,
    features: [
      '프리미엄 모든 기능',
      '월 20회 튜터 매칭',
      '1:1 맞춤 학습 지도',
      '학습 리포트 제공',
      '과제 첨삭 서비스',
    ],
  },
];

// Process coin purchase
export async function purchaseCoins(
  userId: string,
  packagePrice: number,
  orderId: string,
  paymentKey?: string
) {
  const pkg = COIN_PACKAGES.find((p) => p.price === packagePrice);
  if (!pkg) throw new Error('Invalid package');

  const totalCoins = pkg.totalCoins;

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
