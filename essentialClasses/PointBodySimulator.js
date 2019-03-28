/**
 * A class simulating a point body's positions according to gravitational laws in a 255x255 environment.
 */
class PointBodySimulator {
    /**
     * 
     * @param {Object} orbitalParameters 
     */
    constructor(orbitalParameters) {
        this.apoapsis = orbitalParameters.apoapsis;
        this.periapsis = orbitalParameters.periapsis;

        this.semiMajorAxis = (orbitalParameters.periapsis + orbitalParameters.apoapsis) / 2;
        this.semiMinorAxis = (
            Math.sqrt(
                Math.pow(this.semiMajorAxis, 2) -
                Math.pow(this.semiMajorAxis - orbitalParameters.periapsis, 2)
            )
        );

        this.eccentricity = (this.semiMajorAxis - orbitalParameters.periapsis) / this.semiMajorAxis;

        this.orbitalSpd = orbitalParameters.orbitalSpd;
        this.orbitalRotation = orbitalParameters.orbitalRotation || 0;

        this.orbitingBody = orbitalParameters.orbitingBody;

        const a = this.semiMajorAxis;
        const b = this.semiMinorAxis;

        // approxomite calculation for the circumference of an ellipse
        this.orbitCircumference = (
            4 * (a + b) * Math.pow(
                Math.PI / 4,
                (4 * a * b / Math.pow(a + b, 2))
            )
        );
    }

    getMeanAnomaly(time) {
        return (time * 2 * Math.PI / this.orbitalSpd) % (Math.PI * 2);
    }

    getTrueAnomaly(meanAnomaly, eccentricity, accuracy = 9) {
        // some really complicated shit    
        const m = meanAnomaly;
        const ecc = eccentricity;
        const acc = accuracy;

        let e = m;
        let delta = .05;

        do {
            delta = e - ecc * Math.sin(e) - m
            e = e - delta / (1 - ecc * Math.cos(e))
        } while (Math.abs(delta) >= 10 ** (-acc));

        let v = 2 * Math.atan(((1 + ecc) / (1 - ecc)) ** .5 * Math.tan(.5 * e))
        if (v < 0) v += 2 * Math.PI;

        return v;
    }

    getRadiusVector(trueAnomaly, eccentricity, semiMajorAxis) {
        const a = semiMajorAxis;
        const e = eccentricity;
        const v = trueAnomaly;

        return (
            a * (1 - e ** 2) / (1 + e * Math.cos(v))
        );
    }

    /**
     * Get the position of this point body within a 255x255 grid.
     * Takes time as an argument and spews out the positions at that time.
     * 
     * @param {Number} time In seconds 
     */
    getPosition(time) {
        const meanAnomaly = this.getMeanAnomaly(time);
        const trueAnomaly = this.getTrueAnomaly(meanAnomaly, this.eccentricity);
        const radiusVector = this.getRadiusVector(
            trueAnomaly,
            this.eccentricity,
            this.semiMajorAxis,
        );

        this.x = this.orbitingBody.x + radiusVector * Math.cos(trueAnomaly + this.orbitalRotation);
        this.y = this.orbitingBody.y + radiusVector * Math.sin(trueAnomaly + this.orbitalRotation);

        return {
            x: this.x,
            y: this.y,
        };
    }
}

export default PointBodySimulator;