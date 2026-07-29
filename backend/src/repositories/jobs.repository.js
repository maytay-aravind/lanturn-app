import { db, FieldValue } from '#firebase';
import { logger_for } from '#utils/logger.js';
import { JOB_STATUS } from '#config';
import { decodeCursor, encodeCursor } from '#utils/pagination.js';

const log = logger_for('jobs.repo');
const col = () => db.collection('jobs');

function snapToData(snap) {
  return {
    jobId: snap.id,
    ...snap.data(),
    createdAt: snap.data().createdAt?.toDate?.() ?? snap.data().createdAt,
    updatedAt: snap.data().updatedAt?.toDate?.() ?? snap.data().updatedAt,
    deadline: snap.data().deadline?.toDate?.() ?? snap.data().deadline,
  };
}

export const jobsRepo = {
  async getById(jobId) {
    const snap = await col().doc(jobId).get();
    return snap.exists ? snapToData(snap) : null;
  },

  async create(jobId, data) {
    const now = new Date();
    const doc = {
      ...data,
      applicationCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    await col().doc(jobId).set(doc);
    return this.getById(jobId);
  },

  async update(jobId, data) {
    const payload = { ...data, updatedAt: FieldValue.serverTimestamp() };
    await col().doc(jobId).update(payload);
    return this.getById(jobId);
  },

  async delete(jobId) {
    await col().doc(jobId).delete();
  },

  /** List active jobs with search/filter/pagination */
  async listActive({ q, jobType, industry, country, remote, skill, experienceLevel, sort, limit = 20, cursor }) {
    let query = col().where('status', '==', JOB_STATUS.ACTIVE);
    if (jobType) query = query.where('jobType', '==', jobType);
    if (industry) query = query.where('industry', '==', industry);
    if (experienceLevel) query = query.where('experienceLevel', '==', experienceLevel);

    // Cursor: for now we use simple createdAt-based cursor
    const cursorData = cursor ? decodeCursor(cursor) : null;
    if (cursorData?.createdAt) {
      query = query.where('createdAt', '<', new Date(cursorData.createdAt));
    }

    // Sort
    const sortField = sort === 'deadline' ? 'deadline' : 'createdAt';
    query = query.orderBy(sortField, 'desc').limit(limit + 1);

    const snaps = await query.get();
    let items = snaps.docs.map(snapToData);

    // Client-side filtering for text search, country, remote, skill (array-contains needs a query, but
    // to avoid index explosions we do simple client-side filtering for optional filters)
    if (q) {
      const lower = q.toLowerCase();
      items = items.filter(
        (j) =>
          j.title?.toLowerCase().includes(lower) ||
          j.description?.toLowerCase().includes(lower) ||
          j.requiredSkills?.some((s) => s.toLowerCase().includes(lower))
      );
    }
    if (country) {
      items = items.filter((j) => j.location?.country?.toLowerCase() === country.toLowerCase());
    }
    if (remote !== undefined) {
      const wantRemote = remote === 'true';
      items = items.filter((j) => j.location?.remote === wantRemote);
    }
    if (skill) {
      const lower = skill.toLowerCase();
      items = items.filter((j) =>
        j.requiredSkills?.some((s) => s.toLowerCase() === lower)
      );
    }

    // Re-apply limit after client-side filter
    const hasMore = items.length > limit;
    items = items.slice(0, limit);

    const lastItem = items[items.length - 1];
    const nextCursor = hasMore && lastItem
      ? encodeCursor({ createdAt: lastItem.createdAt?.toISOString?.() })
      : null;

    return { items, nextCursor };
  },

  /** List jobs owned by an employer (any status) */
  async listByEmployer(employerId, { limit = 20, cursor } = {}) {
    let query = col().where('employerId', '==', employerId).orderBy('createdAt', 'desc').limit(limit + 1);
    if (cursor) {
      const cd = decodeCursor(cursor);
      if (cd?.createdAt) query = query.where('createdAt', '<', new Date(cd.createdAt));
    }
    const snaps = await query.get();
    let items = snaps.docs.map(snapToData);
    const hasMore = items.length > limit;
    items = items.slice(0, limit);
    const last = items[items.length - 1];
    return {
      items,
      nextCursor: hasMore && last ? encodeCursor({ createdAt: last.createdAt?.toISOString?.() }) : null,
    };
  },

  /** Admin: list all jobs */
  async listAll({ limit = 50 } = {}) {
    const snaps = await col().orderBy('createdAt', 'desc').limit(limit).get();
    return snaps.docs.map(snapToData);
  },
};
