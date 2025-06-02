'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Loader2, Wand2, Copy, Download, Upload, Image as ImageIcon, Eye, Building2 } from 'lucide-react'
import { Brand } from '@/types/brand'

interface PostTextGeneratorProps {
  onContentGenerated: (content: any) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
}

const platforms = [
  { value: 'instagram', label: 'Instagram', maxLength: 2200 },
  { value: 'facebook', label: 'Facebook', maxLength: 63206 },
  { value: 'twitter', label: 'Twitter/X', maxLength: 280 },
  { value: 'linkedin', label: 'LinkedIn', maxLength: 3000 },
  { value: 'tiktok', label: 'TikTok', maxLength: 2200 },
]

const tones = [
  'Professional', 'Casual', 'Funny', 'Inspiring', 'Educational', 
  'Promotional', 'Storytelling', 'Question-based', 'Behind-the-scenes'
]

const contentTypes = [
  'Product Launch', 'Product Feature', 'Brand Story', 'Customer Testimonial',
  'Educational Content', 'Promotional Offer', 'Event Announcement', 'Company Update'
]

export function PostTextGenerator({ onContentGenerated, isGenerating, setIsGenerating }: PostTextGeneratorProps) {
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loadingBrand, setLoadingBrand] = useState(true)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    targetAudience: '',
    keyBenefits: '',
    callToAction: '',
    platform: '',
    tone: '',
    contentType: '',
    includeHashtags: true,
    includeEmojis: true,
    additionalPrompt: '',
    useBrandContext: true,
    includeImageAnalysis: true
  })
  
  const [generatedText, setGeneratedText] = useState('')

  // Load brand information on component mount
  useEffect(() => {
    loadBrandInfo()
  }, [])

  const loadBrandInfo = async () => {
    try {
      setLoadingBrand(true)
      const response = await fetch('/api/brands')
      
      if (response.ok) {
        const { brand } = await response.json()
        setBrand(brand)
        
        // Pre-fill form with brand info if available
        if (brand) {
          setFormData(prev => ({
            ...prev,
            targetAudience: prev.targetAudience || brand.target_audience || '',
            tone: prev.tone || brand.brand_voice?.toLowerCase() || ''
          }))
        }
      }
    } catch (error) {
      console.error('Error loading brand:', error)
    } finally {
      setLoadingBrand(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const imageUrls: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue

      // Create a data URL for the image
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          imageUrls.push(reader.result as string)
          if (imageUrls.length === files.length) {
            setUploadedImages(prev => [...prev, ...imageUrls])
          }
        }
      }
      reader.readAsDataURL(file)
    }

    toast({
      title: 'Images uploaded',
      description: `${files.length} image(s) added for analysis`,
    })
  }

  const removeImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.platform) {
      toast({
        title: 'Error',
        description: 'Please select a platform',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    
    try {
      const requestBody = {
        ...formData,
        brandContext: formData.useBrandContext ? brand : null,
        referenceImages: formData.includeImageAnalysis ? uploadedImages : []
      }

      const response = await fetch('/api/generate-post-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const { generatedText, savedContent, imageAnalysis } = await response.json()
      setGeneratedText(generatedText)
      
      // Add to content list
      const content = {
        text: generatedText,
        platform: formData.platform,
        timestamp: Date.now(),
        id: savedContent?.id,
        title: savedContent?.title || `${formData.platform} post for ${formData.productName}`,
        metadata: {
          usedBrandContext: formData.useBrandContext,
          analyzedImages: uploadedImages.length,
          imageAnalysis: imageAnalysis
        }
      }
      
      onContentGenerated(content)
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate post text. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (generatedText) {
      await navigator.clipboard.writeText(generatedText)
      toast({
        title: 'Copied!',
        description: 'Post text copied to clipboard',
      })
    }
  }

  const selectedPlatform = platforms.find(p => p.value === formData.platform)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Wand2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Brand-Aware AI Post Generator
          </CardTitle>
          {brand && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Building2 className="h-4 w-4" />
              {brand.name}
              <Badge variant="secondary" className="text-xs">
                {brand.brand_voice || 'Professional'}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Brand Context Toggle */}
            {brand && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Brand Context</h3>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.useBrandContext}
                      onChange={(e) => setFormData({ ...formData, useBrandContext: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-blue-800 dark:text-blue-200">Use brand information</span>
                  </label>
                </div>
                {formData.useBrandContext && (
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <p><strong>Industry:</strong> {brand.industry || 'Not specified'}</p>
                    <p><strong>Voice:</strong> {brand.brand_voice || 'Professional'}</p>
                    <p><strong>Audience:</strong> {brand.target_audience || 'General'}</p>
                  </div>
                )}
              </div>
            )}

            {/* Image Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Reference Images</h3>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeImageAnalysis}
                    onChange={(e) => setFormData({ ...formData, includeImageAnalysis: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Analyze images</span>
                </label>
              </div>
              
              {formData.includeImageAnalysis && (
                <>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> mockups or reference images
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP (MAX. 10MB each)</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Uploaded Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {uploadedImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Reference ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Product Information</h3>
              
              <div>
                <Label htmlFor="productName" className="text-gray-700 dark:text-gray-300">
                  Product/Service Name *
                </Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g., Premium Coffee Beans"
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <Label htmlFor="productDescription" className="text-gray-700 dark:text-gray-300">
                  Product Description *
                </Label>
                <Textarea
                  id="productDescription"
                  value={formData.productDescription}
                  onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                  placeholder="Describe your product, its features, and what makes it unique..."
                  required
                  rows={3}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <Label htmlFor="keyBenefits" className="text-gray-700 dark:text-gray-300">
                  Key Benefits
                </Label>
                <Textarea
                  id="keyBenefits"
                  value={formData.keyBenefits}
                  onChange={(e) => setFormData({ ...formData, keyBenefits: e.target.value })}
                  placeholder="List the main benefits your customers get..."
                  rows={2}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Audience & Platform */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Audience & Platform</h3>
              
              <div>
                <Label htmlFor="targetAudience" className="text-gray-700 dark:text-gray-300">
                  Target Audience {brand?.target_audience && '(from brand)'}
                </Label>
                <Input
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder={brand?.target_audience || "e.g., Coffee enthusiasts aged 25-45"}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <Label htmlFor="platform" className="text-gray-700 dark:text-gray-300">
                  Platform *
                </Label>
                <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPlatform && (
                  <p className="text-sm text-gray-500 mt-1">
                    Character limit: {selectedPlatform.maxLength.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Style & Tone */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Style & Tone</h3>
              
              <div>
                <Label htmlFor="tone" className="text-gray-700 dark:text-gray-300">
                  Tone {brand?.brand_voice && '(from brand)'}
                </Label>
                <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder={brand?.brand_voice || "Select tone"} />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((tone) => (
                      <SelectItem key={tone} value={tone.toLowerCase()}>
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contentType" className="text-gray-700 dark:text-gray-300">
                  Content Type
                </Label>
                <Select value={formData.contentType} onValueChange={(value) => setFormData({ ...formData, contentType: value })}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeHashtags}
                    onChange={(e) => setFormData({ ...formData, includeHashtags: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include hashtags</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeEmojis}
                    onChange={(e) => setFormData({ ...formData, includeEmojis: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include emojis</span>
                </label>
              </div>
            </div>

            {/* Additional Instructions */}
            <div>
              <Label htmlFor="additionalPrompt" className="text-gray-700 dark:text-gray-300">
                Additional Instructions
              </Label>
              <Textarea
                id="additionalPrompt"
                value={formData.additionalPrompt}
                onChange={(e) => setFormData({ ...formData, additionalPrompt: e.target.value })}
                placeholder="Any specific requirements or style preferences..."
                rows={2}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="callToAction" className="text-gray-700 dark:text-gray-300">
                Call to Action
              </Label>
              <Input
                id="callToAction"
                value={formData.callToAction}
                onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
                placeholder="e.g., Shop now, Learn more, Sign up..."
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isGenerating || (!brand && formData.useBrandContext)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating with Brand Context...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Brand-Aware Post
                </>
              )}
            </Button>

            {!brand && (
              <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                <Building2 className="inline w-4 h-4 mr-1" />
                Set up your brand profile for enhanced, consistent content generation
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Generated Content */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Generated Content</CardTitle>
        </CardHeader>
        <CardContent>
          {generatedText ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {formData.platform && (
                    <Badge variant="secondary" className="capitalize">
                      {formData.platform}
                    </Badge>
                  )}
                  {formData.useBrandContext && brand && (
                    <Badge variant="outline" className="text-xs">
                      Brand-Aware
                    </Badge>
                  )}
                  {uploadedImages.length > 0 && formData.includeImageAnalysis && (
                    <Badge variant="outline" className="text-xs">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      {uploadedImages.length} images analyzed
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    {generatedText.length} characters
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-sans">
                  {generatedText}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wand2 className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                Upload reference images and fill out the form to create AI-powered, brand-consistent content
              </p>
              {brand && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <Building2 className="inline w-4 h-4 mr-1" />
                  Using {brand.name} brand context for consistent messaging
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 