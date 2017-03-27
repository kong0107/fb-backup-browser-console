# fb-backup-browser-console
backup timeline posts of one other person by running scripts in browser console

## 目的
備份其他人的私人帳號的動態時報上的所有貼文。

## 警告
* 會抓取到操作者有權限觀看，但並非公開的資料。切勿將抓取到的資料隨意公開。
* 本專案用的不是正規的方法，資料可能不齊全、方法亦隨時可能失效。

## 進度
* 僅確認 Google Chrome 瀏覽器可以運作。
* 可以抓到最初的文章，但有很多「更多」（例如很多則留言時，部分會被隱藏；以及單則留言很長時亦會被截斷）還沒有處理。
* 還有很多不必要的東西（例如無法操作的「按讚」）會被顯示出來。

## 使用
1. 開啟欲備份的臉書個人動態時報。
2. 開啟瀏覽器的開發者工具（快捷鍵 `F12` ），進入「主控台 (Console) 」。
3. 將 `main.js` 的內容貼進主控台，並按下 `Enter` 開始執行。
4. 讓畫面自己捲動，直到沒有東西可以再捲之後十幾秒，主控台出現 `Auto-scroll stopped.` 訊息。
5. 若出現 `Auto-scroll stopped.` 訊息後數十秒仍沒有自動觸發下載，那就是失敗了。
