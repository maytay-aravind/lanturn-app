import { usersRepo } from '#repositories/users.repository.js';
import { studentsRepo } from '#repositories/students.repository.js';
import { employersRepo } from '#repositories/employers.repository.js';
import { AppError } from '#utils/httpErrors.js';
import { ROLES } from '#config';
import { logger_for } from '#utils/logger.js';

const log = logger_for('auth.service');

/**
 * Get the current session user + role profile (if complete).
 */
export async function getSession(uid) {
  const user = await usersRepo.getById(uid);
  if (!user) throw AppError.notFound('User not found');

  let profile = null;
  if (user.role === ROLES.STUDENT && user.profileComplete) {
    profile = await studentsRepo.getById(uid);
  } else if (user.role === ROLES.EMPLOYER && user.profileComplete) {
    profile = await employersRepo.getById(uid);
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: user.role,
    profileComplete: user.profileComplete,
    status: user.status,
    profile,
  };
}

/**
 * Complete onboarding: choose role + create the role profile.
 */
export async function onboard(uid, { role, profile: profileData }) {
  const user = await usersRepo.getById(uid);
  if (!user) throw AppError.notFound('User not found');
  if (user.role) throw AppError.conflict('Role already chosen');

  // Create role profile
  if (role === ROLES.STUDENT) {
    await studentsRepo.set(uid, {
      personal: profileData.personal || { name: user.displayName || 'Student' },
      academic: profileData.academic || {},
      professional: profileData.professional || { skills: [], projects: [], experience: [], certifications: [] },
      social: profileData.social || {},
      searchableSkills: (profileData.professional?.skills || []).map((s) => s.toLowerCase()),
      graduationYear: profileData.academic?.graduationYear || null,
    });
  } else if (role === ROLES.EMPLOYER) {
    await employersRepo.set(uid, {
      companyName: profileData.companyName || 'My Company',
      description: profileData.description || '',
      location: profileData.location || {},
      industry: profileData.industry || '',
      hrContact: profileData.hrContact || {},
      verified: false,
    });
  }

  // Update base user
  await usersRepo.update(uid, { role, profileComplete: true });

  return getSession(uid);
}
