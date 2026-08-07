import { notificationsRepo } from '#repositories/notifications.repository.js';
import { emailClient } from '#clients/email.client.js';
import { NOTIFICATION_TYPE } from '#config';
import { generateId } from '#utils/ids.js';
import { logger_for } from '#utils/logger.js';

const log = logger_for('notification.service');

/**
 * Create a notification and optionally dispatch an email.
 */
export async function notify({ userId, type, title, body, link, data, channel = 'both', userEmail }) {
  const id = generateId('notif');

  await notificationsRepo.create(id, {
    userId,
    type,
    title,
    body,
    link: link || '',
    data: data || {},
    channel,
  });

  // Dispatch email if channel includes email
  if ((channel === 'email' || channel === 'both') && userEmail) {
    emailClient
      .send({
        to: userEmail,
        subject: `[LanTURN] ${title}`,
        text: body,
        html: `<p>${body}</p>${link ? `<a href="${link}">View</a>` : ''}`,
      })
      .then(() => notificationsRepo.updateEmailStatus(id, 'sent'))
      .catch((err) => {
        log.error({ err, id }, 'Email send failed');
        notificationsRepo.updateEmailStatus(id, 'failed');
      });
  }

  return id;
}

/** Convenience: application received → employer */
export async function notifyApplicationReceived(employerId, employerEmail, jobTitle, studentName, jobId) {
  return notify({
    userId: employerId,
    type: NOTIFICATION_TYPE.APPLICATION_RECEIVED,
    title: 'New application',
    body: `${studentName} applied to "${jobTitle}"`,
    link: `/employer/jobs/${jobId}/applicants`,
    data: { jobId },
    userEmail: employerEmail,
  });
}

/** Convenience: status change → student */
export async function notifyApplicationStatus(studentId, studentEmail, jobTitle, status) {
  return notify({
    userId: studentId,
    type: NOTIFICATION_TYPE.APPLICATION_STATUS,
    title: 'Application update',
    body: `Your application for "${jobTitle}" was ${status}`,
    link: '/student/applications',
    data: { status },
    userEmail: studentEmail,
  });
}

/** Convenience: job removed → applicants */
export async function notifyJobRemoved(userIds, userEmails, jobTitle, jobId) {
  const promises = userIds.map((uid, i) =>
    notify({
      userId: uid,
      type: NOTIFICATION_TYPE.JOB_REMOVED,
      title: 'Job removed',
      body: `The job "${jobTitle}" was removed`,
      link: '/student/jobs',
      data: { jobId },
      userEmail: userEmails[i],
      channel: 'inapp',
    })
  );
  return Promise.allSettled(promises);
}

/** Convenience: new job posted → all students */
export async function notifyNewJob(studentIds, jobTitle, companyName, jobId) {
  // Batch insert via repository is better, but since notify() uses repo.create per id,
  // Promise.allSettled is fine for MVP.
  const promises = studentIds.map((uid) =>
    notify({
      userId: uid,
      type: NOTIFICATION_TYPE.NEW_JOB,
      title: 'New Job Posted',
      body: `${companyName} just posted a new opening for "${jobTitle}"`,
      link: '/student/jobs',
      data: { jobId },
      channel: 'inapp',
    })
  );
  return Promise.allSettled(promises);
}

export async function listNotifications(userId, query) {
  return notificationsRepo.listByUser(userId, query);
}

export async function markNotificationRead(id) {
  await notificationsRepo.markRead(id);
}

export async function markAllNotificationsRead(userId) {
  await notificationsRepo.markAllRead(userId);
}

export async function getUnreadCount(userId) {
  return notificationsRepo.countUnread(userId);
}
