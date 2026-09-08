import puppeteer from 'puppeteer';
const b = await puppeteer.launch({headless:'new', args:['--no-sandbox']});
const pg = await b.newPage();
await pg.setViewport({width:1400, height:900});
await pg.goto('http://localhost:3000/store/luxestudio?julex_edit=1', {waitUntil:'networkidle2', timeout:60000});
await new Promise(r=>setTimeout(r,3000));
const R = {};
R.toolbarIdle = await pg.evaluate(() => ({
  topbar: !!document.querySelector('.jux-topbar'),
  bottomBar: !!document.querySelector('.jx-edit-badge'),
  disabledCount: [...document.querySelectorAll('.jux-topbar button')].filter(x=>x.disabled).length,
  swatches: document.querySelectorAll('.jux-swatch').length,
  addTextTop: [...document.querySelectorAll('.jux-topbar button')].some(x=>/Add Text/.test(x.textContent)),
  addImageTop: [...document.querySelectorAll('.jux-topbar button')].some(x=>/Add Image/.test(x.textContent))
}));

const pickHero = () => pg.evaluate(() => {
  const w = document.querySelector('[data-sid="sec_hero"]');
  const el = [...w.querySelectorAll('h1,h2,h3,p,span')].find(e=>e.children.length===0 && e.textContent.trim());
  el.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true}));
});
await pickHero();
await new Promise(r=>setTimeout(r,400));
R.selection = await pg.evaluate(() => ({
  outline: !!document.querySelector('.jx-selected'),
  fontShown: document.querySelector('.jux-topbar select')?.value,
  moveEnabled: !([...document.querySelectorAll('.jux-topbar button')].find(x=>/Move/.test(x.textContent))||{disabled:true}).disabled
}));
await pg.evaluate(() => {
  const sel = document.querySelector('.jux-topbar select');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set;
  setter.call(sel,'Cinzel');
  sel.dispatchEvent(new Event('change',{bubbles:true}));
});
await new Promise(r=>setTimeout(r,500));
R.fontApplied = await pg.evaluate(() => (document.querySelector('.jx-selected')?.style.fontFamily||'').includes('Cinzel'));
await pg.evaluate(() => { [...document.querySelectorAll('.jux-swatch')][2].click(); });
await new Promise(r=>setTimeout(r,500));
R.colorApplied = await pg.evaluate(() => document.querySelector('.jx-selected')?.style.color);
const sizeBefore = await pg.evaluate(() => parseInt(document.querySelector('.jx-selected').style.fontSize || getComputedStyle(document.querySelector('.jx-selected')).fontSize));
await pg.evaluate(() => { [...document.querySelectorAll('.jux-topbar button')].find(x=>x.textContent.trim()==='A+')?.click(); });
await new Promise(r=>setTimeout(r,400));
R.sizeChange = { before: sizeBefore, after: await pg.evaluate(() => parseInt(document.querySelector('.jx-selected').style.fontSize)) };
R.boldToggle = await pg.evaluate(async () => {
  const btn=[...document.querySelectorAll('.jux-topbar button')].find(x=>x.textContent.trim()==='B');
  const on1=btn.classList.contains('jux-tool-active');
  btn.click();
  await new Promise(r=>setTimeout(r,300));
  const w1=document.querySelector('.jx-selected').style.fontWeight;
  btn.click();
  await new Promise(r=>setTimeout(r,300));
  const w2=document.querySelector('.jx-selected').style.fontWeight;
  return { initialActive: on1, afterOn: w1, afterOff: w2 };
});
// add text from top toolbar
await pg.evaluate(() => { [...document.querySelectorAll('.jux-topbar button')].find(x=>/Add Text/.test(x.textContent))?.click(); });
await new Promise(r=>setTimeout(r,900));
R.addText = await pg.evaluate(() => document.querySelectorAll('[data-jx-float]').length);
// select other section text -> toolbar rebinds, only one selection
await pg.evaluate(() => {
  const w = document.querySelectorAll('[data-sid]')[3];
  const el = [...w.querySelectorAll('h1,h2,h3,p,span')].find(e=>e.children.length===0 && e.textContent.trim());
  el.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true}));
});
await new Promise(r=>setTimeout(r,400));
R.reselectSingle = await pg.evaluate(() => document.querySelectorAll('.jx-selected').length);
// Done
await pg.evaluate(() => { [...document.querySelectorAll('.jux-topbar button')].find(x=>/Done/.test(x.textContent))?.click(); });
await new Promise(r=>setTimeout(r,300));
R.doneClears = await pg.evaluate(() => !document.querySelector('.jx-selected'));
R.saved = await pg.evaluate(() => {
  const raw = localStorage.getItem('gojulex_store_theme_store_luxestudio') || localStorage.getItem('gojulex_store_theme_luxestudio');
  const c = JSON.parse(raw);
  return { fonts: c.inlineStyles?.some(x=>x.font==='Cinzel'), colors: c.inlineStyles?.some(x=>x.color), floats: c.floating?.length||0 };
});
console.log(JSON.stringify(R, null, 1));
await b.close();
