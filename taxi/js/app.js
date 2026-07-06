const map = L.map('map').setView([22.345, 114.14], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const TYPE_LABEL = {
  'taxi-stand': '的士站',
  'metered': '咪錶路邊位',
  'non-metered': '免費路邊位'
};

// ---------- 候客點標記 ----------
const isochroneLayers = {};
let precomputedIso = null;
let nearbyParking = {};
let nearbyLayer = null;
const markers = {};

function nearbyListHtml(s) {
  if (s.type !== 'taxi-stand') return '';
  const list = nearbyParking[s.id];
  if (!list) return '';
  if (!list.length) {
    return `<dt>附近替代泊位</dt><dd>900 米內無其他官方路邊泊位</dd>`;
  }
  const items = list.map(p => {
    const detail = p.kind === 'metered'
      ? `咪錶 ${p.spaces} 個位（${p.fee}）`
      : '非咪錶免費位';
    return `<li>${p.dist}m ${p.street}${p.section ? '（' + p.section + '）' : ''} — ${detail}</li>`;
  }).join('');
  return `<dt>附近替代泊位</dt><dd><ul class="nearby">${items}</ul></dd>`;
}

function showNearbyParking(s) {
  if (s.type !== 'taxi-stand') return;
  if (nearbyLayer) map.removeLayer(nearbyLayer);
  const list = nearbyParking[s.id] || [];
  nearbyLayer = L.layerGroup(list.map(p =>
    L.circleMarker(p.coords, {
      radius: 5, color: '#fff', weight: 1.5,
      fillColor: p.kind === 'metered' ? '#e76f51' : '#2a9d8f', fillOpacity: 0.9
    }).bindTooltip(`${p.street}（${p.dist}m）`)
  )).addTo(map);
}

function popupHtml(s) {
  const [lat, lng] = s.coords;
  const typeLine = s.parkingInfo
    ? `<dt>泊位</dt><dd>${s.parkingInfo}</dd>`
    : '';
  return `
    <h3>${s.name}</h3>
    <span class="tag" style="background:${s.color}">${s.district}</span>
    <span class="tag type-tag">${TYPE_LABEL[s.type] || s.type}</span>
    <dl>
      <dt>合法依據</dt><dd>${s.official}</dd>
      ${typeLine}
      <dt>優勢</dt><dd>${s.advantages}</dd>
      <dt>10 分鐘覆蓋</dt><dd>${s.coverage}</dd>
      <dt>出車避堵路線</dt><dd>${s.egress}</dd>
      ${nearbyListHtml(s)}
      <dt>座標</dt><dd>${lat.toFixed(6)}, ${lng.toFixed(6)}</dd>
    </dl>
    <a class="nav-btn" target="_blank" href="https://www.google.com/maps?q=${lat},${lng}">Google Maps 導航</a>
  `;
}

function markerStyle(s) {
  const base = {
    radius: s.type === 'taxi-stand' ? 9 : 8,
    color: '#fff',
    weight: s.type === 'metered' ? 2.5 : 2,
    fillColor: s.color,
    fillOpacity: 1
  };
  if (s.type === 'metered') base.dashArray = '4 3';
  if (s.type === 'non-metered') {
    base.fillColor = '#2a9d8f';
    base.color = '#fff';
  }
  return base;
}

async function loadIsochrones() {
  const res = await fetch('data/isochrones.json');
  precomputedIso = await res.json();
}

async function loadNearbyParking() {
  const res = await fetch('data/nearby_parking.json');
  nearbyParking = await res.json();
}

async function fetchIsochroneLive(s) {
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
  if (!res.ok) throw new Error('Valhalla ' + res.status);
  return (await res.json()).features[0];
}

async function toggleIsochrone(s, forceShow) {
  const existing = isochroneLayers[s.id];
  if (existing) {
    if (forceShow) { existing.addTo(map); return; }
    if (map.hasLayer(existing)) { map.removeLayer(existing); return; }
    existing.addTo(map);
    return;
  }
  let feature = precomputedIso && precomputedIso[s.id];
  if (!feature) {
    try { feature = await fetchIsochroneLive(s); }
    catch (e) { console.error(e); alert('無法取得等時圈：' + e.message); return; }
  }
  const layer = L.geoJSON(feature, {
    interactive: false,
    style: {color: s.color, weight: 2, fillColor: s.color, fillOpacity: 0.18}
  });
  isochroneLayers[s.id] = layer;
  layer.addTo(map);
}

const listEl = document.getElementById('spot-list');

CURATED_SPOTS.forEach(s => {
  const m = L.circleMarker(s.coords, markerStyle(s)).addTo(map);
  m.bindPopup(() => popupHtml(s), {maxWidth: 300});
  m.on('click', () => { toggleIsochrone(s, true); showNearbyParking(s); });
  markers[s.id] = m;

  const li = document.createElement('li');
  li.innerHTML = `<span class="district" style="background:${s.color}">${s.district}</span>
    <span class="spot-type type-${s.type}">${TYPE_LABEL[s.type]}</span>
    <span class="name">${s.name}</span>`;
  li.addEventListener('click', () => {
    document.querySelectorAll('#spot-list li').forEach(el => el.classList.remove('active'));
    li.classList.add('active');
    map.setView(s.coords, 14);
    m.openPopup();
    toggleIsochrone(s, true);
    showNearbyParking(s);
  });
  listEl.appendChild(li);
});

document.getElementById('toggle-all-iso').addEventListener('change', async e => {
  if (e.target.checked) {
    for (const s of CURATED_SPOTS) await toggleIsochrone(s, true);
  } else {
    Object.values(isochroneLayers).forEach(l => map.removeLayer(l));
  }
});

loadIsochrones();
loadNearbyParking();
