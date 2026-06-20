const https = require('https');
const API_KEY = 'rnd_TVwS4Sap60D6aGGh0fgkaotC01WC';
const SERVICE_ID = 'srv-d8ra8uegvqtc73eq6qsg';
const opts = {
  hostname: 'api.render.com',
  path: `/v1/services/${SERVICE_ID}/deploys?limit=1`,
  method: 'GET',
  headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' },
};
const req = https.request(opts, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    const j = JSON.parse(data);
    if (j[0]) {
      console.log('Status:', j[0].deploy.status);
      console.log('Finished:', j[0].deploy.finishedAt || 'still running');
    }
  });
});
req.on('error', (e) => console.error(e));
req.end();
