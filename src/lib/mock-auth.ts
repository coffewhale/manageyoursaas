// Mock authentication for local development when Supabase isn't configured
export const mockAuth = {
  async signUp(email: string, _password: string, fullName?: string) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      data: {
        user: {
          id: 'mock-user-id',
          email,
          user_metadata: { full_name: fullName || '' },
        },
        session: {
          access_token: 'mock-access-token',
          user: {
            id: 'mock-user-id',
            email,
            user_metadata: { full_name: fullName || '' },
          },
        },
      },
      error: null,
    }
  },

  async signIn(email: string, _password: string) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      data: {
        user: {
          id: 'mock-user-id',
          email,
          user_metadata: { full_name: 'Test User' },
        },
        session: {
          access_token: 'mock-access-token',
          user: {
            id: 'mock-user-id',
            email,
            user_metadata: { full_name: 'Test User' },
          },
        },
      },
      error: null,
    }
  },

  async signOut() {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { error: null }
  },

  async resetPassword(_email: string) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { error: null }
  },

  async getSession() {
    if (typeof window !== 'undefined') {
      const mockSession = localStorage.getItem('mock-session')
      if (mockSession) {
        const session = JSON.parse(mockSession)
        return { data: { session }, error: null }
      }
    }
    return { data: { session: null }, error: null }
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    if (typeof window !== 'undefined') {
      const mockSession = localStorage.getItem('mock-session')
      if (mockSession) {
        setTimeout(() => {
          callback('SIGNED_IN', JSON.parse(mockSession))
        }, 100)
      }
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

export const isMockMode = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co'
}