# 現行交接入口

更新：2026-10-22（Asia/Taipei）。方向依[PRODUCT-DIRECTION](PRODUCT-DIRECTION.md)，排程依[ROADMAP](ROADMAP.md)，修改位置依[MAINTENANCE](MAINTENANCE.md)。本輪以前及展開的CI證據保留[歷史交接](HANDOFF-HISTORY-20261017.md)；不要沿歷史「下一步」自動開工。

## 本輪：S2.3第4–6課已發布並完成正式驗收

[PR#34](https://github.com/zhai2Liu/taiwan-mahjong/pull/34)最終head af7dd4045303433c2f83fac7fde0cb21baebabbd，Actions39630840862／build119328301041成功415／80（1.3分），91份文件807連結通過，PR無Pages。2026-10-22已合併，**正式Pages來源c5e76c96889851ae3af12735284aacb96a145d21**，main Actions39631381702／build119330178701成功415／80（1.2分）、91份807連結，deploy119331469050成功。已回main、tree與驗收head相同；純文件收尾不代表另一個runtime。臨時4237核對PID38596及完整專案命令後已關閉、無監聽；context與4231也均關閉，日常4173未動。

2026-10-21使用者明確改為「不管真人回饋了，先推進課程進度」，解除先等前三課真人回饋的開發順序。這次先做第4–6課互動及進度相容，第7–8課另包；真人仍0、理解與成效待驗，不阻擋課程開發，不放行正式評量或S6。以下舊順序均屬當時紀錄。

既有專案仍在C:/Users/USER/Documents/Codex/2026-10-03/new-chat；新工作資料夾C:/Users/USER/Documents/ChatGPT/麻將之路尚空，未搬移或覆蓋。分支codex/lessons-4-6-20261021，先保留原32份文件整理為c79b07f（90份文件788連結通過，修掉索引末尾空白行），連同af7dd40課程更新由PR#34交付。Codex定範圍、實際Claude Code CLI2.1.304 RD實作及同會話修正／自測，claude.ai Pro原訂閱；brief／CLI結果及本輪檢查留work/lessons-4-6-20261021/。詳[整合與驗收](S23-INTEGRATION-VALIDATION.md)。正式版目前為第1–6課入門試用；下節B1為前包功能紀錄。

相容對照已凍結並實裝：前三課語義、提示歸類與完成條件不變，read／guided／independent逐位帶入；tw16:learn:v2（schema2、beginner-1-8-v1）與舊v1分鍵，原v1不改不刪，玩家明確選擇才帶入。八筆封套只開六課，7–8旗標false；不保存未完成操作。C01／03–12通過，C02無實質修訂不適用。資料界線表的舊v1為只讀相容，不是當前寫入鍵。

Claude415／80與build通過；Codex獨立重跑415項Node、build、80項瀏覽器（1.8分）、文件及空白檢查通過，凍結引擎／規則／計台／AI／Session未變。另核對46個新舊牌例局面、125個舊旗標組合、8種失敗0寫入、結算只讀及下一局不重付。實際Chrome155.0.8059.85於1440／320px完成帶入及4–6換例、重載／舊鍵他頁事件／只重建v2與五類其他資料保持，0pageerror、無溢出，桌面／窄版已目視；Chrome／Edge各四模式真實BFCache返回與衝突共8流程通過。帳戶開始7%、最後檢查51%已用／每週71%，是共用帳戶快照、非本包或對話精確token；未重設額度。

正式三頁HTML及8項唯一JS／CSS皆HTTP200、SHA-256與驗收建置相同；新index-CG8hfk7O.js、view-BYik_jIh.js、learn-DUtJZ8XM.js、learn-q8MxNIzo.css，其餘4項不變。正式網址再以1440／320px完成舊v1明確帶入、4–6課換例自行完成與重載、真實他頁v1事件不阻擋有效v2、重建僅動v2；舊原文及對戰／練習／檢討／試讀／教練原文保留，0pageerror、無溢出；正式桌面結算與窄版吃牌已目視。live-assets.log、live-ui.log、live-ui-result.json與截圖在同一work目錄；context均關閉，非實機手機／Safari或真人理解驗證。

**下一包：S2.4第7–8課。** 沿[S24教材](S24-LESSON-PREPARATION.md)整合固定整局／8分支、實桌附錄及返回正常對戰。v2目前只保存完成旗標；整局中途保存／暫停須先定最少檢查點與重播驗證，不直接塞GameState進v2。先讀現行學習契約及S24，不重做凍結桌規，不再以缺真人回饋停工；保持Codex PM／SA與Claude RD，S6及正式評量仍另行啟動。

## 前包：專案 Markdown 整理

2026-10-21，依使用者要求整理全部專案Markdown。新增[完整分類索引](DOCUMENTATION.md)，統一README／AGENTS／M0入口，標明現行規格、階段驗收、候選研究及歷史交接。已完成前包的展開紀錄原文移入既有[歷史交接](HANDOFF-HISTORY-20261017.md)，舊檔名、驗收數字與凍結規格保留。歷史AI及試讀文件補後續狀態入口，避免把早期「未接線／未發布」當現況。

本包只整理文件，由Codex處理並以獨立唯讀審查輔助；沒有遊戲、資料格式、依賴或部署變更。原始文件快照與驗證結果留在work/docs-organization-20261021/；本機早期企畫與work快照維持原位。最近遊戲發布仍是下節B1；前三課真人順序與S6啟動條件不變。

獨立核對90份正式Markdown（含新索引）全部列入8類、無漏列或重複；文件檢查788個本機連結、0問題，差異空白檢查通過。已搬移前包與既有歷史主文均比對原始快照確認完整，凍結RULES／CONTRACTS原文未變；驗證使用暫存Git索引，原索引未改。當時尚未提交；本輪已保留為c79b07f並由PR#34合併，該文件工作包也已收尾。

## 前包功能：B1平手安全捨牌已合併並完成正式驗收

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
| S2.3／S2.4 | [4–6課互動及v2相容](S23-INTEGRATION-VALIDATION.md)已發布c5e76c9並完成正式驗收；[7–8課腳本及8分支](S24-LESSON-PREPARATION.md)已備，頁面／中途保存／正常對戰連接未整合，接續推進不再等真人 |
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
| tw16:learn:v1／v2 | v1 schema1三課原文只讀保留；v2 schema2、beginner-1-8-v1八筆／六課開放，明確帶入；本機及正式兩寬均已驗 |
| tw16:trial:v1 | 保存封套schema1含schema3報告、128KiB、Web Locks ifAvailable＋expectedRaw，只自動讀同版 |

教練偏好tw16:coach:v1為on／off／after。壞檔、未知版、讀寫失敗及跨頁衝突保留原文與本頁內容，不清空localStorage修復。試讀保存位置只在按鈕保存時更新，切題不自動寫入；曝光自陳不是首次證明，揭示後鎖定。CLI讀schema1／2／3、審閱reportVersion2；未授權任意匯入、靜默遷移或後端。

main只安排一個自動計時器，吃碰解釋等正常RESOLVE並核對原快照，關閉保持暫停、不重送。syncSaveLeaveGuard統一檢查牌局／練習失敗與檢討pending，不能只因當前模式保存成功解除其他未存提醒。learning.loadProgress先驗候選成功才換記憶體。view.tile保留圖片名稱與強制色彩選取；他家暗手／暗槓牌種仍未知。

唯一桌規為[凍結TW16-CLASSIC-v1](../taiwan-mahjong-m0/RULES.md)：144張、五組加眼睛，不混港麻／日麻。AI／教練只讀自家getObservation，不讀別家暗手、牌牆或種子；公開未知牌改善比例不是真實摸牌率，安全不等於阻止莊家自摸或流局續莊。沒有帳號／後端／多人／多桌規。
