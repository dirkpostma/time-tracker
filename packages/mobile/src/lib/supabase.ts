/**
 * Supabase client initialization.
 *
 * NOTE: This module imports from ./repositories to ensure the Supabase client
 * is initialized via initSupabaseClient from @time-tracker/repositories.
 * The client returned by getSupabaseClient is the same instance used by all repositories.
 */

import { getSupabaseClient } from '@time-tracker/repositories';
// Import repositories to trigger initialization
import './repositories';

// Export the shared Supabase client for components that need direct access
export const supabase = getSupabaseClient();
