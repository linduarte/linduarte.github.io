const fs = require('fs');
const reports = [
  {file: 'reports_download/landing-lighthouse.report.json', title: 'Landing'},
  {file: 'reports_download/login-lighthouse.report.json', title: 'Login'},
  {file: 'reports_download/prefacio-lighthouse.report.json', title: 'Prefacio'},
];
let body = '## Automated audit summary\n\n';
for (const r of reports) {
  if (!fs.existsSync(r.file)) {
    body += `### ${r.title}\n- No Lighthouse report generated.\n\n`;
    continue;
  }
  try {
    const j = JSON.parse(fs.readFileSync(r.file, 'utf8'));
    const cats = j.categories || {};
    const perf = cats.performance ? Math.round((cats.performance.score || 0) * 100) : 'N/A';
    const acc = cats.accessibility ? Math.round((cats.accessibility.score || 0) * 100) : 'N/A';
    const bp = cats['best-practices'] ? Math.round((cats['best-practices'].score || 0) * 100) : 'N/A';
    const seo = cats.seo ? Math.round((cats.seo.score || 0) * 100) : 'N/A';
    const fcp = j.audits && j.audits['first-contentful-paint'] ? j.audits['first-contentful-paint'].displayValue : 'N/A';
    const lcp = j.audits && j.audits['largest-contentful-paint'] ? j.audits['largest-contentful-paint'].displayValue : 'N/A';
    const cls = j.audits && j.audits['cumulative-layout-shift'] ? j.audits['cumulative-layout-shift'].displayValue : 'N/A';
    body += `### ${r.title}\n- Performance: **${perf}**\n- Accessibility: **${acc}**\n- Best practices: **${bp}**\n- SEO: **${seo}**\n- FCP: ${fcp}\n- LCP: ${lcp}\n- CLS: ${cls}\n\n`;
  } catch (e) {
    body += `### ${r.title}\n- Failed to parse report: ${e.message}\n\n`;
  }
}
console.log(body);
