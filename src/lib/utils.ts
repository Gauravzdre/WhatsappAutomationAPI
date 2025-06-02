import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatNumber(num: number) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getEngagementRate(likes: number, comments: number, shares: number, reach: number) {
  if (reach === 0) return 0
  return ((likes + comments + shares) / reach) * 100
}

export function getOptimalPostingTime(platform: string, timezone = 'UTC') {
  const times = {
    whatsapp: { start: 14, end: 16 }, // 2-4 PM
    instagram: { start: 18, end: 20 }, // 6-8 PM
    facebook: { start: 13, end: 15 }, // 1-3 PM
    twitter: { start: 9, end: 10 }, // 9-10 AM
    linkedin: { start: 8, end: 9 }, // 8-9 AM
  }
  
  const platformTimes = times[platform as keyof typeof times] || { start: 12, end: 13 }
  return `${platformTimes.start}:00 - ${platformTimes.end}:00`
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function calculateROI(revenue: number, cost: number) {
  if (cost === 0) return 0
  return ((revenue - cost) / cost) * 100
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateURL(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function extractHashtags(text: string) {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g
  return text.match(hashtagRegex) || []
}

export function extractMentions(text: string) {
  const mentionRegex = /@[a-zA-Z0-9_]+/g
  return text.match(mentionRegex) || []
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getRandomColor() {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#EC4899', '#6366F1', '#F97316'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function generateRandomId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
    document.body.removeChild(textArea)
    return Promise.resolve()
  }
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getPlatformColor(platform: string) {
  const colors = {
    whatsapp: '#25D366',
    instagram: '#E4405F',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    youtube: '#FF0000',
    tiktok: '#000000'
  }
  return colors[platform as keyof typeof colors] || '#6B7280'
}

export function getTimeAgo(date: Date | string) {
  const now = new Date()
  const diffInMs = now.getTime() - new Date(date).getTime()
  const diffInSec = Math.floor(diffInMs / 1000)
  const diffInMin = Math.floor(diffInSec / 60)
  const diffInHour = Math.floor(diffInMin / 60)
  const diffInDay = Math.floor(diffInHour / 24)

  if (diffInSec < 60) return 'just now'
  if (diffInMin < 60) return `${diffInMin}m ago`
  if (diffInHour < 24) return `${diffInHour}h ago`
  if (diffInDay < 7) return `${diffInDay}d ago`
  return formatDate(date)
} 