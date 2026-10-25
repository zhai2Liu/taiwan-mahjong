# 目前狀態與維護交接

## 現況

從零到一百的麻將路已上線，正封存為 v1.0.0 作品集版本；Release 建立前須取得使用者對 notes 的確認。
正常對戰、三位公平電腦、逐條計台、本機續局、牌效練習與局後檢討可用。
八課互動、第7–8課獨立續學、九題自動保存及單題重練已發布；最近功能交付為[PR #43](https://github.com/zhai2Liu/taiwan-mahjong/pull/43)。
玩家回饋收集及展示短片後續已取消。

## v1.0 收尾交接
改了什麼：歸檔階段文件與維護素材、修正連結、精簡入口；功能凍結。
PR：[範圍與規範 #44](https://github.com/zhai2Liu/taiwan-mahjong/pull/44)及本歸檔PR；驗收結果記於PR描述。
結果：app仍在outputs/taiwan-mahjong，建置JSON與m0資料位置保持；歷史主文完整保留。
未驗證：手機／Safari、真人輔具、理解與學習成效；均不屬v1.0放行門檻。
下一步：僅完成已指定的README、MIT授權與Release流程；完成後進入維護模式。

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
