import { studentsRepo } from '#repositories/students.repository.js';
import { employersRepo } from '#repositories/employers.repository.js';
import { usersRepo } from '#repositories/users.repository.js';
import { AppError } from '#utils/httpErrors.js';
import { ROLES } from '#config';

/** Get or update the student's own profile */
export async function getStudentProfile(uid) {
  const profile = await studentsRepo.getById(uid);
  if (!profile) throw AppError.notFound('Student profile not found');
  return profile;
}

export async function updateStudentProfile(uid, data) {
  // Rebuild searchableSkills if skills changed
  if (data.professional?.skills) {
    data.searchableSkills = data.professional.skills.map((s) => s.toLowerCase());
  }
  if (data.academic?.graduationYear) {
    data.graduationYear = data.academic.graduationYear;
  }
  return studentsRepo.update(uid, data);
}

export async function getStudentPublic(uid) {
  const profile = await studentsRepo.getById(uid);
  if (!profile) throw AppError.notFound('Student not found');
  // Return limited fields for public view
  const { resumeUrl, resumeText, ...pub } = profile;
  return pub;
}

/** Employer profile */
export async function getEmployerProfile(uid) {
  const profile = await employersRepo.getById(uid);
  if (!profile) throw AppError.notFound('Employer profile not found');
  return profile;
}

export async function updateEmployerProfile(uid, data) {
  return employersRepo.update(uid, data);
}

export async function getEmployerPublic(uid) {
  const profile = await employersRepo.getById(uid);
  if (!profile) throw AppError.notFound('Employer not found');
  return profile;
}
