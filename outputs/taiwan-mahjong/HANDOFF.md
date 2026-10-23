# 現行交接入口

更新：2026-10-23（Asia/Taipei）。方向依[PRODUCT-DIRECTION](PRODUCT-DIRECTION.md)，排程依[ROADMAP](ROADMAP.md)，修改位置依[MAINTENANCE](MAINTENANCE.md)。本輪以前及展開的CI證據保留[歷史交接](HANDOFF-HISTORY-20261017.md)；不要沿歷史「下一步」自動開工。

以下「前包」段落保留當時的發布與待辦快照；其中六課、尚未整合或下一包等描述不代表現況。當前開放八課，交付狀態以本輪及「進度與不能代理的門檻」表為準。

## 本輪：決策題單題重練

2026-10-23依使用者續作指示，基準af2839b、分支codex/trial-retry-20261023。沿claude-rd分工，真實Claude Code會話4f16754b-c74c-4f3e-8107-4bea0e803696實作／自測447項Node、build及144項瀏覽器一次通過（4.4分、0skip）。探索命令與帶參數測試命令曾遭拒，必要完整檢查已用原允許命令完成，未擴大權限或更改既有claude.ai Pro計費。

看過解答後可「重練本題」：確認後只清本題選項／理由／揭示，保留其他題、分類及舊欄位，聚焦第一個選項；取消不重繪或寫入。沿既有自存合併快照與停寫／離頁保護，清除執行中暫停重練。僅保留目前作答，提示同題複習、目前揭示進度，不宣稱首次測驗或學習成效。GPT 6.1 Sol／High限定唯讀審查未發現必修，根代理已檢視實際差異及新增測試，獨立與正式驗收結果如下，已完成收尾。

Codex獨立447項Node／build／144項瀏覽器回歸通過（4.4分、0skip）。Chrome155.0.8059.85／Edge155.0.4283.62各1440／320執行核心、配額失敗與衝突共12流程通過，涵蓋取消不重繪、首選項焦點、正錯題重練、再次揭示／重載／備份、九題舊欄位及其他模式原文保全；0pageerror、無橫溢出，已目視窄版解答按鈕與桌面失敗提示。兩瀏覽器四模式共8個真BFCache返回／衝突通過，91份文件822連結與差異空白檢查通過。

[PR#41](https://github.com/zhai2Liu/taiwan-mahjong/pull/41)最終head1088298359684bb0b15925249407f1dc39c105bc，Actions39952619408／build120410542607成功447／144（2.7分、0skip）、91文件822連結與audit0，PR部署正常跳過。新鮮head／base與mergeable clean核對後指定head合併；正式來源**c493caabe091c0e176bd4587a2f3431ed2d07cbd**，tree與驗收head相同。main Actions39953225965／build120412591912成功447／144（2.3分、0skip）、同一文件檢查及audit0，deploy120413978317成功。

部署後三頁HTML及8項唯一JS／CSS皆HTTP200、SHA-256與驗收建置一致；正式Chrome／Edge各1440／320的核心重練、配額失敗與衝突共12流程通過，0pageerror／無橫溢出。live-assets.log、live-ui.log與截圖留同一work目錄；隔離context與臨時服務已關閉，日常4173／使用者profile未動。本包程式、文件與發布核對完成，純文件收尾不代表新runtime。手機實機／Safari／真人理解仍待驗。

程式只改training.ts，測試為training-page及新增trial-retry，規則／AI／計台、答案、保存格式／鍵、其他模式與八課保持。brief、CLI結果及獨立證據在work/trial-retry-20261023/。下包優先更新展示短片與字幕：tracked工具為outputs/taiwan-mahjong-showcase/generate-demo.mjs，舊片仍有前三課／交回字句，需同步八課、自存與重練；精簡派工稿在同一work目錄next-showcase-brief.md，尚未派工或重錄。舊素材維持歷史，教程人工編審仍依BEGINNER-LEARNING，S6不啟動。

## 前包：決策題可靠本機自存

2026-10-23續作，基準c22db9e、分支codex/trial-autosave-20261023。Codex定範圍與驗收，實際Claude Code會話a3d0ddf3-6a72-4f76-8833-85984898a537實作與自測；維持既有訂閱／權限。選項、揭示、切題／分類自存，理由停止輸入400ms後保存；手動保存可重試，狀態直接可見，初載入／快取返回不寫入。保存只承認捕捉的完整快照，忙碌合併最新修改，不重繪作答或搶焦；資料格式、九題答案、八課、其他模式與規則保持。

清除成功後本頁保留，單純切題不重建，新的作答或手動保存才恢復；清除等待中也區分作答與位置。失敗取消舊計時器及合併待辦，讀取／衝突停寫待明確復原。GPT 6.1 Sol／High獨立審查重現三個缺口：清除等待中只切題復活、失敗後舊理由排程再寫、清除無法核對後未停寫，均退回同一Claude會話修正，再以實際CAS記憶體流程確認解決。自測最終444項Node／build／138項瀏覽器通過、0skip；初次自測曾修測試夾具及重繪後收合工具的定位，未弱化保護。兩次回修無工具拒絕，早期探索指令遭拒未擴權。Codex獨立驗收與正式發布結果如下，已完成收尾。

Codex獨立444項Node／build／138項瀏覽器回歸通過（3.9分、0skip），新增14項瀏覽器執行涵蓋輸入組字、空修改／位置、清除與保存競態及復原。Chrome155.0.8059.85／Edge155.0.4283.62各1440／320完成自存、重載續答、揭示鎖定、清除不復活、新作答恢復與其他鍵保全，0pageerror／無橫溢出，已目視兩寬；兩瀏覽器四模式共8個真正BFCache返回／衝突流程通過。91份文件822連結及差異空白檢查通過；頁面meta文字由Codex同步後重建，應用程式與測試未再變更。規則／AI／計台／Session、答案、格式及依賴無差異。PR與正式發布結果見下段。

[PR#40](https://github.com/zhai2Liu/taiwan-mahjong/pull/40)已合併；指定head15e361d361d224609fc0422f991fb39344f196e8，Actions39916847426／build120292149298成功444／138（2.7分、0skip）、91文件822連結、audit0，PR部署正常跳過。新鮮head／base、mergeable clean及指定head防護後合併為**fc3d4b7f5af6715d3fcebdbb72bd1d1487258d3d**，tree與驗收head相同。main Actions39918036289／build120296220687成功444／138（2.7分、0skip）、91文件822連結及audit0，deploy120297582283成功。

部署後三頁HTML與8項唯一JS／CSS皆HTTP200、SHA-256與驗收建置一致；正式Chrome／Edge各1440／320完成自存、重載續答、揭示鎖定、清除不復活、新作答恢復與其他鍵保全，0pageerror／無橫溢出。live-assets.log、live-ui.log及截圖留同一work目錄；隔離context與臨時服務已關閉，日常4173／使用者profile未動。本包程式、文件、發布及正式驗收完成；純文件收尾不代表新runtime。五小時額度最後檢查98%已用，先完成交接；後包尚未派工。

派工、原始結果、獨立日誌及續作入口在work/trial-autosave-20261023/；此目錄被忽略，正式狀態以本節為準。下包為單題重練，精簡派工稿與runner在work/trial-retry-20261023/，未派工／實裝；教程人工編審依BEGINNER-LEARNING，S6及新收集服務不啟動。

## 前包：Vite 安全修補

2026-10-23依使用者「繼續作業，優先做什麼你決定」，先處理已知安全維護。基準4e0ad3c，分支codex/vite-security-20261023；完整audit再次確認Vite8.3.2為1個high套件、6則公告。核對[維護者Windows公告](https://github.com/vitejs/launch-editor/security/advisories/GHSA-587h-7wmj-h5pm)及[8.3.5正式版本](https://github.com/vitejs/vite/releases/tag/v8.3.5)後，實際Claude Code會話3b8f8939-2f1e-4e6a-abcd-d2fdffffa375只修改package.json／package-lock.json，Vite固定8.3.5；既有claude.ai Pro及權限保持。

傳遞變更只有Rolldown1.2.15及15平台binding、其@oxc-project/types0.155.0、PostCSS8.5.31與其nanoid3.3.20，沒有新增套件或頂層依賴；TypeScript／Playwright等其餘鎖版保持。完整audit包含dev，修補後0公告不等於全面安全稽核。正式Pages只供應靜態檔，未執行Vite開發伺服器；沒有正式站被利用的證據。

Claude自測437項Node／build／124項瀏覽器通過、0skip。第一次安裝誤在repo根目錄留下三個被忽略的npm產物，清理命令未獲工具授權；Codex已核對建立時間、內容及絕對路徑，把它們移入work/vite-security-20261023/mistaken-root-install隔離，沒有刪除既有遊戲資料。另兩次探索命令遭拒，必要更新及檢查皆已執行，沒有擴大Claude權限。Codex在正確目錄乾淨npm ci、鎖檔雜湊不變，獨立完整audit為0，437項Node及build通過；其餘驗收／發布補記於本節。brief／原始audit／結果及獨立檢查在work/vite-security-20261023/。

下一包優先「決策題可靠本機自存」，GPT 6.1 Sol／High已唯讀核對現存手動保存與Web Locks／原文衝突保護。最小範圍為選項／揭示／理由與續答位置，保存狀態直接可見、不中斷作答；忙碌期間合併最新快照，失敗不無限重試，清除／重讀取消待存，舊欄位及其他模式保持。方案在同一work目錄next-autosave-brief.md，尚未派工或實裝；單題重練其後。既有解釋返回暫停牌桌已有明確繼續，順位較低。人工教材編審仍依BEGINNER-LEARNING，不自動啟動S6、改答案或新增上傳。

Codex獨立124項瀏覽器回歸通過（2.4分、0skip，含真BFCache），程式／測試／CI無修改。鎖檔20個套件項目全部屬指定依賴鏈，無新增／移除項目；本機Chrome／Edge於1440／320四組入口、原局往返、教學鍵盤收合與答題鎖定通過、0pageerror／無橫溢出，已目視窄版牌桌與桌面課程。91份文件822本機連結及差異空白檢查通過。新建置JS雜湊有變，正式發布後須重新核對，不沿用PR#38產物。帳戶檢查點五小時已用51%，為共用帳戶快照，後續先收斂發布與交接。

2026-10-23續作完成發布：[PR#39](https://github.com/zhai2Liu/taiwan-mahjong/pull/39)最終head0dce47c9ea5de005a52406e72f837fee374ee019，Actions39814410507／build119949006767成功437／124（2.1分、0skip）及91文件822連結，PR部署依規則跳過。前次服務延遲已取得完整成功日誌，未取消／重跑或跳過檢查。重新核對head／base及mergeable clean，以指定head合併；正式來源**b85a9b29f3fc5bd12fc1875b235db8124b4f8160**與驗收head tree相同。main Actions39823033195／build119978989657成功437／124（2.0分、0skip）、完整audit0及同一文件檢查，deploy119980584652成功。

部署完成後正式三頁與8項唯一JS／CSS全HTTP200、SHA-256與驗收建置一致；Chrome／Edge各1440／320完成入口／原局往返／教學收合鍵盤及答題鎖定，0pageerror、無橫溢出。較早一次部署未完成時比對到舊HTML，已另存before-deploy紀錄；成功後才判定正式通過。證據留同一work目錄，安全包已完整收尾。使用者接續要求持續推進至本次五小時額度上限；新窗口開始2%、檢查點38%，下一包決策題自存設計與派工資料在work/trial-autosave-20261023/，尚未宣稱實作通過。不使用額度重設或自動續跑。

## 前包：快速操作與舊文字修整

2026-10-22使用者要求先完成五項快改及舊文字，較難項目和作品集補強等本包結束後再評估，並加入可能人工重新編輯新手教程。基準fc9eebb、分支codex/quick-ux-20261022；計畫、Claude結果及驗收留work/quick-ux-20261022/。GPT 6.1 Sol／High子代理完成有界派工，真實Claude Code CLI會話a5ff3335-d431-4857-9204-40eae7641807實作／自測437項Node、build及124項瀏覽器通過。子代理後因Codex帳戶額度中止；主代理接續文件與獨立驗收，程式未由Codex接手。一次探索性合併shell指令被拒，改用原工具完成，必要檢查無拒絕；未更動供應者／計費。

六步導覽改「操作說明」，八課入口稱「新手課程」；對戰與帶原局的練習增加「選擇玩法」整頁回首頁，沿用保存失敗離頁提醒。學習重讀／重建及次要續學工具用原生details收合，保存狀態／重試／有效接續與必要救援直接可見，展開狀態沿重繪保留。決策回應改自然用語，答案、推導與作答鎖定保持。清理README、展示、發布草稿及現行課程文字，不竄改歷史影片或測試證據。

新增[人工教材編審的後續範圍](BEGINNER-LEARNING.md#快速操作修整與後續人工編審)；只列待評估，本包不重寫八課、不修改完成紀錄語義。難項、自存／重練／續玩／匯入、Vite修補、作品集刷新與S6皆未實作。

主代理檢視實際程式與測試差異，獨立重跑437項Node、build、124項瀏覽器（2.3分），皆通過、0skip。新增導航與收合回歸未刪弱原保護；本機Chrome／Edge各1440／320驗入口、原局往返、工具鍵盤／焦點、答案鎖定，全部通過、0pageerror與無橫溢出；已目視320牌桌及1440學習頁。凍結引擎／AI／計台／Session、存檔codec／題庫答案及依賴保持。

[PR#38](https://github.com/zhai2Liu/taiwan-mahjong/pull/38)最終head b2757925ae6de6eb2bba85dea4be01f139d8e7f8，Actions39770063181／build119795060688通過437／124（2.4分）、0skip及91份文件822連結；PR部署依規則跳過。以新鮮head／base、mergeable clean及指定head防護合併；正式來源**2275091129a6d4f2dd8ac1ea325ccf267f2501fd**，tree與驗收head相同。main Actions39770590629／build119796823247同樣437／124（2.4分）、0skip與文件檢查通過，deploy119798250857成功。

正式三頁HTML及8項唯一JS／CSS皆HTTP200，SHA-256與本機驗收建置一致；正式Chrome／Edge各1440／320再次完成入口、原局往返、收合鍵盤／焦點及答題鎖定，0pageerror、無橫溢出。live-assets.log／live-ui.log及隔離context截圖在同一work目錄；context及臨時4226／4240服務均關閉，日常4173與使用者profile未動。程式、文件與發布收尾完成；純文件收尾不代表另一個網站runtime。後續只評估本節列出的延後項目，手機實機／Safari／真人理解仍未驗。

## 前包：玩家回饋收集已撤下並完成正式驗收

2026-10-22使用者指出沒有上傳服務時，填寫回饋、下載再交回不符合正常使用情境，要求先全部撤下。Codex定範圍／驗收，實際Claude Code CLI負責程式及自測，既有claude.ai Pro不切換計費；基準0ebe3e3，分支codex/remove-feedback-20261022，brief／結果在work/remove-feedback-20261022/。本次不包含前包另列的Vite安全修補。

撤下學習頁回饋表單／TXT／預覽與專用草稿保護，以及決策頁意見欄、曝光自陳、純意見TXT及交回專案引導。JSON僅保留在收起的本機工具作個人備份／故障復原；舊feedback／exposure原值保存，不升版或清空。八課、答題狀態／解析、遊戲正向回饋、本機完成／續學／作答與未存／衝突保護均保留。現行文件已撤下收集邀請，舊驗收與研究只留歷史參考。作答按鈕改「看答案與推導」，空選與揭示後鎖定保持。

Claude最終437項Node／build／120項瀏覽器通過，0skip；Codex已審查實際差異及測試修改，獨立重跑437／build／120（2.2分）通過。原回饋專屬斷言改驗入口不存在，未存、衝突、焦點、壞檔、八課及真BFCache保留；新增舊意見／曝光逐字保全。初稿合成測試資料把只有意見的紀錄標為draft，依原解析規則修正成unanswered後整套通過，沒有放寬格式。早期兩個額外CLI命令遭拒，改用原允許完整命令完成，未擴大權限或改計費；最後小修正同會話完成，無新增拒絕。

Codex另以Chrome155.0.8059.85／Edge155.0.4283.62於1440／320各驗兩頁：收集控制／交回文字不存在、八課可切換、作答與解析／重載正常、舊九題feedback／exposure保存及備份完全相同、其他模式原文保持、0pageerror／無橫溢出，該組流程只有同來源GET。目視發現備份預覽原在工具外，已退回同會話修正為隨原生details一起收合，重開原文保留；最終兩寬已再驗。Chrome／Edge四模式真BFCache與衝突共8流程通過；browser-history腳本及showcase錄製器僅同步新標籤，未重錄或替換影片。後者由Codex作單純文字修正並檢查語法。91份正式文件821個本機連結、0問題；凍結規則／引擎／計台／AI／Session、保存格式與依賴無差異。證據留在同一work目錄，最終PR／main與正式站核對如下。

[PR#37](https://github.com/zhai2Liu/taiwan-mahjong/pull/37)最終head b0433f9b82e726fb62c376c6261df74585f613c5，Actions39735375251／build119679706640成功437／120（2.1分）、91份文件821連結，PR deploy119680827250依規則跳過。重新核對head、base及mergeable clean後，以指定head合併；**正式Pages來源06680023cbf491143cefdda4df17752edb5d7870**，main tree與驗收head相同。main Actions39735812156／build119681099928成功437／120（2.3分）、同一文件檢查通過，deploy119682295336成功。

正式三頁HTML及8項唯一JS／CSS全HTTP200，SHA-256與驗收建置一致；更新learn-jsy4ZQDK.js／learn-CCkWnC6_.css、training-wjnhJg38.js／training-Bvg6n3C0.css，其餘四資源保持。正式Chrome／Edge於1440／320再次完成無收集入口、作答解析／重載、舊九題意見與曝光原值保存、完整備份及收合預覽、其他鍵原文保持；0pageerror、無溢出，該流程無外部請求。live-assets.log／live-ui.log及截圖在同一work目錄；所有驗收context與臨時服務均已關閉，日常4173與profiles未動。本包程式、發布與文件收尾完成；純文件提交不代表另一個runtime。實機手機／Safari／真人理解仍未驗，Vite安全修補仍為後續獨立待辦。

## 前包：S2.4b八課入門與獨立續學已發布並完成正式驗收

2026-10-22，使用者要求持續推進直到本次五小時額度用完。專案仍在既有new-chat路徑，基準main4eb13e4、分支codex/learning-round-ui-20261022。Codex定範圍／契約及驗收，實際Claude Code既有claude.ai Pro會話5c796624-5967-4003-a3fe-e73f14f53130完成實作、自測及同會話修正；brief、各輪JSON、原始檢查及截圖留work/learning-round-ui-20261022/。**下列本機、PR／main與正式發布驗收均完成；這不是真人理解或實機手機驗證。**

本包開放第7–8課：完整固定示例、兩種吃法／過、合法偏離後明確重試、自摸及未贏結算、台項／付款／莊位檢核、實桌附錄、暫停與回圖解接續。獨立tw16:learn:round:v1四欄續學封套只存牌局段落及受助，小題重新確認；v2只存八課累積旗標，前六課語義及v1原文保留。正常對戰回既有牌室接原局或確認新開，不帶固定牆。結算優先呈現台項收付，公開牌列表用原生details按需展開，不算提示、不重付；活動中直接查附錄答案仍算受助。規則／引擎／計台／AI／Session、依賴及原八分支參考均無改動。

審查發現並退回修正：非劇本捨牌後只保留公開Observation，直到明確重試才回復，偏離屬dirty且不可保存；等待時以原生inert保護summary等教學動作，status區保留可讀；活動查附錄跨重載保留受助。另以兩把延遲鎖重現v2先完成時側邊按鈕卡disabled，修為syncSavePanels依當下busy重算各區，兩種釋放順序都納回歸。BFCache先前2項skip已取消，使用完整Chromium、尊重override，Windows僅已確認spawn UNKNOWN才fallback既有Chrome；必須persisted與同文件marker，不能把無快取還原當通過。Codex另讓獨立建立的context沿project viewport，確實驗桌面／窄版。

Claude最終437項Node／build／120項瀏覽器全過、0skip；Codex已獨立重跑同數量，Chrome全回歸120（2.2分），Edge補2項真BFCache＋2項明示合成事件共4案通過。Chrome155.0.8059.85／Edge155.0.4283.62各四模式真BFCache與衝突共8流程全過、其他鍵保持、0pageerror。另獨立對照舊v2解析器15625個合法六課旗標、125個v1組合全部保持，舊頁拒絕新7–8旗標而非降格。Chrome／Edge實際1440／320各完成第7課示範存claim重載、受助放槍及未求助自摸、原v1／其他模式原文與回正常原局保持，0pageerror、無橫向溢出；兩鎖獨立重現修後按鈕已恢復。桌面／窄版結算截圖已目視，台項與收付直接可見；非實機手機／Safari／真人輔具。

正式文件已同步八課、完成旗標與續學點邊界、模組修改位置、舊頁／回退注意與T6–T8形成性任務，沒有新增正式文件檔。接手先查session.json及最終CI／發布補記，不再把舊準備稿未接線當現況。真人仍0，S2.2／S4理解待驗；S6、正式評量及本人授權／Release事項不因本包自動放行。

[PR#36](https://github.com/zhai2Liu/taiwan-mahjong/pull/36)最終head fe036023c008134d06e451fac687b74af676b600，Actions39683005604／build119509958246成功437／120（2.3分）、0skip，91份文件820連結通過；PR deploy依規則跳過。核對新鮮head／base及mergeable clean後合併，main來源**56c106360a8b0e84f0315f7cb1c20bb7267b8826**，tree與驗收head相同。main Actions39683534922／build119511747598同樣437／120（2.3分）、0skip、91份820連結通過；deploy119513197696成功。

正式三頁及8項唯一JS／CSS全HTTP200且SHA-256與驗收建置一致。新index-D220Qfm-.js、view-C-bYs2fn.js、learn-B9I5g89e.js／learn-BxPSmRgB.css，其餘4資源未變。Chrome／Edge再於正式網址各跑1440／320的整課、續學／重載、提示黏住、不同結算與未求助完成、回饋草稿切課、其他鍵及原對局保持，0pageerror；正式桌面吃牌與兩寬結算截圖已目視。另在正式HTTPS用Chrome1440／Edge320真正BFCache返回，同文件marker保留、他頁新續學點阻擋過期寫入，取消取代零覆寫；壞原文唯讀保留且完成旗標原樣不變，兩瀏覽器皆通過。live-assets／live-chrome／live-edge／live-guards.log與截圖在同一work目錄，context均關閉。

獨立117個合法課次／模式／步驟／受助封套已逐一驗codec、重播／restore及單鍵一次寫入，其他資料保持；不是增加Node測試項目數。新增[八課整局展示畫面](../taiwan-mahjong-showcase/README.md)採同正式來源的合成示例，保留舊影片與三圖並標明時間，非真人或學習成效證據。Codex另作錄製產生器結尾字幕的單純三課→八課文案修正並檢查語法，未重錄／替換影片。臨時4238 PID42208及後次28972均核對完整專案命令後關閉，4226／4231亦無監聽；日常4173未動。文件／展示及錄製字幕收尾不改網站runtime。

帳戶開始五小時15%，檢查點29／43／61／71%已用；是共用帳戶快照，不是精確對話token。70%後只收斂本包及驗收，不新開大範圍；接近上限優先提交／發布／交接，不使用額度重設或自動續跑。

收尾文件檢查91份、823個本機連結、0問題；錄製腳本語法與差異空白檢查通過。新展示PNG與正式擷取原檔SHA-256相同，未改舊圖／影片；本輪開發與發布已完成，後續只依可重現問題或另立的有界維護包推進。

**下一個優先維護包：Vite安全修補，尚未實作。** 收尾的完整npm audit實際回傳exit1、1個high套件（vite8.3.2、6則公告）；原始JSON在同一work目錄的dependency-audit.json。已核對[維護者Windows公告](https://github.com/vitejs/launch-editor/security/advisories/GHSA-587h-7wmj-h5pm)、npm修補候選及[Vite8.3.5正式版本](https://github.com/vitejs/vite/releases/tag/v8.3.5)。正式Pages只提供建置靜態檔，並未執行Vite開發伺服器；本機預設127.0.0.1不能當成漏洞已修。下一次先由Claude RD限定更新package.json／lockfile，再由Codex核對audit、437／120、建置與正式發布；不要直接audit fix或在額度尾端改版後省略驗收。範圍與交接在work/learning-round-ui-20261022/security-next-brief.md，尚未派發、未更動依賴。長行整理C1／C2仍依既有決定按實際修改需要處理，不因本次掃描自動加全庫規範。

## 前包：S2.4a第7–8課整局核心

2026-10-22，承接使用者「推進專案進度」，先完成第7–8課的純整局腳本及最少檢查點。Codex PM／SA定義範圍並驗收，實際Claude Code CLI以既有claude.ai Pro實作及同會話自測；分支codex/lesson-round-core-20261022，基準0c1db73。原教學8路徑測試完整保留，新增src/learning-round.ts及test/learning-round-core.test.mjs；只更新既有教材／維護／路線文件，不新增平台、依賴或保存鍵。brief、會話c9da2894-103b-47a1-b2f0-3b3c3bbb8161、結果與檢查紀錄在work/lesson-round-core-20261022/。

核心從完整144張真正DEAL，沿凍結引擎重播至指定點；含兩吃法、L8由下家胡，以及合法過後停止。檢查點只記版本／例號／步驟／吃法／結果／受助，共八欄，不包含可篡改局面；只接受encoder產生的512字元內正規原文。scriptVersion同時約束牌堆及引擎語義，變動須升版。詳細API／點位／限制見[S24契約](S24-LESSON-PREPARATION.md)。沒有UI、localStorage、計時器或Session／正常AI接線，不能稱第7–8課已開放、已暫停續學或已通過真人驗證；公開網站仍為六課。

Claude最終428項Node與build通過、無權限拒絕。初稿自測曾因自行加管線被拒，同會話已改用授權的純命令完成，未放寬權限或切換計費。Codex獨立重跑428項（0失敗／跳過）及build通過；另直接重用未修改的原準備測試路徑，八條結果與NEXT_HAND逐一對照通過。74個合法檢查點（37點各含受助true／false）與獨立fixture／引擎路徑、codec及serialize／restore等值；含錯誤輸入拒絕、互不污染與不重付。三頁及8資源共11檔SHA-256與上一版完全一致，因此本機不重跑無關UI流程；PR仍沿既有全瀏覽器CI。

[PR#35](https://github.com/zhai2Liu/taiwan-mahjong/pull/35)最終head71527dc52081b064cedba9e370d25115a3933ab3，Actions39671019959／build119468597889成功428／80（1.2分），91份文件812連結、0問題，PR deploy依規則跳過。核對新鮮head及mergeable clean後合併；main來源4704ec4b7d01da92a94bb4291c83e441adb580ba，tree與驗收head完全相同。main Actions39671503189／build119470278130成功428／80（1.3分），同一文件檢查通過，deploy119471457780成功。已切回main，正式三頁及8資源全為HTTP200、SHA-256與本機驗收建置一致，live-assets.log已落盤。這是來源合併與既有六課產物核對，不代表7–8課已公開。純文件收尾不改runtime；本輪未啟動server／日常瀏覽器、未動4173，也未用帳戶額度重設工具。

**下一包S2.4b：** 接第7–8課互動頁與實桌附錄、提示／合法偏離後的明確重試、真正暫停／返回、獨立檢查點保存與重載、正常對戰入口。UI只呈現getObservation(state, 0)，不得送固定牆給正常AI。先定保存封套與獨立鍵、Web Locks鎖內原文衝突核對、失敗與他頁保護；tw16:learn:v2仍只保存六課完成旗標，不塞GameState。完成功能後才開7–8課並驗兩寬操作、失敗／跨頁、原對戰存檔隔離；不等真人，不啟動S6或正式評量。

## 前包：S2.3第4–6課已發布並完成正式驗收

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
| S2.1／S2.2 | 前三課與獨立進度已發布；選填TXT／回饋表單依本次指示撤下，最新驗收與發布見本輪。[T0–T5歷史任務](BEGINNER-TRIAL.md)只留維護參考，真人理解仍待驗 |
| S2.3／S2.4 | [4–6課互動及v2相容](S23-INTEGRATION-VALIDATION.md)及[7–8課整局互動／獨立續學](S24-LESSON-PREPARATION.md)均已完成；八課正式來源56c1063，437項Node／120項瀏覽器與正式站驗收通過。實桌附錄及正常對戰入口已接線，真人理解仍待驗 |
| S3.1–S3.3 | 九題四類導引、同類練習、吃碰事後解釋與同版續答已發布；自存與單題重練均已發布並完成正式核對，依上節。曝光自陳與意見控制已撤下，舊欄位原值相容保留；不自動上傳 |
| S3.4 | [人工錨點／缺口／流程](S34-ASSESSMENT-PREPARATION.md)已備；13題／12題族、四候選不進試讀、assessmentFamilies空；真人題族／難度／內容及正式放行待驗 |
| S4 | 限定技術檢查已完成；[人工回饋清單](HUMAN-FEEDBACK-CHECKLIST.md)中的手機／Safari／輔具／理解仍待，程式或模型不能代填 |
| S5 | 現行名稱展示刷新PR#31已合併，11檔公開內容與合併來源核對完成，詳[S5.1驗收](S51-DEMO-VALIDATION.md)。[發布技術準備](S52-RELEASE-PREPARATION.md)及草稿同步完成。LICENSE、tag／Release、另擬履歷摘要仍待本人決定 |
| S6 | 人格AI僅離線研究，使用者未授權實裝，需另行啟動 |

分工本人已確認「本人負責需求、方向與操作回饋；AI協助規格、程式、測試、發布與文件」，不重問、不推定手寫比例／個人技能。玩家回饋收集已停用；[TRIAL-REVIEW](TRIAL-REVIEW.md)只留舊檔相容與維護工具，不代填真人結果或自行公開原資料。其他新重現操作／維護缺口可獨立修，不代表必須停工或放行上述功能。

## 必須保留的資料與規則界線

| 本機鍵 | 現行格式／讀取 |
|---|---|
| tw16:TW16-CLASSIC-v1:save | Session／GameState v1；decodeSession→engine.restore，結算已付款，不重付 |
| tw16:practice:v1 | 練習v1；種子與日誌重播核對 |
| tw16:review:v2 | 白名單快照、容量／版本、Web Locks |
| tw16:learn:v1／v2 | v1 schema1三課原文只讀保留；v2 schema2、beginner-1-8-v1八課累積旗標，明確帶入；前六課語義保持 |
| tw16:learn:round:v1 | 第7–8課獨立續學點，嚴格四欄2048 bytes，內嵌512字元內core原文；CAS／Web Locks、壞原文與跨頁保護，不存GameState／未提交選項 |
| tw16:trial:v1 | 保存封套schema1含schema3報告、128KiB、Web Locks ifAvailable＋expectedRaw，只自動讀同版 |

教練偏好tw16:coach:v1為on／off／after。壞檔、未知版、讀寫失敗及跨頁衝突保留原文與本頁內容，不清空localStorage修復。試讀自存包含題號／分類與完整作答，清除後純位置變更不重建；舊曝光自陳不是首次證明，揭示後鎖定。CLI讀schema1／2／3、審閱reportVersion2；未授權任意匯入、靜默遷移或後端。

main只安排一個自動計時器，吃碰解釋等正常RESOLVE並核對原快照，關閉保持暫停、不重送。syncSaveLeaveGuard統一檢查牌局／練習失敗與檢討pending，不能只因當前模式保存成功解除其他未存提醒。learning.loadProgress先驗候選成功才換記憶體。view.tile保留圖片名稱與強制色彩選取；他家暗手／暗槓牌種仍未知。

唯一桌規為[凍結TW16-CLASSIC-v1](../taiwan-mahjong-m0/RULES.md)：144張、五組加眼睛，不混港麻／日麻。AI／教練只讀自家getObservation，不讀別家暗手、牌牆或種子；公開未知牌改善比例不是真實摸牌率，安全不等於阻止莊家自摸或流局續莊。沒有帳號／後端／多人／多桌規。
