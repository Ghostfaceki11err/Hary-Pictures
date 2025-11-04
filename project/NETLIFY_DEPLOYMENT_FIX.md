# Netlify Deployment Fix for JWT Issues

## Problem
The portfolio pictures and categories were working locally but not loading on Netlify deployment due to JWT expired errors and CSP restrictions.

## Solutions Implemented

### 1. Content Security Policy (CSP) Fix
**File:** `netlify.toml`
- Added Supabase domains to the CSP `connect-src` directive
- Updated: `connect-src 'self' https: https://*.supabase.co https://*.supabase.in;`

### 2. Enhanced Supabase Client Configuration
**File:** `src/admin/supabaseClient.ts`
- Added environment variable validation
- Enhanced auth configuration with auto-refresh tokens
- Added PKCE flow for better security
- Added production debugging

### 3. Production Error Handling
**Files:** `src/components/Portfolio.tsx`, `src/utils/supabaseHelpers.ts`
- Added network error retry mechanism
- Enhanced error logging for production debugging
- Added environment checks for troubleshooting

### 4. Environment Check Utility
**File:** `src/utils/envCheck.ts`
- Added environment validation utility
- Helps debug deployment issues

## Deployment Checklist

### ✅ Environment Variables
Make sure these are set in Netlify dashboard (Site settings → Environment variables):

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### ✅ Verify Environment Variables
1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Ensure both variables are present and correct
4. Redeploy after adding/changing variables

### ✅ Check Supabase Configuration
1. Verify your Supabase project is active
2. Check that RLS policies allow public read access for:
   - `categories` table
   - `pictures` table
3. Ensure your Supabase URL and anon key are correct

### ✅ Test Deployment
1. Deploy the updated code to Netlify
2. Open browser developer tools (F12)
3. Check console for any error messages
4. Look for "Environment check:" logs in production

## Debugging Steps

### If Still Not Working:

1. **Check Browser Console**
   - Look for CSP violations
   - Check for network errors
   - Look for environment variable errors

2. **Verify Supabase Connection**
   - Test your Supabase URL directly in browser
   - Check if your anon key is valid

3. **Check Netlify Build Logs**
   - Look for build errors
   - Verify environment variables are being read

4. **Test with Simple Query**
   - Try accessing Supabase directly from browser console
   - Test with a simple fetch request

## Files Modified

- `netlify.toml` - Updated CSP to allow Supabase connections
- `src/admin/supabaseClient.ts` - Enhanced configuration and validation
- `src/components/Portfolio.tsx` - Added production error handling
- `src/utils/supabaseHelpers.ts` - Added network retry mechanism
- `src/utils/envCheck.ts` - New environment check utility

## Expected Result

After deploying these changes:
- Portfolio pictures should load correctly on Netlify
- JWT errors should be handled gracefully
- Network issues should be retried automatically
- Better error messages for debugging

## Next Steps

1. Deploy the updated code to Netlify
2. Test the portfolio page
3. Check browser console for any remaining issues
4. If problems persist, check the environment variables in Netlify dashboard
