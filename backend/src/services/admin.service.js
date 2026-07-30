import { usersRepo } from '#repositories/users.repository.js';
import { AppError } from '#utils/httpErrors.js';
import { analyticsRepo } from '#repositories/analytics.repository.js';
import { supabase } from '#supabase';
import { logger_for } from '#utils/logger.js';

const log = logger_for('admin.service');

export async function listUsers(query) {
  return usersRepo.list(query);
}

export async function updateUserStatus(uid, status) {
  const user = await usersRepo.getById(uid);
  if (!user) throw AppError.notFound('User not found');
  return usersRepo.update(uid, { status });
}

export async function updateUserRole(uid, role) {
  const user = await usersRepo.getById(uid);
  if (!user) throw AppError.notFound('User not found');
  return usersRepo.update(uid, { role });
}

export async function getAnalyticsSummary() {
  return analyticsRepo.summary();
}

export async function getAnalyticsSeries(query) {
  const type = query.type || 'job_posted';
  const days = query.days || 30;
  return analyticsRepo.seriesByType(type, days);
}

const DEFAULT_CONFIG = { signupEnabled: true, maintenanceMode: false, aiDailyLimit: 20 };

export async function getPlatformConfig() {
  const { data, error } = await supabase
    .from('platform_config')
    .select('*')
    .eq('id', 'default')
    .maybeSingle();
  if (error) throw error;
  if (!data) return DEFAULT_CONFIG;
  return {
    signupEnabled:   data.signup_enabled,
    maintenanceMode: data.maintenance_mode,
    aiDailyLimit:    data.ai_daily_limit,
  };
}

export async function updatePlatformConfig(incoming) {
  const payload = {};
  if (incoming.signupEnabled   !== undefined) payload.signup_enabled   = incoming.signupEnabled;
  if (incoming.maintenanceMode !== undefined) payload.maintenance_mode = incoming.maintenanceMode;
  if (incoming.aiDailyLimit    !== undefined) payload.ai_daily_limit   = incoming.aiDailyLimit;

  const { error } = await supabase
    .from('platform_config')
    .update(payload)
    .eq('id', 'default');
  if (error) throw error;
  return getPlatformConfig();
}

