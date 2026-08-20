// api/login.js
// Server-side admin login for Masters CMS.
// Credentials live only in Vercel Environment Variables.
import crypto from 'crypto';

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function createSession(user, secret) {
  const exp = Date.now() + 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ u: user, exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user, pass } = req.body || {};
  const expectedUser = process.env.CMS_ADMIN_USER;
  const expectedPass = process.env.CMS_ADMIN_PASS;

  if (!expectedUser || !expectedPass) {
    return res.status(500).json({ error: 'Admin authentication is not configured' });
  }

  if (safeEqual(user, expectedUser) && safeEqual(pass, expectedPass)) {
    const session = createSession(expectedUser, expectedPass);
    res.setHeader(
      'Set-Cookie',
      `cms_session=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`
    );
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ error: 'Invalid username or password' });
}
