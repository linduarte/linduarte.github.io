const fs = require('fs');
const reports = [
  // prefer cleaned reports when present
  {files: ['reports_download/landing-lighthouse.cleaned.report.json', 'reports_download/landing-lighthouse.report.json'], title: 'Landing'},
  {files: ['reports_download/login-lighthouse.cleaned.report.json', 'reports_download/login-lighthouse.report.json'], title: 'Login'},
  // prefer cleaned report (blocked / sanitized) if present, fall back to original
  {files: ['reports_download/prefacio-lighthouse.cleaned.report.json', 'reports_download/prefacio-lighthouse.report.json'], title: 'Prefacio'},
];
let body = '## Automated audit summary\n\n';
function computePerfScoreFromAudits(audits) {
  if (!audits || typeof audits !== 'object') return 'N/A';
  // common performance audit keys that contribute to the perf category
  const keys = ['first-contentful-paint', 'largest-contentful-paint', 'speed-index', 'total-blocking-time', 'cumulative-layout-shift'];
  const scores = [];
  for (const k of keys) {
    const a = audits[k];
    if (!a) continue;
    // some audits provide a numeric 'score' in [0..1]
    if (typeof a.score === 'number') scores.push(a.score * 100);
    // others may put a numericValue but not a score; ignore those for category fallback
  }
  if (scores.length === 0) return 'N/A';
  const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  return avg;
}
for (const r of reports) {
  // pick the first existing file from the list of candidates
  const fileCandidates = r.files || (r.file ? [r.file] : []);
  let fileToRead = null;
  for (const f of fileCandidates) {
    if (!fs.existsSync(f)) continue;
    // try to parse and skip reports that contain runtime errors (interstitials)
    try {
      const raw = fs.readFileSync(f, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.runtimeError) {
        // skip this candidate since Lighthouse failed to load the page
        continue;
      }
      fileToRead = f;
      break;
    } catch (e) {
      // if parse fails, skip and try next candidate
      continue;
    }
  }
  if (!fileToRead) {
    body += `### ${r.title}\n- No Lighthouse report generated.\n\n`;
    continue;
  }
  try {
    const j = JSON.parse(fs.readFileSync(fileToRead, 'utf8'));
    const cats = j.categories || {};
    // Performance: prefer category score if present, otherwise compute a best-effort fallback
    let perf = 'N/A';
    if (cats.performance && typeof cats.performance.score === 'number') {
      perf = Math.round((cats.performance.score || 0) * 100);
    } else {
      perf = computePerfScoreFromAudits(j.audits);
    }
    const acc = cats.accessibility && typeof cats.accessibility.score === 'number' ? Math.round((cats.accessibility.score || 0) * 100) : 'N/A';
    const bp = cats['best-practices'] && typeof cats['best-practices'].score === 'number' ? Math.round((cats['best-practices'].score || 0) * 100) : 'N/A';
    const seo = cats.seo && typeof cats.seo.score === 'number' ? Math.round((cats.seo.score || 0) * 100) : 'N/A';
    const fcp = j.audits && j.audits['first-contentful-paint'] ? j.audits['first-contentful-paint'].displayValue : 'N/A';
    const lcp = j.audits && j.audits['largest-contentful-paint'] ? j.audits['largest-contentful-paint'].displayValue : 'N/A';
    const cls = j.audits && j.audits['cumulative-layout-shift'] ? j.audits['cumulative-layout-shift'].displayValue : 'N/A';
    body += `### ${r.title}\n- Performance: **${perf}**\n- Accessibility: **${acc}**\n- Best practices: **${bp}**\n- SEO: **${seo}**\n- FCP: ${fcp}\n- LCP: ${lcp}\n- CLS: ${cls}\n\n`;
  } catch (e) {
    body += `### ${r.title}\n- Failed to parse report: ${e.message}\n\n`;
  }
}
// also write out a markdown summary so CI and workflow steps can attach it
try {
  if (!fs.existsSync('reports_download')) fs.mkdirSync('reports_download', { recursive: true });
  fs.writeFileSync('reports_download/audit-summary.md', body, 'utf8');
} catch (e) {
  // fall back to stdout when file write fails
  console.error('Failed to write reports_download/audit-summary.md:', e.message);
}
console.log(body);
