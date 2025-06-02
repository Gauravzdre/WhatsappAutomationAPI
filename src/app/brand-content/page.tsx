'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Navigation } from '@/components/layout/navigation'
import { ImageUploader } from '@/components/brand-content/image-uploader'
import { ImageGenerator } from '@/components/brand-content/image-generator'
import { PostTextGenerator } from '@/components/brand-content/post-text-generator'
import { ContentPreview } from '@/components/brand-content/content-preview'
import { Palette, Upload, Wand2, Type, Eye, RefreshCw, Sparkles, FileText, Image, Activity } from 'lucide-react'
import { BrandContent } from '@/types/brand-content'

interface GeneratedContent {
  text: string
  image?: string
  platform: string
  timestamp: number
  id?: string
  title?: string
}

export default function BrandContentPage() {
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load existing content from database
  useEffect(() => {
    loadBrandContent()
  }, [])

  const loadBrandContent = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/brand-content')
      
      if (!response.ok) {
        throw new Error('Failed to load content')
      }

      const { content } = await response.json()
      
      // Convert database format to component format
      const formattedContent: GeneratedContent[] = content.map((item: BrandContent) => ({
        text: item.text_content || item.title || 'Content',
        image: item.image_url,
        platform: item.platform || 'general',
        timestamp: new Date(item.created_at).getTime(),
        id: item.id,
        title: item.title
      }))

      setGeneratedContents(formattedContent)
    } catch (error) {
      console.error('Error loading brand content:', error)
      toast({
        title: 'Error',
        description: 'Failed to load existing content',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleContentGenerated = (content: GeneratedContent) => {
    setGeneratedContents(prev => [content, ...prev])
    toast({
      title: 'Success ✅',
      description: 'Content generated and saved successfully!',
    })
  }

  const handleContentDeleted = async (contentId: string) => {
    try {
      const response = await fetch(`/api/brand-content?id=${contentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete content')
      }

      // Remove from local state
      setGeneratedContents(prev => prev.filter(content => content.id !== contentId))
      
      toast({
        title: 'Deleted ✅',
        description: 'Content removed successfully',
      })
    } catch (error) {
      console.error('Error deleting content:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete content',
        variant: 'destructive',
      })
    }
  }

  const handleRefresh = () => {
    loadBrandContent()
    toast({
      title: 'Refreshed ✅',
      description: 'Content reloaded from database',
    })
  }

  const getContentStats = () => {
    const textContent = generatedContents.filter(c => !c.image).length
    const imageContent = generatedContents.filter(c => c.image).length
    const totalContent = generatedContents.length
    return { textContent, imageContent, totalContent }
  }

  const { textContent, imageContent, totalContent } = getContentStats()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Navigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="flex items-center space-x-2">
                <Activity className="h-6 w-6 animate-spin text-teal-600" />
                <span className="text-gray-600 dark:text-gray-300 text-lg">Loading content studio...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Navigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg">
                <Palette className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Brand Content Studio
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Create engaging social media content with AI-powered tools
                </p>
              </div>
            </div>
          </div>

          {/* Content Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <EnhancedCard variant="gradient" gradient="teal">
              <EnhancedCardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <EnhancedCardTitle className="text-lg text-white">Total Content</EnhancedCardTitle>
                  <Sparkles className="h-6 w-6 text-teal-200" />
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-bold text-white">{totalContent}</div>
                <p className="text-teal-100 text-sm mt-1">Pieces created</p>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="gradient" gradient="blue">
              <EnhancedCardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <EnhancedCardTitle className="text-lg text-white">Text Content</EnhancedCardTitle>
                  <FileText className="h-6 w-6 text-blue-200" />
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-bold text-white">{textContent}</div>
                <p className="text-blue-100 text-sm mt-1">Posts & captions</p>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="gradient" gradient="purple">
              <EnhancedCardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <EnhancedCardTitle className="text-lg text-white">Visual Content</EnhancedCardTitle>
                  <Image className="h-6 w-6 text-purple-200" />
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-3xl font-bold text-white">{imageContent}</div>
                <p className="text-purple-100 text-sm mt-1">Images & graphics</p>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end mb-6">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Content
            </Button>
          </div>

          {/* Main Content Creation Interface */}
          <EnhancedCard variant="glass">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <Palette className="h-6 w-6 text-teal-600" />
                <span>Content Creation Studio</span>
                <Badge variant="secondary" className="ml-2">{totalContent} total</Badge>
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <Tabs defaultValue="text-generator" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
                  <TabsTrigger value="text-generator" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
                    <Type className="h-4 w-4 mr-2" />
                    Text Generator
                  </TabsTrigger>
                  <TabsTrigger value="image-upload" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images
                  </TabsTrigger>
                  <TabsTrigger value="image-generator" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                    <Wand2 className="h-4 w-4 mr-2" />
                    AI Images
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-teal-600 data-[state=active]:text-white">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview ({generatedContents.length})
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="text-generator" className="space-y-4 mt-0">
                    <PostTextGenerator 
                      onContentGenerated={handleContentGenerated}
                      isGenerating={isGenerating}
                      setIsGenerating={setIsGenerating}
                    />
                  </TabsContent>

                  <TabsContent value="image-upload" className="space-y-4 mt-0">
                    <ImageUploader onContentGenerated={handleContentGenerated} />
                  </TabsContent>

                  <TabsContent value="image-generator" className="space-y-4 mt-0">
                    <ImageGenerator 
                      onContentGenerated={handleContentGenerated}
                      isGenerating={isGenerating}
                      setIsGenerating={setIsGenerating}
                    />
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4 mt-0">
                    {generatedContents.length === 0 ? (
                      <div className="text-center py-12">
                        <Palette className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No content yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Start creating amazing content with our AI-powered tools.</p>
                        <div className="flex justify-center space-x-3">
                          <Button 
                            onClick={() => {
                              const trigger = document.querySelector('[value="text-generator"]') as HTMLButtonElement
                              trigger?.click()
                            }}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                          >
                            <Type className="h-4 w-4 mr-2" />
                            Generate Text
                          </Button>
                          <Button 
                            onClick={() => {
                              const trigger = document.querySelector('[value="image-generator"]') as HTMLButtonElement
                              trigger?.click()
                            }}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                          >
                            <Wand2 className="h-4 w-4 mr-2" />
                            Generate Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <ContentPreview 
                        contents={generatedContents}
                        onContentsUpdate={setGeneratedContents}
                        onContentDeleted={handleContentDeleted}
                      />
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </div>
    </div>
  )
} 