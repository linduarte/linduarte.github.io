const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Simple responsive generator - creates WebP variants at given widths
// Usage: node scripts/generate_responsive_images.js <sourcePath> [--widths=150,300,600]

const argv = process.argv.slice(2);
if (argv.length === 0) {
  console.error('Usage: node scripts/generate_responsive_images.js <sourcePath> [--widths=150,300,600]');
  process.exit(2);
}

const source = argv[0];
const widthsFlag = argv.find(a => a.startsWith('--widths='));
const widths = widthsFlag ? widthsFlag.split('=')[1].split(',').map(s => parseInt(s,10)).filter(Boolean) : [150,300,600];

(async () => {
  if (!fs.existsSync(source)) {
    console.error('Source file not found:', source);
    process.exit(3);
  }
  const ext = path.extname(source);
  const base = path.basename(source, ext);
  const dir = path.dirname(source);

  for (const w of widths) {
    const out = path.join(dir, `${base}-${w}.webp`);
    try {
      await sharp(source)
        .resize({ width: w })
        .webp({ quality: 80 })
        .toFile(out);
      console.log('Wrote', out);
    } catch (e) {
      console.error('Failed to create', out, e.message);
    }
  }
})();
