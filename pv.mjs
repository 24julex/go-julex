import puppeteer from 'puppeteer';
const b = await puppeteer.launch();
const p = await b.newPage();
await p.setViewport({ width: 1536, height: 864 });
await p.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 60000 });
const m = await p.evaluate(() => {
  const eco = document.querySelector('#tenants-get');
  const cards = [...eco.querySelectorAll('h3')].map(h => h.textContent);
  const luxuryStatic = document.body.innerText.includes('Elevate Your Store with Signature Luxury');
  const bagsImg = !!document.querySelector('img[src="/images/gojulex_luxury_bags.jpg"]');
  const center = [...eco.querySelectorAll('h3')].find(h => h.parentElement.style.transform && h.parentElement.style.transform.startsWith('translateX(0'));
  return { visibleTitles: cards, luxuryStatic, bagsImg };
});
// rotate carousel
await p.evaluate(() => document.querySelector('#tenants-get button[aria-label="Next"]')?.click());
await new Promise(r => setTimeout(r, 800));
const after = await p.evaluate(() => {
  const eco = document.querySelector('#tenants-get');
  const center = [...eco.querySelectorAll('h3')].find(h => h.parentElement.style.transform.startsWith('translateX(0'));
  return center ? center.textContent : null;
});
console.log(JSON.stringify({ ...m, afterNextCenter: after }));
await p.screenshot({ path: 'pillar-carousel.png' });
await b.close();
