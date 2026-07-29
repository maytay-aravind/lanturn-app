import { db } from '#firebase';
import { logger_for } from '#utils/logger.js';

const log = logger_for('analytics.repo');
const col = () => db.collection('analytics_events');

export const analyticsRepo = {
  async record(data) {
    await col().add({
      ...data,
      createdAt: new Date(),
    });
  },

  async countByType(type, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const snaps = await col().where('type', '==', type).where('createdAt', '>=', since).count().get();
    return snaps.data().count;
  },

  async countAll(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const snaps = await col().where('createdAt', '>=', since).count().get();
    return snaps.data().count;
  },

  async seriesByType(type, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const snaps = await col().where('type', '==', type).where('createdAt', '>=', since).orderBy('createdAt', 'asc').get();
    return snaps.docs.map((s) => {
      const d = s.data();
      return { date: d.createdAt?.toDate?.()?.toISOString?.().slice(0, 10), count: 1 };
    });
  },

  async summary() {
    const users = await db.collection('users').count().get();
    const students = await db.collection('students').count().get();
    const employers = await db.collection('employers').count().get();
    const jobs = await db.collection('jobs').where('status', '==', 'active').count().get();
    const apps = await db.collection('applications').count().get();
    return {
      users: users.data().count,
      students: students.data().count,
      employers: employers.data().count,
      activeJobs: jobs.data().count,
      applications: apps.data().count,
    };
  },
};
