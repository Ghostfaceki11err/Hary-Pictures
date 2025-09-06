interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  error_code?: number;
  description?: string;
}

interface TelegramConfig {
  botToken: string;
  defaultChatIds: string[];
}

class TelegramHelper {
  private botToken: string;
  private defaultChatIds: string[];

  constructor(config: TelegramConfig) {
    this.botToken = config.botToken;
    this.defaultChatIds = config.defaultChatIds;
  }

  /**
   * Send a message to a single chat ID
   */
  async sendMessage(message: TelegramMessage): Promise<TelegramResponse> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: message.chat_id,
          text: message.text,
          parse_mode: message.parse_mode || 'HTML',
          disable_web_page_preview: message.disable_web_page_preview || false,
          disable_notification: message.disable_notification || false,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return {
        ok: false,
        error_code: -1,
        description: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send a message to multiple chat IDs
   */
  async sendToMultipleChats(
    text: string,
    chatIds?: string[],
    options?: Partial<TelegramMessage>
  ): Promise<{ success: string[]; failed: { chatId: string; error: string }[] }> {
    const targetChatIds = chatIds || this.defaultChatIds;
    const results = {
      success: [] as string[],
      failed: [] as { chatId: string; error: string }[],
    };

    // Send messages in parallel
    const promises = targetChatIds.map(async (chatId) => {
      try {
        const response = await this.sendMessage({
          chat_id: chatId,
          text,
          ...options,
        });

        if (response.ok) {
          results.success.push(chatId);
        } else {
          results.failed.push({
            chatId,
            error: response.description || 'Unknown error',
          });
        }
      } catch (error) {
        results.failed.push({
          chatId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Send a contact form notification to multiple chats
   */
  async sendContactFormNotification(formData: {
    name: string;
    email: string;
    phone?: string;
    service?: string;
    date?: string;
    message: string;
  }): Promise<{ success: string[]; failed: { chatId: string; error: string }[] }> {
    // Format the date nicely if provided
    const formatDate = (dateString?: string) => {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch {
        return dateString;
      }
    };

    // Get current time in a nice format
    const currentTime = new Date().toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Create a modern, clean message using Markdown
    const message = `
🆕 *New Contact Form Submission* ────────────
👤 *Name:* ${formData.name}
✉️ *Email:* ${formData.email}
📞 *Phone:* ${formData.phone || 'N/A'}

🖼️ *Service:* ${formData.service || 'General Inquiry'}
📅 *Preferred Date:* ${formData.date ? formatDate(formData.date) : 'Flexible'}

💬 *Message:*
${formData.message}

⏱️ *Submitted:* ${currentTime}
───────────────────────────────
    `.trim();

    return this.sendToMultipleChats(message, undefined, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    });
  }

  /**
   * Send a simple notification message
   */
  async sendNotification(
    title: string,
    message: string,
    chatIds?: string[]
  ): Promise<{ success: string[]; failed: { chatId: string; error: string }[] }> {
    const currentTime = new Date().toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const formattedMessage = `
🔔 <b>${title}</b>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ <i>${currentTime}</i>
    `.trim();

    return this.sendToMultipleChats(formattedMessage, chatIds, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  }

  /**
   * Send an error notification
   */
  async sendErrorNotification(
    error: string,
    context?: string,
    chatIds?: string[]
  ): Promise<{ success: string[]; failed: { chatId: string; error: string }[] }> {
    const currentTime = new Date().toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const message = `
🚨 <b>⚠️ System Alert ⚠️</b>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${context ? `📍 <b>Context:</b> ${context}` : ''}

❌ <b>Error Details:</b>
┌─────────────────────────────────────┐
│ ${error}
└─────────────────────────────────────┘

⏰ <i>${currentTime}</i>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 <b>Action Required</b>
    `.trim();

    return this.sendToMultipleChats(message, chatIds, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  }

  /**
   * Test the bot connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/getMe`);
      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('Telegram bot connection test failed:', error);
      return false;
    }
  }
}

// Create a default instance (you'll need to set your bot token and chat IDs)
export const telegramHelper = new TelegramHelper({
  botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
  defaultChatIds: (import.meta.env.VITE_TELEGRAM_CHAT_IDS || '').split(',').filter(Boolean),
});

// Export the class for custom instances
export { TelegramHelper };
export type { TelegramMessage, TelegramResponse, TelegramConfig };
