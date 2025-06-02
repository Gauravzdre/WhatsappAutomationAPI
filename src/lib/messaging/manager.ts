import { MessagingPlatform, Message, SendMessageOptions } from './base';
import { TelegramPlatform } from './telegram';

export class MessagingManager {
  private platforms: Map<string, MessagingPlatform> = new Map();
  private defaultPlatform?: string;

  constructor() {
    // Initialize platforms from environment variables
    this.initializePlatforms();
  }

  private initializePlatforms() {
    // Initialize Telegram if token is available
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    
    if (telegramToken) {
      const telegram = new TelegramPlatform(telegramToken, webhookUrl);
      this.platforms.set('telegram', telegram);
      
      // Set as default if no default is set
      if (!this.defaultPlatform) {
        this.defaultPlatform = 'telegram';
      }
    }
  }

  async connectAll(): Promise<void> {
    const connections = Array.from(this.platforms.values()).map(platform => 
      platform.connect().catch(error => {
        console.error(`Failed to connect ${platform.name}:`, error);
        return null;
      })
    );

    await Promise.all(connections);
  }

  async disconnectAll(): Promise<void> {
    const disconnections = Array.from(this.platforms.values()).map(platform => 
      platform.disconnect().catch(error => {
        console.error(`Failed to disconnect ${platform.name}:`, error);
        return null;
      })
    );

    await Promise.all(disconnections);
  }

  getPlatform(name: string): MessagingPlatform | undefined {
    return this.platforms.get(name);
  }

  getDefaultPlatform(): MessagingPlatform | undefined {
    return this.defaultPlatform ? this.platforms.get(this.defaultPlatform) : undefined;
  }

  getAllPlatforms(): MessagingPlatform[] {
    return Array.from(this.platforms.values());
  }

  getConnectedPlatforms(): MessagingPlatform[] {
    return Array.from(this.platforms.values()).filter(platform => platform.isConnected);
  }

  async sendMessage(
    chatId: string, 
    text: string, 
    platformName?: string, 
    options?: SendMessageOptions
  ): Promise<Message> {
    const platform = platformName 
      ? this.platforms.get(platformName)
      : this.getDefaultPlatform();

    if (!platform) {
      throw new Error(`Platform ${platformName || 'default'} not found or not available`);
    }

    if (!platform.isConnected) {
      throw new Error(`Platform ${platform.name} is not connected`);
    }

    return platform.sendMessage(chatId, text, options);
  }

  async receiveMessage(webhookData: any, platformName: string): Promise<Message | null> {
    const platform = this.platforms.get(platformName);
    
    if (!platform) {
      console.error(`Platform ${platformName} not found`);
      return null;
    }

    return platform.receiveMessage(webhookData);
  }

  async getStatus(): Promise<Record<string, any>> {
    const status: Record<string, any> = {};
    
    for (const [name, platform] of Array.from(this.platforms.entries())) {
      status[name] = await platform.getStatus();
    }

    return {
      platforms: status,
      defaultPlatform: this.defaultPlatform,
      connectedCount: this.getConnectedPlatforms().length,
      totalCount: this.platforms.size
    };
  }

  // Utility methods for specific platform features
  async setupTelegramWebhook(url: string): Promise<boolean> {
    const telegram = this.platforms.get('telegram') as TelegramPlatform;
    if (!telegram) {
      throw new Error('Telegram platform not available');
    }
    return telegram.setupWebhook(url);
  }

  async removeTelegramWebhook(): Promise<boolean> {
    const telegram = this.platforms.get('telegram') as TelegramPlatform;
    if (!telegram) {
      throw new Error('Telegram platform not available');
    }
    return telegram.removeWebhook();
  }

  async sendTelegramPhoto(chatId: string, photo: string, caption?: string): Promise<Message> {
    const telegram = this.platforms.get('telegram') as TelegramPlatform;
    if (!telegram) {
      throw new Error('Telegram platform not available');
    }
    return telegram.sendPhoto(chatId, photo, caption);
  }

  // Broadcast to all connected platforms
  async broadcast(text: string, chatId: string, options?: SendMessageOptions): Promise<Message[]> {
    const connectedPlatforms = this.getConnectedPlatforms();
    
    if (connectedPlatforms.length === 0) {
      throw new Error('No connected platforms available for broadcast');
    }

    const results = await Promise.allSettled(
      connectedPlatforms.map(platform => 
        platform.sendMessage(chatId, text, options)
      )
    );

    const messages: Message[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        messages.push(result.value);
      } else {
        errors.push(`${connectedPlatforms[index].name}: ${result.reason}`);
      }
    });

    if (errors.length > 0) {
      console.warn('Some broadcast messages failed:', errors);
    }

    return messages;
  }
}

// Singleton instance
export const messagingManager = new MessagingManager(); 