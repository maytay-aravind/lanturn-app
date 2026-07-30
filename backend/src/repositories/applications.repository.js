import { supabase } from '#supabase';
import { logger_for } from '#utils/logger.js';
import { APPLICATION_STATUS } from '#config';

const log = logger_for('applications.repo');

function rowToApp(row) {
  if (!row) return null;
  return {
    applicationId:       row.application_id,
    jobId:               row.job_id,
    jobTitle:            row.job_title              || '',
    employerId:          row.employer_id,
    studentId:           row.student_id,
    studentName:         row.student_name           || '',
    studentPhotoURL:     row.student_photo_url      || '',
    resumeUrl:           row.resume_url             || '',
    resumeTextSnapshot:  row.resume_text_snapshot   || '',
    skillsSnapshot:      row.skills_snapshot        || [],
    coverLetter:         row.cover_letter           || '',
    status:              row.status,
    statusHistory:       row.status_history         || [],
    createdAt:           row.created_at,
    updatedAt:           row.updated_at,
  };
}

export const applicationsRepo = {
  async getById(id) {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('application_id', id)
      .maybeSingle();
    if (error) throw error;
    return rowToApp(data);
  },

  async create(id, data) {
    const now = new Date().toISOString();
    const statusHistory = [{ status: APPLICATION_STATUS.SUBMITTED, at: now }];

    const payload = {
      application_id:      id,
      job_id:              data.jobId,
      job_title:           data.jobTitle            || '',
      employer_id:         data.employerId,
      student_id:          data.studentId,
      student_name:        data.studentName         || '',
      student_photo_url:   data.studentPhotoURL     || '',
      resume_url:          data.resumeUrl           || '',
      resume_text_snapshot: data.resumeTextSnapshot || '',
      skills_snapshot:     data.skillsSnapshot      || [],
      cover_letter:        data.coverLetter         || '',
      status:              APPLICATION_STATUS.SUBMITTED,
      status_history:      statusHistory,
    };

    const { data: created, error } = await supabase
      .from('applications')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return rowToApp(created);
  },

  async updateStatus(id, newStatus, byUid) {
    // Fetch current history first, then append
    const { data: current, error: fetchErr } = await supabase
      .from('applications')
      .select('status_history')
      .eq('application_id', id)
      .single();
    if (fetchErr) throw fetchErr;

    const entry = { status: newStatus, at: new Date().toISOString(), by: byUid };
    const newHistory = [...(current.status_history || []), entry];

    const { data: updated, error } = await supabase
      .from('applications')
      .update({ status: newStatus, status_history: newHistory })
      .eq('application_id', id)
      .select()
      .single();
    if (error) throw error;
    return rowToApp(updated);
  },

  async update(id, data) {
    const payload = {};
    if (data.status        !== undefined) payload.status         = data.status;
    if (data.coverLetter   !== undefined) payload.cover_letter   = data.coverLetter;
    if (data.resumeUrl     !== undefined) payload.resume_url     = data.resumeUrl;

    const { data: updated, error } = await supabase
      .from('applications')
      .update(payload)
      .eq('application_id', id)
      .select()
      .single();
    if (error) throw error;
    return rowToApp(updated);
  },

  async delete(id) {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('application_id', id);
    if (error) throw error;
  },

  async listByStudent(studentId, { limit = 20 } = {}) {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(rowToApp);
  },

  async listByJob(jobId, { status, limit = 50 } = {}) {
    let query = supabase
      .from('applications')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(rowToApp);
  },

  async getActiveByStudentAndJob(studentId, jobId) {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('student_id', studentId)
      .eq('job_id', jobId);
    if (error) throw error;
    return (data || []).map(rowToApp);
  },
};
