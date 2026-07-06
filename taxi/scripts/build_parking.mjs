// 將運輸署 21MB 咪錶泊車位原始數據（逐個車位）按「街道＋路段」聚合成輕量 GeoJSON，
// 只保留私家車類（VehicleType A，的士可用）；非咪錶位數量少，只瘦身屬性後原點保留。
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = f => JSON.parse(fs.readFileSync(path.join(root, 'data', f), 'utf8'));

// --- 咪錶位：按街道段聚合 ---
const metered = read('metered_parking.geojson');
const groups = new Map();
for (const f of metered.features) {
  const p = f.properties;
  if (String(p.VehicleType).toUpperCase() !== 'A') continue;
  const key = `${p.District_tc}|${p.Street_tc}|${p.SectionOfStreet_tc || ''}`;
  let g = groups.get(key);
  if (!g) {
    g = {
      district: p.District_tc, street: p.Street_tc,
      section: p.SectionOfStreet_tc || '', count: 0,
      sumLng: 0, sumLat: 0,
      fee: `$${p.PaymentUnit}／${p.TimeUnit}分鐘`,
      period: p.OperatingPeriod
    };
    groups.set(key, g);
  }
  g.count++;
  g.sumLng += f.geometry.coordinates[0];
  g.sumLat += f.geometry.coordinates[1];
}

const meteredFeatures = [...groups.values()].map(g => ({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [+(g.sumLng / g.count).toFixed(6), +(g.sumLat / g.count).toFixed(6)]
  },
  properties: {
    kind: 'metered',
    district: g.district, street: g.street, section: g.section,
    spaces: g.count, fee: g.fee, period: g.period
  }
}));

// --- 非咪錶位：瘦身屬性 ---
const nonMetered = read('nonmetered_parking.geojson');
const nonMeteredFeatures = nonMetered.features.map(f => ({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [
      +f.geometry.coordinates[0].toFixed(6),
      +f.geometry.coordinates[1].toFixed(6)
    ]
  },
  properties: {
    kind: 'non-metered',
    district: f.properties.District_tc,
    street: f.properties.Street_tc,
    section: f.properties.SectionOfStreet_tc || '',
    vehicleType: f.properties.VehicleType
  }
}));

const out = {
  type: 'FeatureCollection',
  features: [...meteredFeatures, ...nonMeteredFeatures]
};
fs.writeFileSync(path.join(root, 'data', 'parking_sections.geojson'), JSON.stringify(out));
// 同步輸出 JS 嵌入版，避免 fetch 失敗（手機／file:// 開啟時）
const jsOut = '// 路邊泊車位（咪錶段聚合 + 非咪錶），來源：運輸署 data.gov.hk\n' +
  'const PARKING_SECTIONS = ' + JSON.stringify(out) + ';\n';
fs.writeFileSync(path.join(root, 'js', 'parking_data.js'), jsOut);
console.log('metered sections:', meteredFeatures.length,
  '| non-metered spots:', nonMeteredFeatures.length,
  '| geojson:', (JSON.stringify(out).length / 1024).toFixed(0), 'KB',
  '| parking_data.js updated');
