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

        this.view = {
            offsetX: 0,
            offsetY: 0,
            width: this.$view.width(),
            height: this.$view.height(),
            size: Math.max(
                this.$view.width(),
                this.$view.height()
            ),
            zoomRatio: 1,
        };

        this.view.viewToSpaceRatio = this.view.size / 255;
        
        this.room = {
            size: size,
        };

        this.panZoom = panzoom(this.$view[0], {
            maxZoom: 100000,
            minZoom: 0.2,
            zoomSpeed: 0.25,
        });

        // move view to center
        this.panZoom.moveTo(0, -this.view.width / 2 + this.view.height / 2);

        // we'll handle the transforming for panzoom right here
        this.panZoom.on('transform', (e) => {
            const transform = e.getTransform();

            this.view.zoomRatio = transform.scale;
            this.view.offsetX = transform.x;
            this.view.offsetY = transform.y;
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
            const planet = this.planets[i];
            const drawProps = planet.getPlanetDrawProperties();
            const transDrawProps = this.transformPlanetDrawPropsToView(drawProps);

            const x = transDrawProps.x;
            const y = transDrawProps.y;
            const size = transDrawProps.size;
            const backgroundImg = transDrawProps.backgroundImg;

            const pointBodySimulator = planet.getPointBodySimulator();
            const radiusVector = pointBodySimulator.getRadiusVector();
            const alwaysShowTag = planet.shouldAlwaysShowTag();

            if (this.planetDrawPropsAreInView(transDrawProps)) {

                if ( ! alwaysShowTag && this.scaleToRoom(radiusVector) / this.view.size < 0.01) {
                    this.tags[i].hide();
                } else {
                    this.tags[i].show();
                    this.tags[i].moveTo(x, y);
                }
                
                if (this.planetDrawPropsNotTooSmallInView(transDrawProps)) {

                    ctx.save();
            
                    ctx.beginPath();
                    ctx.arc(x, y, size / 2, 0, Math.PI * 2, true);
                    ctx.clip();
                    ctx.closePath();
                    ctx.drawImage(backgroundImg, x - size / 2, y - size / 2, size, size);
                    
                    ctx.restore();

                }
            } else {
                this.tags[i].hide();
            }
        }
    }

    transformPlanetDrawPropsToView(drawProps) {
        return {
            ...drawProps,
            x: this.translateXToView(drawProps.x),
            y: this.translateYToView(drawProps.y),
            size: this.scaleToRoom(drawProps.size),
        }
    }

    planetDrawPropsAreInView(drawProps) {
        const width = this.width;
        const height = this.height;

        return (
            drawProps.x + drawProps.size / 2 > 0 &&
            drawProps.x - drawProps.size / 2 < width &&
            drawProps.y + drawProps.size / 2 > 0 &&
            drawProps.y - drawProps.size / 2 < height
        );
    }

    planetDrawPropsNotTooSmallInView(drawProps) {
        return drawProps.size > 1;
    }

    // translate a x coordinate within the room to the view
    translateXToView(x) {
        const v = this.view;
        return v.offsetX + (x - (this.referencePoint.x || 0)) * v.viewToSpaceRatio * v.zoomRatio;
    }

    // same with y
    translateYToView(y) {
        const v = this.view;
        return v.offsetY + (y - (this.referencePoint.y || 0)) * v.viewToSpaceRatio * v.zoomRatio;
    }

    // scale a size from the room to the view
    scaleToRoom(size) {
        return size * this.view.viewToSpaceRatio * this.view.zoomRatio;
    }

    moveViewTo(x, y) {
        this.panZoom.moveTo(x, y);
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
        const drawProps = planet.getPlanetDrawProperties();
        const transDrawProps = this.transformPlanetDrawPropsToView(drawProps);

        this.moveViewTo(
            transDrawProps.x,
            transDrawProps.y
        );

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