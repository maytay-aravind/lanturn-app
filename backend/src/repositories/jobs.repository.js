import { supabase } from '#supabase';
import { logger_for } from '#utils/logger.js';
import { JOB_STATUS } from '#config';
import { encodeCursor, decodeCursor } from '#utils/pagination.js';

const log = logger_for('jobs.repo');

function rowToJob(row) {
  if (!row) return null;
  return {
    jobId:               row.job_id,
    title:               row.title               || '',
    description:         row.description         || '',
    requirements:        row.requirements        || [],
    requiredSkills:      row.required_skills     || [],
    jobType:             row.job_type,
    industry:            row.industry            || '',
    salary:              row.salary              || {},
    experienceLevel:     row.experience_level,
    openings:            row.openings,
    deadline:            row.deadline,
    status:              row.status,
    employerId:          row.employer_id,
    companyName:         row.company_name        || '',
    companyLogoURL:      row.company_logo_url    || '',
    applicationCount:    row.application_count   ?? 0,
    location:            row.location            || {},
    // New fields
    workMode:            row.work_mode           || '',
    responsibilities:    row.responsibilities    || '',
    department:          row.department          || '',
    role:                row.role                || '',
    educationRequirement: row.education_requirement || '',
    benefits:            row.benefits            || [],
    stipend:             row.stipend             || {},
    createdAt:           row.created_at,
    updatedAt:           row.updated_at,
  };
}

function toDbPayload(data) {
  const p = {};
  if (data.title                !== undefined) p.title                = data.title;
  if (data.description          !== undefined) p.description          = data.description;
  if (data.requirements         !== undefined) p.requirements         = data.requirements;
  if (data.requiredSkills       !== undefined) p.required_skills      = data.requiredSkills;
  if (data.jobType              !== undefined) p.job_type             = data.jobType;
  if (data.industry             !== undefined) p.industry             = data.industry;
  if (data.salary               !== undefined) p.salary               = data.salary;
  if (data.experienceLevel      !== undefined) p.experience_level     = data.experienceLevel;
  if (data.openings             !== undefined) p.openings             = data.openings;
  if (data.deadline             !== undefined) p.deadline             = data.deadline;
  if (data.status               !== undefined) p.status               = data.status;
  if (data.employerId           !== undefined) p.employer_id          = data.employerId;
  if (data.companyName          !== undefined) p.company_name         = data.companyName;
  if (data.companyLogoURL       !== undefined) p.company_logo_url     = data.companyLogoURL;
  if (data.applicationCount     !== undefined) p.application_count    = data.applicationCount;
  if (data.location             !== undefined) p.location             = data.location;
  // New fields
  if (data.workMode             !== undefined) p.work_mode            = data.workMode;
  if (data.responsibilities     !== undefined) p.responsibilities     = data.responsibilities;
  if (data.department           !== undefined) p.department           = data.department;
  if (data.role                 !== undefined) p.role                 = data.role;
  if (data.educationRequirement !== undefined) p.education_requirement = data.educationRequirement;
  if (data.benefits             !== undefined) p.benefits             = data.benefits;
  if (data.stipend              !== undefined) p.stipend              = data.stipend;
  return p;
}

export const jobsRepo = {
  async getById(jobId) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('job_id', jobId)
      .maybeSingle();
    if (error) throw error;
    return rowToJob(data);
  },

  async create(jobId, data) {
    const payload = { job_id: jobId, application_count: 0, ...toDbPayload(data) };
    const { data: created, error } = await supabase
      .from('jobs')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return rowToJob(created);
  },

  async update(jobId, data) {
    const payload = toDbPayload(data);
    const { data: updated, error } = await supabase
      .from('jobs')
      .update(payload)
      .eq('job_id', jobId)
      .select()
      .single();
    if (error) throw error;
    return rowToJob(updated);
  },

  async delete(jobId) {
    const { error } = await supabase.from('jobs').delete().eq('job_id', jobId);
    if (error) throw error;
  },

  /** List active jobs with full SQL filtering (no client-side filtering needed) */
  async listActive({ q, jobType, industry, country, remote, skill, experienceLevel, sort, limit = 20, cursor } = {}) {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('status', JOB_STATUS.ACTIVE);

    // Apply SQL filters
    if (jobType)         query = query.eq('job_type', jobType);
    if (industry)        query = query.eq('industry', industry);
    if (experienceLevel) query = query.eq('experience_level', experienceLevel);
    if (skill)           query = query.contains('required_skills', [skill.toLowerCase()]);

    // Text search (title + description)
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    // Location filters (JSONB)
    if (country) {
      query = query.eq('location->>country', country);
    }
    if (remote !== undefined) {
      query = query.eq('location->>remote', String(remote === 'true'));
    }

    // Cursor pagination
    const cursorData = cursor ? decodeCursor(cursor) : null;
    if (cursorData?.createdAt) {
      query = query.lt('created_at', cursorData.createdAt);
    }

    // Sort
    const sortField = sort === 'deadline' ? 'deadline' : 'created_at';
    query = query.order(sortField, { ascending: false }).limit(limit + 1);

    const { data, error } = await query;
    if (error) throw error;

    const items   = (data || []).slice(0, limit).map(rowToJob);
    const hasMore = (data || []).length > limit;
    const last    = items[items.length - 1];
    const nextCursor = hasMore && last
      ? encodeCursor({ createdAt: last.createdAt })
      : null;

    return { items, nextCursor };
  },

  /** List jobs owned by an employer (any status except removed) */
  async listByEmployer(employerId, { limit = 20, cursor } = {}) {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', employerId)
      .neq('status', JOB_STATUS.REMOVED)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    const cursorData = cursor ? decodeCursor(cursor) : null;
    if (cursorData?.createdAt) {
      query = query.lt('created_at', cursorData.createdAt);
    }

    const { data, error } = await query;
    if (error) throw error;

    const items   = (data || []).slice(0, limit).map(rowToJob);
    const hasMore = (data || []).length > limit;
    const last    = items[items.length - 1];
    return {
      items,
      nextCursor: hasMore && last ? encodeCursor({ createdAt: last.createdAt }) : null,
    };
  },

  /** Admin: list all jobs */
  async listAll({ limit = 50 } = {}) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(rowToJob);
  },
};
