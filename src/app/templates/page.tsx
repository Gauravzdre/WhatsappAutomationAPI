'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/navigation'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  Users, 
  Star,
  Edit,
  Copy,
  Trash2,
  Eye,
  Sparkles,
  Zap,
  Heart,
  TrendingUp,
  Calendar,
  Target,
  Gift,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  content: string
  category: 'welcome' | 'support' | 'sales' | 'marketing' | 'follow-up' | 'custom'
  tags: string[]
  isActive: boolean
  usageCount: number
  lastUsed: string | null
  createdAt: string
  updatedAt: string
  variables: string[]
  estimatedResponseTime: number
  successRate: number
}

const templateCategories = [
  { id: 'all', name: 'All Templates', icon: MessageSquare, color: 'bg-gray-500' },
  { id: 'welcome', name: 'Welcome Messages', icon: Heart, color: 'bg-blue-500' },
  { id: 'support', name: 'Customer Support', icon: Users, color: 'bg-green-500' },
  { id: 'sales', name: 'Sales & Conversion', icon: TrendingUp, color: 'bg-purple-500' },
  { id: 'marketing', name: 'Marketing Campaigns', icon: Target, color: 'bg-orange-500' },
  { id: 'follow-up', name: 'Follow-up Messages', icon: Calendar, color: 'bg-teal-500' },
  { id: 'custom', name: 'Custom Templates', icon: Sparkles, color: 'bg-pink-500' }
]

const sampleTemplates: Template[] = [
  {
    id: '1',
    name: 'Welcome New Customer',
    description: 'Warm welcome message for new customers with brand introduction',
    content: 'Hi {{customerName}}! 👋 Welcome to {{brandName}}! We\'re thrilled to have you join our community. Here\'s what you can expect from us: personalized service, quick responses, and amazing products. How can we help you get started today?',
    category: 'welcome',
    tags: ['onboarding', 'introduction', 'friendly'],
    isActive: true,
    usageCount: 156,
    lastUsed: '2025-01-27T10:30:00Z',
    createdAt: '2025-01-20T09:00:00Z',
    updatedAt: '2025-01-27T10:30:00Z',
    variables: ['customerName', 'brandName'],
    estimatedResponseTime: 2,
    successRate: 94
  },
  {
    id: '2',
    name: 'Order Confirmation',
    description: 'Professional order confirmation with tracking details',
    content: 'Thank you for your order #{{orderNumber}}! 🎉 Your {{productName}} is being prepared and will be shipped within {{shippingTime}}. Track your order: {{trackingLink}}. Questions? Just reply to this message!',
    category: 'sales',
    tags: ['order', 'confirmation', 'tracking'],
    isActive: true,
    usageCount: 89,
    lastUsed: '2025-01-27T14:15:00Z',
    createdAt: '2025-01-22T11:00:00Z',
    updatedAt: '2025-01-27T14:15:00Z',
    variables: ['orderNumber', 'productName', 'shippingTime', 'trackingLink'],
    estimatedResponseTime: 1,
    successRate: 98
  },
  {
    id: '3',
    name: 'Support Ticket Response',
    description: 'Acknowledgment message for support requests',
    content: 'Hi {{customerName}}, thanks for reaching out! 🛠️ We\'ve received your support request about {{issueType}}. Our team is reviewing it and you can expect a detailed response within {{responseTime}}. Ticket #{{ticketNumber}} for reference.',
    category: 'support',
    tags: ['support', 'acknowledgment', 'professional'],
    isActive: true,
    usageCount: 67,
    lastUsed: '2025-01-26T16:45:00Z',
    createdAt: '2025-01-21T14:30:00Z',
    updatedAt: '2025-01-26T16:45:00Z',
    variables: ['customerName', 'issueType', 'responseTime', 'ticketNumber'],
    estimatedResponseTime: 3,
    successRate: 91
  },
  {
    id: '4',
    name: 'Abandoned Cart Recovery',
    description: 'Gentle reminder for customers who left items in their cart',
    content: 'Hey {{customerName}}! 🛒 You left some amazing items in your cart at {{brandName}}. Don\'t miss out on {{productName}} - only {{stockCount}} left! Complete your purchase now and get {{discountPercent}}% off. Link: {{cartLink}}',
    category: 'marketing',
    tags: ['cart', 'recovery', 'discount', 'urgency'],
    isActive: true,
    usageCount: 234,
    lastUsed: '2025-01-27T16:20:00Z',
    createdAt: '2025-01-18T12:00:00Z',
    updatedAt: '2025-01-27T16:20:00Z',
    variables: ['customerName', 'brandName', 'productName', 'stockCount', 'discountPercent', 'cartLink'],
    estimatedResponseTime: 1,
    successRate: 87
  },
  {
    id: '5',
    name: 'Appointment Reminder',
    description: 'Professional appointment reminder with rescheduling options',
    content: 'Hi {{customerName}}! 📅 This is a friendly reminder about your {{serviceType}} appointment tomorrow at {{appointmentTime}} with {{providerName}}. Need to reschedule? Reply "RESCHEDULE" or call {{phoneNumber}}.',
    category: 'follow-up',
    tags: ['appointment', 'reminder', 'professional', 'healthcare'],
    isActive: true,
    usageCount: 145,
    lastUsed: '2025-01-27T09:15:00Z',
    createdAt: '2025-01-19T14:30:00Z',
    updatedAt: '2025-01-27T09:15:00Z',
    variables: ['customerName', 'serviceType', 'appointmentTime', 'providerName', 'phoneNumber'],
    estimatedResponseTime: 2,
    successRate: 96
  },
  {
    id: '6',
    name: 'Birthday Special Offer',
    description: 'Personalized birthday message with exclusive discount',
    content: 'Happy Birthday {{customerName}}! 🎉🎂 To celebrate your special day, we\'re giving you an exclusive {{discountPercent}}% off everything at {{brandName}}! Use code {{birthdayCode}} - valid until {{expiryDate}}. Treat yourself! 🎁',
    category: 'marketing',
    tags: ['birthday', 'personal', 'discount', 'celebration'],
    isActive: true,
    usageCount: 78,
    lastUsed: '2025-01-26T11:30:00Z',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-26T11:30:00Z',
    variables: ['customerName', 'discountPercent', 'brandName', 'birthdayCode', 'expiryDate'],
    estimatedResponseTime: 2,
    successRate: 92
  },
  {
    id: '7',
    name: 'Shipping Delay Notification',
    description: 'Transparent communication about shipping delays with compensation',
    content: 'Hi {{customerName}}, we have an update on order #{{orderNumber}}. Due to {{delayReason}}, your {{productName}} will arrive {{newDeliveryDate}} instead of {{originalDate}}. As an apology, we\'re adding {{compensationType}} to your account. Thanks for your patience! 🙏',
    category: 'support',
    tags: ['shipping', 'delay', 'transparency', 'compensation'],
    isActive: true,
    usageCount: 43,
    lastUsed: '2025-01-25T14:45:00Z',
    createdAt: '2025-01-16T09:30:00Z',
    updatedAt: '2025-01-25T14:45:00Z',
    variables: ['customerName', 'orderNumber', 'delayReason', 'productName', 'newDeliveryDate', 'originalDate', 'compensationType'],
    estimatedResponseTime: 3,
    successRate: 89
  },
  {
    id: '8',
    name: 'Product Launch Announcement',
    description: 'Exciting announcement for new product launches with early access',
    content: '🚀 BIG NEWS, {{customerName}}! We\'re launching {{productName}} and you\'re getting exclusive early access! {{productDescription}} Available {{launchDate}} with {{earlyBirdDiscount}}% early bird discount. Be the first to experience {{keyFeature}}! Pre-order: {{preorderLink}}',
    category: 'marketing',
    tags: ['launch', 'exclusive', 'early-access', 'excitement'],
    isActive: true,
    usageCount: 167,
    lastUsed: '2025-01-27T13:00:00Z',
    createdAt: '2025-01-14T16:00:00Z',
    updatedAt: '2025-01-27T13:00:00Z',
    variables: ['customerName', 'productName', 'productDescription', 'launchDate', 'earlyBirdDiscount', 'keyFeature', 'preorderLink'],
    estimatedResponseTime: 2,
    successRate: 85
  },
  {
    id: '9',
    name: 'Payment Failed Notification',
    description: 'Gentle payment failure notification with easy resolution steps',
    content: 'Hi {{customerName}}, we couldn\'t process your payment for {{serviceName}}. No worries - this happens! 💳 Please update your payment method by {{deadlineDate}} to avoid service interruption. Update here: {{paymentLink}} or reply for help.',
    category: 'support',
    tags: ['payment', 'billing', 'urgent', 'helpful'],
    isActive: true,
    usageCount: 92,
    lastUsed: '2025-01-27T08:30:00Z',
    createdAt: '2025-01-17T11:15:00Z',
    updatedAt: '2025-01-27T08:30:00Z',
    variables: ['customerName', 'serviceName', 'deadlineDate', 'paymentLink'],
    estimatedResponseTime: 1,
    successRate: 94
  },
  {
    id: '10',
    name: 'Customer Feedback Request',
    description: 'Polite request for customer feedback with incentive',
    content: 'Hi {{customerName}}! 💭 How was your experience with {{productName}}? Your feedback helps us improve! Take our 2-minute survey and get {{incentiveAmount}} off your next purchase: {{surveyLink}}. Thanks for helping us serve you better!',
    category: 'follow-up',
    tags: ['feedback', 'survey', 'improvement', 'incentive'],
    isActive: true,
    usageCount: 128,
    lastUsed: '2025-01-26T17:00:00Z',
    createdAt: '2025-01-13T13:45:00Z',
    updatedAt: '2025-01-26T17:00:00Z',
    variables: ['customerName', 'productName', 'incentiveAmount', 'surveyLink'],
    estimatedResponseTime: 2,
    successRate: 76
  },
  {
    id: '11',
    name: 'VIP Customer Exclusive',
    description: 'Special message for VIP customers with exclusive perks',
    content: '⭐ VIP EXCLUSIVE ⭐ Hi {{customerName}}! As one of our valued VIP customers, you get first access to {{exclusiveOffer}}. This is only available to our top {{vipTierName}} members. Claim your exclusive benefit: {{vipLink}} - expires {{expiryDate}}!',
    category: 'marketing',
    tags: ['vip', 'exclusive', 'loyalty', 'premium'],
    isActive: true,
    usageCount: 56,
    lastUsed: '2025-01-26T12:15:00Z',
    createdAt: '2025-01-12T15:30:00Z',
    updatedAt: '2025-01-26T12:15:00Z',
    variables: ['customerName', 'exclusiveOffer', 'vipTierName', 'vipLink', 'expiryDate'],
    estimatedResponseTime: 2,
    successRate: 93
  },
  {
    id: '12',
    name: 'Service Maintenance Notice',
    description: 'Professional notification about scheduled maintenance',
    content: 'Hi {{customerName}}, we\'re performing scheduled maintenance on {{serviceDate}} from {{startTime}} to {{endTime}} to improve your {{serviceName}} experience. During this time, {{affectedFeatures}} may be temporarily unavailable. We appreciate your patience! 🔧',
    category: 'support',
    tags: ['maintenance', 'scheduled', 'professional', 'transparency'],
    isActive: true,
    usageCount: 34,
    lastUsed: '2025-01-24T10:00:00Z',
    createdAt: '2025-01-11T09:00:00Z',
    updatedAt: '2025-01-24T10:00:00Z',
    variables: ['customerName', 'serviceDate', 'startTime', 'endTime', 'serviceName', 'affectedFeatures'],
    estimatedResponseTime: 3,
    successRate: 88
  },
  {
    id: '13',
    name: 'Referral Program Invitation',
    description: 'Friendly invitation to join referral program with benefits',
    content: 'Hey {{customerName}}! 🤝 Love {{brandName}}? Share the love and earn rewards! Refer friends and get {{referralReward}} for each successful referral. They get {{friendReward}} too! Your unique referral link: {{referralLink}}. Start earning today!',
    category: 'marketing',
    tags: ['referral', 'rewards', 'sharing', 'community'],
    isActive: true,
    usageCount: 87,
    lastUsed: '2025-01-25T15:30:00Z',
    createdAt: '2025-01-10T14:00:00Z',
    updatedAt: '2025-01-25T15:30:00Z',
    variables: ['customerName', 'brandName', 'referralReward', 'friendReward', 'referralLink'],
    estimatedResponseTime: 2,
    successRate: 82
  },
  {
    id: '14',
    name: 'Subscription Renewal Reminder',
    description: 'Friendly reminder about upcoming subscription renewal',
    content: 'Hi {{customerName}}! 📅 Your {{subscriptionPlan}} subscription renews on {{renewalDate}} for {{renewalAmount}}. Want to upgrade, downgrade, or have questions? Manage your subscription: {{manageLink}} or reply to this message. Thanks for staying with us!',
    category: 'follow-up',
    tags: ['subscription', 'renewal', 'billing', 'management'],
    isActive: true,
    usageCount: 112,
    lastUsed: '2025-01-27T07:45:00Z',
    createdAt: '2025-01-09T11:30:00Z',
    updatedAt: '2025-01-27T07:45:00Z',
    variables: ['customerName', 'subscriptionPlan', 'renewalDate', 'renewalAmount', 'manageLink'],
    estimatedResponseTime: 2,
    successRate: 91
  },
  {
    id: '15',
    name: 'Flash Sale Alert',
    description: 'Urgent flash sale notification with limited time offer',
    content: '⚡ FLASH SALE ALERT ⚡ {{customerName}}, drop everything! {{salePercentage}}% off {{saleCategory}} for the next {{saleHours}} hours ONLY! No code needed - discount applied automatically. Shop now: {{saleLink}} ⏰ Hurry, sale ends {{endTime}}!',
    category: 'marketing',
    tags: ['flash-sale', 'urgent', 'limited-time', 'discount'],
    isActive: true,
    usageCount: 203,
    lastUsed: '2025-01-27T14:30:00Z',
    createdAt: '2025-01-08T16:45:00Z',
    updatedAt: '2025-01-27T14:30:00Z',
    variables: ['customerName', 'salePercentage', 'saleCategory', 'saleHours', 'saleLink', 'endTime'],
    estimatedResponseTime: 1,
    successRate: 89
  },
  {
    id: '16',
    name: 'Welcome Back Inactive Customer',
    description: 'Re-engagement message for customers who haven\'t been active',
    content: 'We miss you, {{customerName}}! 💙 It\'s been {{daysSinceLastPurchase}} days since your last visit to {{brandName}}. Here\'s {{welcomeBackOffer}} to welcome you back! See what\'s new: {{catalogLink}}. We\'d love to serve you again!',
    category: 'welcome',
    tags: ['re-engagement', 'win-back', 'offer', 'personal'],
    isActive: true,
    usageCount: 76,
    lastUsed: '2025-01-26T13:20:00Z',
    createdAt: '2025-01-07T12:00:00Z',
    updatedAt: '2025-01-26T13:20:00Z',
    variables: ['customerName', 'daysSinceLastPurchase', 'brandName', 'welcomeBackOffer', 'catalogLink'],
    estimatedResponseTime: 2,
    successRate: 73
  },
  {
    id: '17',
    name: 'Event Invitation',
    description: 'Invitation to special events, webinars, or workshops',
    content: '🎪 You\'re invited, {{customerName}}! Join us for {{eventName}} on {{eventDate}} at {{eventTime}}. {{eventDescription}} Reserve your spot: {{rsvpLink}}. Limited to {{maxAttendees}} attendees. See you there!',
    category: 'marketing',
    tags: ['event', 'invitation', 'exclusive', 'community'],
    isActive: true,
    usageCount: 45,
    lastUsed: '2025-01-25T16:00:00Z',
    createdAt: '2025-01-06T10:30:00Z',
    updatedAt: '2025-01-25T16:00:00Z',
    variables: ['customerName', 'eventName', 'eventDate', 'eventTime', 'eventDescription', 'rsvpLink', 'maxAttendees'],
    estimatedResponseTime: 2,
    successRate: 84
  },
  {
    id: '18',
    name: 'Order Delivered Confirmation',
    description: 'Confirmation message when order has been successfully delivered',
    content: '📦 Great news {{customerName}}! Your order #{{orderNumber}} has been delivered to {{deliveryAddress}}. How did we do? Rate your experience: {{ratingLink}}. Need help with your {{productName}}? We\'re here for you!',
    category: 'follow-up',
    tags: ['delivery', 'confirmation', 'feedback', 'support'],
    isActive: true,
    usageCount: 198,
    lastUsed: '2025-01-27T15:45:00Z',
    createdAt: '2025-01-05T14:15:00Z',
    updatedAt: '2025-01-27T15:45:00Z',
    variables: ['customerName', 'orderNumber', 'deliveryAddress', 'ratingLink', 'productName'],
    estimatedResponseTime: 1,
    successRate: 95
  },
  {
    id: '19',
    name: 'Customer Support Resolution',
    description: 'Follow-up message after resolving a customer support issue',
    content: 'Hi {{customerName}}! ✅ We\'ve resolved your support ticket #{{ticketNumber}} regarding {{issueDescription}}. {{resolutionSummary}} Is everything working perfectly now? Reply if you need any additional help. Your satisfaction is our priority!',
    category: 'support',
    tags: ['resolution', 'follow-up', 'satisfaction', 'care'],
    isActive: true,
    usageCount: 134,
    lastUsed: '2025-01-27T11:00:00Z',
    createdAt: '2025-01-04T13:30:00Z',
    updatedAt: '2025-01-27T11:00:00Z',
    variables: ['customerName', 'ticketNumber', 'issueDescription', 'resolutionSummary'],
    estimatedResponseTime: 2,
    successRate: 97
  },
  {
    id: '20',
    name: 'Loyalty Points Update',
    description: 'Notification about loyalty points earned or milestone reached',
    content: '🌟 Congratulations {{customerName}}! You\'ve earned {{pointsEarned}} loyalty points from your recent purchase. Total points: {{totalPoints}}. You\'re {{pointsToNextTier}} points away from {{nextTierName}} status! Redeem points: {{redeemLink}}',
    category: 'follow-up',
    tags: ['loyalty', 'points', 'rewards', 'milestone'],
    isActive: true,
    usageCount: 156,
    lastUsed: '2025-01-26T18:30:00Z',
    createdAt: '2025-01-03T15:45:00Z',
    updatedAt: '2025-01-26T18:30:00Z',
    variables: ['customerName', 'pointsEarned', 'totalPoints', 'pointsToNextTier', 'nextTierName', 'redeemLink'],
    estimatedResponseTime: 2,
    successRate: 88
  }
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(sampleTemplates)
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(sampleTemplates)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
    }
    checkAuth()
  }, [router, supabase])

  // Filter templates based on category and search
  useEffect(() => {
    let filtered = templates

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    setFilteredTemplates(filtered)
  }, [templates, selectedCategory, searchQuery])

  const handleCreateTemplate = () => {
    setIsCreating(true)
    setEditingTemplate(null)
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setIsCreating(true)
  }

  const handleDuplicateTemplate = (template: Template) => {
    const duplicated = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      usageCount: 0,
      lastUsed: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setTemplates(prev => [duplicated, ...prev])
  }

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId))
  }

  const handleToggleActive = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, isActive: !t.isActive } : t
    ))
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = templateCategories.find(c => c.id === categoryId)
    return category ? category.icon : MessageSquare
  }

  const getCategoryColor = (categoryId: string) => {
    const category = templateCategories.find(c => c.id === categoryId)
    return category ? category.color : 'bg-gray-500'
  }

  const formatLastUsed = (lastUsed: string | null) => {
    if (!lastUsed) return 'Never used'
    const date = new Date(lastUsed)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  if (isCreating) {
    return <TemplateEditor 
      template={editingTemplate} 
      onSave={(template) => {
        if (editingTemplate) {
          setTemplates(prev => prev.map(t => t.id === template.id ? template : t))
        } else {
          setTemplates(prev => [template, ...prev])
        }
        setIsCreating(false)
        setEditingTemplate(null)
      }}
      onCancel={() => {
        setIsCreating(false)
        setEditingTemplate(null)
      }}
    />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Template Library
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">
                Create, manage, and optimize your message templates for better automation
              </p>
            </div>
            <Button 
              onClick={handleCreateTemplate}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full sm:w-auto"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search templates by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {templateCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${category.color}`} />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {templateCategories.map((category) => {
              const Icon = category.icon
              const isSelected = selectedCategory === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                  <Badge variant="secondary" className="ml-1">
                    {category.id === 'all' 
                      ? templates.length 
                      : templates.filter(t => t.category === category.id).length
                    }
                  </Badge>
                </button>
              )
            })}
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {searchQuery || selectedCategory !== 'all' ? 'No templates found' : 'No templates yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first template to get started with automation'
              }
            </p>
            <Button onClick={handleCreateTemplate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTemplates.map((template) => {
              const CategoryIcon = getCategoryIcon(template.category)
              return (
                <EnhancedCard key={template.id} variant="glass" className="group hover:shadow-xl transition-all duration-300">
                  <EnhancedCardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                          <CategoryIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <EnhancedCardTitle className="text-lg font-semibold truncate">
                            {template.name}
                          </EnhancedCardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              variant={template.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {template.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {template.usageCount} uses
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </EnhancedCardHeader>
                  
                  <EnhancedCardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {template.description}
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 font-mono">
                        {template.content}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatLastUsed(template.lastUsed)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{template.successRate}% success</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTemplate(template)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(template.id)}
                        className={template.isActive ? 'text-orange-600' : 'text-green-600'}
                      >
                        {template.isActive ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </EnhancedCardContent>
                </EnhancedCard>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

// Template Editor Component
function TemplateEditor({ 
  template, 
  onSave, 
  onCancel 
}: { 
  template: Template | null
  onSave: (template: Template) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    content: template?.content || '',
    category: template?.category || 'custom' as const,
    tags: template?.tags.join(', ') || '',
    isActive: template?.isActive ?? true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Template name is required'
    if (!formData.content.trim()) newErrors.content = 'Template content is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    
    // Extract variables from content
    const variables = Array.from(formData.content.matchAll(/\{\{(\w+)\}\}/g))
      .map(match => match[1])
      .filter((value, index, self) => self.indexOf(value) === index)

    const savedTemplate: Template = {
      id: template?.id || Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      content: formData.content.trim(),
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isActive: formData.isActive,
      usageCount: template?.usageCount || 0,
      lastUsed: template?.lastUsed || null,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variables,
      estimatedResponseTime: template?.estimatedResponseTime || 2,
      successRate: template?.successRate || 95
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onSave(savedTemplate)
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Navigation />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {template ? 'Edit Template' : 'Create New Template'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {template ? 'Update your template settings and content' : 'Design a new message template for your automation'}
          </p>
        </div>

        <EnhancedCard variant="glass">
          <EnhancedCardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Welcome New Customer"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateCategories.filter(c => c.id !== 'all').map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of when to use this template"
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="content">Template Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Your message template. Use {{variableName}} for dynamic content."
                rows={6}
                className={errors.content ? 'border-red-500' : ''}
              />
              {errors.content && <p className="text-sm text-red-600 mt-1">{errors.content}</p>}
                             <p className="text-sm text-gray-500 mt-2">
                 💡 Use variables like {`{{customerName}}`}, {`{{brandName}}`}, {`{{orderNumber}}`} for personalization
               </p>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., welcome, onboarding, friendly"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isActive">Template is active and ready to use</Label>
            </div>

            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {saving ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Template
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={onCancel} disabled={saving}>
                Cancel
              </Button>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </main>
    </div>
  )
} 