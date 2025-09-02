'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  PieChart,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { subscriptionService } from '@/lib/subscription-service'
import { SubscriptionStats, CostBreakdown, formatCurrency } from '@/types/subscription'

interface CostDashboardProps {
  className?: string
}

export function CostDashboard({ className }: CostDashboardProps) {
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsData, costData] = await Promise.all([
        subscriptionService.getSubscriptionStats(),
        subscriptionService.getCostBreakdown()
      ])
      
      setStats(statsData)
      setCostBreakdown(costData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cost data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !stats || !costBreakdown) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              {error || 'Failed to load cost dashboard'}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getTopCategories = (data: Record<string, number>, limit = 5) => {
    return Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
  }

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? (value / total) * 100 : 0
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSubscriptions} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalMonthlyCost)}</div>
            <p className="text-xs text-muted-foreground">
              Avg. {formatCurrency(stats.averageCostPerSubscription)} per subscription
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalYearlyCost)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(costBreakdown.total_annual)} projected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingRenewals.next30Days}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingRenewals.next7Days} this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="teams">By Team</TabsTrigger>
          <TabsTrigger value="vendors">By Vendor</TabsTrigger>
          <TabsTrigger value="billing">By Billing Cycle</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Cost by Team
              </CardTitle>
              <CardDescription>
                Monthly subscription costs broken down by team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTopCategories(costBreakdown.by_team).map(([team, cost]) => (
                  <div key={team} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">{team}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <Progress 
                          value={getPercentage(cost, stats.totalMonthlyCost)} 
                          className="h-2"
                        />
                      </div>
                      <Badge variant="outline">{formatCurrency(cost)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Cost by Vendor
              </CardTitle>
              <CardDescription>
                Monthly subscription costs broken down by vendor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTopCategories(costBreakdown.by_vendor).map(([vendor, cost]) => (
                  <div key={vendor} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">{vendor}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <Progress 
                          value={getPercentage(cost, stats.totalMonthlyCost)} 
                          className="h-2"
                        />
                      </div>
                      <Badge variant="outline">{formatCurrency(cost)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Cost by Billing Cycle
              </CardTitle>
              <CardDescription>
                Subscription costs broken down by billing frequency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTopCategories(costBreakdown.by_billing_cycle).map(([cycle, cost]) => (
                  <div key={cycle} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="font-medium capitalize">{cycle}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <Progress 
                          value={getPercentage(cost, stats.totalMonthlyCost)} 
                          className="h-2"
                        />
                      </div>
                      <Badge variant="outline">{formatCurrency(cost)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>
            Current status distribution of all subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">{status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}