# 現行交接入口

更新：2026-10-17（Asia/Taipei）。先讀本檔與[ROADMAP](ROADMAP.md)，設計依[PRODUCT-DIRECTION](PRODUCT-DIRECTION.md)、[MASTER企畫](MASTER-IMPROVEMENT-PLAN.md)。已完成包的完整紀錄、歷史檢查點與logs索引移至[歷史交接](HANDOFF-HISTORY-20261017.md)；歷史「下一步」不覆蓋本檔。

## 現況與正在做的工作

使用者要求「把五小時的額度全部用來推進專案進度」，持續目標有效。當前窗口resetsAt1792266558，起始0%、最近檢查46%；比例是帳戶用量，不能推算精確對話剩餘token。逐包驗證、提交、發布及落盤，接近耗盡先收斂交接；不使用重設額度或新增自動續跑。

目前分支codex/document-link-check：把反覆手動的md連結檢查變成`npm run check:docs`並接既有CI；使用Node標準函式庫，不改遊戲runtime。新增script檢查追蹤的本機行內／圖片連結、Git追蹤與大小寫，略過程式圍欄／網址／錨點。已用缺檔、未追蹤、錯誤大小寫與編碼四個負例驗證非零退出，fixture已移除；詳work/doc-links-negative.log。正在完成正例、指定head CI及發布核對，尚不可稱本包完成。

完成本包後繼續處理可重現的操作／可及性／維護缺口，先驗證再修正。後五課教材與引擎牌例已備，正式互動整合仍沿前三課試用／修訂順序；不能為消耗額度跳過真人門檻。真人資料只阻擋相應理解／難度／成效與實機結論，不代表整個專案必須停工。

## 已完成範圍與限制

| 範圍 | 實際狀態 |
|---|---|
| 既有對戰／練習 | M0–M5.4完整行牌、1真人＋3公平本地AI、逐項計台、本機續局、牌效練習、六步操作導覽、局後檢討已發布 |
| S0／S1 | 雙路線、作品入口／案例、離頁與匯出保護、PR CI、瀏覽器回歸、焦點及效能基準完成 |
| S2.1／S2.2 | 前三課可操作及獨立進度已發布；[T0–T5試用準備](BEGINNER-TRIAL.md)完成，真人0、理解／修訂未驗 |
| S2.3準備 | [第4–6課課文／示範／換例](S23-LESSON-PREPARATION.md)及26個引擎牌例已備；未接課程頁／擴進度 |
| S2.4準備 | [第7–8課整局腳本／實桌附錄](S24-LESSON-PREPARATION.md)及8個真實DEAL引擎分支已備；未整合互動頁／真正暫停保存／正常對戰連接 |
| S3.1–S3.3 | 九題四能力導引、局後同類練習與吃碰事後解釋、手動本機保存／同版續答／曝光自陳已發布；不自動上傳 |
| S3.4 | [四候選缺口／人工錨點／審閱流程](S34-ASSESSMENT-PREPARATION.md)已備；13題／12題族，四候選不進正式試讀，assessmentFamilies空，正式評量未放行 |
| S4.2 | [牌面語意／強制色彩選取及新手重讀保留](S42-ACCESSIBILITY.md)已發布；手機／Safari／真人輔具未驗，不能宣稱完整WCAG符合 |
| S5.1 | [69.08秒字幕片／13段VTT、三圖與案例](../taiwan-mahjong-showcase/README.md)完成；分工本人已確認，不再重問 |
| S5.2 | [發布／履歷草稿、來源盤點與同源回退演練](S52-RELEASE-PREPARATION.md)已備；LICENSE、tag／Release、另擬履歷摘要仍待本人決定 |
| S6 | 人性化AI保留離線研究，需另外啟動，未授權實裝 |

## 最新提交、驗證與發布

| 包 | 來源／合併 | 指定提交證據 |
|---|---|---|
| S2.3準備 | 54d9e11／aa02c78，[PR#12](https://github.com/zhai2Liu/taiwan-mahjong/pull/12) | PR39039769390：391／26；main39039947228：391／26、部署與三頁資源通過 |
| S2.4準備 | 7f7e291／36aa912，[PR#13](https://github.com/zhai2Liu/taiwan-mahjong/pull/13) | PR39042980660：399／26；main39043175446：399／26、部署與三頁資源通過 |
| S4.2牌面／強制色彩 | 69439e8／1f91996，[PR#14](https://github.com/zhai2Liu/taiwan-mahjong/pull/14) | PR39044088421：399／32；main39044234956：399／32、正式限定UI／資源通過 |
| S4.2重讀保留 | 8fe4564／f994fa2，[PR#15](https://github.com/zhai2Liu/taiwan-mahjong/pull/15) | PR39045048994：399／38（40.1秒）；main39045246989：399／38（35.2秒）、build117432567895／deploy117432905099成功 |

最近本機399 Node／check／build、Chromium38項（31.2秒）通過；重讀故障受影響Chrome155.0.8059.80／Edge155.0.4283.62各6項通過。三種故障為讀取錯誤、壞檔、未知格式；保留本頁進度／原文／離頁提醒，修復後成功重讀才取代記憶體。不是存檔遷移或真人試用證據。

正式站：[青竹牌室](https://zhai2liu.github.io/taiwan-mahjong/)，origin為https://github.com/zhai2Liu/taiwan-mahjong.git。最新功能發布f994fa227594c32e380ec137aad1af2e3c3b64c2；三頁HTTP200，全部4／3／4份JS／CSS SHA-256與site一致。正式隔離context核對先寫入失敗再讀取失敗，進度／原文保留、0pageerror；八個公開檔案雜湊與git blob相符。最新learn-By-3MGNT.js、view-BptEx-mj.js；其他資源清單及舊PR證據見歷史交接。

PR均已附本chat；PR的Pages上傳與deploy跳過，沒有Pages產物。沒有外部真人程式審查或分支保護修改；不要以舊CI充當新提交證據。全為隔離合成資料，不代表手機／Safari／真人理解或普遍學習成效。

## 修改與資料契約入口

- [MAINTENANCE](MAINTENANCE.md)：先依需求找修改位置與必要驗證；[DEPLOYMENT](DEPLOYMENT.md)管發布及回復。[人工清單](HUMAN-FEEDBACK-CHECKLIST.md)與[試讀審閱](TRIAL-REVIEW.md)管真人資料，無新資料不能代填。
- S2.3／S2.4教材對應test/learning-next.test.mjs與learning-round.test.mjs，不建第二套仲裁、過水或計台；固定劇本不是正常AI。改進度先定相容策略。
- [S3.2](S32-VALIDATION.md)：main等待正常RESOLVE，hand-review核對實際取得／未取得，再解釋原快照；關閉保持暫停，不重送動作。[S3.3](S33-VALIDATION.md)：training-draft管保存封套，trial-record供網頁／Node24 CLI共用驗證。
- [S4.2](S42-ACCESSIBILITY.md)：view.tile提供圖片語意，裝飾牌及他家暗手隱藏，暗槓四張仍未知；learning.css強制色彩用雙線保留選取與獨立焦點。learning.loadProgress驗證成功才換記憶體，讀失敗保持dirty並blocked。

| 本機鍵 | 格式與界線 |
|---|---|
| tw16:TW16-CLASSIC-v1:save | Session／GameState v1；decodeSession→engine.restore，已結算不重付 |
| tw16:practice:v1 | 練習v1；重播種子與日誌核對 |
| tw16:review:v2 | 檢討v2；白名單快照、容量／版本／Web Locks |
| tw16:learn:v1 | schema1、beginner-1-3-v1，只三課，擴課先定遷移 |
| tw16:trial:v1 | 手動保存封套schema1內含schema3報告，128KiB、Web Locks ifAvailable＋expectedRaw；只同版自動載入 |

教練偏好tw16:coach:v1為on／off／after。壞檔、未知版、讀寫失敗或跨頁衝突保留原檔與本頁內容；不清空localStorage修復。trial schema3為topic-guided、曝光自陳未知／已見／自陳未見，揭示後鎖定，不證明首次；CLI讀schema1／2／3，異版轉人工，審閱輸出reportVersion2。原始保存封套不是一般作答匯出，未授權新增匯入或靜默遷移。

## 固定界線與現場狀態

唯一桌規是[凍結TW16-CLASSIC-v1](../taiwan-mahjong-m0/RULES.md)，台灣16張、144張、五組牌加眼睛；不混港麻／日麻，不新增後端、帳號、多人或多桌規。AI／教練只讀單家getObservation，不讀他家暗牌／牌牆／種子；公開未知牌改善比例不是真實摸牌率、安全不代表阻止莊家自摸或流局續莊。

隔離preview4230仍在（session80087，僅合成資料）；回歸4226及各headless context已結束，不動使用者原4173或日常profile。work/保留各包logs、重現前失敗trace、影片及指定版本建置，全部忽略；S24、S42 A／B完整檔名在歷史交接。沒有新依賴、子代理、重設額度或自動續跑。

歷史：本日前及本輪已完成包細節在[2026-10-17歷史](HANDOFF-HISTORY-20261017.md)，M0–M5.4／早期研究見[2026-10-08交接](HANDOFF-20261008.md)。歷史計畫不會自動啟動未授權工作。
