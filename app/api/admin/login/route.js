import { NextResponse } from 'next/server';
import { setAuthCookie } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const password = typeof body?.password === 'string' ? body.password : '';
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 });
  }
  // Simple constant-ish compare; both strings are user-controlled on the server side.
  if (password.length !== expected.length || password !== expected) {
    // Small delay to slow brute-force
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 });
  }

  return setAuthCookie(NextResponse.json({ ok: true }));
}
