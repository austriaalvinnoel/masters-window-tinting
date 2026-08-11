export default function handler(req, res) {
  res
    .status(410)
    .setHeader('Content-Type', 'text/plain; charset=utf-8')
    .send('Gone');
}
