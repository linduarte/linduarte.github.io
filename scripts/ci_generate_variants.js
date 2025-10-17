const fs = require('fs');
const path = require('path');
const child = require('child_process');

function run(cmd, args, opts={}){
  console.log('>', cmd, args.join(' '));
  const res = child.spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...opts });
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(`${cmd} exited ${res.status}`);
}

const argv = require('minimist')(process.argv.slice(2));
const input = argv.input || argv.i || 'reports_image_candidates_summary.json';
const outDir = argv.out || argv.o || 'tmp/generated-images';
const widthsOverride = argv.widths ? argv.widths.split(',').map(s=>s.trim()) : null;

if (!fs.existsSync(input)) {
  console.error('Input JSON not found:', input);
  process.exit(2);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const list = JSON.parse(fs.readFileSync(input, 'utf8'));

// build tasks: skip tiny icons by heuristic (exampleWidth < 32)
const tasks = [];
for (const entry of list) {
  const src = entry.src.replace(/^\/+/, ''); // remove leading slash
  const rel = path.join(process.cwd(), src);
  if (!fs.existsSync(rel)) {
    console.warn('source not found, skipping:', rel);
    continue;
  }
  const exampleW = entry.exampleWidth || 0;
  if (exampleW && exampleW < 32) { // skip tiny icons
    console.log('skip tiny icon', src);
    continue;
  }
  const widths = widthsOverride || entry.suggestedWidths.split(',');
  tasks.push({ src: rel, widths });
}

console.log('Will generate variants for', tasks.length, 'images into', outDir);

for (const t of tasks) {
  const src = t.src;
  const ext = path.extname(src);
  const base = path.basename(src, ext);
  for (const w of t.widths) {
    const outName = `${base}-${w}.webp`;
    const outPath = path.join(outDir, outName);
    // call the existing generator but force output into outDir by copying source to temp and generating there
    try {
      run('node', ['scripts/generate_responsive_images.js', src, `--widths=${w}`]);
      // move generated file to outDir
      const generated = path.join(path.dirname(src), `${base}-${w}.webp`);
      if (fs.existsSync(generated)) {
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.copyFileSync(generated, outPath);
        fs.unlinkSync(generated);
        console.log('moved', generated, '->', outPath);
      } else {
        console.warn('expected generated file not found:', generated);
      }
    } catch (e) {
      console.error('generation failed for', src, e.message);
    }
  }
}

console.log('Done.');
