/*
    This script concerns itself with the DOM, events, and storage.
*/

// Rendering ///////////////////////////////////////////////////////////
function WordRenderer(container) {
    this.container = container;
}

WordRenderer.prototype = {
    wordToHtml: function (word) {
        return '<span class="word">' + HtmlUtil.escape(word.beginning) + '<span class="word-focus">' + HtmlUtil.escape(word.middle) + '</span>' + HtmlUtil.escape(word.end) + '</span>';
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
        var maxSize = 2;
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
                document.getElementById('debug').innerText = 'done ' + words.index + '-' + words.words.length;

                scheduler.pause();
                words.reset();
            }

            updatePlayPauseButton();
        }
        
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

        wpmElement.onchange = function () {
            updateInterval();
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