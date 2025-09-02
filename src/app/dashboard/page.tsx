'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, DollarSign, Calendar, Building2, CreditCard, Zap, Users, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { apiService } from '@/lib/api-service'

interface DashboardStats {
  totalMonthlyCost: number
  activeSubscriptions: number
  vendorCount: number
  upcomingRenewals: number
}

interface Vendor {
  id: string
  name: string
  subscriptions_count: number
  total_cost: number
}

export default function DashboardPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalMonthlyCost: 0,
    activeSubscriptions: 0,
    vendorCount: 0,
    upcomingRenewals: 0
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchDashboardData = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const { data: vendorsData, error } = await apiService.getVendors()
      
      if (error) throw error
      
      setVendors(vendorsData || [])
      
      // Calculate stats from real data
      const totalCost = vendorsData?.reduce((sum, vendor) => sum + vendor.total_cost, 0) || 0
      const totalSubscriptions = vendorsData?.reduce((sum, vendor) => sum + vendor.subscriptions_count, 0) || 0
      
      setStats({
        totalMonthlyCost: totalCost,
        activeSubscriptions: totalSubscriptions,
        vendorCount: vendorsData?.length || 0,
        upcomingRenewals: 0 // TODO: Calculate from subscriptions data
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Show onboarding for new users
  if (!loading && vendors.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ManageSaaSVendors!</h1>
          <p className="text-gray-600 text-lg">Let's get you started by adding your first SaaS vendor</p>
        </div>

        {/* Onboarding Cards */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Add Your First Vendor</CardTitle>
              <CardDescription className="text-base">
                Start by adding a SaaS vendor you're currently using. This could be any software service your organization subscribes to.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <Button size="lg" asChild className="mb-6">
                <Link href="/dashboard/vendors">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Your First Vendor
                </Link>
              </Button>
              
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Track Vendors</h3>
                  <p className="text-sm text-gray-600">Manage all your SaaS vendors in one place</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Monitor Costs</h3>
                  <p className="text-sm text-gray-600">Keep track of subscription costs and renewals</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Never Miss Renewals</h3>
                  <p className="text-sm text-gray-600">Get notified before renewals and avoid surprise charges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Steps */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-center mb-6">Quick Start Guide</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-white border rounded-lg shadow-sm">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Add Your First Vendor</h3>
                <p className="text-sm text-gray-600">Start with a vendor you already use (like Slack, Google Workspace, etc.)</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                <span className="text-gray-500 font-semibold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-500">Add Subscriptions</h3>
                <p className="text-sm text-gray-400">Track individual subscriptions and their costs</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                <span className="text-gray-500 font-semibold">3</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-500">Monitor Your Dashboard</h3>
                <p className="text-sm text-gray-400">View costs, renewals, and insights all in one place</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your SaaS subscriptions and costs</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/vendors">
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${loading ? '--' : stats.totalMonthlyCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalMonthlyCost === 0 ? 'Add vendors to track costs' : 'Total monthly subscription costs'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '--' : stats.activeSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSubscriptions === 0 ? 'No subscriptions tracked yet' : 'Active subscriptions'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '--' : stats.vendorCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.vendorCount === 0 ? 'Add your first vendor' : 'Total vendors managed'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '--' : stats.upcomingRenewals}
            </div>
            <p className="text-xs text-muted-foreground">
              In the next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Vendors</CardTitle>
            <CardDescription>SaaS vendors you're currently managing</CardDescription>
          </CardHeader>
          <CardContent>
            {vendors.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-500">No vendors added yet</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/vendors">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Vendor
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {vendors.slice(0, 3).map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{vendor.name}</p>
                      <p className="text-sm text-gray-600">{vendor.subscriptions_count} subscription{vendor.subscriptions_count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${vendor.total_cost.toFixed(2)}/month</p>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                ))}
                {vendors.length > 3 && (
                  <div className="text-center pt-4">
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/dashboard/vendors">
                        View all {vendors.length} vendors
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Next steps to optimize your SaaS management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vendors.length === 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">Add your first vendor</p>
                      <p className="text-sm text-blue-700">Start tracking your SaaS subscriptions</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-500">Set renewal reminders</p>
                    <p className="text-sm text-gray-400">Never miss a subscription renewal</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-500">Track costs</p>
                    <p className="text-sm text-gray-400">Monitor your SaaS spending</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}