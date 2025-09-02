'use client'

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navigation } from '@/components/layout/navigation'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Image as ImageIcon, 
  Type,
  Star,
  Save,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  AlertCircle,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  RefreshCw,
  Loader2,
  Check,
  X,
  Eye,
  Copy,
  Trash2,
  ArrowLeft,
  Send,
  FileText,
  Palette
} from 'lucide-react'

// ... existing interfaces and constants ...

interface GeneratedContent {
  id: string
  content_type: string
  brief: string
  generated_content: string
  image_url?: string
  platform?: string
  metadata?: any
  created_at: string
  updated_at: string
  status: string
  quality_score?: number
}

interface PostFormData {
  title: string
  content: string
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'all'
  selectedImage?: string
  selectedText?: string
  scheduledDate: string
  hashtags: string[]
  status: 'draft' | 'scheduled' | 'published'
}

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-sky-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
  { id: 'all', name: 'All Platforms', icon: Target, color: 'bg-gradient-to-r from-green-500 to-blue-500' }
]

export default function CreatePostPage() {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([])
  const [filteredContent, setFilteredContent] = useState<GeneratedContent[]>([])
  const [selectedTab, setSelectedTab] = useState('text')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  // Form state
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    platform: 'instagram',
    selectedImage: undefined,
    selectedText: undefined,
    scheduledDate: '',
    hashtags: [],
    status: 'draft'
  })

  // Check for edit mode
  const editId = searchParams.get('edit')
  const preSelectId = searchParams.get('select')

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

  // Load generated content
  useEffect(() => {
    loadGeneratedContent()
  }, [])

  // Load content for editing if editId is provided
  useEffect(() => {
    if (editId) {
      loadPostForEditing(editId)
    }
  }, [editId, generatedContent])

  // Pre-select content if preSelectId is provided
  useEffect(() => {
    if (preSelectId && generatedContent.length > 0) {
      const content = generatedContent.find(c => c.id === preSelectId)
      if (content) {
        handleContentSelect(content)
      }
    }
  }, [preSelectId, generatedContent])

  const loadGeneratedContent = async () => {
    try {
      setLoading(true)
      setLoadingError(null)

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        setLoadingError('Authentication required')
        return
      }

      const { data: content, error } = await supabase
        .from('content_generation')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching content:', error)
        setLoadingError('Failed to load content')
        return
      }

      setGeneratedContent(content || [])
    } catch (error) {
      console.error('Error loading content:', error)
      setLoadingError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const loadPostForEditing = async (postId: string) => {
    // This would load existing post data for editing
    // For now, we'll just set a placeholder
    setFormData(prev => ({
      ...prev,
      title: 'Editing existing post...',
      content: 'Content will be loaded here...'
    }))
  }

  // Filter content based on search and tab
  useEffect(() => {
    let filtered = generatedContent

    // Filter by content type based on selected tab
    if (selectedTab === 'text') {
      filtered = filtered.filter(item => 
        item.content_type === 'text' || 
        item.content_type === 'social_post' ||
        item.content_type === 'blog'
      )
    } else if (selectedTab === 'image') {
      filtered = filtered.filter(item => 
        item.content_type === 'image' || 
        item.image_url
      )
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.brief?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.generated_content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredContent(filtered)
  }, [generatedContent, selectedTab, searchQuery])

  const handleContentSelect = (content: GeneratedContent) => {
    if (selectedTab === 'text') {
      setFormData(prev => ({
        ...prev,
        content: content.generated_content,
        selectedText: content.id,
        title: content.brief || prev.title
      }))
    } else if (selectedTab === 'image') {
      setFormData(prev => ({
        ...prev,
        selectedImage: content.image_url,
        title: content.brief || prev.title
      }))
    }
  }

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content')
      return
    }

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // For now, we'll save to the content_generation table with a special type
      const { error } = await supabase
        .from('content_generation')
        .insert({
          user_id: user.id,
          content_type: 'social_post',
          brief: formData.title,
          generated_content: formData.content,
          image_url: formData.selectedImage,
          platform: formData.platform,
          status: formData.status,
          scheduled_date: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : null,
          metadata: {
            selectedContentIds: {
              text: formData.selectedText,
              image: formData.selectedImage
            },
            hashtags: extractHashtags(formData.content)
          }
        })

      if (error) {
        console.error('Error saving post:', error)
        alert('Failed to save post')
        return
      }

      // Redirect to social posts page
      router.push('/social-posts')
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  const extractHashtags = (content: string): string[] => {
    const hashtagRegex = /#(\w+)/g
    const matches = content.match(hashtagRegex)
    return matches ? matches.map(tag => tag.substring(1)) : []
  }

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    return platform ? platform.icon : Target
  }

  const getPlatformColor = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    return platform ? platform.color : 'bg-gray-500'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const PlatformIcon = getPlatformIcon(formData.platform)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/social-posts')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Posts</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Post
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Select from your generated content to create a social media post
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button 
                onClick={loadGeneratedContent}
                variant="outline"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Content Selection */}
          <div className="space-y-6">
            <EnhancedCard variant="glass">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-blue-600" />
                  <span>Select Generated Content</span>
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text" className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Text Content</span>
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>Images</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search generated content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Loading State */}
                    {loading && (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-spin" />
                        <p className="text-gray-500">Loading content...</p>
                      </div>
                    )}

                    {/* Error State */}
                    {loadingError && (
                      <div className="text-center py-8">
                        <AlertCircle className="w-8 h-8 text-red-300 mx-auto mb-2" />
                        <p className="text-red-600 mb-2">{loadingError}</p>
                        <Button onClick={loadGeneratedContent} variant="outline" size="sm">
                          Try Again
                        </Button>
                      </div>
                    )}

                    {/* Content List */}
                    {!loading && !loadingError && (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredContent.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500">
                              No {selectedTab === 'text' ? 'text content' : 'images'} found
                            </p>
                            <Button 
                              onClick={() => router.push('/brand-content')}
                              className="mt-2"
                              size="sm"
                            >
                              Generate Content
                            </Button>
                          </div>
                        ) : (
                          filteredContent.map((content) => {
                            const isSelected = selectedTab === 'text' 
                              ? formData.selectedText === content.id
                              : formData.selectedImage === content.image_url

                            return (
                              <div
                                key={content.id}
                                onClick={() => handleContentSelect(content)}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h3 className="font-medium text-sm">
                                        {content.brief || 'Generated Content'}
                                      </h3>
                                      {isSelected && (
                                        <Check className="w-4 h-4 text-blue-500" />
                                      )}
                                    </div>
                                    
                                    {selectedTab === 'text' ? (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                        {content.generated_content}
                                      </p>
                                    ) : (
                                      content.image_url && (
                                        <img
                                          src={content.image_url}
                                          alt="Generated"
                                          className="w-full h-24 object-cover rounded"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none'
                                          }}
                                        />
                                      )
                                    )}

                                    <div className="flex items-center space-x-2 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {content.content_type}
                                      </Badge>
                                      {content.quality_score && (
                                        <div className="flex items-center space-x-1">
                                          <Star className="w-3 h-3 text-yellow-500" />
                                          <span className={`text-xs ${getScoreColor(content.quality_score)}`}>
                                            {content.quality_score}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                </Tabs>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          {/* Right Side - Post Form */}
          <div className="space-y-6">
            <EnhancedCard variant="glass">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center space-x-2">
                  <Send className="w-5 h-5 text-purple-600" />
                  <span>Post Details</span>
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Post Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter post title..."
                  />
                </div>

                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={formData.platform} onValueChange={(value: any) => setFormData(prev => ({ ...prev, platform: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          <div className="flex items-center space-x-2">
                            <platform.icon className="w-4 h-4" />
                            <span>{platform.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content">Post Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write or edit your post content..."
                    rows={6}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    💡 Edit the selected content or write your own
                  </p>
                </div>

                <div>
                  <Label htmlFor="scheduledDate">Schedule Date & Time</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty to save as draft
                  </p>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Preview */}
            <EnhancedCard variant="glass">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <span>Preview</span>
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="space-y-4">
                  {formData.selectedImage && (
                    <div className="relative rounded-lg overflow-hidden">
                      <img 
                        src={formData.selectedImage} 
                        alt="Post preview" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">{formData.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {formData.content}
                    </p>
                  </div>

                  {/* Platform indicator */}
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${getPlatformColor(formData.platform)}`}>
                      <PlatformIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">
                      {platforms.find(p => p.id === formData.platform)?.name}
                    </span>
                  </div>

                  {/* Hashtags */}
                  {formData.content && (
                    <div className="flex flex-wrap gap-1">
                      {extractHashtags(formData.content).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </div>
      </main>
    </div>
  )
}
