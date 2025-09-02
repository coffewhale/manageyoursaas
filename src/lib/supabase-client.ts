// Enhanced Supabase client with data operations
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Types for easier use
export type Vendor = Database['public']['Tables']['vendors']['Row']
export type VendorInsert = Database['public']['Tables']['vendors']['Insert'] 
export type VendorUpdate = Database['public']['Tables']['vendors']['Update']

export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

export type Organization = Database['public']['Tables']['organizations']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type Renewal = Database['public']['Tables']['renewals']['Row']

// Data access layer
export const supabaseService = {
  // Organization operations
  async getUserOrganization(userId: string) {
    // First get the user's profile with just the organization_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, organization_id')
      .eq('id', userId)
      .single()

    if (profileError) throw profileError

    // If no organization_id, return profile with null organization
    if (!profile.organization_id) {
      return { profile, organization: null }
    }

    // Get the organization separately
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single()

    if (orgError) {
      // If organization query fails, still return profile but with null organization
      console.warn('Failed to fetch organization:', orgError)
      return { profile, organization: null }
    }

    return { profile, organization }
  },

  async initializeUserOrganization(orgName: string, userFullName?: string) {
    const { data, error } = await supabase.rpc('initialize_user_organization', {
      org_name: orgName,
      user_full_name: userFullName
    })

    if (error) throw error
    return data
  },

  // Vendor operations
  async getVendors() {
    // Get current user - use user.id as organization_id to avoid RLS recursion
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Query vendors for this user's organization (using user.id as org_id temporarily)
    const { data, error } = await supabase
      .from('vendors')
      .select(`
        id,
        name,
        website,
        contact_email,
        contact_phone,
        status,
        category_id,
        description,
        logo_url,
        organization_id,
        created_at,
        updated_at,
        subscriptions (
          id,
          cost,
          status
        )
      `)
      .eq('organization_id', user.id)
      .order('name')

    if (error) throw error
    
    // Calculate subscription counts and total costs client-side
    const vendorsWithStats = (data || []).map(vendor => ({
      ...vendor,
      category: 'Uncategorized', // Skip categories join to avoid potential RLS issues
      subscriptions_count: vendor.subscriptions?.length || 0,
      total_cost: vendor.subscriptions?.reduce((sum: number, sub: any) => {
        return sub.status === 'active' ? sum + (sub.cost || 0) : sum
      }, 0) || 0
    }))
    
    return vendorsWithStats
  },

  async getVendor(id: string) {
    const { data, error } = await supabase
      .from('vendors')
      .select(`
        *,
        categories (name, color),
        subscriptions (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createVendor(vendor: Omit<VendorInsert, 'id' | 'organization_id' | 'created_at' | 'updated_at'>) {
    // Get user's organization ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const userOrg = await this.getUserOrganization(user.id)
    const orgId = userOrg.organization?.id || userOrg.profile.organization_id
    
    if (!orgId) {
      throw new Error('User has no organization. Please complete organization setup.')
    }

    const { data, error } = await supabase
      .from('vendors')
      .insert({
        ...vendor,
        organization_id: orgId
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateVendor(id: string, updates: VendorUpdate) {
    const { data, error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteVendor(id: string) {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Subscription operations
  async getSubscriptions() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        vendors (name, status)
      `)
      .order('next_renewal_date', { nullsFirst: false })

    if (error) throw error
    return data || []
  },

  async getSubscription(id: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        vendors (name, status),
        renewals (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createSubscription(subscription: Omit<SubscriptionInsert, 'id' | 'organization_id' | 'created_at' | 'updated_at'>) {
    // Get user's organization ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const userOrg = await this.getUserOrganization(user.id)
    const orgId = userOrg.organization?.id || userOrg.profile.organization_id
    
    if (!orgId) {
      throw new Error('User has no organization. Please complete organization setup.')
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        ...subscription,
        organization_id: orgId
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateSubscription(id: string, updates: SubscriptionUpdate) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteSubscription(id: string) {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Category operations
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  },

  async createCategory(name: string, description?: string, color?: string) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, description, color })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Document operations
  async getDocuments(vendorId?: string) {
    let query = supabase
      .from('documents')
      .select(`
        *,
        vendors (name),
        profiles (full_name)
      `)
      .order('created_at', { ascending: false })

    if (vendorId) {
      query = query.eq('vendor_id', vendorId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async uploadDocument(file: File, vendorId: string, type: string, description?: string) {
    // Get user's organization ID first
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const userOrg = await this.getUserOrganization(user.id)
    const orgId = userOrg.organization?.id
    if (!orgId) throw new Error('User has no organization')

    // Create file path: org-id/vendor-contracts/filename
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `${orgId}/vendor-contracts/${fileName}`

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Create document record in database
    const { data, error } = await supabase
      .from('documents')
      .insert({
        name: file.name,
        description,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        type: type as Database['public']['Enums']['document_type'],
        vendor_id: vendorId,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteDocument(id: string) {
    // Get document info first to delete from storage
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([doc.file_path])

    if (storageError) console.warn('Failed to delete file from storage:', storageError)

    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Dashboard/Analytics operations
  async getOrganizationSpending() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const userOrg = await this.getUserOrganization(user.id)
    const orgId = userOrg.organization?.id
    if (!orgId) throw new Error('User has no organization')

    const { data, error } = await supabase.rpc('get_organization_spending', {
      org_id: orgId
    })

    if (error) throw error
    return data[0] || { total_monthly_cost: 0, total_yearly_cost: 0, active_subscriptions: 0, total_vendors: 0 }
  },

  async getUpcomingRenewals() {
    const { data, error } = await supabase
      .from('upcoming_renewals')
      .select('*')
      .limit(10)

    if (error) throw error
    return data || []
  },

  // Activity logs
  async logActivity(action: string, resourceType: string, resourceId?: string, details?: Record<string, unknown>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return // Don't throw error, just skip logging

    try {
      const userOrg = await this.getUserOrganization(user.id)
      const orgId = userOrg.organization?.id
      if (!orgId) return

      await supabase
        .from('activity_logs')
        .insert({
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          user_id: user.id,
          organization_id: orgId
        })
    } catch (error) {
      console.warn('Failed to log activity:', error)
    }
  }
}

// Export the main supabase client as well
export default supabase