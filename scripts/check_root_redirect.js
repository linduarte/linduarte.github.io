const puppeteer = require('puppeteer');

async function check(withToken) {
  const browser = await puppeteer.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();

  if (withToken) {
    // Set a fake token before navigation
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('access_token', 'fake-token-for-test');
    });
  }

  try {
    await page.goto('https://linduarte.github.io/', {waitUntil: ['load','networkidle2'], timeout: 60000});
  } catch (err) {
    // continue even if navigation warnings
  }

  const finalUrl = page.url();
  const hasToken = await page.evaluate(() => !!localStorage.getItem('access_token'));
  const swScopes = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return [];
    const regs = await navigator.serviceWorker.getRegistrations().catch(()=>[]);
    return regs.map(r => r.scope);
  });
  const title = await page.title().catch(()=>'');

  await browser.close();
  return {withToken, finalUrl, hasToken, swScopes, title};
}

(async () => {
  console.log('Checking without token...');
  const noToken = await check(false);
  console.log(JSON.stringify(noToken, null, 2));

  console.log('\nChecking with token set...');
  const withToken = await check(true);
  console.log(JSON.stringify(withToken, null, 2));
})();
