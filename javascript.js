import Global from './essentialClasses/Global.js';
import Space from './essentialClasses/Space.js';
import SpaceOptions from './essentialClasses/SpaceOptions.js';

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

$.fn.selectize(function (settings) {
  Selectize($(this), settings);
});

const global = new Global;
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

var planetOptions = space.planets.map(e => (console.log(e), { value: e.name.trim().toLowerCase(), text: e.name }));
planetOptions.unshift({ text: '', value: '' });

options.addSelectize('reference', '', ($input, space) => {
  const value = $input[0].selectize.getValue();

  if (value.trim() === '') {
    space.setReferencePoint({});

    return { value: 'global' };
  }

  const referencePlanet = space.getPlanetByName(value);

  space.setReferencePoint(referencePlanet);

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
