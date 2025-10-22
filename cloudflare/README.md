Cloudflare Worker for /api/auth/refresh

Files:
- cloudflare/worker-refresh.js - demo Cloudflare Worker implementation for refresh

Deploy with Wrangler (dev):
1. Install Wrangler: npm i -g wrangler
2. Authenticate and configure your account: wrangler login
3. Create a worker (or use wrangler.toml) and deploy:

   wrangler dev cloudflare/worker-refresh.js
   # or to deploy:
   wrangler publish cloudflare/worker-refresh.js

Notes:
- This demo worker issues short-lived unsigned-looking tokens for compatibility/testing only. Replace the signing logic with proper asymmetric (RS256) or HMAC signing in production.
- Set secrets via Wrangler/environment variables (REFRESH_SECRET, TOKEN_AUD).
- CORS allows origin https://linduarte.github.io by default; change if needed.

Security:
- Implement refresh token rotation, revocation, rate-limits, and storage.
- Use secure secrets and a validated token signing procedure.
