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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Template Library
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Create, manage, and optimize your message templates for better automation
              </p>
            </div>
            <Button 
              onClick={handleCreateTemplate}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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