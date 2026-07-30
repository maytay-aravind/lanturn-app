import { supabase } from '#supabase';
import { logger_for } from '#utils/logger.js';

const log = logger_for('analytics.repo');

export const analyticsRepo = {
  async record(data) {
    const { error } = await supabase
      .from('analytics_events')
      .insert({ type: data.type, data: data });
    if (error) throw error;
  },

  async countByType(type, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { count, error } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('type', type)
      .gte('created_at', since.toISOString());
    if (error) throw error;
    return count ?? 0;
  },

  async countAll(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { count, error } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since.toISOString());
    if (error) throw error;
    return count ?? 0;
  },

  async seriesByType(type, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('analytics_events')
      .select('created_at')
      .eq('type', type)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });
    if (error) throw error;

    return (data || []).map((row) => ({
      date:  new Date(row.created_at).toISOString().slice(0, 10),
      count: 1,
    }));
  },

  async summary() {
    // Run all counts in parallel for performance
    const [users, students, employers, activeJobs, apps] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('employers').select('*', { count: 'exact', head: true }),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('applications').select('*', { count: 'exact', head: true }),
    ]);

    if (users.error)     throw users.error;
    if (students.error)  throw students.error;
    if (employers.error) throw employers.error;
    if (activeJobs.error) throw activeJobs.error;
    if (apps.error)      throw apps.error;

    return {
      users:        users.count        ?? 0,
      students:     students.count     ?? 0,
      employers:    employers.count    ?? 0,
      activeJobs:   activeJobs.count   ?? 0,
      applications: apps.count         ?? 0,
    };
  },
};
