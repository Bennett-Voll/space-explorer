import $ from 'jquery';

class Tags {
    constructor($parent, planet) {
        this.$tag = $('<div />', {
            class: 'planet-tag',
            html: planet.getName(),
        });

        this.$tag.prepend($('<div />', {
            class: 'tag-arrow',
        }));

        $parent.append(this.$tag);

        this.planet = planet;
    }

    hide() {
        this.$tag.removeClass('tag-visible');
        this.$tag.addClass('tag-invisible');
    }

    show() {
        this.$tag.addClass('tag-visible');
        this.$tag.removeClass('tag-invisible');
    }

    moveTo(x, y) {
        this.$tag.css({
            left: x,
            top: y - this.$tag.height() / 2,
        });
    }

    getDrawProperties() {
        return this.planet.getDrawProperties();
    }

    isAlwaysShown() {
        return this.planet.shouldAlwaysShowTag();
    }

    getPlanetRadiusVector() {
        const pointBodySimulator = this.planet.getPointBodySimulator();

        return pointBodySimulator.getRadiusVector();
    }
}

export default Tags;
