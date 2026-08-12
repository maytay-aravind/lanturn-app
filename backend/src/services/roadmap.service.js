import { roadmapsRepo } from '#repositories/roadmaps.repository.js';
import { CAREER_DOMAINS, DOMAIN_MAP } from '#data/careerRoadmaps.js';
import { AppError } from '#utils/httpErrors.js';

/** List all available career domains (static) */
export function listDomains() {
  return CAREER_DOMAINS.map(({ id, title, icon, color, gradient, description, estimatedMonths, category, stages }) => ({
    id,
    title,
    icon,
    color,
    gradient,
    description,
    estimatedMonths,
    category: category || 'Software Engineering',
    stageCount: stages.length,
    totalTopics: stages.reduce((sum, s) => sum + s.topics.length, 0),
    stages: stages.map((s) => ({
      title: s.title,
      description: s.description,
      durationWeeks: s.durationWeeks,
      difficulty: s.difficulty,
      badge: s.badge,
      topicCount: s.topics.length,
      topics: s.topics,
      project: s.project,
      resources: s.resources,
    })),
  }));
}

/** Get full domain data (static) */
export function getDomain(domainId) {
  const domain = DOMAIN_MAP[domainId];
  if (!domain) throw AppError.notFound(`Career domain '${domainId}' not found`);
  return domain;
}

/** Get all roadmaps for a student, enriched with static domain data + progress */
export async function getStudentRoadmaps(studentId) {
  const enrollments = await roadmapsRepo.getByStudent(studentId);

  const enriched = await Promise.all(
    enrollments.map(async (enrollment) => {
      const domain = DOMAIN_MAP[enrollment.domain_id];
      if (!domain) return null;

      const progressRows = await roadmapsRepo.getProgress(enrollment.roadmap_id);

      // Build a Set of "stageIdx-topicIdx" for O(1) lookups
      const completedSet = new Set(progressRows.map((r) => `${r.stage_index}-${r.topic_index}`));

      const totalTopics = domain.stages.reduce((sum, s) => sum + s.topics.length, 0);
      const completedTopics = progressRows.length;
      const percentComplete = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;

      return {
        roadmapId: enrollment.roadmap_id,
        domainId: enrollment.domain_id,
        domainTitle: enrollment.domain_title,
        enrolledAt: enrollment.enrolled_at,
        domain,
        completedSet: Array.from(completedSet),
        totalTopics,
        completedTopics,
        percentComplete,
      };
    })
  );

  return enriched.filter(Boolean);
}

/** Enroll a student in a domain */
export async function enrollRoadmap(studentId, domainId) {
  const domain = DOMAIN_MAP[domainId];
  if (!domain) throw AppError.notFound(`Career domain '${domainId}' not found`);
  const enrollment = await roadmapsRepo.enroll(studentId, domainId, domain.title);
  return enrollment;
}

/** Remove a roadmap enrollment */
export async function removeRoadmap(studentId, roadmapId) {
  const roadmap = await roadmapsRepo.getById(roadmapId);
  if (!roadmap) throw AppError.notFound('Roadmap not found');
  if (roadmap.student_id !== studentId) throw AppError.forbidden('Not your roadmap');
  await roadmapsRepo.remove(roadmapId, studentId);
}

/** Toggle topic completion */
export async function toggleTopic(studentId, roadmapId, stageIndex, topicIndex, completed) {
  const roadmap = await roadmapsRepo.getById(roadmapId);
  if (!roadmap) throw AppError.notFound('Roadmap not found');
  if (roadmap.student_id !== studentId) throw AppError.forbidden('Not your roadmap');

  if (completed) {
    await roadmapsRepo.completeTopic(roadmapId, studentId, stageIndex, topicIndex);
  } else {
    await roadmapsRepo.uncompleteTopic(roadmapId, stageIndex, topicIndex);
  }
  return { roadmapId, stageIndex, topicIndex, completed };
}
