import Global from './Global.js';
import Planet from './Planet.js';
import Tags from './Tags.js';

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
        this.timeOffset = 0;
        this.timeSpeed = 1;
        this.referencePoint = {};

        this.planets = [];
        this.planetsByName = {};
        this.lastPlanetId = 0;

        this.tags = [];

        this.isSpace = true;
        this.$container = $(element);
        this.$container.addClass('space-container');

        this.$view = $('<canvas />');
        this.$view.attr('width', this.$container.width());
        this.$view.attr('height', this.$container.height());
        this.$view.addClass('space-view');
        this.$view.appendTo(this.$container);

        this.ctx = this.$view[0].getContext('2d');

        this.width = this.$container.width();
        this.height = this.$container.height();

        // disable pagezoom on mobile
        this.$view.on('touchstart', e => e.preventDefault());

        this.room = {
            x: 0,
            y: 0,
            size: size,
            viewToSpaceRatio: this.$view.width() / 255,
            zoomRatio: 1,
        };

        const panZoom = panzoom(this.$view[0], {
            maxZoom: 100000,
            minZoom: 0.2,
            zoomSpeed: 0.25 ,
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
        if (typeof settings.orbitingBody === 'string') {
            settings.orbitingBody = this.getPlanetByName(settings.orbitingBody);
        }

        const id = this.lastPlanetId;
        const name = (settings.name || String(id)).toLowerCase();

        settings = this.scalePlanetDimensionalSettingsToRoom(settings);

        const planet = new Planet(settings);
        const tag = new Tags(this.$container, planet);

        this.tags.push(tag);

        this.planets.push(planet);
        this.planetsByName[name] = planet;
        this.lastPlanetId += 1;
    }

    scalePlanetDimensionalSettingsToRoom(settings) {
        settings.apoapsis *= 255 / this.room.size;
        settings.periapsis *= 255 / this.room.size;
        settings.size *= 255 / this.room.size;
        
        return settings;
    }

    simulatePlanets() {
        const ctx = this.ctx;
        const width = this.width;
        const height = this.height;

        const unixTimeFormat = 1000;

        const time = this.getTime() / unixTimeFormat;

        for (let i = 0; i < this.planets.length; i += 1) {
            this.planets[i].simulate(time);
        }

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < this.planets.length; i += 1) {
            const draw = this.planets[i].getPlanetDrawProperties();

            const x = this.translateXToView(draw.x);
            const y = this.translateYToView(draw.y);
            const size = this.scaleToRoom(draw.size);

            if (x > 0 && x < width && y > 0 && y < height) {
                this.tags[i].show();
                this.tags[i].moveTo(x, y);
            } else {
                this.tags[i].hide();
            }
            
            if (x < 0 || x > width || y < 0 || y > height || size < 1) {
                continue;
            }

            ctx.save();
            
            ctx.beginPath();
            ctx.arc(x, y, size / 2, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.closePath();
            ctx.drawImage(draw.backgroundImg, x - size / 2, y - size / 2, size, size);
            
            ctx.restore();
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

    getTime() {
        return Global.getUnixTime() + this.timeOffset;
    }

    setTimeSpeed(speed = 1) {
        this.timeSpeed = speed;
    }

    getPlanetByName(planetName) {
        return this.planetsByName[planetName.toLowerCase()];
    }

    setReferencePoint(planet) {
        this.referencePoint = planet;
    }

    calculateTimeOffset() {
        const timeSinceLastFrame = Global.getTimeSinceLastFrame();

        if (this.timeSpeed !== 1) {
            this.timeOffset += timeSinceLastFrame * this.timeSpeed - timeSinceLastFrame;
        }
    }
}

export default Space;