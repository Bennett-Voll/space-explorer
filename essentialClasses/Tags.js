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
        this.$tag.css({
            opacity: 0,
        });
    }

    show() {
        this.$tag.css({
            opacity: 1,
        });
    }

    moveTo(x, y) {
        this.$tag.css({
            left: x,
            top: y - this.$tag.height() / 2,
        });
    }
}

export default Tags;