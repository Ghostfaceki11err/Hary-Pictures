// Example usage of the Telegram Helper
import { telegramHelper, TelegramHelper } from '../utils/telegramHelper';

// Example 1: Using the default instance
export const exampleUsage = async () => {
  // Send a simple notification
  const result = await telegramHelper.sendNotification(
    'Website Update',
    'The website has been updated with new features!'
  );
  
  console.log('Notification sent:', result);
};

// Example 2: Creating a custom instance
export const customTelegramInstance = () => {
  const customHelper = new TelegramHelper({
    botToken: 'YOUR_BOT_TOKEN_HERE',
    defaultChatIds: ['123456789', '987654321'], // Your chat IDs
  });

  return customHelper;
};

// Example 3: Send to specific chat IDs
export const sendToSpecificChats = async () => {
  const chatIds = ['123456789', '987654321'];
  
  const result = await telegramHelper.sendToMultipleChats(
    'Hello from the website!',
    chatIds,
    {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }
  );
  
  console.log('Messages sent:', result);
};

// Example 4: Send error notification
export const sendErrorAlert = async (error: string) => {
  const result = await telegramHelper.sendErrorNotification(
    error,
    'Contact Form Submission',
    ['123456789'] // Admin chat ID
  );
  
  console.log('Error notification sent:', result);
};

// Example 5: Test bot connection
export const testBotConnection = async () => {
  const isConnected = await telegramHelper.testConnection();
  
  if (isConnected) {
    console.log('✅ Telegram bot is connected and working!');
  } else {
    console.log('❌ Telegram bot connection failed');
  }
  
  return isConnected;
};
