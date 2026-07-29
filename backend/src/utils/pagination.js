import { PAGINATION } from '#config';

// Parse `limit` and `cursor` from a query object.
export function parsePagination(query) {
  const limit = Math.min(
    Math.max(parseInt(query?.limit, 10) || PAGINATION.DEFAULT_LIMIT, 1),
    PAGINATION.MAX_LIMIT
  );
  const cursor = query?.cursor || null;
  return { limit, cursor };
}

// Encode/decode an opaque cursor (base64 of a JSON payload).
export function encodeCursor(payload) {
  if (!payload) return null;
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function decodeCursor(cursor) {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

// Build the standard paginated response body.
export function paginated(items, nextCursor) {
  return { items, nextCursor };
}
