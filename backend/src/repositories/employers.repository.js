import { db, FieldValue } from '#firebase';
import { logger_for } from '#utils/logger.js';

const log = logger_for('employers.repo');
const col = () => db.collection('employers');

function snapToData(snap) {
  return {
    uid: snap.id,
    ...snap.data(),
    createdAt: snap.data().createdAt?.toDate?.() ?? snap.data().createdAt,
    updatedAt: snap.data().updatedAt?.toDate?.() ?? snap.data().updatedAt,
  };
}

export const employersRepo = {
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
};
