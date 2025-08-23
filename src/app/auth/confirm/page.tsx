'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function ConfirmPageContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token = searchParams.get('token')
        const type = searchParams.get('type')

        if (!token || !type) {
          setStatus('error')
          setMessage('Invalid confirmation link. Please check your email and try again.')
          return
        }

        if (type === 'signup') {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          })

          if (error) {
            setStatus('error')
            setMessage(error.message || 'Failed to confirm email. The link may have expired.')
          } else {
            setStatus('success')
            setMessage('Your email has been confirmed successfully!')
          }
        } else if (type === 'recovery') {
          // Handle password recovery
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          })

          if (error) {
            setStatus('error')
            setMessage(error.message || 'Failed to confirm password reset. The link may have expired.')
          } else {
            setStatus('success')
            setMessage('Password reset confirmed. You can now set a new password.')
          }
        } else {
          setStatus('error')
          setMessage('Invalid confirmation type.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
      }
    }

    confirmEmail()
  }, [searchParams])

  const handleContinue = () => {
    router.push('/onboarding')
  }

  const handleBackToAuth = () => {
    router.push('/auth')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>
          
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Confirming your email...'}
            {status === 'success' && 'Email confirmed!'}
            {status === 'error' && 'Confirmation failed'}
          </CardTitle>
          
          <CardDescription>
            {status === 'loading' && 'Please wait while we verify your email address.'}
            {status === 'success' && 'Your account is now active and ready to use.'}
            {status === 'error' && 'There was a problem confirming your email address.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={status === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          {status === 'success' && (
            <Button onClick={handleContinue} className="w-full">
              Continue to Setup
            </Button>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button onClick={handleBackToAuth} className="w-full">
                Back to Sign In
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Need help?{' '}
                <a href="mailto:support@yourapp.com" className="text-primary hover:underline">
                  Contact support
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <ConfirmPageContent />
    </Suspense>
  )
}