'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, supabaseService, Profile, Organization } from '@/lib/supabase-client'
import { mockAuth, isMockMode } from '@/lib/mock-auth'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  organization: Organization | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, fullName?: string, organizationName?: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  resendConfirmation: (email: string) => Promise<{ error: AuthError | null }>
  initializeOrganization: (orgName: string, userFullName?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isMockMode()) {
      // Handle mock mode
      const initMockSession = async () => {
        const mockSession = mockAuth.getSession()
        const { data } = await mockSession
        
        if (data.session) {
          setSession(data.session as Session)
          setUser(data.session.user as User)
          // Set mock profile and organization
          setProfile({
            id: 'mock-user-id',
            email: data.session.user.email,
            full_name: data.session.user.user_metadata?.full_name || 'Test User',
            avatar_url: null,
            organization_id: 'mock-org-id',
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as Profile)
          setOrganization({
            id: 'mock-org-id',
            name: data.session.user.user_metadata?.organization_name || 'Test Organization',
            description: 'Mock organization for testing',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as Organization)
        }
        setLoading(false)
      }

      initMockSession()
      
      // Listen for mock auth changes
      mockAuth.onAuthStateChange((event, session) => {
        setSession(session as Session)
        setUser(session ? (session as any).user as User : null)
        if (event === 'SIGNED_OUT') {
          setProfile(null)
          setOrganization(null)
        }
      })
      
      return
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      // Load profile if user is authenticated
      if (session?.user) {
        await loadUserProfile(session.user.id)
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Load profile and organization when user signs in
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setProfile(null)
        setOrganization(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const userOrg = await supabaseService.getUserOrganization(userId)
      setProfile(userOrg.profile)
      setOrganization(userOrg.organization)
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const initializeOrganization = async (orgName: string, userFullName?: string) => {
    try {
      if (!user) throw new Error('No user authenticated')
      
      await supabaseService.initializeUserOrganization(orgName, userFullName)
      await loadUserProfile(user.id)
    } catch (error) {
      console.error('Error initializing organization:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    if (isMockMode()) {
      const { error } = await mockAuth.signIn(email, password)
      if (!error && typeof window !== 'undefined') {
        // Store mock session
        const mockSession = {
          user: {
            id: 'mock-user-id',
            email,
            user_metadata: { full_name: 'Test User' }
          }
        }
        localStorage.setItem('mock-session', JSON.stringify(mockSession))
        
        // Manually trigger state updates for mock mode
        setUser(mockSession.user as User)
        setSession(mockSession as Session)
        setProfile({
          id: 'mock-user-id',
          email,
          full_name: 'Test User',
          avatar_url: null,
          organization_id: 'mock-org-id',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Profile)
        setOrganization({
          id: 'mock-org-id',
          name: 'Test Organization',
          description: 'Mock organization for testing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Organization)
      }
      return { error }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName?: string, organizationName?: string) => {
    if (isMockMode()) {
      const { error } = await mockAuth.signUp(email, password, fullName)
      if (!error && typeof window !== 'undefined') {
        // Store mock session
        const mockSession = {
          user: {
            id: 'mock-user-id',
            email,
            user_metadata: { full_name: fullName || '', organization_name: organizationName || '' }
          }
        }
        localStorage.setItem('mock-session', JSON.stringify(mockSession))
      }
      return { error }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          full_name: fullName,
          organization_name: organizationName,
        },
      },
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm`,
    })
    return { error }
  }

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })
    return { error }
  }

  const value = {
    user,
    session,
    profile,
    organization,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendConfirmation,
    initializeOrganization,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}