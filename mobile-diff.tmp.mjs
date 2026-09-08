import puppeteer from 'puppeteer';
const b = await puppeteer.launch({headless:'new', args:['--no-sandbox']});
const grab = async (w,h) => {
  const pg = await b.newPage();
  await pg.setViewport({width:w, height:h, isMobile: w<800, hasTouch: w<800, deviceScaleFactor: 1});
  await pg.goto('https://go.julex.shop/', {waitUntil:'networkidle2', timeout:60000});
  await new Promise(r=>setTimeout(r,2500));
  const secs = await pg.evaluate(() => {
    const out = [];
    const nodes = document.querySelectorAll('section, main > div > div > div');
    // instead: take all h1/h2/h3/h4 + big feature blocks in DOM order with visibility
    const els = [...document.querySelectorAll('h1,h2,h3,h4,h5')];
    return els.map(e => {
      const r = e.getBoundingClientRect();
      return { t: e.textContent.trim().replace(/\s+/g,' ').slice(0,70), y: Math.round(r.top + window.scrollY), vis: r.width>0 && r.height>0 };
    }).filter(x => x.t);
  });
  await pg.close();
  return secs;
};
const mob = await grab(390, 844);
const dsk = await grab(1440, 900);
console.log('=== MOBILE (390px) headings ==='); mob.forEach(s=>console.log(s.y, s.t));
console.log('=== DESKTOP (1440px) headings ==='); dsk.forEach(s=>console.log(s.t));
console.log('=== IN MOBILE BUT NOT DESKTOP ===');
mob.forEach(m => { if (!dsk.some(d => d.t === m.t)) console.log(m.t); });
await b.close();
