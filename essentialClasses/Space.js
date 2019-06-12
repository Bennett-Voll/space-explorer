import Global from './Global.js';
import View from './View.js';
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
     * @param {Number} size 
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

        this.view = new View(this.$container.width(), this.$container.height(), this.$container);

        this.width = this.$container.width();
        this.height = this.$container.height();

        this.roomSize = size;
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
        settings.apoapsis *= 255 / this.roomSize;
        settings.periapsis *= 255 / this.roomSize;
        settings.size *= 255 / this.roomSize;
        
        return settings;
    }

    simulatePlanets() {
        const unixTimeFormat = 1000;

        const time = this.getTime() / unixTimeFormat;

        for (let i = 0; i < this.planets.length; i += 1) {
            this.planets[i].simulate(time);
        }
    }

    drawPlanets() {
        for (let i = 0; i < this.planets.length; i += 1) {
            this.view.drawPlanet(this.planets[i])
        }
    }

    drawTags() {
        for (let i = 0; i < this.tags.length; i += 1) {
            this.view.drawTag(this.tags[i])
        }
    }

    getTime() {
        return Global.getUnixTime() + this.timeOffset;
    }

    getView() {
        return this.view;
    }

    setTimeSpeed(speed = 1) {
        this.timeSpeed = speed;
    }

    getPlanetByName(planetName) {
        return this.planetsByName[planetName.toLowerCase()];
    }

    setReferencePoint(newReferencePoint) {
        this.view.setReferencePoint(newReferencePoint);
    }

    calculateTimeOffset() {
        const timeSinceLastFrame = Global.getTimeSinceLastFrame();

        if (this.timeSpeed !== 1) {
            this.timeOffset += timeSinceLastFrame * this.timeSpeed - timeSinceLastFrame;
        }
    }
}

export default Space;