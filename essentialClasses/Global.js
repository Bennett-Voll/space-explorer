class Global {
    constructor() {
        // time at initialisation
        this.initTime = new Date();
        this.timeLastRecalc = 0;
        this.timeLastFrame = new Date();
        this.mouse = { x: 0, y: 0 };

        this.$document = $(document);
        this.$body = $(document.body);
        this.$log = $('<div id="log"></div>').appendTo(this.$body);

        this.$document.on('mousemove', (e) => {
            this.mouse.x = e.pageX;
            this.mouse.y = e.pageY;
        });
    }

    // recalculate global data
    recalculate() {
        this.timeNow = (new Date()).getTime() - this.initTime.getTime();
        this.timeSinceLastRecalc = (this.timeNow - this.timeLastFrame.getTime());
        this.fps = 1000 / this.timeSinceLastRecalc;

        this.timeLastRecalc = this.timeNow;
    }

    // return the time since the last recalculation
    getTimeSinceLastRecalc() {
        return this.timeSinceLastRecalc;
    }

    getFps() {
        return this.fps;
    }

    // time in ms since initialisation
    getTimeNow() {
        return this.timeNow;
    }

    mouseX() {
        return this.mouse.x;
    }

    mouseY() {
        return this.mouse.y;
    }

    log(...args) {
        for (let i = 0; i < args.length; i++) {
            this.$log.append(args[i]);
            if (i !== args.length - 1) this.$log.append(' ');
        }

        this.$log.append('<br>');
    }

    clearLog() {
        this.$log.html('');
    }
}

export default Global;