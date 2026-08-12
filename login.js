// api/login.js
// Server-side admin login check for Masters CMS.
// The real username/password live ONLY in Vercel Environment Variables
// (CMS_ADMIN_USER, CMS_ADMIN_PASS) — never in the browser or any committed file.
//
// Setup (one time):
//   In Vercel -> your project -> Settings -> Environment Variables, add:
//     CMS_ADMIN_USER = choose a username
//     CMS_ADMIN_PASS = choose a strong new password
//   Then redeploy. This file must live at: /api/login.js in your repo.

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user, pass } = req.body || {};
  const expectedUser = process.env.CMS_ADMIN_USER;
  const expectedPass = process.env.CMS_ADMIN_PASS;

  if (!expectedUser || !expectedPass) {
    return res.status(500).json({ error: 'Server is missing CMS_ADMIN_USER / CMS_ADMIN_PASS env vars' });
  }

  if (typeof user === 'string' && typeof pass === 'string' &&
      safeEqual(user, expectedUser) && safeEqual(pass, expectedPass)) {
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ error: 'Invalid username or password' });
}
