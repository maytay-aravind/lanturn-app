import { usersRepo } from '#repositories/users.repository.js';
import { AppError } from '#utils/httpErrors.js';
import { analyticsRepo } from '#repositories/analytics.repository.js';
import { logger_for } from '#utils/logger.js';

const log = logger_for('admin.service');

export async function listUsers(query) {
  return usersRepo.list(query);
}

export async function updateUserStatus(uid, status) {
  const user = await usersRepo.getById(uid);
  if (!user) throw AppError.notFound('User not found');
  // Prevent disabling self
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

export async function getPlatformConfig() {
  const snap = await (await import('#firebase')).db.collection('platform_config').doc('default').get();
  return snap.exists ? snap.data() : { signupEnabled: true, maintenanceMode: false, aiDailyLimit: 20 };
}

export async function updatePlatformConfig(data) {
  const { db } = await import('#firebase');
  await db.collection('platform_config').doc('default').set(data, { merge: true });
  return getPlatformConfig();
}
