'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/navigation'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Image as ImageIcon, 
  Type,
  Star,
  Edit,
  Copy,
  Trash2,
  Sparkles,
  Zap,
  TrendingUp,
  Target,
  BarChart3,
  AlertCircle,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  RefreshCw,
  Loader2
} from 'lucide-react'

interface SocialPost {
  id: string
  title: string
  content: string
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'all' | string
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

// Database content interface
interface DatabaseContent {
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

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-sky-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
  { id: 'all', name: 'All Platforms', icon: Target, color: 'bg-gradient-to-r from-green-500 to-blue-500' }
]

export default function SocialPostsPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<SocialPost[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  
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

  // Load content from database
  useEffect(() => {
    loadContentFromDatabase()
  }, [])

  const loadContentFromDatabase = async () => {
    try {
      setLoading(true)
      setLoadingError(null)

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        setLoadingError('Authentication required')
        return
      }

      // Fetch content from database
      const { data: content, error } = await supabase
        .from('content_generation')
        .select(`
          *,
          brands(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching content:', error)
        setLoadingError('Failed to load content')
        return
      }

      // Transform database content to social posts
      const transformedPosts: SocialPost[] = (content || []).map((item: DatabaseContent) => {
        // Extract hashtags from metadata or content
        const hashtags = item.metadata?.hashtags || 
          extractHashtags(item.generated_content)

        // Determine post type
        let postType: 'text' | 'image' | 'both' = 'text'
        if (item.content_type === 'image') {
          postType = 'image'
        } else if (item.image_url) {
          postType = 'both'
        }

        // Generate mock score if quality_score exists
        const score = item.quality_score ? {
          overall: item.quality_score,
          engagement: Math.floor(item.quality_score * 0.9),
          reach: Math.floor(item.quality_score * 0.85),
          timing: Math.floor(item.quality_score * 0.95),
          content: Math.floor(item.quality_score * 0.88),
          hashtags: Math.floor(item.quality_score * 0.82)
        } : undefined

        return {
          id: item.id,
          title: item.brief || 'Generated Content',
          content: item.generated_content,
          platform: (item.platform as any) || 'all',
          postType,
          imageUrl: item.image_url,
          scheduledDate: item.created_at, // Use created_at as scheduled date for now
          status: item.status === 'completed' ? 'published' : 
                 item.status === 'pending' ? 'draft' : 
                 item.status === 'failed' ? 'failed' : 'draft',
          score,
          hashtags,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }
      })

      setPosts(transformedPosts)
    } catch (error) {
      console.error('Error loading content:', error)
      setLoadingError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  // Extract hashtags from text content
  const extractHashtags = (content: string): string[] => {
    const hashtagRegex = /#(\w+)/g
    const matches = content.match(hashtagRegex)
    return matches ? matches.map(tag => tag.substring(1)) : []
  }

  // Filter posts based on platform and search
  useEffect(() => {
    let filtered = posts

    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(post => post.platform === selectedPlatform || post.platform === 'all')
    }

    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    setFilteredPosts(filtered)
  }, [posts, selectedPlatform, searchQuery])

  const handleDeletePost = async (postId: string) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('content_generation')
        .delete()
        .eq('id', postId)

      if (error) {
        console.error('Error deleting post:', error)
        return
      }

      // Update local state
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch (error) {
      console.error('Error deleting post:', error)
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Social Media Scheduler
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                View and manage your generated social media content
              </p>
            </div>
            <div className="flex space-x-4">
              <Button 
                onClick={loadContentFromDatabase}
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
                onClick={() => router.push('/brand-content')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate Content
              </Button>
            </div>
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Loading your content...
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Fetching your generated social media posts
            </p>
          </div>
        )}

        {/* Error State */}
        {loadingError && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Content
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {loadingError}
            </p>
            <Button onClick={loadContentFromDatabase} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && !loadingError && filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {searchQuery || selectedPlatform !== 'all' ? 'No posts found' : 'No posts yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || selectedPlatform !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Generate some content first to see it here'
              }
            </p>
            <Button onClick={() => router.push('/brand-content')}>
              <Plus className="w-4 h-4 mr-2" />
              Generate Content
            </Button>
          </div>
        ) : (
          !loading && !loadingError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => {
                const PlatformIcon = getPlatformIcon(post.platform)
                const TypeIcon = post.postType === 'image' ? ImageIcon : post.postType === 'both' ? Sparkles : Type
                
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
                              onError={(e) => {
                                // Hide image if it fails to load
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
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
                          onClick={() => router.push(`/brand-content?edit=${post.id}`)}
                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
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
          )
        )}
      </main>
    </div>
  )
}
