/**
 * 備份社團討論區文章。
 *
 * 程式自動拉到底之後會先下載一次，名為 `unexpanded.html` ；
 * 點完所有的「更多」之後會下載，名為 `whole.html` ；
 * 簡化掉不重要的元件和屬性後，會再存一份，名為 `simplified` 。
 */

const title = document.title;
const container = document.querySelector("._5pcb");
const deletableAttrs = ["ajaxify", "onclick", "onsubmit", "method", "action"];
const css = "\
    .clearfix::after {content: ' '; display: table; clear: both;} .lfloat {float: left;} .rfloat {float: right;}\
    [role=article] { margin: 0 0 1rem .5rem; border-left: 2px solid #888; padding-left: .5rem; }\
    [role=feed] > div, body > div { border-top: 2px solid #888; }\
    img {margin: .5rem}\
    abbr {font-size: small; color: #888;}\
    .UFICommentActorName {font-weight: bold; color: #888;}\
    .UFICommentBody {display: block; margin: .5rem;}\
";

var delay = function() {
    return 2000 + parseInt(Math.random() * 1000);
};

/// 這一段可以一直拉到最舊的文章
var timer = setInterval(function() {
    var prevHeight = 0;
    var failCounter = 0;
    return function() {
        var ch = document.body.clientHeight;
        if(ch == prevHeight) {
            if(failCounter++ == 5) {
                clearInterval(timer);
                console.log("Auto-scroll stopped.")
                console.log("Downloading without expansion ...");
                triggerDownload("unexpanded.html", wrappingHTML(
                    container.innerHTML
                ));
                expandAll();
            }
            console.log("Failed to scroll down for the " + failCounter + " time(s) at " + (new Date).toLocalTimeString());
        }
        else {
            failCounter = 0;
            window.scrollTo(0, prevHeight = ch);
        }
    }
}(), delay());

var timer;
var keepClick = function() {
    var target, counter, total;
    var init = function() {
        target = false;
        counter = 0;
        total = -1;
    };
    init();
    return function(con, selector, callback) {
        if(total < 0) {
            total = con.querySelectorAll(selector).length;
            if(!total) {
                console.log("There's no " + selector + " in the " + con);
                init();
                if(callback) timer = setTimeout(callback, delay());
                return;
            }
            console.log(selector + " is found " + total + " time(s) in the " + con);
        }
        if(!target || !con.contains(target)) {
            target = con.querySelector(selector);
            if(!target) {
                console.log("Clicked all " + selector + " in the " + con);
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
}();



/**
 * 幾個須處理的「更多」：
 * 「更多」：出現於貼文主內容字數較多時。選擇器 `.see_more_link` 。缺點是轉貼私人「網誌」文章時，點了這個會觸發跳頁。幸好除了網誌文章外，那些點了「更多」時會出現的內容早已存在於 DOM tree ，所以不處理也可以。
 * 「檢視另{count}則留言」：出現於單篇文章的留言筆數較多時。選擇器 `.UFIPagerLink` 。
 * 「查看另 {count} 則留言」：與前同，不知為何會有兩種格式。選擇器亦與前同。
 * 「{username}已回覆 · {count}則回覆」：針對回應的回應。選擇器 `.UFICommentLink` 。
 * 「查看更多」：單一留言字數較多時。選擇器 `.fss` 和 `._5v47` 結果相同。
 */
function expandAll() {
    //container.querySelectorAll(".see_more_link").forEach(elem => elem.click());
    keepClick(container, ".UFIPagerLink", function() {
        keepClick(container, ".UFICommentLink", function() {
            keepClick(container, ".fss._5v47", simplifyAndDownload);
        });
    });
}


/// 把需要的資料輸出成檔案，並湊齊完整的 HTML 檔案。
function simplifyAndDownload() {

    console.log("Downloading the whole container ...");
    triggerDownload("whole.html", wrappingHTML(container.innerHTML));

    console.log("Copying ...");
    var copy = container.cloneNode(true);

    /**
     * 刪掉不需要的節點
     * 1. 依篩選器
     * 2. 不方便用篩選器判斷的
     */
    console.log("Deleting unnecessary nodes ...");
    [
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
        "xxx" ///< 留著排版補逗號方便
    ].forEach(selector => {
        console.log("Deleting " + selector);
        copy.querySelectorAll(selector).forEach(
            ele => ele.parentNode.removeChild(ele)
        );
    });

    var elems = copy.querySelectorAll("*");
    for(var i = 0; i < elems.length; ++i) {
        var ele = elems[i];
        if(!copy.contains(ele)) continue; ///< 如果是前一輪迴圈中被刪掉的節點所包含的，就不用處理了。
        if(ele.tagName != "IMG" && !ele.querySelector("img") && !ele.textContent) ///< 不是圖片、不含圖片、又沒有內文
            ele.parentNode.removeChild(ele);
    }

    /**
     * 刪掉不需要的屬性
     */
    console.log("Deleting unnecessary attributes ...");
    var elems = copy.querySelectorAll("*");
    for(var i = 0; i < elems.length; ++i) {
        var ds = elems[i].dataset;
        for(var j in ds) delete ds[j];

        var attrs = elems[i].attributes;
        for(var j = 0; j < attrs.length; ++j) {
            var attr = attrs[j].name;
            if( deletableAttrs.indexOf(attr) != -1
                || (attr == "style" && !elems[i].style.backgroundImage) ///< 貼圖是用 `<div style="background-image: url(xxx);"></div>` 做的。
                || (attr == "href" && elems[i].getAttribute("href") == "#") ///< 注意跟 `elems[i].href` 不同。
                //|| attr.match(/^data-/) ///< 用 `Element.dataset` 物件處理即可
                //|| attr.match(/^aria-/) ///< 身為手天使成員，還是不要刪這個吧。而且 `aria-label` 在按讚／怒數那邊可以用。
            )
                elems[i].removeAttribute(attr);
        }
    }

    console.log("Downloading the simplified version ...");
    triggerDownload("simplified.html", wrappingHTML(copy.innerHTML));
    console.log("Done!");
}

function wrappingHTML(body) {
    var html = '<!DOCTYPE HTML>\
    <html lang="zh-TW">\
        <head>\
            <meta charset="UTF-8">\
            <title>' + title + '</title>\
            <base href="https://www.facebook.com/" target="_blank">\
            <style>' + css + '</style>\
        </head>\
        <body>\
            <h1>' + title + '</h1>\
    ';
    html += body + '</body></html>';
    return html;
}

function triggerDownload(filename, content, type) {
    if(!type) type = "text/html";
    var a = document.createElement("a");
    var blob = new Blob([content], {type: type});
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}
