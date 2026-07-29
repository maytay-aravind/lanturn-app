import { db, FieldValue } from '#firebase';
import { logger_for } from '#utils/logger.js';

const log = logger_for('users.repo');
const col = () => db.collection('users');

function docToData(doc) {
  return doc.exists
    ? { uid: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate?.() ?? doc.data().createdAt, updatedAt: doc.data().updatedAt?.toDate?.() ?? doc.data().updatedAt }
    : null;
}

export const usersRepo = {
  async getById(uid) {
    const snap = await col().doc(uid).get();
    return docToData(snap);
  },

  async update(uid, data) {
    const payload = { ...data, updatedAt: FieldValue.serverTimestamp() };
    await col().doc(uid).update(payload);
    return this.getById(uid);
  },

  async set(uid, data) {
    const now = new Date();
    const payload = { ...data, createdAt: now, updatedAt: now };
    await col().doc(uid).set(payload, { merge: true });
    return this.getById(uid);
  },

  async list({ role, status, q, limit = 20, cursor }) {
    let query = col().orderBy('createdAt', 'desc');
    if (role) query = query.where('role', '==', role);
    if (status) query = query.where('status', '==', status);
    query = query.limit(limit + 1);
    const snaps = await query.get();
    const items = snaps.docs.map(docToData);
    const hasMore = items.length > limit;
    return { items: items.slice(0, limit), hasMore };
  },
};
