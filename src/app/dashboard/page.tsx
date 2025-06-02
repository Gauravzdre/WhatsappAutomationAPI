'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the unified dashboard on the home page
    router.replace('/')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Redirecting...</h3>
        <p className="text-sm text-muted-foreground">Taking you to the unified dashboard...</p>
      </div>
    </div>
  )
} 