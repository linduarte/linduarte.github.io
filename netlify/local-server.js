// Simple local server to host Netlify function handler for testing without netlify-cli
const express = require('express');
const bodyParser = require('body-parser');
const handlerModule = require('./functions/refresh');

const app = express();
app.use(bodyParser.json());

app.post('/.netlify/functions/refresh', async (req, res) => {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify(req.body)
  };
  const result = await handlerModule.handler(event, {});
  res.status(result.statusCode).set(result.headers || {}).send(result.body);
});

app.options('/.netlify/functions/refresh', (req, res) => {
  const result = handlerModule.handler({ httpMethod: 'OPTIONS' }, {});
  // result may be a promise; handle both
  Promise.resolve(result).then(r => res.status(r.statusCode).set(r.headers || {}).send());
});

const port = process.env.PORT || 8888;
app.listen(port, () => console.log('Local netlify function server listening on', port));
