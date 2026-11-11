import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = '_blog_comment_tokens';
const MAX_STORED_TOKENS = 50;

export function generateCommentToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, tokenHash };
}

export function hashCommentToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Safely parse tokens stored in the HttpOnly cookie.
 * Format is JSON mapping: { [commentId: string]: string }
 */
export async function getStoredCommentTokens(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return {};
    const parsed = JSON.parse(cookie.value);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, string>;
    }
  } catch {
    // If invalid JSON or decryption fails, ignore
  }
  return {};
}

/**
 * Saves a new comment token into the HttpOnly cookie.
 */
export async function storeCommentToken(commentId: string, rawToken: string): Promise<void> {
  const cookieStore = await cookies();
  const currentTokens = await getStoredCommentTokens();

  // Keep latest MAX_STORED_TOKENS to prevent cookie header overflow
  const entries = Object.entries(currentTokens);
  if (entries.length >= MAX_STORED_TOKENS) {
    // Drop oldest entries
    entries.splice(0, entries.length - MAX_STORED_TOKENS + 1);
  }

  const updatedTokens: Record<string, string> = Object.fromEntries(entries);
  updatedTokens[commentId] = rawToken;

  cookieStore.set(COOKIE_NAME, JSON.stringify(updatedTokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 180, // 180 days
  });
}

/**
 * Removes a deleted comment token from the cookie.
 */
export async function removeCommentToken(commentId: string): Promise<void> {
  const cookieStore = await cookies();
  const currentTokens = await getStoredCommentTokens();
  if (currentTokens[commentId]) {
    delete currentTokens[commentId];
    cookieStore.set(COOKIE_NAME, JSON.stringify(currentTokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 180,
    });
  }
}

/**
 * Verifies if the visitor holds the valid token for the given comment hash.
 */
export async function verifyCommentOwnership(commentId: string, expectedHash: string): Promise<boolean> {
  const currentTokens = await getStoredCommentTokens();
  const rawToken = currentTokens[commentId];
  if (!rawToken) return false;

  const computedHash = hashCommentToken(rawToken);
  // Constant-time comparison to prevent timing attacks
  try {
    const bufA = Buffer.from(computedHash, 'hex');
    const bufB = Buffer.from(expectedHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

