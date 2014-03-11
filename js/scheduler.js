/*
    Schedules a function on a given interval, allows for pause, resume,
    toggle, and other conveniences.
*/
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
        this.isRunning() ? this.pause() : this.resume();
    },

    isRunning: function () {
        return !!this.timeout;
    }
}
