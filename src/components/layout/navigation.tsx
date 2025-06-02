'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { Moon, Sun, LogOut, Building2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [brandExists, setBrandExists] = useState(false)
  const [brandLoading, setBrandLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    checkBrandExists()
  }, [])

  const checkBrandExists = async () => {
    try {
      const response = await fetch('/api/brands')
      const data = await response.json()
      setBrandExists(data.success && data.brand)
    } catch (error) {
      console.error('Error checking brand:', error)
      setBrandExists(false)
    } finally {
      setBrandLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Dynamic navigation based on brand existence
  const navigation = [
    { name: 'Dashboard', href: '/' },
    { 
      name: 'Brand Setup', 
      href: brandExists ? '/brand-setup?edit=true' : '/brand-setup' 
    },
    { name: 'AI Agents', href: '/ai-agents' },
    { name: 'Clients', href: '/clients' },
    { name: 'Schedules', href: '/schedules' },
    { name: 'Brand Content', href: '/brand-content' },
    { name: 'Settings', href: '/settings' },
  ]

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                🤖 WhatsApp AI Automation
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors',
                    pathname === item.href || (item.name === 'Brand Setup' && pathname === '/brand-setup')
                      ? 'border-blue-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}
            <Button variant="outline" onClick={handleSignOut} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
} 