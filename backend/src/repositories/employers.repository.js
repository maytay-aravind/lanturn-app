import { supabase } from '#supabase';
import { logger_for } from '#utils/logger.js';

const log = logger_for('employers.repo');

function rowToEmployer(row) {
  if (!row) return null;
  return {
    uid:            row.uid,
    companyName:    row.company_name   || '',
    description:    row.description    || '',
    website:        row.website        || '',
    industry:       row.industry       || '',
    companySize:    row.company_size   || '',
    location:       row.location       || {},
    hrContact:      row.hr_contact     || {},
    logoURL:        row.logo_url       || '',
    verified:       row.verified       ?? false,
    // New fields
    ceo:            row.ceo            || '',
    foundedYear:    row.founded_year   ?? null,
    headquarters:   row.headquarters   || '',
    branches:       row.branches       || [],
    email:          row.email          || '',
    phone:          row.phone          || '',
    benefits:       row.benefits       || [],
    technologies:   row.technologies   || [],
    companyCulture: row.company_culture || '',
    officeImages:   row.office_images  || [],
    employeeCount:  row.employee_count ?? null,
    linkedin:       row.hr_contact?.linkedin || '',
    achievements:   row.hr_contact?.achievements || [],
    companyDna:     row.company_dna || null,
    createdAt:      row.created_at,
    updatedAt:      row.updated_at,
  };
}

function toDbPayload(data) {
  const p = {};
  if (data.companyName    !== undefined) p.company_name    = data.companyName;
  if (data.description    !== undefined) p.description     = data.description;
  if (data.website        !== undefined) p.website         = data.website;
  if (data.industry       !== undefined) p.industry        = data.industry;
  if (data.companySize    !== undefined) p.company_size    = data.companySize;
  if (data.location       !== undefined) p.location        = data.location;
  if (data.hrContact      !== undefined) p.hr_contact      = data.hrContact;
  if (data.logoURL        !== undefined) p.logo_url        = data.logoURL;
  if (data.verified       !== undefined) p.verified        = data.verified;
  // New fields
  if (data.ceo            !== undefined) p.ceo             = data.ceo;
  if (data.foundedYear    !== undefined) p.founded_year    = data.foundedYear;
  if (data.headquarters   !== undefined) p.headquarters    = data.headquarters;
  if (data.branches       !== undefined) p.branches        = data.branches;
  if (data.email          !== undefined) p.email           = data.email;
  if (data.phone          !== undefined) p.phone           = data.phone;
  if (data.benefits       !== undefined) p.benefits        = data.benefits;
  if (data.technologies   !== undefined) p.technologies    = data.technologies;
  if (data.companyCulture !== undefined) p.company_culture = data.companyCulture;
  if (data.officeImages   !== undefined) p.office_images   = data.officeImages;
  if (data.employeeCount  !== undefined) p.employee_count  = data.employeeCount;
  if (data.companyDna     !== undefined) p.company_dna     = data.companyDna;

  // Workaround: Store linkedin and achievements in the hr_contact JSONB column
  // because the actual columns do not exist in the remote Supabase database yet.
  if (data.linkedin !== undefined || data.achievements !== undefined) {
    p.hr_contact = p.hr_contact || (data.hrContact || {});
    if (data.linkedin !== undefined) p.hr_contact.linkedin = data.linkedin;
    if (data.achievements !== undefined) p.hr_contact.achievements = data.achievements;
  }
  
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
