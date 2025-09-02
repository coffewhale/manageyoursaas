import { supabaseService } from './supabase-client'
import { 
  EnhancedSubscription, 
  SubscriptionStats, 
  RenewalAlert, 
  CostBreakdown,
  SubscriptionFilters,
  calculateMonthlyCost,
  calculateYearlyCost,
  getDaysUntilRenewal,
  getRenewalUrgency,
  type SubscriptionInsert,
  type SubscriptionUpdate
} from '@/types/subscription'
import { Database } from '@/types/database'

export class SubscriptionService {
  // Enhanced subscription queries with computed fields
  static async getEnhancedSubscriptions(filters?: SubscriptionFilters): Promise<EnhancedSubscription[]> {
    const subscriptions = await supabaseService.getSubscriptions()
    
    let enhanced: EnhancedSubscription[] = subscriptions.map(sub => {
      const daysUntilRenewal = sub.next_renewal_date ? getDaysUntilRenewal(sub.next_renewal_date) : null
      
      return {
        ...sub,
        vendor_name: sub.vendors?.name,
        vendor_status: sub.vendors?.status,
        days_until_renewal: daysUntilRenewal,
        monthly_cost: calculateMonthlyCost(sub.cost, sub.billing_cycle),
        yearly_cost: calculateYearlyCost(sub.cost, sub.billing_cycle),
        cost_per_seat: sub.user_seats ? sub.cost / sub.user_seats : sub.cost,
        renewal_urgency: daysUntilRenewal ? getRenewalUrgency(daysUntilRenewal) : 'normal'
      }
    })

    // Apply filters
    if (filters) {
      enhanced = this.applyFilters(enhanced, filters)
    }

    return enhanced
  }

  static async getSubscriptionStats(): Promise<SubscriptionStats> {
    const subscriptions = await this.getEnhancedSubscriptions()
    
    const totalSubscriptions = subscriptions.length
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length
    
    const totalMonthlyCost = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.monthly_cost || 0), 0)
    
    const totalYearlyCost = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.yearly_cost || 0), 0)
    
    const averageCostPerSubscription = activeSubscriptions > 0 ? totalMonthlyCost / activeSubscriptions : 0
    
    // Upcoming renewals
    const upcomingRenewals = {
      next7Days: subscriptions.filter(s => s.days_until_renewal && s.days_until_renewal <= 7 && s.days_until_renewal > 0).length,
      next30Days: subscriptions.filter(s => s.days_until_renewal && s.days_until_renewal <= 30 && s.days_until_renewal > 0).length,
      next90Days: subscriptions.filter(s => s.days_until_renewal && s.days_until_renewal <= 90 && s.days_until_renewal > 0).length,
    }
    
    // Group by status
    const byStatus = subscriptions.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Group by billing cycle
    const byBillingCycle = subscriptions.reduce((acc, s) => {
      acc[s.billing_cycle] = (acc[s.billing_cycle] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Cost by team
    const costByTeam = subscriptions
      .filter(s => s.status === 'active' && s.team)
      .reduce((acc, s) => {
        const team = s.team || 'Unassigned'
        acc[team] = (acc[team] || 0) + (s.monthly_cost || 0)
        return acc
      }, {} as Record<string, number>)
    
    // Cost by vendor
    const costByVendor = subscriptions
      .filter(s => s.status === 'active' && s.vendor_name)
      .reduce((acc, s) => {
        const vendor = s.vendor_name || 'Unknown'
        acc[vendor] = (acc[vendor] || 0) + (s.monthly_cost || 0)
        return acc
      }, {} as Record<string, number>)

    return {
      totalSubscriptions,
      activeSubscriptions,
      totalMonthlyCost,
      totalYearlyCost,
      averageCostPerSubscription,
      upcomingRenewals,
      byStatus: byStatus as any,
      byBillingCycle: byBillingCycle as any,
      costByTeam,
      costByVendor
    }
  }

  static async getRenewalAlerts(): Promise<RenewalAlert[]> {
    const subscriptions = await this.getEnhancedSubscriptions()
    
    return subscriptions
      .filter(s => s.days_until_renewal !== null && s.days_until_renewal <= 30)
      .map(s => ({
        id: s.id,
        subscription_id: s.id,
        subscription_name: s.name,
        vendor_name: s.vendor_name || 'Unknown',
        cost: s.cost,
        currency: s.currency,
        renewal_date: s.next_renewal_date!,
        days_until_renewal: s.days_until_renewal!,
        urgency: s.renewal_urgency as 'overdue' | 'urgent' | 'soon',
        auto_renew: s.auto_renew ?? false
      }))
      .sort((a, b) => a.days_until_renewal - b.days_until_renewal)
  }

  static async getCostBreakdown(): Promise<CostBreakdown> {
    const subscriptions = await this.getEnhancedSubscriptions()
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
    
    const monthly = activeSubscriptions.reduce((sum, s) => sum + (s.monthly_cost || 0), 0)
    const quarterly = activeSubscriptions
      .filter(s => s.billing_cycle === 'quarterly')
      .reduce((sum, s) => sum + s.cost, 0)
    const yearly = activeSubscriptions
      .filter(s => s.billing_cycle === 'yearly')
      .reduce((sum, s) => sum + s.cost, 0)
    
    const total_annual = activeSubscriptions.reduce((sum, s) => sum + (s.yearly_cost || 0), 0)
    
    const by_team = activeSubscriptions.reduce((acc, s) => {
      const team = s.team || 'Unassigned'
      acc[team] = (acc[team] || 0) + (s.monthly_cost || 0)
      return acc
    }, {} as Record<string, number>)
    
    const by_vendor = activeSubscriptions.reduce((acc, s) => {
      const vendor = s.vendor_name || 'Unknown'
      acc[vendor] = (acc[vendor] || 0) + (s.monthly_cost || 0)
      return acc
    }, {} as Record<string, number>)
    
    const by_billing_cycle = activeSubscriptions.reduce((acc, s) => {
      acc[s.billing_cycle] = (acc[s.billing_cycle] || 0) + (s.monthly_cost || 0)
      return acc
    }, {} as Record<string, number>)

    return {
      monthly,
      quarterly,
      yearly,
      total_annual,
      by_team,
      by_vendor,
      by_billing_cycle: by_billing_cycle as any
    }
  }

  // Subscription lifecycle management
  static async renewSubscription(subscriptionId: string, newCost?: number, newRenewalDate?: string): Promise<void> {
    const subscription = await supabaseService.getSubscription(subscriptionId)
    if (!subscription) throw new Error('Subscription not found')

    const currentDate = new Date().toISOString()
    const updates: SubscriptionUpdate = {
      updated_at: currentDate
    }

    if (newCost !== undefined) {
      updates.cost = newCost
    }

    if (newRenewalDate) {
      updates.next_renewal_date = newRenewalDate
    } else {
      // Calculate next renewal date based on billing cycle
      const currentRenewal = new Date(subscription.next_renewal_date)
      const nextRenewal = new Date(currentRenewal)
      
      switch (subscription.billing_cycle) {
        case 'monthly':
          nextRenewal.setMonth(nextRenewal.getMonth() + 1)
          break
        case 'quarterly':
          nextRenewal.setMonth(nextRenewal.getMonth() + 3)
          break
        case 'yearly':
          nextRenewal.setFullYear(nextRenewal.getFullYear() + 1)
          break
      }
      
      updates.next_renewal_date = nextRenewal.toISOString().split('T')[0]
    }

    await supabaseService.updateSubscription(subscriptionId, updates)

    // Log renewal in renewals table if cost changed
    if (newCost !== undefined && newCost !== subscription.cost) {
      await this.logRenewal(subscriptionId, subscription.cost, newCost, subscription.next_renewal_date, updates.next_renewal_date!)
    }
  }

  static async cancelSubscription(subscriptionId: string, effectiveDate?: string): Promise<void> {
    const updates: SubscriptionUpdate = {
      status: 'cancelled',
      auto_renew: false,
      updated_at: new Date().toISOString()
    }

    if (effectiveDate) {
      updates.next_renewal_date = effectiveDate
    }

    await supabaseService.updateSubscription(subscriptionId, updates)
  }

  static async reactivateSubscription(subscriptionId: string, newRenewalDate: string): Promise<void> {
    const updates: SubscriptionUpdate = {
      status: 'active',
      next_renewal_date: newRenewalDate,
      updated_at: new Date().toISOString()
    }

    await supabaseService.updateSubscription(subscriptionId, updates)
  }

  // Bulk operations
  static async bulkUpdateSubscriptions(subscriptionIds: string[], updates: Partial<SubscriptionUpdate>): Promise<void> {
    const promises = subscriptionIds.map(id => 
      supabaseService.updateSubscription(id, { ...updates, updated_at: new Date().toISOString() })
    )
    await Promise.all(promises)
  }

  static async getSubscriptionsByVendor(vendorId: string): Promise<EnhancedSubscription[]> {
    const allSubscriptions = await this.getEnhancedSubscriptions()
    return allSubscriptions.filter(s => s.vendor_id === vendorId)
  }

  static async getSubscriptionsByTeam(team: string): Promise<EnhancedSubscription[]> {
    const allSubscriptions = await this.getEnhancedSubscriptions()
    return allSubscriptions.filter(s => s.team === team)
  }

  // Private helper methods
  private static applyFilters(subscriptions: EnhancedSubscription[], filters: SubscriptionFilters): EnhancedSubscription[] {
    return subscriptions.filter(subscription => {
      // Vendor filter
      if (filters.vendor && subscription.vendor_name !== filters.vendor) {
        return false
      }

      // Team filter
      if (filters.team && subscription.team !== filters.team) {
        return false
      }

      // Status filter
      if (filters.status && subscription.status !== filters.status) {
        return false
      }

      // Billing cycle filter
      if (filters.billingCycle && subscription.billing_cycle !== filters.billingCycle) {
        return false
      }

      // Renewal period filter
      if (filters.renewalPeriod && subscription.days_until_renewal !== null) {
        const days = subscription.days_until_renewal
        switch (filters.renewalPeriod) {
          case 'next_7_days':
            if (days > 7 || days <= 0) return false
            break
          case 'next_30_days':
            if (days > 30 || days <= 0) return false
            break
          case 'next_60_days':
            if (days > 60 || days <= 0) return false
            break
          case 'next_90_days':
            if (days > 90 || days <= 0) return false
            break
          case 'next_365_days':
            if (days > 365 || days <= 0) return false
            break
        }
      }

      // Cost range filter
      if (filters.costRange) {
        const monthlyCost = subscription.monthly_cost || 0
        if (filters.costRange.min && monthlyCost < filters.costRange.min) {
          return false
        }
        if (filters.costRange.max && monthlyCost > filters.costRange.max) {
          return false
        }
      }

      return true
    })
  }

  private static async logRenewal(
    subscriptionId: string,
    previousCost: number,
    newCost: number,
    previousRenewalDate: string,
    newRenewalDate: string
  ): Promise<void> {
    // This would insert into the renewals table
    // Implementation depends on if you want to track renewal history
    console.log('Renewal logged:', {
      subscriptionId,
      previousCost,
      newCost,
      previousRenewalDate,
      newRenewalDate
    })
  }
}

// Export additional utility functions
export const subscriptionService = SubscriptionService