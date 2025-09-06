# Telegram Integration Setup Guide

This guide explains how to set up secure Telegram notifications for contact form submissions using Netlify Functions.

## Overview

The Telegram integration has been moved from the frontend to a secure backend Netlify function to protect the bot token and chat IDs from being exposed in the client-side code.

## Architecture

```
Frontend (Contact.tsx) 
    ↓ POST request
Netlify Function (sendTelegram.ts)
    ↓ API call
Telegram Bot API
    ↓ Message
Telegram Chats
```

## Setup Instructions

### 1. Environment Variables in Netlify

Set these environment variables in your Netlify dashboard (Site settings → Environment variables):

**Backend-only variables (no VITE_ prefix):**
- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token (e.g., `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
- `TELEGRAM_CHAT_IDS`: Comma-separated list of chat IDs (e.g., `123456789,987654321`)

**Frontend variables (keep existing):**
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### 2. How to Get Telegram Bot Token

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` command
3. Follow the prompts to create a new bot
4. Copy the bot token provided

### 3. How to Get Chat IDs

1. Add your bot to the group/channel where you want notifications
2. Send a message in the group/channel
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for the `chat.id` in the response
5. For private messages, message your bot and check the same URL

### 4. Testing

#### Local Testing
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run: `npx netlify dev`
3. Run the test script: `node test-telegram-function.js`

#### Production Testing
1. Deploy to Netlify
2. Submit a contact form
3. Check your Telegram chats for the notification

## Files Modified

### New Files
- `netlify/functions/sendTelegram.ts` - Netlify function for Telegram API calls
- `test-telegram-function.js` - Test script for local development
- `TELEGRAM_SETUP.md` - This setup guide

### Modified Files
- `src/components/Contact.tsx` - Updated to use Netlify function instead of direct API calls
- `src/utils/telegramHelper.ts` - Deprecated frontend Telegram helper
- `netlify.toml` - Added functions directory and environment variable scanning

## Security Benefits

1. **Bot Token Protection**: The Telegram bot token is no longer exposed in the frontend bundle
2. **Environment Variable Security**: Backend-only variables are not accessible from the client
3. **CORS Handling**: Proper CORS headers are set in the Netlify function
4. **Error Handling**: Comprehensive error handling and logging

## Function API

### Endpoint
```
POST /.netlify/functions/sendTelegram
```

### Request Body
```json
{
  "message": "Your message text here",
  "chatIds": ["123456789", "987654321"] // Optional, uses default if not provided
}
```

### Response
```json
{
  "success": true,
  "results": {
    "success": ["123456789"],
    "failed": []
  },
  "message": "Message sent to 1 chat(s), failed for 0 chat(s)"
}
```

## Troubleshooting

### Common Issues

1. **Function not found (404)**
   - Ensure `netlify.toml` has the functions directory configured
   - Check that the function file is in `netlify/functions/`

2. **Environment variables not found**
   - Verify variables are set in Netlify dashboard
   - Ensure no `VITE_` prefix for backend variables
   - Redeploy after setting environment variables

3. **Telegram API errors**
   - Check bot token is correct
   - Verify chat IDs are valid
   - Ensure bot is added to the target chats

4. **CORS errors**
   - The function includes proper CORS headers
   - Check browser console for specific error messages

### Debugging

1. Check Netlify function logs in the dashboard
2. Use browser developer tools to inspect network requests
3. Run the test script locally for debugging
4. Check Telegram bot logs via BotFather

## Migration Notes

- The old `VITE_TELEGRAM_*` environment variables are no longer needed
- The `telegramHelper` utility is deprecated but kept for backward compatibility
- All Telegram functionality now goes through the Netlify function
- No changes needed to the contact form UI or user experience
