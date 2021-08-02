import { generateRange, randomMember, shuffleArray } from '../../utilities';
import { randomInt } from '../../utilities/math';
import statesData from '../data/states.json';
import citiesData from '../data/cities.json';

export function address() {
  return {
    city: cityMocks().cities[0],
    state: stateMocks().states[0],
    postalCode: postalCodeMocks().postalCodes[0],
  };
}

export function cityMocks({ count = 1, participantsCount = 32 } = {}) {
  const shuffledCities = shuffleArray(citiesData);
  const candidateCities = shuffledCities.slice(0, count);
  const cities = generateRange(0, participantsCount).map(() =>
    randomMember(candidateCities)
  );
  return { cities };
}

export function stateMocks({ count = 1, participantsCount = 32 } = {}) {
  const shuffledStates = shuffleArray(statesData);
  const candidateStates = shuffledStates
    .slice(0, count)
    .map((state) => Object.keys(state))
    .flat();
  const states = generateRange(0, participantsCount).map(() =>
    randomMember(candidateStates)
  );
  return { states };
}

export function postalCodeMocks({ count = 1, participantsCount = 32 } = {}) {
  const candidatePostalCodes = generateRange(0, count).map(() =>
    generateRange(0, 5)
      .map(() => randomInt(0, 9))
      .join('')
  );
  const postalCodes = generateRange(0, participantsCount).map(() =>
    randomMember(candidatePostalCodes)
  );
  return { postalCodes };
}
