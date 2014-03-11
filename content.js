function getArticleText() {
    var e = document.querySelector('section[role=main]')
    return (e || {}).textContent;
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message == 'article-text') {
            var txt = getArticleText();

            sendResponse({ text: txt });
        }
    });
