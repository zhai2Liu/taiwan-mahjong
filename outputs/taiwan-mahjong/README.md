# 青竹牌室｜台灣十六張麻將學習與決策練習

2026-10-13：S0.1採納新手／進階兩條學習路線。完整對戰、純練習、六步操作導覽與局後檢討已發布；八課入門在S2、正式陌生題評量與真人成效仍待驗證。使用與開發方式在本文；第一次認識作品請讀[作品介紹與三個案例](../../README.md)。

1真人＋3位本地公平電腦，採固定桌規TW16-CLASSIC-v1。可在本機網頁遊玩完整牌局；M0–M5.4已完成，正式網站已上線：[立即遊玩](https://zhai2liu.github.io/taiwan-mahjong/)。純練習與可關閉的對戰教練已完成，後續按試玩回饋維護。對戰選牌可預覽離聽牌多遠、依可見牌計的有效進牌比例與拆法，吃碰各有合法捨牌後比較。

## 入口

- [目前交接與發布狀態](HANDOFF.md)：最新完成、驗證範圍與下一包。
- [人工回饋清單](HUMAN-FEEDBACK-CHECKLIST.md)：目前需要的新手／熟手／實機回饋，後續評量及本人決定事項。
- [操作示範與三張畫面](../taiwan-mahjong-showcase/README.md)：正式版本的合成牌例、文字導覽與支援界線；不是學習成效證據。
- [評量候選審核準備](S34-ASSESSMENT-PREPARATION.md)：四候選缺口、人工理由規準、流程及空模板；真人審核與正式放行仍待。
- [局後下一步與吃碰回應後解釋](S32-VALIDATION.md)：仲裁後才顯示取得／未取得，關閉保持暫停；同類練習另開分頁，發布狀態依HANDOFF。
- [產品方向](PRODUCT-DIRECTION.md)、[全面強化企畫](MASTER-IMPROVEMENT-PLAN.md)、[工作包路線](ROADMAP.md)：已採納範圍、依賴與完成條件。
- [維護指南](MAINTENANCE.md)、[發布與回復](DEPLOYMENT.md)：資料流、修改位置及驗證。
- [發布草稿／來源盤點／回復演練](S52-RELEASE-PREPARATION.md)：五種本機資料的指定版本回退與前進證據，授權與Release仍待本人決定。
- [固定桌規](../taiwan-mahjong-m0/RULES.md)、[台灣用詞](LOCAL-TERMS.md)：規則與玩家文字的權威。

- [決策題試讀](https://zhai2liu.github.io/taiwan-mahjong/training.html)：9題草案，牌效／吃碰取捨／安全牌／莊家連莊四類導引；手動保存後下次同版續答，匯出全部九題，先作答再看推導，不計牌技總分；[續答與曝光](S33-VALIDATION.md)、[內容版本](S31-VALIDATION.md)、[最初驗收](L3B0-TRIAL-VALIDATION.md)。
- [新手試用任務與紀錄](BEGINNER-TRIAL.md)：前三課T0–T5與觀察模板已備妥，真人驗收仍待。

<details>
<summary>工程證據與歷史驗收索引（各份保留當時版本）</summary>

- [L3-A3題目模型複核](L3A3-MODEL-REVIEW.md)：13題草案、4能力候選與難度限制，目前已提供九題內容試讀。

- [L2-B局後檢討畫面](L2B2-REVIEW-UI-VALIDATION.md)：結算內回看最多三筆決策；本輪發布狀態見HANDOFF。
- [L2-A真人記錄與保存驗收](L2A3-RECORDING-VALIDATION.md)：已接本機對局，獨立快照／互斥／重試／清除；發布狀態見HANDOFF。

- [L1-B決策證據契約與驗收](L1B-EVIDENCE-CONTRACT.md)：已接L2局後檢討；契約與資訊邊界見本文。

- [L1-A核心證據驗收](L1A-EVIDENCE-VALIDATION.md)：獨立手算、未知安全反例與續莊界線；L1-B與L2已完成。

- [完整專案現況與目標重整底稿](PROJECT-REVIEW.md)：功能、架構、研究進度、限制與待決策。

- [目前交接與下一步](HANDOFF.md)
- [對手別公開風險證據](RISK-EVIDENCE-VALIDATION.md)：單家與全桌安全、進聽與退守的實際代價；離線研究，未改正式AI。
- [牌風、牌效與留安全張研究](HUMAN-AI-TACTICS-RESEARCH.md)：台麻反例、可重現牌例與人性化決策方向；正式AI策略尚未變更。
- [全專案檢視與優化](AUDIT-2026-10-07.md)：展開提示保留牌桌、儲存失敗直接重試與文件整理。
- [桌規展開與牌桌排版修正](TABLE-LAYOUT-VALIDATION.md)：展開說明不再擠壓中央牌桌。
- [正向遊玩回饋與驗證](POSITIVE-FEEDBACK-VALIDATION.md)：牌效進步、聽牌、吃碰成立、胡牌得分與練習鼓勵；不改遊戲AI。
- 胡牌結算預設逐條列牌型與台數，紅中／發財／白板分列、正花按實際得台張數呈現，上方可直接看牌型組合。
- [階段順序與完成條件](ROADMAP.md)
- [發布設定、更新與回復](DEPLOYMENT.md)
- [維護指南：修改位置、資料流、存檔與驗證](MAINTENANCE.md)
- [固定桌規與完整台表](../taiwan-mahjong-m0/RULES.md)
- [概念契約](../taiwan-mahjong-m0/CONTRACTS.md)：實際欄位以src/model.ts為準。
- [人性化AI玩家設計](HUMAN-AI-DESIGN.md)：個性、攻守、最佳實踐與未來工作包已整理完成；[決策／保存規格](HUMAN-AI-DECISION-SPEC.md)、[證據／驗證方案](HUMAN-AI-VALIDATION.md)。離線研究模組已開始，正式人格整合尚未啟動，現行版本未替換AI。
- [進攻／防守牌風研究](AI-STYLE-DESIGN.md)：公開資訊安全原理、768副起手基準與三個引擎反例；已併入人性化AI設計，尚未更換遊戲AI。
- [純練習與新手提示設計](TRAINING-DESIGN.md)：M5設計及Sol／Luna分工。
- [新手操作教學驗證](TUTORIAL-VALIDATION.md)：六步原生視窗、示範選牌／出牌與兩種吃法，正式發布狀態見HANDOFF。
- [本輪維護驗證](MAINTENANCE-2026-10-06.md)：鍵盤入口、結算付款核對及文件校正。
- [最近提示狀態修正](PANEL-STATE-VALIDATION.md)：暫停／回合切換／練習往返後保留展開或收合。
- [選牌流程修正](COACH-FLOW-VALIDATION.md)：滑鼠／鍵盤選牌與教練摘要同步、禁捨提醒、出牌及窄畫面。
- [對戰教練驗收](M5.3-VALIDATION.md)：226項測試、建置、提示開關、吃碰比較與窄畫面；純練習見M5.2，共用數學見M5.1。

</details>

## 新手入門試用版

[從零學台灣麻將（前三課）](https://zhai2liu.github.io/taiwan-mahjong/learn.html)：認牌與桌面、摸打補花、五組牌加眼睛；每課示範與換例，可跳課／回看／重排。獨立保存閱讀、提示下完成與換例自行完成，未完成操作不續存；第4–8課、真人理解與成效仍待。保存／版本契約見[新手課規格](BEGINNER-LEARNING.md)，當輪結果見[S2.1驗收](S21-VALIDATION.md)。原六步操作導覽仍在牌室，不取代這三課。

## 安裝與遊玩

在此資料夾開啟終端機，使用Node.js與npm。前次驗證環境為Node 24.12.0、npm 11.6.2；安裝版本以package-lock.json為準，無執行時套件。

```powershell
npm ci
npm run build
npm run preview -- --port 4173
```

開啟[本機牌桌](http://127.0.0.1:4173/)。單擊選牌、快速連點同張兩次出牌；鍵盤Tab選牌、Enter或空白鍵出牌。合法吃碰槓胡直接選操作。結算彈窗可看明細、返回牌桌或進下一局；重載可選「繼續上次牌局」。本機伺服器是否仍在執行須當次確認。

存檔屬於目前網站來源及瀏覽器；換網址、連接埠、瀏覽器或清除網站資料，可能讀不到同一存檔。網站部署不會自動搬移本機牌局。

儲存失敗時請保持頁面，儲存恢復後可按「重試儲存」，不用再出牌或摸牌；跨分頁衝突則依提醒重載最新進度。

對戰／練習未存妥或檢討仍待存時，離頁與重載會請瀏覽器提醒；成功保存後解除。這是額外保護，無法保證攔住手機關頁或瀏覽器崩潰，仍請先處理畫面的儲存提醒。

## 新手操作教學

新手教學已正式上線；最新發布證據見[現行交接](HANDOFF.md)。

首頁、對戰或練習上方選「新手教學」。六步從認牌、16→17→16，到獨立出牌示範、134遇2的兩種吃法、吃碰槓胡限制及看懂提示。示範不改牌局或練習進度；可隨時關閉／Escape，對戰開教學會暫停，關閉後自行繼續。規則以本案TW16-CLASSIC-v1及合法操作按鈕為準，完整桌規可按需展開。

## 純練習模式

首頁選「純練習模式」，或對戰上方選「練習」。隨機給16張再摸1張；單擊／Tab預覽，雙擊／Enter／空白鍵捨牌。看過回饋後按「摸下一張」。手牌下方可看距離聽牌與改善機率；展開較佳候選後可點牌只預覽，拆法與棄牌按需展開。換題／重練在「換題、重練與練習說明」；完成／耗盡時直接顯示。同題重練用原始牌序，換題需確認。採136張一般牌、不放回牌池，沒有對手、花牌、計台或吃碰槓。

機率是下一張改善比例，聽牌距離是結構下限，不代表還要摸幾次。練習獨立續存，重載後回練習入口選「繼續上次練習」。切入會暫停對戰，返回後按「繼續牌局」。儲存失敗時請保持頁面開啟，模式切換會暫時受阻。

## 打牌／吃碰後解釋

對戰上方「提示」選「打牌／吃碰後解釋」，先自行選擇再比較。打牌成功後暫停；有吃碰機會時，吃、碰、過會等正常仲裁完成才暫停解釋。視窗分開說明原選擇、實際是否取得牌、決策前候選差異與門清代價；關閉後自行按「繼續牌局」，已結算則回結算。純過不另彈窗，同類練習另開分頁。詳見[S3.2契約與驗收](S32-VALIDATION.md)及[最初打牌解釋](AFTER-DISCARD-VALIDATION.md)。玩家文字以台灣牌桌說法為主，維護對照見[用語規範](LOCAL-TERMS.md)。

## 開發與驗證

決策題匯出檔的接收、格式檢查與人工審閱方式見 [試讀紀錄審閱](TRIAL-REVIEW.md)。本機工具不自動回傳 GitHub，也不將理由判分。

試讀預設不寫入作答；按「保存作答到此瀏覽器」後，下次自動載入同版紀錄，另有管理／確認清除與原檔下載。未存修改啟用離頁提醒；確認保存且內容未變時可直接離頁。一般匯出不保證下載已落盤，仍保留未存提醒；網頁不會自動交回作答。先前是否見題為自陳，預設未知、揭示後鎖定；有類別導引，不是無提示評量。共用裝置可清除本機作答，清除瀏覽器資料或換來源無法保證找回。見[S3.3](S33-VALIDATION.md)及[審閱流程](TRIAL-REVIEW.md)；歷史離頁設計見[S1.1](S01-S11-VALIDATION.md)。

```powershell
npm run dev -- --port 4183
npm run check:docs
npm test
npm run build
```

`npm test`編譯後執行Node內建測試；`npm run build`先編譯再產生正式site/。dist/供測試匯入，test/頁面與fixture不屬正式遊玩入口。依改動選擇驗證範圍，詳見維護指南，不為文件或CSS細節重跑長模擬。

`npm run check:docs`檢查Git追蹤文件中的本機行內連結及圖片路徑，包含大小寫與目標是否追蹤；新增文件／圖片先加入Git索引再執行。需在Git checkout中使用，不影響下載原始碼後的遊戲建置。CI亦執行；範圍與限制見[維護指南](MAINTENANCE.md)。

發布成功後，用`npm run verify:release -- https://zhai2liu.github.io/taiwan-mahjong/`比對同一來源建置的site/與正式三頁HTML、全部引用JS／CSS的SHA-256。只讀取公開網站，不操作存檔；失敗會非零退出。先確認指定提交的Actions／部署成功，這項核對不取代受影響操作驗收；步驟見[發布指南](DEPLOYMENT.md)。

瀏覽器核心回歸：首次 `npx playwright install chromium`，再執行 `npm run test:browser`。目前test/e2e案例在桌面／390px各驗一次，結算、練習、分類與檢討另驗320px，使用正式建置、隔離本機4226來源與合成資料；不取代手機／Safari實機或真人試用。CI亦執行，失敗證據機制見[S1.2b](S12B-VALIDATION.md)；範圍見[S2.1](S21-VALIDATION.md)、[S3.1](S31-VALIDATION.md)、[S3.2](S32-VALIDATION.md)、[S3.3](S33-VALIDATION.md)及[S4.2可及性／重讀保留](S42-ACCESSIBILITY.md)，最新項目數及指定提交結果只記[HANDOFF](HANDOFF.md)，不在此重複維護計數；歷史效能基準見[S1.3](S13-VALIDATION.md)。

本輪[練習易用性驗收](M5.2-UX-VALIDATION.md)：集中手牌與預覽、清楚指標、候選點選及窄畫面流程。

## 歷史證據

[M0驗收](../taiwan-mahjong-m0/VALIDATION.md)、[M1驗收](VALIDATION.md)、[M2驗收](M2-VALIDATION.md)、[M3驗收](M3-VALIDATION.md)、[吃牌專項](M3.1-CHI-VALIDATION.md)保留原始結果。歷史交接只用來查背景；目前狀態以HANDOFF及ROADMAP為準。

- [阻止莊家續莊的離線策略比較](DEALER-STRATEGY-VALIDATION.md)：安全權重與牌效代價；未接正式AI。
