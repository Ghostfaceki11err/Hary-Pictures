import { Handler } from '@netlify/functions';

interface TelegramMessage {
  message: string;
  chatIds?: string[];
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  error_code?: number;
  description?: string;
}

const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { message, chatIds }: TelegramMessage = JSON.parse(event.body || '{}');

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // Get environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const defaultChatIds = process.env.TELEGRAM_CHAT_IDS?.split(',').filter(Boolean) || [];

    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Telegram bot token not configured' }),
      };
    }

    // Use provided chatIds or fall back to default ones
    const targetChatIds = chatIds && chatIds.length > 0 ? chatIds : defaultChatIds;

    if (targetChatIds.length === 0) {
      console.error('No chat IDs configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No chat IDs configured' }),
      };
    }

    // Send message to all chat IDs
    const results: { success: string[]; failed: { chatId: string; error: string }[] } = {
      success: [],
      failed: []
    };

    for (const chatId of targetChatIds) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId.trim(),
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
          }),
        });

        const data: TelegramResponse = await response.json();

        if (data.ok) {
          results.success.push(chatId);
          console.log(`Message sent successfully to chat ${chatId}`);
        } else {
          results.failed.push({
            chatId,
            error: data.description || 'Unknown error'
          });
          console.error(`Failed to send message to chat ${chatId}:`, data.description);
        }
      } catch (error) {
        results.failed.push({
          chatId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error(`Error sending message to chat ${chatId}:`, error);
      }
    }

    // Return results
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        success: true,
        results,
        message: `Message sent to ${results.success.length} chat(s), failed for ${results.failed.length} chat(s)`
      }),
    };

  } catch (error) {
    console.error('Error in sendTelegram function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

// Handle preflight requests
export { handler };
