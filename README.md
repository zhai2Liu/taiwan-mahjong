# 從零到一百的麻將路

一款免登入的台灣十六張麻將學習網站，結合三位電腦陪打、八課互動教學與決策練習。

![專案合成牌例：中央海底、手牌與吃碰選項](outputs/taiwan-mahjong-showcase/01-table.jpg)

**[立即遊玩](https://zhai2liu.github.io/taiwan-mahjong/) · [新手課程](https://zhai2liu.github.io/taiwan-mahjong/learn.html) · [決策題](https://zhai2liu.github.io/taiwan-mahjong/training.html)**

## 兩分鐘體驗路徑

首頁「操作說明」看兩種吃法 →「純練習模式」選牌比較進牌、打牌再摸一張 →「決策題試讀」作答並看推導。

## 三個亮點

### 台灣桌規與公平電腦

以 [TW16-CLASSIC-v1](outputs/taiwan-mahjong-m0/RULES.md) 實作摸打、補花、吃碰槓胡與逐條計台；三位本地電腦只取得自家手牌及公開資訊。
[規則引擎](outputs/taiwan-mahjong/src/engine.ts) · [吃牌回歸](outputs/taiwan-mahjong/test/chi.test.mjs) · [資訊邊界測試](outputs/taiwan-mahjong/test/evidence-boundaries.test.mjs)

### 保存失敗也保留玩家資料

存檔載入經驗證，保存失敗提供重試，跨分頁衝突停止覆寫；重新開啟結算維持已付款結果。
[牌局保存](outputs/taiwan-mahjong/src/session.ts) · [控制器故障測試](outputs/taiwan-mahjong/test/controller.test.mjs) · [結算完整性測試](outputs/taiwan-mahjong/test/settlement-integrity.test.mjs)

### 從認牌到自己做決策

八課以實際操作串起認牌、組牌、吃碰槓與完整一局；搭配牌效練習、九道決策題、事後解釋和局後檢討，讓玩家比較自己的選擇。
[課程互動](outputs/taiwan-mahjong/src/learning.ts) · [課程瀏覽器測試](outputs/taiwan-mahjong/test/e2e/learning-round.spec.js) · [決策題與保存](outputs/taiwan-mahjong/src/training.ts)

## 技術棧

TypeScript、Vite、原生 HTML／CSS／SVG；Node.js 內建測試、Playwright、GitHub Actions 與 GitHub Pages。
遊戲與電腦策略在瀏覽器本地執行，進度使用瀏覽器本機保存。

## 我的角色與 AI 協作

我負責需求、產品方向與實際操作回饋。
AI 協助規格、程式實作、測試、發布與文件；開發過程保留 PR、程式與驗收證據。
以上分工已於 2026-10-17 由本人確認，詳[分工紀錄](outputs/taiwan-mahjong/docs/archive/S51-DEMO-VALIDATION.md)。

## 本機執行與測試

使用 Node.js 24.12.0（與 CI 相同），在 repository 根目錄執行：

```sh
cd outputs/taiwan-mahjong
npm ci
npm run dev
```

```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
npm run check:docs
```

PR CI 執行文件連結、型別、Node 測試、建置與瀏覽器回歸；main 的網站來源通過後自動部署。
[開發指南](outputs/taiwan-mahjong/README.md) · [維護與架構](outputs/taiwan-mahjong/MAINTENANCE.md) · [文件索引](outputs/taiwan-mahjong/DOCUMENTATION.md)

## 已知限制

- 桌面優先。
- 手機／Safari 未正式驗證。
- 學習成效未經真人驗證。

## 授權

授權方案已確定採 MIT（2026 zhaizhaiLiu），標準授權條款於 v1.0 授權 PR 補齊。
