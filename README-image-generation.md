This project includes scripts to generate responsive WebP image variants for auditing and previewing.

Usage (locally):

1. Install dependencies (recommended to use Node.js 18+):

   npm install

2. Generate variants for all candidates found in `reports_image_candidates_summary.json`:

   node scripts/ci_generate_variants.js --input=reports_image_candidates_summary.json --out=tmp/generated-images

The script will call `scripts/generate_responsive_images.js` for each candidate and collect results in `tmp/generated-images`.

CI usage:
- Add a job step to install Node and run `npm ci`.
- Run `node scripts/ci_generate_variants.js --input=reports_image_candidates_summary.json --out=tmp/generated-images` before starting the static server for audits.

Notes:
- The generation is ephemeral: the script copies the generated files into `tmp/generated-images`. It does not commit any generated files.
- The script skips tiny icons (heuristic) to avoid unnecessary variants.
