'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface LoginFormProps {
  onToggleMode: () => void
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendingConfirmation, setResendingConfirmation] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResendButton, setShowResendButton] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const { signIn, resendConfirmation, resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setShowResendButton(false)
    setResendSuccess(false)

    const { error } = await signIn(email, password)
    if (error) {
      const errorMessage = error.message
      setError(errorMessage)
      
      // Check if the error is related to unconfirmed email
      if (errorMessage.toLowerCase().includes('email not confirmed') || 
          errorMessage.toLowerCase().includes('email confirmation') ||
          errorMessage.toLowerCase().includes('verify your email')) {
        setShowResendButton(true)
      }
    }
    setLoading(false)
  }

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }
    
    setResendingConfirmation(true)
    setError(null)
    
    const { error } = await resendConfirmation(email)
    if (error) {
      setError(error.message)
    } else {
      setResendSuccess(true)
      setShowResendButton(false)
    }
    setResendingConfirmation(false)
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }
    
    setResetLoading(true)
    setError(null)
    
    const { error } = await resetPassword(email)
    if (error) {
      setError(error.message)
    } else {
      setResetEmailSent(true)
    }
    setResetLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign in</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {resendSuccess && (
            <Alert>
              <AlertDescription>
                Confirmation email sent! Please check your inbox and click the verification link.
              </AlertDescription>
            </Alert>
          )}
          {resetEmailSent && (
            <Alert>
              <AlertDescription>
                Password reset email sent! Please check your inbox and follow the instructions.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
          
          {showResendButton && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-3">
                Your email address hasn&apos;t been confirmed yet. Please check your inbox or resend the confirmation email.
              </p>
              <Button 
                type="button"
                variant="outline"
                className="w-full"
                disabled={resendingConfirmation}
                onClick={handleResendConfirmation}
              >
                {resendingConfirmation ? 'Sending...' : 'Resend confirmation email'}
              </Button>
            </div>
          )}
        </form>
        <div className="mt-4 space-y-2">
          <div className="text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading || !email}
              className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {resetLoading ? 'Sending...' : 'Forgot your password?'}
            </button>
          </div>
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary hover:underline"
            >
              Sign up
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}