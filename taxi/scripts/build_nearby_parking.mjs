// 為每個精選候客點配對直線 500 米內最近的路邊泊車位（咪錶段＋非咪錶），
// 輸出 data/nearby_parking.json（keyed by spot id），供地圖 popup 及高亮顯示。
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = fs.readFileSync(path.join(root, 'js/spots.js'), 'utf8');
const SPOTS = new Function(src + '; return CURATED_SPOTS;')();
const parking = JSON.parse(fs.readFileSync(path.join(root, 'data/parking_sections.geojson'), 'utf8'));

const RADIUS_M = 500;
const FALLBACK_RADIUS_M = 900; // 500m 內無泊位時放寬（灣仔北、青衣站、將軍澳站一帶）
const MAX_RESULTS = 6;

function distM(lat1, lon1, lat2, lon2) {
  const kx = 111320 * Math.cos(lat1 * Math.PI / 180);
  return Math.hypot((lat1 - lat2) * 111320, (lon1 - lon2) * kx);
}

const out = {};
for (const s of SPOTS) {
  const [lat, lng] = s.coords;
  let near = [];
  for (const radius of [RADIUS_M, FALLBACK_RADIUS_M]) {
    near = [];
    for (const f of parking.features) {
      const [plng, plat] = f.geometry.coordinates;
      const d = distM(lat, lng, plat, plng);
      if (d <= radius) near.push({d: Math.round(d), f});
    }
    if (near.length) break;
  }
  near.sort((a, b) => a.d - b.d);
  out[s.id] = near.slice(0, MAX_RESULTS).map(({d, f}) => {
    const p = f.properties;
    return {
      dist: d,
      coords: [f.geometry.coordinates[1], f.geometry.coordinates[0]],
      kind: p.kind,
      street: p.street,
      section: p.section,
      spaces: p.spaces ?? null,
      fee: p.fee ?? null,
      period: p.period ?? null
    };
  });
  console.log(s.district.padEnd(10), s.id.padEnd(12),
    out[s.id].length ? `${out[s.id].length} 段（最近 ${out[s.id][0].dist}m ${out[s.id][0].street}）` : '500m 內無官方泊位');
}

fs.writeFileSync(path.join(root, 'data/nearby_parking.json'), JSON.stringify(out, null, 1));
console.log('\nsaved data/nearby_parking.json');
