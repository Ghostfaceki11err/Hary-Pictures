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
  constructor(_config: TelegramConfig) {
    // Bot token and chat IDs are now handled by the Netlify function
    // These parameters are kept for backward compatibility but not used
  }

  /**
   * Send a message to a single chat ID using Netlify function
   */
  async sendMessage(message: TelegramMessage): Promise<TelegramResponse> {
    try {
      const response = await fetch('/.netlify/functions/sendTelegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.text,
          parse_mode: message.parse_mode || 'HTML',
          disable_web_page_preview: message.disable_web_page_preview || false,
          disable_notification: message.disable_notification || false,
        }),
      });

      if (!response.ok) {
        return {
          ok: false,
          error_code: response.status,
          description: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        ok: data.success,
        result: data.results,
        error_code: data.success ? undefined : -1,
        description: data.message,
      };
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
   * Send a message to multiple chat IDs using Netlify function
   */
  async sendToMultipleChats(
    text: string,
    _chatIds?: string[],
    options?: Partial<TelegramMessage>
  ): Promise<{ success: string[]; failed: { chatId: string; error: string }[] }> {
    try {
      const response = await fetch('/.netlify/functions/sendTelegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          parse_mode: options?.parse_mode || 'HTML',
          disable_web_page_preview: options?.disable_web_page_preview || false,
          disable_notification: options?.disable_notification || false,
        }),
      });

      if (!response.ok) {
        return {
          success: [],
          failed: [{
            chatId: 'all',
            error: `HTTP ${response.status}: ${response.statusText}`,
          }],
        };
      }

      const data = await response.json();
      return data.results || { success: [], failed: [] };
    } catch (error) {
      console.error('Error sending Telegram message to multiple chats:', error);
      return {
        success: [],
        failed: [{
          chatId: 'all',
          error: error instanceof Error ? error.message : 'Unknown error',
        }],
      };
    }
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
   * Test the bot connection using Netlify function
   */
  async testConnection(): Promise<boolean> {
    try {
      // Send a test message to check if the function works
      const response = await fetch('/.netlify/functions/sendTelegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: '🔧 Test message - Telegram connection working!',
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Telegram bot connection test failed:', error);
      return false;
    }
  }
}

// Create a default instance (bot token and chat IDs are now handled by the Netlify function)
export const telegramHelper = new TelegramHelper({
  botToken: '', // No longer needed in frontend
  defaultChatIds: [], // No longer needed in frontend
});

// Export the class for custom instances
export { TelegramHelper };
export type { TelegramMessage, TelegramResponse, TelegramConfig };
