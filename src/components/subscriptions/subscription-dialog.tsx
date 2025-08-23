'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { supabaseService, supabase } from '@/lib/supabase-client'
import { useAuth } from '@/contexts/auth-context'

interface Subscription {
  id?: string
  name: string
  vendor_id: string
  description?: string
  cost: number
  billing_cycle: 'monthly' | 'quarterly' | 'yearly'
  currency: string
  start_date: string
  next_renewal_date?: string | null
  status: 'active' | 'inactive' | 'trial' | 'cancelled' | 'expired'
  user_seats?: number | null
  auto_renew?: boolean | null
}

interface Vendor {
  id: string
  name: string
  status: string
}

interface SubscriptionDialogProps {
  isOpen: boolean
  onClose: () => void
  subscription?: Subscription | null
  onSubscriptionUpdated?: () => void
}

export function SubscriptionDialog({ isOpen, onClose, subscription, onSubscriptionUpdated }: SubscriptionDialogProps) {
  const { user } = useAuth()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [formData, setFormData] = useState<Subscription & { next_renewal_date: string; auto_renew: boolean }>({
    name: '',
    vendor_id: '',
    description: '',
    cost: 0,
    billing_cycle: 'monthly',
    currency: 'USD',
    start_date: '',
    next_renewal_date: '',
    status: 'active',
    user_seats: 1,
    auto_renew: true,
  })
  const [loading, setLoading] = useState(false)
  const [vendorsLoading, setVendorsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!subscription

  // Fetch vendors on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      if (!user) return
      
      try {
        setVendorsLoading(true)
        const { data: vendorsData, error } = await supabase
          .from('vendors')
          .select('id, name, status')
          .eq('status', 'active')
          .order('name')
        
        if (error) throw error
        setVendors(vendorsData || [])
      } catch (error) {
        console.error('Error fetching vendors:', error)
      } finally {
        setVendorsLoading(false)
      }
    }
    
    fetchVendors()
  }, [user])

  useEffect(() => {
    if (subscription) {
      setFormData({
        name: subscription.name,
        vendor_id: subscription.vendor_id,
        description: subscription.description || '',
        cost: subscription.cost,
        billing_cycle: subscription.billing_cycle,
        currency: subscription.currency,
        start_date: subscription.start_date,
        next_renewal_date: subscription.next_renewal_date || '',
        status: subscription.status,
        user_seats: subscription.user_seats || 1,
        auto_renew: subscription.auto_renew ?? true,
      })
    } else {
      const today = new Date().toISOString().split('T')[0]
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const nextMonthDate = nextMonth.toISOString().split('T')[0]
      
      setFormData({
        name: '',
        vendor_id: '',
        description: '',
        cost: 0,
        billing_cycle: 'monthly',
        currency: 'USD',
        start_date: today,
        next_renewal_date: nextMonthDate,
        status: 'active',
        user_seats: 1,
        auto_renew: true,
      })
    }
    setError(null)
  }, [subscription, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEditing) {
        await supabaseService.updateSubscription(subscription.id!, {
          name: formData.name,
          vendor_id: formData.vendor_id,
          description: formData.description || null,
          cost: formData.cost,
          billing_cycle: formData.billing_cycle,
          currency: formData.currency,
          start_date: formData.start_date,
          next_renewal_date: formData.next_renewal_date,
          status: formData.status,
          user_seats: formData.user_seats || null,
          auto_renew: formData.auto_renew
        })
      } else {
        await supabaseService.createSubscription({
          name: formData.name,
          vendor_id: formData.vendor_id,
          description: formData.description || null,
          cost: formData.cost,
          billing_cycle: formData.billing_cycle,
          currency: formData.currency,
          start_date: formData.start_date,
          next_renewal_date: formData.next_renewal_date,
          status: formData.status,
          user_seats: formData.user_seats || null,
          auto_renew: formData.auto_renew
        })
      }
      
      onSubscriptionUpdated?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Subscription, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateNextRenewal = (startDate: string, billingCycle: string) => {
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

  useEffect(() => {
    if (formData.start_date && formData.billing_cycle) {
      const nextRenewal = calculateNextRenewal(formData.start_date, formData.billing_cycle)
      setFormData(prev => ({
        ...prev,
        next_renewal_date: nextRenewal
      }))
    }
  }, [formData.start_date, formData.billing_cycle])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Subscription' : 'Add New Subscription'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the subscription information below.' 
              : 'Add a new SaaS subscription to track costs and renewals.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subscription Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Slack Pro Plan"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor *</Label>
              <Select value={formData.vendor_id} onValueChange={(value) => handleChange('vendor_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendorsLoading ? (
                    <SelectItem value="loading" disabled>Loading vendors...</SelectItem>
                  ) : (
                    vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of the subscription..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billing_cycle">Billing Cycle *</Label>
              <Select value={formData.billing_cycle} onValueChange={(value) => handleChange('billing_cycle', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="next_renewal_date">Next Renewal Date *</Label>
              <Input
                id="next_renewal_date"
                type="date"
                value={formData.next_renewal_date}
                onChange={(e) => handleChange('next_renewal_date', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user_seats">User Seats</Label>
              <Input
                id="user_seats"
                type="number"
                min="1"
                value={formData.user_seats || ''}
                onChange={(e) => handleChange('user_seats', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="auto_renew"
                checked={formData.auto_renew}
                onCheckedChange={(checked) => handleChange('auto_renew', checked)}
              />
              <Label htmlFor="auto_renew">Auto-renew subscription</Label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Subscription' : 'Add Subscription')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}