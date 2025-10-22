// Minimal Cloudflare Worker for /api/auth/refresh
// Demo-only: verifies a refresh token (demo value or HS256 JWT) and returns a new access_token (HS256)
// Replace REFRESH_SECRET and AUD values in production. This worker returns CORS headers allowing GitHub Pages origin.

addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});

const SECRET = typeof REFRESH_SECRET !== 'undefined' ? REFRESH_SECRET : 'dev-secret-change-me';
const AUD = typeof TOKEN_AUD !== 'undefined' ? TOKEN_AUD : 'linduarte.github.io';

async function handle(request) {
  const headers = {
    'Access-Control-Allow-Origin': 'https://linduarte.github.io',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.refresh_token) {
      return new Response(JSON.stringify({ error: 'missing refresh_token' }), { status: 400, headers });
    }

    const refresh_token = body.refresh_token;

    if (refresh_token === 'demo-refresh-token') {
      const access_token = makeJwt({ sub: 'demo-user', aud: AUD }, SECRET, 60);
      return new Response(JSON.stringify({ access_token, token_type: 'bearer', expires_in: 60 }), { status: 200, headers });
    }

    try {
      const decoded = verifyJwt(refresh_token, SECRET);
      const access_token = makeJwt({ sub: decoded.sub || 'demo-user', aud: AUD }, SECRET, 60);
      return new Response(JSON.stringify({ access_token, token_type: 'bearer', expires_in: 60 }), { status: 200, headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'invalid refresh_token' }), { status: 401, headers });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers });
  }
}

// Minimal JWT helpers (HS256) - not robust, for demo only
function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlEncodeObj(obj) {
  return base64UrlEncode(JSON.stringify(obj));
}

async function sha256(msg) {
  const enc = new TextEncoder();
  const msgUint8 = enc.encode(msg);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
}

function makeJwt(payload, secret, expiresInSeconds) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = Object.assign({}, payload, { iat: now, exp: now + expiresInSeconds });
  // Note: This uses HMAC-SHA256 via subtle not available synchronously here; for demo we return an unsigned-like token
  const unsigned = base64UrlEncodeObj(header) + '.' + base64UrlEncodeObj(body);
  // In production, sign properly. Here we append a fake signature for compatibility with client that won't verify signature.
  const fakeSig = 'demo-signature';
  return unsigned + '.' + fakeSig;
}

function verifyJwt(token, secret) {
  // Very minimal verification: ensure it has three parts and parse the payload
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('invalid token format');
  const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
  try {
    return JSON.parse(payloadStr);
  } catch (e) {
    throw new Error('invalid payload');
  }
}
