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
import { Loader2, Wand2, Download, Copy, RefreshCw, Building2, Palette } from 'lucide-react'
import { Brand } from '@/types/brand'

interface ImageGeneratorProps {
  onContentGenerated: (content: any) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
}

const imageStyles = [
  { value: 'realistic', label: 'Realistic', description: 'Photorealistic, natural looking' },
  { value: 'artistic', label: 'Artistic', description: 'Creative, artistic interpretation' },
  { value: 'minimal', label: 'Minimal', description: 'Clean, simple, modern' },
  { value: 'vintage', label: 'Vintage', description: 'Retro, classic aesthetic' },
  { value: 'corporate', label: 'Corporate', description: 'Professional, business-like' },
  { value: 'playful', label: 'Playful', description: 'Fun, colorful, energetic' },
]

const aspectRatios = [
  { value: '1:1', label: 'Square (1:1)', description: 'Perfect for Instagram posts' },
  { value: '16:9', label: 'Landscape (16:9)', description: 'Great for Facebook, Twitter' },
  { value: '9:16', label: 'Portrait (9:16)', description: 'Ideal for Instagram Stories, TikTok' },
  { value: '4:3', label: 'Classic (4:3)', description: 'Traditional photo format' },
]

const colorSchemes = [
  'Vibrant and colorful',
  'Monochromatic',
  'Pastel colors',
  'Bold and contrasting',
  'Earth tones',
  'Black and white',
  'Brand colors',
]

export function ImageGenerator({ onContentGenerated, isGenerating, setIsGenerating }: ImageGeneratorProps) {
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loadingBrand, setLoadingBrand] = useState(true)
  const [formData, setFormData] = useState({
    prompt: '',
    style: '',
    aspectRatio: '1:1',
    colorScheme: '',
    brandElements: '',
    productName: '',
    additionalDetails: '',
    useBrandContext: true
  })
  
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [lastPrompt, setLastPrompt] = useState('')

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
            brandElements: prev.brandElements || (brand.name ? `${brand.name} branding` : ''),
            colorScheme: prev.colorScheme || (brand.brand_colors?.length ? 'Brand colors' : ''),
            style: prev.style || (brand.brand_voice === 'Playful' ? 'playful' : 
                                 brand.brand_voice === 'Luxury' ? 'artistic' : 
                                 brand.brand_voice === 'Professional' ? 'corporate' : '')
          }))
        }
      }
    } catch (error) {
      console.error('Error loading brand:', error)
    } finally {
      setLoadingBrand(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a description for the image you want to generate',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    
    try {
      const requestBody = {
        ...formData,
        brandContext: formData.useBrandContext ? brand : null
      }

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate image')
      }

      const { imageUrl, enhancedPrompt, savedContent } = await response.json()
      
      setGeneratedImages(prev => [imageUrl, ...prev])
      setLastPrompt(enhancedPrompt)
      
      const content = {
        text: `AI Generated Image: ${formData.productName || 'Custom Image'}`,
        image: imageUrl,
        platform: 'general',
        timestamp: Date.now(),
        id: savedContent?.id,
        title: savedContent?.title || `AI Generated: ${formData.productName || 'Image'}`,
        metadata: {
          usedBrandContext: formData.useBrandContext,
          enhancedPrompt
        }
      }
      
      onContentGenerated(content)
      
      toast({
        title: 'Success',
        description: 'Brand-consistent image generated successfully!',
      })
      
    } catch (error) {
      console.error('Error generating image:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate image. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-generated-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download image',
        variant: 'destructive',
      })
    }
  }

  const copyPrompt = () => {
    if (lastPrompt) {
      navigator.clipboard.writeText(lastPrompt)
      toast({
        title: 'Copied!',
        description: 'Enhanced prompt copied to clipboard',
      })
    }
  }

  const generateVariation = () => {
    if (lastPrompt) {
      setFormData(prev => ({ ...prev, prompt: prev.prompt + ' (variation)' }))
      handleSubmit(new Event('submit') as any)
    }
  }

  const getBrandColorDisplay = () => {
    if (!brand?.brand_colors?.length) return null
    return (
      <div className="flex gap-1 mt-1">
        {brand.brand_colors.slice(0, 4).map((color, index) => (
          <div
            key={index}
            className="w-4 h-4 rounded border border-gray-300"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
        {brand.brand_colors.length > 4 && (
          <span className="text-xs text-gray-500">+{brand.brand_colors.length - 4}</span>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Wand2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Brand-Aware AI Image Generator
          </CardTitle>
          {brand && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Building2 className="h-4 w-4" />
              {brand.name}
              <Badge variant="secondary" className="text-xs">
                {brand.brand_voice || 'Professional'}
              </Badge>
              {brand.brand_colors?.length && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  {brand.brand_colors.length} colors
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Brand Context Toggle */}
            {brand && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100">Brand Visual Identity</h3>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.useBrandContext}
                      onChange={(e) => setFormData({ ...formData, useBrandContext: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-purple-800 dark:text-purple-200">Use brand context</span>
                  </label>
                </div>
                {formData.useBrandContext && (
                  <div className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                    <p><strong>Industry:</strong> {brand.industry || 'Not specified'}</p>
                    <p><strong>Voice:</strong> {brand.brand_voice || 'Professional'}</p>
                    {brand.brand_colors?.length && (
                      <div>
                        <strong>Brand Colors:</strong>
                        {getBrandColorDisplay()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Basic Description */}
            <div>
              <Label htmlFor="prompt" className="text-gray-700 dark:text-gray-300">
                Image Description *
              </Label>
              <Textarea
                id="prompt"
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Describe the image you want to generate (e.g., 'A modern office workspace with plants and natural lighting')"
                required
                rows={3}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Product Context */}
            <div>
              <Label htmlFor="productName" className="text-gray-700 dark:text-gray-300">
                Product/Brand Name {brand?.name && '(from brand)'}
              </Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder={brand?.name || "e.g., TechCorp, Premium Coffee"}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Style Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Visual Style</h3>
              
              <div>
                <Label htmlFor="style" className="text-gray-700 dark:text-gray-300">
                  Style {brand?.brand_voice && '(suggested from brand voice)'}
                </Label>
                <Select value={formData.style} onValueChange={(value) => setFormData({ ...formData, style: value })}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div>
                          <div className="font-medium">{style.label}</div>
                          <div className="text-xs text-gray-500">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="aspectRatio" className="text-gray-700 dark:text-gray-300">
                  Aspect Ratio
                </Label>
                <Select value={formData.aspectRatio} onValueChange={(value) => setFormData({ ...formData, aspectRatio: value })}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select aspect ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatios.map((ratio) => (
                      <SelectItem key={ratio.value} value={ratio.value}>
                        <div>
                          <div className="font-medium">{ratio.label}</div>
                          <div className="text-xs text-gray-500">{ratio.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="colorScheme" className="text-gray-700 dark:text-gray-300">
                  Color Scheme {brand?.brand_colors?.length && '(brand colors available)'}
                </Label>
                <Select value={formData.colorScheme} onValueChange={(value) => setFormData({ ...formData, colorScheme: value })}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorSchemes.map((scheme) => (
                      <SelectItem key={scheme} value={scheme.toLowerCase().replace(/\s+/g, '-')}>
                        {scheme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.colorScheme === 'brand-colors' && brand?.brand_colors?.length && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Your brand colors:</p>
                    {getBrandColorDisplay()}
                  </div>
                )}
              </div>
            </div>

            {/* Brand Integration */}
            <div>
              <Label htmlFor="brandElements" className="text-gray-700 dark:text-gray-300">
                Brand Elements to Include
              </Label>
              <Input
                id="brandElements"
                value={formData.brandElements}
                onChange={(e) => setFormData({ ...formData, brandElements: e.target.value })}
                placeholder={brand ? `${brand.name} logo, branding` : "e.g., logo, specific textures, patterns"}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Additional Details */}
            <div>
              <Label htmlFor="additionalDetails" className="text-gray-700 dark:text-gray-300">
                Additional Details
              </Label>
              <Textarea
                id="additionalDetails"
                value={formData.additionalDetails}
                onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                placeholder="Any specific requirements, mood, or styling details..."
                rows={2}
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
                  Generating Brand-Consistent Image...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Brand-Aware Image
                </>
              )}
            </Button>

            {!brand && (
              <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                <Building2 className="inline w-4 h-4 mr-1" />
                Set up your brand profile for enhanced, consistent image generation
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Generated Images */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 dark:text-white">Generated Images</CardTitle>
            {lastPrompt && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyPrompt}
                  className="border-gray-300 dark:border-gray-600"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Prompt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateVariation}
                  disabled={isGenerating}
                  className="border-gray-300 dark:border-gray-600"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Variation
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {generatedImages.length > 0 ? (
            <div className="space-y-4">
              {generatedImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Generated image ${index + 1}`}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadImage(imageUrl)}
                      className="bg-white text-black hover:bg-gray-100 border-white"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                  {index === 0 && formData.useBrandContext && brand && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="outline" className="bg-white text-xs">
                        Brand-Aware
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wand2 className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                Describe your image and generate brand-consistent visuals
              </p>
              {brand && (
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  <Building2 className="inline w-4 h-4 mr-1" />
                  Using {brand.name} brand context for consistent styling
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 