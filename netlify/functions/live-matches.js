exports.handler = async (event) => {
  const rapidKey = event.headers['x-rapid-key'] || '';
  const fdKey = event.headers['x-fd-key'] || '';

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  // API-Football via api-sports.io
  if (rapidKey) {
    try {
      const res = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
        headers: {
          'x-apisports-key': rapidKey
        }
      });
      const data = await res.json();
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
