const https = require('https');
const API_KEY = 'rnd_TVwS4Sap60D6aGGh0fgkaotC01WC';
const SERVICE_ID = 'srv-d8ra8uegvqtc73eq6qsg';
const DEPLOY_ID = 'dep-d8rb99urnols73f749t0';
const opts = {
  hostname: 'api.render.com',
  path: `/v1/services/${SERVICE_ID}/deploys/${DEPLOY_ID}`,
  method: 'GET',
  headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' },
};
const req = https.request(opts, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log(data);
  });
});
req.on('error', (e) => console.error(e));
req.end();
