import PointBodySimulator from './PointBodySimulator.js';

/**
 * Representative of a planet; places an element at the specified position according to zoom settings and time passed.
 */
class Planet {
    /**
     * Dimensional parameters given in the settings object must be bounded within a 255x255 grid
     * 
     * @param {Object} settings 
     */
    constructor(settings) {
        this.pointBodySimulator = new PointBodySimulator(settings);
        
        this.backgroundUrl = settings.background;
        this.backgroundImg = new Image();

        this.backgroundImg.src = this.backgroundUrl;

        this.name = settings.name || '';

        this.size = settings.size;

        this.alwaysShowTag = settings.alwaysShowTag;

        this.x = 0;
        this.y = 0;
    }

    shouldAlwaysShowTag() {
        return this.alwaysShowTag;
    }
    
    getName() {
        return this.name;
    }

    getPointBodySimulator() {
        return this.pointBodySimulator;
    }

    simulate(timeInSeconds) {
        const position = this.pointBodySimulator.getPosition(timeInSeconds);

        this.x = position.x;
        this.y = position.y;
    }

    /**
     * Get the planet's draw properties bounded within a 255x255 grid
     */
    getDrawProperties() {
        return {
            x: this.x,
            y: this.y,
            size: this.size,
            backgroundImg: this.backgroundImg,
        };
    }
}

export default Planet;