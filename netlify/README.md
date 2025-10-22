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

Deploy checklist (quick):
1. In Netlify, create a new site and connect your GitHub repository `linduarte/linduarte.github.io` (or add this as a new site).
2. In Site settings -> Build & deploy -> Environment, add a new variable:
   - Key: REFRESH_SECRET
   - Value: <a strong, random secret>
3. Ensure the Functions directory is set to `netlify/functions` (Netlify normally auto-detects this from `netlify.toml`).
4. Trigger a deploy (Netlify will build and publish). After a successful deploy, your function will be available at:

   https://<your-site>.netlify.app/.netlify/functions/refresh

   or (because `_redirects` is included) at:

   https://<your-site>.netlify.app/api/auth/refresh

Verification commands (replace <site> with your Netlify site host):

```pwsh
# curl JSON request
curl -X POST https://<your-site>.netlify.app/api/auth/refresh -H "Content-Type: application/json" -d '{"refresh_token":"demo-refresh-token"}'

# Or use the included test script against the deployed function
node netlify/test-refresh.js https://<your-site>.netlify.app/api/auth/refresh
```

If you want me to trigger the deploy automatically, provide a Netlify Personal Access Token (PAT) and confirm — I will use it only to trigger a deploy for this repo and will not store the token.

Security notes:
- This function is intentionally minimal for demo purposes.
- Replace the default secret, add proper token revocation checks, persistent refresh tokens, rate-limiting, and secure storage for secrets.
