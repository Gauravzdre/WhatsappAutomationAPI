'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useStrategyTemplates } from '@/hooks/useStrategyTemplates'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Sparkles, 
  Target, 
  Users, 
  TrendingUp, 
  Heart,
  Building,
  Stethoscope,
  Code,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle
} from 'lucide-react'
import type { StrategyTemplateData } from '@/types/strategy'

const industryIcons = {
  'Retail/E-commerce': ShoppingBag,
  'Professional Services': Building,
  'Health & Wellness': Stethoscope,
  'Local Business': Heart,
  'Technology/SaaS': Code
}

const brandVoiceColors = {
  'friendly': 'bg-blue-100 text-blue-800',
  'professional': 'bg-gray-100 text-gray-800',
  'enthusiastic': 'bg-orange-100 text-orange-800',
  'casual': 'bg-green-100 text-green-800',
  'expert': 'bg-purple-100 text-purple-800'
}

export default function StrategyTemplatesPage() {
  const router = useRouter()
  const { templates, loading, error, createStrategyFromTemplate } = useStrategyTemplates()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<StrategyTemplateData | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Filter templates based on search and industry
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesIndustry = selectedIndustry === 'all' || template.industry === selectedIndustry
    
    return matchesSearch && matchesIndustry
  })

  // Get unique industries for filter
  const industries = Array.from(new Set(templates.map(t => t.industry)))

  const handleCreateFromTemplate = async (template: StrategyTemplateData) => {
    try {
      setIsCreating(true)
      const strategy = await createStrategyFromTemplate(template.id, {
        name: `${template.name} - My Strategy`
      })
      router.push(`/strategy/${strategy.id}`)
    } catch (error) {
      console.error('Error creating strategy from template:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const TemplateCard = ({ template }: { template: StrategyTemplateData }) => {
    const IconComponent = industryIcons[template.industry as keyof typeof industryIcons] || Building
    
    return (
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IconComponent className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                  {template.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {template.business_type}
                </CardDescription>
              </div>
            </div>
            {template.is_premium && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-3">
            {template.description}
          </p>
          
          {/* Content Distribution */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Content Distribution</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Educational:</span>
                <span className="font-medium">{template.content_distribution.educational}%</span>
              </div>
              <div className="flex justify-between">
                <span>Promotional:</span>
                <span className="font-medium">{template.content_distribution.promotional}%</span>
              </div>
              <div className="flex justify-between">
                <span>Engagement:</span>
                <span className="font-medium">{template.content_distribution.engagement}%</span>
              </div>
              <div className="flex justify-between">
                <span>Support:</span>
                <span className="font-medium">{template.content_distribution.support}%</span>
              </div>
            </div>
          </div>

          {/* Target Metrics */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Target Metrics</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <Target className="h-3 w-3 text-green-500" />
                <span>{template.target_metrics.response_rate_target}% Response</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3 text-blue-500" />
                <span>{template.target_metrics.engagement_rate_target}% Engagement</span>
              </div>
            </div>
          </div>

          {/* Brand Voice & Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className={brandVoiceColors[template.brand_voice as keyof typeof brandVoiceColors] || 'bg-gray-100 text-gray-800'}
              >
                {template.brand_voice}
              </Badge>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{template.recommended_posting_schedule.frequency}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setSelectedTemplate(template)}
            >
              Preview
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleCreateFromTemplate(template)}
              disabled={isCreating}
            >
              {isCreating ? (
                'Creating...'
              ) : (
                <>
                  Use Template
                  <ArrowRight className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const TemplatePreview = ({ template }: { template: StrategyTemplateData }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                {(() => {
                  const IconComponent = industryIcons[template.industry as keyof typeof industryIcons] || Building
                  return <IconComponent className="h-6 w-6 text-purple-600" />
                })()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{template.name}</h2>
                <p className="text-gray-600">{template.business_type} • {template.industry}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Close
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Objectives */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Objectives</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Primary Goal</h4>
                  <p className="text-sm">{template.business_objectives.primary_goal}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Target Audience</h4>
                  <p className="text-sm">{template.business_objectives.target_audience}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Value Proposition</h4>
                  <p className="text-sm">{template.business_objectives.value_proposition}</p>
                </div>
              </div>
            </div>

            {/* Sample Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sample Content</h3>
              <div className="space-y-3">
                {Object.entries(template.sample_content).map(([pillar, messages]) => (
                  <div key={pillar}>
                    <h4 className="font-medium text-sm text-gray-700 capitalize mb-2">{pillar}</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm italic">"{messages[0]}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={() => handleCreateFromTemplate(template)} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Use This Template'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <DashboardLayout title="Strategy Templates">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading strategy templates...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Strategy Templates">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error loading templates: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Strategy Templates">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Strategy Templates</h1>
            <p className="text-gray-600 mt-1">
              Choose from pre-built strategies tailored to your industry and business type
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              {templates.length} Templates Available
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find the perfect template.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}

        {/* Template Preview Modal */}
        {selectedTemplate && <TemplatePreview template={selectedTemplate} />}
      </div>
    </DashboardLayout>
  )
} 