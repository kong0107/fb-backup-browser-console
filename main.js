/**
 * 備份（別人的）塗鴉牆文章。
 *
 * 程式自動拉到底之後會先下載一次，名為 `unexpanded.html` ；
 * 點完所有的「更多」之後會下載，名為 `whole.html` ；
 * 簡化掉不重要的元件和屬性後，會再存一份，名為 `simplified` 。
 */

var title = "untitled";

/// 這一段可以一直拉到最舊的文章
var delay = 2000;
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
                    document.getElementById("recent_capsule_container").innerHTML
                ));
                expandAll();
            }
        }
        else {
            failCounter = 0;
            window.scrollTo(0, prevHeight = ch);
        }
    }
}(), delay);


/**
 * 幾個須處理的「更多」：
 * 「查看其他 {count} 則貼文」：出現於有較多其他人來牆上貼文時。選擇器 `.showAll > ._4qba` ，但要似乎最後一個是會造成卡住的「顯示全部」（待確認）。
 * 「檢視另{count}則留言」：出現於單篇文章的留言筆數較多時。選擇器 `.UFIPagerLink` 。
 * 「查看另 {count} 則留言」：與前同，不知為何會有兩種格式。選擇器亦與前同。
 * 「{author}{verified_badge}已回覆」「{count}則回覆」：針對回應的回應。選擇器 `.UFICommentLink` 。
 * 「查看更多」：單一留言字數較多時。選擇器 `.fss` 和 `._5v47` 結果相同。（內容似乎不是用 AJAX 取得，但亦非存在 DOM tree 裡，所以還是要點一下）
 * 「更多」：出現於貼文主內容字數較多時，包含別人貼的，以及轉貼別人的臉書文章。好像會觸發跳頁，而且元素已經存在於 DOM tree ，所以不處理也可以。
 * 「繼續閱讀」：出現於使用者發表的網誌，點了不會顯示出剩餘內容，而是會跳頁－－也就是本程式無法備份到的部分。
 */
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
                if(callback) timer = setTimeout(callback, delay);
                return;
            }
            console.log(selector + " is found " + total + " time(s) in the " + con);
        }
        if(!target || !con.contains(target)) {
            target = con.querySelector(selector);
            if(!target) {
                console.log("Clicked all " + selector + " in the " + con);
                init();
                if(callback) timer = setTimeout(callback, delay);
                return;
            }
            console.log(++counter + "/" + total);
            target.click();
        }
        timer = setTimeout(function() {
            keepClick(con, selector, callback);
        }, delay);
    };
}();


/// 這樣寫很醜但有用。
function expandAll() {
    var con = document.getElementById("recent_capsule_container");
    keepClick(con, ".showAll > ._44b2", function() {
        keepClick(con, ".UFIPagerLink", function() {
            keepClick(con, ".UFICommentLink", function() {
                keepClick(con, ".fss._5v47", simplifyAndDownload);
            });
        });
    });
}


/// 把需要的資料輸出成檔案，並湊齊完整的 HTML 檔案。
function simplifyAndDownload() {
    var con = document.getElementById("recent_capsule_container");

    console.log("Downloading the whole container ...");
    triggerDownload("whole.html", wrappingHTML(con.innerHTML));

    console.log("Copying ...");
    var copy = con.cloneNode(true);

    /**
     * 刪掉不需要的節點
     */
    console.log("Deleting unnecessary nodes ...");
    var elems = copy.querySelectorAll("*");
    for(var i = 0; i < elems.length; ++i) {
        var ele = elems[i];
        if(!copy.contains(ele)) continue;
        if(ele.tagName != "IMG" && !ele.querySelector("img") && !ele.textContent)
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
            if( attr == "onclick"
                || attr == "ajaxify"
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
    var css = '';//'.see_more_link_inner, .fbTimelineSubSections, .loadingIndicator  { display: none; } .userContentWrapper  { border-top: 4px solid #888; padding: .5rem; } .UFIContainer { margin-left: .5rem; border-left: 2px solid #888; padding-left: .5rem; } ._5x46 * { display: inline; }';
    var html = '<!DOCTYPE HTML>\
    <html lang="zh-TW">\
        <head>\
            <meta charset="UTF-8">\
            <title>' + title + '</title>\
            <base href="https://www.facebook.com/" target="_blank">\
            <style>' + css + '</style>\
        </head>\
        <body>';
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
