import PointBodySimulator from './PointBodySimulator.js';

/**
 * Representative of a planet; places an element at the specified position according to zoom settings and time passed.
 */
class Planet {
    /**
     * 
     * @param {Object} settings 
     */
    constructor(settings) {
        this.pointBodySimulator = new PointBodySimulator(settings);

        this.$element = $('<div />');
        this.$element.addClass('planet');
        this.$element.data('planet', this);
        this.$element.css({
            width: this.relativeSize,
            height: this.relativeSize,
            backgroundImage: `url(${settings.background})`,
        });
        this.space = settings.space;
        this.$space = this.space.$space;
        this.$space.append(this.$element);

        this.$indicator = $('<div />');
        this.$indicator.addClass('space-indicator');
        this.$indicator.appendTo(this.$space);

        this.name = settings.name || '';

        this.x = 0;
        this.y = 0;

        // I just sctratched the surface and am already overwelmed
    }

    simulate() {
        const position = this.pointBodySimulator.getPosition(this.space.getTime() / 60);

        this.x = position.x;
        this.y = position.y;
    }

    updateElement() {
        const actualSize = this.space.scaleToRoom(this.size);

        this.$element.css({
            width: actualSize,
            height: actualSize,
        });

        const y = Math.round((this.space.translateYToView(this.y) - actualSize / 2) * 10) / 10;
        const x = Math.round((this.space.translateXToView(this.x) - actualSize / 2) * 10) / 10;

        this.$element.css({
            top: y,
            left: x,
        });

        this.$indicator.css({
            top: this.space.translateYToView(this.y) - 5,
            left: this.space.translateXToView(this.x) - 5,
        });
    }
}

export default Planet;