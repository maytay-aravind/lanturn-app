import { supabase } from '#supabase';
import { logger_for } from '#utils/logger.js';

const log = logger_for('candidateMatches.repo');

function rowToMatch(row) {
  if (!row) return null;
  return {
    id: row.id,
    jobId: row.job_id,
    studentId: row.student_id,
    matchScore: row.match_score,
    skillMatchScore: row.skill_match_score,
    experienceScore: row.experience_score,
    projectScore: row.project_score,
    educationScore: row.education_score,
    overallReason: row.overall_reason,
    missingSkills: row.missing_skills || [],
    recommendations: row.recommendations || [],
    createdAt: row.created_at,
  };
}

export const candidateMatchesRepo = {
  /**
   * Upsert a candidate match score.
   */
  async upsertMatch(data) {
    const payload = {
      job_id: data.jobId,
      student_id: data.studentId,
      match_score: data.matchScore,
      skill_match_score: data.skillMatchScore,
      experience_score: data.experienceScore,
      project_score: data.projectScore,
      education_score: data.educationScore,
      overall_reason: data.overallReason,
      missing_skills: data.missingSkills || [],
      recommendations: data.recommendations || [],
    };

    const { data: upserted, error } = await supabase
      .from('candidate_matches')
      .upsert(payload, { onConflict: 'job_id,student_id' })
      .select()
      .single();

    if (error) {
      log.error({ error, payload }, 'Failed to upsert candidate match');
      throw error;
    }
    return rowToMatch(upserted);
  },

  /**
   * Get a specific match by job and student.
   */
  async getByJobAndStudent(jobId, studentId) {
    const { data, error } = await supabase
      .from('candidate_matches')
      .select('*')
      .eq('job_id', jobId)
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) throw error;
    return rowToMatch(data);
  },

  /**
   * List all matches for a specific job, ordered by score descending.
   */
  async listByJob(jobId, { limit = 50 } = {}) {
    const { data, error } = await supabase
      .from('candidate_matches')
      .select('*')
      .eq('job_id', jobId)
      .order('match_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(rowToMatch);
  },

  /**
   * List all matches for multiple jobs, ordered by score descending.
   * Includes join with jobs table for dashboard display.
   */
  async listByJobs(jobIds, { limit = 20 } = {}) {
    if (!jobIds || jobIds.length === 0) return [];

    const { data, error } = await supabase
      .from('candidate_matches')
      .select(`
        *,
        users (
          display_name,
          photo_url
        ),
        jobs (
          title
        )
      `)
      .in('job_id', jobIds)
      .order('match_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Also fetch students to get personal.name if possible
    const studentIds = [...new Set((data || []).map(m => m.student_id))];
    let studentsMap = {};
    if (studentIds.length > 0) {
      const { data: studentsData } = await supabase
        .from('students')
        .select('uid, personal, profile_photo_url')
        .in('uid', studentIds);
      
      (studentsData || []).forEach(s => {
        studentsMap[s.uid] = s;
      });
    }

    return (data || []).map(row => {
      const match = rowToMatch(row);
      const student = studentsMap[match.studentId];
      return {
        ...match,
        studentName: student?.personal?.name || row.users?.display_name || 'Unknown Candidate',
        studentPhotoURL: student?.profile_photo_url || row.users?.photo_url || '',
        jobTitle: row.jobs?.title || 'Unknown Job'
      };
    });
  }
};
