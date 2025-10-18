const fs = require('fs');
const path = require('path');

function walk(dir) {
  const res = [];
  if (!fs.existsSync(dir)) return res;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) res.push(...walk(full));
    else res.push(full);
  }
  return res;
}

const args = process.argv.slice(2);
const targets = args.length ? args : ['tmp/generated-images', 'app/static/images'];
let changed = 0;
for (const t of targets) {
  const abs = path.resolve(process.cwd(), t);
  const files = walk(abs);
  for (const f of files) {
    const base = path.basename(f);
    if (/\?=\d+/.test(base)) {
      const newBase = base.replace(/\?=\d+/g, '');
      const newPath = path.join(path.dirname(f), newBase);
      try {
        fs.renameSync(f, newPath);
        console.log('Renamed', f, '->', newPath);
        changed++;
      } catch (e) {
        console.error('Failed rename', f, e.message);
      }
    }
  }
}

// Optionally sanitize HTML files passed with --html flag
if (args.includes('--html')) {
  const htmlDir = path.join(process.cwd(), 'app', 'templates');
  const htmlFiles = walk(htmlDir).filter(p => p.endsWith('.html'));
  for (const hf of htmlFiles) {
    const txt = fs.readFileSync(hf, 'utf8');
    if (/\?=\d+/.test(txt)) {
      const replaced = txt.replace(/\?=\d+/g, '');
      fs.writeFileSync(hf, replaced, 'utf8');
      console.log('Sanitized HTML', hf);
      changed++;
    }
  }
}

if (changed === 0) console.log('No query-suffix filenames found.');
else console.log('Sanitization complete —', changed, 'changes made.');
