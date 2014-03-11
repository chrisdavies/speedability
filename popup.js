chrome.runtime.getBackgroundPage(function (bg_pg) {
    bg_pg.getArticleText();
});

function processArticleText(obj) {
    QuickRead.init(obj);
}