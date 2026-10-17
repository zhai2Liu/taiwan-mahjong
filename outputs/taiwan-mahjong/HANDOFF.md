# 現行交接入口

2026-10-13。S0.1已採納「台灣十六張麻將學習與決策練習」兩路線，詳見[PRODUCT-DIRECTION](PRODUCT-DIRECTION.md)、[全面強化企畫](MASTER-IMPROVEMENT-PLAN.md)。既有進階證據／檢討保留，完整八課屬S2，正式評量與真人成效仍待；人格AI仍需另外啟動。

2026-10-14人工待辦整理：[HUMAN-FEEDBACK-CHECKLIST](HUMAN-FEEDBACK-CHECKLIST.md)區分現在可試用的新手／熟手／操作／實機、後續正式評量與作品試讀、本人貢獻／授權／公開同意／S6決定。新增最小回報格式並沿用既有任務及JSON接收流程。純文件、未收到新資料或啟動新功能；S3.1發布與下一包S3.2不變。

## 目前工作包：S5.2 技術準備完成，待文件PR

2026-10-17，分支codex/release-recovery-preparation，基線dd35656。[S52準備](S52-RELEASE-PREPARATION.md)有可審閱發布／履歷草稿、來源與直接開發依賴metadata、無破壞回復指引。指定032bc1c／4bb87cd正式建置在同源4229隔離Chrome回退→前進，含一捨一摸練習／一筆合法快照／課程已讀提示／新版試讀保存；五鍵原文完全相同，兩版重開結算無二次付款，舊schema2匯出不覆寫schema3，0pageerror。4229已關；work/s52-build-old.log及recovery.log，全合成、不動正式站／日常profile。未新增套件、runtime或測驗；沒有建立Release／tag／授權。下一動作文件連結及PR CI→合併→核對正式站未變與清理4227，再落盤交接。真人試用／本人貢獻及授權決定仍待。

## 前包：S3.4 準備／S5.1 素材已提交

來源51e105c，[PR#9](https://github.com/zhai2Liu/taiwan-mahjong/pull/9)已附chat，指定head Actions39020052983成功，365／26（Linux28.8秒）、Pages上傳及deploy skipped、0 artifact；已合併6b8e5ea並回main。三JPG／MP4／README公開原始檔HTTP200與提交SHA-256逐一相符（work/s51-public.log，文字以git blob核對避免Windows CRLF差異）。無runtime變動，正式站仍S3.3 4bb87cd；沒有新Pages部署。S3.4真人審核與S5.1本人貢獻確認仍待。帳戶56%，原窗口未變；接S5.2技術準備：隔離同源回退／前進已通過五鍵原文、結算不重付、練習／課程續讀、舊schema2匯出不覆寫schema3。尚未提交該演練文件，下一動作整理發布／來源／授權待決與回復指引；不自行授權或宣稱Release已發布。

素材完成：outputs/taiwan-mahjong-showcase/內三張實際圖與33.04秒H.264短片（653382bytes）、文字導覽已備；正式4bb87cd／Chrome155.0.8059.80／隔離合成情境，無真人或音樂。MP4實際解碼播放及7／14／20／29秒定位通過，圖與代表畫面已檢視；第3圖另截整個組牌lesson。根README新版圖／影片／新手入口接線，[S51](S51-DEMO-VALIDATION.md)列來源、支援與本人貢獻確認仍待。依工作區規則交付皆在outputs，.gitignore只追加此展示資料夾；沒有runtime／題庫改動。下一動作文件／資產連結與原始碼差異→PR完整CI，通過後收斂；可接S5.2無破壞的版本回復演練，不自行選授權或宣稱正式Release。

2026-10-17，分支codex/assessment-demo-preparation，基線cbc90a3。[S3.4準備稿](S34-ASSESSMENT-PREPARATION.md)盤點HE01／HS01／HC01／HD01的題族及難度負荷、人工理由錨點／流程／空模板；13題／12題族、四候選與原reviewStatus已核對，121個文件連結有效。未改題庫、runtime、accepted或assessmentFamilies，沒有外部真人審核／正式測驗放行。缺真人期間推進獨立S5.1：正式4bb87cd合成牌例的三圖／操作短片，來源與限制將另記。帳戶47%，原窗口未變；4227本輪preview仍開，製作與正式驗收使用隔離Chrome。尚未提交本包，素材製作中，下一動作驗影片／畫面→同步README／支援及貢獻界線→文件PR與收尾。

## 前包：S3.3 已完成並驗證發布

正式完成：main Actions39019565456的365／26（30.5秒）、build117358485491與deploy117358754799均成功。正式三頁200、4／3／4份資源雜湊全相符；只改training-vkOYxEaA.js，其餘對戰與教學資源不變。正式隔離Chrome1440／390／320保存、次訪續答、已揭示曝光鎖定、schema3真實下載→本機審閱、未知skill保留存檔均通過，0pageerror／無溢出，work/s33-live.log及production.log。詳細[S33](S33-VALIDATION.md)。帳戶47%，原窗口resetsAt1792229095未變；不跨重設續跑。下一包S3.4只有準備文件與候選缺口盤點；可接獨立S5.1示範素材，真人驗證／本人貢獻確認維持待驗。4227本輪服務仍開，後續關閉；所有正式驗收Chrome已關。

發布檢查點：來源52e68f5，[PR#8](https://github.com/zhai2Liu/taiwan-mahjong/pull/8)已附chat，指定head Actions39019416117成功，365／26項（Linux33.8秒），Pages上傳與deploy skipped、0 artifact；合併4bb87cd並已回main。main Actions39019565456尚在進行，正式驗收不得先稱完成。Chrome／Edge最終來源新六項各通過（7.8／8.0秒），logs改s33-chrome-final／s33-edge-final。S3.4準備稿已落盤但未提交，沒有改題或宣稱真人放行。

本機檢查點：365 Node／check／build、Chromium26項通過，Chrome／Edge新增六項各通過。1440／390／320及原生200%續答、schema3真實下載審閱、未知skill保留已存作答、0pageerror與無橫向溢出；畫面已檢視、全合成。原檔與其他鍵不變、故障／衝突／確認保護見[S33](S33-VALIDATION.md)。文件同步續答與schema3，內容版本不變。帳戶用量41%，原窗口不變；4227本輪preview仍在，發布後關閉。下一動作指定head PR CI→main deploy→正式三頁資源與續答，再準備獨立S3.4規準；真人／實機／S6不代填。以下早期檢查點保留過程，未提交／未驗的描述由本段現況覆蓋。

2026-10-17，承接使用者本次五小時窗口（resetsAt1792229095）持續授權，分支codex/trial-draft-exposure，基線d9ff641。已實作[契約](S33-VALIDATION.md)的新鍵tw16:trial:v1手動保存／同版自動載入、原檔回復下載、嚴格128KiB與Web Locks／expectedRaw、曝光自陳schema3、共享純格式驗證trial-record.ts（Node24原生移除型別）、CLI仍讀1／2／3。舊內容／壞檔不覆寫；未知曝光不當首次，類別導引不是無提示評量；不動game／practice／learn／review鍵或AI／規則。

check通過；首次全套364項僅缺鎖測試注入方式失敗（Node24本身已有locks，undefined會採預設；改null模擬缺鎖），修正後相關16項通過（work/s33-focused.log），舊schema1／2與CLI原檔保留相容已過。全套／新真瀏覽器故障與跨頁／正式發布尚待，不能宣稱完成。目前未啟動暫存伺服器；未碰日常profile或真人資料。帳戶檢查34%，窗口未變；下一動作補續答／曝光／配額／缺鎖忙碌／跨頁／原檔下載／讀取失敗瀏覽器路徑→全套→發布。尚未提交S3.3，變更已落盤；S3.2發布證據如下。

## 前包：S3.2 已完成並驗證發布

2026-10-17發布：來源e1a59f7，[PR#7](https://github.com/zhai2Liu/taiwan-mahjong/pull/7)已附本chat，指定head Actions39017877867成功，360／二十項（Linux28.3秒），Pages上傳及deploy skipped、0 artifact；已合併032bc1c並回main。[main Actions39018073228](https://github.com/zhai2Liu/taiwan-mahjong/actions/runs/39018073228)的360／二十項（23.4秒）、build與deploy成功。正式三HTML HTTP200，4／3／4份JS／CSS引用SHA-256全與本機相符（work/s32-live.log）；index-DbMxywyF.js／index-8F0VuNEV.css、training-BqbpRj_O.js、view-BjMvH8LY.js，learning因共用view引用改名，牌面與教學邏輯不變。

正式隔離Chrome390／320完成碰成立及吃被胡截走、另開正確同類題／原局仍暫停、關閉焦點、結算再開檢討核對同一結果，0pageerror（work/s32-production.log）；全為合成資料。無外部真人程式審查、未改分支保護。所有本輪服務／瀏覽器已關，保留已合併codex/review-followup及work/合成證據；收尾純Markdown不新增main build。帳戶用量1→13→18→27%，本次窗口resetsAt1792229095，不跨窗口自行續跑。接下來S3.3手動草稿續答及曝光／版本；真人與未啟動S6維持待驗。

### S3.2開工與本機檢查點（發布前記錄）

2026-10-17。使用者授權持續推進直到本次五小時額度用完。開工main／origin/main 478fd7e乾淨，帳戶五小時已用1%，本次窗口resetsAt1792229095，比例不是精確token；不跨到下一個重設窗口自行追加工作、不使用重設或自動排程。分支codex/review-followup，先完成[S32契約與驗收](S32-VALIDATION.md)：同類練習入口、有吃碰選項的回應待仲裁完成才解釋，使用公開結果與原決策證據分開呈現。未改已發布版本；逐包驗證／提交後接可獨立後續，真人待驗、S6未授權實裝。無本輪暫存服務，未開發課4–8。

S3.2本機：360 Node／check／build、Chromium二十項（最終22.2秒）、Chrome155.0.8059.80／Edge155.0.4283.62新流程各六項通過；390／320與原生200%無橫向溢出，S32-CLAIM.jpg為合成圖。logs在work/s32-unit-final.log／browser-final.log／chrome-final.log／edge.log／visual.log。吃／碰／有吃碰可選的過在仲裁後暫停，實際成功／他家碰胡／全過分開；原evidence不讀結果，局後用同局公開history／melds／結算核對，不新增存檔。頁內等待不續存，模式／新局／重載／他頁使過期待解釋失效；未知結果不補造。靜態能力入口另開頁，skill白名單四類、未知回全部，九題版本／匯出不變。未改引擎／AI／規則，無依賴。4227已停、4226由測試關閉，所有驗收瀏覽器已關。用量檢查13%、本機18%；下一動作PR CI→main部署→三頁資源／正式操作，再接S3.3草稿與曝光／版本。未有真人資料，未做手機／Safari／螢幕閱讀器，未實裝人格AI。

## 前包：S3.1 已完成並驗證發布

2026-10-14。九題增加原生四能力選單與目標／限制／每題範圍：牌效2、吃碰3、安全2、連莊2；切題保留草稿／揭示／回饋，匯出仍全部九題。修C01／S02／C02重字與白話範圍、補C03 scope，頁首資料提醒保留必要摘要並收合細節。scripts/training-content.mjs共用九題允許名單／四類／投影／雜湊，生成及review-trial同讀，畫面／匯出／審閱總數衍生；不任意開放題量。schema2仍同欄位，版本改為d55e09290cf4d933803aaa6ffef2666895465c021f5351ea1f8fd4f26fbdda49，涵蓋導引與scope；舊cb73cd35版本轉人工，schema1保留缺版本警告。規格／版本／驗收見[S31](S31-VALIDATION.md)。

352 Node／check／build通過，Chromium十四項（19.0秒），Chrome／Edge受影響四項各通過；頁首收合後重驗兩瀏覽器四項。Chrome1440／390／320、原生200%無水平溢出，S31-GUIDANCE.jpg為空白合成畫面。work/s31-unit.log／browser.log／chrome-final.log／edge-final.log／visual.log／audit.log；來源對照確認13題答案ID／預期／牌面／題族不變、四候選完全不變，舊來源合成匯出轉人工。未改桌規、正式AI、分析或舊存檔，無新依賴。

S2.2準備提交b398e33，S3.1來源5275c43；[PR#6](https://github.com/zhai2Liu/taiwan-mahjong/pull/6)已附本chat，Actions38560552418指定head成功，352／十四項（Linux24.9秒）；Pages上傳／deploy skipped、0 artifact。已合併015ef8f並回本機main，[main Actions38560850276](https://github.com/zhai2Liu/taiwan-mahjong/actions/runs/38560850276)的352／十四項（23.8秒）、build及deploy成功。正式index／training／learn HTTP200，4／3／4份引用的JS／CSS SHA-256與本機全相符，work/s31-live.log；試讀training-CbQLU3RL.js／training-C64NK14t.css，對戰／學習及共用資源不變，site只有三HTML與JS／CSS，未含測試／文件。

正式隔離Chrome390／320分類C01兩吃法正答、E01草稿、真實JSON下載→本機審閱（7未答／1草稿／1提交、1回饋、版本一致）、取消離頁保留、入門另開頁及原稿不變；0存檔寫入／pageerror，work/s31-production.log。全為合成資料，真人人數0。4227已停，4226由測試管理已關，獨立Chrome／Edge、正式驗收與zoom profile已關，work/合成檔與profile保留且忽略。未觸日常分頁／存檔或Downloads。沒有外部真人程式審查，未改分支保護；手機／Safari／螢幕閱讀器與正式評量仍待。保留合併分支codex/training-guidance作追溯；收尾僅Markdown狀態提交，不新增main build。

五小時開工51%、內容檢查56%、本機62%、合併67%、收尾檢查68%，帳戶快照非精確token；無子代理／重設／自動續跑。S2.2只有下述準備完成，S3.1發布後接獨立S3.2（先檢視局後下一步／必要吃碰事後解釋），第4–8課與人格AI不自動啟動。

## 本輪文件包：S2.2 試用準備完成，真人驗收待驗

2026-10-14。已核對main 54803a8乾淨與S2.1發布交接；[BEGINNER-TRIAL](BEGINNER-TRIAL.md)備妥T0–T5任務、觀察要點、逐人記錄模板、協助／曝光／版本／同意、問題→修訂→複測流程。未取得真人資料，人數0，沒有理解通過或依真人回饋的修訂。原課程、保存鍵、桌規不變。文件準備完成，不等同S2.2通關；不用代理合成檔冒充受測資料。

本輪分支codex/training-guidance；接著只推獨立S3.1九題版本修訂、四能力入口與生成／匯出／審閱一致性。五小時開工51%，帳戶快照非精確token；無子代理、自動續跑或額度重設。第4–8課與人格AI仍不自動開工。

## 前包：S2.1 已完成並驗證發布

2026-10-14。獨立learn.html與首頁入口提供前三課：認牌／海底來源／字牌不可順子，沿用引擎的莊家先打→16摸花→補17→打16→下家，17及含槓18張手選五組加眼睛／反例。示範與換例分開、可跳課／重排，操作時圖解收合並帶到任務；回看或錯答推導計提示。原六步導覽保留。規格[BEGINNER-LEARNING](BEGINNER-LEARNING.md)，[S21驗收](S21-VALIDATION.md)。未改桌規、正式遊戲AI、舊存檔或九題版本，無新依賴。

新鍵tw16:learn:v1，schema1／courseVersion beginner-1-3-v1，三筆read／guided／independent、4KiB、嚴格格式與Web Locks／expectedRaw。只保存閱讀與整段完成，未完成操作重載重開；配額／讀取失敗保留，重試與未存離頁提醒；跨頁改動停止覆蓋，重讀／重新建立確認。清除等待時停用課程動作，成功才回圖解，避免丟掉等待中的新紀錄。擴第4–8課須先定保留三筆旗標的遷移。這些本機旗標不是證書／陌生題能力／防作弊或學習成效。

351 Node測試／check／build通過（work/s21-unit.log）；原八項＋三課全流程／故障兩條×兩視窗，共十二項Chromium通過。Chrome155.0.8059.40／Edge155.0.4283.45整套十二項曾通過，清除等待改動後兩瀏覽器各四項限定回歸亦通過；work/s21-browser.log、s21-chrome-learning-final.log、s21-edge-learning-final.log。1440／390／320與Chrome原生200%無橫向溢出，合成圖S21-LESSONS.jpg。所有資料為代理合成，未取得真人／專家審課；手機／Safari／螢幕閱讀器未驗。

來源a8bf2d3的PR#5已附本chat並合併a57a167，本機回main。PR Actions38553873060成功，351／十二項（Linux21.0秒），Pages上傳／deploy skipped、0 artifact；main Actions38554245076的351／十二項（22.1秒）、build與deploy均成功。正式index.html／training.html／learn.html HTTP200，4／3／4份引用資源SHA-256全與本機一致（work/s21-live.log）。index-B_AHbX-v.js／index-BTGPI-3-.css、learn-Bw2GxrMQ.js／learn-BkbYV_y2.css，共用view-DbjDdINE.js／tile-face；試讀JS／CSS不變，site無測試／文件。

正式390px隔離Chrome完成第一課示範與第二課換例，重載保存旗標、三舊鍵原字串不變，返回可見繼續上次牌局（work/s21-production.log）；第三課由本機／Linux回歸與部署雜湊覆蓋，未另做正式互動。沒有外部真人程式審查，未設分支保護。4227已停，4226由測試管理且已關，所有本輪瀏覽器／work暫存profile已關，未碰日常存檔／Downloads。保留合併分支codex/beginner-lessons作追溯；收尾只有Markdown，不新增main build。

已同步README／方向／維護／部署／ROADMAP／規格／驗收，最後連結及diff再查。五小時開工19%、中途27%、本機34%、發布43%、收尾50%，是帳戶快照非精確token；無子代理、重設或自動續跑。下一包S2.2形成性試用與修訂：先準備任務／記錄，缺真人不代填通關，可推獨立S3.1九題版本化修訂（C01順子子重字仍待）。第4–8課與人格AI不自動啟動。

## 前包：S1.3 已完成並驗證發布

2026-10-14。使用者續推S1.3，重現390／320結算sticky footer遮住Tab到胡牌拆法與檢討的焦點；style.css增加scroll-padding-block-end:6rem，新增控制的升級上限已註解。結算回歸加入實際Tab／中心命中；練習鍵盤摸打／返回／320隔離新增一條，目前四條路徑×兩視窗＝八項。src僅CSS，不改桌規、AI、存檔、題庫或匯出。

342 Node測試（work/s13-unit.log）、check／build通過；Chromium156.0.8078.4、Chrome155.0.8059.40、Edge155.0.4283.45各八項通過。Win11專業版10.0.26200／Ryzen5 9600X；Chrome隔離profile原生200%縮放及reduce聽牌回饋通過，焦點圖片S13-SETTLEMENT-FOCUS.jpg。手機／Safari／螢幕閱讀器及真人未驗，不承諾全裝置／完整WCAG。

新增scripts/browser-baseline.mjs、benchmark:browser與可選已安裝channel，無新依賴。固定feedbackReady、每瀏覽器暖身1次＋9新context，選牌中位數約29ms、解釋約64ms，Node分析約9ms；JSON與方法見[S13](S13-VALIDATION.md)，不是Pages行動網路、INP或全場景成效。產物index-pavZUWLg.js／index-BTGPI-3-.css，試讀／共用牌面不變。

已提交1576c48，PR#4已附本chat並合併1ca8a18，已回main。PR Actions38547430937成功，Linux日誌342／八項（8.1秒）通過，Pages上傳／deploy skipped、0 artifact。main Actions38547636980的342／八項（Linux11.2秒）、build與deploy均成功。正式首頁／training.html HTTP200，各自引用三份JS／CSS與本機SHA-256相符（work/s13-live.log）；正式隔離Chrome390／320實際Tab到拆法與檢討的中心命中皆可見（work/s13-prod-focus.log）。沒有外部真人程式審查，未改分支保護。4227檢視服務已停止，4226／4228由測試／工具自動關閉，瀏覽器已關閉、work/內profile／合成檔保留且忽略，真人存檔與Downloads未操作。開工五小時0%、本機檢查8%、發布檢查14%、收尾17%，非精確token；無子代理／重設／自動續跑。README／維護／部署／ROADMAP／驗收與交接已同步；收尾僅Markdown狀態提交，不新增main build。保留已合併codex/usability-baseline作追溯；下一包S2.1，不實裝人格AI。C01重字仍留S3.1版本化修題。

## 前包：S1.2b 已完成並驗證發布

2026-10-14。使用者續推，新增Playwright 1.64.0開發依賴、三條核心回歸（1440×900／390×844各一次，共六項）、正式preview4226隔離測試、CI共同build的安裝／回歸及失敗證據七天。未改src、桌規、AI、存檔或題庫。本機342測試（work/s12b-unit.log）、check／build及六項瀏覽器通過；site只有兩入口與assets，無測試範例，產物雜湊名稱未變。詳見[S12B](S12B-VALIDATION.md)。

已推送8700ba9，PR#3已附本chat。Actions38480202001成功，Linux日誌342／六項通過（8.6秒），Pages上傳／deploy skipped、0 artifact，已合併88ce2df並回main。main Actions38480378216的342測試、六項回歸（8.5秒）、build、Pages上傳／deploy均成功。部署後正式首頁／training.html各HTTP200，引用三份JS／CSS皆與本機SHA-256相同，work/s12b-live.log。沒有外部真人程式審查；main未設分支保護，CI不是強制merge gate。

preview由測試自動管理且已停止，沒有新增使用者瀏覽器分頁；下載是隔離context合成內容，未操作真人存檔／Downloads。Windows／Linux Chromium與390窄畫面通過，不代表手機／Safari／全流程或真人學習成效；CI失敗artifact分支未刻意製造故障驗證。開工五小時帳戶4%、本機完成9%、發布檢查14%、收尾15%，非精確token；無子代理／重設／自動續跑。更新README／維護／部署／ROADMAP／驗收及交接，137個受影響文件連結存在、diff格式通過；收尾提交僅狀態Markdown、不觸發main建置。保留已合併分支codex/browser-regression作證據追溯。

下一包S1.3：先重現對戰、練習、試讀在桌面／窄畫面的操作與焦點卡點，再修必要問題，記錄具名瀏覽器／裝置及首次載入、選牌／解釋基準；不預先承諾未驗的手機／Safari。完整八課S2、題目版本修訂S3.1另包，人格AI仍未授權實裝。現有C01「順子子」仍留S3.1版本化修訂，不把測試合成匯出當真人資料。

## 前包：S1.2a PR檢查已完成

2026-10-13。使用者續推，新增pull_request指向main的共同build，沒有PR路徑過濾；非PR且main才上傳Pages artifact／deploy。PR與main群組分開，PR可取消舊檢查，main仍序列；checkout不保留憑證。新增M0 cases.json／RULES.md的push觸發，未改遊戲、桌規、存檔或分支保護。

本機342測試／check／build通過，work/s12a-tests.log，產物未變。功能PR#1（03c55dd）Actions38408610153成功，build通過、Upload Pages artifact及deploy skipped、0 artifact；合併main的bc1758d，Actions38409122067 build／deploy成功。真正純Markdown PR#2（961efee，六份.md）Actions38409667408同樣通過且上傳／部署skipped、0 artifact；已合併d1bdbee，未新增push run，證明PR／main文件觸發的區別。兩PR均已附本chat，沒有外部真人程式審查。

正式首頁／training.html HTTP200，各自引用JS／CSS／共用牌面與本機SHA-256相符，首頁index-D57TZ2GI.js／index-DcXzVABB.css、試讀training-CyxzesHo.js／training-DnepUIbB.css。未改UI、桌規或資料，本輪沒有重做瀏覽器互動／實機，也未另驗fork／手動分支觸發。詳見[S12A](S12A-VALIDATION.md)。自動PR檢查已啟用，main仍無分支保護，強制merge gate未配置。

下一包S1.2b：三條核心瀏覽器流程先重現、再逐條自動化，先看現有fixtures與工具，不預設大型套件。不開始新手八課或人格AI。本輪五小時開工33%、收尾45%，為帳戶比例非精確token；無子代理／重設／自動續跑，本輪無新增伺服器或瀏覽器分頁。

已更新作品README、DEPLOYMENT、MAINTENANCE、ROADMAP及驗收；51個當時受影響文件連結存在，最後新增workflow直鏈亦已查，diff格式通過。本機已回main，兩份PR已合併並附本chat；保留已合併的工作分支作驗收追溯，不動其他分支。

## 前包：S0.1／S0.2／S1.1

2026-10-13。方向／企畫／ROADMAP／AGENTS／遊戲README已同步；根目錄新增作品README、架構圖、三個實作案例、狀態、真實擁有者／AI角色及兩分鐘展示路徑。前兩輪企畫與作品集盤點一併保留入版，歷史文件不當現況。

試讀有選項／理由／回饋時防離頁，返回牌室以原生HTML dialog明確選擇；取消／Escape保留，確認才離開。下載後修改提醒分作答／回饋，成功交由瀏覽器下載仍保留防護；下載失敗與可複製內容保留。無新存檔或匯出格式，題庫版本不變。342測試／check／build通過，work/s01-tests.log；4204空白返回、只有回饋、取消／Escape／確認、重載被攔／資料保留、TXT／JSON真實下載讀回及390窄畫面已驗，僅合成資料。詳見[S0.1–S1.1驗收](S01-S11-VALIDATION.md)。

已提交推送8b541a1、9ff2e92、1ee7b64；最終來源1ee7b64的Actions38399262115成功。正式首頁與試讀HTTP200，各自引用JS／CSS與本機SHA-256相符；首頁index-D57TZ2GI.js／index-DcXzVABB.css，試讀training-CyxzesHo.js／training-DnepUIbB.css，共用牌面不變。根目錄README已在GitHub可讀且Git blob相符。

正式站以?verify=1ee7b64排除舊HTML快取，DOM確認載入training-CyxzesHo.js；只有理由返回確認、取消／確認離開及返回上一頁後表單依自有狀態重繪已驗，正式畫面更新S11-LEAVE-CONFIRM.jpg。兩類瀏覽器還原（完整記憶體／僅表單）以控制測試及4204／正式站實際操作分別覆蓋。原生關頁／重載仍有平台限制，不宣稱持久草稿或全瀏覽器已驗。

**S0.1／S0.2／S1.1 已完成並發布，下一包 S1.2a PR 型別／測試／建置檢查；S1.2b 瀏覽器回歸另包。** C01「順子子」重字留S3.1版本化修題，本包不改題庫。

本輪116個受影響文件連結均存在，diff格式通過；4204／本輪正式驗收分頁與預覽服務已關閉，viewport已還原，真人正式存檔未操作。開工五小時帳戶用量1%，本機驗收檢查13%，發布前21%、收尾31%，非精確token；本包無子代理、未重設或自動續跑。

## 最新交付：全面強化企畫 v1.0

2026-10-13。依使用者「提供全面強化企畫書，接下來依內容推進」完成 [MASTER-IMPROVEMENT-PLAN](MASTER-IMPROVEMENT-PLAN.md)。涵蓋兩條學習路線、八課入門、進階證據／曝光／題族、操作與正向回饋、相容存檔、PR與瀏覽器驗收、真人／實機、文件治理、作品集、Sol／Luna與用量交接；S0–S5為建議主線，S6人格AI仍須另行啟動。

本輪仍只交付企畫，未改 PRODUCT-DIRECTION、ROADMAP、程式或部署，未提交推送；保留前輪作品集報告及交接修改。使用者下一次明確依企畫開工時，直接先做 S0.1 記錄採納並同步方向，接 S0.2 作品入口與 S1.1 試讀離頁防護，逐包驗收，不再把已採納例行事項反覆提問。之後 S1.2a PR 檢查、S1.2b 精選瀏覽器回歸。

Luna唯讀複核後已修：S3不必等八課完成、等待真人時可推獨立包；S0只是完成規劃；PR檢查與瀏覽器工具工作分包。正式測驗、真人成效和人格AI不得與整個基礎版綁成同一完成門檻。本企畫不把靜態題庫或本機曝光紀錄當防作弊認證。

企畫9個本機連結有效、18個工作包ID無重複、diff格式檢查通過；純文件未重跑遊戲測試／建置，未新增本機伺服器／瀏覽器分頁。五小時帳戶用量開工53%、收尾74%，非精確token；未重設或新增自動續跑。

## 前包評估：履歷作品集準備度（待選工作包）

2026-10-13。使用者詢問全專案作為 vibe coding 履歷作品的缺口，尚未確定職缺方向。已完成 [作品集檢視報告](PORTFOLIO-READINESS-REVIEW.md)：優先根目錄 README／本人與 AI 分工、短版展示、三個工程案例，再補真人可用性與精選瀏覽器證據。確認根目錄無 README、topics 空、無 LICENSE／tag／Release；現有 CI 與驗收是優點，不能把 340 測試當學習成效。正式首頁／試讀入口已唯讀查看，Actions 38348866774 成功；本輪未重跑測試、修改功能或部署。

本次僅評估與本機文件，未提交推送；W1–W4 建議尚未採納，不取代進階決策訓練主線、不自動實作新手課或人格 AI。使用限定 Luna 子代理唯讀複核工程缺口。若續接先確認使用者要整理作品集或繼續產品工作，不因本報告自行改所有定位／技術架構。

報告 15 個本機連結均存在，diff 格式檢查通過；唯讀分頁已關閉。本輪五小時帳戶用量由 4% 至 29%，非精確 token；未重設或建立自動續跑。

## 最新功能工作包：台灣牌桌用語調整

2026-10-13。使用者要求先以台灣本地俗稱為主要用詞；已調整對戰、練習、教學、結算拆法、檢討及兩份題庫玩家文字：條／眼睛／海底／單吊／雙頭／打牌／手牌，向聽改白話聽牌距離，面子改完整牌組，計台名稱保留。規則、算法、AI、牌局存檔及答案 ID 不變。用詞與維護界線見 [LOCAL-TERMS](LOCAL-TERMS.md)。

配合修題新增作答 schema 2 的 contentRevision，涵蓋完整九題的內容；審閱工具接受舊 schema 1，新版版本不符轉人工核對，不默默重評。340測試、check／build 通過，work/local-terms-tests.log；4203教學、練習、E01及實際 JSON 下載讀回已驗，僅合成資料。完整新手路線仍是下段提案，尚未實作。已提交推送 fb438a7，Actions 38348866774 成功。正式首頁 index-D57TZ2GI.js 與試讀 training-CzsWJpwT.js 及各自 CSS／共用牌面資源 SHA-256 均與本機一致。4203 分頁／伺服器已關閉、viewport 已還原。五小時起始用量22%、收尾34%，為帳戶比例而非精確 token，未重設或自動續跑。

下一包可完成試讀離頁保護，或在使用者採納後啟動新手課。正式能力測驗仍待真人理解、陌生題與難度／曝光驗證，不因用語改善或版本標記就通關。

## 前包方向評估：完整新手路線與用語（待採納）

2026-10-13。使用者詢問如何加入完整台灣麻將新手教學及調整陌生／疑似日麻用語。已完成唯讀盤點與 [新手學習提案](BEGINNER-LEARNING-PROPOSAL.md)：建議從零學習與進階決策兩入口、八課循序操作及桌邊常識補充，先做用語／題目版本與離頁保護。既有六步只是操作導覽；指定玩家文字未發現把立直／振聽／寶牌等當本桌規則，主要為術語解釋與在地呈現缺口。面子等亦見台灣遊戲官方用語，不能一律當日麻詞刪除。

本包為評估提案，未改 PRODUCT-DIRECTION 的已採行定位或新手「維護不擴充」條款，未實作／發布新手課。正式採納後再更新方向與 ROADMAP；不要把提案或子代理盤點當成真人新手驗證。本輪僅文件，未重跑遊戲測試或部署。

## 最新功能工作包：出牌後解釋

2026-10-13。提示改為不提示／出牌後解釋／即時輔助；沿用既有 on/off 偏好並新增 after。真人成功捨牌後暫停，以出牌前公開觀察顯示原選擇與最多兩個候選；完整合法候選仍可展開。關閉／Escape 後自行繼續。吃碰等其他動作未自動解釋，不改 AI、桌規或牌局／檢討存檔格式，也不是正式測驗。

339 測試、check／build 通過，4202 實際雙擊／鍵盤出牌、暫停、Escape、重載偏好及 390 窄畫面已驗。保存或解釋失敗不撤銷有效出牌。見 [驗收與限制](AFTER-DISCARD-VALIDATION.md)。已推送 bcf5e61，Actions 38324084921 的 build／deploy 皆成功。正式首頁與試讀頁引用 JS／CSS 的 SHA-256 與本機相符；新首頁產物 index-VDtmAL5K.js。4202 測試分頁、伺服器已關閉，viewport 已還原；真人牌局存檔未操作。五小時開工用量 40%、發布前檢查 77%，非精確 token；未使用重設或自動續跑。

下一包可補題目版本追溯、試讀離頁保護；真人試讀資料尚未取得，正式測驗的難度／題族與曝光驗證仍待，不能以此取代。模式未記錄曝光，事後提示對局不可當無提示學習成效證據。

## 前包：L3-B0作答紀錄本機審閱

2026-10-13。新增 scripts/review-trial.mjs：明確指定 JSON 檔，驗證版本、九題完整性、容量與狀態，區分草稿／已提交，核對目前題幹與已選選項；異動轉人工、理由不評分、無總分。不掃描下載資料夾、不修改原檔、不上傳。schema 1 無完整題目版本，所以即使比對一致也不代表歷史判分或真人理解證據。

流程見 [TRIAL-REVIEW](TRIAL-REVIEW.md)；原始資料與報告留 Git 忽略的 work/，不得當作公開發布文件。4 項新測試、全套 336 項測試及 build 通過，work/trial-review-tests.log。正式產物雜湊維持前包；未改桌規、AI、存檔或頁面。尚未取得真人試讀檔，所有本包驗證均為合成資料。

已提交推送 6aef2b9，Actions 38322763212 成功；正式首頁與 training.html 均 HTTP 200，各自引用的 3 個 JS／CSS 資源與本機建置 SHA-256 相符。純本機審閱工具，本輪不重做未改動的瀏覽器互動驗收。額度開工五小時用量 0%、檢查點 17%，非精確 token；未使用額度重設或自動續跑。

下一包優先處理使用者明確提供的 JSON／txt，按題號整理問題與修訂；正式測驗仍待題族／難度及真人理解驗證，不能以整理工具或模型測試替代。若尚無真人資料，不宣稱 L3-B 或 L4 已完成。

## 前包：L3-B0九題內容試讀完成

2026-10-12。首頁連至獨立training.html：九題先答再揭示、理由未評閱、切題保留本頁草稿，離頁清除且不動對戰／練習存檔。四道保留候選不入試讀包。詳見[L3-B0驗收](L3B0-TRIAL-VALIDATION.md)。331全套測試、check／build通過，最後文句調整再建置及2項試讀測試通過。

4198內建瀏覽器驗入口、空答、正答／錯答、焦點、理由保留、九題邊界、返回及390窄視窗；未驗手機實機／Safari。產物index-BjqaUbPB.js、training-DJ_axvds.js；多頁共用preload產物。原包1387fd0的Actions38190450639成功，正式training.html已用瀏覽器確認。額度起始61%，檢查86%，非精確token；未重設或自動續跑。

本輪新增固定題號及本頁回饋下載／複製回退；331測試、check／build通過，work/l3b0-feedback-tests.log。4199真實下載及txt內容已核對，僅合成意見；沒有真人回饋。新試讀產物training-BJqf3_zf.js，已提交推送26ce2f0，Actions38209891377成功；正式試讀JS雜湊一致，瀏覽器已見固定題號與下載控制。4199測試伺服器及本輪本機頁已關閉，正式試讀頁保留供使用者。新額度視窗起始1%、收尾29%，非精確token，未使用重設。

使用者表示先推可獨立進度：已加7題中立牌面區域、重用現有SVG；D01／D02不虛構牌型。332全套測試／build通過；E01桌面及C03窄畫面已驗。產物training-CFLzpfeU.js、training-CcqyaFRd.css、共用tile-face-CG76dTyt.js、主頁index-BWC_FWDQ.js；已推送2e3c960，Actions38210221364成功；正式首頁與試讀頁JS／CSS及共用牌面產物雜湊相同，正式瀏覽器已見E01牌面。4200驗收伺服器與本機頁已關閉，正式試讀頁保留。

本輪追加作答JSON匯出（選項／理由／回饋＋題幹快照，區分未答／草稿／已提交揭示），原txt仍只含回饋，均不自動上傳。332全套測試／build通過，4201實際下載及讀回已驗。產物training-bbdO46e3.js／training-BooQQSia.css；已推送e0e676e，Actions38219737553成功；正式JS／CSS雜湊相同，瀏覽器可見匯出按鈕。4201及本輪測試頁已關閉；正式頁保留。額度起始73%、收尾95%，非精確token，已收斂交接，未重設。

下一包可接收使用者匯出的作答JSON或回饋txt整理進專案，再修訂和校準；不宣稱正式測驗或學習成效。主流程未改桌規、AI或存檔。src/training-data.ts由check/dev生成且Git忽略，維護題目改原JSON。

## 前包：L3-A3分開模型複核完成，正式測驗未通關

2026-10-12。前包7d618cc已推送，開工工作樹乾淨。由Sol主流程與唯讀Luna子代理l3_content_review分工，13題答案集合無誤；不是盲測、真人或領域專家驗證。詳見[L3-A3](L3A3-MODEL-REVIEW.md)。新增HC01已聽後碰牌8張降3張、HD01近家莊攔胡且續莊；總13題／12題族，9訓練、4保留候選。

reviewStatus全改model-reviewed-not-calibrated；assessmentFamilies仍空。已補四能力難度矩陣，不能直接匹配前後測。329全套測試、check／build通過，work/l3a3-tests.log；JS／CSS仍index-BOSlEFW6.js／index-DcXzVABB.css。未改正式玩法、AI、桌規或存檔。已推送aed9677，Actions38189985087成功；正式首頁及JS／CSS雜湊與本機相同。後續文件收尾不改產物。

下一包L3-B0可做僅9訓練題的內容試讀：先作答再揭示，理由未評閱，不給牌技總分。保留4候選不上試讀題池；正式L3-A／G3仍等題意試讀、題族與難度驗證，不讓原型取代學習證據。人格／收益模型繼續離線。五小時起始32%，收尾檢查56%（帳戶比例，非精確token）；未重設或建立自動續跑。

## 前包：L3-A2內容自查與候選題（尚未通關）

2026-10-12。核實前次63b0ee2的Actions38054156297成功；e166b93文件已推送，開工工作樹乾淨。前輪最後額度實為100%，此次新視窗起始3%、收尾檢查28%；是帳戶比例，不是精確token，未重設。

完成原8題逐題自查，修正E01題幹／公開牌測試及C01／C02理由評閱界線；新增C03吃碰代價訓練、HE01當下胡牌與未知池、HS01逐家安全候選。共11題／10題族，9訓練與2保留候選；都待內容審核。詳見[L3-A2內容複核](L3A2-CONTENT-REVIEW.md)。沒有不同審核者核對或等難度證據，assessmentFamilies仍空，不能宣稱L3-A整包／正式測驗已完成。

327全套測試、check／build通過，記錄work/l3a2-tests.log。正式產物仍index-BOSlEFW6.js／index-DcXzVABB.css；本包未改src、桌規、AI或存檔，也不需要新的UI互動驗收。本輪無新增本機伺服器或子代理；前輪4196是否仍存活未檢查，不動不明來源程序。本包已提交推送d348fed，Actions38189534557成功；正式首頁引用及JS／CSS SHA256與本機一致。後續文件提交不影響產物。

下一包：不同審核者內容核對，補吃碰／續莊的候選機制，匹配難度並確認題族距離；再接最小L3-B試作。HE01／HS01目前較訓練題多一步，不能直接拿來作等難度前後測。人格／收益模型仍離線。

## 前包：L2-B已發布；L3-A1八題草案已交叉核對

2026-10-10。本輪先補齊前次a1fd581，再提交dfc6205並發布。Actions38053664083成功；正式首頁／JS／CSS200且產物SHA256相同，正式保存區及既有存檔辨識已驗，見[L2-B發布紀錄](L2B-RELEASE-20261010.md)。結算檢討全流程與390窄視窗在獨立4196驗收；未動正式遊戲存檔，手機實機／Safari未驗。

L3-A1新增8題／7題族／4能力，資料在TRAINING-DRAFTS.json，6項交叉驗證＋全套共323測試通過。詳見[L3-A1](L3A1-QUESTION-DRAFTS.md)。全部是待內容審核的訓練草案，沒有保留測驗題、沒有正式出題／評分功能，未接bundle。不能把作者推導或機械測試當外部專家審核及學習成效。

L3A1文件已補八題理由評閱錨點草案，尚未自動評分。下一包L3-A2：逐題獨立內容審核、核對理由規準、另建難度匹配且題族不同的保留題，再進L3-B。只換花色／牌序不算陌生題，C01／C02必同題族；不靠AI選牌定答案。人格／攻守仍離線。

五小時本輪起始3%，收斂檢查89%，非精確token；不重設、不建自動續跑。原始產品報告及各包歷史限制保留，當前完成度以本節為準。

## 前包：L2-B2局後靜態比較

2026-10-10新工作輪，五小時起始已用3%，檢查46%；非精確token。前次最後提示修正已補提交a1fd581；312測試與產物核對完成，沒有遺留半成品。

已接「本局決策檢討」結算入口：一次查看三筆之一，原選擇與候選牌效／對手別安全範圍、吃碰後捨及公開局況，保留全部合法選項。317全套測試通過，最後45項控制器／格式再驗、build成功。內建瀏覽器真實完成局＋390窄視窗、焦點返回、分數不重付已驗。詳見[L2-B2驗收](L2B2-REVIEW-UI-VALIDATION.md)。

本機產物index-BOSlEFW6.js／index-DcXzVABB.css。尚待本輪發布核對；未驗手機實機／Safari，不宣稱AT-09全面通過。L3題庫與學習驗證尚未完成。

下一步先核對遠端與發布條件，若發布則驗CI與正式站；再以獨立工作包推進L3-A題族／審核清單，不能用AI選牌當答案或換花色當陌生測驗。人格／攻守仍離線。

## 前輪：L2-A接線完成、L2-B1比較資料層完成

2026-10-10。本輪由五小時帳戶已用3%推進，最新檢查92%；比例不是精確token，不使用重設額度。完成998bc69（A2）與c9f619c（A3），本包新增hand-review及牌局保存失敗防護。312全套測試／check／build通過。工作包分別見[L2-A2](L2A2-DECISION-SNAPSHOT.md)、[L2-A3](L2A3-RECORDING-VALIDATION.md)、[L2-B1](L2B1-HAND-REVIEW.md)。

真人動作接受且牌局保存成功後才保存決策前快照；若牌局保存失敗，明示略過這筆，避免檢討超前舊遊戲存檔。檢討失敗不影響牌局，待存最多20筆、手動重試、清除先確認。原生鎖及內建瀏覽器雙擊、續局、取消清除、配額故障／恢復補存均驗過。

L2-B1僅提供最近三筆可比較決策／原選擇／並列候選資料，尚未提供局後比較畫面。下一包L2-B2直接依該文件接結算入口與dialog，補空檔、壞檔、結算不重付及瀏覽器驗收。AT-09指定實機與AT-10發布仍未完成，不能說訓練MVP已上線。

本輪未推送／部署。前次收尾補齊提示自動展開，312測試通過，產物index-iQcOSbi-.js／index-CmJt2tzJ.css。4194測試伺服器與驗收頁已關閉，測試資料僅此來源；正式站與使用者原4173存檔未改。需發布時重新確認遠端、Actions與正式資源，不能引用歷史成功當本輪發布。

## 前包：L2-A3真人記錄與故障隔離

L2-A實作及限定驗收完成，見[L2-A3](L2A3-RECORDING-VALIDATION.md)。308測試／build通過；內建瀏覽器續局、雙擊、取消清除、檢討配額故障及恢復補存已驗。接上獨立review:v2，舊遊戲／練習格式不變。未推送／部署，L2-B尚未完成。下一包本局少量靜態比較；AT-09實機／AT-10發布仍另驗。

## 前包：L2-A2公開快照／跨頁互斥（L2-A尚待接線）

2026-10-10新增decision-snapshot與鎖定保存介面，新鍵tw16:review:v2。303測試／build通過；內建瀏覽器兩個iframe競爭驗收PASS。詳見[L2-A2](L2A2-DECISION-SNAPSHOT.md)。尚未接main，bundle不變、未推送／部署。下一包真人成功操作後記錄、通知／清除與回歸；不能宣稱AT-07已全過。

## 前包：L2-A1最小捨牌資料／保存

新增review-store.ts及6測試；[契約與限制](L2A1-REVIEW-STORE.md)。294全套測試、check／build通過，正式bundle不變。模組未接main／UI，不自動記錄真人，不動舊Session／練習。未推送／部署。

只支援待捨E17的最小DTO，非完整Observation；不能直接丟回decisionEvidence。嚴格白名單／版本／牌權／容量／選擇、20筆及字節上限、單次寫入失敗保留原檔已驗。expectedRaw只拒絕已知過期寫入，不是跨頁交易鎖；**不得直接接正式對局**。下一步先補公開局況／吃碰快照、重算介面與跨頁互斥，再接動作成功後記錄及通知／清除UX。AT-07尚未全面通過，L2-B未開始。

本輪起始帳戶五小時已用72%，檢查84%（剩16%），非精確token；先完成小包交接，未重設額度。

## 前包：L1-B最小決策證據封裝

新增src/decision-evidence.ts與7項測試；[契約與驗收](L1B-EVIDENCE-CONTRACT.md)記schemaVersion=1、analyzerVersion=tw16-evidence-1、候選Intent／穩定id、E1牌效、E2對手別proven／unknown、E3限定牌效偏好。E17改善數／比例不適用，輸出null；不讀事後結算或私有資料。288全套測試、check／build通過，正式bundle仍index-BEUwn2va.js／index-CmJt2tzJ.css，未接UI／AI／存檔，未推送／部署。

L1-B帳戶五小時起始已用46%、收尾66%（剩34%），非精確token。L1-A／B限定內部證據工作完成，非新訓練MVP上線或學習效果驗證。輸入只限引擎新產生Observation；基本防呆不取代L2外部／存檔嚴格驗證。L1-B不得被當成任意JSON安全載入器。

## 前包：L1-A核心證據驗收

[驗收清單與結論](L1A-EVIDENCE-VALIDATION.md)含12類案例的條件、預期、推導與限制。新增test/evidence-boundaries.test.mjs三項測試：16種手算牌池及並列集合、可見資訊相同但實際可胡不同的兩個世界、普通放槍安全後莊仍自摸／流局續莊兩分支。281全套測試、check／build通過；src、正式AI、桌規、存檔及bundle不變。未推送／部署。

L1-A本輪帳戶五小時起始已用26%、收尾41%（剩59%），非精確token；未重設。L1-A底層驗收完成；G1及L1整包尚未完成，正式證據格式、版本、unknown及穩定呈現仍需L1-B。並列集合可重現，不等於已驗UI排序；局部安全不代表防止自摸／流局續莊。

## 前包：L0與方向調整（歷史證據）

- 原始報告完整複製入專案，SHA256與Downloads原檔一致；保留提案原文，本次決議另記。
- 更新ROADMAP、訓練設計、README、啟動AGENTS及研究／發布註記；PROJECT-REVIEW保留歷史快照。
- [L0-L1-PLAN](L0-L1-PLAN.md)已查核實際API／呼叫鏈、資訊邊界、證據案例、最少檔案與快照／存檔風險；方案未實作。
- 本輪重新278項測試全過、check／build成功。bundle仍index-BEUwn2va.js／index-CmJt2tzJ.css。未更動src、桌規、現行AI或存檔。

## 版本基準與證據界線

開工本機fe909ee，遠端main即時查為57a0921；14870ee研究及fe909ee文件未推送。本包另作本機文件提交，未推送／部署。最新Actions37662675210來源f944292仍成功；正式首頁與JS／CSS本輪HTTP200。不含本輪瀏覽器互動或手機實機驗收；無新部署，不能宣稱新訓練已上線。

## 下一個工作包

L2-B已發布，接L3-A2內容審核與題族隔離；詳見最新完成節。歷史限制以後續驗收為準。

不接人格／阻莊權重至正式AI，不先蓋快照框架，不做全面風險概率或收益。60題及6–10人不是固定交期或統計充分門檻；本輪未招募試用者。既有研究保留供通過驗收後選用。

## 固定界線

- TW16-CLASSIC-v1，144張含花、16張五面子一對；莊胡及流局續莊。RULES唯一權威，不套日麻振聽。
- AI／教練只讀指定getObservation；新快照要額外白名單，排除settlement及事後資料，不讀暗牌／牆／種子。
- 現行Session、GameState、練習皆v1；對戰tw16:TW16-CLASSIC-v1:save、練習tw16:practice:v1、偏好tw16:coach:v1。新檢討鍵tw16:review:v2已接線；Session／練習格式不變。
- 舊檔完整驗證，失敗保留；跨分頁停止，結算不重付。未知不等於危險，公開K/N不是實際摸牌率，研究權重不是概率。
- Sol主導，Luna僅必要限定協助；本輪無子代理。帳戶五小時起始已用1%、收尾檢查21%（剩79%），不是精確token。保持最少程式與依賴，scratch放work/，輸出放outputs/；額度為帳戶比例，非精確token。

正式站：https://zhai2liu.github.io/taiwan-mahjong/；origin：https://github.com/zhai2Liu/taiwan-mahjong.git。歷史L0未啟動本機伺服器；本輪使用4194測試來源，未動使用者原存檔。

原M0–M5.4、M6三個離線包與歷史部署證據保留於[2026-10-08交接](HANDOFF-20261008.md)，舊「下一步」已被本文件取代。
