export interface BrandContent {
  id: string
  user_id: string
  content_type: 'text' | 'image' | 'upload'
  title?: string
  text_content?: string
  image_url?: string
  image_data?: {
    filename?: string
    size?: number
    type?: string
    dimensions?: {
      width: number
      height: number
    }
  }
  platform?: string
  metadata?: {
    [key: string]: any
  }
  created_at: string
  updated_at: string
}

export interface GeneratedContent {
  text: string
  image?: string
  platform: string
  timestamp: number
  id?: string // Database ID when saved
  title?: string
}

export interface CreateBrandContentRequest {
  content_type: 'text' | 'image' | 'upload'
  title?: string
  text_content?: string
  image_url?: string
  image_data?: {
    filename?: string
    size?: number
    type?: string
    dimensions?: {
      width: number
      height: number
    }
  }
  platform?: string
  metadata?: {
    [key: string]: any
  }
} 