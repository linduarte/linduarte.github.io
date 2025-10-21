Build instructions for Pages deploy

This repository contains a minimal build step used by the GitHub Actions Pages deploy workflow.

What the `npm run build` script does
- Removes any existing `dist/` directory
- Creates a fresh `dist/` directory
- Copies `index.html`, `landing.html` and the `app/` directory into `dist/`

Run locally:

1. Install Node (optional) if you don't have it. Node is only needed to run `npm run build`.
2. From the repo root:

   npm ci
   npm run build

3. The `dist/` folder will be ready for publishing (contains HTML + static assets).

If you later add a frontend build tool (Vite, Webpack), update the `build` script accordingly and adjust the workflow's `publish_dir` as necessary.
