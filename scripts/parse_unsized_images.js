const fs = require('fs');
const path = require('path');

const auditsDir = path.join(__dirname, '..', 'tmp', 'audits');
const outPath = path.join(__dirname, '..', 'tmp', 'unsized_report.md');

function normalizeItem(item){
  // Try several common shapes
  if (!item) return {};
  const out = {};
  if (item.node) {
    out.selector = item.node.selector || item.node.path || null;
    out.snippet = item.node.snippet || item.node.html || null;
  }
  if (item.url) out.url = item.url;
  if (item.src) out.src = item.src;
  if (item.requestedUrl) out.requestedUrl = item.requestedUrl;
  if (item.wasteBytes) out.wasteBytes = item.wasteBytes;
  return out;
}

function findUnsized(audits){
  if (!audits) return null;
  // direct key
  if (audits['unsized-images']) return audits['unsized-images'];
  // fallback: find any key containing 'unsiz'
  const k = Object.keys(audits).find(k=>/unsiz/i.test(k));
  if (k) return audits[k];
  return null;
}

if (!fs.existsSync(auditsDir)){
  console.error('No audits directory:', auditsDir);
  process.exit(1);
}

const files = fs.readdirSync(auditsDir).filter(f=>f.endsWith('.json'));
if (files.length === 0) {
  console.log('No lighthouse JSON files found in', auditsDir);
  process.exit(0);
}

let report = ['# Unsized-image issues report',''];

files.forEach(file => {
  const p = path.join(auditsDir, file);
  let raw;
  try { raw = fs.readFileSync(p, 'utf8'); } catch(e){ return; }
  let data;
  try { data = JSON.parse(raw); } catch(e){ return; }
  const unsized = findUnsized(data.audits || {});
  if (!unsized) return;
  const items = (unsized.details && unsized.details.items) || [];
  report.push(`## ${file}`);
  report.push(`Score: ${typeof unsized.score === 'number' ? unsized.score : unsized.scoreDisplayMode || 'n/a'}`);
  report.push(`Total issues: ${items.length}`);
  report.push('');
  if (items.length === 0) {
    report.push('_No items found in details.items_');
    report.push('');
    return;
  }
  items.forEach((it, idx) => {
    const n = normalizeItem(it);
    report.push(`### ${idx+1}.`);
    if (n.selector) report.push(`- selector: ${n.selector}`);
    if (n.snippet) report.push(`- snippet: ${n.snippet.replace(/\n/g,' ' ).slice(0,300)}`);
    if (n.url) report.push(`- url: ${n.url}`);
    if (n.requestedUrl) report.push(`- requestedUrl: ${n.requestedUrl}`);
    if (n.src) report.push(`- src: ${n.src}`);
    report.push('');
  });
});

fs.writeFileSync(outPath, report.join('\n'), 'utf8');
console.log('Wrote report to', outPath);
console.log('Summary:');
console.log(report.slice(0,40).join('\n'));
