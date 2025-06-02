'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { 
  Download, 
  Copy, 
  Trash2, 
  Edit, 
  Share, 
  Instagram, 
  Facebook, 
  Twitter,
  Linkedin,
  Eye,
  FileText
} from 'lucide-react'

interface GeneratedContent {
  text: string
  image?: string
  platform: string
  timestamp: number
  id?: string
  title?: string
}

interface ContentPreviewProps {
  contents: GeneratedContent[]
  onContentsUpdate: (contents: GeneratedContent[]) => void
  onContentDeleted?: (contentId: string) => void
}

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  general: FileText
}

const platformColors = {
  instagram: 'bg-pink-500',
  facebook: 'bg-blue-600',
  twitter: 'bg-sky-500',
  linkedin: 'bg-blue-700',
  general: 'bg-gray-500'
}

export function ContentPreview({ contents, onContentsUpdate, onContentDeleted }: ContentPreviewProps) {
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null)

  const copyContent = (content: GeneratedContent) => {
    navigator.clipboard.writeText(content.text)
    toast({
      title: 'Copied!',
      description: 'Content copied to clipboard',
    })
  }

  const downloadContent = (content: GeneratedContent) => {
    const data = {
      text: content.text,
      platform: content.platform,
      timestamp: new Date(content.timestamp).toISOString(),
      ...(content.image && { image: content.image }),
      ...(content.title && { title: content.title })
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `brand-content-${content.timestamp}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast({
      title: 'Downloaded!',
      description: 'Content exported as JSON file',
    })
  }

  const downloadImage = async (imageUrl: string, timestamp: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `brand-image-${timestamp}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'Downloaded!',
        description: 'Image downloaded successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download image',
        variant: 'destructive',
      })
    }
  }

  const deleteContent = (content: GeneratedContent) => {
    if (content.id && onContentDeleted) {
      // Delete from database via parent component
      onContentDeleted(content.id)
    } else {
      // Fallback: remove from local state only (for legacy content without database ID)
      const updatedContents = contents.filter(c => c.timestamp !== content.timestamp)
      onContentsUpdate(updatedContents)
      toast({
        title: 'Deleted',
        description: 'Content removed from collection',
      })
    }
  }

  const exportAllContent = () => {
    if (contents.length === 0) {
      toast({
        title: 'No content',
        description: 'No content available to export',
        variant: 'destructive',
      })
      return
    }

    const exportData = {
      exported_at: new Date().toISOString(),
      total_items: contents.length,
      contents: contents.map(content => ({
        text: content.text,
        platform: content.platform,
        timestamp: new Date(content.timestamp).toISOString(),
        has_image: !!content.image
      }))
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `brand-content-collection-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast({
      title: 'Exported!',
      description: 'All content exported successfully',
    })
  }

  const clearAllContent = () => {
    if (window.confirm('Are you sure you want to clear all content? This action cannot be undone.')) {
      onContentsUpdate([])
      toast({
        title: 'Cleared',
        description: 'All content has been removed',
      })
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const PlatformIcon = ({ platform }: { platform: string }) => {
    const Icon = platformIcons[platform as keyof typeof platformIcons] || FileText
    return <Icon className="h-4 w-4" />
  }

  if (contents.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Eye className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No content yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Generate some content using the other tabs to see your creations here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Generated Content ({contents.length})
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportAllContent}
            className="border-gray-300 dark:border-gray-600"
          >
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button
            variant="outline"
            onClick={clearAllContent}
            className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map((content, index) => (
          <Card 
            key={content.timestamp} 
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge 
                  variant="secondary" 
                  className={`${platformColors[content.platform as keyof typeof platformColors]} text-white capitalize flex items-center gap-1`}
                >
                  <PlatformIcon platform={content.platform} />
                  {content.platform}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyContent(content)}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadContent(content)}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteContent(content)}
                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image if available */}
              {content.image && (
                <div className="relative group">
                  <img
                    src={content.image}
                    alt="Generated content"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadImage(content.image!, content.timestamp)}
                      className="bg-white text-black hover:bg-gray-100 border-white"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Text content */}
              <div className="space-y-2">
                <div className="max-h-24 overflow-hidden">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
                    {content.text}
                  </p>
                </div>
                {content.text.length > 150 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedContent(content)}
                    className="text-blue-600 dark:text-blue-400 p-0 h-auto"
                  >
                    Read more...
                  </Button>
                )}
              </div>

              {/* Metadata */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatDate(content.timestamp)}</span>
                  <span>{content.text.length} chars</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal for full content view */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <PlatformIcon platform={selectedContent.platform} />
                  {selectedContent.platform.charAt(0).toUpperCase() + selectedContent.platform.slice(1)} Content
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedContent(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedContent.image && (
                <img
                  src={selectedContent.image}
                  alt="Generated content"
                  className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
                />
              )}
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-sans">
                  {selectedContent.text}
                </pre>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>Created: {formatDate(selectedContent.timestamp)}</span>
                <span>{selectedContent.text.length} characters</span>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => copyContent(selectedContent)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </Button>
                <Button variant="outline" onClick={() => downloadContent(selectedContent)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 