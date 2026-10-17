# S4.2：牌面語意與強制色彩選取修正

2026-10-17。本包處理兩個已在隔離瀏覽器重現的缺口；當輪測試／提交／發布只記[HANDOFF](HANDOFF.md)。不代表手機、真人或螢幕閱讀器完整驗收，S4.2整體仍未完成。

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
