# S1.2b：核心瀏覽器回歸

2026-10-14（Asia/Taipei）。承接[S1.2a](S12A-VALIDATION.md)，將已有操作驗收整理成可重跑的三條流程。正式遊戲、TW16-CLASSIC-v1、AI策略、存檔及題庫版本未修改。本機已通過，PR／main驗證尚待本輪發布核對；完成狀態以[HANDOFF](HANDOFF.md)為準。

## 範圍與工具選擇

現有Node測試使用模擬DOM，test/browser.html等是手動範例入口；桌面工具可作當次驗收，無法直接在GitHub Actions重跑。新增一個明確的開發依賴`@playwright/test` 1.64.0，使用內建隔離、定位、等待、下載及clock，不另設測試服務或封裝層；執行時依賴仍為零。

[設定](playwright.config.js)只跑Chromium，桌面1440×900與窄畫面390×844；每條流程各一次，共六項，單worker、零重試，失敗不靠重試轉綠。窄畫面不是手機實機／觸控認證。依[官方CI方式](https://playwright.dev/docs/ci-intro)安裝瀏覽器；[webServer](https://playwright.dev/docs/test-webserver)管理4226 preview，拒絕共用已存在的服務並在完成後關閉。

## 三條可重現路徑

測試來源：[core.spec.js](test/e2e/core.spec.js)。沿用[browser-fixtures](scripts/browser-fixtures.mjs)的feedbackReady及既有[fixture](test/fixtures.mjs)實體牌分配器，不更改正式程式以暴露測試接口。只首次注入獨立browser context的存檔；重載沿用實際更新的資料，不重設種子。使用[clock](https://playwright.dev/docs/clock)控制對戰排程，真實點擊／焦點／dialog／下載仍由瀏覽器執行。

| 流程 | 核對內容 |
|---|---|
| 出牌 → 解釋 → 返回 | 單擊只選牌、不改存檔；雙擊白板只生效一次，暗手及牌河正確；解釋取得焦點；Escape返回繼續按鈕，經過時間仍暫停；手動繼續後電腦排程推進 |
| 自摸 → 結算 → 下一局 | 既有門清／中／發／花示例實際按胡；門清一摸三、紅中、發財、正花明細可讀；積分正負合計零；開關檢討、重載續局均不重付；下一局手號與連莊加一、積分保留，再重載不再開一局 |
| 試讀 → 匯出 → 離頁 | 空答阻擋；提交與切題保留選項／理由；真實JSON／TXT下載讀回，版本／九題／提交狀態／合成內容正確；TXT不含理由；匯出後修改有提醒；Escape與留在本頁保留，原生重載提醒取消後仍有內容；確認才返回，不建對戰存檔 |

最初重現發現的是測試腳本問題：兩處同名繼續按鈕需定位banner；取消重載不會產生新文件load事件，因此觸發重載後檢查原生dialog與原頁資料，不等待不存在的導頁。修正定位／等待後六項全過，沒有據此宣稱修正遊戲缺陷。

## 執行與失敗重現

於遊戲目錄執行：

```powershell
npm ci
npx playwright install chromium
npm test
npm run test:browser
```

Linux首次安裝用`npx playwright install --with-deps chromium`。`test:browser`先建置（包含型別檢查），再測正式site；CI已先建置，所以直接`npx playwright test`，不重複build。需要具體單條重現時用`npx playwright test --project=desktop -g "自摸"`；看本機真實視窗可加`--headed`。

失敗保留`test-results/`內的截圖、錯誤上下文與trace（Git忽略）；`npx playwright show-trace <trace.zip路徑>`讀取。CI在失敗時上傳相同目錄，保留七天；尚未製造CI故障測試上傳分支。下載檔為測試context的暫存檔，內容全為合成，不寫使用者Downloads或作為真人學習證據。

## 本輪結果與界線

- 本機Windows：342項Node測試通過、型別與正式建置成功；六項真實Chromium回歸通過，7.1秒（當次結果，不是效能基準）。
- 正式產物仍為index-D57TZ2GI.js／index-DcXzVABB.css、training-CyxzesHo.js／training-DnepUIbB.css及tile-face-CG76dTyt.js，測試來源未進bundle。
- PR與main均執行六項回歸；PR不部署、main通過後部署。遠端run與正式資源核對待補。
- 不代表全流程／瀏覽器／手機、純練習、吃碰槓、壞檔／配額／跨頁故障都已由此六項覆蓋；既有引擎、控制器和手動證據仍必要。關頁／手機終止等beforeunload限制仍在。
- 未取得真人試讀資料、未測學習成效，也未整合人格AI；main分支保護仍另待配置。

下一包S1.3：操作與焦點／視覺修整、具名裝置與效能基準。以可重現卡點選修正，不用本包回歸數字替代真人／實機。
