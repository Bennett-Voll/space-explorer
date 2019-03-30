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

        this.x = 0;
        this.y = 0;
    }
    
    getName() {
        return this.name;
    }

    simulate(timeInFrames) {
        const position = this.pointBodySimulator.getPosition(timeInFrames / 60);

        this.x = position.x;
        this.y = position.y;
    }

    /**
     * Get the planet's draw properties bounded within a 255x255 grid
     */
    getPlanetDrawProperties() {
        return {
            x: this.x,
            y: this.y,
            size: this.size,
            backgroundImg: this.backgroundImg,
        };
    }
}

export default Planet;