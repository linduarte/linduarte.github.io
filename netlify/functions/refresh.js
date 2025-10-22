// Minimal Netlify Function for /api/auth/refresh
// - Demo-only: validates a mock refresh_token and returns a new access_token (signed HS256)
// - CORS enabled for GitHub Pages origin: https://linduarte.github.io
// - Replace process.env.REFRESH_SECRET with a secure secret in production

const jwt = require('jsonwebtoken');

// Default secret for local dev only
const SECRET = process.env.REFRESH_SECRET || 'dev-secret-change-me';
const AUD = process.env.TOKEN_AUD || 'linduarte.github.io';

exports.handler = async function (event, context) {
  // Allow CORS from Pages origin
  const headers = {
    'Access-Control-Allow-Origin': 'https://linduarte.github.io',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    if (!event.body) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'missing body' }) };
    }

    const body = JSON.parse(event.body);
    const { refresh_token } = body || {};

    if (!refresh_token) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'missing refresh_token' }) };
    }

    // Demo validation: accept refresh_token === 'demo-refresh-token' or a signed JWT with same secret
    if (refresh_token === 'demo-refresh-token') {
      // issue new access token (1 minute for demo)
      const payload = { sub: 'demo-user', aud: AUD };
      const access_token = jwt.sign(payload, SECRET, { algorithm: 'HS256', expiresIn: '1m' });
      return { statusCode: 200, headers, body: JSON.stringify({ access_token, token_type: 'bearer', expires_in: 60 }) };
    }

    // If the refresh token is a signed JWT, verify it
    try {
      const decoded = jwt.verify(refresh_token, SECRET, { algorithms: ['HS256'], audience: AUD });
      // In a real implementation, check token type, revocation, user id, etc.
      const payload = { sub: decoded.sub || 'demo-user', aud: AUD };
      const access_token = jwt.sign(payload, SECRET, { algorithm: 'HS256', expiresIn: '1m' });
      return { statusCode: 200, headers, body: JSON.stringify({ access_token, token_type: 'bearer', expires_in: 60 }) };
    } catch (err) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'invalid refresh_token' }) };
    }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(err) }) };
  }
};
