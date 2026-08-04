import { supabase } from '#supabase';
import { logger_for } from '#utils/logger.js';
import { generateId } from '#utils/ids.js';

const log = logger_for('roadmaps.repo');

export const roadmapsRepo = {
  /** Get all roadmaps a student is enrolled in */
  async getByStudent(studentId) {
    const { data, error } = await supabase
      .from('career_roadmaps')
      .select('*')
      .eq('student_id', studentId)
      .order('enrolled_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  /** Get a single roadmap by its ID */
  async getById(roadmapId) {
    const { data, error } = await supabase
      .from('career_roadmaps')
      .select('*')
      .eq('roadmap_id', roadmapId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /** Enroll a student in a domain roadmap (idempotent) */
  async enroll(studentId, domainId, domainTitle) {
    const roadmapId = generateId('rm');
    const { data, error } = await supabase
      .from('career_roadmaps')
      .upsert(
        { roadmap_id: roadmapId, student_id: studentId, domain_id: domainId, domain_title: domainTitle },
        { onConflict: 'student_id,domain_id', ignoreDuplicates: false }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Remove a roadmap enrollment */
  async remove(roadmapId, studentId) {
    const { error } = await supabase
      .from('career_roadmaps')
      .delete()
      .eq('roadmap_id', roadmapId)
      .eq('student_id', studentId);
    if (error) throw error;
  },

  /** Get all completed topic entries for a roadmap */
  async getProgress(roadmapId) {
    const { data, error } = await supabase
      .from('roadmap_progress')
      .select('stage_index, topic_index, completed_at')
      .eq('roadmap_id', roadmapId);
    if (error) throw error;
    return data || [];
  },

  /** Mark a topic as complete (upsert) */
  async completeTopic(roadmapId, studentId, stageIndex, topicIndex) {
    const { data, error } = await supabase
      .from('roadmap_progress')
      .upsert(
        { roadmap_id: roadmapId, student_id: studentId, stage_index: stageIndex, topic_index: topicIndex },
        { onConflict: 'roadmap_id,stage_index,topic_index', ignoreDuplicates: true }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Unmark a topic (delete the row) */
  async uncompleteTopic(roadmapId, stageIndex, topicIndex) {
    const { error } = await supabase
      .from('roadmap_progress')
      .delete()
      .eq('roadmap_id', roadmapId)
      .eq('stage_index', stageIndex)
      .eq('topic_index', topicIndex);
    if (error) throw error;
  },
};
