/*
    This script concerns itself with the DOM, events, and storage.
*/

// Rendering ///////////////////////////////////////////////////////////
function WordRenderer(container) {
    this.container = container;
}

WordRenderer.prototype = {
    wordToHtml: function (word) {
        return '<span class="word">' + HtmlUtil.escape(word.beginning) + '<span class="word-focus">' + HtmlUtil.escape(word.middle) + '</span>' + HtmlUtil.escape(word.end) + '</span>&nbsp;';
    },

    render: function (word) {
        this.container.innerHTML = this.wordToHtml(word);
    }
}

// Storage ///////////////////////////////////////////////////////////
var Settings = {
    updateSettings: function (fn) {
        var settings = this.getSettings();
        fn(settings);
        localStorage.setItem('settings', JSON.stringify(settings));
    },

    getSettings: function () {
        return JSON.parse(localStorage.getItem('settings') || '{}');
    },

    getWpm: function () {
        return this.getSettings().wpm || 300;
    },

    setWpm: function (wpm) {
        this.updateSettings(function (settings) {
            settings.wpm = wpm;
        });
    },

    setProgress: function (url, progress) {
        var maxSize = 10;
        this.updateSettings(function (settings) {
            settings.progress = RoundRobbin.add(maxSize, settings.progress, {
                id: url,
                updated: new Date(),
                progress: progress
            });
        });
    },

    getProgress: function (url) {
        return (RoundRobbin.get(this.getSettings().progress, url) || {
            progress: 0
        }).progress;
    }
}

// Glue ///////////////////////////////////////////////////////////
var QuickRead = {
    init: function (context) {
        var words = undefined,
            wpmElement = document.getElementById('wpm'),
            scheduler = new Scheduler(redraw),
            container = document.getElementById('container'),
            renderer = new WordRenderer(container);

        if (!context.text) {
            container.innerHTML = ':/';
            return;
        }

        function updateWords() {
            words = WordIterator.parse(context.text);
        }

        function updateInterval() {
            var wpm = parseInt(wpmElement.value);
            Settings.setWpm(wpm);
            scheduler.setInterval(Scheduler.intervalsFromMinute(wpm));
        }

        function drawCurrent() {
            renderer.render(words.current());
            updateProgress();
            updatePlayPauseButton();
        }

        function updateProgress() {
            document.getElementById('progress').style.width = words.progress() + '%';
        }

        function updatePlayPauseButton() {
            var button = document.getElementById('toggle');
            if (scheduler.isRunning()) {
                button.classList.add('playing');
            } else {
                button.classList.remove('playing');
            }
        }

        function redraw() {
            drawCurrent();

            if (!words.moveNext()) {
                scheduler.pause();
                words.reset();
            }

            updatePlayPauseButton();
        }

        function movePrev() {
            scheduler.pause();
            words.movePrev();
            drawCurrent();
        }

        function moveNext() {
            scheduler.pause();
            words.moveNext();
            drawCurrent();
        }

        // DOM events
        function on(evt, id, fn) {
            document.getElementById(id)['on' + evt] = fn;
        }

        on('click', 'toggle', function () {
            updateInterval();
            scheduler.toggle();
        });

        on('click', 'movePrev', movePrev);
        on('click', 'moveNext', moveNext);

        on('dblclick', 'movePrev', function () {
            words.setProgress(0);
            redraw();
        });

        on('dblclick', 'moveNext', function () {
            words.setProgress(100);
            redraw();
        });

        wpmElement.onchange = function () {
            updateInterval();
        }

        document.onkeydown = function (e) {
            if (e.keyCode == 37) {
                movePrev();
            } else if (e.keyCode == 39) {
                moveNext();
            }
        }
        
        chrome.tabs.getSelected(null, function (tab) {
            wpmElement.value = Settings.getWpm();

            updateWords();

            var progress = Settings.getProgress(tab.url);
            if (progress) {
                words.setProgress(progress);
            }

            updateInterval();
            redraw();
            container.innerText = "Ready.";

            window.onunload = function () {
                Settings.setProgress(tab.url, words.progress());
            };
        });
    }
}