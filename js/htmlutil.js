/*
    Utility for escaping/unescaping HTML text.
*/
var HtmlUtil = {
    escape: function (str) {
        var s = document.createElement('span');
        s.appendChild(document.createTextNode(str));
        return s.innerHTML;
    },

    unescape: function (str) {
        var s = document.createElement('span');
        s.innerHTML = str;
        return s.textContent;
    }
};