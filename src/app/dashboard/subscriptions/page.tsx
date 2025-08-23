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

interface Subscription {
  id: string
  name: string
  vendor_id: string
  description?: string
  cost: number
  currency: string
  billing_cycle: 'monthly' | 'quarterly' | 'yearly'
  user_seats?: number | null
  start_date: string
  next_renewal_date?: string | null
  status: 'active' | 'inactive' | 'trial' | 'cancelled' | 'expired'
  auto_renew?: boolean | null
  vendors?: { name: string; status: string }
}

export default function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchSubscriptions = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const subs = await supabaseService.getSubscriptions()
      setSubscriptions(subs as Subscription[])
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const filteredSubscriptions = subscriptions.filter(subscription =>
    subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.vendors?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setIsDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'trial':
        return 'bg-blue-100 text-blue-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBillingCycleColor = (cycle: string) => {
    switch (cycle) {
      case 'monthly':
        return 'bg-blue-100 text-blue-800'
      case 'quarterly':
        return 'bg-purple-100 text-purple-800'
      case 'yearly':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isRenewalSoon = (nextRenewalDate?: string | null) => {
    if (!nextRenewalDate) return false
    const renewalDate = new Date(nextRenewalDate)
    const today = new Date()
    const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilRenewal <= 30 && daysUntilRenewal > 0
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const calculateMonthlyCost = (cost: number, cycle: string) => {
    switch (cycle) {
      case 'yearly':
        return cost / 12
      case 'quarterly':
        return cost / 3
      default:
        return cost
    }
  }

  const totalMonthlyCost = filteredSubscriptions.reduce((total, sub) => 
    total + calculateMonthlyCost(sub.cost, sub.billing_cycle), 0
  )

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage and track all your SaaS subscriptions
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedSubscription(null)
            setIsDialogOpen(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Subscription
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSubscriptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMonthlyCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSubscriptions.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewals This Month</CardTitle>
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
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search subscriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>
            A complete list of all your active and inactive subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading subscriptions...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Next Renewal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.name}</div>
                        {subscription.description && (
                          <div className="text-sm text-muted-foreground">
                            {subscription.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{subscription.vendors?.name || 'Unknown'}</TableCell>
                    <TableCell className="font-medium">
                      ${subscription.cost} {subscription.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getBillingCycleColor(subscription.billing_cycle)}>
                        {subscription.billing_cycle}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {subscription.next_renewal_date ? (
                        <div className="flex items-center gap-2">
                          {isRenewalSoon(subscription.next_renewal_date) && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          {formatDate(subscription.next_renewal_date)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No renewal date</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{subscription.user_seats || 1}</TableCell>
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
          )}
        </CardContent>
      </Card>

      {/* Subscription Dialog */}
      <SubscriptionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        subscription={selectedSubscription}
        onSubscriptionUpdated={fetchSubscriptions}
      />
    </div>
  )
}