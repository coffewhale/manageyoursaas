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
    return { data: await supabaseService.getVendors(), error: null }
  },

  async createVendor(vendorData: Record<string, unknown>) {
    if (isMockMode()) {
      return mockAPI.createVendor(vendorData)
    }
    return { data: await supabaseService.createVendor(vendorData as Parameters<typeof supabaseService.createVendor>[0]), error: null }
  },

  async updateVendor(id: string, vendorData: Record<string, unknown>) {
    if (isMockMode()) {
      return mockAPI.updateVendor(id, vendorData)
    }
    return { data: await supabaseService.updateVendor(id, vendorData as Parameters<typeof supabaseService.updateVendor>[1]), error: null }
  },

  async deleteVendor(id: string) {
    if (isMockMode()) {
      return mockAPI.deleteVendor(id)
    }
    await supabaseService.deleteVendor(id)
    return { data: null, error: null }
  },

  // Subscription operations
  async getSubscriptions() {
    if (isMockMode()) {
      return mockAPI.getSubscriptions()
    }
    return { data: await supabaseService.getSubscriptions(), error: null }
  },

  async createSubscription(subscriptionData: Record<string, unknown>) {
    if (isMockMode()) {
      return mockAPI.createSubscription(subscriptionData)
    }
    return { data: await supabaseService.createSubscription(subscriptionData as Parameters<typeof supabaseService.createSubscription>[0]), error: null }
  },

  async updateSubscription(id: string, subscriptionData: Record<string, unknown>) {
    if (isMockMode()) {
      return mockAPI.updateSubscription(id, subscriptionData)
    }
    return { data: await supabaseService.updateSubscription(id, subscriptionData as Parameters<typeof supabaseService.updateSubscription>[1]), error: null }
  },

  async deleteSubscription(id: string) {
    if (isMockMode()) {
      return mockAPI.deleteSubscription(id)
    }
    await supabaseService.deleteSubscription(id)
    return { data: null, error: null }
  },

  // Document operations
  async getDocuments() {
    if (isMockMode()) {
      return mockAPI.getDocuments()
    }
    return { data: await supabaseService.getDocuments(), error: null }
  },

  async uploadDocument(documentData: Record<string, unknown>) {
    if (isMockMode()) {
      return mockAPI.uploadDocument(documentData)
    }
    // For real mode, would need proper file handling
    throw new Error('Document upload not implemented for production yet')
  },

  async deleteDocument(id: string) {
    if (isMockMode()) {
      return mockAPI.deleteDocument(id)
    }
    await supabaseService.deleteDocument(id)
    return { data: null, error: null }
  },

  // Categories (for mock mode, return static data)
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
    return { data: await supabaseService.getCategories(), error: null }
  }
}