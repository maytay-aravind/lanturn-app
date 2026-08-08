import { employerAIChat, listEmployerThreads, getEmployerChatMessages, deleteEmployerThread } from '#services/employerAI.service.js';
import { asyncHandler } from '#utils/asyncHandler.js';

/**
 * POST /employers/ai/chat
 * Send a message to the AI Hiring Assistant and get a response.
 */
export const chat = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  const { threadId, message } = req.body;

  const result = await employerAIChat(uid, { threadId, message });

  res.json({
    data: result,
    meta: { requestId: req.id },
  });
});

/**
 * GET /employers/ai/threads
 * List all AI hiring assistant threads for the logged-in employer.
 */
export const listThreads = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  const threads = await listEmployerThreads(uid);

  res.json({
    data: threads,
    meta: { requestId: req.id, count: threads.length },
  });
});

/**
 * GET /employers/ai/threads/:threadId/messages
 * Get messages for a specific AI hiring assistant thread.
 */
export const getMessages = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  const { threadId } = req.params;
  const messages = await getEmployerChatMessages(threadId, uid);

  res.json({
    data: messages,
    meta: { requestId: req.id, count: messages.length },
  });
});

/**
 * DELETE /employers/ai/threads/:threadId
 * Delete a specific AI hiring assistant thread.
 */
export const deleteThread = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  const { threadId } = req.params;
  const result = await deleteEmployerThread(threadId, uid);

  res.json({
    data: result,
    meta: { requestId: req.id },
  });
});
