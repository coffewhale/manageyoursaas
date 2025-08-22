'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { SignupForm } from '@/components/auth/signup-form'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            SaaS Vendor Management
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Manage your SaaS subscriptions and vendors
          </p>
        </div>
        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <SignupForm onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  )
}