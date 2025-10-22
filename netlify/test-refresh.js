// Simple test script to call the Netlify function locally (or deployed URL)
// Usage: node netlify/test-refresh.js [url]

const fetch = require('node-fetch');
const url = process.argv[2] || 'http://localhost:8888/.netlify/functions/refresh';

(async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: 'demo-refresh-token' })
    });
    console.log('status', res.status);
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
