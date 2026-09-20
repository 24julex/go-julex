/**
 * Go Julex - Super Admin Master Portal
 * Universal Multi-Tenant E-Commerce SaaS TypeScript Definitions
 */

export type TenantStatus = 'active' | 'trialing' | 'free' | 'suspended';
export type BillingInterval = 'month' | '6_months' | 'year';
export type CustomerSegment = 'Purchased once' | 'More than once' | 'Just a viewer';

export interface TenantCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  segment: CustomerSegment;
  ordersCount: number;
  totalSpentINR: number;
  lastOrderDate: string;
  city: string;
}

export interface TenantAdmin {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl?: string;
  lastLogin?: string;
}

export interface TenantFeatures {
  customDomain: boolean;
  whatsappSync: boolean;
  instagramApi: boolean;
  maxProducts: number | string;
  platformFeePercent: number;
  prioritySupport: boolean;
  customSsl: boolean;
  analyticsExport: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  customDomain?: string;
  subdomain: string;
  logoUrl?: string;
  planId: string;
  planName: string;
  billingInterval: BillingInterval;
  status: TenantStatus;
  trialDaysRemaining?: number;
  mrrINR: number;
  arrINR: number;
  gmvINR: number;
  totalOrders: number;
  createdAt: string;
  admin: TenantAdmin;
  customersCount: number;
  category: string;
  city: string;
  state: string;
  riskFactor?: 'low' | 'medium' | 'high';
  lastActiveAt: string;
  onboardingPercent: number;
  features: TenantFeatures;
  customers: TenantCustomer[];
  notes?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  priceINR: number;
  interval: BillingInterval;
  normalizedMRR: number; // Formula: month=P, 6_months=P/6, year=P/12
  trialDays: number;
  isPopular?: boolean;
  subscribersCount: number;
  revenueGeneratedINR: number;
  features: TenantFeatures;
  status: 'active' | 'archived';
  description: string;
  badge?: string;
}

export interface MRRRecord {
  month: string;
  newMrr: number;
  expansionMrr: number;
  contractionMrr: number;
  churnMrr: number;
  netMrr: number;
  endingMrr: number;
  activePaidStores: number;
}

export interface AtRiskSubscription {
  id: string;
  tenantId: string;
  storeName: string;
  adminEmail: string;
  adminPhone: string;
  planName: string;
  amountINR: number;
  reason: string;
  dueDate: string;
  daysRemainingOrOverdue: number;
  paymentMethod: string;
  type: 'past_due' | 'trial_expiring';
  status: 'pending' | 'resolved' | 'dunning';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  adminAvatar: string;
  actionType:
    | 'Impersonation (View as Merchant)'
    | 'Exit Impersonation'
    | 'Tenant Suspended'
    | 'Tenant Activated'
    | 'Plan Edited'
    | 'Plan Created'
    | 'Plan Deleted'
    | 'Broadcast Sent'
    | 'Feature Flag Toggled'
    | 'Price Updated'
    | 'Store Created'
    | 'Tenant Edited'
    | 'Customer Exported'
    | '2FA Configured';
  targetTenantName?: string;
  targetTenantId?: string;
  ipAddress: string;
  reason: string;
  metadata?: Record<string, any>;
}

export interface MerchantUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Store Owner' | 'Store Manager' | 'Inventory Staff';
  associatedStoreId: string;
  associatedStoreName: string;
  isEmailVerified: boolean;
  is2FAEnabled: boolean;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin: string;
  avatarUrl?: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  type: 'System Alert' | 'Maintenance' | 'Feature Update' | 'Billing Reminder';
  targetAudience: 'All Tenants' | 'Active Only' | 'Trialing Only' | 'At-Risk Only';
  channels: ('in_app' | 'email' | 'whatsapp')[];
  sentAt: string;
  sentBy: string;
  deliveredCount: number;
  openRatePercent: number;
  status: 'sent' | 'scheduled' | 'draft';
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  category: 'Infrastructure' | 'Commerce Engine' | 'Security' | 'Growth';
  enabled: boolean;
  rollOutPercentage: number;
  lastModified: string;
  updatedBy: string;
}

export interface FunnelStage {
  stage: string;
  name: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
  description: string;
}

export interface GMVDataPoint {
  date: string;
  gmvINR: number;
  orders: number;
  aovINR: number;
}
