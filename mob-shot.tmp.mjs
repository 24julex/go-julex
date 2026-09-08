import puppeteer from 'puppeteer';
const b = await puppeteer.launch({headless:'new', args:['--no-sandbox']});
const pg = await b.newPage();
await pg.setViewport({width:390, height:844, isMobile:true, hasTouch:true});
await pg.goto('https://go.julex.shop/', {waitUntil:'networkidle2', timeout:60000});
await new Promise(r=>setTimeout(r,3000));
await pg.screenshot({path:'mob-full.png', fullPage:true});
// where are the roam circles?
const roam = await pg.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')];
  return imgs.map(i => { const r=i.getBoundingClientRect(); return {src:(i.src.split('/').pop()||'').slice(0,30), x:Math.round(r.x), y:Math.round(r.y + window.scrollY), w:Math.round(r.width), h:Math.round(r.height)}; }).filter(x=>x.w>0);
});
console.log(JSON.stringify(roam.slice(0,25), null, 0));
await b.close();
