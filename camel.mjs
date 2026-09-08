import puppeteer from 'puppeteer';
const b = await puppeteer.launch();
const p = await b.newPage();
p.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0,150)));
await p.setViewport({ width: 1280, height: 900 });
await p.goto('http://localhost:3000/store/abisjewel?theme=preset_camel_edit&preview=1', { waitUntil: 'networkidle0', timeout: 60000 });
await new Promise(r => setTimeout(r, 2500));
const structure = await p.evaluate(() => {
  const txt = document.body.innerText.toUpperCase();
  return {
    header: !!document.querySelector('header h1'),
    hero: txt.includes('NEW') && txt.includes('SEASON DROP'),
    categoryCards: document.querySelectorAll('#categories button').length,
    offer: txt.includes('SEASON SALE'),
    bestSellers: txt.includes('BEST SELLERS') || txt.includes('MOST WANTED'),
    pillars: txt.includes('HOUSE PROMISE') || txt.includes('FREE EXPRESS'),
    aboutContact: txt.includes('GET IN TOUCH') && txt.includes('WHATSAPP'),
    filterChips: [...document.querySelectorAll('button')].filter(x => ['All','Womenswear','Menswear','Footwear','Accessories','Occasion'].includes(x.textContent.trim())).length
  };
});
// category filter test
await p.evaluate(() => [...document.querySelectorAll('#categories button')].find(x => x.textContent.includes('Footwear'))?.click());
await new Promise(r => setTimeout(r, 700));
const filtered = await p.evaluate(() => [...document.querySelectorAll('#products .grid > div')].length);
await p.evaluate(() => [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'All')?.click());
// add to bag
await p.evaluate(() => [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Add to Bag')?.click());
await new Promise(r => setTimeout(r, 1200));
const cart = await p.evaluate(() => document.querySelector('header [class*="rounded-full"][class*="w-4"]')?.textContent);
// newsletter form
await p.evaluate(() => document.querySelector('#about form input')?.scrollIntoView({ block: 'center' }));
await new Promise(r => setTimeout(r, 400));
await p.type('#about form input', 'test@fashion.com');
await p.evaluate(() => document.querySelector('#about form button')?.click());
await new Promise(r => setTimeout(r, 500));
const news = await p.evaluate(() => { const b = document.querySelector('#about form button'); return b ? b.textContent : null; });
await p.screenshot({ path: 'camel-preview.png', fullPage: true });
console.log(JSON.stringify({ structure, filteredCards: filtered, bagCount: cart }, null, 1));
await b.close();
