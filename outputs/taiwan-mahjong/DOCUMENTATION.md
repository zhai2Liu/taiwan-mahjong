# 專案文件總索引

整理日期：2026-10-21（Asia/Taipei）。本頁按用途收錄全部正式 Markdown，保留既有檔名與相對路徑。文件內的測試數、發布來源與「下一步」各有時間背景；最新狀態只查現行交接與工作包路線。

## 從哪裡開始

| 目的 | 閱讀順序 |
|---|---|
| 認識作品／試玩 | 根目錄作品介紹 → 操作展示 → 使用與開發 |
| 接續工作 | 工作規範 → 現行交接 → 工作包路線；再按任務讀規格與驗收 |
| 確認規則／保存 | 固定桌規 → 概念契約 → 維護指南與對應模組的契約 |
| 回報或安排試用 | 人工回饋清單 → 新手試用／試讀紀錄審閱 |
| 查既有成果 | 對應階段驗收 → 發布紀錄；不用舊「下一步」啟動新工作 |

## 文件如何判讀

- **現行決議與規格**：產品方向定範圍、ROADMAP 定排程、HANDOFF 記最新驗證與發布、RULES 定桌規；實際型別以程式為準。
- **階段驗收**：記錄指定版本曾驗證的內容與限制；舊測試數、未發布或尚未接線等敘述不代表現在仍如此。
- **候選／研究**：教材準備、模型複核、離線策略與企畫完成，都不等於正式功能、真人驗證或開發授權。
- **歷史交接／底稿**：供查背景與原始證據；其中待辦、用量、程序及服務狀態不能沿用為現況。

現行重點：第1–8課入門功能與九題試讀，最新整合／驗證／發布只依HANDOFF。第7–8課含固定整局、獨立續學與實桌附錄；真人理解與成效仍待驗，不阻擋課程開發。共通AI吃碰門檻與B1平手安全捨牌已完成，完整人格／攻守仍屬S6，需另外啟動。

## 完整分類目錄

每份正式 Markdown 在以下分類表列一次，包含本索引。檔名保留供搜尋，說明標示文件用途與必要的狀態界線。

### 現行入口與維護

| 文件 | 用途與界線 |
|---|---|
| [README.md](../../README.md) — 作品介紹 | 對外概覽、操作展示與工程案例 |
| [AGENTS.md](../../AGENTS.md) — 工作規範 | 啟動順序、分工與交接要求 |
| [README.md](README.md) — 使用與開發 | 安裝、操作、保存及驗證方式 |
| [DOCUMENTATION.md](DOCUMENTATION.md) — 文件總索引 | 本頁；依用途尋找全部正式 Markdown |
| [HANDOFF.md](HANDOFF.md) — 現行交接 | 最近完成、發布證據、風險與續作入口 |
| [PRODUCT-DIRECTION.md](PRODUCT-DIRECTION.md) — 產品方向 | 已採納定位、範圍與證據界線 |
| [MASTER-IMPROVEMENT-PLAN.md](MASTER-IMPROVEMENT-PLAN.md) — 全面強化企畫 | 整體方案；執行狀態由 ROADMAP 管理 |
| [ROADMAP.md](ROADMAP.md) — 工作包路線 | 現行排程、依賴、啟動與完成條件 |
| [MAINTENANCE.md](MAINTENANCE.md) — 維護指南 | 程式修改位置、資料流與保存界線 |
| [DEPLOYMENT.md](DEPLOYMENT.md) — 部署與回復 | GitHub Pages、指定來源核對及回復流程 |
| [LOCAL-TERMS.md](LOCAL-TERMS.md) — 台灣用詞 | 玩家文字與內部用詞對照 |
| [HUMAN-FEEDBACK-CHECKLIST.md](HUMAN-FEEDBACK-CHECKLIST.md) — 人工回饋清單 | 目前可試用項目及需要本人決定的事項 |

### 固定桌規與 M0 基準

| 文件 | 用途與界線 |
|---|---|
| [README.md](../taiwan-mahjong-m0/README.md) — M0 規格入口 | 凍結交付清單；完成狀態保留當時版本 |
| [RULES.md](../taiwan-mahjong-m0/RULES.md) — 固定桌規 | TW16-CLASSIC-v1 流程、台項、過水與花胡權威 |
| [CONTRACTS.md](../taiwan-mahjong-m0/CONTRACTS.md) — 概念契約 | 模組資料與操作約束；實際欄位以 src/model.ts 為準 |

### 課程、試用、評量與展示

| 文件 | 用途與界線 |
|---|---|
| [BEGINNER-LEARNING.md](BEGINNER-LEARNING.md) — 新手課程規格 | 八課、v2完成旗標／獨立續學點及唯讀v1相容契約 |
| [BEGINNER-TRIAL.md](BEGINNER-TRIAL.md) — 新手試用 | T0–T5與整局T6–T8任務、觀察模板及回饋接收，真人待驗 |
| [TRIAL-REVIEW.md](TRIAL-REVIEW.md) — 試讀紀錄審閱 | 匯出 JSON 的接收、格式檢查與人工審閱 |
| [S23-LESSON-PREPARATION.md](S23-LESSON-PREPARATION.md) — 第 4–6 課準備 | 原教材與26個引擎牌例；互動整合見本輪驗收 |
| [S23-PROGRESS-COMPATIBILITY.md](S23-PROGRESS-COMPATIBILITY.md) — 課程進度相容 | 2026-10-21採納v2另鍵、明確帶入；實際C01–C12見整合驗收 |
| [S23-INTEGRATION-VALIDATION.md](S23-INTEGRATION-VALIDATION.md) — 第4–6課互動與保存整合 | 本輪定稿、相容驗收與發布追蹤；真人理解另記 |
| [S24-LESSON-PREPARATION.md](S24-LESSON-PREPARATION.md) — 第7–8課教材與整合 | 固定整局、檢查點、獨立續學與實桌附錄；原準備稿保留，實際驗收見HANDOFF |
| [S34-ASSESSMENT-PREPARATION.md](S34-ASSESSMENT-PREPARATION.md) — 評量候選準備 | 四候選、人工理由規準與模板；正式評量待驗 |
| [S51-DEMO-VALIDATION.md](S51-DEMO-VALIDATION.md) — 展示素材驗收 | 影片、字幕、三圖與來源核對紀錄 |
| [S52-RELEASE-PREPARATION.md](S52-RELEASE-PREPARATION.md) — 發布技術準備 | 發布草稿、來源盤點、回復演練；授權與 Release 待決定 |
| [README.md](../taiwan-mahjong-showcase/README.md) — 操作展示 | 影片、三張畫面與文字導覽 |

### 決策證據、檢討與題庫：L 線

| 文件 | 用途與界線 |
|---|---|
| [L0-L1-PLAN.md](L0-L1-PLAN.md) — L0／L1 技術方案 | 歷史基準、獨立證據與驗收方案 |
| [L1A-EVIDENCE-VALIDATION.md](L1A-EVIDENCE-VALIDATION.md) — L1-A 核心證據 | 牌效、安全及資訊公平的限定驗收 |
| [L1B-EVIDENCE-CONTRACT.md](L1B-EVIDENCE-CONTRACT.md) — L1-B 證據契約 | E1–E3、未知與並列格式；後續已用於檢討 |
| [L2A1-REVIEW-STORE.md](L2A1-REVIEW-STORE.md) — L2-A1 保存 | 最小資料與獨立保存子包紀錄 |
| [L2A2-DECISION-SNAPSHOT.md](L2A2-DECISION-SNAPSHOT.md) — L2-A2 快照 | 公開快照、互斥與保存契約 |
| [L2A3-RECORDING-VALIDATION.md](L2A3-RECORDING-VALIDATION.md) — L2-A3 記錄接線 | 真人動作記錄及故障隔離；後隨 L2-B 發布 |
| [L2B1-HAND-REVIEW.md](L2B1-HAND-REVIEW.md) — L2-B1 檢討資料 | 局後少量比較資料層 |
| [L2B2-REVIEW-UI-VALIDATION.md](L2B2-REVIEW-UI-VALIDATION.md) — L2-B2 檢討畫面 | 結算入口、比較與畫面驗收 |
| [L2B-RELEASE-20261010.md](L2B-RELEASE-20261010.md) — L2-B 發布 | 2026-10-10 指定來源的正式核對 |
| [L3A1-QUESTION-DRAFTS.md](L3A1-QUESTION-DRAFTS.md) — L3-A1 題庫草案 | 首批題目與審核工作包歷史 |
| [L3A2-CONTENT-REVIEW.md](L3A2-CONTENT-REVIEW.md) — L3-A2 內容自查 | 引擎交叉核對與保留候選歷史 |
| [L3A3-MODEL-REVIEW.md](L3A3-MODEL-REVIEW.md) — L3-A3 模型複核 | 13 題／12 題族，9 試讀與 4 保留候選；不等於真人驗證 |
| [L3B0-TRIAL-VALIDATION.md](L3B0-TRIAL-VALIDATION.md) — L3-B0 九題試讀 | 最初試讀驗收；續答與曝光以 S3.3 為準 |

### 電腦策略維護與離線研究

| 文件 | 用途與界線 |
|---|---|
| [AI-CLAIM-TUNING-20261020.md](AI-CLAIM-TUNING-20261020.md) — 共通策略維護 | 吃碰門檻與 B1 平手安全捨牌的變更、補驗及發布紀錄 |
| [AI-EXPERIENCE-ASSESSMENT-20261020.md](AI-EXPERIENCE-ASSESSMENT-20261020.md) — 遊玩體驗追加評估 | 就地回報、一手摘要與單一偏好候選；評估不是實裝授權 |
| [AI-STYLE-DESIGN.md](AI-STYLE-DESIGN.md) — 牌風研究 | 進攻、防守與起手基準；離線提案 |
| [HUMAN-AI-DESIGN.md](HUMAN-AI-DESIGN.md) — 人性化 AI 主設計 | 人格、攻守與三模板；S6 需另外啟動 |
| [HUMAN-AI-DECISION-SPEC.md](HUMAN-AI-DECISION-SPEC.md) — 人性化 AI 決策規格 | 未來策略及保存方案，非現行 API |
| [HUMAN-AI-VALIDATION.md](HUMAN-AI-VALIDATION.md) — 人性化 AI 驗證方案 | 未來調校、反例與驗收條件 |
| [HUMAN-AI-TACTICS-RESEARCH.md](HUMAN-AI-TACTICS-RESEARCH.md) — 牌效與安全退路研究 | 台麻構造牌例與公開安全基礎 |
| [RISK-EVIDENCE-VALIDATION.md](RISK-EVIDENCE-VALIDATION.md) — 對手別公開風險證據 | 安全充分條件與未知；完整對手別策略仍離線 |
| [DEALER-STRATEGY-VALIDATION.md](DEALER-STRATEGY-VALIDATION.md) — 對莊權重比較 | 離線偏好與牌效代價；不把少放槍視為阻莊成功 |

### 產品改善與操作驗收：S 線

| 文件 | 用途與界線 |
|---|---|
| [S01-S11-VALIDATION.md](S01-S11-VALIDATION.md) — S0.1–S1.1 | 方向、作品入口與試讀防護 |
| [S12A-VALIDATION.md](S12A-VALIDATION.md) — S1.2a | PR 檢查與 Pages 發布隔離 |
| [S12B-VALIDATION.md](S12B-VALIDATION.md) — S1.2b | 核心瀏覽器回歸及失敗證據 |
| [S13-VALIDATION.md](S13-VALIDATION.md) — S1.3 | 焦點、支援範圍與效能基準 |
| [HOME-REDESIGN-20261018.md](HOME-REDESIGN-20261018.md) — S1.4 首頁 | 學習／練習／對戰及優先續玩 |
| [TRIAL-WORKSPACE-20261018.md](TRIAL-WORKSPACE-20261018.md) — S1.5 試讀頁 | 牌例、作答與保存工具排版 |
| [LEARNING-LAYOUT-20261018.md](LEARNING-LAYOUT-20261018.md) — S1.6 前三課畫面 | 任務與學習進度排版 |
| [S21-VALIDATION.md](S21-VALIDATION.md) — S2.1 | 前三課互動、獨立進度與入門試用版 |
| [S31-VALIDATION.md](S31-VALIDATION.md) — S3.1 | 九題修訂、四能力導引與內容版本 |
| [S32-VALIDATION.md](S32-VALIDATION.md) — S3.2 | 局後下一步及吃碰仲裁後解釋 |
| [S33-VALIDATION.md](S33-VALIDATION.md) — S3.3 | 手動保存、同版續答、曝光與匯出格式 |
| [S42-ACCESSIBILITY.md](S42-ACCESSIBILITY.md) — S4.2 | 可及性、重讀與返回保留；手機／Safari／真人輔具仍待驗 |

### 規則引擎、練習與維護驗收：M 線及專項

| 文件 | 用途與界線 |
|---|---|
| [VALIDATION.md](../taiwan-mahjong-m0/VALIDATION.md) — M0 資料檢查 | 規則與案例的結構一致性，非全玩法實測 |
| [VALIDATION.md](VALIDATION.md) — M1 引擎 | 純規則引擎與自動對局歷史驗收 |
| [M2-VALIDATION.md](M2-VALIDATION.md) — M2 可玩版本 | 一真人與三電腦、畫面及續局 |
| [M3-VALIDATION.md](M3-VALIDATION.md) — M3 發布 | 正式交付階段驗收 |
| [M3.1-CHI-VALIDATION.md](M3.1-CHI-VALIDATION.md) — M3.1 吃牌 | 134 遇 2 的兩種吃法及禁打限制 |
| [M3.1-VALIDATION.md](M3.1-VALIDATION.md) — M3.1 操作與美術 | 雙擊出牌、中央牌河及結算視窗 |
| [M5.1-VALIDATION.md](M5.1-VALIDATION.md) — M5.1 牌效 | 共用分析、候選與資訊邊界 |
| [M5.2-VALIDATION.md](M5.2-VALIDATION.md) — M5.2 純練習 | 練習模式、重播與獨立保存 |
| [M5.2-UX-VALIDATION.md](M5.2-UX-VALIDATION.md) — M5.2 練習操作 | 手牌、預覽、候選與窄畫面 |
| [M5.3-VALIDATION.md](M5.3-VALIDATION.md) — M5.3 對戰教練 | 提示與吃碰比較 |
| [TUTORIAL-VALIDATION.md](TUTORIAL-VALIDATION.md) — 操作導覽 | 六步新手教學及正式牌局隔離 |
| [COACH-FLOW-VALIDATION.md](COACH-FLOW-VALIDATION.md) — 選牌提示 | 滑鼠／鍵盤預覽同步與禁捨提醒 |
| [TABLE-LAYOUT-VALIDATION.md](TABLE-LAYOUT-VALIDATION.md) — 桌規展開 | 展開說明時保留牌桌空間 |
| [PANEL-STATE-VALIDATION.md](PANEL-STATE-VALIDATION.md) — 提示面板 | 暫停、換回合與模式切換後保持展開狀態 |
| [POSITIVE-FEEDBACK-VALIDATION.md](POSITIVE-FEEDBACK-VALIDATION.md) — 正向回饋 | 牌效、聽牌、吃碰及胡牌的回饋 |
| [AFTER-DISCARD-VALIDATION.md](AFTER-DISCARD-VALIDATION.md) — 出牌後解釋 | 最初事後解釋；後續吃碰流程見 S3.2 |
| [MAINTENANCE-2026-10-06.md](MAINTENANCE-2026-10-06.md) — 2026-10-06 維護 | 鍵盤、結算付款與文件核對 |
| [AUDIT-2026-10-07.md](AUDIT-2026-10-07.md) — 2026-10-07 檢視 | 儲存重試、版面與流程修正 |

### 歷史交接與方向底稿

| 文件 | 用途與界線 |
|---|---|
| [HANDOFF.md](../taiwan-mahjong-m0/HANDOFF.md) — M0 交接 | 規格凍結及早期啟動紀錄 |
| [M1-HANDOFF.md](M1-HANDOFF.md) — M1 交接 | 引擎完成時的背景 |
| [M2-HANDOFF.md](M2-HANDOFF.md) — M2 交接 | 可玩版本完成時的背景 |
| [M3-HANDOFF.md](M3-HANDOFF.md) — M3 交接 | 發布階段完成時的背景 |
| [M3.1-HANDOFF.md](M3.1-HANDOFF.md) — M3.1 交接 | 操作與美術修正後的背景 |
| [HANDOFF-20261008.md](HANDOFF-20261008.md) — 2026-10-08 交接 | 人性化 AI 研究及目標重整快照 |
| [HANDOFF-HISTORY-20261017.md](HANDOFF-HISTORY-20261017.md) — 交接歷史彙整 | 沿用既有檔名，保留歷次檢查點與已完成前包 |
| [ROADMAP-HISTORY-20261008.md](ROADMAP-HISTORY-20261008.md) — 早期路線 | M0–M5.4 及 M6 研究歷史 |
| [PROJECT-REVIEW.md](PROJECT-REVIEW.md) — 專案現況底稿 | 2026-10-08 盤點，非現行狀態 |
| [TAIWAN-MAHJONG-PRODUCT-REALIGNMENT-REPORT.md](TAIWAN-MAHJONG-PRODUCT-REALIGNMENT-REPORT.md) — 產品調整原始報告 | 保留作者原稿；採納決議由產品方向管理 |
| [PORTFOLIO-READINESS-REVIEW.md](PORTFOLIO-READINESS-REVIEW.md) — 作品集準備度 | 2026-10-13 改動前缺口評估 |
| [BEGINNER-LEARNING-PROPOSAL.md](BEGINNER-LEARNING-PROPOSAL.md) — 新手學習提案 | 方向已採納；各課完成度由 ROADMAP 管理 |
| [TRAINING-DESIGN.md](TRAINING-DESIGN.md) — 訓練設計沿革 | M5 起始與進階訓練方向；依後續規格演進 |

## 本機工作資料與早期企畫

正式文件之外，整理前另盤點到 180 份本機 Markdown：

- `outputs/taiwan-mahjong-project-plan.md`：1 份早期企畫，未納入 Git；後續凍結規格以 M0 RULES／CONTRACTS 為準。
- `work/`：179 份任務簡報、研究草稿與版本快照，含舊版專案備份。屬原始工作證據，不作現行規格，不複製回正式文件。
- `node_modules/`、`.git/` 等依賴或版本控制內部文件不屬專案自有文件。

本機清單是 2026-10-21 整理前的盤點，不是必須維持的數量；未搬動或刪除上述資料。忽略中的檔案不作正式相對連結，避免 GitHub 讀者遇到不存在的目標。

## 後續維護

新增正式 Markdown 時，放在既有對應目錄、補本索引一列，並在必要入口加連結。新檔加入 Git 索引後執行 `npm run check:docs`；此檢查驗證本機行內連結及圖片路徑，不驗證標題錨點、外部網站或內容真偽。

完成工作包時更新 HANDOFF 與受影響的規格／驗收；已完成前包的展開紀錄收進既有歷史交接，保留日期、來源、數字與限制。歷史報告不回填新測試數，也不另維護第二份「最新發布」。
