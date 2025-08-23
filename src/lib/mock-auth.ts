// Mock authentication for local development when Supabase isn't configured
export const mockAuth = {
  async signUp(email: string, password: string, fullName?: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock successful response
    return {
      data: {
        user: {
          id: 'mock-user-id',
          email,
          user_metadata: {
            full_name: fullName || '',
          },
        },
        session: {
          access_token: 'mock-access-token',
          user: {
            id: 'mock-user-id',
            email,
            user_metadata: {
              full_name: fullName || '',
            },
          },
        },
      },
      error: null,
    }
  },

  async signIn(email: string, _password: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock successful response
    return {
      data: {
        user: {
          id: 'mock-user-id',
          email,
          user_metadata: {
            full_name: 'Test User',
          },
        },
        session: {
          access_token: 'mock-access-token',
          user: {
            id: 'mock-user-id',
            email,
            user_metadata: {
              full_name: 'Test User',
            },
          },
        },
      },
      error: null,
    }
  },

  async signOut() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return { error: null }
  },

  async resetPassword(_email: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { error: null }
  },

  async getSession() {
    // Check if we have a mock session in localStorage
    const mockSession = localStorage.getItem('mock-session')
    if (mockSession) {
      const session = JSON.parse(mockSession)
      return {
        data: { session },
        error: null,
      }
    }
    return {
      data: { session: null },
      error: null,
    }
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    // Set up mock auth state changes
    const mockSession = localStorage.getItem('mock-session')
    if (mockSession) {
      setTimeout(() => {
        callback('SIGNED_IN', JSON.parse(mockSession))
      }, 100)
    }

    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    }
  },
}

// Helper function to check if we're using mock auth
export const isMockMode = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co'
}