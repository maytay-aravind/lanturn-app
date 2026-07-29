import { db, FieldValue } from '#firebase';
import { logger_for } from '#utils/logger.js';

const log = logger_for('students.repo');
const col = () => db.collection('students');

function snapToData(snap) {
  return {
    uid: snap.id,
    ...snap.data(),
    createdAt: snap.data().createdAt?.toDate?.() ?? snap.data().createdAt,
    updatedAt: snap.data().updatedAt?.toDate?.() ?? snap.data().updatedAt,
  };
}

export const studentsRepo = {
  async getById(uid) {
    const snap = await col().doc(uid).get();
    return snap.exists ? snapToData(snap) : null;
  },

  async set(uid, data) {
    const now = new Date();
    await col().doc(uid).set({ ...data, uid, createdAt: now, updatedAt: now }, { merge: true });
    return this.getById(uid);
  },

  async update(uid, data) {
    await col().doc(uid).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
    return this.getById(uid);
  },

  async list({ graduationYear, skill, limit = 20 }) {
    let q = col().orderBy('graduationYear', 'desc').limit(limit);
    if (graduationYear) q = q.where('graduationYear', '==', graduationYear);
    const snaps = await q.get();
    return snaps.docs.map(snapToData);
  },
};
