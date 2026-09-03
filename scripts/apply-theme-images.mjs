// Downloads theme imagery locally and rewrites themeRegistry to serve it
// from /theme-images/<presetId>/ — permanent, no hotlink breakage (403s).
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), '..');
const MANIFEST = 'scripts/image-manifest.json';
const REGISTRY = path.join(ROOT, 'src/data/themeRegistry.js');

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/image-manifest.json'), 'utf-8'));
let registry = fs.readFileSync(REGISTRY, 'utf-8');
const report = [];

for (const [presetId, urls] of Object.entries(manifest)) {
  const dir = path.join(ROOT, 'public/theme-images', presetId);
  fs.mkdirSync(dir, { recursive: true });
  const localPaths = [];
  for (let i = 0; i < urls.length; i++) {
    const role = i === 0 ? 'hero' : `p${i}`;
    const file = `${role}.jpg`;
    const dest = path.join(dir, file);
    if (!fs.existsSync(dest)) {
      const res = await fetch(urls[i], { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120.0' } });
      if (!res.ok) { report.push(`${presetId}/${role}: FETCH FAIL ${res.status}`); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 5000) { report.push(`${presetId}/${role}: TOO SMALL ${buf.length}B (likely error page)`); continue; }
      fs.writeFileSync(dest, buf);
    }
    localPaths.push(`/theme-images/${presetId}/${file}`);
    report.push(`${presetId}/${role}: ok`);
  }
  if (!localPaths.length) continue;
  // Rewrite this preset's heroImage + product images to local paths
  const blockRe = new RegExp(`(preset_${presetId.replace(/^preset_/, '')}:\s*\{[\s\S]*?\n  \})`, 'm');
  const m = registry.match(blockRe);
  if (m) {
    let block = m[1];
    let idx = 0;
    block = block.replace(/heroImage:\s*'[^']*'/, () => `heroImage: '${localPaths[idx++] || localPaths[0]}'`);
    block = block.replace(/(imageUrl|image):\s*'[^']*'/g, () => {
      const p = localPaths[idx] || localPaths[localPaths.length - 1]; idx++;
      return `image: '${p}'`;
    });
    registry = registry.replace(m[1], block);
  }
}
fs.writeFileSync(REGISTRY, registry);
console.log(report.join('\n'));
