import puppeteer from 'puppeteer';
const b = await puppeteer.launch();
const p = await b.newPage();
await p.setViewport({ width: 1280, height: 900 });
await p.goto('http://localhost:3000/store/ramstshirt', { waitUntil: 'networkidle0', timeout: 60000 });
await p.evaluate(() => {
  const raw = localStorage.getItem('gojulex_store_theme_store_ramstshirt') || localStorage.getItem('gojulex_store_theme_ramstshirt');
  let cfg = raw ? JSON.parse(raw) : { presetId: 'preset_camel_edit', styles: {}, sections: [] };
  if (!cfg.sections.some(s => s.type === 'story')) {
    cfg.sections.push({ id: 'story_camel', type: 'story', enabled: true, data: { title: 'Independent Fashion House', text: 'Direct from our studio to your wardrobe.' } });
  }
  ['gojulex_store_theme_store_ramstshirt','gojulex_store_theme_ramstshirt'].forEach(k => localStorage.setItem(k, JSON.stringify(cfg)));
});
await p.goto('http://localhost:3000/store/ramstshirt?theme=preset_camel_edit&preview=1', { waitUntil: 'networkidle0', timeout: 60000 });
await new Promise(r => setTimeout(r, 2200));
const about = await p.evaluate(() => {
  const a = document.querySelector('#about');
  return {
    present: !!a,
    mailto: !!a?.querySelector('a[href^="mailto:"]'),
    tel: !!a?.querySelector('a[href^="tel:"]'),
    whatsapp: !!a?.querySelector('a[href*="wa.me"]'),
    form: !!a?.querySelector('form input[type="email"]')
  };
});
await p.type('#about form input', 'test@fashion.com');
await p.evaluate(() => document.querySelector('#about form button')?.click());
await new Promise(r => setTimeout(r, 400));
console.log(JSON.stringify(about));
await p.screenshot({ path: 'camel-about.png' });
// clean up injected section
await p.evaluate(() => localStorage.clear());
await b.close();
