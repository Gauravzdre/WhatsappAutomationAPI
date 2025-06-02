'use client'

import { ReactNode } from 'react'
import { Navigation } from './navigation'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  description?: string
  icon?: ReactNode
  gradient?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal'
}

export function DashboardLayout({ 
  children, 
  title, 
  description, 
  icon, 
  gradient = 'blue' 
}: DashboardLayoutProps) {
  const gradientClasses = {
    blue: 'from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900',
    purple: 'from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900',
    green: 'from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900',
    orange: 'from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900',
    pink: 'from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900',
    teal: 'from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900'
  }

  const iconGradients = {
    blue: 'from-blue-500 to-purple-600',
    purple: 'from-purple-500 to-pink-600',
    green: 'from-emerald-500 to-teal-600',
    orange: 'from-orange-500 to-amber-600',
    pink: 'from-pink-500 to-rose-600',
    teal: 'from-teal-500 to-cyan-600'
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradientClasses[gradient]}`}>
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Enhanced Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              {icon && (
                <div className={`p-4 bg-gradient-to-br ${iconGradients[gradient]} rounded-xl shadow-lg`}>
                  <div className="text-white">
                    {icon}
                  </div>
                </div>
              )}
              <div>
                <h1 className={`text-4xl font-bold bg-gradient-to-r ${iconGradients[gradient]} bg-clip-text text-transparent`}>
                  {title}
                </h1>
                {description && (
                  <p className="text-gray-600 dark:text-gray-300 mt-1 text-lg">
                    {description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 rounded-full"></div>
          </div>
          
          {/* Page Content with backdrop blur cards */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </main>
      
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
} 