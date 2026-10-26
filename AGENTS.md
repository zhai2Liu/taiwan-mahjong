# 維護規範

本專案已發布 [v1.0.0](https://github.com/zhai2Liu/taiwan-mahjong/releases/tag/v1.0.0) 作品集版本，現為維護模式。現況先讀[HANDOFF](outputs/taiwan-mahjong/HANDOFF.md)，範圍依[ROADMAP](outputs/taiwan-mahjong/ROADMAP.md)，文件查[DOCUMENTATION](outputs/taiwan-mahjong/DOCUMENTATION.md)。使用者當次指示優先於歷史工作包。

## 工作啟動與功能凍結

- 只做使用者指定、或使用者在[BACKLOG](outputs/taiwan-mahjong/BACKLOG.md)勾選的項目；代理不得自行查核缺口來產生下一包。勾選權屬使用者。
- 未授權的問題只記 BACKLOG 一行（現象＋位置），標註 P0／非 P0；不得自行擴充修正範圍。
- P0：存檔遺失或損壞、遊戲卡死無法繼續、規則判定或計台錯誤、README 兩分鐘體驗路徑任一步失敗、安全性問題。發現後先回報使用者，由使用者決定是否修。
- v1.0 收尾功能凍結：不新增功能，不改 runtime 行為、規則、AI、教材答案或存檔格式；文件、搬移、授權及發布由 Codex 直接執行，不派 Claude 或其他模型審查。
- S3.4 正式評量、S4 真人試用與實機驗證、S6 人性化 AI、八課人工編審是未來方向，均不屬 v1.0 完成條件。

## 驗證分級

| 級別 | 範圍 | 合併條件 |
|---|---|---|
| 高風險 | engine.ts、scoring.ts、hand.ts、validation.ts、session.ts、review-store.ts、learning-round-store.ts、review-recorder.ts、training-draft.ts、learning-progress.ts、decision-snapshot.ts，以及 main.ts／learning.ts／training.ts 中的存檔讀寫 | Codex 規劃 → 實際 Claude Code 實作與自測 → Codex 驗收，使用 claude-rd；PR CI 通過 |
| 一般 | 畫面、CSS、文案、教材內容 | 實作者自測＋PR CI 綠燈＋使用者在正式站點操作一次，即可合併 |
| 純文件 | 文件、索引與說明 | PR CI 綠燈即可 |

本輪歸檔與授權工作同樣以 PR CI（含 `npm run check:docs`）為準；不額外做 Chrome／Edge 手動雙寬驗收或上線 SHA-256 比對。Release 須先交 notes 草稿給使用者確認，PR1–PR4 合併且 main CI／部署成功後，才建立 annotated tag 與 GitHub Release；只確認三個正式頁面可開啟。

## 必須保留的界線

- 固定[台灣十六張桌規](outputs/taiwan-mahjong-m0/RULES.md)，一位真人與三位本地公平電腦；AI／提示只讀自家可見資訊。
- 保留既有工作、玩家資料、信任邊界驗證、錯誤復原、安全與可及性；不清空資料掩蓋錯誤。
- 遵循 Ponytail：標準庫、平台原生與既有依賴優先，只做必要修改；已知上限用 `ponytail:` 註解說明。
- 使用繁體中文，工作證據放 work/；正式文件保留來源與歷史，不沿舊「下一步」自動開工。
- 保留使用者的訂閱、登入與計費方式；不自行新增後端、帳號、模型服務或自動續跑。

## 交接

每包 HANDOFF 最多五行：改了什麼／PR／結果／未驗證／下一步。CI run ID、SHA、測試數與驗收結果放 PR 描述，不在 HANDOFF 逐包抄寫，不另開「Record … verification」commit。沒有使用者指定工作時，下一步填「維護模式，等候指定項目」。
