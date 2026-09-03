/**
 * Go Julex - Multi-Tenant E-Commerce SaaS for Jewelry Brands
 * TypeScript Definitions for Merchant Admin Dashboard
 */

export interface StoreInfo {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  status: 'active' | 'trial' | 'suspended';
  trialDaysRemaining?: number;
  tier: 'Starter 6-Mo' | 'Growth 1-Yr' | 'Artisan Enterprise';
  platformFeePercent: number; // 0%
  currency: 'INR';
  logoUrl?: string;
  ownerName: string;
  ownerEmail: string;
  is2FAEnabled: boolean;
}

export interface KPIMetrics {
  todaySalesINR: number;
  todaySalesChangePercent: number;
  totalOrdersCount: number;
  unfulfilledOrdersCount: number;
  lowStockItemsCount: number;
  totalCustomersCount: number;
  newCustomersCount: number;
  returningCustomersCount: number;
  monthlyRevenueINR: number;
  retainedProfitINR: number;
  feesSavedINR: number;
}

export type SalesChannelType = 'online_store' | 'whatsapp' | 'meta_shop';

export interface SalesChannelStatus {
  id: string;
  name: string;
  type: SalesChannelType;
  status: 'connected' | 'action_required' | 'disconnected';
  statusLabel: string;
  urlOrHandle: string;
  lastSynced: string;
  features: string[];
}

export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'failed';
export type FulfillmentStatus = 'unfulfilled' | 'processing' | 'dispatched' | 'fulfilled' | 'cancelled';
export type ChannelSource = 'web' | 'whatsapp' | 'instagram';

export interface JewelryOrderItem {
  productId: string;
  name: string;
  sku: string;
  karatOrMetal: string;
  quantity: number;
  priceINR: number;
  imageUrl: string;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  channel: ChannelSource;
  customerName: string;
  customerPhone?: string;
  customerEmail: string;
  productSummary: string;
  items: JewelryOrderItem[];
  totalQuantity: number;
  totalAmountINR: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  createdAt: string;
  shippingCity: string;
}

export interface LowStockJewelry {
  id: string;
  name: string;
  sku: string;
  category: string;
  priceINR: number;
  quantityCount: number;
  threshold: number;
  imageUrl: string;
}

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  actionLabel: string;
  actionHref?: string;
  progress?: {
    current: number;
    target: number;
    unit: string;
  };
}
