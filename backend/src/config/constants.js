// Application-wide constants and enums.

export const ROLES = Object.freeze({
  STUDENT: 'student',
  EMPLOYER: 'employer',
  ADMIN: 'admin',
});

export const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  DISABLED: 'disabled',
});

export const JOB_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  CLOSED: 'closed',
  REMOVED: 'removed',
});

export const WORK_MODE = Object.freeze({
  ONSITE: 'onsite',
  REMOTE: 'remote',
  HYBRID: 'hybrid',
});

export const APPLICATION_STATUS = Object.freeze({
  SUBMITTED: 'submitted',
  REVIEWED: 'reviewed',
  SHORTLISTED: 'shortlisted',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
});

export const NOTIFICATION_TYPE = Object.freeze({
  APPLICATION_RECEIVED: 'application_received',
  APPLICATION_STATUS: 'application_status',
  JOB_REMOVED: 'job_removed',
  SYSTEM: 'system',
  AI_READY: 'ai_ready',
});

export const JOB_TYPE = Object.freeze({
  FULL_TIME: 'full-time',
  INTERNSHIP: 'internship',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
});

export const EXPERIENCE_LEVEL = Object.freeze({
  ENTRY: 'entry',
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
});

// File-upload policy
export const UPLOAD_KINDS = Object.freeze({
  RESUME: 'resume',
  PROFILE_PHOTO: 'profilePhoto',
  COMPANY_LOGO: 'companyLogo',
  CERTIFICATE: 'certificate',
});

export const UPLOAD_POLICY = Object.freeze({
  [UPLOAD_KINDS.RESUME]: {
    mimeTypes: ['application/pdf'],
    maxSizeBytes: 5 * 1024 * 1024,
    prefix: 'resumes',
  },
  [UPLOAD_KINDS.PROFILE_PHOTO]: {
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    maxSizeBytes: 2 * 1024 * 1024,
    prefix: 'photos',
  },
  [UPLOAD_KINDS.COMPANY_LOGO]: {
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    maxSizeBytes: 2 * 1024 * 1024,
    prefix: 'logos',
  },
  [UPLOAD_KINDS.CERTIFICATE]: {
    mimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'],
    maxSizeBytes: 5 * 1024 * 1024,
    prefix: 'certificates',
  },
});

export const PAGINATION = Object.freeze({
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 50,
});

// Fields a student may not write directly (server-controlled)
export const USER_LOCKED_FIELDS = ['role', 'status', 'email', 'uid'];

// Employer profile additional enums
export const COMPANY_SIZE = Object.freeze({
  STARTUP: '1-10',
  SMALL: '11-50',
  MEDIUM: '51-200',
  LARGE: '201-500',
  ENTERPRISE: '500+',
});
