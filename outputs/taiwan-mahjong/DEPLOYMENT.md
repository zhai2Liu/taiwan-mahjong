> 2026-10-17現況：對戰／練習v1、檢討review:v2、新手learn:v1及試讀trial:v1皆已有獨立保存，最新發布依HANDOFF。指定032bc1c／4bb87cd的同源回退→前進、五鍵保留及結算不重付演練已通過，流程與限制見[S5.2準備](docs/archive/S52-RELEASE-PREPARATION.md)。2026-10-09的L0不推送研究包仍為歷史決議，不代表L2尚未實裝；人格AI未另行啟動。

# GitHub Pages發布與回復

[v1.0.0](https://github.com/zhai2Liu/taiwan-mahjong/releases/tag/v1.0.0)已發布，現為維護模式。本輪以PR CI及main建置／部署成功、三頁可開啟完成收尾。後續驗證分級依[AGENTS](../../AGENTS.md)；下列歷史演練及資源比對工具依指定任務選用。CI run、SHA、測試數及結果記於PR描述，HANDOFF只保留簡短現況。

現行網址：https://zhai2liu.github.io/taiwan-mahjong/；repository：zhai2Liu/taiwan-mahjong。本機origin及About Website已同步。**最新來源、驗證及Actions見[HANDOFF](HANDOFF.md)**；本文件維護發布流程，避免多處版本資訊失去同步。

2026-10-22課程相容補充：現行tw16:learn:v2仍是beginner-1-8-v1八筆旗標，開放7–8後，舊六課頁面讀到新旗標會停止覆寫；請刷新新版，不要在舊版重新建立進度。第7–8課續學點另在tw16:learn:round:v1，舊版不會讀取，不代表被清掉；回退時保留新鍵原文，升回相容新版可再接續。這是格式／舊解析器及原文保留的技術界線，不把2026-10-17五鍵演練當成已驗新鍵的正式回退；實際交付依HANDOFF。未知版／壞檔仍不可因發布清空。

歷史改名驗收（2026-10-06）：M5.3來源ff6de93，workflow37357698468 build／deploy成功；下段M4亦為歷史紀錄，舊owner網址不是現行入口。

帳號改名會改變github.io來源；舊網址的localStorage不能由新網址直接讀取，本次未清除舊存檔。不宣稱自動遷移成功。

2026-10-05，M4已部署並完成正式網站驗收。正式網址：https://lanyaliu521.github.io/taiwan-mahjong/。成功run：37247813100，遊戲提交29057b2。GitHub連線帳號已確認為lanyaliu521，使用者已指定帳號並授權自行命名，目標lanyaliu521/taiwan-mahjong已建立為公開repository；Pages來源已設GitHub Actions。本機main及origin已設定，Git認證及初次推送已完成，build及deploy成功。以下首次步驟保留作重新架站參考，實際驗收見HANDOFF。

## 已準備的發布流程

工作區根目錄`.github/workflows/pages.yml`為發布流程，repository根目錄採工作區相同結構：`outputs/taiwan-mahjong/`遊戲、`outputs/taiwan-mahjong-m0/`固定規則／案例，以及根目錄workflow及根目錄.gitignore。這樣保留文件既有相對連結，無須複製另一套桌規。

初始化／上傳時只明確加入上述專案來源、文件、lockfile及workflow；不加入node_modules、dist、site、work、其他專案檔案或個人資料。遊戲資料夾現有.gitignore排除三份生成目錄。若接到既有repository，先檢查內容及分支再整合，不覆寫既有歷史。

流程在main推送遊戲來源／測試／建置設定／workflow修改、M0 cases.json／RULES.md變更或手動執行時啟動。遊戲根目錄Markdown、JPG截圖、*SIMULATION.json及docs/**歸檔維護證據排除；M0 RULES.md是明確例外。src／public內素材仍觸發，勿把發布素材放在被排除路徑。使用GitHub原生paths，不另寫判定程式；符合[官方路徑篩選](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushpull_requestpull_request_targetpathspaths-ignore)。執行：lockfile安裝 → npm run check:docs → npm test（已含型別檢查） → build → 上傳site → 部署；測試／建置失敗不發布。測試數與當輪來源記於對應PR描述。

S1.2a新增指向main的pull_request檢查，不設PR路徑排除，文件PR也取得build結果；此名稱供日後設定required status check。PR跳過Pages artifact／deploy，非main手動分支亦僅檢查。全域contents:read，checkout不保留憑證，只有受main條件保護的deploy取得Pages／OIDC權限。各PR的群組與main分開；PR新提交可取消過期檢查，main維持序列發布。見[S1.2a驗收](docs/archive/S12A-VALIDATION.md)。目前未配置分支保護，本包不改合併門檻。

Vite保留`base: './'`與`outDir: 'site'`，建置資源使用相對路徑，支援帶repository子路徑的首頁；沒有前端路由或深層網址。dist是測試編譯，不能誤作發布產物。

根目錄`.gitattributes`僅固定三個入口HTML為`text eol=lf`；本機實測CRLF經現用Vite可產生部分CRCRLF，與Linux產物有換行差異。Git屬性讓Windows與雲端checkout沿相同LF，[官方eol說明](https://git-scm.com/docs/gitattributes#_eol)為依據；不重寫其他來源或全域Git設定。該檔亦列入main發布觸發。舊checkout的現存CRLF檔需在確認無本機未存編輯後換成LF，再建置；不要強制重置整個工作區。

S1.2b在共同build內先安裝Chromium（CI含系統依賴），建置後執行核心瀏覽器回歸，再允許main上傳Pages及部署。檢查失敗時保留test-results的截圖／trace七天；這是測試證據artifact，PR仍不產生Pages artifact或取得Pages／OIDC權限。首次下載瀏覽器需要網路，失敗時不得跳過回歸發布。正式site只含index.html／training.html／learn.html與assets，測試範例由Node端注入隔離瀏覽器，不發布。見[S1.2b驗收](docs/archive/S12B-VALIDATION.md)。

## 官方Action來源固定（2026-10-18）

五個直接引用改用完整commit SHA，旁註保留原主版本。SHA由各官方repository的Git ref／commit API核對；checkout、setup-node及兩個上傳工具亦與PR#26成功job的實際下載SHA相同。只固定既有來源，沒有升級主版本、改觸發／權限／main與PR條件或加入新工具。

| Action | 原ref | 固定的官方commit |
|---|---|---|
| checkout | v7 | [3d3c42e5aac5ba805825da76410c181273ba90b1](https://github.com/actions/checkout/commit/3d3c42e5aac5ba805825da76410c181273ba90b1) |
| setup-node | v7 | [949feb2413d6458794dcd2491c4babbbce0c15c1](https://github.com/actions/setup-node/commit/949feb2413d6458794dcd2491c4babbbce0c15c1) |
| upload-artifact | v4 | [ea165f8d65b6e75b540449e92b4886f43607fa02](https://github.com/actions/upload-artifact/commit/ea165f8d65b6e75b540449e92b4886f43607fa02) |
| upload-pages-artifact | v4 | [7b1f4a764d45c48632c6b24a0339c27f5614fb0b](https://github.com/actions/upload-pages-artifact/commit/7b1f4a764d45c48632c6b24a0339c27f5614fb0b) |
| deploy-pages | v4 | [d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e](https://github.com/actions/deploy-pages/commit/d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e) |

維護時先查看官方版本／commit與相容需求，再同時更新SHA、旁註與本表；走正常PR完整檢查、main部署與正式資源核對，不只把版本名稱改大。新來源仍從官方repository核對，不能取同名fork。固定直接引用沿[GitHub安全使用文件](https://docs.github.com/en/actions/reference/security/secure-use#using-third-party-actions)的SHA方案；若需要包含傳遞依賴與來源身分的完整鎖定，再評估該文件所列workflow lockfile。此次不承諾hosted runner映像、外部下載或整套環境完全不變。指定提交及CI／發布結果依HANDOFF，不能以較早的浮動ref成功代替本次驗證。

## 首次部署歷史步驟（已完成，供重建參考）

1. 確認目標repository網址、現有內容及main分支；若尚未建立，確認名稱與可見性。免費方案使用公開repository的Pages；來源公開範圍須明確。
2. 依上述結構建立可追蹤Git提交並檢查選取檔案；連接遠端、推送。GitHub CLI目前未找到；可依可用connector／Git／瀏覽器操作。
3. 在repository的Settings → Pages將Source設為GitHub Actions；確認github-pages環境允許main部署。
4. 執行workflow，檢查測試、建置、artifact及部署job均成功；以實際部署輸出的網址為準，不預先宣稱網址已存在。
5. 正式網址驗收：首頁及資源載入、真人＋3電腦、雙擊與鍵盤出牌、吃碰操作、結算下一局、重載續局、手機窄畫面。測試用dev頁不應被上傳。
6. 記錄repository、正式網址、提交SHA、workflow run及驗收結果；完成後才把M4標成已完成。

## 後續更新與回復

修改src及相應文件／案例，先驗證；以PR提交時檢查通過後再合併到main，main亦會重新驗證／發布。既有直接main推送仍依路徑規則執行，未由本包禁止；不要直接改site產物。每次部署以提交SHA追蹤，正式驗收後記下該SHA。

需要核對正式資源時，先確認指定main部署成功，再於同一來源與依賴版本下建置，執行`npm run verify:release -- https://zhai2liu.github.io/taiwan-mahjong/`。工具從script位置找site/，比對三個HTML（僅將CRLF正規化為LF）及HTML直接引用JS／CSS的SHA-256；共用資源只讀一次，不假定固定資源數。缺檔、內容／資源不同、無JS／CSS、非預期資源路徑、HTTP非200、逾時或轉址均非零退出，不會自動重試或發布。網址須為明確、以斜線結尾的HTTP(S)專案目錄；帳號或網域異動時傳入最終網址，不由工具猜測或跟隨轉址。只針對目前Vite產物，不遍歷動態載入或其他素材；新增此類資源時改用Vite manifest擴充。

這項檢查證明「目前網址回傳內容與目前site相符」，不單獨證明Git來源、CI、畫面操作或存檔相容。先核對提交SHA／Actions，驗證範圍依AGENTS分級，結果寫入PR描述；不要以重跑舊site得到成功當新版已上線。工具只讀公開頁面，不讀登入資訊或玩家localStorage；測試頁仍不發布。

回復先確認問題提交，使用Git revert建立反向提交、推送main並走相同驗證／部署流程；不要reset或強制推送抹掉歷史。workflow失敗時先查看失敗步驟，保持目前成功網站；不要以跳過測試修復發布。

本機與GitHub Pages為不同來源，正式網站不會自動讀取4173的localStorage。正式更新應維持存檔schema與桌規相容；未知版／壞檔仍保留並提示，不因部署清空。單一github.io來源的其他repository共用localStorage，現有鍵沒有repository隔離；若同帳號再部署第二套遊戲，需先設計隔離及遷移，不能直接覆寫。

## 證據與限制

首次M4的測試、build、子路徑與新來源續局結果保留於歷史交接。本輪驗收結果記於對應PR描述，後續依AGENTS分級；歷史測試數不代表目前版本。

參考：[GitHub自訂Pages流程](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Vite部署](https://vite.dev/guide/static-deploy.html)、[setup-node](https://github.com/actions/setup-node)、[checkout](https://github.com/actions/checkout)。工作流程採官方已公布版本；外部Action版本及repository設定於實際部署時再核對。




## GitHub執行機故障的處理

2026-10-06的實例：run37369632079測試／build成功，但deploy零步驟、註記「The job was not acquired by Runner of type hosted even after multiple attempts」。官方Actions恢復後，重試失敗工作（Re-run failed jobs）即成功，attempt2發布來源723a898。本次無需改源碼、權限或發布架構。

遇到發布失敗先看失敗job與annotations，區分程式測試失敗、執行機未分配、Pages設定／權限或artifact問題。執行機問題查[官方狀態](https://www.githubstatus.com/)；恢復後只重試最新版失敗job，不重跑舊來源。若原artifact已過期／無法取得，才完整重跑最新版的測試／build／deploy。成功後仍需HTTP及瀏覽器確認正式資源和受影響操作，不能只靠重試請求已接受判定已上線。
