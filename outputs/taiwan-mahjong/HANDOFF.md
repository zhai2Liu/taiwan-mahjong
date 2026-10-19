# 現行交接入口

更新：2026-10-19（Asia/Taipei）。方向依[PRODUCT-DIRECTION](PRODUCT-DIRECTION.md)，排程依[ROADMAP](ROADMAP.md)，修改位置依[MAINTENANCE](MAINTENANCE.md)。本輪以前及展開的CI證據保留[歷史交接](HANDOFF-HISTORY-20261017.md)；不要沿歷史「下一步」自動開工。

## S2.2 回饋工具補強：本機完成，待發布

2026-10-19使用者要求繼續推進。限定補齊前三課試用回饋入口：原生選填表單，下載TXT後自行附回專案對話；切課／重讀／重建保留本頁回饋，下載故障可複製內容，回饋與未存課程合併離頁提醒。沒有新保存鍵或後端；未改課程、答案、桌規／AI及任何舊存檔格式。TXT只附手動輸入與白名單課程快照，讀取失敗／衝突時不列未確認旗標；不是正式試用、首次曝光、理解或公開同意證明。詳[試用與接收流程](BEGINNER-TRIAL.md)。

本機型別／正式建置、400項Node、58項瀏覽器回歸（51.5秒）通過；新增四項覆蓋實際TXT下載／舊鍵隔離／取消離頁／下載失敗／跨頁衝突與兩種未存狀態，沒有把合成回饋計入真人。Chrome155.0.8059.80與Edge155.0.4283.62各320／1440px經鍵盤開啟、輸入、下載與取消返回，無橫溢出、pageerror或網路寫入；強制色彩焦點可見，桌面及窄畫面表單已目視。證據work/learning-feedback-20261019/（build／node-tests／browser-tests.log、local-result.json與截圖）。Luna唯讀review指出未確認旗標風險，已修並回歸。

目前分支codex/learning-feedback-20261019，尚未提交／PR／部署；正式網站仍為下述433e042。下一步提交、指定head的PR與main CI／Pages、正式資源與實際下載驗證。新learn-CenaBSFi.js／learn-YDGOvCA6.css，其餘六資源不變。預覽4234由本輪啟動（session85437），收尾只關閉此實例。帳戶開始五小時用量20%、中途58%，resetsAt1792400501；不能推算精確剩餘token，未重設／自動續跑。

真人仍0，S2.2內容修訂待驗，S2.3後五課整合與S6不因此放行。新的可重現維護缺口可獨立推進；不為填進度捏造試用或擴題。

## 前包：S1.7 名稱與返回導引已發布

使用者要求全力推進並想移除「青竹」，其後指定「從零到一百的___」由代理補完；採「從零到一百的麻將路」，取代尚未發布的暫定名稱。名稱不代表一百課或能力等級。首頁與三頁標題／頁首、現行README／方向／企畫／發布草稿及展示腳本同步，首頁字樣改「雀」。歷史驗收、影片、字幕不改，展示README註明舊版名稱。repository、Pages網址、本機資料鍵／格式及題庫內容版本均不變。

從首頁進練習會顯示「返回首頁」，由牌局進練習才顯示「返回對戰」；hasGame只由當前session是否存在取得，仍使用原game命令與保存／暫停流程。

第一版暫名的本機型別／正式建置、400項Node與54項瀏覽器回歸（42.5秒）通過。最後名稱依使用者回覆替換並調整窄畫面標題後，建置與首頁六項回歸再通過（4.9秒）；最終全套已由下列指定PR／main驗證。Chrome155.0.8059.80／Edge155.0.4283.62各320／390／760／1440px重新檢查三頁名稱、頁首與內容無橫溢出（24頁面狀態），桌面／320截圖目視；實際從首頁及有效合成牌局進練習再返回，來源文字正確、牌局仍暫停、保存原文及其他鍵保持，0pageerror。證據work/room-name-20261018/final-local-*，不把本次自動檢查當真人試用。無新增依賴、未改桌規／AI／課程／答案。

正式入口：[從零到一百的麻將路](https://zhai2liu.github.io/taiwan-mahjong/)，repository／origin沿用zhai2Liu/taiwan-mahjong。**Pages來源433e042097145c4646eb52cfe76677f9e9a2c55d已發布；[PR#29](https://github.com/zhai2Liu/taiwan-mahjong/pull/29)最終head為34d2aa1ed904909a643d7b16dacad2e01face9ee。** PR Actions39093047810／build117573648695成功400／54（51.5秒），PR無Pages；main39093186528／build117574064712成功400／54（42.0秒）、deploy117574341570成功。純文件狀態提交不代表另一次runtime發布。

正式三頁HTML及全部引用JS／CSS的HTTP200／SHA-256均與指定建置相符（live-assets.log）。正式Chrome／Edge再次執行同樣四寬三頁檢查與兩條返回操作，0pageerror、原牌局／其他鍵保留（live-result.json及截圖）；正式桌面首頁已目視。這些是隔離合成驗收，不是手機實機或真人理解證據。

前包資源：index-Cz1_bxsf.js／index-CdSD-TSu.css、training-DZ2kWL9p.js／training-Ddyr2V09.css、learn-BrdN8sVu.js／learn-Bv3fDrzy.css、view-CQhgouNC.js、tile-face-CG76dTyt.js。展示影片與三圖仍記錄51f3577的舊名稱，已有說明，沒有為改名冒充新錄影。改名前PR22–28的來源、CI、放大與對比／焦點證據已移入[歷史交接](HANDOFF-HISTORY-20261017.md)，不需每輪重讀。

本輪Luna唯讀檢查未發現其他可證實流程故障；S1.7無剩餘程式／發布待辦，新的維護問題可獨立推進。下一個正式課程包S2.3仍依前三課試用與修訂，正式評量仍依真人題族／難度，S6未啟動；名稱調整不改這些關卡。帳戶啟動五小時用量2%，收尾78%，resetsAt1792310882；無精確對話剩餘token、未使用重設或自動續跑。本輪只由6.1 Sol與限定Luna處理。

## 進度與不能代理的門檻

| 範圍 | 真正狀態 |
|---|---|
| M0–M5.4、S0／S1 | 台灣16張、1真人＋3公平本地AI、逐項結算、續局、牌效練習、六步導覽、局後檢討與工程基礎已發布；本輪三入口改版也已發布 |
| S2.1／S2.2 | 前三課與獨立進度已發布；[T0–T5試用](BEGINNER-TRIAL.md)與選填TXT回饋工具已備，發布依上方狀態；真人0、內容修訂待驗 |
| S2.3／S2.4 | [第4–6課26牌例](S23-LESSON-PREPARATION.md)、[第7–8課腳本及8分支](S24-LESSON-PREPARATION.md)、[相容候選規格](S23-PROGRESS-COMPATIBILITY.md)已備；後五課UI／新格式／中途保存／正常對戰連接未實裝。正式整合仍依S2.2試用修訂 |
| S3.1–S3.3 | 九題四類導引、同類練習、吃碰事後解釋、手動保存／同版續答與曝光自陳已發布；不自動上傳 |
| S3.4 | [人工錨點／缺口／流程](S34-ASSESSMENT-PREPARATION.md)已備；13題／12題族、四候選不進試讀、assessmentFamilies空；真人題族／難度／內容及正式放行待驗 |
| S4 | 限定技術檢查已完成；[人工回饋清單](HUMAN-FEEDBACK-CHECKLIST.md)中的手機／Safari／輔具／理解仍待，程式或模型不能代填 |
| S5 | 新展示已公開；[發布技術準備](S52-RELEASE-PREPARATION.md)及草稿同步完成。LICENSE、tag／Release、另擬履歷摘要仍待本人決定 |
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

## 現場與原始證據

本輪work/room-name-20261018/保留合成資料檢查、local／final-local／live截圖及logs；正式證據用live-*，不要把第一版暫名結果當成最後來源。預覽4233（session70516／Vite PID1928）已核對來源及監聽後只關閉該程序，4233無監聽；驗收browser contexts均關閉。原4173與日常瀏覽器profile未動。work/皆忽略不提交；舊證據入口見歷史交接。
