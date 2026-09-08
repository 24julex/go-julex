import puppeteer from 'puppeteer';
const b = await puppeteer.launch();
const p = await b.newPage();
await p.setViewport({ width: 1536, height: 864 });
await p.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 60000 });
await p.evaluate(() => [...document.querySelectorAll('header button')].find(bt => bt.textContent.includes('Sign In'))?.click());
await p.waitForSelector('input[type=email]', { timeout: 5000 });
await p.type('input[type=email]', 'admin@gojulex.com');
await p.type('input[type=password]', 'admin123');
await p.click('form button[type=submit]');
await new Promise(r => setTimeout(r, 3500));
await p.evaluate(() => { window.history.pushState({}, '', '/super-admin/themes'); window.dispatchEvent(new PopStateEvent('popstate')); });
await new Promise(r => setTimeout(r, 3000));
const m = await p.evaluate(() => {
  const cards = [...document.querySelectorAll('h4')].filter(h => h.closest('.grid'));
  return cards.map(h => {
    const card = h.closest('div.p-3\.5') || h.parentElement.parentElement;
    const themeEl = [...card.querySelectorAll('span')].find(sp => sp.previousElementSibling && sp.previousElementSibling.textContent.includes('Theme:'));
    const dom = card.querySelector('p.text-\[10px\]');
    return h.textContent.trim() + ' | ' + (dom ? dom.textContent : '') + ' | ' + (themeEl ? themeEl.textContent : '?');
  });
});
console.log(JSON.stringify(m, null, 1));
await b.close();
