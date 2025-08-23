// Mock data store for local development
// Simplified to avoid TypeScript complexity issues

// Simple mock data arrays
const mockVendors = [
  {
    id: '1',
    name: 'Slack Technologies',
    website: 'https://slack.com',
    contact_email: 'support@slack.com',
    contact_phone: '+1-415-555-0123',
    status: 'active' as const,
    category: 'Communication',
    description: 'Team collaboration and messaging platform',
    logo_url: null,
    subscriptions_count: 2,
    total_cost: 160,
  },
  {
    id: '2',
    name: 'GitHub',
    website: 'https://github.com',
    contact_email: 'support@github.com',
    contact_phone: null,
    status: 'active' as const,
    category: 'Development',
    description: 'Code repository and collaboration platform',
    logo_url: null,
    subscriptions_count: 1,
    total_cost: 120,
  },
  {
    id: '3',
    name: 'Figma',
    website: 'https://figma.com',
    contact_email: 'hello@figma.com',
    contact_phone: null,
    status: 'trial' as const,
    category: 'Design',
    description: 'Collaborative design tool',
    logo_url: null,
    subscriptions_count: 1,
    total_cost: 45,
  },
]

const mockSubscriptions = [
  {
    id: '1',
    name: 'Slack Pro',
    vendor: 'Slack Technologies',
    vendor_id: '1',
    description: 'Professional team collaboration',
    cost: 80,
    billing_cycle: 'monthly' as const,
    currency: 'USD',
    start_date: '2024-01-15',
    next_renewal_date: '2024-12-15',
    status: 'active' as const,
    user_seats: 10,
    auto_renew: true,
  },
  {
    id: '2',
    name: 'GitHub Team',
    vendor: 'GitHub',
    vendor_id: '2',
    description: 'Team plan for private repositories',
    cost: 120,
    billing_cycle: 'monthly' as const,
    currency: 'USD',
    start_date: '2024-02-01',
    next_renewal_date: '2024-12-01',
    status: 'active' as const,
    user_seats: 5,
    auto_renew: true,
  },
  {
    id: '3',
    name: 'Figma Professional',
    vendor: 'Figma',
    vendor_id: '3',
    description: 'Professional design tools',
    cost: 45,
    billing_cycle: 'monthly' as const,
    currency: 'USD',
    start_date: '2024-03-01',
    next_renewal_date: '2024-04-01',
    status: 'trial' as const,
    user_seats: 3,
    auto_renew: false,
  },
]

const mockDocuments = [
  {
    id: '1',
    name: 'Slack Contract 2024',
    vendor_id: '1',
    type: 'contract' as const,
    file_path: '/documents/slack-contract-2024.pdf',
    file_size: 1024000,
    upload_date: '2024-01-15',
    uploaded_by: 'admin@company.com',
  },
  {
    id: '2',
    name: 'GitHub Terms Update',
    vendor_id: '2',
    type: 'amendment' as const,
    file_path: '/documents/github-terms-update.pdf',
    file_size: 512000,
    upload_date: '2024-02-20',
    uploaded_by: 'admin@company.com',
  },
]

// Simplified mock API - just returns data without complex type operations
export const mockAPI = {
  // Vendor operations
  async getVendors() {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { data: mockVendors, error: null }
  },

  async createVendor(vendorData: Record<string, unknown>) {
    await new Promise(resolve => setTimeout(resolve, 800))
    const newVendor = {
      ...vendorData,
      id: Math.random().toString(36).substring(7),
      subscriptions_count: 0,
      total_cost: 0,
    }
    return { data: newVendor, error: null }
  },

  async updateVendor(id: string, vendorData: Record<string, unknown>) {
    await new Promise(resolve => setTimeout(resolve, 600))
    const vendor = mockVendors.find(v => v.id === id)
    if (vendor) {
      const updated = { ...vendor, ...vendorData }
      return { data: updated, error: null }
    }
    return { data: null, error: new Error('Vendor not found') }
  },

  async deleteVendor(_id: string) {
    await new Promise(resolve => setTimeout(resolve, 400))
    return { data: null, error: null }
  },

  // Subscription operations
  async getSubscriptions() {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { data: mockSubscriptions, error: null }
  },

  async createSubscription(subscriptionData: Record<string, unknown>) {
    await new Promise(resolve => setTimeout(resolve, 800))
    const newSubscription = {
      ...subscriptionData,
      id: Math.random().toString(36).substring(7),
    }
    return { data: newSubscription, error: null }
  },

  async updateSubscription(id: string, subscriptionData: Record<string, unknown>) {
    await new Promise(resolve => setTimeout(resolve, 600))
    const subscription = mockSubscriptions.find(s => s.id === id)
    if (subscription) {
      const updated = { ...subscription, ...subscriptionData }
      return { data: updated, error: null }
    }
    return { data: null, error: new Error('Subscription not found') }
  },

  async deleteSubscription(_id: string) {
    await new Promise(resolve => setTimeout(resolve, 400))
    return { data: null, error: null }
  },

  // Document operations
  async getDocuments() {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { data: mockDocuments, error: null }
  },

  async uploadDocument(documentData: Record<string, unknown>) {
    await new Promise(resolve => setTimeout(resolve, 1200))
    const newDocument = {
      ...documentData,
      id: Math.random().toString(36).substring(7),
      upload_date: new Date().toISOString().split('T')[0],
    }
    return { data: newDocument, error: null }
  },

  async deleteDocument(_id: string) {
    await new Promise(resolve => setTimeout(resolve, 400))
    return { data: null, error: null }
  },
}

// Export static data for components that just need to display mock data
export { mockVendors, mockSubscriptions, mockDocuments }