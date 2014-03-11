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

// Glue ///////////////////////////////////////////////////////////
var QuickRead = {
    init: function (context) {
        var words = undefined,
            scheduler = new Scheduler(redraw),
            container = document.getElementById('container'),
            renderer = new WordRenderer(container);

        function updateWords() {
            words = WordIterator.parse(context.text);
        }

        function updateInterval() {
            scheduler.setInterval(Scheduler.intervalsFromMinute(parseInt(document.getElementById('wpm').value)));
        }

        function drawCurrent() {
            renderer.render(words.current());
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
            updateProgress();

            if (!words.moveNext()) {
                scheduler.pause();
                words.reset();
            }

            updatePlayPauseButton();
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