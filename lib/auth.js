import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_token';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('Missing ADMIN_SECRET env var');
  return secret;
}

export function createToken() {
  const payload = `admin:${Date.now()}`;
  const sig = crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;
  let payload;
  try {
    payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
  } catch {
    return false;
  }
  const expected = crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch {
    return false;
  }
  // Check age (7d)
  const ts = parseInt(payload.split(':')[1], 10);
  if (!ts || Date.now() - ts > MAX_AGE * 1000) return false;
  return true;
}

export function isAuthenticated() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifyToken(token);
}

export function setAuthCookie(response) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: createToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: MAX_AGE,
  });
  return response;
}

export function clearAuthCookie(response) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}
