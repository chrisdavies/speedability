// Trim //////////////////////////////////////////////
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

// Scheduler /////////////////////////////////////////

function Scheduler(fn, interval) {
    this.interval = interval || 200;
    this.scheduledFn = fn;
    this.timeout = undefined;
}

Scheduler.intervalsFromMinute = function (i) {
    return 1000 / ((i / 60) || 1);
}

Scheduler.prototype = {
    pause: function () {
        clearTimeout(this.timeout);
        this.timeout = undefined;
    },

    resume: function () {
        var me = this;

        (function run() {
            me.timeout = setTimeout(run, me.interval);
            me.scheduledFn();
        })();
    },

    setInterval: function (ms) {
        this.interval = ms;
    },

    toggle: function () {
        this.timeout ? this.pause() : this.resume();
    }
}

// Words ///////////////////////////////////////////////////////////////

var Words = {
    parse: function (message) {
        function getWords() {
            return (message || '').trim().split(/\s+/g)
        }

        return {
            words: getWords(),
            index: 0,

            moveNext: function () {
                return this.adjust(1);
            },

            movePrev: function () {
                return this.adjust(-1);
            },

            reset: function () {
                this.index = 0;
            },

            current: function () {
                return Words.parts(this.isInRange(this.index) ? this.words[this.index] : '');
            },

            isInRange: function (index) {
                return this.index >= 0 && this.index < this.words.length;
            },

            adjust: function (i) {
                var index = this.index + i;
                if (this.isInRange(index)) {
                    this.index = index;
                    return true;
                }

                return false;
            }
        };
    },

    parts: function (word) {
        var vowels = /[aeiouAEIOU]/,
            position = (vowels.exec(word) || {}).index;

        if (position >= 0) {
            return {
                beginning: position ? word.substring(0, position) : '',
                middle: word.substr(position, 1),
                end: position < word.length ? word.substr(position + 1) : ''
            }
        }

        return {
            beginning: word,
            middle: '',
            end: '',
        };
    }
}

// HtmlUtil ///////////////////////////////////////////////////////

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


// Renderer ///////////////////////////////////////////////////////
function Renderer(container) {
    this.container = container;
}

Renderer.prototype = {
    wordToHtml: function (word) {
        return '<span class="word">' + HtmlUtil.escape(word.beginning) + '<span class="word-focus">' + HtmlUtil.escape(word.middle) + '</span>' + HtmlUtil.escape(word.end) + '</span>';
    },

    render: function (word) {
        this.container.innerHTML = this.wordToHtml(word);
    }
}

// Glue ///////////////////////////////////////////////////////////
var QuickRead = {
    init: function (context) {
        var words = undefined,
            scheduler = new Scheduler(redraw),
            container = document.getElementById('container'),
            renderer = new Renderer(container);

        function updateWords() {
            words = Words.parse(context.text);
        }

        function updateInterval() {
            scheduler.setInterval(Scheduler.intervalsFromMinute(parseInt(document.getElementById('wpm').value)));
        }

        function drawCurrent() {
            renderer.render(words.current());
        }

        function redraw() {
            drawCurrent();
            if (!words.moveNext()) {
                scheduler.pause();
                words.reset();
            }
        }

        updateWords();
        updateInterval();
        container.innerText = "Ready.";

        // DOM events
        function click(id, fn) {
            document.getElementById(id).onclick = fn;
        }

        click('toggle', function () {
            updateInterval();
            scheduler.toggle();
        });

        click('movePrev', function () {
            scheduler.pause();
            words.movePrev();
            drawCurrent();
        });

        click('moveNext', function () {
            scheduler.pause();
            words.moveNext();
            drawCurrent();
        });

        document.getElementById('wpm').onchange = function () {
            updateInterval();
        }
    }
}