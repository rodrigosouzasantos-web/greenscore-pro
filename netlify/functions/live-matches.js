exports.handler = async (event) => {
  const apiKey = event.headers['x-fd-key'] || '';
  if (!apiKey) {
    return { statusCode: 400, body: JSON.stringify({ error: 'API key missing' }) };
  }

  const today = new Date().toISOString().split('T')[0];
  const url = `https://api.football-data.org/v4/matches?status=IN_PLAY,PAUSED&dateFrom=${today}&dateTo=${today}`;

  try {
    const res = await fetch(url, {
      headers: { 'X-Auth-Token': apiKey }
    });
    const data = await res.json();
    return {
      statusCode: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data)
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
