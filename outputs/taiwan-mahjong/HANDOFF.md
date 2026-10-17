# 現行交接入口

更新：2026-10-18（Asia/Taipei）。方向依[PRODUCT-DIRECTION](PRODUCT-DIRECTION.md)，排程依[ROADMAP](ROADMAP.md)，修改位置依[MAINTENANCE](MAINTENANCE.md)。本輪以前及展開的CI證據保留[歷史交接](HANDOFF-HISTORY-20261017.md)；不要沿歷史「下一步」自動開工。

## 目前網站與本輪交付

正式入口：[青竹牌室](https://zhai2liu.github.io/taiwan-mahjong/)。repository／origin為zhai2Liu/taiwan-mahjong。**目前功能來源51f35773a25162ffddecf333352f97a52d5e5881；最近Pages建置為8de3bf37bf72f5ffbaadee21a36e38649df2a781（固定workflow來源，正式內容相同）。純文件／展示提交不等於新runtime。**

| 工作包 | 結果與指定來源 |
|---|---|
| S1.4 首頁 | [PR#22](https://github.com/zhai2Liu/taiwan-mahjong/pull/22)合併b384764；來源3c5d1db，PR Actions39065024289／build117490738456成功400／50（42.1秒），main39065175077／build117491194356成功400／50（47.9秒）、deploy117491609398成功。淺色／深綠三路入口、有存檔優先續玩；真別頁更新曾造成入口焦點遺失，先重現再修。詳[首頁驗收](HOME-REDESIGN-20261018.md) |
| S1.5 試讀 | [PR#23](https://github.com/zhai2Liu/taiwan-mahjong/pull/23)合併e760702；來源9a35c35，PR39065728154／build117492861570成功400／52（45.3秒），main39065890220／build117493353587成功400／52（44.0秒）、deploy117493723484成功。牌例／作答並排、窄畫面堆疊，詳[試讀驗收](TRIAL-WORKSPACE-20261018.md) |
| S1.6 前三課 | [PR#24](https://github.com/zhai2Liu/taiwan-mahjong/pull/24)合併51f3577；來源80f7546，PR39066375904／build117494810165成功400／52（52.0秒），main39066578543／build117495408948成功400／52（50.7秒）、deploy117495801813成功。任務／獨立進度並排，詳[教學排版驗收](LEARNING-LAYOUT-20261018.md) |
| S5.1 展示刷新 | [PR#25](https://github.com/zhai2Liu/taiwan-mahjong/pull/25)合併87e52836f61571f8732865349aad3872e043f1c7；來源7c4a2ec，PR39067503251／build117498099655成功400／52（42.2秒）。70.52秒／13段字幕／三圖已公開，九檔HTTP200及git blob雜湊相符。錄製工具先核對正式三頁資源，舊片保留；[完整證據](S51-DEMO-VALIDATION.md) |

三次UI發布均核對正式三HTML及全部引用JS／CSS，並實際驗受影響操作。首頁新局／取消／續玩、試讀真實作答／保存重載／schema3下載／取消離頁、前三課認牌完成與組牌／三筆v1進度及其他鍵保留均通過，0pageerror。Chrome155.0.8059.80／Edge155.0.4283.62的指定操作範圍見各包，不宣稱手機實機通過。

目前資源：index-w9IuzQfR.js／index-BOwf8lyn.css、training-BH5dEc_t.js／training-Ddyr2V09.css、learn-pMwkekFN.js／learn-Bv3fDrzy.css、view-BlHMN2jy.js、tile-face-CG76dTyt.js。展示合併後再次verify:release相符、main沒有新run；網站未重部署。

同一建置另有[S4.2限定驗證](S42-ACCESSIBILITY.md)：13種寬度×17狀態＝221項，以及Chrome原生200%放大19狀態，無頁面橫向溢出或焦點中心被遮；0pageerror。這些一次性檢查不併入CI52，也不是221張逐一目視或完整WCAG證明。原生縮放的Playwright截圖裁切異常已用同頁CDP畫面釐清，未因此改網站。

## 本輪尚在收尾

[PR#26](https://github.com/zhai2Liu/taiwan-mahjong/pull/26)已合併95e06ec1bcfa3abe4b68af6c9a2c316058d0b63c：S52草稿／來源更新到51f3577，明確保留032bc1c→4bb87cd為指定歷史演練；回復程序不固定沿26項。S51／ROADMAP同步公開完成、S42補放大驗證、交接收斂。Luna唯讀核對無問題；來源2c8e7df的Actions39067926469／build117499341466成功400／52（51.1秒），87份文件／629連結0問題，PR無Pages。純MD不重部署。

[PR#27](https://github.com/zhai2Liu/taiwan-mahjong/pull/27)已合併並發布8de3bf37bf72f5ffbaadee21a36e38649df2a781：五個官方Action直接引用固定commit，原版本旁註及來源／升級程序在DEPLOYMENT，事件／權限／Pages隔離未改。來源ba0bfe2的PR39068225911／build117500219011成功400／52（50.9秒）；main39068383426／build117500680291成功400／52（40.0秒）、deploy117500995456成功，五個下載SHA正確。正式三頁／引用資源與原51f3577相符（pinned-actions-live.log）。deploy-pages仍有Node20宣告被runner轉Node24的既有警告，實際部署成功，未假稱整套runner固定。沒有遊戲／保存格式改動。

目前分支codex/home-contrast-20261018：Chrome實際重現綠底對戰卡11px小標籤4.207749，Luna獨立算同值；只對該卡沿用既有muted色，建置後實際5.018787，其他兩卡／註記不改。另重現試讀鍵盤保存／清除後BODY焦點無指示（Tab仍在附近，未誇稱頁首重走），加最小回焦：若玩家已移去理由或換題則不搶回。原版先紅，修後首頁／保存14／14（10.6秒），Chrome／Edge新鍵盤各2／2（3.4／3.8秒）、build通過；完整CI預計54項，尚未提交／發布。資料鎖／schema／題目答案不改，限定證據見[S42](S42-ACCESSIBILITY.md)，不重錄版本化展示以免為小色差反覆刷新素材。

使用者要求本次五小時額度持續推進，6.1 Sol主導、Luna限定唯讀審查，未使用Astra。啟動帳戶讀值0%，本窗口resetsAt=1792284614，曾讀到66%；其後工具改回0%且resetsAt=1792287639／週額度也回0，原因未確認。**沒有呼叫額度重設或新增續跑；不能把讀值變動算成已用完100%，也不能得知精確對話剩餘token。** 每包先落盤，不為消耗額度新增受人工門檻阻擋的功能。

## 進度與不能代理的門檻

| 範圍 | 真正狀態 |
|---|---|
| M0–M5.4、S0／S1 | 台灣16張、1真人＋3公平本地AI、逐項結算、續局、牌效練習、六步導覽、局後檢討與工程基礎已發布；本輪三入口改版也已發布 |
| S2.1／S2.2 | 前三課與獨立進度已發布；[T0–T5試用](BEGINNER-TRIAL.md)準備完成，真人0、內容修訂待驗 |
| S2.3／S2.4 | [第4–6課26牌例](S23-LESSON-PREPARATION.md)、[第7–8課腳本及8分支](S24-LESSON-PREPARATION.md)、[相容候選規格](S23-PROGRESS-COMPATIBILITY.md)已備；後五課UI／新格式／中途保存／正常對戰連接未實裝。正式整合仍依S2.2試用修訂 |
| S3.1–S3.3 | 九題四類導引、同類練習、吃碰事後解釋、手動保存／同版續答與曝光自陳已發布；不自動上傳 |
| S3.4 | [人工錨點／缺口／流程](S34-ASSESSMENT-PREPARATION.md)已備；13題／12題族、四候選不進試讀、assessmentFamilies空；真人題族／難度／內容及正式放行待驗 |
| S4 | 限定技術檢查已完成；[人工回饋清單](HUMAN-FEEDBACK-CHECKLIST.md)中的手機／Safari／輔具／理解仍待，程式或模型不能代填 |
| S5 | 新展示已公開；[發布技術準備](S52-RELEASE-PREPARATION.md)完成、草稿更新待本分支合併。LICENSE、tag／Release、另擬履歷摘要仍待本人決定 |
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

本輪隔離預覽4232（session44614），4226由Playwright自行管理；原4173與日常瀏覽器profile未動。work/home-redesign-20261018/、work/entry-pages-20261018/與work/showcase-AaZOE7保留本輪合成資料、截圖／錄影與logs，全部忽略不提交。最新原生放大證據zoom-9Xip9x、zoom-native-final.log；展示公開showcase-public.log，正式未變showcase-live-unchanged.log。先保留收尾證據，再關閉自己啟動的4232；不廣泛終止Node或瀏覽器。
