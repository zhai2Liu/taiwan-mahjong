# S4.2：可及性與操作可靠性修正

2026-10-17。依已在隔離瀏覽器重現的缺口分包修正；當輪測試／提交／發布只記[HANDOFF](HANDOFF.md)。不代表手機、真人或螢幕閱讀器完整驗收，S4.2整體仍未完成。

## 重現與最小修正

1. 共用`tile()`把名稱放在一般span，SVG本身又隱藏；海底的可及性快照只有「左席 · 北」，沒有二萬圖片。給[共用牌面](src/view.ts)補`role=img`後，快照含「二萬，剛打出的牌」。首頁裝飾牌扇另標隱藏，避免增加沒有操作用途的朗讀；其他人暗手沿原遮蔽，暗槓只保留四張「暗牌」，不揭牌種。
2. 瀏覽器強制色彩會移除box-shadow並改用系統色；原本組牌選取的陰影／底色消失，選中與未選都是1px單線框。於[learning.css](src/learning.css)的forced-colors條件改用3px雙線ButtonText框；內距從7減5，保留按鈕原尺寸及獨立鍵盤焦點外框。只在該模式生效，不強行關掉使用者色彩偏好。

![一萬為已選雙線框，二萬為目前鍵盤焦點外框](S42-FORCED-COLORS.jpg)

重現工具在未追蹤work/s42-forced-colors-audit.mjs及s42-tile-audit.mjs；before／after.log與修正前失敗trace分開保存。截圖是1440×900、Playwright Chromium模擬forced-colors的合成組牌示例，非作業系統對比主題或真人輔具驗收。

## 可重跑的回歸

[accessibility.spec.js](test/e2e/accessibility.spec.js)以實際頁面驗：

- 海底及最新打出牌可依圖片名稱取得，原始名稱在可及性快照可讀。
- 其他人暗槓只呈現四張暗牌，暗手牌背不增加朗讀，未把五筒洩露到該玩家快照。
- 純呈現變更沒有推進或改寫牌局，首頁裝飾牌仍隱藏。
- forced-colors的light／dark兩種瀏覽器色系，選取框和Tab焦點可分辨；按鈕尺寸不跳動，Shift+Tab及空白鍵可取消選取，窄畫面無水平溢出。

先在未修正版本跑兩個桌面任務，分別因找不到img及選取／未選框形狀相同而失敗，再修正；不是只寫會通過的樣式快照。檢查限定Chrome系瀏覽器的語意樹與CSS／鍵盤行為，不能代替實際螢幕閱讀器的語序、理解及操作。

在遊戲目錄建置後，`npx playwright test test/e2e/accessibility.spec.js`可重跑；全套沿既有命令。共用4230人工檢視preview與4226回歸服務分開；Chrome／Edge回歸需依次執行，不重用其他測試正在使用的4226。無新套件、規則／AI／資料格式變更。

判斷依據：[W3C非文字對比與元件狀態](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)、[MDN forced-colors行為](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors)。這些是本包的設計依據，不是完整WCAG合規聲明。指定手機／Safari／輔具仍依[真人回饋清單](HUMAN-FEEDBACK-CHECKLIST.md)記錄，未取得資料不填通過。

## 新手進度重讀失敗：保留本頁紀錄與離頁提醒

前版按「重新讀取保存紀錄」會先重建空進度，loadProgress又先清dirty；如果讀取失敗、JSON壞掉或版本未知，就把尚未保存的本頁完成旗標及離頁提醒一併清掉。原存檔雖未改，本頁新完成的紀錄會失去。

[learning.ts](src/learning.ts)改先把讀到的原文放候選值，通過原本嚴格驗證後才替換progress並清dirty。失敗只停止覆寫，保留本頁進度與未存提醒；確認文案說明「重讀成功後」才放棄本頁未存紀錄。原文為未知／壞檔時仍不遷移，讀取失敗不假裝知道原檔；無新格式或新鍵。

[learning.spec.js](test/e2e/learning.spec.js)新增三種故障，各在桌面／窄畫面驗：先讓實際課程完成但寫入失敗，再重讀read-error／壞JSON／未知版本。三種均先重現原版清空問題；修後保留本頁完成、停用覆寫、原文不動，真實beforeunload仍可取消。修復原文或讀取後，再確認重讀才採用已存內容，重載及其他三類保存隔離亦核對。這是隔離合成故障，不是新真人試用資料。

## 對戰、練習與待存檢討的離頁提醒

前版對戰或練習寫入失敗只顯示保持頁面提醒，檢討也可能暫留待存佇列；重新整理沒有原生警告，會失去本頁尚未保存的變更。先在三種真實頁面流程重現：原檔仍在、重試按鈕出現，但beforeunload未取消。

[main.ts](src/main.ts)沿既有saveFailed／practiceSaveFailed與檢討pending判斷是否啟用原生beforeunload；畫面更新與非同步檢討完成時同步。只要仍有任一類未存內容便保留提醒，成功重試、後續成功保存或明確清除待存檢討後才依目前狀態解除。既有壞檔／未知版而沒有本頁新變更，不因此額外攔住重載。跨頁衝突不自動覆寫，使用者仍可確認離頁、重載最新存檔。

[play-save.spec.js](test/e2e/play-save.spec.js)在桌面／窄畫面分別驗對戰、純練習、待存檢討：配額失敗保留舊原文，取消真實重載保留16張手牌，恢復寫入後重試只保存當前狀態、不多打牌／摸牌；解除提醒後能正常重載並續局／續練。也核對另一種遊玩存檔及新手／試讀鍵原文不變。修前桌面三例均因缺少離頁防護失敗，trace與log保留於work/play-leave-before-evidence/及play-leave-before-tests.log。

不新增存檔鍵、格式、依賴或自訂確認視窗，不在離頁時臨時搶存資料；沿用明確重試。原生警告依賴瀏覽器及使用者操作，不能保證攔住手機關閉、程序終止或崩潰，亦不代表檔案已跨來源備份。
