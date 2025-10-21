Deployment summary
==================

Status: Deployed (branch: `gh-pages`)

Frontend site URL (GitHub Pages):

https://linduarte.github.io/

How to verify
-------------

1. Open the URL above in a browser. The site should serve the static frontend (Swagger UI and landing pages).
2. If you enabled a custom domain, confirm the domain is set in Repository Settings → Pages and that DNS points to GitHub Pages.
3. Check the GitHub Actions run for the `Deploy to GitHub Pages` workflow — it should show a successful deployment.

If anything is not working:
- Wait a few minutes for GitHub Pages to finish publishing the artifacts.
- Check Actions → the deploy job logs for build output and artifact publishing details.
- Ensure Pages source is set to the `gh-pages` branch in repository settings.

Notes
-----
- The backend API is served separately at https://api.git-learn.com.br (proxied by nginx on your VPS).
- For further automation (healthchecks, invalidation, HSTS), see `MONITORING_INSTRUCTIONS.md` and the nginx configuration on the VPS.
