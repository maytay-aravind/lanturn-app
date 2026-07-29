import { db, FieldValue } from '#firebase';
import { logger_for } from '#utils/logger.js';
import { APPLICATION_STATUS } from '#config';

const log = logger_for('applications.repo');
const col = () => db.collection('applications');

function snapToData(snap) {
  return {
    applicationId: snap.id,
    ...snap.data(),
    createdAt: snap.data().createdAt?.toDate?.() ?? snap.data().createdAt,
    updatedAt: snap.data().updatedAt?.toDate?.() ?? snap.data().updatedAt,
  };
}

export const applicationsRepo = {
  async getById(id) {
    const snap = await col().doc(id).get();
    return snap.exists ? snapToData(snap) : null;
  },

  async create(id, data) {
    const now = new Date();
    await col().doc(id).set({
      ...data,
      status: APPLICATION_STATUS.SUBMITTED,
      statusHistory: [{ status: APPLICATION_STATUS.SUBMITTED, at: now.toISOString() }],
      createdAt: now,
      updatedAt: now,
    });
    return this.getById(id);
  },

  async updateStatus(id, newStatus, byUid) {
    const entry = { status: newStatus, at: new Date().toISOString(), by: byUid };
    await col().doc(id).update({
      status: newStatus,
      statusHistory: FieldValue.arrayUnion(entry),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return this.getById(id);
  },

  async update(id, data) {
    await col().doc(id).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
    return this.getById(id);
  },

  async delete(id) {
    await col().doc(id).delete();
  },

  async listByStudent(studentId, { limit = 20 } = {}) {
    const snaps = await col()
      .where('studentId', '==', studentId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snaps.docs.map(snapToData);
  },

  async listByJob(jobId, { status, limit = 50 } = {}) {
    let q = col().where('jobId', '==', jobId).orderBy('createdAt', 'desc').limit(limit);
    if (status) q = q.where('status', '==', status);
    const snaps = await q.get();
    return snaps.docs.map(snapToData);
  },

  async getActiveByStudentAndJob(studentId, jobId) {
    const snaps = await col()
      .where('studentId', '==', studentId)
      .where('jobId', '==', jobId)
      .get();
    return snaps.docs.map(snapToData);
  },
};
