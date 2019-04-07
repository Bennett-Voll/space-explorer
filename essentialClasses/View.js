class View {
    constructor(width, height, parent) {
        this.$canvas = $('<canvas />');
        this.$canvas.attr('width', width);
        this.$canvas.attr('height', height);
        this.$canvas.addClass('space-view');
        this.$canvas.appendTo(parent);

        this.ctx = this.$canvas[0].getContext('2d');

        this.referencePoint = {};

        this.width = width;
        this.height = height;

        this.size = Math.max(
            width,
            height,
        );

        // disable pagezoom on mobile
        this.$canvas.on('touchstart', e => e.preventDefault());

        this.viewOffsetX = 0;
        this.viewOffsetY = 0;

        this.zoomRatio = 1;

        this.viewToSpaceRatio = this.size / 255;

        this.panZoom = panzoom(this.$canvas[0], {
            maxZoom: 100000,
            minZoom: 0.2,
            zoomSpeed: 0.25,
        });

        // move view to center
        this.panZoom.moveTo(0, -this.width / 2 + this.height / 2);

        // we'll handle the transforming for panzoom right here
        this.panZoom.on('transform', (e) => {
            const transform = e.getTransform();

            this.zoomRatio = transform.scale;
            this.viewOffsetX = transform.x;
            this.viewOffsetY = transform.y;
        });
    }
    
    moveViewTo(x, y) {
        this.panZoom.moveTo(x, y);
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawPlanet(planet) {
        const ctx = this.ctx;

        const drawProps = planet.getDrawProperties();
        const transDrawProps = this.transformPlanetDrawPropsToView(drawProps);

        const x = transDrawProps.x;
        const y = transDrawProps.y;
        const size = transDrawProps.size;
        const backgroundImg = transDrawProps.backgroundImg;

        if (
            this.drawPropsAreInView(transDrawProps) &&
            this.planetDrawPropsNotTooSmallInView(transDrawProps)
        ) {            
            ctx.save();
    
            ctx.beginPath();
            ctx.arc(x, y, size / 2, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.closePath();
            ctx.drawImage(backgroundImg, x - size / 2, y - size / 2, size, size);
            
            ctx.restore();
        }
    }

    drawTag(tag) {
        const drawProps = tag.getDrawProperties();
        const transDrawProps = this.transformPlanetDrawPropsToView(drawProps);

        const x = transDrawProps.x;
        const y = transDrawProps.y;

        const radiusVector = tag.getPlanetRadiusVector();
        const isAlwaysShown = tag.isAlwaysShown(); 

        if (this.drawPropsAreInView(transDrawProps)) {
            if ( ! isAlwaysShown && this.scaleToRoom(radiusVector) / this.size < 0.01) {
                tag.hide();
            } else {
                tag.show();
                tag.moveTo(x, y);
            }
        } else {
            tag.hide();
        }
    }

    planetDrawPropsNotTooSmallInView(drawProps) {
        return drawProps.size > 1;
    }

    drawPropsAreInView(drawProps) {
        const width = this.width;
        const height = this.height;

        return (
            drawProps.x + drawProps.size / 2 > 0 &&
            drawProps.x - drawProps.size / 2 < width &&
            drawProps.y + drawProps.size / 2 > 0 &&
            drawProps.y - drawProps.size / 2 < height
        );
    }

    /**
     * Give as argument an instance with an x and y property and the getDrawProperties method.
     * 
     * @param {Object} newReferencePoint 
     */
    setReferencePoint(newReferencePoint) {
        this.compensateForReferencePointChange(newReferencePoint);

        this.referencePoint = newReferencePoint;
    }

    compensateForReferencePointChange(newReferencePoint) {
        const drawProps = newReferencePoint.getDrawProperties();
        const transDrawProps = this.transformPlanetDrawPropsToView(drawProps);

        this.moveViewTo(
            transDrawProps.x,
            transDrawProps.y
        );
    }

    transformPlanetDrawPropsToView(drawProps) {
        return {
            ...drawProps,
            x: this.translateXToView(drawProps.x),
            y: this.translateYToView(drawProps.y),
            size: this.scaleToRoom(drawProps.size),
        }
    }

    translateXToView(x) {
        return this.viewOffsetX + (x - (this.referencePoint.x || 0)) * this.viewToSpaceRatio * this.zoomRatio;
    }

    translateYToView(y) {
        return this.viewOffsetY + (y - (this.referencePoint.y || 0)) * this.viewToSpaceRatio * this.zoomRatio;
    }

    scaleToRoom(quantity) {
        return quantity * this.viewToSpaceRatio * this.zoomRatio;
    }
}

export default View;