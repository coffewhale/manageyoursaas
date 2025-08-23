'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SubscriptionDialog } from '@/components/subscriptions/subscription-dialog'
import { Plus, Search, Calendar, DollarSign, Users, MoreHorizontal, AlertTriangle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabaseService } from '@/lib/supabase-client'
import { useAuth } from '@/contexts/auth-context'

// Mock data - will be replaced with Supabase queries
const mockSubscriptions = [
  {
    id: '1',
    name: 'Slack Pro',
    vendor: 'Slack Technologies',
    vendor_id: '1',
    description: 'Team collaboration platform',
    cost: 8.00,
    billing_cycle: 'monthly' as const,
    currency: 'USD',
    start_date: '2024-01-15',
    next_renewal_date: '2024-09-15',
    status: 'active' as const,
    user_seats: 20,
    auto_renew: true,
  },
  {
    id: '2',
    name: 'GitHub Team',
    vendor: 'GitHub',
    vendor_id: '2',
    description: 'Code hosting and collaboration',
    cost: 12.00,
    billing_cycle: 'quarterly' as const,
    currency: 'USD',
    start_date: '2024-02-01',
    next_renewal_date: '2024-09-01',
    status: 'active' as const,
    user_seats: 15,
    auto_renew: true,
  },
  {
    id: '3',
    name: 'Notion Pro',
    vendor: 'Notion Labs',
    vendor_id: '3',
    description: 'All-in-one workspace',
    cost: 8.00,
    billing_cycle: 'monthly' as const,
    currency: 'USD',
    start_date: '2024-08-01',
    next_renewal_date: '2024-09-01',
    status: 'trial' as const,
    user_seats: 10,
    auto_renew: false,
  },
  {
    id: '4',
    name: 'Adobe Creative Cloud',
    vendor: 'Adobe',
    vendor_id: '4',
    description: 'Creative software suite',
    cost: 599.99,
    billing_cycle: 'yearly' as const,
    currency: 'USD',
    start_date: '2023-09-15',
    next_renewal_date: '2024-09-15',
    status: 'active' as const,
    user_seats: 5,
    auto_renew: true,
  },
]

export default function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<typeof mockSubscriptions[0] | null>(null)

  const filteredSubscriptions = mockSubscriptions.filter(subscription =>
    subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      case 'trial':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBillingCycleDisplay = (cycle: string) => {
    switch (cycle) {
      case 'monthly':
        return 'Monthly'
      case 'quarterly':
        return 'Quarterly'
      case 'yearly':
        return 'Yearly'
      default:
        return cycle
    }
  }

  const isRenewalSoon = (renewalDate: string) => {
    const today = new Date()
    const renewal = new Date(renewalDate)
    const diffTime = renewal.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  const handleEditSubscription = (subscription: typeof mockSubscriptions[0]) => {
    setSelectedSubscription(subscription)
    setIsDialogOpen(true)
  }

  const handleAddSubscription = () => {
    setSelectedSubscription(null)
    setIsDialogOpen(true)
  }

  const totalMonthlyCost = filteredSubscriptions
    .filter(s => s.status === 'active')
    .reduce((total, subscription) => {
      let monthlyCost = subscription.cost
      if (subscription.billing_cycle === 'yearly') {
        monthlyCost = subscription.cost / 12
      } else if (subscription.billing_cycle === 'quarterly') {
        monthlyCost = subscription.cost / 3
      }
      return total + (monthlyCost * (subscription.user_seats || 1))
    }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600">Manage your SaaS subscriptions and track costs</p>
        </div>
        <Button onClick={handleAddSubscription}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMonthlyCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Badge variant="default">{filteredSubscriptions.filter(s => s.status === 'active').length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSubscriptions.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSubscriptions.reduce((total, s) => total + (s.user_seats || 0), 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewals Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSubscriptions.filter(s => isRenewalSoon(s.next_renewal_date)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>
            Complete list of your SaaS subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subscription</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Renewal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.name}</div>
                      {subscription.description && (
                        <div className="text-sm text-gray-500">{subscription.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{subscription.vendor}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        ${subscription.cost.toFixed(2)}/{subscription.billing_cycle === 'monthly' ? 'mo' : subscription.billing_cycle === 'yearly' ? 'yr' : 'qtr'}
                      </div>
                      {subscription.user_seats && (
                        <div className="text-sm text-gray-500">per user</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getBillingCycleDisplay(subscription.billing_cycle)}</TableCell>
                  <TableCell>{subscription.user_seats || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {isRenewalSoon(subscription.next_renewal_date) && (
                        <AlertTriangle className="mr-1 h-4 w-4 text-orange-500" />
                      )}
                      <span>{new Date(subscription.next_renewal_date).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditSubscription(subscription)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Renew</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SubscriptionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        subscription={selectedSubscription}
      />
    </div>
  )
}