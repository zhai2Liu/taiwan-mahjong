# 現行交接入口

更新：2026-10-17（Asia/Taipei）。先讀本檔與[ROADMAP](ROADMAP.md)，設計依[PRODUCT-DIRECTION](PRODUCT-DIRECTION.md)及[MASTER企畫](MASTER-IMPROVEMENT-PLAN.md)。歷史明細移到[本日前交接](HANDOFF-HISTORY-20261017.md)，需要特定證據才讀；歷史「下一步／尚未完成」不覆蓋本檔。

## 現況與下一步

本輪S2.4準備完成（2026-10-17）：來源7f7e291、[PR#13](https://github.com/zhai2Liu/taiwan-mahjong/pull/13)合併36aa912。第7–8課固定整局腳本／實桌附錄及8個從真實DEAL到結算／合法選過的分支已備；全套399／26，PR Actions39042980660成功（34.8秒），main39043175446成功（33.0秒），build117426596946／deploy117426915027成功。正式三頁200及4／3／4份JS／CSS SHA-256與本輪site相同，網頁仍4bb87cd功能內容；六個公開檔案與36aa912 git blob相符。教材／牌例見[S24](S24-LESSON-PREPARATION.md)，logs為work/s24-tests.log、s24-build.log、s24-pr-ci.log、s24-main-ci.log、s24-public.log、s24-live-after.log。未改runtime／依賴／三課進度，S2.4互動頁、真正暫停／中途保存及正常對戰連接未整合；實桌附錄未加入外部罰則。

使用者要求用本次五小時額度持續推進；新窗口起始0%、最近15%、resetsAt1792266558，不沿用上輪40%，非精確token。每包完成驗證、提交及更新本檔；下一包S4.2已重現：強制色彩下組牌選取只剩顏色、靜態牌面無圖片語意。work/s42-forced-colors-before.log／png及s42-tile-before.log；4230隔離preview仍在，session80087，測試context已關，尚未改runtime。後五課正式整合仍沿前三課試用／修訂順序，真人0、S6未啟動。無子代理、重設額度或新增排程／自動續跑，持續目標有效。

前包完成（2026-10-17）：S2.3第4–6課教材／引擎牌例準備，來源54d9e11、[PR#12](https://github.com/zhai2Liu/taiwan-mahjong/pull/12)合併aa02c78並回main。交付[S23教材](S23-LESSON-PREPARATION.md)及test/learning-next.test.mjs：吃碰／三槓、過水正反例、逐條台項與按付款對象計莊連台，共26個牌例通過；本機全套391測試／check／build通過。PR Actions39039769390指定head成功391／26（Linux29.5秒），上傳／deploy skipped；main Actions39039947228成功391／26（29.7秒），build117417193728與deploy117417482632成功。

正式三頁200、4／3／4份JS／CSS SHA-256在部署後均與本輪site相同；最新發布提交aa02c78，網頁功能內容仍4bb87cd。六個公開檔案200且SHA-256與aa02c78 git blob相符，五份文件85個本機連結有效。首次核對發現改聽例有一／四／七筒三口，已用三種具體拆法修正教材及預期，未改引擎。logs：work/s23-lessons.log、s23-tests.log、s23-build.log、s23-live-before.log／after.log、s23-pr-ci.log、s23-main-ci.log、s23-public.log。未改src／依賴／三課進度／其他存檔，S2.3互動頁及真人理解尚未完成。帳戶27%→34%→40%，同窗口resetsAt1792247167，非精確token；無子代理／重設／自動續跑。

上一包S5.1已完成：69.08秒字幕片／13段VTT與可重錄工具，來源cd0a778、合併daea897，PR#11指定head 365／26通過；七個公開檔案雜湊相符，詳[S51](S51-DEMO-VALIDATION.md)。分工本人已確認，不再重問。

S3.2／S3.3已發布；S3.4審核準備、S5.1素材及S5.2技術準備已合併。最近功能改動來源4bb87cd；本包只有教材／測試，main原工作流按測試路徑觸發，已重發相同網頁產物，發布提交aa02c78。S2.2真人仍0、S2.3互動頁未完成。

S2.4腳本／附錄準備及發布核對已完成，下一包為S4.2桌面可及性／操作檢查；後五課正式整合仍沿前三課試用／修訂順序。真人資料只阻擋相應理解／難度／成效及實機結論，不代表整個專案必須停工。S3.4正式放行、S5.2授權／Release及另擬履歷摘要仍待；S6需另外啟動，不從研究直接實裝。

| 範圍 | 實際完成／限制 |
|---|---|
| 既有對戰／練習 | M0–M5.4正常行牌、1真人＋3公平本地AI、逐項計台、本機續局、牌效練習、操作導覽；原引擎與AI未被本輪替換 |
| S0／S1 | 雙學習路線、作品入口／案例、離頁與匯出保護、PR CI、瀏覽器回歸、焦點及效能基準已完成 |
| S2.1／S2.2 | 前三課可操作及獨立進度已發布；T0–T5真人試用準備完成，沒有新真人觀察資料，八課未完成 |
| S2.3準備 | 第4–6課課文／示範／換例／回饋及26個引擎牌例已備；未接課程頁，未擴三筆進度，真人未驗 |
| S2.4準備 | 第7–8課固定整局腳本／實桌附錄及8個引擎分支已備；未接課程頁，未開中途保存／正常對戰連接 |
| S3.1 | 九題四能力導引、內容版本／生成／匯出同步已發布 |
| S3.2 | 局後同類練習另開頁；有吃碰選項的吃／碰／過正常仲裁後才解釋，關閉保持暫停。實際取得牌與原快照證據分開 |
| S3.3 | 手動本機保存／同版自動續答、重讀／清除確認、原檔回復下載、schema3曝光自陳；CLI仍讀1／2／3。不自動上傳、未授權匯入或靜默遷移 |
| S3.4 | 四候選缺口、人工理由錨點／審閱流程／空模板完成；13題／12題族、四候選不進正式試讀，assessmentFamilies仍空，無正式評量放行 |
| S5.1 | 三圖／案例／分工確認已備；69.08秒字幕片及重錄工具已通過本機／PR／公開檔案核對，S5.1完成 |
| S5.2 | 發布／履歷草稿、來源盤點、指定版本同源回退與前進完成；未建立Release／tag／LICENSE，相關決定待本人 |

## 本輪交付與修改入口

- [S2.4腳本與牌例](S24-LESSON-PREPARATION.md)：真實發牌的固定整局、不同結果與選過，實桌概念不帶入外部罰則；整合限制明列。
- [S2.3教材與牌例](S23-LESSON-PREPARATION.md)：單一教材入口，測試ID對應課文；吃碰／三槓／過水／結算沿凍結引擎，進度擴充與回退先決事項明列。
- [S3.2](S32-VALIDATION.md)：hand-review.ts的claimResolution核對公開打牌／牌組／結算；main頁內待解釋快照只等正常RESOLVE，不重送動作，模式／重載／他頁使舊等待失效。證據仍只用原決策快照。
- [S3.3](S33-VALIDATION.md)：training-draft.ts管trial:v1封套；trial-record.ts純格式驗證供瀏覽器／Node24 CLI共用。training.ts處理手動保存、衝突、原檔下載與已存離頁。內容revision未改。
- [S3.4準備](S34-ASSESSMENT-PREPARATION.md)、[真人回饋清單](HUMAN-FEEDBACK-CHECKLIST.md)、[前三課任務](BEGINNER-TRIAL.md)：剩餘人工工作與紀錄格式。
- [示範三圖與短片](../taiwan-mahjong-showcase/README.md)、[S5.1核對](S51-DEMO-VALIDATION.md)、[S5.2草稿／來源／回復](S52-RELEASE-PREPARATION.md)。素材公開原檔HTTP200且SHA-256與提交相符。
- [MAINTENANCE](MAINTENANCE.md)管資料流與修改位置；[DEPLOYMENT](DEPLOYMENT.md)管正常發布及故障處理；[TRIAL-REVIEW](TRIAL-REVIEW.md)管真人匯出接收。先看具體修改位置，不全讀歷史研究。

## 指定提交與發布證據

| 包 | 來源／合併 | 指定head檢查與正式驗證 |
|---|---|---|
| S3.2 | e1a59f7／032bc1c，[PR#7](https://github.com/zhai2Liu/taiwan-mahjong/pull/7) | PR39017877867、main39018073228成功；360／20，正式三頁及仲裁／練習入口通過 |
| S3.3 | 52e68f5／4bb87cd，[PR#8](https://github.com/zhai2Liu/taiwan-mahjong/pull/8) | PR39019416117成功365／26（33.8秒）；main39019565456成功365／26（30.5秒）、build117358485491及deploy117358754799成功 |
| S3.4／S5.1 | 51e105c／6b8e5ea，[PR#9](https://github.com/zhai2Liu/taiwan-mahjong/pull/9) | PR39020052983成功365／26（28.8秒）；純文件／展示，無新Pages部署 |
| S5.2 | d8e8701／b265a83，[PR#10](https://github.com/zhai2Liu/taiwan-mahjong/pull/10) | PR39020532423成功365／26（33.7秒）；純Markdown，無新Pages部署 |
| S5.1補版 | cd0a778／daea897，[PR#11](https://github.com/zhai2Liu/taiwan-mahjong/pull/11) | PR39034074956成功365／26（30.3秒）；七個公開檔案雜湊相符，無新Pages部署 |
| S2.3準備 | 54d9e11／aa02c78，[PR#12](https://github.com/zhai2Liu/taiwan-mahjong/pull/12) | PR39039769390成功391／26（29.5秒）；main39039947228成功391／26（29.7秒），部署成功且三頁資源相符 |
| S2.4準備 | 7f7e291／36aa912，[PR#13](https://github.com/zhai2Liu/taiwan-mahjong/pull/13) | PR39042980660成功399／26（34.8秒）；main39043175446成功399／26（33.0秒），部署及三頁資源通過 |

七個PR均已附本chat。PR的Pages上傳／deploy skipped，無Pages產物；沒有外部真人程式審查或分支保護修改。不要只拿舊CI當新變更證據。

正式站：https://zhai2liu.github.io/taiwan-mahjong/；origin：https://github.com/zhai2Liu/taiwan-mahjong.git。S3.3正式index／training／learn HTTP200、全部4／3／4份JS／CSS SHA-256與本機相符；S5.2及本輪S2.3準備部署後再核對仍未變。當前training-vkOYxEaA.js、index-DbMxywyF.js／index-8F0VuNEV.css、view-BjMvH8LY.js、learn-D7cu7U9P.js。

## 驗證範圍與資料契約

S3.3既有功能驗收為365 Node／check／build、Chromium26項通過；Chrome155.0.8059.80／Edge155.0.4283.62受影響六項各通過。1440／390／320與Chrome原生200%（CSS720×450、dpr2）無橫向溢出，保存續答／schema3真實下載→本機審閱通過；正式Chrome1440／390／320亦0pageerror。全部是隔離合成資料，不能當真人理解、手機／Safari／螢幕閱讀器或普遍學習成效。

S5.2同源4229演練032bc1c↔4bb87cd：有效結算、已有一捨一摸的練習、一筆合法決策、課程閱讀／提示完成、新版試讀保存；五鍵原文完全相同、結算不重付。舊版沒有試讀續存按鈕，但不覆寫新鍵，回新版恢復；只是指定版本／狀態，不保證未來格式。未回退正式站或動真人資料。

| 本機鍵 | 格式／界線 |
|---|---|
| tw16:TW16-CLASSIC-v1:save | Session／GameState v1；decodeSession→engine.restore，重開結算不重付 |
| tw16:practice:v1 | 練習v1，重播驗證種子／日誌 |
| tw16:review:v2 | 檢討v2，獨立白名單快照，容量／版本／Web Locks |
| tw16:learn:v1 | 新手進度schema1、beginner-1-3-v1，只三課，擴課先定遷移 |
| tw16:trial:v1 | 手動保存封套schema1含schema3報告及題號／分類，128KiB、Web Locks ifAvailable＋expectedRaw；同版才自動載入 |

對戰偏好tw16:coach:v1的on／off／after不改版。壞檔、未知版、讀寫失敗及跨頁衝突保留原檔與本頁內容；不可清空localStorage修復。trial schema3的guidanceMode=topic-guided，exposure未知／已見／自陳未見，揭示後鎖定，不證明首次。審閱輸出reportVersion2，舊schema1／2曝光未知、異版轉人工。原始保存封套不是一般作答匯出。

## 固定界線與現場狀態

TW16-CLASSIC-v1規則唯一來源為[凍結RULES](../taiwan-mahjong-m0/RULES.md)，不混用港麻／日麻。AI及教練只讀單家getObservation，證據不讀其他暗牌／牆／種子；公開進牌比例不是實摸率、安全不等於阻止莊家自摸或流局續莊。S6離線研究不是實裝授權。

先前服務4226／4227／4229及驗收Chrome／Edge已關閉；S2.4本包未開桌面瀏覽器；接S4.2的4230隔離preview仍在，不動使用者原4173或日常profile。work/保留合成logs／原始影片／zoom profile／舊版隔離建置，全部忽略，不提交真人資料。主要logs為s32-*、s33-*、s51-*、s52-*；無新套件或子代理。

上輪S3.2–S5.2帳戶起始1%、最後檢查64%，舊窗口resetsAt1792229095。當前窗口與用量以本輪檢查點為準，比例不是精確對話剩餘token；未使用重設額度或自動續跑。分工已依S51確認，真人學習試用仍無新資料。

歷史：本輪以前細節與途中檢查點在[2026-10-17歷史交接](HANDOFF-HISTORY-20261017.md)，M0–M5.4／早期M6見[2026-10-08交接](HANDOFF-20261008.md)。完整企畫及歷史下一步不會自動啟動未授權工作。
