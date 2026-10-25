> L2-A已接真人動作後記錄；review:v2獨立鍵與Web Locks。修改保存前看[L2-A3驗收](docs/archive/L2A3-RECORDING-VALIDATION.md)及[L2-A2契約](docs/archive/L2A2-DECISION-SNAPSHOT.md)。

> L1-B已新增[decision-evidence契約](docs/archive/L1B-EVIDENCE-CONTRACT.md)，內部Observation封裝已驗，不是載入驗證器；改牌效／安全語義需評估analyzerVersion升版。

> 2026-10-09：產品及新訓練契約見[方向決議](docs/archive/PRODUCT-DIRECTION.md)與[L0-L1方案](docs/archive/L0-L1-PLAN.md)。以下為維護基準；新快照已接線，詳見本文件首段的L2-A契約與驗收。

# 維護指南

2026-10-22操作命名：六步彈窗稱「操作說明」，八課入口稱「新手課程」。對戰／帶原局的練習以原生「選擇玩法」連結回首頁，沿用main的beforeunload未存保護。學習的次要工具用details及既有preserveDetails保留開合；警告、重試、有效接續與舊檔救援不藏進工具。修改重繪時須保留工具焦點與錯誤自動展開，驗收見learning／play-save瀏覽器案例。

2026-10-06建立，隨後續維護更新。此文件說明實作與修改路徑；目前進度見[HANDOFF](HANDOFF.md)，現行範圍見[產品方向](docs/archive/PRODUCT-DIRECTION.md)，完整規格與歷史證據從[文件索引](DOCUMENTATION.md)查找。文中具日期的維護記錄保留當時契約，後續變更以最新對應規格為準。

## 文件各自負責什麼

README是使用與開發總入口；[DOCUMENTATION](DOCUMENTATION.md)維護全部正式Markdown的分類與用途；HANDOFF只記目前進度、風險與下一步，已完成前包的展開紀錄收進既有歷史交接；ROADMAP管理階段。RULES是凍結桌規唯一來源，cases.json是人工牌例；CONTRACTS為概念契約，實際型別以src/model.ts為準。各階段VALIDATION保留歷史證據，不能把舊測試數量當現況。新增文件時同步索引，保留歷史日期與驗證限制。

## 修改位置

名稱與返回導引：顯示名稱在view.header、三頁HTML及現行README／產品方向／企畫／發布草稿／展示生成腳本；只改固定文字，沒有新增品牌設定模組。網址、package名稱、存檔鍵與題庫版本不隨顯示名改動。歷史驗收、影片及VTT保留當時名稱，展示README註明版本。renderPractice的hasGame直接讀目前session是否存在，只決定「返回首頁／返回對戰」標籤，不改game命令、保存與暫停行為。

S1.4首頁：view.header／home及style.css首頁區段管理品牌、三路入口和有存檔時的優先續玩。淺色按鈕／焦點／保存工具限定`.home-shell`；不要改成全域顏色而影響深色牌桌、練習或body上的dialog。保留home-entry焦點、UICommand、舊存檔確認及learn／training網址；`test/e2e/home.spec.js`驗三路鍵盤、教學回焦、320px／強制色彩、續玩和取消新局。詳[首頁重設計](docs/archive/HOME-REDESIGN-20261018.md)，不用替配色新增算法測試。

S1.5試讀排版：training.render將分類／保存狀態、本題牌例／作答及本機保存分區；DOM依牌例→作答→推導→換題→本機保存／備份排列，900px以下直列。交回區已撤下。`test/e2e/trial-layout.spec.js`巡覽九題／320px，原有trial-save／training-guidance／core保護狀態契約。歷史排版見[試讀工作區](docs/archive/TRIAL-WORKSPACE-20261018.md)；調排版不能改題目／內容版本、標準答案或保存語義。

試讀保存焦點：training.restoreStorageFocus在saveLocal／clearLocal結束時，只於焦點仍body且原控制未因換題被移除才回焦，若原按鈕已停用則回管理summary。等待期間的新焦點不搶回；同步重讀仍依新題標題。trial-save.spec.js含鍵盤成功／失敗、延後鎖與清除的回歸；首頁綠底小標籤另沿既有muted色，限定驗收見[S42](docs/archive/S42-ACCESSIBILITY.md)。

S1.6前三課排版：learn.html／learning.css管理任務左欄與進度右欄，1000px以下按DOM順序直列。空的lesson-feedback仍保留status/live語意；不得以隱藏整區取代只移除空白樣式。按鈕選取的強制色彩邊線與內距補償仍須等值，回歸沿learning／accessibility，不新增保存格式或課程常數。見[學習頁排版](docs/archive/LEARNING-LAYOUT-20261018.md)。

S3.3試讀續答：src/training-draft.ts管tw16:trial:v1，封套schema1存schema3作答及題號／分類，同版自動讀取。training.ts於選項／揭示／位置變更自存，理由延後400ms；單純載入不寫。每次捕捉完整資料與位置，成功只承認該快照，忙碌期間合併最新待辦且最多一筆寫入；自存不重繪或搶焦。Web Locks ifAvailable＋expectedRaw保持，失敗取消計時器與待辦；讀取／衝突／壞檔停寫待明確復原，其他失敗可新操作或手動重試。清除／重讀確認才取消待辦；清除成功後只換位置不復活，清除等待中也只有新作答能恢復。src/trial-record.ts是無I/O共用驗證，review-trial.mjs以Node24原生型別移除讀取，不能加瀏覽器依賴或需編譯的TS語法。CLI讀schema1／2／3、reportVersion2及舊欄位保全保持；原檔封套與一般備份不同，依TRIAL-REVIEW。改動驗training-draft、training-page、trial-review及e2e/trial-save、trial-autosave；歷史[格式契約](docs/archive/S33-VALIDATION.md)，最新證據依HANDOFF。離頁防護包括全空修改及位置，保存匹配後才解除，下載本身不解除。

單題重練沿training.ts現有Draft與scheduleSave：只有已揭示題顯示retry-question，原生確認後清selected／reason／revealed，feedback／exposure及其他題原值保留，不另建嘗試或寫入路徑。取消不排程／重繪；確認重繪後聚焦first-choice而不選取。只在clearing期間禁用，普通保存忙碌仍可重練並合併最新快照；不解除saveBlocked。計數是目前保留的揭示進度，不是首次／累積成績。修改驗training-page及e2e/trial-retry，並保留trial-save／trial-autosave的失敗與舊檔保護。

S3.2：hand-review.ts從原決策快照算證據，claimResolution另對同局公開打牌／牌組／結算核對仲裁，不把after資料混進evidence。main只暫存待解釋快照，RESOLVE後暫停／開視窗，失敗不撤銷已生效動作；重載不續存待解釋，但本局局後檢討仍可用原快照與當前公開結果。hand-review-view.ts的claim視窗及靜態練習能力表，連到training.ts白名單skill參數並另開頁。存檔版本不變；改這些流程驗controller、review-claims與e2e/review-followup；[完整契約／限制](docs/archive/S32-VALIDATION.md)。

S3.1九題試讀：兩份TRAINING JSON負責題幹／答案／牌面／範圍；scripts/training-content.mjs負責四能力導引、固定九題允許名單與完整內容雜湊，生成器及review-trial同讀。不要直接改生成的training-data.ts。畫面分類只改瀏覽順序，drafts仍按原題位置保留，匯出必含所有題；舊schema2版本不符轉人工，schema1保留缺完整版本警告。新增分類回歸在test/e2e/training-guidance.spec.js，詳見[S3.1](docs/archive/S31-VALIDATION.md)。修改題量先處理允許名單／題族與舊匯出相容，不另外散落九題常數；人類資料和合成檔分開，接收見[審閱流程](docs/archive/TRIAL-REVIEW.md)。

S2新手課：learn.html／src/learning.ts與learning.css為獨立頁；learning-model.ts管八課文字及前三課操作，learning-fixtures.ts為4–6課教材，learning-progress.ts管v2完成旗標及唯讀v1明確帶入。第7–8課依下段專用模組，內容與保存契約見[BEGINNER-LEARNING](docs/archive/BEGINNER-LEARNING.md)，最新驗收／發布只查HANDOFF。改完成條件先定版本與對照，不能因擴課判舊紀錄壞。三頁HTML全部preload／JS／CSS均須驗，不假定固定資源數。

玩家回饋收集已依2026-10-22指示撤下：learn.html／learning.ts不再有回饋表單、TXT、report草稿或其離頁判斷；lesson-feedback仍是答題狀態，不可一起刪。training.ts不再呈現意見／曝光自陳控制、意見TXT與交回邀請；舊Draft／TrialRecord中的feedback及exposure仍須讀寫原值以保護舊檔，不升版、不清除。JSON僅置於本機工具作個人備份／原檔復原；下載不解除未存或跨頁保護。test/e2e/learning-feedback.spec.js改驗撤下入口及課程保護，training-page／training-guidance／trial-save保護舊欄位、完整備份與錯誤回退；[試用紀錄](docs/archive/BEGINNER-TRIAL.md)只留歷史維護參考。

S2.3教材：[S23教材](docs/archive/S23-LESSON-PREPARATION.md)供4–6課文字、示範、換例與回饋；learning-fixtures.ts只配置固定教學局面，所有動作仍交凍結引擎並assertState。test/learning-next.test.mjs保留26具名牌例，另比對runtime示例及實際操作。結算只讀settlement.score／delta與scoreLines，不重付；下一局莊位應以本局門風標示原座位，避免用下一局門風把接莊者一律寫成東門。禁打給原因，打牌手勢須與摸打課及正常對戰一致。

S2保存：[相容規格](docs/archive/S23-PROGRESS-COMPATIBILITY.md)保留S2.3當時六課的C01–C12驗收；現行v2仍八筆／4KiB、beginner-1-8-v1，S2.4開放7–8，前六課原值保持。有效v2不依賴v1；未知原文保留，缺v2才預覽舊版。帶入以v1→v2固定鎖順序、鎖內原文／不存在核對，只寫一次v2；缺鎖不降級，失敗保留本頁。只重建v2須確認及核對原文，不能順便刪續學點或其他存檔。不建立通用遷移器或同步／備份鍵。

課程導覽：learning.render的go(i)遇到目前index直接返回，不確認、不重繪、不清除任務或寫入；aria-current課程仍可鍵盤聚焦。只有選不同課才走切課與未存段落確認，重開示範／換例、下一課與讀取續學仍用各自原入口。learning.spec及learning-round.spec保護第2課摸花後操作、第7課已存／未存段落及不同課取消／確認；不新增第1–6課中途保存，也不改完成判定。

回看圖解：第1–6課的「回看本課圖解」只開原生recap、標記assisted並聚焦summary，不render、不清步驟／牌組／待確認選牌；收合後就在原任務續做。「重新開始／換例」確認後才回read並沿原start重開，取消不改任務或DOM。第7–8課回整頁圖解先assist(session)，一律同步離頁保護及續學面板，由roundDirty比較原存檔；不冒認已存或自動寫入，原已受助且存檔相符者仍為已存。回看後的完成沿既有受助公式判定，未新增持久格式。主要回歸為learning-recap.spec，learning-next原中途換例案例改用明確重開入口。

S2.4：[整局教材與契約](docs/archive/S24-LESSON-PREPARATION.md)的src/learning-round.ts從完整144張經DEAL重播；test/learning-round-core.test.mjs逐點對照，原test/learning-round.test.mjs為獨立參考。src/learning-round-view.ts管7–8課分段任務／台項收付／實桌附錄，僅用getObservation(state,0)呈現。合法偏離只在本頁保留執行後的公開Observation，禁止保存，明確重試才回原檢查點；選過是合法停止點，均不等於完成。實際答完結算與莊位檢核才標完成，不看輸贏。

src/learning-round-store.ts只有嚴格codec及可注入Storage／Locks的CAS保存／刪除，鍵tw16:learn:round:v1，四欄封套2048 bytes；內嵌512字元內的core正規原文，scriptVersion同時綁牌堆及引擎語義。learning.ts負責已讀原文、錯誤／衝突、兩區狀態與離頁保護。syncSavePanels在各類保存結束依當下busy重算兩區及按鈕；不可只恢復舊DOM參照，否則並行的v2／round保存會把新按鈕卡在disabled。freezeControls以原生inert保護課程（含summary），保留外部status可讀並復原原狀。Web Locks缺失不降級，其他頁storage及真實BFCache返回都比對原文；不要自動重載丟掉本頁。錯誤、未知原文可複製／下載，刪除需確認及鎖內CAS，只動round鍵，不動Session／其他模式。test/learning-round-store.test.mjs與test/e2e/learning-round.spec.js為主要回歸，真實BFCache必須persisted＋同文件marker，不能因未還原改成skip。

S4.2牌面語意／選取：[限定驗收](docs/archive/S42-ACCESSIBILITY.md)。共用view.tile以role=img呈現名稱，裝飾牌及他家暗手維持隱藏；不能為可及性把暗槓未知牌種填回DOM。learning.css在forced-colors用雙線框，保持內距／邊框總尺寸及獨立焦點；對應test/e2e/accessibility.spec.js，含light／dark、暗槓遮罩與未推進牌局。

S4.2重讀保留：learning.loadProgress先驗候選原文才替換記憶體，讀取錯誤／壞檔／未知版保留progress及dirty離頁提醒並blocked；不在重讀按鈕先清空。learning.spec.js核對三種故障、取消離頁與修復後重讀；詳同一份S42限定驗收，沒有改三課格式或把未知檔套為有效進度。

S4.2遊玩離頁：main.syncSaveLeaveGuard以saveFailed／practiceSaveFailed／reviews.status().pending啟閉原生beforeunload，paint及檢討非同步通知都須同步。不能只在目前模式保存成功就解除其他類未存內容，也不在離頁中改寫資料。play-save.spec.js驗三類失敗、真實取消重載、明確重試／解除與各鍵隔離；限制與重現見[S42](docs/archive/S42-ACCESSIBILITY.md)。

S1.3：結算固定底部用scroll-padding保護焦點，新增控制時先重新驗高度；結算回歸含320px命中檢查。該包四條共八項，最新範圍以README及當輪驗收為準；可選已安裝Chrome／Edge。`npm run benchmark:browser -- chrome`／msedge只作同場景量測，方法與支援界線見[S13](docs/archive/S13-VALIDATION.md)。不為較慢單筆直接引入worker／全域快取。

S1.2b：`test/e2e/core.spec.js`與`playwright.config.js`管理真實瀏覽器核心路徑，後續另擴練習、教學與分類。改出牌解釋、結算／續局或試讀匯出／離頁時，用`npm run test:browser`核對正式建置；首次安裝Chromium，最初步驟／隔離／未涵蓋範圍見[S12B](docs/archive/S12B-VALIDATION.md)，最新範圍見README。CI在既有build內執行，不改Pages權限；失敗證據保留七天。新合法動作／故障仍依原規則與控制器測試，不將端到端檢查當完整覆蓋。

| 需求 | 先看位置 | 必要驗證 |
|---|---|---|
| 出牌、吃碰槓胡、過水、連莊、回合推進 | src/engine.ts、model.ts、validation.ts；先對照RULES | engine、chi、claims-integrity、validation相關案例；必要時補人工規則案例 |
| 五面子一對、聽口、拆法 | src/hand.ts | engine／scoring相關案例；第五張容量與副露邊界 |
| 計台、互斥、付款 | src/scoring.ts、validation.ts | scoring、settlement-integrity；來源付款人、金額、末局連莊相容性與結算續局 |
| 電腦選牌 | src/ai.ts、analysis.ts、session.ts | ai、session；資訊遮罩及正常完整牌局 |
| 點擊、鍵盤、吃牌選項、結算彈窗 | src/view.ts、main.ts | controller、chi；瀏覽器受影響流程及焦點 |
| 牌面、牌河、手機排版 | src/tile-face.ts、style.css、view.ts | 桌面／320及390寬畫面、長牌河；不替純配色寫單元測試 |
| 暫停、速度、自動回合、跨分頁 | src/main.ts、session.ts | controller、session、resume；舊計時器與版本拒絕 |
| 儲存、讀檔、格式變更 | main.ts、session.ts、engine.ts、validation.ts | 壞檔、未知版、保存失敗、重載、不可重付結算 |
| 建置與發布路徑 | package.json、vite.config.js、index.html | build及正式子路徑資源；M4正式網址驗收 |
| 新手教學文字、示範、視窗 | src/tutorial-view.ts、view.ts、practice-view.ts、main.ts、style.css | controller：存檔／跨頁／暫停；瀏覽器單擊、雙擊、鍵盤、關閉與320／390 |
| 共用牌效分析 | src/analysis.ts、hand.ts；TRAINING-DESIGN.md | analysis：容量、獨立枚舉、比例、合法吃碰及資訊公平 |
| 純練習流程與預覽 | src/practice.ts、practice-view.ts、main.ts | practice、controller；不放回牌池、重播、模式切換與焦點 |
| 對戰新手教練 | src/coach.ts、view.ts、main.ts | coach、controller；遮罩資訊、合法決策、偏好保存及預覽同步 |
| 正向回饋、進步里程碑與得分／牌型卡 | src/feedback.ts、main.ts、view.ts、practice-view.ts、style.css | feedback、controller、score-display；仲裁成立、耗盡等待、錯過WIN、分析失敗保存、計台替代及窄畫面；見POSITIVE-FEEDBACK-VALIDATION |

## 資料流與責任

view送UICommand → main核對畫面代次及當前狀態 → session.advance → engine.applyAction核對opId、matchId、handId、version、actor與合法動作 → 新Session → 保存及畫面更新。

main只安排一個自動計時器；暫停／重繪會使舊代次失效。session.automaticAction先處理引擎流程，再選電腦操作；真人有合法回應時等待真人。AI只收該座位getObservation及其合法候選，亂數只於成功轉移後提交。

getObservation遮蔽其他玩家暗手、暗槓牌種、牌牆順序、洗牌種子與未揭露回應；不得把完整GameState交給策略或教練。合法動作由引擎決定，畫面、AI或提示不得另開放操作。手牌結構可聽不代表目前合法可胡。

牌種如1m，實體ID如1m#0；需要牌權、公開張數與去重時使用實體ID。E＝暗手張數＋3×副露面子數，台灣胡牌形為E17五面子一對；槓的結構算3張，實體仍有4張。

計台evaluateHand的暗手參數須符合等效E17；外來胡牌只加入一次。decomposition.groups含既有副露且共5組；score.tai不含按付款對象而異的莊連台，最終分數變動見settlement.delta。handResult已付款，下一局只能在真人選擇後送NEXT_HAND，不在重載或重開結算時付款。

## 共用牌效分析（M5.1）

`src/risk-evidence.ts`在自家Observation合法DISCARD上提供對手別安全證據與零台放槍付款底線，沿用safety/publicPool/settlePayments；不直接選牌或回報機率。驗證用risk-evidence.test.mjs與scripts/research-risk.mjs，結果與限制見[RISK-EVIDENCE-VALIDATION](docs/archive/RISK-EVIDENCE-VALIDATION.md)。

公開容量證明：`src/safety.ts`只回傳本次普通放槍的充分安全證明與尚未排除的局部成形路徑，輸入為自家publicPool與持有牌種。B1僅在ai.ts原牌效／加分完全並列且全為捨牌時，以此證明選安全子集；無證明保留原順序與亂數。不能將possibleUses數量當放槍率，也不排除自摸／花胡或保證阻莊。驗證用`test/safety.test.mjs`及`test/ai.test.mjs`，本機／正式狀態依[驗收文件§9](docs/archive/AI-CLAIM-TUNING-20261020.md)與HANDOFF。保留安全張的牌效案例仍用`node scripts/research-reserve.mjs`，先check；相對風險、攻守、人格及新保存策略需另行驗收，未接正式AI。

src/analysis.ts是AI、練習與教練的共用來源；不要解析AI的reason字串。createAnalyzer接牌池，analyze接自家暗手牌種與完整副露；只分析等效E16／E17。E17捨牌比較先走discards，傳入實際合法牌種；analyzeObservation只接引擎產生的單一玩家觀察，吃碰採該觀察合法候選及engine共用discardBan。

距離是到容量合法的五面子一對目標所缺張數減1。容量扣除副露實體張數，槓扣4；完成=-1、聽牌=0。示例拆法是通往某個最近目標的一種不重疊分配，不是唯一拆法，也不保證顯示最多搭子。effectiveTiles保留結構有效但剩餘0張的牌種，以便介面區分距離與實際可用性。

exactPool只接剩餘一般牌的唯一實體ID；publicPool扣自家牌、公開河牌／副露與搶槓亮牌，以ID去重，不猜對手暗槓。機率為有效張數／牌池總數，空池為null；公開未知牌含對手暗手與牌尾，不能稱真實牌牆機率。牌池不可與自家牌重疊。

每次決策建立一個analyzer，內部快取共用於各候選；不跨牌局永久保留。介面只在真人可決策時分析，重繪可沿觀察版本重用結果；AI關閉示例生成。M5.2由practice.ts、practice-view.ts與main.ts整合，M5.3由coach.ts、view.ts與main.ts整合。型別以analysis.ts為準，驗證見M5.1-VALIDATION。

## 存檔與相容性

2026-10-07維護：main.ts以saveFailed／practiceSaveFailed記最近一次保存失敗，透過canRetrySave顯示「重試儲存」。retry-save只保存目前模式並paint，不advance或refresh；保留選牌、暫停、速度及既有timer。成功清除提示；失敗仍保留進度。failed／practiceBlocked時禁止重試，不能覆蓋他頁。結算modal內也要有按鈕，成功移除後回焦點入口。見[AUDIT-2026-10-07](docs/archive/AUDIT-2026-10-07.md)。

本機鍵：`tw16:TW16-CLASSIC-v1:save`，位於main.ts。Session schemaVersion=1，內容為GameState與3位AI的亂數；GameState另有schemaVersion=1及rulesVersion。UI選牌、暫停與速度不是持久牌局格式。

讀取必須走session.decodeSession → engine.restore。只JSON.parse或直接呼叫validation.restore不足以取代引擎還原；engine還會重算待回應候選。寫入前encodeSession驗證資料；壞檔及未知版本保留，開始新一將前確認覆寫。保存失敗保留上一份可用存檔並提醒保持頁面；跨分頁競爭停止操作，要求重載。

修改格式前先決定遷移／拒絕策略，補舊版、未知版與壞檔案例，不能以清空localStorage當修復。練習另用版本化鍵，不覆寫對戰；詳細設計見TRAINING-DESIGN。Pages網址與本機來源不同，現有續局不包含跨來源匯入功能。

## 驗證工具

下列命令在遊戲資料夾執行，package.json是可執行命令的依據。

| 命令 | 作用與限制 |
|---|---|
| npm ci | 依lockfile安裝開發依賴；已有可用安裝時不必每次重裝 |
| npm run check | TypeScript檢查並產生dist/，不是僅無輸出檢查 |
| npm run check:docs | Git checkout內檢查追蹤文件的本機行內連結／圖片、大小寫及目標是否追蹤，CI同樣執行 |
| npm test | check後跑test/*.test.mjs；涵蓋規則、存檔、AI及控制器 |
| npm run build | check後由Vite產生site/；base目前為./ |
| npm run dev -- --port 4183 | 獨立開發／fixture來源，避免覆寫實際遊玩的4173存檔 |
| npm run preview -- --port 4173 | 預覽已建置site/，修改後須重新build |
| npm run verify:release -- https://zhai2liu.github.io/taiwan-mahjong/ | 指定提交部署成功後，比對本機site與正式三頁HTML／引用資源，非零退出表示尚未核對通過 |
| npm run test:history -- chrome | 建置後以已安裝Chrome驗四模式真正快取返回／跨頁更新，另可指定msedge；自開關隔離4231，不計入一般CI回歸 |
| npm run simulate -- --hands 1000 --matches 3 --seed 20261004 | M1測試策略長模擬，輸出SIMULATION.json；不是正式AI策略驗收 |
| node scripts/verify-m3.mjs M5.1-SIMULATION.json | 正式策略3完整將驗證，需先check；指定輸出檔名以保留歷史；省略時更新M3-SIMULATION.json，非每次修改必跑 |

Playwright預設使用lockfile對應Chromium；TW16_BROWSER_CHANNEL可選已安裝channel，TW16_BROWSER_PATH可明確指定執行檔（設定時以此路徑為準）。覆寫結果需記瀏覽器來源，不保證版本相容；CI維持不設覆寫。以退出碼及實際通過數驗收，啟動失敗不得算通過。npm run stats:ai為正式AI四家合成對局統計，calls是仲裁成立、proposals是提案；全桌胡法組成不是單一策略捨牌放槍率，詳[吃碰門檻驗收](docs/archive/AI-CLAIM-TUNING-20261020.md)。

test/browser.html與test/runner.html為開發來源工具；browser-fixtures、chi-fixtures、layout-fixtures提供續局、吃法、長牌河與結算場景。使用前先看對應test及scripts，不把測試頁上線；fixture會寫測試來源存檔，測試完成後關閉該來源頁面／伺服器。

純文件修改跑`npm run check:docs`，再人工核對命令與現況一致性。檢查器只用Node標準函式庫，從script位置找Git根目錄，涵蓋根README／AGENTS及遊戲、M0、showcase內追蹤的md；略過圍欄程式碼、外部網址及頁內錨點。檢查本機行內／圖片連結的檔案或追蹤目錄，不驗外部網站、標題錨點、參照式或巢狀連結。新增檔先加入Git索引；只存在本機／被忽略的目標也會失敗，避免發布後才斷鏈。與型別／build分開，讓不含.git的原始碼仍可建置；不為此新增Markdown依賴。

發布工具回歸在`test/release-check.test.mjs`，隨`npm test`執行；可單跑`node --test test/release-check.test.mjs`。複製真實CLI到work/內獨立生成目錄、以合成三頁／資源及本機HTTP驗子路徑、共用資源只取一次、內容不同／非200／轉址與錯誤參數；不依賴先有site或外網。清理前核對生成目錄仍在work/，子程序有逾時，原遊戲／正式網址／玩家資料不會被測試改寫。

`scripts/browser-history.mjs`重用既有fixture與保存編碼，在具名Chrome／Edge核對BFCache返回；需實際persisted=true，未進快取即非零退出。其他分頁更新後，舊對戰／練習停止操作，課程／試讀可明確重讀，四類鍵逐一比對。詳[S42](docs/archive/S42-ACCESSIBILITY.md)。預設headless shell的結果不能代替此項；不為此自動安裝或替換日常瀏覽器，CI仍沿原設定。

行為修改跑受影響測試，跨模組或正式交付再跑全套及build；只有AI／回合／續局改動需要相應完整牌局驗證，不反覆長模擬消耗額度。測試失敗先保存重現資料；simulate會把seed、狀態與動作記至工作區work/taiwan-mahjong/。

## 提交工作包與發布

每個工作包完成後更新受影響說明、測試證據及HANDOFF；已知限制以ponytail註解寫清上限與升級條件。優先平台與現有依賴，不新增通用玩法框架。開發由6.1 Sol主導，需要時Luna協助限定任務；遊戲內AI不呼叫模型。

main推送後由GitHub Actions發布，正式網址與回復步驟見DEPLOYMENT；確認該次workflow成功。site/是發布產物，src/才是修改來源；不要直接編輯site/或dist/。

S1.2a：所有指向main的PR（含純文件）共用build檢查，npm test已涵蓋TypeScript，不另加重複型別job。PR不上傳Pages artifact、不執行deploy；只有非PR的main能發布。PR按編號分組，main按ref序列。當輪雲端驗收見[S12A](docs/archive/S12A-VALIDATION.md)；未設定分支保護，不把CI存在等同強制合併門檻。M0 cases.json被scoring測試匯入，與RULES.md一起加入main的觸發覆蓋。


## 純練習模式（M5.2）

src/practice.ts維護136張一般牌、種子、手牌、池、棄牌、摸入牌及階段。初始16加摸入1張；discardPractice將17變16且棄牌不回池；drawPractice只在draw階段取池首。牌池耗盡或五面子一對完成即結束。

存檔鍵tw16:practice:v1、schemaVersion=1，與對戰分開。restorePractice重播種子與捨牌日誌，核對完整狀態，拒絕篡改、重複ID、非法牌權／階段及未知版本；不能只JSON.parse。若改洗牌／重播演算法須先決定存檔遷移策略。

src/practice-view.ts沿用view.ts牌面、牌名及原生button／details；單擊／Tab局部預覽，450ms內雙擊、Enter／空白鍵出牌。main.ts處理模式、儲存及跨分頁：切入先保存並暫停對戰，返回後手動繼續；保存失敗保留舊檔與記憶體並阻止離開；他頁修改後停止練習。

practice.test.mjs驗證整題完成及耗盡、重播、牌權、比例與存檔邊界；controller.test.mjs驗證模式切換、壞檔取消、保存失敗與跨分頁。test/practice-browser.html以可見核取方塊替代confirm，用於獨立來源的瀏覽器驗收，不納入正式建置；正式程式仍使用原生confirm。

### M5.2易用性補充

practice-view.ts採practice-workspace主區／側欄，手機單欄。stats分距離聽牌及下一張改善機率，有效牌單列overflow-x:auto且tabIndex=0；候選button只局部select，不能送practice-discard。候選點擊清除lastTap，避免跨控制項雙擊；選牌保留已展開拆法。捨牌後聚焦practice-draw，摸牌後聚焦practice-status，不自動選牌。style.css僅最後practice區段控制此版面，詳見M5.2-UX-VALIDATION。

## 對戰教練（M5.3）

src/coach.ts只接getObservation遮罩資訊；awaitDiscard／awaitClaims／awaitRobKong且完整E16／E17真人有合法回應時，才呼叫共用analyzeObservation。view.ts再排除忙碌、暫停與已關閉提示；不讀Session、暗牌、牌牆或AI reason，也不另算向聽。

view.ts的coachPanel使用原生details，body最大24dvh／220px局部捲動；吃碰比較排在有效牌列表之前，合法胡牌先提醒。單擊及鍵盤focus只更新預覽，保留手牌DOM以支援450ms雙擊；只有原有合法操作送intent。E17以合法捨牌後E16比較，不把E17有效進張0當摸牌比例；距成胡至少S+1次改善不是回合數。拆法是最近目標分配示例，非最多搭子；零剩餘張數保留提醒。

main.ts的教練設定使用獨立鍵tw16:coach:v1，on／off、預設開啟，未知值用預設；保存失敗仍在記憶體套用並顯示提醒。不改對戰或練習schemaVersion=1。設定只在重新載入讀取，不另做跨分頁偏好同步；牌局原有跨分頁保護不變。

公開比例為K／N：N含其他玩家暗手與牌尾，不是可摸牌牆。吃碰只比較向聽、有效張數並提示失去門清，沒有台數、防守及槓風險評分。若擴充需先定義資訊邊界與測試，不能把純牌效說成總體最佳策略。

coach.test.mjs驗決策邊界、兩吃法、碰牌、過水及輸入不變；controller.test.mjs驗獨立設定、重載、寫入故障與不更動牌局。瀏覽器證據見M5.3-VALIDATION。局部文字／配色修改做相關畫面驗收即可，不重跑長模擬。

2026-10-06選牌流程修正：handAndActions的focus／單擊共用select，同步視覺／aria-pressed／main選牌及coach.select；焦點切換清除lastTap。coach.select同步收合摘要，胡牌摘要優先；禁捨及胡牌提醒先於教練。仍不重畫整副手牌或保存選牌，沒有新增設定。驗收見COACH-FLOW-VALIDATION。

2026-10-06面板狀態維護：view.ts的detailStates以WeakMap按root記data-persist的boolean。render捕捉目前面板、toggle記使用者選擇；僅root內元素可寫狀態。面板暫時消失（忙碌、暫停、關提示或模式切換）時保留，重現時恢復。只記本次頁面，重載預設收合，不改任何存檔鍵。驗收見PANEL-STATE-VALIDATION。

## 維護補充：鍵盤與結算核對

手牌標題以 data-focus=hand-heading 作程式化焦點入口，不加入一般 Tab 順序。重繪先還原同一可操作控制項，練習排除收合details中的隱藏按鈕；開題回步驟提示、續局／下一局回手牌入口；手牌／回應按鈕消失或禁用才退回入口，aria-describedby 連結當前操作提示。焦點及單擊僅選牌，不可繞過合法動作；練習手牌焦點變更清除 lastTap，避免跨控制項誤判雙擊。模式切換聚焦新模式的非操作入口：練習介紹、對戰手牌標題或首頁標題；不能自動開題或出牌，返回對戰仍暫停。view.preserveDetails供對戰及練習共用：details 的 data-persist只保存同頁各面板開／關狀態，模式暫時移除仍保留；舊面板事件不得覆蓋現行狀態。

一般自摸／放槍／搶槓存檔必有五面子一對拆法，並與實際牌核對；花牌特殊胡不強求一般胡形。validation.ts 在既有牌權、來源及零和核對之上，以 settlePayments 重新核對完整差額。RON／搶槓付款人為保留的 turn；七花為持有另一花的玩家；自摸／八花為其餘三人。RON核對來源最後被胡捨牌，搶槓核對來源同種碰牌。壞檔仍保留並拒絕載入，不能清除資料當修復。

view.tableDealer僅於matchResult顯示末局莊家及風位，與保留的末局結算對齊，不改GameState。schemaVersion=1 終將已移莊並歸零連莊，沒有保存上一局付款上下文。因此舊莊由 currentDealer-1 還原；若舊莊付款，只能從其金額推回合法奇數加台並核對其他付款。這維持正常舊檔相容性，不能驗證被一併改動的歷史連莊、台項或完整累計分數；若需可信歷史，另設版本化上下文／可驗證事件紀錄。最新證據見 MAINTENANCE-2026-10-06.md，歷史報告不作現況入口。

## 新手操作教學

src/tutorial-view.ts只接root，不接Session、getObservation、localStorage或遊戲命令；17張與吃法示範為私有資料，只改自己的dialog。main收到tutorial，先保存當前模式，成功才暫停並作廢舊timer/UI；寫入失敗不開教學，跨頁已阻擋者可看但不可覆寫新存檔。關閉移除視窗並聚焦現行教學入口，對戰仍暫停。無新存檔版本／鍵。

教學用原生dialog，固定高度、內容區捲動、底部操作列保留；不要讓選牌提示改變dialog位置而破壞雙擊。示範單擊／focus僅選牌，450ms同張雙擊或Enter／空白鍵只出1張。文字依RULES校正，不在教學重寫計台或完整引擎；示範吃法為134遇2的13／34，禁捨分別2與2／5。擴充教學若要用實際行牌，另定引擎隔離及存檔驗證，不混用正式Session。

教學資料保護回歸在controller.test：對戰與練習保存失敗均不得開窗或丟進度；讀取壞檔／跨頁已阻擋時只准看教學，不寫回原存檔。讀取／保存失敗與跨頁競爭不是同一情況，不要以統一「可看教學」流程省略保存保護。示範互動和窄視窗則以瀏覽器驗收，不為固定文案加字串鏡像測試。

離線偏好比較：src/strategy-comparison.ts、test/strategy-comparison.test.mjs。共用scripts/research-risk.mjs生成RISK-EXAMPLES.json；限制與下一步見DEALER-STRATEGY-VALIDATION.md。未接正式入口，不要把偏好分數當危險機率。

L2-B1：src/hand-review.ts只讀已驗證封套，挑最近三筆可比較決策並合併相同牌種實體候選。已發布的局後畫面守已結算本局入口，不把此函式直接當存檔驗證器；見L2B1-HAND-REVIEW.md。


2026-10-13：對戰提示已分 on/off/after，偏好鍵不變。事後捨牌解釋只在成功提交後建立暫存快照並暫停；共用 hand-review.ts 的 buildDecisionReview 與 hand-review-view.ts decision 畫面。不可把此入口改為出牌前預覽；不得因分析失敗重新執行 advance。詳細範圍、保存失敗及驗收見 [AFTER-DISCARD-VALIDATION](docs/archive/AFTER-DISCARD-VALIDATION.md)。

2026-10-13：玩家用詞依 [LOCAL-TERMS](docs/archive/LOCAL-TERMS.md)，白話聽牌距離由 src/terms.ts 共用；內部牌種/API不改名。題庫生成器加完整九題 contentRevision，試讀匯出 schema 2，本機 review-trial 仍讀 schema 1；改題或牌面會改版本，舊資料不靜默重評。

2026-10-13 S1.1：src/training.ts 在有頁內內容時註冊 beforeunload、清空未提交內容時解除；返回牌室原生 dialog 的確認按鈕才解除並導航，取消／Escape回焦點且不改草稿。pageshow 先重判防護，再於表單還原後依自有草稿重繪；不得把瀏覽器單獨還原的欄位猜成題目作答，也不把快取當持久保存。作答／回饋各存頁內最近下載快照，修改提示不重繪題目；下載失敗不更新快照，發起下載不代表落盤，不解除防護。無新的存檔鍵或匯出格式，測試在 training-page.test.mjs，證據見 [S0.1–S1.1](docs/archive/S01-S11-VALIDATION.md)。完整課程仍在S2；產品／排程改動先同步 PRODUCT-DIRECTION、ROADMAP 及根目錄作品 README。
