import { generateRange, shuffleArray } from '../utilities';
import { randomInt } from '../utilities/math';
import statesData from './states.json';
import citiesData from './cities.json';

export function address() {
  return {
    city: cityMocks().cities[0],
    state: stateMocks().states[0],
    postalCode: postalCodeMocks().postalCodes[0],
  };
}

export function cityMocks({ count = 1 } = {}) {
  const shuffledCities = shuffleArray(citiesData);
  const cities = shuffledCities.slice(0, count);
  return { cities };
}

export function stateMocks({ count = 1 } = {}) {
  const shuffledStates = shuffleArray(statesData);
  const states = shuffledStates
    .slice(0, count)
    .map(state => Object.keys(state))
    .flat();
  return { states };
}

export function postalCodeMocks({ count = 1 } = {}) {
  const postalCodes = generateRange(0, count).map(() =>
    generateRange(0, 5)
      .map(() => randomInt(0, 9))
      .join('')
  );
  return { postalCodes };
}
