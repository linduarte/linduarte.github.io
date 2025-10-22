Netlify function for /api/auth/refresh

Files:
- netlify/functions/refresh.js - demo refresh endpoint (returns HS256-signed access tokens for a demo refresh token)

How it works (dev/demo):
- POST /api/auth/refresh with JSON { "refresh_token": "demo-refresh-token" }
- Returns { access_token, token_type, expires_in }
- CORS allows origin https://linduarte.github.io (GitHub Pages). Adjust as needed.

Local testing with Netlify CLI:
1. Install netlify-cli (if not installed):

   npm i -g netlify-cli

2. From the repo root, run:

   netlify dev

3. Call the function:

   curl -X POST http://localhost:8888/.netlify/functions/refresh -H "Content-Type: application/json" -d '{"refresh_token":"demo-refresh-token"}'

Deploy:
- Push to a branch and add the repository to Netlify, or create a site and connect to this repo. Set environment variable REFRESH_SECRET in Netlify for production use.

Security notes:
- This function is intentionally minimal for demo purposes.
- Replace the default secret, add proper token revocation checks, persistent refresh tokens, rate-limiting, and secure storage for secrets.
