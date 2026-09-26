/**
 * lib/adminAuth.js
 *
 * Admin authentication and authorization utilities.
 *
 * This module provides functions to:
 * - Check if a user is authenticated
 * - Check if a user has admin privileges (account_type = "admin")
 * - Protect admin routes by redirecting unauthorized users
 *
 * Used in:
 *   - getServerSideProps of admin pages
 *   - API routes that require admin access
 */

import { createSupabaseServerClient } from './supabase/server';

/**
 * Checks if the current user is authenticated and has admin privileges.
 *
 * @param {import('http').IncomingMessage} req - Next.js request object
 * @param {import('http').ServerResponse} res - Next.js response object
 * @returns {Promise<{ isAdmin: boolean; user: any | null; redirectTo: string | null }>}
 */
export async function requireAdminAuth(req, res) {
  const supabase = createSupabaseServerClient(req, res);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      isAdmin: false,
      user: null,
      redirectTo: '/signin',
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_type, first_name, last_name')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error(
      '[requireAdminAuth] Profile error:',
      profileError?.message,
      'userId:',
      user.id,
    );
    return {
      isAdmin: false,
      user,
      redirectTo: '/account',
    };
  }

  const enrichedProfile = {
    ...profile,
    full_name:
      [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
      null,
    email: user.email,
  };

  if (profile.account_type !== 'admin') {
    return {
      isAdmin: false,
      user,
      profile: enrichedProfile,
      redirectTo: '/account',
    };
  }

  return {
    isAdmin: true,
    user,
    profile: enrichedProfile,
    redirectTo: null,
  };
}

/**
 * Helper function to get the current user's profile (for admin display).
 *
 * @param {import('http').IncomingMessage} req - Next.js request object
 * @param {import('http').ServerResponse} res - Next.js response object
 * @returns {Promise<{ user: any | null; profile: any | null }>}
 */
export async function getAdminProfile(req, res) {
  const supabase = createSupabaseServerClient(req, res);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type, first_name, last_name')
    .eq('id', user.id)
    .single();

  const enrichedProfile = profile
    ? {
        ...profile,
        full_name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || null,
        email: user.email,
      }
    : null;

  return { user, profile: enrichedProfile };
}
