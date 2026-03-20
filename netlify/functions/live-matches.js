exports.handler = async (event) => {
  const rapidKey = event.headers['x-rapid-key'] || '';
  const fdKey = event.headers['x-fd-key'] || '';

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  // API-Football via api-sports.io — inclui estatísticas inline
  if (rapidKey) {
    try {
      const res = await fetch('https://v3.football.api-sports.io/fixtures?live=all&statistics=true', {
        headers: {
          'x-apisports-key': rapidKey
        }
      });
      const data = await res.json();

      // Se a API não retornou stats inline, busca separado para os primeiros 10 jogos
      const fixtures = data.response || [];
      const semStats = fixtures.filter(f => !f.statistics?.length);

      if (semStats.length > 0 && semStats.length <= 15) {
        await Promise.all(semStats.slice(0, 10).map(async f => {
          try {
            const sr = await fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${f.fixture.id}`, {
              headers: { 'x-apisports-key': rapidKey }
            });
            const sd = await sr.json();
            if (sd.response?.length) f.statistics = sd.response;
          } catch {}
        }));
      }

      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(data) };
    } catch (e) {
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: e.message }) };
    }
  }

  // football-data.org (fallback)
  if (fdKey) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(
        `https://api.football-data.org/v4/matches?status=IN_PLAY,PAUSED&dateFrom=${today}&dateTo=${today}`,
        { headers: { 'X-Auth-Token': fdKey } }
      );
      const data = await res.json();
      return { statusCode: res.status, headers: corsHeaders, body: JSON.stringify(data) };
    } catch (e) {
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'API key missing' }) };
};
