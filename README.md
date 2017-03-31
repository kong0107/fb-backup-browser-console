# fb-backup-browser-console
backup timeline posts of one other person by running scripts in browser console

## 目的
備份其他人的私人帳號的動態時報上的所有貼文。

## 警告
* 操作時瀏覽器應該會警告你不要亂貼別人給你的程式碼，那是真的。如果你看不懂本專案內容，就不應該使用。
* 會抓取到操作者有權限觀看，但並非公開的資料。切勿將抓取到的資料隨意公開。
* 本專案用的不是正規的方法，資料可能不齊全、方法亦隨時可能失效。

## 進度
* 不包含相簿與照片；可另參考 [Ensky's Album Downloader for Facebook](https://chrome.google.com/webstore/detail/enskys-album-downloader-f/oallcdoceahndjmaalbicbcgpfnajgae) ，不過那似乎只有儲存照片，而沒有針對照片的留言討論。
* 不包含「網誌」的全文。
* 僅確認 Google Chrome 瀏覽器可以運作。
* 還有很多不必要的東西（例如無法操作的「按讚」）會被顯示出來。
* 未做細部排版；所有東西都擠在同一頁，開啟時間很久。

## 使用
1. 開啟欲備份的臉書個人動態時報。
2. 開啟瀏覽器的開發者工具（快捷鍵 `F12` ），進入「主控台 (Console) 」。
3. 將 `main.js` 的內容貼進主控台，並按下 `Enter` 開始執行。
4. 讓畫面自己捲動，直到沒有東西可以再捲之後十幾秒，主控台出現 `Auto-scroll stopped.` 訊息。
5. 出現 `Auto-scroll stopped.` 訊息後數秒內應會自動觸發下載，若沒有出現那就是失敗了。
6. 開啟下載好的檔案（因檔案較大，開啟時間可能超過十秒），然後按下 `Ctrl + S` 另存新檔，「存檔類型」選擇「完整的網頁」而非「僅限網頁的 HTML 部分」，瀏覽器即會再自動將圖檔也統一複製進一個資料夾。
