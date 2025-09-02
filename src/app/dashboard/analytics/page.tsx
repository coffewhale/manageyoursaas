'use client'

import { CostDashboard } from '@/components/subscriptions/cost-dashboard'
import { RenewalAlerts } from '@/components/subscriptions/renewal-alerts'

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your subscription costs, spending trends, and renewals
          </p>
        </div>
      </div>

      {/* Cost Dashboard */}
      <CostDashboard />

      {/* Renewal Alerts */}
      <RenewalAlerts showActions={true} />
    </div>
  )
}