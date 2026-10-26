# 目前狀態與維護交接

## 現況

從零到一百的麻將路已上線，正封存為 v1.0.0 作品集版本；Release 建立前須取得使用者對 notes 的確認。
正常對戰、三位公平電腦、逐條計台、本機續局、牌效練習與局後檢討可用。
八課互動、第7–8課獨立續學、九題自動保存及單題重練已發布；最近功能交付為[PR #43](https://github.com/zhai2Liu/taiwan-mahjong/pull/43)。
玩家回饋收集及展示短片後續已取消。

## v1.0 收尾交接
改了什麼：完成 v1.0.0 文件歸檔、作品 README 與 MIT 授權；套件版本同步，功能凍結。
PR：[範圍 #44](https://github.com/zhai2Liu/taiwan-mahjong/pull/44)、[歸檔 #45](https://github.com/zhai2Liu/taiwan-mahjong/pull/45)、[README #46](https://github.com/zhai2Liu/taiwan-mahjong/pull/46)及本授權PR；驗收結果記於PR描述。
結果：app保留原位置，資料與執行行為保持；不做一次性格式化。
未驗證：手機／Safari、真人輔具、理解與學習成效；均不屬v1.0放行門檻。
下一步：僅等候 Release notes 確認，再建立 tag／Release並標記發布；之後維護模式。

## 已知限制

- 桌面優先；手機、Safari與真人輔具沒有正式支援驗證，學習成效沒有真人驗證。
- 資料保存在目前瀏覽器；第1–6課只存閱讀與完成紀錄，第7–8課段落需明確保存。
- 正式評量、人格／完整攻守AI及人工教材編審屬未來方向，詳[BACKLOG](BACKLOG.md)。

## 維護模式規則

只做使用者指定或由使用者在BACKLOG勾選的項目。代理不得自行查核缺口來產生下一包。
P0先回報使用者決定；其他問題只記現象與位置。定義與驗證分級依[AGENTS](../../AGENTS.md)。
固定桌規、資料驗證與原檔保全沿既有契約；不得清資料掩蓋錯誤。
每包交接最多五行，不抄CI run ID、SHA或測試數，也不另開驗證紀錄commit。

## 接手順序

1. 讀使用者當次要求與[工作規範](../../AGENTS.md)。
2. 讀本頁及[ROADMAP](ROADMAP.md)，確認只處理已指定範圍。
3. 按任務查[MAINTENANCE](MAINTENANCE.md)、[DEPLOYMENT](DEPLOYMENT.md)及[文件索引](DOCUMENTATION.md)。

原始完整交接見[2026-10-25歷史](docs/archive/HANDOFF-HISTORY-20261025.md)；歷史待辦不自動恢復。
