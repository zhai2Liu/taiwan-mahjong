# 現行交接入口

更新：2026-10-18（Asia/Taipei）。先讀本檔與[ROADMAP](ROADMAP.md)；產品範圍依[PRODUCT-DIRECTION](PRODUCT-DIRECTION.md)及[MASTER企畫](MASTER-IMPROVEMENT-PLAN.md)。完整發布／途中紀錄已保留在[歷史交接](HANDOFF-HISTORY-20261017.md)，歷史「下一步」不覆蓋本檔。

## 本輪狀態與接手順序

使用者要求投入本次五小時帳戶額度持續推進。本輪九包已完成提交／合併與相應核對，最後只做交接與遠端檔案校對，不再啟新功能。收尾途中最後讀值95%已用，窗口resetsAt約1792266558（工具有1秒浮動）；最末工具讀值另記work/final-account-usage.json。它是共享帳戶用量，不是精確對話剩餘token。未使用重設額度、子代理或新增排程／自動續跑。

下一個正式課程功能包為S2.3互動整合，先依S2.2前三課真人試用／修訂，凍結內容與進度帶入對照。目前真人0；不能以本輪程式／模型檢查代填理解或成效。新重現的操作／資料保護／維護缺口仍可獨立修；本輪沒有留下已確認未修的阻斷缺陷，不代表全專案或全裝置已驗完。S6人格AI仍須另外啟動。

## 本輪完成的九包

| 工作 | 結果與合併 |
|---|---|
| S2.4準備 | [第7–8課固定整局與實桌附錄](S24-LESSON-PREPARATION.md)、8個真實DEAL引擎分支；[PR#13](https://github.com/zhai2Liu/taiwan-mahjong/pull/13)／36aa912。未接互動頁／中途保存 |
| S4.2牌面／選取 | [牌面圖片語意、暗槓遮罩及強制色彩雙線](S42-ACCESSIBILITY.md)；[PR#14](https://github.com/zhai2Liu/taiwan-mahjong/pull/14)／1f91996 |
| S4.2重讀保留 | 新手讀取錯誤、壞檔、未知版保留本頁完成與離頁提醒，成功重讀才替換；[PR#15](https://github.com/zhai2Liu/taiwan-mahjong/pull/15)／f994fa2 |
| 文件維護 | `check:docs`檢查追蹤md的本機行內／圖片路徑、大小寫與追蹤狀態，接既有CI；[PR#16](https://github.com/zhai2Liu/taiwan-mahjong/pull/16)／8ec8b9b |
| 遊玩離頁保護 | 對戰／練習保存失敗或檢討待存時原生警告，成功存妥才解除；[PR#17](https://github.com/zhai2Liu/taiwan-mahjong/pull/17)／65dc22f |
| 發布核對 | `verify:release`比對三頁HTML與引用JS／CSS；限定入口HTML為LF並涵蓋發布觸發；[PR#18](https://github.com/zhai2Liu/taiwan-mahjong/pull/18)／3b3f4da |
| 發布工具回歸 | 真CLI、隔離合成目錄／HTTP、內容不同／非200／轉址／參數反例；[PR#19](https://github.com/zhai2Liu/taiwan-mahjong/pull/19)／5fc7d79 |
| 真快取返回 | `test:history`具名Chrome／Edge四模式BFCache／跨頁衝突、明確重讀與其他鍵保留；[PR#20](https://github.com/zhai2Liu/taiwan-mahjong/pull/20)／8e43f87 |
| S2.3相容準備 | [新八課另鍵、舊原文不動、帶入／回復及C01–C12](S23-PROGRESS-COMPATIBILITY.md)；[PR#21](https://github.com/zhai2Liu/taiwan-mahjong/pull/21)／e28e1b8。僅設計，未實裝v2或放行擴課 |

每包完整來源SHA、CI／部署ID與logs在歷史交接。九個PR均已附本chat；PR的Pages上傳／deploy跳過，沒有外部真人程式審查或分支保護變更。

## 最新驗證與正式版本

- 最新設計來源814843d30882085e12b1e0f4be72574554664c6c，PR#21指定head Actions39048995547成功：400 Node／型別／build、44瀏覽器回歸（38.3秒）。84份文件／542個本機連結0問題；六個公開文件與e28e1b8 git blob相符。
- 最近功能／工具發布來源2689f17，合併8e43f87f85a23c197af71f5fbf4dfe27f8559cc1；PR39048408460成功400／44（44.4秒），main39048560730成功400／44（46.1秒）、build117442170407／deploy117442552232成功。H包純MD主線未觸發新部署。
- 正式[青竹牌室](https://zhai2liu.github.io/taiwan-mahjong/)三頁HTTP200，HTML及全部4／3／4份JS／CSS與本機site相符；功能資源仍65dc22f。index-Cb42fmnp.js、learn-By-3MGNT.js、view-BptEx-mj.js。origin為https://github.com/zhai2Liu/taiwan-mahjong.git。
- 本機及正式網址的隔離Chrome155.0.8059.80／Edge155.0.4283.62，各四模式真BFCache通過、0pageerror，其他鍵原文保持；不計入一般CI的44項。關閉cache負例明確非零退出。一般headless shell未進快取，不能冒充快取驗收。
- 遊玩離頁三類保存失敗已實際取消原生重載、重試、正常重載，Chrome／Edge各六項通過；新手重讀三種失敗、牌面遮罩與forced-colors亦已驗。全為合成資料，手機／Safari／真人輔具與學習成效仍未驗。

npm audit同日0已知漏洞，原始檔work/dependencies-audit-20261017.json；不代表未來或完整安全保證。最後交接文件另跑`check:docs`：84份文件／560個本機連結0問題，見work/final-doc-links.log。

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

本輪隔離4226、4230（session80087）及4231已關閉，headless contexts均關閉；未干預原4173或日常profile。work/全部忽略，只含合成logs、失敗前trace、測試生成物／影片及指定版本建置；未提交真人資料、依賴或新自動續跑。

本輪logs前綴：s24-*、s42-*（牌面及重讀）、doc-links-*、play-leave-*、release-check-*、release-regression-*、browser-history-*、learning-compat-*。正式快取額外核對為browser-history-live-chrome.log／msedge.log；完整每包檔名及Actions ID見歷史交接。最終提交／遠端及三份交接文件公開雜湊由work/final-handoff-check.mjs核對並寫final-handoff-check.log；以實際成功結果為證，不以本檔自述代替。
