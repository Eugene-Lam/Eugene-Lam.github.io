# 全港的士待客與快速起候點網絡

為日班（07:00–19:00）的士司機規劃的候客點互動地圖：全港 **38 個** 10 分鐘候客點，包含 **23 個的士站**、**14 個咪錶路邊位**、**1 個免費路邊位**，覆蓋全港市區及新市鎮（大嶼山、南區、西貢市郊除外）。全部為運輸署官方登記的合法停泊位置。

## 使用方法

```bash
cd taxi
python3 -m http.server 8000
```

然後在瀏覽器打開 http://localhost:8000（部署後為 `https://eugene-lam.github.io/taxi/`）。

- 點擊左側清單或地圖標記：顯示詳情（類型、優勢、10 分鐘覆蓋、出車路線、Google Maps 導航），並繪製覆蓋圈。的士站會額外標示附近替代泊位。
- 「顯示所有 10 分鐘覆蓋圈」：一次過檢視全港網絡覆蓋。

## 檔案結構

```
taxi/
├── index.html                  # 地圖主頁（Leaflet）
├── css/style.css
├── js/
│   ├── app.js                  # 地圖邏輯、等時圈繪製
│   └── spots.js                # 9 個精選待客點資料（含優勢/覆蓋/出車路線）
├── scripts/
│   ├── build_isochrones.mjs    # 重新計算 10 分鐘等時圈
│   ├── build_parking.mjs       # 將 21MB 咪錶原始數據聚合成輕量圖層
│   ├── build_nearby_parking.mjs # 為每個候客點配對 500–900m 內最近泊車段
│   └── verify_coverage.mjs     # 驗證 79 個全港目標點是否落入聯合覆蓋圈
└── data/
    ├── curated_spots.geojson       # 精選點 GeoJSON（可匯入其他 GIS 工具）
    ├── taxi_stands.geojson         # 運輸署全港 518 個的士站（data.gov.hk）
    ├── isochrones.json             # 預計算的 10 分鐘行車等時圈（Valhalla/OSM）
    ├── parking_sections.geojson    # 路邊泊車位圖層（咪錶按街道段聚合＋非咪錶）
    ├── metered_parking.geojson     # 運輸署咪錶泊車位原始數據（20,651 個車位）
    └── nonmetered_parking.geojson  # 運輸署非咪錶路邊車位原始數據
```

## 數據來源

- 的士站位置：[運輸署 · 資料一線通](https://data.gov.hk/tc-data/dataset/hk-td-tis_37-taxi-stands)（CSDI 平台，2026-07 下載）
- 咪錶泊車位分佈及收費：[運輸署 · 資料一線通](https://data.gov.hk/en-data/dataset/hk-td-msd_1-metered-parking-spaces-data)（收費時段代碼依官方數據規格解讀）
- 非咪錶路邊車位：運輸署 CSDI 數據集 `td_rcd_1671693072228_72567`
- 等時圈：[Valhalla](https://valhalla1.openstreetmap.de)（OpenStreetMap 路網，`costing=auto`，10 分鐘輪廓）

## 更新等時圈

如日後調整候客點座標，修改 `js/spots.js` 後重新預計算：

```bash
node scripts/build_isochrones.mjs
```
