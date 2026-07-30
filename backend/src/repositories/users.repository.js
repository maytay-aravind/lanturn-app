import { supabase } from '#supabase';
import { logger_for } from '#utils/logger.js';

const log = logger_for('users.repo');

/** Convert PostgreSQL snake_case row → camelCase object expected by service layer */
function rowToUser(row) {
  if (!row) return null;
  return {
    uid:             row.uid,
    email:           row.email,
    emailVerified:   row.email_verified,
    displayName:     row.display_name,
    photoURL:        row.photo_url,
    authProvider:    row.auth_provider,
    role:            row.role,
    profileComplete: row.profile_complete,
    status:          row.status,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

export const usersRepo = {
  async getById(uid) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', uid)
      .maybeSingle();
    if (error) throw error;
    return rowToUser(data);
  },

  async update(uid, data) {
    // Map camelCase → snake_case for DB columns
    const payload = {};
    if (data.role            !== undefined) payload.role             = data.role;
    if (data.profileComplete !== undefined) payload.profile_complete = data.profileComplete;
    if (data.status          !== undefined) payload.status           = data.status;
    if (data.displayName     !== undefined) payload.display_name     = data.displayName;
    if (data.photoURL        !== undefined) payload.photo_url        = data.photoURL;

    const { data: updated, error } = await supabase
      .from('users')
      .update(payload)
      .eq('uid', uid)
      .select()
      .single();
    if (error) throw error;
    return rowToUser(updated);
  },

  async set(uid, data) {
    const payload = {
      uid,
      email:           data.email           ?? '',
      email_verified:  data.emailVerified    ?? false,
      display_name:    data.displayName      ?? '',
      photo_url:       data.photoURL         ?? '',
      auth_provider:   data.authProvider     ?? 'google.com',
      role:            data.role             ?? null,
      profile_complete: data.profileComplete ?? false,
      status:          data.status           ?? 'active',
    };
    const { data: upserted, error } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'uid' })
      .select()
      .single();
    if (error) throw error;
    return rowToUser(upserted);
  },

  async list({ role, status, limit = 20 } = {}) {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (role)   query = query.eq('role', role);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return {
      items:   (data || []).map(rowToUser),
      hasMore: (data || []).length === limit,
    };
  },
};
