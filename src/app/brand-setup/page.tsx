'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Building2, Plus, Save, Loader2, Palette, Target, Globe, Edit, X, Check, Trash2 } from 'lucide-react'
import { Brand, CreateBrandRequest } from '@/types/brand'

const industries = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education', 'Food & Beverage',
  'Fashion', 'Real Estate', 'Consulting', 'Manufacturing', 'Media & Entertainment',
  'Non-profit', 'Travel & Tourism', 'Automotive', 'Sports & Fitness', 'Other'
]

const brandVoices = [
  'Professional', 'Casual', 'Friendly', 'Authoritative', 'Playful', 'Inspirational',
  'Educational', 'Luxury', 'Conversational', 'Bold', 'Trustworthy', 'Innovative'
]

function BrandSetupPageContent() {
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const [formData, setFormData] = useState<CreateBrandRequest>({
    name: '',
    description: '',
    industry: '',
    target_audience: '',
    brand_voice: '',
    brand_colors: [],
    logo_url: '',
    website: '',
    social_links: {
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: '',
      tiktok: '',
      youtube: ''
    },
    business_goals: '',
    unique_value_proposition: '',
    brand_guidelines: ''
  })

  const [originalFormData, setOriginalFormData] = useState<CreateBrandRequest | null>(null)
  const [newColor, setNewColor] = useState('#000000')

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    loadBrand()
  }, [])

  // Track changes to show unsaved changes indicator
  useEffect(() => {
    if (originalFormData && isEditing) {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData)
      setHasUnsavedChanges(hasChanges)
    }
  }, [formData, originalFormData, isEditing])

  const loadBrand = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/brands')
      
      if (!response.ok) {
        throw new Error('Failed to load brand')
      }

      const { brand } = await response.json()
      
      if (brand) {
        setBrand(brand)
        const brandData = {
          name: brand.name || '',
          description: brand.description || '',
          industry: brand.industry || '',
          target_audience: brand.target_audience || '',
          brand_voice: brand.brand_voice || '',
          brand_colors: brand.brand_colors || [],
          logo_url: brand.logo_url || '',
          website: brand.website || '',
          social_links: brand.social_links || {
            instagram: '',
            facebook: '',
            twitter: '',
            linkedin: '',
            tiktok: '',
            youtube: ''
          },
          business_goals: brand.business_goals || '',
          unique_value_proposition: brand.unique_value_proposition || '',
          brand_guidelines: brand.brand_guidelines || ''
        }
        setFormData(brandData)
        setOriginalFormData(brandData)
        
        // Check if user explicitly wants to edit (via URL parameter)
        const editMode = searchParams.get('edit') === 'true'
        
        if (editMode) {
          // User wants to edit their existing brand - show editing form
          setIsEditing(true)
        } else {
          // Brand exists but user didn't request edit mode - redirect to dashboard
          // This allows direct access to brand setup for editing via ?edit=true
          router.push('/')
          return
        }
      } else {
        // No brand exists, enable editing mode for creation
        setIsEditing(true)
      }
    } catch (error) {
      console.error('Error loading brand:', error)
      toast({
        title: 'Error',
        description: 'Failed to load brand information',
        variant: 'destructive',
      })
      // If there's an error loading brand, assume no brand exists and allow creation
      setIsEditing(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Brand name is required',
        variant: 'destructive',
      })
      return
    }

    if (formData.website && !isValidUrl(formData.website)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid website URL',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    
    try {
      const url = '/api/brands'
      const method = brand ? 'PUT' : 'POST'
      const body = brand ? { ...formData, id: brand.id } : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save brand')
      }

      const { brand: savedBrand } = await response.json()
      setBrand(savedBrand)
      setIsEditing(false)
      setHasUnsavedChanges(false)
      
      // Update original form data to reflect saved state
      setOriginalFormData(formData)
      
      toast({
        title: 'Success',
        description: brand ? 'Brand updated successfully!' : 'Brand created successfully!',
      })
      
      // Redirect to dashboard after successful save
      setTimeout(() => {
        router.push('/')
      }, 1000) // Small delay to show the success message
      
    } catch (error) {
      console.error('Error saving brand:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save brand',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setFormData(originalFormData!)
        setIsEditing(false)
        setHasUnsavedChanges(false)
        
        // If canceling edit of existing brand, redirect to dashboard
        if (brand) {
          router.push('/')
        }
      }
    } else {
      setIsEditing(false)
      
      // If canceling edit of existing brand, redirect to dashboard
      if (brand) {
        router.push('/')
      }
    }
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const addColor = () => {
    if (newColor && !formData.brand_colors?.includes(newColor)) {
      setFormData({
        ...formData,
        brand_colors: [...(formData.brand_colors || []), newColor]
      })
      setNewColor('#000000')
    }
  }

  const removeColor = (colorToRemove: string) => {
    setFormData({
      ...formData,
      brand_colors: formData.brand_colors?.filter(color => color !== colorToRemove) || []
    })
  }

  const handleDeleteBrand = async () => {
    if (!brand) return
    
    setDeleting(true)
    try {
      const response = await fetch('/api/brands', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: brand.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete brand')
      }

      setBrand(null)
      setFormData({
        name: '',
        description: '',
        industry: '',
        target_audience: '',
        brand_voice: '',
        brand_colors: [],
        logo_url: '',
        website: '',
        social_links: {
          instagram: '',
          facebook: '',
          twitter: '',
          linkedin: '',
          tiktok: '',
          youtube: ''
        },
        business_goals: '',
        unique_value_proposition: '',
        brand_guidelines: ''
      })
      setOriginalFormData(null)
      setIsEditing(true)
      setShowDeleteConfirm(false)
      
      toast({
        title: 'Success',
        description: 'Brand deleted successfully. You can now create a new brand.',
      })
      
    } catch (error) {
      console.error('Error deleting brand:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete brand',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Brand Setup"
        description="Create and manage your brand identity"
        icon={<Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
      >
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading brand information...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Brand Setup"
      description="Create and manage your brand identity"
      icon={<Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {brand ? brand.name : 'Create Your Brand'}
              {hasUnsavedChanges && (
                <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Unsaved changes
                </span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {brand ? 'Manage your brand identity and guidelines' : 'Set up your brand to get started (one brand per account)'}
            </p>
          </div>
          {brand && !isEditing && (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Brand
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Brand Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                    Brand Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your brand name"
                    required
                    disabled={!isEditing}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what your brand is about..."
                    rows={3}
                    disabled={!isEditing}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="industry" className="text-gray-700 dark:text-gray-300">
                    Industry
                  </Label>
                  <Select 
                    value={formData.industry} 
                    onValueChange={(value) => setFormData({ ...formData, industry: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry.toLowerCase()}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="website" className="text-gray-700 dark:text-gray-300">
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    disabled={!isEditing}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Brand Identity */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Brand Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="brand_voice" className="text-gray-700 dark:text-gray-300">
                    Brand Voice
                  </Label>
                  <Select 
                    value={formData.brand_voice} 
                    onValueChange={(value) => setFormData({ ...formData, brand_voice: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Select your brand voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {brandVoices.map((voice) => (
                        <SelectItem key={voice} value={voice.toLowerCase()}>
                          {voice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">
                    Brand Colors
                  </Label>
                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      {formData.brand_colors?.map((color, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1"
                        >
                          <div
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{color}</span>
                          {isEditing && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeColor(color)}
                              className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={newColor}
                          onChange={(e) => setNewColor(e.target.value)}
                          className="w-16 h-10 p-1 border-gray-300 dark:border-gray-600"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addColor}
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Color
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="logo_url" className="text-gray-700 dark:text-gray-300">
                    Logo URL
                  </Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://yourlogo.com/logo.png"
                    disabled={!isEditing}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="unique_value_proposition" className="text-gray-700 dark:text-gray-300">
                    Unique Value Proposition
                  </Label>
                  <Textarea
                    id="unique_value_proposition"
                    value={formData.unique_value_proposition}
                    onChange={(e) => setFormData({ ...formData, unique_value_proposition: e.target.value })}
                    placeholder="What makes your brand unique?"
                    rows={2}
                    disabled={!isEditing}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Width Sections */}
          <div className="space-y-6">
            {/* Target Audience */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Target Audience & Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="target_audience" className="text-gray-700 dark:text-gray-300">
                    Target Audience
                  </Label>
                  <Textarea
                    id="target_audience"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    placeholder="Describe your ideal customers, their demographics, interests, and pain points..."
                    rows={3}
                    disabled={!isEditing}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="business_goals" className="text-gray-700 dark:text-gray-300">
                    Business Goals
                  </Label>
                  <Textarea
                    id="business_goals"
                    value={formData.business_goals}
                    onChange={(e) => setFormData({ ...formData, business_goals: e.target.value })}
                    placeholder="What are your main business objectives? (e.g., increase sales, build awareness, expand market)"
                    rows={3}
                    disabled={!isEditing}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Social Media Presence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(formData.social_links || {}).map(([platform, url]) => (
                    <div key={platform}>
                      <Label className="text-gray-700 dark:text-gray-300 capitalize">
                        {platform}
                      </Label>
                      <Input
                        value={url}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: {
                            ...formData.social_links,
                            [platform]: e.target.value
                          }
                        })}
                        placeholder={`@your${platform}handle`}
                        disabled={!isEditing}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Brand Guidelines */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Brand Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="brand_guidelines" className="text-gray-700 dark:text-gray-300">
                    Guidelines & Notes
                  </Label>
                  <Textarea
                    id="brand_guidelines"
                    value={formData.brand_guidelines}
                    onChange={(e) => setFormData({ ...formData, brand_guidelines: e.target.value })}
                    placeholder="Add any specific brand guidelines, tone of voice rules, content do's and don'ts, or other important notes..."
                    rows={4}
                    disabled={!isEditing}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4 justify-end">
              <Button 
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {brand ? 'Update Brand' : 'Create Brand'}
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Brand
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{brand?.name}"? This will permanently remove all brand information and cannot be recovered. You can create a new brand after deletion.
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteBrand}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Brand
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default function BrandSetupPage() {
  return (
    <Suspense fallback={
      <DashboardLayout
        title="Brand Setup"
        description="Create and manage your brand identity"
        icon={<Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
      >
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading brand setup...</span>
        </div>
      </DashboardLayout>
    }>
      <BrandSetupPageContent />
    </Suspense>
  )
} 