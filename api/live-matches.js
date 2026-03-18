export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const rapidKey = req.headers['x-rapid-key'] || '';
  const fdKey = req.headers['x-fd-key'] || '';

  // API-Football via api-sports.io
  if (rapidKey) {
    try {
      const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
        headers: { 'x-apisports-key': rapidKey }
      });
      const data = await response.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // football-data.org (fallback)
  if (fdKey) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `https://api.football-data.org/v4/matches?status=IN_PLAY,PAUSED&dateFrom=${today}&dateTo=${today}`,
        { headers: { 'X-Auth-Token': fdKey } }
      );
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: 'API key missing' });
}
