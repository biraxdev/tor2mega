const https = require('https');
const API_KEY = 'rnd_TVwS4Sap60D6aGGh0fgkaotC01WC';
const SERVICE_ID = 'srv-d8ra8uegvqtc73eq6qsg';
const body = JSON.stringify({ clearCache: 'clear' });
const opts = {
  hostname: 'api.render.com',
  path: `/v1/services/${SERVICE_ID}/deploys`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};
const req = https.request(opts, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => { console.log('Status:', res.statusCode); console.log(data); });
});
req.on('error', (e) => console.error(e));
req.write(body);
req.end();
