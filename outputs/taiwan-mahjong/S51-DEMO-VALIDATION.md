# S5.1：目前版本的展示素材與核對

## 2026-10-18：三入口改版後重錄

依正式網站51f35773a25162ffddecf333352f97a52d5e5881重錄[目前示範影片](../taiwan-mahjong-showcase/DEMO-20261018.mp4)、[13段VTT](../taiwan-mahjong-showcase/DEMO-20261018.vtt)與三圖，涵蓋新首頁、試讀與前三課。影片70.52秒、1920×1080、H.264、1706895bytes，無聲音／音樂或真人資料。S5.1原先交付仍成立，本次刷新已完成本機、指定PR及公開核對；未建立Release或更改授權。

來源7c4a2ecc64e2da833795f80a3bca9ff2911c86cc，[PR#25](https://github.com/zhai2Liu/taiwan-mahjong/pull/25)的[Actions39067503251](https://github.com/zhai2Liu/taiwan-mahjong/actions/runs/39067503251)／build117498099655成功400／52（Linux42.2秒），PR無Pages上傳／部署；合併87e52836f61571f8732865349aad3872e043f1c7。展示九檔公開HTTP200、SHA-256逐一等於該提交git blob，含舊兩檔，見work/entry-pages-20261018/showcase-public.log。此範圍不觸發main Pages；正式三頁／全部引用資源再次相符，runtime仍51f3577，不將未部署的文件提交誤稱新版runtime。

- 產生器錄的是正式網站；新增重用verify-release的前置檢查，三頁HTML與全部引用資源相符才建立候選／啟動錄影，指紋寫入capture.json。曾以尚未部署的learn.html自然差異驗得非零退出，沒有把本機build當成拍攝來源。
- 最終候選work/showcase-AaZOE7，13段實際操作、0pageerror；真實另開分頁，最後原牌局原文與暫停狀態相同。所有context均為新建，未碰日常profile或真人存檔。
- 完整FFmpeg解碼0錯誤；原生Chrome155.0.8059.80實際播放超過1秒、1920×1080／70.52秒／error=null，VTT原生解析13段，3／20／26／36／46／55／65秒可定位。
- 已檢視代表性幀、完整答案、重載保留理由與原生控制列；繁體中文字幕在獨立黑底區。初版候選只看到已載入狀態，現已補先顯示狀態再捲到理由，不以內部斷言代替可見展示。
- 三圖另從同版本正式站重新操作擷取；第三圖包含任務及獨立進度，123萬收好後剩14張。新手操作期間原牌局原文不變。

MP4 SHA-256：f313e1b515940519d3e20fbb4e9f39d9843d214cc10184660a8d9689d7504408。原始logs在work/entry-pages-20261018/showcase-*；不為素材新增遊戲算法測試或宣稱真人成效。舊影片與下列歷史證據保留，不能作為本次CI或新素材的核對。

## 2026-10-17：歷史交付

三圖、三案例與本人分工確認已備；當時影片補為**69.08秒**、13段中文字幕及文字導覽，符合[企畫第10節](MASTER-IMPROVEMENT-PLAN.md)的60–90秒規格。指定head CI及公開檔案核對完成，S5.1完成；S5整體仍未完成。未修改遊戲或宣稱新的學習成效。

本人確認紀錄：2026-10-17，針對「你負責需求、方向與實際操作回饋；AI協助規格、程式實作、測試、發布與文件」，使用者回覆「符合，可沿用」。不推定個人技術熟練程度、手寫比例，也不代表公開授權或Release決定。

### 當時交付

[展示入口](../taiwan-mahjong-showcase/README.md)提供實際牌桌、吃碰仲裁後解釋、新手組牌三圖，及DEMO-20261017.mp4／同名VTT字幕。根README保留三個工程案例、架構、協作界線並連到最新影片。三圖沿用先前已核對畫面，這次只補影片、字幕、重錄工具及相應文件。

影片來自正式功能來源4bb87cd（S3.3）：隔離Chrome155.0.8059.80，實際1920×840畫面加獨立字幕區，輸出1920×1080／69.08秒／H.264 yuv420p／1685438bytes，無音訊。本機已安裝FFmpeg與系統字型轉製，未加入網站執行期套件、字型檔或工具二進位。

錄製從正常碰牌／仲裁／解釋，點真正的同類題連結另開分頁；剪接牌桌與新分頁兩份實際錄影，不以同頁導航代替。再作答兩種吃法、完整顯示推導、手動保存／重載、新手五組加眼睛及反例。最後核對原牌局保存原文完全不變且解釋仍開啟；沒有為錄製改遊戲UI、出牌或分析邏輯。

[generate-demo.mjs](../taiwan-mahjong-showcase/generate-demo.mjs)沿用既有fixtures，僅在work/showcase-*產生候選與章節紀錄，不自動覆寫公開片。輸入頁面初始化限預期origin，所有瀏覽器均使用全新context；生成方式及人工檢視步驟在展示README。這是固定流程的製作工具，畫面改版需同步命名步驟，不另建影片框架。

### 當時本機核對

- 正式三頁及全部4／3／4份引用JS／CSS，在錄製前SHA-256與本機建置相符（work/s51-complete-live-before.log）；正式功能仍4bb87cd。
- 最終錄製13段實際操作，0pageerror；真正開新分頁、原牌局保留、選項／理由續答及教學組牌均有實際狀態核對，全部合成，未碰日常profile／真人存檔或Downloads。
- FFmpeg完整影片解碼0錯誤；原生Chrome載入並播放超過1秒，error=null，讀出1920×1080／69.08秒；3／20／26／36／46／55／65秒可定位解碼。VTT由原生字幕解析器讀到13段，時間順序與章節核對通過。
- 已檢視代表性畫面：繁體中文字幕完整，字幕區不遮遊戲，原生控制列顯示時仍可閱讀。答案區完整呈現兩組成立選項與推導，重載段可見「已載入」訊息；沒有只拍到標題就當完整呈現。
- 初次錄製工具在不透明空白分頁讀storage產生錯誤，已限制origin並重新完整錄製。亦調整字幕區避免控制列遮蓋，補上答案與重載狀態捲動；未降低錯誤檢查或把候選失敗當通過。
- 最終候選與原始WebM／逐段截圖：work/showcase-MPEUDS；logs：work/s51-complete-capture-final.log、s51-complete-check-final.log。全部忽略，僅已驗MP4／VTT及重錄工具提交。

本輪無遊戲行為或依賴變更，未為素材新增遊戲測試。指定head PR仍依既有流程跑完整檢查，不能把歷史365／26直接當本次CI；PR／公開來源以HANDOFF為準。展示資料夾不在main的Pages輸入範圍，無需重部署正常網站。

### 歷史基線與界線

本輪來源cd0a778，[PR#11](https://github.com/zhai2Liu/taiwan-mahjong/pull/11)指定head [Actions39034074956](https://github.com/zhai2Liu/taiwan-mahjong/actions/runs/39034074956)成功：365／26（Linux30.3秒）、Pages上傳／deploy skipped、0 artifact；合併daea897並回main。三圖、MP4、VTT、生成器、展示README共七檔公開HTTP200，SHA-256逐一與該提交git blob相符（work/s51-complete-public.log）；文字不以Windows換行差異誤判。MP4 SHA-256為e22a1158f614d923833b6f96134d919de06784f1b3164cf6b659de88b3f21c94。

錄製後正式三頁與引用JS／CSS再次核對仍為4bb87cd（work/s51-complete-live-after.log）；本包沒有新Pages部署、外部真人程式審查或分支保護修改。

原包來源51e105c，[PR#9](https://github.com/zhai2Liu/taiwan-mahjong/pull/9)／Actions39020052983的365／26通過，合併6b8e5ea；當時三圖、舊33.04秒影片與README公開原檔雜湊相符。原影片不足60秒，曾將S5.1標全數完成屬漏驗，已先校正狀態，本輪補足；歷史紀錄不作新片證據。

桌面優先，指定手機／Safari／螢幕閱讀器仍待實機；前三課及新版題目仍待真人觀察，四評量候選不作正式能力測驗。影片不是學習成效或全平台支援的證明。既有分工本人已確認；另擬履歷摘要、授權及正式Release仍在S5.2待決，不因影片完成自動通過。
