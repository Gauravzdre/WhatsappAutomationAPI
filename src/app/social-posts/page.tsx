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
  Calendar, 
  Clock, 
  Image as ImageIcon, 
  Type,
  Star,
  Edit,
  Copy,
  Trash2,
  Eye,
  Sparkles,
  Zap,
  TrendingUp,
  Target,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Upload,
  X,
  Send,
  Save,
  RefreshCw
} from 'lucide-react'

interface SocialPost {
  id: string
  title: string
  content: string
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'all'
  postType: 'text' | 'image' | 'both'
  imageUrl?: string
  scheduledDate: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  score?: {
    overall: number
    engagement: number
    reach: number
    timing: number
    content: number
    hashtags: number
  }
  hashtags: string[]
  createdAt: string
  updatedAt: string
}

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-sky-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
  { id: 'all', name: 'All Platforms', icon: Target, color: 'bg-gradient-to-r from-green-500 to-blue-500' }
]

const postTypes = [
  { id: 'text', name: 'Text Only', icon: Type, description: 'Text-based post' },
  { id: 'image', name: 'Image Only', icon: ImageIcon, description: 'Image with caption' },
  { id: 'both', name: 'Text + Image', icon: Sparkles, description: 'Combined content' }
]

const samplePosts: SocialPost[] = [
  {
    id: '1',
    title: 'Product Launch Announcement',
    content: 'Excited to announce our new AI-powered automation platform! 🚀 Transform your business with intelligent workflows. #AI #Automation #Innovation #TechLaunch',
    platform: 'instagram',
    postType: 'both',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
    scheduledDate: '2025-01-29T10:00:00Z',
    status: 'scheduled',
    score: {
      overall: 87,
      engagement: 92,
      reach: 85,
      timing: 88,
      content: 90,
      hashtags: 82
    },
    hashtags: ['AI', 'Automation', 'Innovation', 'TechLaunch'],
    createdAt: '2025-01-28T09:00:00Z',
    updatedAt: '2025-01-28T09:00:00Z'
  },
  {
    id: '2',
    title: 'Weekly Tips - Productivity',
    content: '💡 Productivity Tip: Use automation to handle repetitive tasks and focus on what matters most. What\'s your favorite productivity hack?',
    platform: 'linkedin',
    postType: 'text',
    scheduledDate: '2025-01-30T14:00:00Z',
    status: 'draft',
    score: {
      overall: 76,
      engagement: 78,
      reach: 72,
      timing: 85,
      content: 80,
      hashtags: 65
    },
    hashtags: ['Productivity', 'Tips', 'Automation'],
    createdAt: '2025-01-28T11:00:00Z',
    updatedAt: '2025-01-28T11:00:00Z'
  }
]

export default function SocialPostsPage() {
  const [posts, setPosts] = useState<SocialPost[]>(samplePosts)
  const [filteredPosts, setFilteredPosts] = useState<SocialPost[]>(samplePosts)
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null)
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

  // Filter posts based on platform, status, and search
  useEffect(() => {
    let filtered = posts

    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(post => post.platform === selectedPlatform || post.platform === 'all')
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(post => post.status === selectedStatus)
    }

    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    setFilteredPosts(filtered)
  }, [posts, selectedPlatform, selectedStatus, searchQuery])

  const handleCreatePost = () => {
    setIsCreating(true)
    setEditingPost(null)
  }

  const handleEditPost = (post: SocialPost) => {
    setEditingPost(post)
    setIsCreating(true)
  }

  const handleDuplicatePost = (post: SocialPost) => {
    const duplicated = {
      ...post,
      id: Date.now().toString(),
      title: `${post.title} (Copy)`,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setPosts(prev => [duplicated, ...prev])
  }

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    return platform ? platform.icon : Target
  }

  const getPlatformColor = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    return platform ? platform.color : 'bg-gray-500'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500'
      case 'scheduled': return 'bg-blue-500'
      case 'draft': return 'bg-gray-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Soon'
    if (diffInHours < 24) return `In ${diffInHours}h`
    if (diffInHours < 168) return `In ${Math.floor(diffInHours / 24)}d`
    return date.toLocaleDateString()
  }

  if (isCreating) {
    return <PostEditor 
      post={editingPost} 
      onSave={(post) => {
        if (editingPost) {
          setPosts(prev => prev.map(p => p.id === post.id ? post : p))
        } else {
          setPosts(prev => [post, ...prev])
        }
        setIsCreating(false)
        setEditingPost(null)
      }}
      onCancel={() => {
        setIsCreating(false)
        setEditingPost(null)
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
                Social Media Posts
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Schedule and manage your social media content with AI-powered scoring
              </p>
            </div>
            <Button 
              onClick={handleCreatePost}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search posts by title, content, or hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {platforms.filter(p => p.id !== 'all').map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Platform Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {platforms.map((platform) => {
              const Icon = platform.icon
              const isSelected = selectedPlatform === platform.id
              const count = platform.id === 'all' 
                ? posts.length 
                : posts.filter(p => p.platform === platform.id || p.platform === 'all').length
              
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{platform.name}</span>
                  <Badge variant="secondary" className="ml-1">
                    {count}
                  </Badge>
                </button>
              )
            })}
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {searchQuery || selectedPlatform !== 'all' || selectedStatus !== 'all' ? 'No posts found' : 'No posts yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || selectedPlatform !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first social media post to get started'
              }
            </p>
            <Button onClick={handleCreatePost}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Post
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const PlatformIcon = getPlatformIcon(post.platform)
              const TypeIcon = postTypes.find(t => t.id === post.postType)?.icon || Type
              
              return (
                <EnhancedCard key={post.id} variant="glass" className="group hover:shadow-xl transition-all duration-300">
                  <EnhancedCardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getPlatformColor(post.platform)}`}>
                          <PlatformIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <EnhancedCardTitle className="text-lg font-semibold truncate">
                            {post.title}
                          </EnhancedCardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              className={`text-xs text-white ${getStatusColor(post.status)}`}
                            >
                              {post.status}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <TypeIcon className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-500 capitalize">
                                {post.postType}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </EnhancedCardHeader>
                  
                  <EnhancedCardContent className="space-y-4">
                    {/* Post Preview */}
                    <div className="space-y-3">
                      {post.imageUrl && (
                        <div className="relative rounded-lg overflow-hidden">
                          <img 
                            src={post.imageUrl} 
                            alt="Post preview" 
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                          {post.content}
                        </p>
                      </div>

                      {post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                          {post.hashtags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.hashtags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* AI Score */}
                    {post.score && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            AI Score
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className={`font-bold ${getScoreColor(post.score.overall)}`}>
                              {post.score.overall}/100
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className={`font-medium ${getScoreColor(post.score.engagement)}`}>
                              {post.score.engagement}
                            </div>
                            <div className="text-gray-500">Engagement</div>
                          </div>
                          <div className="text-center">
                            <div className={`font-medium ${getScoreColor(post.score.reach)}`}>
                              {post.score.reach}
                            </div>
                            <div className="text-gray-500">Reach</div>
                          </div>
                          <div className="text-center">
                            <div className={`font-medium ${getScoreColor(post.score.timing)}`}>
                              {post.score.timing}
                            </div>
                            <div className="text-gray-500">Timing</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scheduling Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatScheduledDate(post.scheduledDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.scheduledDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPost(post)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicatePost(post)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePost(post.id)}
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

// Post Editor Component
function PostEditor({ 
  post, 
  onSave, 
  onCancel 
}: { 
  post: SocialPost | null
  onSave: (post: SocialPost) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    platform: post?.platform || 'instagram' as const,
    postType: post?.postType || 'text' as const,
    imageUrl: post?.imageUrl || '',
    scheduledDate: post?.scheduledDate ? new Date(post.scheduledDate).toISOString().slice(0, 16) : '',
    hashtags: post?.hashtags.join(', ') || ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [generatingScore, setGeneratingScore] = useState(false)
  const [aiScore, setAiScore] = useState(post?.score || null)

  const generateAIScore = async () => {
    if (!formData.content.trim()) {
      setErrors({ content: 'Content is required to generate score' })
      return
    }

    setGeneratingScore(true)
    
    // Simulate AI scoring
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockScore = {
      overall: Math.floor(Math.random() * 30) + 70, // 70-100
      engagement: Math.floor(Math.random() * 30) + 70,
      reach: Math.floor(Math.random() * 30) + 70,
      timing: Math.floor(Math.random() * 30) + 70,
      content: Math.floor(Math.random() * 30) + 70,
      hashtags: Math.floor(Math.random() * 30) + 70
    }
    
    setAiScore(mockScore)
    setGeneratingScore(false)
  }

  const handleSave = async () => {
    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.content.trim()) newErrors.content = 'Content is required'
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Scheduled date is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    
    const savedPost: SocialPost = {
      id: post?.id || Date.now().toString(),
      title: formData.title.trim(),
      content: formData.content.trim(),
      platform: formData.platform,
      postType: formData.postType,
      imageUrl: formData.imageUrl || undefined,
      scheduledDate: new Date(formData.scheduledDate).toISOString(),
      status: post?.status || 'draft',
      score: aiScore || undefined,
      hashtags: formData.hashtags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: post?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onSave(savedPost)
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Navigation />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {post ? 'Edit Post' : 'Create New Post'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {post ? 'Update your social media post' : 'Create and schedule your social media content'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <EnhancedCard variant="glass">
              <EnhancedCardContent className="p-6 space-y-6">
                <div>
                  <Label htmlFor="title">Post Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Product Launch Announcement"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select value={formData.platform} onValueChange={(value: any) => setFormData(prev => ({ ...prev, platform: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map((platform) => (
                          <SelectItem key={platform.id} value={platform.id}>
                            {platform.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="postType">Post Type</Label>
                    <Select value={formData.postType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, postType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {postTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Post Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your post content here..."
                    rows={6}
                    className={errors.content ? 'border-red-500' : ''}
                  />
                  {errors.content && <p className="text-sm text-red-600 mt-1">{errors.content}</p>}
                  <p className="text-sm text-gray-500 mt-2">
                    💡 Include emojis and hashtags to increase engagement
                  </p>
                </div>

                {(formData.postType === 'image' || formData.postType === 'both') && (
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter an image URL or upload an image
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledDate">Scheduled Date & Time *</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className={errors.scheduledDate ? 'border-red-500' : ''}
                    />
                    {errors.scheduledDate && <p className="text-sm text-red-600 mt-1">{errors.scheduledDate}</p>}
                  </div>

                  <div>
                    <Label htmlFor="hashtags">Hashtags</Label>
                    <Input
                      id="hashtags"
                      value={formData.hashtags}
                      onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
                      placeholder="AI, Automation, Innovation"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separate hashtags with commas
                    </p>
                  </div>
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
                        <Save className="w-4 h-4 mr-2" />
                        Save Post
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={onCancel} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          {/* AI Score Panel */}
          <div className="space-y-6">
            <EnhancedCard variant="glass">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>AI Post Score</span>
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-4">
                <Button
                  onClick={generateAIScore}
                  disabled={generatingScore || !formData.content.trim()}
                  className="w-full"
                  variant="outline"
                >
                  {generatingScore ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate Score
                    </>
                  )}
                </Button>

                {aiScore && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {aiScore.overall}/100
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Overall Score
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { label: 'Engagement', value: aiScore.engagement, icon: TrendingUp },
                        { label: 'Reach', value: aiScore.reach, icon: Target },
                        { label: 'Timing', value: aiScore.timing, icon: Clock },
                        { label: 'Content', value: aiScore.content, icon: Type },
                        { label: 'Hashtags', value: aiScore.hashtags, icon: Zap }
                      ].map((metric) => {
                        const Icon = metric.icon
                        return (
                          <div key={metric.label} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{metric.label}</span>
                            </div>
                            <span className={`font-medium ${
                              metric.value >= 80 ? 'text-green-600' :
                              metric.value >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {metric.value}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 space-y-1">
                  <p>💡 <strong>Tips to improve score:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Use relevant hashtags</li>
                    <li>Post at optimal times</li>
                    <li>Include engaging visuals</li>
                    <li>Ask questions to encourage interaction</li>
                  </ul>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Preview */}
            {formData.content && (
              <EnhancedCard variant="glass">
                <EnhancedCardHeader>
                  <EnhancedCardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-gray-600" />
                    <span>Preview</span>
                  </EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <div className="space-y-3">
                    {formData.imageUrl && (
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {formData.content}
                    </p>
                    {formData.hashtags && (
                      <div className="flex flex-wrap gap-1">
                        {formData.hashtags.split(',').map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 