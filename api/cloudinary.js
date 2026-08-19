// Vercel serverless function — proxies Cloudinary Admin API for the CMS.
// All Cloudinary credentials must live only in Vercel Environment Variables.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const API_KEY = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return res.status(500).json({ error: 'Cloudinary environment variables are not configured' });
  }

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
  const { action, next_cursor, prefix } = req.query;

  try {
    let url = '';

    if (action === 'folders') {
      url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUD_NAME)}/folders`;
    } else if (action === 'resources') {
      url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUD_NAME)}/resources/image?type=upload&max_results=50`;
      if (next_cursor) url += `&next_cursor=${encodeURIComponent(next_cursor)}`;
      if (prefix) url += `&prefix=${encodeURIComponent(prefix)}`;
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` }
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Cloudinary request failed' });
  }
}
