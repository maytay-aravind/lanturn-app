import { db, FieldValue } from '#firebase';
import { logger_for } from '#utils/logger.js';

const log = logger_for('notifications.repo');
const col = () => db.collection('notifications');

function snapToData(snap) {
  return {
    notificationId: snap.id,
    ...snap.data(),
    createdAt: snap.data().createdAt?.toDate?.() ?? snap.data().createdAt,
  };
}

export const notificationsRepo = {
  async create(id, data) {
    const now = new Date();
    await col().doc(id).set({
      ...data,
      read: false,
      emailStatus: data.channel === 'email' || data.channel === 'both' ? 'pending' : 'skipped',
      createdAt: now,
    });
    return this.getById(id);
  },

  async getById(id) {
    const snap = await col().doc(id).get();
    return snap.exists ? snapToData(snap) : null;
  },

  async markRead(id) {
    await col().doc(id).update({ read: true });
  },

  async markAllRead(userId) {
    const batch = db.batch();
    const snaps = await col().where('userId', '==', userId).where('read', '==', false).limit(100).get();
    for (const snap of snaps.docs) {
      batch.update(snap.ref, { read: true });
    }
    await batch.commit();
  },

  async countUnread(userId) {
    const snaps = await col().where('userId', '==', userId).where('read', '==', false).count().get();
    return snaps.data().count;
  },

  async listByUser(userId, { limit = 20 } = {}) {
    const snaps = await col().where('userId', '==', userId).orderBy('createdAt', 'desc').limit(limit).get();
    return snaps.docs.map(snapToData);
  },

  async updateEmailStatus(id, status) {
    await col().doc(id).update({ emailStatus: status });
  },
};
