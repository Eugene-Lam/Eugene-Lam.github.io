// 從 curated_spots.geojson 重建 spots.js，並加入路邊泊位候客點
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const gj = JSON.parse(fs.readFileSync(path.join(root, 'data/curated_spots.geojson'), 'utf8'));

const existing = gj.features.map(f => {
  const p = f.properties;
  const [lng, lat] = f.geometry.coordinates;
  const {gmaps, ...rest} = p;
  return {...rest, type: 'taxi-stand', coords: [lat, lng]};
});

const parkingAdds = [
  { id: 'kowloonbay_park', district: '九龍灣', type: 'metered', name: '啓樂街咪錶位（九龍灣運動場外）', coords: [22.32747, 114.21076],
    official: '啓樂街九龍灣運動場外（11 個咪錶位）', parkingInfo: '11 個位 · $4／15 分鐘 · 時段 D',
    advantages: '工貿區路邊泊位、可入錶熄匙等客、比宏照道的士站少人爭、空間大可容納多部車',
    coverage: '同九龍灣站：企業廣場、牛頭角、觀塘道 apm、啟業邨、臨華街工廈雲端廚房',
    egress: '啓樂街 → 宏光道 → 觀塘道；或 啟祥道 → 龍翔道', color: '#e76f51' },
  { id: 'kwuntong_park', district: '觀塘', type: 'metered', name: '瑞寧街咪錶位（雲漢街段）', coords: [22.31651, 114.22458],
    official: '瑞寧街近雲漢街（36 個咪錶位）', parkingInfo: '36 個位 · $4／15 分鐘',
    advantages: '觀塘工業區大型泊位、觀塘市中心步行可達、執法壓力低於裕民坊主幹道',
    coverage: '觀塘中心、裕民坊、成業街雲廚房、牛頭角、藍田北',
    egress: '瑞寧街 → 觀塘道（東西雙向）；觀塘道 → 龍翔道或將軍澳道', color: '#f4a261' },
  { id: 'mongkok_park', district: '旺角／油麻地', type: 'metered', name: '通菜街咪錶位（弼街段）', coords: [22.32269, 114.16988],
    official: '通菜街近弼街（67 個咪錶位）', parkingInfo: '67 個位 · $4／15 分鐘',
    advantages: '旺角區最大路邊泊位之一、入錶合法等客、比櫻桃街的士站自由（唔使排位）',
    coverage: '旺角、太子、油麻地、大角咀、尖沙咀北',
    egress: '弼街 → 彌敦道；或 通菜街 → 亞皆老街 → 公主道', color: '#e63946' },
  { id: 'shamshuipo_park', district: '深水埗', type: 'metered', name: '大南街咪錶位（黃竹街段）', coords: [22.32701, 114.16343],
    official: '大南街近黃竹街（11 個咪錶位）', parkingInfo: '11 個位 · $4／15 分鐘',
    advantages: '深水埗黃金電腦街區、入錶等客零抄牌風險、比交匯處寬鬆',
    coverage: '深水埗、長沙灣、石硤尾、旺角西',
    egress: '大南街 → 長沙灣道；或 南昌街 → 連翔道', color: '#d62828' },
  { id: 'tokwawan_park', district: '九龍城／土瓜灣', type: 'metered', name: '榮光街咪錶位（啓明街段）', coords: [22.31341, 114.18898],
    official: '榮光街近啓明街（8 個咪錶位）', parkingInfo: '8 個位 · $4／15 分鐘',
    advantages: '土瓜灣窄街泊位、近土瓜灣站、入錶可熄匙',
    coverage: '土瓜灣、紅磡、何文田、九龍城',
    egress: '榮光街 → 馬頭圍道 → 漆咸道北', color: '#003049' },
  { id: 'wongtaisin_park', district: '黃大仙', type: 'metered', name: '環鳳街咪錶位（雙鳳街段）', coords: [22.34504, 114.19834],
    official: '環鳳街近雙鳳街（51 個咪錶位）', parkingInfo: '51 個位 · $4／15 分鐘',
    advantages: '黃大仙區最大路邊泊位、新蒲崗工廈近在咫尺、入錶等客',
    coverage: '黃大仙、新蒲崗工廈雲廚房、鑽石山、樂富、慈雲山',
    egress: '環鳳街 → 蒲崗村道 → 龍翔道；或 彩虹道 → 太子道東', color: '#6a994e' },
  { id: 'tsuenwan_park', district: '荃灣', type: 'metered', name: '大屋街咪錶位（新村街段）', coords: [22.37004, 114.11493],
    official: '大屋街近新村街（14 個咪錶位）', parkingInfo: '14 個位 · $4／15 分鐘',
    advantages: '荃灣街市旁邊、距禾笛街的士站 76 米、入錶等客',
    coverage: '荃灣市中心、海之戀、海濱花園、大窩口',
    egress: '大屋街 → 沙咀道 → 大河道 → 荃灣路', color: '#7209b7' },
  { id: 'kwaichung_park', district: '葵涌', type: 'metered', name: '盛芳街咪錶位（仁芳街段）', coords: [22.35970, 114.12759],
    official: '盛芳街近仁芳街（13 個咪錶位）', parkingInfo: '13 個位 · $4／15 分鐘',
    advantages: '葵涌工貿區泊位、新都會廣場步行範圍、貨櫃碼頭接單方便',
    coverage: '葵芳、葵興、荔景、貨櫃碼頭工廈雲廚房',
    egress: '盛芳街 → 興芳路 → 葵涌道', color: '#ff6d00' },
  { id: 'tuenmun_park', district: '屯門', type: 'metered', name: '鹿苑街咪錶位（停車場外）', coords: [22.39680, 113.97503],
    official: '鹿苑街停車場外（18 個咪錶位）', parkingInfo: '18 個位 · $4／15 分鐘',
    advantages: '屯門市中心邊緣、泊位多、比室內交匯處自由',
    coverage: '屯門市中心、大興、山景、新墟',
    egress: '鹿苑街 → 屯門鄉事會路 → 屯門公路', color: '#3d348b' },
  { id: 'yuenlong_park', district: '元朗', type: 'metered', name: '橋樂坊咪錶位（福德街段）', coords: [22.44573, 114.02701],
    official: '橋樂坊近福德街（16 個咪錶位）', parkingInfo: '16 個位 · $4／15 分鐘',
    advantages: '元朗市中心旁、福康街的士站對面、入錶等客',
    coverage: '元朗市中心、朗屏、水邊圍、工業區',
    egress: '橋樂坊 → 青山公路 → 元朗公路', color: '#4cc9f0' },
  { id: 'tinshuiwai_park', district: '天水圍', type: 'metered', name: '聚星路咪錶位（天水圍體育館外）', coords: [22.44685, 114.00498],
    official: '聚星路近天水圍體育館（10 個咪錶位）', parkingInfo: '10 個位 · $2／15 分鐘',
    advantages: '天水圍大型泊位、天福路站的士站旁邊、收費平',
    coverage: '天水圍全區、嘉湖山莊、天瑞、天恩',
    egress: '聚星路 → 天耀路 → 元朗公路', color: '#35a7ff' },
  { id: 'taipo_park', district: '大埔', type: 'metered', name: '山塘路咪錶位（山塘新村花園外）', coords: [22.44054, 114.17000],
    official: '山塘路近山塘新村花園（29 個咪錶位）', parkingInfo: '29 個位 · $4／15 分鐘',
    advantages: '大埔區最大路邊泊位、大埔墟站步行 5 分鐘、入錶等客',
    coverage: '大埔墟、太和、大埔中心、富善邨',
    egress: '山塘路 → 寶鄉街 → 吐露港公路', color: '#38b000' },
  { id: 'sheungshui_park', district: '北區', type: 'metered', name: '新康街咪錶位（巡撫街段）', coords: [22.50448, 114.12844],
    official: '新康街近巡撫街（6 個咪錶位）', parkingInfo: '6 個位 · $2／15 分鐘',
    advantages: '上水站旁邊路邊位、比交匯處輕鬆',
    coverage: '上水、粉嶺、石湖墟',
    egress: '新康街 → 彩園路 → 粉嶺公路', color: '#9d4edd' },
  { id: 'maonshan_park', district: '馬鞍山', type: 'non-metered', name: '馬錦街免費路邊位', coords: [22.42379, 114.23487],
    official: '馬錦街（非咪錶免費路邊位，運輸署登記）', parkingInfo: '免費 · 無需入錶',
    advantages: '馬鞍山少數免費官方路邊位、新港城中心步行範圍、零成本等客',
    coverage: '馬鞍山市中心、耀安邨、恆安邨、烏溪沙',
    egress: '馬錦街 → 西沙路 → 馬鞍山路', color: '#2a9d8f' },
  { id: 'central_park', district: '中環／上環', type: 'metered', name: '高街咪錶位（東邊街段）', coords: [22.28512, 114.14282],
    official: '高街近東邊街（47 個咪錶位）', parkingInfo: '47 個位 · $4／15 分鐘',
    advantages: '西營盤大型路邊泊位、中環／上環 10 分鐘內、入錶合法',
    coverage: '西營盤、上環、中環西、半山東',
    egress: '高街 → 薄扶林道；或 東邊街 → 皇后大道西 → 干諾道西', color: '#577590' },
];

const all = [...existing, ...parkingAdds];

function fmt(obj, indent = 2) {
  const pad = ' '.repeat(indent);
  const inner = Object.entries(obj).map(([k, v]) => {
    const val = typeof v === 'string' ? JSON.stringify(v) : JSON.stringify(v);
    return `${pad}  ${k}: ${val}`;
  }).join(',\n');
  return `{\n${inner}\n${pad}}`;
}

const body = all.map(s => fmt(s, 2)).join(',\n');
const out = `// 全港 10 分鐘候客網絡：的士站 + 路邊泊位（咪錶／免費）
// 數據來源：運輸署 data.gov.hk / CSDI，2026-07 核對
// type: taxi-stand | metered | non-metered
const CURATED_SPOTS = [\n${body}\n];\n`;

fs.writeFileSync(path.join(root, 'js/spots.js'), out);
console.log('wrote', all.length, 'spots');
