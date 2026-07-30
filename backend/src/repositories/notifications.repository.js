import { supabase } from '#supabase';
import { logger_for } from '#utils/logger.js';

const log = logger_for('notifications.repo');

function rowToNotification(row) {
  if (!row) return null;
  return {
    notificationId: row.notification_id,
    userId:         row.user_id,
    type:           row.type,
    title:          row.title         || '',
    body:           row.body          || '',
    link:           row.link          || '',
    data:           row.data          || {},
    channel:        row.channel       || 'both',
    read:           row.read          ?? false,
    emailStatus:    row.email_status  || 'skipped',
    createdAt:      row.created_at,
  };
}

export const notificationsRepo = {
  async create(id, data) {
    const payload = {
      notification_id: id,
      user_id:         data.userId,
      type:            data.type,
      title:           data.title    || '',
      body:            data.body     || '',
      link:            data.link     || '',
      data:            data.data     || {},
      channel:         data.channel  || 'both',
      read:            false,
      email_status:    (data.channel === 'email' || data.channel === 'both') ? 'pending' : 'skipped',
    };
    const { data: created, error } = await supabase
      .from('notifications')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return rowToNotification(created);
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('notification_id', id)
      .maybeSingle();
    if (error) throw error;
    return rowToNotification(data);
  },

  async markRead(id) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('notification_id', id);
    if (error) throw error;
  },

  /** Single SQL UPDATE replaces Firestore batch writes */
  async markAllRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) throw error;
  },

  async countUnread(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) throw error;
    return count ?? 0;
  },

  async listByUser(userId, { limit = 20 } = {}) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(rowToNotification);
  },

  async updateEmailStatus(id, status) {
    const { error } = await supabase
      .from('notifications')
      .update({ email_status: status })
      .eq('notification_id', id);
    if (error) throw error;
  },
};
