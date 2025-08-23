// Mock data store for local development
// This simulates a database with in-memory storage

// Initial vendor data
export const mockVendors = [
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
    description: 'Code hosting and collaboration platform',
    logo_url: null,
    subscriptions_count: 1,
    total_cost: 84,
  },
  {
    id: '3',
    name: 'Notion Labs',
    website: 'https://notion.so',
    contact_email: 'team@notion.so',
    contact_phone: null,
    status: 'trial' as const,
    category: 'Productivity',
    description: 'All-in-one workspace for notes, docs, and collaboration',
    logo_url: null,
    subscriptions_count: 1,
    total_cost: 0,
  },
]

// Initial subscription data
export const mockSubscriptions = [
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

// Initial documents data
export const mockDocuments = [
  {
    id: '1',
    name: 'Slack Enterprise Agreement.pdf',
    description: 'Annual contract for Slack Enterprise Grid',
    vendor: 'Slack Technologies',
    vendor_id: '1',
    subscription: 'Slack Pro',
    subscription_id: '1',
    file_size: 2458000,
    mime_type: 'application/pdf',
    uploaded_by: 'John Doe',
    created_at: '2024-08-15T10:30:00Z',
    file_path: '/documents/slack-contract-2024.pdf',
  },
  {
    id: '2',
    name: 'GitHub Terms of Service.pdf',
    description: 'GitHub Team plan terms and conditions',
    vendor: 'GitHub',
    vendor_id: '2',
    subscription: 'GitHub Team',
    subscription_id: '2',
    file_size: 1245000,
    mime_type: 'application/pdf',
    uploaded_by: 'Jane Smith',
    created_at: '2024-08-10T14:20:00Z',
    file_path: '/documents/github-terms-2024.pdf',
  },
]

// Mock API functions
export const mockAPI = {
  // Vendor operations
  async createVendor(vendorData: Omit<typeof mockVendors[0], 'id' | 'subscriptions_count' | 'total_cost'>) {
    const newVendor = {
      ...vendorData,
      id: Math.random().toString(36).substring(7),
      subscriptions_count: 0,
      total_cost: 0,
    }
    mockVendors.push(newVendor)
    return { data: newVendor, error: null }
  },

  async updateVendor(id: string, vendorData: Partial<typeof mockVendors[0]>) {
    const index = mockVendors.findIndex(v => v.id === id)
    if (index !== -1) {
      mockVendors[index] = { ...mockVendors[index], ...vendorData }
      return { data: mockVendors[index], error: null }
    }
    return { data: null, error: new Error('Vendor not found') }
  },

  async deleteVendor(id: string) {
    const index = mockVendors.findIndex(v => v.id === id)
    if (index !== -1) {
      const deleted = mockVendors.splice(index, 1)[0]
      return { data: deleted, error: null }
    }
    return { data: null, error: new Error('Vendor not found') }
  },

  // Subscription operations
  async createSubscription(subscriptionData: Omit<typeof mockSubscriptions[0], 'id'>) {
    const newSubscription = {
      ...subscriptionData,
      id: Math.random().toString(36).substring(7),
    }
    mockSubscriptions.push(newSubscription)
    return { data: newSubscription, error: null }
  },

  async updateSubscription(id: string, subscriptionData: Partial<typeof mockSubscriptions[0]>) {
    const index = mockSubscriptions.findIndex(s => s.id === id)
    if (index !== -1) {
      mockSubscriptions[index] = { ...mockSubscriptions[index], ...subscriptionData }
      return { data: mockSubscriptions[index], error: null }
    }
    return { data: null, error: new Error('Subscription not found') }
  },

  async deleteSubscription(id: string) {
    const index = mockSubscriptions.findIndex(s => s.id === id)
    if (index !== -1) {
      const deleted = mockSubscriptions.splice(index, 1)[0]
      return { data: deleted, error: null }
    }
    return { data: null, error: new Error('Subscription not found') }
  },

  // Document operations
  async createDocument(documentData: Omit<typeof mockDocuments[0], 'id'>) {
    const newDocument = {
      ...documentData,
      id: Math.random().toString(36).substring(7),
    }
    mockDocuments.push(newDocument)
    return { data: newDocument, error: null }
  },

  async deleteDocument(id: string) {
    const index = mockDocuments.findIndex(d => d.id === id)
    if (index !== -1) {
      const deleted = mockDocuments.splice(index, 1)[0]
      return { data: deleted, error: null }
    }
    return { data: null, error: new Error('Document not found') }
  },
}

// Event emitter for UI updates
type EventCallback = () => void
const eventListeners: { [key: string]: EventCallback[] } = {}

export const mockEvents = {
  on(event: string, callback: EventCallback) {
    if (!eventListeners[event]) {
      eventListeners[event] = []
    }
    eventListeners[event].push(callback)
  },

  off(event: string, callback: EventCallback) {
    if (eventListeners[event]) {
      const index = eventListeners[event].indexOf(callback)
      if (index > -1) {
        eventListeners[event].splice(index, 1)
      }
    }
  },

  emit(event: string) {
    if (eventListeners[event]) {
      eventListeners[event].forEach(callback => callback())
    }
  }
}