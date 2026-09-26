import { createSupabaseServerClient } from './supabase/server';

export async function requireAdmin(req, res) {
  const supabase = createSupabaseServerClient(req, res);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { ok: false, status: 401, error: 'Authentication required.' };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('account_type, first_name, last_name')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || profile?.account_type !== 'admin') {
    return { ok: false, status: 403, error: 'Administrator access required.' };
  }

  return { ok: true, user, profile };
}
