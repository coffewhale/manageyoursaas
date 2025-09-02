import { isMockMode } from './mock-auth'
import { mockAPI } from './mock-data'
import { supabaseService } from './supabase-client'

// Service layer that switches between mock and real API based on mode
export const apiService = {
  // Vendor operations
  async getVendors() {
    if (isMockMode()) {
      return mockAPI.getVendors()
    }
    try {
      const data = await supabaseService.getVendors()
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  },

  async createVendor(vendorData: Record<string, unknown>) {
    console.log('📡 API DEBUG: createVendor called with:', vendorData)
    
    if (isMockMode()) {
      console.log('📡 API DEBUG: Using mock mode')
      return mockAPI.createVendor(vendorData)
    }
    
    console.log('📡 API DEBUG: Using production mode, calling supabaseService')
    try {
      const data = await supabaseService.createVendor(vendorData as Parameters<typeof supabaseService.createVendor>[0])
      console.log('📡 API DEBUG: supabaseService.createVendor success:', data)
      return { data, error: null }
    } catch (error) {
      console.error('📡 API DEBUG: supabaseService.createVendor error:', error)
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  },

  async updateVendor(id: string, vendorData: Record<string, unknown>) {
    if (isMockMode()) {
      return mockAPI.updateVendor(id, vendorData)
    }
    try {
      const data = await supabaseService.updateVendor(id, vendorData as Parameters<typeof supabaseService.updateVendor>[1])
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  },

  async deleteVendor(id: string) {
    if (isMockMode()) {
      return mockAPI.deleteVendor(id)
    }
    try {
      await supabaseService.deleteVendor(id)
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  },

  // Subscription operations
  async getSubscriptions() {
    if (isMockMode()) {
      return mockAPI.getSubscriptions()
    }
    try {
      const data = await supabaseService.getSubscriptions()
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  },

  async createSubscription(subscriptionData: Record<string, unknown>) {
    if (isMockMode()) {
      return mockAPI.createSubscription(subscriptionData)
    }
    try {
      const data = await supabaseService.createSubscription(subscriptionData as Parameters<typeof supabaseService.createSubscription>[0])
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  },

  async updateSubscription(id: string, subscriptionData: Record<string, unknown>) {
    if (isMockMode()) {
      return mockAPI.updateSubscription(id, subscriptionData)
    }
    try {
      const data = await supabaseService.updateSubscription(id, subscriptionData as Parameters<typeof supabaseService.updateSubscription>[1])
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  },

  async deleteSubscription(id: string) {
    if (isMockMode()) {
      return mockAPI.deleteSubscription(id)
    }
    try {
      await supabaseService.deleteSubscription(id)
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  },

  // Document operations
  async getDocuments() {
    if (isMockMode()) {
      return mockAPI.getDocuments()
    }
    try {
      const data = await supabaseService.getDocuments()
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  },

  async uploadDocument(documentData: Record<string, unknown>) {
    if (isMockMode()) {
      return mockAPI.uploadDocument(documentData)
    }
    // For real mode, would need proper file handling
    return { data: null, error: new Error('Document upload not implemented for production yet') }
  },

  async deleteDocument(id: string) {
    if (isMockMode()) {
      return mockAPI.deleteDocument(id)
    }
    try {
      await supabaseService.deleteDocument(id)
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  },

  // Categories - return default categories for now since table might be empty
  async getCategories() {
    if (isMockMode()) {
      return {
        data: [
          { id: '1', name: 'Communication', description: 'Communication tools', color: '#3B82F6' },
          { id: '2', name: 'Development', description: 'Development tools', color: '#10B981' },
          { id: '3', name: 'Design', description: 'Design tools', color: '#F59E0B' },
          { id: '4', name: 'Analytics', description: 'Analytics tools', color: '#EF4444' },
          { id: '5', name: 'Marketing', description: 'Marketing tools', color: '#8B5CF6' }
        ],
        error: null
      }
    }
    
    // For production, return default categories for now
    // TODO: Set up categories table with default data in production
    return {
      data: [
        { id: 'prod-1', name: 'Communication', description: 'Communication tools', color: '#3B82F6' },
        { id: 'prod-2', name: 'Development', description: 'Development tools', color: '#10B981' },
        { id: 'prod-3', name: 'Design', description: 'Design tools', color: '#F59E0B' },
        { id: 'prod-4', name: 'Analytics', description: 'Analytics tools', color: '#EF4444' },
        { id: 'prod-5', name: 'Marketing', description: 'Marketing tools', color: '#8B5CF6' },
        { id: 'prod-6', name: 'Productivity', description: 'Productivity tools', color: '#6366F1' },
        { id: 'prod-7', name: 'Security', description: 'Security tools', color: '#EC4899' },
        { id: 'prod-8', name: 'Other', description: 'Other tools', color: '#6B7280' }
      ],
      error: null
    }
    
    /* 
    // Original database query - uncomment when categories table is populated
    try {
      const data = await supabaseService.getCategories()
      // If no categories exist, return default categories
      if (!data || data.length === 0) {
        return {
          data: [
            { id: 'default-1', name: 'Communication', description: 'Communication tools', color: '#3B82F6' },
            { id: 'default-2', name: 'Development', description: 'Development tools', color: '#10B981' },
            { id: 'default-3', name: 'Design', description: 'Design tools', color: '#F59E0B' },
            { id: 'default-4', name: 'Analytics', description: 'Analytics tools', color: '#EF4444' },
            { id: 'default-5', name: 'Marketing', description: 'Marketing tools', color: '#8B5CF6' },
            { id: 'default-6', name: 'Productivity', description: 'Productivity tools', color: '#6366F1' },
            { id: 'default-7', name: 'Security', description: 'Security tools', color: '#EC4899' }
          ],
          error: null
        }
      }
      return { data, error: null }
    } catch (error) {
      // If categories table doesn't exist, return default categories as fallback
      return {
        data: [
          { id: 'fallback-1', name: 'Communication', description: 'Communication tools', color: '#3B82F6' },
          { id: 'fallback-2', name: 'Development', description: 'Development tools', color: '#10B981' },
          { id: 'fallback-3', name: 'Design', description: 'Design tools', color: '#F59E0B' },
          { id: 'fallback-4', name: 'Analytics', description: 'Analytics tools', color: '#EF4444' },
          { id: 'fallback-5', name: 'Marketing', description: 'Marketing tools', color: '#8B5CF6' },
          { id: 'fallback-6', name: 'Productivity', description: 'Productivity tools', color: '#6366F1' },
          { id: 'fallback-7', name: 'Security', description: 'Security tools', color: '#EC4899' },
          { id: 'fallback-8', name: 'Other', description: 'Other tools', color: '#6B7280' }
        ],
        error: null
      }
    }
    */
  }
}