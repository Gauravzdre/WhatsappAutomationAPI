export interface Brand {
  id: string
  user_id: string
  name: string
  description?: string
  industry?: string
  target_audience?: string
  brand_voice?: string
  brand_colors?: string[]
  logo_url?: string
  website?: string
  social_links?: {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
    tiktok?: string
    youtube?: string
  }
  business_goals?: string
  unique_value_proposition?: string
  brand_guidelines?: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface BrandChatConversation {
  id: string
  brand_id: string
  chat_type: 'scaling' | 'sales_strategy' | 'content_strategy'
  title?: string
  messages: ChatMessage[]
  context_data?: {
    content_id?: string
    client_data?: any
    schedule_data?: any
    [key: string]: any
  }
  created_at: string
  updated_at: string
}

export interface CreateBrandRequest {
  name: string
  description?: string
  industry?: string
  target_audience?: string
  brand_voice?: string
  brand_colors?: string[]
  logo_url?: string
  website?: string
  social_links?: {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
    tiktok?: string
    youtube?: string
  }
  business_goals?: string
  unique_value_proposition?: string
  brand_guidelines?: string
}

export interface UpdateBrandRequest extends Partial<CreateBrandRequest> {
  id: string
}

export interface CreateChatRequest {
  brand_id: string
  chat_type: 'scaling' | 'sales_strategy' | 'content_strategy'
  title?: string
  initial_message: string
  context_data?: {
    content_id?: string
    client_data?: any
    schedule_data?: any
    [key: string]: any
  }
}

export interface AddMessageRequest {
  conversation_id: string
  message: string
} 