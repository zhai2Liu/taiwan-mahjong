> 歷史快照：2026-10-17至18的交接與途中紀錄，含S5.2前及本輪九包。現況、發布與下一步只依[HANDOFF](HANDOFF.md)及[ROADMAP](ROADMAP.md)，下文歷史未完成狀態不代表現況。

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


---

## S2.3／S2.4準備及S4.2 A／B發布後快照

以下保留2026-10-17文件檢查工作包開始前的完整交接；歷史下一步與用量不是現況。

# 現行交接入口

更新：2026-10-17（Asia/Taipei）。先讀本檔與[ROADMAP](ROADMAP.md)，設計依[PRODUCT-DIRECTION](PRODUCT-DIRECTION.md)及[MASTER企畫](MASTER-IMPROVEMENT-PLAN.md)。歷史明細移到[本日前交接](HANDOFF-HISTORY-20261017.md)，需要特定證據才讀；歷史「下一步／尚未完成」不覆蓋本檔。

## 現況與下一步

S4.2新手重讀保留已發布：來源8fe4564、[PR#15](https://github.com/zhai2Liu/taiwan-mahjong/pull/15)合併f994fa2。PR Actions39045048994成功399／38（40.1秒），main39045246989成功399／38（35.2秒）、build117432567895／deploy117432905099成功。正式三頁200及引用4／3／4份JS／CSS SHA-256與site相同；正式隔離context重現先寫入失敗再讀取失敗，核對本頁進度／原文保留及0pageerror。八個公開檔案雜湊與f994fa2 git blob相符。詳[S42](S42-ACCESSIBILITY.md)及BEGINNER-LEARNING；本機Chrome／Edge受影響各6項通過，沒有改三課格式／鍵／規則／AI。

B包logs：work/s42-read-before-tests.log、s42-read-before-evidence/、s42-read-targeted.log、s42-read-tests.log、s42-read-build.log、s42-read-browser.log、s42-read-chrome.log、s42-read-msedge.log、s42-read-pr-ci.log、s42-read-main-ci.log、s42-read-public.log、s42-read-live-assets.log、s42-read-live-ui.log、s42-learning-read-before／after.log。帳戶31%→35%，同窗口resetsAt1792266558，非精確token；持續目標有效，4230仍在（session80087）。下一獨立維護包把反覆手動的md連結檢查收斂為標準命令；已讀查含M0的82份／487鏈、全部在Git追蹤且0失效，原型work/check-doc-links-prototype.mjs。

S4.2牌面／強制色彩修正已發布：來源69439e8、[PR#14](https://github.com/zhai2Liu/taiwan-mahjong/pull/14)合併1f91996。PR Actions39044088421成功399／32（36.7秒），main39044234956成功399／32（29.3秒）、build117429668346／deploy117429929423成功。正式三頁200、引用4／3／4份JS／CSS SHA-256與site相同；正式隔離Chrome系context驗海底圖片名稱、暗槓遮罩、強制色彩雙線選取、原牌局保存不變及0pageerror。九個公開檔案雜湊與1f91996 git blob相符。限定範圍見[S42](S42-ACCESSIBILITY.md)，本機Chrome155.0.8059.80及Edge155.0.4283.62各6項通過；尚無手機／Safari／真人輔具驗收。

本輪持續目標有效。下一包已重現：寫入失敗後重讀也失敗，學習頁會先清空本頁進度及dirty離頁提醒；原存檔未改。work/s42-learning-read-before.log及work/s42-learning-read-audit.mjs可重跑。接著改為讀取／驗證成功才替換記憶體，失敗保留本頁紀錄與提醒。4230隔離preview仍在（session80087），4226回歸及額外context均結束；不動原4173或日常profile。A包logs：work/s42-before-tests.log、s42-before-evidence/、s42-tests.log、s42-browser-final.log、s42-chrome-final.log、s42-msedge-final.log、s42-pr-ci.log、s42-main-ci.log、s42-live-assets.log、s42-live-ui.log、s42-public.log，before／after視覺及語意log亦保留。

前包S2.4準備完成（2026-10-17）：來源7f7e291、[PR#13](https://github.com/zhai2Liu/taiwan-mahjong/pull/13)合併36aa912。第7–8課固定整局腳本／實桌附錄及8個從真實DEAL到結算／合法選過的分支已備；全套399／26，PR Actions39042980660成功（34.8秒），main39043175446成功（33.0秒），build117426596946／deploy117426915027成功。正式三頁200及4／3／4份JS／CSS SHA-256與本輪site相同，網頁仍4bb87cd功能內容；六個公開檔案與36aa912 git blob相符。教材／牌例見[S24](S24-LESSON-PREPARATION.md)，logs為work/s24-tests.log、s24-build.log、s24-pr-ci.log、s24-main-ci.log、s24-public.log、s24-live-after.log。未改runtime／依賴／三課進度，S2.4互動頁、真正暫停／中途保存及正常對戰連接未整合；實桌附錄未加入外部罰則。

使用者要求用本次五小時額度持續推進；新窗口起始0%、最近15%、resetsAt1792266558，不沿用上輪40%，非精確token。每包完成驗證、提交及更新本檔；下一包S4.2已重現：強制色彩下組牌選取只剩顏色、靜態牌面無圖片語意。work/s42-forced-colors-before.log／png及s42-tile-before.log；4230隔離preview仍在，session80087，測試context已關，尚未改runtime。後五課正式整合仍沿前三課試用／修訂順序，真人0、S6未啟動。無子代理、重設額度或新增排程／自動續跑，持續目標有效。

前包完成（2026-10-17）：S2.3第4–6課教材／引擎牌例準備，來源54d9e11、[PR#12](https://github.com/zhai2Liu/taiwan-mahjong/pull/12)合併aa02c78並回main。交付[S23教材](S23-LESSON-PREPARATION.md)及test/learning-next.test.mjs：吃碰／三槓、過水正反例、逐條台項與按付款對象計莊連台，共26個牌例通過；本機全套391測試／check／build通過。PR Actions39039769390指定head成功391／26（Linux29.5秒），上傳／deploy skipped；main Actions39039947228成功391／26（29.7秒），build117417193728與deploy117417482632成功。

正式三頁200、4／3／4份JS／CSS SHA-256在部署後均與本輪site相同；最新發布提交aa02c78，網頁功能內容仍4bb87cd。六個公開檔案200且SHA-256與aa02c78 git blob相符，五份文件85個本機連結有效。首次核對發現改聽例有一／四／七筒三口，已用三種具體拆法修正教材及預期，未改引擎。logs：work/s23-lessons.log、s23-tests.log、s23-build.log、s23-live-before.log／after.log、s23-pr-ci.log、s23-main-ci.log、s23-public.log。未改src／依賴／三課進度／其他存檔，S2.3互動頁及真人理解尚未完成。帳戶27%→34%→40%，同窗口resetsAt1792247167，非精確token；無子代理／重設／自動續跑。

上一包S5.1已完成：69.08秒字幕片／13段VTT與可重錄工具，來源cd0a778、合併daea897，PR#11指定head 365／26通過；七個公開檔案雜湊相符，詳[S51](S51-DEMO-VALIDATION.md)。分工本人已確認，不再重問。

S3.2／S3.3已發布；S3.4審核準備、S5.1素材及S5.2技術準備已合併。教材包S2.3／S2.4沿4bb87cd內容重發；目前正式呈現修正已是1f91996，不再用4bb87cd當最新資源基準。S2.2真人仍0、S2.3互動頁未完成。

S2.4腳本／附錄準備及發布核對已完成，下一包為S4.2桌面可及性／操作檢查；後五課正式整合仍沿前三課試用／修訂順序。真人資料只阻擋相應理解／難度／成效及實機結論，不代表整個專案必須停工。S3.4正式放行、S5.2授權／Release及另擬履歷摘要仍待；S6需另外啟動，不從研究直接實裝。

| 範圍 | 實際完成／限制 |
|---|---|
| 既有對戰／練習 | M0–M5.4正常行牌、1真人＋3公平本地AI、逐項計台、本機續局、牌效練習、操作導覽；原引擎與AI未被本輪替換 |
| S0／S1 | 雙學習路線、作品入口／案例、離頁與匯出保護、PR CI、瀏覽器回歸、焦點及效能基準已完成 |
| S2.1／S2.2 | 前三課可操作及獨立進度已發布；T0–T5真人試用準備完成，沒有新真人觀察資料，八課未完成 |
| S2.3準備 | 第4–6課課文／示範／換例／回饋及26個引擎牌例已備；未接課程頁，未擴三筆進度，真人未驗 |
| S2.4準備 | 第7–8課固定整局腳本／實桌附錄及8個引擎分支已備；未接課程頁，未開中途保存／正常對戰連接 |
| S3.1 | 九題四能力導引、內容版本／生成／匯出同步已發布 |
| S3.2 | 局後同類練習另開頁；有吃碰選項的吃／碰／過正常仲裁後才解釋，關閉保持暫停。實際取得牌與原快照證據分開 |
| S3.3 | 手動本機保存／同版自動續答、重讀／清除確認、原檔回復下載、schema3曝光自陳；CLI仍讀1／2／3。不自動上傳、未授權匯入或靜默遷移 |
| S3.4 | 四候選缺口、人工理由錨點／審閱流程／空模板完成；13題／12題族、四候選不進正式試讀，assessmentFamilies仍空，無正式評量放行 |
| S5.1 | 三圖／案例／分工確認已備；69.08秒字幕片及重錄工具已通過本機／PR／公開檔案核對，S5.1完成 |
| S5.2 | 發布／履歷草稿、來源盤點、指定版本同源回退與前進完成；未建立Release／tag／LICENSE，相關決定待本人 |

## 本輪交付與修改入口

- [S2.4腳本與牌例](S24-LESSON-PREPARATION.md)：真實發牌的固定整局、不同結果與選過，實桌概念不帶入外部罰則；整合限制明列。
- [S2.3教材與牌例](S23-LESSON-PREPARATION.md)：單一教材入口，測試ID對應課文；吃碰／三槓／過水／結算沿凍結引擎，進度擴充與回退先決事項明列。
- [S3.2](S32-VALIDATION.md)：hand-review.ts的claimResolution核對公開打牌／牌組／結算；main頁內待解釋快照只等正常RESOLVE，不重送動作，模式／重載／他頁使舊等待失效。證據仍只用原決策快照。
- [S3.3](S33-VALIDATION.md)：training-draft.ts管trial:v1封套；trial-record.ts純格式驗證供瀏覽器／Node24 CLI共用。training.ts處理手動保存、衝突、原檔下載與已存離頁。內容revision未改。
- [S3.4準備](S34-ASSESSMENT-PREPARATION.md)、[真人回饋清單](HUMAN-FEEDBACK-CHECKLIST.md)、[前三課任務](BEGINNER-TRIAL.md)：剩餘人工工作與紀錄格式。
- [示範三圖與短片](../taiwan-mahjong-showcase/README.md)、[S5.1核對](S51-DEMO-VALIDATION.md)、[S5.2草稿／來源／回復](S52-RELEASE-PREPARATION.md)。素材公開原檔HTTP200且SHA-256與提交相符。
- [MAINTENANCE](MAINTENANCE.md)管資料流與修改位置；[DEPLOYMENT](DEPLOYMENT.md)管正常發布及故障處理；[TRIAL-REVIEW](TRIAL-REVIEW.md)管真人匯出接收。先看具體修改位置，不全讀歷史研究。

## 指定提交與發布證據

| 包 | 來源／合併 | 指定head檢查與正式驗證 |
|---|---|---|
| S3.2 | e1a59f7／032bc1c，[PR#7](https://github.com/zhai2Liu/taiwan-mahjong/pull/7) | PR39017877867、main39018073228成功；360／20，正式三頁及仲裁／練習入口通過 |
| S3.3 | 52e68f5／4bb87cd，[PR#8](https://github.com/zhai2Liu/taiwan-mahjong/pull/8) | PR39019416117成功365／26（33.8秒）；main39019565456成功365／26（30.5秒）、build117358485491及deploy117358754799成功 |
| S3.4／S5.1 | 51e105c／6b8e5ea，[PR#9](https://github.com/zhai2Liu/taiwan-mahjong/pull/9) | PR39020052983成功365／26（28.8秒）；純文件／展示，無新Pages部署 |
| S5.2 | d8e8701／b265a83，[PR#10](https://github.com/zhai2Liu/taiwan-mahjong/pull/10) | PR39020532423成功365／26（33.7秒）；純Markdown，無新Pages部署 |
| S5.1補版 | cd0a778／daea897，[PR#11](https://github.com/zhai2Liu/taiwan-mahjong/pull/11) | PR39034074956成功365／26（30.3秒）；七個公開檔案雜湊相符，無新Pages部署 |
| S2.3準備 | 54d9e11／aa02c78，[PR#12](https://github.com/zhai2Liu/taiwan-mahjong/pull/12) | PR39039769390成功391／26（29.5秒）；main39039947228成功391／26（29.7秒），部署成功且三頁資源相符 |
| S2.4準備 | 7f7e291／36aa912，[PR#13](https://github.com/zhai2Liu/taiwan-mahjong/pull/13) | PR39042980660成功399／26（34.8秒）；main39043175446成功399／26（33.0秒），部署及三頁資源通過 |
| S4.2牌面／強制色彩 | 69439e8／1f91996，[PR#14](https://github.com/zhai2Liu/taiwan-mahjong/pull/14) | PR39044088421成功399／32（36.7秒）；main39044234956成功399／32（29.3秒），正式資源／限定UI通過 |
| S4.2重讀保留 | 8fe4564／f994fa2，[PR#15](https://github.com/zhai2Liu/taiwan-mahjong/pull/15) | PR39045048994成功399／38（40.1秒）；main39045246989成功399／38（35.2秒），正式資源／讀取故障通過 |

九個PR均已附本chat。PR的Pages上傳／deploy skipped，無Pages產物；沒有外部真人程式審查或分支保護修改。不要只拿舊CI當新變更證據。

正式站：https://zhai2liu.github.io/taiwan-mahjong/；origin：https://github.com/zhai2Liu/taiwan-mahjong.git。S3.3正式index／training／learn HTTP200、全部4／3／4份JS／CSS SHA-256與本機相符；S5.2及本輪S2.3準備部署後再核對仍未變。最新index-QYDJZATp.js／index-8F0VuNEV.css、view-BptEx-mj.js、learn-By-3MGNT.js／learn-s-i9bbyn.css，training-vkOYxEaA.js未變。

## 驗證範圍與資料契約

S3.3既有功能驗收為365 Node／check／build、Chromium26項通過；Chrome155.0.8059.80／Edge155.0.4283.62受影響六項各通過。1440／390／320與Chrome原生200%（CSS720×450、dpr2）無橫向溢出，保存續答／schema3真實下載→本機審閱通過；正式Chrome1440／390／320亦0pageerror。全部是隔離合成資料，不能當真人理解、手機／Safari／螢幕閱讀器或普遍學習成效。

S5.2同源4229演練032bc1c↔4bb87cd：有效結算、已有一捨一摸的練習、一筆合法決策、課程閱讀／提示完成、新版試讀保存；五鍵原文完全相同、結算不重付。舊版沒有試讀續存按鈕，但不覆寫新鍵，回新版恢復；只是指定版本／狀態，不保證未來格式。未回退正式站或動真人資料。

| 本機鍵 | 格式／界線 |
|---|---|
| tw16:TW16-CLASSIC-v1:save | Session／GameState v1；decodeSession→engine.restore，重開結算不重付 |
| tw16:practice:v1 | 練習v1，重播驗證種子／日誌 |
| tw16:review:v2 | 檢討v2，獨立白名單快照，容量／版本／Web Locks |
| tw16:learn:v1 | 新手進度schema1、beginner-1-3-v1，只三課，擴課先定遷移 |
| tw16:trial:v1 | 手動保存封套schema1含schema3報告及題號／分類，128KiB、Web Locks ifAvailable＋expectedRaw；同版才自動載入 |

對戰偏好tw16:coach:v1的on／off／after不改版。壞檔、未知版、讀寫失敗及跨頁衝突保留原檔與本頁內容；不可清空localStorage修復。trial schema3的guidanceMode=topic-guided，exposure未知／已見／自陳未見，揭示後鎖定，不證明首次。審閱輸出reportVersion2，舊schema1／2曝光未知、異版轉人工。原始保存封套不是一般作答匯出。

## 固定界線與現場狀態

TW16-CLASSIC-v1規則唯一來源為[凍結RULES](../taiwan-mahjong-m0/RULES.md)，不混用港麻／日麻。AI及教練只讀單家getObservation，證據不讀其他暗牌／牆／種子；公開進牌比例不是實摸率、安全不等於阻止莊家自摸或流局續莊。S6離線研究不是實裝授權。

先前服務4226／4227／4229及驗收Chrome／Edge已關閉；S2.4本包未開桌面瀏覽器；接S4.2的4230隔離preview仍在，不動使用者原4173或日常profile。work/保留合成logs／原始影片／zoom profile／舊版隔離建置，全部忽略，不提交真人資料。主要logs為s32-*、s33-*、s51-*、s52-*；無新套件或子代理。

上輪S3.2–S5.2帳戶起始1%、最後檢查64%，舊窗口resetsAt1792229095。當前窗口與用量以本輪檢查點為準，比例不是精確對話剩餘token；未使用重設額度或自動續跑。分工已依S51確認，真人學習試用仍無新資料。

歷史：本輪以前細節與途中檢查點在[2026-10-17歷史交接](HANDOFF-HISTORY-20261017.md)，M0–M5.4／早期M6見[2026-10-08交接](HANDOFF-20261008.md)。完整企畫及歷史下一步不會自動啟動未授權工作。


---

## 2026-10-18 本輪九個工作包核對完成快照

以下保留S2.4、S4.2修正、文件／發布／回歸／具名快取與S2.3相容準備的完整證據；歷史用量與下一步不代表現況。

# 現行交接入口

更新：2026-10-18（Asia/Taipei）。先讀本檔與[ROADMAP](ROADMAP.md)，設計依[PRODUCT-DIRECTION](PRODUCT-DIRECTION.md)、[MASTER企畫](MASTER-IMPROVEMENT-PLAN.md)。已完成包的完整紀錄、歷史檢查點與logs索引移至[歷史交接](HANDOFF-HISTORY-20261017.md)；歷史「下一步」不覆蓋本檔。

## 現況與正在做的工作

使用者要求「把五小時的額度全部用來推進專案進度」，持續目標有效。當前窗口resetsAt約1792266558（工具有1秒浮動），起始0%、最近檢查86%；比例是帳戶用量，不能推算精確對話剩餘token。逐包驗證、提交、發布及落盤，接近耗盡先收斂交接；不使用重設額度或新增自動續跑。

文件維護包已完成：來源8f097b8、[PR#16](https://github.com/zhai2Liu/taiwan-mahjong/pull/16)合併8ec8b9b。`npm run check:docs`使用Node標準函式庫，83份文件／520個本機連結0問題；四個負例均拒絕、fixture已移除。PR39045918296成功399／38（34.0秒），main39046061000成功399／38（31.8秒）、build117434907375／deploy117435191400成功；三頁及全部引用資源與site相符，八個公開修改檔與合併git blob相符。最新Pages提交8ec8b9b，功能資源仍f994fa2。logs為work/doc-links-negative.log、positive.log、pr-ci.log、main-ci.log、live-assets.log、public.log（皆doc-links-前綴）。

遊玩離頁保護已發布：來源fdc2879、[PR#17](https://github.com/zhai2Liu/taiwan-mahjong/pull/17)合併65dc22f。PR39046540677成功399／44（46.1秒），main39046718938成功399／44（38.0秒）、build117436802677／deploy117437135648成功。正式三頁200、4／3／4份JS／CSS SHA-256與site相符；正式三種隔離context實際取消原生重載、原檔保留、成功重試解除，0pageerror。八個公開修改檔雜湊相符。本機399／44（35.0秒）、Chrome／Edge受影響各6項（6.5／6.7秒），83份文件／524鏈0問題。詳[S42](S42-ACCESSIBILITY.md)；work/play-leave-*涵蓋before／after、before-tests／evidence、targeted／tests／build／browser／chrome／msedge、pr-ci／main-ci／public／live-ui／live-assets-existing。npm audit同日0已知漏洞，原始JSON在work/dependencies-audit-20261017.json，非未來保證。

發布核對包已完成：來源543cf3b、[PR#18](https://github.com/zhai2Liu/taiwan-mahjong/pull/18)合併3b3f4da。PR39047211722成功399／44（34.5秒），main39047332167成功399／44（44.2秒）、build117438598260／deploy117438932626成功。正式三頁HTML與8份獨立JS／CSS經新命令比對相符；十個公開修改檔雜湊與git blob相符。`npm run verify:release -- <明確網址/>`、限定三入口LF及觸發已落盤，三個HTML git blob／runtime未變。子路徑正例及HTML／資源不同、404、201、轉址五負例均驗；autocrlf=true匯出三入口仍0CR且等於git blob。83文件／525鏈通過。logs在work/release-check-{build,negative,live,after-deploy,pr-ci,main-ci,public}.log、html-line-endings-after.log及html-release-diff.log；只驗HTML直接引用，不宣稱動態資源或操作驗收。

發布工具回歸包已完成：來源30ee090、[PR#19](https://github.com/zhai2Liu/taiwan-mahjong/pull/19)合併5fc7d79。PR39047870458與main39048017431均400／44（各37.2秒），build117440572410／deploy117440880022成功；正式三頁HTML／8份獨立資源相符，三個公開修改檔與git blob相符。`test/release-check.test.mjs`隨npm test執行，不依賴既有site／外網；驗真CLI子路徑、共用資源、五負例及四錯參數，子程序逾時與自身目錄清理均限定。83文件／525鏈通過，無runtime／依賴改動。logs為work/release-regression-{targeted,tests,pr-ci,main-ci,live,public}.log。

具名快取驗證包已完成：來源2689f17、[PR#20](https://github.com/zhai2Liu/taiwan-mahjong/pull/20)合併8e43f87。PR39048408460成功400／44（44.4秒），main39048560730成功400／44（46.1秒）、build117442170407／deploy117442552232成功。正式三頁HTML／8份資源相符、六個公開修改檔雜湊相符。`test:history`的Chrome155.0.8059.80／Edge155.0.4283.62各四模式真BFCache、衝突處理／明確重讀、其他鍵及0pageerror通過，負例非零拒絕；不計入一般CI回歸。詳[S42](S42-ACCESSIBILITY.md)，logs為work/browser-history-{chrome,msedge,negative,pr-ci,main-ci,public,live-assets}.log；4231與context都關閉，未改runtime／全域瀏覽器設定／依賴／存檔。

進度相容準備已完成：來源814843d、[PR#21](https://github.com/zhai2Liu/taiwan-mahjong/pull/21)合併e28e1b8；指定head Actions39048995547成功400／44（38.3秒），84文件／542鏈0問題。六個公開文件與e28e1b8 git blob相符，main純MD無push run、無新Pages部署。[候選規格](S23-PROGRESS-COMPATIBILITY.md)及C01–C12只是待實裝設計，沒有新增v2鍵／程式或放行後五課。logs：work/learning-compat-pr-ci.log及public.log。

最終正式網址額外驗Chrome155.0.8059.80／Edge155.0.4283.62四模式真BFCache，各四條通過、原文／其他鍵保持、明確重讀及0pageerror；work/browser-history-live-{chrome,msedge}.log。使用獨立合成context，沒有碰日常profile。4230 preview（session80087）已Ctrl+C結束，4230／4231無listener；4226亦已關。開始整理本輪最終交接，不再新增功能。

完成本包後繼續處理可重現的操作／可及性／維護缺口，先驗證再修正。後五課教材與引擎牌例已備，正式互動整合仍沿前三課試用／修訂順序；不能為消耗額度跳過真人門檻。真人資料只阻擋相應理解／難度／成效與實機結論，不代表整個專案必須停工。

## 已完成範圍與限制

| 範圍 | 實際狀態 |
|---|---|
| 既有對戰／練習 | M0–M5.4完整行牌、1真人＋3公平本地AI、逐項計台、本機續局、牌效練習、六步操作導覽、局後檢討已發布 |
| S0／S1 | 雙路線、作品入口／案例、離頁與匯出保護、PR CI、瀏覽器回歸、焦點及效能基準完成 |
| S2.1／S2.2 | 前三課可操作及獨立進度已發布；[T0–T5試用準備](BEGINNER-TRIAL.md)完成，真人0、理解／修訂未驗 |
| S2.3準備 | [第4–6課課文／示範／換例](S23-LESSON-PREPARATION.md)及26個引擎牌例已備；未接課程頁／擴進度 |
| S2.4準備 | [第7–8課整局腳本／實桌附錄](S24-LESSON-PREPARATION.md)及8個真實DEAL引擎分支已備；未整合互動頁／真正暫停保存／正常對戰連接 |
| S3.1–S3.3 | 九題四能力導引、局後同類練習與吃碰事後解釋、手動本機保存／同版續答／曝光自陳已發布；不自動上傳 |
| S3.4 | [四候選缺口／人工錨點／審閱流程](S34-ASSESSMENT-PREPARATION.md)已備；13題／12題族，四候選不進正式試讀，assessmentFamilies空，正式評量未放行 |
| S4.2 | [牌面語意／強制色彩選取及新手重讀保留](S42-ACCESSIBILITY.md)已發布；手機／Safari／真人輔具未驗，不能宣稱完整WCAG符合 |
| S5.1 | [69.08秒字幕片／13段VTT、三圖與案例](../taiwan-mahjong-showcase/README.md)完成；分工本人已確認，不再重問 |
| S5.2 | [發布／履歷草稿、來源盤點與同源回退演練](S52-RELEASE-PREPARATION.md)已備；LICENSE、tag／Release、另擬履歷摘要仍待本人決定 |
| S6 | 人性化AI保留離線研究，需另外啟動，未授權實裝 |

## 最新提交、驗證與發布

| 包 | 來源／合併 | 指定提交證據 |
|---|---|---|
| S2.3準備 | 54d9e11／aa02c78，[PR#12](https://github.com/zhai2Liu/taiwan-mahjong/pull/12) | PR39039769390：391／26；main39039947228：391／26、部署與三頁資源通過 |
| S2.4準備 | 7f7e291／36aa912，[PR#13](https://github.com/zhai2Liu/taiwan-mahjong/pull/13) | PR39042980660：399／26；main39043175446：399／26、部署與三頁資源通過 |
| S4.2牌面／強制色彩 | 69439e8／1f91996，[PR#14](https://github.com/zhai2Liu/taiwan-mahjong/pull/14) | PR39044088421：399／32；main39044234956：399／32、正式限定UI／資源通過 |
| S4.2重讀保留 | 8fe4564／f994fa2，[PR#15](https://github.com/zhai2Liu/taiwan-mahjong/pull/15) | PR39045048994：399／38（40.1秒）；main39045246989：399／38（35.2秒）、build117432567895／deploy117432905099成功 |
| S4.2遊玩離頁 | fdc2879／65dc22f，[PR#17](https://github.com/zhai2Liu/taiwan-mahjong/pull/17) | PR39046540677：399／44；main39046718938：399／44、部署及正式三類失敗／重試通過 |

最近Node400項、本機及雲端check／build通過，瀏覽器44項當輪雲端通過；Windows Chrome155.0.8059.80／Edge155.0.4283.62遊玩離頁各6項通過。新手重讀的讀取錯誤／壞檔／未知版也已驗保留本頁進度／原文／離頁提醒，修復後成功重讀才取代記憶體。不是存檔遷移或真人試用證據。

正式站：[青竹牌室](https://zhai2liu.github.io/taiwan-mahjong/)，origin為https://github.com/zhai2Liu/taiwan-mahjong.git。最新Pages提交8e43f87f85a23c197af71f5fbf4dfe27f8559cc1，功能資源仍65dc22f；三頁HTTP200及HTML、全部4／3／4份JS／CSS SHA-256與site一致。最新index-Cb42fmnp.js、learn-By-3MGNT.js、view-BptEx-mj.js；其他資源清單及舊PR證據見歷史交接。

PR均已附本chat；PR的Pages上傳與deploy跳過，沒有Pages產物。沒有外部真人程式審查或分支保護修改；不要以舊CI充當新提交證據。全為隔離合成資料，不代表手機／Safari／真人理解或普遍學習成效。

## 修改與資料契約入口

- [MAINTENANCE](MAINTENANCE.md)：先依需求找修改位置與必要驗證；[DEPLOYMENT](DEPLOYMENT.md)管發布及回復。[人工清單](HUMAN-FEEDBACK-CHECKLIST.md)與[試讀審閱](TRIAL-REVIEW.md)管真人資料，無新資料不能代填。
- S2.3／S2.4教材對應test/learning-next.test.mjs與learning-round.test.mjs，不建第二套仲裁、過水或計台；固定劇本不是正常AI。改進度先定相容策略。
- [S3.2](S32-VALIDATION.md)：main等待正常RESOLVE，hand-review核對實際取得／未取得，再解釋原快照；關閉保持暫停，不重送動作。[S3.3](S33-VALIDATION.md)：training-draft管保存封套，trial-record供網頁／Node24 CLI共用驗證。
- [S4.2](S42-ACCESSIBILITY.md)：view.tile提供圖片語意，裝飾牌及他家暗手隱藏，暗槓四張仍未知；learning.css強制色彩用雙線保留選取與獨立焦點。learning.loadProgress驗證成功才換記憶體，讀失敗保持dirty並blocked。

| 本機鍵 | 格式與界線 |
|---|---|
| tw16:TW16-CLASSIC-v1:save | Session／GameState v1；decodeSession→engine.restore，已結算不重付 |
| tw16:practice:v1 | 練習v1；重播種子與日誌核對 |
| tw16:review:v2 | 檢討v2；白名單快照、容量／版本／Web Locks |
| tw16:learn:v1 | schema1、beginner-1-3-v1，只三課，擴課先定遷移 |
| tw16:trial:v1 | 手動保存封套schema1內含schema3報告，128KiB、Web Locks ifAvailable＋expectedRaw；只同版自動載入 |

教練偏好tw16:coach:v1為on／off／after。壞檔、未知版、讀寫失敗或跨頁衝突保留原檔與本頁內容；不清空localStorage修復。trial schema3為topic-guided、曝光自陳未知／已見／自陳未見，揭示後鎖定，不證明首次；CLI讀schema1／2／3，異版轉人工，審閱輸出reportVersion2。原始保存封套不是一般作答匯出，未授權新增匯入或靜默遷移。

## 固定界線與現場狀態

唯一桌規是[凍結TW16-CLASSIC-v1](../taiwan-mahjong-m0/RULES.md)，台灣16張、144張、五組牌加眼睛；不混港麻／日麻，不新增後端、帳號、多人或多桌規。AI／教練只讀單家getObservation，不讀他家暗牌／牌牆／種子；公開未知牌改善比例不是真實摸牌率、安全不代表阻止莊家自摸或流局續莊。

隔離preview4230仍在（session80087，僅合成資料）；回歸4226及各headless context已結束，不動使用者原4173或日常profile。work/保留各包logs、重現前失敗trace、影片及指定版本建置，全部忽略；S24、S42 A／B完整檔名在歷史交接。沒有新依賴、子代理、重設額度或自動續跑。

歷史：本日前及本輪已完成包細節在[2026-10-17歷史](HANDOFF-HISTORY-20261017.md)，M0–M5.4／早期研究見[2026-10-08交接](HANDOFF-20261008.md)。歷史計畫不會自動啟動未授權工作。


## 2026-10-18 新首頁工作前快照

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


## 2026-10-18 三入口改版及展示刷新前完整快照

# 現行交接入口

更新：2026-10-18（Asia/Taipei）。方向依[PRODUCT-DIRECTION](PRODUCT-DIRECTION.md)，排程依[ROADMAP](ROADMAP.md)；前輪九包與完整CI證據見[歷史交接](HANDOFF-HISTORY-20261017.md)。

## 本輪進行中

使用者要求投入新的五小時帳戶額度並優先改善首頁。啟動讀值0%已用，resetsAt=1792284614；最近檢查55%。這是帳戶共享百分比，不是精確對話剩餘token。建立持續工作目標，每包落盤；不使用重設或自動續跑。6.1 Sol主導，Luna限定唯讀首頁／試讀／教學及錄製工具審查，未使用Astra。

S1.4首頁已由[PR#22](https://github.com/zhai2Liu/taiwan-mahjong/pull/22)合併並發布b384764505ec63e798b01ca49ca239b637eae7cc。最終來源3c5d1db32d3a804fd44c77bc26a9baf679d12704的Actions39065024289／build117490738456成功400／50（42.1秒）；main39065175077／build117491194356成功400／50（47.9秒）、deploy117491609398成功。85份文件／582連結0問題。真別頁更新時的入口焦點遺失已先重現再修復；沒有改保存格式。

正式三頁HTML與全部引用JS／CSS和指定site相符。正式隔離桌面新局、390px學習／試讀／練習往返、取消新局原文保留與續玩還原全部通過、0pageerror；另有320／820及強制色彩截圖。完整範圍、兩張圖與契約見[首頁驗收](HOME-REDESIGN-20261018.md)。功能資源index-w9IuzQfR.js／view-BlHMN2jy.js／index-BOwf8lyn.css。

S1.5[試讀工作區](TRIAL-WORKSPACE-20261018.md)已由[PR#23](https://github.com/zhai2Liu/taiwan-mahjong/pull/23)合併並發布e76070291e9e59f30ee5c87ba0e235f5d7e68ec4。來源9a35c350e0a24ee48dede9461d18507e3801b650的Actions39065728154／build117492861570成功400／52（45.3秒）；main39065890220／build117493353587成功400／52（44.0秒）、deploy117493723484成功。正式三頁資源相符；Chrome1440px／Edge390px實際作答、保存／重載原游標、schema3真實下載及取消離頁保留通過，0pageerror。training-BH5dEc_t.js／training-Ddyr2V09.css。本機另外Chrome／Edge各四項、Chrome四模式真快取返回通過。未改題目／答案／內容版本、曝光或保存邏輯；只補手動保存位置說明，不增加切題離頁警告。原始證據在work/entry-pages-20261018/。

S1.6[前三課排版](LEARNING-LAYOUT-20261018.md)已由[PR#24](https://github.com/zhai2Liu/taiwan-mahjong/pull/24)合併並發布51f35773a25162ffddecf333352f97a52d5e5881。來源80f7546bfef18297808413a40a04d7430d449960的Actions39066375904／build117494810165成功400／52（52.0秒）；main39066578543／build117495408948成功400／52（50.7秒）、deploy117495801813成功。正式三頁資源相符；Chrome1440／Edge390認牌完成、組牌收組、重載三筆v1進度／未完成不誤計與其他鍵保留通過，0pageerror。learn-pMwkekFN.js／learn-Bv3fDrzy.css。本機learning／accessibility16／16，最後Chrome／Edge各6／6。只改HTML／CSS，未改learning.ts、課文、示例與保存格式；原始證據在work/entry-pages-20261018/learning-*。

codex/showcase-refresh-20261018已完成[新版展示](S51-DEMO-VALIDATION.md)的70.52秒影片／13段字幕／三圖本機驗收：最終work/showcase-AaZOE7，完整解碼、原生播放、VTT13段、重載狀態及理由實際可見、0pageerror，原牌局保持不變。檔案已放展示目錄，工具加錄製前資源核對（自然差異拒絕及正式版本成功均已驗），README及S51已同步，舊影片保留。尚未提交／公開，下一步check:docs、PR完整CI及公開原檔雜湊。全部合成，未改遊戲行為；logs在work/entry-pages-20261018/showcase-*。

另外同一建置的221個一次性跨畫面檢查通過：13種寬度、17狀態／寬，含新／續局、返回深色對戰／練習、九題、三課與組牌。原始viewport-matrix.mjs／json／log在work/entry-pages-20261018；不計入CI52，也不代表221張逐一人工目視、手機實機或真人理解。

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

## 2026-10-18 S1.7改名前的PR22–28發布紀錄

以下保留改名前當時的狀態與用量；目前來源只依現行HANDOFF。

## 目前網站與本輪交付

正式入口：[青竹牌室](https://zhai2liu.github.io/taiwan-mahjong/)。repository／origin為zhai2Liu/taiwan-mahjong。**目前正式功能／Pages來源97847778cfc623f553b8dbe1f7ed1ea713984a23，400項Node／54項瀏覽器回歸與部署、正式資源／操作均通過。純文件狀態提交不等於新runtime。**

| 工作包 | 結果與指定來源 |
|---|---|
| S1.4 首頁 | [PR#22](https://github.com/zhai2Liu/taiwan-mahjong/pull/22)合併b384764；來源3c5d1db，PR Actions39065024289／build117490738456成功400／50（42.1秒），main39065175077／build117491194356成功400／50（47.9秒）、deploy117491609398成功。淺色／深綠三路入口、有存檔優先續玩；真別頁更新曾造成入口焦點遺失，先重現再修。詳[首頁驗收](HOME-REDESIGN-20261018.md) |
| S1.5 試讀 | [PR#23](https://github.com/zhai2Liu/taiwan-mahjong/pull/23)合併e760702；來源9a35c35，PR39065728154／build117492861570成功400／52（45.3秒），main39065890220／build117493353587成功400／52（44.0秒）、deploy117493723484成功。牌例／作答並排、窄畫面堆疊，詳[試讀驗收](TRIAL-WORKSPACE-20261018.md) |
| S1.6 前三課 | [PR#24](https://github.com/zhai2Liu/taiwan-mahjong/pull/24)合併51f3577；來源80f7546，PR39066375904／build117494810165成功400／52（52.0秒），main39066578543／build117495408948成功400／52（50.7秒）、deploy117495801813成功。任務／獨立進度並排，詳[教學排版驗收](LEARNING-LAYOUT-20261018.md) |
| S5.1 展示刷新 | [PR#25](https://github.com/zhai2Liu/taiwan-mahjong/pull/25)合併87e52836f61571f8732865349aad3872e043f1c7；來源7c4a2ec，PR39067503251／build117498099655成功400／52（42.2秒）。70.52秒／13段字幕／三圖已公開，九檔HTTP200及git blob雜湊相符。錄製工具先核對正式三頁資源，舊片保留；[完整證據](S51-DEMO-VALIDATION.md) |

三次UI發布均核對正式三HTML及全部引用JS／CSS，並實際驗受影響操作。首頁新局／取消／續玩、試讀真實作答／保存重載／schema3下載／取消離頁、前三課認牌完成與組牌／三筆v1進度及其他鍵保留均通過，0pageerror。Chrome155.0.8059.80／Edge155.0.4283.62的指定操作範圍見各包，不宣稱手機實機通過。

目前資源：index-BKqnfuRx.js／index-C5jxypL6.css、training-DZ2kWL9p.js／training-Ddyr2V09.css、learn-pMwkekFN.js／learn-Bv3fDrzy.css、view-BlHMN2jy.js、tile-face-CG76dTyt.js。最新三HTML及全部引用資源與指定建置SHA-256相符。展示固定記錄51f3577版，不為後續一處文字色與回焦小修反覆重錄；版本界線見S51。

同一建置另有[S4.2限定驗證](S42-ACCESSIBILITY.md)：13種寬度×17狀態＝221項，以及Chrome原生200%放大19狀態，無頁面橫向溢出或焦點中心被遮；0pageerror。這些一次性檢查不併入CI52，也不是221張逐一目視或完整WCAG證明。原生縮放的Playwright截圖裁切異常已用同頁CDP畫面釐清，未因此改網站。

## 本輪維護與最近完成

[PR#26](https://github.com/zhai2Liu/taiwan-mahjong/pull/26)已合併95e06ec1bcfa3abe4b68af6c9a2c316058d0b63c：S52草稿／來源更新到51f3577，明確保留032bc1c→4bb87cd為指定歷史演練；回復程序不固定沿26項。S51／ROADMAP同步公開完成、S42補放大驗證、交接收斂。Luna唯讀核對無問題；來源2c8e7df的Actions39067926469／build117499341466成功400／52（51.1秒），87份文件／629連結0問題，PR無Pages。純MD不重部署。

[PR#27](https://github.com/zhai2Liu/taiwan-mahjong/pull/27)已合併並發布8de3bf37bf72f5ffbaadee21a36e38649df2a781：五個官方Action直接引用固定commit，原版本旁註及來源／升級程序在DEPLOYMENT，事件／權限／Pages隔離未改。來源ba0bfe2的PR39068225911／build117500219011成功400／52（50.9秒）；main39068383426／build117500680291成功400／52（40.0秒）、deploy117500995456成功，五個下載SHA正確。正式三頁／引用資源與原51f3577相符（pinned-actions-live.log）。deploy-pages仍有Node20宣告被runner轉Node24的既有警告，實際部署成功，未假稱整套runner固定。沒有遊戲／保存格式改動。

[PR#28](https://github.com/zhai2Liu/taiwan-mahjong/pull/28)已合併並發布97847778cfc623f553b8dbe1f7ed1ea713984a23，來源9454dae的PR39068777950／build117501847164成功400／54（52.7秒），PR無Pages；main39068956795／build117502380144成功400／54（51.5秒）、deploy117502776024成功。正式三頁／引用資源相符，Chrome1440／Edge390實際驗新色、鍵盤保存回原按鈕、清除回管理summary、理由／其他鍵保留，0pageerror（entry-polish-live-assets／live-ui.log）。

此包修綠底對戰卡11px標籤4.207749→5.018787（實際Chrome色值及Luna獨算）、試讀鍵盤保存／清除後BODY無焦點指示。回焦只在原控制仍連接且焦點body時動作，不搶玩家的新焦點。原版先紅，修後首頁／保存14／14（10.6秒）、Chrome／Edge新鍵盤各2／2（3.4／3.8秒）、build通過。資料鎖／schema／題目答案不改，限定證據見[S42](S42-ACCESSIBILITY.md)。本工作包無剩餘程式或發布待辦；後續仍可修新重現操作／維護缺口，大型課程／評量依下方人工門檻，不能自動解鎖S2.3或S6。

使用者要求本次五小時額度持續推進，6.1 Sol主導、Luna限定唯讀審查，未使用Astra。啟動帳戶讀值0%，原窗口resetsAt=1792284614，曾讀到66%；其後工具改回0%且resetsAt=1792287639／週額度也回0，原因未確認，新窗口收尾檢查31%。**沒有呼叫額度重設或新增自動續跑；不能把不同窗口百分比相加宣稱已用完100%，也不能得知精確對話剩餘token。** 每包先落盤，不為消耗額度新增受人工門檻阻擋的功能；窗口切換不自動解讀為可再增加一整窗預算。首頁與本批後續改善均已完成、發布並交接，未宣稱帳戶額度已耗盡。
