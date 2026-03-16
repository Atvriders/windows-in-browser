const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing url');

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    // Strip headers that block iframe embedding
    const blocked = ['x-frame-options','content-security-policy','x-content-type-options'];
    response.headers.forEach((value, name) => {
      if (!blocked.includes(name.toLowerCase())) {
        res.setHeader(name, value);
      }
    });

    res.status(response.status);
    response.body.pipe(res);
  } catch (err) {
    res.status(502).send(`Proxy error: ${err.message}`);
  }
});

app.listen(4000, () => console.log('Proxy running on port 4000'));
