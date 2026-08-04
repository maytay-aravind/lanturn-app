import { supabase } from '#supabase';
import { logger_for } from '#utils/logger.js';

const log = logger_for('employers.repo');

function rowToEmployer(row) {
  if (!row) return null;
  return {
    uid:         row.uid,
    companyName: row.company_name  || '',
    description: row.description   || '',
    website:     row.website        || '',
    industry:    row.industry       || '',
    companySize: row.company_size  || '',
    location:    row.location       || {},
    hrContact:   row.hr_contact     || {},
    logoURL:     row.logo_url       || '',
    verified:    row.verified       ?? false,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

function toDbPayload(data) {
  const p = {};
  if (data.companyName !== undefined) p.company_name = data.companyName;
  if (data.description !== undefined) p.description  = data.description;
  if (data.website     !== undefined) p.website      = data.website;
  if (data.industry    !== undefined) p.industry     = data.industry;
  if (data.companySize !== undefined) p.company_size = data.companySize;
  if (data.location    !== undefined) p.location     = data.location;
  if (data.hrContact   !== undefined) p.hr_contact   = data.hrContact;
  if (data.logoURL     !== undefined) p.logo_url     = data.logoURL;
  if (data.verified    !== undefined) p.verified     = data.verified;
  return p;
}

export const employersRepo = {
  async getById(uid) {
    const { data, error } = await supabase
      .from('employers')
      .select('*')
      .eq('uid', uid)
      .maybeSingle();
    if (error) throw error;
    return rowToEmployer(data);
  },

  async set(uid, data) {
    const payload = { uid, ...toDbPayload(data) };
    const { data: upserted, error } = await supabase
      .from('employers')
      .upsert(payload, { onConflict: 'uid' })
      .select()
      .single();
    if (error) throw error;
    return rowToEmployer(upserted);
  },

  async update(uid, data) {
    const payload = toDbPayload(data);
    if (Object.keys(payload).length === 0) {
      return this.getById(uid);
    }
    const { data: updated, error } = await supabase
      .from('employers')
      .update(payload)
      .eq('uid', uid)
      .select()
      .single();
    if (error) throw error;
    return rowToEmployer(updated);
  },
};
