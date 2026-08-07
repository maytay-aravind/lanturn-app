import { supabase } from '#supabase';
import { logger_for } from '#utils/logger.js';

const log = logger_for('students.repo');

/** Convert DB row → shape expected by service layer */
function rowToStudent(row) {
  if (!row) return null;
  return {
    uid:              row.uid,
    personal:         row.personal         || {},
    academic:         row.academic          || {},
    professional:     row.professional     || {},
    social:           row.social            || {},
    searchableSkills: row.searchable_skills || [],
    graduationYear:   row.graduation_year,
    profilePhotoURL:  row.profile_photo_url || '',
    resumeUrl:        row.resume_url        || '',
    resumeText:       row.resume_text       || '',
    resumeKeywords:   row.resume_keywords   || [],
    certificates:     row.certificates      || [],
    createdAt:        row.created_at,
    updatedAt:        row.updated_at,
  };
}

/** Map service-layer camelCase keys → DB snake_case */
function toDbPayload(data) {
  const p = {};
  if (data.personal         !== undefined) p.personal           = data.personal;
  if (data.academic         !== undefined) p.academic            = data.academic;
  if (data.professional     !== undefined) p.professional       = data.professional;
  if (data.social           !== undefined) p.social              = data.social;
  if (data.searchableSkills !== undefined) p.searchable_skills  = data.searchableSkills;
  if (data.graduationYear   !== undefined) p.graduation_year    = data.graduationYear;
  if (data.profilePhotoURL  !== undefined) p.profile_photo_url  = data.profilePhotoURL;
  if (data.resumeUrl        !== undefined) p.resume_url         = data.resumeUrl;
  if (data.resumeText       !== undefined) p.resume_text        = data.resumeText;
  if (data.resumeKeywords   !== undefined) p.resume_keywords    = data.resumeKeywords;
  if (data.certificates     !== undefined) p.certificates       = data.certificates;
  return p;
}

/** Minimal default row for a student who skipped onboarding details */
function defaultStudentRow(uid) {
  return {
    uid,
    personal:           {},
    academic:           {},
    professional:       { skills: [], projects: [], experience: [], certifications: [] },
    social:             {},
    searchable_skills:  [],
    graduation_year:    null,
    profile_photo_url:  '',
    resume_url:         '',
    resume_text:        '',
    resume_keywords:    [],
    certificates:       [],
  };
}

export const studentsRepo = {
  async getById(uid) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('uid', uid)
      .maybeSingle();
    if (error) throw error;
    return rowToStudent(data);
  },

  async set(uid, data) {
    const payload = { uid, ...toDbPayload(data) };
    const { data: upserted, error } = await supabase
      .from('students')
      .upsert(payload, { onConflict: 'uid' })
      .select()
      .single();
    if (error) throw error;
    return rowToStudent(upserted);
  },

  /**
   * Update an existing student row.
   * Uses maybeSingle() so it doesn't throw when 0 rows are matched
   * (which happens when the student skipped onboarding details).
   */
  async update(uid, data) {
    const payload = toDbPayload(data);
    if (Object.keys(payload).length === 0) {
      return this.getById(uid);
    }
    const { data: updated, error } = await supabase
      .from('students')
      .update(payload)
      .eq('uid', uid)
      .select()
      .maybeSingle();
    if (error) throw error;
    return rowToStudent(updated);
  },

  /**
   * Ensure a student row exists, then apply the update.
   * Safe to call for users who skipped onboarding — creates the row
   * with sensible defaults first if it doesn't exist, then updates it.
   */
  async ensureAndUpdate(uid, data) {
    // Try to upsert a default row (no-op if already exists)
    await supabase
      .from('students')
      .upsert(defaultStudentRow(uid), { onConflict: 'uid', ignoreDuplicates: true });

    return this.update(uid, data);
  },

  async list({ graduationYear, limit = 20 } = {}) {
    let query = supabase
      .from('students')
      .select('*')
      .order('graduation_year', { ascending: false })
      .limit(limit);

    if (graduationYear) query = query.eq('graduation_year', graduationYear);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(rowToStudent);
  },

  async getAllUids() {
    const { data, error } = await supabase.from('students').select('uid');
    if (error) throw error;
    return (data || []).map((row) => row.uid);
  },
};
