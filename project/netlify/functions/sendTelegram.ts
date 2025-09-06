import { Handler } from '@netlify/functions';

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

interface RequestBody {
  message: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
}

export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  try {
    // Get environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatIds = process.env.TELEGRAM_CHAT_IDS;

    // Check if Telegram is configured
    if (!botToken || !chatIds) {
      console.log('Telegram not configured, skipping notification');
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          success: true, 
          message: 'Telegram not configured, notification skipped' 
        }),
      };
    }

    // Parse request body
    const body: RequestBody = JSON.parse(event.body || '{}');
    const { message, parse_mode = 'Markdown', disable_web_page_preview = true, disable_notification = false } = body;

    if (!message) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // Parse chat IDs
    const chatIdList = chatIds.split(',').map(id => id.trim()).filter(Boolean);

    if (chatIdList.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'No valid chat IDs configured' }),
      };
    }

    // Send messages to all chat IDs
    const results = {
      success: [] as string[],
      failed: [] as { chatId: string; error: string }[],
    };

    for (const chatId of chatIdList) {
      try {
        const telegramMessage: TelegramMessage = {
          chat_id: chatId,
          text: message,
          parse_mode,
          disable_web_page_preview,
          disable_notification,
        };

        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(telegramMessage),
        });

        const data: TelegramResponse = await response.json();

        if (data.ok) {
          results.success.push(chatId);
          console.log(`Telegram message sent successfully to chat ${chatId}`);
        } else {
          results.failed.push({
            chatId,
            error: data.description || 'Unknown error',
          });
          console.error(`Telegram API error for chat ${chatId}:`, data.error_code, data.description);
        }
      } catch (error) {
        results.failed.push({
          chatId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`Error sending Telegram message to chat ${chatId}:`, error);
      }
    }

    // Return results
    const hasSuccess = results.success.length > 0;
    const statusCode = hasSuccess ? 200 : 500;

    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: hasSuccess,
        results,
        message: hasSuccess 
          ? `Messages sent to ${results.success.length} chat(s)` 
          : 'Failed to send messages to any chat',
      }),
    };

  } catch (error) {
    console.error('Error in sendTelegram function:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};
