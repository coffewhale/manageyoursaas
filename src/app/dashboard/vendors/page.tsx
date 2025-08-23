'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { VendorDialog } from '@/components/vendors/vendor-dialog'
import { Plus, Search, Globe, Mail, Phone, MoreHorizontal, Building2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

interface Vendor {
  id: string
  name: string
  website?: string
  contact_email?: string
  contact_phone?: string
  category: string
  status: 'active' | 'inactive' | 'trial'
  description?: string
  subscriptions_count: number
  total_cost: number
}

interface VendorData {
  id: string
  name: string
  website?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  status: 'active' | 'inactive' | 'trial'
  description?: string | null
  categories?: { name: string } | null
}

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchVendors = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()
        
      if (profileError || !(profile as { organization_id: string })?.organization_id) return
      
      const { data: vendorsData, error } = await supabase
        .from('vendors')
        .select(`
          id,
          name,
          website,
          contact_email,
          contact_phone,
          status,
          description,
          categories(name)
        `)
        .eq('organization_id', (profile as { organization_id: string }).organization_id)
        
      if (error) throw error
      
      // Get subscription counts and costs
      const vendorsWithCounts = await Promise.all(
        (vendorsData || []).map(async (vendor: VendorData) => {
          const { data: subscriptions } = await supabase
            .from('subscriptions')
            .select('cost, billing_cycle')
            .eq('vendor_id', vendor.id)
            .eq('status', 'active')
            
          const subscriptions_count = subscriptions?.length || 0
          const total_cost = subscriptions?.reduce((total, sub: { cost: number; billing_cycle: string }) => {
            const monthlyCost = sub.billing_cycle === 'yearly' ? sub.cost / 12 :
                               sub.billing_cycle === 'quarterly' ? sub.cost / 3 :
                               sub.cost
            return total + monthlyCost
          }, 0) || 0
          
          return {
            id: vendor.id,
            name: vendor.name,
            website: vendor.website || undefined,
            contact_email: vendor.contact_email || undefined,
            contact_phone: vendor.contact_phone || undefined,
            category: vendor.categories?.name || 'Uncategorized',
            status: vendor.status,
            description: vendor.description || undefined,
            subscriptions_count,
            total_cost: Math.round(total_cost * 100) / 100
          }
        })
      )
      
      setVendors(vendorsWithCounts)
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Fetch vendors from Supabase
  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])
  
  // Set up real-time subscription
  useEffect(() => {
    if (!user) return
    
    const channel = supabase
      .channel('vendors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendors'
        },
        () => {
          // Refresh vendors when any vendor changes
          fetchVendors()
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchVendors])

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'trial':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setIsDialogOpen(true)
  }

  const handleAddVendor = () => {
    setSelectedVendor(null)
    setIsDialogOpen(true)
  }

  const handleDeleteVendor = async (vendor: Vendor) => {
    if (confirm(`Are you sure you want to delete ${vendor.name}?`)) {
      try {
        const { error } = await supabase
          .from('vendors')
          .delete()
          .eq('id', vendor.id)
          
        if (error) throw error
        
        // Refresh vendors list
        fetchVendors()
      } catch (error) {
        console.error('Error deleting vendor:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-600">Manage your SaaS vendors and their information</p>
        </div>
        <Button onClick={handleAddVendor}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <Card key={vendor.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{vendor.name}</CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {vendor.category}
                    </Badge>
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditVendor(vendor)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>View Subscriptions</DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteVendor(vendor)}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Badge className={getStatusColor(vendor.status)}>
                {vendor.status}
              </Badge>
            </CardHeader>
            <CardContent>
              {vendor.description && (
                <p className="text-sm text-gray-600 mb-4">{vendor.description}</p>
              )}
              
              <div className="space-y-2">
                {vendor.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="mr-2 h-4 w-4" />
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" 
                       className="hover:text-blue-600 truncate">
                      {vendor.website}
                    </a>
                  </div>
                )}
                
                {vendor.contact_email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="mr-2 h-4 w-4" />
                    <a href={`mailto:${vendor.contact_email}`} 
                       className="hover:text-blue-600 truncate">
                      {vendor.contact_email}
                    </a>
                  </div>
                )}
                
                {vendor.contact_phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="mr-2 h-4 w-4" />
                    <a href={`tel:${vendor.contact_phone}`} 
                       className="hover:text-blue-600">
                      {vendor.contact_phone}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subscriptions:</span>
                  <span className="font-medium">{vendor.subscriptions_count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Cost:</span>
                  <span className="font-medium">${vendor.total_cost}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">Loading vendors...</p>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first vendor.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={handleAddVendor}>
                <Plus className="mr-2 h-4 w-4" />
                Add Vendor
              </Button>
            </div>
          )}
        </div>
      ) : null}

      <VendorDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        vendor={selectedVendor}
        onVendorUpdated={fetchVendors}
      />
    </div>
  )
}