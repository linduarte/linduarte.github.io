const fs = require('fs');
const path = require('path');

function walkDir(dir, ext = '.html') {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of list) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) results = results.concat(walkDir(full, ext));
    else if (ent.isFile() && full.toLowerCase().endsWith(ext)) results.push(full);
  }
  return results;
}

function findHtmlFiles() {
  const templatesDir = path.join(process.cwd(), 'app', 'templates');
  const templates = fs.existsSync(templatesDir) ? walkDir(templatesDir) : [];
  const top = fs.readdirSync(process.cwd()).filter(f => f.toLowerCase().endsWith('.html')).map(f => path.join(process.cwd(), f));
  return templates.concat(top);
}

function extractImgs(content) {
  const re = /<img\b[^>]*>/gi;
  const matches = content.match(re) || [];
  return matches.map(tag => {
    const src = (tag.match(/src\s*=\s*["']?([^"'\s>]+)/i) || [])[1] || '';
    const width = (tag.match(/width\s*=\s*["']?(\d+)/i) || [])[1] || null;
    const height = (tag.match(/height\s*=\s*["']?(\d+)/i) || [])[1] || null;
    const cls = (tag.match(/class\s*=\s*["']?([^"'>]+)/i) || [])[1] || null;
    return { tag, src, width: width ? Number(width) : null, height: height ? Number(height) : null, class: cls };
  });
}

function suggestWidths(w) {
  if (!w) return '150,300,600';
  if (w >= 1200) return '400,800,1200';
  if (w >= 900) return '300,600,900';
  if (w >= 600) return '150,300,600';
  return '150,300';
}

const files = findHtmlFiles();
const imgs = [];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const tags = extractImgs(content);
  for (const t of tags) {
    if (!t.src) continue;
    if (t.src.includes('/app/static/images/')) {
      imgs.push({ file: f, src: t.src, tag: t.tag, width: t.width, height: t.height, class: t.class });
    }
  }
});

const grouped = {};
for (const it of imgs) {
  if (!grouped[it.src]) grouped[it.src] = [];
  grouped[it.src].push(it);
}

const summary = Object.keys(grouped).map(src => {
  const entries = grouped[src];
  const sample = entries[0];
  let w = sample.width;
  if (!w) {
    const cls = sample.class || sample.tag;
    if (/img-fullwidth/.test(cls)) w = 1200;
    else if (/img-full/.test(cls)) w = 900;
    else if (/img-half(width)?/.test(cls)) w = 600;
    else w = 600;
  }
  const widths = suggestWidths(w);
  return { src, usedIn: entries.map(e => e.file).filter((v,i,a)=>a.indexOf(v)===i), exampleWidth: sample.width, exampleHeight: sample.height, suggestedWidths: widths };
});

const outPath = path.join(process.cwd(), 'reports_image_candidates_summary.json');
fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
console.log('Wrote', outPath, 'with', summary.length, 'entries');
console.log('Top candidates:');
summary.slice(0,20).forEach((s,i) => {
  console.log(`${i+1}. ${s.src} — example ${s.exampleWidth || 'unknown'}x${s.exampleHeight || 'unknown'} — suggested widths: ${s.suggestedWidths}`);
});

process.exit(0);
