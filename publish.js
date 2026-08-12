
// api/publish.js
// Secure server-side publisher for Masters CMS.
// The GitHub token lives ONLY in a Vercel Environment Variable (GITHUB_TOKEN),
// never in the browser or any committed file.
//
// Setup (one time):
//   1. In Vercel → your project → Settings → Environment Variables, add:
//        GITHUB_TOKEN   = your new ghp_... token   (mark it as "Secret")
//        GITHUB_REPO    = austriaalvinnoel/masters-window-tinting
//        GITHUB_BRANCH  = main
//        CMS_PUBLISH_KEY = some-long-random-string-you-make-up
//   2. Redeploy. This file must live at: /api/publish.js in your repo.

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple shared-secret check so randoms can't hit your endpoint.
  // The admin panel sends this same key. It is NOT the GitHub token —
  // if it leaks, it only lets someone publish CMS JSON, not touch your account,
  // and you can rotate it anytime by changing the env var.
  const publishKey = req.headers['x-cms-key'];
  if (!publishKey || publishKey !== process.env.CMS_PUBLISH_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token  = process.env.GITHUB_TOKEN;
  const repo   = process.env.GITHUB_REPO   || 'austriaalvinnoel/masters-window-tinting';
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token) {
    return res.status(500).json({ error: 'Server is missing GITHUB_TOKEN env var' });
  }

  try {
    const { payload, message } = req.body || {};
    if (!payload) {
      return res.status(400).json({ error: 'Missing payload' });
    }

    // Get current SHA of cms-data.json (needed to update an existing file)
    const getR = await fetch(
      `https://api.github.com/repos/${repo}/contents/cms-data.json?ref=${branch}`,
      { headers: { Authorization: `token ${token}`, 'User-Agent': 'masters-cms' } }
    );
    let sha = null;
    if (getR.ok) {
      const d = await getR.json();
      sha = d.sha;
    }

    const content = Buffer.from(JSON.stringify(payload, null, 2)).toString('base64');
    const body = {
      message: message || 'CMS update',
      content,
      branch,
      committer: { name: 'Masters Admin', email: 'cms@masterswindowtinting.com' }
    };
    if (sha) body.sha = sha;

    const putR = await fetch(
      `https://api.github.com/repos/${repo}/contents/cms-data.json`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'masters-cms'
        },
        body: JSON.stringify(body)
      }
    );

    if (putR.ok) {
      return res.status(200).json({ ok: true });
    } else {
      const e = await putR.json();
      return res.status(putR.status).json({ error: e.message || 'GitHub error' });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
