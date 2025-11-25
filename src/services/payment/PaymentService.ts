/**
 * Payment Service Abstraction Layer
 * Provider-agnostic interface for handling subscriptions
 */

export type SubscriptionTier = 'free' | 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface SubscriptionInfo {
  isPro: boolean;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
}

export interface PaymentProvider {
  initialize(): Promise<void>;
  purchase(productId: SubscriptionTier): Promise<boolean>;
  restorePurchases(): Promise<boolean>;
  checkSubscriptionStatus(): Promise<SubscriptionInfo>;
}

/**
 * Mock Payment Provider for Testing
 * Simulates successful transactions without real payment processing
 */
class MockPaymentProvider implements PaymentProvider {
  async initialize(): Promise<void> {
    console.log('[MockPayment] Provider initialized');
    return Promise.resolve();
  }

  async purchase(productId: SubscriptionTier): Promise<boolean> {
    console.log(`[MockPayment] Simulating purchase of: ${productId}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    
    if (success) {
      console.log('[MockPayment] Purchase successful!');
    } else {
      console.log('[MockPayment] Purchase failed!');
    }
    
    return success;
  }

  async restorePurchases(): Promise<boolean> {
    console.log('[MockPayment] Restoring purchases...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }

  async checkSubscriptionStatus(): Promise<SubscriptionInfo> {
    // This will be overridden by actual Supabase data
    return {
      isPro: false,
      tier: 'free',
      status: 'active',
      currentPeriodEnd: null,
    };
  }
}

/**
 * Singleton Payment Service
 * Can be easily swapped with real providers (Stripe, RevenueCat, etc.)
 */
class PaymentService {
  private static instance: PaymentService;
  private provider: PaymentProvider;

  private constructor() {
    // Default to mock provider
    this.provider = new MockPaymentProvider();
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  setProvider(provider: PaymentProvider) {
    this.provider = provider;
  }

  async initialize() {
    return this.provider.initialize();
  }

  async purchase(productId: SubscriptionTier) {
    return this.provider.purchase(productId);
  }

  async restorePurchases() {
    return this.provider.restorePurchases();
  }

  async checkSubscriptionStatus() {
    return this.provider.checkSubscriptionStatus();
  }
}

export const paymentService = PaymentService.getInstance();
