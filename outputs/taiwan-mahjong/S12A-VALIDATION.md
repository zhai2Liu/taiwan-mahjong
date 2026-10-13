# S1.2a：PR 檢查與 Pages 發布隔離

2026-10-13。延伸現有 `.github/workflows/pages.yml`，共用同一個 build job；遊戲程式、桌規與資料格式不變。實際驗收記錄見本文後續更新及 [HANDOFF](HANDOFF.md)。

## 流程

| 事件 | 型別／測試／建置 | Pages artifact／發布 |
|---|---|---|
| PR 指向 main（含 draft、只改文件） | 執行；無路徑過濾 | 跳過 |
| main 來源／測試／題庫／設定／workflow／共用規則案例變更 | 執行 | 成功後上傳並發布 |
| main 普通維護文件／截圖變更 | 沿用路徑排除，不新增發布 | 不執行 |
| main 手動觸發 | 執行 | 成功後發布 |
| 其他分支手動觸發 | 執行 | 跳過 |

PR 使用 pull_request，建置 GitHub 產生的合併結果；不使用 pull_request_target 跑未信任程式。全域權限只有 contents:read，checkout 不保留 Git 憑證；pages:write 與 id-token:write 只在 deploy job，而且該 job 僅允許非 PR 的 main。

PR 的群組依PR編號分開，可取消同 PR 的過期檢查；main／手動分支依 ref 分開，main 保留序列發布。PR 不佔用或取消 main 的部署群組。

既有 npm test 已含題庫生成與 TypeScript 檢查，npm run build 也先檢查；沿用命令，不另外重複一個型別 job。check 名稱仍為 build，供日後 required status check 設定；所有指向 main 的 PR 都會產生這個檢查。

push 新增 `outputs/taiwan-mahjong-m0/cases.json` 與 `RULES.md`，前者被計台測試使用，後者是凍結桌規權威；一般M0交接文件不額外觸發。題庫、生成器與 workflow 原路徑保持涵蓋。

## 驗收方式與範圍

- 本機重跑現有型別／342測試／正式建置，確認共用命令可執行且產物與前包一致。
- 實際開一份本包 PR，確認 GitHub 能解析 workflow、build 成功、上傳步驟及 deploy 跳過。
- 在功能合併後另開真正只有Markdown差異的文件PR，確認 opened 仍跑檢查，不因文件被過濾而缺狀態；原功能PR上追加文件不能獨立證明這點，因PR的路徑比較涵蓋整份差異。
- 通過後合併到 main，確認 main 仍成功 build／deploy，正式首頁與試讀資源 SHA-256 相符。

首次 fork 貢獻可能需要儲存庫擁有者准許執行，另有平台規範；本包不另建 fork 做真人／外部帳戶驗收，也不宣稱修改平台設定。本機未安裝 actionlint／YAML parser，不為此引入依賴；GitHub 實際解析和執行為本包 workflow 驗收依據。

本機342測試、check／build通過，work/s12a-tests.log；產物與S1.1相同。功能 [PR #1](https://github.com/zhai2Liu/taiwan-mahjong/pull/1) 的 [38408610153](https://github.com/zhai2Liu/taiwan-mahjong/actions/runs/38408610153)已success：build含Typecheck and tests／正式建置成功，Upload Pages artifact與deploy均skipped，artifact_count=0。透過工具在檢查後合併，未要求或冒稱外部真人程式審查；main合併來源bc1758d。

## 合併門檻與限制

開工 GitHub main 查得 protected:false、required status checks 空。本包完成的是自動檢查及發布隔離，未新增分支保護／禁止直接推送。若未來要強制 merge gate，可要求 build；PR 不設路徑過濾，避免因 skipped workflow 導致 Pending。合併衝突、Actions 關閉、fork 等待批准或 GitHub 服務故障仍可使檢查等待，不能保證任何情況都能立即完成。

下一包 S1.2b：三條核心瀏覽器流程先重現再逐條自動化。本包沒有新增瀏覽器測試套件或修改玩家操作。

參考：[PR 事件及 fork 規範](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request)、[路徑排除與 Pending](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushpull_requestpull_request_targetpathspaths-ignore)、[最小 GITHUB_TOKEN 權限](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token)。
