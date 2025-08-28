'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { 
  Moon, 
  Sun, 
  LogOut, 
  Menu, 
  X, 
  Home,
  MessageSquare,
  Bot,
  Users,
  Calendar,
  Clock,
  Palette,
  Settings,
  Brain,
  ChevronDown,
  Zap,
  BarChart3,
  TrendingUp,
  UserPlus,
  MoreHorizontal,
  Target
} from 'lucide-react'
import { useEffect, useState } from 'react'

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [brandExists, setBrandExists] = useState(false)
  const [brandLoading, setBrandLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  // Core navigation - most frequently used features
  const primaryNavigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: Home,
      description: 'Overview & quick actions'
    },
    { 
      name: 'Templates', 
      href: '/templates', 
      icon: MessageSquare,
      description: 'Message templates'
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3,
      description: 'Performance metrics'
    },
    { 
      name: 'Teams', 
      href: '/teams', 
      icon: Users,
      description: 'Team collaboration',
      isNew: true
    }
  ]

  // Features accessible via "More" dropdown
  const moreNavigation = [
    { 
      name: 'Insights', 
      href: '/insights', 
      icon: TrendingUp,
      description: 'AI-powered insights',
      isNew: true
    },
    { 
      name: 'Social Posts', 
      href: '/social-posts', 
      icon: Calendar,
      description: 'Social media scheduling',
      isNew: true
    },
    { 
      name: 'AI Agents', 
      href: '/ai-agents', 
      icon: Bot,
      description: 'Automation bots'
    },

  ]

  const settingsNavigation = [
    { 
      name: 'Brand Setup', 
      href: brandExists ? '/brand-setup?edit=true' : '/brand-setup',
      icon: Brain,
      description: brandExists ? 'Edit brand' : 'Setup brand'
    },
    { 
      name: 'Brand Content', 
      href: '/brand-content', 
      icon: Palette,
      description: 'Content studio'
    },
    { 
      name: 'Onboarding', 
      href: '/onboarding', 
      icon: UserPlus,
      description: 'Setup wizard'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      description: 'App settings'
    }
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Schedsy.ai
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                    Smart Automation
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {primaryNavigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group',
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <Icon className={cn(
                      'w-4 h-4 transition-colors',
                      active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    )} />
                    <span>{item.name}</span>
                    {item.isNew && (
                      <Badge className="bg-green-500 text-white text-xs px-1.5 py-0.5 ml-1">
                        New
                      </Badge>
                    )}
                    {active && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                )
              })}
              
              {/* More Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                    <span>More</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Features</DropdownMenuLabel>
                  {moreNavigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href} className="flex items-center space-x-2 w-full">
                          <Icon className="w-4 h-4" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span>{item.name}</span>
                              {item.isNew && (
                                <Badge className="bg-green-500 text-white text-xs px-1 py-0">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Settings</DropdownMenuLabel>
                  {settingsNavigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href} className="flex items-center space-x-2 w-full">
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              )}

              {/* Desktop Sign Out */}
              <div className="hidden sm:block">
                <Button 
                  variant="outline" 
                  onClick={handleSignOut} 
                  size="sm"
                  className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-gray-500 dark:text-gray-400 p-2"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
            <div className="px-4 py-3 space-y-1">
              {/* Primary Navigation */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                  Main
                </p>
                {primaryNavigation.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                        active
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <Icon className={cn(
                        'w-5 h-5',
                        active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                      )} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span>{item.name}</span>
                          {item.isNew && (
                            <Badge className="bg-green-500 text-white text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* More Features */}
              <div className="space-y-1 pt-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                  Features
                </p>
                {moreNavigation.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        active
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <Icon className={cn(
                        'w-4 h-4',
                        active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                      )} />
                      <div className="flex items-center space-x-2">
                        <span>{item.name}</span>
                        {item.isNew && (
                          <Badge className="bg-green-500 text-white text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Settings */}
              <div className="space-y-1 pt-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                  Settings
                </p>
                {settingsNavigation.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        active
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <Icon className={cn(
                        'w-4 h-4',
                        active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                      )} />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Mobile Sign Out */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
} 