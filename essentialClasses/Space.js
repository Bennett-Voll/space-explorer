import Planet from './Planet.js';

/**
 * Space encapsulates all planets and draws the view
 * and simulates the passage of time by incrementing a value.
 */
class Space {
    /**
     * 
     * @param {Object} element The element in which we'd like to simulate space
     * @param {*} size 
     */
    constructor(element, size = 1481000) {
        this.time = 0;
        this.timeSpeed = 1;
        this.referencePoint = {};

        // setup variables for planets
        this.planets = [];
        this.planetsByName = {};
        this.lastPlanetId = 0;

        // set the given element as our container
        this.isSpace = true;
        this.$container = $(element);
        this.$container.addClass('space-container');

        // add a view from wich we view upon the room
        this.$view = $('<div />');
        this.$view.addClass('space-view');
        this.$view.appendTo(this.$container);

        // disable pagezoom on mobile
        this.$view.on('touchstart', e => e.preventDefault());

        // set the space in which the planets are represented
        // NOTE: no function has yet assigned to this room.
        //       it exists purely to represent the space
        this.$space = $('<div />');
        this.$space.addClass('space-room');
        this.$space.appendTo(this.$view);

        // TODO: this attribute name 'room' is bad.
        //       Change it to something more fitting
        // in here we define the offset and the zoom ratios wich we'll use to translate a
        // portion of the room to the window
        this.room = {
            x: 0,
            y: 0,
            size: size,
            viewToSpaceRatio: this.$view.width() / size,
            zoomRatio: 1,
        };

        const panZoom = panzoom(this.$view[0], {
            maxZoom: 100000,
            minZoom: 0.2,
            zoomSpeed: 0.14,
        });

        // move view to center
        panZoom.moveTo(0, -this.$view.width() / 2 + this.$view.height() / 2);

        // we'll handle the transforming for panzoom right here
        panZoom.on('transform', (e) => {
            const transform = e.getTransform();

            this.room.zoomRatio = transform.scale;
            this.room.x = transform.x;
            this.room.y = transform.y;
        });
    }

    newPlanet(settings) {
        // if type of orbitingBody is a string, then assume it's a planet name
        if (typeof settings.orbitingBody === 'string') {
            const orbitalBodyName = settings.orbitingBody.toLowerCase();

            if (!this.planetsByName[orbitalBodyName]) {
                throw 'Specified orbital body doesn\'t exist!';
            }

            settings.orbitingBody = this.planetsByName[orbitalBodyName];
        }

        const id = this.lastPlanetId;
        const name = (settings.name || String(id)).toLowerCase();
        const planet = new Planet(settings);

        if (this.planetsByName[name]) {
            throw 'Planet name already exists!';
        }

        this.planets.push(planet);
        this.planetsByName[name] = planet;
        this.lastPlanetId += 1;
    }

    simulatePlanets() {
        for (let i = 0; i < this.planets.length; i += 1) {
            this.planets[i].simulate();
        }

        for (let i = 0; i < this.planets.length; i += 1) {
            this.planets[i].updateElement();
        }
    }

    // translate a x coordinate within the room to the view
    translateXToView(x) {
        const r = this.room;
        return r.x + (x - (this.referencePoint.x || 0)) * r.viewToSpaceRatio * r.zoomRatio;
    }

    // same with y
    translateYToView(y) {
        const r = this.room;
        return r.y + (y - (this.referencePoint.y || 0)) * r.viewToSpaceRatio * r.zoomRatio;
    }

    // scale a size from the room to the view
    scaleToRoom(size) {
        const r = this.room;
        return size * r.viewToSpaceRatio * r.zoomRatio;
    }

    incrementTime() {
        this.time += this.timeSpeed;
    }

    getTime() {
        return this.time;
    }

    setTimeSpeed(speed = 1) {
        this.timeSpeed = speed;
    }

    getPlanetByName(planetName) {
        return this.planetsByName[planetName];
    }

    setReferencePoint(planet) {
        this.referencePoint = planet;
    }
}

export default Space;