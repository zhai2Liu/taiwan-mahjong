# 現行交接入口

更新：2026-10-18（Asia/Taipei）。方向依[PRODUCT-DIRECTION](PRODUCT-DIRECTION.md)，排程依[ROADMAP](ROADMAP.md)；前輪九包與完整CI證據見[歷史交接](HANDOFF-HISTORY-20261017.md)。

## 本輪進行中

使用者要求投入新的五小時帳戶額度並優先改善首頁。啟動讀值0%已用，resetsAt=1792284614；最近檢查28%。這是帳戶共享百分比，不是精確對話剩餘token。建立持續工作目標，每包落盤；不使用重設或自動續跑。6.1 Sol主導，Luna限定唯讀首頁／試讀審查，未使用Astra。

S1.4首頁已由[PR#22](https://github.com/zhai2Liu/taiwan-mahjong/pull/22)合併並發布b384764505ec63e798b01ca49ca239b637eae7cc。最終來源3c5d1db32d3a804fd44c77bc26a9baf679d12704的Actions39065024289／build117490738456成功400／50（42.1秒）；main39065175077／build117491194356成功400／50（47.9秒）、deploy117491609398成功。85份文件／582連結0問題。真別頁更新時的入口焦點遺失已先重現再修復；沒有改保存格式。

正式三頁HTML與全部引用JS／CSS和指定site相符。正式隔離桌面新局、390px學習／試讀／練習往返、取消新局原文保留與續玩還原全部通過、0pageerror；另有320／820及強制色彩截圖。完整範圍、兩張圖與契約見[首頁驗收](HOME-REDESIGN-20261018.md)。功能資源index-w9IuzQfR.js／view-BlHMN2jy.js／index-BOwf8lyn.css。

S1.5[試讀工作區](TRIAL-WORKSPACE-20261018.md)已由[PR#23](https://github.com/zhai2Liu/taiwan-mahjong/pull/23)合併並發布e76070291e9e59f30ee5c87ba0e235f5d7e68ec4。來源9a35c350e0a24ee48dede9461d18507e3801b650的Actions39065728154／build117492861570成功400／52（45.3秒）；main39065890220／build117493353587成功400／52（44.0秒）、deploy117493723484成功。正式三頁資源相符；Chrome1440px／Edge390px實際作答、保存／重載原游標、schema3真實下載及取消離頁保留通過，0pageerror。training-BH5dEc_t.js／training-Ddyr2V09.css。本機另外Chrome／Edge各四項、Chrome四模式真快取返回通過。未改題目／答案／內容版本、曝光或保存邏輯；只補手動保存位置說明，不增加切題離頁警告。原始證據在work/entry-pages-20261018/。

S1.6[前三課排版](LEARNING-LAYOUT-20261018.md)已由[PR#24](https://github.com/zhai2Liu/taiwan-mahjong/pull/24)合併51f35773a25162ffddecf333352f97a52d5e5881。來源80f7546bfef18297808413a40a04d7430d449960的Actions39066375904／build117494810165成功400／52（52.0秒）；main CI／Pages及正式核對待驗。本機learning／accessibility16／16，最後Chrome／Edge各6／6；只改learn.html／learning.css，未改learning.ts、課文、示例與三筆進度格式。原始證據在work/entry-pages-20261018/learning-*。

下一包重錄作品展示，待S1.6正式發布核對後才錄。generate-demo.mjs已加錄製前重用verify-release的檢查，尚未提交；以尚未發布的本機learn.html差異已確認非零退出，且發生在建立候選／瀏覽器之前。錄的是正式站，不能把單獨npm build當成會錄本機頁。預計只更新工具、展示素材與文件，不改遊戲行為。

正式網址[青竹牌室](https://zhai2liu.github.io/taiwan-mahjong/)，origin=https://github.com/zhai2Liu/taiwan-mahjong.git。前輪九包與來源8e43f87已保留歷史；純MD狀態提交不另部署。不要使用舊CI代替本輪指定提交。

首頁沒有修改固定桌規、計台、AI、課程內容、保存格式或三頁路徑。S2.3互動整合仍先依S2.2真人試用／修訂；目前真人0。其他獨立操作與維護缺口可繼續修，S6仍須另行啟動。

## 產品進度與人工門檻

| 範圍 | 實際狀態 |
|---|---|
| M0–M5.4、S0／S1 | 完整台灣16張行牌、1真人＋3公平本地AI、逐項結算、續局、牌效練習、六步導覽、檢討與作品／工程基礎已發布 |
| S2.1／S2.2 | 前三課可操作／獨立進度已發布；[T0–T5試用](BEGINNER-TRIAL.md)準備完成，真人0、修訂待驗 |
| S2.3／S2.4 | [第4–6課教材與26牌例](S23-LESSON-PREPARATION.md)、第7–8課腳本與8分支、相容候選規格已備；後五課UI、新格式、中途保存／正常對戰連接未實裝 |
| S3.1–S3.3 | 九題四能力導引、局後同類練習、吃碰事後解釋、手動保存／同版續答與曝光自陳已發布；不自動上傳 |
| S3.4 | [候選缺口／人工錨點／流程](S34-ASSESSMENT-PREPARATION.md)已備；13題／12題族、四候選不進試讀，assessmentFamilies空；真人題族／難度／內容審閱與正式放行待驗 |
| S4.2 | 本輪限定技術檢查／修正完成；[人工回饋清單](HUMAN-FEEDBACK-CHECKLIST.md)的手機、Safari、輔具與理解仍待，不能稱完整WCAG符合 |
| S5.1／S5.2 | [69.08秒字幕片、三圖與案例](../taiwan-mahjong-showcase/README.md)完成，分工本人已確認不再重問；[發布／回復技術準備](S52-RELEASE-PREPARATION.md)完成，LICENSE、tag／Release及另擬履歷摘要仍待本人決定 |
| S6 | 人格AI保留離線研究，未授權實裝；不能從研究直接接入正式策略 |

真人資料接收依[TRIAL-REVIEW](TRIAL-REVIEW.md)，不代填人數／理解或自行公開回饋。已確認分工為「本人負責需求、方向與操作回饋；AI協助規格、程式、測試、發布與文件」。

## 修改與資料界線

先按[MAINTENANCE](MAINTENANCE.md)找修改位置；發布／回復依[DEPLOYMENT](DEPLOYMENT.md)，不全讀歷史研究。

- main只安排一個自動計時器；吃碰解釋等正常RESOLVE並核對原快照，關閉保持暫停，不重送動作，見[S3.2](S32-VALIDATION.md)。
- learning.loadProgress成功驗證才換記憶體；main.syncSaveLeaveGuard依saveFailed／practiceSaveFailed／檢討pending啟閉原生提醒，paint及非同步檢討通知都同步。不要只因目前模式存好就解除其他未存內容。
- view.tile提供圖片語意；裝飾／他家暗手隱藏、暗槓四張未知，不為朗讀揭露牌種。強制色彩選取與焦點保持可分辨。

| 本機鍵 | 現行格式與限制 |
|---|---|
| tw16:TW16-CLASSIC-v1:save | Session／GameState v1；decodeSession→engine.restore，已結算不重付 |
| tw16:practice:v1 | 練習v1；重播種子／日誌核對 |
| tw16:review:v2 | 檢討v2；白名單快照、容量／版本／Web Locks |
| tw16:learn:v1 | schema1、beginner-1-3-v1，只三課；相容文件的v2是候選，現行不支援 |
| tw16:trial:v1 | 保存封套schema1含schema3報告；128KiB、Web Locks ifAvailable＋expectedRaw，只同版自動載入 |

教練偏好tw16:coach:v1為on／off／after。壞檔、未知版、讀寫失敗及跨頁衝突保留原文與本頁內容，不清空localStorage修復。trial曝光為自陳、揭示後鎖定，不證明首次；CLI讀schema1／2／3、異版人工核對，審閱輸出reportVersion2。保存原封套不是一般作答匯出，未授權任意匯入或靜默遷移。

唯一桌規為[凍結TW16-CLASSIC-v1](../taiwan-mahjong-m0/RULES.md)，144張、五組加眼睛，不混港麻／日麻。AI／教練只讀單家getObservation，不讀他家暗手、牌牆或種子；公開未知牌改善比例不是真實摸牌率，安全不等於阻止莊家自摸或流局續莊。沒有後端、帳號、多人或多桌規擴充。


## 現場與證據

隔離預覽4232（session44614）供本輪使用；4226由Playwright自行管理。原4173與日常瀏覽器profile未操作。根目錄work/home-redesign-20261018/保留前後截圖、unit.log、browser.log、home-focused.log及capture-local.log，全部合成資料；已清除誤放遊戲子目錄的暫存資料夾，沒有提交work。後續每包重新更新正式SHA、CI與本段。
