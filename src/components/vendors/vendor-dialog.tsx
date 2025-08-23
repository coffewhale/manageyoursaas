'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

interface Vendor {
  id?: string
  name: string
  website?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  status: 'active' | 'inactive' | 'trial'
  category?: string
  description?: string | null
  logo_url?: string | null
  subscriptions_count?: number
  total_cost?: number
}

interface VendorFormData {
  name: string
  website: string
  contact_email: string
  contact_phone: string
  status: 'active' | 'inactive' | 'trial'
  category: string
  description: string
}

interface VendorDialogProps {
  isOpen: boolean
  onClose: () => void
  vendor?: Vendor | null
}


export function VendorDialog({ isOpen, onClose, vendor, onVendorUpdated }: VendorDialogProps & { onVendorUpdated?: () => void }) {
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    status: 'active',
    category: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const { user } = useAuth()

  const isEditing = !!vendor

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')
      setCategories(data || [])
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        website: vendor.website || '',
        contact_email: vendor.contact_email || '',
        contact_phone: vendor.contact_phone || '',
        status: vendor.status,
        category: vendor.category || '',
        description: vendor.description || '',
      })
    } else {
      setFormData({
        name: '',
        website: '',
        contact_email: '',
        contact_phone: '',
        status: 'active',
        category: '',
        description: '',
      })
    }
    setError(null)
  }, [vendor, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user) throw new Error('User not authenticated')
      
      // Get user's organization_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()
        
      // If user doesn't have an organization, create one automatically
      if (!(profile as unknown as { organization_id: string })?.organization_id) {
        try {
          const { data, error } = await supabase.rpc('initialize_user_organization', {
            org_name: 'My Organization',
            user_full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          })
          
          if (error) throw error
          
          // Refresh profile data
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()
            
          if (!(updatedProfile as unknown as { organization_id: string })?.organization_id) {
            throw new Error('Failed to create organization')
          }
          
          // Use the updated profile
          profile.organization_id = updatedProfile.organization_id
        } catch (initError) {
          throw new Error(`Failed to initialize organization: ${initError.message}`)
        }
      }
      
      // Find category ID
      const category = categories.find(c => c.name === formData.category)
      
      const vendorData = {
        name: formData.name,
        website: formData.website || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        status: formData.status,
        category_id: category?.id || null,
        description: formData.description || null,
        organization_id: (profile as unknown as { organization_id: string }).organization_id
      }

      if (isEditing && vendor?.id) {
        const { error } = await supabase
          .from('vendors')
          .update(vendorData as any)
          .eq('id', vendor.id)
          
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('vendors')
          .insert([vendorData as any])
          
        if (error) throw error
      }
      
      // Notify parent component to refresh data
      onVendorUpdated?.()
      
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof VendorFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the vendor information below.' 
              : 'Add a new SaaS vendor to your system.'
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
              <Label htmlFor="name">Vendor Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Slack Technologies"
                required
              />
            </div>
            
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
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="support@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                placeholder="+1-555-123-4567"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of the vendor and their services..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Vendor' : 'Add Vendor')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}