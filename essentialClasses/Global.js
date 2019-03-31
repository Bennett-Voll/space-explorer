class Global {
    static initialize() {
        // time at initialisation
        this.intialTime = new Date();
        this.timeLastRecalc = 0;
        this.timeLastFrame = new Date();
        this.mouse = { x: 0, y: 0 };

        this.$document = $(document);
        this.$body = $(document.body);
        this.$log = $('<div />', {
            id: 'log',
        }).appendTo(this.$body);

        this.$document.on('mousemove', (e) => {
            this.mouse.x = e.pageX;
            this.mouse.y = e.pageY;
        });
    }

    static recalculateFrameData() {
        this.timeNow = this.getUnixTime() - this.getInitialisationTime();
        this.timeSinceLastFrame = this.timeNow - this.getTimeOfLastFrameSinceIntialisation();
        this.fps = 1000 / this.timeSinceLastFrame;

        this.timeLastRecalc = this.timeNow;
    }

    static getTimeSinceLastFrame() {
        return this.timeSinceLastFrame;
    }

    static getFps() {
        return this.fps;
    }
    
    static getTimeNow() {
        return this.timeNow;
    }

    static getUnixTime() {
        return (new Date()).getTime();
    }

    static getInitialisationTime() {
        return this.intialTime.getTime();
    }

    static getTimeOfLastFrameSinceIntialisation() {
        return this.timeLastFrame.getTime();
    }

    static mouseX() {
        return this.mouse.x;
    }

    static mouseY() {
        return this.mouse.y;
    }

    static log(...args) {
        for (let i = 0; i < args.length; i++) {
            this.$log.append(args[i]);
            if (i !== args.length - 1) this.$log.append(' ');
        }

        this.$log.append('<br>');
    }

    static clearLog() {
        this.$log.html('');
    }
}

export default Global;