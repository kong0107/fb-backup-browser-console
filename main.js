/// 這一段可以一直拉到最舊的文章
var delay = 2000;
var customTitle = document.title || 'Thomas Chen';
var timer = setInterval(function () {
    var prevHeight = 0;
    var failCounter = 0;
    function failHandler() {
        failCounter++;
        console.log(`count: ${failCounter}`);
        return failCounter;
    }
    return function () {
        var ch = document.body.clientHeight;
        if (ch === prevHeight) {
            if (failHandler() === 5) {
                clearInterval(timer);
                console.log("Auto-scroll stopped.")
                isFunction(export_recent_capsule_container) && export_recent_capsule_container();
            }
        } else {
            failCounter = 0;
            window.scrollTo(0, prevHeight = ch);
        }
    }
}(), delay);


///// 幾個待處理的「更多」
/// 檢視另 .UFIPagerLink
/// 查看其他 ._44b2
/// 查看更多



/// 把需要的資料輸出成檔案，並湊齊完整的 HTML 檔案、加上些微排版。

//var html = '<!DOCTYPE HTML><html lang="zh-TW"><head><meta charset="UTF-8"><base href="https://www.facebook.com/" target="_blank"><title>Thomas Chen</title><link rel="stylesheet" href="fb.css"></head><body>'
/*var html = '<!DOCTYPE HTML><html lang="zh-TW"><head><meta charset="UTF-8"><title>Thomas Chen</title><link rel="stylesheet" href="fb.css"></head><body>'
    + document.getElementById("recent_capsule_container").innerHTML
    + '</body></html>';*/

function export_recent_capsule_container() {
    const onload = '(function(nl){for(var i=0;i<nl.length;++i)nl[i].style.cssText="";})(document.querySelectorAll("[style]"))';
    const css = '.see_more_link_inner, .fbTimelineSubSections, .loadingIndicator  { display: none; } .userContentWrapper  { border-top: 4px solid #888; padding: .5rem; } .UFIContainer { margin-left: .5rem; border-left: 2px solid #888; padding-left: .5rem; } ._5x46 * { display: inline; }';

    const html = `<!DOCTYPE HTML>
    <html lang="zh-TW">
        <head>
            <meta charset="UTF-8">
            <title>${customTitle}</title>
            <base href="https://www.facebook.com/" target="_blank">
            <script>document.body.addEventListener("load", function(){${onload}});</script>
            <style>${css}</style>
        </head>
        <body>
          ${document.getElementById("recent_capsule_container").innerHTML}
        </body></html>`;

    const a = document.createElement("a");
    const blob = new Blob([html], { type: "text/html" });
    a.href = URL.createObjectURL(blob);
    a.download = "static.html";
    a.click();
}

function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}