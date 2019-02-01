/*
  inspiration: https://martinwecke.de/

  Many thanks to https://github.com/anvaka/panzoom
  Altough I'd have liked to see a way of altering my zoom speed after intitialisation
  I probably would make a hack for that anyway
  NOTE: hack didn't work. Sorry, I need a new library.

  TODO: Make a hack so that when a lot of zooming happens during
        a short time period, the zoomspeed will speed up. I can make
        this work. Maybe
*/

$.fn.selectize(function(settings) {
  Selectize($(this), settings);
});

/*
  Define global variables and functions
*/
class Global {
  constructor() {
    // time at initialisation
    this.initTime = new Date();
    this.timeLastRecalc = 0;
    this.timeLastFrame = new Date();
    this.$document = $(document);
    this.$body = $(document.body);
    this.$log = $('<div id="log"></div>').appendTo(this.$body);
    this.mouse = { x: 0, y: 0 };

    this.$document.on('mousemove', (e) => {
      this.mouse.x = e.pageX;
      this.mouse.y = e.pageY;
    });
  }

  // recalculate global data
  recalculate() {
    this.timeNow = (new Date()).getTime() - this.initTime.getTime();
    this.timeSinceLastRecalc = (this.timeNow - this.timeLastFrame.getTime());
    this.fps = 1000 / this.timeSinceLastRecalc;
    
    this.timeLastRecalc = this.timeNow;
  }

  // return the time since the last recalculation
  getTimeSinceLastRecalc() {
    return this.timeSinceLastRecalc;
  }

  getFps() {
    return this.fps;
  }

  // time in ms since initialisation
  getTimeNow() {
    return this.timeNow;
  }

  mouseX() {
    return this.mouse.x;
  }

  mouseY() {
    return this.mouse.y;
  }

  log(...args) {
    for (let i = 0; i < args.length; i++) {
      this.$log.append(args[i]);
      if (i !== args.length - 1) this.$log.append(' ');
    }
    this.$log.append('<br>');
  }

  clearLog() {
    this.$log.html('');
  }
}

const global = new Global;

/*
  Define space options, used to alter options to this space
*/
class SpaceOptions {
  constructor($options, space) {
    this.$options = $options;
    this.$options.on('mousedown', e => e.stopPropagation());
    this.$options.on('dblclick', e => e.stopPropagation());
    this.$options.on('keydown', e => e.stopPropagation());
    this.$options.on('touchstart', e => e.stopPropagation());
    this.$options.on('wheel', e => e.stopPropagation());
    this.space = space;
    this.options = {};
  }

  addSlider(name, defVal, onChange) {
    const optionId = ~~(Math.random() * 100000000)
    const $option = $(`
<div class="container-fluid option">

<div class="row clearfix">
<label class="col-md-3">
${name}
</label>
<div class="col-md-9 input">
<input type="range" min="0" max="100" name="${optionId}" value="1" autocomplete="off" />
</div>
</div>

<div class="row clearfix">
<div class="col-md-9 value"></div>
<div class="col-md-3"><button class="btn btn-default default">Default</div>
</div>

</div>
`);

    const $input = $option.find('input');
    const $value = $option.find('.value');
    const $default = $option.find('.default');
    const onChange2 = () => {
      const params = onChange($input, this.space);
      
      $value.html(params.value);
    };
    
    $input.on('change', onChange2);
    
    $default.on('click', () => {
      $input.val(defVal);
      onChange2();
    });
    
    this.$options.append($option);
  }
  
  addSelectize(name, defVal, onChange, options = [], settings = {}) {
    const optionId = ~~(Math.random() * 100000000)
    const $option = $(`
<div class="container-fluid option">

<div class="row clearfix">
<label class="col-md-3">
${name}
</label>
<div class="col-md-9 input">
<select name="${optionId}" autocomplete="off">
${options.map(e => `<option value="${e.value}">${e.text}</option>`).join('')}
</select>
</div>
</div>

<div class="row clearfix">
<div class="col-md-9 value"></div>
<div class="col-md-3"><button class="btn btn-default default">Default</div>
</div>

</div>
`);
    const $input = $option.find('select');
    const $value = $option.find('.value');
    const $default = $option.find('.default');
    const onChange2 = () => {
      const params = onChange($input, this.space);
      
      $value.html(params.value);
    };
    
    $input.selectize(settings);
    $input[0].selectize.on('change', onChange2);
    
    $default.on('click', () => {
      $input[0].selectize.setValue(defVal);
    });
    
    this.$options.append($option);
  }
}

/*
 Define space
 includes the view from which we view space and space itself
 also keeps by the current time

 @param element Element in which we define space
 @param size Size of space. Default right now is the average orbital
             diameter of Jupiter in 10³ kilometers
*/
class Space {
  constructor(element, size = 1481000) {
    this.time = 0;
    this.timeSpeed = 1;
    this.reference = {};
    
    // setup variables for planets
    this.planets = [];
    this.planetsByName = {};
    this.lastPlanetId = 0;

    // set the given element as our container
    this.isSpace = true;
    this.$container = $(element);
    this.$container.addClass('space-container');

    // add a view from wich we view upon the room
    this.$view = $('<div />');
    this.$view.addClass('space-view');
    this.$view.appendTo(this.$container);

    // disable pagezoom on mobile
    this.$view.on('touchstart', e => e.preventDefault());

    // set the space in which the planets are represented
    // NOTE: no function has yet assigned to this room.
    //       it exists purely to represent the space
    this.$space = $('<div />');
    this.$space.addClass('space-room');
    this.$space.appendTo(this.$view);

    // TODO: this attribute name 'room' is bad.
    //       Change it to something more fitting
    // in here we define the offset and the zoom ratios wich we'll use to translate a
    // portion of the room to the window
    this.room = {
      x: 0,
      y: 0,
      size: size,
      viewToSpaceRatio: this.$view.width() / size,
      zoomRatio: 1,
    };

    const panZoom = panzoom(this.$view[0], {
      maxZoom: 100000,
      minZoom: 0.2,
      zoomSpeed: 0.14,
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

    //     const update = () => {
    //       if (
    //         width !== this.$space.prop('clientWidth') ||
    //         height !== this.$space.prop('clientHeight')
    //       ) {
    //         width = this.$space.prop('clientWidth');
    //         height = this.$space.prop('clientHeight');

    //         console.log('change!')
    //         this.spaceSize = this.getSpaceSize();
    //         this.setSpaceCenter();
    //         this.setSpaceRatio(); 
    //       }

    //       requestAnimationFrame(update);
    //     };
  }
  
  newPlanet(settings) {
    // if type of orbitingBody is a string, then assume it's a planet name
    if (typeof settings.orbitingBody === 'string') {
      const orbitalBodyName = settings.orbitingBody.toLowerCase();
      
      if (!this.planetsByName[orbitalBodyName]) {
        throw 'Specified orbital body doesn\'t exist!';
      }
      
      settings.orbitingBody = this.planetsByName[orbitalBodyName];
    }
    
    const id = this.lastPlanetId;
    const name = (settings.name || String(id)).toLowerCase();
    const planet = new Planet(settings);
    
    if (this.planetsByName[name]) {
      throw 'Planet name already exists!';
    }
    
    this.planets.push(planet);
    this.planetsByName[name] = planet;
    this.lastPlanetId += 1;
  }

  simulatePlanets() {
    for (let i = 0; i < this.planets.length; i += 1) {
      this.planets[i].simulate();
    }
    
    for (let i = 0; i < this.planets.length; i += 1) {
      this.planets[i].updateElement();
    }
  }

  // translate a x coordinate within the room to the view
  xToView(x) {
    const r = this.room;
    return r.x + (x - (this.reference.x || 0)) * r.viewToSpaceRatio * r.zoomRatio;
  }

  // same with y
  yToView(y) {
    const r = this.room;
    return r.y + (y - (this.reference.y || 0)) * r.viewToSpaceRatio * r.zoomRatio;
  }

  // scale a size from the room to the view
  scaleToRoom(size) {
    const r = this.room;
    return size * r.viewToSpaceRatio * r.zoomRatio;
  }

  incrementTime() {
    this.time += this.timeSpeed;
  }

  getTime() {
    return this.time;
  }

  setTimeSpeed(speed = 1) {
    this.timeSpeed = speed;
  }

  setReference(reference) {
    if (typeof reference === 'string') {
      const referenceByName = reference.trim().toLowerCase();
      if (!this.planetsByName[referenceByName]) {
        throw 'Specified body doesn\'t exist!';
      }
      reference = this.planetsByName[referenceByName];
    }
    
    this.reference = reference;
  }
}

/*
  The class that represents a single planet

  @param settings There are a lot of settings. I won't go over all of them because
                  I'm lazy
*/
class Planet {
  constructor(settings) {

    // do you know orbital mechanics bro?
    this.apoapsis = settings.apoapsis;
    this.periapsis = settings.periapsis;
    this.semiMajorAxis = (settings.periapsis + settings.apoapsis) / 2;
    this.semiMinorAxis = (
      Math.sqrt(
        Math.pow(this.semiMajorAxis, 2) -
        Math.pow(this.semiMajorAxis - settings.periapsis, 2)
      )
    );
    this.eccentricity = (this.semiMajorAxis - settings.periapsis) / this.semiMajorAxis;

    this.orbitalSpd = settings.orbitalSpd;
    this.prevOrbitalSpd = this.orbitalSpd;
    this.isPlanet = true;
    this.orbitalRotation = settings.orbitalRotation || 0;
    this.orbitingBody = settings.orbitingBody;
    this.size = settings.size || 10;
    this.relativeSize = this.size * settings.space.ratio;

    const a = this.semiMajorAxis;
    const b = this.semiMinorAxis;

    this.orbitCircumference = (
      4 * (a + b) * Math.pow(
        Math.PI / 4,
        (4 * a * b / Math.pow(a + b, 2))
      )
    );

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

    this.name = settings.name;
    
    this.x = 0;
    this.y = 0;

    // I just sctratched the surface and am already overwelmed
  }

  meanAnomaly() {
    const time = this.space.getTime();
    return (time * 2 * Math.PI / this.orbitalSpd / 60) % (Math.PI * 2);
  }

  trueAnomaly(meanAnomaly, eccentricity, accuracy = 9) {
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

  radiusVector(trueAnomaly, eccentricity, semiMajorAxis) {
    const a = semiMajorAxis;
    const e = eccentricity;
    const v = trueAnomaly;

    return (
      a * (1 - e ** 2) / (1 + e * Math.cos(v))
    );
  }

  simulate() {
    // do all of this stuff and magic comes out
    const meanAnomaly = this.meanAnomaly();
    const trueAnomaly = this.trueAnomaly(meanAnomaly, this.eccentricity);
    const radiusVector = this.radiusVector(
      trueAnomaly,
      this.eccentricity,
      this.semiMajorAxis,
    );

    this.x = this.orbitingBody.x + radiusVector * Math.cos(trueAnomaly + this.orbitalRotation);
    this.y = this.orbitingBody.y + radiusVector * Math.sin(trueAnomaly + this.orbitalRotation);
  }

  updateElement() {
    const actualSize = this.space.scaleToRoom(this.size);

    this.$element.css({
      width: actualSize,
      height: actualSize,
    });

    const y = Math.round((this.space.yToView(this.y) - actualSize / 2) * 10) / 10;
    const x = Math.round((this.space.xToView(this.x) - actualSize / 2) * 10) / 10;

    this.$element.css({
      top: y,
      left: x,
    });

    this.$indicator.css({
      top: this.space.yToView(this.y) - 5,
      left: this.space.xToView(this.x) - 5,
    });
  }
}

const space = new Space('body');
const $spaceOptions = $('#space-options');
const options = new SpaceOptions($spaceOptions, space);

space.newPlanet({
  orbitalSpd: 3600 * 24 * 365,
  apoapsis: 152100,
  periapsis: 147100,
  orbitalRotation: 0,
  orbitingBody: { x: 740500, y: 740500 },
  background: 'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?cs=srgb&dl=earth-global-globe-87651.jpg&fm=jpg',
  space: space,
  name: 'Earth',
  size: 12,
});

space.newPlanet({
  orbitalSpd: 3600 * 24 * 27,
  apoapsis: 405,
  periapsis: 363,
  orbitalRotation: 0,
  orbitingBody: 'Earth',
  background: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Earth%27s_Moon_from_NOAA.jpg',
  space: space,
  name: 'Moon',
  size: 1.7,
});

space.newPlanet({
  orbitalSpd: 3600 * 1.5,
  apoapsis: 6.4,
  periapsis: 6.45,
  orbitalRotation: 0,
  orbitingBody: 'Earth',
  background: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/STS-133_International_Space_Station_after_undocking_5.jpg',
  space: space,
  name: 'Space_station',
  size: 2,
});

space.newPlanet({
  orbitalSpd: 1.433 * 365 * 24 * 3600,
  apoapsis: 359 * 1000,
  periapsis: 20.9 * 1000,
  orbitalRotation: 3,
  orbitingBody: { x: 740500, y: 740500 },
  background: 'https://www.nasa.gov/images/content/606921main_comet1_xltn.jpg',
  size: 2,
  name: '3200 Phaethon',
  space: space,
});

space.newPlanet({
  orbitalSpd: 10,
  apoapsis: 2,
  periapsis: 1,
  orbitalRotation: 0,
  orbitingBody: { x: 740500, y: 740500 },
  background: 'https://c1.staticflickr.com/5/4100/4923566097_8fb8bcc415_b.jpg',
  size: 1390,
  name: 'Sun',
  space: space,
});

space.newPlanet({
  orbitalSpd: 3600 * 24 * 365 * 11,
  apoapsis: 740500,
  periapsis: 740500,
  orbitalRotation: 2,
  orbitingBody: { x: 740500, y: 740500 },
  background: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Jupiter.jpg/600px-Jupiter.jpg',
  size: 142,
  name: 'Jupiter',
  space: space,
});

space.newPlanet({
  orbitalSpd: 3600 * 24 * 687,
  apoapsis: 249200,
  periapsis: 206600,
  orbitalRotation: 1,
  orbitingBody: { x: 740500, y: 740500 },
  background: 'https://www.nasa.gov/images/content/420295main_marsopposition2003_hubble.jpg',
  size: 6.7,
  name: 'Mars',
  space: space,
});

options.addSlider('time', 10, ($input, space) => {
  const value = $input.val();
  let newValue = 10 ** (value / 10 - 1);
  
  space.setTimeSpeed(newValue);
  
  let units = 's/s';
  
  const minutes = newValue / 60;
  const hours = newValue / 60 / 60;
  const days = newValue / 60 / 60 / 24;
  const months = newValue / 60 / 60 / 24 / 31;
  const years = newValue / 60 / 60 / 24 / 365;
  
  if (minutes > 1) { units = 'min/s'; newValue = minutes; }
  if (hours > 1) { units = 'hr/s'; newValue = hours; }
  if (days > 1) { units = 'day/s'; newValue = days; }
  if (months > 1) { units = 'month/s'; newValue = months; }
  if (years > 1) { units = 'yr/s'; newValue = years; }
        
  if (newValue > 100) {
    newValue = ~~(newValue * 10) / 10;
  } else if (newValue > 1) {
    newValue = ~~(newValue * 100) / 100;
  } else {
    newValue = ~~(newValue * 10000) / 10000;
  }
  
  return {
    value: newValue + units,
  };
});

var planetOptions = space.planets.map(e => ({ value: e.name.trim().toLowerCase(), text: e.name }));
planetOptions.unshift({ text: '', value: '' });

options.addSelectize('reference', '', ($input, space) => {
  const value = $input[0].selectize.getValue();
  
  if (value.trim() === '') {
    space.setReference({});
    
    return { value: 'global' };
  }

  space.setReference(value);
  
  return { value: value, };  
}, planetOptions, {
  allowEmptyOption: true,
});

function draw() {
  global.recalculate();
  space.simulatePlanets();
  space.incrementTime();

  requestAnimationFrame(draw);
}

draw();
