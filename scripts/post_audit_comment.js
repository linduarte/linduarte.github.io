#!/usr/bin/env node
// Post audit summary to PR (used by CI workflows)
// Usage: node scripts/post_audit_comment.js --reports-dir=reports

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const out = { reportsDir: null, pr: null, dry: false, reportsUrl: null };
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a.startsWith('--reports-dir=')) out.reportsDir = a.split('=')[1];
    if (a.startsWith('--pr=')) out.pr = a.split('=')[1];
    if (a.startsWith('--reports-url=')) out.reportsUrl = a.split('=')[1];
    if (a === '--dry-run' || a === '--dry') out.dry = true;
  }
  if (!out.reportsDir) out.reportsDir = 'reports';
  return out;
}

function tryReadJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return null;
  }
}

function scoreOf(j, key) {
  const cats = j.categories || {};
  return cats[key] ? Math.round((cats[key].score || 0) * 100) : 'N/A';
}

async function main() {
  const args = parseArgs();
  const reportsDir = args.reportsDir;
  const reportsUrl = args.reportsUrl || process.env.REPORTS_URL;

  const repo = process.env.GITHUB_REPOSITORY || '';
  const runId = process.env.GITHUB_RUN_ID || '';
  const artifactUrl = reportsUrl || (repo && runId ? `https://github.com/${repo}/suites/${runId}/artifacts` : 'Artifacts unavailable');

  const reports = [
    { file: path.join(reportsDir, 'landing-lighthouse.report.json'), title: 'Landing' },
    { file: path.join(reportsDir, 'login-lighthouse.report.json'), title: 'Login' },
    { file: path.join(reportsDir, 'prefacio-lighthouse.report.json'), title: 'Prefacio' },
  ];

  let body = `## Automated audit summary\n\nArtifacts: ${artifactUrl}\n\n`;
  for (const r of reports) {
    if (!fs.existsSync(r.file)) {
      body += `### ${r.title}\n- No Lighthouse report generated.\n\n`;
      continue;
    }
    const j = tryReadJSON(r.file);
    if (!j) {
      body += `### ${r.title}\n- Failed to parse report.\n\n`;
      continue;
    }
    const perf = scoreOf(j, 'performance');
    const acc = scoreOf(j, 'accessibility');
    const bp = scoreOf(j, 'best-practices');
    const seo = scoreOf(j, 'seo');
    const fcp = j.audits && j.audits['first-contentful-paint'] ? j.audits['first-contentful-paint'].displayValue : 'N/A';
    const lcp = j.audits && j.audits['largest-contentful-paint'] ? j.audits['largest-contentful-paint'].displayValue : 'N/A';
    const cls = j.audits && j.audits['cumulative-layout-shift'] ? j.audits['cumulative-layout-shift'].displayValue : 'N/A';
    body += `### ${r.title}\n- Performance: **${perf}**\n- Accessibility: **${acc}**\n- Best practices: **${bp}**\n- SEO: **${seo}**\n- FCP: ${fcp}\n- LCP: ${lcp}\n- CLS: ${cls}\n\n`;
  }

  // If an audit-summary.md exists (from other workflow) prefer to use it as body
  const altSummary = path.join(reportsDir, 'audit-summary.md');
  if (fs.existsSync(altSummary)) {
    try {
      const txt = fs.readFileSync(altSummary, 'utf8');
      body = txt;
    } catch (e) {
      // ignore and use generated body
    }
  }

  // Read event payload to find PR number (pull_request runs)
  const eventPath = process.env.GITHUB_EVENT_PATH;
  let prNumber = null;
  if (args.pr) {
    prNumber = args.pr;
  }
  if (!prNumber && process.env.PR_NUMBER) {
    prNumber = process.env.PR_NUMBER;
  }
  if (!prNumber && eventPath && fs.existsSync(eventPath)) {
    try {
      const ev = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
      prNumber = ev.pull_request && ev.pull_request.number ? ev.pull_request.number : null;
    } catch (e) {
      // ignore
    }
  }

  if (!prNumber) {
    console.info('No PR number found (event payload or PR_NUMBER/env arg); skipping comment.');
    return 0;
  }

  const token = process.env.GITHUB_TOKEN;
  const dryRun = args.dry || process.env.DRY_RUN === 'true';
  const finalReportsUrl = reportsUrl || process.env.REPORTS_URL;
  if (!token && !dryRun) {
    console.info('No GITHUB_TOKEN provided and not running in dry-run mode; skipping comment.');
    return 0;
  }

  const [owner, repoName] = (process.env.GITHUB_REPOSITORY || '').split('/');
  if (!owner || !repoName) {
    if (!dryRun) {
      console.info('GITHUB_REPOSITORY not set; skipping comment.');
      return 0;
    }
    // in dry-run mode, it's ok if GITHUB_REPOSITORY is not set; continue and just print the body
  }

  const url = `https://api.github.com/repos/${owner}/${repoName}/issues/${prNumber}/comments`;
  const payload = JSON.stringify({ body });

  // Use Node's https.request to avoid depending on global fetch
  const https = require('https');

  function postJson(urlStr, data, token) {
    return new Promise((resolve, reject) => {
      try {
        const u = new URL(urlStr);
        const opts = {
          hostname: u.hostname,
          path: u.pathname + (u.search || ''),
          method: 'POST',
          headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'post-audit-comment-script',
            'Content-Length': Buffer.byteLength(data)
          }
        };
        const req = https.request(opts, res => {
          let body = '';
          res.setEncoding('utf8');
          res.on('data', d => body += d);
          res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', err => reject(err));
        req.write(data);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  if (dryRun) {
    console.log('--- DRY RUN: comment body follows ---');
    console.log(body);
    if (finalReportsUrl) console.log('\nReports URL: ' + finalReportsUrl);
    console.log('--- END DRY RUN ---');
    return 0;
  }

  try {
    const res = await postJson(url, payload, token);
    if (!res || res.status < 200 || res.status >= 300) {
      console.info('Failed to post PR comment with provided token:', res && res.status, res && res.body);
      // If we got a 403 and a fallback token is provided, try that once.
      const alt = process.env.REPO_WRITE_TOKEN;
      if (res && res.status === 403 && alt && alt !== token) {
        try {
          console.info('Attempting retry with REPO_WRITE_TOKEN fallback...');
          const r2 = await postJson(url, payload, alt);
          if (r2 && r2.status >= 200 && r2.status < 300) {
            console.info('Posted audit comment to PR #' + prNumber + ' using REPO_WRITE_TOKEN');
            return 0;
          }
          console.info('Retry with REPO_WRITE_TOKEN failed:', r2 && r2.status, r2 && r2.body);
        } catch (e2) {
          console.info('Retry with REPO_WRITE_TOKEN error:', e2 && (e2.message || e2));
        }
      }
      return 1;
    }
    console.info('Posted audit comment to PR #' + prNumber);
    return 0;
  } catch (e) {
    console.info('Error posting PR comment:', e && (e.message || e));
    return 1;
  }
}

main().then(code => process.exit(code)).catch(err => { console.error(err); process.exit(1); });
