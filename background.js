function sendToPopup(obj) {
    var popups = chrome.extension.getViews({ type: "popup" });
    if (0 < popups.length) {
        popups[0].processArticleText(obj);
    }
}

function getArticleText() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { message: 'article-text' }, function (response) {
            sendToPopup(response);
        });
    });
}

function checkForValidUrl(tabId, changeInfo, tab) {
    if (tab.url.indexOf('readability.com') >= 0) {
        chrome.pageAction.show(tabId);
    }
};

chrome.tabs.onUpdated.addListener(checkForValidUrl);