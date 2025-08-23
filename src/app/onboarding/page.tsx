'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, User, ArrowRight } from 'lucide-react'

export default function OnboardingPage() {
  const [organizationName, setOrganizationName] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, profile, organization, initializeOrganization } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    // If user already has an organization, redirect to dashboard
    if (organization) {
      router.push('/dashboard')
      return
    }

    // Pre-fill with user data
    if (user.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name)
    } else if (user.email) {
      setFullName(user.email.split('@')[0])
    }
  }, [user, organization, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organizationName.trim()) {
      setError('Organization name is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await initializeOrganization(organizationName.trim(), fullName.trim())
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set up organization')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null // Will redirect to auth
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to SaaS Manager!</CardTitle>
          <CardDescription>
            Let's set up your organization to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationName" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Organization Name *
              </Label>
              <Input
                id="organizationName"
                type="text"
                placeholder="e.g., Acme Corp, My Startup, John's Agency"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
              />
              <p className="text-xs text-gray-600">
                You can always change this later in settings
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                'Setting up...'
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to manage your SaaS subscriptions efficiently
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}