export interface Message {
  id: string;
  chatId: string;
  text: string;
  timestamp: Date;
  platform: string;
  sender?: {
    id: string;
    name?: string;
    username?: string;
  };
  metadata?: Record<string, any>;
}

export interface SendMessageOptions {
  parseMode?: 'HTML' | 'Markdown';
  disableNotification?: boolean;
  replyToMessageId?: string;
  inlineKeyboard?: Array<Array<{
    text: string;
    callbackData?: string;
    url?: string;
  }>>;
}

export interface MessagingPlatform {
  name: string;
  isConnected: boolean;
  
  // Core messaging methods
  sendMessage(chatId: string, text: string, options?: SendMessageOptions): Promise<Message>;
  receiveMessage(webhookData: any): Promise<Message | null>;
  
  // Platform management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  validateWebhook(webhookData: any): boolean;
  
  // Message history
  getMessageHistory(chatId: string, limit?: number): Promise<Message[]>;
  
  // Status and info
  getStatus(): Promise<{
    connected: boolean;
    botInfo?: any;
    error?: string;
  }>;
}

export abstract class BaseMessagingPlatform implements MessagingPlatform {
  abstract name: string;
  abstract isConnected: boolean;
  
  abstract sendMessage(chatId: string, text: string, options?: SendMessageOptions): Promise<Message>;
  abstract receiveMessage(webhookData: any): Promise<Message | null>;
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract validateWebhook(webhookData: any): boolean;
  abstract getMessageHistory(chatId: string, limit?: number): Promise<Message[]>;
  abstract getStatus(): Promise<{ connected: boolean; botInfo?: any; error?: string; }>;
} 