/**
 * 備份社團討論區文章。
 *
 * 步驟：
 * 1. 拉到底（數十分鐘），甚麼都不改就存一份原始資料為 `unexpanded.html` 。
 * 2. 複製一份，修改複製品為只剩主文，儲存為 `posts.html` 。
 * 3. 點開所有回應（數小時），然後甚麼都不改就存一份原始資料 `postsWithComments_origin.html`
 * 4. 複製一份，刪除不需要的東西，儲存為 `postsWithComments.html` 。
 */

var title = document.title.match(/^(\(\d+\) )?(.*)$/)[2];
var container = document.getElementById("pagelet_group_mall");
var deletableElems = [
    "#pagelet_group_composer", ///< 新貼文編輯框
    "#pagelet_group_pager", ///< 最後的 `{username}和其他 {count} 人都加入了這個社團。`
    ".text_exposed_hide", ///< 「更多」跟刪節號
    ".UFIAddComment", ///< 回應框
    ".UFIReplyLink", ///< 「回覆」某留言
    ".UFICommentCloseButton", ///< 好像是管理者工具
    ".UFILikeSentence",
    ".UFIShareRow",
    "video", ///< 因為 Blob 路徑會失效
    "._53j5", ///< 影片的控制按鈕
    "._5umn", ///< 「較舊」標頭
    "button",
    "[type='button']",
    "[role='button']", ///< 文章與留言的「讚」、「留言」
    "[role='toolbar']",
    "[type='hidden']",
    //"[role='presentation']", ///< 票選活動的選項會消失
    "xxx" ///< 留著排版補逗號方便
];
var reservedTags = ["IMG", "BR"];
var deletableAttrs = ["ajaxify", "onclick", "onsubmit", "method", "action"];
var css = "\
    .clearfix::after {content: ' '; display: table; clear: both;} \
    .lfloat {float: left;} .rfloat {float: right;}\
    [role=article] { margin: 0 0 1rem .5rem; border-left: 2px solid #888; padding-left: .5rem; }\
    [role=feed] > div, [role=feed] ~ div { border-top: 2px solid #888; }\
    h1, h2, h3, h4, h5, h6 {margin: .5em auto;}\
    img {margin: 0 .5rem .5rem 0;}\
    abbr {font-size: small; color: #888;}\
    .UFICommentActorName {font-weight: bold; color: #888;}\
    .UFICommentBody {display: block; margin: .5rem;}\
";

var timer;
var delay = function() {
    return 2000 + parseInt(Math.random() * 1000);
};

/// 把畫面一直拉到底
function scrollToEnd(callback) {
    var prevHeight = 0;
    var failCounter = 0;
    timer = setInterval(function() {
        var ch = document.body.clientHeight;
        if(ch == prevHeight) {
            if(failCounter++ >= 5) {
                clearInterval(timer);
                console.log("Auto-scroll stopped.")
                if(callback) setTimeout(callback, delay());
            }
            console.log("Failed to scroll down for the " + failCounter + " time(s) at " + (new Date).toLocalTimeString());
        }
        else {
            failCounter = 0;
            window.scrollTo(0, prevHeight = ch);
        }
    }, delay());
};

/// 包裝成 HTML 然後下載
function downloadHTML(filename, body, style) {
    if(!style) style = '';
    const html = '<!DOCTYPE HTML>\
        <html lang="zh-TW">\
            <head>\
                <meta charset="UTF-8">\
                <title>' + title + '</title>\
                <base href="https://www.facebook.com/" target="_blank">\
                <style>' + style + '</style>\
            </head>\
            <body>\
                <h1>' + title + '</h1>\
                ' + body + '\
            </body>\
        </html>\
    ';

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], {type: "text/html"}));
    a.download = filename;
    a.click();
}

/// 一直找某東西來點
var keepClick = function() {
    var target, counter, total;
    var init = function() {
        target = false;
        counter = 0;
        total = -1;
    };
    init();

    var main = function(con, selector, callback) {
        if(total < 0) {
            total = con.querySelectorAll(selector).length;
            if(!total) {
                console.log("There's no " + selector + " in the container.");
                init();
                if(callback) timer = setTimeout(callback, delay());
                return;
            }
            console.log(selector + " is found " + total + " time(s) in the container.");
        }
        if(!target || !con.contains(target)) {
            target = con.querySelector(selector);
            if(!target) {
                console.log("Clicked all " + selector + " in the container.");
                init();
                if(callback) timer = setTimeout(callback, delay());
                return;
            }
            console.log(++counter + "/" + total);
            target.click();
        }
        timer = setTimeout(function() {
            keepClick(con, selector, callback);
        }, delay());
    };
    main.init = init;
    return main;
}();

/// 依選擇器刪除不要的標籤元素
function removeDescendant(con, selector) {
    var target;
    while(target = con.querySelector(selector))
        target.parentNode.removeChild(target);
    return con;
}

/// 刪掉不要的元素和屬性
function simplify(con) {
    /// 依選擇器刪除不要的標籤元素
    deletableElems.forEach(
        selector => removeDescendant(con, selector)
    );

    /// 遍歷每個元素
    con.querySelectorAll("*").forEach(elem => {
        /// 如果之前已經被刪掉，就不用管了
        if(!con.contains(elem)) return;

        /// 刪掉不能用選擇器挑出來的標籤元素
        if(
            (reservedTags.indexOf(elem.tagName) == -1)  ///< 不是保留元素
            && !elem.querySelector("img") && !elem.querySelector("[role='img']")   ///< 不含圖片
            && !elem.textContent    ///< 沒有內文
        )
            return elem.parentNode.removeChild(elem);

        /// 刪掉 `data-*` 屬性
        var ds = elem.dataset;
        for(var d in ds) delete ds[d];

        /// 刪掉不需要的屬性（不能用 forEach 方法）
        var attrs = elem.attributes;
        for(var i = attrs.length - 1; i >= 0; --i) {
            var attr = attrs[i].name;
            if(
                deletableAttrs.indexOf(attr) != -1
                || (attr == "style" && elem.getAttribute("role") != "img") ///< 貼圖是用 `<div style="background-image: url(xxx);"></div>` 做的。
                || (attr == "href" && elem.getAttribute("href") == "#") ///< 注意跟 `elems[i].href` 不同。
            )
                elem.removeAttribute(attr);
        }
    });

    return con;
}

/// 主程式
/**
 * 備份社團討論區文章。
 *
 * 步驟：
 * 1. 拉到底，甚麼都不改就存一份原始資料為 `unexpanded.html` 。
 * 2. 複製一份，修改複製品為只剩主文，儲存為 `posts.html` 。
 * 3. 點開所有回應，甚麼都不改就存一份原始資料 `postsWithComments_origin.html`
 * 4. 複製一份，刪除不需要的東西，儲存為 `postsWithComments.html` 。
 *
 * 幾個須處理的「更多」：
 * 「更多」：出現於貼文主內容字數較多時。選擇器 `.see_more_link` 。缺點是轉貼私人「網誌」文章時，點了這個會觸發跳頁。幸好除了網誌文章外，那些點了「更多」時會出現的內容早已存在於 DOM tree ，所以不處理也可以。
 * 「檢視另{count}則留言」：出現於單篇文章的留言筆數較多時。選擇器 `.UFIPagerLink` 。
 * 「查看另 {count} 則留言」：與前同，不知為何會有兩種格式。選擇器亦與前同。
 * 「{username}已回覆 · {count}則回覆」：針對回應的回應。選擇器 `._2o9m .UFICommentLink` ，會需要 `._2o9m` 是因為超過十幾則留言的回應時，仍會顯示「隱藏{count}則回覆」
 * 「查看更多」：單一留言字數較多時。選擇器 `.fss` 和 `._5v47` 結果相同。
 */
scrollToEnd(function() {
    console.log("Downloading without expansion ...");
    downloadHTML("unexpanded.html", container.innerHTML);

    console.log("Now clone and simplify it ...");
    var copy = container.cloneNode(true);
    removeDescendant(copy, "form");
    simplify(copy);
    downloadHTML("posts.html", copy.innerHTML, css);

    /*console.log("Expanding comments of posts ...");
    keepClick(container, ".UFIPagerLink", function() {
        console.log("Expanding comments of comments of posts ...");
        keepClick(container, "._2o9m .UFICommentLink", function() {
            console.log("Expanding contents of all comments ...");
            keepClick(container, ".fss._5v47", function() {
                console.log("Downloading without expansion ...");
                downloadHTML("postsWithComments_origin.html", container.innerHTML);

                console.log("Now clone and simplify it ...");
                copy = simplify(container.cloneNode(true));
                downloadHTML("postsWithComments.html", copy.innerHTML, css);
            });
        });
    });*/
});
