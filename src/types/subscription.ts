import { Database } from './database'

// Enhanced subscription types with computed fields and helpers
export type BaseSubscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

export interface EnhancedSubscription extends BaseSubscription {
  vendor_name?: string
  vendor_status?: string
  days_until_renewal?: number
  monthly_cost?: number
  yearly_cost?: number
  cost_per_seat?: number
  renewal_urgency?: 'overdue' | 'urgent' | 'soon' | 'normal'
  vendors?: {
    id: string
    name: string
    status: string
  }
}

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly'
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'cancelled' | 'expired'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'JPY' | 'AUD'

export interface SubscriptionFilters {
  vendor?: string
  team?: string
  status?: SubscriptionStatus
  renewalPeriod?: 'next_7_days' | 'next_30_days' | 'next_60_days' | 'next_90_days' | 'next_365_days'
  billingCycle?: BillingCycle
  costRange?: {
    min?: number
    max?: number
  }
}

export interface SubscriptionStats {
  totalSubscriptions: number
  activeSubscriptions: number
  totalMonthlyCost: number
  totalYearlyCost: number
  averageCostPerSubscription: number
  upcomingRenewals: {
    next7Days: number
    next30Days: number
    next90Days: number
  }
  byStatus: Record<SubscriptionStatus, number>
  byBillingCycle: Record<BillingCycle, number>
  costByTeam: Record<string, number>
  costByVendor: Record<string, number>
}

export interface RenewalAlert {
  id: string
  subscription_id: string
  subscription_name: string
  vendor_name: string
  cost: number
  currency: string
  renewal_date: string
  days_until_renewal: number
  urgency: 'overdue' | 'urgent' | 'soon'
  auto_renew: boolean
}

export interface CostBreakdown {
  monthly: number
  quarterly: number
  yearly: number
  total_annual: number
  by_team: Record<string, number>
  by_vendor: Record<string, number>
  by_billing_cycle: Record<BillingCycle, number>
}

// Utility functions
export const calculateMonthlyCost = (cost: number, billingCycle: BillingCycle): number => {
  switch (billingCycle) {
    case 'monthly':
      return cost
    case 'quarterly':
      return cost / 3
    case 'yearly':
      return cost / 12
    default:
      return cost
  }
}

export const calculateYearlyCost = (cost: number, billingCycle: BillingCycle): number => {
  switch (billingCycle) {
    case 'monthly':
      return cost * 12
    case 'quarterly':
      return cost * 4
    case 'yearly':
      return cost
    default:
      return cost * 12
  }
}

export const calculateCostPerSeat = (cost: number, seats: number | null): number => {
  if (!seats || seats <= 0) return cost
  return cost / seats
}

export const getDaysUntilRenewal = (renewalDate: string): number => {
  const renewal = new Date(renewalDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  renewal.setHours(0, 0, 0, 0)
  
  const diffTime = renewal.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const getRenewalUrgency = (daysUntilRenewal: number): 'overdue' | 'urgent' | 'soon' | 'normal' => {
  if (daysUntilRenewal < 0) return 'overdue'
  if (daysUntilRenewal <= 7) return 'urgent'
  if (daysUntilRenewal <= 30) return 'soon'
  return 'normal'
}

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const getBillingCycleLabel = (cycle: BillingCycle): string => {
  const labels: Record<BillingCycle, string> = {
    monthly: 'Monthly',
    quarterly: 'Quarterly', 
    yearly: 'Yearly'
  }
  return labels[cycle]
}

export const getStatusLabel = (status: SubscriptionStatus): string => {
  const labels: Record<SubscriptionStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    trial: 'Trial',
    cancelled: 'Cancelled',
    expired: 'Expired'
  }
  return labels[status]
}

export const getNextRenewalDate = (startDate: string, billingCycle: BillingCycle): string => {
  const start = new Date(startDate)
  const next = new Date(start)
  
  switch (billingCycle) {
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'quarterly':
      next.setMonth(next.getMonth() + 3)
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      break
  }
  
  return next.toISOString().split('T')[0]
}

// Validation helpers
export const validateSubscription = (data: Partial<SubscriptionInsert>): string[] => {
  const errors: string[] = []
  
  if (!data.name?.trim()) {
    errors.push('Subscription name is required')
  }
  
  if (!data.vendor_id) {
    errors.push('Vendor selection is required')
  }
  
  if (!data.cost || data.cost <= 0) {
    errors.push('Cost must be greater than 0')
  }
  
  if (!data.billing_cycle) {
    errors.push('Billing cycle is required')
  }
  
  if (!data.start_date) {
    errors.push('Start date is required')
  }
  
  if (!data.next_renewal_date) {
    errors.push('Next renewal date is required')
  }
  
  if (data.user_seats && data.user_seats <= 0) {
    errors.push('User seats must be greater than 0')
  }
  
  return errors
}