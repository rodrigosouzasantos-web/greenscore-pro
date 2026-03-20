export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const rapidKey = req.headers['x-rapid-key'] || '';

  if (!rapidKey) {
    return res.status(400).json({ error: 'API key missing' });
  }

  try {
    // Busca jogos ao vivo
    const r1 = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: { 'x-apisports-key': rapidKey }
    });
    const data = await r1.json();
    const fixtures = data.response || [];

    // Busca stats para jogos sem estatísticas (max 10 para não estourar limite)
    const semStats = fixtures.filter(f => !f.statistics?.length).slice(0, 10);
    await Promise.all(semStats.map(async f => {
      try {
        const r2 = await fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${f.fixture.id}`, {
          headers: { 'x-apisports-key': rapidKey }
        });
        const sd = await r2.json();
        if (sd.response?.length) f.statistics = sd.response;
      } catch {}
    }));

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
