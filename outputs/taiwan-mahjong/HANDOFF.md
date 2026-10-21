# 現行交接入口

更新：2026-10-21（Asia/Taipei）。方向依[PRODUCT-DIRECTION](PRODUCT-DIRECTION.md)，排程依[ROADMAP](ROADMAP.md)，修改位置依[MAINTENANCE](MAINTENANCE.md)。本輪以前及展開的CI證據保留[歷史交接](HANDOFF-HISTORY-20261017.md)；不要沿歷史「下一步」自動開工。

## 本輪：專案 Markdown 整理

2026-10-21，依使用者要求整理全部專案Markdown。新增[完整分類索引](DOCUMENTATION.md)，統一README／AGENTS／M0入口，標明現行規格、階段驗收、候選研究及歷史交接。已完成前包的展開紀錄原文移入既有[歷史交接](HANDOFF-HISTORY-20261017.md)，舊檔名、驗收數字與凍結規格保留。歷史AI及試讀文件補後續狀態入口，避免把早期「未接線／未發布」當現況。

本包只整理文件，由Codex處理並以獨立唯讀審查輔助；沒有遊戲、資料格式、依賴或部署變更。原始文件快照與驗證結果留在work/docs-organization-20261021/；本機早期企畫與work快照維持原位。最近遊戲發布仍是下節B1；前三課真人順序與S6啟動條件不變。

獨立核對90份正式Markdown（含新索引）全部列入8類、無漏列或重複；文件檢查788個本機連結、0問題，差異空白檢查通過。已搬移前包與既有歷史主文均比對原始快照確認完整，凍結RULES／CONTRACTS原文未變；驗證使用暫存Git索引，原索引未改。文件已存檔，尚未提交或推送。

## 最近功能交付：B1平手安全捨牌已合併並完成正式驗收

依使用者「繼續推進，開發可交Claude Code」及新的常設分工，Codex定義B1限定範圍／驗收，實際Claude Code CLI2.1.304透過claude-rd完成RD、自測；使用既有claude.ai訂閱，無API/provider切換。基準main2a33106，工作分支codex/ai-safe-tie-20261021；會話與brief／原始JSON在work/ai-safe-tie-20261021/。只有原本牌效及加分完全並列且全為捨牌時，優先選既有公開容量證明可排除本次普通放槍的牌；未證明仍未知。不改主要牌效、吃碰槓／WIN優先、理由、亂數步數、格式或UI，不啟動人格／攻守、阻莊及後五課。詳[驗收文件§9](AI-CLAIM-TUNING-20261020.md)。

Codex檢視四個實作檔、確認原斷言未弱化，獨立重跑408項Node、build、58項Chromium（46.8秒）通過。直接用基準AI對照：128種子全選安全北（原版56次九條）；全未知與原版相同、較差安全牌不越過原最佳、不可見牌交換不改決策。一將26局3,398步／1,338決策中11次選擇不同，皆同一步牌效且新版具普通放槍證明；終止、還原與收付平衡通過，非強度或收益比較。

本機Chrome155.0.8059.85於1440／320px實際續開合成v1舊檔，B1打北、僅一步、操作前原文及原分數／牌組保持；暫停／重載及其他鍵保留，0pageerror、無橫溢出。臨時4236（session54151／PID38304）核對命令／port後已關閉，無監聽；驗收context均關閉。CLI管線build曾被拒，改原允許的純命令完成且Codex再驗，未放寬權限。README與MAINTENANCE已對齊B1全域證明接線，對手別風險／攻守／人格仍維持研究。

[PR#33](https://github.com/zhai2Liu/taiwan-mahjong/pull/33)最終head **2fec33a61358307d5276141de30d1276002e9366** 的Actions39591877147／build119194592400成功408／58（47.4秒）、89份文件671個本機連結；PR無Pages。已合併並回main，**正式Pages來源9c72b3e4470a8474f812b2d1dd549f796bf96698**，main Actions39592139116／build119195471114成功408／58（54.5秒）、deploy119196336419成功。純文件收尾不代表另一個runtime版本。

正式三頁HTML及八項唯一JS／CSS HTTP200、SHA-256與建置相符；只有index-BfLfx1J2.js更新，其餘七資源不變。正式Chrome155.0.8059.85於1440／320px再跑相同合成v1續玩：打北且只推進一步、分數／牌組保持、暫停／重載及其他鍵原文保持、0pageerror、無橫溢出；正式桌面與本機窄版已目視。證據live-assets.log、live-result.json、live-check.log及截圖均在work/ai-safe-tie-20261021/。不是真人理解、收益或實機手機／Safari驗證；原4173及日常profile未動。

本包程式、發布與交接已完成；後五課仍先等前三課真人回饋，S6未啟動，其他獨立候選依現有驗收結論。帳戶開始／收尾快照五小時已用27%／49%，是共用帳戶用量、非本包精確token；未重設額度或新增自動續跑。Claude會話已結束、Codex獨立驗收成立，下一次維持使用者指定的PM／SA與Claude RD分工。

## 進度與不能代理的門檻

| 範圍 | 真正狀態 |
|---|---|
| M0–M5.4、S0／S1 | 台灣16張、1真人＋3公平本地AI、逐項結算、續局、牌效練習、六步導覽、局後檢討與工程基礎已發布；學習／練習／對戰三入口改版已發布 |
| S2.1／S2.2 | 前三課、獨立進度與選填TXT回饋已發布；[T0–T5試用](BEGINNER-TRIAL.md)準備完成，真人0、內容修訂待驗 |
| S2.3／S2.4 | [第4–6課26牌例](S23-LESSON-PREPARATION.md)、[第7–8課腳本及8分支](S24-LESSON-PREPARATION.md)、[相容候選規格](S23-PROGRESS-COMPATIBILITY.md)已備；後五課UI／新格式／中途保存／正常對戰連接未實裝。正式整合仍依S2.2試用修訂 |
| S3.1–S3.3 | 九題四類導引、同類練習、吃碰事後解釋、手動保存／同版續答與曝光自陳已發布；不自動上傳 |
| S3.4 | [人工錨點／缺口／流程](S34-ASSESSMENT-PREPARATION.md)已備；13題／12題族、四候選不進試讀、assessmentFamilies空；真人題族／難度／內容及正式放行待驗 |
| S4 | 限定技術檢查已完成；[人工回饋清單](HUMAN-FEEDBACK-CHECKLIST.md)中的手機／Safari／輔具／理解仍待，程式或模型不能代填 |
| S5 | 現行名稱展示刷新PR#31已合併，11檔公開內容與合併來源核對完成，詳[S5.1驗收](S51-DEMO-VALIDATION.md)。[發布技術準備](S52-RELEASE-PREPARATION.md)及草稿同步完成。LICENSE、tag／Release、另擬履歷摘要仍待本人決定 |
| S6 | 人格AI僅離線研究，使用者未授權實裝，需另行啟動 |

分工本人已確認「本人負責需求、方向與操作回饋；AI協助規格、程式、測試、發布與文件」，不重問、不推定手寫比例／個人技能。真人資料接收依[TRIAL-REVIEW](TRIAL-REVIEW.md)，不代填、不自行公開回饋。其他新重現操作／維護缺口可獨立修，不代表必須停工或放行上述功能。

## 必須保留的資料與規則界線

| 本機鍵 | 現行格式／讀取 |
|---|---|
| tw16:TW16-CLASSIC-v1:save | Session／GameState v1；decodeSession→engine.restore，結算已付款，不重付 |
| tw16:practice:v1 | 練習v1；種子與日誌重播核對 |
| tw16:review:v2 | 白名單快照、容量／版本、Web Locks |
| tw16:learn:v1 | schema1、beginner-1-3-v1、只三課；v2是候選規格，現行不支援 |
| tw16:trial:v1 | 保存封套schema1含schema3報告、128KiB、Web Locks ifAvailable＋expectedRaw，只自動讀同版 |

教練偏好tw16:coach:v1為on／off／after。壞檔、未知版、讀寫失敗及跨頁衝突保留原文與本頁內容，不清空localStorage修復。試讀保存位置只在按鈕保存時更新，切題不自動寫入；曝光自陳不是首次證明，揭示後鎖定。CLI讀schema1／2／3、審閱reportVersion2；未授權任意匯入、靜默遷移或後端。

main只安排一個自動計時器，吃碰解釋等正常RESOLVE並核對原快照，關閉保持暫停、不重送。syncSaveLeaveGuard統一檢查牌局／練習失敗與檢討pending，不能只因當前模式保存成功解除其他未存提醒。learning.loadProgress先驗候選成功才換記憶體。view.tile保留圖片名稱與強制色彩選取；他家暗手／暗槓牌種仍未知。

唯一桌規為[凍結TW16-CLASSIC-v1](../taiwan-mahjong-m0/RULES.md)：144張、五組加眼睛，不混港麻／日麻。AI／教練只讀自家getObservation，不讀別家暗手、牌牆或種子；公開未知牌改善比例不是真實摸牌率，安全不等於阻止莊家自摸或流局續莊。沒有帳號／後端／多人／多桌規。
