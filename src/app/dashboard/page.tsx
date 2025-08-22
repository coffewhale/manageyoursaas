'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, DollarSign, Calendar, Building2, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">$2,450</div>
            <p className="text-xs text-muted-foreground">
              +10.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 new this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Across 5 categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
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
            <CardTitle>Recent Subscriptions</CardTitle>
            <CardDescription>Latest SaaS subscriptions added</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Slack Pro', vendor: 'Slack Technologies', cost: '$8/user', status: 'active' },
                { name: 'GitHub Team', vendor: 'GitHub', cost: '$4/user', status: 'active' },
                { name: 'Notion Pro', vendor: 'Notion Labs', cost: '$8/user', status: 'trial' },
              ].map((subscription, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{subscription.name}</p>
                    <p className="text-sm text-gray-600">{subscription.vendor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{subscription.cost}</p>
                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                      {subscription.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Renewals</CardTitle>
            <CardDescription>Subscriptions expiring soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Adobe Creative Cloud', date: '2024-09-15', cost: '$52.99' },
                { name: 'Salesforce Professional', date: '2024-09-22', cost: '$75/user' },
                { name: 'Zoom Pro', date: '2024-09-28', cost: '$14.99/user' },
              ].map((renewal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium">{renewal.name}</p>
                    <p className="text-sm text-gray-600">Due: {renewal.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{renewal.cost}</p>
                    <Badge variant="outline">Renewal Due</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}