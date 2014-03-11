/*
    Parses text and provides a stream of words, with the beginning,
    middle, and end broken out for highlighting purposes.
*/
var WordIterator = {
    parse: function (message) {
        function getWords() {
            return (message || '').replace(/\-+|\—+/g, '- ').split(/\s+/g)
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
                return WordIterator.parts(this.isInRange(this.index) ? this.words[this.index] : '');
            },

            progress: function() {
                return Math.max(0, Math.min(100, ((this.index / this.words.length) * 100)));
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