'use client'

import { ReactNode } from 'react'
import { Navigation } from './navigation'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  description?: string
  icon?: ReactNode
}

export function DashboardLayout({ children, title, description, icon }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              {icon}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
            </div>
            {description && (
              <p className="text-gray-600 dark:text-gray-300">
                {description}
              </p>
            )}
          </div>
          
          {/* Page Content */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
} 