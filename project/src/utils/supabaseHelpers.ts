import { supabase } from '../admin/supabaseClient';

/**
 * Handles JWT expired errors by clearing the session and retrying the request
 * @param error - The error from Supabase
 * @param retryFunction - Function to retry the original request
 * @returns Promise that resolves with the retry result or rejects with the original error
 */
export async function handleJWTError<T>(
  error: any,
  retryFunction: () => Promise<T>
): Promise<T> {
  // Check if it's a JWT-related error
  if (error?.message?.includes('JWT') || error?.message?.includes('expired')) {
    console.warn('JWT expired, attempting to refresh session...');
    
    try {
      // Clear any invalid session
      await supabase.auth.signOut();
      
      // Retry the request after clearing the session
      return await retryFunction();
    } catch (retryError) {
      console.error('Retry failed after JWT error:', retryError);
      throw retryError;
    }
  }
  
  // Check for network errors in production and retry once
  if (import.meta.env.PROD && (
    error?.message?.includes('fetch') || 
    error?.message?.includes('network') ||
    error?.message?.includes('Failed to fetch')
  )) {
    console.warn('Network error detected, attempting retry...');
    
    try {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await retryFunction();
    } catch (retryError) {
      console.error('Network retry failed:', retryError);
      throw retryError;
    }
  }
  
  // If it's not a JWT or network error, throw the original error
  throw error;
}

/**
 * Wraps a Supabase query with JWT error handling
 * @param queryFunction - The Supabase query function
 * @returns Promise that resolves with the query result
 */
export async function withJWTErrorHandling<T>(
  queryFunction: () => Promise<T>
): Promise<T> {
  try {
    // Check if we have a valid session first
    const { error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.warn('Session check failed:', sessionError);
      // Clear any invalid session
      await supabase.auth.signOut();
    }
    
    // Execute the query
    return await queryFunction();
  } catch (error) {
    // Handle JWT errors with retry
    return await handleJWTError(error, queryFunction);
  }
}

/**
 * Executes a Supabase query with JWT error handling
 * @param query - The Supabase query builder
 * @returns Promise that resolves with the query result
 */
export async function executeWithJWTErrorHandling<T>(
  query: Promise<T>
): Promise<T> {
  return withJWTErrorHandling(() => query);
}

/**
 * Checks if an error is JWT-related
 * @param error - The error to check
 * @returns boolean indicating if it's a JWT error
 */
export function isJWTError(error: any): boolean {
  return error?.message?.includes('JWT') || error?.message?.includes('expired');
}
