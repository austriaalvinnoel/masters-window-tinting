// Vercel serverless function — proxies Cloudinary API to avoid CORS
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "dym8x61sp";
  const API_KEY    = process.env.CLOUDINARY_API_KEY    || "699816795741491";
  const API_SECRET = process.env.CLOUDINARY_API_SECRET || "RmBw82qLivool1bmydk5sU0TjzM";

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

  const { action, next_cursor, prefix } = req.query;

  try {
    let url = '';

    if (action === 'folders') {
      url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/folders`;
    } else if (action === 'resources') {
      url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?type=upload&max_results=50`;
      if (next_cursor) url += `&next_cursor=${next_cursor}`;
      if (prefix)      url += `&prefix=${encodeURIComponent(prefix)}`;
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await fetch(url, {
      headers: { 'Authorization': `Basic ${auth}` }
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
