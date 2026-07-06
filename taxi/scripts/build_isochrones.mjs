// 為 js/spots.js 內每個待客點向 Valhalla 預計算 10 分鐘行車等時圈，
// 結果寫入 data/isochrones.json 供地圖離線使用。
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = fs.readFileSync(path.join(root, 'js/spots.js'), 'utf8');
const SPOTS = new Function(src + '; return CURATED_SPOTS;')();

const out = {};
for (const s of SPOTS) {
  const res = await fetch('https://valhalla1.openstreetmap.de/isochrone', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      locations: [{lat: s.coords[0], lon: s.coords[1]}],
      costing: 'auto',
      contours: [{time: 10}],
      polygons: true
    })
  });
  if (!res.ok) {
    console.error(s.id, 'failed:', res.status);
    continue;
  }
  out[s.id] = (await res.json()).features[0];
  console.log(s.id, 'ok');
  await new Promise(r => setTimeout(r, 1200)); // 避免對公共伺服器造成壓力
}

fs.writeFileSync(path.join(root, 'data/isochrones.json'), JSON.stringify(out));
console.log('saved', Object.keys(out).length, 'isochrones');
