'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Upload, X, Image as ImageIcon, Download } from 'lucide-react'
import { Brand } from '@/types/brand'

interface ImageUploaderProps {
  onContentGenerated: (content: any) => void
}

export function ImageUploader({ onContentGenerated }: ImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loadingBrand, setLoadingBrand] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      }
    } catch (error) {
      console.error('Error loading brand:', error)
    } finally {
      setLoadingBrand(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const invalidFiles = files.filter(file => !validTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload only JPEG, PNG, GIF, or WebP images.',
        variant: 'destructive',
      })
      return
    }

    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize)
    
    if (oversizedFiles.length > 0) {
      toast({
        title: 'File too large',
        description: 'Please upload images smaller than 10MB.',
        variant: 'destructive',
      })
      return
    }

    if (!brand) {
      toast({
        title: 'Error',
        description: 'Brand information not loaded. Please try again.',
        variant: 'destructive',
      })
      return
    }

    setUploading(true)

    // Process each file
    for (const file of files) {
      try {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const imageUrl = e.target?.result as string
          setUploadedImages(prev => [...prev, imageUrl])
          
          // Save to database
          try {
            const response = await fetch('/api/brand-content', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content_type: 'upload',
                title: `Uploaded: ${file.name}`,
                image_url: imageUrl,
                image_data: {
                  filename: file.name,
                  size: file.size,
                  type: file.type,
                },
                platform: 'general',
                brand_id: brand.id,
                metadata: {
                  uploadDate: new Date().toISOString(),
                  originalName: file.name,
                  fileSize: file.size,
                  fileType: file.type
                }
              }),
            })

            if (response.ok) {
              const { content: savedContent } = await response.json()
              
              // Add to content list with database ID
              const content = {
                text: `Uploaded image: ${file.name}`,
                image: imageUrl,
                platform: 'general',
                timestamp: Date.now(),
                id: savedContent.id,
                title: savedContent.title
              }
              
              onContentGenerated(content)
            } else {
              // Still add to local state even if database save fails
              const content = {
                text: `Uploaded image: ${file.name}`,
                image: imageUrl,
                platform: 'general',
                timestamp: Date.now()
              }
              
              onContentGenerated(content)
            }
          } catch (saveError) {
            console.error('Error saving uploaded image:', saveError)
            
            // Still add to local state even if database save fails
            const content = {
              text: `Uploaded image: ${file.name}`,
              image: imageUrl,
              platform: 'general',
              timestamp: Date.now()
            }
            
            onContentGenerated(content)
          }
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Error processing file:', error)
        toast({
          title: 'Error',
          description: `Failed to process ${file.name}`,
          variant: 'destructive',
        })
      }
    }

    setUploading(false)
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    toast({
      title: 'Success',
      description: `${files.length} image(s) uploaded and saved successfully!`,
    })
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    toast({
      title: 'Image removed',
      description: 'Image has been removed from your collection.',
    })
  }

  const downloadImage = (imageUrl: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = fileName || `brand-image-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Upload Brand Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Upload Images
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop images here, or click to select files
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports JPEG, PNG, GIF, WebP (Max 10MB per file)
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button 
              className="mt-4" 
              disabled={uploading}
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              {uploading ? 'Uploading...' : 'Select Images'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Images Gallery */}
      {uploadedImages.length > 0 && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Uploaded Images ({uploadedImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative group bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square"
                >
                  <img
                    src={imageUrl}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadImage(imageUrl, `brand-image-${index + 1}`)}
                      className="bg-white text-black hover:bg-gray-100 border-white"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeImage(index)}
                      className="bg-red-500 text-white hover:bg-red-600 border-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
            💡 Tips for better brand images:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• Use high-resolution images (at least 1080x1080 for social media)</li>
            <li>• Maintain consistent branding and color schemes</li>
            <li>• Consider different aspect ratios for different platforms</li>
            <li>• Include your logo or brand elements when appropriate</li>
            <li>• Test how images look on both light and dark backgrounds</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 