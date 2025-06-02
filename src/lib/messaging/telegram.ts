import TelegramBot from 'node-telegram-bot-api';
import { BaseMessagingPlatform, Message, SendMessageOptions } from './base';

export class TelegramPlatform extends BaseMessagingPlatform {
  name = 'telegram';
  isConnected = false;
  private bot: TelegramBot | null = null;
  private token: string;
  private webhookUrl?: string;

  constructor(token: string, webhookUrl?: string) {
    super();
    this.token = token;
    this.webhookUrl = webhookUrl;
  }

  async connect(): Promise<void> {
    try {
      if (this.webhookUrl) {
        // Webhook mode for production
        this.bot = new TelegramBot(this.token);
        await this.bot.setWebHook(this.webhookUrl);
      } else {
        // Polling mode for development
        this.bot = new TelegramBot(this.token, { polling: true });
      }
      
      // Test the connection
      const botInfo = await this.bot.getMe();
      console.log(`✅ Telegram Bot connected: @${botInfo.username}`);
      this.isConnected = true;
      
    } catch (error) {
      console.error('❌ Failed to connect to Telegram Bot API:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.bot && this.webhookUrl) {
      await this.bot.deleteWebHook();
    }
    this.bot = null;
    this.isConnected = false;
  }

  async sendMessage(chatId: string, text: string, options?: SendMessageOptions): Promise<Message> {
    if (!this.bot || !this.isConnected) {
      throw new Error('Telegram bot is not connected');
    }

    try {
      const telegramOptions: any = {};
      
      if (options?.parseMode) {
        telegramOptions.parse_mode = options.parseMode;
      }
      
      if (options?.disableNotification) {
        telegramOptions.disable_notification = options.disableNotification;
      }
      
      if (options?.replyToMessageId) {
        telegramOptions.reply_to_message_id = parseInt(options.replyToMessageId);
      }
      
      if (options?.inlineKeyboard) {
        telegramOptions.reply_markup = {
          inline_keyboard: options.inlineKeyboard.map(row => 
            row.map(button => ({
              text: button.text,
              callback_data: button.callbackData,
              url: button.url
            }))
          )
        };
      }

      const sentMessage = await this.bot.sendMessage(chatId, text, telegramOptions);
      
      return {
        id: sentMessage.message_id.toString(),
        chatId: chatId,
        text: text,
        timestamp: new Date(sentMessage.date * 1000),
        platform: this.name,
        sender: {
          id: sentMessage.from?.id.toString() || 'bot',
          name: sentMessage.from?.first_name,
          username: sentMessage.from?.username
        },
        metadata: {
          telegramMessageId: sentMessage.message_id,
          chat: sentMessage.chat
        }
      };
    } catch (error) {
      console.error('❌ Failed to send Telegram message:', error);
      throw error;
    }
  }

  async receiveMessage(webhookData: any): Promise<Message | null> {
    try {
      if (!this.validateWebhook(webhookData)) {
        return null;
      }

      const telegramMessage = webhookData.message;
      if (!telegramMessage) {
        return null;
      }

      return {
        id: telegramMessage.message_id.toString(),
        chatId: telegramMessage.chat.id.toString(),
        text: telegramMessage.text || '',
        timestamp: new Date(telegramMessage.date * 1000),
        platform: this.name,
        sender: {
          id: telegramMessage.from.id.toString(),
          name: telegramMessage.from.first_name,
          username: telegramMessage.from.username
        },
        metadata: {
          telegramMessageId: telegramMessage.message_id,
          chat: telegramMessage.chat,
          entities: telegramMessage.entities
        }
      };
    } catch (error) {
      console.error('❌ Failed to process Telegram webhook:', error);
      return null;
    }
  }

  validateWebhook(webhookData: any): boolean {
    return webhookData && 
           typeof webhookData === 'object' && 
           (webhookData.message || webhookData.callback_query);
  }

  async getMessageHistory(chatId: string, limit: number = 50): Promise<Message[]> {
    // Note: Telegram Bot API doesn't provide message history retrieval
    // You would need to store messages in your database and retrieve from there
    console.warn('⚠️ Telegram Bot API does not provide message history. Implement database storage.');
    return [];
  }

  async getStatus(): Promise<{ connected: boolean; botInfo?: any; error?: string }> {
    try {
      if (!this.bot) {
        return { connected: false, error: 'Bot not initialized' };
      }

      const botInfo = await this.bot.getMe();
      return {
        connected: this.isConnected,
        botInfo: {
          id: botInfo.id,
          username: botInfo.username,
          firstName: botInfo.first_name,
          isBot: botInfo.is_bot
        }
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Telegram-specific methods
  async setupWebhook(url: string): Promise<boolean> {
    if (!this.bot) {
      throw new Error('Bot not initialized');
    }
    
    try {
      await this.bot.setWebHook(url);
      this.webhookUrl = url;
      return true;
    } catch (error) {
      console.error('❌ Failed to set webhook:', error);
      return false;
    }
  }

  async removeWebhook(): Promise<boolean> {
    if (!this.bot) {
      throw new Error('Bot not initialized');
    }
    
    try {
      await this.bot.deleteWebHook();
      this.webhookUrl = undefined;
      return true;
    } catch (error) {
      console.error('❌ Failed to remove webhook:', error);
      return false;
    }
  }

  async sendPhoto(chatId: string, photo: string, caption?: string): Promise<Message> {
    if (!this.bot || !this.isConnected) {
      throw new Error('Telegram bot is not connected');
    }

    try {
      const sentMessage = await this.bot.sendPhoto(chatId, photo, { caption });
      
      return {
        id: sentMessage.message_id.toString(),
        chatId: chatId,
        text: caption || '',
        timestamp: new Date(sentMessage.date * 1000),
        platform: this.name,
        sender: {
          id: sentMessage.from?.id.toString() || 'bot',
          name: sentMessage.from?.first_name,
          username: sentMessage.from?.username
        },
        metadata: {
          telegramMessageId: sentMessage.message_id,
          chat: sentMessage.chat,
          photo: sentMessage.photo
        }
      };
    } catch (error) {
      console.error('❌ Failed to send Telegram photo:', error);
      throw error;
    }
  }
} 